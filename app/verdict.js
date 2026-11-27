// verdict.js: decides how much of a real deal each price is, and says on what evidence.

export const VERDICTS = [
  { id: 'record', label: 'Record low' },
  { id: 'strong', label: 'Strong' },
  { id: 'fair', label: 'Fair' },
  { id: 'routine', label: 'Routine' },
];

export function discountPercent(deal) {
  return Math.round((1 - deal.sale / deal.was) * 100);
}

export function savedDollars(deal) {
  return Math.round((deal.was - deal.sale) * 100) / 100;
}

// The source's own history claim wins; otherwise depth below the listed regular price decides.
export function judgeDeal(deal) {
  const pct = discountPercent(deal);
  const historyBy = deal.historyBy || deal.sourceName.split(' ')[0];
  if (deal.history === 'atl') {
    return { id: 'record', reason: `${historyBy} calls this the lowest price it has tracked.` };
  }
  const listNote = deal.wasKind === 'list' ? ' The "was" figure is a list or comparable value, so the real saving may be smaller.' : '';
  const lowerNote = deal.history === 'lower' ? ` ${historyBy} notes it dropped again this week.` : '';
  if (pct >= 35) return { id: 'strong', reason: `${pct}% under the regular price.${lowerNote}${listNote}` };
  if (pct >= 20) return { id: 'fair', reason: `${pct}% under the regular price.${lowerNote}${listNote}` };
  return { id: 'routine', reason: `Only ${pct}% off, a typical sale size.${lowerNote}${listNote}` };
}

export function verdictLabel(id) {
  const found = VERDICTS.find((v) => v.id === id);
  return found ? found.label : id;
}
