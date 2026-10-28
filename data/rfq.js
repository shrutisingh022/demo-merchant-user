/* data/rfq.js — Access use case (Axis India style): RFQ-only story. No Inbox, no Orders.
   Metro Power Electricals (AC-1002) emails a 14-line BOQ → Anuma parses + matches → Rohan resolves flagged lines → Convert to quote → Send to SAP →
   SAP confirms → Dashboard Deal timeline; then a second, smaller RFQ arrives through the customer portal.
   Steps only mutate DM.S (fresh clone of the seed on every replay) with FIXED ids and explicit timestamps (DM.now() follows the *last* applied step, so no helper timestamps are used).
   Records created: rfq-1027 (RFQ-202610-1027, Metro Power) and rfq-1028 (RFQ-202610-1028, Sigma Panel). */
(function () {
  if (!window.DM) return;
  const DM = window.DM;
  const pad = (n) => String(n).padStart(2, '0');
  const T = (hhmm) => { const [h, m] = hhmm.split(':'); return `2026-10-27T${pad(h)}:${pad(m)}:00+05:30`; };
  const utc = (iso) => new Date(iso).toISOString();
  const ME = 'Rohan Mehta';
  const N1 = 1027, ID1 = 'rfq-1027', NO1 = 'RFQ-202610-1027';
  const N2 = 1028, ID2 = 'rfq-1028', NO2 = 'RFQ-202610-1028';

  /* ───────── helpers (pure state edits) ───────── */
  const byId = (S, id) => (S.rfqs || []).find((r) => r.id === id);
  const variantOf = (S, vid) => { for (const st of S.styles || []) { const v = (st.variants || []).find((x) => x.id === vid); if (v) return { st, v }; } return null; };
  const rateOf = (sku) => { let h = 7; for (const c of String(sku)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 20 + (h % 4800) / 10; };
  const mk = (S, vid, confidence, state, alt) => { const f = variantOf(S, vid); if (!f) return null; let rate = rateOf(f.v.sku || f.v.id); try { const c = DM.rfq && DM.rfq.candidates(S, f.st.name, 80).find((x) => x.v.id === vid); if (c && c.rate) rate = c.rate; } catch (e) {} return { styleId: f.st.id, variantId: vid, sku: f.v.sku || f.v.id, alt: alt == null ? 3 : alt, confidence, rate, state: state || 'proposed' }; };
  const act = (r, at, actor, text, tag) => r.activity.unshift({ id: `a-${r.n}-s${r.activity.length + 1}`, actor, at, text, tag: tag || 'logged' });
  const log = (S, at, actor, title, verb, chip, event, entity) => { S.logs = S.logs || []; S.logs.unshift({ id: `lg-s${S.logs.length + 1}`, at: utc(at), actor, title, verb, chip, event, entity: entity || '' }); };
  const line = (r, n) => r.lines.find((l) => l.n === n);
  const styleName = (S, l) => { const f = l.match && variantOf(S, l.match.variantId); return f ? f.st.name : l.text; };
  const nice = (name) => name.replace(/MINIATURE CIRCUIT BREAKER/, 'MCB').replace(/TINNED COPPER LUGS - DIN (\d+) - (\d+)/, 'Copper Lug $1mm × $2mm');
  const total = (r) => r.lines.filter((l) => l.decision === 'confirmed' && l.match).reduce((a, l) => a + l.qty * l.match.rate, 0);

  /* Metro Power BOQ — as the customer wrote it. m = [variantId, confidence] proposed by Anuma (null = nothing in the catalogue) */
  const BOQ = [
    { n: 1, text: 'Tinned copper lug DIN 16 x M12', code: 'ATD0016M12', qty: 3500, m: ['v-atd0016m12-1', 96] },
    { n: 2, text: 'Tinned copper lug DIN 35 - M12', code: '', qty: 1200, m: ['v-atd0035m12-1', 94] },
    { n: 3, text: 'Copper lug 50 sq mm M12 tinned', code: '', qty: 800, m: ['v-atd0050m12-1', 91] },
    { n: 4, text: 'MCB 3P 32A C curve 10kA', code: 'MCB3P032C10', qty: 60, m: ['v-mcb3p032c10-1', 97] },
    { n: 5, text: 'MCB 1P 16A C curve 10kA', code: '', qty: 120, m: ['v-mcb1p016c10-1', 95] },
    { n: 6, text: 'Miniature circuit breaker 3P 63A C curve', code: '', qty: 24, m: ['v-mcb3p063c10-1', 88] },
    { n: 7, text: 'Power contactor 32A 3 pole 415V AC coil', code: '', qty: 18, m: ['v-ctr032415-1', 92] },
    { n: 8, text: 'Contactor 65A 3 pole', code: '', qty: 6, m: ['v-ctr065415-1', 61] },
    { n: 9, text: '20mm double compression gland with lock nut, earth tag and long shroud', code: 'DCG020LS-001', qty: 400, m: ['v-dcg020ls-1', 93] },
    { n: 10, text: '25mm DCG with shroud', code: '', qty: 400, m: ['v-dcg025ls-1', 74] },
    { n: 11, text: 'Surge protection device 275V Type-2, 1+NPE', code: '', qty: 10, m: ['v-spd1n275t2-1', 90] },
    { n: 12, text: 'Flexible laminated copper busbar 35 x 5, 400 long', code: '', qty: 30, m: ['v-bbf0250400-1', 52] },
    { n: 13, text: 'Siemens 3RT2026 contactor (brand specific)', code: '3RT2026-1AP00', qty: 4, m: null },
    { n: 14, text: 'Earthing kit for panel as per drawing ER-04 (rod clamps, eye hooks, 50 sq mm lugs)', code: '', qty: 6, type: 'Kit', m: ['v-urc2025ev2-1', 82], parts: [['U-bolt rod clamp type E', 'v-urc2025ev2-1', 12], ['Eye hook', 'v-eyh0016-1', 12], ['Tinned copper lug DIN 50 - M12', 'v-atd0050m12-1', 12]] },
  ];
  const mkLine = (r, b) => ({ id: `l-${r.n}-${b.n}`, n: b.n, text: b.text, code: b.code || '', qty: b.qty, unit: 'Nos', type: b.type || '', decision: 'pending', replaced: false, expanded: false, merged: false, regretNote: '', detailsNote: '', match: null, parts: [] });

  const newRfq = (S, o) => {
    const r = Object.assign({ id: o.id, no: o.no, n: o.n, partyId: o.partyId, contactId: o.contactId, reference: o.reference, source: o.source, status: 'received', receivedAt: o.at, owner: o.owner || 'u-rohan', notes: '', lines: [], files: o.files, activity: [], quote: null, exportedAt: null, sapRef: null });
    r.activity.push({ id: `a-${o.n}-s1`, actor: 'Anuma', at: o.at, text: `Created Rfq: ${o.no} - ${o.source}`, tag: 'auto-drafted' });
    S.rfqs = S.rfqs || []; S.rfqs.unshift(r);
    log(S, o.at, 'Anuma', `Created Rfq: ${o.no} - ${o.source}`, 'created', 'auto-drafted', 'rfq_created', o.no);
    return r;
  };
  const bumpWorkflow = (S, wfIdx, run, nodeIds) => { const wf = (S.workflows || [])[wfIdx]; if (!wf) return; wf.runs = wf.runs || []; wf.runs.unshift(run); (wf.nodes || []).forEach((nd) => { if (nodeIds.includes(nd.id) && nd.runs) nd.runs.n = (nd.runs.n || 0) + 1; }); wf.lastRunAt = run.at; };
  const openKit = (id) => { try { if (DM.ui && DM.ui.rfq && DM.ui.rfq.open) DM.ui.rfq.open[id] = true; } catch (e) {} };

  const step = (o) => o;

  DM.defineUC('rfq', {
    short: 'Access use case',
    tagline: 'RFQs',
    icon: 'sheet',
    home: '/dashboard',
    about: 'Access (Axis India style): no inbox, no orders. A contractor emails a 14-line BOQ. Anuma parses it, matches every line to the catalogue and flags the weak ones; you resolve them, convert the RFQ to a quote and send it to SAP, then watch the Dashboard timeline. A second RFQ arrives through the customer portal.',
    steps: [
      step({ id: 'rq-01', at: '17:42', actor: 'Customer', title: 'A BOQ arrives by email', desc: 'Metro Power Electricals emails a 3-sheet workbook.', narr: 'Sunil Deshmukh at Metro Power Electricals emails a substation BOQ. The RFQ appears on the board in Received, with the workbook attached. Nothing is read yet.', route: '/orders/rfqs?view=board',
        apply(S) {
          newRfq(S, { id: ID1, no: NO1, n: N1, partyId: 'AC-1002', contactId: 'CT-1900', reference: 'ENQ/METRO/2610-47', source: 'Email Attachment', at: T('17:42'),
            files: [{ id: 'f-1027-1', name: 'Metro_Power_Substation_BOQ_Rev2.xlsx', sheets: 3, lines: 0, from: 'sunil.deshmukh@metropower-electricals.example', at: T('17:42') }] });
        } }),
      step({ id: 'rq-02', at: '17:43', actor: 'Anuma', title: 'Anuma reads the workbook', desc: 'Status moves to Matching; the first 6 lines are parsed.', narr: 'Anuma opens the workbook, reads the sheets and starts listing lines. The RFQ moves to Matching and the first six lines show up on the Items tab.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); r.status = 'matching'; r.files[0].lines = 6;
          BOQ.slice(0, 6).forEach((b) => r.lines.push(mkLine(r, b)));
          act(r, T('17:43'), 'Anuma', `Updated Rfq: ${NO1} - Email Attachment (Changed fields: status)`, 'logged');
          BOQ.slice(0, 2).forEach((b) => log(S, T('17:43'), 'Anuma', `Created Rfq Line Item: ${b.text} - ${b.qty.toFixed(3)} No`, 'created', 'auto-drafted', 'rfq_line_created', NO1));
        } }),
      step({ id: 'rq-03', at: '17:44', actor: 'Anuma', title: 'All 14 lines are listed', desc: 'Including one kit and a brand-specific line.', narr: 'The remaining eight lines arrive: contactors, glands, a surge protection device, busbar, a branded contactor and an earthing kit that bundles three parts.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); r.files[0].lines = 14;
          BOQ.slice(0, 6).forEach((b) => { const l = line(r, b.n); const f = variantOf(S, b.m[0]); l.match = null; });
          BOQ.slice(6).forEach((b) => r.lines.push(mkLine(r, b)));
          r.lines.sort((a, b) => a.n - b.n);
          log(S, T('17:44'), 'Anuma', `Created Rfq Line Item: ${BOQ[13].text} - ${BOQ[13].qty.toFixed(3)} No`, 'created', 'auto-drafted', 'rfq_line_created', NO1);
        } }),
      step({ id: 'rq-04', at: '17:46', actor: 'Anuma', title: 'Matching finishes: needs review', desc: '9 strong matches, 4 weak or missing, 1 kit.', narr: 'Anuma proposes a catalogue SKU for each line. Nine are strong. The busbar, a 25mm gland and the 65A contactor are weak; the Siemens line has no match in the catalogue. Status becomes Needs Review and Rohan is notified.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        notifies: [{ type: 'review', title: 'RFQ needs review', account: NO1, preview: 'Metro Power Electricals: 14 lines matched, 5 need a decision.', href: '/orders/rfqs/rfq-1027?tab=line-items', unread: true }],
        apply(S) {
          const r = byId(S, ID1); r.status = 'needs_review';
          BOQ.forEach((b) => { const l = line(r, b.n); l.match = b.m ? mk(S, b.m[0], b.m[1], 'proposed', b.m[1] < 80 ? 5 : 2) : null; if (b.parts) l.parts = b.parts.map(([text, vid, q]) => ({ text, sku: (variantOf(S, vid) || { v: { sku: vid } }).v.sku, qty: q })); });
          act(r, T('17:46'), 'Anuma', `Updated Rfq: ${NO1} - Email Attachment (Changed fields: status)`, 'logged');
          log(S, T('17:46'), 'Anuma', 'Created Variant Match Feedback: down: copper lug 16mm 12mm', 'created', 'auto-drafted', 'variant_match_feedback', NO1);
          log(S, T('17:46'), 'Anuma', `Created Variant Match Feedback Component: TINNED COPPER LUGS - DIN 16 - 12 - ATD0016M12 x3500.000`, 'created', 'auto-drafted', 'variant_match_feedback', NO1);
        } }),
      step({ id: 'rq-05', at: '17:50', actor: 'Rohan', title: 'Rohan confirms the strong matches', desc: 'Nine lines kept exactly as Anuma proposed.', narr: 'Rohan opens the Items tab and confirms the nine lines where Anuma was right. Each confirmation lands in Activity, and the Review column shows them as done.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); const ok = [1, 2, 3, 4, 5, 6, 7, 9, 11];
          ok.forEach((n) => { const l = line(r, n); l.decision = 'confirmed'; l.match.state = 'confirmed'; log(S, T('17:50'), ME, `Line confirmed: ${nice(styleName(S, l))}`, 'created', 'confirmed', 'line_confirmed', NO1); });
          act(r, T('17:50'), ME, `Line confirmed: 9 lines kept as proposed`, 'logged');
        } }),
      step({ id: 'rq-06', at: '17:52', actor: 'Rohan', title: 'Rohan picks the right catalogue match', desc: 'Busbar corrected, 25mm gland accepted.', narr: 'The busbar was proposed as 25 x 5; the customer wants 35 x 5. Rohan opens “Pick the catalog match”, selects BBF0350400 and confirms. He accepts the 25mm gland as proposed.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1);
          const g = line(r, 10); g.decision = 'confirmed'; g.match.state = 'confirmed';
          const b = line(r, 12); b.match = mk(S, 'v-bbf0350400-1', 98, 'confirmed', 2); b.replaced = true; b.decision = 'confirmed';
          act(r, T('17:52'), ME, `Updated Rfq Line Item: ${b.text} - ${b.qty.toFixed(3)} ${b.unit} (Changed fields: match)`, 'logged');
          log(S, T('17:52'), ME, `Updated Rfq Line Item: ${b.text} - ${b.qty.toFixed(3)} No (Changed fields: match)`, 'updated', 'logged', 'rfq_line_updated', NO1);
          log(S, T('17:52'), ME, `Line confirmed: ${nice(styleName(S, g))}`, 'created', 'confirmed', 'line_confirmed', NO1);
        } }),
      step({ id: 'rq-07', at: '17:54', actor: 'Rohan', title: 'The earthing kit is expanded', desc: 'Three parts matched; kit confirmed.', narr: 'The earthing kit is a single line on the BOQ. Anuma expanded it into three catalogue parts. Rohan opens the kit, checks the parts and confirms it.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); const k = line(r, 14); k.expanded = true; k.decision = 'confirmed'; k.match.state = 'confirmed'; openKit(k.id);
          act(r, T('17:54'), ME, `Line confirmed: Earthing kit × ${k.qty}`, 'logged');
          log(S, T('17:54'), ME, `Created Rfq Line Item Component: ${k.parts[0].text} - ${k.parts[0].sku} x${(k.parts[0].qty * k.qty).toFixed(3)}`, 'created', 'auto-drafted', 'rfq_line_component', NO1);
        } }),
      step({ id: 'rq-08', at: '17:56', actor: 'Rohan', title: 'A branded line is regretted', desc: 'Siemens 3RT2026 is not in the range.', narr: 'The customer asked for a Siemens-specific contactor. It is not stocked, so Rohan marks the line Regret with a note. It is left out of the quote.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); const l = line(r, 13); l.decision = 'regret'; l.regretNote = 'Brand-specific (Siemens 3RT2026). Not in our range; CTR025415 offered as an equivalent.';
          act(r, T('17:56'), ME, `Updated Rfq Line Item: ${l.text} - ${l.qty.toFixed(3)} ${l.unit} (Changed fields: disposition)`, 'logged');
          log(S, T('17:56'), ME, `Updated Rfq Line Item: ${l.text} - ${l.qty.toFixed(3)} No (Changed fields: disposition)`, 'updated', 'logged', 'rfq_line_updated', NO1);
        } }),
      step({ id: 'rq-09', at: '17:58', actor: 'Rohan', title: 'One line needs details', desc: 'Contactor 65A: coil voltage missing.', narr: 'The 65A contactor comes in several coil voltages and the BOQ does not say which. Rohan marks the line Needs details and Anuma emails the customer to ask.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); const l = line(r, 8); l.decision = 'needs_details'; l.detailsNote = 'Coil voltage not stated (230V / 415V AC).';
          act(r, T('17:58'), 'Anuma', 'Email sent to sunil.deshmukh@metropower-electricals.example: coil voltage for line 8', 'auto-drafted');
          act(r, T('17:58'), ME, `Updated Rfq Line Item: ${l.text} - ${l.qty.toFixed(3)} ${l.unit} (Changed fields: disposition)`, 'logged');
          log(S, T('17:58'), ME, `Updated Rfq Line Item: ${l.text} - ${l.qty.toFixed(3)} No (Changed fields: disposition)`, 'updated', 'logged', 'rfq_line_updated', NO1);
        } }),
      step({ id: 'rq-10', at: '18:05', actor: 'Customer', title: 'The customer replies', desc: 'Line 8 re-matched with the coil voltage.', narr: 'Sunil replies: 415V AC coil. Anuma updates the line text, re-runs the match (96%) and puts the line back in Needs Review for a final confirmation.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        notifies: [{ type: 'changes', title: 'Customer replied', account: NO1, preview: 'Metro Power Electricals confirmed the coil voltage for line 8.', href: '/orders/rfqs/rfq-1027?tab=line-items', unread: true }],
        apply(S) {
          const r = byId(S, ID1); const l = line(r, 8);
          l.text = 'Contactor 65A 3 pole, 415V AC coil'; l.detailsNote = ''; l.decision = 'pending'; l.match = mk(S, 'v-ctr065415-1', 96, 'proposed', 1);
          act(r, T('18:05'), 'Anuma', 'Reply received from sunil.deshmukh@metropower-electricals.example: 415V AC coil', 'auto-drafted');
          act(r, T('18:05'), 'Anuma', `Updated Rfq Line Item: ${l.text} - ${l.qty.toFixed(3)} ${l.unit} (Changed fields: text, match)`, 'logged');
          log(S, T('18:05'), 'Anuma', `Updated Rfq Line Item: ${l.text} - ${l.qty.toFixed(3)} No (Changed fields: text, match)`, 'updated', 'logged', 'rfq_line_updated', NO1);
        } }),
      step({ id: 'rq-11', at: '18:07', actor: 'Rohan', title: 'The last line is confirmed: Ready', desc: 'Nothing left to decide.', narr: 'Rohan confirms the 65A contactor. All 14 lines are decided (13 confirmed, including the kit, and 1 regret), so the RFQ moves to Ready.', route: '/orders/rfqs/rfq-1027?tab=line-items',
        apply(S) {
          const r = byId(S, ID1); const l = line(r, 8); l.decision = 'confirmed'; l.match.state = 'confirmed'; r.status = 'ready';
          act(r, T('18:07'), ME, `Line confirmed: ${l.match.sku} × ${l.qty}`, 'logged');
          act(r, T('18:07'), ME, `Updated Rfq: ${NO1} - Email Attachment (Changed fields: status)`, 'logged');
          log(S, T('18:07'), ME, `Line confirmed: ${nice(styleName(S, l))}`, 'created', 'confirmed', 'line_confirmed', NO1);
        } }),
      step({ id: 'rq-12', at: '18:10', actor: 'Rohan', title: 'Convert to quote', desc: 'The RFQ becomes a quote.', narr: 'On the Overview tab the matched cost and counts are in. Rohan presses Convert to quote; the quote reference and total are recorded on the RFQ and its status becomes Quoted.', route: '/orders/rfqs/rfq-1027',
        apply(S) {
          const r = byId(S, ID1); const t = total(r); r.status = 'quoted';
          r.quote = { ref: 'QT-2026-0227', at: T('18:10'), total: Math.round(t * 1.18) };
          act(r, T('18:10'), ME, `Converted to quote ${r.quote.ref}`, 'logged');
          log(S, T('18:10'), ME, `Converted ${NO1} to quote ${r.quote.ref}`, 'created', 'confirmed', 'quote_confirmed', NO1);
        } }),
      step({ id: 'rq-13', at: '18:12', actor: 'Rohan', title: 'Send to SAP', desc: 'The quoted lines go to SAP as a sales document.', narr: 'Rohan presses Send to SAP. The RFQ shows Exported with a SAP reference straight away, and the SAP connection records the call as pending. The “RFQ → Send to SAP” workflow runs.', route: '/orders/rfqs/rfq-1027',
        apply(S) {
          const r = byId(S, ID1); r.status = 'exported'; r.exportedAt = T('18:12'); r.sapRef = 'SAP-SO-4500461';
          act(r, T('18:12'), ME, `Sent to SAP: ${r.sapRef}`, 'logged');
          log(S, T('18:12'), ME, `Sent RFQ ${NO1} to SAP (${r.sapRef})`, 'created', 'sent', 'rfq_sent', NO1);
          S.erpLog = S.erpLog || []; S.erpLog.unshift({ id: 'erp-s1', app: 'sap', action: 'Create sales order', kind: 'push', state: 'pending', at: T('18:12'), result: `${NO1} · 13 lines · plant 1010 · waiting for SAP`, draftNo: NO1, ref: r.sapRef });
          bumpWorkflow(S, 0, { id: 'run-s1', at: T('18:12'), version: 1, subject: `rfq ${NO1}`, status: 'Succeeded', trigger: { _label: 'RFQ status changed', status: 'ready', previous_status: 'quoted', source: 'Email Attachment', item_count: 14, created_at: T('17:42'), external_id: NO1, is_test: false },
            steps: [{ nodeId: 'n-trigger', title: 'Trigger', desc: 'RFQ status changed', status: 'Done', at: T('18:12'), note: '' }, { nodeId: 'n-decision', title: 'Decision', desc: '1 condition in 1 group', status: 'Done', at: T('18:12'), note: 'Condition met' }, { nodeId: 'n-action', title: 'Action', desc: 'Send RFQ to SAP · Source: SAP', status: 'Done', at: T('18:12'), note: '', result: r.sapRef }, { nodeId: 'n-end-true', title: 'End', desc: 'End of the workflow', status: 'Done', at: T('18:12'), note: '' }] }, ['n-trigger', 'n-decision', 'n-action', 'n-end-true']);
        } }),
      step({ id: 'rq-14', at: '18:13', actor: 'System', title: 'SAP confirms the sales document', desc: 'The SAP connection shows the call as successful.', narr: 'SAP answers: sales order 4500461 created with 13 lines. On the SAP connection page the log row flips from Pending to the SAP reference.', route: '/settings/integrations/sap',
        apply(S) {
          const e = (S.erpLog || []).find((x) => x.id === 'erp-s1'); if (e) { e.state = 'success'; e.result = `${NO1} · 13 lines · plant 1010 · sales order 4500461 created`; e.at = T('18:13'); }
          const a = (S.apps || []).find((x) => x.slug === 'sap'); if (a) a.lastSync = T('18:13');
          log(S, T('18:13'), 'System', `Created App Event Log: SAP — Create sales order (${NO1}) — success`, 'created', 'auto-drafted', 'app_event_log', 'sap');
        } }),
      step({ id: 'rq-15', at: '18:15', actor: 'Anuma', title: 'The Dashboard timeline shows the day', desc: 'Every confirmation, conversion and export in one feed.', narr: 'Back on the Dashboard the Deal timeline lists what Anuma did and what the team did: line confirmations, the quote conversion and the SAP export.', route: '/dashboard',
        notifies: [{ type: 'changes', title: 'RFQ exported to SAP', account: NO1, preview: 'Metro Power Electricals · SAP-SO-4500461', href: '/orders/rfqs/rfq-1027', unread: true }],
        apply() {} }),
      step({ id: 'rq-16', at: '18:40', actor: 'Customer', title: 'A second RFQ arrives through the portal', desc: 'Sigma Panel Systems, 5 lines.', narr: 'Sigma Panel Systems submits a short RFQ through the customer portal. It appears on the board in Received, next to the exported RFQ.', route: '/orders/rfqs?view=board',
        apply(S) {
          const r = newRfq(S, { id: ID2, no: NO2, n: N2, partyId: 'AC-1003', contactId: 'CT-1902', reference: 'PORTAL-SPS-0331', source: 'Custom Webhook', at: T('18:40'), owner: 'u-prakash',
            files: [{ id: 'f-1028-1', name: 'portal-request-0331.json', sheets: 1, lines: 5, from: 'portal@sigma-panels.example', at: T('18:40') }] });
          [['MCB 3P 25A C curve 10kA', 40], ['Power contactor 25A 3 pole 415V coil', 12], ['DIN rail TS35 galvanised 750mm', 60], ['32mm DCG with long shroud', 100], ['Tinned copper lug 70 sq mm M14', 250]].forEach(([text, qty], i) => r.lines.push({ id: `l-${N2}-${i + 1}`, n: i + 1, text, code: '', qty, unit: 'Nos', type: '', decision: 'pending', replaced: false, expanded: false, merged: false, regretNote: '', detailsNote: '', match: null, parts: [] }));
        } }),
      step({ id: 'rq-17', at: '18:41', actor: 'Anuma', title: 'The second RFQ is matched', desc: 'Four strong matches, one to review.', narr: 'Anuma matches the five lines in seconds. One line is only 63% sure, so the RFQ goes to Needs Review and Prakash, who owns Sigma Panel, is notified.', route: '/orders/rfqs/rfq-1028?tab=line-items',
        notifies: [{ type: 'review', title: 'RFQ needs review', account: NO2, preview: 'Sigma Panel Systems: 5 lines matched, 1 needs a decision.', href: '/orders/rfqs/rfq-1028?tab=line-items', unread: true }],
        apply(S) {
          const r = byId(S, ID2); r.status = 'needs_review';
          [['v-mcb3p025c10-1', 96], ['v-ctr025415-1', 93], ['v-dr35g750-1', 95], ['v-dcg032ls-1', 63], ['v-atd0070m14-1', 92]].forEach(([vid, c], i) => { r.lines[i].match = mk(S, vid, c, 'proposed', c < 80 ? 4 : 1); });
          act(r, T('18:41'), 'Anuma', `Updated Rfq: ${NO2} - Custom Webhook (Changed fields: status)`, 'logged');
          log(S, T('18:41'), 'Anuma', `Created Variant Match Feedback: down: 32mm gland long shroud`, 'created', 'auto-drafted', 'variant_match_feedback', NO2);
        } }),
      step({ id: 'rq-18', at: '18:44', actor: 'Rohan', title: 'Prakash takes the second RFQ', desc: 'Both RFQs now sit in different lanes of the board.', narr: 'Rohan hands Sigma Panel to Prakash. The board now shows one RFQ Exported and one in Needs Review, each in its own lane.', route: '/orders/rfqs?view=board',
        apply(S) {
          const r = byId(S, ID2); r.owner = 'u-prakash';
          act(r, T('18:44'), ME, `Updated Rfq: ${NO2} - Custom Webhook (Changed fields: owner)`, 'logged');
          log(S, T('18:44'), ME, `Updated Rfq: ${NO2} - Custom Webhook (Changed fields: owner)`, 'updated', 'logged', 'rfq_updated', NO2);
        } }),
    ],
  });
})();
