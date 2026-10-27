/* Apps (integrations incl. Tally / Coralio detail), Channels, Logs. */
(function () {
  const { esc, icon: I, fmt } = DM;
  const st = document.createElement('style'); st.dataset.for = 'integrations';
  st.textContent = `
  .app-card{padding:14px;display:flex;flex-direction:column;gap:10px;cursor:pointer;transition:border-color .14s,box-shadow .14s}.app-card:hover{border-color:#bdbdbd;box-shadow:0 2px 10px rgba(0,0,0,.05)}
  .app-tile{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:15px;flex:none}
  .code{background:#0a0a0a;color:#e5e5e5;border-radius:10px;padding:12px 14px;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;overflow:auto;white-space:pre}
  .chan-tile{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;color:#fff;flex:none}
  .ep{display:flex;align-items:center;gap:8px;background:var(--muted);border-radius:9px;padding:8px 12px;font:12.5px ui-monospace,Menlo,monospace}
  .popin{animation:pop-in .38s cubic-bezier(.22,.8,.24,1) both}
  .feed-row{display:flex;gap:10px;align-items:center;padding:9px 14px;border-top:1px solid var(--border);font-size:12px;animation:anuma-rise .35s cubic-bezier(.22,.8,.24,1) both}
  .appc,.chc{transition:border-color .15s,box-shadow .15s,transform .15s}.appc:hover,.chc:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.06)}
  .pbar{height:4px;border-radius:2px;background:#eee;overflow:hidden}.pbar i{display:block;height:100%;background:var(--chart-2);border-radius:2px;transition:width .4s ease}
  .spin{width:13px;height:13px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:sp .7s linear infinite;display:inline-block}@keyframes sp{to{transform:rotate(360deg)}}
  .int-two{grid-template-columns:minmax(0,1fr) 320px;align-items:start}@media(max-width:1100px){.int-two{grid-template-columns:1fr}}
  .appc{overflow:hidden;cursor:pointer;transition:border-color .14s}.appc:hover{border-color:#bdbdbd}.appc-t{display:flex;gap:10px;padding:14px 14px 6px;align-items:flex-start}.appc-d{padding:0 14px 14px;min-height:46px;line-height:1.45}.appc-f{display:flex;gap:6px;padding:9px 12px;background:#fafafa;border-top:1px solid var(--border)}
  .apptag{font-size:10px;border:1px solid var(--border);border-radius:5px;padding:0 5px;font-weight:500;line-height:16px}.apptag.feat{background:#fef9c3;border-color:#fde68a;color:#854d0e}
  .dotstat{display:inline-flex;gap:6px;align-items:center;font-size:11.5px;color:#737373;white-space:nowrap}.dotstat i{width:6px;height:6px;border-radius:50%;background:#a3a3a3}.dotstat.on{color:#171717}.dotstat.on i{background:#13a269}.dotstat.warn{color:#9a6208}.dotstat.warn i{background:#f4b23e}
  .chc{overflow:hidden}.chc-t{display:flex;gap:10px;padding:14px;align-items:center}.chc-f{display:flex;gap:8px;align-items:center;padding:9px 14px;background:#fafafa;border-top:1px solid var(--border);font-size:12.5px}.chc-f svg.i{color:#737373}
  .lg-day{font-size:11px;font-weight:500;letter-spacing:.06em;color:#737373;margin:20px 0 8px}.lg-list{overflow:hidden}.lg-row{display:flex;gap:16px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer}.lg-row:last-child{border:0}.lg-row:hover{background:var(--hover-cream)}
  .lg-t{font:12px ui-monospace,Menlo,monospace;color:#525252;width:40px;flex:none;padding-top:1px}.lg-s{font-size:13.5px;font-weight:500;margin:6px 0 2px}.lg-chip{font-size:11px;border:1px solid var(--border);border-radius:6px;padding:0 7px;line-height:18px;background:#fafafa;color:#404040}.lg-chip.red{background:var(--destructive-tint);border-color:#f5c6c0;color:#b42318}.lg-chip.amber{background:var(--warning-tint);border-color:#f3e3a8;color:var(--warning-ink)}
  .typ{padding:14px;border:1px solid var(--border);border-radius:12px;text-align:left;display:flex;gap:12px;align-items:center;width:100%}.typ:hover{background:var(--muted)}.typ.on{border-color:#171717;box-shadow:0 0 0 1px #171717 inset}`;
  document.head.appendChild(st);

  const U = () => (DM.ui.int = DM.ui.int || { q: '', cat: 'all', state: 'all', tab: {}, testing: null, syncing: false });
  const L = () => (DM.ui.lg = DM.ui.lg || { q: '', kind: 'all', actor: 'all' });
  const nowIso = () => new Date().toISOString();
  const json = (o) => esc(JSON.stringify(o, null, 2));
  const copy = (t, msg) => { try { navigator.clipboard.writeText(t); } catch (e) {} DM.toast(msg || 'Copied'); };
  DM.act('int-copy', (el) => copy(el.dataset.arg));

  /* ───────── Apps ───────── */
  const DEFAULT_APPS = [
    { slug: 'tally', name: 'Tally', desc: 'Post confirmed orders as sales vouchers into Tally Prime.', category: 'Accounting', state: 'available', icon: '#1d4ed8', letter: 'T' },
    { slug: 'coralio', name: 'Coralio', desc: 'Send confirmed orders to the Coralio order API.', category: 'ERP', state: 'available', icon: '#7c3aed', letter: 'C' },
    { slug: 'google_sheets', name: 'Google Sheets', desc: 'Append orders and stock to a sheet.', category: 'Productivity', state: 'available', icon: '#0f9d58', letter: 'G' },
    { slug: 'shopify', name: 'Shopify', desc: 'Sync products and orders with a Shopify store.', category: 'Commerce', state: 'available', icon: '#5a8e3a', letter: 'S' },
    { slug: 'gmail', name: 'Gmail', desc: 'Read RFQs from a shared inbox and reply from Anuma.', category: 'Email', state: 'available', icon: '#d93025', letter: 'M' },
    { slug: 'indiamart', name: 'IndiaMART', desc: 'Pull buy-leads straight into the inbox.', category: 'Lead sources', state: 'available', icon: '#e11d48', letter: 'I' },
    { slug: 'shiprocket', name: 'Shiprocket', desc: 'Create shipments and track AWBs.', category: 'Shipping', state: 'available', icon: '#6d28d9', letter: 'R' },
    { slug: 'razorpay', name: 'Razorpay', desc: 'Payment links and collections.', category: 'Payments', state: 'available', icon: '#2563eb', letter: 'P' },
  ];
  const apps = () => { const a = DM.S.apps || (DM.S.apps = []); DEFAULT_APPS.forEach((d) => { if (!a.some((x) => x.slug === d.slug)) a.push(Object.assign({}, d)); }); return a; };
  const ERP = { tally: 'Tally', coralio: 'Coralio' };
  const ENDPOINT = { tally: 'http://tally-gw.anuma.run/voucher/import', coralio: 'https://api.coralio.example/v2/orders' };
  const MAPPING = {
    tally: [['Party name', 'Party A/c Name (Ledger)'], ['Order no', 'Voucher Number'], ['Placed on', 'Voucher Date'], ['Product name', 'Stock Item Name'], ['Quantity', 'Billed Quantity'], ['Rate', 'Rate'], ['GST', 'Output CGST / SGST Ledger'], ['Order total', 'Voucher Amount']],
    coralio: [['Order no', 'orderRef'], ['Party code', 'customerCode'], ['Design / SKU', 'itemCode'], ['Shade', 'shadeCode'], ['Quantity (m)', 'qtyMtr'], ['Rate', 'rate'], ['ASM', 'salesmanCode'], ['Placed on', 'orderDate']],
  };
  const FIELDS = {
    tally: [['host', 'Tally gateway URL', 'http://192.168.1.20:9000'], ['company', 'Company name in Tally', 'Demo Merchant Pvt Ltd']],
    coralio: [['base', 'API base URL', 'https://api.coralio.example/v2'], ['key', 'API key', 'cor_live_••••••••', 'password']],
    shopify: [['store', 'Store URL', 'yourstore.myshopify.com']], gmail: [['email', 'Mailbox', 'rfq@yourcompany.com']], google_sheets: [['sheet', 'Spreadsheet URL', 'https://docs.google.com/spreadsheets/d/…']],
  };
  const appOf = (slug) => apps().find((a) => a.slug === slug);
  const erpName = (slug) => ERP[slug];
  const tile = (a) => `<span class="app-tile" style="background:${a.icon || DM.color(a.name)}">${esc(a.letter || a.name[0])}</span>`;

  const TAGCLS = { Beta: '', Featured: 'feat' };
  const rank = (a) => (a.state === 'connected' ? (erpName(a.slug) ? 0 : 1) : 2);
  DM.page('/settings/integrations', { title: 'Apps', crumb: 'Apps', render() {
    const u = U(); const all = apps();
    const rows = all.filter((a) => (u.cat === 'all' || a.category === u.cat) && (u.state === 'all' || (u.state === 'connected') === (a.state === 'connected')) && (!u.q || (a.name + ' ' + a.desc + ' ' + a.category).toLowerCase().includes(u.q.toLowerCase()))).sort((x, y) => rank(x) - rank(y));
    const nf = (u.cat !== 'all' ? 1 : 0) + (u.state !== 'all' ? 1 : 0);
    const appStatus = (a) => (u.connecting === a.slug ? `<span class="dotstat"><span class="spin" style="width:10px;height:10px;border-width:1.5px"></span>Connecting…</span>` : `<span class="dotstat ${a.state === 'connected' ? 'on' : ''} ${u.pop === a.slug ? 'popin' : ''}"><i></i>${a.state === 'connected' ? 'Connected' : 'Not connected'}</span>`);
    const card = (a) => `<div class="card appc" data-rid="${esc(a.slug)}" data-go="/settings/integrations/${esc(a.slug)}"><div class="appc-t">${tile(a)}<div class="grow" style="min-width:0"><div class="row gap4"><b>${esc(a.name)}</b>${a.tag ? `<span class="apptag ${TAGCLS[a.tag] || ''}">${esc(a.tag)}</span>` : ''}</div><div class="xs muted">${esc(a.category)}</div></div>${appStatus(a)}</div><div class="sm muted appc-d">${esc(a.desc || 'No description yet.')}</div><div class="appc-f">${a.state === 'connected' ? `<button class="btn outline sm" data-act="int-manage" data-arg="${esc(a.slug)}">${I('list')} Configure</button>${a.docs ? `<button class="btn ghost sm" data-act="int-docs" data-arg="${esc(a.name)}">Docs ${I('ext')}</button>` : ''}` : `<button class="btn sm" data-act="int-connect" data-arg="${esc(a.slug)}">${I('link')} Connect</button>${a.docs ? `<button class="btn ghost sm" data-act="int-docs" data-arg="${esc(a.name)}">Docs ${I('ext')}</button>` : ''}`}</div></div>`;
    return `<div class="page narrow">${DM.header('Apps', 'Systems connected to your workspace, and everything you can connect.')}<div class="row" style="margin-bottom:14px">${DM.searchBox('int-q', 'Search apps…', u.q)}<button class="btn outline sm" data-act="int-filters">${I('filter')} Filters${nf ? ' · ' + nf : ''}</button>${nf ? `<button class="btn ghost sm" data-act="int-clear">Clear</button>` : ''}<span class="xs muted right">${rows.filter((a) => a.state === 'connected').length} connected · ${rows.length} apps</span></div>
      ${rows.length ? `<div class="grid g2 stagger">${rows.map(card).join('')}</div>` : '<div class="empty-card"><span class="icotile lg">' + I('blocks') + '</span><div class="b" style="margin-top:10px">No apps match</div><div class="muted sm">Try another search or clear the filters.</div></div>'}</div>`;
  } });
  DM.act('int-filters', (el) => { const cats = [...new Set(apps().map((a) => a.category))].sort(); DM.menu(el, [{ label: 'All categories', icon: U().cat === 'all' ? 'check' : null, run: () => { U().cat = 'all'; DM.render(); } }, ...cats.map((c) => ({ label: c, icon: U().cat === c ? 'check' : null, run: () => { U().cat = c; DM.render(); } })), { label: U().state === 'connected' ? '✓ Connected only' : 'Connected only', icon: 'link', run: () => { U().state = U().state === 'connected' ? 'all' : 'connected'; DM.render(); } }, { label: U().state === 'available' ? '✓ Not connected only' : 'Not connected only', icon: 'blocks', run: () => { U().state = U().state === 'available' ? 'all' : 'available'; DM.render(); } }]); });
  DM.act('int-clear', () => { U().cat = 'all'; U().state = 'all'; DM.render(); });
  DM.act('int-docs', (el, ev) => { ev && ev.stopPropagation && ev.stopPropagation(); DM.toast('Opening ' + el.dataset.arg + ' docs', 'ext'); });
  DM.input('int-q', (v) => { U().q = v; DM.render(); });
  DM.input('int-cat', (v) => { U().cat = v; DM.render(); });
  DM.act('int-manage', (el, ev) => { ev.stopPropagation(); DM.go('/settings/integrations/' + el.dataset.arg); });
  DM.act('int-connect', (el, ev) => {
    ev && ev.stopPropagation(); const a = appOf(el.dataset.arg); const f = FIELDS[a.slug] || [];
    DM.modal({ title: 'Connect ' + a.name, body: `<div class="row gap12" style="margin-bottom:14px">${tile(a)}<div class="sm muted">${esc(a.desc)}</div></div><div class="col gap12">${f.length ? f.map(([k, l, ph, t]) => DM.field(l, k, { ph, type: t })).join('') : `<div class="sm">Anuma will ask ${esc(a.name)} for permission to read and write the data it needs. You can disconnect any time.</div>`}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: f.length ? 'Connect' : 'Authorize', run: (m) => { const d = DM.formData(m); if (f.length && !Object.values(d).some((x) => String(x).trim())) { DM.toast('Fill in the connection details', 'alert'); return false; } const u = U(); u.connecting = a.slug; DM.render(); setTimeout(() => { a.state = 'connected'; a.account = d.email || d.store || d.company || d.host || d.base || (DM.S.company || {}).email || 'demo@anuma.run'; a.lastSync = nowIso(); u.connecting = null; u.pop = a.slug; log('Connected app ' + a.name, a.name); DM.toast(a.name + ' connected', 'check'); DM.render(); setTimeout(() => { u.pop = null; }, 700); }, 1200); } }] });
  });
  function log(action, target) { (DM.S.logs = DM.S.logs || []).unshift({ id: DM.uid('lg'), at: nowIso(), actor: 'Rohan Mehta', action, target, outcome: 'ok', kind: 'action', channel: 'app' }); }

  /* app detail */
  const mapOf = (a) => { a.config = a.config || {}; return (a.config.mapping = a.config.mapping || (MAPPING[a.slug] || []).map(([s, t]) => ({ s, t }))); };
  DM.page('/settings/integrations/:slug', { title: 'App', crumb: (p) => (appOf(p.slug) || {}).name || 'App', render({ params }) {
    const a = appOf(params.slug); if (!a) return `<div class="page narrow"><div class="empty"><h3>App not found</h3><p style="margin-top:10px"><a class="btn outline" href="#/settings/integrations">Back to apps</a></p></div></div>`;
    const sys = erpName(a.slug); const u = U(); const tab = u.tab[a.slug] || 'overview';
    const tabs = sys ? [['overview', 'Overview'], ['mapping', 'Field mapping'], ['sync', 'Sync log'], ['settings', 'Settings']] : [['overview', 'Overview'], ['settings', 'Settings']];
    const pend = sys ? (DM.S.orders || []).filter((o) => o.erp && o.erp.system === sys && o.erp.state === 'pending').length : 0;
    const logs = sys ? (DM.S.erpLog || []).filter((x) => x.system === sys) : [];
    const head = `<div class="page narrow"><div class="row" style="margin-bottom:6px"><a class="btn ghost sm" href="#/settings/integrations">${I('arrowL')} Apps</a></div>
      <div class="ph"><div class="row gap12">${tile(a).replace('38px', '46px')}<div><h1 class="row" style="gap:8px">${esc(a.name)} ${u.connecting === a.slug ? '<span class="badge"><span class="spin" style="width:10px;height:10px;border-width:1.5px"></span> Connecting…</span>' : `<span class="${u.pop === a.slug ? 'popin' : ''}" style="display:inline-flex">${DM.badge(a.state === 'connected' ? 'Connected' : 'Not connected', a.state === 'connected' ? 'green' : '', true)}</span>`}</h1><p>${esc(a.desc)}</p></div></div><div class="acts">${a.state === 'connected' ? `${sys ? (u.syncing ? `<button class="btn outline" disabled><span class="spin"></span> Posting…</button>` : DM.btn('Sync now' + (pend ? ` (${pend})` : ''), 'int-sync', { cls: 'outline', arg: a.slug, icon: 'refresh' })) : ''}${DM.btn('Disconnect', 'int-disc', { cls: 'outline', arg: a.slug })}` : DM.btn('Connect', 'int-connect', { arg: a.slug })}</div></div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${k === tab ? 'on' : ''}" data-act="int-tab" data-arg="${a.slug}|${k}">${l}${k === 'sync' && logs.length ? ` <span class="badge">${logs.length}</span>` : ''}</button>`).join('')}</div>`;
    let body = '';
    if (tab === 'overview') {
      const ok = logs.filter((x) => x.state === 'synced').length, bad = logs.filter((x) => x.state === 'failed').length;
      body = `<div class="grid int-two"><div class="col" style="gap:12px">
        ${sys ? `<div class="grid g3">${DM.stat('Synced', ok, 'orders posted', { icon: 'check', tone: 'up' })}${DM.stat('Pending', pend, 'waiting to post', { icon: 'clock' })}${DM.stat('Failed', bad, bad ? 'needs a retry' : 'all good', { icon: 'alert', tone: bad ? 'down' : 'muted' })}</div>
        <div class="card pad"><h3>Endpoint</h3><div class="ep" style="margin-top:10px"><span class="grow trunc">${esc(a.config?.endpoint || ENDPOINT[a.slug])}</span><button class="btn ghost icon sm" data-act="int-copy" data-arg="${esc(a.config?.endpoint || ENDPOINT[a.slug])}">${I('copy')}</button></div><div class="xs muted" style="margin:8px 0 12px">${a.slug === 'tally' ? 'Anuma posts Sales vouchers as Tally XML through the gateway.' : 'Anuma POSTs JSON orders with your API key in the Authorization header.'}</div><button class="btn outline sm" data-act="int-test" data-arg="${a.slug}" ${u.testing === a.slug ? 'disabled' : ''}>${u.testing === a.slug ? '<span class="spin"></span> Testing…' : I('zap') + ' Test connection'}</button> ${a.config?.lastTest ? `<span class="xs muted" style="margin-left:8px">Last test ${esc(fmt.ago(a.config.lastTest))} ago · ${esc(a.config.lastLatency)} ms</span>` : ''}</div>` : `<div class="card pad"><h3>About</h3><p class="sm muted" style="margin-top:8px">${esc(a.desc)} Anuma uses this connection for ${esc(a.category.toLowerCase())}.</p></div>`}
        <div class="card pad"><h3>Recent activity</h3><div class="col" style="margin-top:10px;gap:8px">${(DM.S.logs || []).filter((l) => (l.target || '').toLowerCase().includes(a.name.toLowerCase())).slice(0, 5).map((l) => `<div class="row sm">${I('history')}<span class="grow">${esc(l.action)}</span><span class="muted xs">${esc(fmt.dt(l.at))}</span></div>`).join('') || '<div class="sm muted">No activity yet.</div>'}</div></div></div>
        <div class="card pad"><h3>Connection</h3><dl class="kv" style="grid-template-columns:90px 1fr;margin-top:10px"><dt>Account</dt><dd>${esc(a.account || '—')}</dd><dt>Category</dt><dd>${esc(a.category)}</dd><dt>Last sync</dt><dd>${a.lastSync ? esc(/^\d{4}-/.test(a.lastSync) ? fmt.dt(a.lastSync) : a.lastSync) : '—'}</dd><dt>Access</dt><dd>Read &amp; write</dd></dl></div></div>`;
    } else if (tab === 'mapping') {
      const m = mapOf(a);
      body = `<div class="card"><div class="card-h"><div class="grow"><h3>Field mapping</h3><div class="xs muted">Where each Anuma field lands in ${esc(sys)}.</div></div>${a.slug === 'tally' ? `<select class="select" style="width:170px" data-change="int-vt" data-arg="${a.slug}">${['Sales Order', 'Sales', 'Delivery Note'].map((v) => `<option ${v === (a.config?.voucher || 'Sales Order') ? 'selected' : ''}>${v}</option>`).join('')}</select>` : ''}<button class="btn sm" data-act="toast" data-arg="Mapping saved">Save mapping</button></div>${m.map((r, i) => `<div class="st-row row" style="padding:10px 16px;border-bottom:1px solid var(--border)"><div class="grow sm b">${esc(r.s)}</div>${I('arrowR')}<input class="input" style="width:260px" data-input="int-map" data-slug="${a.slug}" data-i="${i}" value="${esc(r.t)}"></div>`).join('')}</div>`;
    } else if (tab === 'sync') {
      const fd = u.feed || []; const feed = fd.length || u.syncing ? `<div class="card" style="margin-bottom:12px;overflow:hidden"><div class="card-h"><span class="icotile">${I(u.syncing ? 'refresh' : 'check')}</span><div class="grow"><div class="b">${u.syncing ? 'Posting to ' + esc(sys) + '…' : 'Last sync finished'}</div><div class="xs muted">${fd.length} of ${u.total || fd.length} orders posted</div></div>${u.syncing ? '<span class="spin"></span>' : DM.badge('Done', 'green', true)}</div><div style="padding:0 14px 10px"><div class="pbar"><i style="width:${u.total ? Math.round((fd.length / u.total) * 100) : 100}%"></i></div></div>${fd.slice().reverse().map((x) => `<div class="feed-row">${I('check')}<span class="grow"><b>${esc(x.no)}</b> <span class="muted">→ ${esc(x.endpoint.replace(/^https?:\/\/[^/]+/, ''))}</span></span><span class="mono xs">${esc(x.ref)}</span>${DM.badge(String(x.status), 'green')}</div>`).join('')}</div>` : '';
      body = feed + `<div class="row" style="margin-bottom:12px"><span class="sm muted grow">${logs.length} calls · newest first</span>${u.syncing ? '<button class="btn sm" disabled><span class="spin"></span> Posting…</button>' : DM.btn('Sync now' + (pend ? ` (${pend})` : ''), 'int-sync', { arg: a.slug, icon: 'refresh', cls: 'sm' })}</div>` + DM.table([{ label: 'Time', render: (x) => `<span class="muted">${esc(fmt.dt(x.at))}</span>` }, { label: 'Order', render: (x) => { const o = DM.by(DM.S.orders || [], x.orderId); return `<a class="b" href="#/orders/${esc(x.orderId)}">${esc(o ? o.no : x.orderId)}</a>`; } }, { label: 'Request', render: (x) => `<span class="mono xs">${esc(x.method || 'POST')} ${esc((x.endpoint || '').replace(/^https?:\/\/[^/]+/, ''))}</span>` }, { label: 'Status', render: (x) => DM.badge(String(x.status), x.status < 300 ? 'green' : 'red') }, { label: 'Reference', render: (x) => `<span class="mono xs">${esc(x.ref || '—')}</span>` }, { label: 'State', render: (x) => DM.badge(x.state, x.state === 'synced' ? 'green' : x.state === 'failed' ? 'red' : 'amber', true) }, { label: '', w: '70px', render: (x) => (x.state === 'failed' ? `<button class="btn outline sm" data-act="int-retry" data-arg="${esc(x.id)}">Retry</button>` : '') }], logs.slice().sort((x, y) => String(y.at).localeCompare(String(x.at))), { click: 'int-log-open', empty: 'Nothing has been posted yet. Confirm an order or press “Sync now”.' });
    } else {
      const cfg = (a.config = a.config || {}); const opts = sys ? [['auto', 'Post automatically when an order is confirmed'], ['retry', 'Retry failed posts every 15 minutes'], ['stock', 'Pull stock levels back every hour'], ['ledger', 'Create missing party ledgers automatically']] : [['auto', 'Sync automatically'], ['notify', 'Notify me about failures']];
      body = `<div class="card">${opts.map(([k, l]) => `<div class="st-row row" style="padding:12px 16px;border-bottom:1px solid var(--border)"><div class="grow sm">${l}</div>${DM.switch(cfg['o_' + k] !== false, 'int-opt', a.slug + '|' + k)}</div>`).join('')}</div>`;
    }
    return head + body + '</div>';
  } });
  DM.act('int-tab', (el) => { const [s, t] = el.dataset.arg.split('|'); U().tab[s] = t; DM.render(); });
  DM.input('int-map', (v, el) => { mapOf(appOf(el.dataset.slug))[+el.dataset.i].t = v; });
  DM.input('int-vt', (v, el) => { appOf(el.dataset.arg).config.voucher = v; DM.toast('Voucher type: ' + v); });
  DM.act('int-opt', (el) => { const [s, k] = el.dataset.arg.split('|'); const a = appOf(s); a.config = a.config || {}; a.config['o_' + k] = a.config['o_' + k] === false; DM.render(); });
  DM.act('int-disc', (el) => { const a = appOf(el.dataset.arg); DM.confirm('Disconnect ' + a.name + '?', 'Anuma will stop syncing. Existing records stay.', () => { a.state = 'available'; log('Disconnected app ' + a.name, a.name); DM.toast(a.name + ' disconnected'); DM.render(); }, 'Disconnect'); });
  DM.act('int-test', (el) => { const a = appOf(el.dataset.arg); U().testing = a.slug; DM.render(); setTimeout(() => { U().testing = null; a.config = a.config || {}; a.config.lastTest = nowIso(); a.config.lastLatency = 90 + Math.floor(Math.random() * 120); DM.toast(`${a.name} reachable · ${a.config.lastLatency} ms`, 'check'); log('Tested connection to ' + a.name, a.name); DM.render(); }, 1100); });
  function postOrder(o, sys, fail) {
    const lines = (o.lines || []).map((l) => ({ item: l.name, qty: l.qty, unit: l.unit, rate: l.price }));
    const ref = sys === 'Tally' ? 'VCH/' + (o.no || o.id).toString().replace(/\D/g, '').slice(-5) : 'COR-' + Math.floor(100000 + Math.random() * 899999);
    const req = sys === 'Tally' ? { voucher: { type: appOf('tally').config?.voucher || 'Sales Order', number: o.no, date: (o.placedAt || '').slice(0, 10), party: (DM.by(DM.S.parties || [], o.partyId) || {}).name, entries: lines, amount: o.total } } : { orderRef: o.no, customerCode: o.partyId, orderDate: (o.placedAt || '').slice(0, 10), lines, total: o.total };
    const e = { id: DM.uid('erp'), orderId: o.id, system: sys, direction: 'out', endpoint: ENDPOINT[sys.toLowerCase()], method: 'POST', status: fail ? 500 : 200, ref: fail ? '' : ref, at: nowIso(), request: req, response: fail ? { error: 'Upstream timeout' } : sys === 'Tally' ? { status: 'OK', created: 1, voucherId: ref } : { ok: true, id: ref, state: 'accepted' }, state: fail ? 'failed' : 'synced' };
    (DM.S.erpLog = DM.S.erpLog || []).unshift(e); o.erp = { system: sys, ref: e.ref, state: e.state, at: e.at, error: fail ? 'Upstream timeout' : undefined }; return e;
  }
  DM.act('int-sync', (el) => {
    const a = appOf(el.dataset.arg); const sys = erpName(a.slug); const u = U(); if (u.syncing) return;
    const todo = (DM.S.orders || []).filter((o) => o.erp && o.erp.system === sys && o.erp.state === 'pending'); if (!todo.length) { DM.toast('Everything is already synced', 'check'); return; }
    u.syncing = true; u.feed = []; u.total = todo.length; u.tab[a.slug] = 'sync'; DM.toast(`Posting ${todo.length} order${todo.length > 1 ? 's' : ''} to ${sys}…`, 'refresh'); DM.render();
    todo.forEach((o, i) => setTimeout(() => { const e = postOrder(o, sys); u.feed.push({ no: o.no || o.id, endpoint: e.endpoint, ref: e.ref, status: e.status }); if (i === todo.length - 1) { a.lastSync = nowIso(); u.syncing = false; log(`Synced ${todo.length} orders to ${sys}`, a.name); DM.toast(`${todo.length} order${todo.length > 1 ? 's' : ''} synced to ${sys}`, 'check'); } DM.render(); }, 600 + i * 550));
  });
  DM.act('int-retry', (el, ev) => { ev.stopPropagation(); const e = DM.by(DM.S.erpLog, el.dataset.arg); const o = DM.by(DM.S.orders || [], e.orderId); setTimeout(() => { e.state = 'synced'; e.status = 200; e.ref = e.ref || 'RETRY-' + Math.floor(10000 + Math.random() * 89999); e.response = { ok: true, id: e.ref, retried: true }; e.at = nowIso(); if (o) o.erp = { system: e.system, ref: e.ref, state: 'synced', at: e.at }; DM.toast('Retry succeeded', 'check'); DM.render(); }, 700); DM.toast('Retrying…', 'refresh'); });
  DM.act('int-log-open', (el, ev) => {
    const x = DM.by(DM.S.erpLog || [], el.dataset.arg); if (!x) return;
    DM.drawer({ title: `${esc(x.method || 'POST')} · ${esc(x.state)}`, body: `<dl class="kv"><dt>Endpoint</dt><dd class="mono xs">${esc(x.endpoint)}</dd><dt>Status</dt><dd>${esc(x.status)}</dd><dt>Reference</dt><dd>${esc(x.ref || '—')}</dd><dt>When</dt><dd>${esc(fmt.dt(x.at))}</dd></dl><div class="sep"></div><div class="sm b" style="margin-bottom:6px">Request</div><div class="code">${json(x.request || {})}</div><div class="sm b" style="margin:14px 0 6px">Response</div><div class="code">${json(x.response || {})}</div>`, actions: x.state === 'failed' ? `<button class="btn sm" data-act="int-retry" data-arg="${esc(x.id)}">Retry</button>` : '' });
  });
  DM.page('/settings/integrations/:slug/:installed', { render({ params }) { setTimeout(() => DM.go('/settings/integrations/' + params.slug), 0); return ''; } });

  /* ───────── Channels ───────── */
  const CHT = { whatsapp: ['WhatsApp', '#1daa68', 'chat'], email: ['Email', '#2563eb', 'mail'], indiamart: ['IndiaMART', '#e11d48', 'tag'], web: ['Web form', '#7c3aed', 'globe'], telegram: ['Telegram', '#0ea5e9', 'send'] };
  const PROV = ['Meta Cloud API', '360dialog', 'Plivo', 'Gupshup'];
  const chans = () => DM.S.channels || (DM.S.channels = []);
  const stBadge = (s) => DM.badge(s === 'connected' ? 'Connected' : s === 'needs_reauth' ? 'Needs re-auth' : 'Disconnected', s === 'connected' ? 'green' : s === 'needs_reauth' ? 'amber' : 'red', true);
  const hashN = (str) => { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const chStat = (s) => (s === 'connected' ? ['Live', 'on'] : s === 'needs_reauth' ? ['Needs re-auth', 'warn'] : ['Paused', '']);
  DM.page('/settings/channels', { title: 'Channels', crumb: 'Channels', render() {
    const list = chans();
    return `<div class="page narrow">${DM.header('Channels', 'Where customers reach you, and which agent answers.', DM.btn('Create', 'ch-add', { icon: 'plus' }))}${list.length ? `<div class="grid g2 stagger">${list.map((c) => { const t = CHT[c.type] || CHT.web; const agents = (DM.S.agents || []).filter((a) => a.channelId === c.id); const [sl, sc] = chStat(c.state); const days = 2 + (hashN(c.id) % 19);
      return `<div class="card chc" data-rid="${esc(c.id)}"><div class="chc-t"><span class="chan-tile" style="background:${t[1]}1f;color:${t[1]}">${I(t[2])}</span><div class="grow" style="min-width:0"><div class="b trunc">${esc(c.name || t[0])}</div><div class="xs muted trunc">${esc([c.number, c.provider].filter(Boolean).join(' — '))}</div></div><span class="dotstat ${sc}"><i></i>${sl}</span><button class="btn ghost icon sm" data-act="ch-menu" data-arg="${esc(c.id)}">${I('more')}</button></div><div class="chc-f">${I('bot')}<span class="grow trunc">${agents.length ? agents.map((a) => `<a class="b" href="#/agents/${esc(a.id)}">${esc(a.name)}</a>`).join(', ') : '<span class="muted">No agent answers here yet</span>'}</span>${c.state !== 'connected' ? `<button class="btn outline sm" data-act="ch-reconnect" data-arg="${esc(c.id)}">${I('refresh')} Reconnect</button>` : `<span class="xs muted">${days} days ago</span>`}</div></div>`; }).join('')}</div>` : `<div class="empty-card"><span class="icotile lg">${I('radio')}</span><div class="b" style="margin-top:10px">No channels yet</div><div class="muted sm">Create one so customers can reach you.</div></div>`}</div>`;
  } });
  DM.act('ch-menu', (el) => { const c = DM.by(chans(), el.dataset.arg); DM.menu(el, [{ label: 'Edit provider & number', icon: 'edit', run: () => chEdit(c) }, { label: 'Send test message', icon: 'send', run: () => { DM.toast('Sending test message…', 'send'); setTimeout(() => { c.lastEvent = nowIso(); log('Test message sent on ' + (c.name || c.type), c.name); DM.toast('Test message delivered', 'check'); DM.render(); }, 900); } }, { label: 'Copy webhook URL', icon: 'copy', run: () => copy('https://hooks.anuma.run/' + c.type + '/' + c.id, 'Webhook URL copied') }, ...(c.state === 'connected' ? [{ label: 'Disconnect', icon: 'x', run: () => { c.state = 'disconnected'; DM.toast('Channel disconnected'); DM.render(); } }] : [{ label: 'Reconnect', icon: 'refresh', run: () => reconnect(c) }]), { label: 'Remove', icon: 'trash', run: () => DM.confirm('Remove channel?', 'Agents using it will stop receiving messages.', () => { DM.S.channels = chans().filter((x) => x.id !== c.id); (DM.S.agents || []).forEach((a) => { if (a.channelId === c.id) a.channelId = null; }); DM.toast('Channel removed'); DM.render(); }, 'Remove') }]); });
  function reconnect(c) { DM.toast('Reconnecting…', 'refresh'); setTimeout(() => { c.state = 'connected'; c.webhook = 'healthy'; c.lastEvent = nowIso(); log('Reconnected ' + (c.name || c.type), c.name); DM.toast('Channel connected', 'check'); DM.render(); }, 1000); }
  DM.act('ch-reconnect', (el) => reconnect(DM.by(chans(), el.dataset.arg)));
  function chEdit(c) { DM.modal({ title: 'Edit channel', body: `<div class="col gap12">${DM.field('Name', 'name', { value: c.name || '' })}${DM.field('Number / address', 'number', { value: c.number || '' })}${DM.field('Provider', 'provider', { options: PROV, value: c.provider })}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (m) => { Object.assign(c, DM.formData(m)); DM.toast('Channel updated'); DM.render(); } }] }); }
  DM.act('ch-add', () => {
    const w = { step: 1, type: 'whatsapp', name: '', number: '', provider: PROV[0], code: '' };
    const draw = (m) => {
      const b = m.querySelector('.modal-b'); const f = m.querySelector('.modal-f');
      if (w.step === 1) b.innerHTML = `<div class="xs muted" style="margin-bottom:10px">Step 1 of 3 · Choose a channel</div><div class="col" style="gap:8px">${Object.entries(CHT).map(([k, t]) => `<button class="typ ${w.type === k ? 'on' : ''}" data-ty="${k}"><span class="chan-tile" style="background:${t[1]}">${I(t[2])}</span><div><div class="b">${t[0]}</div><div class="xs muted">${k === 'whatsapp' ? 'Orders, photos and voice notes' : k === 'email' ? 'RFQs and PDF attachments' : k === 'indiamart' ? 'Buy-leads' : k === 'web' ? 'Embedded enquiry form' : 'Telegram bot'}</div></div></button>`).join('')}</div>`;
      else if (w.step === 2) b.innerHTML = `<div class="xs muted" style="margin-bottom:10px">Step 2 of 3 · Details</div><div class="col gap12"><div class="field"><label>Name</label><input class="input" data-w="name" value="${esc(w.name)}" placeholder="${esc(CHT[w.type][0])} desk"></div><div class="field"><label>${w.type === 'email' ? 'Mailbox' : w.type === 'whatsapp' ? 'Phone number' : 'Handle / URL'}</label><input class="input" data-w="number" value="${esc(w.number)}" placeholder="${w.type === 'email' ? 'rfq@company.com' : '+91 98200 00000'}"></div>${w.type === 'whatsapp' ? `<div class="field"><label>Provider</label><select class="select" data-w="provider">${PROV.map((p) => `<option ${p === w.provider ? 'selected' : ''}>${p}</option>`).join('')}</select></div>` : ''}</div>`;
      else b.innerHTML = `<div class="xs muted" style="margin-bottom:10px">Step 3 of 3 · Verify</div><p class="sm">We sent a 6-digit code to <b>${esc(w.number)}</b>. Enter it below.</p><div class="field" style="margin-top:12px"><input class="input" data-w="code" value="${esc(w.code)}" placeholder="123456" maxlength="6" style="font-size:18px;letter-spacing:.3em;text-align:center"><div class="xs muted">Demo: any 6 digits work.</div></div>`;
      b.classList.remove('pg-enter'); void b.offsetWidth; b.classList.add('pg-enter');
      f.innerHTML = `${w.step > 1 ? '<button class="btn outline" data-nav="back">Back</button>' : '<button class="btn outline" data-nav="cancel">Cancel</button>'}<button class="btn" data-nav="next">${w.step === 3 ? 'Verify & connect' : 'Continue'}</button>`;
    };
    DM.modal({ title: 'Add channel', body: '', actions: [{ label: 'x' }], onMount: (m) => {
      draw(m); const f = m.querySelector('.modal-f');
      m.addEventListener('input', (e) => { if (e.target.dataset.w) w[e.target.dataset.w] = e.target.value; }); m.addEventListener('change', (e) => { if (e.target.dataset.w) w[e.target.dataset.w] = e.target.value; });
      m.addEventListener('click', (e) => { const t = e.target.closest('[data-ty]'); if (t) { w.type = t.dataset.ty; draw(m); } });
      f.addEventListener('click', (e) => { e.stopPropagation(); const n = e.target.closest('[data-nav]'); if (!n) return; const k = n.dataset.nav; if (k === 'cancel') return DM.closeModal(); if (k === 'back') { w.step--; return draw(m); }
        if (w.step === 2 && !w.number.trim()) { DM.toast('Enter a number or address', 'alert'); return; } if (w.step === 3) { if (!/^\d{6}$/.test(w.code)) { DM.toast('Enter the 6-digit code', 'alert'); return; } const c = { id: DM.uid('ch'), type: w.type, name: w.name || CHT[w.type][0] + ' desk', number: w.number, provider: w.type === 'whatsapp' ? w.provider : CHT[w.type][0], state: 'connected', webhook: 'healthy', lastEvent: nowIso() }; chans().push(c); log('Added channel ' + c.name, c.name); DM.closeModal(); DM.toast(c.name + ' connected', 'check'); DM.render(); return; } w.step++; draw(m); }, true);
    } });
  });

  /* ───────── Logs ───────── */
  const KIND_TONE = { action: '', alert: 'red', validation: 'amber' };
  const OUT_TONE = (o) => (/(fail|error|reject|escalat)/i.test(o || '') ? (/escalat/i.test(o) ? 'blue' : 'red') : /(ok|success|synced|approved|handled|sent|done)/i.test(o || '') ? 'green' : '');
  function filteredLogs() { const f = L(); return (DM.S.logs || []).filter((l) => (f.kind === 'all' || l.kind === f.kind) && (f.actor === 'all' || l.actor === f.actor) && (!f.q || (l.action + ' ' + l.target + ' ' + l.actor).toLowerCase().includes(f.q.toLowerCase()))).sort((a, b) => String(b.at).localeCompare(String(a.at))); }
  const ist = (iso, o) => new Date(iso).toLocaleString('en-GB', Object.assign({ timeZone: 'Asia/Kolkata' }, o));
  const parsable = (v) => /^\d{4}-\d{2}-\d{2}T/.test(String(v || ''));
  const VERB = (a) => String(a || '').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '') || 'logged';
  const actorAv = (n) => (!n || /^(anuma|system|agent|auto)/i.test(n) ? `<span style="display:inline-flex">${DM.mark(18)}</span>` : DM.avatar(n === 'You' ? 'Rohan Mehta' : n, 'sm'));
  DM.page('/settings/logs', { title: 'Logs', crumb: 'Logs', render() {
    const f = L(); const all = DM.S.logs || []; const actors = ['all', ...new Set(all.map((l) => l.actor).filter(Boolean))]; const rows = filteredLogs();
    const groups = []; rows.forEach((l) => { const key = parsable(l.at) ? ist(l.at, { day: '2-digit', month: 'short' }).toUpperCase() : 'TODAY'; let g = groups[groups.length - 1]; if (!g || g.key !== key) { g = { key, rows: [] }; groups.push(g); } g.rows.push(l); });
    const time = (l) => (parsable(l.at) ? ist(l.at, { hour: '2-digit', minute: '2-digit', hour12: false }) : String(l.at || ''));
    return `<div class="page narrow">${DM.header('Logs', 'Everything Anuma and your team did, newest first.', DM.btn('Export CSV', 'lg-export', { cls: 'outline', icon: 'download' }))}<div class="row wrap" style="margin-bottom:6px">${DM.searchBox('lg-q', 'Search logs…', f.q)}${DM.pills([{ key: 'all', label: 'All' }, { key: 'action', label: 'Actions' }, { key: 'alert', label: 'Alerts' }, { key: 'validation', label: 'Validation' }], f.kind, 'lg-kind')}<select class="select" style="width:150px" data-change="lg-actor">${actors.map((a) => `<option value="${esc(a)}" ${a === f.actor ? 'selected' : ''}>${a === 'all' ? 'Everyone' : esc(a)}</option>`).join('')}</select><span class="xs muted right">${rows.length} events</span></div>
      ${groups.length ? groups.map((g) => `<div class="lg-day">${esc(g.key)}</div><div class="card lg-list">${g.rows.map((l) => `<div class="lg-row" data-rid="${esc(l.id)}" data-act="lg-open" data-arg="${esc(l.id)}"><span class="lg-t">${esc(time(l))}</span><div class="grow" style="min-width:0"><div class="row gap4 wrap"><span class="lg-chip">${esc((l.channel && l.channel !== 'app' ? l.channel : 'generic') + ' ' + VERB(l.action))}</span><span class="lg-chip ${l.kind === 'alert' ? 'red' : l.kind === 'validation' ? 'amber' : ''}">${esc(l.outcome || 'logged')}</span></div><div class="lg-s">${esc(l.action)}</div><div class="xs muted row gap4" style="margin-top:2px">${actorAv(l.actor)}${esc(l.actor || 'Anuma')}${l.target ? ' · ' + esc(l.target) : ''}</div></div></div>`).join('')}</div>`).join('') : '<div class="empty-card"><span class="icotile lg">' + I('history') + '</span><div class="b" style="margin-top:10px">No events match</div><div class="muted sm">Try a different search or filter.</div></div>'}</div>`;
  } });
  DM.input('lg-q', (v) => { L().q = v; DM.render(); });
  DM.act('lg-kind', (el) => { L().kind = el.dataset.arg; DM.render(); });
  DM.input('lg-actor', (v) => { L().actor = v; DM.render(); });
  DM.act('lg-open', (el) => {
    const l = DM.by(DM.S.logs || [], el.dataset.arg); if (!l) return;
    DM.drawer({ title: esc(l.action), body: `<dl class="kv"><dt>When</dt><dd>${esc(fmt.dt(l.at))}</dd><dt>Actor</dt><dd>${esc(l.actor || '—')}</dd><dt>Target</dt><dd>${esc(l.target || '—')}</dd><dt>Channel</dt><dd>${esc(l.channel || '—')}</dd><dt>Type</dt><dd>${DM.badge(l.kind || 'action', KIND_TONE[l.kind] || '')}</dd><dt>Outcome</dt><dd>${l.outcome ? DM.badge(l.outcome, OUT_TONE(l.outcome), true) : '—'}</dd></dl><div class="sep"></div><div class="sm b" style="margin-bottom:6px">Raw event</div><div class="code">${json({ id: l.id, at: l.at, actor: l.actor, action: l.action, target: l.target, channel: l.channel, kind: l.kind, outcome: l.outcome })}</div>` });
  });
  DM.act('lg-export', () => {
    const rows = filteredLogs(); const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const csv = ['when,actor,action,target,channel,type,outcome'].concat(rows.map((l) => [l.at, l.actor, l.action, l.target, l.channel, l.kind, l.outcome].map(q).join(','))).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'anuma-logs.csv'; document.body.appendChild(a); a.click(); a.remove(); DM.toast(`Exported ${rows.length} rows`, 'download');
  });

  DM.searchProviders.push((q) => apps().filter((a) => a.name.toLowerCase().includes(q)).map((a) => ({ label: a.name, sub: 'App', icon: 'blocks', url: '/settings/integrations/' + a.slug })));
})();
