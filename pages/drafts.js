/* pages/drafts.js — `/orders/drafts` = NuHome "Orders" / Stuffcool "Draft Orders" (the same live screen, renamed per tenant).
   Header + period/Compare, 3 summary cards, toolbar (views, columns, search), AG Grid, and the 800px read-only record drawer (`/orders/drafts/:id`).
   Spec: docs/spec/orders-rfqs.md §1–2. Reads DM.S.drafts / parties / contacts / users / styles / threads. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, O = DM.orders;
  const S = () => DM.S;
  const css = document.createElement('style'); css.dataset.for = 'drafts';
  css.textContent = `
  .ord-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}
  .ord-top h1{font-size:20px;font-weight:600;letter-spacing:-.01em}
  .ord-sub{display:flex;align-items:center;gap:12px;margin-top:6px;font-size:12px;color:#737373;min-height:20px}
  .ord-sub .cmp{display:inline-flex;align-items:center;gap:6px;color:#171717}
  .ord-sw{width:28px;height:16px;border-radius:999px;background:#d4d4d4;position:relative;transition:background-color .15s;flex:none}
  .ord-sw::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:transform .15s}
  .ord-sw.on{background:#0a0a0a}.ord-sw.on::after{transform:translateX(12px)}
  .ord-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .ord-cards .statc-v{align-items:center;min-height:48px}.ord-cards .sp{margin-left:auto;display:block}
  .ord-cards .delta{margin-left:8px}
  .ord-bar{display:flex;align-items:center;gap:8px}
  .ord-tbl{margin-top:2px}
  /* drawer */
  .dr-title{display:flex;align-items:baseline;gap:10px;font-size:16px;font-weight:500;line-height:20px}
  .dr-title .no{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  .dr-sub{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:12px;color:#737373}.dr-sub .dot{width:3px;height:3px;border-radius:50%;background:#a3a3a3}
  .dr-figs{display:flex;gap:12px;margin:4px 0 20px}.dr-figs .card{width:215px}
  .dr-h{display:flex;align-items:center;gap:8px;margin:0 0 8px}.dr-h b{font-size:12px;font-weight:600}.dr-h .lock{margin-left:auto;display:inline-flex;gap:5px;align-items:center;color:#737373}.dr-h .lock svg.i{width:12px;height:12px}
  .dr-items{border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:20px}
  .dr-row{display:grid;grid-template-columns:minmax(0,1fr) 110px 90px;align-items:center;padding:0 16px;border-top:1px solid var(--border)}
  .dr-row.h{height:36px;background:#fafafa;border-top:0;color:#525252;font-weight:500}
  .dr-row.it{min-height:55px;padding-top:8px;padding-bottom:8px}.dr-row .pr{display:flex;gap:10px;align-items:center;min-width:0}
  .dr-row .sw{width:32px;height:32px;border-radius:8px;flex:none;background:#f1f1f1;object-fit:cover;box-shadow:0 0 0 1px rgba(10,10,10,.06)}
  .dr-row .pn{font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dr-row .pv{color:#737373;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .dr-row .q{font-weight:600}
  .erp{border:1px solid var(--border);border-radius:14px;overflow:hidden}
  .erp-h{display:flex;align-items:center;gap:8px;padding:12px 16px;cursor:pointer;width:100%;text-align:left}.erp-h:hover{background:#fafafa}
  .erp-h b{font-weight:500}.erp-h .pill-s{margin-left:auto}.erp-h .chev{transition:transform .2s ease}.erp.open .chev{transform:rotate(180deg)}
  .erp-b{max-height:0;overflow:hidden;transition:max-height .25s ease}.erp.open .erp-b{max-height:420px}
  .erp-kv{margin:0 16px 16px;padding:12px;background:rgba(245,245,245,.6);border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;display:grid;grid-template-columns:140px 1fr;gap:4px 12px}
  .erp-kv dt{color:#737373}.erp-kv dd{word-break:break-all}.erp-kv dd.err{color:var(--destructive)}
  .pill-s{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:999px;height:20px;padding:0 8px;font-size:10px;font-weight:500;color:#737373}
  .pill-s i{width:6px;height:6px;border-radius:50%;background:#a3a3a3}.pill-s.ok{color:#171717}.pill-s.ok i{background:var(--success)}.pill-s.bad{color:#171717}.pill-s.bad i{background:var(--destructive)}
  .wa-g{color:#1daa68}.wa-g svg.i{color:#1daa68}
  `;
  document.head.appendChild(css);

  const ui = () => (DM.ui.ord = DM.ui.ord || { period: 'month', from: '', to: '', compare: true, q: '', assigned: '', view: 'all', views: [] });
  const label = () => DM.navLabel('orders') || 'Orders';
  const plural = () => (label() === 'Draft Orders' ? 'draft orders' : 'orders');
  const isTally = () => DM.uc === 'stuffcool';
  const T = () => DM.TODAY;
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return O.iso(d); };
  const human = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  /* ───────── period maths ───────── */
  const periodRange = (u) => {
    const t = T(); let from = t, to = t;
    if (u.period === 'week') { const d = new Date(t + 'T00:00:00'); const wd = (d.getDay() + 6) % 7; from = addDays(t, -wd); }
    else if (u.period === 'month') from = t.slice(0, 8) + '01';
    else if (u.period === 'custom' && u.from && u.to) { from = u.from; to = u.to; }
    const days = Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000) + 1;
    return { from, to, days, prevFrom: addDays(from, -days), prevTo: addDays(from, -1) };
  };
  const inR = (d, a, b) => { const x = DM.dayOf(d.createdAt); return x >= a && x <= b; };
  const metrics = (rows, a, b) => { const R = rows.filter((d) => inR(d, a, b)); return { orders: R.length, items: R.reduce((s, d) => s + d.lines.length, 0), esc: R.filter((d) => (d.interventions || 0) > 0).length, rows: R }; };
  const series = (rows, a, b, key) => {
    const days = Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000) + 1; const out = [];
    if (days === 1) { const R = rows.filter((d) => DM.dayOf(d.createdAt) === a); for (let h = 0; h < 8; h++) out.push(R.filter((d) => { const hr = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date(d.createdAt)); return hr >= h * 3 && hr < h * 3 + 3; }).reduce((s, d) => s + (key === 'items' ? d.lines.length : key === 'esc' ? ((d.interventions || 0) > 0 ? 1 : 0) : 1), 0)); return out; }
    for (let k = 0; k < days; k++) { const day = addDays(a, k); const R = rows.filter((d) => DM.dayOf(d.createdAt) === day); out.push(R.reduce((s, d) => s + (key === 'items' ? d.lines.length : key === 'esc' ? ((d.interventions || 0) > 0 ? 1 : 0) : 1), 0)); }
    return out;
  };
  const spark = (v) => { const w = 80, h = 28; const mx = Math.max(...v, 1); const pts = v.length < 2 ? [0, 0].map((_, i) => [i * w, h - 3]) : v.map((x, i) => [(i / (v.length - 1)) * (w - 2) + 1, h - 3 - (x / mx) * (h - 8)]); const flat = v.every((x) => x === 0); return `<svg class="sp" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="opacity:${flat ? 0.35 : 1}"><polyline points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`; };
  const delta = (cur, prev, goodUp) => {
    if (prev === 0 && cur === 0) return null;
    const pct = prev === 0 ? 100 : ((cur - prev) / prev) * 100; if (Math.abs(pct) < 0.05) return null;
    const up = pct > 0; const good = goodUp ? up : !up;
    return { dir: up ? 'up' : 'down', text: Math.abs(pct).toFixed(1) + '%', tone: good ? 'green' : 'red' };
  };

  /* ───────── list ───────── */
  const memberItems = () => (S().users || []).filter((u) => u.status !== 'Invited').map((u) => ({ label: u.name, value: u.id }));
  const allRows = () => (S().drafts || []).slice();
  const visible = () => {
    const u = ui(); let L = allRows();
    if (u.assigned) L = L.filter((d) => d.assigned === u.assigned || (d.assignees || []).includes(u.assigned));
    if (u.q) { const q = u.q.toLowerCase(); L = L.filter((d) => [d.no, d.partyName, d.caseNo, d.city, (O.party(S(), d.partyId) || {}).city, contactName(d)].join(' ').toLowerCase().includes(q)); }
    return L.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  };
  const contactName = (d) => { const c = (S().contacts || []).find((x) => x.id === d.contactId); return c ? c.name : ''; };
  const q = () => DM.query();
  const qstr = () => { const u = ui(); if (u.period === 'month') return ''; if (u.period === 'custom') return `?from=${u.from}&to=${u.to}`; return '?period=' + u.period; };
  const syncFromUrl = () => { const u = ui(), Q = q(); if (Q.get('from') && Q.get('to')) { u.period = 'custom'; u.from = Q.get('from'); u.to = Q.get('to'); } else u.period = Q.get('period') || 'month'; };

  const card = (name, icon, key, cur, prev, goodUp, u, rows, r) => {
    const d = u.compare ? delta(cur, prev, goodUp) : null;
    return `<div class="card statc" data-rid="ordcard-${key}"><div class="statc-h">${DM.icoTile(icon)}<span class="grow">${name}</span></div><div class="statc-d"></div><div class="statc-v"><span data-count="${cur}" data-fmt="num" data-ck="ord-${key}">${DM.fmt.num(cur)}</span>${d ? `<span class="delta ${d.tone}">${I(d.dir === 'down' ? 'arrowDown' : 'uprightarrow')}${d.text}</span>` : ''}${spark(series(rows, r.from, r.to, key))}</div></div>`;
  };

  const caseCell = (d) => { if (!d.caseNo && !d.caseId) return '<span class="muted">—</span>'; const t = O.thread(S(), d); const arg = t ? t.id : d.caseId || d.caseNo; return `<a class="case-link" href="#/inbox/threads?case=${encodeURIComponent(arg)}" title="Open case">${esc(d.caseNo || (t && DM.caseNo(t)) || '')}${I('uprightarrow')}</a>`; };
  const cols = () => [
    { k: 'no', label: 'ID', w: 110, mono: true },
    { k: 'createdAt', label: 'Date and Time', w: 200, sortable: true, sort: 'desc', filter: { tip: "This filter isn't wired up yet." }, text: (r) => r.createdAt, render: (r) => esc(O.fmtDT(r.createdAt)) },
    { k: 'contact', label: 'Contact Name', w: 190, text: (r) => contactName(r), render: (r) => (contactName(r) ? esc(contactName(r)) : '<span class="muted">—</span>') },
    { k: 'partyName', label: 'Party Name', flex: 1, minW: 180, text: (r) => r.partyName, render: (r) => `<span style="font-weight:600">${esc(r.partyName || '—')}</span>` },
    { k: 'items', label: 'Items', w: 100, text: (r) => r.lines.length, render: (r) => String(r.lines.length) },
    { k: 'city', label: 'City', w: 160, text: (r) => (O.party(S(), r.partyId) || {}).city || '', render: (r) => { const c = (O.party(S(), r.partyId) || {}).city; return c ? esc(c.replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase())) : '<span class="muted">—</span>'; } },
    { k: 'state', label: 'State', w: 160, text: (r) => (O.party(S(), r.partyId) || {}).state || '', render: (r) => { const c = (O.party(S(), r.partyId) || {}).state; return c ? esc(c) : '<span class="muted">—</span>'; } },
    { k: 'case', label: 'Case', w: 160, text: (r) => r.caseNo || '', render: caseCell },
    { k: 'assigned', label: 'Assigned to', w: 130, text: (r) => r.assigned || '', render: (r) => `<span class="asg-cell">${O.assignee(r.assigned)}</span>`, filter: { menu: { label: 'Assigned to', title: 'Filter by assigned to', items: memberItems(), value: ui().assigned }, onChange: (v) => { ui().assigned = v || ''; DM.render(); } } },
  ];

  const render = ({ params }) => {
    syncFromUrl(); const u = ui(); const rg = periodRange(u); const all = allRows();
    const cur = metrics(all, rg.from, rg.to), prv = metrics(all, rg.prevFrom, rg.prevTo);
    const rows = visible(); const changed = DM.changedRows('drafts', rows, (d) => d.status + '|' + d.lines.length + '|' + d.assigned + '|' + (d.erp ? d.erp.outcome : ''));
    const rangeText = rg.from === rg.to ? human(rg.from) : human(rg.from) + ' – ' + human(rg.to);
    const periods = [{ key: 'today', label: 'Today' }, { key: 'week', label: 'This week' }, { key: 'month', label: 'This month' }];
    const seg = `<div class="pills" role="tablist">${periods.map((p) => `<button role="tab" class="pill ${u.period === p.key ? 'on' : ''}" data-act="ord-period" data-arg="${p.key}">${p.label}</button>`).join('')}<button role="tab" class="pill ${u.period === 'custom' ? 'on' : ''}" data-act="ord-custom">Custom ${I('pencil')}</button></div>`;
    const view = (u.views || []).find((v) => v.id === u.view);
    return `<div class="page wide">
      <div class="ord-top"><div class="grow"><h1>${esc(label())}</h1><div class="ord-sub"><span>${esc(rangeText)}</span><button class="cmp" data-act="ord-compare"><span class="ord-sw ${u.compare ? 'on' : ''}"></span>Compare</button></div></div>${seg}</div>
      <div class="ord-cards">${card('Orders', 'file', 'orders', cur.orders, prv.orders, true, u, all, rg)}${card('Line items', 'package', 'items', cur.items, prv.items, true, u, all, rg)}${card('Escalations', 'users', 'esc', cur.esc, prv.esc, false, u, all, rg)}</div>
      ${DM.toolbar(DM.viewBtn(view ? view.name : 'All ' + plural(), 'ord-views'), `${DM.colsBtn('drafts-grid', (DM.ui._grid['drafts-grid'] && DM.ui._grid['drafts-grid'].hidden.size) || 0)}${DM.searchGroup('ord-q', 'Search ' + plural() + '…', u.q)}`)}
      <div class="ord-tbl">${DM.table(cols(), rows, { id: 'drafts-grid', footer: plural(), go: (r) => '/orders/drafts/' + r.id + qstr(), rowCls: (r) => (changed.has(r.id) ? 'row-new' : ''), pageSize: 50, offset: 440, empty: { icon: 'file', title: 'No ' + label() + ' yet', sub: "New records show up here as they're created." } })}</div>
    </div>`;
  };

  /* ───────── drawer ───────── */
  const tc = (m) => (m == null ? '—' : m < 60 ? Math.round(m) + ' min' : m < 1440 ? (m / 60).toFixed(1) + ' hr' : (m / 1440).toFixed(1) + ' d');
  const istIso = (v) => { if (!v) return '—'; const d = new Date(Date.parse(v) + 5.5 * 3600000); return d.toISOString().replace('Z', '').replace(/\.\d+$/, '') + '+05:30'; };
  const erpBox = (d) => {
    const e = d.erp; const sys = isTally() ? 'Tally' : 'Coral ERP'; const open = DM.ui.ord && DM.ui.ord.erpOpen;
    const keys = isTally() ? ['outcome', 'transaction', 'voucherNo', 'voucherType', 'ledger', 'customerRef', 'sentAt', 'responseAt', 'lineCount', 'error'] : ['outcome', 'transaction', 'orderRef', 'customerRef', 'sentAt', 'responseAt', 'lineCount', 'error'];
    const val = (k) => { if (!e) return '—'; let v = e[k]; if (k === 'sentAt' || k === 'responseAt') v = istIso(v); return v == null || v === '' ? '—' : String(v); };
    const pill = !e ? `<span class="pill-s"><i></i>—</span>` : e.outcome === 'ok' ? `<span class="pill-s ok"><i></i>ok</span>` : `<span class="pill-s bad"><i></i>error</span>`;
    return `<div class="erp ${open ? 'open' : ''}" id="erp-box"><button class="erp-h" data-act="ord-erp">${I('link')}<b>${sys}</b>${pill}<span class="chev">${I('chevD')}</span></button><div class="erp-b"><dl class="erp-kv">${keys.map((k) => `<dt>${k}</dt><dd class="${k === 'error' && e && e.error ? 'err' : ''}">${esc(val(k))}</dd>`).join('')}</dl></div></div>`;
  };
  const openDrawer = (d) => {
    const s = S(); const t = O.thread(s, d); const st = d.createdAt;
    const lines = d.lines.map((l) => `<div class="dr-row it"><div class="pr">${O.swatch(l.variantId) ? `<img class="sw" src="${esc(O.swatch(l.variantId))}" alt="">` : '<span class="sw"></span>'}<div style="min-width:0"><div class="pn">${esc(l.name || '—')}</div><div class="pv">${esc(l.variant || '—')}</div></div></div><div class="q">${esc(l.qty == null ? '—' : l.qty)}</div><div>${esc(l.unit || '—')}</div></div>`).join('');
    const body = `<div class="dr-figs">${DM.statCard('Time to close', tc(d.timeToCloseMin), '', 'clock')}${DM.statCard('Interventions', String(d.interventions || 0), '', 'users')}</div>
      <div class="dr-h"><b>Items</b><span class="cnt-chip">${d.lines.length}</span><span class="lock">${I('lockk')} Locked after confirmation</span></div>
      <div class="dr-items"><div class="dr-row h"><div>Product / variant</div><div>Quantity</div><div>Unit</div></div>${lines || '<div class="dr-row it"><span class="muted">—</span></div>'}</div>
      ${erpBox(d)}`;
    const chat = `<button class="btn outline sm" data-act="ord-chat" data-arg="${esc(d.id)}"><span class="wa-g">${I('whatsapp')}</span> Open chat ${I('uprightarrow')}</button>`;
    const wrap = DM.sheet({
      id: 'draft', w: 800, title: `<div class="dr-title"><span class="no">${esc(d.no)}</span><span>${esc(d.partyName || '—')}</span></div>`,
      sub: undefined, headerExtra: chat, body,
      footer: `<span class="muted grow" style="text-align:left">Received ${esc(O.fmtDT(st))}</span><button class="btn outline" data-sheet-close>Close</button>`,
      onClose: () => DM.go('/orders/drafts' + qstr()),
    });
    const sub = document.createElement('div'); sub.className = 'dr-sub'; sub.innerHTML = `<span>${esc(O.fmtD(st))} · ${esc(O.fmtTm(st))}</span><i class="dot"></i>${O.stack(d.assignees && d.assignees.length ? d.assignees : [null])}`;
    wrap.querySelector('.sheet-t').after(sub);
  };

  DM.page('/orders/drafts', { title: 'Orders', render });
  DM.page('/orders/drafts/:id', { title: 'Orders', crumb: () => label(), render, after: (root, { params }) => { const d = allRows().find((x) => x.id === params.id); if (!d) { DM.toast('That order is not available'); return DM.go('/orders/drafts'); } openDrawer(d); } });

  /* ───────── actions ───────── */
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && /^\/orders\/drafts\/[^/]+$/.test(DM.path())) setTimeout(() => { if (!document.querySelector('[data-sheet="draft"]')) DM.go('/orders/drafts' + qstr()); }, 0); });
  DM.act('ord-period', (el) => { ui().period = el.dataset.arg; DM.go('/orders/drafts' + (el.dataset.arg === 'month' ? '' : '?period=' + el.dataset.arg)); });
  DM.act('ord-custom', (el) => { const rg = periodRange(ui()); O.range(el, { from: ui().from || rg.from, to: ui().to || rg.to, max: T(), onApply: (a, b) => { const u = ui(); u.period = 'custom'; u.from = a; u.to = b; DM.go(`/orders/drafts?from=${a}&to=${b}`); } }); });
  DM.act('ord-compare', () => { ui().compare = !ui().compare; DM.render(); });
  DM.input('ord-q', (v) => { ui().q = v; DM.render(); });
  DM.act('ord-erp', () => { const b = document.getElementById('erp-box'); if (!b) return; b.classList.toggle('open'); ui().erpOpen = b.classList.contains('open'); });
  DM.act('ord-chat', (el) => { const d = allRows().find((x) => x.id === el.dataset.arg); if (!d) return; const t = O.thread(S(), d); if (t) { DM.closeSheet('draft'); DM.go('/inbox/threads?case=' + t.id); } else if (DM.uc === 'rfq') DM.toast('No chat for this record', 'info'); else DM.toast('This conversation is not in the inbox demo data', 'info'); });
  DM.act('ord-views', (el) => {
    const u = ui(); const items = [{ heading: 'Views' }, { label: 'All ' + plural(), check: u.view === 'all', run: () => { u.view = 'all'; u.q = ''; u.assigned = ''; DM.render(); } }];
    (u.views || []).forEach((v) => items.push({ label: v.name, check: u.view === v.id, run: () => { u.view = v.id; u.q = v.q || ''; u.assigned = v.assigned || ''; DM.render(); } }));
    items.push({ sep: true }, { label: 'New view', icon: 'plus', run: () => newView() });
    DM.menu(el, items, { w: 220 });
  });
  const newView = () => DM.dialog({ title: 'New view', sub: 'Save the current search and filters as a view.', w: 420, body: DM.field('Name', 'name', { ph: 'e.g. Handed to Pankaj' }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save view', run: (d) => { const n = (d.querySelector('[name=name]').value || '').trim(); if (!n) { DM.toast('Give the view a name', 'info'); return false; } const u = ui(); const v = { id: 'v-' + Date.now(), name: n, q: u.q, assigned: u.assigned }; (u.views = u.views || []).push(v); u.view = v.id; DM.toast('View saved'); DM.render(); } }] });
})();
