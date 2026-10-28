/* data/newhome.js — NewHome use case scenario: a dealer's WhatsApp order → Anuma reads it → a line goes to the ASM → draft order → Coral ERP push (422, fixed, retried) → back to the case.
   Only DM.defineUC lives here; all seed data is in data/base-newhome.js, seed-inbox.js, seed-orders.js, seed-integrations.js, seed-agents.js.
   Steps are replayed from step 0 on every jump (DM.scnApply resets DM.S first), so every id / timestamp below is FIXED. */
(function () {
  if (!window.DM) return;
  const DM = window.DM;

  /* ───────── constants ───────── */
  const TID = 't-9001', CASE = '271026-7', CASE3 = '271026-007';
  const PARTY = 'AC-1004', CONTACT = 'CT-1900', PHONE = '+919870220190', PARTY_NAME = 'ROYAL CURTAIN HOUSE - THANE';
  const T = (hm) => `2026-10-27T${hm}:00+05:30`;
  const addMin = (hm, m) => { let [h, mi] = hm.split(':').map(Number); mi += m; h += Math.floor(mi / 60); mi %= 60; return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0'); };
  const seedNo = () => Math.max(1000, ...(((DM.seed.newhome || {}).drafts) || []).map((d) => d.n || 0)) + 1;

  /* ───────── fake photos (album-page label shots) ───────── */
  const svg = (inner) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 504 352'>${inner}</svg>`);
  const photo = (lines, bg, tint) => svg(`<defs><pattern id='p' width='14' height='14' patternUnits='userSpaceOnUse' patternTransform='rotate(35)'><rect width='14' height='14' fill='${bg}'/><rect width='5' height='14' fill='${tint}' opacity='.55'/></pattern></defs><rect width='504' height='352' fill='url(#p)'/><rect x='118' y='70' width='268' height='${40 + lines.length * 34}' rx='6' fill='#fbfaf6' stroke='#cfc9bb'/><g font-family='Menlo,monospace' font-size='20' fill='#2a2a2a'>${lines.map((l, i) => `<text x='138' y='${106 + i * 34}'>${l.replace(/&/g, '&amp;')}</text>`).join('')}</g>`);
  const IMG_A = photo(['QUALITY  CALISTA', 'LEAF NO  13', 'DESIGN  DM 271506', 'WIDTH  140 CM'], '#d9cfbd', '#b59a76');
  const IMG_B = photo(['QUALITY  ASHVI', 'LEAF NO  10', 'DESIGN  DM 302992', 'WIDTH  137 CM'], '#cfd6c4', '#7d9a6a');
  const IMG_C = photo(['QUALITY  VERONA', 'LEAF NO  9999', 'WIDTH  140 CM', '30 M'], '#cfd6d4', '#8aa39b');

  /* ───────── catalogue lookups (base-newhome styles/variants) ───────── */
  const sv = (S, vid) => { for (const s of S.styles || []) { const v = (s.variants || []).find((x) => x.id === vid); if (v) return { s, v }; } return null; };
  const lbl = (S, vid) => { const f = sv(S, vid); return f ? `${f.s.code} - ${f.v.name}` : vid; };
  const VA = 'v-calista-4', VB = 'v-ashvi-6', VC = 'v-garnet-1'; // 13 / DM 271506 / 59 · 10 / DM 302992 / 50 WINE · 01 / DM 227475 / 33
  const QTY = { [VA]: 60, [VB]: 40, [VC]: 30 };
  const line = (S, n, vid, state) => ({ id: 'l' + n, label: lbl(S, vid), variantId: vid, qty: QTY[vid], unit: 'Meter', state: state || 'ok' });

  /* ───────── thread / message helpers ───────── */
  const th = (S) => (S.threads || []).find((t) => t.id === TID);
  const CHAT = { text: 1, image: 1, audio: 1, file: 1, template: 1, call: 1 };
  const seq = (pfx) => { let k = 0; return () => pfx + '-' + String(++k).padStart(2, '0'); };
  const msgs = (S, list, o) => { const t = th(S); list.forEach((m) => { t.messages.push(m); if (CHAT[m.type]) t.lastAt = m.at; }); if (o && o.unread != null) t.unread = o.unread; return t; };
  const mk = (id) => ({
    cu: (a, text, o) => Object.assign({ id: id(), from: 'customer', type: 'text', at: T(a), text }, o),
    an: (a, text, o) => Object.assign({ id: id(), from: 'anuma', type: 'text', at: T(a), text, ticks: 'read' }, o),
    us: (u, a, text, o) => Object.assign({ id: id(), from: u, type: 'text', at: T(a), text, ticks: 'read' }, o),
    im: (a, src, o) => Object.assign({ id: id(), from: 'customer', type: 'image', at: T(a), src }, o),
    tl: (a, tool, detail, hover) => ({ id: id(), from: 'anuma', type: 'tool', at: T(a), agent: 'Anuma', tool, detail, hover }),
    cm: (a, by, text) => ({ id: id(), from: 'system', type: 'comment', at: T(a), by, text }),
    sy: (a, text, act) => ({ id: id(), from: 'system', type: 'system', at: T(a), text, act }),
  });
  const log = (S, id, hm, actor, title, entity, verb, chip, event) => (S.logs = S.logs || []).unshift({ id, at: T(hm), actor, title, entity, verb, chip, event });
  const hover = (head, sub, label, value, lines) => Object.assign({ head, sub, label }, value ? { value } : {}, lines ? { lines } : {});
  const draftOf = (S) => (S.drafts || []).find((d) => d.id === 'd-' + seedNo());
  const wfRuns = (S) => ((S.workflows || [])[0] || {}).runs;
  const trig = (no, status) => ({ _label: 'Draft order status changed', status, is_test: false, item_count: 3, managed_by: 'anuma', external_id: 'DRF-' + no, previous_status: 'awaiting_confirmation', confidence_score: 0.94 });
  const run = (id, hm, no, ok, err) => ({ id, at: T(hm), version: 3, subject: 'draft_order ' + no, status: ok ? 'Succeeded' : 'Failed', trigger: trig(no, 'confirmed'), steps: [
    { nodeId: 'n-trigger', title: 'Trigger', desc: 'Draft order status changed', status: 'Done', at: T(hm), note: '' },
    { nodeId: 'n-decision', title: 'Decision', desc: '1 condition in 1 group', status: 'Done', at: T(hm), note: 'Took the Yes path.', result: { matched: true, missing: [] } },
    { nodeId: 'n-action', title: 'Action', desc: 'Push draft order to Coral ERP', status: ok ? 'Done' : 'Failed', at: T(hm), note: ok ? '' : '3 attempts', error: ok ? '' : err } ] });
  const bumpNodes = (S, ids) => { const w = (S.workflows || [])[0]; if (!w) return; w.nodes.forEach((n) => { if (ids.includes(n.id) && n.runs) n.runs = Object.assign({}, n.runs, { n: n.runs.n + 1 }); }); };
  const notif = (S, o) => Object.assign({ account: PARTY_NAME, caseNo: CASE, caseId: TID }, o);
  const ORDER_LIST = (S) => [VA, VB, VC].map((v, i) => `${i + 1}. ${lbl(S, v)} — ${QTY[v]}.000 Meter`).join('\n');
  const COMMENT_LINE = 'Please confirm your order:';

  /* ═════════════════════════ STEPS ═════════════════════════ */
  const steps = [
    { id: 'nh-01', at: '17:36', actor: 'Customer', title: 'A dealer messages the order desk', desc: 'Inbound WhatsApp opens case ' + CASE,
      narr: 'Mahesh Patil of ROYAL CURTAIN HOUSE - THANE writes to the NuHome WhatsApp number in Hinglish. The number matches his account, so a new case opens.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        if (th(S)) return; const m = mk(seq('s1'));
        S.threads.unshift({ id: TID, caseNo: CASE, numberId: 'wa-1', channel: 'whatsapp', partyId: PARTY, contactId: CONTACT, phone: PHONE, status: 'open', owner: 'anuma', openedAt: T('17:36'), lastAt: T('17:36'), unread: 1, tags: [], lines: [], messages: [
          m.sy('17:36', `**System** case ${CASE3} opened`, `Case ${CASE3} opened`),
          m.cu('17:36', 'Namaste, Mahesh bol raha hoon Royal Curtain House, Thane se. Order dena tha.')] });
        log(S, 'lg-sc-01', '17:36', 'System', `Case ${CASE3} opened`, 'Case ' + CASE3, 'created', 'auto-drafted', 'case_opened');
      } },
    { id: 'nh-02', at: '17:36', actor: 'Anuma', title: 'Anuma replies instantly', desc: 'Greets by name and asks for the photo',
      narr: 'Order Desk answers in seconds: it asks for a photo of the album page, or the style name and the quantity.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) { const m = mk(seq('s2')); msgs(S, [m.an('17:36', 'Hi Mahesh! Send a photo of the album page, or the style name and quantity, and I\'ll note your order.')], { unread: 0 }); } },
    { id: 'nh-03', at: '17:38', actor: 'Customer', title: 'Two album photos and the quantities', desc: 'Calista and Ashvi, 60 m and 40 m',
      narr: 'Mahesh sends two photographs of album pages and says how many metres he wants of each.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) { const m = mk(seq('s3')); msgs(S, [m.im('17:38', IMG_A, { reaction: '🏷️' }), m.im('17:38', IMG_B, { reaction: '🏷️' }), m.cu('17:38', 'Pehla 60 meter, doosra 40 meter chahiye.')], { unread: 3 }); } },
    { id: 'nh-04', at: '17:38', actor: 'Anuma', title: 'Anuma reads both photos', desc: 'Image Analysis on each label',
      narr: 'Anuma reads the printed labels: quality, leaf number, design and width. The chips under the chat show exactly what it read.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s4'));
        msgs(S, [m.tl('17:38', 'Image Analysis', '', hover('What Anuma read', '1 photograph', 'Read from the image', 'Quality CALISTA · Leaf 13 · Design DM 271506 · 140 CM')),
          m.tl('17:38', 'Image Analysis', '', hover('What Anuma read', '1 photograph', 'Read from the image', 'Quality ASHVI · Leaf 10 · Design DM 302992 · 137 CM')),
          m.an('17:38', 'Checking your photos now, back in a moment.')], { unread: 0 });
      } },
    { id: 'nh-05', at: '17:39', actor: 'Anuma', title: 'Both lines match the catalogue', desc: 'Calista 100%, Ashvi 96%',
      narr: 'Both reads match a variant in the catalogue above the confidence floor, so Anuma adds them to the order with the quantities Mahesh gave.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s5')); const t = th(S); t.lines = [line(S, 1, VA), line(S, 2, VB)];
        msgs(S, [m.tl('17:39', 'Product Search', `— ${lbl(S, VA)} · 100%`, hover('Product match', '1 product', 'Matched in the catalogue', null, [{ name: lbl(S, VA), conf: 100 }])),
          m.tl('17:39', 'Product Search', `— ${lbl(S, VB)} · 96%`, hover('Product match', '1 product', 'Matched in the catalogue', null, [{ name: lbl(S, VB), conf: 96 }])),
          m.an('17:39', `Got it — 2 products added.\n1. ${lbl(S, VA)} — 60.000 Meter\n2. ${lbl(S, VB)} — 40.000 Meter\nAnything else to add?`)]);
      } },
    { id: 'nh-06', at: '17:41', actor: 'Customer', title: 'A third photo, not in the album', desc: 'Verona, leaf 9999, 30 m',
      narr: 'Mahesh adds a third photo. The label reads Verona leaf 9999, which is not in the catalogue.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) { const m = mk(seq('s6')); msgs(S, [m.im('17:41', IMG_C, { reaction: '❓' }), m.cu('17:41', 'Ye wala bhi 30 meter. Ye album mein nahi mila.')], { unread: 2 }); } },
    { id: 'nh-07', at: '17:41', actor: 'Anuma', title: 'Anuma is not sure, and says so', desc: 'Best match 62%, below the 80% floor',
      narr: 'The best match is 62%, below the 80% floor. Anuma does not guess: it flags the line for review and tells the dealer our team is checking this one.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s7')); const t = th(S); t.lines = [line(S, 1, VA), line(S, 2, VB), { id: 'l3', label: 'Leaf No: 9999 · Quality: VERONA', variantId: null, qty: 30, unit: 'Meter', state: 'flagged' }];
        msgs(S, [m.tl('17:41', 'Image Analysis', '', hover('What Anuma read', '1 photograph', 'Read from the image', 'Quality VERONA · Leaf 9999 · 140 CM')),
          m.tl('17:41', 'Product Search', `— ${lbl(S, VC)} · 62%`, hover('Product match', '1 product', 'Best match, below the floor', null, [{ name: lbl(S, VC), conf: 62 }])),
          m.cm('17:41', 'Anuma', 'Agent flagged 1 line(s) for review:\n- Leaf No: 9999\nQuality: VERONA\nDesign: VERONA\nWidth: 140 CM\n30 M'),
          m.an('17:41', 'Our team is checking this one.', { quote: { who: PHONE, text: '[image]' } })], { unread: 0 });
      } },
    { id: 'nh-08', at: '17:42', actor: 'Anuma', title: 'Handed to the ASM, Pankaj Rane', desc: 'Status Escalated · Pankaj notified',
      narr: 'Anuma hands the case to Pankaj Rane, the account\'s ASM. The status flips to Escalated, a 15 minute response clock starts, and the bell lights up for Pankaj.',
      route: '/inbox/threads?thread=' + TID,
      notifies: [{ type: 'review', title: 'Product for review', account: PARTY_NAME, caseNo: CASE, caseId: TID, at: T('17:42'), preview: 'A product the customer sent couldn\'t be matched confidently.', thumb: '#cfd6d4' }],
      apply(S) {
        const m = mk(seq('s8')); const t = th(S);
        msgs(S, [m.sy('17:42', '**Anuma handed this over** — intake line item review · pending'), m.sy('17:42', '**System** set status to **Escalated**'),
          m.cm('17:42', 'System', 'Escalated to human: Customer message needs a human: no automatic handler for this line.'), m.sy('17:42', '**System** assigned conversation to **Pankaj Rane**')]);
        Object.assign(t, { status: 'escalated', owner: 'u-pankaj', handoffAt: T('17:42'), escalatedAt: T('17:42'), task: 'Confirm product', slaDueAt: T('17:57') });
        log(S, 'lg-sc-02', '17:42', 'System', `Updated Case ${CASE3} (Changed fields: status, owner)`, 'Case ' + CASE3, 'updated', 'logged', 'case_escalated');
      } },
    { id: 'nh-09', at: '17:55', actor: 'Pankaj Rane', title: 'Pankaj picks it up and resolves the line', desc: 'Attaches the right variant',
      narr: 'Thirteen minutes in, Pankaj opens the case, recognises the design, attaches the right variant and tells the dealer in his own words.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s9')); const t = th(S);
        msgs(S, [m.sy('17:55', '**Pankaj Rane** assigned conversation to **self**'),
          m.us('u-pankaj', '17:55', 'Namaste Mahesh ji, Pankaj here from NuHome. That one is Garnet 01 from the same album family. Noting 30 meter.'),
          m.cm('17:55', 'u-pankaj', `[Anuma] Attached variant ${lbl(S, VC)} to Enquiry Line #712.`),
          m.tl('17:56', 'A reviewer resolved', `— ${lbl(S, VC)}`, hover('Review', 'Resolved by Pankaj Rane', 'Attached variant', lbl(S, VC)))]);
        t.lines = [line(S, 1, VA), line(S, 2, VB), line(S, 3, VC)];
        log(S, 'lg-sc-03', '17:56', 'Pankaj Rane', `Updated Enquiry Line #712: ${lbl(S, VC)} - 30.000 Meter (Changed fields: variant)`, 'Enquiry Line #712', 'updated', 'logged', 'line_resolved');
      } },
    { id: 'nh-10', at: '17:57', actor: 'Customer', title: 'The dealer confirms it is the right design', desc: '"Haan wahi hai"',
      narr: 'Mahesh confirms it is the design he meant.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) { const m = mk(seq('s10')); msgs(S, [m.cu('17:57', 'Haan wahi hai, sahi pakda.')], { unread: 1 }); } },
    { id: 'nh-11', at: '17:58', actor: 'Pankaj Rane', title: 'Pankaj hands the case back to Anuma', desc: 'Owner flips back, case is Open again',
      narr: 'Pankaj\'s part is done. He hands the case back, the owner flips to Anuma everywhere, and the task disappears from Home.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s11')); const t = th(S);
        msgs(S, [m.sy('17:58', '**System** set status to **Open**'), m.sy('17:58', '**Pankaj Rane** handed back the conversation to **Anuma**'),
          m.an('17:58', `Got it — ${lbl(S, VC)} added.\nAnything else to add?`, { quote: { who: PHONE, text: 'Haan wahi hai, sahi pakda.' } })], { unread: 0 });
        Object.assign(t, { status: 'open', owner: 'anuma', task: null, slaDueAt: null });
        log(S, 'lg-sc-04', '17:58', 'Pankaj Rane', `Updated Case ${CASE3} (Changed fields: status, owner)`, 'Case ' + CASE3, 'updated', 'logged', 'case_handed_back');
      } },
    { id: 'nh-12', at: '17:59', actor: 'Anuma', title: 'Anuma asks the dealer to confirm', desc: 'Confirm · Edit · Cancel buttons',
      narr: 'Mahesh says that is all. Anuma reads the whole order back with three reply buttons.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s12'));
        msgs(S, [m.cu('17:59', 'Bas itna hi, order kar do.'), m.an('17:59', COMMENT_LINE + '\n' + ORDER_LIST(S), { buttons: ['Confirm', 'Edit', 'Cancel'] })], { unread: 0 });
      } },
    { id: 'nh-13', at: '18:00', actor: 'Customer', title: 'The dealer taps Confirm, the case closes', desc: 'Converted to a draft order',
      narr: 'One tap on Confirm. Anuma writes the resolution summary, closes the case and thanks the dealer. The enquiry becomes a draft order.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const m = mk(seq('s13')); const t = th(S); const dn = DM.orders.nextNo(S);
        msgs(S, [m.cu('18:00', 'Confirm', { quote: { who: 'Anuma', text: (COMMENT_LINE + ' ' + ORDER_LIST(S)).replace(/\n/g, ' ') }, reaction: '✅' }),
          m.cm('18:00', 'Anuma', `Resolution summary — enquiry #190: Converted to DRF-${dn}.\n${ORDER_LIST(S)}`),
          m.sy('18:00', `**System** closed — **Intake enquiry converted → DraftOrder #${dn}**`, `System closed — Intake enquiry converted → DraftOrder #${dn}`),
          m.sy('18:00', '**System** set status to **Closed**'),
          m.an('18:00', `Thanks — your order (DRF-${dn}) is confirmed! We'll get started on it right away.`, { quote: { who: PHONE, text: 'Confirm' } })], { unread: 0 });
        t.status = 'closed'; t.draftNo = 'DRF-' + dn;
      } },
    { id: 'nh-14', at: '18:01', actor: 'Anuma', title: 'The draft order appears in Orders', desc: 'DRF created with three lines',
      narr: 'In Orders the new draft shows its three lines, the case it came from, how long it took to close, and one intervention: Pankaj\'s.',
      get route() { return '/orders/drafts/d-' + seedNo(); },
      apply(S) {
        const n = DM.orders.nextNo(S); const d = DM.orders.addDraft(S, { n, createdAt: T('18:01'), partyId: PARTY, contactId: CONTACT, caseId: TID, caseNo: CASE, assigned: 'agent', assignees: ['agent', 'u-pankaj'], status: 'pending', timeToCloseMin: 25, interventions: 1,
          lines: [VA, VB, VC].map((v, i) => { const f = sv(S, v); return { n: i + 1, styleId: f.s.id, variantId: v, name: f.s.name || f.s.code, variant: f.v.name, style: f.s.code, qty: QTY[v], unit: 'Meter', state: 'confirmed' }; }), erp: null });
        const ag = (S.agents || []).find((a) => a.id === 'anuma'); if (ag) ag.activity.unshift({ id: 'ac-sc-1', at: T('18:01'), kind: 'created', text: `Created Draft Order DRF-${n} from case ${CASE3}`, actor: 'Anuma' });
        log(S, 'lg-sc-05', '18:01', 'Anuma', `Created Draft Order: DRF-${n} (3 lines, ${PARTY_NAME})`, 'Draft Order DRF-' + n, 'created', 'auto-drafted', 'draft_order_drafted');
      } },
    { id: 'nh-15', at: '18:04', actor: 'Rohan Mehta', title: 'The team confirms the draft', desc: 'Status Confirmed · workflow triggers',
      narr: 'Rohan reviews the draft and confirms it. A draft order changing status triggers the "Coral DraftOrder → SalesOrder Sync" workflow, and the push to Coral ERP starts.',
      get route() { return '/orders/drafts/d-' + seedNo(); },
      apply(S) {
        const d = draftOf(S); if (!d) return;
        Object.assign(d, { status: 'confirmed', assigned: 'u-rohan', assignees: ['agent', 'u-pankaj', 'u-rohan'], erp: { system: 'Coral ERP', outcome: null, transaction: 'CRL-48921', orderRef: null, customerRef: PARTY, sentAt: T('18:04'), responseAt: null, lineCount: 3, error: null } });
        log(S, 'lg-sc-06', '18:04', 'Rohan Mehta', `Updated Draft Order: DRF-${d.n} (Changed fields: status)`, 'Draft Order DRF-' + d.n, 'updated', 'confirmed', 'draft_order_confirmed');
      } },
    { id: 'nh-16', at: '18:04', actor: 'Coral ERP', title: 'Coral rejects the order, 422', desc: 'Customer does not exist in Coral',
      narr: 'Coral answers 422: the customer AC-1004 does not exist on the Coral side yet. The draft turns Failed, the ERP box shows the error, and Rohan is notified.',
      get route() { return '/orders/drafts/d-' + seedNo(); },
      notifies: [{ type: 'changes', title: 'Coral push failed', account: PARTY_NAME, caseNo: CASE, caseId: TID, at: T('18:04'), preview: 'The draft order was rejected by Coral ERP: customer does not exist.' }],
      apply(S) {
        const d = draftOf(S); if (!d) return; const no = 'DRF-' + d.n; const err = `HTTP 422 · Customer ${PARTY} does not exist in Coral ERP`;
        Object.assign(d, { status: 'failed', erp: Object.assign({}, d.erp, { outcome: 'error', responseAt: T('18:04'), error: err }) });
        (S.erpLog = S.erpLog || []).unshift({ id: 'erp-sc-1', app: 'coral-erp', action: 'push_sales_order', kind: 'push', state: 'failed', at: T('18:04'), draftNo: no, ref: 'DMO-' + no, endpoint: 'POST /api/v2/sales-orders', status: 422, result: `Rejected by Coral: customer ${PARTY} does not exist`, error: `customer ${PARTY} does not exist in Coral ERP` });
        const r = wfRuns(S); if (r) r.unshift(run('run-sc-1', '18:04', d.n, false, `Customer does not exist: ${PARTY_NAME}`)); bumpNodes(S, ['n-trigger', 'n-decision', 'n-action']);
        log(S, 'lg-sc-07', '18:04', 'System', `Created App Event Log: Coral ERP — push_sales_order — ${no} [failed]`, 'App Event Log', 'created', 'failed', 'coral_push_failed');
      } },
    { id: 'nh-17', at: '18:09', actor: 'Pankaj Rane', title: 'The customer is synced into Coral', desc: 'Sync Customers on the Coral ERP page',
      narr: 'Pankaj opens the Coral ERP app and runs Sync Customers. The dealer now exists in Coral, with the same account number.',
      route: '/settings/integrations/coral-erp',
      apply(S) {
        (S.erpLog = S.erpLog || []).unshift({ id: 'erp-sc-2', app: 'coral-erp', action: 'Sync Customers', kind: 'sync', state: 'success', at: T('18:09'), result: 'customers: 0 errors, 1 created, 0 updated' });
        log(S, 'lg-sc-08', '18:09', 'Pankaj Rane', 'Updated App: Coral ERP (Sync Customers: 1 created)', 'App Coral ERP', 'updated', 'logged', 'coral_customers_synced');
      } },
    { id: 'nh-18', at: '18:10', actor: 'Coral ERP', title: 'Retry succeeds, 201', desc: 'Sales order created in Coral',
      narr: 'He retries the failed push from the sync log. Coral answers 201 and returns its own sales-order reference. The workflow run flips to Succeeded.',
      route: '/settings/integrations/coral-erp',
      apply(S) {
        const d = draftOf(S); if (!d) return; const no = 'DRF-' + d.n; const ref = 'SO-26-04905';
        const row = (S.erpLog || []).find((r) => r.id === 'erp-sc-1'); if (row) Object.assign(row, { state: 'success', at: T('18:10'), status: 201, result: `Sales order created · Coral ref ${ref} · 3 lines`, error: null });
        Object.assign(d, { status: 'posted', erp: Object.assign({}, d.erp, { outcome: 'ok', orderRef: ref, responseAt: T('18:10'), error: null }) });
        const r = wfRuns(S); if (r) { r.unshift(run('run-sc-2', '18:10', d.n, true)); } bumpNodes(S, ['n-trigger', 'n-decision', 'n-action']);
        log(S, 'lg-sc-09', '18:10', 'System', `Created App Event Log: Coral ERP — push_sales_order — ${no} [confirmed]`, 'App Event Log', 'created', 'confirmed', 'coral_push_confirmed');
      } },
    { id: 'nh-19', at: '18:11', actor: 'Coral ERP', title: 'The draft is Posted, with Coral\'s reference', desc: 'Back in Orders',
      narr: 'Back in Orders the draft is Posted. Its Coral ERP box carries the sales-order reference, the customer reference and the response time.',
      get route() { return '/orders/drafts/d-' + seedNo(); },
      apply() {} },
    { id: 'nh-20', at: '18:13', actor: 'Anuma', title: 'Anuma tells the dealer', desc: 'Booking reference sent on WhatsApp',
      narr: 'Anuma sends the dealer the Coral reference on WhatsApp. The 24-hour window is still open, so it goes as a normal message, and a comment records it on the case.',
      route: '/inbox/threads?thread=' + TID,
      apply(S) {
        const d = draftOf(S); if (!d) return; const m = mk(seq('s20'));
        msgs(S, [m.an('18:13', `Your order DRF-${d.n} is booked — reference SO-26-04905. We'll share the dispatch details once it's packed.`), m.cm('18:13', 'Anuma', `Posted to Coral ERP: SO-26-04905 (DRF-${d.n}).`)]);
      } },
    { id: 'nh-21', at: '18:16', actor: 'Customer', title: 'The dealer asks about dispatch', desc: 'The case re-opens and goes to Rohan',
      narr: 'Mahesh asks when it ships. Anuma cannot answer that on its own, so the case re-opens and goes to Rohan Mehta as an "Answer question" task.',
      route: '/inbox/threads?thread=' + TID,
      notifies: [{ type: 'handoff', title: 'Hand-off', account: PARTY_NAME, caseNo: CASE, caseId: TID, at: T('18:16'), preview: 'Customer asked: "Dispatch kab tak hoga?"' }],
      apply(S) {
        const m = mk(seq('s21')); const t = th(S);
        msgs(S, [m.sy('18:16', `**System** ${PHONE} re-opened the conversation`, `${PHONE} re-opened the conversation`), m.cu('18:16', 'Dispatch kab tak hoga?'), m.an('18:16', 'Our team is looking into this and will get back to you shortly.'),
          m.sy('18:16', '**System** set status to **Escalated**'), m.cm('18:16', 'System', 'Escalated to human: Customer asked: "Dispatch kab tak hoga?"'), m.sy('18:16', '**System** assigned conversation to **Rohan Mehta**')], { unread: 1 });
        Object.assign(t, { status: 'escalated', owner: 'u-rohan', handoffAt: T('18:16'), escalatedAt: T('18:16'), task: 'Answer question', slaDueAt: T('18:31') });
      } },
    { id: 'nh-22', at: '18:18', actor: 'System', title: 'Home reflects all of it', desc: 'Orders, replies and the waiting task',
      narr: 'Home has moved on its own: today\'s orders and line items are up, the reply times include Order Desk\'s answers, and Rohan\'s new hand-off sits under Waiting.',
      route: '/dashboard',
      apply() {} },
  ];

  DM.defineUC('newhome', {
    short: 'NewHome use case', tagline: 'Orders to Coral', icon: 'inbox', home: '/inbox/threads',
    about: 'A curtain-fabric dealer orders over WhatsApp with photos. Anuma reads the labels and matches the catalogue, hands the one uncertain line to the ASM, closes the case into a draft order, and pushes it to Coral ERP. The first push fails, the ASM fixes the customer in Coral, and the retry succeeds.',
    steps,
  });
})();
