/* Seed: Settings (plan, roles, invites, navModules, rulebook, playbooks, limits, usage) for all three use cases.
   Shapes documented at the bottom of this file. Spec: docs/spec/settings.md. Fake data only. */
(function () {
  if (!window.DM) return;
  const DM = window.DM;

  /* ───────── plan ───────── */
  const ALLOW = [
    ['100', 'Human seats'], ['50.0M', 'AI tokens'], ['100K', 'AI actions'], ['10K', 'Email sends'], ['1.0K', 'Storage (GB)'],
    ['10K', 'Catalog sends'], ['10K', 'WhatsApp conversations'], ['100', 'Knowledge sources'], ['1.0M', 'Voice call seconds'],
  ];
  const PLAN = {
    newhome: { name: 'Test', badge: 'Test plan', modules: ['Home', 'CRM', 'Contacts', 'Party', 'Tasks', 'Merchant', 'Humans', 'Navigation', 'Merchant Entities', 'Apps', 'Orders', 'OMS', 'Inbox', 'Rules', 'Products', 'Collections', 'PIM', 'Box Templates', 'Inventory', 'Settings & Billing', 'Workflows', 'Agents', 'Channels'] },
    stuffcool: { name: 'Test', badge: 'Test plan', modules: ['Dashboard', 'CRM', 'Accounts', 'Contacts', 'Inbox', 'Draft Orders', 'Products', 'Workflows', 'Merchant Apps', 'Humans', 'Navigation', 'Rules', 'Agents', 'Channels', 'Settings & Billing'] },
    rfq: { name: 'Test', badge: '', modules: ['Home', 'CRM', 'Accounts', 'Contacts', 'RFQs', 'Products', 'Workflows', 'Merchant Apps', 'Humans', 'Navigation', 'Rules', 'Agents', 'Channels', 'Settings & Billing'] },
  };

  /* ───────── roles & access matrix ───────── */
  const MODULES = ['Analytics', 'CRM', 'Leads', 'Contacts', 'Accounts', 'Tasks', 'Deals', 'Merchant', 'Merchant Users', 'Merchant Modules', 'Merchant Entities', 'Merchant Apps', 'Draft Orders', 'OMS', 'Quotes', 'Intake Enquiries', 'Inbox', 'Workflows', 'AI Policy', 'Products', 'Collections', 'PIM', 'Boxes', 'Inventory', 'Settings & Billing'];
  const ROLE_DEFS = [
    ['ASM', 'Area sales manager. Owns a set of dealer accounts and takes the hand-offs for them.', false],
    ['Admin', 'Full access to every module. Can invite people and change settings.', true],
    ['Finance', 'Approves discounts and payment terms; owns taxes and reconciliation.', true],
    ['Manager', 'Runs the floor — approves quotes to a ceiling, edits products, no billing.', true],
    ['Owner', 'Everything, including AI Policy and billing. The final escalation stop.', true],
    ['Production', 'Kitchen & fulfilment — capacity, stock, and what\'s promised for when.', false],
    ['Read-only', 'Sees everything relevant, touches nothing. Auditors, accountants.', false],
    ['Sales', 'Works deals and drafts quotes — nothing goes out without an approver.', false],
    ['Sales Exc', 'Sales executive. Works only the accounts assigned to them.', false],
  ];
  const ROLE_SET = { newhome: ['ASM', 'Admin', 'Finance', 'Manager', 'Owner', 'Production', 'Read-only', 'Sales', 'Sales Exc'], stuffcool: ['ASM', 'Admin', 'Finance', 'Manager', 'Owner', 'Read-only', 'Sales'], rfq: ['ASM', 'Admin', 'Finance', 'Manager', 'Owner', 'Production', 'Read-only', 'Sales'] };
  const has = (m, list) => list.includes(m);
  const perm = (role, m) => {
    if (role === 'Admin' || role === 'Owner') return [1, 1, 1, 1, 1];
    const readAll = ['Analytics', 'CRM', 'Leads', 'Contacts', 'Accounts', 'Tasks', 'Deals', 'Draft Orders', 'OMS', 'Quotes', 'Intake Enquiries', 'Inbox', 'Workflows', 'Products', 'Collections', 'PIM', 'Boxes', 'Inventory', 'Merchant Apps'];
    const work = ['Contacts', 'Accounts', 'Tasks', 'Leads', 'Deals', 'Quotes', 'Draft Orders', 'Inbox', 'Intake Enquiries'];
    if (role === 'Manager') return [1, has(m, [...work, 'Products', 'Collections', 'PIM']) ? 1 : 0, has(m, [...work, 'Products', 'Collections', 'PIM', 'Inventory']) ? 1 : 0, 0, has(m, ['Quotes', 'Draft Orders']) ? 1 : 0].map((x, i) => (i === 0 ? (has(m, ['AI Policy', 'Merchant', 'Merchant Users', 'Merchant Modules', 'Merchant Entities', 'Settings & Billing']) ? 0 : 1) : x));
    if (role === 'Finance') return [has(m, readAll) || m === 'Settings & Billing' ? 1 : 0, has(m, ['Quotes', 'Settings & Billing']) ? 1 : 0, has(m, ['Quotes', 'Draft Orders', 'Settings & Billing']) ? 1 : 0, 0, has(m, ['Quotes', 'Draft Orders', 'Settings & Billing']) ? 1 : 0];
    if (role === 'Production') return [has(m, ['Products', 'Collections', 'PIM', 'Boxes', 'Inventory', 'OMS', 'Draft Orders']) ? 1 : 0, 0, has(m, ['Inventory', 'Boxes']) ? 1 : 0, 0, 0];
    if (role === 'Read-only') return [has(m, readAll) ? 1 : 0, 0, 0, 0, 0];
    // ASM / Sales / Sales Exc
    return [has(m, readAll) ? 1 : 0, has(m, work) ? 1 : 0, has(m, work) ? 1 : 0, 0, role === 'ASM' && has(m, ['Draft Orders', 'Quotes']) ? 1 : 0];
  };

  /* ───────── navigation modules ───────── */
  // [label, canonical, icon, railKey|null, group('d' default list | 'a' only when Show all modules)]
  const NAVM = {
    newhome: [
      ['Rules', 'Rules', 'shield', null, 'd'], ['Home', 'Analytics', 'dashboard', 'dashboard', 'd'], ['CRM', 'CRM', 'users', null, 'd'], ['Party', 'Accounts', 'building', null, 'd'], ['Contacts', 'Contacts', 'user', null, 'd'],
      ['Deals', 'Deals', 'handshake', null, 'a'], ['Leads', 'Leads', 'star', null, 'a'], ['Tasks', 'Tasks', 'check', null, 'a'],
      ['Inbox', 'Inbox', 'inbox', 'inbox', 'd'], ['Intake Enquiries', 'Intake Enquiries', 'file', null, 'a'], ['Merchant', 'Merchant', 'building', null, 'a'],
      ['Apps', 'Merchant Apps', 'blocks', 'apps', 'd'], ['Merchant Entities', 'Merchant Entities', 'database', null, 'a'],
      ['Navigation', 'Navigation', 'layout', null, 'd'], ['Humans', 'Humans', 'users', null, 'd'], ['OMS', 'OMS', 'clipboard', null, 'a'],
      ['Orders', 'Draft Orders', 'file', 'orders', 'd'], ['Quotes', 'Quotes', 'receipt', null, 'a'], ['Products', 'Products', 'package', 'products', 'd'],
      ['PIM', 'PIM', 'package', null, 'a'], ['Box Templates', 'Box Templates', 'box', null, 'a'], ['Collections', 'Collections', 'grid', null, 'a'], ['Inventory', 'Inventory', 'database', null, 'a'],
      ['Settings & Billing', 'Settings & Billing', 'settings', null, 'a'], ['Workflows', 'Workflows', 'workflow', 'workflows', 'd'],
    ],
    stuffcool: [
      ['Rules', 'Rules', 'shield', null, 'd'], ['Dashboard', 'Dashboard', 'dashboard', 'dashboard', 'd'], ['Workflows', 'Workflows', 'workflow', 'workflows', 'd'], ['CRM', 'CRM', 'users', null, 'd'], ['Accounts', 'Accounts', 'building', null, 'd'], ['Contacts', 'Contacts', 'user', null, 'd'],
      ['Inbox', 'Inbox', 'inbox', 'inbox', 'd'], ['Merchant Apps', 'Merchant Apps', 'blocks', 'apps', 'd'], ['Navigation', 'Navigation', 'layout', null, 'd'], ['Humans', 'Humans', 'users', null, 'd'],
      ['Draft Orders', 'Draft Orders', 'file', 'orders', 'd'], ['Products', 'Products', 'package', 'products', 'd'],
      ['Merchant', 'Merchant', 'building', null, 'a'], ['Merchant Entities', 'Merchant Entities', 'database', null, 'a'], ['OMS', 'OMS', 'clipboard', null, 'a'], ['Collections', 'Collections', 'grid', null, 'a'], ['PIM', 'PIM', 'package', null, 'a'], ['Inventory', 'Inventory', 'database', null, 'a'], ['Settings & Billing', 'Settings & Billing', 'settings', null, 'a'],
    ],
    rfq: [
      ['Rules', 'Rules', 'shield', null, 'd'], ['Home', 'Analytics', 'dashboard', 'dashboard', 'd'], ['CRM', 'CRM', 'users', null, 'd'], ['Accounts', 'Accounts', 'building', null, 'd'], ['Contacts', 'Contacts', 'user', null, 'd'],
      ['Merchant Apps', 'Merchant Apps', 'blocks', 'apps', 'd'], ['Navigation', 'Navigation', 'layout', null, 'd'], ['Humans', 'Humans', 'users', null, 'd'],
      ['RFQs', 'RFQs', 'sheet', 'rfqs', 'd'], ['Products', 'Products', 'package', 'products', 'd'], ['Workflows', 'Workflows', 'workflow', 'workflows', 'd'],
      ['Merchant', 'Merchant', 'building', null, 'a'], ['Merchant Entities', 'Merchant Entities', 'database', null, 'a'], ['OMS', 'OMS', 'clipboard', null, 'a'], ['Quotes', 'Quotes', 'receipt', null, 'a'], ['Collections', 'Collections', 'grid', null, 'a'], ['PIM', 'PIM', 'package', null, 'a'], ['Inventory', 'Inventory', 'database', null, 'a'], ['Settings & Billing', 'Settings & Billing', 'settings', null, 'a'],
    ],
  };

  /* ───────── rulebook copy per use case ───────── */
  const RB = {
    newhome: {
      howItWrites: [
        'Write like the order desk of a furnishing-fabric mill: brisk, precise, trade-fluent. The dealer is restocking, not browsing. Reply in English, even when the buyer writes in Hinglish or Malayalam.',
        'Say each line back as the label reads it, then the length, then any note. Example: VISE SR 38 · 12.3 m · by air.',
        'Keep the buyer\'s own amounts and decimals. 12.3 m stays 12.3 m. 2 rolls stays 2 rolls. Never a bare number.',
        'Say back what you understood before you act. A wrong read caught at a glance is the point of the reply.',
        'When a line needs a person, say "our team is checking this one". Never guess, and never describe how you searched.',
        'Short lines. No adjectives, no exclamation marks, no emoji in text. Courtesy is one word or none.',
      ],
      neverSay: ['Sorry, I didn\'t catch that', 'give me a moment', 'I\'ll get right back to you', 'our team will follow up', 'dear customer', 'kindly do the needful', 'revert back', 'as per your convenience', 'best price', 'limited time offer', 'hurry', 'cheap', 'Checking image', 'price=', 'We received a lot of photos at once', 'Just checking in', 'You also asked', 'Did you mean "Product:', 'sku=', 'stock=', 'type=goods', 'confidence', 'tagged unassigned', 'Not matched in current catalog', 'exact product name/brand', 'We\'ll get started on it right away', 'trouble processing', 'Reply with the amount for each, in the same order'],
      whatsapp: [
        'Reply like one capable person handling the order, not a bot reacting to each message. Photos arrive in bursts, often 3 to 9 at once, and lengths often come in a separate message after them. Treat the photos and the lengths that follow as one batch. Reply once the buyer has been quiet for about 30 seconds.',
        'While waiting, react 👀 to each photo. Once a photo\'s line is captured as written, change the reaction to ✅. Use no other reactions.',
        'Use the readback shape that fits the moment: one photo gets a quoted reply on that photo, a burst gets one rolled-up message, a correction gets one line. Send one message per buyer turn. Send a second only when it carries something new, such as a line the team resolved.',
        'A line that needs a person stays in the list with "our team is checking this one". Never number photos for the buyer. To talk about one photo, quote it. Never show confidence, match scores, catalogue records, internal ids, system errors or a team member\'s name.',
        'While a person has the conversation, send nothing. When they hand it back, read what they asked and what the buyer replied before doing anything. Never change a line a person edited.',
      ],
      email: 'Formal. Address the firm by name, and carry the order or enquiry reference in the subject. POs, GST invoices, proformas and dispatch paperwork belong here, not on WhatsApp. Full catalogue titles as the stock sheet writes them, metres spelled out, amounts in INR.',
      voice: 'Slow and unhurried. Read design numbers digit by digit, spell out the collection name if the line is noisy, and repeat Quality + Shade + metres back for each item, then the total metres at the end.',
      speaker: 'Priya',
      instructions: [
        'The mill has 3,000+ designs across jacquard, digital print and embroidered fabrics, sold through dealers in 17 cities. Treat that scale as assumed knowledge, never as a pitch.',
        'This channel captures orders and nothing else: read each label, take the amount and any note, say it back, take corrections, and close with a reference the dealer can quote to the team.',
      ],
    },
    stuffcool: {
      howItWrites: [
        'Warm and direct, like a distributor\'s counter staff who knows the dealer by name. Short sentences. Lead with the answer, then the detail.',
        'Always name the model and colour in full: "iPhone 15 · Clear Armor Case · Midnight". Quantities in pieces, price per piece, GST shown separately.',
        'Say back the order before drafting it. When a dealer sends a voice note, repeat what you heard in text so they can correct it.',
        'If something is out of stock, say so plainly and offer the nearest alternative in the same price band.',
      ],
      neverSay: ['Never mention stock levels', 'cheap', 'best price', 'limited time offer', 'dear customer', 'kindly do the needful', 'revert back', 'hurry', 'confidence', 'sku=', 'as per your convenience', 'just checking in'],
      whatsapp: [
        'Dealers write in a hurry, often one line per message and often as voice notes. Wait for about 20 seconds of quiet, then reply once. Read voice notes first and quote what you heard.',
        'Confirm model, colour and quantity for every line. Use the dealer\'s price band without ever naming it. Never say a band letter.',
        'Orders become a draft first. Tell the dealer "Draft ready" with the line count and the total, and ask for Confirm, Edit or Cancel.',
      ],
      email: 'Formal and brief. Subject carries the draft or order number. Attach the proforma for any order above ₹1 lakh. Amounts in INR with GST shown.',
      voice: 'Friendly and quick. Repeat model and colour for every item and read the total back once at the end.',
      speaker: 'Aarav',
      instructions: [
        'The brand sells phone accessories — cases, chargers, cables, audio and screen guards — to 400+ dealers across North and West India. Dealers reorder weekly; speed matters more than polish.',
        'Every confirmed order is posted to Tally as a sales voucher. Never promise dispatch until the voucher has posted.',
      ],
    },
    rfq: {
      howItWrites: [
        'Formal and exact, like a technical sales engineer. Quote the part number, the specification and the quantity on every line.',
        'Use the buyer\'s own wording when you echo a line, then the catalogue match. Example: "copper lug 16mm 12mm → TINNED COPPER LUGS - DIN 16 - 12 · ATD0016M12 × 3,500".',
        'When two catalogue items could fit, name both and ask which one the project drawing specifies. Never pick for the buyer.',
        'Dates and validity are always explicit: "valid until 14 Nov 2026".',
      ],
      neverSay: ['approximately', 'around', 'best price', 'cheap', 'we will try', 'hopefully', 'ASAP', 'dear sir/madam', 'kindly revert', 'do the needful', 'as discussed telephonically', 'confidence', 'match score', 'sku='],
      whatsapp: [
        'WhatsApp is for quick clarifications only. A formal RFQ belongs on email or the portal. Acknowledge the RFQ number and the due date, then move the thread to email.',
      ],
      email: 'Formal. Address the purchaser by name and quote the RFQ number in the subject. Reply with line-by-line acknowledgement, catalogue matches and any lines needing clarification. Amounts in INR, ex-GST unless stated.',
      voice: 'Calm and precise. Spell part numbers character by character and repeat quantities back.',
      speaker: 'Shubh',
      instructions: [
        'The company supplies electrical components — lugs, MCBs, contactors, cables and accessories — to panel builders and EPC contractors. RFQs usually arrive as spreadsheets or PDF lists with 20 to 200 lines.',
        'Matched lines are confirmed by a person before they go into a quote. Quotes are pushed to SAP only after confirmation.',
      ],
    },
  };

  /* ───────── playbooks ───────── */
  const POOL = {
    newhome: {
      rules: ['Reply the moment the photo is captured, and say that it is captured.', 'Echo every field read off the label on one line, in the stock sheet\'s own order: SR No | Design | Shade | Width | Quality | Quantity.', 'Match on design number first, then shade. A shade is never inferred from a colour word alone.', 'Keep the buyer\'s own amounts and decimals. 12.3 m stays 12.3 m.', 'A burst of photos is one order. Read them together and reply once.', 'If a person has confirmed a line, never change it afterwards.', 'Say the unit every time: metres, rolls or pieces.', 'A hand-off carries the case number and the reason in one sentence.'],
      guards: ['Never show confidence, scores or ids to the buyer.', 'Never guess a design number that is not on the label.', 'Never quote a price that is not on the dealer\'s band.', 'Never confirm stock before the order is posted to Coral.', 'Never promise a dispatch date.'],
      helpers: ['When two shades look alike, ask which one the sample card shows.', 'Offer the last-ordered shade first when a dealer re-orders.', 'If the length is missing, ask once for metres or rolls.', 'Offer Confirm / Edit / Cancel once the list is complete.', 'Read quantities back in the buyer\'s own unit.', 'Thank the dealer by name only when closing.'],
      titles: [[50, 'Image & label capture', 'paused', 5, 4, 3, 'Reading label photos and capturing every field as written.'], [40, 'P7. Odd inputs', null, 0, 0, 6, 'Voice notes, forwarded messages, stickers and anything that is not a plain order.'], [40, 'P8. Closing', null, 4, 2, 0, 'Confirming the order and handing the dealer a reference.'], [40, 'Quantity & units', 'paused', 4, 4, 3, 'Metres, rolls, pieces and the dealer\'s own shorthand.'], [30, 'Order confirmation & close', 'paused', 4, 4, 2, 'The Confirm / Edit / Cancel exchange and case closure.'], [30, 'P3. Bursts and lengths', null, 3, 2, 8, 'Photos that arrive in bursts, with lengths in a separate message.'], [30, 'P4. Notes', null, 6, 2, 0, 'Special instructions such as "by air" or "hold till Friday".'], [30, 'P5. Corrections', null, 4, 2, 0, 'When the dealer corrects a line after readback.'], [30, 'P6. Lines that need a person', null, 2, 3, 0, 'Low-confidence or unmatched lines that go to the area manager.'], [25, 'P9. Catalogue matching', null, 4, 3, 5, 'Matching label fields to catalogue variants.'], [20, 'Catalogue matching', 'paused', 3, 3, 2, 'Earlier catalogue-matching rules, kept for reference.'], [20, 'P2. Questions for the team', null, 5, 2, 5, 'Questions the agent cannot answer on its own.'], [10, 'Dealer desk etiquette', 'paused', 4, 3, 2, 'Tone and courtesy on the dealer desk.'], [10, 'P1. Hand-off and hand-back', null, 2, 2, 0, 'Passing a case to a person and taking it back.'], [0, 'Reply situations', 'empty', 0, 0, 0, 'Situations the agent replies to by default.'], [0, 'WhatsApp Image Order Handling', 'paused', 1, 1, 1, 'Legacy playbook for image-led orders.']],
    },
    stuffcool: {
      rules: ['Confirm model, colour and quantity for every line before drafting.', 'Read voice notes first and quote back what was heard in text.', 'Use the dealer\'s price band silently. Never name a band.', 'A draft order is created first; the dealer confirms it with one tap.', 'Name the model and colour in full on every line.', 'Pieces, not packs, unless the dealer says packs.', 'Pass the case to a person when a dealer disputes a price.'],
      guards: ['Never mention stock levels in a reply.', 'Never promise dispatch before the Tally voucher is posted.', 'Never discount outside the rate card.', 'Never share another dealer\'s prices or orders.', 'Never edit a draft a person has approved.'],
      helpers: ['Offer the dealer\'s usual colour first on a re-order.', 'Suggest a matching screen guard when a case is ordered.', 'If a model is out of stock, offer the nearest in the same price band.', 'Ask once for a missing quantity.', 'Mention the Diwali slab only when the dealer asks about offers.'],
      titles: [[50, 'Voice note capture', null, 5, 3, 3, 'Reading dealer voice notes and confirming what was heard.'], [40, 'Order capture', null, 6, 3, 4, 'Turning dealer messages into a draft order.'], [40, 'Price band & credit', null, 4, 4, 2, 'Applying the dealer\'s band and checking the credit limit.'], [30, 'Order confirmation & close', null, 4, 2, 3, 'Confirm / Edit / Cancel and handing out the draft number.'], [30, 'Tally voucher sync', null, 3, 3, 2, 'What may be said while a voucher is posting to Tally.'], [30, 'Corrections', null, 4, 2, 1, 'When the dealer changes a line after readback.'], [20, 'Questions for the team', null, 3, 2, 3, 'Questions the agent cannot answer on its own.'], [10, 'Hand-off and hand-back', null, 2, 2, 1, 'Passing a case to a person and taking it back.'], [10, 'Dealer etiquette', 'paused', 3, 2, 2, 'Tone and courtesy with dealers.'], [0, 'Reply situations', 'empty', 0, 0, 0, 'Situations the agent replies to by default.']],
    },
    rfq: {
      rules: ['Quote the part number, specification and quantity on every line.', 'Echo the buyer\'s wording first, then the catalogue match.', 'Name both candidates when two items could fit, and ask which the drawing specifies.', 'Every date in a reply is explicit, with the day and month.', 'Acknowledge the RFQ number and due date within the first reply.', 'Lines are confirmed by a person before they go into a quote.'],
      guards: ['Never pick between two possible matches for the buyer.', 'Never quote a price that is not on the rate card.', 'Never push a quote to SAP before every line is confirmed.', 'Never promise delivery without stock confirmation.', 'Never reveal another customer\'s RFQ or pricing.'],
      helpers: ['Offer the last-quoted price list when a buyer repeats an RFQ.', 'Suggest the DIN equivalent when the buyer gives a trade name.', 'Flag lines with unusual quantities for a second look.', 'Ask once for the project name when it is missing.', 'Offer to split the quote by delivery site.'],
      titles: [[50, 'RFQ intake', null, 5, 3, 3, 'Reading RFQ emails, spreadsheets and PDFs line by line.'], [40, 'Catalogue matching', null, 5, 3, 4, 'Matching buyer descriptions to catalogue variants.'], [40, 'Kits & components', null, 3, 2, 2, 'Lines that are kits or assemblies of several components.'], [30, 'Clarifications', null, 4, 2, 3, 'Questions back to the buyer about a line.'], [30, 'Quote preparation', null, 4, 3, 2, 'Pricing, validity and terms.'], [20, 'Send to SAP', null, 3, 3, 1, 'Pushing a confirmed RFQ line set to SAP.'], [10, 'Hand-off and hand-back', null, 2, 2, 1, 'Passing an RFQ to a person and taking it back.'], [0, 'Reply situations', 'empty', 0, 0, 0, 'Situations the agent replies to by default.'], [0, 'test', 'empty', 0, 0, 0, 'Scratch playbook.']],
    },
  };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pick = (arr, n, off) => Array.from({ length: n }, (_, i) => ({ id: 'x' + (off + i), text: arr[(off + i) % arr.length] }));

  /* ───────── limits ───────── */
  const LIMIT_ROWS = (erp) => [
    ['answer', 'Answer / analyse', 'Reply to questions, summarise', 'Auto-approve'],
    ['draft_quote', 'Draft a quote', 'Compose options & pricing', 'Auto-draft'],
    ['send_quote', 'Send a quote', 'Send to the customer', 'Requires approval'],
    ['assign_carrier', 'Assign carrier', 'Pick courier per leg', 'Requires approval'],
    ['thread_followup', 'Thread follow-up reply', 'Auto-reply to customer messages on ongoing threads (post-qualification)', 'Off'],
    ['screen_inbound', 'Screen inbound messages', 'AI gate: classify inbound messages as business enquiry or noise', 'Auto-approve'],
    ['qualify_inbound', 'Qualify inbound enquiry', 'AI extraction: create Opportunity, Account, Contact from screened message', 'Auto-approve'],
    ['price_commit', 'Price / discount commit', 'Commit money or terms', 'Requires approval'],
    ['confirm_order', 'Confirm a captured order', 'Convert a tool-calling agent\'s captured DraftOrder into a real Order', 'Off'],
    ['escalate_order', 'Escalate order conversation to a human', 'Hand an order conversation to a person instead of the agent replying', 'Off'],
    ['confirm_intake', 'Confirm a captured intake enquiry', 'Convert a collected IntakeEnquiry into a real object (RFQ today)', 'Off'],
    ['escalate_intake', 'Escalate intake conversation to a human', 'Hand an intake conversation to a person instead of the agent replying', 'Off'],
    ['push_erp', 'Push a confirmed order to the ERP', 'Create the matching sales order in the merchant\'s ERP (e.g. ' + erp + ') from a confirmed DraftOrder', 'Auto-approve'],
    ['webhook', 'Call an external webhook or API', 'Send an HTTP request from a workflow to an address the merchant chose', 'Off'],
    ['stock_sheet', 'Update stock from a spreadsheet', 'Set stock levels from the merchant\'s own spreadsheet on a schedule or on demand', 'Requires approval'],
    ['write_sheet', 'Write to the merchant\'s spreadsheet', 'Add rows (e.g. confirmed draft orders) to a spreadsheet the merchant connected', 'Requires approval'],
  ];

  /* ───────── usage ───────── */
  const USAGE = {
    newhome: { start: '2026-10-06', end: '2026-11-05', day: 22, days: 30, m: { seats: 0, tokens: 6.1e6, actions: 2300, email: 11, catalog: 0, wa: 412, voice: 0, storage: 0.108, knowledge: 6 } },
    stuffcool: { start: '2026-10-06', end: '2026-11-05', day: 22, days: 30, m: { seats: 0, tokens: 9.8e6, actions: 4100, email: 86, catalog: 240, wa: 1840, voice: 22400, storage: 0.412, knowledge: 9 } },
    rfq: { start: '2026-10-06', end: '2026-11-05', day: 22, days: 30, m: { seats: 0, tokens: 14.6e6, actions: 6800, email: 2140, catalog: 38, wa: 96, voice: 0, storage: 6.74, knowledge: 14 } },
  };
  const METERS = [
    ['Team', 'users', [['seats', 'Human Seat', 100, 'seat', 'Overage 5 per seat']]],
    ['AI', 'sparkle', [['tokens', 'AI Token', 50e6, 'token', 'Overage 0.000002 per token. Pauses at the cap until reset', true], ['actions', 'AI Action', 100e3, 'action', 'Overage 0.01 per action']]],
    ['Messaging', 'chat', [['email', 'Email Send', 10e3, 'email', 'Overage 0.01 per email'], ['catalog', 'Catalog Send', 10e3, 'link', 'Overage 0.02 per link'], ['wa', 'WhatsApp Conversation', 10e3, 'conversation', 'Overage 0.05 per conversation']]],
    ['Voice', 'phone', [['voice', 'Voice Call Second', 1e6, 'second', 'Overage 0.01 per second']]],
    ['Storage', 'database', [['storage', 'Storage (GB)', 1e3, 'GB', 'Overage 0.5 per GB']]],
    ['Other', 'blocks', [['knowledge', 'Knowledge Source', 100, 'source', 'Overage 1 per source']]],
  ];

  ['newhome', 'stuffcool', 'rfq'].forEach((uc) => {
    const users = ((DM.seed[uc] || {}).users) || [];
    DM.data(uc, 'plan', { name: PLAN[uc].name, badge: PLAN[uc].badge, allowances: ALLOW, modules: PLAN[uc].modules });
    DM.data(uc, 'roles', ROLE_SET[uc].map((name) => {
      const d = ROLE_DEFS.find((r) => r[0] === name);
      return { id: 'role-' + slug(name), name, desc: d[1], escalation: d[2], active: true, onlyAssigned: name === 'Sales Exc' || name === 'ASM', access: Object.fromEntries(MODULES.map((m) => [m, perm(name, m)])) };
    }));
    DM.data(uc, 'accessModules', MODULES);
    DM.data(uc, 'invites', uc === 'newhome'
      ? [{ id: 'inv-1', email: 'ritu.sawant@demo-merchant.example', role: 'Admin', invitedBy: 'u-rohan', sent: '2026-10-26', expires: '2026-10-28', status: 'pending' }]
      : uc === 'stuffcool'
        ? [{ id: 'inv-1', email: 'varun.malik@demo-merchant.example', role: 'Sales', invitedBy: 'u-rohan', sent: '2026-10-26', expires: '2026-10-28', status: 'pending' }]
        : [{ id: 'inv-1', email: 'deepa.kamat@demo-merchant.example', role: 'Sales', invitedBy: 'u-rohan', sent: '2026-10-25', expires: '2026-10-27', status: 'pending' }, { id: 'inv-2', email: 'ganesh.rao@demo-merchant.example', role: 'Finance', invitedBy: 'u-rohan', sent: '2026-10-26', expires: '2026-10-28', status: 'pending' }]);
    DM.data(uc, 'navModules', NAVM[uc].map(([label, canonical, icon, rail, grp]) => ({ key: slug(canonical), label, canonical, icon, rail, group: grp, renamed: label !== canonical })));
    DM.data(uc, 'navLabels', {});
    DM.data(uc, 'navFields', {});
    const rb = RB[uc];
    DM.data(uc, 'rulebook', { howItWrites: rb.howItWrites, neverSay: rb.neverSay, channels: { whatsapp: rb.whatsapp, email: rb.email, voice: rb.voice, speaker: rb.speaker }, instructions: rb.instructions });
    const P = POOL[uc]; let off = 0;
    DM.data(uc, 'playbooks', P.titles.map(([priority, title, state, nr, ng, nh, desc], i) => {
      const pb = { id: 'pb-' + (i + 1), priority, title, desc, active: state !== 'paused', empty: state === 'empty', rules: pick(P.rules, nr, off), guardrails: pick(P.guards, ng, off + 1), helpers: pick(P.helpers, nh, off + 2), editedAt: '2026-10-' + String(22 - (i % 6)).padStart(2, '0') + 'T11:20:00+05:30' };
      off += 2; return pb;
    }));
    const erp = uc === 'newhome' ? 'Coral' : uc === 'stuffcool' ? 'Tally' : 'SAP';
    DM.data(uc, 'limits', { rows: LIMIT_ROWS(erp).map(([key, label, desc, value]) => ({ key, label, desc, value })) });
    const U = USAGE[uc];
    DM.data(uc, 'usage', { badge: PLAN[uc].badge || 'Test plan', start: U.start, end: U.end, day: U.day, days: U.days, used: U.m, meters: METERS.map(([section, icon, rows]) => ({ section, icon, rows: rows.map(([k, label, cap, unit, over, hard]) => ({ key: k, label, cap, unit, over, hard: !!hard })) })) });
    void users;
  });

  /* Shapes (for scenario authors)
     plan         {name, badge, allowances:[[value,label]], modules:[label]}
     roles        [{id,name,desc,escalation:bool,active,onlyAssigned,access:{<module>:[view,create,edit,delete,approve]}}]   (member counts are computed from users[].role)
     invites      [{id,email,role,invitedBy:userId,sent:'YYYY-MM-DD',expires,status:'pending'}]
     navModules   [{key,label,canonical,icon,rail:railKey|null,group:'d'|'a',renamed}]   navLabels {railKey:label}   navFields {moduleKey:[{key,label,type,...}]}
     rulebook     {howItWrites:[para], neverSay:[phrase], channels:{whatsapp:[para],email:str,voice:str,speaker:str}, instructions:[para]}
     playbooks    [{id,priority,title,desc,active,empty,rules:[{id,text}],guardrails:[...],helpers:[...],editedAt}]
     limits       {rows:[{key,label,desc,value:'Requires approval'|'Auto-approve'|'Auto-draft'|'Auto-send'|'Off'}]}
     usage        {badge,start,end,day,days,used:{<meterKey>:n},meters:[{section,icon,rows:[{key,label,cap,unit,over,hard}]}]}   */
})();
