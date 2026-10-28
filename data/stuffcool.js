/* data/stuffcool.js — "Stuffcool use case · Inbox to Tally".
   Scenario only: it starts in the Inbox (WhatsApp order: text, voice note, handwritten-list photo), the order becomes a draft in Draft Orders,
   the Tally voucher push fails (ledger not found), the ledger is mapped on the Tally app page, the retry succeeds, and the Dashboard moves.
   All seed data lives in the base-/seed- files; every step here mutates DM.S (replayed from a clean seed, ids are fixed). */
(function () {
  if (!window.DM) return;
  const DM = window.DM;

  /* ───────── fixed ids / helpers ───────── */
  const TID = 't-13', CASE = '1013', DID = 'd-1033', DNO = 'DRF-1033', DN = 1033, PARTY = 'AC-1005', CONTACT = 'CT-1900', ME = 'u-rohan';
  const iso = (hm, s = 0) => `2026-10-27T${hm}:${String(s).padStart(2, '0')}+05:30`;                       // threads / messages / drafts / notifications
  const utc = (hm, s = 0) => new Date(Date.parse(iso(hm, s))).toISOString();                              // logs / erpLog (seed uses UTC "Z")
  const svg = (w, h, inner) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${inner}</svg>`);
  const LIST_IMG = svg(504, 352, `<rect width='504' height='352' fill='#e9e4d8'/><rect x='34' y='20' width='436' height='312' rx='6' fill='#fbf9f2' stroke='#cfc8b6'/>` +
    [66, 104, 142, 180, 218, 256, 294].map((y) => `<line x1='54' y1='${y}' x2='450' y2='${y}' stroke='#c9d6e8' stroke-width='1.2'/>`).join('') + `<line x1='84' y1='28' x2='84' y2='326' stroke='#e5a3a3' stroke-width='1.2'/>` +
    `<g font-family='Georgia,serif' font-style='italic' fill='#26405f'><text x='98' y='60' font-size='20'>Dealer order – Sharma Mobile Hub</text><text x='98' y='98' font-size='19'>20W adapter white – 100 pcs</text><text x='98' y='136' font-size='19'>(retail box not needed)</text><text x='98' y='174' font-size='17' fill='#6a7d99'>Diwali dispatch – by Wed pls</text></g>` +
    `<path d='M92 112 q150 10 300 0' stroke='#26405f' stroke-width='1.6' fill='none'/>`);

  const S_ = (S, id) => (S.styles || []).find((s) => s.id === id) || { name: id, code: id, variants: [] };
  const V_ = (S, vid) => { for (const s of S.styles || []) { const v = (s.variants || []).find((x) => x.id === vid); if (v) return { s, v }; } return { s: {}, v: {} }; };
  const lbl = (S, vid) => { const { s, v } = V_(S, vid); return `${s.name} - ${v.name}`; };
  const tally = (S) => (S.apps || []).find((a) => a.slug === 'tally');
  const th = (S) => (S.threads || []).find((t) => t.id === TID);
  const draft = (S) => (S.drafts || []).find((d) => d.id === DID);
  const agent = (S) => (S.agents || []).find((a) => a.id === 'order-desk');
  const wf = (S) => (S.workflows || [])[0];

  // the order: [variantId, qty]
  const ORDER = [['v-sc012-2', 50], ['v-sc034-2', 30], ['v-sc020-1', 40], ['v-sc026-1', 25], ['v-sc039-1', 20], ['v-sc010-1', 100]];
  const total = (S) => ORDER.reduce((a, [vid, q]) => a + q * (V_(S, vid).v.price || 0), 0);
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const line = (S, i, state) => { const [vid, q] = ORDER[i]; return { id: 'l' + (i + 1), label: lbl(S, vid), variantId: vid, qty: q, unit: 'Pcs', state: state || 'ok' }; };

  // message builders (fixed ids)
  const mk = (id, m) => Object.assign({ id: 'sc13-' + id }, m);
  const cu = (id, hm, text, o) => mk(id, Object.assign({ from: 'customer', type: 'text', at: iso(hm), text }, o));
  const an = (id, hm, text, o) => mk(id, Object.assign({ from: 'anuma', type: 'text', at: iso(hm), text, ticks: 'read' }, o));
  const tool = (id, hm, tool_, detail, hover) => mk(id, { from: 'anuma', type: 'tool', at: iso(hm), agent: 'Order Desk', tool: tool_, detail, hover });
  const sys = (id, hm, text, act) => mk(id, { from: 'system', type: 'system', at: iso(hm), text, act });
  const cmt = (id, hm, by, text) => mk(id, { from: 'system', type: 'comment', at: iso(hm), by, text });
  const push = (S, ...msgs) => { const t = th(S); msgs.forEach((m) => t.messages.push(m)); const vis = t.messages.filter((m) => ({ text: 1, image: 1, audio: 1, file: 1, template: 1, call: 1 })[m.type]); t.lastAt = vis[vis.length - 1].at; return t; };
  const logRow = (S, id, hm, actor, title, verb, chip, event, entity) => { (S.logs = S.logs || []).unshift({ id: 'lg-sc-' + id, at: utc(hm), actor, title, entity, verb, chip, event }); };
  const bumpWf = (S, ok) => { const w = wf(S); if (!w) return; const n = (id) => w.nodes.find((x) => x.id === id); ['n-trigger', 'n-decision', 'n-action'].forEach((id) => { n(id).runs.n += 1; }); if (ok) n('n-end-true').runs.n += 1; const t = n('n-trigger').runs.n; w.nodes.forEach((x) => { x.runs.pct = Math.round((x.runs.n / t) * 100); }); };
  const run = (S, id, hm, s, ok, err) => {
    const w = wf(S); if (!w) return; const at = iso(hm, s);
    w.runs.unshift({ id, at, version: w.version || 2, subject: 'draft_order ' + DN, status: ok ? 'Succeeded' : 'Failed',
      trigger: { _label: 'Draft order status changed', error: null, status: 'confirmed', is_test: false, created_at: iso('17:12'), expires_at: iso('17:12').replace('27T', '28T'), item_count: ORDER.length, managed_by: 'anuma', external_id: DNO, previous_status: 'awaiting_confirmation', confidence_score: 0.94, last_activity_at: at },
      steps: [{ nodeId: 'n-trigger', title: 'Trigger', desc: 'Draft order status changed', status: 'Done', at, note: '' }, { nodeId: 'n-decision', title: 'Decision', desc: '1 condition in 1 group', status: 'Done', at, note: 'Took the Yes path.', result: { matched: true, missing: [] } },
        { nodeId: 'n-action', title: 'Action', desc: 'Post sales voucher to Tally', status: ok ? 'Done' : 'Failed', at: iso(hm, s + 2), note: ok ? '' : '3 attempts', error: ok ? '' : err }] });
    bumpWf(S, ok);
  };
  const tallyErp = (S, o) => Object.assign({ system: 'Tally', outcome: null, transaction: null, voucherNo: null, voucherType: 'Sales Order', ledger: 'Sharma Mobile Hub', customerRef: PARTY, sentAt: null, responseAt: null, lineCount: ORDER.length, error: null }, o);
  const erpRow = (S) => (S.erpLog || []).find((r) => r.id === 'erp-sc-1');

  /* ───────── steps ───────── */
  const steps = [
    { id: 'sc-01', at: '17:00', actor: 'Dealer', title: 'Sharma Mobile Hub messages the order desk', desc: 'A new WhatsApp case opens in the Inbox.',
      narr: 'Rakesh Sharma from Sharma Mobile Hub writes in on the Stuffcool WhatsApp number. Anuma opens case 1013 and matches the phone to the dealer in CRM.',
      route: '/inbox/threads?case=' + TID,
      apply(S) {
        const t = tally(S); if (t && t.config) t.config.ledgerMap = (t.config.ledgerMap || []).filter((m) => m.party !== 'Sharma Mobile Hub');   // the Tally ledger for this dealer has not been mapped yet
        (S.threads = S.threads || []).unshift({ id: TID, caseNo: CASE, numberId: 'wa-1', channel: 'whatsapp', partyId: PARTY, contactId: CONTACT, phone: '+919820145577', status: 'open', owner: 'anuma', openedAt: iso('17:00'), lastAt: iso('17:00'), unread: 1, tags: [], slaDueAt: iso('17:15'), lines: [],
          messages: [sys('s1', '17:00', '**System** case **CASE-1013** opened', 'Case CASE-1013 opened'), cu('m1', '17:00', 'Hello bhai, Diwali ke liye stock mangwana hai 🙏')] });
        logRow(S, 1, '17:00', 'System', 'Case CASE-1013 opened', 'created', 'auto-drafted', 'case_opened', 'case #913');
      } },
    { id: 'sc-02', at: '17:01', actor: 'Dealer', title: 'The dealer types the order', desc: 'Anuma greets and the dealer sends two lines.',
      narr: 'Order Desk greets the dealer and asks for model and quantity. The dealer answers with two lines in one message.',
      route: '/inbox/threads?case=' + TID,
      apply(S) { push(S, an('m2', '17:01', 'Hi! Thanks for reaching out to Stuffcool. Tell us what you need — product name and quantity — and we\'ll take it from there.'), cu('m3', '17:01', '50 pcs 65W GaN charger green aur 30 pcs MagSafe clear case Realme 12 Pro white')); th(S).unread = 1; } },
    { id: 'sc-03', at: '17:02', actor: 'Order Desk', title: 'Anuma reads and matches both lines', desc: 'Two catalogue matches above 90%.',
      narr: 'Order Desk matches the charger (96%) and the Realme case (97%) in the catalogue and reads the quantities back.',
      route: '/inbox/threads?case=' + TID,
      apply(S) {
        const l1 = lbl(S, ORDER[0][0]), l2 = lbl(S, ORDER[1][0]);
        push(S, tool('t1', '17:02', 'Product Search', '— ' + l1 + ' · 96%', { head: 'Product match', sub: '2 products', label: 'Matched in the catalogue', lines: [{ name: l1, conf: 96 }, { name: l2, conf: 97 }] }),
          an('m4', '17:02', `Got it — here's what I have so far:\n1. ${l1} — 50.000 Pcs\n2. ${l2} — 30.000 Pcs\nAnything else to add?`));
        th(S).lines = [line(S, 0), line(S, 1)]; th(S).unread = 0;
      } },
    { id: 'sc-04', at: '17:04', actor: 'Dealer', title: 'The dealer sends a voice note', desc: 'An 18-second Hinglish voice note adds more items.',
      narr: 'Typing is slow, so the dealer records a voice note: 40 cables, 25 neckbands and a OnePlus 12 rugged cover.',
      route: '/inbox/threads?case=' + TID,
      apply(S) { push(S, mk('m5', { from: 'customer', type: 'audio', at: iso('17:04'), seconds: 18, transcript: 'bhai 40 pcs type c lightning cable grey, 25 pcs neckband blue bhi daal dena, aur woh OnePlus 12 ka rugged cover white wala 20 pcs' })); th(S).unread = 1; } },
    { id: 'sc-05', at: '17:05', actor: 'Order Desk', title: 'Anuma listens and transcribes', desc: 'Two lines match; the OnePlus cover is below the floor.',
      narr: 'Order Desk transcribes the voice note, matches the cable (93%) and the neckband (91%), and flags the OnePlus cover: the best match is only 62%, below the 80% floor.',
      route: '/inbox/threads?case=' + TID,
      apply(S) {
        const l3 = lbl(S, ORDER[2][0]), l4 = lbl(S, ORDER[3][0]), best = lbl(S, 'v-sc037-3');
        const tr = '"bhai 40 pcs type c lightning cable grey, 25 pcs neckband blue bhi daal dena, aur woh OnePlus 12 ka rugged cover white wala 20 pcs"';
        push(S, tool('t2', '17:05', 'Audio Transcription', '', { head: 'What Order Desk read', sub: '1 voice note', label: 'Read from the voice note', value: tr }),
          tool('t3', '17:05', 'Product Search', '— ' + l3 + ' · 93%', { head: 'Product match', sub: '3 products', label: 'Matched in the catalogue', lines: [{ name: l3, conf: 93 }, { name: l4, conf: 91 }, { name: best, conf: 62 }] }),
          an('m6', '17:05', `Voice note mil gaya. Added:\n3. ${l3} — 40.000 Pcs\n4. ${l4} — 25.000 Pcs\nI'm checking the OnePlus cover with our team.`));
        const t = th(S); t.lines = [line(S, 0), line(S, 1), line(S, 2), line(S, 3), { id: 'l5', label: best, variantId: 'v-sc037-3', qty: 20, unit: 'Pcs', state: 'flagged' }]; t.unread = 0;
      } },
    { id: 'sc-06', at: '17:07', actor: 'Dealer', title: 'The dealer sends a photo of a handwritten list', desc: 'One more line, written on paper.', narr: 'The dealer adds one more line with a photo of his handwritten list.',
      route: '/inbox/threads?case=' + TID,
      apply(S) { push(S, mk('m7', { from: 'customer', type: 'image', at: iso('17:07'), src: LIST_IMG, reaction: '🧐' })); th(S).unread = 1; } },
    { id: 'sc-07', at: '17:08', actor: 'Order Desk', title: 'Anuma reads the photo and hands the case to Rohan', desc: 'The flagged line needs a person.',
      narr: 'Order Desk reads the paper (20W adapter, white, 100 pcs) with 90% confidence. Because the OnePlus cover is below the confidence floor, the case is handed to Rohan Mehta and a notification goes out.',
      route: '/inbox/threads?case=' + TID,
      notifies: [{ type: 'review', title: 'Product for review', account: 'Sharma Mobile Hub', caseNo: CASE, caseId: TID, at: iso('17:08'), preview: "A product the customer sent couldn't be matched confidently.", thumb: '#cdb99a' },
        { type: 'assigned', title: 'Chat assigned to you', account: 'Sharma Mobile Hub', caseNo: CASE, caseId: TID, at: iso('17:08'), preview: 'Voice note (0:18)' }],
      apply(S) {
        const l6 = lbl(S, ORDER[5][0]);
        push(S, tool('t4', '17:08', 'Image Analysis', '', { head: 'What Order Desk read', sub: '1 photograph', label: 'Read from the image', value: '20W adapter white — 100 pcs' }),
          tool('t5', '17:08', 'Product Search', '— ' + l6 + ' · 90%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: l6, conf: 90 }] }),
          an('m8', '17:08', `Added: ${l6} — 100.000 Pcs.\nOne line needs a person to confirm — our team is checking it.`),
          sys('s2', '17:08', '**System** set status to **Escalated**'),
          cmt('c1', '17:08', 'System', 'Agent flagged 1 line(s) for review:\n- Rugged Armor Back Case For OnePlus 12 — best match 62%, below the 80% floor\n20 (pcs)'),
          sys('s3', '17:08', '**System** assigned conversation to **Rohan Mehta**'));
        const t = th(S); t.lines = [line(S, 0), line(S, 1), line(S, 2), line(S, 3), t.lines[4], line(S, 5)]; Object.assign(t, { status: 'escalated', owner: ME, handoffAt: iso('17:08'), escalatedAt: iso('17:08'), task: 'Confirm product', slaDueAt: iso('17:23'), unread: 0 });
        logRow(S, 2, '17:08', 'System', 'Updated Case: CASE-1013 (Changed fields: status, owner)', 'updated', 'logged', 'case_updated', 'case #913');
      } },
    { id: 'sc-08', at: '17:10', actor: 'Rohan Mehta', title: 'Rohan picks the right cover and hands back', desc: 'The flagged line is resolved; Anuma takes over again.',
      narr: 'Rohan opens the case, attaches the White OnePlus 12 rugged cover to the flagged line and hands the case back to Anuma.',
      route: '/inbox/threads?case=' + TID,
      apply(S) {
        const pick = lbl(S, 'v-sc039-1');
        push(S, cmt('c2', '17:10', 'Rohan Mehta', `[Rohan] Attached variant ${pick} to the line.`), sys('s4', '17:10', '**Rohan Mehta** handed back the conversation to **Anuma**'),
          an('m9', '17:10', 'Our team confirmed the OnePlus cover — white. Adding it now.'));
        const t = th(S); t.lines[4] = line(S, 4); Object.assign(t, { status: 'open', owner: 'anuma' }); delete t.task; delete t.handoffAt; delete t.escalatedAt; t.slaDueAt = iso('17:25');
      } },
    { id: 'sc-09', at: '17:11', actor: 'Order Desk', title: 'Anuma sends the confirmation', desc: 'Six lines, with Confirm / Edit / Cancel buttons.',
      narr: 'Order Desk reads the full order back with interactive buttons.',
      route: '/inbox/threads?case=' + TID,
      apply(S) { push(S, an('m10', '17:11', 'Please confirm your order:\n' + ORDER.map(([vid, q], i) => `${i + 1}. ${lbl(S, vid)} — ${q}.000 Pcs`).join('\n'), { buttons: ['Confirm', 'Edit', 'Cancel'] })); } },
    { id: 'sc-10', at: '17:12', actor: 'Dealer', title: 'The dealer taps Confirm — a draft order is created', desc: 'Case 1013 closes and DRF-1033 is created.',
      narr: 'The dealer taps Confirm. Anuma closes the case with a resolution comment and creates draft order DRF-1033 (pending) in Draft Orders. Dashboard "Drafts pending" goes up by one.',
      route: '/inbox/threads?case=' + TID,
      apply(S) {
        const party = (S.parties || []).find((p) => p.id === PARTY) || {};
        DM.orders.addDraft(S, { id: DID, n: DN, createdAt: iso('17:12'), partyId: PARTY, partyName: party.name, contactId: CONTACT, caseId: TID, caseNo: CASE, assigned: 'agent', assignees: ['agent', ME], status: 'pending', channel: 'whatsapp', timeToCloseMin: 12, interventions: 1,
          lines: ORDER.map(([vid, q], i) => { const { s, v } = V_(S, vid); return { n: i + 1, styleId: s.id, variantId: vid, name: s.name, variant: v.name, style: s.code, qty: q, unit: 'Piece', state: 'confirmed' }; }), erp: null });
        push(S, cu('m11', '17:12', 'Confirm', { reaction: '✅', quote: { who: 'Order Desk', text: 'Please confirm your order:' } }),
          cmt('c3', '17:12', 'Anuma', `Resolution summary — enquiry #231: Converted to Draft #${DN}.\n` + ORDER.map(([vid, q], i) => `${i + 1}. ${lbl(S, vid)} — ${q}.000 Pcs`).join('\n')),
          sys('s5', '17:12', `**System** closed — **Intake enquiry converted → DraftOrder #${DN}**`, `System closed — Intake enquiry converted → DraftOrder #${DN}`),
          an('m12', '17:12', 'Thanks — your order is confirmed. Our team will take it from here.', { quote: { who: '+919820145577', text: 'Confirm' } }));
        const t = th(S); Object.assign(t, { status: 'closed', owner: 'anuma', draftNo: DNO, unread: 0 }); delete t.slaDueAt;
        logRow(S, 3, '17:12', 'System', 'Created Draft Order: ' + DNO, 'created', 'auto-drafted', 'draft_order_created', 'draft order #' + DN);
        const a = agent(S); if (a) (a.activity = a.activity || []).unshift({ id: 'ac-sc-1', at: iso('17:12'), kind: 'created', text: `Created Draft Order: ${DNO} from case CASE-1013`, actor: 'Order Desk' });
      } },
    { id: 'sc-11', at: '17:13', actor: 'Draft Orders', title: 'DRF-1033 appears in Draft Orders', desc: 'Pending, with an empty Tally voucher box.',
      narr: 'The draft lands in Draft Orders as pending: six lines, one intervention, and a Tally voucher box that has not been sent yet.',
      route: '/orders/drafts/' + DID,
      notifies: [{ type: 'changes', title: 'Draft order to review', account: 'Sharma Mobile Hub', caseNo: CASE, caseId: TID, at: iso('17:13'), href: '/orders/drafts/' + DID, preview: `${DNO} · 6 lines is waiting for your review.` }],
      apply(S) { draft(S).erp = tallyErp(S, { ledger: null }); } },
    { id: 'sc-12', at: '17:14', actor: 'Rohan Mehta', title: 'Rohan confirms the draft; the workflow starts', desc: 'Pending goes down; the Tally push begins.',
      narr: 'Rohan confirms the draft. "Pending" drops by one on the Dashboard, and the Draft Order → Tally Voucher Sync workflow starts posting the sales voucher.',
      route: '/orders/drafts/' + DID,
      apply(S) {
        const d = draft(S); Object.assign(d, { status: 'confirmed', assigned: ME, assignees: ['agent', ME] }); d.erp = tallyErp(S, { transaction: 'TLY-7931', sentAt: iso('17:14', 11) });
        (S.erpLog = S.erpLog || []).unshift({ id: 'erp-sc-1', app: 'tally', action: 'push_voucher', kind: 'push', state: 'pending', at: utc('17:14', 11), draftNo: DNO, ref: null, endpoint: 'POST /tally/vouchers', status: null, result: 'Posting sales voucher…' });
        logRow(S, 4, '17:14', 'Rohan Mehta', `Updated Draft Order: ${DNO} (Changed fields: status)`, 'updated', 'logged', 'draft_order_updated', 'draft order #' + DN);
      } },
    { id: 'sc-13', at: '17:14', actor: 'Tally', title: 'Tally rejects the voucher: ledger not found', desc: 'The draft shows an error in the Tally box.',
      narr: 'Tally answers with HTTP 400: there is no ledger called "Sharma Mobile Hub". The draft turns to failed, the workflow run fails, and Rohan is notified.',
      route: '/orders/drafts/' + DID,
      notifies: [{ type: 'escalated', title: 'Tally push failed', account: 'Sharma Mobile Hub', caseNo: CASE, caseId: TID, at: iso('17:14', 20), href: '/settings/integrations/tally', preview: `${DNO}: Ledger not found: Sharma Mobile Hub` }],
      apply(S) {
        const d = draft(S); d.status = 'failed'; d.erp = tallyErp(S, { outcome: 'error', transaction: 'TLY-7931', sentAt: iso('17:14', 11), responseAt: iso('17:14', 12), error: 'Ledger not found: Sharma Mobile Hub' });
        const r = erpRow(S); Object.assign(r, { state: 'failed', status: 400, error: 'Ledger not found: Sharma Mobile Hub', result: 'Voucher rejected · ledger missing' });
        run(S, 'run-sc-7', '17:14', 11, false, 'Ledger not found in Tally: Sharma Mobile Hub');
        logRow(S, 5, '17:14', 'System', 'Created App Event Log: Tally — voucher push — failed [error]', 'created', 'failed', 'app_event_log_created', 'app event log #913');
      } },
    { id: 'sc-14', at: '17:16', actor: 'Rohan Mehta', title: 'The failure shows on the Tally app page', desc: 'A failed row with Retry, in the Tally configure page.',
      narr: 'Rohan opens Merchant Apps → Tally. The failed push is at the top of the sync log with a Retry button.',
      route: '/settings/integrations/tally', apply() {} },
    { id: 'sc-15', at: '17:18', actor: 'Rohan Mehta', title: 'Rohan maps the ledger', desc: 'Sharma Mobile Hub → Sharma Mobile Hub (Kochi).',
      narr: 'In the ledger mapping table Rohan adds the missing entry: the dealer in Anuma is "Sharma Mobile Hub", the ledger in Tally is "Sharma Mobile Hub (Kochi)".',
      route: '/settings/integrations/tally',
      apply(S) { const t = tally(S); (t.config.ledgerMap = t.config.ledgerMap || []).push({ party: 'Sharma Mobile Hub', ledger: 'Sharma Mobile Hub (Kochi)' }); logRow(S, 6, '17:18', 'Rohan Mehta', 'Updated App: Tally (Changed fields: ledger_map)', 'updated', 'logged', 'app_updated', 'app #4'); } },
    { id: 'sc-16', at: '17:19', actor: 'Rohan Mehta', title: 'Retry succeeds', desc: 'Tally posts voucher SC-26-0399.',
      narr: 'Rohan taps Retry on the failed row. This time Tally finds the ledger and posts sales voucher SC-26-0399 for six stock lines.',
      route: '/settings/integrations/tally',
      apply(S) {
        const r = erpRow(S); Object.assign(r, { state: 'success', retried: true, status: 200, error: '', ref: 'SC-26-0399', result: `Sales voucher SC-26-0399 posted · 6 stock lines · ${inr(total(S))} · retry succeeded` });
        run(S, 'run-sc-8', '17:19', 40, true);
        logRow(S, 7, '17:19', 'System', 'Sales voucher SC-26-0399 posted to Tally', 'created', 'sent', 'voucher_sent', 'app event log #914');
      } },
    { id: 'sc-17', at: '17:20', actor: 'Draft Orders', title: 'DRF-1033 is posted with its voucher number', desc: 'The Tally box shows voucher SC-26-0399.',
      narr: 'Back on the draft: status is posted, and the Tally voucher box carries voucher number SC-26-0399 and the mapped ledger.',
      route: '/orders/drafts/' + DID,
      apply(S) {
        const d = draft(S); d.status = 'posted'; d.erp = tallyErp(S, { outcome: 'ok', transaction: 'TLY-7942', voucherNo: 'SC-26-0399', ledger: 'Sharma Mobile Hub (Kochi)', sentAt: iso('17:19', 40), responseAt: iso('17:19', 41), error: null });
        logRow(S, 8, '17:20', 'Rohan Mehta', `Updated Draft Order: ${DNO} (Changed fields: status, erp_reference)`, 'updated', 'confirmed', 'draft_order_updated', 'draft order #' + DN);
      } },
    { id: 'sc-18', at: '17:22', actor: 'Order Desk', title: 'Anuma tells the dealer', desc: 'A WhatsApp update with the order and voucher numbers.',
      narr: 'Back in the Inbox, Order Desk sends the dealer a confirmation with the draft order number and dispatch note.',
      route: '/inbox/threads?case=' + TID,
      apply(S) { push(S, an('m13', '17:22', `Order ${DNO} is posted — Tally voucher SC-26-0399, ${inr(total(S))}. We will dispatch on Wednesday and share the tracking here.`)); } },
    { id: 'sc-19', at: '17:25', actor: 'Dashboard', title: 'The Dashboard shows the whole trail', desc: 'Drafts pending back down; Deal timeline rows added.',
      narr: 'The Dashboard\'s Deal timeline now lists the case, the draft, the failed push, the ledger change and the posted voucher. "Drafts pending" is back to where it started.',
      route: '/dashboard', apply() {} },
  ];

  DM.defineUC('stuffcool', {
    short: 'Stuffcool use case', tagline: 'Inbox to Tally', icon: 'inbox', home: '/inbox/threads',
    about: 'A dealer orders on WhatsApp by text, voice note and a photo of a handwritten list. Anuma matches the products, a person fixes one line, the order becomes a draft, and Tally rejects the voucher until the ledger is mapped.',
    steps,
  });
})();
