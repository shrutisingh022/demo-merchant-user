/* CRM: parties (accounts) + contacts — list, record, create/edit. All mutations act on DM.S. */
(function () {
  const I = DM.icon, esc = DM.esc, F = DM.fmt;
  const st = document.createElement('style'); st.dataset.for = 'crm';
  st.textContent = `.seg-card{cursor:pointer;transition:border-color .14s}.seg-card:hover{border-color:#bdbdbd}.seg-card.on{border-color:#171717;box-shadow:0 0 0 1px #171717 inset}
  .bulkbar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#171717;color:#fff;border-radius:10px;margin-bottom:10px}
  .bulkbar .btn{background:#fff;color:#171717;border-color:#fff}.bulkbar .btn.ghost{background:transparent;color:#fff;border-color:transparent}
  .rec-head{display:flex;gap:14px;align-items:center;margin-bottom:14px}.th{cursor:pointer;user-select:none}.th:hover{color:var(--foreground)}
  .tl{position:relative;padding-left:18px}.tl::before{content:"";position:absolute;left:5px;top:4px;bottom:4px;width:1px;background:var(--border)}.tl .ev{position:relative;padding:0 0 14px}.tl .ev::before{content:"";position:absolute;left:-17px;top:5px;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--chart-2)}`;
  st.textContent += `.gridbox{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#fff}.gridbox .dmgrid{border-radius:0}.gridbox .dmgrid .ag-root-wrapper{border:0;border-radius:0}.gridfoot{display:flex;align-items:center;gap:12px;padding:0 14px;height:46px;border-top:1px solid var(--border);font-size:12px;color:var(--muted-foreground)}.gridfoot .pg{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:8px;height:28px;padding:0 10px;color:var(--foreground);font-weight:500;background:#fff}.gridfoot .pn{width:28px;height:28px;border:1px solid var(--border);border-radius:8px;display:grid;place-items:center;opacity:.5}.dsec{margin:18px 0 8px;font-size:12.5px;font-weight:500}.drow{display:flex;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid var(--border)}.drow:first-child{border-top:0}.dh{padding:10px 14px;font-weight:600;font-size:13px;border-bottom:1px solid var(--border);display:flex;align-items:center}.dtbl{width:100%;border-collapse:collapse;font-size:12px}.dtbl th{text-align:left;font-weight:500;color:var(--muted-foreground);padding:8px 12px;border-bottom:1px solid var(--border)}.dtbl td{padding:9px 12px;border-bottom:1px solid var(--border)}.dtbl tr:last-child td{border-bottom:0}.dtbl tr.click{cursor:pointer}.dtbl tr.click:hover td{background:var(--hover-cream)}`;
  st.textContent += `.nodiv .statc-d{display:none}.nodiv .statc{padding:14px 16px}.nodiv .statc-v{margin-top:14px;font-size:24px}
  .skel{position:absolute;inset:0;background:#fff;z-index:3;pointer-events:none;animation:skelout .15s linear .4s forwards}.skel .sr{display:flex;gap:14px;align-items:center;height:40px;padding:0 14px;border-bottom:1px solid #eee}.skel .sr i{display:block;height:10px}
  @keyframes skelout{to{opacity:0;visibility:hidden}}.xfade>*{animation:os-fade .22s ease both}.stack{display:flex}.stack .avatar{margin-left:-6px;box-shadow:0 0 0 2px #fff}.stack .avatar:first-child{margin-left:0}.avatar-pop{animation:badge-pop .45s cubic-bezier(.22,.8,.24,1) both}
  .gridbox{position:relative}`;
  document.head.appendChild(st);

  const S = () => DM.S;
  const ui = (DM.ui.crm = DM.ui.crm || { q: '', seg: 'all', owner: 'all', sort: 'name', dir: 1, sel: [], cq: '', cparty: 'all' });
  const users = () => S().users || [], parties = () => S().parties || [], contacts = () => S().contacts || [];
  const uname = (id) => { const u = DM.by(users(), id); return u ? u.name : id === 'anuma' ? 'Anuma' : id || '—'; };
  const party = (id) => DM.by(parties(), id);
  const DAY = 864e5, NOW = new Date('2026-10-27').getTime();
  const quiet = (p) => p.status === 'quiet' || (p.lastOrderAt && NOW - new Date(p.lastOrderAt) > 30 * DAY);
  const over = (p) => (p.outstanding || 0) > (p.creditLimit || 0) && (p.creditLimit || 0) > 0;
  const hiCut = () => { const v = parties().map((p) => p.lifetime || 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length * 0.75)] : 0; };
  const SEGS = [
    { key: 'all', label: 'All parties', test: () => true },
    { key: 'active', label: 'Active', test: (p) => p.status === 'active' && !quiet(p) },
    { key: 'high', label: 'High value', test: (p) => (p.lifetime || 0) >= hiCut() },
    { key: 'over', label: 'Over credit limit', test: over },
    { key: 'quiet', label: 'Quiet 30+ days', test: quiet },
    { key: 'blocked', label: 'Blocked', test: (p) => p.status === 'blocked' },
  ];
  const statusBadge = (p) => (p.status === 'blocked' ? DM.badge('Blocked', 'red', 1) : quiet(p) ? DM.badge('Quiet', 'amber', 1) : DM.badge('Active', 'green', 1));
  const sortVal = { name: (p) => (p.name || '').toLowerCase(), outstanding: (p) => p.outstanding || 0, lifetime: (p) => p.lifetime || 0, last: (p) => p.lastOrderAt || '', orders: (p) => p.orders30d || 0 };

  const crmTabs = (cur) => `<div class="tabs"><a class="tab ${cur === 'parties' ? 'on' : ''}" href="#/crm/accounts">${I('building')} Parties <span class="badge">${parties().length}</span></a><a class="tab ${cur === 'contacts' ? 'on' : ''}" href="#/crm/contacts">${I('user')} Contacts <span class="badge">${contacts().length}</span></a></div>`;
  const th = (k, l, num) => `<th class="th ${num ? 'num' : ''}" data-act="crm-sort" data-arg="${k}">${l}${ui.sort === k ? (ui.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`;
  const chk = (on) => `<span class="chk ${on ? 'on' : ''}">${on ? I('check').replace('class="i "', 'class="i" style="width:10px;height:10px;stroke-width:3"') : ''}</span>`;

  /* ───── parties list (live NuHome design: stat cards, segmented tabs, AG Grid, right drawer) ───── */
  const stateOf = (p) => (DM.stateOf ? DM.stateOf(p) : p.region || '—');
  const ensureNos = () => { let n = 1002; const ps = parties(); const used = ps.map((p) => parseInt(String(p.no || '').replace(/\D/g, '')) || 0); n = Math.max(1002, ...used); ps.forEach((p) => { if (!p.no) p.no = 'AC-' + ++n; }); };
  ui.hide = ui.hide || { owner: true, outstanding: true }; ui.chide = ui.chide || {};
  const ctsOf = (p) => contacts().filter((c) => c.partyId === p.id);
  const cstatus = (p) => (p.status === 'blocked' ? DM.status('Blocked', 'red') : quiet(p) ? DM.status('Quiet', 'amber') : DM.status('Active', 'green'));
  const crmHead = (cur) => `${DM.header('CRM', '', cur === 'parties' ? `<a class="btn" href="#/crm/accounts/create">${I('plus')} New party</a>` : `<a class="btn" href="#/crm/contacts/new">${I('plus')} New contact</a>`)}`;
  const skel = (key) => { DM.ui.skeld = DM.ui.skeld || {}; const k = key + '|' + DM.uc; if (DM.ui.skeld[k]) return ''; DM.ui.skeld[k] = 1; const w = [90, 220, 120, 120, 90, 100, 70]; return `<div class="skel"><div class="sr" style="background:#fafafa;height:40px">${w.map((x) => `<i class="shimmer" style="width:${x}px"></i>`).join('')}</div>${Array.from({ length: 12 }, () => `<div class="sr">${w.map((x) => `<i class="shimmer" style="width:${x - 10 + (Math.random() * 20 | 0)}px"></i>`).join('')}</div>`).join('')}</div>`; };
  const cnt = (n, k) => `<span data-count="${n}" data-ck="${k}">${F.num(n)}</span>`;
  const cards = () => { const o = (S().orders || []).filter((x) => x.status !== 'cancelled').length; const ch = (S().threads || []).filter((t) => t.status === 'open').length; return `<div class="grid g4 nodiv stagger" style="margin-bottom:16px">${DM.statCard('Parties', cnt(parties().length, 'a'), null, 'building')}${DM.statCard('Contacts', cnt(contacts().length, 'b'), null, 'users')}${DM.statCard('Confirmed orders', cnt(o, 'c'), null, 'package')}${DM.statCard('Open chats', cnt(ch, 'd'), null, 'chat')}</div>`; };
  const gridFoot = (n, noun) => (n > 50 ? '' : `<div class="gridfoot"><span>${F.num(n)} ${noun} in view</span><span class="grow"></span><span class="pg">50 / page ${I('chevD')}</span><span>1–${n} of ${F.num(n)}</span><span class="pn">${I('chevL')}</span><span class="pn">${I('chevR')}</span></div>`);
  const PCOLS = [
    { id: 'no', label: 'Number', w: '120px', render: (p) => `<span class="mono b" style="font-size:11.5px">${esc(p.no)}</span>` },
    { id: 'name', label: 'Party', flex: 2, render: (p) => `<b>${esc(p.name)}</b>` },
    { id: 'contacts', label: 'Contacts', render: (p) => { const c = ctsOf(p); return c.length ? `<span class="row" style="gap:6px">${DM.avatar(c.find((x) => x.primary)?.name || c[0].name, 'sm')}${esc(c.find((x) => x.primary)?.name || c[0].name)}${c.length > 1 ? `<span class="muted">+${c.length - 1}</span>` : ''}</span>` : '<span class="muted">—</span>'; } },
    { id: 'phone', label: 'WhatsApp', render: (p) => esc(p.phone || '—') },
    { id: 'city', label: 'City', render: (p) => esc(p.city || '—') },
    { id: 'state', label: 'State', render: (p) => esc(stateOf(p)) },
    { id: 'owner', label: 'Owner', render: (p) => esc(uname(p.owner)) },
    { id: 'outstanding', label: 'Outstanding', num: 1, render: (p) => `<span class="${over(p) ? 'down' : ''}">${F.inr(p.outstanding || 0)}</span>` },
    { id: 'status', label: 'Status', w: '120px', render: cstatus },
  ];
  const sortRows = (rows) => rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  function filtered() {
    const seg = SEGS.find((s) => s.key === ui.seg) || SEGS[0]; const q = ui.q.toLowerCase().trim();
    return sortRows(parties().filter((p) => seg.test(p) && (ui.owner === 'all' || p.owner === ui.owner) && (!q || [p.name, p.no, p.city, stateOf(p), p.gstin, p.phone, p.type].join(' ').toLowerCase().includes(q))));
  }
  const tabsSeg = (cur) => DM.seg([{ key: 'parties', label: 'Parties' }, { key: 'contacts', label: 'Contacts' }], cur, 'crm-tab');
  DM.act('crm-tab', (el) => DM.go(el.dataset.arg === 'contacts' ? '/crm/contacts' : '/crm/accounts'));
  const colsBtn = (hide, n) => `<button class="btn outline" data-act="crm-cols">${I('columns')} Columns${n ? ' · ' + n + ' off' : ''}</button>`;
  const partiesPage = { title: 'CRM', crumb: 'CRM', render() {
    ensureNos();
    const rows = filtered(); const hid = Object.values(ui.hide).filter(Boolean).length; const seg = SEGS.find((s) => s.key === ui.seg) || SEGS[0];
    const cols = PCOLS;
    return `<div class="page wide">${crmHead('parties')}${cards()}${tabsSeg('parties')}
      <div class="toolbar"><button class="btn outline" data-act="crm-view">${I('grid')} ${esc(seg.label)} ${I('chevD')}</button><div class="row gap12 right">${colsBtn(ui.hide, hid)}${DM.searchBox('crm-q', 'Search parties…', ui.q)}</div></div>
      <div class="gridbox">${skel('parties')}${DM.table(cols, rows, { go: (p) => '/crm/accounts/' + p.id, pageSize: 50, empty: 'No parties match this view.', rowCls: (p) => (p._new ? 'row-new' : '') })}${rows.length ? gridFoot(rows.length, 'parties') : ''}</div></div>`;
  }, after(view, { params }) { setTimeout(applyHide, 40); setTimeout(() => { const m = DM.match(DM.path()); if (m && m.pg === partiesPage || (m && m.pg.pattern === '/crm/accounts/:id')) syncDrawer(m.params.id); else syncDrawer(null); }, 0); } };
  const applyHide = () => { const api = DM._gridApis && DM._gridApis[0]; const m = DM.match(DM.path()); if (!api || !m || !/crm\/accounts/.test(DM.path())) return; try { api.setColumnsVisible(PCOLS.filter((c) => ui.hide[c.id]).map((c) => c.label), false); } catch (e) {} };
  DM.page('/crm/accounts', partiesPage);
  DM.act('crm-view', (el) => DM.menu(el, SEGS.map((s) => ({ label: `${s.label} · ${parties().filter(s.test).length}`, check: ui.seg === s.key, run: () => { ui.seg = s.key; DM.render(); } }))));
  DM.act('crm-cols', (el) => DM.menu(el, PCOLS.filter((c) => c.id !== 'name').map((c) => ({ label: c.label, check: !ui.hide[c.id], run: () => { ui.hide[c.id] = !ui.hide[c.id]; const api = DM._gridApis && DM._gridApis[0]; if (api) api.setColumnsVisible([c.label], !ui.hide[c.id]); const n = Object.values(ui.hide).filter(Boolean).length; el.innerHTML = `${I('columns')} Columns${n ? ' · ' + n + ' off' : ''}`; } }))));
  DM.input('crm-q', (v) => { ui.q = v; DM.render(); });
  DM.act('crm-clear', () => { ui.seg = 'all'; ui.q = ''; ui.owner = 'all'; DM.render(); });
  DM.act('crm-export', () => { const rows = filtered(); const csv = ['Number,Party,City,State,GSTIN,Outstanding,Lifetime'].concat(rows.map((p) => [p.no, p.name, p.city, stateOf(p), p.gstin, p.outstanding, p.lifetime].map((x) => '"' + (x ?? '') + '"').join(','))).join('\n'); try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'parties.csv'; a.click(); } catch (e) {} DM.toast(`Exported ${rows.length} parties`, 'download'); });

  /* ───── right drawer for a party ───── */
  let dEl = null; const dui = (ui.d = ui.d || { tab: 'overview', id: null });
  const closeD = () => { const w = document.getElementById('drawer-wrap'); if (w) w.remove(); dEl = null; };
  function drawerBody(p) {
    const cts = ctsOf(p), orders = (S().orders || []).filter((o) => o.partyId === p.id && o.status !== 'cancelled'), threads = (S().threads || []).filter((t) => t.partyId === p.id);
    const openChats = threads.filter((t) => t.status === 'open').length; const team = (p.team || (p.owner ? [p.owner] : [])).map((id) => DM.by(users(), id) || { id, name: uname(id) });
    const tabs = DM.seg([{ key: 'overview', label: 'Overview' }, { key: 'people', label: 'People' }, { key: 'orders', label: 'Orders' }, { key: 'chats', label: 'Chats' }, { key: 'fields', label: 'All fields' }], dui.tab, 'crm-dtab');
    const ordTbl = (list) => (list.length ? `<table class="dtbl"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th style="text-align:right">Total</th></tr></thead><tbody>${list.map((o) => `<tr class="click" data-go="/orders/${o.id}"><td class="mono b">${esc(o.no)}</td><td>${F.date(o.placedAt)}</td><td>${DM.status(o.status, o.status === 'delivered' ? 'green' : 'blue')}</td><td style="text-align:right" class="mono">${F.inr(o.total)}</td></tr>`).join('')}</tbody></table>` : `<div class="empty-card" style="border:0;padding:30px"><span class="icotile lg">${I('package')}</span><div class="b" style="margin-top:8px">No confirmed orders yet</div><div class="muted sm">Orders from this party show up here.</div></div>`);
    const peopleList = () => (cts.length ? cts.map((c) => `<div class="drow" data-go="/crm/contacts/${c.id}" style="cursor:pointer">${DM.avatar(c.name, 'sm')}<div class="grow"><div class="b sm">${esc(c.name)} ${c.primary ? DM.badge('Primary', 'blue') : ''}</div><div class="xs muted">${esc([c.role, c.phone].filter(Boolean).join(' · '))}</div></div>${I('chevR')}</div>`).join('') : `<div class="empty-card" style="border:0;padding:30px"><span class="icotile lg">${I('users')}</span><div class="b" style="margin-top:8px">No contacts yet</div><div class="muted sm">Contacts added to this party show up here.</div></div>`);
    let body = '';
    if (dui.tab === 'overview') {
      body = `<div class="grid g3" style="margin:14px 0 0">${DM.statCard('Confirmed orders', `<span data-count="${orders.length}" data-ck="d1">${orders.length}</span>`, null, 'package')}${DM.statCard('Open chats', `<span data-count="${openChats}" data-ck="d2">${openChats}</span>`, null, 'chat')}${DM.statCard('Contacts', `<span data-count="${cts.length}" data-ck="d3">${cts.length}</span>`, null, 'users')}</div>
      <div class="row" style="margin:20px 0 8px"><b class="sm">Your account team</b><button class="btn ghost sm right" data-act="crm-team">Manage team</button></div>
      <div class="card">${team.length ? team.map((u) => `<div class="drow">${DM.avatar(u.name, 'sm' + ((ui.newTeam || []).includes(u.id) ? ' avatar-pop' : ''))}<div class="grow"><div class="b sm">${esc(u.name)}</div><div class="xs muted">${esc(u.role || '')}</div></div></div>`).join('') : `<div class="empty-card" style="border:0;padding:26px"><span class="icotile lg">${I('users')}</span><div class="b" style="margin-top:8px">Nobody assigned yet</div><div class="muted sm">Use Manage team to assign someone.</div></div>`}</div>
      <div class="row" style="margin:20px 0 8px"><b class="sm">Contacts</b><span class="muted sm">${cts.length}</span><button class="btn outline sm right" data-act="crm-addc">${I('plus')} Add contact ${I('chevD')}</button></div>
      <div class="card">${peopleList()}</div>
      <div class="sm muted" style="margin:20px 0 8px">Confirmed orders · all contacts</div><div class="card"><div class="dh">Orders</div>${ordTbl(orders)}</div>`;
    } else if (dui.tab === 'people') body = `<div class="row" style="margin:14px 0 8px"><b class="sm">People</b><span class="muted sm">${cts.length}</span><button class="btn outline sm right" data-act="crm-addc">${I('plus')} Add contact ${I('chevD')}</button></div><div class="card">${peopleList()}</div>`;
    else if (dui.tab === 'orders') body = `<div class="card" style="margin-top:14px"><div class="dh">Orders</div>${ordTbl(orders)}</div>`;
    else if (dui.tab === 'chats') body = `<div class="card" style="margin-top:14px">${threads.length ? threads.map((t) => `<div class="drow" data-go="/inbox/threads?case=${t.id}" style="cursor:pointer"><span class="monotag">${esc(t.caseNo || t.id)}</span><div class="grow"><div class="b sm trunc">${esc(t.subject || t.preview || t.channel)}</div><div class="xs muted trunc">${esc(t.preview || '')}</div></div>${DM.status(t.status === 'open' ? 'Open' : t.status === 'hold' ? 'On hold' : 'Closed', t.status === 'open' ? 'green' : 'grey')}</div>`).join('') : `<div class="empty-card" style="border:0;padding:30px"><span class="icotile lg">${I('chat')}</span><div class="b" style="margin-top:8px">No chats yet</div><div class="muted sm">Conversations with this party show up here.</div></div>`}</div>`;
    else { const kv = [['Number', p.no], ['Name', p.name], ['Type', p.type], ['City', p.city], ['State', stateOf(p)], ['Region', p.region], ['WhatsApp', p.phone], ['Email', p.email], ['GSTIN', p.gstin], ['Payment terms', p.terms], ['Price band', p.priceBand], ['Credit limit', F.inr(p.creditLimit || 0)], ['Outstanding', F.inr(p.outstanding || 0)], ['Lifetime value', F.inrc(p.lifetime || 0)], ['Last order', p.lastOrderAt ? F.date(p.lastOrderAt) : '—'], ['Tags', (p.tags || []).join(', ') || '—']]; body = `<div class="row" style="margin:14px 0 8px"><b class="sm">All fields</b><button class="btn outline sm right" data-act="crm-edit" data-arg="${p.id}">${I('edit')} Edit</button></div><div class="card pad"><dl class="kv">${kv.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v || '—')}</dd>`).join('')}</dl></div>`; }
    return `<div style="margin-top:4px">${tabs}</div>${body}`;
  }
  function openDrawer(p) {
    closeD(); dui.id = p.id;
    const n = ctsOf(p).length;
    const title = `<div><div class="row" style="gap:10px"><span style="font-size:16px;font-weight:600">${esc(p.name)}</span><span class="muted sm" style="font-weight:400">${n} contact${n === 1 ? '' : 's'}</span></div><div class="row" style="margin-top:6px;gap:8px;font-weight:400"><span class="mono xs">${esc(p.no)}</span><span class="muted xs">${esc([p.city, stateOf(p)].filter((x) => x && x !== '—').join(', '))}</span>${cstatus(p)}</div></div>`;
    dEl = DM.drawer({ title, body: drawerBody(p), actions: `<button class="btn outline icon sm" style="color:#e03a3a;margin-right:6px" data-act="crm-del" data-arg="${p.id}" title="Delete party">${I('trash')}</button>` });
    countIn(dEl);
    const dr = dEl.querySelector('.drawer'); const x = dr.querySelector('[data-act="close-drawer"]'); if (x) { x.dataset.act = 'crm-close'; x.className = 'btn outline icon sm'; }
    dr.insertAdjacentHTML('beforeend', `<div class="drawer-f"><button class="btn outline" data-act="crm-close">Close</button></div>`);
    dEl.addEventListener('mousedown', (e) => { if (e.target === dEl) setTimeout(() => DM.go('/crm/accounts'), 0); });
  }
  function syncDrawer(id) { const w = document.getElementById('drawer-wrap'); if (!id) { if (w && dEl) closeD(); return; } const p = party(id); if (p) { if (!w || dui.id !== id || !dEl) { if (dui.id !== id) dui.tab = 'overview'; openDrawer(p); } } }
  const countIn = (root) => root.querySelectorAll('[data-count]').forEach((e) => { const to = +e.dataset.count; if (!to) return; const t0 = performance.now(); const tick = (t) => { const k = Math.min(1, (t - t0) / 600); e.textContent = F.num(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); }; e.textContent = '0'; requestAnimationFrame(tick); });
  const repaintD = () => { const p = party(dui.id); if (!p || !dEl) return; const b = dEl.querySelector('.modal-b'); b.innerHTML = drawerBody(p); b.classList.remove('xfade'); void b.offsetWidth; b.classList.add('xfade'); countIn(b); };
  DM.act('crm-close', () => { closeD(); dui.id = null; DM.go('/crm/accounts'); });
  DM.act('crm-dtab', (el) => { dui.tab = el.dataset.arg; repaintD(); });
  DM.act('crm-del', (el) => DM.confirm('Delete this party?', 'The party and its contacts are removed from the CRM.', () => { const id = el.dataset.arg; S().parties = parties().filter((p) => p.id !== id); S().contacts = contacts().filter((c) => c.partyId !== id); closeD(); dui.id = null; DM.toast('Party deleted', 'trash'); DM.go('/crm/accounts'); }, 'Delete'));
  DM.act('crm-team', () => { const p = party(dui.id); const cur = p.team || (p.owner ? [p.owner] : []); DM.modal({ title: 'Manage team', body: `<p class="muted sm" style="margin-bottom:10px">People who look after ${esc(p.name)}.</p><div class="col" style="gap:6px">${users().map((u) => `<label class="row" style="padding:6px 8px;border:1px solid var(--border);border-radius:8px"><input type="checkbox" name="u_${u.id}" ${cur.includes(u.id) ? 'checked' : ''}>${DM.avatar(u.name, 'sm')}<span class="grow">${esc(u.name)}</span><span class="xs muted">${esc(u.role || '')}</span></label>`).join('')}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save team', run: (d) => { const ids = users().filter((u) => d.querySelector(`[name=u_${u.id}]`).checked).map((u) => u.id); ui.newTeam = ids.filter((i) => !cur.includes(i)); p.team = ids; p.owner = ids[0] || ''; DM.toast('Account team updated'); DM.render(); setTimeout(() => { repaintD(); setTimeout(() => { ui.newTeam = []; }, 600); }, 60); } }] }); });
  DM.act('crm-addc', (el) => DM.menu(el, [{ label: 'New contact', icon: 'plus', run: () => DM.go('/crm/contacts/new?party=' + dui.id) }, { label: 'Link an existing contact', icon: 'link', run: () => { const p = party(dui.id); const free = contacts().filter((c) => c.partyId !== p.id); DM.modal({ title: 'Link an existing contact', body: free.length ? DM.field('Contact', 'cid', { options: free.map((c) => c.name + ' · ' + ((party(c.partyId) || {}).name || 'no party')) }) : '<p class="muted">No other contacts to link.</p>', actions: [{ label: 'Cancel', cls: 'outline' }, ...(free.length ? [{ label: 'Link', run: (d) => { const i = d.querySelector('[name=cid]').selectedIndex; const c = free[i]; c.partyId = p.id; DM.toast(`${c.name} linked to ${p.name}`, 'link'); DM.render(); } }] : [])] }); } }]));
  window.addEventListener('hashchange', () => { if (!/^#\/crm\/accounts\/(?!create)[^/?]+/.test(location.hash)) { closeD(); dui.id = null; } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && /^#\/crm\/accounts\/(?!create)[^/]+/.test(location.hash)) { dui.id = null; setTimeout(() => DM.go('/crm/accounts'), 0); } });

  /* ───── create party ───── */
  const ownerSel = (val) => `<div class="field"><label>Owner</label><select class="select" name="owner">${users().map((u) => `<option value="${u.id}" ${u.id === val ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></div>`;
  DM.page('/crm/accounts/create', { title: 'New party', crumb: 'New party', render() {
    const regions = [...new Set(parties().map((p) => p.region).filter(Boolean))];
    return `<div class="page" style="max-width:820px"><a class="btn ghost sm" href="#/crm/accounts">${I('arrowL')} Parties</a>${DM.header('New party', 'Add a dealer, contractor or distributor.')}
    <form id="party-form" class="card pad col gap16" onsubmit="return false"><div class="grid g2">${DM.field('Party name *', 'name', { ph: 'e.g. Sharma Electricals' })}${DM.field('Type', 'type', { options: [...new Set(['Dealer', 'Contractor', 'Distributor', 'Retailer', 'OEM', ...parties().map((p) => p.type).filter(Boolean)])] })}${DM.field('City', 'city')}${DM.field('Region', 'region', { ph: regions[0] || 'West' })}${DM.field('Phone', 'phone', { ph: '+91 98xxx xxxxx' })}${DM.field('Email', 'email', { type: 'email' })}${DM.field('GSTIN', 'gstin', { ph: '27ABCDE1234F1Z5' })}${DM.field('Payment terms', 'terms', { options: ['Advance', 'Net 15', 'Net 30', 'Net 45', '15/30', '30/45'] })}${DM.field('Credit limit (₹)', 'creditLimit', { type: 'number', value: 200000 })}${ownerSel(users()[0] && users()[0].id)}</div>
    <div class="row"><a class="btn outline" href="#/crm/accounts">Cancel</a><button class="btn right" data-act="crm-create">${I('check')} Create party</button></div></form></div>`;
  } });
  DM.act('crm-create', () => {
    const d = DM.formData(document.getElementById('party-form'));
    if (!d.name.trim()) { DM.toast('Party name is required', 'alert'); return; }
    const p = { id: DM.uid('p'), name: d.name.trim(), type: d.type, city: d.city, region: d.region, owner: d.owner, phone: d.phone, email: d.email, gstin: d.gstin, terms: d.terms, priceBand: 'A', creditLimit: +d.creditLimit || 0, outstanding: 0, lastOrderAt: null, orders30d: 0, lifetime: 0, status: 'active', tags: [] };
    p._new = 1; setTimeout(() => { delete p._new; }, 2600); parties().unshift(p); DM.toast(`${p.name} added`); DM.go('/crm/accounts/' + p.id);
  });

  DM.page('/crm/accounts/:id', Object.assign({}, partiesPage, { title: 'CRM', crumb: (p) => (party(p.id) || {}).name || 'Party' }));
  DM.act('crm-addtag', (el) => DM.modal({ title: 'Add tag', body: DM.field('Tag', 't'), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add', run: (d) => { const t = d.querySelector('[name=t]').value.trim(); if (!t) return false; const p = party(el.dataset.arg); p.tags = (p.tags || []).concat(t); DM.render(); } }] }));
  DM.act('crm-block', (el) => { const p = party(el.dataset.arg); p.status = p.status === 'blocked' ? 'active' : 'blocked'; DM.toast(p.status === 'blocked' ? 'Party blocked' : 'Party unblocked', 'lock'); DM.render(); });
  DM.act('crm-remind', (el) => { const p = party(el.dataset.arg); DM.toast(`Reminder sent to ${p.name} on WhatsApp`, 'send'); });
  DM.act('crm-credit', (el) => { const p = party(el.dataset.arg); DM.modal({ title: 'Credit limit', body: DM.field('Credit limit (₹)', 'cl', { type: 'number', value: p.creditLimit }) + '<div style="height:10px"></div>' + DM.field('Terms', 'terms', { options: ['Advance', 'Net 15', 'Net 30', 'Net 45', '15/30', '30/45'], value: p.terms }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (d) => { p.creditLimit = +d.querySelector('[name=cl]').value || 0; p.terms = d.querySelector('[name=terms]').value; DM.toast('Credit updated'); DM.render(); } }] }); });
  DM.act('crm-edit', (el) => { const p = party(el.dataset.arg); DM.modal({ title: 'Edit party', lg: 1, body: `<div class="grid g2">${DM.field('Name', 'name', { value: p.name })}${DM.field('Type', 'type', { value: p.type })}${DM.field('City', 'city', { value: p.city })}${DM.field('Region', 'region', { value: p.region })}${DM.field('Phone', 'phone', { value: p.phone })}${DM.field('Email', 'email', { value: p.email })}${DM.field('GSTIN', 'gstin', { value: p.gstin })}${ownerSel(p.owner)}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { Object.assign(p, DM.formData(d)); DM.toast('Party updated'); DM.render(); } }] }); });
  DM.act('crm-draft', (el) => { const p = party(el.dataset.arg); const prod = (S().products || [])[0]; const n = (S().drafts || []).length + 1; const d = { id: DM.uid('d'), no: 'DRF-' + (1000 + n + Math.floor(Math.random() * 90)), partyId: p.id, status: 'pending', total: prod ? prod.price * 10 : 0, createdAt: new Date().toISOString(), by: 'You', note: 'Created from CRM', lines: prod ? [{ productId: prod.id, name: prod.name, qty: 10, unit: prod.unit, price: prod.price, state: 'pending' }] : [] }; (S().drafts = S().drafts || []).unshift(d); DM.toast('Draft order created'); DM.go('/orders/drafts/' + d.id); });

  /* ───── contacts ───── */
  const CCOLS = [
    { id: 'name', label: 'Contact', flex: 2, render: (c) => `<div class="row" style="gap:8px">${DM.avatar(c.name, 'sm')}<b>${esc(c.name)}</b>${c.primary ? DM.badge('Primary', 'blue') : ''}</div>` },
    { id: 'party', label: 'Party', flex: 2, render: (c) => esc((party(c.partyId) || {}).name || '—') },
    { id: 'role', label: 'Role', render: (c) => esc(c.role || '—') },
    { id: 'phone', label: 'WhatsApp', render: (c) => esc(c.phone || '—') },
    { id: 'email', label: 'Email', flex: 2, render: (c) => esc(c.email || '—') },
    { id: 'chats', label: 'Chats', num: 1, w: '90px', render: (c) => (S().threads || []).filter((t) => t.contactId === c.id).length || '—' },
  ];
  DM.page('/crm/contacts', { title: 'CRM · Contacts', crumb: 'CRM', render() {
    const q = ui.cq.toLowerCase().trim(); ensureNos();
    const rows = contacts().filter((c) => (ui.cparty === 'all' || c.partyId === ui.cparty) && (!q || [c.name, c.role, c.phone, c.email, (party(c.partyId) || {}).name].join(' ').toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
    const hid = Object.values(ui.chide).filter(Boolean).length; const pn = ui.cparty === 'all' ? 'All contacts' : (party(ui.cparty) || {}).name;
    return `<div class="page wide">${crmHead('contacts')}${cards()}${tabsSeg('contacts')}
      <div class="toolbar"><button class="btn outline" data-act="crm-cview">${I('grid')} ${esc(pn)} ${I('chevD')}</button><div class="row gap12 right"><button class="btn outline" data-act="crm-ccols">${I('columns')} Columns${hid ? ' · ' + hid + ' off' : ''}</button>${DM.searchBox('crm-cq', 'Search contacts…', ui.cq)}</div></div>
      <div class="gridbox">${skel('contacts')}${DM.table(CCOLS.filter((c) => !ui.chide[c.id]), rows, { go: (c) => '/crm/contacts/' + c.id, pageSize: 50, empty: 'No contacts match.', rowCls: (c) => (c._new ? 'row-new' : '') })}${rows.length ? gridFoot(rows.length, 'contacts') : ''}</div></div>`;
  } });
  DM.act('crm-cview', (el) => DM.menu(el, [{ label: 'All contacts', check: ui.cparty === 'all', run: () => { ui.cparty = 'all'; DM.render(); } }].concat(parties().slice(0, 18).map((p) => ({ label: p.name, check: ui.cparty === p.id, run: () => { ui.cparty = p.id; DM.render(); } })))));
  DM.act('crm-ccols', (el) => DM.menu(el, CCOLS.filter((c) => c.id !== 'name').map((c) => ({ label: c.label, check: !ui.chide[c.id], run: () => { ui.chide[c.id] = !ui.chide[c.id]; DM.render(); } }))));
  DM.input('crm-cq', (v) => { ui.cq = v; DM.render(); });

  const cform = (c, pid) => `<form id="contact-form" class="card pad col gap16" onsubmit="return false"><div class="grid g2">${DM.field('Full name *', 'name', { value: c.name })}<div class="field"><label>Party</label><select class="select" name="partyId">${parties().map((p) => `<option value="${p.id}" ${p.id === (c.partyId || pid) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>${DM.field('Role', 'role', { value: c.role, ph: 'Owner, Accounts, Purchase…' })}${DM.field('Phone', 'phone', { value: c.phone, ph: '+91 …' })}${DM.field('Email', 'email', { value: c.email, type: 'email' })}<label class="row" style="padding-top:22px"><input type="checkbox" name="primary" ${c.primary ? 'checked' : ''}> Primary contact for the party</label></div></form>`;
  DM.page('/crm/contacts/new', { title: 'New contact', crumb: 'New contact', render({ q }) {
    return `<div class="page" style="max-width:760px"><a class="btn ghost sm" href="#/crm/contacts">${I('arrowL')} Contacts</a>${DM.header('New contact')}${cform({}, q.get('party'))}<div class="row" style="margin-top:12px"><a class="btn outline" href="#/crm/contacts">Cancel</a><button class="btn right" data-act="crm-contact-create">${I('check')} Add contact</button></div></div>`;
  } });
  DM.act('crm-contact-create', () => {
    const d = DM.formData(document.getElementById('contact-form')); if (!d.name.trim()) return DM.toast('Name is required', 'alert');
    if (d.primary) contacts().forEach((c) => { if (c.partyId === d.partyId) c.primary = false; });
    const c = { id: DM.uid('c'), partyId: d.partyId, name: d.name.trim(), role: d.role, phone: d.phone, email: d.email, primary: !!d.primary }; c._new = 1; setTimeout(() => { delete c._new; }, 2600); contacts().unshift(c); DM.toast('Contact added'); DM.go('/crm/contacts/' + c.id);
  });
  DM.page('/crm/contacts/:id', { title: 'Contact', crumb: (p) => (DM.by(contacts(), p.id) || {}).name || 'Contact', render({ params }) {
    const c = DM.by(contacts(), params.id); if (!c) return `<div class="page"><div class="empty"><h3>Contact not found</h3><a class="btn outline" href="#/crm/contacts">Back</a></div></div>`;
    const p = party(c.partyId); const th = (S().threads || []).filter((t) => t.contactId === c.id);
    return `<div class="page" style="max-width:900px"><a class="btn ghost sm" href="#/crm/contacts">${I('arrowL')} Contacts</a><div class="rec-head" style="margin-top:6px">${DM.avatar(c.name, 'lg')}<div class="grow"><h1 style="font-size:20px;font-weight:600">${esc(c.name)}</h1><div class="muted sm">${esc(c.role || '')}${p ? ` at <a href="#/crm/accounts/${p.id}" style="text-decoration:underline">${esc(p.name)}</a>` : ''}</div></div><button class="btn outline" data-act="crm-contact-del" data-arg="${c.id}">${I('trash')} Delete</button></div>
    <div class="grid" style="grid-template-columns:2fr 1fr;align-items:start"><div><div class="muted sm" style="margin-bottom:6px">Edit details</div>${cform(c)}<div class="row" style="margin-top:12px"><button class="btn right" data-act="crm-contact-save" data-arg="${c.id}">${I('check')} Save changes</button></div></div>
    <div class="card"><div class="card-h"><h3>Conversations</h3></div>${th.map((t) => `<div class="listrow" data-go="/inbox/threads?case=${t.id}"><div class="grow"><div class="b sm">${esc(t.subject || t.channel)}</div><div class="xs muted trunc">${esc(t.preview || '')}</div></div></div>`).join('') || '<div class="empty sm">None yet.</div>'}</div></div></div>`;
  } });
  DM.act('crm-contact-save', (el) => { const c = DM.by(contacts(), el.dataset.arg); const d = DM.formData(document.getElementById('contact-form')); if (!d.name.trim()) return DM.toast('Name is required', 'alert'); if (d.primary) contacts().forEach((x) => { if (x.partyId === d.partyId) x.primary = false; }); Object.assign(c, d); DM.toast('Contact saved'); DM.render(); });
  DM.act('crm-contact-del', (el) => DM.confirm('Delete contact?', 'This removes the contact from the party.', () => { S().contacts = contacts().filter((c) => c.id !== el.dataset.arg); DM.toast('Contact deleted', 'trash'); DM.go('/crm/contacts'); }, 'Delete'));

  DM.searchProviders.push((q) => parties().filter((p) => (p.name || '').toLowerCase().includes(q)).slice(0, 5).map((p) => ({ label: p.name, sub: 'Party · ' + (p.city || ''), icon: 'building', url: '/crm/accounts/' + p.id })).concat(contacts().filter((c) => (c.name || '').toLowerCase().includes(q)).slice(0, 4).map((c) => ({ label: c.name, sub: 'Contact', icon: 'user', url: '/crm/contacts/' + c.id }))));
})();
