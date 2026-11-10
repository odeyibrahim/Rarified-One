import { db, reply, clientIp, clip } from './_lib/db.js';
import { sendNotice } from './_lib/notify.js';
export const handler = async (e) => {
  if (e.httpMethod === 'OPTIONS') return reply(204, '');
  if (e.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });
  try {
    const b = JSON.parse(e.body || '{}');
    const row = { name: clip(b.name, 120), email: clip(b.email, 160), phone: clip(b.phone, 40), interest: clip(b.interest, 120) || 'General Enquiry', message: clip(b.message, 4000), ip: clientIp(e) };
    if (!row.name || !row.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return reply(400, { error: 'Please complete name, a valid email and your message.' });
    const supabase = db();
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('ip', row.ip).gt('created_at', since);
    if ((count || 0) >= 5) return reply(429, { error: 'Too many requests. Please try again shortly.' });
    const { error } = await supabase.from('enquiries').insert(row); if (error) throw error;
    await sendNotice(row);
    return reply(200, { success: true });
  } catch (err) { console.error(err); return reply(500, { error: 'Could not send your request. Please call us.' }); }
};
