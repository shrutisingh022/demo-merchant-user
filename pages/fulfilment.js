/* Fulfilment / shipping — board + table, tracking drawer, create shipment. Port of app-v2/fulfilment. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'fulfilment';
  st.textContent = `
  .ff-alerts{display:flex;gap:10px;overflow:auto;margin-bottom:16px}
  .ff-alert{display:flex;gap:10px;align-items:center;border:1px solid #f1dca7;background:var(--warning-tint);border-radius:10px;padding:9px 12px;font-size:13px;flex:none;cursor:pointer}
  .ff-alert.red{border-color:#f5c2bd;background:var(--destructive-tint)}
  .ff-board{display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:12px;align-items:start;overflow:auto}
  .ff-tl{position:relative;padding-left:22px}.ff-tl:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--border)}
  .ff-tl .ev{position:relative;padding-bottom:14px}.ff-tl .ev:before{content:"";position:absolute;left:-21px;top:3px;width:12px;height:12px;border-radius:50%;background:var(--success);border:2px solid var(--success)}
  .ff-tl .ev:first-child:before{box-shadow:0 0 0 4px rgba(19,162,105,.18)}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.fulfilment = DM.ui.fulfilment || { view: 'board', q: '', carrier: 'all' });
  const COLS = [['pending', 'Ready to ship', ''], ['pickup', 'Awaiting pickup', 'amber'], ['in_transit', 'In transit', 'blue'], ['delivered', 'Delivered', 'green']];
  const SB = { pending: ['Ready to ship', ''], pickup: ['Awaiting pickup', 'amber'], in_transit: ['In transit', 'blue'], delivered: ['Delivered', 'green'], rto: ['Returned (RTO)', 'red'] };
  const order = (id) => DM.by(DM.S.orders || [], id);
  const pn = (s) => { const o = order(s.orderId); return o ? (DM.by(DM.S.parties || [], o.partyId) || {}).name || '—' : '—'; };
  const sb = (s) => { const [l, t] = SB[s] || [s, '']; return DM.badge(l, t, true); };
  const get = (id) => DM.by(DM.S.shipments || [], id);
  const late = (s) => !['delivered', 'rto'].includes(s.status) && s.eta && new Date(s.eta) < new Date('2026-10-27');

  function page() {
    const all = DM.S.shipments || []; const q = U.q.toLowerCase();
    const carriers = [...new Set(all.map((s) => s.carrier))];
    const rows = all.filter((s) => (U.carrier === 'all' || s.carrier === U.carrier) && (!q || (s.awb + s.id + pn(s) + ((order(s.orderId) || {}).no || '')).toLowerCase().includes(q)));
    const delayed = all.filter(late); const rto = all.filter((s) => s.status === 'rto');
    const unshipped = (DM.S.orders || []).filter((o) => !o.shipmentId && ['confirmed', 'processing', 'packed'].includes(o.status));
    const alerts = [
      ...delayed.map((s) => `<div class="ff-alert" data-act="ff-open" data-arg="${s.id}">${I('clock')}<span><b>${esc(s.awb)}</b> is past its ETA (${fmt.date(s.eta)}) — ${esc(pn(s))}</span></div>`),
      ...rto.map((s) => `<div class="ff-alert red" data-act="ff-open" data-arg="${s.id}">${I('alert')}<span><b>${esc(s.awb)}</b> is returning to origin — ${esc(pn(s))}</span></div>`),
      ...(unshipped.length ? [`<div class="ff-alert" data-act="ff-new">${I('package')}<span><b>${unshipped.length} order${unshipped.length > 1 ? 's' : ''}</b> without a shipment</span></div>`] : []),
    ];
    const card = (s) => { const o = order(s.orderId) || {}; return `<div class="kcard" data-act="ff-open" data-arg="${s.id}"><div class="row"><span class="b sm">${esc(o.no || s.orderId)}</span>${late(s) ? '<span class="badge red right">Delayed</span>' : ''}</div><div class="sm trunc" style="margin:2px 0">${esc(pn(s))}</div><div class="xs muted">${esc(s.carrier)} · <span class="mono">${esc(s.awb)}</span></div><div class="row xs muted" style="margin-top:6px">${I('map')}<span class="trunc">${esc(s.from)} → ${esc(s.to)}</span></div><div class="xs muted" style="margin-top:4px">ETA ${fmt.date(s.eta)}</div></div>`; };
    const cols = [
      { label: 'Shipment', render: (s) => `<span class="b">${esc(s.id)}</span>` },
      { label: 'Order', render: (s) => esc((order(s.orderId) || {}).no || s.orderId) },
      { label: 'Customer', render: (s) => esc(pn(s)) },
      { label: 'Carrier', render: (s) => esc(s.carrier) },
      { label: 'AWB', render: (s) => `<span class="mono xs">${esc(s.awb)}</span>` },
      { label: 'Route', render: (s) => `${esc(s.from)} → ${esc(s.to)}` },
      { label: 'ETA', render: (s) => `<span class="${late(s) ? 'down' : ''}">${fmt.date(s.eta)}</span>` },
      { label: 'Status', render: (s) => sb(s.status) },
    ];
    return `<div class="page">
      ${DM.header('Fulfilment', 'Track every shipment from warehouse to customer.', `${DM.btn('Create shipment', 'ff-new', { icon: 'plus' })}`)}
      ${alerts.length ? `<div class="ff-alerts">${alerts.join('')}</div>` : ''}
      <div class="grid g4" style="margin-bottom:16px">
        ${DM.stat('Ready to ship', all.filter((s) => s.status === 'pending').length + unshipped.length, 'orders waiting', { icon: 'package' })}
        ${DM.stat('In transit', all.filter((s) => ['pickup', 'in_transit'].includes(s.status)).length, 'with carriers', { icon: 'truck' })}
        ${DM.stat('Delivered', all.filter((s) => s.status === 'delivered').length, 'this month', { icon: 'check', tone: 'up' })}
        ${DM.stat('Exceptions', delayed.length + rto.length, 'delayed or RTO', { icon: 'alert', tone: delayed.length + rto.length ? 'down' : 'up' })}
      </div>
      <div class="row wrap" style="margin-bottom:12px">${DM.pills([{ key: 'board', label: 'Board' }, { key: 'table', label: 'Table' }], U.view, 'ff-view')}${DM.searchBox('ff-q', 'Search AWB, order, customer…', U.q)}
        <select class="select" style="width:150px" data-change="ff-carrier"><option value="all">All carriers</option>${carriers.map((c) => `<option ${U.carrier === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><span class="muted sm right">${rows.length} shipments</span></div>
      ${U.view === 'board'
        ? `<div class="ff-board">${COLS.map(([k, l, t]) => { const cs = rows.filter((s) => s.status === k); return `<div class="kcol"><div class="row" style="padding:2px 4px"><span class="b sm">${l}</span><span class="badge ${t} right">${cs.length}</span></div>${cs.map(card).join('') || '<div class="empty xs" style="padding:20px 0">Nothing here</div>'}</div>`; }).join('')}</div>`
        : DM.table(cols, rows, { click: 'ff-open', empty: 'No shipments match.' })}
    </div>`;
  }
  DM.act('ff-view', (el) => { U.view = el.dataset.arg; DM.render(); });
  DM.input('ff-q', (v) => { U.q = v; DM.render(); });
  DM.input('ff-carrier', (v) => { U.carrier = v; DM.render(); });

  DM.act('ff-open', (el) => openDrawer(el.dataset.arg));
  function openDrawer(id) {
    const s = get(id); if (!s) return; const o = order(s.orderId) || {};
    const next = { pending: 'pickup', pickup: 'in_transit', in_transit: 'delivered' }[s.status];
    const events = (s.events || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
    DM.drawer({ title: `${esc(s.id)} ${sb(s.status)}`, body: `
      <dl class="kv" style="margin-bottom:16px"><dt>Order</dt><dd><a class="b" href="#/orders/${esc(s.orderId)}">${esc(o.no || s.orderId)}</a></dd><dt>Customer</dt><dd>${esc(pn(s))}</dd><dt>Carrier</dt><dd>${esc(s.carrier)}</dd><dt>AWB</dt><dd class="mono">${esc(s.awb)}</dd><dt>Route</dt><dd>${esc(s.from)} → ${esc(s.to)}</dd><dt>ETA</dt><dd class="${late(s) ? 'down' : ''}">${fmt.date(s.eta)}</dd></dl>
      <div class="row" style="margin-bottom:16px;flex-wrap:wrap">${next ? DM.btn('Mark ' + SB[next][0].toLowerCase(), 'ff-advance', { arg: s.id, icon: 'arrowR' }) : ''}${s.status !== 'delivered' && s.status !== 'rto' ? DM.btn('Mark RTO', 'ff-rto', { arg: s.id, cls: 'outline' }) : ''}${DM.btn('Copy AWB', 'toast', { arg: 'AWB copied', cls: 'outline', icon: 'copy' })}</div>
      <h3 style="margin-bottom:10px">Tracking</h3><div class="ff-tl">${events.map((e) => `<div class="ev"><div class="sm b">${esc(e.text)}</div><div class="xs muted">${fmt.dt(e.at)}</div></div>`).join('') || '<div class="muted sm">No events yet.</div>'}</div>` });
  }
  const advance = (id, to, text) => { const s = get(id); s.status = to; s.events = s.events || []; s.events.push({ at: new Date().toISOString(), text }); const o = order(s.orderId); if (o && to === 'in_transit' && o.status !== 'delivered') o.status = 'shipped'; if (o && to === 'delivered') o.status = 'delivered'; DM.render(); openDrawer(id); };
  DM.act('ff-advance', (el) => { const s = get(el.dataset.arg); const next = { pending: 'pickup', pickup: 'in_transit', in_transit: 'delivered' }[s.status]; advance(s.id, next, { pickup: 'Pickup scheduled', in_transit: 'Picked up — in transit', delivered: 'Delivered to customer' }[next]); DM.toast('Shipment ' + SB[next][0].toLowerCase()); });
  DM.act('ff-rto', (el) => { advance(el.dataset.arg, 'rto', 'Marked return to origin'); DM.toast('Marked RTO', 'alert'); });

  DM.act('ff-new', () => {
    const opts = (DM.S.orders || []).filter((o) => !o.shipmentId && o.status !== 'cancelled' && o.status !== 'delivered');
    if (!opts.length) return DM.toast('Every active order already has a shipment', 'info');
    DM.modal({ title: 'Create shipment', body: `<div class="col">${DM.field('Order', 'order', { options: opts.map((o) => `${o.no} — ${(DM.by(DM.S.parties, o.partyId) || {}).name}`) })}${DM.field('Carrier', 'carrier', { options: ['Delhivery', 'Blue Dart', 'DTDC', 'Xpressbees', 'Self-delivery'] })}${DM.field('AWB (optional)', 'awb', { ph: 'Auto-generated if empty' })}${DM.field('Expected delivery', 'eta', { type: 'date', value: '2026-10-31' })}</div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create shipment', run: (m) => {
        const f = DM.formData(m); const o = opts.find((x) => f.order.startsWith(x.no + ' ')); const p = DM.by(DM.S.parties, o.partyId) || {};
        const s = { id: 'SH-' + DM.uid('').slice(1).toUpperCase(), orderId: o.id, carrier: f.carrier, awb: f.awb || 'AWB' + Math.floor(1e9 + Math.random() * 9e9), status: 'pending', eta: f.eta, from: 'Warehouse', to: p.city || 'Customer', events: [{ at: new Date().toISOString(), text: 'Shipment created' }] };
        (DM.S.shipments = DM.S.shipments || []).unshift(s); o.shipmentId = s.id; if (['confirmed', 'processing'].includes(o.status)) o.status = 'packed'; DM.toast('Shipment ' + s.id + ' created'); DM.render(); openDrawer(s.id);
      } }] });
  });

  window.addEventListener('hashchange', () => DM.closeDrawer());
  const render = () => page();
  DM.page('/fulfilment', { title: 'Fulfilment', render, after: (v, { q }) => { const s = q.get('s'); if (s && get(s) && !document.getElementById('drawer-wrap')) openDrawer(s); } });
  DM.page('/shipping', { title: 'Shipping', render });
})();
