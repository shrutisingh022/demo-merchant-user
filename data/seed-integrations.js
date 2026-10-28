/* Seed: Channels, WhatsApp numbers, Apps (+ ERP configure data), ERP activity log, audit Logs — all three use cases.
   Spec: docs/spec/workspace.md §3–4, docs/spec/shell-home.md §4. Fake data only. Shapes documented at the bottom. */
(function () {
  if (!window.DM) return;
  const DM = window.DM;
  const IST = 5.5 * 3600e3;
  const iso = (y, mo, d, h, mi, s = 0) => new Date(Date.UTC(y, mo - 1, d, h, mi, s) - IST).toISOString();
  let seedN = 1;
  const rnd = () => { seedN = (seedN * 1664525 + 1013904223) >>> 0; return seedN / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  /* ───────── channels & numbers ───────── */
  const CHANNELS = {
    newhome: [
      { id: 'ch-1', type: 'whatsapp', name: 'Order Desk - 9820011122', provider: '360dialog', state: 'live', agent: 'Anuma', updatedAt: iso(2026, 10, 8, 12, 4), number: '+919820011122', wabaId: '388655514327021', phoneId: '331922513348350', webhook: 'https://hooks.demo-merchant.example/whatsapp/360d/ch-1', active: true },
      { id: 'ch-2', type: 'whatsapp', name: 'Plivo #1 (send_whatsapp)', provider: 'Plivo', state: 'paused', agent: 'Anuma', updatedAt: iso(2026, 10, 21, 16, 40), number: '+919820011199', wabaId: '204118820113377', phoneId: '110482993021846', webhook: 'https://hooks.demo-merchant.example/whatsapp/plivo/ch-2', active: false },
    ],
    stuffcool: [
      { id: 'ch-1', type: 'whatsapp', name: 'WhatsApp (+91-9810055501)', provider: '360dialog', state: 'live', agent: 'Order Desk', updatedAt: iso(2026, 10, 14, 10, 12), number: '+919810055501', wabaId: '412208876650193', phoneId: '298554017733620', webhook: 'https://hooks.demo-merchant.example/whatsapp/360d/ch-1', active: true },
      { id: 'ch-2', type: 'email', name: 'Dealer Desk (orders@demo-merchant.example)', provider: 'Gmail', state: 'live', agent: 'Order Desk', updatedAt: iso(2026, 10, 19, 15, 31), number: 'orders@demo-merchant.example', webhook: 'https://hooks.demo-merchant.example/email/gmail/ch-2', active: true },
    ],
    rfq: [
      { id: 'ch-1', type: 'email', name: 'RFQ Desk (rfq@demo-merchant.example)', provider: 'Gmail', state: 'live', agent: 'Anuma', updatedAt: iso(2026, 10, 6, 19, 50), number: 'rfq@demo-merchant.example', webhook: 'https://hooks.demo-merchant.example/email/gmail/ch-1', active: true },
      { id: 'ch-2', type: 'whatsapp', name: 'Sales Desk - 9822044410', provider: '360dialog', state: 'paused', agent: 'Anuma', updatedAt: iso(2026, 10, 12, 11, 5), number: '+919822044410', wabaId: '551730228194420', phoneId: '188204339047511', webhook: 'https://hooks.demo-merchant.example/whatsapp/360d/ch-2', active: false },
    ],
  };
  const NUMBERS = {
    newhome: [{ id: 'num-1', label: 'Order Desk - 9820011122', number: '+91 98200 11122', channelId: 'ch-1' }, { id: 'num-2', label: 'Plivo #1 (send_whatsapp)', number: '+91 98200 11199', channelId: 'ch-2' }],
    stuffcool: [{ id: 'num-1', label: 'WhatsApp (+91-9810055501)', number: '+91 98100 55501', channelId: 'ch-1' }],
    rfq: [],
  };

  /* ───────── apps ───────── */
  const COMMON = (uc) => ({
    gsheets: { slug: 'google-sheets', name: 'Google Sheets', category: 'Spreadsheets', tag: 'Beta', desc: 'Read, write and search rows in a Google Sheet. Share the sheet with Anuma\'s account and prove it is yours; no Google Cloud setup. A connector only: what the rows mean is up to the workflow that uses them.', logo: { bg: '#e6f4ea', fg: '#188038', t: 'S' } },
    send: { slug: 'test-send-whatsapp', name: 'Test send_whatsapp', category: 'Team Chat', tag: '', desc: 'No description yet.', logo: { bg: '#f5f5f5', fg: '#525252', t: '' } },
    dyn: { slug: 'microsoft-dynamics-365', name: 'Microsoft Dynamics 365', category: 'CRM / ERP', tag: '', desc: 'Bi-directional sync with Microsoft Dynamics 365 CRM.', logo: { bg: '#e8f0fe', fg: '#1a56db', t: 'D' } },
    zoho: { slug: 'zoho-crm', name: 'Zoho CRM', category: 'CRM / ERP', tag: 'Beta', desc: 'Sync contacts, accounts, and deals with Zoho CRM.', logo: { bg: '#fdecea', fg: '#d93025', t: 'Z' } },
    shopify: { slug: 'shopify', name: 'Shopify', category: 'E-Commerce', tag: 'Featured', desc: 'Connect your Shopify store. Read and write products, orders, customers, fulfillments, draft orders, and metafields via the GraphQL Admin API.', logo: { bg: '#e6f4ea', fg: '#2e7d32', t: 'S' } },
    coral: { slug: 'coral-erp', name: 'Coral ERP', category: 'CRM / ERP', tag: 'Beta', desc: 'Pull products, categories, account/org groups, and org units from Coral ERP; push confirmed draft orders as sales-orders.', logo: { bg: '#fff1e6', fg: '#c2410c', t: 'C' } },
    tally: { slug: 'tally', name: 'Tally', category: 'CRM / ERP', tag: 'Beta', desc: 'Pull stock items and ledgers from Tally Prime; post confirmed draft orders as sales vouchers.', logo: { bg: '#fff7e0', fg: '#b45309', t: 'T' } },
    sap: { slug: 'sap', name: 'SAP', category: 'CRM / ERP', tag: 'Beta', desc: 'Pull materials and customers from SAP S/4HANA; send confirmed RFQ lines and quotes to SAP as sales documents.', logo: { bg: '#e8f0fe', fg: '#0b5cad', t: 'SAP' } },
  });
  const CONFIG = {
    'coral-erp': { label: 'Coral ERP', defaultCourier: '', salesUserRole: 'Sales', orderRefPrefix: 'DMO', productGroups: ['Finished Fabrics for JACQUARD FURNISHING - ALBUMS', 'Finished Fabrics for DIGITAL PRINTED FURNISHING - ALBUMS', 'EMBROIDERED FURNISHING FABRICS MULTI - FINISHED FOR ALBUMS', 'Finished Fabrics for UPHOLSTERY - ALBUMS'], defaultTransport: '', attrMap: [{ field: 'Quality', attr: 'attribute3' }, { field: 'Width', attr: 'attribute7' }, { field: 'Shade', attr: 'attribute9' }] },
    tally: { label: 'Tally Prime', companyName: 'Demo Merchant User Pvt Ltd', gatewayUrl: 'http://tally-gw.demo-merchant.example:9000', salesLedger: 'Sales - Mobile Accessories', voucherType: 'Sales', voucherPrefix: 'SC', godown: 'Main Location', autoPost: true, ledgerMap: [{ party: 'Sharma Mobile Hub', ledger: 'Sharma Mobile Hub (Delhi)' }, { party: 'Digital Planet', ledger: 'Digital Planet - Pune' }, { party: 'Vasant Telecom', ledger: 'Vasant Telecom' }] },
    sap: { label: 'SAP S/4HANA', baseUrl: 'https://sap-gw.demo-merchant.example/sap/opu/odata/sap/API_SALES_ORDER_SRV', companyCode: '1000', salesOrg: '1000', distChannel: '10', division: '00', docType: 'OR', plant: '1010', attrMap: [{ field: 'Catalogue code', attr: 'MATNR' }, { field: 'Description', attr: 'MAKTX' }] },
  };
  const app = (o, state, extra) => Object.assign({}, o, { state, installId: state === 'connected' ? 'in-' + o.slug.slice(0, 6) : null, config: state === 'connected' ? CONFIG[o.slug] || null : null, connectedAt: state === 'connected' ? iso(2026, 10, 9, 15, 20) : null }, extra || {});
  const APPS = (uc) => {
    const c = COMMON(uc);
    if (uc === 'newhome') return [app(c.coral, 'connected'), app(c.send, 'available'), app(c.dyn, 'available'), app(c.zoho, 'available'), app(c.shopify, 'available'), app(c.gsheets, 'available')];
    if (uc === 'stuffcool') return [app(c.tally, 'connected'), app(c.gsheets, 'connected', { config: { label: 'Google Sheets', sheetName: 'Dealer price list', sheetId: '1xT2a9-demo-sheet-id' } }), app(c.send, 'available'), app(c.dyn, 'available'), app(c.zoho, 'available'), app(c.coral, 'available'), app(c.shopify, 'available')];
    return [app(c.sap, 'connected'), app(c.send, 'available'), app(c.dyn, 'available'), app(c.zoho, 'available'), app(c.shopify, 'available'), app(c.gsheets, 'available')];
  };

  /* ───────── ERP activity (Recent activity on the app configure page; scenario steps push rows) ───────── */
  const ERP = {
    newhome: [
      { app: 'coral-erp', action: 'coral_erp.sync', kind: 'sync', state: 'success', at: iso(2026, 10, 14, 16, 11, 18), result: 'products: 0 errors, 0 created_products, 0 created_variants, 0 updated_variants · customers: 0 errors, 27 created, 0 updated · org_units: skipped · sales_users: 3 no_org_unit, 16 created_users, 13 org_unit_links, 22 skipped_no_email, 16 created_merchant_users · account_groups: 0 created, 0 updated · product_categories: 0 created, 0 updated' },
      { app: 'coral-erp', action: 'Sync Products', kind: 'sync', state: 'success', at: iso(2026, 10, 13, 11, 42, 9), result: 'products: 11 errors, 87 created_products, 55 created_variants, 0 updated_variants · product_categories: 1 created, 101 updated' },
      { app: 'coral-erp', action: 'Full Sync', kind: 'sync', state: 'success', at: iso(2026, 10, 9, 15, 24, 51), result: 'products: 2 errors, 412 created_products, 569 created_variants, 0 updated_variants · customers: 0 errors, 57 created, 0 updated · org_units: skipped · account_groups: 12 created, 0 updated · product_categories: 12 created, 0 updated' },
      { app: 'coral-erp', action: 'Sync Customers', kind: 'sync', state: 'success', at: iso(2026, 10, 9, 15, 22, 3), result: 'customers: 0 errors, 57 created, 0 updated · sales_users: 3 no_org_unit, 16 created_users, 13 org_unit_links, 22 skipped_no_email, 16 created_merchant_users' },
      { app: 'coral-erp', action: 'push_sales_order', kind: 'push', state: 'success', at: iso(2026, 10, 26, 18, 12, 40), draftNo: 'DRF-1131', ref: 'DMO-DRF-1131', endpoint: 'POST /api/v2/sales-orders', status: 201, result: 'Sales order created · Coral ref SO-26-04812 · 3 lines' },
      { app: 'coral-erp', action: 'push_sales_order', kind: 'push', state: 'failed', at: iso(2026, 10, 26, 17, 31, 12), draftNo: 'DRF-1129', ref: 'DMO-DRF-1129', endpoint: 'POST /api/v2/sales-orders', status: 422, result: 'Rejected by Coral: item NH-VL12-BL is not a sellable variant', error: 'item NH-VL12-BL is not a sellable variant' },
      { app: 'coral-erp', action: 'push_sales_order', kind: 'push', state: 'success', at: iso(2026, 10, 24, 12, 3, 22), draftNo: 'DRF-1120', ref: 'DMO-DRF-1120', endpoint: 'POST /api/v2/sales-orders', status: 201, result: 'Sales order created · Coral ref SO-26-04755 · 5 lines' },
    ],
    stuffcool: [
      { app: 'tally', action: 'Sync Stock Items', kind: 'sync', state: 'success', at: iso(2026, 10, 26, 9, 5, 14), result: 'stock_items: 0 errors, 6 created, 129 updated · groups: 0 created, 2 updated' },
      { app: 'tally', action: 'Sync Ledgers', kind: 'sync', state: 'success', at: iso(2026, 10, 26, 9, 4, 31), result: 'ledgers: 0 errors, 4 created, 34 updated · unmapped_parties: 2' },
      { app: 'tally', action: 'Full Sync', kind: 'sync', state: 'success', at: iso(2026, 10, 12, 18, 40, 2), result: 'stock_items: 1 errors, 118 created, 0 updated · ledgers: 0 errors, 38 created, 0 updated · groups: 6 created' },
      { app: 'tally', action: 'push_voucher', kind: 'push', state: 'success', at: iso(2026, 10, 26, 17, 48, 9), draftNo: 'DRF-2217', ref: 'SC-26-0398', endpoint: 'POST /tally/vouchers', status: 200, result: 'Sales voucher SC-26-0398 posted · 4 stock lines · ₹38,420' },
      { app: 'tally', action: 'push_voucher', kind: 'push', state: 'failed', at: iso(2026, 10, 26, 15, 6, 44), draftNo: 'DRF-2214', ref: 'SC-26-0397', endpoint: 'POST /tally/vouchers', status: 400, result: 'Tally rejected the voucher: Ledger not found (Digital Planet - Pune)', error: 'Ledger not found (Digital Planet - Pune)' },
      { app: 'tally', action: 'push_voucher', kind: 'push', state: 'success', at: iso(2026, 10, 25, 11, 20, 31), draftNo: 'DRF-2209', ref: 'SC-26-0396', endpoint: 'POST /tally/vouchers', status: 200, result: 'Sales voucher SC-26-0396 posted · 2 stock lines · ₹12,980' },
    ],
    rfq: [
      { app: 'sap', action: 'Sync Materials', kind: 'sync', state: 'success', at: iso(2026, 10, 26, 8, 2, 40), result: 'materials: 0 errors, 18 created, 211 updated · plants: 0 created, 1 updated' },
      { app: 'sap', action: 'Sync Customers', kind: 'sync', state: 'success', at: iso(2026, 10, 26, 8, 1, 12), result: 'customers: 0 errors, 5 created, 32 updated' },
      { app: 'sap', action: 'send_to_sap', kind: 'push', state: 'success', at: iso(2026, 10, 24, 16, 18, 5), draftNo: 'RFQ-2038', ref: 'SD-4500012931', endpoint: 'POST /API_SALES_ORDER_SRV/A_SalesOrder', status: 201, result: 'Sales order SD-4500012931 created · 14 items' },
      { app: 'sap', action: 'send_to_sap', kind: 'push', state: 'failed', at: iso(2026, 10, 23, 12, 44, 19), draftNo: 'RFQ-2036', ref: 'SD-ERR-2036', endpoint: 'POST /API_SALES_ORDER_SRV/A_SalesOrder', status: 400, result: 'SAP rejected the document: Material ATD0016M12 is blocked for sales in plant 1010', error: 'Material ATD0016M12 is blocked for sales in plant 1010' },
    ],
  };

  /* ───────── audit logs ───────── */
  const mk = (uc, users, count, tmpl) => {
    const names = users.map((u) => u.name);
    const rows = []; const end = Date.UTC(2026, 9, 27, 11, 20); let t = end; const startMs = Date.UTC(2026, 9, 1, 4, 0);
    const span = (end - startMs) / count;
    for (let i = 0; i < count; i++) {
      t -= span * (0.35 + rnd() * 1.3); if (t < startMs) t = startMs + rnd() * 3600e3;
      const f = tmpl[Math.floor(rnd() * tmpl.length)];
      const ctx = { n: 1000 + Math.floor(rnd() * 180), c: Math.floor(rnd() * 90) + 1, p: names[Math.floor(rnd() * names.length)] };
      rows.push({ id: 'lg-' + (i + 1), at: new Date(t).toISOString(), actor: f.sys ? 'System' : f.actor || pick(names), title: f.t(ctx), entity: f.e ? f.e(ctx) : '', verb: f.v, chip: f.chip || 'logged', event: f.ev || '' });
    }
    return rows.sort((a, b) => (a.at < b.at ? 1 : -1)).map((r, i) => Object.assign(r, { id: 'lg-' + (rows.length - i) }));
  };
  const RULEB = ['Brand Voice', 'WhatsApp Image Order Handling', 'Dealer desk etiquette', 'Catalogue matching', 'Order confirmation & close', 'Quantity & units', 'P6. Lines that need a person', 'P9. Catalogue matching', 'P2. Questions for the team', 'P1. Hand-off and hand-back'];
  const FIELDS = ['banned_phrases', 'modified_by, banned_phrases', 'modified_by, is_active', 'text', 'priority', 'modified_by, text'];
  const T_NH = [
    { v: 'updated', t: () => 'Updated Rulebook: ' + pick(RULEB) + ' (Changed fields: ' + pick(FIELDS) + ')', e: (c) => 'rulebook #' + (14 + (c.c % 26)), ev: 'rulebook_updated' },
    { v: 'updated', t: () => 'Updated Rulebook: ' + pick(RULEB) + ' (Changed fields: ' + pick(FIELDS) + ')', e: (c) => 'rulebook #' + (14 + (c.c % 26)), ev: 'rulebook_updated' },
    { v: 'created', t: () => 'Created Rulebook: ' + pick(RULEB), e: (c) => 'rulebook #' + (14 + (c.c % 26)), chip: 'auto-drafted', ev: 'rulebook_created' },
    { v: 'deleted', t: () => 'Deleted Rulebook: test', e: (c) => 'rulebook #' + (30 + (c.c % 9)), ev: 'rulebook_deleted' },
    { v: 'created', sys: true, t: (c) => 'Case 2' + String(10 + (c.c % 18)).padStart(2, '0') + '26-00' + (1 + (c.c % 5)) + ' opened', e: (c) => 'case #' + c.n, chip: 'auto-drafted', ev: 'case_opened' },
    { v: 'created', sys: true, t: (c) => 'Created Draft Order: DRF-' + (1080 + (c.c % 60)), e: (c) => 'draft order #' + c.n, chip: 'auto-drafted', ev: 'draft_order_created' },
    { v: 'updated', t: (c) => 'Updated Draft Order: DRF-' + (1080 + (c.c % 60)) + ' (Changed fields: status)', e: (c) => 'draft order #' + c.n, ev: 'draft_order_updated' },
    { v: 'updated', sys: true, t: () => 'Updated Number Sequence: CASE - case (Changed fields: last_number)', e: () => 'number sequence #3', ev: 'number_sequence_updated' },
    { v: 'created', sys: true, t: (c) => "Contact '+91 98" + String(20000000 + c.n * 7919).slice(0, 8) + "' created", e: (c) => 'contact #' + (7600 + c.c), chip: 'auto-drafted', ev: 'contact_created' },
    { v: 'created', sys: true, t: (c) => 'Created Variant Match Feedback: ' + pick(['abana 42 beige', 'jacquard 4021 ivory', 'velvet blue 12', 'digital print 3301']), e: (c) => 'variant match feedback #' + c.n, chip: 'auto-drafted', ev: 'variant_match_feedback_created' },
    { v: 'updated', t: (c) => 'Updated Party: ' + pick(['SHREE RAM FURNISHINGS - THANE', 'LAXMI TRADERS - NASHIK', 'MODERN HOME DECOR - PUNE', 'KRISHNA CURTAINS - SURAT']) + ' (Changed fields: asm_id)', e: (c) => 'party #' + (1000 + c.c), ev: 'party_updated' },
    { v: 'updated', t: () => 'Updated Invite: ' + pick(['ritu.sawant', 'karan.malhotra', 'deepti.nair']) + '@demo-merchant.example -> Demo Merchant User (accepted) (Changed fields: status)', e: (c) => 'invite #' + (20 + (c.c % 8)), ev: 'invite_updated' },
    { v: 'created', sys: true, t: () => 'Created App Event Log: Coral ERP — sales order push — success [synced]', e: (c) => 'app event log #' + c.n, chip: 'auto-drafted', ev: 'app_event_log_created' },
  ];
  const T_SC = [
    { v: 'created', sys: true, t: () => 'Created App Event Log: Stuffcool — 360dialog (WhatsApp — 360dialog) — unknown [pending]', e: (c) => 'app event log #' + c.n, chip: 'auto-drafted', ev: 'app_event_log_created' },
    { v: 'created', sys: true, t: (c) => 'Case CASE-' + (1000 + (c.c % 40)) + ' opened', e: (c) => 'case #' + c.n, chip: 'auto-drafted', ev: 'case_opened' },
    { v: 'updated', sys: true, t: () => 'Updated Number Sequence: CASE - case (Changed fields: last_number)', e: () => 'number sequence #3', ev: 'number_sequence_updated' },
    { v: 'updated', sys: true, t: () => 'Updated Number Sequence: CT - contact (Changed fields: last_number)', e: () => 'number sequence #4', ev: 'number_sequence_updated' },
    { v: 'created', sys: true, t: (c) => "Contact '+91 98" + String(10000000 + c.n * 6143).slice(0, 8) + "' created", e: (c) => 'contact #' + (500 + c.c), chip: 'auto-drafted', ev: 'contact_created' },
    { v: 'created', sys: true, t: (c) => 'Created Draft Order: DRF-' + (2190 + (c.c % 40)), e: (c) => 'draft order #' + c.n, chip: 'auto-drafted', ev: 'draft_order_created' },
    { v: 'updated', t: (c) => 'Updated Draft Order: DRF-' + (2190 + (c.c % 40)) + ' (Changed fields: status)', e: (c) => 'draft order #' + c.n, ev: 'draft_order_updated' },
    { v: 'created', sys: true, t: (c) => 'Sales voucher SC-26-0' + (380 + (c.c % 20)) + ' posted to Tally', e: (c) => 'app event log #' + c.n, chip: 'sent', ev: 'voucher_sent' },
    { v: 'deleted', t: () => 'Deleted Rulebook: Quotes and playbooks', e: (c) => 'rulebook #' + (3 + (c.c % 4)), ev: 'rulebook_deleted' },
    { v: 'updated', t: () => 'Updated Rulebook: Brand Voice (Changed fields: modified_by, banned_phrases)', e: () => 'rulebook #5', ev: 'rulebook_updated' },
  ];
  const T_AX = [
    { v: 'created', t: () => 'Line confirmed: ' + pick(['Copper Lug 16mm × 12mm', 'MCB 32A 2P C-curve', 'Contactor 25A 3P 230V', 'PVC Cable 2.5 sq.mm 100m']), e: (c) => 'rfq line #' + c.n, chip: 'confirmed', ev: 'line_confirmed' },
    { v: 'updated', t: () => 'Updated Rfq Line Item: ' + pick(['Copper Lug 16mm × 12mm - 3500.000 No', 'MCB 32A 2P - 120.000 No', 'Cable gland PG21 - 800.000 No']) + ' (Changed fields: disposition)', e: (c) => 'rfq line item #' + c.n, ev: 'rfq_line_item_updated' },
    { v: 'created', t: () => 'Created Rfq Line Item Component: TINNED COPPER LUGS - DIN 16 - 12 - ATD0016M12 x3500.000', e: (c) => 'rfq line item component #' + c.n, chip: 'auto-drafted', ev: 'rfq_line_item_component_created' },
    { v: 'created', t: () => 'Created Variant Match Feedback: ' + pick(['down: copper lug 16mm 12mm', 'up: mcb 32a 2 pole', 'down: cable gland pg 21']), e: (c) => 'variant match feedback #' + c.n, chip: 'auto-drafted', ev: 'variant_match_feedback_created' },
    { v: 'created', sys: true, t: (c) => 'RFQ RFQ-' + (2030 + (c.c % 20)) + ' received by email', e: (c) => 'rfq #' + (2030 + (c.c % 20)), chip: 'auto-drafted', ev: 'rfq_received' },
    { v: 'updated', t: () => 'Updated Invite: ' + pick(['deepa.kamat', 'ganesh.rao', 'sunita.more']) + '@demo-merchant.example -> Demo Merchant User (accepted) (Changed fields: status)', e: (c) => 'invite #' + (10 + (c.c % 8)), ev: 'invite_updated' },
    { v: 'created', t: () => 'Created Playbook: test', e: (c) => 'playbook #' + (5 + (c.c % 5)), chip: 'auto-drafted', ev: 'playbook_created' },
    { v: 'created', sys: true, t: (c) => 'Quote QT-' + (3100 + (c.c % 50)) + ' sent', e: (c) => 'quote #' + c.n, chip: 'sent', ev: 'quote_sent' },
    { v: 'updated', sys: true, t: (c) => 'RFQ RFQ-' + (2030 + (c.c % 20)) + ' sent to SAP (SD-45000' + (12900 + c.c) + ')', e: (c) => 'rfq #' + (2030 + (c.c % 20)), chip: 'sent', ev: 'rfq_sent' },
  ];

  ['newhome', 'stuffcool', 'rfq'].forEach((uc) => {
    const users = ((DM.seed[uc] || {}).users) || [{ name: 'Rohan Mehta' }];
    seedN = uc === 'newhome' ? 11 : uc === 'stuffcool' ? 29 : 47;
    DM.data(uc, 'channels', CHANNELS[uc]);
    DM.data(uc, 'numbers', NUMBERS[uc]);
    DM.data(uc, 'apps', APPS(uc));
    DM.data(uc, 'erpLog', ERP[uc].map((r, i) => Object.assign({ id: 'erp-' + (ERP[uc].length - i) }, r)).sort((a, b) => (a.at < b.at ? 1 : -1)));
    const logs = mk(uc, users, uc === 'newhome' ? 138 : uc === 'stuffcool' ? 46 : 38, uc === 'newhome' ? T_NH : uc === 'stuffcool' ? T_SC : T_AX);
    // make sure the top six rows (the Deal timeline) read like the live ones for Access/Stuffcool
    if (uc === 'rfq') {
      const top = [
        { actor: 'Smita Apte', title: 'Line confirmed: Copper Lug 16mm × 12mm', verb: 'created', chip: 'confirmed', event: 'line_confirmed', entity: 'rfq line #2041' },
        { actor: 'Smita Apte', title: 'Updated Rfq Line Item: Copper Lug 16mm × 12mm - 3500.000 No (Changed fields: disposition)', verb: 'updated', chip: 'logged', event: 'rfq_line_item_updated', entity: 'rfq line item #884' },
        { actor: 'Smita Apte', title: 'Created Rfq Line Item Component: TINNED COPPER LUGS - DIN 16 - 12 - ATD0016M12 x3500.000', verb: 'created', chip: 'auto-drafted', event: 'rfq_line_item_component_created', entity: 'rfq line item component #1412' },
        { actor: 'Smita Apte', title: 'Created Variant Match Feedback Component: TINNED COPPER LUGS - DIN 16 - 12 - ATD0016M12 x3500.000', verb: 'created', chip: 'auto-drafted', event: 'variant_match_feedback_created', entity: 'variant match feedback component #331' },
        { actor: 'Smita Apte', title: 'Created Variant Match Feedback: down: copper lug 16mm 12mm', verb: 'created', chip: 'auto-drafted', event: 'variant_match_feedback_created', entity: 'variant match feedback #329' },
        { actor: 'Vishal Chitnis', title: 'Updated Invite: deepa.kamat@demo-merchant.example -> Demo Merchant User (accepted) (Changed fields: status)', verb: 'updated', chip: 'logged', event: 'invite_updated', entity: 'invite #14' },
      ];
      const base = Date.UTC(2026, 9, 27, 11, 32);
      top.forEach((r, i) => logs.unshift(Object.assign({ id: 'lg-x' + i, at: new Date(base - i * 11000).toISOString() }, r)));
    }
    if (uc === 'stuffcool') {
      const base = Date.UTC(2026, 9, 27, 11, 35);
      [['System', 'Created App Event Log: Stuffcool — 360dialog (WhatsApp — 360dialog) — unknown [pending]', 'created', 'auto-drafted', 'app_event_log_created', 'app event log #912'], ['System', 'Case CASE-1009 opened', 'created', 'auto-drafted', 'case_opened', 'case #1009'], ['System', 'Updated Number Sequence: CASE - case (Changed fields: last_number)', 'updated', 'logged', 'number_sequence_updated', 'number sequence #3'], ['System', "Contact '+91 98790 27098' created", 'created', 'auto-drafted', 'contact_created', 'contact #512']].forEach((r, i) => logs.unshift({ id: 'lg-y' + i, at: new Date(base - i * 4000).toISOString(), actor: r[0], title: r[1], verb: r[2], chip: r[3], event: r[4], entity: r[5] }));
    }
    logs.sort((a, b) => (a.at < b.at ? 1 : -1)).forEach((r, i, arr) => { r.id = 'lg-' + (arr.length - i); });
    DM.data(uc, 'logs', logs);
  });

  /* Shapes (for scenario authors)
     channels  [{id,type:'whatsapp'|'email',name,provider,state:'live'|'paused',agent:'<agent display name>',updatedAt,number,wabaId?,phoneId?,webhook,active}]
     numbers   [{id,label,number,channelId}]                       ← Inbox "All numbers" dropdown (empty for Access)
     apps      [{slug,name,category,tag:'Beta'|'Featured'|'',desc,logo:{bg,fg,t},state:'connected'|'available',installId,config,connectedAt}]
               slugs: coral-erp | tally | sap | google-sheets | shopify | zoho-crm | microsoft-dynamics-365 | test-send-whatsapp
               config(coral-erp)  {label,defaultCourier,salesUserRole,orderRefPrefix,productGroups[],defaultTransport,attrMap[{field,attr}]}
               config(tally)      {label,companyName,gatewayUrl,salesLedger,voucherType,voucherPrefix,godown,autoPost,ledgerMap[{party,ledger}]}
               config(sap)        {label,baseUrl,companyCode,salesOrg,distChannel,division,docType,plant,attrMap[]}
     erpLog    [{id,app:<slug>,action,kind:'sync'|'push',state:'success'|'failed'|'pending',at(ISO),result(mono summary),draftNo?,ref?,endpoint?,status?,error?}]   newest first; push rows (scenario) = S.erpLog.unshift({...})
               failed rows show a Retry button on the app configure page (flips state to success and adds a fresh success row).
     logs      [{id,at(ISO),actor,title,entity,verb:'created'|'updated'|'deleted',chip:'logged'|'auto-drafted'|'confirmed'|'failed'|'blocked'|'sent',event}]   newest first; scenario steps S.logs.unshift({...}) */
})();
