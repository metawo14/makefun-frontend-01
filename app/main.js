import { getBounties, getBounty, getLeaderboard, getProfile, getRanking } from './api.js';
import { mountBoard, mountBounty, mountLeaderboard, mountProfile } from './views.js';
import { esc } from './format.js';
const root = document.querySelector('#app');
const status = document.querySelector('#status');
let generation = 0;
async function route(refresh = false) {
  const version = ++generation;
  window.__shotReady = false;
  root.setAttribute('aria-busy', 'true');
  document.querySelector('.nav-board').setAttribute('aria-current', location.hash === '#/' || !location.hash ? 'page' : 'false');
  status.textContent = 'Loading public data…';
  root.innerHTML = '<div class="loading"><span class="eyebrow">MAKE.FUN EXPLORER</span><h1>Finding your next build…</h1><p>Loading public data</p></div>';
  try {
    const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean).map(decodeURIComponent);
    let mount;
    let data;
    if (!parts.length) { mount = mountBoard; data = [await getBounties(refresh)]; }
    else if (parts[0] === 'bounty' && parts[1]) {
      if (parts[2] === 'leaderboard') {
        mount = mountLeaderboard;
        data = await Promise.all([getBounty(parts[1], refresh), getLeaderboard(parts[1], refresh)]);
      } else { mount = mountBounty; data = [await getBounty(parts[1], refresh)]; }
    } else if (parts[0] === 'profile' && parts[1]) {
      mount = mountProfile;
      data = [...await Promise.all([getProfile(parts[1], refresh), getRanking(parts[1], refresh).catch(() => null)]), parts[1]];
    } else throw new Error('This page was not found. Return to the bounty board to explore.');
    if (version !== generation) return;
    mount(root, ...data);
    root.removeAttribute('aria-busy');
    status.textContent = 'Page loaded.';
    window.__shotReady = true;
  } catch (error) {
    if (version !== generation) return;
    root.innerHTML = `<section class="empty"><span class="eyebrow">CONNECTION INTERRUPTED</span><h1>Let’s try that again.</h1><p>${esc(error.message)}</p><button id="retry">Retry public API</button> <a href="#/">Back to bounties</a></section>`;
    root.removeAttribute('aria-busy');
    root.querySelector('#retry').addEventListener('click', () => route(true));
    status.textContent = 'Could not load this page.';
  }
  document.querySelector('#content').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => route());
route();
