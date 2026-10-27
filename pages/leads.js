/* Deals (leads) — kanban board with drag-and-drop, table view, detail page, create-lead modal. */
(function () {
  const D = window.DM, I = D.icon, esc = D.esc;
  const st = document.createElement('style'); st.dataset.for = 'leads';
  st.textContent = `
  .kb-card.dragging{opacity:.4}.kcol.over{outline:2px dashed var(--chart-2);outline-offset:-4px;background:var(--info-tint)}
  .kb-card{cursor:grab}
  .stager{display:flex;gap:0;overflow:auto;border:1px solid var(--border);border-radius:10px;background:#fff}
  .stager button{flex:1;padding:9px 14px;font-size:12.5px;color:var(--muted-foreground);border-right:1px solid var(--border);white-space:nowrap;position:relative;min-width:96px}
  .stager button:last-child{border-right:0}.stager button:hover{background:var(--muted)}
  .stager button.past{color:var(--foreground);background:#fafafa}.stager button.on{background:#171717;color:#fff;font-weight:500}
  .tl{position:relative;padding-left:22px}.tl::before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:1px;background:var(--border)}
  .tl .ev{position:relative;padding:0 0 16px}.tl .ev::before{content:"";position:absolute;left:-20px;top:4px;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--chart-2)}
  `;
  document.head.appendChild(st);

  const S = () => D.S, STAGES = ['New', 'Qualified', 'Quoted', 'Negotiation', 'Won', 'Lost'];
  const TONE = { New: '', Qualified: 'blue', Quoted: 'violet', Negotiation: 'amber', Won: 'green', Lost: 'red' };
  const LIKE = { New: 15, Qualified: 35, Quoted: 55, Negotiation: 75, Won: 100, Lost: 0 };
  const ui = () => (D.ui.leads = D.ui.leads || { view: 'board', q: '', owner: 'all', sort: 'value', dir: -1, tab: 'overview' });
  const leads = () => S().leads || [];
  const party = (id) => D.by(S().parties, id) || { id, name: id || '—' };
  const uname = (id) => (D.by(S().users, id) || {}).name || (id === 'anuma' ? 'Anuma' : id || 'Unassigned');
  const NOW = '2026-10-27T11:00:00+05:30';
  const me = () => (S().users || [])[0] || { id: 'me', name: 'You' };
  const stage = (l, s) => { if (l.stage === s) return; (l.history = l.history || []).push({ at: NOW, text: `Moved from ${l.stage} to ${s}`, by: me().name }); l.stage = s; };

  function filtered() {
    const u = ui(); let L = leads().slice();
    if (u.owner !== 'all') L = L.filter((l) => l.owner === u.owner);
    if (u.q) { const q = u.q.toLowerCase(); L = L.filter((l) => (l.title + ' ' + party(l.partyId).name).toLowerCase().includes(q)); }
    return L;
  }
  function toolbar(count) {
    const u = ui(), users = S().users || []; const all = leads(); const open = all.filter((l) => !['Won', 'Lost'].includes(l.stage)); const won = all.filter((l) => l.stage === 'Won'); const closed = all.filter((l) => ['Won', 'Lost'].includes(l.stage)).length;
    return `${D.header('Deals', `${count} deals`, `<button class="btn" data-act="ld-new">${I('plus')} New deal</button>`)}
    <div class="grid g4" style="margin-bottom:16px">${D.statCard('Open deals', open.length, null, 'handshake')}${D.statCard('Open pipeline', D.fmt.inrc(open.reduce((a, l) => a + (l.value || 0), 0)), null, 'rupee')}${D.statCard('Won', D.fmt.inrc(won.reduce((a, l) => a + (l.value || 0), 0)), won.length + ' deals', 'check')}${D.statCard('Win rate', closed ? Math.round((won.length / closed) * 100) + '%' : '—', null, 'chart')}</div>
    <div class="toolbar">${D.seg([{ key: 'board', label: 'Board', icon: 'columns' }, { key: 'table', label: 'Table', icon: 'list' }], u.view, 'ld-view')}<select class="select" style="width:150px" data-change="ld-owner"><option value="all">All owners</option>${users.map((x) => `<option value="${x.id}" ${u.owner === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><div class="row gap12 right">${D.searchBox('ld-q', 'Search deals or parties…', u.q)}</div></div>`;
  }
  const kcard = (l) => `<div class="kcard kb-card" draggable="true" data-lid="${l.id}" data-go="/leads/${l.id}"><div class="sm b" style="margin-bottom:4px">${esc(l.title)}</div><div class="xs muted row gap4">${D.avatar(party(l.partyId).name, 'sm')}<span class="trunc">${esc(party(l.partyId).name)}</span></div><div class="row" style="margin-top:8px"><span class="b mono sm">${D.fmt.inrc(l.value || 0)}</span><span class="xs muted">${esc(l.source || '')}</span><span class="right">${D.avatar(uname(l.owner), 'sm')}</span></div>${l.closeAt ? `<div class="xs muted" style="margin-top:6px">${I('calendar').replace('class="i "', 'class="i" style="width:11px;height:11px"')} ${D.fmt.date(l.closeAt)}</div>` : ''}</div>`;
  function board() {
    const L = filtered();
    return `<div class="kanban" style="grid-auto-columns:272px">${STAGES.map((s) => { const c = L.filter((l) => l.stage === s); return `<div class="kcol" data-stage="${s}"><div class="row" style="padding:2px 4px 4px"><span class="badge ${TONE[s]}">${s}</span><span class="xs muted">${c.length}</span><span class="xs mono muted right">${D.fmt.inrc(c.reduce((a, l) => a + (l.value || 0), 0))}</span></div>${c.map(kcard).join('') || '<div class="xs muted" style="padding:14px;text-align:center">Drop a deal here</div>'}</div>`; }).join('')}</div>`;
  }
  function table() {
    const STG = { New: 'grey', Qualified: 'blue', Quoted: 'blue', Negotiation: 'amber', Won: 'green', Lost: 'red' };
    const L = filtered().sort((a, b) => (a.title > b.title ? 1 : -1));
    const cols = [{ label: 'Deal', flex: 2, render: (l) => `<b>${esc(l.title)}</b>` }, { label: 'Party', flex: 2, render: (l) => esc(party(l.partyId).name) }, { label: 'Stage', w: '130px', render: (l) => D.status(l.stage, STG[l.stage] || 'grey') }, { label: 'Value', num: 1, w: '120px', render: (l) => D.fmt.inr(l.value || 0) }, { label: 'Owner', render: (l) => esc(uname(l.owner)) }, { label: 'Source', render: (l) => esc(l.source || '') }, { label: 'Close', w: '120px', render: (l) => (l.closeAt ? D.fmt.date(l.closeAt) : '—') }];
    return `<div class="gridbox">${D.table(cols, L, { go: (l) => '/leads/' + l.id, pageSize: 50, empty: 'No deals match.' })}${L.length && L.length <= 50 ? `<div class="gridfoot"><span>${L.length} deals in view</span></div>` : ''}</div>`;
  }
  D.page('/leads', { title: 'Deals', crumb: 'All deals', render() { const u = ui(); return `<div class="page wide">${toolbar(leads().length)}${u.view === 'board' ? board() : table()}</div>`; } });

  /* detail */
  const quotesFor = (l) => (S().quotes || []).filter((q) => q.leadId === l.id || (l.rfqId && q.rfqId === l.rfqId) || (!q.leadId && !q.rfqId && q.partyId === l.partyId));
  function timeline(l) {
    const ev = [{ at: l.createdAt, text: `Deal created from ${l.source || 'manual entry'}`, by: uname(l.owner) }];
    if (l.rfqId) { const r = D.by(S().rfqs, l.rfqId); ev.push({ at: (r || {}).receivedAt || l.createdAt, text: `RFQ ${(r || {}).no || l.rfqId} linked`, by: 'Anuma', href: '/orders/rfqs/' + l.rfqId }); }
    quotesFor(l).forEach((q) => ev.push({ at: q.createdAt, text: `Quote ${q.no} ${q.status.replace('_', ' ')} · ${D.fmt.inr(q.total)}`, by: q.approver ? uname(q.approver) : 'Anuma', href: '/quotes/' + q.id }));
    (l.history || []).forEach((h) => ev.push(h)); (l.noteList || []).forEach((n) => ev.push({ at: n.at, text: 'Note: ' + n.text, by: n.by }));
    ev.sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0));
    return `<div class="tl">${ev.map((e) => `<div class="ev"><div class="sm">${e.href ? `<a class="b" href="#${e.href}">${esc(e.text)}</a>` : esc(e.text)}</div><div class="xs muted">${esc(e.by || '')} · ${D.fmt.dt(e.at)}</div></div>`).join('')}</div>`;
  }
  D.page('/leads/:id', {
    title: 'Deal', crumb: (p) => (D.by(S().leads, p.id) || {}).title || p.id,
    render({ params }) {
      const l = D.by(leads(), params.id), u = ui(); if (!l) return `<div class="page"><div class="empty"><h3>Deal not found</h3><a class="btn outline" href="#/leads">Back to deals</a></div></div>`;
      const p = party(l.partyId), idx = STAGES.indexOf(l.stage), qs = quotesFor(l), th = (S().threads || []).find((t) => t.dealId === l.id || (l.rfqId && t.rfqId === l.rfqId));
      const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'timeline', label: 'Timeline' }, { key: 'quotes', label: 'Quotes', count: qs.length }, { key: 'notes', label: 'Notes', count: (l.noteList || []).length || undefined }];
      let body;
      if (u.tab === 'timeline') body = `<div class="card pad">${timeline(l)}</div>`;
      else if (u.tab === 'quotes') body = `<div class="row" style="margin-bottom:10px"><h3 class="grow">Quotes</h3><button class="btn sm" data-act="ld-mkquote" data-arg="${l.id}">${I('plus')} Create quote</button></div>${D.table([{ label: 'Quote', render: (q) => `<span class="b">${esc(q.no)}</span>` }, { label: 'Status', render: (q) => D.badge(q.status.replace('_', ' '), { sent: 'blue', accepted: 'green', rejected: 'red', pending_approval: 'amber' }[q.status] || '') }, { label: 'Total', num: 1, render: (q) => D.fmt.inr(q.total) }, { label: 'Margin', num: 1, render: (q) => (q.marginPct != null ? q.marginPct + '%' : '—') }, { label: 'Valid till', render: (q) => D.fmt.date(q.validTill) }], qs, { go: (q) => '/quotes/' + q.id, empty: 'No quotes yet — create one from the RFQ or from scratch.' })}`;
      else if (u.tab === 'notes') body = `<div class="card pad col"><textarea class="textarea" id="ld-note" rows="3" placeholder="Add a note for the team…"></textarea><div><button class="btn sm" data-act="ld-addnote" data-arg="${l.id}">Add note</button></div></div><div class="col" style="margin-top:12px">${(l.noteList || []).slice().reverse().map((n) => `<div class="card pad"><div class="sm">${esc(n.text)}</div><div class="xs muted" style="margin-top:4px">${esc(n.by)} · ${D.fmt.dt(n.at)}</div></div>`).join('')}${l.notes ? `<div class="card pad"><div class="sm">${esc(l.notes)}</div><div class="xs muted" style="margin-top:4px">Imported note</div></div>` : ''}</div>`;
      else body = `<div class="grid g2"><div class="card pad"><h3 style="margin-bottom:10px">Summary</h3><dl class="kv"><dt>Party</dt><dd><a class="b" href="#/crm/accounts/${p.id}">${esc(p.name)}</a></dd><dt>Value</dt><dd class="mono b">${D.fmt.inr(l.value || 0)}</dd><dt>Owner</dt><dd class="row gap4">${D.avatar(uname(l.owner), 'sm')}${esc(uname(l.owner))}</dd><dt>Source</dt><dd>${esc(l.source || '—')}</dd><dt>Created</dt><dd>${D.fmt.date(l.createdAt)}</dd><dt>Expected close</dt><dd>${l.closeAt ? D.fmt.date(l.closeAt) : '—'}</dd></dl></div>
        <div class="col"><div class="card pad"><h3>Likelihood to win</h3><div class="row" style="margin:10px 0 6px"><span style="font-size:24px;font-weight:600">${LIKE[l.stage]}%</span><span class="muted sm">based on stage and activity</span></div><div class="bar"><i style="width:${LIKE[l.stage]}%"></i></div></div>
        <div class="card pad"><h3 style="margin-bottom:8px">Linked</h3><div class="col" style="gap:6px">${th ? `<a class="btn outline sm" href="#/inbox/threads?case=${th.id}">${I('inbox')} Conversation</a>` : ''}${l.rfqId ? `<a class="btn outline sm" href="#/orders/rfqs/${l.rfqId}">${I('sheet')} RFQ</a>` : ''}${qs[0] ? `<a class="btn outline sm" href="#/quotes/${qs[0].id}">${I('receipt')} Latest quote ${esc(qs[0].no)}</a>` : `<button class="btn outline sm" data-act="ld-mkquote" data-arg="${l.id}">${I('plus')} Create quote</button>`}</div></div></div></div>`;
      return `<div class="page"><div class="row" style="margin-bottom:6px"><a class="btn ghost sm" href="#/leads">${I('arrowL')} Deals</a></div>
        ${D.header(esc(l.title) + ' ' + D.status(l.stage, { New: 'grey', Qualified: 'blue', Quoted: 'blue', Negotiation: 'amber', Won: 'green', Lost: 'red' }[l.stage] || 'grey'), `${esc(p.name)} · ${D.fmt.inr(l.value || 0)}`, `${l.stage !== 'Won' ? `<button class="btn outline" data-act="ld-close" data-arg="${l.id}:Lost">Mark lost</button><button class="btn" data-act="ld-close" data-arg="${l.id}:Won">${I('check')} Mark won</button>` : `<button class="btn outline" data-act="ld-stage" data-arg="${l.id}:Negotiation">Reopen</button>`}<button class="btn ghost icon" data-act="ld-menu" data-arg="${l.id}">${I('more')}</button>`)}
        <div class="stager" style="margin-bottom:16px">${STAGES.filter((s) => s !== 'Lost').map((s) => `<button class="${STAGES.indexOf(s) < idx && l.stage !== 'Lost' ? 'past' : ''} ${s === l.stage ? 'on' : ''}" data-act="ld-stage" data-arg="${l.id}:${s}">${s}</button>`).join('')}</div>
        <div style="margin-bottom:14px">${D.seg(tabs, u.tab, 'ld-tab')}</div>${body}</div>`;
    },
  });

  /* ── actions ── */
  const A = D.act;
  A('ld-view', (el) => { ui().view = el.dataset.arg; D.render(); });
  A('ld-tab', (el) => { ui().tab = el.dataset.arg; D.render(); });
  A('ld-sort', (el) => { const u = ui(), k = el.dataset.arg; u.dir = u.sort === k ? -u.dir : 1; u.sort = k; D.render(); });
  D.input('ld-q', (v) => { ui().q = v; D.render(); });
  D.input('ld-owner', (v) => { ui().owner = v; D.render(); });
  A('ld-stage', (el) => { const [id, s] = el.dataset.arg.split(':'); const l = D.by(leads(), id); stage(l, s); D.toast(`Deal moved to ${s}`, 'handshake'); D.render(); });
  A('ld-close', (el) => { const [id, s] = el.dataset.arg.split(':'); const l = D.by(leads(), id); D.confirm(s === 'Won' ? 'Mark deal as won?' : 'Mark deal as lost?', `“${esc(l.title)}” will move to ${s}.`, () => { stage(l, s); D.toast(`Deal marked ${s.toLowerCase()}`, s === 'Won' ? 'check' : 'x'); D.render(); }, s === 'Won' ? 'Mark won' : 'Mark lost'); });
  A('ld-menu', (el) => { const l = D.by(leads(), el.dataset.arg); D.menu(el, [{ label: 'Duplicate deal', icon: 'copy', run: () => { const c = Object.assign(D.clone(l), { id: D.uid('L'), title: l.title + ' (copy)', stage: 'New', history: [] }); leads().unshift(c); D.go('/leads/' + c.id); } }, { label: 'Open conversation', icon: 'inbox', run: () => { const t = (S().threads || []).find((x) => x.dealId === l.id); t ? D.go('/inbox/threads?case=' + t.id) : D.toast('No conversation linked to this deal', 'info'); } }, { label: 'Delete deal', icon: 'trash', run: () => D.confirm('Delete deal?', 'This cannot be undone.', () => { S().leads = leads().filter((x) => x.id !== l.id); D.go('/leads'); D.toast('Deal deleted', 'trash'); }, 'Delete') }]); });
  A('ld-addnote', (el) => { const v = document.getElementById('ld-note').value.trim(); if (!v) return D.toast('Write a note first', 'info'); const l = D.by(leads(), el.dataset.arg); (l.noteList = l.noteList || []).push({ text: v, by: me().name, at: NOW }); D.toast('Note added'); D.render(); });
  A('ld-mkquote', (el) => {
    const l = D.by(leads(), el.dataset.arg), r = l.rfqId && D.by(S().rfqs, l.rfqId); const qs = S().quotes = S().quotes || [];
    const lines = r ? r.lines.filter((x) => x.productId).map((x) => ({ productId: x.productId, name: x.name, qty: x.qty, unit: x.unit, price: x.price, discPct: 0 })) : [];
    const q = { id: D.uid('Q'), no: 'QT-' + (3000 + qs.length + 1), leadId: l.id, rfqId: l.rfqId, partyId: l.partyId, status: 'draft', total: lines.reduce((a, x) => a + x.qty * x.price, 0), marginPct: 18, validTill: '2026-11-10', createdAt: NOW, terms: '50% advance, balance on delivery. Prices exclusive of GST.', lines };
    qs.unshift(q); stage(l, l.stage === 'New' || l.stage === 'Qualified' ? 'Quoted' : l.stage); D.toast('Quote ' + q.no + ' created', 'receipt'); D.go('/quotes/' + q.id);
  });
  A('ld-new', () => {
    const ps = S().parties || [], us = S().users || [];
    D.modal({ title: 'New deal', body: `<div class="col">${D.field('Title', 'title', { ph: 'e.g. Panel wiring — Site 4' })}<div class="grid g2">${D.field('Party', 'party', { options: ps.map((p) => p.name) })}${D.field('Value (₹)', 'value', { type: 'number', value: 100000 })}</div><div class="grid g2">${D.field('Stage', 'stage', { options: STAGES.slice(0, 4) })}${D.field('Owner', 'owner', { options: us.map((u) => u.name) })}</div><div class="grid g2">${D.field('Source', 'source', { options: ['Manual', 'WhatsApp', 'Email', 'IndiaMART', 'Referral'] })}${D.field('Expected close', 'closeAt', { type: 'date', value: '2026-11-20' })}</div></div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create deal', run: (m) => { const f = D.formData(m); if (!f.title.trim()) { D.toast('Give the deal a title', 'info'); return false; } const l = { id: D.uid('L'), title: f.title, partyId: (ps.find((p) => p.name === f.party) || {}).id, stage: f.stage, value: +f.value || 0, owner: (us.find((u) => u.name === f.owner) || me()).id, source: f.source, createdAt: NOW, closeAt: f.closeAt, notes: '' }; leads().unshift(l); D.toast('Deal created', 'handshake'); D.go('/leads/' + l.id); } }] });
  });

  /* drag & drop (board) */
  let drag = null;
  document.addEventListener('dragstart', (e) => { const c = e.target.closest && e.target.closest('.kb-card'); if (!c) return; drag = c.dataset.lid; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', drag); } catch (x) {} });
  document.addEventListener('dragend', (e) => { document.querySelectorAll('.kb-card.dragging').forEach((c) => c.classList.remove('dragging')); document.querySelectorAll('.kcol.over').forEach((c) => c.classList.remove('over')); });
  document.addEventListener('dragover', (e) => { const col = e.target.closest && e.target.closest('.kcol[data-stage]'); if (!col || !drag) return; e.preventDefault(); document.querySelectorAll('.kcol.over').forEach((c) => c !== col && c.classList.remove('over')); col.classList.add('over'); });
  document.addEventListener('drop', (e) => { const col = e.target.closest && e.target.closest('.kcol[data-stage]'); if (!col || !drag) return; e.preventDefault(); const l = D.by(leads(), drag); drag = null; if (l && l.stage !== col.dataset.stage) { stage(l, col.dataset.stage); D.toast(`${l.title} → ${col.dataset.stage}`, 'handshake'); } D.render(); });
})();
