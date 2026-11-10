import { db, reply } from './_lib/db.js';
// Public. ?slug=x returns one published post; otherwise a list (no body).
export const handler = async (e) => {
  if (e.httpMethod === 'OPTIONS') return reply(204, '');
  try {
    const slug = e.queryStringParameters?.slug;
    let q = db().from('posts').select(slug ? 'slug,title,excerpt,body,cover_url,published_at' : 'slug,title,excerpt,cover_url,published_at').eq('is_published', true);
    q = slug ? q.eq('slug', slug).limit(1) : q.order('published_at', { ascending: false }).limit(50);
    const { data, error } = await q; if (error) throw error;
    return reply(200, slug ? (data[0] || null) : data);
  } catch (err) { console.error(err); return reply(500, { error: 'Failed to load posts' }); }
};
