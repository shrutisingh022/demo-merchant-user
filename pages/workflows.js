/* Workflows: list + node-canvas builder (live NuHome design); Governance: policy, workflows, autonomy, approvals. */
(function () {
  const { esc, icon: I, fmt } = DM;
  const st = document.createElement('style'); st.dataset.for = 'workflows';
  st.textContent = `
  .ag-tile{width:30px;height:30px;border-radius:8px;background:#171717;color:#fff;display:grid;place-items:center;font-weight:700;flex:none}
  .wfrow{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;margin-bottom:10px;transition:border-color .14s}.wfrow:hover{border-color:#bdbdbd}
  .wfpage{display:flex;flex-direction:column;height:100%;min-height:0}
  .wf-top{display:flex;align-items:center;gap:10px;padding:0 14px;height:48px;border-bottom:1px solid var(--border);flex:none}
  .wf-top .nm{font-weight:600;font-size:13px}
  .wf-e.live{animation:wf-flow 1s linear infinite}
  .wf-node{animation:pop-in .3s cubic-bezier(.22,.8,.24,1) both}
  .wf-node.pulse{animation:wf-pulse .5s ease}@keyframes wf-pulse{0%{transform:scale(1)}40%{transform:scale(1.035)}100%{transform:scale(1)}}
  .wf-node .cn.tick{animation:badge-pop .35s ease}
  .wf-dot{fill:#2563eb;filter:drop-shadow(0 0 4px rgba(37,99,235,.7))}
  .popin{animation:pop-in .38s cubic-bezier(.22,.8,.24,1) both}
  .spin{width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:wfsp .7s linear infinite;display:inline-block}@keyframes wfsp{to{transform:rotate(360deg)}}
  .wf-banner{font-size:12px;color:var(--muted-foreground);padding:8px 16px;border-bottom:1px solid #f0f0f0;flex:none}
  .wf-canvas{position:relative;flex:1;min-height:0;overflow:hidden;background-color:#fff;background-image:radial-gradient(#d9d9d9 1px,transparent 1px);background-size:18px 18px;cursor:grab}
  .wf-canvas.panning{cursor:grabbing}
  .wf-vp{position:absolute;left:0;top:0;transform-origin:0 0}
  #wf-edges>svg{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}
  .wf-node{position:absolute;width:200px;background:#fff;border:1px solid var(--border);border-radius:10px;padding:8px 10px 9px;cursor:pointer;user-select:none;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:box-shadow .14s,border-color .14s}
  .wf-node:hover{box-shadow:0 4px 14px rgba(0,0,0,.09)}.wf-node.run{border-color:var(--info);box-shadow:0 0 0 3px var(--info-tint),0 0 0 4px var(--info)}.wf-node.ok{border-color:var(--success)}
  .wf-node .h{display:flex;align-items:center;gap:7px}.wf-node .ti{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;flex:none}.wf-node .ti svg.i{width:12px;height:12px}
  .wf-node .tl{font-size:12px;font-weight:600}.wf-node .cn{margin-left:auto;display:flex;align-items:center;gap:4px;border:1px solid var(--border);border-radius:6px;padding:0 5px;height:17px;font-size:10px;color:#525252;background:#fff}.wf-node .cn svg.i{width:10px;height:10px}
  .wf-node .b1{font-size:11.5px;margin-top:6px;line-height:1.3}.wf-node .b2{font-size:11px;color:var(--muted-foreground);margin-top:2px;line-height:1.3}
  .ti.trigger{background:#f4f4f5;color:#262626}.ti.decision{background:#fef3c7;color:#b45309}.ti.action{background:#d1fae5;color:#047857}.ti.delay{background:#ede9fe;color:#6d28d9}.ti.end{background:#fee2e2;color:#b91c1c}
  .wf-plus{position:absolute;width:18px;height:18px;border-radius:50%;background:#fff;border:1px solid #cfcfcf;display:grid;place-items:center;transform:translate(-50%,-50%);cursor:pointer;color:#525252;z-index:2}.wf-plus:hover{background:#171717;color:#fff;border-color:#171717}.wf-plus svg.i{width:10px;height:10px}
  .wf-lab{position:absolute;transform:translate(-50%,-50%);font-size:9.5px;font-weight:600;letter-spacing:.04em;padding:1px 6px;border-radius:999px;background:#fff;border:1px solid;z-index:2}.wf-lab.t{color:#0b7a4e;border-color:#a7e3c4}.wf-lab.f{color:#b42318;border-color:#f3b4ae}
  .wf-zoom{position:absolute;left:14px;bottom:14px;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:8px;background:#fff;overflow:hidden;z-index:5}
  .wf-zoom button{width:30px;height:30px;display:grid;place-items:center;border-bottom:1px solid var(--border)}.wf-zoom button:last-child{border:0}.wf-zoom button:hover{background:var(--muted)}
  .wf-mini{position:absolute;right:14px;bottom:14px;width:168px;height:108px;border:1px solid var(--border);border-radius:8px;background:#fff;z-index:5;overflow:hidden}
  .opt{display:flex;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;cursor:pointer;align-items:flex-start;width:100%;text-align:left}.opt:hover{background:var(--muted)}.opt.on{border-color:#171717;box-shadow:0 0 0 1px #171717 inset}
  .gv-seg{display:inline-flex;border:1px solid var(--border);border-radius:8px;overflow:hidden}.gv-seg button{padding:5px 11px;font-size:12.5px;color:var(--muted-foreground);border-right:1px solid var(--border)}.gv-seg button:last-child{border:0}.gv-seg button.on{background:#171717;color:#fff}
  .gv-two{grid-template-columns:minmax(0,1fr) 340px;align-items:start}@media(max-width:1100px){.gv-two{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  const U = () => (DM.ui.wf = DM.ui.wf || { view: {}, hist: {}, dirty: {}, run: false });
  const wfs = () => DM.S.workflows || (DM.S.workflows = []);
  const TYPE = { trigger: ['Trigger', 'zap'], decision: ['Decision', 'filter'], action: ['Action', 'send'], delay: ['Delay', 'clock'], end: ['End', 'flag'] };
  const LIB = {
    decision: [['Order value above ₹…', 'Branch on order total'], ['Match confidence below floor', 'Uses the escalation policy'], ['Party is over credit limit', 'Compare outstanding to credit limit'], ['Product in category', 'Match a catalogue category'], ['Status is Confirmed', 'Compare any two fields']],
    action: [['Send WhatsApp message', 'Reply on the same channel'], ['Create draft order', 'Turn parsed lines into a draft'], ['Assign to a human', 'Hand the case to a teammate'], ['Request approval', 'Ask an approver before continuing'], ['Push order to ERP', 'Post the order to Tally / Coral ERP'], ['Add row to Google Sheet', 'Append to a connected sheet'], ['Send email', 'Email the party or an internal team'], ['Create quote', 'Build a quote from RFQ lines']],
    delay: [['Wait 30 minutes', 'Pause the run'], ['Wait 1 day', 'Pause the run'], ['Wait until 9:00 AM', 'Pause until the next morning']],
    trigger: [['New WhatsApp message', 'A customer messages any connected channel'], ['RFQ status changed', 'An RFQ moves to a new status'], ['Order status changed', 'An order moves to a new status'], ['Draft order status changed', 'Anuma drafts or updates an order'], ['Schedule', 'Every day at a set time'], ['Stock below threshold', 'A product falls under its reorder level']],
  };
  const NW = 200, NH = 72, DX = 280, DY = 120;
  const dmy = (d) => { const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : '—'; };
  const today = () => new Date().toISOString().slice(0, 10);

  /* ── model: normalise any seed shape into Trigger → Decision → Action → End ── */
  function layout(w) {
    const root = w.nodes.find((n) => n.type === 'trigger') || w.nodes[0]; if (!root) return;
    const out = (id) => w.edges.filter((e) => e.from === id).map((e) => e.to);
    const depth = { [root.id]: 0 }; const q = [root.id]; let guard = 0;
    while (q.length && guard++ < 800) { const id = q.shift(); out(id).forEach((t) => { if (depth[t] == null || depth[t] < depth[id] + 1) { depth[t] = depth[id] + 1; q.push(t); } }); }
    let row = 0; const ypos = {}; const seen = new Set();
    const place = (id) => { if (seen.has(id)) return ypos[id]; seen.add(id); const ys = []; out(id).forEach((k) => { ys.push(seen.has(k) ? ypos[k] : place(k)); }); ypos[id] = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : row++; return ypos[id]; };
    place(root.id); w.nodes.forEach((n) => { if (!seen.has(n.id)) { depth[n.id] = 0; place(n.id); } });
    w.nodes.forEach((n) => { n.x = (depth[n.id] || 0) * DX; n.y = (ypos[n.id] || 0) * DY; });
  }
  function ensure(w) {
    if (w._g) return w;
    w.nodes = (w.nodes || []).map((n) => Object.assign({}, n, { type: n.type === 'condition' ? 'decision' : n.type }));
    w.edges = (w.edges || []).map((e) => Object.assign({}, e, { label: e.label === 'Yes' ? 'TRUE' : e.label === 'No' ? 'FALSE' : e.label }));
    if (!w.nodes.length) w.nodes = [{ id: 'n1', type: 'trigger', label: w.trigger || 'New WhatsApp message' }];
    w.nodes.forEach((n) => { if (n.type === 'decision' && !n.detail) n.detail = '1 condition in 1 group'; });
    const addEnd = (from, label) => { const id = DM.uid('n'); w.nodes.push({ id, type: 'end', label: 'End of the workflow' }); w.edges.push({ from, to: id, label }); };
    w.nodes.filter((n) => n.type === 'decision').forEach((d) => { const o = w.edges.filter((e) => e.from === d.id); if (o.length === 1) { if (!o[0].label) o[0].label = 'TRUE'; addEnd(d.id, 'FALSE'); } else o.forEach((e, i) => { if (!e.label) e.label = i === 0 ? 'TRUE' : 'FALSE'; }); });
    w.nodes.filter((n) => n.type !== 'end' && n.type !== 'decision' && !w.edges.some((e) => e.from === n.id)).forEach((l) => addEnd(l.id));
    w.version = w.version || 1; w.updated = w.updated || today();
    w.versions = w.versions || Array.from({ length: w.version }, (_, i) => ({ v: w.version - i, at: w.updated, by: i === 0 ? 'Rohan Mehta' : 'Neil Batavia' }));
    layout(w); w._g = true; return w;
  }
  const stats = (w) => {
    const root = w.nodes.find((n) => n.type === 'trigger') || w.nodes[0]; const m = {}; if (!root) return m;
    const total = root.count != null ? root.count : (w.runs || 0); m[root.id] = { count: total, pct: 100 }; const q = [root.id]; let g = 0;
    while (q.length && g++ < 400) { const id = q.shift(); const o = w.edges.filter((e) => e.from === id); o.forEach((e, i) => { const t = DM.by(w.nodes, e.to); if (!t || m[t.id]) return; const share = t.count != null ? null : o.length === 1 ? 1 : e.label === 'FALSE' ? 0.29 : o.length === 2 ? 0.71 : 1 / o.length; const c = t.count != null ? t.count : Math.round(m[id].count * share); m[t.id] = { count: c, pct: t.pct != null ? t.pct : total ? Math.round((c / total) * 100) : 0 }; q.push(t.id); }); }
    return m;
  };
  const snap = (w) => JSON.stringify({ nodes: w.nodes, edges: w.edges });
  const hist = (w) => (U().hist[w.id] = U().hist[w.id] || { past: [], future: [] });
  function commit(w, before) { const h = hist(w); h.past.push(before); h.future = []; U().dirty[w.id] = true; }

  /* ── list ── */
  const badgeOf = (w) => (w.status === 'active' ? '<span class="badge green">Live</span>' : w.status === 'paused' ? '<span class="badge amber">Paused</span>' : '<span class="badge">Draft</span>');
  DM.page('/workflows', { title: 'Workflows', render() {
    const list = wfs();
    return `<div class="page narrow">${DM.header('Workflows', 'Automations that start from an event and run step by step: decide, wait, message, approve.', DM.btn('New workflow', 'wf-new', { icon: 'plus' }))}
      ${list.length ? '<div class="stagger">' + list.map((w) => `<div class="card wfrow" data-rid="${esc(w.id)}" data-go="/workflows/${esc(w.id)}"><div class="grow" style="min-width:0"><div class="b trunc" style="font-size:13.5px">${esc(w.name)}</div><div class="xs muted">v${w.version || 1} · updated ${dmy(w.updated || w.lastRun)}</div></div>${badgeOf(w)}<button class="btn ghost icon sm" data-act="wf-del" data-arg="${esc(w.id)}" title="Delete">${I('trash')}</button></div>`).join('') + '</div>' : DM.empty('workflow', 'No workflows yet', 'Create one to automate what happens when an order, RFQ or message arrives.')}</div>`;
  } });
  DM.act('wf-del', (el, ev) => { ev.stopPropagation(); const w = DM.by(wfs(), el.dataset.arg); DM.confirm('Delete workflow?', `<b>${esc(w.name)}</b> will be removed.`, () => { DM.S.workflows = wfs().filter((x) => x.id !== w.id); DM.toast('Workflow deleted'); DM.go('/workflows'); }, 'Delete'); });
  DM.act('wf-new', () => DM.modal({ title: 'New workflow', body: `<div class="col gap12">${DM.field('Name', 'name', { ph: 'Escalate big orders' })}<div class="field"><label>Starts when</label><select class="select" name="trigger">${LIB.trigger.map((t) => `<option>${esc(t[0])}</option>`).join('')}</select></div></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create & open', run: (m) => { const f = DM.formData(m); if (!f.name.trim()) return false; const w = { id: DM.uid('wf'), name: f.name.trim(), status: 'draft', version: 1, updated: today(), trigger: f.trigger, runs: 0, lastRun: null, nodes: [{ id: 'n1', type: 'trigger', label: f.trigger }], edges: [] }; wfs().push(w); ensure(w); DM.go('/workflows/' + w.id); } }] }));

  /* ── builder ── */
  const bez = (a, b, t) => { const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, dx = Math.max(40, Math.abs(x2 - x1) / 2); const p = [[x1, y1], [x1 + dx, y1], [x2 - dx, y2], [x2, y2]]; const u = 1 - t; return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1], `M${x1} ${y1} C${x1 + dx} ${y1},${x2 - dx} ${y2},${x2} ${y2}`]; };
  function edgesHtml(w) {
    let svg = '', over = '';
    w.edges.forEach((e, i) => { const a = DM.by(w.nodes, e.from), b = DM.by(w.nodes, e.to); if (!a || !b) return; const m = bez(a, b, 0.5); svg += `<path class="wf-e ${w.status === 'active' ? 'live' : ''}" data-ei="${i}" d="${m[2]}" fill="none" stroke="#a3a3a3" stroke-width="1.4" stroke-dasharray="4 4"/>`; over += `<div class="wf-plus" data-act="wf-insert" data-arg="${i}" style="left:${m[0]}px;top:${m[1]}px" title="Add a step here">${I('plus')}</div>`; if (e.label) { const l = bez(a, b, 0.22); over += `<div class="wf-lab ${e.label === 'TRUE' ? 't' : 'f'}" style="left:${l[0]}px;top:${l[1]}px">${esc(e.label)}</div>`; } });
    return `<svg width="1" height="1">${svg}</svg>${over}`;
  }
  const nodeHtml = (n, S) => { const T = TYPE[n.type] || TYPE.action; const c = S[n.id]; return `<div class="wf-node" data-nid="${esc(n.id)}" style="left:${n.x}px;top:${n.y}px"><div class="h"><span class="ti ${esc(n.type)}">${I(T[1])}</span><span class="tl">${T[0]}</span>${c ? `<span class="cn">${I('users')}${c.count} (${c.pct}%)</span>` : ''}</div><div class="b1">${esc(n.label)}</div>${n.detail && n.detail !== n.label && n.type !== 'end' && n.type !== 'trigger' ? `<div class="b2">${esc(n.detail)}</div>` : ''}${n.source ? `<div class="b2">Source: ${esc(n.source)}</div>` : ''}</div>`; };
  const bbox = (w) => { const xs = w.nodes.map((n) => n.x), ys = w.nodes.map((n) => n.y); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs) + NW, y1: Math.max(...ys) + NH }; };
  function miniHtml(w, v, cw, ch) {
    const b = bbox(w); const pw = 168, ph = 108, pad = 120; const W = b.x1 - b.x0 + pad * 2, H = b.y1 - b.y0 + pad * 2; const sc = Math.min(pw / W, ph / H);
    const col = { trigger: '#171717', decision: '#f4b23e', action: '#13a269', delay: '#7c3aed', end: '#e03a3a' };
    const ox = (pw - W * sc) / 2 - (b.x0 - pad) * sc, oy = (ph - H * sc) / 2 - (b.y0 - pad) * sc;
    const vx = -v.x / v.k, vy = -v.y / v.k, vw = cw / v.k, vh = ch / v.k;
    return `<svg width="${pw}" height="${ph}">${w.nodes.map((n) => `<rect x="${n.x * sc + ox}" y="${n.y * sc + oy}" width="${NW * sc}" height="${NH * sc * 0.7}" rx="2" fill="${col[n.type] || '#999'}"/>`).join('')}<rect x="${vx * sc + ox}" y="${vy * sc + oy}" width="${vw * sc}" height="${vh * sc}" fill="rgba(0,0,0,.04)" stroke="#a3a3a3" stroke-width="1"/></svg>`;
  }
  const curW = () => DM.by(wfs(), DM.path().split('/')[2]);
  const banner = (w) => (U().dirty[w.id] ? `Unsaved changes. ${w.status === 'active' ? `Your first save becomes a draft and the live v${w.version} stays as it is.` : 'Save a draft or publish to make them live.'}` : w.hasDraft ? `Draft saved on top of v${w.version}. Publish to replace the live version.` : w.status === 'active' ? 'In use. Change anything: your first save becomes a draft and the live version stays as it is.' : 'Not live yet. Publish when you are ready.');
  DM.page('/workflows/:id', { title: 'Workflow', crumb: (p) => (DM.by(wfs(), p.id) || {}).name || 'Workflow', render({ params }) {
    const w = DM.by(wfs(), params.id); if (!w) return `<div class="page"><div class="empty"><h3>Workflow not found</h3><p style="margin-top:10px"><a class="btn outline" href="#/workflows">Back to workflows</a></p></div></div>`;
    ensure(w); const h = hist(w); const dirty = U().dirty[w.id]; const S = stats(w);
    return `<div class="wfpage"><div class="wf-top"><a class="btn ghost icon sm" href="#/workflows" title="Back">${I('arrowL')}</a><span class="nm">${esc(w.name)}</span>${badgeOf(w)}<span class="badge outline ${U().popV === w.id ? 'popin' : ''}">v${w.version}</span><span class="sm muted trunc">Triggered by ${esc((w.nodes.find((n) => n.type === 'trigger') || {}).label || w.trigger || '—')}</span>
      <div class="row gap4 right"><button class="btn ghost icon sm" data-act="wf-undo" ${h.past.length ? '' : 'disabled'} title="Undo">${I('rotate')}</button><button class="btn ghost icon sm" data-act="wf-redo" ${h.future.length ? '' : 'disabled'} title="Redo" style="transform:scaleX(-1)">${I('rotate')}</button><button class="btn ghost icon sm" data-act="wf-history" title="Version history">${I('history')}</button><button class="btn ghost icon sm" data-act="wf-run" data-arg="${esc(w.id)}" title="Test run">${I('wand')}</button><button class="btn ghost icon sm" data-act="wf-more" data-arg="${esc(w.id)}" title="More">${I('more')}</button>
      <button class="btn outline sm" data-act="wf-save" data-arg="${esc(w.id)}" ${dirty ? '' : 'disabled'}>${I('download')} Save draft</button><button class="btn sm" data-act="wf-publish" data-arg="${esc(w.id)}" ${dirty || w.hasDraft || w.status !== 'active' ? '' : 'disabled'}>${I('rocket')} Publish</button></div></div>
      <div class="wf-banner" id="wf-banner">${esc(banner(w))}</div>
      <div class="wf-canvas" id="wf-canvas"><div class="wf-vp" id="wf-vp"><div id="wf-edges">${edgesHtml(w)}</div>${w.nodes.map((n) => nodeHtml(n, S)).join('')}</div>
        <div class="wf-zoom"><button data-act="wf-zoom" data-arg="in" title="Zoom in">${I('plus')}</button><button data-act="wf-zoom" data-arg="out" title="Zoom out"><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button><button data-act="wf-zoom" data-arg="fit" title="Fit view">${I('grid')}</button></div><div class="wf-mini" id="wf-mini"></div></div></div>`;
  }, after(view, { params }) {
    const w = DM.by(wfs(), params.id); if (!w) return; const cv = view.querySelector('#wf-canvas'), vp = view.querySelector('#wf-vp'); if (!cv) return;
    const u = U(); let v = u.view[w.id];
    const fit = () => { const b = bbox(w); const cw = cv.clientWidth, ch = cv.clientHeight; const k = Math.min(1, (cw - 120) / (b.x1 - b.x0), (ch - 140) / (b.y1 - b.y0)); return { k, x: (cw - (b.x1 - b.x0) * k) / 2 - b.x0 * k, y: (ch - (b.y1 - b.y0) * k) / 2 - b.y0 * k }; };
    if (!v) v = u.view[w.id] = fit();
    const apply = () => { vp.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`; const mini = view.querySelector('#wf-mini'); if (mini) mini.innerHTML = miniHtml(w, v, cv.clientWidth, cv.clientHeight); };
    if (u.popV === w.id) setTimeout(() => { u.popV = null; }, 600);
    apply(); window.__wfView = { fit: () => { v = u.view[w.id] = fit(); apply(); }, zoom: (f) => { const cx = cv.clientWidth / 2, cy = cv.clientHeight / 2; const nk = Math.max(0.3, Math.min(2, v.k * f)); v.x = cx - (cx - v.x) * (nk / v.k); v.y = cy - (cy - v.y) * (nk / v.k); v.k = nk; apply(); } };
    cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); const cx = e.clientX - r.left, cy = e.clientY - r.top; const nk = Math.max(0.3, Math.min(2, v.k * (e.deltaY < 0 ? 1.1 : 0.9))); v.x = cx - (cx - v.x) * (nk / v.k); v.y = cy - (cy - v.y) * (nk / v.k); v.k = nk; apply(); }, { passive: false });
    cv.addEventListener('mousedown', (e) => {
      if (e.target.closest('.wf-zoom,.wf-mini,.wf-plus')) return; const node = e.target.closest('.wf-node');
      if (node) {
        const n = DM.by(w.nodes, node.dataset.nid); const sx = e.clientX, sy = e.clientY, ox = n.x, oy = n.y; let moved = false; const before = snap(w);
        const mv = (ev) => { const dx = (ev.clientX - sx) / v.k, dy = (ev.clientY - sy) / v.k; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; if (!moved) return; n.x = ox + dx; n.y = oy + dy; node.style.left = n.x + 'px'; node.style.top = n.y + 'px'; view.querySelector('#wf-edges').innerHTML = edgesHtml(w); apply(); };
        const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); if (moved) { commit(w, before); DM.render(); } else editNode(w, n.id); };
        document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); e.preventDefault(); return;
      }
      const sx = e.clientX, sy = e.clientY, ox = v.x, oy = v.y; cv.classList.add('panning');
      const mv = (ev) => { v.x = ox + ev.clientX - sx; v.y = oy + ev.clientY - sy; apply(); };
      const up = () => { cv.classList.remove('panning'); document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); e.preventDefault();
    });
  } });
  DM.act('wf-zoom', (el) => { const z = window.__wfView; if (!z) return; el.dataset.arg === 'fit' ? z.fit() : z.zoom(el.dataset.arg === 'in' ? 1.2 : 1 / 1.2); });

  function editNode(w, id) {
    const n = DM.by(w.nodes, id); const T = TYPE[n.type];
    const apps = (DM.S.apps || []).filter((a) => a.state === 'connected').map((a) => a.name);
    const body = n.type === 'end' ? `<p class="sm muted">This step ends the workflow. Nothing runs after it.</p>` : `<div class="col gap12">${DM.field(n.type === 'decision' ? 'Condition' : 'What it does', 'label', { value: n.label })}${n.type === 'decision' ? '' : DM.field('Notes', 'detail', { value: n.detail && n.detail !== n.label ? n.detail : '', area: true, rows: 2 })}${n.type === 'action' ? `<div class="field"><label>Source</label><select class="select" name="source"><option value="">Anuma</option>${apps.map((a) => `<option ${n.source === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}${n.source && !apps.includes(n.source) ? `<option selected>${esc(n.source)}</option>` : ''}</select></div>` : ''}</div>`;
    const acts = [{ label: 'Close', cls: 'outline' }];
    if (n.type !== 'trigger') acts.push({ label: 'Delete step', cls: 'outline', run: () => { const before = snap(w); const ins = w.edges.filter((e) => e.to === id), outs = w.edges.filter((e) => e.from === id); w.edges = w.edges.filter((e) => e.from !== id && e.to !== id); if (ins.length === 1 && outs.length === 1) w.edges.push({ from: ins[0].from, to: outs[0].to, label: ins[0].label }); w.nodes = w.nodes.filter((x) => x.id !== id); layout(w); commit(w, before); DM.toast('Step deleted'); DM.render(); } });
    if (n.type !== 'end') acts.push({ label: 'Save', run: (m) => { const f = DM.formData(m); if (f.label !== undefined && f.label.trim()) { const before = snap(w); n.label = f.label.trim(); if (f.detail !== undefined) n.detail = f.detail; if (f.source !== undefined) n.source = f.source || undefined; if (n.type === 'trigger') w.trigger = n.label; commit(w, before); DM.render(); } } });
    DM.modal({ title: `${T[0]} step`, body, actions: acts });
  }
  DM.act('wf-insert', (el) => {
    const w = curW(); const e = w.edges[+el.dataset.arg]; if (!e) return; let type = 'action', pick = null;
    const draw = (m) => { m.querySelector('.modal-b').innerHTML = `<div class="pills" style="margin-bottom:12px">${['decision', 'action', 'delay'].map((k) => `<button class="pill ${k === type ? 'on' : ''}" data-t="${k}">${TYPE[k][0]}</button>`).join('')}</div><div class="col" style="gap:8px">${LIB[type].map((o, i) => `<button class="opt ${pick === i ? 'on' : ''}" data-o="${i}">${I(TYPE[type][1])}<div><div class="b sm">${esc(o[0])}</div><div class="xs muted">${esc(o[1])}</div></div></button>`).join('')}</div>`; };
    DM.modal({ title: 'Add a step', body: '', actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add step', run: () => {
      if (pick == null) { DM.toast('Pick a step first', 'alert'); return false; }
      const o = LIB[type][pick]; const before = snap(w); const id = DM.uid('n'); const n = { id, type, label: o[0], detail: type === 'decision' ? '1 condition in 1 group' : o[1] };
      if (type === 'action' && /ERP|Tally|Coral/.test(o[0])) n.source = (DM.S.apps || []).find((a) => a.state === 'connected' && /tally|coral/i.test(a.slug + a.name));
      if (n.source) n.source = n.source.name;
      w.nodes.push(n); const to = e.to; e.to = id;
      if (type === 'decision') { w.edges.push({ from: id, to, label: 'TRUE' }); const en = DM.uid('n'); w.nodes.push({ id: en, type: 'end', label: 'End of the workflow' }); w.edges.push({ from: id, to: en, label: 'FALSE' }); } else w.edges.push({ from: id, to, label: undefined });
      layout(w); commit(w, before); DM.toast('Step added'); DM.render();
    } }], onMount: (m) => { draw(m); m.addEventListener('click', (ev) => { const t = ev.target.closest('[data-t]'), o = ev.target.closest('[data-o]'); if (t) { type = t.dataset.t; pick = null; draw(m); } else if (o) { pick = +o.dataset.o; draw(m); } }); } });
  });
  const restore = (w, json) => { const d = JSON.parse(json); w.nodes = d.nodes; w.edges = d.edges; };
  DM.act('wf-undo', () => { const w = curW(), h = hist(w); if (!h.past.length) return; h.future.push(snap(w)); restore(w, h.past.pop()); U().dirty[w.id] = h.past.length > 0 || U().dirty[w.id]; DM.render(); });
  DM.act('wf-redo', () => { const w = curW(), h = hist(w); if (!h.future.length) return; h.past.push(snap(w)); restore(w, h.future.pop()); U().dirty[w.id] = true; DM.render(); });
  DM.act('wf-save', (el) => { const w = DM.by(wfs(), el.dataset.arg); if (el.dataset.busy) return; el.dataset.busy = 1; el.innerHTML = '<span class="spin"></span> Saving…'; setTimeout(() => { U().dirty[w.id] = false; w.hasDraft = true; DM.toast('Draft saved'); DM.render(); }, 550); });
  DM.act('wf-publish', (el) => { const w = DM.by(wfs(), el.dataset.arg); if (el.dataset.busy) return; el.dataset.busy = 1; el.disabled = true; el.innerHTML = '<span class="spin"></span> Publishing…'; const bn = document.getElementById('wf-banner'); if (bn) bn.textContent = 'Validating steps and publishing…'; setTimeout(() => { w.version = (w.version || 1) + 1; w.status = 'active'; w.updated = today(); w.hasDraft = false; U().dirty[w.id] = false; (w.versions = w.versions || []).unshift({ v: w.version, at: w.updated, by: 'Rohan Mehta' }); U().hist[w.id] = { past: [], future: [] }; U().popV = w.id; DM.toast(`Published v${w.version}`, 'check'); DM.render(); }, 1000); });
  DM.act('wf-history', () => { const w = curW(); DM.modal({ title: 'Version history', body: `<div class="col" style="gap:8px">${(w.versions || []).map((x, i) => `<div class="row card" style="padding:10px 12px"><span class="badge outline">v${x.v}</span><div class="grow sm">${i === 0 && w.status === 'active' ? 'Live version' : 'Earlier version'}<div class="xs muted row gap4" style="margin-top:2px">${DM.avatar(x.by, 'sm')}${dmy(x.at)} · ${esc(x.by)}</div></div>${i === 0 && w.status === 'active' ? '<span class="badge green">Live</span>' : `<button class="btn outline sm" data-act="wf-restore" data-arg="${x.v}">Restore as draft</button>`}</div>`).join('')}</div>`, actions: [{ label: 'Close', cls: 'outline' }] }); });
  DM.act('wf-restore', (el) => { const w = curW(); const before = snap(w); layout(w); commit(w, before); DM.closeModal(); DM.toast(`Restored v${el.dataset.arg} as a draft`); DM.render(); });
  DM.act('wf-more', (el) => { const w = DM.by(wfs(), el.dataset.arg); DM.menu(el, [
    { label: 'Rename', icon: 'edit', run: () => DM.modal({ title: 'Rename workflow', body: DM.field('Name', 'name', { value: w.name }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (m) => { const n = DM.formData(m).name.trim(); if (!n) return false; w.name = n; DM.render(); } }] }) },
    { label: 'Tidy up layout', icon: 'grid', run: () => { const before = snap(w); layout(w); commit(w, before); delete U().view[w.id]; DM.render(); } },
    { label: w.status === 'paused' ? 'Resume' : 'Pause', icon: w.status === 'paused' ? 'play' : 'pause', run: () => { w.status = w.status === 'paused' ? 'active' : 'paused'; DM.toast(w.status === 'paused' ? 'Workflow paused' : 'Workflow resumed'); DM.render(); } },
    { label: 'Duplicate', icon: 'copy', run: () => { const c = DM.clone(w); c.id = DM.uid('wf'); c.name += ' (copy)'; c.status = 'draft'; c.version = 1; c.runs = 0; c.lastRun = null; c.versions = null; c.hasDraft = false; delete c._g; wfs().push(c); DM.toast('Duplicated'); DM.go('/workflows/' + c.id); } },
    { label: 'Delete', icon: 'trash', run: () => DM.confirm('Delete workflow?', `<b>${esc(w.name)}</b> will be removed.`, () => { DM.S.workflows = wfs().filter((x) => x.id !== w.id); DM.toast('Workflow deleted'); DM.go('/workflows'); }, 'Delete') }]); });
  DM.act('wf-run', (el) => {
    const w = DM.by(wfs(), el.dataset.arg); const u = U(); if (u.run) return; u.run = true;
    const order = []; const seen = new Set(); const q = [(w.nodes.find((n) => n.type === 'trigger') || w.nodes[0]).id];
    while (q.length) { const id = q.shift(); if (seen.has(id)) continue; seen.add(id); order.push(id); w.edges.filter((e) => e.from === id).forEach((e) => q.push(e.to)); }
    const S0 = stats(w); const svg = document.querySelector('#wf-edges > svg'); const runBtn = el; runBtn.classList.add('on'); runBtn.innerHTML = '<span class="spin"></span>';
    document.querySelectorAll('.wf-node').forEach((n) => n.classList.remove('ok', 'run')); DM.toast('Test run started', 'play');
    const STEP = 800;
    order.forEach((id, i) => setTimeout(() => {
      const prev = document.querySelector(`.wf-node[data-nid="${order[i - 1]}"]`); if (prev) { prev.classList.remove('run'); prev.classList.add('ok'); }
      const from = w.edges.find((e) => e.to === id && seen.has(e.from) && order.indexOf(e.from) < i);
      if (from && svg) { const ei = w.edges.indexOf(from); const p = svg.querySelector(`path[data-ei="${ei}"]`); if (p) { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('r', '4.5'); c.setAttribute('class', 'wf-dot'); const am = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion'); am.setAttribute('dur', (STEP * 0.7) / 1000 + 's'); am.setAttribute('fill', 'freeze'); am.setAttribute('path', p.getAttribute('d')); c.appendChild(am); svg.appendChild(c); setTimeout(() => c.remove(), STEP); } }
      setTimeout(() => { const el2 = document.querySelector(`.wf-node[data-nid="${id}"]`); if (el2) { el2.classList.add('run', 'pulse'); const cn = el2.querySelector('.cn'); if (cn) { const m = cn.textContent.match(/(\d+)\s*\((\d+)%\)/); if (m) { cn.innerHTML = I('users') + (+m[1] + 1) + ' (' + m[2] + '%)'; cn.classList.remove('tick'); void cn.offsetWidth; cn.classList.add('tick'); } } } }, from ? STEP * 0.55 : 0);
    }, i * STEP));
    setTimeout(() => { const last = document.querySelector(`.wf-node[data-nid="${order[order.length - 1]}"]`); if (last) { last.classList.remove('run'); last.classList.add('ok'); } order.forEach((id) => { const n = DM.by(w.nodes, id); if (n && S0[id]) n.count = S0[id].count + 1; }); w.runs = (w.runs || 0) + 1; w.lastRun = new Date().toISOString(); u.run = false; runBtn.classList.remove('on'); runBtn.innerHTML = I('wand'); DM.toast(`Test run passed · ${order.length} steps`, 'check'); }, order.length * STEP + 300);
  });

  /* ── governance ── */
  const GTABS = [['policy', 'Policy'], ['workflows', 'Workflows'], ['autonomy', 'Autonomy'], ['approvals', 'Approvals']];
  const gshell = (tab, sub, body) => `<div class="page narrow">${DM.header('Governance', sub)}<div class="tabs">${GTABS.map(([k, l]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#/governance/${k}">${l}${k === 'approvals' && pendingCount() ? ` <span class="badge amber">${pendingCount()}</span>` : ''}</a>`).join('')}</div>${body}</div>`;
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
    return gshell('workflows', 'Who has to sign off, in what order.', `<div class="row" style="margin-bottom:12px"><span class="sm muted">${g.chains.length} approval chains</span><div class="right">${DM.btn('New chain', 'gv-chain-new', { icon: 'plus' })}</div></div><div class="grid g2 stagger">${g.chains.map((c) => `<div class="card pad"><div class="row"><div class="b grow">${esc(c.name)}</div>${DM.switch(c.on, 'gv-chain-tog', c.id)}</div><div class="row wrap" style="margin:12px 0;gap:6px">${DM.badge('Request', 'outline')}${c.steps.map((s) => `${I('arrowR')}${DM.badge(s, 'blue')}`).join('')}${I('arrowR')}${DM.badge('Approved', 'green')}</div><div class="row"><button class="btn outline sm" data-act="gv-chain-edit" data-arg="${c.id}">${I('edit')} Edit steps</button><button class="btn ghost sm right" data-act="gv-chain-del" data-arg="${c.id}">${I('trash')}</button></div></div>`).join('')}</div><p class="sm muted" style="margin-top:14px">Looking for automations? <a class="b" href="#/workflows">Open Workflows</a>.</p>`);
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
    return gshell('autonomy', 'How far each part of Anuma may go without you.', `<div class="grid g2 stagger">${DOM.map(([k, l, ic]) => `<div class="card pad"><div class="row"><span class="ag-tile" style="width:30px;height:30px;background:var(--muted);color:#171717;border-radius:8px;display:grid;place-items:center">${I(ic)}</span><div class="b grow">${l}</div>${DM.badge(LEVELS[g.autonomy[k]], g.autonomy[k] >= 3 ? 'green' : g.autonomy[k] >= 2 ? 'blue' : '')}</div><input type="range" min="0" max="3" step="1" value="${g.autonomy[k]}" class="ag-slider" style="margin-top:14px;width:100%;accent-color:#171717" data-input="gv-auto" data-k="${k}"><div class="row xs muted" style="justify-content:space-between"><span>Observe</span><span>Suggest</span><span>Approve</span><span>Autonomous</span></div></div>`).join('')}</div>`);
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
    DM.S.logs = DM.S.logs || []; DM.S.logs.unshift({ id: DM.uid('lg'), at: new Date().toISOString(), actor: 'Rohan Mehta', action: (ok ? 'Approved ' : 'Rejected ') + (kind === 'quote' ? 'quote ' : 'draft order ') + (x.no || x.id), target: x.no || x.id, outcome: ok ? 'approved' : 'rejected', kind: 'action', channel: 'app' });
    DM.toast(ok ? 'Approved' : 'Rejected', ok ? 'check' : 'x'); DM.render();
  });
})();
