/* Workflows — list + builder canvas. Spec: docs/spec/workspace.md §2. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc;
  const st = document.createElement('style'); st.dataset.for = 'workflows';
  st.textContent = `
  .wf-h{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.wf-h h1{font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:28px}.wf-h p{font-size:12px;color:#737373;margin-top:2px}.wf-h .acts{margin-left:auto}
  .wfrow{display:flex;align-items:center;gap:12px;height:64px;border:1px solid var(--border);border-radius:10px;padding:0 12px 0 16px;margin-bottom:8px;background:#fff;cursor:pointer;transition:box-shadow .15s,border-color .15s,transform .15s}.wfrow:hover{border-color:#cfcfcf;box-shadow:0 2px 8px rgba(0,0,0,.05);transform:translateY(-1px)}
  .wfrow b{font-size:12px;font-weight:500}.wfrow .s{font-size:12px;color:#737373}
  .wfb{height:100%;display:flex;flex-direction:column;min-height:0;background:#fff}
  .wf-top{height:48px;display:flex;align-items:center;gap:8px;padding:0 12px;border-bottom:1px solid var(--border);flex:none}
  .wf-top .nm{font-size:12px;font-weight:600;cursor:text;border-radius:6px;padding:2px 4px}.wf-top .nm:hover{background:#f5f5f5}
  .vchip{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;border:1px solid var(--border);font-size:11px;font-weight:500;background:#fff}.vchip.dirty{border-color:#f1c0bb;color:#b42318;background:#fff2f0}
  .wf-top .vs{width:1px;height:16px;background:var(--border);margin:0 4px}
  .wf-banner{padding:6px 16px;font-size:12px;color:#737373;background:#fafafa;border-bottom:1px solid var(--border);flex:none;display:flex;gap:8px;align-items:center;transition:background .2s,color .2s}.wf-banner.bad{background:#fff2f0;color:#b42318}
  .wf-main{flex:1;min-height:0;display:flex;position:relative}
  .wf-canvas{flex:1;min-width:0;position:relative;overflow:hidden;background-color:#fff;cursor:grab;touch-action:none}.wf-canvas.pan{cursor:grabbing}
  #wf-world{position:absolute;left:0;top:0;transform-origin:0 0}
  #wf-edges{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;width:1px;height:1px}
  #wf-edges path{fill:none;stroke:#b4b4b4;stroke-width:1.5;stroke-dasharray:5 5}#wf-edges path.flow{animation:wf-flow 1.2s linear infinite}#wf-edges path.lit{stroke:#2563eb;stroke-width:2}
  .wfn{position:absolute;width:210px;background:#fff;border:1px solid var(--border);border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.04);padding:8px 10px;cursor:pointer;user-select:none;transition:box-shadow .15s,border-color .15s}
  .wfn:hover{box-shadow:0 2px 8px rgba(0,0,0,.08)}.wfn.sel{border:2px solid #171717;padding:7px 9px}.wfn.bad{border-color:#e03a3a}.wfn.lit{box-shadow:0 0 0 3px rgba(37,99,235,.25);border-color:#2563eb}.wfn.ok{box-shadow:0 0 0 3px rgba(19,162,105,.22)}.wfn.fail{box-shadow:0 0 0 3px rgba(224,58,58,.25);border-color:#e03a3a}
  .wfn .h{display:flex;align-items:center;gap:6px;height:20px}.wfn .h b{font-size:12px;font-weight:600}.wfn .b{font-size:12px;margin-top:6px;line-height:1.3;color:#262626}.wfn .s{font-size:11px;color:#737373;margin-top:3px}.wfn .s b{font-weight:600;color:#262626}
  .wfn .ti{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;flex:none}.wfn .ti svg.i{width:12px;height:12px}
  .ti.t-trigger{background:#f0f0f0;color:#404040}.ti.t-decision{background:#fef3c7;color:#b45309}.ti.t-action{background:#dcfce7;color:#15803d}.ti.t-end{background:#fee2e2;color:#b91c1c}.ti.t-wait{background:#f0f0f0;color:#737373}.ti.t-approval{background:#fef3c7;color:#b45309}
  .wfn .rc{margin-left:auto;display:inline-flex;align-items:center;gap:3px;font-size:10px;color:#737373;border:1px solid var(--border);border-radius:999px;padding:0 6px;height:16px;white-space:nowrap}.wfn .rc svg.i{width:9px;height:9px}
  .wfn .warn{color:#e03a3a;margin-left:auto}.wfn .warn svg.i{width:13px;height:13px}
  .wf-plus{position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;border:1px solid #cfcfcf;display:grid;place-items:center;cursor:pointer;transform:translate(-50%,-50%);transition:background .12s,transform .12s,border-color .12s;z-index:2}.wf-plus:hover{background:#171717;color:#fff;border-color:#171717;transform:translate(-50%,-50%) scale(1.15)}.wf-plus svg.i{width:12px;height:12px}
  .wf-br{position:absolute;transform:translate(-50%,-50%);font-size:10px;font-weight:600;padding:1px 7px;border-radius:999px;z-index:1}.wf-br.t{background:#eefbe8;color:#0b7a4e;border:1px solid #c6ecb6}.wf-br.f{background:#fff2f0;color:#b42318;border:1px solid #f4c7c1}
  .wf-zoom{position:absolute;left:16px;bottom:16px;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:8px;background:#fff;overflow:hidden;z-index:5}.wf-zoom button{width:28px;height:28px;display:grid;place-items:center;border-top:1px solid var(--border)}.wf-zoom button:first-child{border-top:0}.wf-zoom button:hover{background:#f5f5f5}
  .wf-mini{position:absolute;right:16px;bottom:16px;width:180px;height:130px;background:#fff;border:1px solid var(--border);border-radius:8px;z-index:5;overflow:hidden;transition:right .2s}.wf-mini .vp{position:absolute;border:1.5px solid #2563eb;background:rgba(37,99,235,.07);border-radius:2px}
  .wf-mini i{position:absolute;height:5px;border-radius:2px}
  .wf-panel{width:384px;border-left:1px solid var(--border);display:flex;flex-direction:column;flex:none;background:#fff;animation:slide-r .2s both;min-height:0}
  .wf-ph{padding:16px 16px 8px;display:flex;gap:8px;align-items:flex-start}.wf-ph .t{font-size:14px;font-weight:600}.wf-ph .d{font-size:12px;color:#737373;margin-top:2px}
  .wf-pb{padding:0 16px 16px;overflow:auto;flex:1;display:flex;flex-direction:column;gap:12px}
  .wf-c{border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px}.wf-c .k{color:#737373;font-size:11px}.wf-c .v{font-size:12px;font-weight:600;margin:2px 0}.wf-c p{color:#525252;line-height:1.45}
  .wf-f{display:flex;flex-direction:column;gap:4px}.wf-f label{font-size:12px;font-weight:500}.wf-f .hp{font-size:11px;color:#737373}
  .wf-sel{display:flex;align-items:center;justify-content:space-between;gap:6px;height:28px;border:1px solid var(--input);border-radius:8px;padding:0 8px;font-size:12px;background:#fff;text-align:left;width:100%}.wf-sel:hover{background:#fafafa}.wf-sel svg.i{width:12px;height:12px;color:#737373}
  .wf-json{background:#f5f5f5;border-radius:8px;padding:10px;font-family:ui-monospace,Menlo,monospace;font-size:11px;white-space:pre-wrap;line-height:1.5;word-break:break-all}
  .runcard{border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:8px}.runcard:hover{background:#fafafa}
  .rpill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;font-size:11px;font-weight:500}.rpill.ok{background:#eefbe8;color:#0b7a4e}.rpill.bad{background:#fff2f0;color:#b42318}
  .stepcard{border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;font-size:12px}
  .addrow{display:flex;align-items:flex-start;gap:10px;padding:8px;border-radius:8px;width:100%;text-align:left;cursor:pointer}.addrow:hover{background:#f5f5f5}.addrow .n{font-size:12px;font-weight:500}.addrow .d{font-size:11px;color:#737373;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
  .addgrp{font-size:11px;color:#737373;padding:10px 8px 2px;font-weight:500}
  .wf-pulse{position:absolute;width:9px;height:9px;border-radius:50%;background:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.25);transform:translate(-50%,-50%);z-index:3;pointer-events:none}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.wf = DM.ui.wf || { work: {}, view: {}, sel: null, run: null, hl: {} });
  const S = () => DM.S; const list = () => S().workflows || (S().workflows = []);
  const byId = (id) => list().find((w) => w.id === id);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const NOW = () => DM.now().toISOString();

  /* ───────── catalogues ───────── */
  const TRIGGERS = {
    draft_order_status: { group: 'Orders', name: 'Draft order status changed', desc: 'An AI-parsed draft order moved to a new status.', kind: 'draft_order', ucs: ['newhome', 'stuffcool'] },
    rfq_status: { group: 'RFQs', name: 'RFQ status changed', desc: 'An RFQ moved to a new status.', kind: 'rfq', ucs: ['rfq'] },
    schedule: { group: 'Schedule', name: 'At a set time', desc: 'Runs daily, weekly or monthly at an exact time in the timezone you choose (IST by default).', kind: 'schedule', ucs: ['newhome', 'stuffcool', 'rfq'] },
  };
  const ACTIONS = {
    sheet_append: { group: 'Orders', name: 'Add confirmed draft orders to a spreadsheet', desc: 'Append confirmed draft orders to a spreadsheet tab, one row per line. Each row carries an id, and rows already in the sheet are skipped, so running it twice never duplicates anything.', works: 'draft_order', icon: 'sheet', ucs: ['newhome', 'stuffcool'], returns: ['Outcome', 'Rows added'] },
    stock_sheet: { group: 'Products & Inventory', name: 'Update stock from a spreadsheet', desc: 'Read part numbers and quantities from spreadsheet tabs and set stock, one location per tab. Stops before changing anything if the sheet looks broken, out of date or wrong.', works: 'any', icon: 'package', ucs: ['newhome', 'stuffcool', 'rfq'], returns: ['Outcome', 'Reason', 'Variants updated'] },
    http: { group: 'Webhooks & API', name: 'Send an HTTP request', desc: 'Call a webhook or API. Values can use {{variables}} from the trigger, the subject and earlier steps.', works: 'any', icon: 'globe', ucs: ['newhome', 'stuffcool', 'rfq'], returns: ['Status code', 'Succeeded (2xx)', 'Response body'] },
    coral_push: { group: 'Coral ERP', name: 'Push draft order to Coral ERP', src: 'Coral ERP', desc: 'Create the matching sales order in Coral. Safe to repeat: Coral ignores a second push of the same draft.', works: 'draft_order', icon: 'chat', ucs: ['newhome'], returns: ['Outcome', 'Reason', 'Coral sales order id'] },
    tally_voucher: { group: 'Tally', name: 'Post sales voucher to Tally', src: 'Tally', desc: 'Create the matching sales voucher in Tally. Safe to repeat: Tally rejects a second voucher with the same number.', works: 'draft_order', icon: 'chat', ucs: ['stuffcool'], returns: ['Outcome', 'Reason', 'Tally voucher number'] },
    sap_send: { group: 'SAP', name: 'Send RFQ to SAP', src: 'SAP', desc: 'Send the quoted lines of an RFQ to SAP as a sales inquiry. Safe to repeat: SAP ignores a second send of the same RFQ.', works: 'rfq', icon: 'chat', ucs: ['rfq'], returns: ['Outcome', 'Reason', 'SAP document number'] },
  };
  const FLOW = [{ id: 'decision', name: 'Decision', desc: 'Split based on conditions', icon: 'filter', type: 'decision' }, { id: 'wait', name: 'Wait', desc: 'Add a time delay', icon: 'clock', type: 'wait' }, { id: 'approval', name: 'Approval', desc: 'A person approves before continuing', icon: 'shield', type: 'approval' }];
  const TYPE_ICON = { trigger: 'zap', decision: 'filter', action: 'chat', end: 'x', wait: 'clock', approval: 'shield' };
  const ENUMS = {
    draft_order: { status: ['received', 'needs_review', 'rejected', 'awaiting_quantity', 'awaiting_confirmation', 'confirmed', 'converted'], managed_by: ['anuma', 'human'] },
    rfq: { status: ['received', 'matching', 'needs_review', 'ready', 'quoted', 'exported'], source: ['Email Attachment', 'Email Body', 'SAP', 'Custom Webhook', 'Manual'] },
  };
  const VARS = (kind) => {
    const trig = kind === 'rfq'
      ? [['status', 'Status', 'enum'], ['previous_status', 'Previous status', 'enum'], ['source', 'Source', 'enum'], ['item_count', 'Number of items', 'num'], ['created_at', 'Created at', 'text'], ['external_id', 'External id', 'text']]
      : [['status', 'Status', 'enum'], ['previous_status', 'Previous status', 'enum'], ['confidence_score', 'AI confidence', 'num'], ['is_test', 'Is a test order', 'bool'], ['managed_by', 'Handled by', 'enum'], ['item_count', 'Number of items', 'num'], ['created_at', 'Created at', 'text'], ['expires_at', 'Expires at', 'text'], ['last_activity_at', 'Last activity', 'text'], ['external_id', 'External order id', 'text'], ['error', 'Processing error', 'text']];
    const sub = [['contact.salutation', 'contact · salutation'], ['contact.first_name', 'contact · first name'], ['contact.last_name', 'contact · last name'], ['contact.email', 'contact · email'], ['contact.secondary_email', 'contact · secondary email'], ['contact.phone', 'contact · phone'], ['contact.mobile', 'contact · mobile'], ['contact.contact_type', 'contact · contact type'], ['account.name', 'account · name'], ['account.number', 'account · number'], ['account.account_type', 'account · account type'], ['account.email', 'account · email'], ['account.phone', 'account · phone'], ['account.website', 'account · website'], ['account.billing_city', 'account · billing city'], ['account.billing_state', 'account · billing state'], ['account.billing_country', 'account · billing country'], ['account.shipping_city', 'account · shipping city'], ['account.shipping_state', 'account · shipping state'], ['account.shipping_country', 'account · shipping country']].map(([k, l]) => [k, l, 'text']);
    return { Trigger: trig, Subject: sub };
  };
  const varLabel = (kind, k) => { const V = VARS(kind); for (const g of Object.values(V)) { const f = g.find((x) => x[0] === k); if (f) return f[1]; } return k; };
  const varType = (kind, k) => { const V = VARS(kind); for (const g of Object.values(V)) { const f = g.find((x) => x[0] === k); if (f) return f[2]; } return 'text'; };
  const OPS = [['equals', 'Equals'], ['does_not_equal', 'Does not equal'], ['contains', 'Contains'], ['is_one_of', 'Is one of'], ['is_not_one_of', 'Is not one of'], ['is_set', 'Is set'], ['is_not_set', 'Is not set']];
  const opLabel = (o) => (OPS.find((x) => x[0] === o) || [0, o])[1];
  const needsVal = (o) => !['is_set', 'is_not_set'].includes(o);

  /* ───────── working copy ───────── */
  const wkey = (id) => DM.uc + ':' + id;
  const work = (id) => {
    const k = wkey(id); if (U.work[k]) return U.work[k]; const w = byId(id); if (!w) return null;
    return (U.work[k] = { id, nodes: clone(w.nodes), edges: clone(w.edges), settings: clone(w.settings || {}), name: w.name, dirty: false, saved: !!w.draftSaved, undo: [], redo: [], paused: w.status === 'paused' });
  };
  const snap = (W) => { W.undo.push(JSON.stringify({ n: W.nodes, e: W.edges, name: W.name })); if (W.undo.length > 50) W.undo.shift(); W.redo = []; };
  const kindOf = (W) => { const t = W.nodes.find((n) => n.type === 'trigger'); const tr = t && t.cfg && TRIGGERS[t.cfg.trigger]; return tr ? tr.kind : (DM.uc === 'rfq' ? 'rfq' : 'draft_order'); };
  const nodeBy = (W, id) => W.nodes.find((n) => n.id === id);
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const bodyOf = (W, n) => {
    const c = n.cfg || {};
    if (n.type === 'trigger') { const t = TRIGGERS[c.trigger]; return t ? t.name : 'Choose a trigger'; }
    if (n.type === 'decision') { const g = c.groups || []; const k = g.reduce((a, x) => a + x.length, 0); return `${plural(k, 'condition')} in ${plural(g.length, 'group')}`; }
    if (n.type === 'action') { const a = ACTIONS[c.action]; return a ? a.name : 'Choose an action'; }
    if (n.type === 'wait') return c.amount ? `Wait for ${c.amount} ${Number(c.amount) === 1 ? String(c.unit || 'days').replace(/s$/, '') : c.unit || 'days'}` : 'Choose how long to wait';
    if (n.type === 'approval') return 'A person approves before continuing';
    return 'End of the workflow';
  };
  const problem = (W, n) => {
    const c = n.cfg || {};
    if (n.type === 'trigger') return !c.trigger ? 'Choose a trigger' : '';
    if (n.type === 'decision') { const bad = (c.groups || []).some((g) => !g.length || g.some((x) => !x.variable || (needsVal(x.op) && (x.value == null || x.value === '')))); return bad || !(c.groups || []).length ? 'Fill in every condition' : ''; }
    if (n.type === 'action') { if (!c.action) return 'Choose an action'; if (c.action === 'http' && !(c.url || '').trim()) return 'Add a URL'; if (c.action === 'stock_sheet' && !c.app) return 'Choose a spreadsheet app'; if (c.action === 'sheet_append' && !c.app) return 'Choose a spreadsheet app'; return ''; }
    if (n.type === 'wait') return !(Number(c.amount) > 0) ? 'Set a duration' : '';
    return '';
  };
  const problems = (W) => W.nodes.filter((n) => problem(W, n));
  const mkNode = (type, cfg) => ({ id: 'n-' + Math.random().toString(36).slice(2, 7), type, x: 0, y: 0, title: { decision: 'Decision', wait: 'Wait', approval: 'Approval', action: 'Action', end: 'End', trigger: 'Trigger' }[type], cfg: cfg || {} });
  const heightOf = (W, n) => (n.type === 'action' && ACTIONS[(n.cfg || {}).action] && ACTIONS[n.cfg.action].src ? 78 : 61);
  const outs = (W, id) => W.edges.filter((e) => e.from === id);
  const downstream = (W, id) => { const seen = new Set([id]); const q = [id]; while (q.length) { const c = q.pop(); outs(W, c).forEach((e) => { if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); } }); } return seen; };

  /* ───────── list ───────── */
  const dmy = (iso) => new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
  const arrow = (s) => esc(s).replace(/-&gt;/g, '→');
  DM.page('/workflows', { title: 'Workflows', render() {
    const L = list();
    return `<div class="page narrow"><div class="wf-h"><div><h1>Workflows</h1><p>Automations that start from an event and run step by step: decide, wait, message, approve.</p></div><div class="acts"><button class="btn" data-act="wf-new">${I('plus')} New workflow</button></div></div>
    ${L.length ? `<div class="stagger">${L.map((w) => `<div class="wfrow" data-go="/workflows/${w.id}" data-rid="${w.id}"><div class="grow" style="min-width:0"><b>${arrow(w.name)}</b><div class="s">v${w.version} · updated ${dmy(w.updatedAt)}</div></div>${DM.status(w.status === 'live' ? 'Live' : w.status === 'paused' ? 'Paused' : 'Draft', w.status === 'live' ? 'green' : 'grey')}<button class="btn ghost icon sm" data-act="wf-del" data-arg="${w.id}" title="Delete workflow">${I('trash')}</button></div>`).join('')}</div>` : DM.empty('workflow', 'No workflows yet', 'Create a workflow to automate a follow-up.')}</div>`;
  } });
  const newWorkflow = (from) => {
    const id = 'wf-' + Math.random().toString(36).slice(2, 6); const k = DM.uc === 'rfq' ? 'rfq_status' : 'draft_order_status';
    const w = from ? { ...clone(from), id, name: from.name + ' (copy)', status: 'draft', version: 0, runs: [], versions: [], updatedAt: NOW(), nodes: clone(from.nodes).map((n) => ({ ...n, runs: undefined })) }
      : { id, name: 'Untitled workflow', status: 'draft', version: 0, updatedAt: NOW(), triggerKind: 'draft_order', nodes: [{ id: 'n-trigger', type: 'trigger', x: 387, y: 508, title: 'Trigger', cfg: { trigger: k } }, { id: 'n-end', type: 'end', x: 698, y: 508, title: 'End', cfg: {} }], edges: [{ id: 'n-trigger>n-end', from: 'n-trigger', to: 'n-end' }], runs: [], settings: { cooldown: '', cooldownUnit: 'days', concurrent: false, termination: [] }, versions: [] };
    list().unshift(w); DM.toast('Workflow created'); DM.go('/workflows/' + id);
  };
  DM.act('wf-new', () => newWorkflow(null));
  DM.act('wf-del', (el) => { const w = byId(el.dataset.arg); if (!w) return; DM.dialog({ title: `Delete ${arrow(w.name)}?`, sub: 'Runs in progress are cancelled. This cannot be undone.', w: 440, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Delete', cls: 'danger', run: () => { S().workflows = list().filter((x) => x.id !== w.id); delete U.work[wkey(w.id)]; DM.toast('Workflow deleted'); DM.go('/workflows'); DM.render(); } }] }); });

  /* ───────── builder ───────── */
  let ctx = null; // live builder context {id, W, el refs}
  const V = () => (U.view[ctx.id] = U.view[ctx.id] || { x: 0, y: 0, k: 1, fit: false });
  const shell = (w, W) => `<div class="wfb" id="wfb"><div class="wf-top" id="wf-top"></div><div class="wf-banner" id="wf-banner"></div><div class="wf-main"><div class="wf-canvas" id="wf-canvas"><div id="wf-world"><svg id="wf-edges"></svg></div><div class="wf-zoom"><button data-act="wf-zin" title="Zoom in">${I('plus')}</button><button data-act="wf-zout" title="Zoom out"><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button><button data-act="wf-fit" title="Fit view">${I('layout')}</button></div><div class="wf-mini" id="wf-mini"></div></div><aside class="wf-panel" id="wf-panel" hidden></aside></div></div>`;
  DM.page('/workflows/:id', { title: 'Workflows', render({ params }) { const w = byId(params.id); if (!w) return `<div class="page narrow">${DM.empty('workflow', 'Workflow not found', 'It may have been deleted.', { action: '<button class="btn outline sm" style="margin-top:12px" data-go="/workflows">Back to workflows</button>' })}</div>`; return shell(w, work(w.id)); },
    after(root, { params }) { const w = byId(params.id); if (!w) return; if (!ctx || ctx.id !== w.id) { U.sel = null; U.hl = {}; } ctx = { id: w.id, W: work(w.id), w }; mount(); } });

  const dirtyChip = (W, w) => { const v = w.version || 0; if (W.dirty) return `<span class="vchip dirty">Draft v${v + 1} · unsaved</span>`; if (W.saved || w.status === 'draft') return `<span class="vchip">Draft v${v + 1}</span>`; return `<span class="vchip">v${v}</span>`; };
  const topbar = () => {
    const { W, w } = ctx; const tr = nodeBy(W, W.nodes.find((n) => n.type === 'trigger').id); const T = TRIGGERS[(tr.cfg || {}).trigger]; const pr = problems(W).length;
    const stt = W.paused ? DM.status('Paused', 'grey') : w.status === 'live' ? DM.status('Live', 'green') : DM.status('Draft', 'grey');
    document.getElementById('wf-top').innerHTML = `<button class="btn outline icon sm" data-go="/workflows" title="Back to workflows">${I('arrowL')}</button><span class="nm" data-act="wf-rename" title="Rename">${arrow(W.name)}</span>${stt}${dirtyChip(W, w)}<span class="muted sm" style="margin-left:4px">${T ? 'Triggered by ' + esc(T.name) : 'No trigger yet'}</span><span class="grow"></span>
      <button class="btn ghost icon sm" data-act="wf-undo" ${W.undo.length ? '' : 'disabled'} title="Undo">${I('rotate')}</button><button class="btn ghost icon sm" data-act="wf-redo" ${W.redo.length ? '' : 'disabled'} title="Redo" style="transform:scaleX(-1)">${I('rotate')}</button><span class="vs"></span>
      <button class="btn ghost sm" data-act="wf-runs">${I('history')} Runs</button><button class="btn ghost sm" data-act="wf-test">${I('wand')} Test</button><button class="btn ghost icon sm" data-act="wf-more" title="More actions">${I('more')}</button><span class="vs"></span>
      <button class="btn outline sm" data-act="wf-save" ${W.dirty ? '' : 'disabled'}>Save draft</button><button class="btn sm" data-act="wf-publish" ${W.dirty && !pr ? '' : 'disabled'} ${W.dirty && pr ? `title="Fix ${pr} thing${pr > 1 ? 's' : ''} first"` : ''}>${U.publishing ? 'Publishing…' : 'Publish'}</button>`;
    const b = document.getElementById('wf-banner'); const bad = W.dirty && pr;
    b.className = 'wf-banner' + (bad ? ' bad' : '');
    b.innerHTML = bad ? `${I('trianglealert')} ${plural(pr, 'thing')} to fix before this can be published.` : W.dirty ? 'You have unsaved changes.' : w.status === 'live' && !W.saved ? 'In use. Change anything: your first save becomes a draft and the live version stays as it is.' : W.saved ? 'This draft is saved. Publish to make it the live version.' : 'This workflow is a draft. Publish it to make it live.';
  };
  const nodeHtml = (n) => {
    const { W } = ctx; const a = ACTIONS[(n.cfg || {}).action]; const pb = problem(W, n); const hl = U.hl[n.id];
    const rc = n.runs ? `<span class="rc">${I('users')} ${n.runs.n} (${n.runs.pct}%)</span>` : '';
    return `<div class="wfn ${U.sel === n.id ? 'sel' : ''} ${W.dirty && pb ? 'bad' : ''} ${hl ? hl : ''}" data-n="${n.id}" style="left:${n.x}px;top:${n.y}px"><div class="h"><span class="ti t-${n.type}">${I(TYPE_ICON[n.type])}</span><b>${esc(n.title)}</b>${W.dirty && pb ? `<span class="warn" title="${esc(pb)}">${I('trianglealert')}</span>` : rc}</div><div class="b">${esc(bodyOf(W, n))}</div>${a && a.src ? `<div class="s">Source: <b>${esc(a.src)}</b></div>` : ''}</div>`;
  };
  const pt = (W, e) => { const a = nodeBy(W, e.from), b = nodeBy(W, e.to); return { x1: a.x + 210, y1: a.y + heightOf(W, a) / 2, x2: b.x, y2: b.y + heightOf(W, b) / 2 }; };
  const edgePath = (p) => { const dx = Math.max(40, (p.x2 - p.x1) / 2); return `M${p.x1} ${p.y1} C${p.x1 + dx} ${p.y1}, ${p.x2 - dx} ${p.y2}, ${p.x2} ${p.y2}`; };
  const bez = (p, t) => { const dx = Math.max(40, (p.x2 - p.x1) / 2); const u = 1 - t; const c1 = [p.x1 + dx, p.y1], c2 = [p.x2 - dx, p.y2]; return [u * u * u * p.x1 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p.x2, u * u * u * p.y1 + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p.y2]; };
  const drawWorld = () => {
    const { W, w } = ctx; const world = document.getElementById('wf-world'); if (!world) return; const live = w.status === 'live' && !W.paused;
    world.querySelectorAll('.wfn,.wf-plus,.wf-br').forEach((e) => e.remove());
    const svg = document.getElementById('wf-edges'); svg.innerHTML = W.edges.map((e) => `<path class="${live ? 'flow' : ''} ${U.hl['e:' + e.id] || ''}" data-e="${e.id}" d="${edgePath(pt(W, e))}"/>`).join('');
    let h = ''; W.nodes.forEach((n) => (h += nodeHtml(n)));
    W.edges.forEach((e) => { const p = pt(W, e); const m = bez(p, e.branch ? 0.66 : 0.5); h += `<button class="wf-plus" data-act="wf-add" data-arg="${e.id}" style="left:${m[0]}px;top:${m[1]}px" title="Add a step">${I('plus')}</button>`; if (e.branch) { const b = bez(p, 0.36); h += `<span class="wf-br ${e.branch === 'true' ? 't' : 'f'}" style="left:${b[0]}px;top:${b[1]}px">${e.branch === 'true' ? 'True' : 'False'}</span>`; } });
    world.insertAdjacentHTML('beforeend', h); applyView(); mini();
  };
  const applyView = () => { const v = V(); const w = document.getElementById('wf-world'); if (!w) return; w.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.k})`; const c = document.getElementById('wf-canvas'); c.style.backgroundImage = 'radial-gradient(#d4d4d4 1px, transparent 1px)'; c.style.backgroundSize = `${24 * v.k}px ${24 * v.k}px`; c.style.backgroundPosition = `${v.x}px ${v.y}px`; mini(); };
  const bbox = () => { const { W } = ctx; let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9; W.nodes.forEach((n) => { x1 = Math.min(x1, n.x); y1 = Math.min(y1, n.y); x2 = Math.max(x2, n.x + 210); y2 = Math.max(y2, n.y + heightOf(W, n)); }); return { x1, y1, x2, y2 }; };
  const fit = (anim) => { const c = document.getElementById('wf-canvas'); if (!c) return; const b = bbox(); const w = c.clientWidth, h = c.clientHeight; const k = Math.min(1, (w - 120) / (b.x2 - b.x1), (h - 160) / (b.y2 - b.y1)); const v = V(); v.k = Math.max(.3, k); v.x = (w - (b.x2 - b.x1) * v.k) / 2 - b.x1 * v.k; v.y = (h - (b.y2 - b.y1) * v.k) / 2 - b.y1 * v.k; v.fit = true; const world = document.getElementById('wf-world'); if (anim) { world.style.transition = 'transform .3s ease'; setTimeout(() => (world.style.transition = ''), 320); } applyView(); };
  const mini = () => {
    const m = document.getElementById('wf-mini'); const c = document.getElementById('wf-canvas'); if (!m || !c || !ctx) return; const { W } = ctx; const b = bbox(); const pad = 10; const sw = 180 - pad * 2, sh = 130 - pad * 2; const s = Math.min(sw / (b.x2 - b.x1), sh / (b.y2 - b.y1)); const ox = pad + (sw - (b.x2 - b.x1) * s) / 2, oy = pad + (sh - (b.y2 - b.y1) * s) / 2;
    const col = { trigger: '#171717', decision: '#f59e0b', action: '#16a34a', end: '#dc2626', wait: '#a3a3a3', approval: '#f59e0b' };
    const v = V(); const vx = (-v.x / v.k - b.x1) * s + ox, vy = (-v.y / v.k - b.y1) * s + oy, vw = (c.clientWidth / v.k) * s, vh = (c.clientHeight / v.k) * s;
    m.innerHTML = W.nodes.map((n) => `<i style="left:${(n.x - b.x1) * s + ox}px;top:${(n.y - b.y1) * s + oy}px;width:${210 * s}px;background:${col[n.type]}"></i>`).join('') + `<div class="vp" style="left:${Math.max(0, vx)}px;top:${Math.max(0, vy)}px;width:${Math.min(180, vw)}px;height:${Math.min(130, vh)}px"></div>`;
    m.style.right = document.getElementById('wf-panel') && !document.getElementById('wf-panel').hidden ? '16px' : '16px';
  };
  const redraw = (o = {}) => { topbar(); drawWorld(); if (!o.keepPanel) panel(); };
  const mount = () => {
    if (onMove) { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); onMove = onUp = null; }
    const c = document.getElementById('wf-canvas'); const v = V(); topbar(); drawWorld(); panel(); if (!v.fit) fit(false); else applyView();
    let pan = null, drag = null;
    c.addEventListener('mousedown', (e) => {
      if (e.target.closest('.wf-zoom,.wf-mini,.wf-plus')) return; const nd = e.target.closest('.wfn');
      if (nd) { const n = nodeBy(ctx.W, nd.dataset.n); drag = { n, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y, moved: false, el: nd }; }
      else { pan = { sx: e.clientX, sy: e.clientY, ox: v.x, oy: v.y }; c.classList.add('pan'); }
    });
    window.addEventListener('mousemove', onMove = (e) => {
      if (!c.isConnected) { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); return; }
      if (drag) { const dx = (e.clientX - drag.sx) / v.k, dy = (e.clientY - drag.sy) / v.k; if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return; if (!drag.moved) { snap(ctx.W); drag.moved = true; } drag.n.x = Math.round(drag.ox + dx); drag.n.y = Math.round(drag.oy + dy); drag.el.style.left = drag.n.x + 'px'; drag.el.style.top = drag.n.y + 'px'; drawEdgesOnly(); }
      else if (pan) { v.x = pan.ox + e.clientX - pan.sx; v.y = pan.oy + e.clientY - pan.sy; applyView(); }
    });
    window.addEventListener('mouseup', onUp = (e) => {
      if (!c.isConnected) { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); return; }
      if (drag) { if (drag.moved) { ctx.W.dirty = true; ctx.W.saved = false; redraw({ keepPanel: true }); } else selectNode(drag.n.id); drag = null; }
      if (pan) { if (Math.abs(e.clientX - pan.sx) + Math.abs(e.clientY - pan.sy) < 3 && !e.target.closest('.wfn')) selectNode(null); pan = null; c.classList.remove('pan'); }
    });
    c.addEventListener('wheel', (e) => { e.preventDefault(); const r = c.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top; const nk = Math.min(1.6, Math.max(.3, v.k * (e.deltaY < 0 ? 1.1 : 0.9))); v.x = px - (px - v.x) * (nk / v.k); v.y = py - (py - v.y) * (nk / v.k); v.k = nk; applyView(); }, { passive: false });
  };
  let onMove, onUp;
  const drawEdgesOnly = () => { const { W, w } = ctx; const live = w.status === 'live' && !W.paused; document.getElementById('wf-edges').innerHTML = W.edges.map((e) => `<path class="${live ? 'flow' : ''}" data-e="${e.id}" d="${edgePath(pt(W, e))}"/>`).join(''); document.querySelectorAll('.wf-plus').forEach((b) => { const e = W.edges.find((x) => x.id === b.dataset.arg); if (e) { const m = bez(pt(W, e), e.branch ? .66 : .5); b.style.left = m[0] + 'px'; b.style.top = m[1] + 'px'; } }); mini(); };
  window.addEventListener('hashchange', () => { U.hl = {}; });

  DM.act('wf-zin', () => { const v = V(); v.k = Math.min(1.6, v.k * 1.2); applyView(); }); DM.act('wf-zout', () => { const v = V(); v.k = Math.max(.3, v.k / 1.2); applyView(); }); DM.act('wf-fit', () => fit(true));
  const selectNode = (id) => { U.sel = id; document.querySelectorAll('.wfn').forEach((n) => n.classList.toggle('sel', n.dataset.n === id)); panel(); mini(); };

  /* ───────── node side panel ───────── */
  const selBtn = (label, act, arg, extra = '') => `<button class="wf-sel" data-act="${act}" data-arg="${esc(arg)}" ${extra}><span class="trunc">${esc(label)}</span>${I('chevD')}</button>`;
  const condRow = (n, gi, ci, c, kind) => {
    const t = varType(kind, c.variable); const en = (ENUMS[kind] || {})[c.variable] || (c.variable === 'previous_status' ? (ENUMS[kind] || {}).status : null);
    return `<div class="wf-c" style="display:flex;flex-direction:column;gap:8px"><div class="row"><b style="font-size:12px">Condition ${ci + 1}</b><span class="grow"></span>${(n.cfg.groups[gi].length > 1 || n.cfg.groups.length > 1) ? `<button class="btn ghost icon sm" data-act="wf-cdel" data-arg="${gi}:${ci}" title="Remove">${I('x')}</button>` : ''}</div>
      <div class="wf-f"><label>Variable</label>${selBtn(c.variable ? varLabel(kind, c.variable) : 'Choose a variable', 'wf-cvar', gi + ':' + ci)}</div>
      <div class="wf-f"><label>Condition</label>${selBtn(opLabel(c.op), 'wf-cop', gi + ':' + ci)}</div>
      ${needsVal(c.op) ? `<div class="wf-f"><label>Value</label>${en ? selBtn(c.value || 'Choose a value', 'wf-cval', gi + ':' + ci) : t === 'bool' ? selBtn(c.value === '' || c.value == null ? 'Choose a value' : String(c.value), 'wf-cval', gi + ':' + ci) : `<input class="input" data-input="wf-cvalt" data-g="${gi}" data-c="${ci}" value="${esc(c.value ?? '')}" placeholder="Value">`}</div>` : ''}</div>`;
  };
  const actionInfo = (a) => `<div class="wf-c"><div class="v" style="margin:0 0 6px">${esc(a.name)}</div><p>${esc(a.desc)}</p><p style="margin-top:8px">${a.works === 'any' ? 'Works on any trigger.' : `Works on ${a.works} triggers.`}</p><p style="margin-top:8px">Changes something outside Anuma, so it follows your approval policy for this action.</p><div class="k" style="margin-top:10px">Returns</div><ul style="margin:4px 0 0 16px;font-size:12px">${a.returns.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>`;
  const apps = () => (S().apps || []).filter((x) => x.state === 'connected' || x.connected);
  const panel = () => {
    const el = document.getElementById('wf-panel'); if (!el || !ctx) return; const { W } = ctx; const n = U.sel && nodeBy(W, U.sel);
    if (!n) { el.hidden = true; el.innerHTML = ''; mini(); return; }
    const c = n.cfg = n.cfg || {}; const kind = kindOf(W); let t = '', d = '', body = '';
    if (n.type === 'trigger') {
      t = 'Trigger'; d = 'The event that starts the workflow for a subject.'; const T = TRIGGERS[c.trigger];
      body = `<div class="wf-c"><div class="k">${T ? 'Trigger · ' + T.group : 'Trigger'}</div><div class="v">${T ? esc(T.name) : 'Choose a trigger'}</div><p>${T ? esc(T.desc) : 'Pick the event that starts this workflow.'}</p><button class="btn outline sm" style="margin-top:8px" data-act="wf-chtrig">Change</button></div>
      ${c.trigger === 'schedule' ? `<div class="wf-c" style="display:flex;flex-direction:column;gap:8px"><b style="font-size:12px">Schedule</b><div class="wf-f"><label>Repeat</label>${selBtn(c.repeat || 'Daily', 'wf-rep', '')}</div><div class="wf-f"><label>At</label><input class="input" data-input="wf-at" value="${esc(c.at || '07:00 AM')}"></div><div class="wf-f"><label>Timezone</label>${selBtn(c.tz || 'Asia/Kolkata', 'wf-tz', '')}</div></div>` : ''}`;
    } else if (n.type === 'decision') {
      t = 'Decision'; d = 'Create a filter to decide which path the workflow takes.'; const g = c.groups = c.groups || [[{ variable: '', op: 'equals', value: '' }]];
      body = g.map((grp, gi) => `${gi ? '<div class="muted sm" style="text-align:center">OR</div>' : ''}${grp.map((x, ci) => condRow(n, gi, ci, x, kind)).join('')}<button class="btn outline sm" data-act="wf-cadd" data-arg="${gi}">${I('plus')} Add condition</button>`).join('') + `<button class="btn outline sm" data-act="wf-gadd" style="width:100%">${I('plus')} Add OR group</button>`;
    } else if (n.type === 'action') {
      t = 'Action'; d = 'Choose what happens at this step.'; const a = ACTIONS[c.action];
      body = `<div class="wf-c"><div class="k">${a ? 'Action · ' + esc(a.group) : 'Action'}</div><div class="v">${a ? esc(a.name) : 'Choose an action'}</div>${a ? `<p>${esc(a.desc)}</p>` : ''}<button class="btn outline sm" style="margin-top:8px" data-act="wf-chact">Change</button></div>${a ? actionInfo(a) : ''}${c.action === 'stock_sheet' || c.action === 'sheet_append' ? `<div class="wf-c" style="display:flex;flex-direction:column;gap:8px"><div class="wf-f"><label>Spreadsheet app *</label>${selBtn(c.app || (apps().find((x) => /sheet/i.test(x.name)) ? 'Choose an app' : 'No connected app'), 'wf-app', '')}</div>${c.action === 'stock_sheet' ? `<div class="wf-f"><label>Tab → location (code or name) *</label><div class="row"><input class="input" data-input="wf-tab" value="${esc(c.tab || '')}" placeholder="Tab name"><button class="btn outline sm" data-act="wf-noop">+ Add</button></div></div><div class="wf-f"><label>Part number column *</label><input class="input" data-input="wf-pnc" value="${esc(c.pn || '')}" placeholder="e.g. A"></div><div class="wf-f"><label>Quantity column *</label><input class="input" data-input="wf-qc" value="${esc(c.qc || '')}" placeholder="e.g. C"></div><div class="wf-f"><label>Date column (to detect an old sheet)</label><input class="input" data-input="wf-dc" value="${esc(c.dc || '')}"></div><div class="wf-f"><label>Header row</label><input class="input" data-input="wf-hr" value="${esc(c.hr || '1')}"></div><div class="wf-f"><label>Stop if the sheet is older than (days)</label><input class="input" data-input="wf-od" value="${esc(c.od || '')}"></div><div class="wf-f"><label>Stop if more than this % of part numbers match nothing</label><input class="input" data-input="wf-pm" value="${esc(c.pm || '')}"></div>` : ''}</div>` : ''}${c.action === 'http' ? `<div class="wf-c" style="display:flex;flex-direction:column;gap:8px"><div class="wf-f"><label>URL *</label><div class="row"><input class="input" data-input="wf-url" value="${esc(c.url || '')}" placeholder="Text or {{variable}}"><button class="btn outline sm" data-act="wf-ins">Insert ${I('chevD')}</button></div></div><div class="wf-f"><label>Method</label>${selBtn(c.method || 'POST', 'wf-method', '')}</div><div class="wf-f"><label>Headers</label><button class="btn outline sm" style="align-self:flex-start" data-act="wf-noop">+ Add</button></div><div class="wf-f"><label>JSON body</label><button class="btn outline sm" style="align-self:flex-start" data-act="wf-noop">+ Add</button></div></div>` : ''}`;
    } else if (n.type === 'wait') {
      t = 'Wait'; d = 'Pause the workflow before the next step. No worker is held while waiting.';
      body = `<div class="wf-f"><label>Duration</label><div class="row"><input class="input" type="number" min="1" style="width:90px" data-input="wf-wamt" value="${esc(c.amount ?? '1')}"><div style="flex:1">${selBtn(c.unit || 'Days', 'wf-wunit', '')}</div></div></div>`;
    } else if (n.type === 'approval') {
      t = 'Approval'; d = 'A person approves before the workflow continues. Rejection ends it.';
      body = `<div class="wf-f"><label>What should the approver check?</label><textarea class="textarea" rows="4" data-input="wf-appr" placeholder="e.g. Check the quantities against stock">${esc(c.note || '')}</textarea></div>`;
    } else { t = 'End'; d = 'The workflow stops here.'; body = `<div class="muted sm">No settings for this step.</div>`; }
    el.hidden = false; el.innerHTML = `<div class="wf-ph"><div class="grow"><div class="t">${t}</div><div class="d">${d}</div></div>${n.type !== 'trigger' ? `<button class="btn ghost icon sm" data-act="wf-ndel" title="Delete step">${I('trash')}</button>` : ''}<button class="btn ghost icon sm" data-act="wf-pclose" title="Close">${I('x')}</button></div><div class="wf-pb">${body}</div>`; mini();
  };
  const changed = (o = {}) => { ctx.W.dirty = true; ctx.W.saved = false; redraw(o); };
  const cur = () => ctx && nodeBy(ctx.W, U.sel);
  DM.act('wf-pclose', () => selectNode(null));
  DM.act('wf-noop', () => DM.toast('Added'));
  const pickVar = (el, gi, ci) => { const n = cur(); const kind = kindOf(ctx.W); const Vs = VARS(kind); const items = []; Object.entries(Vs).forEach(([g, arr]) => { items.push({ heading: g }); arr.forEach(([k, l]) => items.push({ label: l, check: n.cfg.groups[gi][ci].variable === k, run: () => { snap(ctx.W); n.cfg.groups[gi][ci] = { variable: k, op: 'equals', value: '' }; changed(); } })); }); DM.menu(el, items, { w: 299 }); };
  DM.act('wf-cvar', (el) => { const [g, c] = el.dataset.arg.split(':').map(Number); pickVar(el, g, c); });
  DM.act('wf-cop', (el) => { const [g, c] = el.dataset.arg.split(':').map(Number); const n = cur(); DM.menu(el, OPS.map(([k, l]) => ({ label: l, check: n.cfg.groups[g][c].op === k, run: () => { snap(ctx.W); n.cfg.groups[g][c].op = k; changed(); } })), { match: true }); });
  DM.act('wf-cval', (el) => { const [g, c] = el.dataset.arg.split(':').map(Number); const n = cur(); const kind = kindOf(ctx.W); const x = n.cfg.groups[g][c]; const en = (ENUMS[kind] || {})[x.variable] || (x.variable === 'previous_status' ? (ENUMS[kind] || {}).status || [] : ['true', 'false']); DM.menu(el, en.map((v) => ({ label: v, check: x.value === v, run: () => { snap(ctx.W); x.value = v; changed(); } })), { match: true }); });
  DM.input('wf-cvalt', (v, el) => { const n = cur(); n.cfg.groups[+el.dataset.g][+el.dataset.c].value = v; ctx.W.dirty = true; ctx.W.saved = false; topbar(); const nd = document.querySelector(`.wfn[data-n="${n.id}"] .b`); if (nd) nd.textContent = bodyOf(ctx.W, n); });
  DM.act('wf-cadd', (el) => { const n = cur(); snap(ctx.W); n.cfg.groups[+el.dataset.arg].push({ variable: '', op: 'equals', value: '' }); changed(); });
  DM.act('wf-gadd', () => { const n = cur(); snap(ctx.W); n.cfg.groups.push([{ variable: '', op: 'equals', value: '' }]); changed(); });
  DM.act('wf-cdel', (el) => { const [g, c] = el.dataset.arg.split(':').map(Number); const n = cur(); snap(ctx.W); n.cfg.groups[g].splice(c, 1); if (!n.cfg.groups[g].length) n.cfg.groups.splice(g, 1); if (!n.cfg.groups.length) n.cfg.groups.push([{ variable: '', op: 'equals', value: '' }]); changed(); });
  const setCfg = (k) => (v) => { const n = cur(); n.cfg[k] = v; ctx.W.dirty = true; ctx.W.saved = false; topbar(); const nd = document.querySelector(`.wfn[data-n="${n.id}"] .b`); if (nd) nd.textContent = bodyOf(ctx.W, n); };
  [['wf-at', 'at'], ['wf-url', 'url'], ['wf-tab', 'tab'], ['wf-pnc', 'pn'], ['wf-qc', 'qc'], ['wf-dc', 'dc'], ['wf-hr', 'hr'], ['wf-od', 'od'], ['wf-pm', 'pm'], ['wf-wamt', 'amount'], ['wf-appr', 'note']].forEach(([a, k]) => DM.input(a, setCfg(k)));
  DM.act('wf-rep', (el) => DM.menu(el, ['Daily', 'Weekly', 'Monthly'].map((x) => ({ label: x, check: (cur().cfg.repeat || 'Daily') === x, run: () => { snap(ctx.W); cur().cfg.repeat = x; changed(); } })), { match: true }));
  DM.act('wf-tz', (el) => DM.menu(el, ['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York'].map((x) => ({ label: x, check: (cur().cfg.tz || 'Asia/Kolkata') === x, run: () => { snap(ctx.W); cur().cfg.tz = x; changed(); } })), { match: true }));
  DM.act('wf-method', (el) => DM.menu(el, ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'].map((x) => ({ label: x, check: (cur().cfg.method || 'POST') === x, run: () => { snap(ctx.W); cur().cfg.method = x; changed(); } })), { match: true }));
  DM.act('wf-wunit', (el) => DM.menu(el, ['Minutes', 'Hours', 'Days', 'Weeks'].map((x) => ({ label: x, check: (cur().cfg.unit || 'Days') === x, run: () => { snap(ctx.W); cur().cfg.unit = x; changed(); } })), { match: true }));
  DM.act('wf-app', (el) => { const L = (S().apps || []).filter((x) => /sheet/i.test(x.name)); const items = L.length ? L.map((x) => ({ label: x.name, check: cur().cfg.app === x.name, run: () => { snap(ctx.W); cur().cfg.app = x.name; changed(); } })) : [{ label: 'No connected app', disabled: true }]; DM.menu(el, items, { match: true }); });
  DM.act('wf-ins', (el) => DM.menu(el, ['{{status}}', '{{external_id}}', '{{account.name}}', '{{item_count}}'].map((x) => ({ label: x, run: () => { const n = cur(); n.cfg.url = (n.cfg.url || '') + x; changed(); } })), { w: 180 }));
  DM.act('wf-ndel', () => { const n = cur(); if (!n || n.type === 'trigger') return; const W = ctx.W; snap(W); const ins = W.edges.filter((e) => e.to === n.id), os = outs(W, n.id); if (n.type === 'decision') { const keep = os.find((e) => e.branch === 'true') || os[0]; os.filter((e) => e !== keep).forEach((e) => { const dead = downstream(W, e.to); W.nodes = W.nodes.filter((x) => !dead.has(x.id) || W.edges.some((y) => y.to === x.id && !dead.has(y.from) && y.from !== n.id)); }); ins.forEach((i) => keep && (i.to = keep.to, i.id = i.from + '>' + keep.to)); W.edges = W.edges.filter((e) => e.from !== n.id && e.to !== n.id || ins.includes(e)); } else { const o = os[0]; ins.forEach((i) => { if (o) { i.to = o.to; i.id = i.from + '>' + o.to; } }); W.edges = W.edges.filter((e) => e.from !== n.id && (e.to !== n.id || ins.includes(e))); }
    W.nodes = W.nodes.filter((x) => x.id !== n.id); const ids = new Set(W.nodes.map((x) => x.id)); W.edges = W.edges.filter((e) => ids.has(e.from) && ids.has(e.to)); U.sel = null; changed(); DM.toast('Step deleted'); });

  /* choose trigger / action dialogs */
  const chooser = (title, sub, groups, onPick, curId) => {
    const render = (q) => groups.map((g) => { const its = g.items.filter((x) => !q || (x.name + ' ' + x.desc + ' ' + g.group).toLowerCase().includes(q)); return its.length ? `<div class="addgrp">${esc(g.group)} <span class="muted">${its.length}</span></div>${its.map((x) => `<button class="addrow" data-pick="${x.id}"><span class="icotile">${I(x.icon || 'zap')}</span><span class="grow"><div class="n">${esc(x.name)}</div><div class="d" style="-webkit-line-clamp:2">${esc(x.desc)}</div></span>${x.id === curId ? I('check') : ''}</button>`).join('')}` : ''; }).join('') || '<div class="muted sm" style="padding:16px">No matches.</div>';
    DM.dialog({ title, sub, w: 636, body: `<div class="sgroup" style="width:100%;margin-bottom:8px">${I('search')}<input id="wf-ch-q" placeholder="Search…"></div><div id="wf-ch-l" style="max-height:52vh;overflow:auto">${render('')}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }],
      onMount: (d) => { const q = d.querySelector('#wf-ch-q'), l = d.querySelector('#wf-ch-l'); q.addEventListener('input', () => (l.innerHTML = render(q.value.toLowerCase()))); l.addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (!b) return; DM.closeModal(); onPick(b.dataset.pick); }); } });
  };
  DM.act('wf-chtrig', () => { const gs = {}; Object.entries(TRIGGERS).filter(([, t]) => t.ucs.includes(DM.uc)).forEach(([id, t]) => (gs[t.group] = gs[t.group] || { group: t.group, items: [] }).items.push({ id, name: t.name, desc: t.desc, icon: id === 'schedule' ? 'clock' : 'zap' })); chooser('Choose a trigger', 'The event that starts the workflow for a subject.', Object.values(gs), (id) => { snap(ctx.W); cur().cfg = { trigger: id }; changed(); }, cur().cfg.trigger); });
  const actionGroups = () => { const gs = {}; const order = ['Orders', 'Products & Inventory', 'Webhooks & API', 'Coral ERP', 'Tally', 'SAP']; const kind = kindOf(ctx.W); Object.entries(ACTIONS).filter(([, a]) => a.ucs.includes(DM.uc) && (a.works === 'any' || a.works === kind || kind === 'schedule')).forEach(([id, a]) => (gs[a.group] = gs[a.group] || { group: a.group, items: [] }).items.push({ id, name: a.name, desc: a.desc, icon: a.icon })); return order.filter((g) => gs[g]).map((g) => gs[g]); };
  DM.act('wf-chact', () => chooser('Choose an action', 'What happens at this step.', actionGroups(), (id) => { snap(ctx.W); cur().cfg = { action: id }; changed(); }, cur().cfg.action));

  /* add a step on an edge */
  const insertOnEdge = (eid, kind, actId) => {
    const W = ctx.W; const e = W.edges.find((x) => x.id === eid); if (!e) return; snap(W);
    const from = nodeBy(W, e.from), to = nodeBy(W, e.to); const n = mkNode(kind === 'action' ? 'action' : kind, kind === 'action' ? { action: actId } : kind === 'decision' ? { groups: [[{ variable: '', op: 'equals', value: '' }]] } : kind === 'wait' ? { amount: '1', unit: 'Days' } : {});
    const dead = downstream(W, to.id); W.nodes.forEach((x) => { if (dead.has(x.id)) x.x += 280; }); n.x = to.x - 280; n.y = from.y + (e.branch === 'false' ? 0 : 0);
    W.nodes.push(n); const oldTo = e.to; W.edges = W.edges.filter((x) => x !== e);
    W.edges.push({ id: from.id + '>' + n.id, from: from.id, to: n.id, ...(e.branch ? { branch: e.branch } : {}) });
    if (kind === 'decision') { const end = mkNode('end', {}); end.x = n.x + 310; end.y = n.y + 110; W.nodes.push(end); W.edges.push({ id: n.id + '>' + oldTo, from: n.id, to: oldTo, branch: 'true' }, { id: n.id + '>' + end.id, from: n.id, to: end.id, branch: 'false' }); }
    else W.edges.push({ id: n.id + '>' + oldTo, from: n.id, to: oldTo });
    U.sel = n.id; changed(); const c = document.getElementById('wf-canvas'); const v = V(); const sx = n.x * v.k + v.x, sy = n.y * v.k + v.y; if (sx < 40 || sx > c.clientWidth - 260 || sy < 40 || sy > c.clientHeight - 120) fit(true);
  };
  DM.act('wf-add', (el) => {
    const eid = el.dataset.arg; const gs = {}; Object.entries(ACTIONS).filter(([, a]) => a.ucs.includes(DM.uc) && (a.works === 'any' || a.works === kindOf(ctx.W))).forEach(([id, a]) => (gs[a.group] = gs[a.group] || []).push({ id, name: a.name, desc: a.desc, icon: a.icon, kind: 'action' }));
    const order = ['Orders', 'Products & Inventory', 'Webhooks & API', 'Coral ERP', 'Tally', 'SAP'];
    const groups = order.filter((g) => gs[g]).map((g) => ({ group: g, items: gs[g] })).concat([{ group: 'Flow control', items: FLOW.map((f) => ({ id: f.id, name: f.name, desc: f.desc, icon: f.icon, kind: f.type })) }]);
    const html = (q) => groups.map((g) => { const its = g.items.filter((x) => !q || (x.name + x.desc).toLowerCase().includes(q)); return its.length ? `<div class="addgrp">${esc(g.group)}</div>${its.map((x) => `<button class="addrow" data-pick="${x.id}" data-kind="${x.kind}"><span class="icotile">${I(x.icon)}</span><span class="grow" style="min-width:0"><div class="n">${esc(x.name)}</div><div class="d">${esc(x.desc)}</div></span></button>`).join('')}` : ''; }).join('') || '<div class="muted sm" style="padding:16px">No matches.</div>';
    DM.sheet({ id: 'wf-add', w: 384, title: 'Add a step', sub: 'Choose what happens next.', body: `<div class="sgroup" style="width:100%;margin-bottom:6px">${I('search')}<input id="wf-add-q" placeholder="Search steps"></div><div id="wf-add-l">${html('')}</div>`,
      onMount: (w) => { const q = w.querySelector('#wf-add-q'), l = w.querySelector('#wf-add-l'); q.addEventListener('input', () => (l.innerHTML = html(q.value.toLowerCase()))); l.addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (!b) return; w._close(); setTimeout(() => insertOnEdge(eid, b.dataset.kind, b.dataset.pick), 120); }); } });
  });

  /* undo / redo / save / publish */
  const restore = (s) => { const o = JSON.parse(s); ctx.W.nodes = o.n; ctx.W.edges = o.e; ctx.W.name = o.name; U.sel = null; };
  DM.act('wf-undo', () => { const W = ctx.W; if (!W.undo.length) return; W.redo.push(JSON.stringify({ n: W.nodes, e: W.edges, name: W.name })); restore(W.undo.pop()); W.dirty = W.undo.length > 0; redraw(); });
  DM.act('wf-redo', () => { const W = ctx.W; if (!W.redo.length) return; W.undo.push(JSON.stringify({ n: W.nodes, e: W.edges, name: W.name })); restore(W.redo.pop()); W.dirty = true; redraw(); });
  DM.act('wf-save', () => { const W = ctx.W, w = ctx.w; if (!W.dirty) return; w.draftSaved = true; w.draft = { nodes: clone(W.nodes), edges: clone(W.edges), name: W.name }; W.dirty = false; W.saved = true; redraw({ keepPanel: true }); DM.toast('Draft saved'); });
  DM.act('wf-publish', () => {
    const W = ctx.W, w = ctx.w; if (!W.dirty || problems(W).length || U.publishing) return; U.publishing = true; topbar();
    setTimeout(() => { U.publishing = false; w.version = (w.version || 0) + 1; w.nodes = clone(W.nodes); w.edges = clone(W.edges); w.name = W.name; w.status = 'live'; w.updatedAt = NOW(); w.draftSaved = false; delete w.draft; (w.versions = w.versions || []).unshift({ v: w.version, at: NOW(), by: 'Rohan Mehta', note: 'Published' }); W.dirty = false; W.saved = false; W.undo = []; W.redo = []; if (ctx && ctx.w === w) { redraw({ keepPanel: true }); const ch = document.querySelector('.vchip'); ch && ch.classList.add('pop'); } DM.toast(`Published v${w.version}`); }, 900);
  });
  DM.act('wf-rename', () => { const W = ctx.W; DM.dialog({ title: 'Rename workflow', w: 440, body: `<div class="field"><label>Name</label><input class="input" name="name" value="${esc(W.name)}"></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (d) => { const v = d.querySelector('[name=name]').value.trim(); if (!v) return false; snap(W); W.name = v; changed({ keepPanel: true }); } }] }); });

  /* more actions */
  const tidy = () => { const W = ctx.W; snap(W); const trig = W.nodes.find((n) => n.type === 'trigger'); const depth = {}; const q = [[trig.id, 0]]; const rows = {}; const used = {}; while (q.length) { const [id, d] = q.shift(); if (depth[id] != null) continue; depth[id] = d; outs(W, id).forEach((e) => q.push([e.to, d + 1])); } const lane = {}; const place = (id, y) => { lane[id] = y; const os = outs(W, id); os.forEach((e, i) => { if (lane[e.to] == null) place(e.to, y + (os.length > 1 ? (i === 0 ? -130 : 82) : 0)); }); }; place(trig.id, 508); W.nodes.forEach((n) => { if (depth[n.id] != null) { n.x = 387 + depth[n.id] * 310; n.y = lane[n.id] ?? n.y; } }); changed({ keepPanel: true }); const world = document.getElementById('wf-world'); fit(true); DM.toast('Layout tidied'); };
  DM.act('wf-more', (el) => { const W = ctx.W, w = ctx.w; DM.menu(el, [{ label: 'Settings', icon: 'settings', run: () => settingsSheet() }, { label: 'Tidy layout', icon: 'layout', run: tidy }, { label: W.paused ? 'Resume' : 'Pause', icon: W.paused ? 'play' : 'pause', run: () => { W.paused = !W.paused; w.status = W.paused ? 'paused' : 'live'; redraw({ keepPanel: true }); DM.toast(W.paused ? 'Workflow paused' : 'Workflow resumed'); } }, { label: 'New workflow from this version', icon: 'copy', run: () => newWorkflow(w) }, { sep: true }, { label: 'Delete workflow', icon: 'trash', danger: true, run: () => DM.acts['wf-del']({ dataset: { arg: w.id } }) }], { w: 240, right: true }); });
  const settingsSheet = () => {
    const s = ctx.W.settings = ctx.W.settings || {};
    const body = () => `<div style="display:flex;flex-direction:column;gap:16px"><div class="wf-f"><label>Re-entry cooldown</label><div class="row"><input class="input" type="number" style="width:100px" id="ws-cd" value="${esc(s.cooldown ?? '')}"><div style="flex:1">${selBtn(s.cooldownUnit || 'Days', 'wf-cdu', '')}</div></div><span class="hp">Leave empty to let each subject enter only once.</span></div>
      <div class="row" style="align-items:flex-start;gap:12px"><div class="grow"><b style="font-size:12px;font-weight:500">Allow concurrent runs</b><div class="hp muted sm">Let a subject be in this workflow more than once at the same time.</div></div>${DM.switch(!!s.concurrent, 'wf-conc')}</div>
      <div class="wf-f"><label>Termination events</label><div class="row"><input class="input" id="ws-te" placeholder="e.g. order.status_changed.cancelled"><button class="btn outline icon sm" data-act="wf-te-add" title="Add">${I('plus')}</button></div><div class="row wrap" style="gap:6px" id="ws-tl">${(s.termination || []).map((t, i) => `<span class="badge outline">${esc(t)} <button data-act="wf-te-del" data-arg="${i}" style="margin-left:2px">${I('x')}</button></span>`).join('')}</div><span class="hp muted sm">When one of these happens for the subject, any waiting or running workflow is cancelled.</span></div></div>`;
    const w = DM.sheet({ id: 'wf-set', w: 384, title: 'Workflow settings', sub: 'Who can enter, how often, and what ends a workflow early.', body: body() });
    w.addEventListener('input', (e) => { if (e.target.id === 'ws-cd') { s.cooldown = e.target.value; ctx.W.dirty = true; topbar(); } });
    U.setSheet = () => DM.sheetBody(w, body());
  };
  DM.act('wf-cdu', (el) => DM.menu(el, ['Minutes', 'Hours', 'Days', 'Weeks'].map((x) => ({ label: x, check: (ctx.W.settings.cooldownUnit || 'Days') === x, run: () => { ctx.W.settings.cooldownUnit = x; ctx.W.dirty = true; topbar(); U.setSheet(); } })), { match: true }));
  DM.act('wf-conc', () => { ctx.W.settings.concurrent = !ctx.W.settings.concurrent; ctx.W.dirty = true; topbar(); U.setSheet(); });
  DM.act('wf-te-add', () => { const i = document.getElementById('ws-te'); const v = i.value.trim(); if (!v) return; (ctx.W.settings.termination = ctx.W.settings.termination || []).push(v); ctx.W.dirty = true; topbar(); U.setSheet(); });
  DM.act('wf-te-del', (el) => { ctx.W.settings.termination.splice(+el.dataset.arg, 1); ctx.W.dirty = true; topbar(); U.setSheet(); });

  /* ───────── runs ───────── */
  const dt = (iso) => { const d = new Date(iso); return d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }) + ', ' + d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }); };
  const pretty = (o) => { const c = { ...o }; delete c._label; return JSON.stringify(c, null, 2); };
  const clearHl = () => { U.hl = {}; if (ctx) drawWorld(); };
  const runsSheet = (sel) => {
    const w = ctx.w; const runs = (w.runs || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
    const listHtml = () => runs.length ? runs.map((r) => `<div class="runcard" data-act="wf-run" data-arg="${r.id}"><div class="grow"><b style="font-size:12px;font-weight:500">${dt(r.at)}</b><div class="muted sm">Version ${r.version} · ${esc(r.subject)}${r.test ? ' · test' : ''}</div></div><span class="rpill ${r.status === 'Succeeded' ? 'ok' : 'bad'}">${r.status}</span></div>`).join('') : DM.empty('history', 'No runs yet', 'Runs show up here once the workflow has been triggered.', { style: 'border:0;padding:30px 8px' });
    const detail = (r) => `<button class="btn ghost sm" data-act="wf-runs-back" style="margin:0 0 8px -8px">${I('arrowL')} All runs</button><div class="row" style="margin-bottom:10px"><div class="grow"><b style="font-size:12px;font-weight:500">Version ${r.version} · started ${dt(r.at)}</b></div><span class="rpill ${r.status === 'Succeeded' ? 'ok' : 'bad'}">${r.status}</span></div><div class="muted sm" style="margin-bottom:4px">Trigger values</div><div class="wf-json" style="margin-bottom:12px">${esc(pretty(r.trigger))}</div>${r.steps.map((s) => `<div class="stepcard"><div class="row"><b style="font-weight:500">${esc(s.desc || s.title)}</b><span class="grow"></span><span class="rpill ${s.status === 'Done' ? 'ok' : 'bad'}">${s.status}</span></div><div class="muted xs" style="margin-top:2px">${dt(s.at)}</div>${s.note ? `<div style="margin-top:4px">${esc(s.note)}</div>` : ''}${s.error ? `<div style="margin-top:4px;color:#b42318">${esc(s.error)}</div>` : ''}${s.result ? `<div class="wf-json" style="margin-top:6px">${esc(JSON.stringify(s.result, null, 2))}</div>` : ''}</div>`).join('')}`;
    const sh = DM.sheet({ id: 'wf-runs', w: 384, title: 'Run history', sub: 'What this workflow did. Pick a run to see each step and light it up on the canvas.', body: sel ? detail(runs.find((r) => r.id === sel)) : listHtml(), onClose: clearHl });
    U.runSheet = { show: (id) => { const r = runs.find((x) => x.id === id); if (r) { DM.sheetBody(sh, detail(r)); U.hl = {}; r.steps.forEach((s) => (U.hl[s.nodeId] = s.status === 'Done' ? 'ok' : 'fail')); drawWorld(); } else { DM.sheetBody(sh, listHtml()); clearHl(); } } };
    if (sel) U.runSheet.show(sel);
  };
  DM.act('wf-runs', () => runsSheet(null));
  DM.act('wf-run', (el) => U.runSheet.show(el.dataset.arg)); DM.act('wf-runs-back', () => U.runSheet.show(null));

  /* ───────── test ───────── */
  const TFIELDS = (kind) => kind === 'rfq'
    ? [['status', 'Status', 'sel', ENUMS.rfq.status], ['previous_status', 'Previous status', 'sel', ENUMS.rfq.status], ['source', 'Source', 'sel', ENUMS.rfq.source], ['item_count', 'Number of items', 'num'], ['created_at', 'Created at', 'text'], ['external_id', 'External id', 'text']]
    : [['status', 'Status', 'sel', ENUMS.draft_order.status], ['previous_status', 'Previous status', 'sel', ENUMS.draft_order.status], ['confidence_score', 'AI confidence', 'num'], ['is_test', 'Is a test order', 'sel', ['true', 'false']], ['managed_by', 'Handled by', 'sel', ['anuma', 'human']], ['item_count', 'Number of items', 'num'], ['created_at', 'Created at', 'text'], ['expires_at', 'Expires at', 'text'], ['last_activity_at', 'Last activity', 'text'], ['external_id', 'External order id', 'text'], ['error', 'Processing error', 'text']];
  const evalCond = (c, vals) => { const v = String(vals[c.variable] ?? ''); const x = String(c.value ?? ''); switch (c.op) { case 'equals': return v === x; case 'does_not_equal': return v !== x; case 'contains': return v.toLowerCase().includes(x.toLowerCase()); case 'is_one_of': return x.split(',').map((s) => s.trim()).includes(v); case 'is_not_one_of': return !x.split(',').map((s) => s.trim()).includes(v); case 'is_set': return v !== ''; case 'is_not_set': return v === ''; } return false; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const pulse = async (e) => { const world = document.getElementById('wf-world'); const p = pt(ctx.W, e); const d = document.createElement('div'); d.className = 'wf-pulse'; world.appendChild(d); const t0 = performance.now(), dur = 600; await new Promise((res) => { const f = (t) => { const k = Math.min(1, (t - t0) / dur); const [x, y] = bez(p, k); d.style.left = x + 'px'; d.style.top = y + 'px'; k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }); d.remove(); };
  const runTest = async (vals, sh) => {
    const W = ctx.W, w = ctx.w; U.hl = {}; drawWorld(); const steps = []; let id = W.nodes.find((n) => n.type === 'trigger').id; const at = NOW(); const kind = kindOf(W);
    const light = (nid, cls) => { U.hl[nid] = cls; const el = document.querySelector(`.wfn[data-n="${nid}"]`); if (el) { el.classList.remove('lit'); el.classList.add(cls); } };
    let guard = 0;
    while (id && guard++ < 20) {
      const n = nodeBy(W, id); light(id, 'lit'); await wait(380); let note = '', status = 'Done', res = null, nextBranch = null;
      if (n.type === 'decision') { const ok = (n.cfg.groups || []).some((g) => g.every((c) => evalCond(c, vals))); nextBranch = ok ? 'true' : 'false'; note = ok ? 'Took the Yes path.' : 'Took the No path.'; res = { matched: ok, missing: [] }; }
      else if (n.type === 'action') { note = 'Skipped in test — nothing was pushed.'; }
      steps.push({ nodeId: id, title: n.title, desc: bodyOf(W, n), status, at: NOW(), note, result: res }); light(id, 'ok');
      if (n.type === 'end') break; const os = outs(W, id); const e = n.type === 'decision' ? os.find((x) => x.branch === nextBranch) || os[0] : os[0]; if (!e) break; U.hl['e:' + e.id] = 'lit'; await pulse(e); id = e.to;
    }
    const tr = (w.runs = w.runs || []); const cur = { id: 'run-t' + (tr.length + 1), at, version: w.version || 0, subject: 'test', status: 'Succeeded', test: true, trigger: { _label: '', ...vals }, steps }; tr.unshift(cur);
    steps.forEach((s) => { const n = w.nodes.find((x) => x.id === s.nodeId); if (n) { n.runs = n.runs || { n: 0, pct: 0 }; n.runs.n++; } }); const tn = w.nodes.find((x) => x.type === 'trigger'); w.nodes.forEach((n) => { if (n.runs && tn.runs) n.runs.pct = Math.round((n.runs.n / tn.runs.n) * 100); }); W.nodes.forEach((n) => { const o = w.nodes.find((x) => x.id === n.id); if (o && o.runs) n.runs = { ...o.runs }; });
    DM.sheetBody(sh, `<div class="stepcard" style="border-color:#c6ecb6;background:#eefbe8"><b style="font-weight:500">Test finished</b><div class="muted sm">${steps.length} steps walked. Nothing was sent, pushed or saved.</div></div>${steps.map((s) => `<div class="stepcard"><div class="row"><b style="font-weight:500">${esc(s.desc)}</b><span class="grow"></span><span class="rpill ok">Done</span></div>${s.note ? `<div class="muted sm" style="margin-top:4px">${esc(s.note)}</div>` : ''}</div>`).join('')}<button class="btn outline sm" data-act="wf-test-again">Run again</button>`);
    await wait(1400); U.hl = {}; drawWorld();
  };
  const testSheet = () => {
    const kind = kindOf(ctx.W); const F = TFIELDS(kind); const defaults = { status: kind === 'rfq' ? 'ready' : 'confirmed', previous_status: kind === 'rfq' ? 'needs_review' : 'awaiting_confirmation', confidence_score: '0.92', is_test: 'true', managed_by: 'anuma', item_count: '3', source: 'Email Attachment' }; const vals = { ...defaults };
    const form = () => `<div style="display:flex;flex-direction:column;gap:10px">${F.map(([k, l, t, opts]) => `<div class="wf-f"><label>${l}</label>${t === 'sel' ? selBtn(vals[k] || 'Choose', 'wf-tsel', k) : `<input class="input" data-input="wf-tin" data-k="${k}" value="${esc(vals[k] ?? '')}" ${t === 'num' ? 'type="number" step="any"' : ''}>`}</div>`).join('')}<div class="wf-f"><label>Record ID (optional)</label><input class="input" data-input="wf-tin" data-k="record"><span class="hp">Use a real record's details. When set, the values above are ignored.</span></div></div>`;
    const sh = DM.sheet({ id: 'wf-test', w: 384, title: 'Test this workflow', sub: 'Walks the steps on this screen with the values below. Nothing is sent, pushed or saved.', body: form(), footer: `<button class="btn" data-act="wf-test-run">${I('play')} Run test</button>` });
    U.test = { vals, form: () => DM.sheetBody(sh, form()), run: () => { sh.querySelector('.sheet-f').innerHTML = ''; runTest(vals, sh).then(() => { const f = sh.querySelector('.sheet-f'); if (f) f.innerHTML = ''; }); }, sh, F };
  };
  DM.act('wf-test', testSheet);
  DM.act('wf-test-run', () => U.test.run()); DM.act('wf-test-again', () => { U.test.form(); U.test.sh.querySelector('.sheet-f').innerHTML = `<button class="btn" data-act="wf-test-run">${I('play')} Run test</button>`; });
  DM.input('wf-tin', (v, el) => { U.test.vals[el.dataset.k] = v; });
  DM.act('wf-tsel', (el) => { const k = el.dataset.arg; const f = U.test.F.find((x) => x[0] === k); DM.menu(el, f[3].map((o) => ({ label: o, check: U.test.vals[k] === o, run: () => { U.test.vals[k] = o; U.test.form(); } })), { match: true }); });
})();
