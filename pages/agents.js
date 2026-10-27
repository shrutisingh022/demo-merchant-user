/* Agents: roster, create dialog, detail (Overview · Training · Test mode · Activity). */
(function () {
  const { esc, icon: I, fmt } = DM;
  const st = document.createElement('style'); st.dataset.for = 'agents';
  st.textContent = `
  .ag-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .ag-card{padding:0;cursor:pointer;display:flex;flex-direction:column;overflow:hidden;transition:border-color .14s,box-shadow .14s}
  .ag-card:hover{border-color:#bdbdbd;box-shadow:0 2px 10px rgba(0,0,0,.05)}
  .ag-card .top{display:flex;align-items:flex-start;gap:10px;padding:14px 14px 12px}
  .ag-card .foot{display:flex;align-items:center;gap:8px;border-top:1px solid var(--border);padding:9px 14px;font-size:12px;color:var(--muted-foreground);background:#fafafa;min-height:38px}
  .ag-card.create{border-style:dashed;align-items:center;justify-content:center;min-height:104px;color:var(--muted-foreground);gap:2px;font-size:13px}.ag-card.create:hover{background:#fafafa;color:var(--foreground)}
  .ag-tile{width:36px;height:36px;border-radius:9px;background:#171717;color:#fff;display:grid;place-items:center;font-weight:700;flex:none}
  .ag-chtile{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;color:#fff;flex:none}
  .ag-pill{display:inline-flex;align-items:center;gap:6px;background:#f4f4f5;border-radius:999px;padding:2px 10px 2px 4px;font-size:12px;color:#262626;max-width:100%}
  .ag-back{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted-foreground);margin-bottom:14px}.ag-back:hover{color:var(--foreground)}
  .ag-col{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
  .ag-lock{display:flex;align-items:center;gap:10px;background:#f7f7f7;border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:12.5px;color:var(--muted-foreground)}
  .ag-kv{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:0}.ag-kv>*{padding:10px 0;border-top:1px solid var(--border)}.ag-kv dt{color:var(--muted-foreground);font-size:12.5px}
  .ag-sec{padding:14px 16px;border-top:1px solid var(--border)}.ag-sec:first-of-type{border-top:0}
  .ag-sec h4{font-size:12.5px;font-weight:600}.ag-sec p.d{font-size:12px;color:var(--muted-foreground);margin:2px 0 8px}
  .ag-bul{display:flex;gap:9px;align-items:flex-start;padding:7px 0;font-size:12.5px}.ag-bul .dotb{width:4px;height:4px;border-radius:50%;background:#a3a3a3;margin-top:8px;flex:none}
  .ag-bul .acts{opacity:0;display:flex;gap:0;transition:opacity .14s}.ag-bul:hover .acts{opacity:1}
  .ag-tag{border:1px solid var(--border);border-radius:6px;padding:1px 7px;font-size:11px;white-space:nowrap;background:#fff;color:#404040;flex:none}
  .ag-slider{width:100%;accent-color:#171717}
  .ag-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px;align-items:start}
  .ag-chat{display:flex;flex-direction:column;height:calc(100vh - 290px);min-height:360px}
  .ag-chat .msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
  .ag-chat .comp{display:flex;gap:8px;padding:10px;border-top:1px solid var(--border)}
  .diff-add{background:var(--success-tint);color:#0b7a4e;border-radius:6px;padding:4px 8px;font-size:12.5px}
  .diff-del{background:var(--destructive-tint);color:#b42318;border-radius:6px;padding:4px 8px;font-size:12.5px;text-decoration:line-through}
  .popin{animation:pop-in .38s cubic-bezier(.22,.8,.24,1) both}
  .msg-new .diff-add,.msg-new .diff-del{animation:pop-in .4s .25s cubic-bezier(.22,.8,.24,1) both}
  .ag-card{transition:border-color .15s,box-shadow .15s,transform .15s}.ag-card:hover{transform:translateY(-1px)}
  .ag-card .nm{font-size:13px}
  .ag-day{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin:18px 0 8px}
  .ag-log{border:1px solid var(--border);border-radius:14px;overflow:hidden}
  .ag-log .r{display:flex;gap:14px;padding:12px 16px;border-top:1px solid var(--border);cursor:pointer}.ag-log .r:first-child{border-top:0}.ag-log .r:hover{background:#fafafa}
  .ag-log .tm{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--muted-foreground);min-width:42px;padding-top:2px}
  .ag-chip{display:inline-block;border:1px solid var(--border);border-radius:6px;padding:0 6px;font-size:10.5px;background:#f7f7f7;color:#525252;margin-right:5px}
  @media(max-width:1100px){.ag-layout{grid-template-columns:1fr}.ag-grid2{grid-template-columns:1fr}}`;
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

  const mark = (n) => DM.mark(n);
  const agoLbl = (iso) => { if (!iso) return 'Just now'; const d = Math.floor((new Date('2026-10-27T12:00:00+05:30') - new Date(iso)) / 86400000); return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 30 ? d + ' days ago' : d < 60 ? '1 month ago' : Math.round(d / 30) + ' months ago'; };
  const stTone = (s) => (s === 'live' ? ['Live', 'green'] : s === 'paused' ? ['Paused', 'grey'] : ['Draft', 'grey']);
  const chIds = (a) => (a.channelIds && a.channelIds.length ? a.channelIds : a.channelId ? [a.channelId] : []);
  const chPill = (a) => { const ids = chIds(a); const c = DM.by(chans(), ids[0]); if (!c) return ''; return `<span class="ag-pill">${chTile(c)}<span class="trunc">${esc(c.name || chLabel(c))}</span>${ids.length > 1 ? `<span class="muted">and ${ids.length - 1} more</span>` : ''}</span>`; };

  /* ── roster ── */
  function card(a) {
    const [lb, tn] = stTone(a.status); const c = chOf(a); const ids = chIds(a);
    return `<div class="card ag-card" data-rid="${esc(a.id)}" data-go="/agents/${esc(a.id)}">
      <div class="top">${mark(36)}<div class="grow" style="min-width:0"><div class="b trunc nm">${esc(a.name)}</div><div class="xs muted">Updated ${esc(agoLbl(a.updatedAt))}</div></div>${DM.status(lb, tn)}<button class="btn ghost icon sm" data-act="ag-menu" data-arg="${esc(a.id)}">${I('more')}</button></div>
      <div class="foot">${c ? `${chTile(c)}<span class="trunc">Lives in <b style="color:var(--foreground);font-weight:500">${esc(c.name || chLabel(c))}</b>${ids.length > 1 ? ` and ${ids.length - 1} more` : ''}</span>` : 'Not on a channel yet'}</div></div>`;
  }
  DM.page('/agents', { title: 'Agents', render() {
    const list = agents();
    return `<div class="page narrow">${DM.header('Agents', 'Agents answer your customers on a channel and follow the shared rulebook.', DM.btn('Create', 'ag-new', { icon: 'plus' }))}
      <div class="ag-grid2 stagger">${list.map(card).join('')}<div class="card ag-card create" data-act="ag-new">${I('plus')}<span>Create</span></div></div></div>`;
  } });

  function agentForm(a) {
    return `<div class="col gap12">${DM.field('Name', 'name', { value: a?.name || '', ph: 'e.g. WhatsApp order desk' })}${DM.field('What does it do?', 'role', { value: a?.role || '', area: true, ph: 'Takes orders, answers price and stock questions, hands over when unsure.' })}
      <div class="field"><label>Channel</label><select class="select" name="channelId"><option value="">Not on a channel yet</option>${chans().map((c) => `<option value="${esc(c.id)}" ${a?.channelId === c.id ? 'selected' : ''}>${esc(chLabel(c))}</option>`).join('')}</select></div></div>`;
  }
  DM.act('ag-new', () => DM.modal({ title: 'Create agent', body: agentForm(), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create agent', run: (m) => {
    const f = DM.formData(m); if (!f.name.trim()) { DM.toast('Give the agent a name', 'alert'); return false; }
    const a = { id: DM.uid('ag'), name: f.name.trim(), status: 'draft', channelId: f.channelId || null, channelIds: f.channelId ? [f.channelId] : [], type: 'Chat', updatedAt: new Date().toISOString(), role: f.role, initialMessage: '', rules: [{ id: DM.uid('r'), kind: 'rule', scope: 'inherited', text: 'Always confirm quantity and unit before recording an order line.' }, { id: DM.uid('r'), kind: 'guardrail', scope: 'inherited', text: 'Never quote below the rate card minimum margin.' }], sources: [], learned: [], gaps: [], training: [], activity: [], kpis: { handled: 0, autoRate: 0, escalated: 0, avgReplySec: 0 } };
    agents().push(a); DM.toast('Agent created'); DM.go('/agents/' + a.id);
  } }] }));
  DM.act('ag-menu', (el, ev) => { ev.stopPropagation(); const a = DM.by(agents(), el.dataset.arg); DM.menu(el, [
    { label: 'Open', icon: 'eye', run: () => DM.go('/agents/' + a.id) }, { label: 'Edit details', icon: 'edit', run: () => editAgent(a.id) },
    { label: a.status === 'live' ? 'Pause' : 'Go live', icon: a.status === 'live' ? 'pause' : 'play', run: () => toggleStatus(a.id) },
    { label: 'Delete', icon: 'trash', run: () => DM.confirm('Delete agent?', `<b>${esc(a.name)}</b> will stop answering on its channel. This can't be undone.`, () => { DM.S.agents = agents().filter((x) => x.id !== a.id); DM.toast('Agent deleted'); if (DM.path().startsWith('/agents/')) DM.go('/agents'); else DM.render(); }, 'Delete') }]); });
  function editAgent(id) { const a = DM.by(agents(), id); DM.modal({ title: 'Edit agent', body: agentForm(a), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (m) => { const f = DM.formData(m); a.name = f.name || a.name; a.role = f.role; a.channelId = f.channelId || null; a.channelIds = a.channelId ? [a.channelId].concat(chIds(a).filter((x) => x !== a.channelId).slice(0, 1)) : []; a.updatedAt = new Date().toISOString(); DM.toast('Agent updated'); DM.render(); } }] }); }
  function toggleStatus(id) { const a = DM.by(agents(), id); a.status = a.status === 'live' ? 'paused' : 'live'; a.updatedAt = new Date().toISOString(); DM.toast(a.status === 'live' ? a.name + ' is live' : a.name + ' paused', a.status === 'live' ? 'check' : 'pause'); DM.render(); }
  DM.act('ag-status', (el) => toggleStatus(el.dataset.arg));
  DM.act('ag-edit', (el) => editAgent(el.dataset.arg));

  /* ── detail shell ── */
  const TABS = [['overview', 'Overview'], ['training', 'Training'], ['test', 'Test mode'], ['activity', 'Activity log']];
  function shell(a, tab, body) {
    const [lb, tn] = stTone(a.status);
    return `<div class="page narrow">
      <a class="ag-back" href="#/agents">${I('arrowL')} Back to agents</a>
      <div class="row" style="align-items:center;margin-bottom:14px;gap:12px">${mark(44)}<div class="grow" style="min-width:0"><div class="row" style="gap:8px"><h1 style="font-size:20px;font-weight:600">${esc(a.name)}</h1>${DM.status(lb, tn)}</div><div class="row gap4 sm muted" style="margin-top:3px">Lives in ${chPill(a) || '<span>no channel yet</span>'}</div></div>
        <a class="btn outline" href="#/agents/${esc(a.id)}/test">${I('wand')} Test mode</a><button class="btn ghost icon" data-act="ag-menu" data-arg="${esc(a.id)}">${I('more')}</button></div>
      <div class="tabs">${TABS.map(([k, l]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#/agents/${esc(a.id)}/${k}">${l}</a>`).join('')}</div>
      ${body}</div>`;
  }
  const notFound = () => `<div class="page"><div class="empty"><h3>Agent not found</h3><p style="margin-top:10px"><a class="btn outline" href="#/agents">Back to agents</a></p></div></div>`;
  const renderTab = (tab, a) => (tab === 'training' ? training(a) : tab === 'test' ? testMode(a) : tab === 'activity' ? activity(a) : overview(a));
  DM.page('/agents/:id', { title: 'Agent', crumb: 'Agents', render({ params }) { const a = DM.by(agents(), params.id); return a ? shell(a, 'overview', overview(a)) : notFound(); }, after: afterTab });
  DM.page('/agents/:id/:tab', { title: 'Agent', crumb: 'Agents', render({ params }) { const a = DM.by(agents(), params.id); if (!a) return notFound(); const t = TABS.some(([k]) => k === params.tab) ? params.tab : 'overview'; return shell(a, t, renderTab(t, a)); }, after: afterTab });
  function afterTab(view) { const m = view.querySelector('.msgs'); if (m) { m.scrollTop = m.scrollHeight; m.scrollTo && m.scrollTo({ top: m.scrollHeight, behavior: 'smooth' }); } Object.values(U().train).concat(Object.values(U().chat)).forEach((t) => (t.msgs || []).forEach((x) => { delete x.fresh; })); agents().forEach((a) => { (a.learned || []).forEach((x) => { delete x.fresh; }); (a.training || []).forEach((x) => { delete x.fresh; }); }); }

  /* ── overview ── */
  const SECS = [['rule', 'What it does', 'The behaviours this agent follows day to day.'], ['guardrail', 'What it never does', 'Hard limits it will not cross.'], ['helper', 'Helpers', 'Shortcuts and lookups it can use.']];
  function bullets(a, kind) {
    const rs = (a.rules || []).filter((r) => r.kind === kind);
    return rs.length ? rs.map((r) => `<div class="ag-bul"><i class="dotb"></i><span class="grow">${esc(r.text)}</span><span class="acts"><button class="btn ghost icon sm" title="Edit" data-act="ag-rule-edit" data-arg="${esc(a.id)}|${esc(r.id)}">${I('edit')}</button><button class="btn ghost icon sm" title="Remove" data-act="ag-rule-del" data-arg="${esc(a.id)}|${esc(r.id)}">${I('trash')}</button></span><span class="ag-tag">${r.scope === 'agent' ? 'This agent' : 'Inherited from business'}${r.overridden ? ' · overridden' : ''}</span></div>`).join('') : `<div class="sm muted" style="padding:6px 0">None yet.</div>`;
  }
  function overview(a) {
    const p = policy(); const c = chOf(a);
    const ASMs = (DM.S.users || []).filter((u) => u.status !== 'invited');
    return `<div class="ag-col">
      <div class="card"><div class="row" style="padding:14px 16px 10px;align-items:flex-start;gap:10px">${c ? chTile(c).replace('width:12px', 'width:12px') : ''}<div class="grow"><div class="b" style="font-size:13.5px">${esc(a.name)}</div><div class="sm muted">${esc(a.role || 'No description yet.')}</div></div></div>
        <div style="padding:0 16px 12px"><div class="ag-lock">${I('lock')}<span class="grow">This script is locked. It is written by training, and changed there.</span><a class="btn outline sm" href="#/agents/${esc(a.id)}/training">${I('wand')} Change it in Training</a></div></div>
        <dl class="ag-kv" style="padding:0 16px"><dt>Type</dt><dd><span class="ag-pill" style="padding:2px 10px">${I('chat')} Chat</span></dd><dt>Lives in</dt><dd>${chPill(a) || '<span class="muted sm">Not on a channel yet</span>'} <button class="btn ghost sm" data-act="ag-edit" data-arg="${esc(a.id)}">${I('edit')} Change</button></dd></dl><div style="height:6px"></div></div>
      <div class="card"><div class="card-h"><h3 class="grow">Instructions</h3></div>
        <div class="ag-sec"><h4>First message</h4><p class="d">A set opening line, if one has been written for this agent.</p><div class="sm">${a.initialMessage ? esc(a.initialMessage) : '<span class="muted">None set. The agent writes its own opening from the rules below.</span>'}</div></div>
        ${SECS.map(([k, t, d]) => `<div class="ag-sec"><div class="row"><h4 class="grow">${t}</h4><button class="btn ghost sm" data-act="ag-rule-add" data-arg="${esc(a.id)}|${k}">${I('plus')} Add</button></div><p class="d" style="margin-bottom:4px">${d}</p>${bullets(a, k)}</div>`).join('')}</div>
      <div class="card pad"><h3>Escalation</h3><div class="xs muted" style="margin:2px 0 12px">Shared by every agent. When Anuma isn't sure, a human takes over.</div>
        <div class="field"><label class="row">Confidence floor <span class="right b mono" id="ag-cf">${p.confidenceFloor}%</span></label><input class="ag-slider" type="range" min="40" max="95" step="1" value="${p.confidenceFloor}" data-input="ag-cf"><div class="xs muted">Below this match confidence, the line goes to a person.</div></div>
        <div class="field" style="margin-top:12px"><label class="row">Hand-off timer <span class="right b mono" id="ag-ht">${p.handoffTimerMin} min</span></label><input class="ag-slider" type="range" min="5" max="120" step="5" value="${p.handoffTimerMin}" data-input="ag-ht"><div class="xs muted">Re-notify the owner if no one picks the case up in this time.</div></div>
        <div class="sep"></div><div class="field"><label>Notify</label><div class="col" style="gap:6px">${ASMs.slice(0, 6).map((u) => `<label class="row sm" style="cursor:pointer"><span class="chk ${p.notify.includes(u.id) ? 'on' : ''}" data-act="ag-notify" data-arg="${esc(u.id)}">${p.notify.includes(u.id) ? I('check').replace('class="i ', 'style="width:11px;height:11px" class="i ') : ''}</span>${DM.avatar(u.name, 'sm')} ${esc(u.name)} <span class="muted xs">${esc(u.role)}</span></label>`).join('')}</div></div>
        <div class="field" style="margin-top:12px"><label>When the human is done</label><select class="select" data-change="ag-hb"><option value="anuma" ${p.handBack === 'anuma' ? 'selected' : ''}>Hand back to Anuma</option><option value="owner" ${p.handBack === 'owner' ? 'selected' : ''}>Stay with the human</option><option value="ask" ${p.handBack === 'ask' ? 'selected' : ''}>Ask the human each time</option></select></div></div>
      <div class="card pad"><div class="row"><h3 class="grow">Knowledge</h3><button class="btn outline sm" data-act="ag-src-add" data-arg="${esc(a.id)}">${I('plus')} Add source</button></div><div class="col" style="margin-top:8px;gap:8px">${(a.sources || []).slice(0, 6).map((s) => `<div class="row sm">${I(s.type === 'link' ? 'link' : s.type === 'chat' ? 'chat' : 'file')}<span class="grow trunc">${esc(s.title)}</span>${DM.status(s.state === 'failed' ? 'Failed' : s.state === 'pending' ? 'Pending' : 'Indexed', s.state === 'failed' ? 'red' : s.state === 'pending' ? 'amber' : 'green')}</div>`).join('') || '<div class="sm muted">No sources yet.</div>'}</div></div>
    </div>`;
  }
  DM.input('ag-cf', (v, el) => { policy().confidenceFloor = +v; const s = document.getElementById('ag-cf'); if (s) s.textContent = v + '%'; });
  DM.input('ag-ht', (v) => { policy().handoffTimerMin = +v; const s = document.getElementById('ag-ht'); if (s) s.textContent = v + ' min'; });
  DM.input('ag-role', (v, el) => { const a = DM.by(agents(), el.dataset.id); if (a) a.role = v; });
  DM.input('ag-init', (v, el) => { const a = DM.by(agents(), el.dataset.id); if (a) a.initialMessage = v; });
  DM.input('ag-hb', (v) => { policy().handBack = v; DM.toast('Hand-back rule updated'); });
  DM.act('ag-save-script', () => DM.toast('Script saved'));
  DM.act('ag-notify', (el) => { const p = policy(); const id = el.dataset.arg; p.notify = p.notify.includes(id) ? p.notify.filter((x) => x !== id) : p.notify.concat(id); DM.render(); });
  DM.act('ag-src-add', (el) => DM.modal({ title: 'Add knowledge source', body: `<div class="col gap12">${DM.field('Type', 'type', { options: ['link', 'document', 'chat'] })}${DM.field('Title or URL', 'title', { ph: 'Price list Oct 2026.pdf' })}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add', run: (m) => { const f = DM.formData(m); if (!f.title.trim()) return false; const a = DM.by(agents(), el.dataset.arg); (a.sources = a.sources || []).unshift({ id: DM.uid('src'), type: f.type, title: f.title, state: 'indexed', addedBy: 'Rohan Mehta', addedAt: nowIso(), usedIn: 0 }); DM.toast('Source indexed'); DM.render(); } }] }));
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
      <div class="msgs chatbg">${t.msgs.map((m) => `<div class="bub ${m.from === 'you' ? 'out' : ''} ${m.fresh ? 'msg-new' : ''}">${esc(m.text)}${m.diff ? `<div class="col" style="margin-top:8px;gap:4px">${(m.diff.added || []).map((x) => `<div class="diff-add">+ ${esc(x)}</div>`).join('')}${(m.diff.removed || []).map((x) => `<div class="diff-del">− ${esc(x)}</div>`).join('')}</div>` : ''}<span class="tm">${esc(m.at)}</span></div>`).join('')}${t.busy ? '<div class="typing"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="comp"><input class="input" data-input="ag-train" data-id="${esc(a.id)}" placeholder="Teach it something…" value="${esc(t.draft)}" onkeydown="if(event.key==='Enter'){DM.acts['ag-train-send'](this)}"><button class="btn" data-act="ag-train-send" data-arg="${esc(a.id)}">${I('send')} Send</button></div></div>
      <div class="col" style="gap:12px">
        <div class="card"><div class="card-h"><h3 class="grow">Guideline changes</h3><span class="badge">${(a.training || []).length}</span></div>${(a.training || []).length ? (a.training || []).slice().reverse().map((s) => `<div style="padding:12px 16px;border-bottom:1px solid var(--border)"><div class="row sm ${s.fresh ? 'popin' : ''}">${DM.avatar(!s.by || s.by === 'You' ? 'Rohan Mehta' : s.by, 'sm')}<b>${esc(!s.by || s.by === 'You' ? 'Rohan Mehta' : s.by)}</b><span class="muted xs right">${esc(fmt.dt(s.at))}</span></div><div class="sm muted" style="margin:3px 0 6px">“${esc(s.prompt)}”</div>${(s.added || []).map((x) => `<div class="diff-add" style="margin-bottom:3px">+ ${esc(x)}</div>`).join('')}${(s.removed || []).map((x) => `<div class="diff-del" style="margin-bottom:3px">− ${esc(x)}</div>`).join('')}</div>`).join('') : '<div class="empty sm" style="padding:20px">No training sessions yet.</div>'}</div>
        <div class="card"><div class="card-h"><h3 class="grow">Learned</h3></div>${(a.learned || []).length ? (a.learned || []).map((l) => `<div class="row sm ${l.fresh ? 'popin' : ''}" style="padding:10px 16px;border-bottom:1px solid var(--border);align-items:flex-start">${I('sparkle')}<span class="grow">${esc(l.text)}</span><button class="btn ghost icon sm" data-act="ag-learn-del" data-arg="${esc(a.id)}|${esc(l.id)}">${I('x')}</button></div>`).join('') : '<div class="empty sm" style="padding:20px">Nothing learned yet.</div>'}</div>
        <div class="card"><div class="card-h"><h3 class="grow">Gaps</h3><span class="xs muted">Questions it couldn't answer</span></div>${(a.gaps || []).length ? (a.gaps || []).map((g) => `<div class="row sm" style="padding:10px 16px;border-bottom:1px solid var(--border)"><span class="grow">${esc(g.text)}</span>${DM.badge(g.count + '×', 'amber')}<button class="btn outline sm" data-act="ag-gap" data-arg="${esc(a.id)}|${esc(g.id)}">Teach</button></div>`).join('') : '<div class="empty sm" style="padding:20px">No gaps — nice.</div>'}</div>
      </div></div>`;
  }
  DM.input('ag-train', (v, el) => { tchat(DM.by(agents(), el.dataset.id)).draft = v; });
  DM.act('ag-train-send', (el) => {
    const aid = el.dataset.arg || el.dataset.id; const a = DM.by(agents(), aid); const t = tchat(a); const text = (t.draft || '').trim(); if (!text || t.busy) return;
    t.msgs.push({ from: 'you', text, at: nowLbl(), fresh: true }); t.draft = ''; t.busy = true; DM.render();
    setTimeout(() => {
      const added = [], removed = []; const low = text.toLowerCase();
      const rule = /^(always|never|don't|do not|please)/i.test(text) ? text.replace(/^please\s+/i, '') : 'When relevant: ' + text;
      const clean = rule.charAt(0).toUpperCase() + rule.slice(1).replace(/\.?$/, '.');
      const guard = /\b(never|don't|do not|not)\b/.test(low);
      (a.rules = a.rules || []).push({ id: DM.uid('r'), kind: guard ? 'guardrail' : 'rule', scope: 'agent', text: clean }); added.push(clean);
      const dup = (a.rules || []).find((r) => r.scope === 'agent' && r.text !== clean && low.split(' ').filter((w) => w.length > 5).some((w) => r.text.toLowerCase().includes(w)) && /instead|no longer|stop/.test(low));
      if (dup) { removed.push(dup.text); a.rules = a.rules.filter((r) => r !== dup); }
      (a.learned = a.learned || []).unshift({ id: DM.uid('lf'), text: clean, at: nowIso(), fresh: true });
      (a.training = a.training || []).push({ id: DM.uid('ts'), at: nowIso(), by: 'Rohan Mehta', prompt: text, added, removed, fresh: true });
      t.busy = false; t.msgs.push({ from: 'anuma', text: 'Got it — I\'ve updated my guidelines.', at: nowLbl(), diff: { added, removed }, fresh: true }); DM.toast('Guidelines updated', 'sparkle');
      if (DM.path().indexOf('/agents/' + aid + '/training') === 0) DM.render();
    }, 1300);
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
      <div class="msgs chatbg">${t.msgs.map((m) => `<div class="bub ${m.from === 'you' ? 'out' : ''} ${m.from === 'sys' ? 'sys' : ''} ${m.fresh ? 'msg-new' : ''}">${esc(m.text)}<span class="tm">${esc(m.at)}</span></div>`).join('')}${t.busy ? '<div class="typing"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="comp"><input class="input" data-input="ag-test" data-id="${esc(a.id)}" placeholder="Message as a customer…" value="${esc(t.draft)}" onkeydown="if(event.key==='Enter'){DM.acts['ag-test-send'](this)}"><button class="btn" data-act="ag-test-send" data-arg="${esc(a.id)}">${I('send')}</button></div></div>
      <div class="col" style="gap:12px"><div class="card pad"><h3>Used for last reply</h3><div class="col" style="margin-top:8px;gap:6px">${t.used.length ? t.used.map((u) => `<div class="row sm">${I('check')}<span>${esc(u)}</span></div>`).join('') : '<div class="sm muted">Send a message to see which rules, sources and confidence it used.</div>'}</div></div>
        <div class="card pad"><h3>Try asking</h3><div class="col" style="margin-top:8px;gap:6px">${['What is the price of ' + ((DM.S.products || [])[0]?.name || 'your top product') + '?', 'Do you have ' + ((DM.S.products || [])[1]?.name || 'it') + ' in stock?', 'I need 20 pieces, send ASAP', 'Where is my order?'].map((q) => `<button class="btn outline sm" style="justify-content:flex-start;white-space:normal;height:auto;padding:6px 10px;text-align:left" data-act="ag-test-ask" data-arg="${esc(a.id)}|${esc(q)}">${esc(q)}</button>`).join('')}</div></div></div></div>`;
  }
  function sendTest(aid, text) {
    const a = DM.by(agents(), aid); const t = tm(a); text = (text || '').trim(); if (!text || t.busy) return;
    t.msgs.push({ from: 'you', text, at: nowLbl(), fresh: true }); t.draft = ''; t.busy = true; DM.render();
    setTimeout(() => { const r = reply(a, text); t.busy = false; t.used = r.used; t.msgs.push({ from: 'anuma', text: r.text, at: nowLbl(), fresh: true }); if (r.escalate) t.msgs.push({ from: 'sys', text: 'Escalated to a human · confidence below floor', at: nowLbl(), fresh: true }); if (DM.path().indexOf('/agents/' + aid + '/test') === 0) DM.render(); }, 1100);
  }
  DM.input('ag-test', (v, el) => { tm(DM.by(agents(), el.dataset.id)).draft = v; });
  DM.act('ag-test-send', (el) => { const aid = el.dataset.arg || el.dataset.id; sendTest(aid, tm(DM.by(agents(), aid)).draft); });
  DM.act('ag-test-ask', (el) => { const [aid, q] = el.dataset.arg.split('|'); sendTest(aid, q); });
  DM.act('ag-test-reset', (el) => { delete U().chat[el.dataset.arg]; DM.render(); });

  /* ── activity log ── */
  const sortedAct = (a) => (a.activity || []).slice().sort((x, y) => String(y.at).localeCompare(String(x.at)));
  const tone = { handled: 'green', escalated: 'blue', validation: 'amber' };
  function activity(a) {
    const f = U().actFilter; const rows = sortedAct(a).filter((r) => f === 'all' || r.outcome === f);
    const days = {}; rows.forEach((r) => { const d = new Date(r.at); const k = isNaN(d) ? String(r.at).slice(0, 10) : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(); (days[k] = days[k] || []).push(r); });
    return `<div class="ag-col" style="max-width:860px"><div class="row">${DM.pills([{ key: 'all', label: 'All' }, { key: 'handled', label: 'Handled' }, { key: 'escalated', label: 'Escalated' }, { key: 'validation', label: 'Validation' }], f, 'ag-actf')}<span class="sm muted right">${rows.length} events</span></div>
      ${rows.length ? Object.entries(days).map(([d, rs]) => `<div><div class="ag-day">${esc(d)}</div><div class="ag-log">${rs.map((r) => { const t = new Date(r.at); return `<div class="r" data-act="ag-act-open" data-arg="${esc(r.id)}"><span class="tm">${isNaN(t) ? '' : t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span><div class="grow"><div><span class="ag-chip">${esc(r.kind || 'action')}</span><span class="ag-chip">${esc(r.outcome)}</span></div><div class="b sm" style="margin-top:4px">${esc(r.action)}</div><div class="xs muted">${esc(r.channel || '—')}${r.caseId ? ' · ' + esc(r.caseId) : ''}</div></div></div>`; }).join('')}</div></div>`).join('') : DM.empty('history', 'No activity yet', 'Test the agent or take it live and what it does shows up here.')}</div>`;
  }
  DM.act('ag-actf', (el) => { U().actFilter = el.dataset.arg; DM.render(); });
  DM.act('ag-act-open', (el) => {
    const aid = DM.path().split('/')[2]; const a = DM.by(agents(), aid); const r = DM.by(a.activity || [], el.dataset.arg); if (!r) return;
    DM.drawer({ title: 'Activity', body: `<dl class="kv"><dt>Action</dt><dd>${esc(r.action)}</dd><dt>When</dt><dd>${esc(fmt.dt(r.at))}</dd><dt>Outcome</dt><dd>${DM.status(r.outcome, tone[r.outcome] || 'grey')}</dd><dt>Channel</dt><dd>${esc(r.channel || '—')}</dd><dt>Case</dt><dd>${r.caseId ? `<a class="b" href="#/inbox/threads?case=${esc(r.caseId)}">${esc(r.caseId)}</a>` : '—'}</dd><dt>Agent</dt><dd>${esc(a.name)}</dd></dl><div class="sep"></div><div class="sm muted">Reasoning</div><p class="sm" style="margin-top:6px">${r.outcome === 'escalated' ? 'Match confidence was below the escalation floor, so the case was handed to a person.' : r.outcome === 'validation' ? 'A field failed validation (quantity, unit or price) and the customer was asked to confirm.' : 'Every line matched the catalogue above the confidence floor, so the agent completed this on its own.'}</p>` });
  });
})();
