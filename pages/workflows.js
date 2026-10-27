/* Workflows: list + node-canvas builder; Governance: policy, workflows, autonomy, approvals. */
(function () {
  const { esc, icon: I, fmt } = DM;
  const st = document.createElement('style'); st.dataset.for = 'workflows';
  st.textContent = `
  .wf-wrap{display:grid;grid-template-columns:minmax(0,1fr) 300px;height:100%;min-height:0}
  .wf-canvas{position:relative;overflow:auto;background-color:#fafafa;background-image:radial-gradient(#d4d4d4 1px,transparent 1px);background-size:20px 20px}
  .wf-inner{position:relative;width:1400px;height:900px}
  .wf-inner svg{position:absolute;inset:0;pointer-events:none}
  .wf-node{position:absolute;width:210px;background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px 12px;cursor:grab;user-select:none;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:box-shadow .14s,border-color .14s}
  .wf-node:hover{box-shadow:0 4px 14px rgba(0,0,0,.08)}.wf-node.sel{border-color:#171717;box-shadow:0 0 0 1px #171717}
  .wf-node.run{border-color:var(--info);box-shadow:0 0 0 3px var(--info-tint),0 0 0 4px var(--info)}.wf-node.ok{border-color:var(--success)}
  .wf-node .tp{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;display:flex;gap:5px;align-items:center}
  .wf-node .lb{font-weight:500;font-size:13px;margin-top:3px}.wf-node .dt{font-size:12px;color:var(--muted-foreground);margin-top:1px}
  .wf-node .ok-mark{position:absolute;top:-8px;right:-8px;width:18px;height:18px;border-radius:50%;background:var(--success);color:#fff;display:none;place-items:center}.wf-node.ok .ok-mark{display:grid}
  .wf-side{border-left:1px solid var(--border);overflow:auto;padding:16px;background:#fff}
  .wf-tools{position:absolute;left:12px;top:12px;display:flex;gap:6px;z-index:3}
  .t-trigger{color:var(--info)}.t-condition{color:#9a6208}.t-action{color:#0b7a4e}.t-delay{color:#6d28d9}
  .opt{display:flex;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;align-items:flex-start;width:100%;text-align:left}.opt:hover{background:var(--muted)}.opt.on{border-color:#171717;box-shadow:0 0 0 1px #171717 inset}
  .gv-seg{display:inline-flex;border:1px solid var(--border);border-radius:8px;overflow:hidden}.gv-seg button{padding:5px 11px;font-size:12.5px;color:var(--muted-foreground);border-right:1px solid var(--border)}.gv-seg button:last-child{border:0}.gv-seg button.on{background:#171717;color:#fff}
  .gv-two{grid-template-columns:minmax(0,1fr) 340px;align-items:start}@media(max-width:1100px){.gv-two{grid-template-columns:1fr}}
  @media(max-width:1100px){.wf-wrap{grid-template-columns:1fr}.wf-side{border-left:0;border-top:1px solid var(--border)}}`;
  document.head.appendChild(st);

  const U = () => (DM.ui.wf = DM.ui.wf || { sel: null, q: '', filter: 'all', run: false });
  const wfs = () => DM.S.workflows || (DM.S.workflows = []);
  const TYPE = { trigger: ['Trigger', 'zap'], condition: ['Condition', 'filter'], action: ['Action', 'check'], delay: ['Delay', 'clock'] };
  const LIB = {
    trigger: [['New WhatsApp message', 'A customer messages any connected channel'], ['New RFQ received', 'An RFQ lands by email, PDF or WhatsApp'], ['Order confirmed', 'An order moves to Confirmed'], ['Draft order created', 'Anuma drafts an order from a chat'], ['Schedule', 'Every day at a set time'], ['Stock below threshold', 'A product falls under its reorder level']],
    condition: [['Order value above ₹…', 'Branch on order total'], ['Match confidence below floor', 'Uses the escalation policy'], ['Party is over credit limit', 'Compare outstanding to credit limit'], ['Product in category', 'Match a catalogue category'], ['Decision (custom)', 'Compare any two fields']],
    action: [['Send WhatsApp message', 'Reply on the same channel'], ['Create draft order', 'Turn parsed lines into a draft'], ['Assign to a human', 'Hand the case to a teammate'], ['Request approval', 'Ask an approver before continuing'], ['Push to ERP', 'Post the order to Tally / Coralio'], ['Add row to Google Sheet', 'Append to a connected sheet'], ['Send email', 'Email the party or an internal team'], ['Create quote', 'Build a quote from RFQ lines']],
    delay: [['Wait 30 minutes', 'Pause the run'], ['Wait 1 day', 'Pause the run'], ['Wait until 9:00 AM', 'Pause until the next morning']],
  };

  function seedNodes(w) {
    const t = w.trigger || 'New WhatsApp message';
    w.nodes = [{ id: 'n1', type: 'trigger', label: t, detail: 'Starts the workflow', x: 60, y: 80 }, { id: 'n2', type: 'condition', label: 'Match confidence below floor', detail: 'Uses escalation policy', x: 360, y: 80 }, { id: 'n3', type: 'action', label: 'Assign to a human', detail: 'ASM on duty', x: 660, y: 20 }, { id: 'n4', type: 'action', label: 'Create draft order', detail: 'From parsed lines', x: 660, y: 160 }];
    w.edges = [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }, { from: 'n2', to: 'n4', label: 'No' }];
  }
  const ensure = (w) => { if (!w.nodes || !w.nodes.length) seedNodes(w); w.edges = w.edges || []; w.nodes.forEach((n, i) => { if (n.x == null) { n.x = 60 + (i % 4) * 300; n.y = 60 + Math.floor(i / 4) * 140; } }); return w; };

  /* ── list ── */
  DM.page('/workflows', { title: 'Workflows', render() {
    const u = U(); let rows = wfs().filter((w) => (u.filter === 'all' || w.status === u.filter) && (!u.q || w.name.toLowerCase().includes(u.q.toLowerCase())));
    return `<div class="page">${DM.header('Workflows', 'Automations that run when something happens — replies, drafts, approvals, ERP posts.', DM.btn('New workflow', 'wf-new', { icon: 'plus' }))}
      <div class="row" style="margin-bottom:12px">${DM.searchBox('wf-q', 'Search workflows…', u.q)}${DM.pills([{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'draft', label: 'Draft' }, { key: 'paused', label: 'Paused' }], u.filter, 'wf-filter')}</div>
      ${DM.table([{ label: 'Name', render: (w) => `<div class="b">${esc(w.name)}</div><div class="xs muted">${(w.nodes || []).length || 4} steps</div>` }, { label: 'Trigger', render: (w) => `<span class="row gap4">${I('zap')} ${esc(w.trigger || '—')}</span>` }, { label: 'Status', render: (w) => DM.badge(w.status, w.status === 'active' ? 'green' : w.status === 'paused' ? 'amber' : '', true) }, { label: 'Runs', num: true, render: (w) => fmt.num(w.runs || 0) }, { label: 'Last run', render: (w) => `<span class="muted">${w.lastRun ? esc(/^\d{4}-/.test(w.lastRun) ? fmt.dt(w.lastRun) : w.lastRun) : 'Never'}</span>` }, { label: '', w: '90px', render: (w) => `<div class="row" style="justify-content:flex-end">${DM.switch(w.status === 'active', 'wf-toggle', w.id)}<button class="btn ghost icon sm" data-act="wf-menu" data-arg="${esc(w.id)}">${I('more')}</button></div>` }], rows, { go: (w) => '/workflows/' + w.id, empty: 'No workflows match.' })}</div>`;
  } });
  DM.input('wf-q', (v) => { U().q = v; DM.render(); });
  DM.act('wf-filter', (el) => { U().filter = el.dataset.arg; DM.render(); });
  DM.act('wf-toggle', (el, ev) => { ev.stopPropagation(); const w = DM.by(wfs(), el.dataset.arg); w.status = w.status === 'active' ? 'paused' : 'active'; DM.toast(w.name + (w.status === 'active' ? ' is on' : ' paused')); DM.render(); });
  DM.act('wf-menu', (el, ev) => { ev.stopPropagation(); const w = DM.by(wfs(), el.dataset.arg); DM.menu(el, [{ label: 'Open builder', icon: 'workflow', run: () => DM.go('/workflows/' + w.id) }, { label: 'Duplicate', icon: 'copy', run: () => { const c = DM.clone(ensure(w)); c.id = DM.uid('wf'); c.name += ' (copy)'; c.status = 'draft'; c.runs = 0; c.lastRun = null; wfs().push(c); DM.toast('Duplicated'); DM.render(); } }, { label: 'Delete', icon: 'trash', run: () => DM.confirm('Delete workflow?', `<b>${esc(w.name)}</b> will be removed.`, () => { DM.S.workflows = wfs().filter((x) => x.id !== w.id); DM.toast('Deleted'); DM.render(); }, 'Delete') }]); });
  DM.act('wf-new', () => DM.modal({ title: 'New workflow', body: `<div class="col gap12">${DM.field('Name', 'name', { ph: 'Escalate big orders' })}<div class="field"><label>Trigger</label><select class="select" name="trigger">${LIB.trigger.map((t) => `<option>${esc(t[0])}</option>`).join('')}</select></div></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create & open', run: (m) => { const f = DM.formData(m); if (!f.name.trim()) return false; const w = { id: DM.uid('wf'), name: f.name.trim(), status: 'draft', trigger: f.trigger, runs: 0, lastRun: null, nodes: [{ id: 'n1', type: 'trigger', label: f.trigger, detail: 'Starts the workflow', x: 60, y: 120 }], edges: [] }; wfs().push(w); DM.go('/workflows/' + w.id); } }] }));

  /* ── builder ── */
  const NW = 210, NH = 66;
  const edgePath = (a, b) => { const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, dx = Math.max(40, Math.abs(x2 - x1) / 2); return `M${x1} ${y1} C${x1 + dx} ${y1},${x2 - dx} ${y2},${x2} ${y2}`; };
  function edgesSvg(w) {
    return `<svg width="1400" height="900"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#a3a3a3"/></marker></defs>${w.edges.map((e) => { const a = DM.by(w.nodes, e.from), b = DM.by(w.nodes, e.to); if (!a || !b) return ''; const mx = (a.x + NW + b.x) / 2, my = (a.y + b.y) / 2 + NH / 2; return `<path d="${edgePath(a, b)}" fill="none" stroke="#a3a3a3" stroke-width="1.6" marker-end="url(#arr)"/>${e.label ? `<g><rect x="${mx - 15}" y="${my - 9}" width="30" height="18" rx="9" fill="#fff" stroke="#e5e5e5"/><text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="10.5" fill="#525252">${esc(e.label)}</text></g>` : ''}`; }).join('')}</svg>`;
  }
  const nodeHtml = (n, sel) => `<div class="wf-node ${n.id === sel ? 'sel' : ''}" data-nid="${esc(n.id)}" style="left:${n.x}px;top:${n.y}px"><span class="ok-mark">${I('check').replace('class="i ', 'style="width:11px;height:11px" class="i ')}</span><div class="tp t-${esc(n.type)}">${I(TYPE[n.type][1]).replace('class="i ', 'style="width:12px;height:12px" class="i ')} ${TYPE[n.type][0]}</div><div class="lb trunc">${esc(n.label)}</div><div class="dt trunc">${esc(n.detail || '')}</div></div>`;
  function side(w) {
    const n = DM.by(w.nodes, U().sel);
    if (!n) return `<div class="b">Workflow</div><div class="col gap12" style="margin-top:10px">${DM.field('Name', 'wf-name', { value: w.name }).replace('name="wf-name"', 'data-input="wf-name"')}<dl class="kv" style="grid-template-columns:90px 1fr"><dt>Status</dt><dd>${DM.badge(w.status, w.status === 'active' ? 'green' : '', true)}</dd><dt>Steps</dt><dd>${w.nodes.length}</dd><dt>Runs</dt><dd>${fmt.num(w.runs || 0)}</dd><dt>Last run</dt><dd>${w.lastRun ? esc(/^\d{4}-/.test(w.lastRun) ? fmt.dt(w.lastRun) : w.lastRun) : 'Never'}</dd></dl><p class="xs muted">Drag nodes to rearrange. Click a node to edit it, or use “Add step” to extend the flow.</p></div>`;
    const outs = w.edges.filter((e) => e.from === n.id).length;
    return `<div class="row"><div class="b grow">${TYPE[n.type][0]}</div><button class="btn ghost icon sm" data-act="wf-desel">${I('x')}</button></div><div class="col gap12" style="margin-top:10px"><div class="field"><label>Label</label><input class="input" data-input="wf-nlabel" value="${esc(n.label)}"></div><div class="field"><label>Details</label><textarea class="textarea" rows="3" data-input="wf-ndetail">${esc(n.detail || '')}</textarea></div>${n.type === 'condition' ? `<div class="field"><label>Threshold</label><input class="input" data-input="wf-nthr" value="${esc(n.threshold || '')}" placeholder="e.g. 50000"></div>` : ''}<div class="sep" style="margin:4px 0"></div><button class="btn outline sm" data-act="wf-add" data-arg="${esc(n.id)}">${I('plus')} Add step after this</button>${n.type !== 'trigger' ? `<button class="btn outline sm" data-act="wf-ndel" data-arg="${esc(n.id)}" style="color:var(--destructive)">${I('trash')} Delete step</button>` : ''}<div class="xs muted">${outs} outgoing connection${outs === 1 ? '' : 's'}</div></div>`;
  }
  DM.page('/workflows/:id', { title: 'Workflow', crumb: (p) => (DM.by(wfs(), p.id) || {}).name || 'Workflow', render({ params }) {
    const w = DM.by(wfs(), params.id); if (!w) return `<div class="page"><div class="empty"><h3>Workflow not found</h3><p style="margin-top:10px"><a class="btn outline" href="#/workflows">Back</a></p></div></div>`;
    ensure(w); const u = U();
    return `<div class="page-full" style="display:flex;flex-direction:column"><div class="row" style="padding:12px 20px;border-bottom:1px solid var(--border)"><a class="btn ghost sm" href="#/workflows">${I('arrowL')}</a><div class="b" id="wf-title">${esc(w.name)}</div>${DM.badge(w.status, w.status === 'active' ? 'green' : w.status === 'paused' ? 'amber' : '', true)}<div class="right row">${DM.btn('Add step', 'wf-add', { cls: 'outline sm', icon: 'plus', arg: u.sel || '' })}${DM.btn('Test run', 'wf-run', { cls: 'outline sm', icon: 'play', arg: w.id })}${DM.btn(w.status === 'active' ? 'Pause' : 'Publish', 'wf-publish', { cls: 'sm', arg: w.id })}</div></div>
      <div class="wf-wrap" style="flex:1"><div class="wf-canvas" id="wf-canvas"><div class="wf-inner" id="wf-inner"><div id="wf-edges">${edgesSvg(w)}</div>${w.nodes.map((n) => nodeHtml(n, u.sel)).join('')}</div></div><div class="wf-side" id="wf-side">${side(w)}</div></div></div>`;
  }, after(view, { params }) {
    const w = DM.by(wfs(), params.id); if (!w) return; const inner = view.querySelector('#wf-inner'); if (!inner) return;
    inner.querySelectorAll('.wf-node').forEach((el) => el.addEventListener('mousedown', (e) => {
      const n = DM.by(w.nodes, el.dataset.nid); const sx = e.clientX, sy = e.clientY, ox = n.x, oy = n.y; let moved = false;
      const mv = (ev) => { const dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; if (!moved) return; n.x = Math.max(0, Math.min(1180, ox + dx)); n.y = Math.max(0, Math.min(820, oy + dy)); el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; view.querySelector('#wf-edges').innerHTML = edgesSvg(w); el.style.cursor = 'grabbing'; };
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); el.style.cursor = ''; if (!moved) { U().sel = n.id; DM.render(); } };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); e.preventDefault();
    }));
    view.querySelector('#wf-canvas').addEventListener('mousedown', (e) => { if (e.target.id === 'wf-canvas' || e.target.id === 'wf-inner') { if (U().sel) { U().sel = null; DM.render(); } } });
  } });
  const curW = () => DM.by(wfs(), DM.path().split('/')[2]);
  DM.input('wf-name', (v) => { const w = curW(); w.name = v; const t = document.getElementById('wf-title'); if (t) t.textContent = v; });
  DM.input('wf-nlabel', (v) => { const n = DM.by(curW().nodes, U().sel); n.label = v; const el = document.querySelector(`.wf-node[data-nid="${n.id}"] .lb`); if (el) el.textContent = v; if (n.type === 'trigger') curW().trigger = v; });
  DM.input('wf-ndetail', (v) => { const n = DM.by(curW().nodes, U().sel); n.detail = v; const el = document.querySelector(`.wf-node[data-nid="${n.id}"] .dt`); if (el) el.textContent = v; });
  DM.input('wf-nthr', (v) => { DM.by(curW().nodes, U().sel).threshold = v; });
  DM.act('wf-desel', () => { U().sel = null; DM.render(); });
  DM.act('wf-ndel', (el) => DM.confirm('Delete step?', 'Connections to this step are removed too.', () => { const w = curW(); const id = el.dataset.arg; const ins = w.edges.filter((e) => e.to === id), outs = w.edges.filter((e) => e.from === id); w.edges = w.edges.filter((e) => e.from !== id && e.to !== id); if (ins.length === 1 && outs.length === 1) w.edges.push({ from: ins[0].from, to: outs[0].to }); w.nodes = w.nodes.filter((n) => n.id !== id); U().sel = null; DM.toast('Step deleted'); DM.render(); }, 'Delete'));
  DM.act('wf-publish', (el) => { const w = DM.by(wfs(), el.dataset.arg); w.status = w.status === 'active' ? 'paused' : 'active'; DM.toast(w.status === 'active' ? 'Workflow published' : 'Workflow paused', 'check'); DM.render(); });
  DM.act('wf-add', (el) => {
    const w = curW(); const after = el.dataset.arg || U().sel || (w.nodes[w.nodes.length - 1] || {}).id; let type = 'action', pick = null;
    const draw = (m) => { m.querySelector('.modal-b').innerHTML = `<div class="pills" style="margin-bottom:12px">${Object.entries(TYPE).map(([k, v]) => `<button class="pill ${k === type ? 'on' : ''}" data-t="${k}">${v[0]}</button>`).join('')}</div><div class="col" style="gap:8px">${LIB[type].map((o, i) => `<button class="opt ${pick === i ? 'on' : ''}" data-o="${i}">${I(TYPE[type][1])}<div><div class="b sm">${esc(o[0])}</div><div class="xs muted">${esc(o[1])}</div></div></button>`).join('')}</div>`; };
    DM.modal({ title: 'Add step', body: '', lg: false, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add step', run: () => {
      if (pick == null) { DM.toast('Pick a step first', 'alert'); return false; }
      const o = LIB[type][pick]; const from = DM.by(w.nodes, after); const id = DM.uid('n');
      const n = { id, type, label: o[0], detail: o[1], x: from ? from.x + 300 : 60, y: from ? from.y + (w.edges.filter((e) => e.from === from.id).length * 110) : 80 };
      if (n.x > 1180) { n.x = from.x; n.y = from.y + 150; }
      w.nodes.push(n); if (from) w.edges.push({ from: from.id, to: id }); U().sel = id; DM.toast('Step added'); DM.render();
    } }], onMount: (m) => { draw(m); m.addEventListener('click', (e) => { const t = e.target.closest('[data-t]'), o = e.target.closest('[data-o]'); if (t) { type = t.dataset.t; pick = null; draw(m); } else if (o) { pick = +o.dataset.o; draw(m); } }); } });
  });
  DM.act('wf-run', (el) => {
    const w = DM.by(wfs(), el.dataset.arg); const u = U(); if (u.run) return; u.run = true;
    const order = []; const seen = new Set(); const q = [(w.nodes.find((n) => n.type === 'trigger') || w.nodes[0]).id];
    while (q.length) { const id = q.shift(); if (seen.has(id)) continue; seen.add(id); order.push(id); w.edges.filter((e) => e.from === id).forEach((e) => q.push(e.to)); }
    document.querySelectorAll('.wf-node').forEach((n) => n.classList.remove('ok', 'run')); DM.toast('Test run started', 'play');
    order.forEach((id, i) => setTimeout(() => { const prev = document.querySelector(`.wf-node[data-nid="${order[i - 1]}"]`); if (prev) { prev.classList.remove('run'); prev.classList.add('ok'); } const el2 = document.querySelector(`.wf-node[data-nid="${id}"]`); if (el2) el2.classList.add('run'); }, i * 750));
    setTimeout(() => { const last = document.querySelector(`.wf-node[data-nid="${order[order.length - 1]}"]`); if (last) { last.classList.remove('run'); last.classList.add('ok'); } w.runs = (w.runs || 0) + 1; w.lastRun = new Date().toISOString(); u.run = false; DM.toast(`Test run passed · ${order.length} steps`, 'check'); }, order.length * 750 + 200);
  });

  /* ── governance ── */
  const GTABS = [['policy', 'Policy'], ['workflows', 'Workflows'], ['autonomy', 'Autonomy'], ['approvals', 'Approvals']];
  const gshell = (tab, sub, body) => `<div class="page">${DM.header('Governance', sub)}<div class="tabs">${GTABS.map(([k, l]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#/governance/${k}">${l}${k === 'approvals' && pendingCount() ? ` <span class="badge amber">${pendingCount()}</span>` : ''}</a>`).join('')}</div>${body}</div>`;
  const G = () => DM.S.governance || (DM.S.governance = {
    policy: [{ id: 'p1', area: 'Replying to customers', mode: 'auto' }, { id: 'p2', area: 'Creating draft orders', mode: 'auto' }, { id: 'p3', area: 'Confirming orders', mode: 'ask' }, { id: 'p4', area: 'Sending quotes', mode: 'ask' }, { id: 'p5', area: 'Offering discounts', mode: 'ask' }, { id: 'p6', area: 'Pushing to ERP', mode: 'ask' }, { id: 'p7', area: 'Issuing refunds', mode: 'never' }],
    limits: { orderValue: 100000, discountPct: 8, creditOverride: false },
    autonomy: { replies: 3, drafts: 3, quotes: 2, orders: 1, erp: 1 },
    chains: [{ id: 'c1', name: 'Quote above ₹1,00,000', steps: ['Sales manager', 'Owner'], on: true }, { id: 'c2', name: 'Discount above 8%', steps: ['Owner'], on: true }, { id: 'c3', name: 'Order over credit limit', steps: ['Accounts', 'Owner'], on: true }, { id: 'c4', name: 'New party first order', steps: ['ASM'], on: false }],
    decided: [],
  });
  const MODES = [['auto', 'Auto'], ['ask', 'Ask me'], ['never', 'Never']];
  DM.page('/governance', { render() { setTimeout(() => DM.go('/governance/policy'), 0); return ''; } });
  DM.page('/governance/policy', { title: 'Policy', crumb: 'Policy', render() {
    const g = G();
    return gshell('policy', 'What Anuma may do on its own, and what needs a person.', `<div class="grid gv-two"><div class="card">${g.policy.map((p) => `<div class="row" style="padding:12px 16px;border-bottom:1px solid var(--border)"><div class="grow"><div class="b sm">${esc(p.area)}</div><div class="xs muted">${p.mode === 'auto' ? 'Anuma does this and logs it' : p.mode === 'ask' ? 'Anuma prepares it; a human approves' : 'Anuma never does this'}</div></div><div class="gv-seg">${MODES.map(([k, l]) => `<button class="${p.mode === k ? 'on' : ''}" data-act="gv-mode" data-arg="${p.id}|${k}">${l}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="card pad"><h3>Limits</h3><div class="col gap12" style="margin-top:10px"><div class="field"><label>Auto-approve orders up to</label><input class="input" type="number" data-input="gv-limit" data-k="orderValue" value="${g.limits.orderValue}"></div><div class="field"><label>Max discount without approval (%)</label><input class="input" type="number" data-input="gv-limit" data-k="discountPct" value="${g.limits.discountPct}"></div><label class="row sm">${DM.switch(g.limits.creditOverride, 'gv-credit')} Allow orders over credit limit</label><button class="btn" data-act="toast" data-arg="Policy saved">Save policy</button></div></div></div>`);
  } });
  DM.act('gv-mode', (el) => { const [id, m] = el.dataset.arg.split('|'); const p = G().policy.find((x) => x.id === id); p.mode = m; DM.toast(`${p.area}: ${MODES.find((x) => x[0] === m)[1]}`); DM.render(); });
  DM.input('gv-limit', (v, el) => { G().limits[el.dataset.k] = +v; });
  DM.act('gv-credit', () => { G().limits.creditOverride = !G().limits.creditOverride; DM.render(); });

  DM.page('/governance/workflows', { title: 'Approval chains', crumb: 'Workflows', render() {
    const g = G();
    return gshell('workflows', 'Who has to sign off, in what order.', `<div class="row" style="margin-bottom:12px"><span class="sm muted">${g.chains.length} approval chains</span><div class="right">${DM.btn('New chain', 'gv-chain-new', { icon: 'plus' })}</div></div><div class="grid g2">${g.chains.map((c) => `<div class="card pad"><div class="row"><div class="b grow">${esc(c.name)}</div>${DM.switch(c.on, 'gv-chain-tog', c.id)}</div><div class="row wrap" style="margin:12px 0;gap:6px">${DM.badge('Request', 'outline')}${c.steps.map((s) => `${I('arrowR')}${DM.badge(s, 'blue')}`).join('')}${I('arrowR')}${DM.badge('Approved', 'green')}</div><div class="row"><button class="btn outline sm" data-act="gv-chain-edit" data-arg="${c.id}">${I('edit')} Edit steps</button><button class="btn ghost sm right" data-act="gv-chain-del" data-arg="${c.id}">${I('trash')}</button></div></div>`).join('')}</div><p class="sm muted" style="margin-top:14px">Looking for automations? <a class="b" href="#/workflows">Open Workflows</a>.</p>`);
  } });
  const ROLES = ['ASM', 'Sales manager', 'Accounts', 'Admin', 'Owner'];
  function chainModal(c) {
    DM.modal({ title: c ? 'Edit approval chain' : 'New approval chain', body: `<div class="col gap12">${DM.field('Name', 'name', { value: c?.name || '', ph: 'Quote above ₹2,00,000' })}<div class="field"><label>Approvers in order</label>${[0, 1, 2].map((i) => `<select class="select" name="s${i}" style="margin-bottom:6px"><option value="">${i === 0 ? 'Choose first approver' : '— none —'}</option>${ROLES.map((r) => `<option ${c?.steps[i] === r ? 'selected' : ''}>${r}</option>`).join('')}</select>`).join('')}</div></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (m) => { const f = DM.formData(m); const steps = [f.s0, f.s1, f.s2].filter(Boolean); if (!f.name.trim() || !steps.length) { DM.toast('Name and at least one approver', 'alert'); return false; } if (c) { c.name = f.name; c.steps = steps; } else G().chains.push({ id: DM.uid('c'), name: f.name, steps, on: true }); DM.toast('Chain saved'); DM.render(); } }] });
  }
  DM.act('gv-chain-new', () => chainModal()); DM.act('gv-chain-edit', (el) => chainModal(DM.by(G().chains, el.dataset.arg)));
  DM.act('gv-chain-tog', (el) => { const c = DM.by(G().chains, el.dataset.arg); c.on = !c.on; DM.render(); });
  DM.act('gv-chain-del', (el) => DM.confirm('Delete chain?', 'Requests will no longer route through it.', () => { G().chains = G().chains.filter((c) => c.id !== el.dataset.arg); DM.render(); }, 'Delete'));

  const LEVELS = ['Observe only', 'Suggest', 'Act with approval', 'Act and report'];
  const DOM = [['replies', 'Customer replies', 'chat'], ['drafts', 'Draft orders', 'file'], ['quotes', 'Quotes', 'receipt'], ['orders', 'Order confirmation', 'clipboard'], ['erp', 'ERP posting', 'database']];
  DM.page('/governance/autonomy', { title: 'Autonomy', crumb: 'Autonomy', render() {
    const g = G();
    return gshell('autonomy', 'How far each part of Anuma may go without you.', `<div class="grid g2">${DOM.map(([k, l, ic]) => `<div class="card pad"><div class="row"><span class="ag-tile" style="width:30px;height:30px;background:var(--muted);color:#171717;border-radius:8px;display:grid;place-items:center">${I(ic)}</span><div class="b grow">${l}</div>${DM.badge(LEVELS[g.autonomy[k]], g.autonomy[k] >= 3 ? 'green' : g.autonomy[k] >= 2 ? 'blue' : '')}</div><input type="range" min="0" max="3" step="1" value="${g.autonomy[k]}" class="ag-slider" style="margin-top:14px;width:100%;accent-color:#171717" data-input="gv-auto" data-k="${k}"><div class="row xs muted" style="justify-content:space-between"><span>Observe</span><span>Suggest</span><span>Approve</span><span>Autonomous</span></div></div>`).join('')}</div>`);
  } });
  DM.input('gv-auto', (v, el) => { G().autonomy[el.dataset.k] = +v; const b = el.parentNode.querySelector('.badge'); if (b) { b.textContent = LEVELS[+v]; b.className = 'badge ' + (+v >= 3 ? 'green' : +v >= 2 ? 'blue' : ''); } });

  const pendingItems = () => {
    const q = (DM.S.quotes || []).filter((x) => x.status === 'pending_approval').map((x) => ({ kind: 'quote', id: x.id, title: 'Quote ' + (x.no || x.id), party: (DM.by(DM.S.parties || [], x.partyId) || {}).name, value: x.total, note: `Margin ${x.marginPct != null ? x.marginPct + '%' : '—'}`, href: '/quotes/' + x.id }));
    const d = (DM.S.drafts || []).filter((x) => x.status === 'pending').map((x) => ({ kind: 'draft', id: x.id, title: 'Draft order ' + (x.no || x.id), party: (DM.by(DM.S.parties || [], x.partyId) || {}).name, value: x.total, note: (x.lines || []).some((l) => l.state === 'flagged') ? 'Has flagged lines' : (x.note || 'Drafted by Anuma'), href: '/orders/drafts/' + x.id }));
    return q.concat(d);
  };
  const pendingCount = () => pendingItems().length;
  DM.page('/governance/approvals', { title: 'Approvals', crumb: 'Approvals', render() {
    const items = pendingItems(); const done = G().decided;
    return gshell('approvals', 'Things Anuma prepared that are waiting on a person.', `<div class="card"><div class="card-h"><h3 class="grow">Waiting for you</h3><span class="badge amber">${items.length}</span></div>${items.length ? items.map((x) => `<div class="row" style="padding:12px 16px;border-bottom:1px solid var(--border)">${DM.avatar(x.party || '?')}<div class="grow"><a class="b sm" href="#${x.href}">${esc(x.title)}</a><div class="xs muted">${esc(x.party || '—')} · ${esc(x.note)}</div></div><div class="b mono">${fmt.inr(x.value)}</div><button class="btn outline sm" data-act="gv-decide" data-arg="${x.kind}|${esc(x.id)}|no">Reject</button><button class="btn sm" data-act="gv-decide" data-arg="${x.kind}|${esc(x.id)}|yes">${I('check')} Approve</button></div>`).join('') : `<div class="empty">${I('check')}<p style="margin-top:6px">Nothing waiting. Anuma is caught up.</p></div>`}</div>
      ${done.length ? `<h3 style="margin:18px 0 8px;font-size:14px">Decided this session</h3>${DM.table([{ label: 'Item', render: (r) => esc(r.title) }, { label: 'Decision', render: (r) => DM.badge(r.yes ? 'Approved' : 'Rejected', r.yes ? 'green' : 'red', true) }, { label: 'When', render: (r) => `<span class="muted">${esc(r.at)}</span>` }], done)}` : ''}`);
  } });
  DM.act('gv-decide', (el) => {
    const [kind, id, yes] = el.dataset.arg.split('|'); const ok = yes === 'yes'; const arr = kind === 'quote' ? DM.S.quotes : DM.S.drafts; const x = DM.by(arr, id); if (!x) return;
    if (kind === 'quote') { x.status = ok ? 'sent' : 'rejected'; x.approver = 'You'; } else x.status = ok ? 'approved' : 'rejected';
    G().decided.unshift({ title: (kind === 'quote' ? 'Quote ' : 'Draft order ') + (x.no || x.id), yes: ok, at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) });
    DM.S.logs = DM.S.logs || []; DM.S.logs.unshift({ id: DM.uid('lg'), at: new Date().toISOString(), actor: 'You', action: (ok ? 'Approved ' : 'Rejected ') + (kind === 'quote' ? 'quote ' : 'draft order ') + (x.no || x.id), target: x.no || x.id, outcome: ok ? 'approved' : 'rejected', kind: 'action', channel: 'app' });
    DM.toast(ok ? 'Approved' : 'Rejected', ok ? 'check' : 'x'); DM.render();
  });
})();
