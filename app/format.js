export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
export const money = (value) => value == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2 }).format(Number(value));
export const date = (value) => !value || !Number.isFinite(Date.parse(value)) ? 'Not announced' : new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
export function timeLeft(value) {
  const delta = Date.parse(value) - Date.now();
  if (!Number.isFinite(delta)) return 'No deadline';
  if (delta <= 0) return 'Entries closed';
  const hours = Math.floor(delta / 3600000);
  return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h left` : `${hours}h ${Math.floor(delta / 60000) % 60}m left`;
}
export const takesEntries = (b) => Date.parse(b.deadline) > Date.now() && !['resolved', 'cancelled', 'closed'].includes(b.status);
export const pot = (b) => money(b.potUsd ?? b.rewardAmount);
export const bountyURL = (slug) => '#/bounty/' + encodeURIComponent(slug);
export const profileURL = (handle) => '#/profile/' + encodeURIComponent(handle);
export const handleLink = (handle) => handle ? `<a href="${profileURL(handle)}">@${esc(handle)}</a>` : 'Anonymous';
export const list = (value) => Array.isArray(value) ? value : [];
export function prose(value) {
  if (!value) return '<p class="muted">No additional details published.</p>';
  return String(value).split(/\n\s*\n/).map(part => /^#{1,4} /.test(part) ? `<h3>${esc(part.replace(/^#+ /, ''))}</h3>` : `<p>${esc(part)}</p>`).join('');
}

export function scalar(value) {
  if (value == null) return '—';
  return typeof value === 'object' ? Object.entries(value).map(([key, item]) => `${key}: ${item}`).join(' · ') : String(value);
}
