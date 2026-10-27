/* Agents: roster, create dialog, detail (Overview · Training · Test mode · Activity). */
(function () {
  const { esc, icon: I, fmt } = DM;
  const st = document.createElement('style'); st.dataset.for = 'agents';
  st.textContent = `
  .ag-card{padding:16px;cursor:pointer;display:flex;flex-direction:column;gap:12px;transition:border-color .14s,box-shadow .14s}
  .ag-card:hover{border-color:#bdbdbd;box-shadow:0 2px 10px rgba(0,0,0,.05)}
  .ag-tile{width:36px;height:36px;border-radius:9px;background:#171717;color:#fff;display:grid;place-items:center;font-weight:700;flex:none}
  .ag-dot{width:8px;height:8px;border-radius:50%;background:#a3a3a3;flex:none}.ag-dot.live{background:var(--success);box-shadow:0 0 0 3px var(--success-tint)}.ag-dot.paused{background:var(--warning)}
  .ag-foot{display:flex;align-items:center;gap:8px;border-top:1px solid var(--border);padding-top:10px;font-size:12px;color:var(--muted-foreground)}
  .ag-chtile{width:20px;height:20px;border-radius:5px;display:grid;place-items:center;color:#fff;flex:none}
  .ag-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start}
  .ag-rule{display:flex;gap:10px;align-items:flex-start;padding:10px 14px;border-bottom:1px solid var(--border)}
  .ag-rule:last-child{border-bottom:0}.ag-rule .acts{opacity:0;transition:opacity .14s;display:flex;gap:2px}.ag-rule:hover .acts{opacity:1}
  .ag-slider{width:100%;accent-color:#171717}
  .ag-chat{display:flex;flex-direction:column;height:calc(100vh - 290px);min-height:360px}
  .ag-chat .msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
  .ag-chat .comp{display:flex;gap:8px;padding:10px;border-top:1px solid var(--border)}
  .diff-add{background:var(--success-tint);color:#0b7a4e;border-radius:6px;padding:4px 8px;font-size:12.5px}
  .diff-del{background:var(--destructive-tint);color:#b42318;border-radius:6px;padding:4px 8px;font-size:12.5px;text-decoration:line-through}
  .typing i{display:inline-block;width:5px;height:5px;border-radius:50%;background:#a3a3a3;margin:0 1px;animation:tp 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}
  @keyframes tp{0%,60%,100%{opacity:.3}30%{opacity:1}}
  @media(max-width:1100px){.ag-layout{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  const U = () => (DM.ui.agents = DM.ui.agents || { chat: {}, train: {}, tab: {}, actFilter: 'all' });
  const agents = () => DM.S.agents || (DM.S.agents = []);
  const chans = () => DM.S.channels || [];
  const CH_COL = { whatsapp: '#1daa68', email: '#2563eb', indiamart: '#e11d48', web: '#7c3aed', telegram: '#0ea5e9' };
  const chOf = (a) => DM.by(chans(), a.channelId);
  const chLabel = (c) => (c ? (c.type === 'whatsapp' ? 'WhatsApp' : c.type[0].toUpperCase() + c.type.slice(1)) + (c.number ? ' · ' + c.number : c.name ? ' · ' + c.name : '') : 'No channel yet');
  const chTile = (c) => `<span class="ag-chtile" style="background:${CH_COL[c?.type] || '#a3a3a3'}">${I(c?.type === 'email' ? 'mail' : c?.type === 'web' ? 'globe' : 'chat').replace('class="i ', 'style="width:12px;height:12px" class="i ')}</span>`;
  const policy = () => DM.S.policy || (DM.S.policy = { confidenceFloor: 75, handoffTimerMin: 30, notify: (DM.S.users || []).filter((u) => /ASM|Owner|Admin/.test(u.role)).slice(0, 2).map((u) => u.id), handBack: 'anuma', autoClose: '24h after confirm' });
  const nowLbl = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const nowIso = () => new Date().toISOString();

  /* ── roster ── */
  function card(a) {
    const c = chOf(a);
    return `<div class="card ag-card fadein" data-go="/agents/${esc(a.id)}">
      <div class="row" style="align-items:flex-start"><div class="ag-tile">A</div><div class="grow"><div class="b">${esc(a.name)}</div><div class="sm muted" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(a.role || 'No description yet')}</div></div><span class="ag-dot ${esc(a.status)}" title="${esc(a.status)}"></span></div>
      <div class="row gap4 wrap">${DM.badge(a.status === 'live' ? 'Live' : a.status === 'paused' ? 'Paused' : 'Draft', a.status === 'live' ? 'green' : 'amber', true)}${a.kpis ? DM.badge(fmt.num(a.kpis.handled || 0) + ' handled', 'outline') : ''}${(a.kpis?.escalated || 0) ? DM.badge(a.kpis.escalated + ' escalated', 'blue') : ''}</div>
      <div class="ag-foot">${chTile(c)}<span class="grow trunc">${c ? 'Lives in ' + esc(chLabel(c)) : 'Not connected to a channel'}</span><button class="btn ghost icon sm" data-act="ag-menu" data-arg="${esc(a.id)}">${I('more')}</button></div></div>`;
  }
  DM.page('/agents', { title: 'Agents', render() {
    const list = agents();
    return `<div class="page">${DM.header('Agents', 'Each agent answers on its own channel with its own script, training and activity log.', DM.btn('New agent', 'ag-new', { icon: 'plus' }))}
      ${list.length ? `<div class="grid g3">${list.map(card).join('')}</div>` : `<div class="card"><div class="empty">${I('bot')}<h3 style="margin:8px 0 4px">No agents yet</h3><p>Create one to start answering on WhatsApp or email.</p><p style="margin-top:12px">${DM.btn('New agent', 'ag-new', { icon: 'plus' })}</p></div></div>`}</div>`;
  } });

  function agentForm(a) {
    return `<div class="col gap12">${DM.field('Name', 'name', { value: a?.name || '', ph: 'e.g. WhatsApp order desk' })}${DM.field('What does it do?', 'role', { value: a?.role || '', area: true, ph: 'Takes orders, answers price and stock questions, hands over when unsure.' })}
      <div class="field"><label>Channel</label><select class="select" name="channelId"><option value="">No channel yet</option>${chans().map((c) => `<option value="${esc(c.id)}" ${a?.channelId === c.id ? 'selected' : ''}>${esc(chLabel(c))}</option>`).join('')}</select></div></div>`;
  }
  DM.act('ag-new', () => DM.modal({ title: 'New agent', body: agentForm(), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create agent', run: (m) => {
    const f = DM.formData(m); if (!f.name.trim()) { DM.toast('Give the agent a name', 'alert'); return false; }
    const a = { id: DM.uid('ag'), name: f.name.trim(), status: 'draft', channelId: f.channelId || null, role: f.role, initialMessage: 'Hello! How can I help you today?', rules: [{ id: DM.uid('r'), kind: 'rule', scope: 'inherited', text: 'Always confirm quantity and unit before recording an order line.' }, { id: DM.uid('r'), kind: 'guardrail', scope: 'inherited', text: 'Never quote below the rate card minimum margin.' }], sources: [], learned: [], gaps: [], training: [], activity: [], kpis: { handled: 0, autoRate: 0, escalated: 0, avgReplySec: 0 } };
    agents().push(a); DM.toast('Agent created'); DM.go('/agents/' + a.id);
  } }] }));
  DM.act('ag-menu', (el, ev) => { ev.stopPropagation(); const a = DM.by(agents(), el.dataset.arg); DM.menu(el, [
    { label: 'Open', icon: 'eye', run: () => DM.go('/agents/' + a.id) }, { label: 'Edit details', icon: 'edit', run: () => editAgent(a.id) },
    { label: a.status === 'live' ? 'Pause' : 'Go live', icon: a.status === 'live' ? 'pause' : 'play', run: () => toggleStatus(a.id) },
    { label: 'Delete', icon: 'trash', run: () => DM.confirm('Delete agent?', `<b>${esc(a.name)}</b> will stop answering on its channel. This can't be undone.`, () => { DM.S.agents = agents().filter((x) => x.id !== a.id); DM.toast('Agent deleted'); if (DM.path().startsWith('/agents/')) DM.go('/agents'); else DM.render(); }, 'Delete') }]); });
  function editAgent(id) { const a = DM.by(agents(), id); DM.modal({ title: 'Edit agent', body: agentForm(a), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (m) => { Object.assign(a, DM.formData(m)); a.channelId = a.channelId || null; DM.toast('Agent updated'); DM.render(); } }] }); }
  function toggleStatus(id) { const a = DM.by(agents(), id); a.status = a.status === 'live' ? 'paused' : 'live'; DM.toast(a.status === 'live' ? a.name + ' is live' : a.name + ' paused', a.status === 'live' ? 'check' : 'pause'); DM.render(); }
  DM.act('ag-status', (el) => toggleStatus(el.dataset.arg));
  DM.act('ag-edit', (el) => editAgent(el.dataset.arg));

  /* ── detail shell ── */
  const TABS = [['overview', 'Overview'], ['training', 'Training'], ['test', 'Test mode'], ['activity', 'Activity']];
  function shell(a, tab, body) {
    const c = chOf(a);
    return `<div class="page">
      <div class="row" style="margin-bottom:6px"><a class="btn ghost sm" href="#/agents">${I('arrowL')} Agents</a></div>
      <div class="ph"><div class="row gap12"><div class="ag-tile" style="width:44px;height:44px;font-size:18px">A</div><div><h1 class="row" style="gap:8px">${esc(a.name)} ${DM.badge(a.status === 'live' ? 'Live' : a.status === 'paused' ? 'Paused' : 'Draft', a.status === 'live' ? 'green' : 'amber', true)}</h1><p class="row gap4">${chTile(c)} ${esc(chLabel(c))}</p></div></div>
        <div class="acts">${DM.btn('Edit', 'ag-edit', { cls: 'outline', arg: a.id, icon: 'edit' })}${DM.btn(a.status === 'live' ? 'Pause' : 'Go live', 'ag-status', { arg: a.id, cls: a.status === 'live' ? 'outline' : '', icon: a.status === 'live' ? 'pause' : 'play' })}<button class="btn outline icon" data-act="ag-menu" data-arg="${esc(a.id)}">${I('more')}</button></div></div>
      <div class="tabs">${TABS.map(([k, l]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#/agents/${esc(a.id)}/${k}">${l}${k === 'activity' ? ` <span class="badge">${(a.activity || []).length}</span>` : ''}</a>`).join('')}</div>
      ${body}</div>`;
  }
  const notFound = () => `<div class="page"><div class="empty"><h3>Agent not found</h3><p style="margin-top:10px"><a class="btn outline" href="#/agents">Back to agents</a></p></div></div>`;
  const renderTab = (tab, a) => (tab === 'training' ? training(a) : tab === 'test' ? testMode(a) : tab === 'activity' ? activity(a) : overview(a));
  DM.page('/agents/:id', { title: 'Agent', crumb: (p) => (DM.by(agents(), p.id) || {}).name || 'Agent', render({ params }) { const a = DM.by(agents(), params.id); return a ? shell(a, 'overview', overview(a)) : notFound(); }, after: afterTab });
  DM.page('/agents/:id/:tab', { title: 'Agent', crumb: (p) => ((DM.by(agents(), p.id) || {}).name || 'Agent') + ' / ' + p.tab, render({ params }) { const a = DM.by(agents(), params.id); if (!a) return notFound(); const t = TABS.some(([k]) => k === params.tab) ? params.tab : 'overview'; return shell(a, t, renderTab(t, a)); }, after: afterTab });
  function afterTab(view) { const m = view.querySelector('.msgs'); if (m) m.scrollTop = m.scrollHeight; }

  /* ── overview ── */
  const KIND = { rule: ['Rules', 'How the agent behaves day to day'], guardrail: ['Guardrails', 'Hard limits it will never cross'], helper: ['Helpers', 'Shortcuts and lookups it can use'] };
  function ruleRows(a, kind) {
    const rs = (a.rules || []).filter((r) => r.kind === kind);
    return `<div class="card" style="margin-bottom:12px"><div class="card-h"><div><h3>${KIND[kind][0]}</h3><div class="xs muted">${KIND[kind][1]}</div></div><span class="badge">${rs.length}</span><button class="btn outline sm right" data-act="ag-rule-add" data-arg="${esc(a.id)}|${kind}">${I('plus')} Add</button></div>
      ${rs.length ? rs.map((r) => `<div class="ag-rule"><span style="margin-top:2px;color:var(--muted-foreground)">${I(kind === 'guardrail' ? 'shield' : kind === 'helper' ? 'wand' : 'check')}</span><div class="grow"><div>${esc(r.text)}</div><div class="row gap4" style="margin-top:4px">${DM.badge(r.scope === 'agent' ? 'This agent' : 'Inherited', r.scope === 'agent' ? 'blue' : '')}${r.overridden ? DM.badge('Overridden', 'amber') : ''}</div></div><div class="acts"><button class="btn ghost icon sm" title="Edit" data-act="ag-rule-edit" data-arg="${esc(a.id)}|${esc(r.id)}">${I('edit')}</button><button class="btn ghost icon sm" title="Remove" data-act="ag-rule-del" data-arg="${esc(a.id)}|${esc(r.id)}">${I('trash')}</button></div></div>`).join('') : `<div class="empty sm" style="padding:20px">None yet.</div>`}</div>`;
  }
  function overview(a) {
    const p = policy(); const c = chOf(a); const k = a.kpis || {};
    const ASMs = (DM.S.users || []).filter((u) => u.status !== 'invited');
    return `<div class="ag-layout"><div>
      <div class="grid g4" style="margin-bottom:12px">${DM.stat('Handled', fmt.num(k.handled || 0), 'last 30 days', { icon: 'chat' })}${DM.stat('Auto-resolved', (k.autoRate || 0) + '%', 'no human needed', { icon: 'zap' })}${DM.stat('Escalated', k.escalated || 0, 'to a human', { icon: 'users' })}${DM.stat('Avg reply', (k.avgReplySec || 0) + 's', 'first response', { icon: 'clock' })}</div>
      <div class="card pad" style="margin-bottom:12px"><div class="row"><h3 class="grow">Role</h3><button class="btn outline sm" data-act="ag-save-script" data-arg="${esc(a.id)}">Save script</button></div>
        <div class="col" style="margin-top:10px"><div class="field"><label>What this agent does</label><textarea class="textarea" rows="3" data-input="ag-role" data-id="${esc(a.id)}">${esc(a.role || '')}</textarea></div>
        <div class="field"><label>Opening message</label><textarea class="textarea" rows="2" data-input="ag-init" data-id="${esc(a.id)}">${esc(a.initialMessage || '')}</textarea></div></div></div>
      ${ruleRows(a, 'rule')}${ruleRows(a, 'guardrail')}${ruleRows(a, 'helper')}</div>
      <div class="col" style="gap:12px">
        <div class="card pad"><h3>Escalation policy</h3><div class="xs muted" style="margin:2px 0 10px">Shared by every agent. When Anuma isn't sure, a human takes over.</div>
          <div class="field"><label class="row">Confidence floor <span class="right b mono" id="ag-cf">${p.confidenceFloor}%</span></label><input class="ag-slider" type="range" min="40" max="95" step="1" value="${p.confidenceFloor}" data-input="ag-cf"><div class="xs muted">Below this match confidence, the line goes to a person.</div></div>
          <div class="field" style="margin-top:12px"><label class="row">Hand-off timer <span class="right b mono" id="ag-ht">${p.handoffTimerMin} min</span></label><input class="ag-slider" type="range" min="5" max="120" step="5" value="${p.handoffTimerMin}" data-input="ag-ht"><div class="xs muted">Re-notify the owner if no one picks the case up in this time.</div></div>
          <div class="sep"></div><div class="field"><label>Notify</label><div class="col" style="gap:6px">${ASMs.slice(0, 6).map((u) => `<label class="row sm" style="cursor:pointer"><span class="chk ${p.notify.includes(u.id) ? 'on' : ''}" data-act="ag-notify" data-arg="${esc(u.id)}">${p.notify.includes(u.id) ? I('check').replace('class="i ', 'style="width:11px;height:11px" class="i ') : ''}</span>${DM.avatar(u.name, 'sm')} ${esc(u.name)} <span class="muted xs">${esc(u.role)}</span></label>`).join('')}</div></div>
          <div class="field" style="margin-top:12px"><label>When the human is done</label><select class="select" data-change="ag-hb"><option value="anuma" ${p.handBack === 'anuma' ? 'selected' : ''}>Hand back to Anuma</option><option value="owner" ${p.handBack === 'owner' ? 'selected' : ''}>Stay with the human</option><option value="ask" ${p.handBack === 'ask' ? 'selected' : ''}>Ask the human each time</option></select></div></div>
        <div class="card pad"><h3>Channel</h3>${c ? `<div class="row" style="margin-top:10px">${chTile(c)}<div class="grow"><div class="sm b">${esc(chLabel(c))}</div><div class="xs muted">${esc(c.provider || '')} · webhook ${esc(c.webhook || 'healthy')}</div></div>${DM.badge(c.state === 'connected' ? 'Connected' : 'Check', c.state === 'connected' ? 'green' : 'amber', true)}</div><div class="row" style="margin-top:10px"><a class="btn outline sm" href="#/settings/channels">Manage channels</a></div>` : `<p class="sm muted" style="margin:8px 0">Not connected to a channel yet.</p><button class="btn sm" data-act="ag-edit" data-arg="${esc(a.id)}">Choose channel</button>`}</div>
        <div class="card pad"><h3>Knowledge</h3><div class="col" style="margin-top:8px;gap:8px">${(a.sources || []).slice(0, 5).map((s) => `<div class="row sm">${I(s.type === 'link' ? 'link' : s.type === 'chat' ? 'chat' : 'file')}<span class="grow trunc">${esc(s.title)}</span>${DM.badge(s.state || 'indexed', s.state === 'failed' ? 'red' : s.state === 'pending' ? 'amber' : 'green')}</div>`).join('') || '<div class="sm muted">No sources yet.</div>'}</div><button class="btn outline sm" style="margin-top:10px" data-act="ag-src-add" data-arg="${esc(a.id)}">${I('plus')} Add source</button></div>
      </div></div>`;
  }
  DM.input('ag-cf', (v, el) => { policy().confidenceFloor = +v; const s = document.getElementById('ag-cf'); if (s) s.textContent = v + '%'; });
  DM.input('ag-ht', (v) => { policy().handoffTimerMin = +v; const s = document.getElementById('ag-ht'); if (s) s.textContent = v + ' min'; });
  DM.input('ag-role', (v, el) => { const a = DM.by(agents(), el.dataset.id); if (a) a.role = v; });
  DM.input('ag-init', (v, el) => { const a = DM.by(agents(), el.dataset.id); if (a) a.initialMessage = v; });
  DM.input('ag-hb', (v) => { policy().handBack = v; DM.toast('Hand-back rule updated'); });
  DM.act('ag-save-script', () => DM.toast('Script saved'));
  DM.act('ag-notify', (el) => { const p = policy(); const id = el.dataset.arg; p.notify = p.notify.includes(id) ? p.notify.filter((x) => x !== id) : p.notify.concat(id); DM.render(); });
  DM.act('ag-src-add', (el) => DM.modal({ title: 'Add knowledge source', body: `<div class="col gap12">${DM.field('Type', 'type', { options: ['link', 'document', 'chat'] })}${DM.field('Title or URL', 'title', { ph: 'Price list Oct 2026.pdf' })}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add', run: (m) => { const f = DM.formData(m); if (!f.title.trim()) return false; const a = DM.by(agents(), el.dataset.arg); (a.sources = a.sources || []).unshift({ id: DM.uid('src'), type: f.type, title: f.title, state: 'indexed', addedBy: 'You', addedAt: nowIso(), usedIn: 0 }); DM.toast('Source indexed'); DM.render(); } }] }));
  function ruleModal(aid, rid, kind) {
    const a = DM.by(agents(), aid); const r = rid ? DM.by(a.rules, rid) : null;
    DM.modal({ title: r ? 'Edit ' + r.kind : 'Add ' + kind, body: DM.field('Text', 'text', { value: r?.text || '', area: true, rows: 4, ph: 'Describe the rule in plain language' }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (m) => { const t = DM.formData(m).text.trim(); if (!t) return false; if (r) { if (r.scope === 'inherited' && r.text !== t) { r.original = r.original || r.text; r.overridden = true; } r.text = t; } else (a.rules = a.rules || []).push({ id: DM.uid('r'), kind, scope: 'agent', text: t }); DM.toast('Saved'); DM.render(); } }] });
  }
  DM.act('ag-rule-add', (el) => { const [a, k] = el.dataset.arg.split('|'); ruleModal(a, null, k); });
  DM.act('ag-rule-edit', (el) => { const [a, r] = el.dataset.arg.split('|'); ruleModal(a, r); });
  DM.act('ag-rule-del', (el) => { const [aid, rid] = el.dataset.arg.split('|'); DM.confirm('Remove this line?', 'The agent will stop following it.', () => { const a = DM.by(agents(), aid); a.rules = a.rules.filter((r) => r.id !== rid); DM.toast('Removed'); DM.render(); }, 'Remove'); });

  /* ── training ── */
  const tchat = (a) => (U().train[a.id] = U().train[a.id] || { msgs: [{ from: 'anuma', text: `Hi — tell me how ${a.name} should behave differently and I'll update its guidelines. For example: "Always ask for the shade before confirming a curtain order."`, at: nowLbl() }], draft: '', busy: false });
  function training(a) {
    const t = tchat(a);
    return `<div class="ag-layout"><div class="card ag-chat"><div class="card-h"><h3 class="grow">Train ${esc(a.name)}</h3><span class="xs muted">Changes apply to the agent's guidelines</span></div>
      <div class="msgs chatbg">${t.msgs.map((m) => `<div class="bub ${m.from === 'you' ? 'out' : ''}">${esc(m.text)}${m.diff ? `<div class="col" style="margin-top:8px;gap:4px">${(m.diff.added || []).map((x) => `<div class="diff-add">+ ${esc(x)}</div>`).join('')}${(m.diff.removed || []).map((x) => `<div class="diff-del">− ${esc(x)}</div>`).join('')}</div>` : ''}<span class="tm">${esc(m.at)}</span></div>`).join('')}${t.busy ? '<div class="bub typing"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="comp"><input class="input" data-input="ag-train" data-id="${esc(a.id)}" placeholder="Teach it something…" value="${esc(t.draft)}" onkeydown="if(event.key==='Enter'){DM.acts['ag-train-send'](this)}"><button class="btn" data-act="ag-train-send" data-arg="${esc(a.id)}">${I('send')} Send</button></div></div>
      <div class="col" style="gap:12px">
        <div class="card"><div class="card-h"><h3 class="grow">Guideline changes</h3><span class="badge">${(a.training || []).length}</span></div>${(a.training || []).length ? (a.training || []).slice().reverse().map((s) => `<div style="padding:12px 16px;border-bottom:1px solid var(--border)"><div class="row sm"><b>${esc(s.by || 'You')}</b><span class="muted xs right">${esc(fmt.dt(s.at))}</span></div><div class="sm muted" style="margin:3px 0 6px">“${esc(s.prompt)}”</div>${(s.added || []).map((x) => `<div class="diff-add" style="margin-bottom:3px">+ ${esc(x)}</div>`).join('')}${(s.removed || []).map((x) => `<div class="diff-del" style="margin-bottom:3px">− ${esc(x)}</div>`).join('')}</div>`).join('') : '<div class="empty sm" style="padding:20px">No training sessions yet.</div>'}</div>
        <div class="card"><div class="card-h"><h3 class="grow">Learned</h3></div>${(a.learned || []).length ? (a.learned || []).map((l) => `<div class="row sm" style="padding:10px 16px;border-bottom:1px solid var(--border);align-items:flex-start">${I('sparkle')}<span class="grow">${esc(l.text)}</span><button class="btn ghost icon sm" data-act="ag-learn-del" data-arg="${esc(a.id)}|${esc(l.id)}">${I('x')}</button></div>`).join('') : '<div class="empty sm" style="padding:20px">Nothing learned yet.</div>'}</div>
        <div class="card"><div class="card-h"><h3 class="grow">Gaps</h3><span class="xs muted">Questions it couldn't answer</span></div>${(a.gaps || []).length ? (a.gaps || []).map((g) => `<div class="row sm" style="padding:10px 16px;border-bottom:1px solid var(--border)"><span class="grow">${esc(g.text)}</span>${DM.badge(g.count + '×', 'amber')}<button class="btn outline sm" data-act="ag-gap" data-arg="${esc(a.id)}|${esc(g.id)}">Teach</button></div>`).join('') : '<div class="empty sm" style="padding:20px">No gaps — nice.</div>'}</div>
      </div></div>`;
  }
  DM.input('ag-train', (v, el) => { tchat(DM.by(agents(), el.dataset.id)).draft = v; });
  DM.act('ag-train-send', (el) => {
    const aid = el.dataset.arg || el.dataset.id; const a = DM.by(agents(), aid); const t = tchat(a); const text = (t.draft || '').trim(); if (!text || t.busy) return;
    t.msgs.push({ from: 'you', text, at: nowLbl() }); t.draft = ''; t.busy = true; DM.render();
    setTimeout(() => {
      const added = [], removed = []; const low = text.toLowerCase();
      const rule = /^(always|never|don't|do not|please)/i.test(text) ? text.replace(/^please\s+/i, '') : 'When relevant: ' + text;
      const clean = rule.charAt(0).toUpperCase() + rule.slice(1).replace(/\.?$/, '.');
      const guard = /\b(never|don't|do not|not)\b/.test(low);
      (a.rules = a.rules || []).push({ id: DM.uid('r'), kind: guard ? 'guardrail' : 'rule', scope: 'agent', text: clean }); added.push(clean);
      const dup = (a.rules || []).find((r) => r.scope === 'agent' && r.text !== clean && low.split(' ').filter((w) => w.length > 5).some((w) => r.text.toLowerCase().includes(w)) && /instead|no longer|stop/.test(low));
      if (dup) { removed.push(dup.text); a.rules = a.rules.filter((r) => r !== dup); }
      (a.learned = a.learned || []).unshift({ id: DM.uid('lf'), text: clean, at: nowIso() });
      (a.training = a.training || []).push({ id: DM.uid('ts'), at: nowIso(), by: 'You', prompt: text, added, removed });
      t.busy = false; t.msgs.push({ from: 'anuma', text: 'Got it — I\'ve updated my guidelines.', at: nowLbl(), diff: { added, removed } }); DM.toast('Guidelines updated', 'sparkle');
      if (DM.path().indexOf('/agents/' + aid + '/training') === 0) DM.render();
    }, 900);
  });
  DM.act('ag-learn-del', (el) => { const [aid, lid] = el.dataset.arg.split('|'); const a = DM.by(agents(), aid); a.learned = a.learned.filter((l) => l.id !== lid); DM.render(); });
  DM.act('ag-gap', (el) => { const [aid, gid] = el.dataset.arg.split('|'); const a = DM.by(agents(), aid); const g = DM.by(a.gaps, gid); tchat(a).draft = 'When asked "' + g.text + '", answer: '; a.gaps = a.gaps.filter((x) => x.id !== gid); DM.toast('Added to the train chat'); DM.render(); setTimeout(() => { const i = document.querySelector('[data-input="ag-train"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 0); });

  /* ── test mode ── */
  const tm = (a) => (U().chat[a.id] = U().chat[a.id] || { msgs: [{ from: 'anuma', text: a.initialMessage || 'Hello! How can I help?', at: nowLbl() }], draft: '', busy: false, used: [] });
  function reply(a, text) {
    const low = text.toLowerCase(); const prods = DM.S.products || []; const used = [];
    const hit = prods.find((p) => low.split(/\W+/).some((w) => w.length > 3 && p.name.toLowerCase().includes(w)));
    const cf = policy().confidenceFloor;
    if (hit && /price|rate|cost|kitna|how much|\bmrp\b/.test(low)) { used.push('Catalogue · ' + hit.name, 'Rate card'); return { text: `${hit.name} (${hit.sku}) is ${fmt.inr(hit.price)} per ${hit.unit || 'unit'}${hit.stock ? ', ' + fmt.num(hit.stock) + ' in stock' : ''}. Want me to add it to an order?`, used }; }
    if (hit && /stock|available|have/.test(low)) { used.push('Catalogue · ' + hit.name); return { text: `${hit.name}: ${hit.stock > 0 ? fmt.num(hit.stock) + ' ' + (hit.unit || 'units') + ' available' : 'currently out of stock — I can notify you when it is back'}.`, used }; }
    if (hit) { used.push('Catalogue · ' + hit.name, 'Confidence ' + Math.min(98, cf + 12) + '%'); return { text: `I found ${hit.name} (${hit.sku}). How many ${hit.unit || 'units'} would you like?`, used }; }
    if (/\d+/.test(low) && /(order|chahiye|need|want|send)/.test(low)) { used.push('Confidence ' + (cf - 15) + '% < floor ' + cf + '%'); return { text: `I'm not fully sure which item you mean, so I'm handing this to ${(DM.S.users || []).find((u) => /ASM|Sales/.test(u.role))?.name || 'a teammate'} to confirm. They'll reply within ${policy().handoffTimerMin} minutes.`, used, escalate: true }; }
    if (/status|where|track|dispatch/.test(low)) { const o = (DM.S.orders || [])[0]; used.push('Orders'); return { text: o ? `Your latest order ${o.no} is ${o.status}.` : 'I can check that — which order number?', used }; }
    if (/hi|hello|hey|namaste/.test(low)) return { text: a.initialMessage || 'Hello! How can I help?', used: ['Opening message'] };
    const rule = (a.rules || []).find((r) => low.split(/\W+/).some((w) => w.length > 5 && r.text.toLowerCase().includes(w)));
    if (rule) return { text: 'Per my guidelines: ' + rule.text, used: ['Rule · ' + rule.text.slice(0, 40) + '…'] };
    (a.gaps = a.gaps || []).push({ id: DM.uid('gap'), text: text, count: 1 });
    return { text: "I don't have that yet — I've noted it so you can teach me in Training.", used: ['Gap recorded'] };
  }
  function testMode(a) {
    const t = tm(a);
    return `<div class="ag-layout"><div class="card ag-chat"><div class="card-h"><h3 class="grow">Test chat</h3>${DM.badge('Sandbox · nothing is sent', 'amber')}<button class="btn ghost sm" data-act="ag-test-reset" data-arg="${esc(a.id)}">${I('rotate')} Reset</button></div>
      <div class="msgs chatbg">${t.msgs.map((m) => `<div class="bub ${m.from === 'you' ? 'out' : ''} ${m.from === 'sys' ? 'sys' : ''}">${esc(m.text)}<span class="tm">${esc(m.at)}</span></div>`).join('')}${t.busy ? '<div class="bub typing"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="comp"><input class="input" data-input="ag-test" data-id="${esc(a.id)}" placeholder="Message as a customer…" value="${esc(t.draft)}" onkeydown="if(event.key==='Enter'){DM.acts['ag-test-send'](this)}"><button class="btn" data-act="ag-test-send" data-arg="${esc(a.id)}">${I('send')}</button></div></div>
      <div class="col" style="gap:12px"><div class="card pad"><h3>Used for last reply</h3><div class="col" style="margin-top:8px;gap:6px">${t.used.length ? t.used.map((u) => `<div class="row sm">${I('check')}<span>${esc(u)}</span></div>`).join('') : '<div class="sm muted">Send a message to see which rules, sources and confidence it used.</div>'}</div></div>
        <div class="card pad"><h3>Try asking</h3><div class="col" style="margin-top:8px;gap:6px">${['What is the price of ' + ((DM.S.products || [])[0]?.name || 'your top product') + '?', 'Do you have ' + ((DM.S.products || [])[1]?.name || 'it') + ' in stock?', 'I need 20 pieces, send ASAP', 'Where is my order?'].map((q) => `<button class="btn outline sm" style="justify-content:flex-start;white-space:normal;height:auto;padding:6px 10px;text-align:left" data-act="ag-test-ask" data-arg="${esc(a.id)}|${esc(q)}">${esc(q)}</button>`).join('')}</div></div></div></div>`;
  }
  function sendTest(aid, text) {
    const a = DM.by(agents(), aid); const t = tm(a); text = (text || '').trim(); if (!text || t.busy) return;
    t.msgs.push({ from: 'you', text, at: nowLbl() }); t.draft = ''; t.busy = true; DM.render();
    setTimeout(() => { const r = reply(a, text); t.busy = false; t.used = r.used; t.msgs.push({ from: 'anuma', text: r.text, at: nowLbl() }); if (r.escalate) t.msgs.push({ from: 'sys', text: 'Escalated to a human · confidence below floor', at: nowLbl() }); if (DM.path().indexOf('/agents/' + aid + '/test') === 0) DM.render(); }, 800);
  }
  DM.input('ag-test', (v, el) => { tm(DM.by(agents(), el.dataset.id)).draft = v; });
  DM.act('ag-test-send', (el) => { const aid = el.dataset.arg || el.dataset.id; sendTest(aid, tm(DM.by(agents(), aid)).draft); });
  DM.act('ag-test-ask', (el) => { const [aid, q] = el.dataset.arg.split('|'); sendTest(aid, q); });
  DM.act('ag-test-reset', (el) => { delete U().chat[el.dataset.arg]; DM.render(); });

  /* ── activity ── */
  function activity(a) {
    const f = U().actFilter; const all = (a.activity || []).slice().sort((x, y) => String(y.at).localeCompare(String(x.at)));
    const rows = all.filter((r) => f === 'all' || r.outcome === f);
    const tone = { handled: 'green', escalated: 'blue', validation: 'amber' };
    return `<div class="row" style="margin-bottom:12px">${DM.pills([{ key: 'all', label: 'All' }, { key: 'handled', label: 'Handled' }, { key: 'escalated', label: 'Escalated' }, { key: 'validation', label: 'Validation' }], f, 'ag-actf')}<span class="sm muted right">${rows.length} events</span></div>
      ${DM.table([{ label: 'When', render: (r) => `<span class="muted">${esc(fmt.dt(r.at))}</span>` }, { label: 'Action', render: (r) => esc(r.action) }, { label: 'Outcome', render: (r) => DM.badge(r.outcome, tone[r.outcome] || '', true) }, { label: 'Channel', render: (r) => esc(r.channel || '—') }, { label: 'Case', render: (r) => (r.caseId ? `<a class="b" href="#/inbox/threads?case=${esc(r.caseId)}">${esc(r.caseId)}</a>` : '—') }], rows, { click: 'ag-act-open', empty: 'No activity yet — test the agent or go live.' }).replace(/data-arg="undefined"/g, '')}`;
  }
  DM.act('ag-actf', (el) => { U().actFilter = el.dataset.arg; DM.render(); });
  DM.act('ag-act-open', (el, ev) => {
    if (ev.target.closest('a')) return; const aid = DM.path().split('/')[2]; const a = DM.by(agents(), aid); const idx = [...el.parentNode.children].indexOf(el);
    const f = U().actFilter; const rows = (a.activity || []).slice().sort((x, y) => String(y.at).localeCompare(String(x.at))).filter((r) => f === 'all' || r.outcome === f); const r = rows[idx]; if (!r) return;
    DM.drawer({ title: 'Activity', body: `<dl class="kv"><dt>Action</dt><dd>${esc(r.action)}</dd><dt>When</dt><dd>${esc(fmt.dt(r.at))}</dd><dt>Outcome</dt><dd>${DM.badge(r.outcome, '', true)}</dd><dt>Channel</dt><dd>${esc(r.channel || '—')}</dd><dt>Case</dt><dd>${r.caseId ? `<a class="b" href="#/inbox/threads?case=${esc(r.caseId)}">${esc(r.caseId)}</a>` : '—'}</dd><dt>Agent</dt><dd>${esc(a.name)}</dd></dl><div class="sep"></div><div class="sm muted">Reasoning</div><p class="sm" style="margin-top:6px">${r.outcome === 'escalated' ? 'Match confidence was below the escalation floor, so the case was handed to a person.' : r.outcome === 'validation' ? 'A field failed validation (quantity, unit or price) and the customer was asked to confirm.' : 'Every line matched the catalogue above the confidence floor, so the agent completed this on its own.'}</p>` });
  });
})();
