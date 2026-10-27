/* Draft orders — pending queue, approve / reject / post, detail with flagged lines. Port of app-v2/draft-orders. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'drafts';
  st.textContent = `
  .dr-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}
  @media(max-width:1180px){.dr-grid{grid-template-columns:1fr}}
  .dr-flag td{background:var(--warning-tint)}
  .dr-num{width:76px;height:28px;text-align:right;padding:0 8px}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.drafts = DM.ui.drafts || { tab: 'pending', q: '' });
  const STATUS = { pending: ['Needs review', 'amber'], approved: ['Approved', 'blue'], posted: ['Posted as order', 'green'], rejected: ['Rejected', 'red'] };
  const pn = (id) => (DM.by(DM.S.parties || [], id) || {}).name || '—';
  const sb = (s) => { const [l, t] = STATUS[s] || [s, '']; return DM.badge(l, t, true); };
  const get = (id) => DM.by(DM.S.drafts || [], id);
  const total = (d) => (d.lines || []).reduce((a, l) => a + (l.state === 'flagged' ? 0 : l.qty * l.price), 0);
  const flagged = (d) => (d.lines || []).filter((l) => l.state === 'flagged').length;
  const LSTATE = { pending: ['To confirm', 'amber'], flagged: ['Flagged', 'red'], confirmed: ['Confirmed', 'green'] };

  function list() {
    const all = DM.S.drafts || []; const q = U.q.toLowerCase();
    const rows = all.filter((d) => (U.tab === 'all' || d.status === U.tab) && (!q || (d.no + pn(d.partyId)).toLowerCase().includes(q)));
    const cnt = (s) => all.filter((d) => d.status === s).length;
    const cols = [
      { label: 'Draft', render: (d) => `<span class="b">${esc(d.no)}</span>` },
      { label: 'Customer', render: (d) => `<div class="row">${DM.avatar(pn(d.partyId), 'sm')}<span class="trunc">${esc(pn(d.partyId))}</span></div>` },
      { label: 'Created', render: (d) => fmt.dt(d.createdAt) },
      { label: 'Created by', render: (d) => (d.by === 'Anuma' ? `<span class="badge violet">${I('sparkle')}Anuma</span>` : esc(d.by || '—')) },
      { label: 'Lines', num: true, render: (d) => `${(d.lines || []).length}${flagged(d) ? ` <span class="badge red">${flagged(d)} flagged</span>` : ''}` },
      { label: 'Total', num: true, render: (d) => fmt.inr(d.total || total(d)) },
      { label: 'Status', render: (d) => sb(d.status) },
      { label: '', render: (d) => d.status === 'pending' ? `<div class="row" style="justify-content:flex-end">${DM.btn('Reject', 'dr-reject', { cls: 'ghost sm', arg: d.id })}${DM.btn('Approve', 'dr-approve', { cls: 'outline sm', arg: d.id })}</div>` : '' },
    ];
    return `<div class="page">
      ${DM.header('Draft orders', 'Orders Anuma assembled from conversations — review, correct and post.', DM.btn('New draft', 'dr-new', { icon: 'plus' }))}
      <div class="grid g4" style="margin-bottom:16px">
        ${DM.stat('Needs review', cnt('pending'), cnt('pending') ? 'oldest first' : 'queue clear', { icon: 'file', tone: cnt('pending') ? '' : 'up' })}
        ${DM.stat('Flagged lines', all.filter((d) => d.status === 'pending').reduce((a, d) => a + flagged(d), 0), 'low confidence or no match', { icon: 'flag', tone: 'down' })}
        ${DM.stat('Approved', cnt('approved'), 'ready to post', { icon: 'check' })}
        ${DM.stat('Posted', cnt('posted'), fmt.inrc(all.filter((d) => d.status === 'posted').reduce((a, d) => a + (d.total || total(d)), 0)), { icon: 'clipboard', tone: 'up' })}
      </div>
      ${DM.tabs([{ key: 'pending', label: 'Needs review', count: cnt('pending') }, { key: 'approved', label: 'Approved', count: cnt('approved') }, { key: 'posted', label: 'Posted', count: cnt('posted') }, { key: 'rejected', label: 'Rejected', count: cnt('rejected') }, { key: 'all', label: 'All', count: all.length }], U.tab, 'dr-tab')}
      <div class="row" style="margin-bottom:12px">${DM.searchBox('dr-q', 'Search drafts…', U.q)}<span class="muted sm right">${rows.length} drafts</span></div>
      ${DM.table(cols, rows, { go: (d) => '/orders/drafts/' + d.id, empty: U.tab === 'pending' ? 'Nothing waiting for review 🎉' : 'No drafts here.' })}</div>`;
  }
  DM.act('dr-tab', (el) => { U.tab = el.dataset.arg; DM.render(); });
  DM.input('dr-q', (v) => { U.q = v; DM.render(); });

  /* ── mutations ── */
  function approve(d) { d.lines.forEach((l) => { if (l.state === 'pending') l.state = 'confirmed'; }); d.status = 'approved'; d.total = total(d); }
  function post(d) {
    const n = Math.max(0, ...(DM.S.orders || []).map((o) => parseInt(String(o.no).replace(/\D/g, ''), 10) || 0)) + 1;
    const prefix = String((DM.S.orders || [])[0] ? DM.S.orders[0].no : 'ORD-').replace(/\d+$/, '');
    const lines = d.lines.filter((l) => l.state !== 'flagged').map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price }));
    const sys = DM.erpSystem ? DM.erpSystem() : 'Tally';
    const o = { id: 'ORD-' + n, no: prefix + n, partyId: d.partyId, status: 'confirmed', total: lines.reduce((a, l) => a + l.qty * l.price, 0), placedAt: new Date().toISOString(), channel: d.threadId ? 'whatsapp' : 'web', payment: 'Credit', lines, erp: { system: sys, state: 'pending', at: new Date().toISOString() }, threadId: d.threadId };
    (DM.S.orders = DM.S.orders || []).unshift(o); d.status = 'posted'; d.orderId = o.id; d.total = o.total; return o;
  }
  DM.act('dr-approve', (el, e) => { const d = get(el.dataset.arg); if (flagged(d)) { DM.toast('Resolve flagged lines first', 'alert'); return DM.go('/orders/drafts/' + d.id); } approve(d); DM.toast(`${d.no} approved`); DM.render(); });
  DM.act('dr-post', (el) => { const d = get(el.dataset.arg); if (flagged(d)) return DM.toast('Resolve flagged lines first', 'alert'); if (d.status === 'pending') approve(d); const o = post(d); DM.toast(`Posted as ${o.no}`); DM.go('/orders/' + o.id); });
  DM.act('dr-reject', (el) => {
    const d = get(el.dataset.arg);
    DM.modal({ title: 'Reject draft', body: `<p class="muted sm" style="margin-bottom:10px">${esc(d.no)} for ${esc(pn(d.partyId))}</p>${DM.field('Reason', 'reason', { area: true, ph: 'Why is this being rejected?' })}`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Reject draft', cls: 'danger', run: (m) => { d.status = 'rejected'; d.note = (d.note ? d.note + ' · ' : '') + 'Rejected: ' + (DM.formData(m).reason || 'no reason'); DM.toast(d.no + ' rejected'); DM.render(); } }] });
  });
  DM.act('dr-reopen', (el) => { const d = get(el.dataset.arg); d.status = 'pending'; DM.toast('Moved back to review'); DM.render(); });
  DM.act('dr-line-ok', (el) => { const [id, i] = el.dataset.arg.split('|'); const l = get(id).lines[+i]; l.state = 'confirmed'; DM.toast('Line confirmed'); DM.render(); });
  DM.act('dr-line-del', (el) => { const [id, i] = el.dataset.arg.split('|'); const d = get(id); d.lines.splice(+i, 1); d.total = total(d); DM.toast('Line removed'); DM.render(); });
  DM.act('dr-line-match', (el) => {
    const [id, i] = el.dataset.arg.split('|'); const d = get(id); const l = d.lines[+i]; let query = '';
    const body = () => (DM.S.products || []).filter((p) => !query || (p.name + p.sku).toLowerCase().includes(query)).slice(0, 12).map((p) => `<div class="listrow" data-pick="${p.id}" style="border:1px solid var(--border);border-radius:9px;margin-bottom:6px;align-items:center"><div class="grow"><div class="b sm">${esc(p.name)}</div><div class="xs muted">${esc(p.sku)} · stock ${p.stock}</div></div><span class="mono sm">${fmt.inr(p.price)}</span></div>`).join('') || '<div class="empty">No products found</div>';
    DM.modal({ title: 'Match to a product', body: `<div class="search" style="margin-bottom:10px">${I('search')}<input class="input" style="width:100%" id="dr-pq" placeholder="Search catalogue…"></div><div id="dr-pl">${body()}</div>`, onMount: (m) => {
      const pl = m.querySelector('#dr-pl'); m.querySelector('#dr-pq').addEventListener('input', (e) => { query = e.target.value.toLowerCase(); pl.innerHTML = body(); });
      pl.addEventListener('click', (e) => { const r = e.target.closest('[data-pick]'); if (!r) return; const p = DM.by(DM.S.products, r.dataset.pick); Object.assign(l, { productId: p.id, name: p.name, unit: p.unit, price: p.price, state: 'confirmed' }); d.total = total(d); DM.closeModal(); DM.toast('Matched to ' + p.name); DM.render(); });
    } });
  });
  DM.input('dr-qty', (v, el) => { const [id, i] = el.dataset.arg.split('|'); const d = get(id); d.lines[+i].qty = Math.max(0, +v); d.total = total(d); DM.render(); });
  DM.act('dr-new', () => DM.modal({
    title: 'New draft order', body: `<div class="col">${DM.field('Customer', 'party', { options: (DM.S.parties || []).map((p) => p.name) })}${DM.field('Product', 'product', { options: (DM.S.products || []).map((p) => p.name) })}${DM.field('Quantity', 'qty', { type: 'number', value: 10 })}</div>`,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create draft', run: (m) => {
      const f = DM.formData(m); const p = DM.S.parties.find((x) => x.name === f.party); const pr = DM.S.products.find((x) => x.name === f.product);
      const n = Math.max(0, ...(DM.S.drafts || []).map((d) => parseInt(String(d.no).replace(/\D/g, ''), 10) || 0)) + 1;
      const d = { id: 'DR-' + n, no: String((DM.S.drafts || [])[0] ? DM.S.drafts[0].no : 'DRF-0').replace(/\d+$/, '') + n, partyId: p.id, status: 'pending', total: pr.price * (+f.qty || 1), createdAt: new Date().toISOString(), by: 'You', note: '', lines: [{ productId: pr.id, name: pr.name, qty: +f.qty || 1, unit: pr.unit, price: pr.price, state: 'pending' }] };
      (DM.S.drafts = DM.S.drafts || []).unshift(d); DM.toast('Draft created'); DM.go('/orders/drafts/' + d.id);
    } }],
  }));

  function detail({ params }) {
    const d = get(params.id);
    if (!d) return `<div class="page"><div class="empty"><h3>Draft not found</h3><p style="margin-top:12px"><a class="btn outline" href="#/orders/drafts">Back to drafts</a></p></div></div>`;
    const p = DM.by(DM.S.parties || [], d.partyId) || {}; const f = flagged(d); const open = d.status === 'pending';
    const o = d.orderId && DM.by(DM.S.orders || [], d.orderId);
    const th = d.threadId && DM.by(DM.S.threads || [], d.threadId);
    const acts = `${th ? DM.btn('Open chat', '', { cls: 'outline', go: '/inbox/threads?case=' + th.id, icon: 'chat' }) : ''}
      ${open ? `${DM.btn('Reject', 'dr-reject', { cls: 'outline', arg: d.id })}${DM.btn('Approve', 'dr-approve', { cls: 'outline', arg: d.id, icon: 'check' })}${DM.btn('Approve & post', 'dr-post', { arg: d.id, icon: 'send' })}` : ''}
      ${d.status === 'approved' ? DM.btn('Post as order', 'dr-post', { arg: d.id, icon: 'send' }) : ''}
      ${d.status === 'rejected' ? DM.btn('Reopen', 'dr-reopen', { cls: 'outline', arg: d.id }) : ''}
      ${o ? DM.btn('View order', '', { go: '/orders/' + o.id, icon: 'clipboard' }) : ''}`;
    const rows = d.lines.map((l, i) => `<tr class="${l.state === 'flagged' ? 'dr-flag' : ''}"><td class="muted">${i + 1}</td>
      <td>${l.productId ? `<div class="b sm">${esc(l.name)}</div><div class="xs muted">${esc((DM.by(DM.S.products || [], l.productId) || {}).sku || '')}</div>` : `<span class="b sm">${esc(l.name || 'Unmatched item')}</span>`}${l.note ? `<div class="xs" style="color:var(--warning-ink)">${esc(l.note)}</div>` : ''}</td>
      <td class="num"><input class="input dr-num mono" type="number" min="0" value="${l.qty}" data-change="dr-qty" data-arg="${d.id}|${i}" ${open ? '' : 'disabled'}> <span class="xs muted">${esc(l.unit || '')}</span></td>
      <td class="num mono">${fmt.inr(l.price)}</td><td class="num mono">${l.state === 'flagged' ? '—' : fmt.inr(l.qty * l.price)}</td>
      <td>${DM.badge((LSTATE[l.state] || [l.state])[0], (LSTATE[l.state] || [0, ''])[1], true)}</td>
      <td style="white-space:nowrap;text-align:right">${open ? `${l.state === 'flagged' ? DM.btn('Match', 'dr-line-match', { cls: 'outline sm', arg: d.id + '|' + i }) : l.state === 'pending' ? DM.btn('Confirm', 'dr-line-ok', { cls: 'outline sm', arg: d.id + '|' + i }) : ''}${DM.btn('', 'dr-line-del', { cls: 'ghost sm icon', arg: d.id + '|' + i, icon: 'trash' })}` : ''}</td></tr>`).join('');
    return `<div class="page"><div class="row sm muted" style="margin-bottom:8px"><a href="#/orders/drafts" class="row">${I('chevL')} Draft orders</a></div>
      ${DM.header(`${esc(d.no)} ${sb(d.status)}`, `${esc(pn(d.partyId))} · created ${fmt.dt(d.createdAt)} by ${esc(d.by || '—')}`, acts)}
      ${f && open ? `<div class="card pad" style="background:var(--warning-tint);border-color:#f1dca7;margin-bottom:14px"><div class="row">${I('alert')}<span class="sm"><b>${f} line${f > 1 ? 's' : ''} need a decision.</b> Match each to a product or remove it before approving.</span></div></div>` : ''}
      <div class="dr-grid"><div class="card"><div class="card-h"><h3 class="grow">Order lines</h3><span class="muted sm">${d.lines.length} lines</span></div>
        <div style="overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th><th>State</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="row" style="padding:12px 16px;border-top:1px solid var(--border)"><span class="muted sm">Flagged lines are excluded from the total</span><span class="right b mono" style="font-size:15px">Total ${fmt.inr(total(d))}</span></div></div>
      <div class="col" style="gap:16px"><div class="card pad"><h3 style="margin-bottom:10px">Customer</h3><div class="row" style="margin-bottom:10px">${DM.avatar(p.name || '?', 'lg')}<div><a class="b" href="#/crm/accounts/${esc(d.partyId)}">${esc(p.name || '—')}</a><div class="xs muted">${esc(p.city || '')}</div></div></div>
          <dl class="kv" style="grid-template-columns:100px 1fr"><dt>Credit terms</dt><dd>${esc(p.terms || '—')}</dd><dt>Credit limit</dt><dd class="mono">${fmt.inr(p.creditLimit)}</dd><dt>Outstanding</dt><dd class="mono ${p.outstanding > p.creditLimit ? 'down' : ''}">${fmt.inr(p.outstanding)}</dd></dl></div>
        ${d.note ? `<div class="card pad"><h3 style="margin-bottom:6px">Notes</h3><p class="sm">${esc(d.note)}</p></div>` : ''}
        <div class="card pad"><h3 style="margin-bottom:6px">Source</h3><p class="sm muted">${th ? `Assembled from the conversation with ${esc(pn(th.partyId))} on ${esc(th.channel)}.` : 'Created manually.'}</p></div></div></div></div>`;
  }

  DM.page('/orders/drafts', { title: 'Draft orders', render: list });
  DM.page('/orders/drafts/:id', { title: 'Draft order', crumb: (p) => p.id, render: detail });
})();
