import { db } from './_lib/db.js';
// Scheduled daily by Netlify. A trivial query keeps the Supabase free-tier project from being paused for inactivity.
export const config = { schedule: '@daily' };
export default async () => {
  try { await db().from('site_content').select('key', { head: true, count: 'exact' }); console.log('keepalive ok'); }
  catch (e) { console.error('keepalive failed', e); }
  return new Response('ok');
};
