/* Orders — list, ERP sync log, detail with ERP sync panel (Tally / Coralio). Port of app-v2/orders. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'orders';
  st.textContent = `
  .ord-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start}
  @media(max-width:1180px){.ord-grid{grid-template-columns:1fr}}
  .ord-code{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:12px 14px;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;overflow:auto;max-height:300px;white-space:pre}
  .ord-code .k{color:#93c5fd}.ord-code .s{color:#86efac}.ord-code .n{color:#fbbf24}.ord-code .b{color:#f0abfc}
  .ord-erp{border-width:1.5px}.ord-erp.synced{border-color:#b7e4cf}.ord-erp.failed{border-color:#f5c2bd}.ord-erp.pending{border-color:#f1dca7}
  .ord-erp-h{display:flex;gap:10px;align-items:center;padding:12px 16px}
  .ord-erp-ic{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:#fff;font-weight:700}
  .ord-tl{position:relative;padding-left:22px}.ord-tl:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--border)}
  .ord-tl .ev{position:relative;padding:0 0 14px}.ord-tl .ev:before{content:"";position:absolute;left:-21px;top:3px;width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid var(--border)}
  .ord-tl .ev.done:before{background:var(--success);border-color:var(--success)}
  .ord-err{background:var(--destructive-tint);color:#b42318;border-radius:9px;padding:9px 12px;font-size:12.5px}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.orders = DM.ui.orders || { tab: 'orders', q: '', status: 'all', pay: 'all', erp: 'all', sel: {}, json: 'request', logSel: null });
  const FLOW = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];
  const STATUS = { confirmed: ['Confirmed', 'blue'], processing: ['Processing', 'amber'], packed: ['Packed', 'violet'], shipped: ['Shipped', 'blue'], delivered: ['Delivered', 'green'], cancelled: ['Cancelled', 'red'] };
  const ERPS = { sync: ['Synced', 'green'], synced: ['Synced', 'green'], pending: ['Pending', 'amber'], failed: ['Failed', 'red'] };
  const pn = (id) => (DM.by(DM.S.parties || [], id) || {}).name || '—';
  const sbadge = (s) => { const [l, t] = STATUS[s] || [s, '']; return DM.badge(l, t, true); };
  const ebadge = (e) => e ? DM.badge(`${e.system} · ${(ERPS[e.state] || [e.state])[0]}`, (ERPS[e.state] || [0, ''])[1], true) : DM.badge('Not synced', '', false);
  const get = (id) => DM.by(DM.S.orders || [], id);

  /* ERP system for this use case: from orders / erpLog / connected apps */
  DM.erpSystem = () => {
    const o = (DM.S.orders || []).find((x) => x.erp); if (o) return o.erp.system;
    const l = (DM.S.erpLog || [])[0]; if (l) return l.system;
    const a = (DM.S.apps || []).find((x) => ['tally', 'coralio'].includes(x.slug) && x.state === 'connected'); return a ? a.name : 'Tally';
  };
  const sysColor = (s) => (/coralio/i.test(s) ? '#0d9488' : '#1d4ed8');
  const endpointFor = (sys, o) => /coralio/i.test(sys) ? { method: 'POST', endpoint: 'https://api.coralio.in/v2/sales-orders' } : { method: 'POST', endpoint: 'http://tally-gateway.local:9000/vouchers/sales' };
  const lineOf = (o) => (o.lines || []).map((l) => ({ item: l.name, qty: l.qty, unit: l.unit, rate: l.price, amount: l.qty * l.price }));
  const payloadFor = (sys, o) => /coralio/i.test(sys)
    ? { externalRef: o.no, party: pn(o.partyId), orderDate: String(o.placedAt).slice(0, 10), lines: lineOf(o), total: o.total, source: 'anuma' }
    : { voucherType: 'Sales Order', voucherNumber: o.no, partyLedger: pn(o.partyId), date: String(o.placedAt).slice(0, 10).replace(/-/g, ''), inventoryEntries: lineOf(o), amount: o.total };

  /* ── actions that mutate ── */
  function syncOrder(o, ok = true) {
    const sys = (o.erp && o.erp.system) || DM.erpSystem(); const ep = endpointFor(sys, o);
    const ref = (o.erp && o.erp.ref) || (/coralio/i.test(sys) ? 'CRL-SO-' : 'TLY-SV-') + (40000 + Math.floor(Math.random() * 9000));
    o.erp = { system: sys, ref, state: ok ? 'synced' : 'failed', at: new Date().toISOString() };
    const log = DM.S.erpLog = DM.S.erpLog || [];
    const prev = log.find((l) => l.orderId === o.id);
    const entry = { id: prev ? prev.id : DM.uid('erp'), orderId: o.id, system: sys, direction: 'out', endpoint: ep.endpoint, method: ep.method, status: ok ? 200 : 500, ref, at: o.erp.at, request: payloadFor(sys, o), response: ok ? { status: 'ok', reference: ref, message: 'Order recorded' } : { status: 'error', message: 'Upstream timeout' }, state: ok ? 'synced' : 'failed' };
    if (prev) Object.assign(prev, entry); else log.unshift(entry);
  }
  DM.act('ord-retry', (el) => { const o = get(el.dataset.arg); if (!o) return; if (o.erp) { o.erp.state = 'pending'; DM.render(); } setTimeout(() => { syncOrder(o); DM.toast(`${o.no} synced to ${o.erp.system}`); DM.render(); }, 700); });
  DM.act('ord-push', (el) => { const o = get(el.dataset.arg); o.erp = { system: DM.erpSystem(), state: 'pending', at: new Date().toISOString() }; DM.render(); setTimeout(() => { syncOrder(o); DM.toast(`${o.no} pushed to ${o.erp.system}`); DM.render(); }, 700); });
  DM.act('ord-json', (el) => { U.json = el.dataset.arg; DM.render(); });
  DM.act('ord-advance', (el) => { const o = get(el.dataset.arg); const i = FLOW.indexOf(o.status); if (i < FLOW.length - 1) { o.status = FLOW[i + 1]; DM.toast(`${o.no} → ${STATUS[o.status][0]}`); DM.render(); } });
  DM.act('ord-cancel', (el) => { const o = get(el.dataset.arg); DM.confirm('Cancel order?', `${esc(o.no)} will be cancelled.`, () => { o.status = 'cancelled'; DM.toast('Order cancelled'); DM.render(); }, 'Cancel order'); });
  DM.act('ord-pay', (el) => { const o = get(el.dataset.arg); o.payment = 'Paid'; DM.toast('Marked as paid'); DM.render(); });
  DM.act('ord-shipment', (el) => {
    const o = get(el.dataset.arg); const p = DM.by(DM.S.parties || [], o.partyId) || {};
    const sh = { id: 'SH-' + DM.uid('').slice(1), orderId: o.id, carrier: 'Delhivery', awb: 'DL' + Math.floor(1e9 + Math.random() * 9e9), status: 'pickup', eta: '2026-10-31', from: 'Warehouse', to: p.city || 'Customer', events: [{ at: new Date().toISOString(), text: 'Shipment created' }] };
    (DM.S.shipments = DM.S.shipments || []).unshift(sh); o.shipmentId = sh.id; if (FLOW.indexOf(o.status) < 3) o.status = 'shipped'; DM.toast('Shipment created · ' + sh.awb); DM.render();
  });
  DM.act('ord-tab', (el) => { U.tab = el.dataset.arg; DM.render(); });
  DM.input('ord-q', (v) => { U.q = v; DM.render(); });
  DM.input('ord-status', (v) => { U.status = v; DM.render(); });
  DM.input('ord-pay-f', (v) => { U.pay = v; DM.render(); });
  DM.input('ord-erp-f', (v) => { U.erp = v; DM.render(); });
  DM.act('ord-sel', (el, e) => { e.stopPropagation(); const id = el.dataset.arg; U.sel[id] ? delete U.sel[id] : (U.sel[id] = 1); DM.render(); });
  DM.act('ord-sel-all', (el) => { const ids = filtered().map((o) => o.id); const all = ids.every((i) => U.sel[i]); ids.forEach((i) => (all ? delete U.sel[i] : (U.sel[i] = 1))); DM.render(); });
  DM.act('ord-bulk-sync', () => { const ids = Object.keys(U.sel); let n = 0; ids.forEach((id) => { const o = get(id); if (o && (!o.erp || o.erp.state !== 'synced')) { syncOrder(o); n++; } }); U.sel = {}; DM.toast(n ? `${n} order(s) synced to ${DM.erpSystem()}` : 'Selected orders are already synced'); DM.render(); });
  DM.act('ord-bulk-clear', () => { U.sel = {}; DM.render(); });
  DM.act('ord-bulk-ship', () => { Object.keys(U.sel).forEach((id) => { const o = get(id); if (o && FLOW.indexOf(o.status) < 3 && o.status !== 'cancelled') o.status = 'packed'; }); DM.toast('Selected orders marked packed'); U.sel = {}; DM.render(); });
  DM.act('ord-export', () => DM.toast('Exported orders.csv (demo)', 'download'));
  DM.act('ord-newlog', (el) => { U.logSel = el.dataset.arg; DM.render(); });
  DM.act('ord-new', () => DM.modal({
    title: 'New order', body: `<div class="col">${DM.field('Customer', 'party', { options: (DM.S.parties || []).map((p) => p.name) })}${DM.field('Product', 'product', { options: (DM.S.products || []).map((p) => p.name) })}${DM.field('Quantity', 'qty', { type: 'number', value: 10 })}${DM.field('Payment', 'pay', { options: ['Credit', 'Paid', 'Pending'] })}</div>`,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create order', run: (m) => {
      const f = DM.formData(m); const p = DM.S.parties.find((x) => x.name === f.party); const pr = DM.S.products.find((x) => x.name === f.product); const qty = Math.max(1, +f.qty || 1);
      const n = Math.max(0, ...DM.S.orders.map((o) => parseInt(String(o.no).replace(/\D/g, ''), 10) || 0)) + 1;
      const o = { id: 'ORD-' + n, no: String(DM.S.orders[0] ? DM.S.orders[0].no : 'ORD-0').replace(/\d+$/, '') + n, partyId: p.id, status: 'confirmed', total: pr.price * qty, placedAt: new Date().toISOString(), channel: 'web', payment: f.pay, lines: [{ productId: pr.id, name: pr.name, qty, unit: pr.unit, price: pr.price }], erp: null };
      DM.S.orders.unshift(o); DM.toast('Order ' + o.no + ' created'); DM.go('/orders/' + o.id);
    } }],
  }));

  function filtered() {
    const q = U.q.toLowerCase();
    return (DM.S.orders || []).filter((o) => (U.status === 'all' || o.status === U.status) && (U.pay === 'all' || o.payment === U.pay)
      && (U.erp === 'all' || (U.erp === 'none' ? !o.erp : o.erp && o.erp.state === U.erp)) && (!q || (o.no + pn(o.partyId)).toLowerCase().includes(q)));
  }

  /* ── list ── */
  function list() {
    const all = DM.S.orders || []; const sys = DM.erpSystem(); const log = DM.S.erpLog || [];
    const rows = filtered();
    const awaiting = all.filter((o) => o.status !== 'cancelled' && (!o.erp || o.erp.state === 'pending')).length;
    const failed = all.filter((o) => o.erp && o.erp.state === 'failed').length;
    const selN = Object.keys(U.sel).length;
    const head = `${DM.header('Orders', `Confirmed orders across every channel, synced to ${esc(sys)}.`, `${DM.btn('Export', 'ord-export', { cls: 'outline', icon: 'download' })}${DM.btn('New order', 'ord-new', { icon: 'plus' })}`)}
      <div class="grid g4" style="margin-bottom:16px">
        ${DM.stat('Orders', all.length, `${all.filter((o) => FLOW.slice(0, 3).includes(o.status)).length} in progress`, { icon: 'clipboard' })}
        ${DM.stat('Order value', fmt.inrc(all.reduce((a, o) => a + (o.status === 'cancelled' ? 0 : o.total), 0)), 'excl. cancelled', { icon: 'rupee' })}
        ${DM.stat(`Awaiting ${esc(sys)} sync`, awaiting, awaiting ? 'will post automatically' : 'all caught up', { icon: 'refresh', tone: awaiting ? '' : 'up' })}
        ${DM.stat('Sync failures', failed, failed ? 'needs attention' : 'none', { icon: 'alert', tone: failed ? 'down' : 'up' })}
      </div>
      ${DM.tabs([{ key: 'orders', label: 'Orders', count: all.length }, { key: 'sync', label: `${sys} sync log`, count: log.length }], U.tab, 'ord-tab')}`;
    if (U.tab === 'sync') return `<div class="page">${head}${syncLog()}</div>`;
    const cols = [
      { label: '', w: '34px', render: (o) => `<span class="chk ${U.sel[o.id] ? 'on' : ''}" data-act="ord-sel" data-arg="${o.id}">${U.sel[o.id] ? I('check').replace('class="i "', 'class="i" style="width:11px;height:11px"') : ''}</span>` },
      { label: 'Order', render: (o) => `<span class="b">${esc(o.no)}</span>` },
      { label: 'Customer', render: (o) => `<div class="row">${DM.avatar(pn(o.partyId), 'sm')}<span class="trunc">${esc(pn(o.partyId))}</span></div>` },
      { label: 'Placed', render: (o) => fmt.date(o.placedAt) },
      { label: 'Channel', render: (o) => `<span class="badge outline">${esc(o.channel || '—')}</span>` },
      { label: 'Items', num: true, render: (o) => (o.lines || []).length },
      { label: 'Total', num: true, render: (o) => fmt.inr(o.total) },
      { label: 'Payment', render: (o) => DM.badge(o.payment, o.payment === 'Paid' ? 'green' : o.payment === 'Credit' ? 'blue' : 'amber') },
      { label: 'Status', render: (o) => sbadge(o.status) },
      { label: sys, render: (o) => ebadge(o.erp) },
    ];
    return `<div class="page">${head}
      <div class="row wrap" style="margin-bottom:12px">${DM.searchBox('ord-q', 'Search orders or customers…', U.q)}
        <select class="select" style="width:150px" data-change="ord-status"><option value="all">All statuses</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${U.status === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>
        <select class="select" style="width:140px" data-change="ord-pay-f"><option value="all">Any payment</option>${['Paid', 'Credit', 'Pending'].map((p) => `<option ${U.pay === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
        <select class="select" style="width:160px" data-change="ord-erp-f"><option value="all">Any ${esc(sys)} state</option><option value="synced" ${U.erp === 'synced' ? 'selected' : ''}>Synced</option><option value="pending" ${U.erp === 'pending' ? 'selected' : ''}>Pending</option><option value="failed" ${U.erp === 'failed' ? 'selected' : ''}>Failed</option><option value="none" ${U.erp === 'none' ? 'selected' : ''}>Not synced</option></select>
        ${DM.btn(rows.length && rows.every((o) => U.sel[o.id]) ? 'Deselect all' : 'Select all', 'ord-sel-all', { cls: 'ghost sm' })}<span class="muted sm right">${rows.length} orders</span></div>
      ${selN ? `<div class="row card" style="padding:8px 14px;margin-bottom:10px;background:var(--muted)"><b class="sm">${selN} selected</b>${DM.btn(`Sync to ${esc(sys)}`, 'ord-bulk-sync', { cls: 'sm', icon: 'refresh' })}${DM.btn('Mark packed', 'ord-bulk-ship', { cls: 'outline sm', icon: 'package' })}${DM.btn('Clear', 'ord-bulk-clear', { cls: 'ghost sm' })}</div>` : ''}
      ${DM.table(cols, rows, { go: (o) => '/orders/' + o.id, empty: 'No orders match these filters.' })}</div>`;
  }

  function syncLog() {
    const log = DM.S.erpLog || []; if (!log.length) return `<div class="tblwrap"><div class="empty">No sync activity yet. Confirmed orders post here automatically.</div></div>`;
    const sel = log.find((l) => l.id === U.logSel) || log[0];
    const cols = [
      { label: 'Time', render: (l) => fmt.dt(l.at) },
      { label: 'Order', render: (l) => { const o = get(l.orderId); return `<a class="b" href="#/orders/${esc(l.orderId)}" onclick="event.stopPropagation()">${esc(o ? o.no : l.orderId)}</a>`; } },
      { label: 'Request', render: (l) => `<span class="mono xs"><b>${esc(l.method || 'POST')}</b> ${esc(String(l.endpoint || '').replace(/^https?:\/\//, ''))}</span>` },
      { label: 'HTTP', render: (l) => DM.badge(String(l.status), l.status < 300 ? 'green' : l.status < 500 ? 'amber' : 'red') },
      { label: 'Reference', render: (l) => `<span class="mono xs">${esc(l.ref || '—')}</span>` },
      { label: 'State', render: (l) => DM.badge((ERPS[l.state] || [l.state])[0], (ERPS[l.state] || [0, ''])[1], true) },
    ];
    return `<div class="ord-grid" style="grid-template-columns:minmax(0,1fr) 400px">${DM.table(cols, log, { click: 'ord-newlog', rowCls: (l) => (l.id === sel.id ? 'hl' : '') })}
      <div class="card"><div class="card-h"><h3 class="grow">${esc(sel.method || 'POST')} ${esc(String(sel.endpoint || '').replace(/^https?:\/\//, ''))}</h3>${DM.badge(String(sel.status), sel.status < 300 ? 'green' : 'red')}</div><div style="padding:12px 16px">${jsonTabs(sel)}${sel.state === 'failed' ? `<div style="margin-top:10px">${DM.btn('Retry sync', 'ord-retry', { arg: sel.orderId, icon: 'refresh', cls: 'sm' })}</div>` : ''}</div></div></div>`;
  }

  /* JSON viewer */
  const hl = (o) => esc(JSON.stringify(o, null, 2)).replace(/(&quot;[^&]*?&quot;)(\s*:)?|\b(-?\d+(\.\d+)?)\b|\b(true|false|null)\b/g, (m, s, c, n, _d, b) => s ? (c ? `<span class="k">${s}</span>${c}` : `<span class="s">${s}</span>`) : n ? `<span class="n">${n}</span>` : `<span class="b">${b}</span>`);
  function jsonTabs(l) {
    return `<div class="pills" style="margin-bottom:10px">${['request', 'response'].map((k) => `<button class="pill ${U.json === k ? 'on' : ''}" data-act="ord-json" data-arg="${k}">${k === 'request' ? 'Request' : 'Response'}</button>`).join('')}</div>
      <div class="ord-code">${hl(l[U.json] || {})}</div><div class="row xs muted" style="margin-top:8px">${I('copy')}<button data-act="toast" data-arg="Copied JSON to clipboard">Copy JSON</button></div>`;
  }

  /* ── detail ── */
  function erpPanel(o) {
    const sys = (o.erp && o.erp.system) || DM.erpSystem(); const e = o.erp; const log = (DM.S.erpLog || []).find((l) => l.orderId === o.id);
    if (!e) return `<div class="card ord-erp pending"><div class="ord-erp-h"><div class="ord-erp-ic" style="background:${sysColor(sys)}">${esc(sys[0])}</div><div class="grow"><div class="b">${esc(sys)}</div><div class="xs muted">Not pushed yet</div></div>${DM.badge('Not synced')}</div><div style="padding:0 16px 14px"><p class="sm muted" style="margin-bottom:10px">This order hasn’t been posted to ${esc(sys)}. Post it now to create the ${/coralio/i.test(sys) ? 'sales order' : 'sales voucher'}.</p>${DM.btn(`Push to ${esc(sys)}`, 'ord-push', { arg: o.id, icon: 'upload' })}</div></div>`;
    const ep = log ? { method: log.method, endpoint: log.endpoint } : endpointFor(sys, o);
    const req = log ? log.request : payloadFor(sys, o); const res = log ? log.response : null;
    return `<div class="card ord-erp ${e.state}"><div class="ord-erp-h"><div class="ord-erp-ic" style="background:${sysColor(sys)}">${esc(sys[0])}</div><div class="grow"><div class="b">${esc(sys)} sync</div><div class="xs muted">${e.at ? 'Last attempt ' + fmt.dt(e.at) : ''}</div></div>${ebadge(e).replace(esc(sys) + ' · ', '')}</div>
      <div style="padding:0 16px 16px" class="col">
        <dl class="kv" style="grid-template-columns:90px 1fr"><dt>Reference</dt><dd class="mono">${esc(e.ref || '—')}</dd><dt>Endpoint</dt><dd class="mono xs" style="word-break:break-all"><b>${esc(ep.method)}</b> ${esc(ep.endpoint)}</dd><dt>HTTP</dt><dd>${log ? DM.badge(String(log.status), log.status < 300 ? 'green' : 'red') : '—'}</dd></dl>
        ${e.state === 'failed' ? `<div class="ord-err"><b>Sync failed.</b> ${esc(e.error || (res && res.message) || 'The server did not respond in time.')}</div>` : ''}
        ${e.state === 'pending' ? `<div class="row sm muted">${I('refresh')} Waiting for ${esc(sys)} to acknowledge…</div>` : ''}
        ${jsonTabs({ request: req, response: res || { status: 'pending' } })}
        ${e.state !== 'synced' ? DM.btn(e.state === 'failed' ? 'Retry sync' : 'Sync now', 'ord-retry', { arg: o.id, icon: 'refresh' }) : DM.btn('Re-sync', 'ord-retry', { arg: o.id, icon: 'refresh', cls: 'outline' })}
      </div></div>`;
  }
  function detail({ params }) {
    const o = get(params.id);
    if (!o) return `<div class="page"><div class="empty"><h3>Order not found</h3><p style="margin-top:12px"><a class="btn outline" href="#/orders">Back to orders</a></p></div></div>`;
    const p = DM.by(DM.S.parties || [], o.partyId) || {}; const sh = o.shipmentId && DM.by(DM.S.shipments || [], o.shipmentId);
    const i = FLOW.indexOf(o.status); const cancelled = o.status === 'cancelled';
    const sub = (o.lines || []).reduce((a, l) => a + l.qty * l.price, 0); const gst = Math.round((o.total - sub) > 0 ? o.total - sub : sub * 0.18);
    const ev = [['Order placed', o.placedAt, true], ...FLOW.slice(1).map((s, k) => [STATUS[s][0], null, i >= k + 1])];
    const acts = `${o.threadId ? DM.btn('Open chat', '', { cls: 'outline', go: '/inbox/threads?case=' + o.threadId, icon: 'chat' }) : ''}
      ${!cancelled && i < FLOW.length - 1 ? DM.btn('Mark ' + STATUS[FLOW[i + 1]][0].toLowerCase(), 'ord-advance', { arg: o.id, icon: 'arrowR' }) : ''}
      ${!cancelled && o.status !== 'delivered' ? DM.btn('Cancel', 'ord-cancel', { arg: o.id, cls: 'outline' }) : ''}`;
    return `<div class="page"><div class="row sm muted" style="margin-bottom:8px"><a href="#/orders" class="row">${I('chevL')} Orders</a></div>
      ${DM.header(`${esc(o.no)} ${sbadge(o.status)} ${ebadge(o.erp)}`, `${esc(pn(o.partyId))} · placed ${fmt.dt(o.placedAt)} via ${esc(o.channel || '—')}`, acts)}
      <div class="ord-grid"><div class="col" style="gap:16px">
        <div class="card"><div class="card-h"><h3 class="grow">Items</h3><span class="muted sm">${(o.lines || []).length} lines</span></div>
          <div style="overflow:auto"><table class="tbl"><thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${(o.lines || []).map((l) => `<tr><td><div class="b sm">${esc(l.name)}</div><div class="xs muted">${esc((DM.by(DM.S.products || [], l.productId) || {}).sku || '')}</div></td><td class="num mono">${l.qty} ${esc(l.unit || '')}</td><td class="num mono">${fmt.inr(l.price)}</td><td class="num mono">${fmt.inr(l.qty * l.price)}</td></tr>`).join('')}</tbody></table></div>
          <div class="col" style="padding:12px 16px;border-top:1px solid var(--border);align-items:flex-end;gap:3px"><div class="row sm"><span class="muted" style="width:90px">Subtotal</span><span class="mono">${fmt.inr(sub)}</span></div><div class="row sm"><span class="muted" style="width:90px">GST</span><span class="mono">${fmt.inr(gst)}</span></div><div class="row b" style="font-size:15px"><span style="width:90px">Total</span><span class="mono">${fmt.inr(o.total)}</span></div></div></div>
        <div class="card pad"><h3 style="margin-bottom:12px">Timeline</h3>${cancelled ? `<div class="ord-err">Order cancelled.</div>` : `<div class="ord-tl">${ev.map((e) => `<div class="ev ${e[2] ? 'done' : ''}"><div class="sm ${e[2] ? 'b' : 'muted'}">${esc(e[0])}</div>${e[1] ? `<div class="xs muted">${fmt.dt(e[1])}</div>` : ''}</div>`).join('')}</div>`}</div>
      </div><div class="col" style="gap:16px">
        ${erpPanel(o)}
        <div class="card pad"><h3 style="margin-bottom:10px">Customer</h3><div class="row" style="margin-bottom:10px">${DM.avatar(p.name || '?', 'lg')}<div><a class="b" href="#/crm/accounts/${esc(o.partyId)}">${esc(p.name || '—')}</a><div class="xs muted">${esc(p.city || '')} · ${esc(p.terms || '')}</div></div></div><dl class="kv" style="grid-template-columns:90px 1fr"><dt>GSTIN</dt><dd class="mono xs">${esc(p.gstin || '—')}</dd><dt>Phone</dt><dd>${esc(p.phone || '—')}</dd></dl></div>
        <div class="card pad"><h3 style="margin-bottom:10px">Payment</h3><div class="row">${DM.badge(o.payment, o.payment === 'Paid' ? 'green' : o.payment === 'Credit' ? 'blue' : 'amber', true)}<span class="right b mono">${fmt.inr(o.total)}</span></div>${o.payment !== 'Paid' ? `<div style="margin-top:10px">${DM.btn('Mark as paid', 'ord-pay', { arg: o.id, cls: 'outline sm', icon: 'check' })}</div>` : ''}</div>
        <div class="card pad"><h3 style="margin-bottom:10px">Shipment</h3>${sh ? `<div class="sm"><b>${esc(sh.carrier)}</b> · <span class="mono">${esc(sh.awb)}</span></div><div class="row" style="margin:6px 0">${DM.badge(sh.status.replace('_', ' '), sh.status === 'delivered' ? 'green' : 'blue', true)}<span class="xs muted">ETA ${fmt.date(sh.eta)}</span></div>${DM.btn('Track', '', { go: '/fulfilment?s=' + sh.id, cls: 'outline sm', icon: 'truck' })}` : `<p class="sm muted" style="margin-bottom:10px">No shipment yet.</p>${cancelled ? '' : DM.btn('Create shipment', 'ord-shipment', { arg: o.id, cls: 'outline sm', icon: 'truck' })}`}</div>
      </div></div></div>`;
  }

  function parent() {
    const by = {}; (DM.S.orders || []).forEach((o) => { (by[o.partyId] = by[o.partyId] || []).push(o); });
    return `<div class="page">${DM.header('Parent orders', 'Orders grouped by customer account.', DM.btn('All orders', '', { cls: 'outline', go: '/orders' }))}
      <div class="col" style="gap:12px">${Object.entries(by).map(([pid, os]) => `<div class="card"><div class="card-h">${DM.avatar(pn(pid), 'sm')}<a class="b grow" href="#/crm/accounts/${esc(pid)}">${esc(pn(pid))}</a><span class="muted sm">${os.length} orders · <b class="mono">${fmt.inr(os.reduce((a, o) => a + o.total, 0))}</b></span></div>${os.slice(0, 5).map((o) => `<div class="listrow" data-go="/orders/${o.id}"><span class="b sm" style="width:110px">${esc(o.no)}</span><span class="grow muted sm">${fmt.date(o.placedAt)}</span>${sbadge(o.status)}<span class="mono sm" style="width:90px;text-align:right">${fmt.inr(o.total)}</span></div>`).join('')}</div>`).join('') || '<div class="empty">No orders.</div>'}</div></div>`;
  }

  DM.page('/orders', { title: 'Orders', render: list });
  DM.page('/orders/parent', { title: 'Parent orders', render: parent });
  DM.page('/orders/:id', { title: 'Order', crumb: (p) => p.id, render: detail });
  DM.pages[DM.pages.length - 1].re = /^\/orders\/(?!drafts|rfqs|parent)([^/]+)\/?$/; // keep sibling routes owned by other files reachable
  DM.searchProviders.push((q) => (DM.S.orders || []).filter((o) => (o.no + pn(o.partyId)).toLowerCase().includes(q)).slice(0, 5).map((o) => ({ label: o.no + ' · ' + pn(o.partyId), sub: 'Order', icon: 'clipboard', url: '/orders/' + o.id })));
})();
