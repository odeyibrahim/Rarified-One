import { createClient } from '@supabase/supabase-js';
export const db = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export const headers = (extra = {}) => ({
  'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Content-Type': 'application/json', ...extra });
export const reply = (code, obj, extra) => ({ statusCode: code, headers: headers(extra), body: code === 204 ? '' : JSON.stringify(obj) });
export const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
export const clientIp = (e) => ((e.headers['x-nf-client-connection-ip'] || e.headers['x-forwarded-for'] || 'unknown') + '').split(',')[0].trim();
export const PROJECTS = ['riviera', 'mekunwen', 'beaufort', 'knox', 'baines', 'primewater', 'mojisola'];
const s = (v, n) => String(v ?? '').trim().slice(0, n);
export const cleanContent = (c = {}) => ({
  banner: { on: !!c.banner?.on, text: s(c.banner?.text, 200) },
  hero: { title: s(c.hero?.title, 120), sub: s(c.hero?.sub, 600) },
  contact: { phone: s(c.contact?.phone, 40), email: s(c.contact?.email, 120), addr: s(c.contact?.addr, 220) },
  hidden: Object.fromEntries(PROJECTS.filter((p) => c.hidden?.[p]).map((p) => [p, true]))
});
export { s as clip };
