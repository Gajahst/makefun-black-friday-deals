// filters.js: search, category/store/discount/verdict filters and sorting over the deal list.

import { discountPercent, judgeDeal, savedDollars } from './verdict.js';

export const DISCOUNT_STEPS = [0, 20, 30, 40, 50];

export const SORTS = [
  { id: 'best', label: 'Best deal first' },
  { id: 'pct', label: 'Biggest % off' },
  { id: 'saved', label: 'Most $ saved' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'fresh', label: 'Most recently checked' },
];

const VERDICT_RANK = { record: 0, strong: 1, fair: 2, routine: 3 };

export function enrich(deals) {
  return deals.map((d) => {
    const verdict = judgeDeal(d);
    return { ...d, pct: discountPercent(d), saved: savedDollars(d), verdict, haystack: `${d.product} ${d.brand} ${d.store} ${d.category}`.toLowerCase() };
  });
}

export function facetValues(deals, key) {
  return [...new Set(deals.map((d) => d[key]))].sort();
}

export function applyFilters(deals, state) {
  const words = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return deals.filter((d) =>
    (!state.category || d.category === state.category) &&
    (!state.store || d.store === state.store) &&
    d.pct >= state.minOff &&
    (!state.verdict || d.verdict.id === state.verdict) &&
    words.every((w) => d.haystack.includes(w)));
}

export function sortDeals(deals, sortId) {
  const list = [...deals];
  const byScore = (a, b) => VERDICT_RANK[a.verdict.id] - VERDICT_RANK[b.verdict.id] || b.pct - a.pct;
  const comparators = {
    best: byScore,
    pct: (a, b) => b.pct - a.pct,
    saved: (a, b) => b.saved - a.saved,
    low: (a, b) => a.sale - b.sale,
    fresh: (a, b) => b.checked.localeCompare(a.checked),
  };
  return list.sort(comparators[sortId] || byScore);
}

// Same product family at more than one store, for side-by-side links on a card.
export function otherStores(deal, all) {
  if (!deal.match) return [];
  return all.filter((d) => d.match === deal.match && d.id !== deal.id);
}
