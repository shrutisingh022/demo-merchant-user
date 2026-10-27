/* Orders — live NuHome "Orders" screen (draft orders | confirmed orders | ERP sync log) + order drawer + ERP panel.
   Unified screen is mounted at /orders/drafts (rail item) and /orders; drafts.js contributes the draft grid/drawer. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'orders';
  st.textContent = `
  .ord-grid{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:14px;align-items:start}
  @media(max-width:1180px){.ord-grid{grid-template-columns:1fr}}
  .ord-code{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:12px 14px;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;overflow:auto;max-height:300px;white-space:pre}
  .ord-code .k{color:#93c5fd}.ord-code .s{color:#86efac}.ord-code .n{color:#fbbf24}.ord-code .b{color:#f0abfc}
  .ord-erp{border-width:1.5px}.ord-erp.synced{border-color:#b7e4cf}.ord-erp.failed{border-color:#f5c2bd}.ord-erp.pending{border-color:#f1dca7}
  .ord-erp-h{display:flex;gap:10px;align-items:center;padding:12px 16px}
  .ord-erp-ic{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:#fff;font-weight:700}
  .ord-tl{position:relative;padding-left:22px}.ord-tl:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--border)}
  .ord-tl .ev{position:relative;padding:0 0 14px}.ord-tl .ev:before{content:"";position:absolute;left:-21px;top:3px;width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid var(--border)}
  .ord-tl .ev.done:before{background:var(--success);border-color:var(--success)}
  .ord-err{background:var(--destructive-tint);color:#b42318;border-radius:9px;padding:9px 12px;font-size:12px}
  .dw-h{padding:18px 20px 10px}.dw-h .t{display:flex;gap:10px;align-items:center}.dw-h h2{font-size:15px;font-weight:600}
  .dw-tabs{padding:4px 20px 12px}.dw-b{padding:0 20px 18px;overflow:auto;flex:1;min-height:0}
  .dw-b .sect{margin:18px 0 8px}
  .dw-f{border-top:1px solid var(--border);padding:10px 16px;display:flex;gap:8px;align-items:center;background:#fff;border-radius:0 0 0 14px}
  .ord-erp{transition:border-color .3s,box-shadow .3s}.ord-erp.synced.just{box-shadow:0 0 0 4px rgba(19,162,105,.14)}.checkpop{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--success);color:#fff;animation:badge-pop .4s ease both}.checkpop svg.i{width:12px;height:12px}
  .minitbl{width:100%;border-collapse:collapse;font-size:12px}.minitbl th{font-weight:500;color:var(--muted-foreground);text-align:left;padding:7px 8px;border-bottom:1px solid var(--border)}.minitbl td{padding:8px;border-bottom:1px solid #f0f0f0;vertical-align:middle}.minitbl .num{text-align:right;white-space:nowrap}.minitbl td:first-child{min-width:140px}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.orders = DM.ui.orders || { json: 'request', logSel: null });
  const V = (DM.ui.ordersScreen = DM.ui.ordersScreen || { view: 'draft', dview: 'all', cview: 'all', q: '', hid: { draft: [], confirmed: [], sync: [] } });
  const FLOW = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];
  const STATUS = { confirmed: ['Confirmed', 'blue'], processing: ['Processing', 'amber'], packed: ['Packed', 'blue'], shipped: ['Shipped', 'blue'], delivered: ['Delivered', 'green'], cancelled: ['Cancelled', 'red'] };
  const ERPS = { sync: ['Synced', 'green'], synced: ['Synced', 'green'], pending: ['Pending', 'amber'], failed: ['Failed', 'red'] };
  const pn = (id) => (DM.by(DM.S.parties || [], id) || {}).name || '—';
  const sbadge = (s) => { const [l, t] = STATUS[s] || [s, 'grey']; return DM.status(l, t); };
  const ebadge = (e) => (e ? DM.status(`${e.system} · ${(ERPS[e.state] || [e.state])[0]}`, (ERPS[e.state] || [0, 'grey'])[1]) : DM.status('Not synced', 'grey'));
  const get = (id) => DM.by(DM.S.orders || [], id);
  const caseNo = (t) => (t ? DM.caseNo(t) : '');
  // 'pop' once when a value differs from what this surface last showed
  DM.ui.popSeen = DM.ui.popSeen || {};
  DM.popIf = DM.popIf || ((key, val) => { const k = key + '|' + DM.uc; const had = k in DM.ui.popSeen; const ch = had && DM.ui.popSeen[k] !== val; DM.ui.popSeen[k] = val; return ch ? 'pop' : ''; });
  // the person to talk to at a party (photo avatar + name/role)
  DM.contactRow = (partyId) => { const cs = (DM.S.contacts || []).filter((c) => c.partyId === partyId); const c = cs.find((x) => x.primary) || cs[0]; return c ? `<div class="row" style="margin-top:10px;gap:8px">${DM.avatar(c.name, 'sm')}<div class="grow" style="min-width:0"><div class="sm b trunc">${esc(c.name)}</div><div class="xs muted trunc">${esc(c.role || 'Contact')}${c.phone ? ' · ' + esc(c.phone) : ''}</div></div></div>` : ''; };

  /* ERP system for this use case: from orders / erpLog / connected apps */
  DM.erpSystem = () => {
    const o = (DM.S.orders || []).find((x) => x.erp); if (o) return o.erp.system;
    const l = (DM.S.erpLog || [])[0]; if (l) return l.system;
    const a = (DM.S.apps || []).find((x) => ['tally', 'coralio'].includes(x.slug) && x.state === 'connected'); return a ? a.name : 'Tally';
  };
  const sysColor = (s) => (/coral/i.test(s) ? '#0d9488' : '#1d4ed8');
  const endpointFor = (sys, o) => (/coral/i.test(sys) ? { method: 'POST', endpoint: 'https://api.coralio.in/v2/sales-orders' } : { method: 'POST', endpoint: 'http://tally-gateway.local:9000/vouchers/sales' });
  const lineOf = (o) => (o.lines || []).map((l) => ({ item: l.name, qty: l.qty, unit: l.unit, rate: l.price, amount: l.qty * l.price }));
  const payloadFor = (sys, o) => (/coral/i.test(sys)
    ? { externalRef: o.no, party: pn(o.partyId), orderDate: String(o.placedAt).slice(0, 10), lines: lineOf(o), total: o.total, source: 'anuma' }
    : { voucherType: 'Sales Order', voucherNumber: o.no, partyLedger: pn(o.partyId), date: String(o.placedAt).slice(0, 10).replace(/-/g, ''), inventoryEntries: lineOf(o), amount: o.total });

  /* ───────── generic right sheet (live-style drawer): header, segmented tabs, body, footer ───────── */
  DM.sheet = (key, o) => {
    const html = `<div class="dw-h"><div class="t"><div class="grow" style="min-width:0">${o.title}</div>${o.headRight || ''}<button class="btn ghost icon sm" data-act="close-drawer" title="Close">${I('x')}</button></div>${o.sub ? `<div class="sm muted" style="margin-top:6px">${o.sub}</div>` : ''}</div>
      ${o.tabs ? `<div class="dw-tabs">${DM.seg(o.tabs, o.tab, 'sheet-tab')}</div>` : ''}
      <div class="dw-b">${o.body}</div><div class="dw-f">${o.footer || ''}<span class="grow"></span>${DM.btn('Close', 'close-drawer', { cls: 'outline' })}</div>`;
    let w = document.getElementById('drawer-wrap');
    if (w && w.dataset.key === key) { const d = w.querySelector('.drawer'); const sc = d.querySelector('.dw-b'); const top = sc ? sc.scrollTop : 0; d.style.animation = 'none'; d.innerHTML = html; const nb = d.querySelector('.dw-b'); if (nb) nb.scrollTop = top; return w; }
    DM.closeDrawer(); w = document.createElement('div'); w.id = 'drawer-wrap'; w.dataset.key = key;
    w.innerHTML = `<div class="drawer" style="display:flex;flex-direction:column;width:min(640px,96vw)">${html}</div>`;
    w.addEventListener('mousedown', (e) => { if (e.target === w) DM.closeDrawer(); });
    document.body.appendChild(w); return w;
  };
  DM.sheetOpen = () => document.getElementById('drawer-wrap');
  DM.act('sheet-tab', (el) => { const t = el.dataset.arg; const k = (DM.sheetOpen() || {}).dataset && DM.sheetOpen().dataset.key; if (!k) return; const [kind] = k.split(':'); if (kind === 'ord') { DW.tab = t; openOrder(DW.id); } else if (DM.sheetTab) DM.sheetTab(kind, t); });

  /* columns popover that really toggles columns */
  DM.colsMenu = (anchor, all, hidden, after) => {
    const act = anchor.dataset.act;
    const open = (instant) => {
      const a = document.querySelector(`[data-act="${act}"]`) || anchor;
      DM.menu(a, [{ heading: 'Toggle columns' }, ...all.map((c) => ({ label: c.label, check: !hidden.includes(c.id), run: () => { const i = hidden.indexOf(c.id); if (i >= 0) hidden.splice(i, 1); else if (all.length - hidden.length > 1) hidden.push(c.id); after(); setTimeout(() => open(true), 0); } }))]);
      if (instant) { const m = document.querySelector('.menu'); if (m) m.style.animation = 'none'; }
    };
    open(false);
  };

  /* ───────── actions that mutate ───────── */
  function syncOrder(o, ok = true) {
    const sys = (o.erp && o.erp.system) || DM.erpSystem(); const ep = endpointFor(sys, o);
    const ref = (o.erp && o.erp.ref) || (/coral/i.test(sys) ? 'CRL-SO-' : 'TLY-SV-') + (40000 + Math.floor(Math.random() * 9000));
    o.erp = { system: sys, ref, state: ok ? 'synced' : 'failed', at: new Date().toISOString() };
    const log = (DM.S.erpLog = DM.S.erpLog || []);
    const prev = log.find((l) => l.orderId === o.id);
    const entry = { id: prev ? prev.id : DM.uid('erp'), orderId: o.id, system: sys, direction: 'out', endpoint: ep.endpoint, method: ep.method, status: ok ? 200 : 500, ref, at: o.erp.at, request: payloadFor(sys, o), response: ok ? { status: 'ok', reference: ref, message: 'Order recorded' } : { status: 'error', message: 'Upstream timeout' }, state: ok ? 'synced' : 'failed' };
    if (prev) Object.assign(prev, entry); else log.unshift(entry);
  }
  const done = () => { DM.render(); refreshOrder(); if (DM.refreshDraft) DM.refreshDraft(); };
  DM.act('ord-retry', (el) => { const o = get(el.dataset.arg); if (!o) return; if (o.erp) { o.erp.state = 'pending'; done(); } setTimeout(() => { syncOrder(o); DM.toast(`${o.no} synced to ${o.erp.system}`); done(); }, 700); });
  DM.act('ord-push', (el) => { const o = get(el.dataset.arg); o.erp = { system: DM.erpSystem(), state: 'pending', at: new Date().toISOString() }; done(); setTimeout(() => { syncOrder(o); DM.toast(`${o.no} pushed to ${o.erp.system}`); done(); }, 700); });
  DM.act('ord-json', (el) => { U.json = el.dataset.arg; done(); });
  DM.act('ord-advance', (el) => { const o = get(el.dataset.arg); const i = FLOW.indexOf(o.status); if (i < FLOW.length - 1) { o.status = FLOW[i + 1]; DM.toast(`${o.no} → ${STATUS[o.status][0]}`); done(); } });
  DM.act('ord-cancel', (el) => { const o = get(el.dataset.arg); DM.confirm('Cancel order?', `${esc(o.no)} will be cancelled.`, () => { o.status = 'cancelled'; DM.toast('Order cancelled'); done(); }, 'Cancel order'); });
  DM.act('ord-pay', (el) => { const o = get(el.dataset.arg); o.payment = 'Paid'; DM.toast('Marked as paid'); done(); });
  DM.act('ord-shipment', (el) => {
    const o = get(el.dataset.arg); const p = DM.by(DM.S.parties || [], o.partyId) || {};
    const sh = { id: 'SH-' + DM.uid('').slice(1).toUpperCase(), orderId: o.id, carrier: 'Delhivery', awb: 'DL' + Math.floor(1e9 + Math.random() * 9e9), status: 'pickup', eta: '2026-10-31', from: 'Warehouse', to: p.city || 'Customer', events: [{ at: new Date().toISOString(), text: 'Shipment created' }] };
    (DM.S.shipments = DM.S.shipments || []).unshift(sh); o.shipmentId = sh.id; if (FLOW.indexOf(o.status) < 3) o.status = 'shipped'; DM.toast('Shipment created · ' + sh.awb); done();
  });
  DM.act('ord-newlog', (el) => { U.logSel = el.dataset.arg; DM.render(); });
  DM.act('ord-sync-all', () => { let n = 0; (DM.S.orders || []).forEach((o) => { if (o.status !== 'cancelled' && (!o.erp || o.erp.state !== 'synced')) { syncOrder(o); n++; } }); DM.toast(n ? `${n} order(s) posted to ${DM.erpSystem()}` : 'Everything is already synced'); done(); });
  DM.act('ord-export', () => DM.toast('Exported orders.csv (demo)', 'download'));

  /* ───────── saved views + filters ───────── */
  const CVIEWS = [['all', 'All orders'], ['progress', 'In progress'], ['awaiting', 'Awaiting ERP sync'], ['failed', 'Sync failed'], ['unpaid', 'Unpaid'], ['delivered', 'Delivered']];
  DM.orderRows = (view, q) => {
    q = (q || '').toLowerCase();
    return (DM.S.orders || []).filter((o) => ({ all: 1, progress: FLOW.slice(0, 4).includes(o.status), awaiting: o.status !== 'cancelled' && (!o.erp || o.erp.state === 'pending'), failed: o.erp && o.erp.state === 'failed', unpaid: o.payment !== 'Paid' && o.status !== 'cancelled', delivered: o.status === 'delivered' }[view])
      && (!q || (o.no + pn(o.partyId)).toLowerCase().includes(q)));
  };
  DM.orderCols = (sys) => [
    { id: 'no', label: 'Number', w: '130px', render: (o) => DM.mono(o.no) },
    { id: 'party', label: 'Party', flex: 2, render: (o) => `<span class="b">${esc(pn(o.partyId))}</span>` },
    { id: 'status', label: 'Status', w: '130px', render: (o) => sbadge(o.status) },
    { id: 'placed', label: 'Placed', w: '120px', render: (o) => fmt.date(o.placedAt) },
    { id: 'channel', label: 'Channel', w: '110px', render: (o) => `<span class="monotag">${esc(o.channel || '—')}</span>` },
    { id: 'items', label: 'Lines', num: true, w: '80px', render: (o) => (o.lines || []).length },
    { id: 'total', label: 'Total', num: true, w: '120px', render: (o) => fmt.inr(o.total) },
    { id: 'pay', label: 'Payment', w: '110px', render: (o) => DM.status(o.payment, o.payment === 'Paid' ? 'green' : o.payment === 'Credit' ? 'blue' : 'amber') },
    { id: 'erp', label: sys, w: '170px', render: (o) => ebadge(o.erp) },
  ];

  /* ───────── the screen ───────── */
  DM.ordersScreen = (def) => ({ path, q }) => {
    const tab = q.get('tab'); const view = tab === 'sync' ? 'sync' : def; V.view = view;
    const sys = DM.erpSystem(); const drafts = DM.S.drafts || []; const orders = DM.S.orders || []; const log = DM.S.erpLog || [];
    const needs = drafts.filter((d) => d.status === 'pending'); const flag = needs.reduce((a, d) => a + (d.lines || []).filter((l) => l.state === 'flagged').length, 0);
    const awaiting = orders.filter((o) => o.status !== 'cancelled' && (!o.erp || o.erp.state === 'pending')).length; const failed = orders.filter((o) => o.erp && o.erp.state === 'failed').length;
    const flashD = DM.changedRows('drafts', drafts, (d) => d.status + '|' + (d.lines || []).length + '|' + d.total); const flashO = DM.changedRows('orders', orders, (o) => o.status + '|' + (o.erp && o.erp.state) + '|' + o.payment + '|' + o.total);
    const stats = `<div class="grid g4 stagger" style="margin-bottom:14px">
      ${DM.statCard('Needs review', DM.cnt(needs.length), needs.length ? `${flag} flagged line${flag === 1 ? '' : 's'}` : 'Queue clear', 'file')}
      ${DM.statCard('Draft orders', DM.cnt(drafts.length), `${drafts.filter((d) => d.status === 'posted').length} posted as orders`, 'clipboard')}
      ${DM.statCard('Confirmed orders', DM.cnt(orders.length), fmt.inrc(orders.reduce((a, o) => a + (o.status === 'cancelled' ? 0 : o.total), 0)), 'package')}
      ${DM.statCard(`${sys} sync`, DM.cnt(awaiting), failed ? `${failed} failed` : awaiting ? 'waiting to post' : 'All caught up', 'refresh', { tone: failed ? 'down' : awaiting ? '' : 'up' })}</div>`;
    const seg = DM.seg([{ key: 'draft', label: 'Draft orders', count: drafts.length }, { key: 'confirmed', label: 'Confirmed orders', count: orders.length }, { key: 'sync', label: `${sys} sync log`, count: log.length }], view, 'os-seg');
    const curView = view === 'draft' ? V.dview : V.cview; const list = view === 'draft' ? DM.draftViews : CVIEWS; const viewLabel = (list.find((x) => x[0] === curView) || list[0])[1];
    const left = `${view === 'sync' ? '' : `<button class="btn outline sm" data-act="os-views">${I('grid')} ${esc(viewLabel)} ${I('chevD')}</button>`}${seg}`;
    const hidKey = view === 'draft' ? 'draft' : 'confirmed';
    const right = `${view === 'confirmed' ? DM.btn(`Post pending to ${esc(sys)}`, 'ord-sync-all', { cls: 'outline sm', icon: 'refresh' }) : ''}${view === 'sync' ? '' : `<button class="btn outline sm" data-act="os-cols">${I('columns')} Columns${V.hid[hidKey].length ? ' · ' + V.hid[hidKey].length + ' off' : ''}</button>`}${DM.searchBox('os-q', view === 'draft' ? 'Search drafts…' : view === 'confirmed' ? 'Search orders…' : 'Search sync log…', V.q)}`;
    let body;
    if (view === 'draft') {
      const rows = DM.draftRows(V.dview, V.q); const cols = DM.draftCols().filter((c) => !V.hid.draft.includes(c.id));
      body = rows.length ? DM.table(cols, rows, { click: 'dr-open', pageSize: 50, offset: 372, rowCls: (r) => (flashD.has(r.id) ? 'row-new' : '') }) : DM.empty('inbox', V.dview === 'pending' ? 'Nothing waiting on you' : 'No draft orders here', V.dview === 'pending' ? 'New drafts from conversations show up here.' : 'Try another view or clear the search.');
    } else if (view === 'confirmed') {
      const rows = DM.orderRows(V.cview, V.q); const cols = DM.orderCols(sys).filter((c) => !V.hid.confirmed.includes(c.id));
      body = rows.length ? DM.table(cols, rows, { click: 'ord-open', pageSize: 50, offset: 372, rowCls: (r) => (flashO.has(r.id) ? 'row-new' : '') }) : DM.empty('clipboard', 'No orders match', 'Try another view or clear the search.');
    } else body = syncLog();
    const foot = view === 'sync' ? '' : `<div class="xs muted" style="margin-top:8px">${view === 'draft' ? DM.draftRows(V.dview, V.q).length + ' draft orders in view' : DM.orderRows(V.cview, V.q).length + ' orders in view'}</div>`;
    return `<div class="page wide">${DM.header('Orders', view === 'draft' ? 'Orders Anuma assembled from conversations — review, correct and post.' : view === 'confirmed' ? `Confirmed orders across every channel, synced to ${esc(sys)}.` : `Every call Anuma made to ${esc(sys)}, with the request and response.`, `${DM.btn('Export', 'ord-export', { cls: 'outline', icon: 'download' })}${DM.btn('New order', 'dr-new', { icon: 'plus' })}`)}${stats}${DM.toolbar(left, right)}${body}${foot}</div>`;
  };
  DM.act('os-seg', (el) => DM.go({ draft: '/orders/drafts', confirmed: '/orders', sync: '/orders?tab=sync' }[el.dataset.arg]));
  DM.input('os-q', (v) => { V.q = v; DM.render(); });
  DM.act('os-views', (el) => { const isD = V.view === 'draft'; DM.menu(el, (isD ? DM.draftViews : CVIEWS).map(([k, l]) => ({ label: l, icon: (isD ? V.dview : V.cview) === k ? 'check' : null, run: () => { if (isD) V.dview = k; else V.cview = k; DM.render(); } }))); });
  DM.act('os-cols', (el) => { const isD = V.view === 'draft'; DM.colsMenu(el, isD ? DM.draftCols() : DM.orderCols(DM.erpSystem()), V.hid[isD ? 'draft' : 'confirmed'], () => DM.render()); });
  DM.act('ord-open', (el) => { DW.tab = 'overview'; openOrder(el.dataset.arg); });

  function syncLog() {
    const log = DM.S.erpLog || []; if (!log.length) return DM.empty('refresh', 'No sync activity yet', 'Confirmed orders post here automatically.');
    const q = V.q.toLowerCase(); const rows = log.filter((l) => !q || ((get(l.orderId) || {}).no + ' ' + (l.endpoint || '') + (l.ref || '')).toLowerCase().includes(q));
    const sel = log.find((l) => l.id === U.logSel) || rows[0] || log[0];
    const cols = [
      { label: 'Time', w: '130px', render: (l) => fmt.dt(l.at) },
      { label: 'Order', w: '130px', render: (l) => { const o = get(l.orderId); return DM.mono(o ? o.no : l.orderId); } },
      { label: 'Request', flex: 2, render: (l) => `<span class="mono xs"><b>${esc(l.method || 'POST')}</b> ${esc(String(l.endpoint || '').replace(/^https?:\/\//, ''))}</span>` },
      { label: 'HTTP', w: '80px', render: (l) => DM.status(String(l.status), l.status < 300 ? 'green' : l.status < 500 ? 'amber' : 'red') },
      { label: 'Reference', w: '140px', render: (l) => `<span class="mono xs">${esc(l.ref || '—')}</span>` },
      { label: 'State', w: '110px', render: (l) => DM.status((ERPS[l.state] || [l.state])[0], (ERPS[l.state] || [0, 'grey'])[1]) },
    ];
    return `<div class="ord-grid">${DM.table(cols, rows, { click: 'ord-newlog', rowCls: (l) => (l.id === sel.id ? 'hl' : ''), noPager: true })}
      <div class="card"><div class="card-h"><h3 class="grow mono" style="font-size:12px">${esc(sel.method || 'POST')} ${esc(String(sel.endpoint || '').replace(/^https?:\/\//, ''))}</h3>${DM.status(String(sel.status), sel.status < 300 ? 'green' : 'red')}</div><div style="padding:12px 16px">${jsonTabs(sel)}${sel.state === 'failed' ? `<div style="margin-top:10px">${DM.btn('Retry sync', 'ord-retry', { arg: sel.orderId, icon: 'refresh', cls: 'sm' })}</div>` : ''}</div></div></div>`;
  }

  /* JSON viewer */
  const hl = (o) => esc(JSON.stringify(o, null, 2)).replace(/(&quot;[^&]*?&quot;)(\s*:)?|\b(-?\d+(\.\d+)?)\b|\b(true|false|null)\b/g, (m, s, c, n, _d, b) => (s ? (c ? `<span class="k">${s}</span>${c}` : `<span class="s">${s}</span>`) : n ? `<span class="n">${n}</span>` : `<span class="b">${b}</span>`));
  function jsonTabs(l) {
    return `<div class="pills" style="margin-bottom:10px">${['request', 'response'].map((k) => `<button class="pill ${U.json === k ? 'on' : ''}" data-act="ord-json" data-arg="${k}">${k === 'request' ? 'Request' : 'Response'}</button>`).join('')}</div>
      <div class="ord-code">${hl(l[U.json] || {})}</div><div class="row xs muted" style="margin-top:8px">${I('copy')}<button data-act="toast" data-arg="Copied JSON to clipboard">Copy JSON</button></div>`;
  }

  /* ERP sync panel (used by order drawer, order page and draft drawer) */
  function erpPanel(o) {
    const sys = (o.erp && o.erp.system) || DM.erpSystem(); const e = o.erp; const pop = DM.popIf('erp:' + o.id, e ? e.state : 'none'); const log = (DM.S.erpLog || []).find((l) => l.orderId === o.id);
    if (!e) return `<div class="card ord-erp pending"><div class="ord-erp-h"><div class="ord-erp-ic" style="background:${sysColor(sys)}">${esc(sys[0])}</div><div class="grow"><div class="b">${esc(sys)}</div><div class="xs muted">Not pushed yet</div></div>${DM.status('Not synced', 'grey')}</div><div style="padding:0 16px 14px"><p class="sm muted" style="margin-bottom:10px">This order hasn’t been posted to ${esc(sys)}. Post it now to create the ${/coral/i.test(sys) ? 'sales order' : 'sales voucher'}.</p>${DM.btn(`Push to ${esc(sys)}`, 'ord-push', { arg: o.id, icon: 'upload' })}</div></div>`;
    const ep = log ? { method: log.method, endpoint: log.endpoint } : endpointFor(sys, o);
    const req = log ? log.request : payloadFor(sys, o); const res = log ? log.response : null;
    return `<div class="card ord-erp ${e.state} ${pop ? 'just' : ''}"><div class="ord-erp-h"><div class="ord-erp-ic" style="background:${sysColor(sys)}">${esc(sys[0])}</div><div class="grow"><div class="b">${esc(sys)} sync</div><div class="xs muted">${e.at ? 'Last attempt ' + fmt.dt(e.at) : ''}</div></div>${e.state === 'synced' && pop ? `<span class="checkpop">${I('check')}</span>` : ''}<span class="${pop}">${DM.status((ERPS[e.state] || [e.state])[0], (ERPS[e.state] || [0, 'grey'])[1])}</span></div>
      <div style="padding:0 16px 16px" class="col">
        <dl class="kv" style="grid-template-columns:90px 1fr"><dt>Reference</dt><dd class="mono">${esc(e.ref || '—')}</dd><dt>Endpoint</dt><dd class="mono xs" style="word-break:break-all"><b>${esc(ep.method)}</b> ${esc(ep.endpoint)}</dd><dt>HTTP</dt><dd>${log ? DM.status(String(log.status), log.status < 300 ? 'green' : 'red') : '—'}</dd></dl>
        ${e.state === 'failed' ? `<div class="ord-err"><b>Sync failed.</b> ${esc(e.error || (res && res.message) || 'The server did not respond in time.')}</div>` : ''}
        ${e.state === 'pending' ? `<div class="row sm muted">${I('refresh').replace('class="i "', 'class="i spin"')} Waiting for ${esc(sys)} to acknowledge…</div>` : ''}
        ${jsonTabs({ request: req, response: res || { status: 'pending' } })}
        ${e.state === 'pending' ? DM.btn('Syncing…', '', { icon: 'refresh', attrs: 'disabled' }).replace('class="i "', 'class="i spin"') : e.state !== 'synced' ? DM.btn(e.state === 'failed' ? 'Retry sync' : 'Sync now', 'ord-retry', { arg: o.id, icon: 'refresh' }) : DM.btn('Re-sync', 'ord-retry', { arg: o.id, icon: 'refresh', cls: 'outline' })}
      </div></div>`;
  }
  DM.erpPanel = erpPanel;

  /* ───────── order drawer ───────── */
  const DW = (DM.ui.ordDrawer = DM.ui.ordDrawer || { id: null, tab: 'overview' });
  const totals = (o) => { const sub = (o.lines || []).reduce((a, l) => a + l.qty * l.price, 0); const gst = Math.round(o.total - sub > 0 ? o.total - sub : sub * 0.18); return { sub, gst }; };
  const events = (o) => {
    const ev = [{ at: o.placedAt, text: `Order ${o.no} placed via ${o.channel || 'web'}` }];
    const i = FLOW.indexOf(o.status); FLOW.slice(1, i + 1).forEach((s) => ev.push({ at: null, text: `Marked ${STATUS[s][0].toLowerCase()}` }));
    const sh = o.shipmentId && DM.by(DM.S.shipments || [], o.shipmentId); if (sh) (sh.events || []).forEach((e) => ev.push({ at: e.at, text: `${sh.carrier}: ${e.text}` }));
    const lg = (DM.S.erpLog || []).find((l) => l.orderId === o.id); if (lg) ev.push({ at: lg.at, text: `${lg.system} ${lg.state === 'failed' ? 'rejected the sync (HTTP ' + lg.status + ')' : 'accepted the sync — ' + (lg.ref || '')}` });
    if (o.status === 'cancelled') ev.push({ at: null, text: 'Order cancelled' });
    return ev;
  };
  function openOrder(id) {
    const o = get(id); if (!o) return; DW.id = id;
    const p = DM.by(DM.S.parties || [], o.partyId) || {}; const th = o.threadId && DM.by(DM.S.threads || [], o.threadId); const sh = o.shipmentId && DM.by(DM.S.shipments || [], o.shipmentId);
    const { sub, gst } = totals(o); const i = FLOW.indexOf(o.status); const cancelled = o.status === 'cancelled'; const sys = (o.erp && o.erp.system) || DM.erpSystem();
    let body = '';
    if (DW.tab === 'overview') body = `<div class="grid g3">${DM.statCard('Total', DM.cnt(o.total, 'inr'), `GST ${fmt.inr(gst)}`, 'rupee')}${DM.statCard('Lines', DM.cnt((o.lines || []).length), `${fmt.num((o.lines || []).reduce((a, l) => a + (l.qty || 0), 0))} units`, 'package')}${DM.statCard('Payment', o.payment, o.payment === 'Paid' ? 'Settled' : 'Open', 'receipt')}</div>
      <div class="sect">Party</div><div class="card pad"><div class="row">${DM.avatar(p.name || '?', 'lg', { org: true })}<div class="grow"><a class="b" href="#/crm/accounts/${esc(o.partyId)}">${esc(p.name || '—')}</a><div class="xs muted">${esc(p.city || '')}${p.terms ? ' · ' + esc(p.terms) : ''}</div></div>${th ? `<a class="monotag" href="#/inbox/threads?case=${esc(th.id)}">${I('chat')} ${esc(caseNo(th))}</a>` : ''}</div>
      <dl class="kv" style="grid-template-columns:100px 1fr;margin-top:12px"><dt>GSTIN</dt><dd class="mono xs">${esc(p.gstin || '—')}</dd><dt>Phone</dt><dd>${esc(p.phone || '—')}</dd><dt>Placed</dt><dd>${fmt.dt(o.placedAt)}</dd></dl>${DM.contactRow(o.partyId)}</div>
      <div class="sect">Shipment</div><div class="card pad">${sh ? `<div class="row"><b class="sm">${esc(sh.carrier)}</b><span class="mono xs">${esc(sh.awb)}</span><span class="right">${DM.status(String(sh.status).replace('_', ' '), sh.status === 'delivered' ? 'green' : 'blue')}</span></div><div class="xs muted" style="margin-top:4px">ETA ${fmt.date(sh.eta)}</div>` : `<div class="row"><span class="sm muted grow">No shipment yet.</span>${cancelled ? '' : DM.btn('Create shipment', 'ord-shipment', { arg: o.id, cls: 'outline sm', icon: 'truck' })}</div>`}</div>
      ${o.payment !== 'Paid' && !cancelled ? `<div style="margin-top:12px">${DM.btn('Mark as paid', 'ord-pay', { arg: o.id, cls: 'outline sm', icon: 'check' })}</div>` : ''}`;
    else if (DW.tab === 'lines') body = `<table class="minitbl"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${(o.lines || []).map((l) => `<tr><td><div class="b">${esc(l.name)}</div><div class="xs muted">${esc((DM.by(DM.S.products || [], l.productId) || {}).sku || '')}</div></td><td class="num mono">${l.qty} ${esc(l.unit || '')}</td><td class="num mono">${fmt.inr(l.price)}</td><td class="num mono">${fmt.inr(l.qty * l.price)}</td></tr>`).join('')}</tbody></table>
      <div class="col" style="align-items:flex-end;gap:3px;margin-top:12px"><div class="row sm"><span class="muted" style="width:90px">Subtotal</span><span class="mono">${fmt.inr(sub)}</span></div><div class="row sm"><span class="muted" style="width:90px">GST</span><span class="mono">${fmt.inr(gst)}</span></div><div class="row b" style="font-size:15px"><span style="width:90px">Total</span><span class="mono">${fmt.inr(o.total)}</span></div></div>`;
    else if (DW.tab === 'activity') body = `<div class="ord-tl">${events(o).map((e, k) => `<div class="ev done"><div class="sm b">${esc(e.text)}</div>${e.at ? `<div class="xs muted">${fmt.dt(e.at)}</div>` : ''}</div>`).join('')}</div>`;
    else body = erpPanel(o);
    DM.sheet('ord:' + id, {
      title: `<div class="row">${DM.mono(o.no)}<span class="${DM.popIf('ordst:' + o.id, o.status)}">${sbadge(o.status)}</span></div><div class="sm muted" style="margin-top:4px">${esc(pn(o.partyId))}</div>`,
      headRight: `<a class="btn ghost icon sm" href="#/orders/${esc(o.id)}" title="Open full page">${I('ext')}</a>`,
      tabs: [{ key: 'overview', label: 'Overview' }, { key: 'lines', label: 'Lines' }, { key: 'activity', label: 'Activity' }, { key: 'erp', label: 'ERP' }], tab: DW.tab, body,
      footer: `${!cancelled && i >= 0 && i < FLOW.length - 1 ? DM.btn('Mark ' + STATUS[FLOW[i + 1]][0].toLowerCase(), 'ord-advance', { arg: o.id, icon: 'arrowR', cls: 'sm' }) : ''}${!cancelled && o.status !== 'delivered' ? DM.btn('Cancel order', 'ord-cancel', { arg: o.id, cls: 'outline sm' }) : ''}`,
    });
  }
  function refreshOrder() { if (DW.id && DM.sheetOpen() && DM.sheetOpen().dataset.key === 'ord:' + DW.id) openOrder(DW.id); }
  DM.openOrder = (id) => { DW.tab = 'overview'; openOrder(id); };

  /* ───────── full pages ───────── */
  function detail({ params }) {
    const o = get(params.id);
    if (!o) return `<div class="page"><div class="empty-card"><b>Order not found</b><p style="margin-top:12px"><a class="btn outline" href="#/orders">Back to orders</a></p></div></div>`;
    const p = DM.by(DM.S.parties || [], o.partyId) || {}; const sh = o.shipmentId && DM.by(DM.S.shipments || [], o.shipmentId); const th = o.threadId && DM.by(DM.S.threads || [], o.threadId);
    const i = FLOW.indexOf(o.status); const cancelled = o.status === 'cancelled'; const { sub, gst } = totals(o);
    const acts = `${th ? DM.btn('Open chat', '', { cls: 'outline', go: '/inbox/threads?case=' + th.id, icon: 'chat' }) : ''}${!cancelled && i < FLOW.length - 1 ? DM.btn('Mark ' + STATUS[FLOW[i + 1]][0].toLowerCase(), 'ord-advance', { arg: o.id, icon: 'arrowR' }) : ''}${!cancelled && o.status !== 'delivered' ? DM.btn('Cancel', 'ord-cancel', { arg: o.id, cls: 'outline' }) : ''}`;
    return `<div class="page wide"><div class="row sm muted" style="margin-bottom:8px"><a href="#/orders" class="row">${I('chevL')} Orders</a></div>
      ${DM.header(`${DM.mono(o.no)} ${sbadge(o.status)} ${ebadge(o.erp)}`, `${esc(pn(o.partyId))} · placed ${fmt.dt(o.placedAt)} via ${esc(o.channel || '—')}`, acts)}
      <div class="grid g3" style="margin-bottom:14px">${DM.statCard('Total', DM.cnt(o.total, 'inr'), `GST ${fmt.inr(gst)}`, 'rupee')}${DM.statCard('Lines', DM.cnt((o.lines || []).length), `${fmt.num((o.lines || []).reduce((a, l) => a + (l.qty || 0), 0))} units`, 'package')}${DM.statCard('Payment', o.payment, o.payment === 'Paid' ? 'Settled' : 'Open', 'receipt')}</div>
      <div class="ord-grid"><div class="col" style="gap:14px">
        <div class="card"><div class="card-h"><h3 class="grow">Lines</h3><span class="muted sm">${(o.lines || []).length} lines</span></div><div style="padding:4px 12px 12px"><table class="minitbl"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${(o.lines || []).map((l) => `<tr><td><div class="b">${esc(l.name)}</div><div class="xs muted">${esc((DM.by(DM.S.products || [], l.productId) || {}).sku || '')}</div></td><td class="num mono">${l.qty} ${esc(l.unit || '')}</td><td class="num mono">${fmt.inr(l.price)}</td><td class="num mono">${fmt.inr(l.qty * l.price)}</td></tr>`).join('')}</tbody></table>
          <div class="col" style="align-items:flex-end;gap:3px;margin-top:12px"><div class="row sm"><span class="muted" style="width:90px">Subtotal</span><span class="mono">${fmt.inr(sub)}</span></div><div class="row sm"><span class="muted" style="width:90px">GST</span><span class="mono">${fmt.inr(gst)}</span></div><div class="row b" style="font-size:15px"><span style="width:90px">Total</span><span class="mono">${fmt.inr(o.total)}</span></div></div></div></div>
        <div class="card pad"><h3 style="margin-bottom:12px">Timeline</h3>${cancelled ? `<div class="ord-err">Order cancelled.</div>` : `<div class="ord-tl">${events(o).map((e) => `<div class="ev done"><div class="sm b">${esc(e.text)}</div>${e.at ? `<div class="xs muted">${fmt.dt(e.at)}</div>` : ''}</div>`).join('')}</div>`}</div>
      </div><div class="col" style="gap:14px">${erpPanel(o)}
        <div class="card pad"><h3 style="margin-bottom:10px">Party</h3><div class="row" style="margin-bottom:10px">${DM.avatar(p.name || '?', 'lg', { org: true })}<div><a class="b" href="#/crm/accounts/${esc(o.partyId)}">${esc(p.name || '—')}</a><div class="xs muted">${esc(p.city || '')} · ${esc(p.terms || '')}</div></div></div><dl class="kv" style="grid-template-columns:90px 1fr"><dt>GSTIN</dt><dd class="mono xs">${esc(p.gstin || '—')}</dd><dt>Phone</dt><dd>${esc(p.phone || '—')}</dd></dl>${DM.contactRow(o.partyId)}</div>
        <div class="card pad"><h3 style="margin-bottom:10px">Payment</h3><div class="row">${DM.status(o.payment, o.payment === 'Paid' ? 'green' : o.payment === 'Credit' ? 'blue' : 'amber')}<span class="right b mono">${fmt.inr(o.total)}</span></div>${o.payment !== 'Paid' ? `<div style="margin-top:10px">${DM.btn('Mark as paid', 'ord-pay', { arg: o.id, cls: 'outline sm', icon: 'check' })}</div>` : ''}</div>
        <div class="card pad"><h3 style="margin-bottom:10px">Shipment</h3>${sh ? `<div class="sm"><b>${esc(sh.carrier)}</b> · <span class="mono">${esc(sh.awb)}</span></div><div class="row" style="margin:6px 0">${DM.status(String(sh.status).replace('_', ' '), sh.status === 'delivered' ? 'green' : 'blue')}<span class="xs muted">ETA ${fmt.date(sh.eta)}</span></div>${DM.btn('Track', '', { go: '/fulfilment?s=' + sh.id, cls: 'outline sm', icon: 'truck' })}` : `<p class="sm muted" style="margin-bottom:10px">No shipment yet.</p>${cancelled ? '' : DM.btn('Create shipment', 'ord-shipment', { arg: o.id, cls: 'outline sm', icon: 'truck' })}`}</div>
      </div></div></div>`;
  }

  function parent() {
    const by = {}; (DM.S.orders || []).forEach((o) => { (by[o.partyId] = by[o.partyId] || []).push(o); });
    return `<div class="page">${DM.header('Parent orders', 'Orders grouped by party account.', DM.btn('All orders', '', { cls: 'outline', go: '/orders' }))}
      <div class="col" style="gap:12px">${Object.entries(by).map(([pid, os]) => `<div class="card"><div class="card-h">${DM.avatar(pn(pid), 'sm', { org: true })}<a class="b grow" href="#/crm/accounts/${esc(pid)}">${esc(pn(pid))}</a><span class="muted sm">${os.length} orders · <b class="mono">${fmt.inr(os.reduce((a, o) => a + o.total, 0))}</b></span></div>${os.slice(0, 5).map((o) => `<div class="listrow" data-go="/orders/${o.id}"><span style="width:130px">${DM.mono(o.no)}</span><span class="grow muted sm">${fmt.date(o.placedAt)}</span>${sbadge(o.status)}<span class="mono sm" style="width:90px;text-align:right">${fmt.inr(o.total)}</span></div>`).join('')}</div>`).join('') || DM.empty('clipboard', 'No orders', '')}</div></div>`;
  }

  DM.page('/orders', { title: 'Orders', crumb: 'Orders', render: DM.ordersScreen('confirmed') });
  DM.page('/orders/parent', { title: 'Parent orders', crumb: 'Parent orders', render: parent });
  DM.page('/orders/:id', { title: 'Order', crumb: (p) => p.id, render: detail });
  DM.pages[DM.pages.length - 1].re = /^\/orders\/(?!drafts|rfqs|parent)([^/]+)\/?$/; // keep sibling routes owned by other files reachable
  DM.searchProviders.push((q) => (DM.S.orders || []).filter((o) => (o.no + pn(o.partyId)).toLowerCase().includes(q)).slice(0, 5).map((o) => ({ label: o.no + ' · ' + pn(o.partyId), sub: 'Order', icon: 'clipboard', url: '/orders/' + o.id })));
})();
