/* Fulfilment / shipping — board + table, tracking drawer, create shipment. Port of app-v2/fulfilment. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'fulfilment';
  st.textContent = `
  .ff-alerts{display:flex;gap:10px;overflow:auto;margin-bottom:16px}
  .ff-alert{display:flex;gap:10px;align-items:center;border:1px solid #f1dca7;background:var(--warning-tint);border-radius:10px;padding:9px 12px;font-size:12px;flex:none;cursor:pointer;transition:transform .14s}.ff-alert:hover{transform:translateY(-1px)}
  .ff-alert.red{border-color:#f5c2bd;background:var(--destructive-tint)}
  .ff-board{display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:12px;align-items:start;overflow:auto}
  .ff-tl{position:relative;padding-left:22px}.ff-tl:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--border)}
  .ff-tl .ev{position:relative;padding-bottom:14px}.ff-tl .ev:before{content:"";position:absolute;left:-21px;top:3px;width:12px;height:12px;border-radius:50%;background:var(--success);border:2px solid var(--success)}
  .ff-tl .ev:first-child:before{box-shadow:0 0 0 4px rgba(19,162,105,.18)}
  .kcard{transition:transform .15s,border-color .15s,box-shadow .15s}.kcard:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
  .kcard.row-new{animation:anuma-rise .35s cubic-bezier(.22,.8,.24,1) both,row-flash 1.8s ease both}
  .ff-prog{height:3px;border-radius:2px;background:var(--muted);margin-top:8px;overflow:hidden}.ff-prog i{display:block;height:100%;background:var(--chart-2);transition:width .6s cubic-bezier(.22,.8,.24,1)}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.fulfilment = DM.ui.fulfilment || { view: 'board', q: '', carrier: 'all', hid: [], tab: 'overview', open: null });
  const COLS_B = [['pending', 'Ready to ship', ''], ['pickup', 'Awaiting pickup', 'amber'], ['in_transit', 'In transit', 'blue'], ['delivered', 'Delivered', 'green']];
  const SB = { pending: ['Ready to ship', ''], pickup: ['Awaiting pickup', 'amber'], in_transit: ['In transit', 'blue'], delivered: ['Delivered', 'green'], rto: ['Returned (RTO)', 'red'] };
  const order = (id) => DM.by(DM.S.orders || [], id);
  const pn = (s) => { const o = order(s.orderId); return o ? (DM.by(DM.S.parties || [], o.partyId) || {}).name || '—' : '—'; };
  const sb = (s) => { const [l, t] = SB[s] || [s, 'grey']; return DM.status(l, t || 'grey'); };
  const caseOf = (s) => { const o = order(s.orderId); const t = o && o.threadId && DM.by(DM.S.threads || [], o.threadId); return t || null; };
  const get = (id) => DM.by(DM.S.shipments || [], id);
  const late = (s) => !['delivered', 'rto'].includes(s.status) && s.eta && new Date(s.eta) < new Date('2026-10-27');

  const COLS = () => [
    { id: 'id', label: 'Shipment', w: '130px', render: (s) => DM.mono(s.id) },
    { id: 'order', label: 'Order', w: '130px', render: (s) => DM.mono((order(s.orderId) || {}).no || s.orderId) },
    { id: 'party', label: 'Party', flex: 2, render: (s) => `<span class="b">${esc(pn(s))}</span>` },
    { id: 'carrier', label: 'Carrier', w: '120px', render: (s) => esc(s.carrier) },
    { id: 'awb', label: 'AWB', w: '150px', render: (s) => `<span class="mono xs">${esc(s.awb)}</span>` },
    { id: 'route', label: 'Route', flex: 2, render: (s) => `${esc(s.from)} → ${esc(s.to)}` },
    { id: 'eta', label: 'ETA', w: '110px', render: (s) => `<span class="${late(s) ? 'down' : ''}">${fmt.date(s.eta)}</span>` },
    { id: 'status', label: 'Status', w: '150px', render: (s) => sb(s.status) },
  ];
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
    const PROG = { pending: 10, pickup: 35, in_transit: 70, delivered: 100, rto: 100 };
    const card = (s) => { const o = order(s.orderId) || {}; return `<div class="kcard" data-rid="${s.id}:${s.status}" data-act="ff-open" data-arg="${s.id}"><div class="row">${DM.mono(o.no || s.orderId)}${late(s) ? '<span class="badge red right">Delayed</span>' : ''}</div><div class="sm b trunc" style="margin:6px 0 2px">${esc(pn(s))}</div><div class="xs muted">${esc(s.carrier)} · <span class="mono">${esc(s.awb)}</span></div><div class="row xs muted" style="margin-top:6px">${I('map')}<span class="trunc">${esc(s.from)} → ${esc(s.to)}</span></div><div class="xs muted" style="margin-top:4px">ETA ${fmt.date(s.eta)}</div><div class="ff-prog"><i style="width:${PROG[s.status] || 0}%"></i></div></div>`; };
    const cols = COLS().filter((c) => !U.hid.includes(c.id));
    const flash = DM.changedRows('ship', all, (s) => s.status + '|' + (s.events || []).length);
    const exc = delayed.length + rto.length;
    const table = U.view === 'table';
    return `<div class="page wide">
      ${DM.header('Fulfilment', 'Track every shipment from warehouse to party.', `${DM.btn('Create shipment', 'ff-new', { icon: 'plus' })}`)}
      <div class="grid g4 stagger" style="margin-bottom:14px">
        ${DM.statCard('Ready to ship', DM.cnt(all.filter((s) => s.status === 'pending').length + unshipped.length), 'orders waiting', 'package')}
        ${DM.statCard('In transit', DM.cnt(all.filter((s) => ['pickup', 'in_transit'].includes(s.status)).length), 'with carriers', 'truck')}
        ${DM.statCard('Delivered', DM.cnt(all.filter((s) => s.status === 'delivered').length), 'this month', 'check', { tone: 'up' })}
        ${DM.statCard('Exceptions', DM.cnt(exc), exc ? 'delayed or returned' : 'None right now', 'alert', { tone: exc ? 'down' : 'up' })}
      </div>
      ${alerts.length ? `<div class="ff-alerts">${alerts.join('')}</div>` : ''}
      ${DM.toolbar(`<button class="btn outline sm" data-act="ff-carriers">${I('truck')} ${U.carrier === 'all' ? 'All carriers' : esc(U.carrier)} ${I('chevD')}</button>${DM.seg([{ key: 'board', label: 'Board' }, { key: 'table', label: 'Table' }], U.view, 'ff-view')}`,
        `${table ? `<button class="btn outline sm" data-act="ff-cols">${I('columns')} Columns${U.hid.length ? ' · ' + U.hid.length + ' off' : ''}</button>` : ''}${DM.searchBox('ff-q', 'Search AWB, order, party…', U.q)}`)}
      ${!rows.length ? DM.empty('truck', 'No shipments match', 'Try another carrier or clear the search.')
        : table ? DM.table(cols, rows, { click: 'ff-open', pageSize: 50, offset: 372, rowCls: (r) => (flash.has(r.id) ? 'row-new' : '') })
        : `<div class="ff-board">${COLS_B.map(([k, l, t]) => { const cs = rows.filter((s) => s.status === k); return `<div class="kcol"><div class="row" style="padding:2px 4px"><span class="b sm">${l}</span><span class="cnt-chip right">${cs.length}</span></div>${cs.map(card).join('') || '<div class="empty xs" style="padding:20px 0">Nothing here</div>'}</div>`; }).join('')}</div>`}
      <div class="xs muted" style="margin-top:8px">${rows.length} shipments in view</div>
    </div>`;
  }
  DM.act('ff-carriers', (el) => { const cs = [...new Set((DM.S.shipments || []).map((s) => s.carrier))]; DM.menu(el, [{ label: 'All carriers', icon: U.carrier === 'all' ? 'check' : null, run: () => { U.carrier = 'all'; DM.render(); } }, ...cs.map((c) => ({ label: c, icon: U.carrier === c ? 'check' : null, run: () => { U.carrier = c; DM.render(); } }))]); });
  DM.act('ff-cols', (el) => DM.colsMenu(el, COLS(), U.hid, () => DM.render()));
  DM.act('ff-view', (el) => { U.view = el.dataset.arg; DM.render(); });
  DM.input('ff-q', (v) => { U.q = v; DM.render(); });

  DM.act('ff-open', (el) => { U.tab = 'overview'; openDrawer(el.dataset.arg); });
  function openDrawer(id) {
    const s = get(id); if (!s) return; U.open = id; const o = order(s.orderId) || {}; const th = caseOf(s);
    const next = { pending: 'pickup', pickup: 'in_transit', in_transit: 'delivered' }[s.status];
    const events = (s.events || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
    const body = U.tab === 'overview'
      ? `<div class="grid g3">${DM.statCard('Status', SB[s.status] ? SB[s.status][0] : s.status, s.carrier, 'truck')}${DM.statCard('ETA', fmt.date(s.eta), late(s) ? 'Past due' : 'On schedule', 'calendar', { tone: late(s) ? 'down' : '' })}${DM.statCard('Order value', fmt.inr(o.total), (o.lines || []).length + ' lines', 'rupee')}</div>
        <div class="sect">Shipment</div><div class="card pad"><dl class="kv"><dt>Order</dt><dd><a class="b" href="#/orders/${esc(s.orderId)}">${esc(o.no || s.orderId)}</a></dd><dt>Party</dt><dd>${esc(pn(s))}</dd><dt>Carrier</dt><dd>${esc(s.carrier)}</dd><dt>AWB</dt><dd class="mono">${esc(s.awb)}</dd><dt>Route</dt><dd>${esc(s.from)} → ${esc(s.to)}</dd>${th ? `<dt>Case</dt><dd><a class="monotag" href="#/inbox/threads?case=${esc(th.id)}">${esc(DM.caseNo(th))}</a></dd>` : ''}</dl></div>`
      : `<div class="ff-tl">${events.map((e) => `<div class="ev"><div class="sm b">${esc(e.text)}</div><div class="xs muted">${fmt.dt(e.at)}</div></div>`).join('') || '<div class="muted sm">No events yet.</div>'}</div>`;
    DM.sheet('ship:' + id, {
      title: `<div class="row">${DM.mono(s.id)}<span class="${DM.popIf('shst:' + s.id, s.status)}">${sb(s.status)}</span></div><div class="sm muted" style="margin-top:4px">${esc(pn(s))}</div>`,
      tabs: [{ key: 'overview', label: 'Overview' }, { key: 'tracking', label: 'Tracking', count: events.length }], tab: U.tab, body,
      footer: `${next ? DM.btn('Mark ' + SB[next][0].toLowerCase(), 'ff-advance', { arg: s.id, icon: 'arrowR', cls: 'sm' }) : ''}${s.status !== 'delivered' && s.status !== 'rto' ? DM.btn('Mark RTO', 'ff-rto', { arg: s.id, cls: 'outline sm' }) : ''}${DM.btn('Copy AWB', 'toast', { arg: 'AWB copied', cls: 'ghost sm', icon: 'copy' })}`,
    });
  }
  DM.sheetTab = ((prev) => (kind, t) => { if (kind === 'ship') { U.tab = t; openDrawer(U.open); } else if (prev) prev(kind, t); })(DM.sheetTab);
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

    const render = () => page();
  DM.page('/fulfilment', { title: 'Fulfilment', crumb: 'Fulfilment', render, after: (v, { q }) => { const s = q.get('s'); if (s && get(s) && !document.getElementById('drawer-wrap')) openDrawer(s); } });
  DM.page('/shipping', { title: 'Shipping', crumb: 'Shipping', render });
})();
