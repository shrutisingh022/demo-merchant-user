/* Seed: agents + workflows for the three use cases (see docs/spec/workspace.md §1–2). Fake data only. */
(function () {
  if (!window.DM) return;
  const D = (uc, k, v) => DM.data(uc, k, v);
  const iso = (m, d, h = 12, mi = 0) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:00+05:30`;

  /* ───────── shared rule text (inherited from the business rulebook) ───────── */
  const FABRIC_DOES = [
    { tag: 'P8. Closing', items: [
      'Send the full list with Confirm and Change when the buyer says done, no, that\'s all or ok after a list, or after 10 minutes of quiet with at least one complete line.',
      'On Confirm: "Received. <ref>, N lines."', 'On Change: "Which line?"'] },
    { tag: 'P3. Bursts and lengths', items: [
      'Don\'t send the full list while a person has the conversation.',
      'A list of amounts after a burst maps to the photos in the order they were sent.',
      'An amount sent as a reply to one photo, or to a question about one line, belongs to that line only.'] },
    { tag: 'P4. Notes', items: [
      'Words like by air, bye air, SM by air, road, surface, by courier, by transport, urgent, urgently go into notes, exactly as the buyer wrote them.'] },
    { tag: 'P5. Corrections', items: [
      'A correction replaces the earlier amount on that line. Read the line back once, never twice.'] },
    { tag: 'P6. Lines that need a person', items: [
      'List the line with what was read and "our team is checking this one". Hand it to the account\'s primary.',
      'While a person has the conversation, send nothing. When they hand it back, read what they asked and what the buyer replied before acting.'] },
    { tag: 'P9. Catalogue matching', items: [
      'Labels share one layout: Quality (large caps), SR NO, Design, Shade, Composition, Weight, Width. Match on design and shade together; width and weight confirm.',
      'A match below the confidence floor is never added to the order on its own.'] },
    { tag: 'P2. Questions for the team', items: [
      'Questions about price, dispatch, stock or credit go to the team with the buyer\'s own words quoted.'] },
    { tag: 'P1. Hand-off and hand-back', items: [
      'A hand-off tells the buyer once that a person is checking. A hand-back is silent until the buyer writes again.'] },
  ];
  const FABRIC_NEVER = [
    { tag: 'P8. Closing', items: ['Never say "confirmed" about stock, dispatch or dates.', 'Never treat a second Confirm tap as a second order. Reply that it is already received.'] },
    { tag: 'P3. Bursts and lengths', items: ['Never acknowledge or analyse each photo of a burst separately.'] },
    { tag: 'P9. Catalogue matching', items: ['Never offer the buyer a catalogue record to choose from.', 'Never match on colour or composition alone.'] },
    { tag: 'P2. Questions for the team', items: ['Never answer these yourself, even partly.'] },
    { tag: 'P6. Lines that need a person', items: ['Never change a line a person edited.'] },
  ];
  const FABRIC_HELPERS = [
    'Buyers send odd inputs: a bare number after a photo means metres, "2 roll" means two rolls, and "10-10" can be two lines of ten.',
    'The same photo can arrive twice in a burst. Count it once.',
    'Unit words: m, mt, mtr, mtrs and meter all mean metres; roll and rl mean rolls.',
    'Quality names are printed in large caps on the label (JACQUARD, VELVET, DIGITAL PRINT). They are part of the match.',
    '"Available?" and "kab tak milega" are questions for the team, not order lines.',
  ];

  const DEVICE_DOES = [
    { tag: 'P8. Closing', items: ['Read the full list back with Confirm and Change after the dealer says done, that\'s all or ok, or after 10 minutes of quiet.', 'On Confirm: "Received. <ref>, N lines."'] },
    { tag: 'P3. Models and colours', items: ['A model plus a colour is one line. A colour alone belongs to the model written just before it.', 'Quantities after a burst of models map to the models in the order they were sent.'] },
    { tag: 'P4. Notes', items: ['Words like urgent, by air, courier, COD, advance go into notes exactly as the dealer wrote them.'] },
    { tag: 'P5. Corrections', items: ['A correction replaces the earlier quantity on that line. Read the line back once.'] },
    { tag: 'P6. Lines that need a person', items: ['A model that matches below the confidence floor is listed with what was read and handed to the account\'s primary.'] },
    { tag: 'P9. Catalogue matching', items: ['Match on model, then colour, then pack type (Bulk, Retail Box, Standard).'] },
    { tag: 'P1. Hand-off and hand-back', items: ['A hand-off tells the dealer once that a person is checking. A hand-back is silent until the dealer writes again.'] },
  ];
  const DEVICE_NEVER = [
    { tag: 'P8. Closing', items: ['Never say "confirmed" about stock, dispatch or dates.', 'Never treat a second Confirm tap as a second order.'] },
    { tag: 'P9. Catalogue matching', items: ['Never offer the dealer a list of similar models to choose from.', 'Never quote or discuss dealer price bands in chat.'] },
    { tag: 'P6. Lines that need a person', items: ['Never change a line a person edited.'] },
  ];
  const DEVICE_HELPERS = [
    'Dealers use short names: "20k mini" is the 20000 mAh Mini Powerbank, "tc" is a Type-C cable.',
    'Voice notes arrive as audio. Read the transcript, then read the lines back as text before confirming.',
    'Pack words: bulk, retail box and standard are pack types, not colours.',
  ];

  const RFQ_DOES = [
    { tag: 'P1. Intake', items: ['Read the email body and every attachment (PDF, Excel, image) as one RFQ. Keep the buyer\'s own wording on each line.'] },
    { tag: 'P3. Line extraction', items: ['One RFQ line per item: description, quantity, unit and any size or rating. Kits are one line with components.', 'Keep the buyer\'s line numbers when they exist.'] },
    { tag: 'P4. Notes', items: ['Delivery site, required-by date and make or brand preferences go into the RFQ notes exactly as written.'] },
    { tag: 'P9. Catalogue matching', items: ['Match each line to a catalogue style and variant using size, standard (DIN, IS, IEC) and rating together.', 'Mark a line Needs Review when more than one variant fits.'] },
    { tag: 'P2. Questions for the buyer', items: ['Ask one question per email, only for missing quantity or unit.'] },
    { tag: 'P6. Lines that need a person', items: ['Lines with no catalogue match are listed as unmatched and left for the owner.'] },
  ];
  const RFQ_NEVER = [
    { tag: 'P9. Catalogue matching', items: ['Never substitute a different standard or rating without the owner\'s approval.', 'Never match on description alone when a part number is given.'] },
    { tag: 'P2. Questions for the buyer', items: ['Never quote a price or a lead time.'] },
    { tag: 'P6. Lines that need a person', items: ['Never change a line a person edited.'] },
  ];
  const RFQ_HELPERS = [
    'Sizes appear as "16 sq mm", "16mm2" or "16": all the same cross-section when the item is a lug or a cable.',
    'The same item can be listed in a PDF table and again in the email body. Count it once.',
    'Units: Nos, No, pcs and each mean numbers; mtr and m mean metres.',
  ];

  const trainChat = (rows) => rows.map((r, i) => ({ id: 'tr-' + (i + 1), ...r }));

  /* ───────── NEWHOME ───────── */
  D('newhome', 'agents', [
    {
      id: 'anuma', name: 'Anuma', status: 'live', type: 'chat', description: '', updatedAt: iso(10, 10, 12, 52), channelNames: ['WhatsApp Dealer Desk - 9820012345', 'WhatsApp Dealer Desk 2 - 9820012346'],
      instructions: { firstMessage: '', does: FABRIC_DOES, agentOnly: [
        'Never ask the customer for a delivery address — this merchant does not need it collected in this conversation.',
        'Keep every reply extremely short - one short sentence, or a couple of words when that is enough.',
        'Treat the abbreviations mts, mtr, mtrs, m, and mt as all referring to meters.',
        'Never use em-dashes in replies.',
        'Don\'t always greet customers in Hindi.',
        'When a customer orders the same product in multiple meter quantities, combine them into a single line item on the draft order.'], never: FABRIC_NEVER, helpers: FABRIC_HELPERS },
      training: trainChat([
        { role: 'user', text: 'what are you current rules', at: iso(9, 18, 11, 40) },
        { role: 'agent', text: '**Rules (4):** 1. Never ask the customer for a delivery address. 2. Keep every reply extremely short. 3. Treat mts, mtr, m and mt as meters. 4. Never use em-dashes in replies.', at: iso(9, 18, 11, 40) },
        { role: 'user', text: 'also treat mtrs as meters', at: iso(9, 18, 11, 42) },
        { role: 'rule', kind: 'updated', from: 'Treat the abbreviations mts, mtr, m, and mt as all referring to meters.', to: 'Treat the abbreviations mts, mtr, mtrs, m, and mt as all referring to meters.', plus: 1, minus: 1, at: iso(9, 18, 11, 42) },
        { role: 'agent', text: 'Updated. I\'ll treat mtrs the same as the other meter abbreviations.', at: iso(9, 18, 11, 42) },
        { role: 'user', text: 'Don\'t always greet customers in Hindi', at: iso(10, 9, 15, 5) },
        { role: 'rule', kind: 'new', to: 'Don\'t always greet customers in Hindi.', plus: 1, minus: 0, at: iso(10, 9, 15, 5) },
        { role: 'agent', text: 'Got it — I\'ll remember: "Don\'t always greet customers in Hindi."', at: iso(10, 9, 15, 5) },
      ]),
      activity: [
        { id: 'ac-1', at: iso(10, 9, 19, 37), kind: 'activated', text: 'Updated Agent: Anuma (Changed fields: is_active)', actor: 'Neha Kulkarni' },
        { id: 'ac-2', at: iso(10, 9, 15, 5), kind: 'rule', text: 'New rule: "Don\'t always greet customers in Hindi." (+1 -0)', actor: 'Rohan Mehta' },
        { id: 'ac-3', at: iso(10, 9, 15, 5), kind: 'guideline', text: 'Updated Agent: Anuma (Changed fields: guidelines)', actor: 'Rohan Mehta' },
        { id: 'ac-4', at: iso(9, 30, 12, 8), kind: 'paused', text: 'Updated Agent: Anuma (Changed fields: modified_by, is_active)', actor: 'Neha Kulkarni' },
        { id: 'ac-5', at: iso(9, 18, 11, 42), kind: 'rule', text: 'Updated rule: "Treat the abbreviations mts, mtr, mtrs, m, and mt as all referring to meters." (+1 -1)', actor: 'Rohan Mehta' },
        { id: 'ac-6', at: iso(9, 16, 17, 3), kind: 'activated', text: 'Updated Agent: Anuma (Changed fields: is_active)', actor: 'Neha Kulkarni' },
      ],
    },
    { id: 'catalogue-and-prices', name: 'Catalogue and prices', status: 'draft', type: 'chat', description: '', updatedAt: iso(9, 25, 14, 20), channelNames: [], instructions: { firstMessage: '', does: [], agentOnly: [], never: [], helpers: [] }, training: [], activity: [{ id: 'ac-1', at: iso(9, 25, 14, 20), kind: 'created', text: 'Created Agent: Catalogue and prices', actor: 'Neha Kulkarni' }] },
    { id: 'dealer-followups', name: 'Dealer follow-ups', status: 'draft', type: 'email', description: '', updatedAt: iso(10, 1, 16, 5), channelNames: [], instructions: { firstMessage: '', does: [], agentOnly: [], never: [], helpers: [] }, training: [], activity: [{ id: 'ac-1', at: iso(10, 1, 16, 5), kind: 'created', text: 'Created Agent: Dealer follow-ups', actor: 'Rohan Mehta' }] },
  ]);

  /* ───────── STUFFCOOL ───────── */
  D('stuffcool', 'agents', [
    {
      id: 'order-desk', name: 'Order Desk', status: 'live', type: 'chat', description: '', updatedAt: iso(10, 23, 18, 21), channelNames: ['WhatsApp (+91-9867012345)'],
      instructions: { firstMessage: '', does: DEVICE_DOES, agentOnly: [
        'Read model names exactly as the dealer writes them before matching.',
        'For a voice note, read back the lines you heard as text and ask for Confirm or Change.',
        'Never ask the dealer for a delivery address; the account already has one.',
        'Keep every reply to one short sentence.'], never: DEVICE_NEVER, helpers: DEVICE_HELPERS },
      training: trainChat([
        { role: 'user', text: 'rules?', at: iso(10, 23, 18, 5) },
        { role: 'agent', text: 'That\'s handled separately, so I won\'t list them here — but feel free to ask me to change or add a specific rule, like "stop asking for delivery address."', at: iso(10, 23, 18, 5) },
        { role: 'user', text: 'Never ask the dealer for a delivery address, we already have it', at: iso(10, 23, 18, 12) },
        { role: 'rule', kind: 'new', to: 'Never ask the dealer for a delivery address; the account already has one.', plus: 1, minus: 0, at: iso(10, 23, 18, 12) },
        { role: 'agent', text: 'Got it — I\'ll remember: "Never ask the dealer for a delivery address; the account already has one."', at: iso(10, 23, 18, 12) },
        { role: 'user', text: 'for voice notes read the lines back as text', at: iso(10, 23, 18, 19) },
        { role: 'rule', kind: 'new', to: 'For a voice note, read back the lines you heard as text and ask for Confirm or Change.', plus: 1, minus: 0, at: iso(10, 23, 18, 19) },
        { role: 'agent', text: 'Got it — I\'ll remember: "For a voice note, read back the lines you heard as text and ask for Confirm or Change."', at: iso(10, 23, 18, 19) },
      ]),
      activity: [
        { id: 'ac-1', at: iso(10, 23, 18, 21), kind: 'activated', text: 'Updated Agent: Order Desk (Changed fields: is_active)', actor: 'Kavya Reddy' },
        { id: 'ac-2', at: iso(10, 23, 18, 19), kind: 'rule', text: 'New rule: "For a voice note, read back the lines you heard as text and ask for Confirm or Change." (+1 -0)', actor: 'Kavya Reddy' },
        { id: 'ac-3', at: iso(10, 23, 18, 12), kind: 'rule', text: 'New rule: "Never ask the dealer for a delivery address; the account already has one." (+1 -0)', actor: 'Kavya Reddy' },
        { id: 'ac-4', at: iso(10, 23, 18, 1), kind: 'created', text: 'Created Agent: Order Desk', actor: 'Kavya Reddy' },
      ],
    },
    { id: 'dealer-calls', name: 'Dealer calls', status: 'draft', type: 'voice', description: '', updatedAt: iso(10, 20, 11, 40), channelNames: [], instructions: { firstMessage: '', does: [], agentOnly: [], never: [], helpers: [] }, training: [], activity: [{ id: 'ac-1', at: iso(10, 20, 11, 40), kind: 'created', text: 'Created Agent: Dealer calls', actor: 'Rohan Mehta' }] },
  ]);

  /* ───────── ACCESS (RFQ) ───────── */
  D('rfq', 'agents', [
    {
      id: 'rfq-desk', name: 'RFQ Desk', status: 'live', type: 'email', description: '', updatedAt: iso(10, 22, 10, 30), channelNames: ['Email rfq@demo-merchant.example'],
      instructions: { firstMessage: '', does: RFQ_DOES, agentOnly: [
        'Quote quantities in the unit the buyer used, never convert them.',
        'Keep the buyer\'s own wording on every line description.',
        'Reply to the buyer only to ask for a missing quantity or unit.'], never: RFQ_NEVER, helpers: RFQ_HELPERS },
      training: trainChat([
        { role: 'user', text: 'what are your current rules', at: iso(10, 22, 10, 12) },
        { role: 'agent', text: '**Rules (2):** 1. Quote quantities in the unit the buyer used, never convert them. 2. Keep the buyer\'s own wording on every line description.', at: iso(10, 22, 10, 12) },
        { role: 'user', text: 'only reply to the buyer when quantity or unit is missing', at: iso(10, 22, 10, 28) },
        { role: 'rule', kind: 'new', to: 'Reply to the buyer only to ask for a missing quantity or unit.', plus: 1, minus: 0, at: iso(10, 22, 10, 28) },
        { role: 'agent', text: 'Got it — I\'ll remember: "Reply to the buyer only to ask for a missing quantity or unit."', at: iso(10, 22, 10, 28) },
      ]),
      activity: [
        { id: 'ac-1', at: iso(10, 22, 10, 30), kind: 'activated', text: 'Updated Agent: RFQ Desk (Changed fields: is_active)', actor: 'Smita Apte' },
        { id: 'ac-2', at: iso(10, 22, 10, 28), kind: 'rule', text: 'New rule: "Reply to the buyer only to ask for a missing quantity or unit." (+1 -0)', actor: 'Smita Apte' },
        { id: 'ac-3', at: iso(10, 15, 16, 4), kind: 'created', text: 'Created Agent: RFQ Desk', actor: 'Smita Apte' },
      ],
    },
    { id: 'test', name: 'test', status: 'draft', type: 'chat', description: '', updatedAt: iso(9, 27, 13, 5), channelNames: [], instructions: { firstMessage: '', does: [], agentOnly: [], never: [], helpers: [] }, training: [], activity: [{ id: 'ac-1', at: iso(9, 27, 13, 5), kind: 'created', text: 'Created Agent: test', actor: 'Rohan Mehta' }] },
  ]);

  /* ───────── WORKFLOWS ───────── */
  const node = (id, type, x, y, o = {}) => ({ id, type, x, y, ...o });
  const edge = (from, to, branch) => ({ id: from + '>' + to, from, to, ...(branch ? { branch } : {}) });
  const cond = (variable, op, value) => ({ variable, op, value });
  const trig = (o) => ({ status: 'confirmed', previous_status: 'awaiting_confirmation', is_test: false, item_count: 3, managed_by: 'anuma', confidence_score: 0.92, ...o });
  const draftTrig = (n, status, prev, extra = {}) => trig({ error: null, status, is_test: false, created_at: iso(10, 25, 16, 40), expires_at: iso(10, 26, 16, 40), item_count: n, managed_by: 'anuma', external_id: null, previous_status: prev, confidence_score: 0.91, last_activity_at: iso(10, 25, 16, 47), ...extra });
  const mkRun = (id, at, ver, subject, ok, trigger, actionTitle, err, decisionTitle) => ({
    id, at, version: ver, subject, status: ok ? 'Succeeded' : 'Failed', trigger,
    steps: [
      { nodeId: 'n-trigger', title: 'Trigger', desc: trigger._label, status: 'Done', at, note: '' },
      { nodeId: 'n-decision', title: 'Decision', desc: decisionTitle, status: 'Done', at, note: 'Took the Yes path.', result: { matched: true, missing: [] } },
      { nodeId: 'n-action', title: 'Action', desc: actionTitle, status: ok ? 'Done' : 'Failed', at, note: ok ? '' : '3 attempts', error: ok ? '' : err },
    ],
  });
  const ts = (m, d, h, mi, s) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}+05:30`;

  const coralRuns = [
    mkRun('run-7', ts(10, 25, 16, 47, 18), 3, 'draft_order 178', false, { _label: 'Draft order status changed', ...draftTrig(3, 'confirmed', 'awaiting_confirmation', { last_activity_at: ts(10, 25, 16, 47, 9) }) }, 'Push draft order to Coral ERP', 'Customer does not exist: Royal Curtain House', '1 condition in 1 group'),
    mkRun('run-6', ts(10, 22, 17, 22, 2), 3, 'draft_order 169', true, { _label: 'Draft order status changed', ...draftTrig(2, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-1169' }) }, 'Push draft order to Coral ERP', '', '1 condition in 1 group'),
    mkRun('run-5', ts(10, 22, 15, 3, 40), 3, 'draft_order 166', true, { _label: 'Draft order status changed', ...draftTrig(5, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-1166' }) }, 'Push draft order to Coral ERP', '', '1 condition in 1 group'),
    mkRun('run-4', ts(10, 21, 12, 18, 51), 3, 'draft_order 163', true, { _label: 'Draft order status changed', ...draftTrig(1, 'confirmed', 'needs_review', { external_id: 'DRF-1163' }) }, 'Push draft order to Coral ERP', '', '1 condition in 1 group'),
    mkRun('run-3', ts(10, 19, 11, 2, 7), 3, 'draft_order 158', true, { _label: 'Draft order status changed', ...draftTrig(4, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-1158' }) }, 'Push draft order to Coral ERP', '', '1 condition in 1 group'),
    mkRun('run-2', ts(10, 17, 18, 40, 30), 3, 'draft_order 152', false, { _label: 'Draft order status changed', ...draftTrig(2, 'confirmed', 'awaiting_confirmation') }, 'Push draft order to Coral ERP', 'Item not found in Coral: leaf 12 / design 4021', '1 condition in 1 group'),
    mkRun('run-1', ts(10, 15, 10, 12, 44), 3, 'draft_order 147', true, { _label: 'Draft order status changed', ...draftTrig(6, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-1147' }) }, 'Push draft order to Coral ERP', '', '1 condition in 1 group'),
  ];
  const coralNodes = () => [
    node('n-trigger', 'trigger', 387, 508, { title: 'Trigger', body: 'Draft order status changed', cfg: { trigger: 'draft_order_status', repeat: 'daily', at: '07:00', tz: 'Asia/Kolkata' }, runs: { n: 7, pct: 100 } }),
    node('n-decision', 'decision', 698, 508, { title: 'Decision', cfg: { groups: [[cond('status', 'equals', 'confirmed')]] }, runs: { n: 7, pct: 100 } }),
    node('n-action', 'action', 1017, 377, { title: 'Action', cfg: { action: 'coral_push' }, runs: { n: 5, pct: 71 } }),
    node('n-end-true', 'end', 1321, 508, { title: 'End', body: 'End of the workflow', runs: { n: 2, pct: 29 } }),
    node('n-end-false', 'end', 1010, 590, { title: 'End', body: 'End of the workflow', runs: { n: 2, pct: 29 } }),
  ];
  const coralEdges = () => [edge('n-trigger', 'n-decision'), edge('n-decision', 'n-action', 'true'), edge('n-action', 'n-end-true'), edge('n-decision', 'n-end-false', 'false')];
  const WF_SETTINGS = () => ({ cooldown: '', cooldownUnit: 'days', concurrent: false, termination: [] });

  D('newhome', 'workflows', [{
    id: 'wf-1', name: 'Coral DraftOrder -> SalesOrder Sync', status: 'live', version: 3, updatedAt: iso(10, 22, 17, 5), triggerKind: 'draft_order',
    nodes: coralNodes(), edges: coralEdges(), runs: coralRuns, settings: WF_SETTINGS(), versions: [
      { v: 3, at: iso(10, 22, 17, 5), by: 'Rohan Mehta', note: 'Published' }, { v: 2, at: iso(10, 14, 12, 40), by: 'Neha Kulkarni', note: 'Published' }, { v: 1, at: iso(10, 9, 9, 15), by: 'Rohan Mehta', note: 'Published' }],
  }]);

  const tallyRuns = [
    mkRun('run-6', ts(10, 27, 14, 52, 11), 2, 'draft_order 2449', false, { _label: 'Draft order status changed', ...draftTrig(4, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-2449', created_at: ts(10, 27, 13, 20, 0) }) }, 'Post sales voucher to Tally', 'Ledger not found in Tally: Digital Planet', '1 condition in 1 group'),
    mkRun('run-5', ts(10, 26, 17, 31, 20), 2, 'draft_order 2438', true, { _label: 'Draft order status changed', ...draftTrig(7, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-2438' }) }, 'Post sales voucher to Tally', '', '1 condition in 1 group'),
    mkRun('run-4', ts(10, 26, 12, 4, 55), 2, 'draft_order 2431', true, { _label: 'Draft order status changed', ...draftTrig(2, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-2431' }) }, 'Post sales voucher to Tally', '', '1 condition in 1 group'),
    mkRun('run-3', ts(10, 24, 16, 18, 9), 2, 'draft_order 2420', true, { _label: 'Draft order status changed', ...draftTrig(5, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-2420' }) }, 'Post sales voucher to Tally', '', '1 condition in 1 group'),
    mkRun('run-2', ts(10, 23, 11, 41, 33), 1, 'draft_order 2411', true, { _label: 'Draft order status changed', ...draftTrig(3, 'confirmed', 'needs_review', { external_id: 'DRF-2411' }) }, 'Post sales voucher to Tally', '', '1 condition in 1 group'),
    mkRun('run-1', ts(10, 22, 15, 26, 2), 1, 'draft_order 2402', true, { _label: 'Draft order status changed', ...draftTrig(1, 'confirmed', 'awaiting_confirmation', { external_id: 'DRF-2402' }) }, 'Post sales voucher to Tally', '', '1 condition in 1 group'),
  ];
  D('stuffcool', 'workflows', [{
    id: 'wf-1', name: 'Draft Order -> Tally Voucher Sync', status: 'live', version: 2, updatedAt: iso(10, 24, 10, 30), triggerKind: 'draft_order',
    nodes: coralNodes().map((n) => (n.id === 'n-action' ? { ...n, cfg: { action: 'tally_voucher' }, runs: { n: 4, pct: 67 } } : n.id === 'n-trigger' ? { ...n, runs: { n: 6, pct: 100 } } : n.id === 'n-decision' ? { ...n, runs: { n: 6, pct: 100 } } : n.id === 'n-end-true' ? { ...n, runs: { n: 4, pct: 67 } } : { ...n, runs: { n: 2, pct: 33 } })),
    edges: coralEdges(), runs: tallyRuns, settings: WF_SETTINGS(), versions: [
      { v: 2, at: iso(10, 24, 10, 30), by: 'Kavya Reddy', note: 'Published' }, { v: 1, at: iso(10, 22, 15, 10), by: 'Kavya Reddy', note: 'Published' }],
  }]);

  const sapRuns = [
    { id: 'run-4', at: ts(10, 26, 16, 12, 5), version: 1, subject: 'rfq RFQ-202610-1011', status: 'Succeeded', trigger: { _label: 'RFQ status changed', status: 'ready', previous_status: 'needs_review', source: 'Email Attachment', item_count: 38, created_at: ts(10, 25, 11, 2, 0), external_id: 'RFQ-202610-1011', is_test: false }, steps: [
      { nodeId: 'n-trigger', title: 'Trigger', desc: 'RFQ status changed', status: 'Done', at: ts(10, 26, 16, 12, 5), note: '' },
      { nodeId: 'n-decision', title: 'Decision', desc: '1 condition in 1 group', status: 'Done', at: ts(10, 26, 16, 12, 5), note: 'Took the Yes path.', result: { matched: true, missing: [] } },
      { nodeId: 'n-action', title: 'Action', desc: 'Send RFQ to SAP', status: 'Done', at: ts(10, 26, 16, 12, 6), note: '' }] },
    { id: 'run-3', at: ts(10, 24, 11, 40, 12), version: 1, subject: 'rfq RFQ-202610-1007', status: 'Failed', trigger: { _label: 'RFQ status changed', status: 'ready', previous_status: 'matching', source: 'SAP', item_count: 12, created_at: ts(10, 24, 9, 30, 0), external_id: 'RFQ-202610-1007', is_test: false }, steps: [
      { nodeId: 'n-trigger', title: 'Trigger', desc: 'RFQ status changed', status: 'Done', at: ts(10, 24, 11, 40, 12), note: '' },
      { nodeId: 'n-decision', title: 'Decision', desc: '1 condition in 1 group', status: 'Done', at: ts(10, 24, 11, 40, 12), note: 'Took the Yes path.', result: { matched: true, missing: [] } },
      { nodeId: 'n-action', title: 'Action', desc: 'Send RFQ to SAP', status: 'Failed', at: ts(10, 24, 11, 40, 14), note: '3 attempts', error: 'Material not found in SAP: ATD0016M12' }] },
    { id: 'run-2', at: ts(10, 22, 15, 5, 48), version: 1, subject: 'rfq RFQ-202610-1003', status: 'Succeeded', trigger: { _label: 'RFQ status changed', status: 'ready', previous_status: 'needs_review', source: 'Email Body', item_count: 6, created_at: ts(10, 22, 10, 12, 0), external_id: 'RFQ-202610-1003', is_test: false }, steps: [
      { nodeId: 'n-trigger', title: 'Trigger', desc: 'RFQ status changed', status: 'Done', at: ts(10, 22, 15, 5, 48), note: '' },
      { nodeId: 'n-decision', title: 'Decision', desc: '1 condition in 1 group', status: 'Done', at: ts(10, 22, 15, 5, 48), note: 'Took the Yes path.', result: { matched: true, missing: [] } },
      { nodeId: 'n-action', title: 'Action', desc: 'Send RFQ to SAP', status: 'Done', at: ts(10, 22, 15, 5, 49), note: '' }] },
  ];
  D('rfq', 'workflows', [{
    id: 'wf-1', name: 'RFQ -> Send to SAP', status: 'live', version: 1, updatedAt: iso(10, 21, 18, 2), triggerKind: 'rfq',
    nodes: [
      node('n-trigger', 'trigger', 387, 508, { title: 'Trigger', body: 'RFQ status changed', cfg: { trigger: 'rfq_status' }, runs: { n: 3, pct: 100 } }),
      node('n-decision', 'decision', 698, 508, { title: 'Decision', cfg: { groups: [[cond('status', 'equals', 'ready')]] }, runs: { n: 3, pct: 100 } }),
      node('n-action', 'action', 1017, 377, { title: 'Action', cfg: { action: 'sap_send' }, runs: { n: 2, pct: 67 } }),
      node('n-end-true', 'end', 1321, 508, { title: 'End', body: 'End of the workflow', runs: { n: 2, pct: 67 } }),
      node('n-end-false', 'end', 1010, 590, { title: 'End', body: 'End of the workflow', runs: { n: 1, pct: 33 } }),
    ], edges: coralEdges(), runs: sapRuns, settings: WF_SETTINGS(), versions: [{ v: 1, at: iso(10, 21, 18, 2), by: 'Smita Apte', note: 'Published' }],
  }]);
})();
