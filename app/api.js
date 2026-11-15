const origin = 'https://make.fun/api';
const cache = new Map();
const pending = new Map();
export async function get(path, refresh = false) {
  const saved = cache.get(path);
  if (!refresh && saved && Date.now() - saved.time < 30000) return saved.data;
  if (pending.has(path)) return pending.get(path);
  const task = (async () => {
    const response = await fetch(origin + path, {
      headers: saved?.etag ? { 'If-None-Match': saved.etag } : {},
      credentials: 'omit', signal: AbortSignal.timeout(15000),
    });
    if (response.status === 304 && saved) { saved.time = Date.now(); return saved.data; }
    if (!response.ok) throw new Error(response.status === 404 ? 'This page was not found.' : `The public API returned ${response.status}. Please try again.`);
    const data = await response.json();
    if (cache.size >= 80 && !cache.has(path)) cache.delete(cache.keys().next().value);
    cache.set(path, { data, etag: response.headers.get('etag'), time: Date.now() });
    return data;
  })();
  pending.set(path, task);
  try { return await task; } finally { pending.delete(path); }
}
export const getBounties = (refresh) => get('/competitions?status=open&activity=times', refresh);
export const getBounty = (slug, refresh) => get('/competitions/' + encodeURIComponent(slug), refresh);
export const getLeaderboard = (slug, refresh, phase = '', view = 'performance') => {
  const query = new URLSearchParams({ view });
  if (phase) query.set('phase', phase);
  return get('/competitions/' + encodeURIComponent(slug) + '/leaderboard?' + query, refresh);
};
export const getProfile = (handle, refresh) => get('/profiles/' + encodeURIComponent(handle), refresh);
export const getRanking = (handle, refresh) => get('/rankings/' + encodeURIComponent(handle), refresh);
