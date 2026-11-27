// main.js: reads the URL hash into filter state, wires the controls and routes between list and detail.

import { DEALS, CHECK_WINDOW } from './deals.js';
import { VERDICTS } from './verdict.js';
import { DISCOUNT_STEPS, SORTS, applyFilters, enrich, facetValues, sortDeals } from './filters.js';
import { fillSelect, formatCheck, renderChips, renderDetail, renderGrid } from './render.js';

const all = enrich(DEALS);
const $ = (id) => document.getElementById(id);
const ui = { q: $('q'), cat: $('cat'), store: $('store'), off: $('off'), sort: $('sort'), chips: $('verdicts'), grid: $('grid'), detail: $('detail'), summary: $('summary'), controls: document.querySelector('.controls') };

function readState() {
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?');
  const p = new URLSearchParams(query);
  return {
    path: path || '/',
    q: p.get('q') || '',
    category: p.get('cat') || '',
    store: p.get('store') || '',
    minOff: Number(p.get('off') || 0),
    verdict: p.get('v') || '',
    sort: p.get('sort') || 'best',
  };
}

function writeState(state) {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.category) p.set('cat', state.category);
  if (state.store) p.set('store', state.store);
  if (state.minOff) p.set('off', String(state.minOff));
  if (state.verdict) p.set('v', state.verdict);
  if (state.sort !== 'best') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', `#/${qs ? `?${qs}` : ''}`);
  render();
}

function stateFromControls(prev) {
  return { ...prev, path: '/', q: ui.q.value, category: ui.cat.value, store: ui.store.value, minOff: Number(ui.off.value), sort: ui.sort.value };
}

function setupControls(state) {
  ui.q.value = state.q;
  fillSelect(ui.cat, [['', 'All categories'], ...facetValues(all, 'category').map((c) => [c, c])], state.category);
  fillSelect(ui.store, [['', 'All stores'], ...facetValues(all, 'store').map((s) => [s, s])], state.store);
  fillSelect(ui.off, DISCOUNT_STEPS.map((n) => [n, n ? `${n}%+ off` : 'Any discount']), state.minOff);
  fillSelect(ui.sort, SORTS.map((s) => [s.id, s.label]), state.sort);
}

function render() {
  const state = readState();
  const match = state.path.match(/^\/deal\/(.+)$/);
  const picked = match && all.find((d) => d.id === match[1]);
  ui.detail.hidden = !picked;
  ui.grid.hidden = Boolean(picked);
  ui.summary.hidden = Boolean(picked);
  ui.controls.hidden = Boolean(picked);
  if (picked) { renderDetail(ui.detail, picked, all); window.scrollTo(0, 0); return; }

  setupControls(state);
  const shown = sortDeals(applyFilters(all, state), state.sort);
  const counts = {};
  for (const d of applyFilters(all, { ...state, verdict: '' })) counts[d.verdict.id] = (counts[d.verdict.id] || 0) + 1;
  renderChips(ui.chips, VERDICTS, state.verdict, counts);
  const stores = new Set(shown.map((d) => d.store)).size;
  ui.summary.innerHTML = '';
  ui.summary.append('Showing ', Object.assign(document.createElement('b'), { textContent: `${shown.length} of ${all.length}` }), ` checked deals from ${stores} store${stores === 1 ? '' : 's'}`);
  renderGrid(ui.grid, shown, all);
}

$('stamp').textContent = `Prices checked ${formatCheck(CHECK_WINDOW.from)} to ${formatCheck(CHECK_WINDOW.to)}`;
ui.q.addEventListener('input', () => writeState(stateFromControls(readState())));
for (const s of [ui.cat, ui.store, ui.off, ui.sort]) s.addEventListener('change', () => writeState(stateFromControls(readState())));
ui.chips.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-verdict]');
  if (!btn) return;
  const state = readState();
  writeState({ ...state, verdict: state.verdict === btn.dataset.verdict ? '' : btn.dataset.verdict });
});
window.addEventListener('hashchange', render);
render();
