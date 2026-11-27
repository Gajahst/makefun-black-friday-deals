// render.js: turns deals into cards, the detail page and the filter controls.

import { verdictLabel } from './verdict.js';
import { otherStores } from './filters.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCheck(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
  return `${day}, ${time} UTC`;
}

function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const kid of kids) if (kid) node.append(kid);
  return node;
}

function storeLink(deal, label, cls) {
  return el('a', { class: cls, href: deal.url, target: '_blank', rel: 'noopener nofollow', text: label });
}

function checkLine(deal) {
  const how = deal.method === 'store' ? 'Read on store page' : 'Read in roundup';
  return el('p', { class: 'check' },
    el('span', { text: `Checked ${formatCheck(deal.checked)}` }),
    el('span', {}, `${how}: `, el('a', { href: deal.sourceUrl, target: '_blank', rel: 'noopener nofollow', text: deal.sourceName })));
}

function verdictLine(deal) {
  return el('p', { class: 'verdict' },
    el('span', { class: `badge v-${deal.verdict.id}`, text: verdictLabel(deal.verdict.id) }),
    el('span', { class: 'why', text: deal.verdict.reason }));
}

function priceLine(deal) {
  return el('p', { class: 'prices' },
    el('span', { class: 'sale', text: money.format(deal.sale) }),
    el('span', { class: 'was', text: money.format(deal.was) }),
    el('span', { class: 'pct', text: `-${deal.pct}%` }));
}

function alsoLine(deal, all) {
  const others = otherStores(deal, all);
  if (!others.length) return null;
  const p = el('p', { class: 'also' }, 'Also: ');
  others.forEach((o, i) => {
    if (i) p.append(' · ');
    p.append(el('a', { href: `#/deal/${o.id}`, text: `${money.format(o.sale)} at ${o.store}` }));
  });
  return p;
}

export function dealCard(deal, all) {
  return el('li', { class: 'deal' },
    el('div', { class: 'deal-top' }, el('span', { class: 'store', text: deal.store }), el('span', { text: deal.category })),
    el('h3', {}, el('a', { href: `#/deal/${deal.id}`, text: deal.product })),
    priceLine(deal),
    verdictLine(deal),
    deal.terms ? el('p', { class: 'also', text: deal.terms }) : null,
    alsoLine(deal, all),
    storeLink(deal, `Open at ${deal.store}`, 'go'),
    checkLine(deal));
}

export function renderGrid(grid, deals, all) {
  grid.replaceChildren(...deals.map((d) => dealCard(d, all)));
  if (!deals.length) grid.append(el('li', { class: 'empty', text: 'No deals match. Clear a filter or try another word.' }));
}

export function renderDetail(box, deal, all) {
  const facts = el('dl', { class: 'facts' });
  const rows = [
    ['Store', deal.store], ['Brand', deal.brand], ['Category', deal.category],
    ['Sale price', money.format(deal.sale)], [deal.wasKind === 'list' ? 'List / comp. value' : 'Regular price', money.format(deal.was)],
    ['You save', `${money.format(deal.saved)} (${deal.pct}%)`], ['Price checked', formatCheck(deal.checked)],
  ];
  for (const [k, v] of rows) facts.append(el('dt', { text: k }), el('dd', { text: v }));
  box.replaceChildren(
    el('a', { class: 'back', href: '#/', text: '← All deals' }),
    el('article', { class: 'deal' },
      el('div', { class: 'deal-top' }, el('span', { class: 'store', text: deal.store }), el('span', { text: deal.category })),
      el('h2', { text: deal.product }),
      priceLine(deal), verdictLine(deal), facts,
      deal.terms ? el('p', { class: 'also', text: deal.terms }) : null,
      alsoLine(deal, all),
      storeLink(deal, `Buy at ${deal.store}`, 'go'),
      checkLine(deal)));
}

export function fillSelect(select, options, value) {
  select.replaceChildren(...options.map(([v, label]) => {
    const o = el('option', { value: String(v), text: label });
    if (String(v) === String(value)) o.selected = true;
    return o;
  }));
}

export function renderChips(box, verdicts, active, counts) {
  const all = [['', 'All verdicts'], ...verdicts.map((v) => [v.id, `${v.label} (${counts[v.id] || 0})`])];
  box.replaceChildren(...all.map(([id, label]) =>
    el('button', { class: 'chip', type: 'button', 'data-verdict': id, 'aria-pressed': String(id === active), text: label })));
}
