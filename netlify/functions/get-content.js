import { db, reply } from './_lib/db.js';
// Public, read-only. Returns only the whitelisted site content.
export const handler = async (e) => {
  if (e.httpMethod === 'OPTIONS') return reply(204, '');
  try {
    const { data } = await db().from('site_content').select('value, updated_at').eq('key', 'site').maybeSingle();
    return reply(200, { content: data?.value || null, updated_at: data?.updated_at || null }, { 'Cache-Control': 'public, max-age=30' });
  } catch (err) { console.error(err); return reply(200, { content: null }); }
};
