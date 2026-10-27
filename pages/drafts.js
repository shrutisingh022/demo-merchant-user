/* Draft orders — grid columns/rows for the Orders screen, right drawer (Overview | Lines | Activity | ERP), full detail page. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'drafts';
  st.textContent = `
  .dr-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px;align-items:start}
  @media(max-width:1180px){.dr-grid{grid-template-columns:1fr}}
  .dr-flag td{background:var(--warning-tint)}
  .dr-num{width:58px;height:28px;text-align:right;padding:0 8px}
  .dr-note{background:var(--warning-tint);border:1px solid #f1dca7;border-radius:12px;padding:10px 12px;font-size:12px}
  `;
  document.head.appendChild(st);

  const DW = (DM.ui.draftDrawer = DM.ui.draftDrawer || { id: null, tab: 'overview' });
  const STATUS = { pending: ['Needs review', 'amber'], approved: ['Approved', 'blue'], posted: ['Posted as order', 'green'], rejected: ['Rejected', 'red'] };
  const pn = (id) => (DM.by(DM.S.parties || [], id) || {}).name || '—';
  const sb = (s) => { const [l, t] = STATUS[s] || [s, 'grey']; return DM.status(l, t); };
  const get = (id) => DM.by(DM.S.drafts || [], id);
  const total = (d) => (d.lines || []).reduce((a, l) => a + (l.state === 'flagged' ? 0 : l.qty * l.price), 0);
  const flagged = (d) => (d.lines || []).filter((l) => l.state === 'flagged').length;
  const LSTATE = { pending: ['To confirm', 'amber'], flagged: ['Flagged', 'red'], confirmed: ['Confirmed', 'green'] };
  const caseNo = (t) => (t ? DM.caseNo(t) : '');
  const byName = (d) => (!d.by || d.by === 'Anuma' ? d.by : (DM.by(DM.S.users || [], d.by) || {}).name || d.by);
  // next document number in the same format as the existing ones (keeps prefix + zero padding)
  const nextNo = (list, fallback) => { let best = null, bn = -1; (list || []).forEach((x) => { const m = String(x.no).match(/^(.*?)(\d+)$/); if (m && +m[2] > bn && +m[2] < 1e7) { bn = +m[2]; best = m; } }); return best ? best[1] + String(bn + 1).padStart(best[2].length, '0') : fallback; };
  const log = (d, text) => { (d.activity = d.activity || []).push({ at: new Date().toISOString(), text }); };

  /* ── shared with the Orders screen ── */
  DM.draftViews = [['all', 'All drafts'], ['pending', 'Needs review'], ['flagged', 'Flagged lines'], ['approved', 'Approved'], ['posted', 'Posted as order'], ['rejected', 'Rejected'], ['anuma', 'Made by Anuma']];
  DM.draftRows = (view, q) => {
    q = (q || '').toLowerCase();
    return (DM.S.drafts || []).filter((d) => ({ all: 1, pending: d.status === 'pending', flagged: flagged(d) > 0, approved: d.status === 'approved', posted: d.status === 'posted', rejected: d.status === 'rejected', anuma: d.by === 'Anuma' }[view])
      && (!q || (d.no + pn(d.partyId)).toLowerCase().includes(q)));
  };
  DM.draftCols = () => [
    { id: 'no', label: 'Number', w: '130px', render: (d) => DM.mono(d.no) },
    { id: 'party', label: 'Party', flex: 2, render: (d) => `<span class="b">${esc(pn(d.partyId))}</span>` },
    { id: 'status', label: 'Status', w: '150px', render: (d) => sb(d.status) },
    { id: 'lines', label: 'Lines', num: true, w: '170px', render: (d) => `${(d.lines || []).length}${flagged(d) ? ` <span class="badge red">${flagged(d)} flagged</span>` : ''}` },
    { id: 'total', label: 'Total', num: true, w: '120px', render: (d) => fmt.inr(d.total || total(d)) },
    { id: 'created', label: 'Created', w: '130px', render: (d) => fmt.dt(d.createdAt) },
    { id: 'by', label: 'Created by', w: '150px', render: (d) => (d.by === 'Anuma' ? `<span class="badge violet">${I('sparkle')}Anuma</span>` : d.by ? `<span class="row" style="gap:6px">${DM.avatar(byName(d), 'sm')}<span class="trunc">${esc(byName(d))}</span></span>` : '—') },
    { id: 'case', label: 'Case', w: '120px', render: (d) => { const t = d.threadId && DM.by(DM.S.threads || [], d.threadId); return t ? `<a class="monotag" href="#/inbox/threads?case=${esc(t.id)}">${esc(caseNo(t))}</a>` : '<span class="muted">—</span>'; } },
  ];

  /* ── mutations ── */
  const refresh = () => { DM.render(); refreshDraft(); };
  function approve(d) { d.lines.forEach((l) => { if (l.state === 'pending') l.state = 'confirmed'; }); d.status = 'approved'; d.total = total(d); log(d, 'Approved'); }
  function post(d) {
    const no = nextNo(DM.S.orders, 'ORD-' + ((DM.S.orders || []).length + 1));
    const lines = d.lines.filter((l) => l.state !== 'flagged').map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price }));
    const sys = DM.erpSystem ? DM.erpSystem() : 'Tally';
    const o = { id: DM.uid('ORD'), no, partyId: d.partyId, status: 'confirmed', total: lines.reduce((a, l) => a + l.qty * l.price, 0), placedAt: new Date().toISOString(), channel: d.threadId ? 'whatsapp' : 'web', payment: 'Credit', lines, erp: { system: sys, state: 'pending', at: new Date().toISOString() }, threadId: d.threadId };
    (DM.S.orders = DM.S.orders || []).unshift(o); d.status = 'posted'; d.orderId = o.id; d.total = o.total; log(d, `Posted as ${o.no}`); return o;
  }
  DM.act('dr-open', (el) => { DW.tab = 'overview'; openDraft(el.dataset.arg); });
  DM.act('dr-approve', (el) => { const d = get(el.dataset.arg); if (flagged(d)) { DM.toast('Resolve flagged lines first', 'alert'); DW.tab = 'lines'; return openDraft(d.id); } approve(d); DM.toast(`${d.no} approved`); refresh(); });
  DM.act('dr-post', (el) => { const d = get(el.dataset.arg); if (flagged(d)) { DM.toast('Resolve flagged lines first', 'alert'); DW.tab = 'lines'; return openDraft(d.id); } if (d.status === 'pending') approve(d); const o = post(d); DM.toast(`Posted as ${o.no}`); DW.tab = 'erp'; refresh(); });
  DM.act('dr-reject', (el) => {
    const d = get(el.dataset.arg);
    DM.modal({ title: 'Reject draft', body: `<p class="muted sm" style="margin-bottom:10px">${esc(d.no)} for ${esc(pn(d.partyId))}</p>${DM.field('Reason', 'reason', { area: true, ph: 'Why is this being rejected?' })}`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Reject draft', cls: 'danger', run: (m) => { const r = DM.formData(m).reason || 'no reason'; d.status = 'rejected'; d.note = (d.note ? d.note + ' · ' : '') + 'Rejected: ' + r; log(d, 'Rejected — ' + r); DM.toast(d.no + ' rejected'); refresh(); } }] });
  });
  DM.act('dr-reopen', (el) => { const d = get(el.dataset.arg); d.status = 'pending'; log(d, 'Moved back to review'); DM.toast('Moved back to review'); refresh(); });
  DM.act('dr-line-ok', (el) => { const [id, i] = el.dataset.arg.split('|'); const d = get(id); d.lines[+i].state = 'confirmed'; log(d, `Confirmed line ${+i + 1}`); DM.toast('Line confirmed'); refresh(); });
  DM.act('dr-line-del', (el) => { const [id, i] = el.dataset.arg.split('|'); const d = get(id); d.lines.splice(+i, 1); d.total = total(d); log(d, 'Removed a line'); DM.toast('Line removed'); refresh(); });
  DM.act('dr-line-match', (el) => {
    const [id, i] = el.dataset.arg.split('|'); const d = get(id); const l = d.lines[+i]; let query = '';
    const body = () => (DM.S.products || []).filter((p) => !query || (p.name + p.sku).toLowerCase().includes(query)).slice(0, 12).map((p) => `<div class="listrow" data-pick="${p.id}" style="border:1px solid var(--border);border-radius:9px;margin-bottom:6px;align-items:center"><div class="grow"><div class="b sm">${esc(p.name)}</div><div class="xs muted">${esc(p.sku)} · stock ${p.stock}</div></div><span class="mono sm">${fmt.inr(p.price)}</span></div>`).join('') || DM.empty('package', 'No products found', '');
    DM.modal({ title: 'Match to a product', body: `<div class="search" style="margin-bottom:10px">${I('search')}<input class="input" style="width:100%" id="dr-pq" placeholder="Search catalogue…"></div><div id="dr-pl">${body()}</div>`, onMount: (m) => {
      const pl = m.querySelector('#dr-pl'); m.querySelector('#dr-pq').addEventListener('input', (e) => { query = e.target.value.toLowerCase(); pl.innerHTML = body(); });
      pl.addEventListener('click', (e) => { const r = e.target.closest('[data-pick]'); if (!r) return; const p = DM.by(DM.S.products, r.dataset.pick); Object.assign(l, { productId: p.id, name: p.name, unit: p.unit, price: p.price, state: 'confirmed' }); d.total = total(d); log(d, `Matched line ${+i + 1} to ${p.name}`); DM.closeModal(); DM.toast('Matched to ' + p.name); refresh(); });
    } });
  });
  DM.input('dr-qty', (v, el) => { const [id, i] = el.dataset.arg.split('|'); const d = get(id); d.lines[+i].qty = Math.max(0, +v); d.total = total(d); refresh(); });
  DM.act('dr-new', () => {
    if (!(DM.S.parties || []).length || !(DM.S.products || []).length) return DM.toast('Add a party and a product first', 'alert');
    DM.modal({
      title: 'New draft order', body: `<div class="col">${DM.field('Party', 'party', { options: (DM.S.parties || []).map((p) => p.name) })}${DM.field('Product', 'product', { options: (DM.S.products || []).map((p) => p.name) })}${DM.field('Quantity', 'qty', { type: 'number', value: 10 })}</div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create draft', run: (m) => {
        const f = DM.formData(m); const p = DM.S.parties.find((x) => x.name === f.party); const pr = DM.S.products.find((x) => x.name === f.product);
        const d = { id: DM.uid('DR'), no: nextNo(DM.S.drafts, 'DRF-' + ((DM.S.drafts || []).length + 1)), partyId: p.id, status: 'pending', total: pr.price * (+f.qty || 1), createdAt: new Date().toISOString(), by: 'You', note: '', lines: [{ productId: pr.id, name: pr.name, qty: +f.qty || 1, unit: pr.unit, price: pr.price, state: 'pending' }] };
        (DM.S.drafts = DM.S.drafts || []).unshift(d); log(d, 'Draft created'); DM.toast('Draft created'); DW.tab = 'overview'; DM.render(); openDraft(d.id);
      } }],
    });
  });

  /* ── drawer ── */
  const events = (d) => {
    const th = d.threadId && DM.by(DM.S.threads || [], d.threadId);
    const ev = [{ at: d.createdAt, text: `Draft ${d.no} created by ${byName(d) || '—'}` }];
    if (th) ev.push({ at: d.createdAt, text: `Assembled from the ${th.channel || 'chat'} conversation ${caseNo(th)}` });
    if (flagged(d) || (d.lines || []).some((l) => l.note)) ev.push({ at: d.createdAt, text: `${flagged(d)} line(s) flagged for review` });
    (d.activity || []).forEach((a) => ev.push(a));
    return ev;
  };
  function lineRows(d, open) {
    return d.lines.map((l, i) => `<tr class="${l.state === 'flagged' ? 'dr-flag' : ''}">
      <td>${l.productId ? `<div class="b">${esc(l.name)}</div><div class="xs muted">${esc((DM.by(DM.S.products || [], l.productId) || {}).sku || '')}</div>` : `<span class="b">${esc(l.name || 'Unmatched item')}</span>`}${l.note ? `<div class="xs" style="color:var(--warning-ink)">${esc(l.note)}</div>` : ''}</td>
      <td class="num"><input class="input dr-num mono" type="number" min="0" value="${l.qty}" data-change="dr-qty" data-arg="${d.id}|${i}" ${open ? '' : 'disabled'}> <span class="xs muted">${esc(l.unit || '')}</span></td>
      <td class="num mono">${fmt.inr(l.price)}</td><td class="num mono">${l.state === 'flagged' ? '—' : fmt.inr(l.qty * l.price)}</td>
      <td><span class="${DM.popIf('dl:' + d.id + ':' + i, l.state)}">${DM.status((LSTATE[l.state] || [l.state])[0], (LSTATE[l.state] || [0, 'grey'])[1])}</span></td>
      <td style="white-space:nowrap;text-align:right">${open ? `${l.state === 'flagged' ? DM.btn('Match', 'dr-line-match', { cls: 'outline sm', arg: d.id + '|' + i }) : l.state === 'pending' ? DM.btn('Confirm', 'dr-line-ok', { cls: 'outline sm', arg: d.id + '|' + i }) : ''}${DM.btn('', 'dr-line-del', { cls: 'ghost sm icon', arg: d.id + '|' + i, icon: 'trash' })}` : ''}</td></tr>`).join('');
  }
  function openDraft(id) {
    const d = get(id); if (!d) return; DW.id = id;
    const p = DM.by(DM.S.parties || [], d.partyId) || {}; const f = flagged(d); const open = d.status === 'pending'; const th = d.threadId && DM.by(DM.S.threads || [], d.threadId); const o = d.orderId && DM.by(DM.S.orders || [], d.orderId);
    let body;
    if (DW.tab === 'overview') body = `${f && open ? `<div class="dr-note" style="margin-bottom:12px"><b>${f} line${f > 1 ? 's' : ''} need a decision.</b> Match each to a product or remove it before approving. <button class="sm b" style="text-decoration:underline" data-act="dr-dtab" data-arg="lines">Go to lines</button></div>` : ''}
      <div class="grid g3">${DM.statCard('Lines', DM.cnt(d.lines.length), f ? `${f} flagged` : 'All clear', 'package', { tone: f ? 'down' : '' })}${DM.statCard('Total', DM.cnt(total(d), 'inr'), 'excl. flagged', 'rupee')}${DM.statCard('Credit left', DM.cnt(Math.max(0, (p.creditLimit || 0) - (p.outstanding || 0)), 'inrc'), `of ${fmt.inrc(p.creditLimit || 0)}`, 'receipt', { tone: p.outstanding > p.creditLimit ? 'down' : '' })}</div>
      <div class="sect">Party</div><div class="card pad"><div class="row">${DM.avatar(p.name || '?', 'lg', { org: true })}<div class="grow"><a class="b" href="#/crm/accounts/${esc(d.partyId)}">${esc(p.name || '—')}</a><div class="xs muted">${esc(p.city || '')}${p.terms ? ' · ' + esc(p.terms) : ''}</div></div>${th ? `<a class="monotag" href="#/inbox/threads?case=${esc(th.id)}">${I('chat')} ${esc(caseNo(th))}</a>` : ''}</div>
        <dl class="kv" style="grid-template-columns:100px 1fr;margin-top:12px"><dt>Outstanding</dt><dd class="mono ${p.outstanding > p.creditLimit ? 'down' : ''}">${fmt.inr(p.outstanding)}</dd><dt>Created</dt><dd>${fmt.dt(d.createdAt)} by ${esc(byName(d) || '—')}</dd></dl>${DM.contactRow(d.partyId)}</div>
      ${d.note ? `<div class="sect">Notes</div><div class="card pad sm">${esc(d.note)}</div>` : ''}
      <div class="sect">Source</div><div class="card pad sm muted">${th ? `Assembled from the conversation with ${esc(pn(th.partyId))} on ${esc(th.channel)}.` : 'Created manually.'}</div>`;
    else if (DW.tab === 'lines') body = `<table class="minitbl"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th><th>State</th><th></th></tr></thead><tbody>${lineRows(d, open)}</tbody></table><div class="row" style="margin-top:12px"><span class="muted sm">Flagged lines are excluded from the total</span><span class="right b mono">Total ${fmt.inr(total(d))}</span></div>`;
    else if (DW.tab === 'activity') body = `<div class="ord-tl">${events(d).map((e) => `<div class="ev done"><div class="sm b">${esc(e.text)}</div>${e.at ? `<div class="xs muted">${fmt.dt(e.at)}</div>` : ''}</div>`).join('')}</div>`;
    else body = o ? DM.erpPanel(o) : `<div class="empty-card"><span class="icotile lg">${I('upload')}</span><div class="b" style="margin-top:10px">Not posted yet</div><div class="muted sm" style="margin:2px 0 12px">Once posted as an order, it syncs to ${esc(DM.erpSystem())} from here.</div>${d.status === 'rejected' ? '' : DM.btn('Approve & post', 'dr-post', { arg: d.id, icon: 'send' })}</div>`;
    DM.sheet('draft:' + id, {
      title: `<div class="row">${DM.mono(d.no)}<span class="${DM.popIf('drst:' + d.id, d.status)}">${sb(d.status)}</span></div><div class="sm muted" style="margin-top:4px">${esc(pn(d.partyId))}</div>`,
      headRight: `<a class="btn ghost icon sm" href="#/orders/drafts/${esc(d.id)}" title="Open full page">${I('ext')}</a>`,
      tabs: [{ key: 'overview', label: 'Overview' }, { key: 'lines', label: 'Lines', count: d.lines.length }, { key: 'activity', label: 'Activity' }, { key: 'erp', label: 'ERP' }], tab: DW.tab, body,
      footer: `${open ? `${DM.btn('Reject', 'dr-reject', { cls: 'outline sm', arg: d.id })}${DM.btn('Approve', 'dr-approve', { cls: 'outline sm', arg: d.id, icon: 'check' })}${DM.btn('Approve & post', 'dr-post', { cls: 'sm', arg: d.id, icon: 'send' })}` : ''}${d.status === 'approved' ? DM.btn('Post as order', 'dr-post', { cls: 'sm', arg: d.id, icon: 'send' }) : ''}${d.status === 'rejected' ? DM.btn('Reopen', 'dr-reopen', { cls: 'outline sm', arg: d.id }) : ''}${o ? DM.btn('View order', '', { cls: 'outline sm', go: '/orders/' + o.id }) : ''}`,
    });
  }
  function refreshDraft() { const w = DM.sheetOpen(); if (DW.id && w && w.dataset.key === 'draft:' + DW.id) openDraft(DW.id); }
  DM.refreshDraft = refreshDraft;
  DM.sheetTab = (kind, t) => { if (kind === 'draft') { DW.tab = t; openDraft(DW.id); } };
  DM.act('dr-dtab', (el) => { DW.tab = el.dataset.arg; openDraft(DW.id); });
  DM.openDraft = (id) => { DW.tab = 'overview'; openDraft(id); };

  /* ── full page ── */
  function detail({ params }) {
    const d = get(params.id);
    if (!d) return `<div class="page"><div class="empty-card"><b>Draft not found</b><p style="margin-top:12px"><a class="btn outline" href="#/orders/drafts">Back to orders</a></p></div></div>`;
    const p = DM.by(DM.S.parties || [], d.partyId) || {}; const f = flagged(d); const open = d.status === 'pending';
    const o = d.orderId && DM.by(DM.S.orders || [], d.orderId); const th = d.threadId && DM.by(DM.S.threads || [], d.threadId);
    const acts = `${th ? DM.btn('Open chat', '', { cls: 'outline', go: '/inbox/threads?case=' + th.id, icon: 'chat' }) : ''}
      ${open ? `${DM.btn('Reject', 'dr-reject', { cls: 'outline', arg: d.id })}${DM.btn('Approve', 'dr-approve', { cls: 'outline', arg: d.id, icon: 'check' })}${DM.btn('Approve & post', 'dr-post', { arg: d.id, icon: 'send' })}` : ''}
      ${d.status === 'approved' ? DM.btn('Post as order', 'dr-post', { arg: d.id, icon: 'send' }) : ''}${d.status === 'rejected' ? DM.btn('Reopen', 'dr-reopen', { cls: 'outline', arg: d.id }) : ''}${o ? DM.btn('View order', '', { go: '/orders/' + o.id, icon: 'clipboard' }) : ''}`;
    return `<div class="page wide"><div class="row sm muted" style="margin-bottom:8px"><a href="#/orders/drafts" class="row">${I('chevL')} Orders</a></div>
      ${DM.header(`${DM.mono(d.no)} ${sb(d.status)}`, `${esc(pn(d.partyId))} · created ${fmt.dt(d.createdAt)} by ${esc(byName(d) || '—')}`, acts)}
      ${f && open ? `<div class="dr-note" style="margin-bottom:14px"><div class="row">${I('alert')}<span><b>${f} line${f > 1 ? 's' : ''} need a decision.</b> Match each to a product or remove it before approving.</span></div></div>` : ''}
      <div class="dr-grid"><div class="card"><div class="card-h"><h3 class="grow">Lines</h3><span class="muted sm">${d.lines.length} lines</span></div>
        <div style="padding:4px 12px 8px"><table class="minitbl"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th><th>State</th><th></th></tr></thead><tbody>${lineRows(d, open)}</tbody></table></div>
        <div class="row" style="padding:12px 16px;border-top:1px solid var(--border)"><span class="muted sm">Flagged lines are excluded from the total</span><span class="right b mono" style="font-size:15px">Total ${fmt.inr(total(d))}</span></div></div>
      <div class="col" style="gap:14px"><div class="card pad"><h3 style="margin-bottom:10px">Party</h3><div class="row" style="margin-bottom:10px">${DM.avatar(p.name || '?', 'lg', { org: true })}<div><a class="b" href="#/crm/accounts/${esc(d.partyId)}">${esc(p.name || '—')}</a><div class="xs muted">${esc(p.city || '')}</div></div></div>
          <dl class="kv" style="grid-template-columns:100px 1fr"><dt>Credit terms</dt><dd>${esc(p.terms || '—')}</dd><dt>Credit limit</dt><dd class="mono">${fmt.inr(p.creditLimit)}</dd><dt>Outstanding</dt><dd class="mono ${p.outstanding > p.creditLimit ? 'down' : ''}">${fmt.inr(p.outstanding)}</dd></dl>${DM.contactRow(d.partyId)}</div>
        ${d.note ? `<div class="card pad"><h3 style="margin-bottom:6px">Notes</h3><p class="sm">${esc(d.note)}</p></div>` : ''}
        ${o ? DM.erpPanel(o) : ''}
        <div class="card pad"><h3 style="margin-bottom:8px">Activity</h3><div class="ord-tl">${events(d).map((e) => `<div class="ev done"><div class="sm b">${esc(e.text)}</div>${e.at ? `<div class="xs muted">${fmt.dt(e.at)}</div>` : ''}</div>`).join('')}</div></div></div></div></div>`;
  }

  DM.page('/orders/drafts', { title: 'Orders', crumb: 'Orders', render: DM.ordersScreen('draft') });
  DM.page('/orders/drafts/:id', { title: 'Draft order', crumb: (p) => p.id, render: detail });
})();
