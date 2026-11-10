import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, reply, clientIp, cleanContent, clip, isUuid } from './_lib/db.js';

const MAX_FAILS = 5, WINDOW_MIN = 15, SESSION_HOURS = 24;
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');

export const handler = async (e) => {
  if (e.httpMethod === 'OPTIONS') return reply(204, '');
  if (e.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });
  let body; try { body = JSON.parse(e.body || '{}'); } catch { return reply(400, { error: 'Invalid request body' }); }
  const { operation, data = {} } = body;
  try {
    const supabase = db();
    // ---- LOGIN: fails closed if the hash isn't configured; IP lockout after repeated failures ----
    if (operation === 'login') {
      const ip = clientIp(e);
      const since = new Date(Date.now() - WINDOW_MIN * 60000).toISOString();
      const { count } = await supabase.from('login_attempts').select('id', { count: 'exact', head: true }).eq('ip', ip).eq('success', false).gt('created_at', since);
      if ((count || 0) >= MAX_FAILS) return reply(429, { error: `Too many failed attempts. Try again in ${WINDOW_MIN} minutes.` });
      const hash = process.env.ADMIN_PASSWORD_HASH;
      if (!hash) return reply(500, { error: 'Admin login is not configured.' });
      const userOk = (data.username || '').trim().toLowerCase() === (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
      const passOk = typeof data.password === 'string' && data.password.length > 0 && bcrypt.compareSync(data.password, hash);
      const ok = userOk && passOk;
      await supabase.from('login_attempts').insert({ ip, success: ok });
      if (!ok) return reply(401, { error: 'Credentials not recognised.' });
      const token = crypto.randomBytes(32).toString('hex');
      await supabase.from('admin_sessions').delete().lt('expires_at', new Date().toISOString());
      await supabase.from('login_attempts').delete().lt('created_at', new Date(Date.now() - 7 * 86400000).toISOString());
      const { error } = await supabase.from('admin_sessions').insert({ token_hash: sha(token), expires_at: new Date(Date.now() + SESSION_HOURS * 3600000).toISOString() });
      if (error) throw error;
      return reply(200, { success: true, token });
    }

    // ---- Everything else needs a valid, unexpired session (token stored hashed) ----
    const token = e.headers['x-admin-token'] || e.headers['X-Admin-Token'];
    if (!token) return reply(401, { error: 'Authentication required' });
    const { data: session } = await supabase.from('admin_sessions').select('token_hash').eq('token_hash', sha(token)).gt('expires_at', new Date().toISOString()).maybeSingle();
    if (!session) return reply(401, { error: 'Invalid or expired session' });

    const needsId = ['update_enquiry', 'delete_enquiry', 'delete_post'];
    if (needsId.includes(operation) && !isUuid(data.id)) return reply(400, { error: 'Invalid id' });
    if (operation === 'save_post' && data.id && !isUuid(data.id)) return reply(400, { error: 'Invalid id' });

    switch (operation) {
      case 'logout':
        await supabase.from('admin_sessions').delete().eq('token_hash', sha(token));
        return reply(200, { success: true });

      case 'get_enquiries': {
        const { data: rows, error } = await supabase.from('enquiries').select('id,name,email,phone,interest,message,status,created_at').order('created_at', { ascending: false }).limit(500);
        if (error) throw error; return reply(200, rows);
      }
      case 'update_enquiry': {
        if (!['new', 'handled'].includes(data.status)) return reply(400, { error: 'Invalid status' });
        const { error } = await supabase.from('enquiries').update({ status: data.status }).eq('id', data.id);
        if (error) throw error; return reply(200, { success: true });
      }
      case 'delete_enquiry': {
        const { error } = await supabase.from('enquiries').delete().eq('id', data.id);
        if (error) throw error; return reply(200, { success: true });
      }
      case 'update_content': {
        const updated_at = new Date().toISOString();
        const { error } = await supabase.from('site_content').upsert({ key: 'site', value: cleanContent(data.content), updated_at }, { onConflict: 'key' });
        if (error) throw error; return reply(200, { success: true, updated_at });
      }
      // ---- Blog posts (backend ready; admin UI is the next step) ----
      case 'get_posts': {
        const { data: rows, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (error) throw error; return reply(200, rows);
      }
      case 'save_post': {
        if (!clip(data.title, 200)) return reply(400, { error: 'Title is required' });
        const slug = clip(data.slug || data.title, 90).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `article-${Date.now().toString(36)}`;
        const pub = !!data.is_published;
        const row = { slug, title: clip(data.title, 200), excerpt: clip(data.excerpt, 400), body: String(data.body || '').slice(0, 100000),
          cover_url: /^https:\/\//.test(data.cover_url || '') ? clip(data.cover_url, 500) : null, is_published: pub, updated_at: new Date().toISOString() };
        if (pub) row.published_at = (data.published_at && !isNaN(Date.parse(data.published_at))) ? new Date(data.published_at).toISOString() : new Date().toISOString();
        const q = data.id ? supabase.from('posts').update(row).eq('id', data.id) : supabase.from('posts').insert(row);
        const { data: saved, error } = await q.select().single();
        if (error?.code === '23505') return reply(409, { error: 'That URL slug is already used by another article.' });
        if (error) throw error; return reply(200, saved);
      }
      case 'delete_post': {
        const { error } = await supabase.from('posts').delete().eq('id', data.id);
        if (error) throw error; return reply(200, { success: true });
      }
      // ---- Image upload (client sends a resized image as base64; type is verified from the file bytes) ----
      case 'upload_image': {
        const buf = Buffer.from(String(data.data || ''), 'base64');
        if (buf.length < 100 || buf.length > 3 * 1024 * 1024) return reply(400, { error: 'Image must be under 3 MB.' });
        const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        const isPng = buf.subarray(0, 4).toString('hex') === '89504e47';
        const isWebp = buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
        if (!isJpg && !isPng && !isWebp) return reply(400, { error: 'Only JPEG, PNG or WebP images are allowed.' });
        const ext = isJpg ? 'jpg' : isPng ? 'png' : 'webp';
        const path = `posts/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const { error } = await supabase.storage.from('media').upload(path, buf, { contentType: `image/${isJpg ? 'jpeg' : ext}`, cacheControl: '31536000' });
        if (error) throw error;
        return reply(200, { url: supabase.storage.from('media').getPublicUrl(path).data.publicUrl });
      }
      default: return reply(400, { error: 'Invalid operation' });
    }
  } catch (err) { console.error('admin-operations error:', err); return reply(500, { error: 'Operation failed' }); }
};
