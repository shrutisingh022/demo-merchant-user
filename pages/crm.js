/* CRM — Parties | Contacts (+ 800px party drawer as a route). Spec: docs/spec/crm-products.md §0–§2. Same component for all three use cases; data differs. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, S = () => DM.S;
  const st = document.createElement('style'); st.dataset.for = 'crm';
  st.textContent = `
  .crm-h{display:flex;align-items:center;margin-bottom:16px}.crm-h h1{font-size:20px;font-weight:600;letter-spacing:-.01em}
  .crm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}.crm-stats.cx-two{grid-template-columns:repeat(2,minmax(0,1fr))}
  .crm-bar{display:flex;align-items:center;gap:8px;margin-bottom:12px}
  .crm-mod{display:inline-flex;align-items:center;gap:6px;margin-left:4px;font-size:12px;color:var(--muted-foreground)}
  .crm-mod .btn{height:24px}
  .crm-wrap .toolbar{margin:0 0 10px}
  .cx-dsec{margin-top:20px}.cx-dsec:first-child{margin-top:4px}
  .cx-dsec-h{display:flex;align-items:center;gap:8px;margin-bottom:8px;min-height:24px}.cx-dsec-h h3{font-size:12px;font-weight:600}.cx-dsec-h .cx-cn{font-size:12px;color:var(--muted-foreground)}
  .cx-dsec-h .right{display:flex;gap:6px;align-items:center}
  .cx-linkbtn{font-size:12px;font-weight:500;display:inline-flex;gap:5px;align-items:center;height:24px;padding:0 6px;border-radius:6px}.cx-linkbtn:hover{background:#f5f5f5}
  .cx-dcard{border:1px solid var(--border);border-radius:10px;background:#fff;overflow:hidden}
  .cx-dcard>.cx-dt{padding:10px 14px;font-size:12px;font-weight:600;border-bottom:1px solid var(--border)}
  .cx-dstats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .cx-team-row{display:flex;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border)}.cx-team-row:last-child{border:0}
  .cx-team-row .avatar{width:28px;height:28px;border-radius:8px}.cx-team-row b{font-weight:600}
  .cx-ccard{display:flex;align-items:center;gap:10px;height:52px;padding:0 12px;border:1px solid var(--border);border-radius:10px;background:#fff;cursor:pointer;width:100%;text-align:left;transition:background-color .15s}
  .cx-ccard+.ccard{margin-top:8px}.cx-ccard:hover{background:#fafafa}.cx-ccard.sel{box-shadow:0 0 0 1px #171717 inset}
  .cx-ccard .cx-rav{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:600;flex:none}
  .cx-ccard .cx-rav.u{background:#f1f1f1;color:#8a8a8a}
  .cx-ccard .cx-nm{font-size:12px;font-weight:600}.cx-ccard .cx-sb{font-size:12px;color:var(--muted-foreground)}.cx-ccard>svg.i:last-child{margin-left:auto;color:#a3a3a3}
  .cx-avstack{display:inline-flex}.cx-avstack .cx-rav{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:600;border:2px solid #fff;margin-left:-6px}.cx-avstack .cx-rav:first-child{margin-left:0}
  .cx-tbl2{width:100%;border-collapse:collapse;font-size:12px}.cx-tbl2 th{height:40px;text-align:left;padding:0 12px;font-weight:500;color:#525252;background:#fafafa;border-bottom:1px solid var(--border);white-space:nowrap}
  .cx-tbl2 td{height:40px;padding:0 12px;border-bottom:1px solid #eee;white-space:nowrap}.cx-tbl2 tr:last-child td{border:0}.cx-tbl2 .mono{font-family:ui-monospace,Menlo,monospace;font-variant-numeric:tabular-nums}
  .cx-tbl2wrap{overflow-x:auto}
  .cx-kv3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 20px;padding:14px}.cx-kv3 .cx-l{font-size:11px;color:var(--muted-foreground);margin-bottom:2px}.cx-kv3 .cx-v{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cx-kv2{display:grid;grid-template-columns:150px 1fr;gap:10px 16px;padding:14px;font-size:12px}.cx-kv2 .cx-l{color:var(--muted-foreground)}.cx-kv2 .cx-v{min-width:0;word-break:break-word}
  .cx-cdet{margin-top:16px;padding-top:16px;border-top:1px solid var(--border)}.cx-cdet-h{display:flex;align-items:center;gap:6px;margin-bottom:12px}.cx-cdet-h h2{font-size:16px;font-weight:600;flex:1}
  .cx-cform{border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px;background:#fff}.cx-cform h4{font-size:12px;font-weight:600}.cx-cform .cx-sub{font-size:12px;color:var(--muted-foreground);margin:2px 0 12px}
  .cx-cform .g2{gap:12px;margin-top:12px}.cx-cform .field>label{font-size:12px;font-weight:500}.cx-cform .cx-acts{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
  .cx-radios{display:flex;gap:16px;margin-top:2px}.cx-radios button{display:inline-flex;align-items:center;gap:6px;font-size:12px}.cx-radios .cx-rd{width:14px;height:14px;border-radius:50%;border:1.5px solid #a3a3a3;display:grid;place-items:center}.cx-radios .on .cx-rd{border-color:#171717}.cx-radios .on .cx-rd::after{content:"";width:6px;height:6px;border-radius:50%;background:#171717}
  .cx-seg-card{border:1px solid var(--border);border-radius:10px}.cx-seg-card .cx-hd{display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;font-weight:600}
  .cx-seg-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;min-height:44px}.cx-seg-row:last-child{border:0}.cx-seg-row .cx-l{width:120px;font-weight:500}.cx-seg-row .cx-v{flex:1;color:var(--muted-foreground);display:flex;gap:6px;align-items:center}.cx-seg-row .cx-v.cx-fg{color:var(--foreground)}
  .cx-asgn{display:flex;align-items:center;gap:8px;width:100%;height:24px;padding:0 6px;border-radius:6px;font-size:12px;text-align:left}.cx-asgn:hover{background:#f5f5f5}.cx-asgn .cx-rav{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:600;flex:none}
  .cx-lk-list{border:1px solid var(--border);border-radius:10px;max-height:230px;overflow:auto;margin-top:12px}.cx-lk-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);cursor:pointer}.cx-lk-row:last-child{border:0}.cx-lk-row:hover{background:#fafafa}.cx-lk-row.dis{opacity:.5;cursor:not-allowed}.cx-lk-row.sel{background:#f5f5f5}
  .cx-lk-row .cx-nm{font-weight:600}.cx-lk-row .cx-sb{color:var(--muted-foreground);font-size:11.5px}.cx-lk-row .cx-id{margin-left:auto;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--muted-foreground)}
  .cx-dd-filter{display:flex;justify-content:flex-end}
  `;
  document.head.appendChild(st);

  /* ───────── state ───────── */
  const defUI = () => ({ tab: 'parties', q: { parties: '', contacts: '' }, phone: { parties: '', contacts: '' }, status: { parties: '' }, view: { parties: '', contacts: '' }, views: { parties: [], contacts: [] }, d: null, from: 'parties' });
  const ui = () => { const m = (DM.ui.crm = DM.ui.crm || {}); return (m[DM.uc] = m[DM.uc] || defUI()); };
  const DEFAULT_HIDDEN = { parties: ['street'], contacts: ['email'] };
  const gid = (tab) => 'crm-' + tab + '-' + DM.uc;

  /* ───────── data helpers ───────── */
  const parties = () => S().parties || [], contacts = () => S().contacts || [];
  const partyById = (id) => parties().find((p) => p.id === id);
  const contactById = (id) => contacts().find((c) => c.id === id);
  const userById = (id) => (S().users || []).find((u) => u.id === id);
  const contactsOf = (p) => (p.contactIds || []).map(contactById).filter(Boolean);
  const confirmedOf = (p) => (S().drafts || []).filter((d) => d.partyId === p.id && !/pending|reject|draft|flag/i.test(d.status || ''));
  const chatsOf = (p) => (S().threads || []).filter((t) => t.partyId === p.id);
  const isOpenT = (t) => /open|escalat|hold/i.test(t.status || '');
  const MOD = (s) => String(s || '');
  const fmtDT = (iso) => { const d = new Date(iso); if (isNaN(d)) return '—'; return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).replace(/\bAM\b/, 'am').replace(/\bPM\b/, 'pm'); };
  const fmtLU = (iso) => { const d = new Date(iso); if (isNaN(d)) return '—'; return d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }); };
  const pastel = (s) => { const P = [['#dcfce7', '#166534'], ['#fee2e2', '#991b1b'], ['#ede9fe', '#5b21b6'], ['#dbeafe', '#1e40af'], ['#ecfccb', '#3f6212'], ['#ffedd5', '#9a3412']]; let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return P[h % P.length]; };
  const rav = (name, extra = '') => { const isNum = /^\+?\d/.test(name || ''); if (isNum || !name) return `<span class="cx-rav u ${extra}">${I('user')}</span>`; const [bg, fg] = pastel(name); return `<span class="cx-rav ${extra}" style="background:${bg};color:${fg}">${esc((name || '?').trim()[0].toUpperCase())}</span>`; };
  const cityOf = (p) => (p ? p.city || '' : '');
  const stateOf = (p) => (p ? p.state || '' : '');
  const sortedParties = () => parties().slice();
  const phoneOk = (v, f) => (f === 'has' ? !!v : f === 'none' ? !v : true);
  const nextContactNo = () => { const n = contacts().reduce((m, c) => Math.max(m, parseInt(String(c.number || c.id).replace(/\D/g, '')) || 0), 8500); return 'CT-' + (n + 1); };

  const filteredParties = () => {
    const u = ui(), q = MOD(u.q.parties).toLowerCase().trim();
    return parties().filter((p) => phoneOk(p.phone, u.phone.parties) && (!u.status.parties || p.status === u.status.parties) && (!q || [p.name, p.number, p.phone, p.city, p.state, contactsOf(p).map((c) => c.name).join(' ')].join(' ').toLowerCase().includes(q)));
  };
  const filteredContacts = () => {
    const u = ui(), q = MOD(u.q.contacts).toLowerCase().trim();
    return contacts().filter((c) => phoneOk(c.phone, u.phone.contacts) && (!q || [c.name, c.number, c.phone, c.email, (partyById(c.partyId) || {}).name].join(' ').toLowerCase().includes(q)));
  };
  const modified = (tab) => { const u = ui(); return !!(u.q[tab] || u.phone[tab] || (tab === 'parties' && u.status.parties)); };

  /* ───────── list page ───────── */
  const statCards = (tab) => {
    if (tab === 'contacts') return `<div class="crm-stats cx-two stagger">${DM.statCard('Contacts', '', '', 'users', { tile: 'right', count: contacts().length })}${DM.statCard('Linked parties', '', '', 'building', { tile: 'right', count: parties().filter((p) => contactsOf(p).length).length })}</div>`;
    const conf = (S().drafts || []).filter((d) => !/pending|reject|draft|flag/i.test(d.status || '')).length;
    const open = (S().threads || []).filter(isOpenT).length;
    return `<div class="crm-stats stagger">${DM.statCard('Parties', '', '', 'building', { tile: 'right', count: parties().length })}${DM.statCard('Contacts', '', '', 'users', { tile: 'right', count: contacts().length })}${DM.statCard('Confirmed orders', '', '', 'package', { tile: 'right', count: conf })}${DM.statCard('Open chats', '', '', 'chat', { tile: 'right', count: open })}</div>`;
  };
  const phoneFilter = (tab) => ({ menu: { label: 'Phone', title: 'Filter by phone', items: [{ label: 'Has a phone number', value: 'has' }, { label: 'No phone number', value: 'none' }], value: ui().phone[tab] }, onChange: (v) => { ui().phone[tab] = v; DM.render(); } });
  const statusFilter = () => ({ menu: { label: 'Status', title: 'Filter by status', items: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], value: ui().status.parties }, onChange: (v) => { ui().status.parties = v; DM.render(); } });
  const statusBadge = (s) => DM.status(s || 'Active', s === 'Inactive' ? 'grey' : 'green');
  const mutedOrDash = (v) => (v ? esc(v) : '<span class="muted">—</span>');

  const partyGrid = () => DM.table([
    { k: 'number', label: 'Number', w: 110, mono: true, filter: { tip: "This filter isn't wired up yet." } },
    { k: 'name', label: 'Party', bold: true, sortable: true, sort: 'asc', minW: 220, flex: 3, filter: { tip: "This filter isn't wired up yet." }, render: (p) => esc(p.name) },
    { k: 'contacts', label: 'Contacts', w: 260, muted: true, filter: { tip: 'Needs contact names on the party row.' }, render: (p) => mutedOrDash(contactsOf(p).map((c) => c.name).join(', ')), text: (p) => contactsOf(p).map((c) => c.name).join(', ') },
    { k: 'phone', label: 'WhatsApp', w: 170, muted: true, filter: phoneFilter('parties'), render: (p) => mutedOrDash(p.phone) },
    { k: 'city', label: 'City', w: 150, filter: { tip: "This filter isn't wired up yet." }, render: (p) => mutedOrDash(p.city) },
    { k: 'state', label: 'State', w: 160, filter: { tip: "This filter isn't wired up yet." }, render: (p) => mutedOrDash(p.state) },
    { k: 'status', label: 'Status', w: 130, filter: statusFilter(), render: (p) => statusBadge(p.status) },
    { k: 'street', label: 'Billing street', w: 220, muted: true, filter: false, render: (p) => mutedOrDash(p.billingStreet) },
  ], filteredParties(), { id: gid('parties'), go: (p) => '/crm/accounts/' + encodeURIComponent(p.id), footer: 'parties', hidden: DEFAULT_HIDDEN.parties, offset: 346, empty: { icon: 'building', title: 'No parties match', sub: 'Try a different search or clear the filters.' } });
  const contactGrid = () => DM.table([
    { k: 'number', label: 'Number', w: 110, mono: true, filter: { tip: "This filter isn't wired up yet." } },
    { k: 'name', label: 'Contact', bold: true, sortable: true, sort: 'asc', w: 240, filter: { tip: "This filter isn't wired up yet." }, render: (c) => esc(c.name) },
    { k: 'phone', label: 'WhatsApp', w: 170, muted: true, filter: phoneFilter('contacts'), render: (c) => mutedOrDash(c.phone) },
    { k: 'party', label: 'Party', minW: 220, flex: 3, filter: { tip: "This filter isn't wired up yet." }, render: (c) => mutedOrDash((partyById(c.partyId) || {}).name), text: (c) => (partyById(c.partyId) || {}).name || '' },
    { k: 'city', label: 'City', w: 150, filter: { tip: "Needs the party's city on the contact row." }, render: (c) => mutedOrDash(cityOf(partyById(c.partyId))) },
    { k: 'state', label: 'State', w: 160, filter: { tip: "Needs the party's state on the contact row." }, render: (c) => mutedOrDash(stateOf(partyById(c.partyId))) },
    { k: 'email', label: 'Email', w: 240, muted: true, filter: false, render: (c) => mutedOrDash(c.email) },
  ], filteredContacts(), { id: gid('contacts'), go: (c) => '/crm/contacts/' + encodeURIComponent(c.id), footer: 'contacts', hidden: DEFAULT_HIDDEN.contacts, offset: 346, empty: { icon: 'users', title: 'No contacts match', sub: 'Try a different search or clear the filters.' } });

  const viewLabel = (tab) => ui().view[tab] || (tab === 'parties' ? 'All parties' : 'All contacts');
  const listHTML = (tab) => {
    const u = ui(), label = viewLabel(tab);
    const nOff = DEFAULT_HIDDEN[tab].length;
    const mod = modified(tab) ? `<span class="crm-mod">Modified<button class="btn outline sm" data-act="crm-saveview">Save view</button><button class="btn ghost icon sm" data-act="crm-reset" title="Reset view">${I('x')}</button></span>` : '';
    return `<div class="page wide crm-wrap"><div class="crm-h"><h1>CRM</h1></div>${statCards(tab)}
      <div class="crm-bar">${DM.seg([{ key: 'parties', label: 'Parties' }, { key: 'contacts', label: 'Contacts' }], tab, 'crm-seg')}</div>
      <div class="toolbar"><div class="row gap12" style="gap:8px">${DM.viewBtn(label, 'crm-views')}${mod}</div><div class="row right" style="gap:8px">${DM.colsBtn(gid(tab), (DM.ui._grid[gid(tab)] ? DM.ui._grid[gid(tab)].hidden.size : nOff))}${DM.searchGroup('crm-q', tab === 'parties' ? 'Search parties…' : 'Search contacts…', u.q[tab])}</div></div>
      ${tab === 'parties' ? partyGrid() : contactGrid()}</div>`;
  };

  /* views */
  DM.act('crm-seg', (el) => DM.go(el.dataset.arg === 'contacts' ? '/crm/contacts' : '/crm/accounts'));
  DM.input('crm-q', (v) => { const u = ui(); u.q[u.tab] = v; DM.render(); });
  DM.act('crm-views', (el) => {
    const u = ui(), tab = u.tab, base = tab === 'parties' ? 'All parties' : 'All contacts';
    const names = [base, ...u.views[tab].map((v) => v.name)];
    DM.menu(el, [{ heading: 'Views' }, ...names.map((n) => ({ label: n, check: viewLabel(tab) === n, run: () => applyView(tab, n === base ? null : u.views[tab].find((v) => v.name === n)) })), { sep: true }, { label: '+ New view', icon: 'plus', run: () => saveViewDialog() }], { w: 256 });
  });
  const applyView = (tab, v) => { const u = ui(); u.view[tab] = v ? v.name : ''; u.q[tab] = v ? v.q : ''; u.phone[tab] = v ? v.phone : ''; if (tab === 'parties') u.status.parties = v ? v.status : ''; DM.render(); };
  const saveViewDialog = () => {
    const u = ui(), tab = u.tab;
    DM.dialog({ title: 'Save view', sub: 'Keeps the current search and filters as a named view.', w: 396, body: `<div class="field"><label>Name</label><input class="input" name="vn" placeholder="e.g. Maharashtra dealers" autofocus></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save view', run: (d) => { const n = d.querySelector('[name=vn]').value.trim(); if (!n) { DM.toast('Give the view a name', 'info'); return false; } u.views[tab] = u.views[tab].filter((x) => x.name !== n).concat([{ name: n, q: u.q[tab], phone: u.phone[tab], status: tab === 'parties' ? u.status.parties : '' }]); u.view[tab] = n; DM.toast('View saved'); DM.render(); } }] });
  };
  DM.act('crm-saveview', () => saveViewDialog());
  DM.act('crm-reset', () => { applyView(ui().tab, null); });

  const listPage = (tab) => (ctx) => { const u = ui(); u.tab = tab; u.from = tab; return listHTML(tab); };
  const sameSection = () => { if (/^\/crm\//.test(DM._lastPath || '')) { /* opening/closing the drawer must not replay the page-rise or reset scroll */ } };

  /* ───────── drawer ───────── */
  const drawerState = (p, tab, cid) => ({ id: p.id, tab: tab || 'overview', contact: cid || null, form: null, ordersFor: '', chatsFor: '' });
  const curParty = () => { const u = ui(); return u.d ? partyById(u.d.id) : null; };
  const sheetEl = () => document.querySelector('.sheet-wrap[data-sheet="crm"]');

  const teamRows = (p) => {
    const rows = [];
    const asm = userById(p.asmId), sales = userById(p.salesId);
    if (asm) rows.push([asm, 'ASM responsible']); if (sales) rows.push([sales, 'Sales person']);
    return rows;
  };
  const teamCard = (p) => { const rows = teamRows(p); return `<div class="cx-dcard">${rows.length ? rows.map(([u, r]) => `<div class="cx-team-row">${DM.avatar(u.name, '', { org: false })}<div><b>${esc(u.name)}</b><div class="muted">${r}</div></div></div>`).join('') : DM.empty('users', 'Nobody assigned yet', 'Use Manage team to assign someone.', { style: 'border:0;padding:28px 16px' })}</div>`; };
  const contactCards = (p) => { const cs = contactsOf(p); const d = ui().d; return cs.map((c) => `<button class="cx-ccard ${d && d.contact === c.id ? 'sel' : ''}" data-act="crm-pick-contact" data-arg="${esc(c.id)}">${rav(c.name)}<div><div class="cx-nm">${esc(c.name)}</div><div class="cx-sb">${esc(c.type || 'Secondary')}${c.phone ? ' · ' + esc(c.phone) : ''}</div></div>${I('chevR')}</button>`).join(''); };
  const ordersTable = (p, contactId) => {
    let rows = confirmedOf(p); if (contactId) rows = rows.filter((d) => d.contactId === contactId);
    if (!rows.length) return DM.empty('package', 'No confirmed orders yet', 'Confirmed orders will show up here.', { style: 'border:0;padding:28px 16px' });
    return `<div class="cx-tbl2wrap"><table class="cx-tbl2"><thead><tr><th>ID</th><th>Date and Time</th><th>Contact Name</th><th>Party Name</th><th>Items</th><th>City</th><th>State</th></tr></thead><tbody>${rows.map((d) => { const c = contactById(d.contactId); return `<tr><td class="mono">${esc(d.number || d.id)}</td><td>${fmtDT(d.createdAt)}</td><td>${esc((c && c.name) || d.contactName || '—')}</td><td>${esc(p.name)}</td><td>${(d.lines || []).length}</td><td>${esc(p.city || '—')}</td><td>${esc(p.state || '—')}</td></tr>`; }).join('')}</tbody></table></div>`;
  };
  const chatsTable = (p, contactId) => {
    let rows = chatsOf(p); if (contactId) rows = rows.filter((t) => t.contactId === contactId);
    if (!rows.length) return DM.empty('chat', 'No chats yet', contactId ? 'No conversations started by this contact yet.' : 'No conversations for this party yet.', { style: 'border:0;padding:28px 16px' });
    return `<div class="cx-tbl2wrap"><table class="cx-tbl2"><thead><tr><th>Case</th><th>Subject</th><th>Contacts</th><th>Status</th><th>Last update</th></tr></thead><tbody>${rows.map((t) => { const c = contactById(t.contactId); return `<tr><td class="mono">${esc(DM.caseNo(t))}</td><td class="muted">${esc(t.subject || '—')}</td><td>${esc((c && c.name) || t.name || '—')}</td><td>${esc(t.status === 'escalated' ? 'open' : t.status || 'open')}</td><td>${fmtLU(t.lastAt)}</td></tr>`; }).join('')}</tbody></table></div>`;
  };
  const sec = (title, right, body, count) => `<div class="cx-dsec"><div class="cx-dsec-h"><h3>${title}</h3>${count != null ? `<span class="cx-cn">${count}</span>` : ''}<div class="right">${right || ''}</div></div>${body}</div>`;
  const contactBtns = () => `<button class="cx-linkbtn" data-act="crm-link">${I('link')}Link existing</button><button class="btn outline sm" data-act="crm-addc" ${ui().d && ui().d.form ? 'disabled' : ''}>${I('plus')}Add contact</button>`;

  const contactForm = (p) => {
    const f = ui().d.form; if (!f) return '';
    const edit = f.mode === 'edit';
    return `<div class="cx-cform fadein"><h4>${edit ? 'Edit contact' : 'New contact'}</h4><div class="cx-sub">${edit ? 'Updates this contact.' : 'Adds a contact linked to the selected client.'}</div>
      <div class="field"><label>Contact type</label><div class="cx-radios"><button data-act="crm-ftype" data-arg="Primary" class="${f.type === 'Primary' ? 'on' : ''}"><span class="cx-rd"></span>Primary</button><button data-act="crm-ftype" data-arg="Secondary" class="${f.type === 'Secondary' ? 'on' : ''}"><span class="cx-rd"></span>Secondary</button></div></div>
      <div class="field" style="margin-top:12px"><label>Client *</label><select class="select" disabled><option>${esc(p.name)}</option></select></div>
      <div class="grid g2"><div class="field"><label>First name *</label><input class="input" data-input="crm-f-first" value="${esc(f.first)}" placeholder="First name"></div><div class="field"><label>Last name</label><input class="input" data-input="crm-f-last" value="${esc(f.last)}" placeholder="Last name"></div>
      <div class="field"><label>Email</label><input class="input" data-input="crm-f-email" value="${esc(f.email)}" placeholder="name@company.com"></div><div class="field"><label>Phone</label><input class="input" data-input="crm-f-phone" value="${esc(f.phone)}" placeholder="+91 98765 43210"></div></div>
      <div class="cx-acts"><button class="btn outline" data-act="crm-fcancel">Cancel</button><button class="btn" data-act="crm-fsave">Save</button></div></div>`;
  };
  const peopleBlock = (p) => {
    const cs = contactsOf(p); const d = ui().d; const sel = d.contact && cs.find((c) => c.id === d.contact);
    const detail = sel ? `<div class="cx-cdet"><div class="cx-cdet-h"><h2>${esc(sel.name)}</h2><button class="btn outline sm" data-act="crm-cedit" data-arg="${esc(sel.id)}">${I('pencil')}Edit</button><button class="btn outline sm" data-act="crm-cremove" data-arg="${esc(sel.id)}">Remove from party</button><button class="btn outline sm" style="color:var(--destructive)" data-act="crm-cdelete" data-arg="${esc(sel.id)}">${I('trash')}Delete</button></div>
      <div class="cx-dcard"><div class="cx-kv2"><span class="cx-l">WhatsApp number</span><span class="cx-v">${esc(sel.phone || '—')}</span><span class="cx-l">Email</span><span class="cx-v">${esc(sel.email || '—')}</span><span class="cx-l">Contact number</span><span class="cx-v mono" style="font-family:ui-monospace,Menlo,monospace">${esc(sel.number || sel.id)}</span></div></div>
      ${sec('Chats started by ' + esc(sel.name), '', `<div class="cx-dcard"><div class="cx-dt">Chats</div>${chatsTable(p, sel.id)}</div>`)}
      ${sec('Confirmed orders', '', `<div class="cx-dcard"><div class="cx-dt">Orders</div>${ordersTable(p, sel.id)}</div>`)}</div>` : '';
    return sec('Contacts', contactBtns(), contactForm(p) + (cs.length ? contactCards(p) : (d.form ? '' : DM.empty('users', 'No contacts yet', 'Contacts added to this party show up here.', { style: 'padding:30px 16px' }))), cs.length) + detail;
  };
  const companyKV = (p) => `<div class="cx-dcard"><div class="cx-kv3"><div><div class="cx-l">Party number</div><div class="cx-v mono" style="font-family:ui-monospace,Menlo,monospace">${esc(p.number)}</div></div><div><div class="cx-l">Account type</div><div class="cx-v">${esc(p.accountType || 'Customer')}</div></div><div><div class="cx-l">Company phone</div><div class="cx-v">${esc(p.companyPhone || '—')}</div></div><div><div class="cx-l">Email</div><div class="cx-v">${esc(p.email || '—')}</div></div><div><div class="cx-l">Billing address</div><div class="cx-v" title="${esc(p.billingStreet || '')}">${esc([p.billingStreet, p.city, p.state, p.billingPincode].filter(Boolean).join(', ') || '—')}</div></div><div><div class="cx-l">Shipping address</div><div class="cx-v">${esc(p.shippingAddress || '—')}</div></div></div></div>`;
  const ctFilter = (p, key, act) => { const d = ui().d; const cs = contactsOf(p); const cur = cs.find((c) => c.id === d[key]); return `<button class="btn outline sm" data-act="${act}">${esc(cur ? cur.name : 'All contacts')}${I('chevD')}</button>`; };

  const tabBody = (p) => {
    const d = ui().d, conf = confirmedOf(p), chats = chatsOf(p), cs = contactsOf(p);
    if (d.tab === 'overview') return `<div class="cx-dstats stagger">${DM.statCard('Confirmed orders', '', '', 'package', { count: conf.length })}${DM.statCard('Open chats', '', '', 'chat', { count: chats.filter(isOpenT).length })}${DM.statCard('Contacts', '', '', 'users', { count: cs.length })}</div>
      ${sec('Your account team', `<button class="cx-linkbtn" data-act="crm-team">Manage team</button>`, teamCard(p))}
      ${sec('Contacts', contactBtns(), contactForm(p) + (cs.length ? contactCards(p) : (d.form ? '' : DM.empty('users', 'No contacts yet', 'Contacts added to this party show up here.', { style: 'padding:30px 16px' }))), cs.length)}
      ${sec('Confirmed orders · all contacts', '', `<div class="cx-dcard"><div class="cx-dt">Orders</div>${ordersTable(p)}</div>`)}
      ${sec('Chats · all contacts', '', `<div class="cx-dcard"><div class="cx-dt">Chats</div>${chatsTable(p)}</div>`)}
      ${sec('Company details', '', companyKV(p))}`;
    if (d.tab === 'people') return peopleBlock(p);
    if (d.tab === 'orders') return `<div class="cx-dsec"><div class="cx-dsec-h"><h3>Confirmed orders</h3><div class="right">${ctFilter(p, 'ordersFor', 'crm-ofilter')}</div></div><div class="cx-dcard"><div class="cx-dt">Orders</div>${ordersTable(p, d.ordersFor)}</div></div>`;
    if (d.tab === 'chats') return `<div class="cx-dsec"><div class="cx-dsec-h"><h3>All chats</h3><div class="right">${ctFilter(p, 'chatsFor', 'crm-cfilter')}</div></div><div class="cx-dcard"><div class="cx-dt">Chats</div>${chatsTable(p, d.chatsFor)}</div></div>`;
    return `${sec('Your account team', `<button class="cx-linkbtn" data-act="crm-team">Manage team</button>`, teamCard(p))}
      ${sec('Identity & reach', '', `<div class="cx-dcard"><div class="cx-kv2"><span class="cx-l">Party number</span><span class="cx-v mono" style="font-family:ui-monospace,Menlo,monospace">${esc(p.number)}</span><span class="cx-l">Name</span><span class="cx-v">${esc(p.name)}</span><span class="cx-l">Account type</span><span class="cx-v">${esc(p.accountType || 'Customer')}</span><span class="cx-l">Status</span><span class="cx-v">${statusBadge(p.status)}</span><span class="cx-l">Company phone</span><span class="cx-v">${esc(p.companyPhone || '—')}</span><span class="cx-l">Email</span><span class="cx-v">${esc(p.email || '—')}</span><span class="cx-l">Website</span><span class="cx-v ${p.website ? '' : 'muted'}">${esc(p.website || 'Not provided')}</span><span class="cx-l">Source</span><span class="cx-v">${esc(p.source === 'whatsapp' ? 'api' : p.source || 'api')}</span></div></div>`)}
      ${sec('Addresses', '', `<div class="cx-dcard"><div class="cx-kv2"><span class="cx-l">City</span><span class="cx-v">${esc(p.city || '—')}</span><span class="cx-l">State</span><span class="cx-v">${esc(p.state || '—')}</span><span class="cx-l">Country</span><span class="cx-v">India</span><span class="cx-l">Billing street</span><span class="cx-v">${esc(p.billingStreet || '—')}</span><span class="cx-l">Shipping address</span><span class="cx-v">${esc(p.shippingAddress || '—')}</span></div></div>`)}`;
  };
  const headTitle = (p) => { const cs = contactsOf(p); return `<span style="font-size:16px;font-weight:600">${esc(p.name)}</span><span class="muted" style="font-size:12px;font-weight:400;margin-left:8px">${cs.length} contact${cs.length === 1 ? '' : 's'}</span>${cs.length ? `<span class="cx-avstack" style="margin-left:8px">${cs.slice(0, 3).map((c) => rav(c.name)).join('')}</span>` : ''}`; };
  const headSub = (p) => `${DM.mono(p.number)}<span>${esc([p.city, p.state].filter(Boolean).join(', ') || '—')}</span>${statusBadge(p.status)}`;
  const TABS = [{ key: 'overview', label: 'Overview' }, { key: 'people', label: 'People' }, { key: 'orders', label: 'Orders' }, { key: 'chats', label: 'Chats' }, { key: 'fields', label: 'All fields' }];
  const repaint = (full) => {
    const w = sheetEl(), p = curParty(); if (!w || !p) return; const d = ui().d;
    w.querySelector('.sheet-t').innerHTML = headTitle(p); w.querySelector('.sheet-s').innerHTML = headSub(p);
    w.querySelector('.sheet-tabs').innerHTML = DM.seg(TABS, d.tab, 'crm-dtab');
    if (full) DM.sheetBody(w, tabBody(p)); else { const b = w.querySelector('.sheet-b'); const sc = b.scrollTop; b.innerHTML = tabBody(p); b.scrollTop = sc; }
    DM.mountCounts && DM.mountCounts(w);
    animateCounts(w);
  };
  const animateCounts = (root) => root.querySelectorAll('[data-count]').forEach((e) => { const to = +e.dataset.count; let from = 0; const t0 = performance.now(); const tick = (t) => { const k = Math.min(1, (t - t0) / 500); e.textContent = DM.fmt.num(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const openSheet = (p, tab, cid) => {
    const u = ui(); const same = sheetEl() && u.d && u.d.id === p.id;
    if (!same) u.d = drawerState(p, tab, cid); else { if (tab) u.d.tab = tab; if (cid) u.d.contact = cid; }
    if (same) { repaint(true); return; }
    DM.sheet({ id: 'crm', w: 800, title: headTitle(p), sub: headSub(p), tabs: TABS, tab: u.d.tab, tabAct: 'crm-dtab', body: tabBody(p), headerExtra: `<button class="btn ghost icon sm" style="color:var(--destructive)" data-act="crm-delparty" title="Delete party">${I('trash')}</button>`, footer: `<button class="btn outline sm" data-sheet-close>Close</button>`, onClose: () => { u.d = null; DM.go(u.from === 'contacts' ? '/crm/contacts' : '/crm/accounts'); }, onMount: (w) => animateCounts(w) });
  };

  /* drawer actions */
  DM.act('crm-dtab', (el) => { const d = ui().d; if (!d) return; d.tab = el.dataset.arg; d.form = null; repaint(true); });
  DM.act('crm-pick-contact', (el) => { const d = ui().d; d.contact = el.dataset.arg; d.tab = 'people'; d.form = null; repaint(true); });
  DM.act('crm-ofilter', (el) => ctMenu(el, 'ordersFor'));
  DM.act('crm-cfilter', (el) => ctMenu(el, 'chatsFor'));
  const ctMenu = (el, key) => { const p = curParty(), d = ui().d; DM.menu(el, [{ label: 'All contacts', check: !d[key], run: () => { d[key] = ''; repaint(false); } }, ...contactsOf(p).map((c) => ({ label: c.name, check: d[key] === c.id, run: () => { d[key] = c.id; repaint(false); } }))], { w: 200, right: true }); };
  DM.act('crm-addc', () => { const d = ui().d; d.form = { mode: 'add', type: contactsOf(curParty()).length ? 'Secondary' : 'Primary', first: '', last: '', email: '', phone: '' }; repaint(false); const w = sheetEl(); const f = w && w.querySelector('[data-input="crm-f-first"]'); f && f.focus(); });
  DM.act('crm-cedit', (el) => { const d = ui().d, c = contactById(el.dataset.arg); if (!c) return; d.form = { mode: 'edit', id: c.id, type: c.type || 'Secondary', first: c.firstName || c.name.split(' ')[0] || '', last: c.lastName || c.name.split(' ').slice(1).join(' '), email: c.email || '', phone: c.phone || '' }; repaint(false); });
  DM.act('crm-fcancel', () => { ui().d.form = null; repaint(false); });
  DM.act('crm-ftype', (el) => { ui().d.form.type = el.dataset.arg; repaint(false); });
  ['first', 'last', 'email', 'phone'].forEach((k) => DM.input('crm-f-' + k, (v) => { const f = ui().d && ui().d.form; if (f) f[k] = v; }));
  DM.act('crm-fsave', () => {
    const d = ui().d, f = d.form, p = curParty(); if (!f.first.trim()) { DM.toast('First name is required', 'info'); return; }
    const name = (f.first.trim() + ' ' + f.last.trim()).trim();
    if (f.type === 'Primary') contactsOf(p).forEach((c) => { if (c.id !== f.id && c.type === 'Primary') c.type = 'Secondary'; });
    if (f.mode === 'edit') { const c = contactById(f.id); Object.assign(c, { name, firstName: f.first.trim(), lastName: f.last.trim(), email: f.email.trim() || null, phone: f.phone.trim() || null, type: f.type }); DM.toast('Contact updated'); }
    else { const c = { id: nextContactNo(), partyId: p.id, name, firstName: f.first.trim(), lastName: f.last.trim(), role: 'Sales Person', phone: f.phone.trim() || null, email: f.email.trim() || null, type: f.type }; c.number = c.id; contacts().push(c); (p.contactIds = p.contactIds || []).push(c.id); d.contact = c.id; DM.toast('Contact added'); }
    p.contactIds.sort((a, b) => ((contactById(a) || {}).type === 'Primary' ? 0 : 1) - ((contactById(b) || {}).type === 'Primary' ? 0 : 1));
    d.form = null; repaint(false); refreshList();
  });
  DM.act('crm-cremove', (el) => { const p = curParty(), c = contactById(el.dataset.arg); if (!c) return; c.partyId = null; p.contactIds = (p.contactIds || []).filter((x) => x !== c.id); ui().d.contact = null; DM.toast('Removed from party'); repaint(false); refreshList(); });
  DM.act('crm-cdelete', (el) => { const c = contactById(el.dataset.arg); if (!c) return; DM.dialog({ title: `Delete ${esc(c.name)}?`, sub: 'This removes the contact from your CRM. It cannot be undone.', w: 396, body: '', actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Delete', cls: 'danger', run: () => { const p = partyById(c.partyId); if (p) p.contactIds = (p.contactIds || []).filter((x) => x !== c.id); S().contacts = contacts().filter((x) => x.id !== c.id); ui().d && (ui().d.contact = null); DM.toast('Contact deleted'); repaint(false); refreshList(); } }] }); });
  DM.act('crm-delparty', () => { const p = curParty(); if (!p) return; DM.dialog({ title: `Delete ${esc(p.name)}?`, sub: 'This removes the party from your CRM. Its contacts stay in your contacts list. It cannot be undone.', w: 396, body: '', actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Delete', cls: 'danger', run: () => { contactsOf(p).forEach((c) => (c.partyId = null)); S().parties = parties().filter((x) => x.id !== p.id); ui().d = null; DM.closeSheet('crm'); DM.toast('Party deleted'); DM.go(ui().from === 'contacts' ? '/crm/contacts' : '/crm/accounts'); } }] }); });
  const refreshList = () => { /* re-render the list behind the open drawer without losing the drawer */ DM._crmKeep = true; DM.render(); DM._crmKeep = false; };

  /* Link existing contact */
  DM.act('crm-link', () => {
    const p = curParty(); let q = '', pick = null;
    const draw = (d) => {
      const list = contacts().filter((c) => !q || [c.name, c.phone, c.email, c.number].join(' ').toLowerCase().includes(q)).sort((a, b) => (a.partyId ? 1 : 0) - (b.partyId ? 1 : 0));
      d.querySelector('.cx-lk-list').innerHTML = list.slice(0, 60).map((c) => { const on = c.partyId && c.partyId !== p.id ? partyById(c.partyId) : null; const here = c.partyId === p.id; const dis = !!on || here; return `<div class="cx-lk-row ${dis ? 'dis' : ''} ${pick === c.id ? 'sel' : ''}" data-lk="${esc(c.id)}" ${dis ? 'aria-disabled="true"' : ''}><div><div class="cx-nm">${esc(c.name)}</div><div class="cx-sb">${on ? 'On ' + esc(on.name) + ' · remove them there first' : here ? 'Already on this party' : esc(c.phone || c.email || 'No contact details')}</div></div><span class="cx-id">${esc(c.number || c.id)}</span></div>`; }).join('') || '<div class="empty" style="padding:24px">No contacts match.</div>';
      d.querySelector('[data-modal-act="1"]').disabled = !pick;
    };
    DM.dialog({ title: 'Link existing contact', sub: `Add someone already in your contacts to ${esc(p.name)}. Anyone on another party has to be removed from it first.`, w: 396, body: `<div class="sgroup" style="width:100%">${I('search')}<input id="lk-q" placeholder="Search by name, phone or email"></div><div class="cx-lk-list"></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Link contact', run: (d) => { if (!pick) return false; const c = contactById(pick); c.partyId = p.id; (p.contactIds = p.contactIds || []).push(c.id); if (!contactsOf(p).some((x) => x.type === 'Primary' && x.id !== c.id)) c.type = 'Primary'; else c.type = 'Secondary'; DM.toast('Contact linked'); repaint(false); refreshList(); } }],
      onMount: (d) => { draw(d); d.querySelector('#lk-q').addEventListener('input', (e) => { q = e.target.value.toLowerCase().trim(); draw(d); }); d.querySelector('.cx-lk-list').addEventListener('click', (e) => { const r = e.target.closest('[data-lk]'); if (!r || r.classList.contains('dis')) return; pick = r.dataset.lk; draw(d); }); } });
  });

  /* Manage team */
  DM.act('crm-team', () => {
    const p = curParty();
    const body = () => `<div class="cx-seg-card"><div class="cx-hd"><span class="grow">Segmentation</span><span class="icotile" style="width:24px;height:24px;border-radius:6px">${I('tag')}</span></div>
      <div class="cx-seg-row"><span class="cx-l">Area</span><span class="cx-v">${I('lock')} Nothing stores an area on an account yet.</span></div>
      <div class="cx-seg-row"><span class="cx-l">ASM responsible</span><span class="cx-v ${p.asmId ? 'cx-fg' : ''}">${esc((userById(p.asmId) || {}).name || 'Nobody')}</span><button class="btn outline sm" data-act="crm-assign" data-arg="asm">${I('user')}${p.asmId ? 'Change' : 'Assign one'}</button></div>
      <div class="cx-seg-row"><span class="cx-l">Sales person</span><span class="cx-v ${p.salesId ? 'cx-fg' : ''}">${esc((userById(p.salesId) || {}).name || 'Nobody')}</span><button class="btn outline sm" data-act="crm-assign" data-arg="sales">${I('user')}${p.salesId ? 'Change' : 'Assign one'}</button></div>
      <div class="cx-seg-row"><span class="cx-l">Segments</span><span class="cx-v">${I('lock')} Nothing writes a segment yet.</span></div></div>`;
    DM._crmTeamBody = body;
    DM.dialog({ title: 'Manage team', w: 396, body: `<div id="crm-team-body">${body()}</div>`, actions: [] });
  });
  DM.act('crm-assign', (el) => {
    const p = curParty(), kind = el.dataset.arg; const users = S().users || [];
    const cur = kind === 'asm' ? p.asmId : p.salesId;
    const items = [{ heading: kind === 'asm' ? 'ASM responsible' : 'Sales person' }];
    const list = users.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (cur) items.push({ label: 'Nobody', icon: 'x', run: () => setTeam(p, kind, null) });
    list.forEach((u) => { const k = items.length; items.push({ custom: `<button class="cx-asgn" data-mk="${k}">${rav(u.name)}<span class="grow trunc">${esc(u.name)}</span>${u.id === cur ? I('check') : ''}</button>`, run: () => setTeam(p, kind, u.id) }); });
    const m = DM.menu(el, items, { w: 240, right: true }); m.style.maxHeight = '300px'; m.style.overflow = 'auto'; m.style.zIndex = 400;
  });
  const setTeam = (p, kind, id) => { if (kind === 'asm') p.asmId = id; else p.salesId = id; p.ownerIds = [p.asmId, p.salesId].filter(Boolean); const b = document.getElementById('crm-team-body'); if (b && DM._crmTeamBody) b.innerHTML = DM._crmTeamBody(); DM.toast(id ? 'Team updated' : 'Removed from team'); repaint(false); refreshList(); };

  /* ───────── routes ───────── */
  const drawerRoute = (kind) => (ctx) => {
    const u = ui(); const id = ctx.params.id;
    u.tab = kind === 'contact' ? 'contacts' : 'parties'; if (!sheetEl()) u.from = u.tab;
    const prevListed = /^\/crm\/(accounts|contacts)/.test(DM._lastPath || ''); if (prevListed) DM._lastPath = DM.path(); // opening/closing the drawer shouldn't replay the page-rise
    return listHTML(u.tab);
  };
  const after = (kind) => (root, ctx) => {
    const id = ctx.params.id; if (!id) { DM.closeSheet('crm'); ui().d = null; return; }
    let p, cid = null;
    if (kind === 'contact') { const c = contactById(id); if (!c || !partyById(c.partyId)) { DM.toast('That contact is not linked to a party', 'info'); DM.go('/crm/contacts'); return; } p = partyById(c.partyId); cid = c.id; } else p = partyById(id);
    if (!p) { DM.toast('Party not found', 'info'); DM.go('/crm/accounts'); return; }
    openSheet(p, kind === 'contact' ? 'people' : null, cid);
  };
  DM.page('/crm', { title: 'CRM', render: () => { setTimeout(() => DM.go('/crm/accounts'), 0); return ''; } });
  DM.page('/crm/accounts', { title: 'CRM', render: (c) => { const h = listPage('parties')(c); return h; }, after: (r) => { DM.closeSheet('crm'); ui().d = null; } });
  DM.page('/crm/contacts', { title: 'CRM', render: (c) => listPage('contacts')(c), after: (r) => { DM.closeSheet('crm'); ui().d = null; } });
  DM.page('/crm/accounts/:id', { title: 'CRM', render: drawerRoute('party'), after: after('party') });
  DM.page('/crm/contacts/:id', { title: 'CRM', render: drawerRoute('contact'), after: after('contact') });


  /* Esc closes only the top-most layer: menus first, then a dialog, then the CRM/Products drawer (core's handler closes everything at once). */
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || document.querySelector('.palette,#palette-wrap')) return;
    const menus = document.querySelectorAll('.menu,.calpop');
    if (menus.length) { menus.forEach((m) => { m._onClose && m._onClose(); m.remove(); }); e.stopImmediatePropagation(); return; }
    if (document.getElementById('overlay')) { DM.closeModal(); e.stopImmediatePropagation(); return; }
    const w = document.querySelector('.sheet-wrap[data-sheet="crm"],.sheet-wrap[data-sheet="prod"]');
    if (w && w._close) { w._close(); e.stopImmediatePropagation(); }
  }, true);

  DM.searchProviders.push((q) => parties().filter((p) => (p.name + ' ' + p.number).toLowerCase().includes(q)).slice(0, 5).map((p) => ({ label: p.name, sub: 'Party · ' + p.number, icon: 'building', url: '/crm/accounts/' + p.id })));
})();
