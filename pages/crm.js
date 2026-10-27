/* CRM: parties (accounts) + contacts — list, record, create/edit. All mutations act on DM.S. */
(function () {
  const I = DM.icon, esc = DM.esc, F = DM.fmt;
  const st = document.createElement('style'); st.dataset.for = 'crm';
  st.textContent = `.seg-card{cursor:pointer;transition:border-color .14s}.seg-card:hover{border-color:#bdbdbd}.seg-card.on{border-color:#171717;box-shadow:0 0 0 1px #171717 inset}
  .bulkbar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#171717;color:#fff;border-radius:10px;margin-bottom:10px}
  .bulkbar .btn{background:#fff;color:#171717;border-color:#fff}.bulkbar .btn.ghost{background:transparent;color:#fff;border-color:transparent}
  .rec-head{display:flex;gap:14px;align-items:center;margin-bottom:14px}.th{cursor:pointer;user-select:none}.th:hover{color:var(--foreground)}
  .tl{position:relative;padding-left:18px}.tl::before{content:"";position:absolute;left:5px;top:4px;bottom:4px;width:1px;background:var(--border)}.tl .ev{position:relative;padding:0 0 14px}.tl .ev::before{content:"";position:absolute;left:-17px;top:5px;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--chart-2)}`;
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

  function filtered() {
    const seg = SEGS.find((s) => s.key === ui.seg) || SEGS[0]; const q = ui.q.toLowerCase().trim();
    let rows = parties().filter((p) => seg.test(p) && (ui.owner === 'all' || p.owner === ui.owner) && (!q || [p.name, p.city, p.region, p.gstin, p.phone, p.type].join(' ').toLowerCase().includes(q)));
    const f = sortVal[ui.sort] || sortVal.name; rows.sort((a, b) => (f(a) > f(b) ? 1 : f(a) < f(b) ? -1 : 0) * ui.dir); return rows;
  }
  const crmTabs = (cur) => `<div class="tabs"><a class="tab ${cur === 'parties' ? 'on' : ''}" href="#/crm/accounts">${I('building')} Parties <span class="badge">${parties().length}</span></a><a class="tab ${cur === 'contacts' ? 'on' : ''}" href="#/crm/contacts">${I('user')} Contacts <span class="badge">${contacts().length}</span></a></div>`;
  const th = (k, l, num) => `<th class="th ${num ? 'num' : ''}" data-act="crm-sort" data-arg="${k}">${l}${ui.sort === k ? (ui.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`;
  const chk = (on) => `<span class="chk ${on ? 'on' : ''}">${on ? I('check').replace('class="i "', 'class="i" style="width:10px;height:10px;stroke-width:3"') : ''}</span>`;

  /* ───── parties list ───── */
  DM.page('/crm/accounts', { title: 'CRM · Parties', crumb: 'Parties', render() {
    const all = parties(), rows = filtered();
    const tot = all.reduce((a, p) => a + (p.outstanding || 0), 0);
    const sel = ui.sel.filter((id) => party(id));
    return `<div class="page">${DM.header('CRM', 'Every party you trade with — dealers, contractors, distributors.', `<button class="btn outline" data-act="crm-export">${I('download')} Export</button><a class="btn" href="#/crm/accounts/create">${I('plus')} New party</a>`)}
      ${crmTabs('parties')}
      <div class="grid g4" style="margin-bottom:14px">${DM.stat('Parties', all.length, `${all.filter((p) => p.status === 'active' && !quiet(p)).length} active`, { icon: 'building' })}${DM.stat('Outstanding', F.inrc(tot), `${all.filter(over).length} over credit limit`, { icon: 'rupee', tone: all.some(over) ? 'down' : 'muted' })}${DM.stat('Lifetime value', F.inrc(all.reduce((a, p) => a + (p.lifetime || 0), 0)), 'across all parties', { icon: 'chart' })}${DM.stat('Quiet 30d+', all.filter(quiet).length, 'worth a nudge', { icon: 'clock', tone: 'muted' })}</div>
      <div class="row wrap" style="margin-bottom:12px;gap:6px">${SEGS.map((s) => `<button class="btn sm ${ui.seg === s.key ? '' : 'outline'}" data-act="crm-seg" data-arg="${s.key}">${s.label} <span style="opacity:.6">${all.filter(s.test).length}</span></button>`).join('')}</div>
      <div class="row" style="margin-bottom:12px">${DM.searchBox('crm-q', 'Search name, city, GSTIN…', ui.q)}<select class="select" style="width:170px" data-change="crm-owner"><option value="all">All owners</option>${users().map((u) => `<option value="${u.id}" ${ui.owner === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select><span class="muted sm right">${rows.length} of ${all.length}</span></div>
      ${sel.length ? `<div class="bulkbar"><b>${sel.length} selected</b><button class="btn sm" data-act="crm-bulk-owner">Assign owner</button><button class="btn sm" data-act="crm-bulk-tag">Add tag</button><button class="btn sm" data-act="crm-bulk-block">Block</button><button class="btn sm ghost right" data-act="crm-sel-clear">Clear</button></div>` : ''}
      ${rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th style="width:34px" data-act="crm-sel-all" class="th">${chk(rows.length && rows.every((r) => sel.includes(r.id)))}</th>${th('name', 'Party')}<th>Type</th><th>Owner</th>${th('orders', 'Orders 30d', 1)}${th('outstanding', 'Outstanding', 1)}${th('lifetime', 'Lifetime', 1)}${th('last', 'Last order')}<th>Status</th></tr></thead><tbody>${rows.map((p) => `<tr class="click" data-go="/crm/accounts/${p.id}"><td data-act="crm-sel" data-arg="${p.id}">${chk(sel.includes(p.id))}</td><td><div class="row">${DM.avatar(p.name, 'sm')}<div><div class="b">${esc(p.name)}</div><div class="xs muted">${esc(p.city || '')}${p.region ? ' · ' + esc(p.region) : ''}</div></div></div></td><td>${esc(p.type || '—')}</td><td>${esc(uname(p.owner))}</td><td class="num">${p.orders30d ?? 0}</td><td class="num ${over(p) ? 'down' : ''}">${F.inr(p.outstanding || 0)}</td><td class="num">${F.inrc(p.lifetime || 0)}</td><td>${p.lastOrderAt ? F.date(p.lastOrderAt) : '—'}</td><td>${statusBadge(p)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="tblwrap"><div class="empty"><h3>No parties match</h3><p class="sm">Try clearing the segment or search.</p><p style="margin-top:10px"><button class="btn outline" data-act="crm-clear">Clear filters</button></p></div></div>`}</div>`;
  } });
  DM.act('crm-seg', (el) => { ui.seg = el.dataset.arg; DM.render(); });
  DM.act('crm-clear', () => { ui.seg = 'all'; ui.q = ''; ui.owner = 'all'; DM.render(); });
  DM.act('crm-sort', (el) => { const k = el.dataset.arg; if (ui.sort === k) ui.dir *= -1; else { ui.sort = k; ui.dir = k === 'name' ? 1 : -1; } DM.render(); });
  DM.input('crm-q', (v) => { ui.q = v; DM.render(); });
  DM.input('crm-owner', (v) => { ui.owner = v; DM.render(); });
  DM.act('crm-sel', (el, e) => { e.stopPropagation(); const id = el.dataset.arg; ui.sel = ui.sel.includes(id) ? ui.sel.filter((x) => x !== id) : [...ui.sel, id]; DM.render(); });
  DM.act('crm-sel-all', () => { const ids = filtered().map((p) => p.id); ui.sel = ids.every((i) => ui.sel.includes(i)) ? [] : ids; DM.render(); });
  DM.act('crm-sel-clear', () => { ui.sel = []; DM.render(); });
  DM.act('crm-export', () => { const rows = filtered(); const csv = ['Name,Type,City,GSTIN,Outstanding,Lifetime'].concat(rows.map((p) => [p.name, p.type, p.city, p.gstin, p.outstanding, p.lifetime].map((x) => '"' + (x ?? '') + '"').join(','))).join('\n'); try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'parties.csv'; a.click(); } catch (e) {} DM.toast(`Exported ${rows.length} parties`, 'download'); });
  DM.act('crm-bulk-owner', () => DM.modal({ title: 'Assign owner', body: DM.field('Owner', 'o', { options: users().map((u) => u.name) }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Assign', run: (d) => { const u = users().find((x) => x.name === d.querySelector('[name=o]').value); ui.sel.forEach((id) => { const p = party(id); if (p && u) p.owner = u.id; }); DM.toast(`Assigned ${ui.sel.length} parties to ${u.name}`); ui.sel = []; DM.render(); } }] }));
  DM.act('crm-bulk-tag', () => DM.modal({ title: 'Add tag', body: DM.field('Tag', 't', { ph: 'e.g. Festive push' }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add tag', run: (d) => { const t = d.querySelector('[name=t]').value.trim(); if (!t) return false; ui.sel.forEach((id) => { const p = party(id); if (p) { p.tags = p.tags || []; if (!p.tags.includes(t)) p.tags.push(t); } }); DM.toast(`Tagged ${ui.sel.length} parties “${t}”`); ui.sel = []; DM.render(); } }] }));
  DM.act('crm-bulk-block', () => DM.confirm('Block selected parties?', `${ui.sel.length} parties won’t be able to place orders until unblocked.`, () => { ui.sel.forEach((id) => { const p = party(id); if (p) p.status = 'blocked'; }); DM.toast('Parties blocked', 'lock'); ui.sel = []; DM.render(); }, 'Block'));

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
    parties().unshift(p); DM.toast(`${p.name} added`); DM.go('/crm/accounts/' + p.id);
  });

  /* ───── party record ───── */
  const RT = [['overview', 'Overview'], ['orders', 'Orders'], ['chats', 'Chats'], ['contacts', 'Contacts'], ['quotes', 'Quotes'], ['activity', 'Activity'], ['credit', 'Credit']];
  DM.page('/crm/accounts/:id', { title: 'Party', crumb: (p) => (party(p.id) || {}).name || 'Party', render({ params, q }) {
    const p = party(params.id); if (!p) return `<div class="page"><div class="empty"><h3>Party not found</h3><a class="btn outline" href="#/crm/accounts">Back to parties</a></div></div>`;
    const tab = q.get('tab') || 'overview';
    const orders = (S().orders || []).filter((o) => o.partyId === p.id), threads = (S().threads || []).filter((t) => t.partyId === p.id), quotes = (S().quotes || []).filter((x) => x.partyId === p.id), cts = contacts().filter((c) => c.partyId === p.id);
    const tabs = `<div class="tabs">${RT.map(([k, l]) => `<a class="tab ${tab === k ? 'on' : ''}" href="#/crm/accounts/${p.id}?tab=${k}">${l}${k === 'orders' ? ` <span class="badge">${orders.length}</span>` : k === 'chats' ? ` <span class="badge">${threads.length}</span>` : k === 'contacts' ? ` <span class="badge">${cts.length}</span>` : k === 'quotes' ? ` <span class="badge">${quotes.length}</span>` : ''}</a>`).join('')}</div>`;
    let body = '';
    if (tab === 'overview') {
      body = `<div class="grid" style="grid-template-columns:2fr 1fr;align-items:start"><div class="col gap16"><div class="grid g3">${DM.stat('Lifetime value', F.inrc(p.lifetime || 0))}${DM.stat('Orders (30d)', p.orders30d ?? 0)}${DM.stat('Outstanding', F.inr(p.outstanding || 0), over(p) ? 'Over limit' : 'Within limit', { tone: over(p) ? 'down' : 'up' })}</div>
        <div class="card"><div class="card-h"><h3>Recent orders</h3><a class="btn ghost sm right" href="#/crm/accounts/${p.id}?tab=orders">View all</a></div>${orders.slice(0, 4).map((o) => `<div class="listrow" data-go="/orders/${o.id}"><div class="grow"><div class="b sm">${esc(o.no)}</div><div class="xs muted">${F.date(o.placedAt)} · ${esc(o.channel || '')}</div></div><div class="mono sm">${F.inr(o.total)}</div>${DM.badge(o.status, o.status === 'delivered' ? 'green' : 'blue')}</div>`).join('') || '<div class="empty sm">No orders yet.</div>'}</div></div>
        <div class="card pad"><dl class="kv"><dt>Type</dt><dd>${esc(p.type || '—')}</dd><dt>Owner</dt><dd>${esc(uname(p.owner))}</dd><dt>Phone</dt><dd>${esc(p.phone || '—')}</dd><dt>Email</dt><dd>${esc(p.email || '—')}</dd><dt>GSTIN</dt><dd class="mono">${esc(p.gstin || '—')}</dd><dt>City</dt><dd>${esc([p.city, p.region].filter(Boolean).join(', ') || '—')}</dd><dt>Terms</dt><dd>${esc(p.terms || '—')}</dd><dt>Price band</dt><dd>${esc(p.priceBand || '—')}</dd><dt>Tags</dt><dd>${(p.tags || []).map((t) => DM.badge(t)).join(' ') || '<span class="muted">none</span>'} <button class="btn ghost sm icon" data-act="crm-addtag" data-arg="${p.id}">${I('plus')}</button></dd></dl></div></div>`;
    } else if (tab === 'orders') {
      body = DM.table([{ label: 'Order', render: (o) => `<b>${esc(o.no)}</b>` }, { label: 'Placed', render: (o) => F.date(o.placedAt) }, { label: 'Channel', k: 'channel' }, { label: 'Payment', render: (o) => DM.badge(o.payment, o.payment === 'Paid' ? 'green' : 'amber') }, { label: 'Status', render: (o) => DM.badge(o.status, o.status === 'delivered' ? 'green' : 'blue') }, { label: 'Total', num: 1, render: (o) => F.inr(o.total) }], orders, { go: (o) => '/orders/' + o.id, empty: 'No orders from this party yet.' });
    } else if (tab === 'chats') {
      body = threads.length ? `<div class="card">${threads.map((t) => `<div class="listrow" data-go="/inbox/threads?case=${t.id}"><span class="badge outline">${esc(t.channel)}</span><div class="grow"><div class="b sm">${esc(t.subject || t.preview)}</div><div class="xs muted trunc">${esc(t.preview || '')}</div></div><span class="xs muted">${F.ago(t.lastAt)}</span>${t.unread ? `<span class="unread">${t.unread}</span>` : ''}</div>`).join('')}</div>` : '<div class="card"><div class="empty">No conversations with this party.</div></div>';
    } else if (tab === 'contacts') {
      body = `<div class="row" style="margin-bottom:10px"><span class="muted sm">${cts.length} people at ${esc(p.name)}</span><a class="btn sm right" href="#/crm/contacts/new?party=${p.id}">${I('plus')} Add contact</a></div>` + DM.table([{ label: 'Name', render: (c) => `<div class="row">${DM.avatar(c.name, 'sm')}<b>${esc(c.name)}</b>${c.primary ? DM.badge('Primary', 'blue') : ''}</div>` }, { label: 'Role', k: 'role' }, { label: 'Phone', k: 'phone' }, { label: 'Email', k: 'email' }], cts, { go: (c) => '/crm/contacts/' + c.id, empty: 'No contacts yet.' });
    } else if (tab === 'quotes') {
      body = DM.table([{ label: 'Quote', render: (x) => `<b>${esc(x.no)}</b>` }, { label: 'Created', render: (x) => F.date(x.createdAt) }, { label: 'Valid till', render: (x) => F.date(x.validTill) }, { label: 'Margin', num: 1, render: (x) => (x.marginPct ?? '—') + '%' }, { label: 'Status', render: (x) => DM.badge(x.status.replace('_', ' '), x.status === 'accepted' ? 'green' : x.status === 'pending_approval' ? 'amber' : 'blue') }, { label: 'Total', num: 1, render: (x) => F.inr(x.total) }], quotes, { go: (x) => '/quotes/' + x.id, empty: 'No quotes sent.' });
    } else if (tab === 'activity') {
      const ev = [];
      orders.forEach((o) => ev.push({ at: o.placedAt, text: `Order ${o.no} placed · ${F.inr(o.total)}` }));
      quotes.forEach((x) => ev.push({ at: x.createdAt, text: `Quote ${x.no} ${x.status.replace('_', ' ')}` }));
      threads.forEach((t) => ev.push({ at: t.lastAt, text: `${t.channel} conversation: ${t.preview || t.subject}` }));
      (S().logs || []).filter((l) => String(l.target || '').includes(p.name)).forEach((l) => ev.push({ at: l.at, text: `${l.actor}: ${l.action}` }));
      ev.sort((a, b) => new Date(b.at) - new Date(a.at));
      body = `<div class="card pad">${ev.length ? `<div class="tl">${ev.map((e) => `<div class="ev"><div class="sm">${esc(e.text)}</div><div class="xs muted">${F.dt(e.at)}</div></div>`).join('')}</div>` : '<div class="empty">No activity yet.</div>'}</div>`;
    } else if (tab === 'credit') {
      const used = p.creditLimit ? Math.min(100, ((p.outstanding || 0) / p.creditLimit) * 100) : 0;
      body = `<div class="grid g2" style="align-items:start"><div class="card pad col gap12"><div class="row"><h3>Credit</h3><button class="btn outline sm right" data-act="crm-credit" data-arg="${p.id}">${I('edit')} Edit limit</button></div><div class="row"><div class="v b" style="font-size:24px">${F.inr(p.outstanding || 0)}</div><span class="muted sm">of ${F.inr(p.creditLimit || 0)}</span>${over(p) ? DM.badge('Over limit', 'red') : ''}</div><div class="bar" style="height:8px"><i style="width:${used}%;background:${over(p) ? 'var(--destructive)' : 'var(--chart-2)'}"></i></div><div class="xs muted">${Math.round(used)}% utilised · terms ${esc(p.terms || '—')}</div></div>
      <div class="card pad col gap12"><h3>Controls</h3><div class="row"><div class="grow"><div class="sm b">Block new orders</div><div class="xs muted">Anuma will hand orders from this party to a human.</div></div>${DM.switch(p.status === 'blocked', 'crm-block', p.id)}</div><div class="row"><div class="grow"><div class="sm b">Send payment reminder</div><div class="xs muted">WhatsApp nudge for ${F.inr(p.outstanding || 0)}.</div></div><button class="btn outline sm" data-act="crm-remind" data-arg="${p.id}">${I('send')} Send</button></div></div></div>`;
    }
    return `<div class="page"><a class="btn ghost sm" href="#/crm/accounts">${I('arrowL')} Parties</a><div class="rec-head" style="margin-top:6px">${DM.avatar(p.name, 'lg')}<div class="grow"><h1 style="font-size:20px;font-weight:600">${esc(p.name)}</h1><div class="muted sm">${esc([p.type, p.city, p.region].filter(Boolean).join(' · '))} ${statusBadge(p)}</div></div><button class="btn outline" data-act="crm-edit" data-arg="${p.id}">${I('edit')} Edit</button><button class="btn outline" data-go="/inbox/threads${threads[0] ? '?case=' + threads[0].id : ''}">${I('chat')} Message</button><button class="btn" data-act="crm-draft" data-arg="${p.id}">${I('plus')} New draft order</button></div>${tabs}${body}</div>`;
  } });
  DM.act('crm-addtag', (el) => DM.modal({ title: 'Add tag', body: DM.field('Tag', 't'), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add', run: (d) => { const t = d.querySelector('[name=t]').value.trim(); if (!t) return false; const p = party(el.dataset.arg); p.tags = (p.tags || []).concat(t); DM.render(); } }] }));
  DM.act('crm-block', (el) => { const p = party(el.dataset.arg); p.status = p.status === 'blocked' ? 'active' : 'blocked'; DM.toast(p.status === 'blocked' ? 'Party blocked' : 'Party unblocked', 'lock'); DM.render(); });
  DM.act('crm-remind', (el) => { const p = party(el.dataset.arg); DM.toast(`Reminder sent to ${p.name} on WhatsApp`, 'send'); });
  DM.act('crm-credit', (el) => { const p = party(el.dataset.arg); DM.modal({ title: 'Credit limit', body: DM.field('Credit limit (₹)', 'cl', { type: 'number', value: p.creditLimit }) + '<div style="height:10px"></div>' + DM.field('Terms', 'terms', { options: ['Advance', 'Net 15', 'Net 30', 'Net 45', '15/30', '30/45'], value: p.terms }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (d) => { p.creditLimit = +d.querySelector('[name=cl]').value || 0; p.terms = d.querySelector('[name=terms]').value; DM.toast('Credit updated'); DM.render(); } }] }); });
  DM.act('crm-edit', (el) => { const p = party(el.dataset.arg); DM.modal({ title: 'Edit party', lg: 1, body: `<div class="grid g2">${DM.field('Name', 'name', { value: p.name })}${DM.field('Type', 'type', { value: p.type })}${DM.field('City', 'city', { value: p.city })}${DM.field('Region', 'region', { value: p.region })}${DM.field('Phone', 'phone', { value: p.phone })}${DM.field('Email', 'email', { value: p.email })}${DM.field('GSTIN', 'gstin', { value: p.gstin })}${ownerSel(p.owner)}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { Object.assign(p, DM.formData(d)); DM.toast('Party updated'); DM.render(); } }] }); });
  DM.act('crm-draft', (el) => { const p = party(el.dataset.arg); const prod = (S().products || [])[0]; const n = (S().drafts || []).length + 1; const d = { id: DM.uid('d'), no: 'DRF-' + (1000 + n + Math.floor(Math.random() * 90)), partyId: p.id, status: 'pending', total: prod ? prod.price * 10 : 0, createdAt: new Date().toISOString(), by: 'You', note: 'Created from CRM', lines: prod ? [{ productId: prod.id, name: prod.name, qty: 10, unit: prod.unit, price: prod.price, state: 'pending' }] : [] }; (S().drafts = S().drafts || []).unshift(d); DM.toast('Draft order created'); DM.go('/orders/drafts/' + d.id); });

  /* ───── contacts ───── */
  DM.page('/crm/contacts', { title: 'CRM · Contacts', crumb: 'Contacts', render() {
    const q = ui.cq.toLowerCase().trim();
    const rows = contacts().filter((c) => (ui.cparty === 'all' || c.partyId === ui.cparty) && (!q || [c.name, c.role, c.phone, c.email, (party(c.partyId) || {}).name].join(' ').toLowerCase().includes(q)));
    return `<div class="page">${DM.header('CRM', 'People at the parties you trade with.', `<a class="btn" href="#/crm/contacts/new">${I('plus')} New contact</a>`)}${crmTabs('contacts')}
      <div class="row" style="margin-bottom:12px">${DM.searchBox('crm-cq', 'Search name, phone, party…', ui.cq)}<select class="select" style="width:210px" data-change="crm-cparty"><option value="all">All parties</option>${parties().map((p) => `<option value="${p.id}" ${ui.cparty === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select><span class="muted sm right">${rows.length} contacts</span></div>
      ${DM.table([{ label: 'Name', render: (c) => `<div class="row">${DM.avatar(c.name, 'sm')}<b>${esc(c.name)}</b>${c.primary ? DM.badge('Primary', 'blue') : ''}</div>` }, { label: 'Party', render: (c) => esc((party(c.partyId) || {}).name || '—') }, { label: 'Role', k: 'role' }, { label: 'Phone', k: 'phone' }, { label: 'Email', k: 'email' }], rows, { go: (c) => '/contacts/'.replace('/contacts/', '/crm/contacts/') + c.id, empty: 'No contacts match.' })}</div>`;
  } });
  DM.input('crm-cq', (v) => { ui.cq = v; DM.render(); });
  DM.input('crm-cparty', (v) => { ui.cparty = v; DM.render(); });

  const cform = (c, pid) => `<form id="contact-form" class="card pad col gap16" onsubmit="return false"><div class="grid g2">${DM.field('Full name *', 'name', { value: c.name })}<div class="field"><label>Party</label><select class="select" name="partyId">${parties().map((p) => `<option value="${p.id}" ${p.id === (c.partyId || pid) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>${DM.field('Role', 'role', { value: c.role, ph: 'Owner, Accounts, Purchase…' })}${DM.field('Phone', 'phone', { value: c.phone, ph: '+91 …' })}${DM.field('Email', 'email', { value: c.email, type: 'email' })}<label class="row" style="padding-top:22px"><input type="checkbox" name="primary" ${c.primary ? 'checked' : ''}> Primary contact for the party</label></div></form>`;
  DM.page('/crm/contacts/new', { title: 'New contact', crumb: 'New contact', render({ q }) {
    return `<div class="page" style="max-width:760px"><a class="btn ghost sm" href="#/crm/contacts">${I('arrowL')} Contacts</a>${DM.header('New contact')}${cform({}, q.get('party'))}<div class="row" style="margin-top:12px"><a class="btn outline" href="#/crm/contacts">Cancel</a><button class="btn right" data-act="crm-contact-create">${I('check')} Add contact</button></div></div>`;
  } });
  DM.act('crm-contact-create', () => {
    const d = DM.formData(document.getElementById('contact-form')); if (!d.name.trim()) return DM.toast('Name is required', 'alert');
    if (d.primary) contacts().forEach((c) => { if (c.partyId === d.partyId) c.primary = false; });
    const c = { id: DM.uid('c'), partyId: d.partyId, name: d.name.trim(), role: d.role, phone: d.phone, email: d.email, primary: !!d.primary }; contacts().unshift(c); DM.toast('Contact added'); DM.go('/crm/contacts/' + c.id);
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
