import { getLeaderboard } from './api.js';
import { esc, money, date, timeLeft, takesEntries, pot, bountyURL, handleLink, list, prose, scalar } from './format.js';
const stat = (label, value) => `<div class="stat"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
const crumbs = (b, suffix = '') => `<div class="breadcrumbs"><a href="#/">Bounties</a> / ${suffix ? `<a href="${bountyURL(b.slug)}">${esc(b.title)}</a> / ${suffix}` : esc(b.title)}</div>`;
const badge = (b) => `<span class="badge ${takesEntries(b) ? '' : 'closed'}">${takesEntries(b) ? 'TAKING ENTRIES' : 'ENTRIES CLOSED'}</span>`;
function paginate(host, items, row, size = 8, table = false) {
  let page = 0;
  const render = () => {
    const total = Math.max(1, Math.ceil(items.length / size));
    host.innerHTML = items.length ? `${table ? '<div class="table-wrap"><table><thead><tr><th>Place</th><th>Builder / entry</th><th>Score</th><th>Reward</th></tr></thead><tbody>' : '<div class="cards">'}${items.slice(page * size, (page + 1) * size).map(row).join('')}${table ? '</tbody></table></div>' : '</div>'}<div class="pager"><button data-prev ${page === 0 ? 'disabled' : ''}>← Previous</button><span>Page ${page + 1} of ${total} · ${items.length} results</span><button data-next ${page + 1 === total ? 'disabled' : ''}>Next →</button></div>` : '<div class="empty"><h2>No matches yet</h2><p>Try a different search or filter.</p></div>';
    host.querySelector('[data-prev]')?.addEventListener('click', () => { page--; render(); host.querySelector('[data-prev]').focus(); });
    host.querySelector('[data-next]')?.addEventListener('click', () => { page++; render(); host.querySelector('[data-next]').focus(); });
  };
  render();
}
export function mountBoard(root, data) {
  document.title = 'Bounties · make.fun';
  const items = list(data.items);
  const accepting = items.filter(takesEntries);
  root.innerHTML = `<section class="hero"><div><span class="eyebrow">GOOD IDEAS DESERVE A REWARD</span><h1>Find your next build.</h1><p>Open challenges for curious minds. Make something great,<br>put it to the test, and earn your place.</p></div><div class="hero-art" aria-hidden="true">↗</div></section><div class="stats">${stat('Live prize pools', money(items.reduce((sum, b) => sum + Number(b.potUsd ?? b.rewardAmount ?? 0), 0)))}${stat('Taking entries', accepting.length)}${stat('Submissions', items.reduce((sum, b) => sum + Number(b.submissionCount ?? 0), 0).toLocaleString())}</div><section aria-label="Browse bounties"><div class="toolbar"><label class="search">Search bounties<input id="search" type="search" placeholder="What do you want to build?"></label><label>Availability<select id="availability"><option value="all">All open bounties</option><option value="accepting">Taking entries</option><option value="closed">Deadline passed</option><option value="free">Free entry</option></select></label><label>Sort by<select id="sort"><option value="reward">Highest live pot</option><option value="deadline">Closing soon</option><option value="entries">Most entries</option><option value="title">Title A–Z</option></select></label></div><p class="count" id="results-count" aria-live="polite"></p><div id="results"></div></section>`;
  const update = () => {
    const search = root.querySelector('#search').value.trim().toLowerCase();
    const filter = root.querySelector('#availability').value;
    const sort = root.querySelector('#sort').value;
    const filtered = items.filter(b => `${b.title} ${b.summary ?? ''}`.toLowerCase().includes(search) && (filter === 'all' || filter === 'accepting' && takesEntries(b) || filter === 'closed' && !takesEntries(b) || filter === 'free' && !Number(b.entryFeeUsd)));
    filtered.sort((a, b) => sort === 'reward' ? Number(b.potUsd ?? b.rewardAmount) - Number(a.potUsd ?? a.rewardAmount) : sort === 'entries' ? b.submissionCount - a.submissionCount : sort === 'title' ? a.title.localeCompare(b.title) : (Date.parse(a.deadline) > Date.now() ? Date.parse(a.deadline) : Infinity) - (Date.parse(b.deadline) > Date.now() ? Date.parse(b.deadline) : Infinity));
    root.querySelector('#results-count').textContent = `${filtered.length} bounties · Public data from make.fun`;
    paginate(root.querySelector('#results'), filtered, b => `<article class="card"><div class="card-top">${badge(b)}<span class="muted">↗</span></div><h2><a href="${bountyURL(b.slug)}">${esc(b.title)}</a></h2><p>${esc(b.summary || 'Build, compete, and get ranked in the open.')}</p><div class="pot">${pot(b)}<small>live pot · ${money(b.rewardAmount)} base</small></div><div class="card-meta"><span>${Number(b.entryFeeUsd) ? money(b.entryFeeUsd) + ' entry' : 'Free entry'}</span><span>${esc(timeLeft(b.deadline))}</span><span>${esc(b.submissionCount ?? 0)} entries</span></div></article>`, 6);
  };
  root.querySelector('#search').addEventListener('input', update);
  root.querySelector('#availability').addEventListener('change', update);
  root.querySelector('#sort').addEventListener('change', update);
  update();
}
export function mountBounty(root, b) {
  document.title = `${b.title} · make.fun`;
  const rewards = list(b.prizes ?? b.rewards);
  root.innerHTML = `${crumbs(b)}<section class="hero"><div>${badge(b)}<h1>${esc(b.title)}</h1><p>${esc(b.summary)}</p></div></section><div class="detail-grid"><section><div class="panel"><span class="eyebrow">THE CHALLENGE</span><h2>Make your mark.</h2><div class="prose">${prose(b.description)}</div></div><div class="panel"><h2>Rules & judging</h2><div class="prose">${prose(typeof b.rules === 'string' ? b.rules : b.rules?.text ?? b.rulesMarkdown ?? b.rules_markdown ?? (Array.isArray(b.rules) ? b.rules.join('\n\n') : null))}</div></div><div class="panel"><h2>Builders</h2><p>${list(b.entries ?? b.submissions).slice(0, 12).map(e => handleLink(e.handle ?? e.user?.handle ?? e.owner?.handle)).join(' · ') || 'Builder profiles are linked from published leaderboard entries.'}</p></div><div class="panel"><h2>Rewards</h2>${rewards.length ? `<div class="table-wrap"><table><thead><tr><th>Place</th><th>Reward</th></tr></thead><tbody>${rewards.map(r => `<tr><td>${esc(r.title ?? r.place ?? r.name)}</td><td>${money(r.amount_usd ?? r.amountUsd ?? r.amount ?? r.rewardAmount)}</td></tr>`).join('')}</tbody></table></div>` : `<p>${money(b.rewardAmount)} base reward. See the published rules for the payout distribution.</p>`}<p class="muted">Live pot: ${pot(b)}. Entry fees may increase the final payouts.</p></div></section><aside><div class="panel reward"><span class="eyebrow">LIVE PRIZE POOL</span><div class="pot">${pot(b)}</div><p class="muted">${money(b.rewardAmount)} base reward</p><dl><dt>Entry fee</dt><dd>${Number(b.entryFeeUsd) ? money(b.entryFeeUsd) : 'Free'}</dd><dt>Time remaining</dt><dd>${esc(timeLeft(b.deadline))}</dd><dt>Submissions</dt><dd>${esc(b.submissionCount ?? 0)}</dd></dl><a class="button primary" href="${bountyURL(b.slug)}/leaderboard">View leaderboard ↗</a></div><div class="panel"><h3>Competition details</h3><dl><dt>Deadline</dt><dd>${date(b.deadline)}</dd><dt>Opened</dt><dd>${date(b.opensAt ?? b.startsAt ?? b.createdAt)}</dd><dt>Published status</dt><dd>${esc(b.status)}</dd>${b.creator?.handle || b.owner?.handle ? `<dt>Posted by</dt><dd>${handleLink(b.creator?.handle ?? b.owner?.handle)}</dd>` : ''}</dl><p class="muted small">Entry availability follows the deadline. Results may still be pending after entries close.</p><a class="text-link" href="https://make.fun/bounty/${encodeURIComponent(b.slug)}">Official bounty ↗</a></div></aside></div>`;
}
function entryRow(entry) {
  const handle = entry.handle ?? entry.user?.handle ?? entry.owner?.handle ?? entry.username;
  const score = entry.score ?? entry.performance?.score ?? entry.scores?.[0];
  return `<tr><td>${esc(entry.rank ?? entry.place ?? '—')}</td><td>${handleLink(handle)}${entry.title ? `<br><span class="muted">${esc(entry.title)}</span>` : ''}</td><td>${esc(scalar(score))}</td><td>${money(entry.prize_usd ?? entry.prizeUsd ?? entry.reward_usd)}</td></tr>`;
}
export function mountLeaderboard(root, b, data) {
  document.title = `Leaderboard · ${b.title} · make.fun`;
  const phases = Array.isArray(b.phases) && b.phases.length ? b.phases : Array.isArray(data.phases) ? data.phases : data.phases && typeof data.phases === 'object' ? Object.entries(data.phases).map(([key, value]) => ({ key, ...value })) : [{ key: 'all', title: 'All phases', ...data }];
  root.innerHTML = `${crumbs(b, 'Leaderboard')}<section class="hero"><div><span class="eyebrow">THE RESULTS BOARD</span><h1>Great builds. Fair competition.</h1><p>${esc(b.title)}</p></div></section><div class="stats">${stat('Live prize pool', pot(b))}${stat('Entries', b.submissionCount ?? '—')}${stat('Entry window', takesEntries(b) ? 'Open' : 'Closed')}</div><div class="toolbar"><label>Competition phase<select id="phase">${phases.map((p, i) => `<option value="${i}">${esc(p.title ?? p.name ?? p.key ?? `Phase ${i + 1}`)}</option>`).join('')}</select></label></div><div class="tabs" role="group" aria-label="Ranking metric">${['overall', 'performance', 'cost', 'efficiency'].map((key, i) => `<button data-metric="${key}" aria-pressed="${key === 'performance'}">${key[0].toUpperCase() + key.slice(1)}</button>`).join('')}</div><div id="standings" aria-live="polite"></div>`;
  let metric = 'performance';
  let request = 0;
  let initial = true;
  const update = async () => {
    const version = ++request;
    const selected = phases[Number(root.querySelector('#phase').value)] ?? {};
    const host = root.querySelector('#standings');
    window.__shotReady = false;
    host.setAttribute('aria-busy', 'true');
    try {
      const response = initial ? data : await getLeaderboard(b.slug, false, selected.key ?? selected.id ?? '', metric);
      initial = false;
      if (request !== version || !host.isConnected) return;
      const phase = response.phase && typeof response.phase === 'object' ? response.phase : response;
      const held = phase.scores_visible === false || phase.placements_held === true || response.scores_visible === false || response.placements_held === true;
      const source = response[metric] ?? response.entries ?? response.items ?? phase.entries;
      const entries = Array.isArray(source) ? source : list(source?.entries ?? source?.items);
      if (held) host.innerHTML = '<section class="empty"><div class="seal" aria-hidden="true">⌑</div><span class="eyebrow">RESULTS ARE UNDER WRAPS</span><h2>Placements held</h2><p>Official scores and placements are held for this phase. Return when make.fun publishes the results.</p><span class="badge closed">PLACEMENTS NOT FINAL</span></section>';
      else if (!entries.length) host.innerHTML = `<section class="empty"><h2>${metric === 'cost' || metric === 'efficiency' ? 'Build metrics are not public' : 'No ranked entries yet'}</h2><p>Results appear here when this view is available to the public.</p></section>`;
      else paginate(host, entries, entryRow, 20, true);
      window.__shotReady = true;
    } catch (error) {
      if (request !== version || !host.isConnected) return;
      host.innerHTML = `<section class="empty"><h2>This ranking is unavailable</h2><p>${esc(error.message)}</p><p>Cost and efficiency may be private. Try Performance or Overall.</p></section>`;
    } finally { if (request === version) host.removeAttribute('aria-busy'); }
  };
  const current = data.phase?.key ?? data.phase;
  const index = phases.findIndex(p => (p.key ?? p.id) === current);
  if (index >= 0) root.querySelector('#phase').value = String(index);
  root.querySelector('#phase').addEventListener('change', update);
  root.querySelectorAll('[data-metric]').forEach(button => button.addEventListener('click', () => { metric = button.dataset.metric; root.querySelectorAll('[data-metric]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); update(); }));
  update();
}
export function mountProfile(root, data, ranking, requestedHandle) {
  const p = data.profile ?? data;
  const handle = p.handle ?? requestedHandle;
  const record = p.record ?? {};
  document.title = `@${handle} · make.fun`;
  const links = p.links ?? p;
  root.innerHTML = `<div class="breadcrumbs"><a href="#/">Bounties</a> / Builder profile</div><section class="hero profile-head"><img class="avatar" crossorigin="anonymous" src="https://make.fun/api/profiles/${encodeURIComponent(handle)}/picture.png" alt="" width="85" height="85"><div><span class="eyebrow">BUILDER PROFILE</span><h1>${esc(p.display_name ?? p.displayName ?? handle)}</h1><p>@${esc(handle)}</p></div></section><div class="prose">${p.bio ? prose(p.bio) : ''}</div><div class="links" id="profile-links"></div><div class="stats">${stat('Competitions entered', record.competitions_entered ?? record.entered ?? 0)}${stat('Wins / placements', `${record.competitions_won ?? record.won ?? 0} / ${record.competitions_placed ?? record.placed ?? 0}`)}${stat('Prize money paid', money(record.prize_usd ?? record.prizeMoney ?? 0))}</div><div class="detail-grid"><section class="panel"><h2>Solutions</h2><p class="muted">Public entries, newest first.</p><div id="solutions"></div></section><aside class="panel"><span class="eyebrow">AROUND THIS BUILDER</span><h2>Global rank ${esc(ranking?.rank ?? ranking?.account?.rank ?? '—')}</h2><p class="muted">Ranked by wins and paid rewards.</p><div id="neighbours"></div>${ranking ? '' : '<p>Rankings are temporarily unavailable.</p>'}</aside></div>`;
  const addLink = (label, value) => {
    if (!value) return;
    try { const url = new URL(value); if (!['https:', 'http:'].includes(url.protocol)) return; const a = document.createElement('a'); a.href = url.href; a.textContent = label + ' ↗'; a.rel = 'noopener noreferrer'; root.querySelector('#profile-links').append(a); } catch {}
  };
  if (links.github_login) addLink('GitHub', 'https://github.com/' + encodeURIComponent(links.github_login));
  addLink('Discord', links.discord?.url);
  addLink('Wallet', links.wallet?.explorer_url);
  const solutions = list(p.solutions ?? data.solutions);
  paginate(root.querySelector('#solutions'), solutions, s => `<article class="card"><span class="badge">${s.place ? 'PLACE ' + esc(s.place) : 'ENTRY'}</span><h2><a href="${bountyURL(s.competition?.slug ?? s.slug)}/leaderboard">${esc(s.competition?.title ?? s.title ?? s.competition?.slug)}</a></h2><div class="card-meta"><span>Prize ${money(s.prize_usd)}</span><span>Score ${esc(scalar(s.score))}</span></div></article>`, 6);
  const neighbours = list(ranking?.neighbours ?? ranking?.neighbors ?? ranking?.items);
  root.querySelector('#neighbours').innerHTML = neighbours.length ? neighbours.map(n => `<p><strong>#${esc(n.rank)}</strong> ${handleLink(n.handle)}</p>`).join('') : '<p class="muted">No neighbouring ranks published.</p>';
}
