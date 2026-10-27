/* Extra seed for Settings / Apps / Channels / Logs rework — DM.data(uc, key, value). Loaded after the three use-case files. */
(function () {
  const UCS = ['rfq', 'stuffcool', 'newhome'];
  const seedOf = (uc) => DM.seed[uc] || (DM.seed[uc] = {});

  /* ── company extras ── */
  const COMPANY = {
    rfq: { handle: '@access-electricals', timezone: 'Asia/Kolkata', domain: 'access-electricals.example' },
    stuffcool: { handle: '@stuffcool', timezone: 'Asia/Kolkata', domain: 'merchants.anuma.run/stuffcool' },
    newhome: { handle: '@nuhome', timezone: 'Asia/Kolkata', domain: 'nuhome-demo.in' },
  };

  /* ── plan + entitlements ── */
  const ENT = {
    rfq: ['25 Human seats', '20.0M AI tokens', '60K AI actions', '500 Storage (GB)', '10K Email sends', '5K WhatsApp conversations', '2K Document parses (PDF / Excel)', '50 Knowledge sources', 'crm', 'crm.accounts', 'crm.contacts', 'crm.deals', 'oms.rfqs', 'oms.quotes', 'oms.draft_order', 'inbox', 'pim.product', 'analytics'],
    stuffcool: ['25 Human seats', '30.0M AI tokens', '80K AI actions', '500 Storage (GB)', '10K WhatsApp conversations', '10K Catalog sends', '5K ERP vouchers (Tally)', '50 Knowledge sources', 'crm', 'crm.accounts', 'crm.contacts', 'campaigns', 'oms.draft_order', 'inbox', 'pim.product', 'analytics'],
    newhome: ['100 Human seats', '50.0M AI tokens', '100K AI actions', '1.0K Storage (GB)', '10K WhatsApp conversations', '10K Email sends', '10K Catalog sends', '1.0M Voice call seconds', '100 Knowledge sources', 'analytics', 'crm', 'crm.accounts', 'crm.contacts', 'crm.tasks', 'inbox', 'oms.draft_order', 'pim.product'],
  };

  /* ── navigation modules (code, label, icon, rail key, renamed) ── */
  const MODS = [
    ['ai_policy', 'AI Policy', 'shield'], ['analytics', 'Home', 'dashboard', 'dashboard', true], ['campaigns', 'Campaigns', 'megaphone', 'campaigns'], ['crm', 'CRM', 'users', 'crm'], ['crm.accounts', 'Party', 'building', null, true],
    ['crm.contacts', 'Contacts', 'user'], ['crm.deals', 'Deals', 'handshake', 'leads'], ['crm.leads', 'Leads', 'cart'], ['crm.tasks', 'Tasks', 'check'], ['inbox', 'Inbox', 'inbox', 'inbox'],
    ['intake.enquiries', 'Intake Enquiries', 'cart'], ['merchant', 'Merchant', 'building'], ['merchants.merchant_apps', 'Apps', 'blocks', null, true], ['merchants.merchant_entities', 'Merchant Entities', 'layout'],
    ['merchants.merchant_modules', 'Merchant Modules', 'grid'], ['merchants.merchant_users', 'Merchant Users', 'users'], ['oms', 'OMS', 'clipboard'], ['oms.draft_order', 'Orders', 'file', 'orders', true],
    ['oms.quotes', 'Quotes', 'receipt', 'quotes'], ['oms.rfqs', 'RFQs', 'sheet', 'rfqs'], ['pim', 'PIM', 'package'], ['pim.box', 'Boxes', 'box'], ['pim.collection', 'Collections', 'layout'],
    ['pim.product', 'Products', 'package', 'products'], ['workflows', 'Workflows', 'workflow'],
  ].map(([code, label, icon, rail, renamed]) => ({ code, label, icon, rail: rail || null, renamed: !!renamed }));

  const FIELDS = {
    'crm.accounts': [{ name: 'Price band', type: 'Select' }, { name: 'Credit terms', type: 'Text' }, { name: 'GSTIN', type: 'Text' }],
    'crm.contacts': [{ name: 'Preferred language', type: 'Select' }],
    'pim.product': [{ name: 'Leaf no', type: 'Text' }, { name: 'Shade', type: 'Text' }, { name: 'Width (cm)', type: 'Number' }],
    'oms.draft_order': [{ name: 'Source case', type: 'Link' }, { name: 'ERP reference', type: 'Text' }],
  };

  /* ── roles / invites / extra humans ── */
  const ROLES = {
    rfq: [['Estimator', 'Quotes, RFQs, Products', 3], ['Credit controller', 'Approvals, CRM', 1], ['Branch sales', 'Inbox, RFQs, Orders', 2]],
    stuffcool: [['Dealer desk', 'Inbox, Orders, CRM', 3], ['Accounts (Tally)', 'Orders, Apps, Logs', 1], ['Catalogue manager', 'Products, Campaigns', 1]],
    newhome: [['ASM', 'Inbox, Orders, CRM', 5], ['Order reviewer', 'Inbox, Orders', 2], ['Catalogue editor', 'Products', 1]],
  };
  const INVITES = {
    rfq: [['site.engineer@access-electricals.example', 'Sales'], ['procurement@access-electricals.example', 'Admin']],
    stuffcool: [['dispatch@stuffcool.example', 'Sales']],
    newhome: [['mumbai.asm@nuhome-demo.in', 'ASM']],
  };
  const EXTRA_USERS = {
    rfq: [['Kavita Deshmukh', 'Sales', 'kavita.d'], ['Rohan Pawar', 'Sales', 'rohan.p'], ['Imran Sheikh', 'Sales', 'imran.s'], ['Neha Joshi', 'Accounts', 'neha.j'], ['Suresh Naik', 'Sales', 'suresh.n']],
    stuffcool: [['Mehul Parekh', 'Sales', 'mehul.p'], ['Farah Khan', 'Sales', 'farah.k'], ['Dinesh Rao', 'Sales', 'dinesh.r'], ['Pallavi Menon', 'Accounts', 'pallavi.m'], ['Yash Thakkar', 'Sales', 'yash.t']],
    newhome: [['Rakesh Tiwari', 'Sales', 'rakesh.t'], ['Meena Kapadia', 'Sales', 'meena.k'], ['Anil Bhosale', 'Sales', 'anil.b'], ['Rekha Iyer', 'Accounts', 'rekha.i'], ['Harish Vora', 'Sales', 'harish.v']],
  };
  const JOINED = ['2026-10-14', '2026-10-14', '2026-10-14', '2026-10-02', '2026-09-21', '2026-10-01', '2026-09-12', '2026-10-14'];

  /* ── rulebook voice / per-channel rules ── */
  const NEVER = ['Sorry, I didn\'t catch that', 'give me a moment', 'I\'ll get right back to you', 'our team will follow up', 'dear customer', 'kindly do the needful', 'revert back', 'as per your convenience', 'best price', 'limited time offer', 'hurry', 'cheap', 'Checking image', 'price=', 'We received a lot of photos at once', 'Just checking in', 'You also asked', 'Did you mean "Product:', 'sku=', 'stock=', 'type=goods', 'confidence', 'tagged unassigned', 'Not matched in current catalogue', 'exact product name/brand', 'trouble processing'];
  const VOICE = {
    rfq: {
      writes: ['Write like Access Electricals\' estimating desk: precise, brief, trade-fluent. The contractor is pricing a job, not browsing.', 'Quote every line as the contractor wrote it, then the matched catalogue item, then the rate. Example: 4 sqmm FR cable, 90 m coil → Rapid FR 4 sqmm Red 90 m · ₹2,840.', 'Keep the contractor\'s quantities and units. 40 coils stays 40 coils. Never a bare number.', 'Say what you understood before you act. A wrong line caught at a glance is the point of the reply.', 'When a line needs a person, say "our estimator is checking this one". Never guess a brand or rating.', 'Short lines. No adjectives, no exclamation marks, no emoji in text. Courtesy is one word or none.'],
      channels: [{ id: 'whatsapp', label: 'WhatsApp', text: 'Contractors send site lists as photos, voice notes and typed messages, often across several messages. Treat everything within about five minutes as one RFQ. Reply once the buyer has been quiet for about 30 seconds. React with a tick to each captured line. Never show match scores, catalogue records, SKUs or internal ids. For lines with no confident match, say "our estimator is checking this one" and keep the rest moving.' }, { id: 'email', label: 'Email', text: 'RFQs arrive as PDF or Excel attachments with a forwarded thread. Parse every sheet and page, then reply on the same thread with a numbered table: your line, our item, qty, rate. Attach the quote PDF only after approval. Keep the subject line unchanged and sign off with the estimator\'s name.' }],
    },
    stuffcool: {
      writes: ['Write like Stuffcool\'s dealer desk: quick, friendly, to the point. The dealer is restocking, not browsing.', 'Say each line back as model, colour, then quantity. Example: iPhone 15 Pro silicon case · Black · 24 pcs.', 'Keep the dealer\'s own numbers. 24 pcs stays 24 pcs. Never a bare number.', 'Confirm the price band you applied (A, B or C) once per order, never per line.', 'When a line needs a person, say "our team is checking this one". Never guess a model or colour.', 'Short lines. No exclamation marks, no emoji in text. Courtesy is one word or none.'],
      channels: [{ id: 'whatsapp', label: 'WhatsApp', text: 'Dealers send orders as typed lists, stock-sheet screenshots and voice notes. Treat messages within about five minutes as one order. Reply once the dealer has been quiet for about 30 seconds. Always show the draft with Confirm, Edit and Cancel buttons. Never mention vouchers, ledgers or Tally. Once confirmed, say "Received. SC-26-0399, 6 lines" and stop.' }, { id: 'email', label: 'Email', text: 'Order mails from dealers usually carry an Excel with SKUs. Reply on the same thread with the confirmed lines and total. Mention the price band and the credit status only when an order is held.' }],
    },
    newhome: {
      writes: ['Write like NuHome\'s order desk: brisk, precise, trade-fluent. The dealer is restocking, not browsing. Reply in English, even when the buyer writes in Hinglish or Malayalam.', 'Say each line back as the label reads it, then the length, then any note. Example: VISE SR 38 · 12.3 m · by air.', 'Keep the buyer\'s own amounts and decimals. 12.3 m stays 12.3 m. 2 rolls stays 2 rolls. Never a bare number.', 'Say back what you understood before you act. A wrong read caught at a glance is the point of the reply.', 'When a line needs a person, say "our team is checking this one". Never guess, and never describe how you searched.', 'Short lines. No adjectives, no exclamation marks, no emoji in text. Courtesy is one word or none.'],
      channels: [{ id: 'whatsapp', label: 'WhatsApp', text: 'Reply like one capable person handling the order, not a bot reacting to each message. Photos arrive in bursts, often 3 to 9 at once, and lengths often come in a separate message after them. Treat the photos and the lengths that follow as one batch. Reply once the buyer has been quiet for about 30 seconds. While waiting, react with 👀 to each photo. Once a photo\'s line is captured as written, change the reaction to ✅. Use no other reactions. Never show confidence, match scores, catalogue records, internal ids, system errors or a team member\'s name. While a person has the conversation, send nothing. After they hand it back, read what they asked and what the buyer replied before doing anything. Never change a line a person edited.' }, { id: 'email', label: 'Email', text: 'Order mails come with a PDF or a photo of the label. Reply on the same thread with the numbered lines, the totals and the dispatch note. Keep the original subject. Sign off "NuHome order desk".' }],
    },
  };

  /* ── usage cycle ── */
  const USAGE = {
    rfq: { plan: 'Growth plan', donuts: [['AI Token', 'hard cap', 9.2e6, 20e6, 'token'], ['AI Action', '', 8.1e3, 60e3, 'action'], ['Email Send', '', 1.4e3, 10e3, 'email']], sections: [
      ['Team', 'users', [['Human Seat', 0, 7, 25, 'seat', 'Overage ₹250 per seat']]],
      ['AI', 'sparkle', [['AI Token', 1, 9.2e6, 20e6, 'token', 'Overage ₹0.000002 per token. Pauses at the cap until reset'], ['AI Action', 0, 8.1e3, 60e3, 'action', 'Overage ₹0.01 per action'], ['Document Parse', 0, 312, 2e3, 'page', 'Overage ₹0.40 per page']]],
      ['Messaging', 'chat', [['Email Send', 0, 1.4e3, 10e3, 'email', 'Overage ₹0.01 per email'], ['WhatsApp Conversation', 0, 1.1e3, 5e3, 'conversation', 'Overage ₹0.80 per conversation'], ['Catalog Send', 0, 0, 10e3, 'link', 'Overage ₹0.05 per link']]]] },
    stuffcool: { plan: 'Growth plan', donuts: [['AI Token', 'hard cap', 12.4e6, 30e6, 'token'], ['AI Action', '', 7.4e3, 80e3, 'action'], ['ERP Voucher', '', 312, 5e3, 'voucher']], sections: [
      ['Team', 'users', [['Human Seat', 0, 7, 25, 'seat', 'Overage ₹250 per seat']]],
      ['AI', 'sparkle', [['AI Token', 1, 12.4e6, 30e6, 'token', 'Overage ₹0.000002 per token. Pauses at the cap until reset'], ['AI Action', 0, 7.4e3, 80e3, 'action', 'Overage ₹0.01 per action']]],
      ['Messaging', 'chat', [['WhatsApp Conversation', 0, 1.86e3, 10e3, 'conversation', 'Overage ₹0.80 per conversation'], ['Catalog Send', 0, 2.3e3, 10e3, 'link', 'Overage ₹0.05 per link']]],
      ['Integrations', 'blocks', [['ERP Voucher (Tally)', 0, 312, 5e3, 'voucher', 'Overage ₹1 per voucher']]]] },
    newhome: { plan: 'Test plan', donuts: [['AI Token', 'hard cap', 6.1e6, 50e6, 'token'], ['AI Action', '', 2.3e3, 100e3, 'action'], ['Email Send', '', 11, 10e3, 'email']], sections: [
      ['Team', 'users', [['Human Seat', 0, 0, 100, 'seat', 'Overage ₹5 per seat', 'Not used this cycle.']]],
      ['AI', 'sparkle', [['AI Token', 1, 6.1e6, 50e6, 'token', 'Overage ₹0.000002 per token. Pauses at the cap until reset'], ['AI Action', 0, 2.3e3, 100e3, 'action', 'Overage ₹0.01 per action']]],
      ['Messaging', 'chat', [['Email Send', 0, 11, 10e3, 'email', 'Overage ₹0.01 per email'], ['Catalog Send', 0, 0, 10e3, 'link', 'Overage ₹0.05 per link']]],
      ['Integrations', 'blocks', [['Orders posted to Coralio', 0, 118, 500, 'order', 'Overage ₹2 per order']]]] },
  };

  /* ── app tweaks ── */
  const EXTRA_APPS = [
    { slug: 'dynamics365', name: 'Microsoft Dynamics 365', desc: 'Bi-directional sync with Microsoft Dynamics 365 CRM.', category: 'CRM / ERP', state: 'available', icon: '#2563eb', letter: 'D' },
    { slug: 'zoho', name: 'Zoho CRM', desc: 'Sync contacts, accounts, and deals with Zoho CRM.', category: 'CRM / ERP', state: 'available', icon: '#dc2626', letter: 'Z' },
  ];
  const DESC = {
    coralio: ['Pull products, categories, account/org groups, and org units from Coral ERP; push confirmed draft orders as sales-orders.', 'CRM / ERP'],
    tally: ['Post confirmed orders to TallyPrime as Sales vouchers over the HTTP/XML gateway, and read ledgers and stock items back.', 'Accounting'],
    shopify: ['Connect your Shopify store. Read and write products, orders, customers, fulfillments, draft orders, and metafields via the GraphQL Admin API.', 'E-Commerce'],
    gsheets: ['Read and search rows in a Google Sheet. Share the sheet with Anuma\'s account and prove it is yours; no Google Cloud setup. A connector only.', 'Spreadsheets'],
  };

  UCS.forEach((uc) => {
    const S = seedOf(uc); if (!S.company) return;
    Object.assign(S.company, COMPANY[uc]);
    S.plan = { name: USAGE[uc].plan, status: 'Active', title: USAGE[uc].plan.replace(' plan', ''), entitlements: ENT[uc] };
    S.modules = MODS.map((m) => Object.assign({}, m, { fields: (FIELDS[m.code] || []).map((f) => Object.assign({}, f)) }));
    S.roles = ROLES[uc].map(([name, access, members], i) => ({ id: 'role-' + (i + 1), name, access, members }));
    S.invites = INVITES[uc].map(([email, role], i) => ({ id: 'inv-' + (i + 1), email, role, sent: '2026-10-2' + (i + 4) }));
    const used = new Set((S.users || []).map((u) => u.id));
    (S.users || []).forEach((u, i) => { u.joined = u.joined || JOINED[i % JOINED.length]; });
    EXTRA_USERS[uc].forEach(([name, role, em], i) => { const id = 'ux-' + (i + 1); if (used.has(id)) return; S.users.push({ id, name, role, email: em + '@' + (S.company.domain || 'demo.anuma.run').split('/')[0], phone: '+91 98' + (200 + i * 7) + ' ' + (10000 + i * 913), status: 'active', last: '2026-10-2' + (i % 7), joined: JOINED[(i + 3) % JOINED.length], modules: ['inbox'] }); });
    S.voice = { writes: VOICE[uc].writes.slice(), never: NEVER.slice(0, uc === 'newhome' ? 26 : 22), channels: VOICE[uc].channels.map((c) => Object.assign({}, c)) };
    const U = USAGE[uc];
    S.usageCycle = { start: '2026-10-06', end: '2026-11-05', today: '2026-10-27', plan: U.plan, donuts: U.donuts.map(([label, tag, used, limit, unit]) => ({ label, tag, used, limit, unit })), sections: U.sections.map(([title, icon, items]) => ({ title, icon, items: items.map(([label, hard, used, limit, unit, overage, note]) => ({ label, hard: !!hard, used, limit, unit, overage, note })) })) };
    // apps: live copy + extra CRM/ERP apps
    (S.apps || []).forEach((a) => { const d = DESC[a.slug]; if (d) { a.desc = d[0]; a.category = d[1]; } if (['coralio', 'tally', 'gsheets', 'zoho'].includes(a.slug)) a.tag = 'Beta'; if (a.slug === 'shopify') a.tag = 'Featured'; if (['shopify', 'tally', 'gsheets', 'zoho', 'dynamics365', 'zohobooks', 'razorpay', 'shiprocket'].includes(a.slug)) a.docs = true; });
    EXTRA_APPS.forEach((e) => { if (S.apps && !S.apps.some((a) => a.slug === e.slug)) S.apps.push(Object.assign({ docs: true }, e)); });
    S.navHidden = S.navHidden || [];
  });
})();
