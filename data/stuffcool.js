/* Use case: Stuffcool — B2B catalogue → Tally. Seed data + scenario. */
(function () {
  const UC = 'stuffcool';
  const TALLY_URL = 'http://tally-gw.stuffcool.local:9000';
  const BASE = Date.UTC(2026, 9, 27, 0, 0);
  // IST wall-clock helper: iso(daysAgo, hour, minute)
  const iso = (d = 0, h = 10, m = 0) => new Date(Date.UTC(2026, 9, 27 - d, h, m) - 19800000).toISOString();
  let seedN = 7;
  const rnd = () => ((seedN = (seedN * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = (arr) => arr[ri(0, arr.length - 1)];
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const slug = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8);
  const dayKey = (isoStr) => new Date(new Date(isoStr).getTime() + 19800000).toISOString().slice(0, 10);

  /* ───────── company / users ───────── */
  const company = { name: 'Demo Merchant User', legal: 'Stuffcool Technologies Pvt Ltd', gstin: '27AAHCS4471K1ZP', address: 'Unit 14, Kalher Industrial Estate, Bhiwandi', city: 'Bhiwandi, Maharashtra 421302', phone: '+91 98219 40011', email: 'dealers@stuffcool.example', website: 'merchants.anuma.run/stuffcool', industry: 'Mobile accessories · B2B distribution', currency: 'INR', logoColor: '#171717' };
  const users = [
    { id: 'u1', name: 'Aarav Mehta', role: 'Owner', email: 'aarav@stuffcool.example', phone: '+91 98219 40011', status: 'active', last: iso(0, 8, 41), modules: ['all'] },
    { id: 'u2', name: 'Neha Kulkarni', role: 'Admin', email: 'neha@stuffcool.example', phone: '+91 98200 11876', status: 'active', last: iso(0, 8, 12), modules: ['all'] },
    { id: 'u3', name: 'Rohan Deshpande', role: 'ASM', email: 'rohan@stuffcool.example', phone: '+91 98920 33401', status: 'active', last: iso(0, 7, 55), modules: ['inbox', 'crm', 'orders', 'quotes'] },
    { id: 'u4', name: 'Imran Sheikh', role: 'ASM', email: 'imran@stuffcool.example', phone: '+91 99100 27744', status: 'active', last: iso(1, 18, 20), modules: ['inbox', 'crm', 'orders', 'quotes'] },
    { id: 'u5', name: 'Priya Nair', role: 'Accounts', email: 'priya@stuffcool.example', phone: '+91 98450 66120', status: 'active', last: iso(0, 8, 3), modules: ['orders', 'drafts', 'integrations', 'reports'] },
    { id: 'u6', name: 'Karthik Iyer', role: 'Sales', email: 'karthik@stuffcool.example', phone: '+91 97400 18865', status: 'active', last: iso(2, 17, 5), modules: ['inbox', 'crm', 'products'] },
    { id: 'u7', name: 'Sana Qureshi', role: 'Sales', email: 'sana@stuffcool.example', phone: '+91 99877 52310', status: 'invited', last: null, modules: ['inbox', 'crm'] },
  ];

  /* ───────── products (30, 4 drafts) ───────── */
  const IP = ['iPhone 16', 'iPhone 16 Pro', 'iPhone 16 Pro Max'];
  const SGS = ['Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra'];
  const COL3 = ['Black', 'Blue', 'Sage'];
  const MODELS_ALL = ['iPhone 15', 'iPhone 16', 'iPhone 16 Pro', 'Galaxy S24', 'Galaxy A55', 'Redmi Note 13', 'OnePlus 12', 'Realme 12 Pro'];
  // [sku, name, category, mrp, dealerA, hsn, tileColor, variants, attrs, status]
  const defs = [
    ['SC-CASE-CLR', 'Clear Armor Case', 'Cases', 999, 329, '39269099', '#e0f2fe', IP.map((m) => m + ' · Clear'), { Material: 'TPU + polycarbonate', 'Drop rating': '2.4 m', MagSafe: 'No' }],
    ['SC-CASE-SIL', 'Silicone MagSafe Case', 'Cases', 1499, 520, '39269099', '#dcfce7', ['iPhone 16 · Black', 'iPhone 16 · Blue', 'iPhone 16 · Sage', 'iPhone 16 Pro · Black', 'iPhone 16 Pro · Sage'], { Material: 'Liquid silicone', MagSafe: 'Yes' }],
    ['SC-CASE-RGD', 'Rugged Shield Case', 'Cases', 899, 299, '39269099', '#e5e5e5', SGS.map((m) => m + ' · Black'), { Material: 'TPU + PC', 'Drop rating': '3 m' }],
    ['SC-CASE-FLP', 'Flip Wallet Case', 'Cases', 799, 245, '42023100', '#fde68a', ['Redmi Note 13 · Brown', 'Redmi Note 13 · Black', 'Redmi Note 13 Pro · Brown'], { Material: 'Vegan leather', 'Card slots': '2' }],
    ['SC-CASE-HYB', 'Hybrid Bumper Case', 'Cases', 799, 255, '39269099', '#ddd6fe', ['OnePlus 12 · Black', 'OnePlus 12 · Green', 'OnePlus 12R · Black'], { Material: 'TPU bumper + PC back' }],
    ['SC-WCA-67GAN', 'GaN 67W Wall Charger', 'Chargers', 2499, 1240, '85044090', '#bfdbfe', ['Black', 'White'], { Output: '67W (2×USB-C + USB-A)', Tech: 'GaN III', Plug: 'Indian 2-pin foldable' }],
    ['SC-WCA-45GAN', 'GaN 45W Wall Charger', 'Chargers', 1799, 890, '85044090', '#bfdbfe', ['Black', 'White'], { Output: '45W PD', Tech: 'GaN II' }, 'draft'],
    ['SC-WCA-20PD', '20W PD Adapter', 'Chargers', 999, 420, '85044090', '#e0e7ff', ['White'], { Output: '20W PD', Ports: '1× USB-C' }],
    ['SC-CCH-48', 'Car Charger 48W', 'Chargers', 1299, 540, '85044090', '#fecaca', ['Black', 'Grey'], { Output: '48W (USB-C 30W + USB-A 18W)' }],
    ['SC-WLC-15', 'Wireless Charging Pad 15W', 'Chargers', 1599, 690, '85044090', '#fbcfe8', ['Black', 'White'], { Output: '15W Qi', Standard: 'Qi / MagSafe-compatible' }],
    ['SC-CBL-CC-1M-100W', 'USB-C to USB-C Cable 1m 100W', 'Cables', 599, 210, '85444299', '#c7d2fe', ['Black', 'White'], { Length: '1 m', Power: '100W PD', Build: 'Nylon braided' }],
    ['SC-CBL-CL-1M', 'USB-C to Lightning Cable 1m MFi', 'Cables', 999, 340, '85444299', '#c7d2fe', ['White'], { Length: '1 m', Cert: 'Apple MFi' }],
    ['SC-CBL-C-1M', 'Type-C Cable 1m 60W', 'Cables', 399, 120, '85444299', '#e2e8f0', ['Black', 'White'], { Length: '1 m', Power: '60W PD' }],
    ['SC-CBL-BR-2M', 'Braided Cable 2m', 'Cables', 699, 235, '85444299', '#e2e8f0', ['USB-C · Black', 'USB-C · Grey', 'Lightning · Black'], { Length: '2 m', Build: 'Nylon braided' }],
    ['SC-CBL-3IN1', '3-in-1 Charging Cable', 'Cables', 799, 280, '85444299', '#e2e8f0', ['1.2 m · Black', '1.2 m · Grey'], { Connectors: 'USB-C / Lightning / Micro-USB' }],
    ['SC-PB-MAG-5K', 'MagSafe Power Bank 5K', 'Power banks', 2999, 1690, '85076000', '#fde68a', ['Black', 'White', 'Sage'], { Capacity: '5,000 mAh', Output: '20W PD', MagSafe: 'Yes' }],
    ['SC-PB-20K-65W', '20K Power Bank 65W', 'Power banks', 4499, 2340, '85076000', '#fef3c7', ['Black'], { Capacity: '20,000 mAh', Output: '65W dual PD' }],
    ['SC-PB-10K-22', '10K Power Bank 22.5W', 'Power banks', 1999, 940, '85076000', '#fef3c7', ['Black', 'Blue'], { Capacity: '10,000 mAh', Output: '22.5W' }],
    ['SC-PB-30K-100W', '30K Power Bank 100W', 'Power banks', 6999, 3650, '85076000', '#fde68a', ['Black'], { Capacity: '30,000 mAh', Output: '100W PD' }, 'draft'],
    ['SC-EB-TWS-A2', 'TWS Buds Air 2', 'Earbuds', 2999, 980, '85183000', '#fbcfe8', ['White', 'Black', 'Blue'], { Battery: '28 h with case', Bluetooth: '5.3', IPX: 'IPX4' }],
    ['SC-EB-NECK-53', 'Neckband BT 5.3', 'Earbuds', 1999, 640, '85183000', '#fce7f3', ['Black', 'Blue', 'Red'], { Battery: '40 h', Bluetooth: '5.3' }],
    ['SC-EB-ANC-PRO', 'ANC Buds Pro', 'Earbuds', 4999, 1890, '85183000', '#ede9fe', ['Black', 'White'], { ANC: 'Up to 40 dB hybrid', Battery: '36 h with case' }, 'draft'],
    ['SC-EB-WIRED-C', 'Wired Earphones Type-C', 'Earbuds', 699, 190, '85183000', '#fce7f3', ['Black', 'White'], { Plug: 'USB-C', Mic: 'Yes' }],
    ['SC-SG-9H', 'Tempered Glass 9H', 'Screen guards', 499, 85, '70071900', '#cffafe', MODELS_ALL, { Hardness: '9H', Pack: 'Single + install kit' }],
    ['SC-SG-PRIV', 'Privacy Tempered Glass', 'Screen guards', 799, 160, '70071900', '#a5f3fc', ['iPhone 15', 'iPhone 16', 'iPhone 16 Pro', 'Galaxy S24'], { Angle: '28° privacy' }],
    ['SC-SG-CAM', 'Camera Lens Protector', 'Screen guards', 599, 110, '70071900', '#cffafe', ['iPhone 16', 'iPhone 16 Pro', 'Galaxy S24', 'OnePlus 12'], { Pack: '3 lens rings' }],
    ['SC-SG-MAT', 'Matte Gaming Glass', 'Screen guards', 699, 150, '70071900', '#cffafe', ['iPhone 16', 'Galaxy S24', 'OnePlus 12'], { Finish: 'Anti-fingerprint matte' }, 'draft'],
    ['SC-ACC-STAND', 'Aluminium Phone Stand', 'Accessories', 899, 310, '76169990', '#e5e5e5', ['Silver', 'Space Grey'], { Material: 'Aluminium alloy' }],
    ['SC-ACC-CARMT', 'MagSafe Car Mount', 'Accessories', 1499, 520, '87089900', '#e5e5e5', ['Black'], { Fit: 'Vent / dash' }],
    ['SC-ACC-STRAP', 'Silicone Watch Strap', 'Accessories', 799, 240, '91139000', '#fecdd3', ['40 mm · Black', '40 mm · Pink', '44 mm · Black', '44 mm · Midnight'], { Fit: 'Apple Watch compatible' }],
  ];
  const products = defs.map((d, i) => {
    const [sku, name, category, mrp, a, hsn, color, vlabels, attrs, status] = d;
    const id = 'pr-' + pad(i + 1);
    const priceBands = { A: a, B: Math.round(a * 1.04), C: Math.round(a * 1.08) };
    const variants = vlabels.map((label, k) => ({ id: id + '-v' + (k + 1), label, sku: sku + '-' + slug(label).slice(0, 6) + (k + 1), price: a, stock: status === 'draft' ? 0 : ri(0, 9) === 0 ? ri(0, 12) : ri(60, 900) }));
    return { id, sku, name, category, brand: 'StuffCool', unit: 'pcs', price: a, mrp, stock: variants.reduce((s, v) => s + v.stock, 0), hsn, tax: 18, color, status: status || 'active', attrs, variants, priceBands, moq: a < 150 ? 50 : a < 500 ? 25 : 10 };
  });
  const categories = [...new Set(products.map((p) => p.category))].map((n, i) => ({ id: 'cat-' + (i + 1), name: n, count: products.filter((p) => p.category === n).length }));
  const stockSheets = [{ id: 'stuffcool', title: 'Stuffcool dealer stock sheet', version: 'v11', published: true, url: 'merchants.anuma.run/stuffcool', itemCount: 26, views: 412, lastShared: iso(6, 11, 30), bands: ['A', 'B', 'C'], note: 'Prices shown per dealer band after login with phone OTP.' }];

  /* ───────── parties / contacts ───────── */
  const gst = (sc, k) => sc + 'AA' + String.fromCharCode(65 + (k * 3) % 26) + String.fromCharCode(65 + (k * 7) % 26) + pad(1000 + k * 37, 4) + String.fromCharCode(65 + (k * 5) % 26) + '1Z' + String.fromCharCode(65 + (k * 11) % 26);
  const pdef = [
    ['Sharma Mobile Hub', 'Mumbai', 'Andheri West', 'Maharashtra', '27', 'A', 'u3', 'Net 30', 400000, 312000, 'Credit-heavy · festive stocker'],
    ['Digital Planet Electronics', 'Pune', 'Camp', 'Maharashtra', '27', 'A', 'u3', 'Net 15', 250000, 0, 'New dealer'],
    ['Vasant Telecom', 'Nagpur', 'Sitabuldi', 'Maharashtra', '27', 'B', 'u3', 'Net 15', 150000, 38000, ''],
    ['Gupta Mobile Zone', 'Delhi', 'Nehru Place', 'Delhi', '07', 'A', 'u4', 'Net 30', 500000, 214000, 'Top 5 dealer'],
    ['Techno Hub', 'Bengaluru', 'SP Road', 'Karnataka', '29', 'A', 'u6', 'Net 30', 450000, 96000, 'Top 5 dealer'],
    ['Ravi Cellular', 'Hyderabad', 'Koti', 'Telangana', '36', 'B', 'u6', 'Net 15', 200000, 72500, ''],
    ['Shree Ganesh Communication', 'Ahmedabad', 'CG Road', 'Gujarat', '24', 'B', 'u3', 'Net 15', 220000, 54000, ''],
    ['Kolkata Mobile Mart', 'Kolkata', 'Chandni Chowk', 'West Bengal', '19', 'B', 'u6', 'Net 15', 180000, 41200, ''],
    ['Chennai Gadget World', 'Chennai', 'Ritchie Street', 'Tamil Nadu', '33', 'C', 'u6', 'Advance', 90000, 0, ''],
    ['Jaipur Smart Stores', 'Jaipur', 'MI Road', 'Rajasthan', '08', 'C', 'u4', 'Net 7', 100000, 18900, ''],
    ['Lucknow Telecom Point', 'Lucknow', 'Hazratganj', 'Uttar Pradesh', '09', 'C', 'u4', 'Advance', 80000, 0, ''],
    ['Kochi Digital Mall', 'Kochi', 'MG Road', 'Kerala', '32', 'B', 'u6', 'Net 15', 160000, 33400, ''],
    ['Surat Mobile Galaxy', 'Surat', 'Ring Road', 'Gujarat', '24', 'C', 'u3', 'Net 7', 90000, 12000, ''],
    ['Chandigarh Cell Bazaar', 'Chandigarh', 'Sector 22', 'Chandigarh', '04', 'B', 'u4', 'Net 15', 170000, 60100, ''],
    ['Indore Gadget Gallery', 'Indore', 'MG Road', 'Madhya Pradesh', '23', 'C', 'u3', 'Advance', 70000, 0, ''],
    ['Bhopal Tech Corner', 'Bhopal', 'New Market', 'Madhya Pradesh', '23', 'C', 'u3', 'Net 7', 60000, 21500, 'Quiet 45 days'],
  ];
  const parties = pdef.map((d, i) => {
    const [name, city, area, state, sc, band, owner, terms, cl, out, tag] = d;
    return { id: 'pt-' + pad(i + 1), name, city, region: state, area, type: band === 'A' ? 'Platinum dealer' : band === 'B' ? 'Gold dealer' : 'Silver dealer', owner, phone: '+91 9' + (8000000000 + 7311917 * (i + 3)).toString().slice(0, 4) + ' ' + pad(10000 + i * 3917, 5).slice(0, 5), email: slug(name).toLowerCase() + '@dealer.example', gstin: gst(sc, i + 2), terms, priceBand: band, creditLimit: cl, outstanding: out, lastOrderAt: null, orders30d: 0, lifetime: 0, status: i === 15 ? 'quiet' : 'active', tags: tag ? tag.split(' · ') : [], tallyLedger: name, tallyGroup: 'Sundry Debtors' };
  });
  parties[1].tallyLedger = 'Digital Planet Electronics'; // mismatches Tally's "Digital Planet Electronics - Pune" → fails in the scenario
  parties[1].tallyLedgerNote = 'Not yet verified against Tally';
  const cnames = ['Mukesh Sharma', 'Deepa Sharma', 'Anil Joshi', 'Sneha Pawar', 'Vasant Raut', 'Pankaj Gupta', 'Ritu Gupta', 'Naveen Rao', 'Ravi Teja', 'Suresh Patel', 'Farhan Ali', 'Debashish Roy', 'Muthu Kumar', 'Hardik Soni', 'Kiran Singh', 'Ajay Verma', 'Jose Mathew', 'Gurpreet Kaur', 'Sunil Jain', 'Rekha Dubey'];
  const contacts = [];
  parties.forEach((p, i) => { contacts.push({ id: 'ct-' + pad(contacts.length + 1), partyId: p.id, name: cnames[i], role: 'Owner', phone: p.phone, email: slug(cnames[i]).toLowerCase() + '@dealer.example', primary: true }); });
  [0, 1, 3, 4].forEach((pi, k) => contacts.push({ id: 'ct-' + pad(contacts.length + 1), partyId: parties[pi].id, name: cnames[16 + k], role: k % 2 ? 'Purchase' : 'Accounts', phone: '+91 97' + pad(10000000 + k * 912377, 8).slice(0, 8), email: slug(cnames[16 + k]).toLowerCase() + '@dealer.example', primary: false }));

  /* ───────── helpers shared by seed + scenario ───────── */
  const partyOf = (S, id) => S.parties.find((p) => p.id === id);
  const prodOf = (S, id) => S.products.find((p) => p.id === id);
  const mkLines = (S, partyId, spec) => {
    const band = partyOf(S, partyId).priceBand;
    return spec.map(([pid, vi, qty, state]) => { const p = prodOf(S, pid); const v = p.variants[vi] || p.variants[0]; const l = { productId: pid, variantId: v.id, name: p.variants.length > 1 ? p.name + ' — ' + v.label : p.name, sku: v.sku, qty, unit: p.unit, price: p.priceBands[band] }; if (state) l.state = state; return l; });
  };
  const sub = (lines) => lines.reduce((s, l) => s + l.qty * l.price, 0);
  const gross = (n) => Math.round(n * 1.18);
  const voucherNo = (no) => 'SV/26-27/' + String(no).slice(-4);
  const tallyXml = (o, party, lines) => {
    const interstate = !String(party.gstin).startsWith('27');
    const s = sub(lines), tax = Math.round(s * 0.18);
    const items = lines.map((l) => `    <ALLINVENTORYENTRIES.LIST>\n      <STOCKITEMNAME>${l.sku}</STOCKITEMNAME>\n      <RATE>${l.price}/pcs</RATE>\n      <BILLEDQTY>${l.qty} pcs</BILLEDQTY>\n      <AMOUNT>${l.qty * l.price}</AMOUNT>\n      <GODOWNNAME>Main Godown - Bhiwandi</GODOWNNAME>\n    </ALLINVENTORYENTRIES.LIST>`).join('\n');
    return `<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA>\n<REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME><STATICVARIABLES><SVCURRENTCOMPANY>Stuffcool Technologies Pvt Ltd</SVCURRENTCOMPANY></STATICVARIABLES></REQUESTDESC>\n<VOUCHER VCHTYPE="Sales" ACTION="Create">\n  <DATE>${dayKey(o.placedAt).replace(/-/g, '')}</DATE>\n  <VOUCHERNUMBER>${voucherNo(o.no)}</VOUCHERNUMBER>\n  <PARTYLEDGERNAME>${party.tallyLedger}</PARTYLEDGERNAME>\n  <REFERENCE>${o.no}</REFERENCE>\n${items}\n  <LEDGERENTRIES.LIST><LEDGERNAME>Sales - Accessories</LEDGERNAME><AMOUNT>${s}</AMOUNT></LEDGERENTRIES.LIST>\n  <LEDGERENTRIES.LIST><LEDGERNAME>${interstate ? 'IGST 18%' : 'CGST 9%'}</LEDGERNAME><AMOUNT>${interstate ? tax : tax / 2}</AMOUNT></LEDGERENTRIES.LIST>${interstate ? '' : `\n  <LEDGERENTRIES.LIST><LEDGERNAME>SGST 9%</LEDGERNAME><AMOUNT>${tax / 2}</AMOUNT></LEDGERENTRIES.LIST>`}\n</VOUCHER></IMPORTDATA></BODY></ENVELOPE>`;
  };
  const tallyReq = (o, party, lines) => ({ voucherType: 'Sales', voucherNo: voucherNo(o.no), date: dayKey(o.placedAt), partyLedger: party.tallyLedger, narration: 'Anuma order ' + o.no, godown: 'Main Godown - Bhiwandi', items: lines.map((l) => ({ stockItem: l.sku, qty: l.qty, rate: l.price, amount: l.qty * l.price })), taxable: sub(lines), gst: String(party.gstin).startsWith('27') ? { cgst: Math.round(sub(lines) * 0.09), sgst: Math.round(sub(lines) * 0.09) } : { igst: Math.round(sub(lines) * 0.18) }, xml: tallyXml(o, party, lines) });
  const logOk = (o, party, at) => ({ id: 'erp-' + o.no + '-' + ri(100, 999), orderId: o.id, system: 'Tally', direction: 'out', endpoint: TALLY_URL, method: 'POST', status: 200, ref: voucherNo(o.no), at, request: tallyReq(o, party, o.lines), response: { CREATED: 1, ALTERED: 0, ERRORS: 0, LASTVCHID: 18000 + ri(100, 900), LASTMASTERID: 0 }, state: 'synced' });

  /* ───────── orders (18 seeded) + erpLog + shipments ───────── */
  const orders = [], erpLog = [], shipments = [];
  const carriers = ['Delhivery', 'Blue Dart', 'DTDC', 'Xpressbees'];
  const activeP = parties.filter((p, i) => i !== 1 && i !== 15);
  const live = products.filter((p) => p.status === 'active');
  let orderSeq = 381;
  for (let i = 0; i < 18; i++) {
    const age = [27, 25, 23, 21, 19, 17, 15, 13, 11, 9, 7, 6, 4, 3, 2, 1, 1, 0][i];
    const party = pick(activeP);
    const n = ri(2, 5), used = new Set(); const spec = [];
    while (spec.length < n) { const p = pick(live); if (used.has(p.id)) continue; used.add(p.id); const q = p.price < 150 ? pick([50, 100, 200]) : p.price < 500 ? pick([25, 50, 100]) : pick([10, 20, 40, 60]); spec.push([p.id, ri(0, p.variants.length - 1), q]); }
    const tmp = { parties, products };
    const lines = mkLines(tmp, party.id, spec);
    const no = 'SC-26-' + pad(orderSeq++, 4);
    const placedAt = iso(age, ri(9, 17), ri(0, 59));
    const status = age > 11 ? 'delivered' : age > 5 ? pick(['delivered', 'shipped']) : age > 1 ? pick(['shipped', 'packed', 'processing']) : age === 1 ? 'processing' : 'confirmed';
    const o = { id: 'o-' + no.slice(-4), no, partyId: party.id, status, total: gross(sub(lines)), placedAt, channel: pick(['whatsapp', 'whatsapp', 'web', 'email']), payment: party.terms === 'Advance' ? 'Paid' : pick(['Credit', 'Credit', 'Paid']), lines, erp: null };
    const synced = new Date(new Date(placedAt).getTime() + 180000).toISOString();
    o.erp = { system: 'Tally', ref: voucherNo(no), state: 'synced', at: synced };
    erpLog.push(logOk(o, party, synced));
    if (['shipped', 'delivered', 'packed'].includes(status)) {
      const sid = 'sh-' + no.slice(-4);
      o.shipmentId = sid;
      const ship = status === 'delivered' ? 'delivered' : status === 'shipped' ? 'in_transit' : 'pending';
      shipments.push({ id: sid, orderId: o.id, carrier: pick(carriers), awb: ship === 'pending' ? '' : String(ri(30000000, 99999999)) + '0' + ri(1000, 9999), status: ship, eta: iso(age - 3, 18, 0), from: 'Bhiwandi, MH', to: party.city, events: [{ at: iso(age, 16, 30), text: 'Packed at Main Godown' }].concat(ship !== 'pending' ? [{ at: iso(age - 1, 11, 0), text: 'Picked up by ' + 'courier' }, { at: iso(age - 2, 8, 0), text: 'In transit — ' + party.city + ' hub' }] : []).concat(ship === 'delivered' ? [{ at: iso(age - 3, 15, 0), text: 'Delivered, signed by dealer' }] : []) });
    }
    party.lastOrderAt = placedAt; if (age <= 30) party.orders30d++; party.lifetime += o.total;
    orders.push(o);
  }
  orders.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  erpLog.sort((a, b) => b.at.localeCompare(a.at));
  // lifetime history beyond 30 days
  parties.forEach((p, i) => { p.lifetime += [1850000, 0, 410000, 3100000, 2680000, 940000, 760000, 610000, 220000, 330000, 180000, 520000, 240000, 590000, 150000, 310000][i]; });

  /* ───────── drafts ───────── */
  const dsrc = [
    ['pt-05', 'pending', 'Anuma', 'Techno Hub — restock via WhatsApp', [['pr-06', 0, 80], ['pr-11', 0, 150], ['pr-20', 0, 40]], 0],
    ['pt-09', 'pending', 'Anuma', 'Advance dealer — payment not yet received', [['pr-01', 1, 60], ['pr-24', 2, 200]], 0],
    ['pt-06', 'approved', 'Anuma', 'Within credit limit, auto-approved', [['pr-16', 0, 30], ['pr-21', 1, 50]], 1],
    ['pt-15', 'rejected', 'Rohan Deshpande', 'Advance not received after 3 days', [['pr-02', 0, 40]], 1],
    ['pt-04', 'posted', 'Anuma', 'Posted as SC-26-0390', [['pr-17', 0, 20], ['pr-08', 0, 80]], 2],
    ['pt-12', 'pending', 'Imran Sheikh', 'Manual draft from phone call', [['pr-15', 0, 50], ['pr-13', 1, 100]], 0],
  ];
  const drafts = dsrc.map((d, i) => { const lines = mkLines({ parties, products }, d[0], d[4]).map((l) => Object.assign(l, { state: d[1] === 'pending' ? (i === 1 ? 'flagged' : 'pending') : 'confirmed' })); return { id: 'dr-' + (2441 + i), no: 'DR-' + (2441 + i), partyId: d[0], threadId: null, status: d[1], total: gross(sub(lines)), createdAt: iso(d[5], 10 + i, 12), by: d[2], note: d[3], lines }; });

  /* ───────── threads ───────── */
  const m = (id, from, text, at, type = 'text', meta) => { const x = { id, from, type, text, at }; if (meta) x.meta = meta; return x; };
  const threads = [
    { id: 'T-101', partyId: 'pt-01', contactId: 'ct-01', channel: 'whatsapp', subject: 'Diwali stock', owner: 'anuma', status: 'closed', unread: 0, preview: 'Ok 👍', lastAt: iso(2, 17, 40), priority: 'normal', messages: [
      m('a1', 'customer', 'Neckband 50 pcs ka dispatch kab hoga?', iso(3, 10, 4)), m('a2', 'anuma', 'Sharma ji, SC-26-0391 aaj shaam tak Delhivery ko handover ho jayega. AWB share kar dunga.', iso(3, 10, 5)),
      m('a3', 'anuma', 'AWB 3948 2210 7731 — Delhivery. ETA 2 din.', iso(2, 15, 12)), m('a4', 'customer', 'Theek hai. Naya stock sheet bhejna jab ho.', iso(2, 17, 20)),
      m('a5', 'anuma', 'Zaroor — Diwali sheet jaise hi publish hoti hai, sabse pehle aapko bhejunga.', iso(2, 17, 21)), m('a6', 'customer', 'Ok 👍', iso(2, 17, 40)), m('a7', 'system', 'Case closed · auto-close 24h after last message', iso(1, 17, 40), 'text')] },
    { id: 'T-102', partyId: 'pt-02', contactId: 'ct-02', channel: 'web', subject: 'Dealer onboarding', owner: 'u3', status: 'open', unread: 0, preview: 'Ledger created — you can order from the stock sheet.', lastAt: iso(1, 16, 5), priority: 'normal', messages: [
      m('b1', 'customer', 'Hello, we are a new retailer in Pune Camp. How do we become a Stuffcool dealer?', iso(8, 11, 2)), m('b2', 'anuma', 'Welcome! I can set you up in a day. Please share GSTIN, shop address and a trade reference.', iso(8, 11, 2)),
      m('b3', 'customer', 'GSTIN 27AADCD8812P1ZB. Shop at 14 Dastur Meher Rd, Camp, Pune.', iso(8, 11, 20)), m('b4', 'anuma', 'Verified. Rohan Deshpande will be your account manager. You start on Band A with a ₹2.5L credit line, Net 15.', iso(7, 10, 0)),
      m('b5', 'u3', 'Hi Prakash, Rohan here. Dealer account is live — the stock sheet link works with your phone OTP.', iso(7, 10, 30)), m('b6', 'customer', 'Great, will place the first order after the Diwali sheet.', iso(7, 10, 41)),
      m('b7', 'anuma', 'Ledger created — you can order from the stock sheet.', iso(1, 16, 5))] },
    { id: 'T-103', partyId: 'pt-03', contactId: 'ct-03', channel: 'whatsapp', subject: 'Reorder', owner: 'anuma', status: 'closed', unread: 0, preview: 'Delivered, thanks', lastAt: iso(5, 14, 30), priority: 'normal', messages: [
      m('c1', 'customer', '20 pcs 20W adapter aur 10 earphones bhej do', iso(9, 12, 10)), m('c2', 'anuma', '20W PD Adapter ×20 aur Wired Earphones Type-C ×10 — ₹10,030 + GST. Confirm?', iso(9, 12, 11)),
      m('c3', 'customer', 'Confirm', iso(9, 12, 14)), m('c4', 'anuma', 'Order confirmed SC-26-0384. Dispatch kal.', iso(9, 12, 15)), m('c5', 'anuma', 'Delhivery AWB 7710 3392 0185.', iso(7, 9, 5)), m('c6', 'customer', 'Delivered, thanks', iso(5, 14, 30))] },
    { id: 'T-104', partyId: 'pt-04', contactId: 'ct-04', channel: 'whatsapp', subject: 'GaN 45W availability', owner: 'u4', status: 'open', unread: 2, preview: 'GaN 45W kab tak aayega?', lastAt: iso(0, 8, 22), priority: 'high', messages: [m('d1', 'customer', 'GaN 45W kab tak aayega?', iso(0, 8, 21)), m('d2', 'customer', 'Dealers pooch rahe hain, 200 chahiye.', iso(0, 8, 22))] },
    { id: 'T-105', partyId: 'pt-05', contactId: 'ct-05', channel: 'whatsapp', subject: 'Restock draft', owner: 'anuma', status: 'open', unread: 1, preview: 'Draft DR-2441 ready — awaiting approval', lastAt: iso(0, 8, 50), priority: 'normal', messages: [m('e1', 'customer', '80 GaN 67W, 150 USB-C cable, 40 TWS buds', iso(1, 17, 3)), m('e2', 'anuma', 'Draft order DR-2441 bana diya, approval ke baad confirm karunga.', iso(1, 17, 4))] },
    { id: 'T-106', partyId: 'pt-06', contactId: 'ct-06', channel: 'email', subject: 'PO 7731 — Ravi Cellular', owner: 'u6', status: 'open', unread: 0, preview: 'PO attached', lastAt: iso(1, 12, 40), priority: 'normal', messages: [m('f1', 'customer', 'PO 7731 attached. Please confirm availability.', iso(1, 12, 30), 'file', { name: 'PO-7731.pdf', size: '84 KB' }), m('f2', 'anuma', 'Received. All lines in stock; draft order created.', iso(1, 12, 40))] },
    { id: 'T-107', partyId: 'pt-07', contactId: 'ct-07', channel: 'whatsapp', subject: 'Price band', owner: 'u3', status: 'hold', unread: 0, preview: 'Rohan will call you tomorrow', lastAt: iso(1, 15, 12), priority: 'normal', messages: [m('g1', 'customer', 'Gold band mein kitna fark hai Platinum se?', iso(1, 15, 8)), m('g2', 'u3', 'Rohan will call you tomorrow with the slab details.', iso(1, 15, 12))] },
    { id: 'T-108', partyId: 'pt-08', contactId: 'ct-08', channel: 'indiamart', subject: 'IndiaMART lead — 3-in-1 cables', owner: 'anuma', status: 'open', unread: 1, preview: 'Need 500 pcs 3-in-1 cable, price?', lastAt: iso(0, 7, 40), priority: 'normal', messages: [m('h1', 'customer', 'Need 500 pcs 3-in-1 cable, price?', iso(0, 7, 40))] },
    { id: 'T-109', partyId: 'pt-09', contactId: 'ct-09', channel: 'whatsapp', subject: 'Advance payment', owner: 'anuma', status: 'open', unread: 0, preview: 'Advance link sent', lastAt: iso(0, 9, 5), priority: 'normal', messages: [m('i1', 'anuma', 'Draft DR-2442 needs 100% advance. UPI link sent.', iso(0, 9, 5))] },
    { id: 'T-110', partyId: 'pt-10', contactId: 'ct-10', channel: 'whatsapp', subject: 'Tempered glass models', owner: 'u4', status: 'open', unread: 0, preview: 'Realme 12 Pro glass available?', lastAt: iso(1, 11, 11), priority: 'normal', messages: [m('j1', 'customer', 'Realme 12 Pro glass available?', iso(1, 11, 9)), m('j2', 'anuma', 'Yes — 9H Tempered Glass Realme 12 Pro, 312 in stock, ₹92 (Band C).', iso(1, 11, 11))] },
    { id: 'T-111', partyId: 'pt-12', contactId: 'ct-12', channel: 'email', subject: 'Invoice copy', owner: 'u2', status: 'closed', unread: 0, preview: 'Sent invoice SV/26-27/0392', lastAt: iso(3, 10, 0), priority: 'low', messages: [m('k1', 'customer', 'Please resend invoice for last order.', iso(3, 9, 40)), m('k2', 'anuma', 'Sent invoice SV/26-27/0392.', iso(3, 10, 0))] },
    { id: 'T-112', partyId: 'pt-14', contactId: 'ct-14', channel: 'whatsapp', subject: 'Credit hold', owner: 'u5', status: 'hold', unread: 0, preview: 'Account on hold until ₹60,100 cleared', lastAt: iso(2, 13, 0), priority: 'high', messages: [m('l1', 'u5', 'Account on hold until ₹60,100 is cleared. Draft will resume once received.', iso(2, 13, 0))] },
  ];

  /* ───────── leads / rfqs / quotes ───────── */
  const owners = ['u3', 'u4', 'u6'];
  const lead = (i, title, pt, stage, value, src, d) => ({ id: 'ld-' + pad(i), title, partyId: pt, stage, value, owner: parties.find((p) => p.id === pt).owner, source: src, createdAt: iso(d, 11, 0), closeAt: iso(-(14 - d), 11, 0), notes: '' });
  const leads = [
    lead(1, 'Diwali stocking — Sharma Mobile Hub', 'pt-01', 'Qualified', 285000, 'WhatsApp', 3), lead(2, 'Onboard Digital Planet (Pune)', 'pt-02', 'Won', 190000, 'Web form', 8), lead(3, 'Vasant Telecom — monthly accessories', 'pt-03', 'Negotiation', 60000, 'WhatsApp', 6),
    lead(4, 'Gupta Mobile Zone — GaN 45W bulk', 'pt-04', 'Quoted', 236000, 'WhatsApp', 2), lead(5, 'Techno Hub — audio range', 'pt-05', 'Qualified', 120000, 'Email', 4), lead(6, 'Ravi Cellular — Q4 PO', 'pt-06', 'Quoted', 142000, 'Email', 5),
    lead(7, 'Kolkata Mobile Mart — 3-in-1 cables', 'pt-08', 'New', 140000, 'IndiaMART', 0), lead(8, 'Chennai Gadget World — first order', 'pt-09', 'New', 54000, 'Walk-in', 1), lead(9, 'Jaipur Smart Stores — wholesale glass', 'pt-10', 'Negotiation', 76000, 'WhatsApp', 7),
    lead(10, 'Bhopal Tech Corner — reactivation', 'pt-16', 'Lost', 38000, 'Campaign', 20), lead(11, 'Kochi Digital Mall — power banks', 'pt-12', 'Won', 98000, 'WhatsApp', 12),
  ];
  const rfqLines = (spec, pt) => mkLines({ parties, products }, pt, spec).map((l, k) => Object.assign(l, { n: k + 1, text: l.name, confidence: ri(88, 99), state: 'matched' }));
  const rfqs = [
    ['Gupta Mobile Zone — GaN 45W bulk', 'pt-04', 'whatsapp', 'quoted', [['pr-07', 0, 200]], 2], ['Ravi Cellular PO 7731', 'pt-06', 'email', 'quoted', [['pr-06', 0, 60], ['pr-16', 0, 30], ['pr-14', 0, 80]], 1], ['Kolkata — 3-in-1 cables 500 pcs', 'pt-08', 'portal', 'new', [['pr-15', 0, 500]], 0],
    ['Jaipur — Tempered glass assortment', 'pt-10', 'whatsapp', 'review', [['pr-24', 0, 300], ['pr-24', 5, 300], ['pr-25', 1, 100]], 1], ['Techno Hub — audio range', 'pt-05', 'email', 'review', [['pr-20', 0, 80], ['pr-21', 0, 80], ['pr-22', 0, 50]], 3], ['Kochi — power banks', 'pt-12', 'whatsapp', 'won', [['pr-16', 0, 40], ['pr-18', 0, 50]], 12], ['Chandigarh — chargers & cables', 'pt-14', 'pdf', 'lost', [['pr-08', 0, 100], ['pr-13', 0, 200]], 18], ['Ahmedabad — cases', 'pt-07', 'excel', 'quoted', [['pr-01', 0, 100], ['pr-03', 0, 60]], 4],
  ].map((d, i) => { const lines = rfqLines(d[4], d[1]); if (i === 3) { lines[2].state = 'review'; lines[2].confidence = 71; } const t = gross(sub(lines)); return { id: 'rfq-' + pad(i + 1), no: 'RFQ-' + (3101 + i), partyId: d[1], contactId: contacts.find((c) => c.partyId === d[1]).id, source: { type: d[2], file: d[2] === 'pdf' ? 'enquiry-chd.pdf' : d[2] === 'excel' ? 'ahmedabad-cases.xlsx' : undefined }, receivedAt: iso(d[5], 10, 15), due: iso(d[5] - 2, 18, 0), status: d[3], owner: parties.find((p) => p.id === d[1]).owner, subject: d[0], notes: '', total: t, lines }; });
  const quotes = [
    ['rfq-01', 'pt-04', 'sent', 8.5], ['rfq-02', 'pt-06', 'pending_approval', 6.2], ['rfq-08', 'pt-07', 'sent', 11.0], ['rfq-06', 'pt-12', 'accepted', 9.4], ['rfq-07', 'pt-14', 'rejected', 7.1], [null, 'pt-05', 'draft', 10.2], [null, 'pt-03', 'sent', 8.8], [null, 'pt-10', 'draft', 12.4],
  ].map((d, i) => { const rf = d[0] ? rfqs.find((r) => r.id === d[0]) : null; const lines = rf ? rf.lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price, discPct: 0 })) : mkLines({ parties, products }, d[1], [['pr-06', 0, 30], ['pr-11', 0, 100]]).map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price, discPct: 0 })); return { id: 'qt-' + pad(i + 1), no: 'Q-' + (2201 + i), rfqId: d[0], partyId: d[1], status: d[2], total: gross(sub(lines)), marginPct: d[3], validTill: iso(-7 + i, 18, 0), createdAt: iso(10 - i, 12, 0), approver: d[2] === 'pending_approval' ? 'Neha Kulkarni' : d[2] === 'draft' ? null : 'Neha Kulkarni', lines, terms: 'Prices exclusive of GST. Dispatch within 48 h of confirmation. Validity 7 days.' }; });
  rfqs.forEach((r) => { const q = quotes.find((x) => x.rfqId === r.id); if (q) r.quoteId = q.id; });

  /* ───────── campaigns / lists / templates ───────── */
  const campaigns = [
    { id: 'cm-01', name: 'Diwali dealer stock sheet v12', channel: 'whatsapp', status: 'scheduled', audience: 'All active dealers', listId: 'ls-01', sent: 0, delivered: 0, read: 0, replied: 0, orders: 0, createdAt: iso(0, 8, 30), templateId: 'tp-01' },
    { id: 'cm-02', name: 'Q3 charger clearance', channel: 'whatsapp', status: 'sent', audience: 'Gold + Silver dealers', listId: 'ls-02', sent: 74, delivered: 71, read: 58, replied: 17, orders: 9, createdAt: iso(21, 11, 0), templateId: 'tp-02' },
    { id: 'cm-03', name: 'New dealer welcome', channel: 'whatsapp', status: 'running', audience: 'Dealers onboarded < 14 days', listId: 'ls-03', sent: 6, delivered: 6, read: 6, replied: 4, orders: 1, createdAt: iso(14, 10, 0), templateId: 'tp-03' },
    { id: 'cm-04', name: 'October price band update', channel: 'whatsapp', status: 'sent', audience: 'All active dealers', listId: 'ls-01', sent: 118, delivered: 114, read: 96, replied: 22, orders: 14, createdAt: iso(9, 12, 0), templateId: 'tp-05' },
    { id: 'cm-05', name: 'Wireless audio launch', channel: 'whatsapp', status: 'draft', audience: 'Platinum dealers', listId: 'ls-04', sent: 0, delivered: 0, read: 0, replied: 0, orders: 0, createdAt: iso(1, 15, 0), templateId: 'tp-04' },
  ];
  const lists = [
    { id: 'ls-01', name: 'All active dealers', count: 118, rule: 'status = active', updatedAt: iso(1, 9, 0) }, { id: 'ls-02', name: 'Gold + Silver dealers', count: 74, rule: 'price band in (B, C)', updatedAt: iso(3, 9, 0) },
    { id: 'ls-03', name: 'New dealers (<14 days)', count: 6, rule: 'created within 14 days', updatedAt: iso(0, 6, 0) }, { id: 'ls-04', name: 'Platinum dealers', count: 21, rule: 'price band = A', updatedAt: iso(5, 9, 0) },
  ];
  const templates = [
    ['tp-01', 'stock_sheet_share', 'utility', 'approved', 'Hi {{1}}, our Diwali stock sheet ({{2}}) is live with your Band {{3}} prices: {{4}}'], ['tp-02', 'clearance_offer', 'marketing', 'approved', 'Hi {{1}}, charger clearance — up to {{2}}% off till {{3}}. Order here: {{4}}'],
    ['tp-03', 'welcome_dealer', 'utility', 'approved', 'Welcome to Stuffcool, {{1}}! Your account manager is {{2}}. Stock sheet: {{3}}'], ['tp-04', 'launch_audio', 'marketing', 'pending', 'New: {{1}} — dealer price ₹{{2}}. See the sheet: {{3}}'],
    ['tp-05', 'price_update', 'utility', 'approved', 'Hi {{1}}, prices on the Stuffcool sheet have been updated (effective {{2}}).'], ['tp-06', 'order_confirmation', 'utility', 'approved', 'Hi {{1}}, order {{2}} confirmed. Total ₹{{3}}. Dispatch in 48 h.'],
    ['tp-07', 'dispatch_update', 'utility', 'approved', 'Order {{1}} dispatched via {{2}}. AWB {{3}} · track: {{4}}'], ['tp-08', 'payment_reminder', 'utility', 'rejected', 'Hi {{1}}, ₹{{2}} is overdue since {{3}}. Please clear to continue ordering.'],
  ].map((t) => ({ id: t[0], name: t[1], channel: 'whatsapp', category: t[2], status: t[3], lang: 'en', body: t[4] }));

  /* ───────── agents / workflows / channels / apps ───────── */
  const agents = [
    { id: 'ag-01', name: 'WhatsApp order desk', status: 'live', channelId: 'ch-01', role: 'Takes dealer orders on WhatsApp in English/Hinglish, matches them to the catalogue at the dealer’s price band and drafts the order.', initialMessage: 'Namaste! Stuffcool dealer desk here. Aap kya order karna chahenge?',
      rules: [{ id: 'r1', kind: 'rule', scope: 'inherited', text: 'Always quote the dealer’s own price band — never show another band.' }, { id: 'r2', kind: 'rule', scope: 'agent', text: 'Respect MOQ per product; below MOQ, ask the dealer to round up.' }, { id: 'r3', kind: 'guardrail', scope: 'inherited', text: 'Never confirm an order that takes outstanding + new order above the credit limit — route to Accounts.' }, { id: 'r4', kind: 'guardrail', scope: 'agent', text: 'Do not promise delivery dates; share the courier ETA only after dispatch.' }, { id: 'r5', kind: 'helper', scope: 'agent', text: 'Map model names loosely: “16 pro max” = iPhone 16 Pro Max.' }],
      sources: [{ id: 's1', type: 'document', title: 'Dealer price list Oct 2026.xlsx', state: 'indexed', addedBy: 'Neha Kulkarni', addedAt: iso(9, 10, 0), usedIn: 211 }, { id: 's2', type: 'link', title: 'merchants.anuma.run/stuffcool', state: 'indexed', addedBy: 'Aarav Mehta', addedAt: iso(30, 10, 0), usedIn: 164 }, { id: 's3', type: 'document', title: 'Warranty & returns policy.pdf', state: 'indexed', addedBy: 'Neha Kulkarni', addedAt: iso(40, 10, 0), usedIn: 38 }],
      learned: [{ id: 'l1', text: '“Pro Max wala” in an iPhone thread means iPhone 16 Pro Max.', at: iso(12, 10, 0) }, { id: 'l2', text: 'Sharma Mobile Hub reorders in multiples of 50 for cables.', at: iso(5, 10, 0) }],
      gaps: [{ id: 'g1', text: 'Questions about bulk OEM branding', count: 3 }, { id: 'g2', text: 'Return window for open-box earbuds', count: 2 }],
      training: [{ id: 'tr1', at: iso(12, 15, 0), by: 'Neha Kulkarni', prompt: 'When a dealer says “Pro Max”, assume the newest iPhone.', added: ['“Pro Max” → iPhone 16 Pro Max'], removed: [] }, { id: 'tr2', at: iso(20, 11, 0), by: 'Aarav Mehta', prompt: 'Stop offering discounts in chat.', added: ['Never offer discounts; escalate to ASM'], removed: ['Offer up to 2% for large orders'] }],
      activity: [{ id: 'ac1', at: iso(0, 8, 21), action: 'Replied to Gupta Mobile Zone', outcome: 'handled', channel: 'whatsapp', caseId: 'T-104' }, { id: 'ac2', at: iso(1, 17, 4), action: 'Drafted DR-2441 for Techno Hub', outcome: 'handled', channel: 'whatsapp', caseId: 'T-105' }, { id: 'ac3', at: iso(1, 15, 12), action: 'Escalated price-band question to Rohan', outcome: 'escalated', channel: 'whatsapp', caseId: 'T-107' }, { id: 'ac4', at: iso(2, 13, 0), action: 'Blocked order: account on credit hold', outcome: 'validation', channel: 'whatsapp', caseId: 'T-112' }],
      kpis: { handled: 342, autoRate: 87, escalated: 28, avgReplySec: 9 } },
    { id: 'ag-02', name: 'Stock sheet concierge', status: 'live', channelId: 'ch-04', role: 'Answers dealers browsing the hosted stock sheet: availability, MOQ, price tiers, variants.', initialMessage: 'Hi! Looking for something on the sheet? Ask me about stock, MOQ or models.',
      rules: [{ id: 'r6', kind: 'rule', scope: 'inherited', text: 'Always quote the dealer’s own price band — never show another band.' }, { id: 'r7', kind: 'helper', scope: 'agent', text: 'Suggest the matching charger when a dealer adds a cable.' }],
      sources: [{ id: 's4', type: 'link', title: 'merchants.anuma.run/stuffcool', state: 'indexed', addedBy: 'Aarav Mehta', addedAt: iso(30, 10, 0), usedIn: 88 }], learned: [{ id: 'l3', text: 'Dealers prefer variants listed by model first, colour second.', at: iso(15, 10, 0) }], gaps: [{ id: 'g3', text: 'Shipping cost to the North-East', count: 4 }],
      training: [], activity: [{ id: 'ac5', at: iso(1, 16, 5), action: 'Created ledger request for Digital Planet', outcome: 'handled', channel: 'web', caseId: 'T-102' }], kpis: { handled: 121, autoRate: 94, escalated: 7, avgReplySec: 4 } },
    { id: 'ag-03', name: 'Tally voucher sync', status: 'live', channelId: null, role: 'Posts every confirmed order to Tally as a Sales voucher, maps ledgers/stock items and retries or escalates failures.', initialMessage: '',
      rules: [{ id: 'r8', kind: 'rule', scope: 'agent', text: 'Post one Sales voucher per confirmed order; voucher number = SV/26-27/<order no>.' }, { id: 'r9', kind: 'guardrail', scope: 'agent', text: 'On “Ledger not found”, never create a ledger in Tally automatically — ask Accounts to confirm the mapping.' }, { id: 'r10', kind: 'helper', scope: 'agent', text: 'Use SKU as the Tally stock item name.' }],
      sources: [{ id: 's5', type: 'document', title: 'Tally ledger master export.xml', state: 'indexed', addedBy: 'Priya Nair', addedAt: iso(14, 10, 0), usedIn: 410 }], learned: [{ id: 'l4', text: 'Interstate parties post IGST 18%; Maharashtra parties post CGST + SGST 9%.', at: iso(30, 10, 0) }], gaps: [],
      training: [{ id: 'tr3', at: iso(30, 11, 0), by: 'Priya Nair', prompt: 'Use SKU for stock item names.', added: ['Stock item = SKU'], removed: [] }], activity: [{ id: 'ac6', at: iso(0, 7, 5), action: 'Synced SC-26-0398 → SV/26-27/0398', outcome: 'handled', channel: 'api', caseId: null }], kpis: { handled: 398, autoRate: 99, escalated: 3, avgReplySec: 2 } },
  ];
  const node = (id, type, label, detail, x, y) => ({ id, type, label, detail, x, y });
  const workflows = [
    { id: 'wf-01', name: 'Order confirmed → Tally sales voucher', status: 'active', trigger: 'Order confirmed', runs: 398, lastRun: iso(0, 7, 5), nodes: [node('n1', 'trigger', 'Order confirmed', 'oms.order.confirmed', 40, 120), node('n2', 'condition', 'Party ledger mapped?', 'party.tallyLedger is set', 280, 120), node('n3', 'action', 'POST Sales voucher to Tally', TALLY_URL, 520, 60), node('n4', 'condition', 'Tally response OK?', 'ERRORS = 0', 760, 60), node('n5', 'action', 'Mark order synced', 'order.erp.state = synced', 1000, 20), node('n6', 'action', 'Alert Accounts', 'WhatsApp + app notification', 1000, 160)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }, { from: 'n2', to: 'n6', label: 'No' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5', label: 'Yes' }, { from: 'n4', to: 'n6', label: 'No' }] },
    { id: 'wf-02', name: 'Credit limit gate', status: 'active', trigger: 'Draft order created', runs: 211, lastRun: iso(0, 8, 50), nodes: [node('n1', 'trigger', 'Draft order created', '', 40, 100), node('n2', 'condition', 'Outstanding + order > credit limit?', '', 290, 100), node('n3', 'action', 'Hold draft & notify Accounts', '', 560, 40), node('n4', 'action', 'Auto-approve draft', '', 560, 170)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }, { from: 'n2', to: 'n4', label: 'No' }] },
    { id: 'wf-03', name: 'Low stock alert', status: 'active', trigger: 'Stock level changed', runs: 64, lastRun: iso(1, 9, 0), nodes: [node('n1', 'trigger', 'Variant stock changed', '', 40, 100), node('n2', 'condition', 'Stock < MOQ × 3?', '', 280, 100), node('n3', 'action', 'Notify Neha (WhatsApp)', '', 540, 100)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }] },
    { id: 'wf-04', name: 'Dispatch → WhatsApp update', status: 'active', trigger: 'Shipment created', runs: 301, lastRun: iso(1, 16, 30), nodes: [node('n1', 'trigger', 'Shipment created', '', 40, 100), node('n2', 'delay', 'Wait 2 minutes', '', 270, 100), node('n3', 'action', 'Send dispatch_update template', '', 500, 100)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }] },
    { id: 'wf-05', name: 'Dealer price band review', status: 'draft', trigger: 'Monthly · 1st', runs: 0, lastRun: null, nodes: [node('n1', 'trigger', 'Every 1st of month', '', 40, 100), node('n2', 'action', 'Compute 90-day volume per dealer', '', 280, 100), node('n3', 'action', 'Suggest band changes to Aarav', '', 540, 100)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }] },
  ];
  const channels = [
    { id: 'ch-01', type: 'whatsapp', name: 'Dealer desk', number: '+91 98219 40011', provider: 'Dialog360', state: 'connected', webhook: 'healthy', lastEvent: iso(0, 8, 50) },
    { id: 'ch-02', type: 'email', name: 'orders@stuffcool.example', number: 'orders@stuffcool.example', provider: 'Gmail', state: 'connected', webhook: 'healthy', lastEvent: iso(1, 12, 40) },
    { id: 'ch-03', type: 'indiamart', name: 'IndiaMART leads', number: 'Seller ID 5521908', provider: 'IndiaMART', state: 'connected', webhook: 'healthy', lastEvent: iso(0, 7, 40) },
    { id: 'ch-04', type: 'web', name: 'Hosted stock sheet', number: 'merchants.anuma.run/stuffcool', provider: 'Anuma', state: 'connected', webhook: 'healthy', lastEvent: iso(1, 16, 5) },
    { id: 'ch-05', type: 'telegram', name: 'Internal alerts bot', number: '@stuffcool_ops_bot', provider: 'Telegram', state: 'needs_reauth', webhook: 'failing', lastEvent: iso(6, 9, 0) },
  ];
  const app = (slug, name, desc, category, state, color, extra = {}) => Object.assign({ slug, name, desc, category, state, icon: color, letter: name[0] }, extra);
  const apps = [
    app('tally', 'Tally', 'Post confirmed orders to TallyPrime as Sales vouchers over the HTTP/XML gateway.', 'Accounting', 'connected', '#0b5fa5', { account: 'Stuffcool Technologies Pvt Ltd', lastSync: iso(0, 7, 5), config: { gateway: TALLY_URL, company: 'Stuffcool Technologies Pvt Ltd', voucherType: 'Sales', salesLedger: 'Sales - Accessories', godown: 'Main Godown - Bhiwandi', partyMapping: 'Party name → Tally ledger (editable on the party)', stockItemMapping: 'SKU → Stock item', autoSync: true, retries: 3 } }),
    app('gsheets', 'Google Sheets', 'Export orders and stock sheets, or read price lists from Sheets.', 'Productivity', 'connected', '#188038', { account: 'neha@stuffcool.example', lastSync: iso(1, 9, 0) }),
    app('shopify', 'Shopify', 'Sync a retail storefront catalogue with B2B stock.', 'Commerce', 'available', '#5e8e3e'), app('gmail', 'Gmail', 'Read POs and RFQs from a shared inbox.', 'Email', 'connected', '#d93025', { account: 'orders@stuffcool.example', lastSync: iso(1, 12, 40) }),
    app('indiamart', 'IndiaMART', 'Pull buyer leads into Inbox and Deals.', 'Lead sources', 'connected', '#2e3192', { account: 'Seller 5521908', lastSync: iso(0, 7, 40) }), app('shiprocket', 'Shiprocket', 'Book shipments and track AWBs.', 'Shipping', 'connected', '#6c3ef4', { account: 'stuffcool', lastSync: iso(1, 16, 30) }),
    app('razorpay', 'Razorpay', 'Collect advances with UPI payment links.', 'Payments', 'connected', '#0c2451', { account: 'rzp_live_••••4f2a', lastSync: iso(0, 9, 5) }), app('plivo', 'Plivo', 'SMS and WhatsApp messaging provider.', 'Messaging', 'available', '#43b02a'),
    app('dialog360', '360dialog', 'WhatsApp Business API provider.', 'Messaging', 'connected', '#1daa68', { account: '+91 98219 40011', lastSync: iso(0, 8, 50) }), app('zohobooks', 'Zoho Books', 'Alternative accounting sync.', 'Accounting', 'available', '#e42527'), app('delhivery', 'Delhivery', 'Direct courier integration.', 'Shipping', 'available', '#d62027'), app('gdrive', 'Google Drive', 'Attach price lists and catalogues from Drive.', 'Productivity', 'available', '#1a73e8'),
    app('telegram', 'Telegram', 'Internal alerts for the ops team.', 'Messaging', 'connected', '#2aabee', { account: '@stuffcool_ops_bot', lastSync: iso(6, 9, 0) }),
  ];
  const tally = { gateway: TALLY_URL, company: 'Stuffcool Technologies Pvt Ltd', version: 'TallyPrime 5.1', ledgers: parties.map((p, i) => (i === 1 ? 'Digital Planet Electronics - Pune' : p.name)).concat(['Sales - Accessories', 'CGST 9%', 'SGST 9%', 'IGST 18%']), stockItemCount: 164 };

  /* ───────── logs / notifications / rulebook / misc ───────── */
  const lt = [['Anuma', 'drafted order', 'DR-2441', 'handled', 'whatsapp', 'action'], ['Tally voucher sync', 'posted voucher', 'SV/26-27/0398', 'handled', 'api', 'action'], ['Priya Nair', 'approved draft', 'DR-2443', 'handled', 'app', 'action'], ['Anuma', 'flagged credit limit', 'T-112', 'escalated', 'whatsapp', 'alert'], ['Anuma', 'rejected unknown SKU', 'T-110', 'validation', 'whatsapp', 'validation'], ['Rohan Deshpande', 'took over case', 'T-107', 'handled', 'app', 'action'], ['Neha Kulkarni', 'published catalogue', 'v11', 'handled', 'app', 'action'], ['Shiprocket', 'booked shipment', 'sh-0394', 'handled', 'api', 'action']];
  const logs = Array.from({ length: 32 }, (_, i) => { const t = lt[i % lt.length]; return { id: 'lg-' + pad(i + 1), at: iso(Math.floor(i / 5), 17 - (i % 9), (i * 13) % 60), actor: t[0], action: t[1], target: t[2], outcome: t[3], kind: t[5], channel: t[4] }; });
  const notifications = [
    { id: 'nt-01', tab: 'agent', from: 'WhatsApp order desk', subject: 'Draft DR-2441 ready', body: 'Techno Hub — 3 lines, ₹1.64L. Awaiting approval.', href: '/orders/drafts/dr-2441', at: iso(0, 8, 51), unread: true },
    { id: 'nt-02', tab: 'human', from: 'Anuma', subject: 'GaN 45W is still a draft', body: 'Gupta Mobile Zone asked for 200 pcs. Publish v12 to take orders.', href: '/products/pr-07', at: iso(0, 8, 24), unread: true },
    { id: 'nt-03', tab: 'agent', from: 'Tally voucher sync', subject: 'All vouchers synced', body: '18 of 18 orders in the last 30 days are in Tally.', href: '/settings/integrations/tally', at: iso(0, 7, 6), unread: false },
    { id: 'nt-04', tab: 'human', from: 'Anuma', subject: 'Credit hold: Chandigarh Cell Bazaar', body: '₹60,100 overdue. Draft orders blocked.', href: '/crm/accounts/pt-14', at: iso(2, 13, 1), unread: false },
    { id: 'nt-05', tab: 'agent', from: 'Stock sheet concierge', subject: 'New dealer ledger requested', body: 'Digital Planet Electronics (Pune).', href: '/crm/accounts/pt-02', at: iso(1, 16, 6), unread: false },
  ];
  const rulebook = [
    { id: 'rb-01', kind: 'rule', scope: 'inherited', text: 'Quote each dealer at their own price band (A/B/C).', enabled: true }, { id: 'rb-02', kind: 'rule', scope: 'inherited', text: 'Respect product MOQ; round up when a dealer orders below it.', enabled: true }, { id: 'rb-03', kind: 'guardrail', scope: 'inherited', text: 'Hold any order that pushes outstanding above the credit limit.', enabled: true }, { id: 'rb-04', kind: 'guardrail', scope: 'inherited', text: 'Never offer discounts in chat — escalate to the ASM.', enabled: true },
    { id: 'rb-05', kind: 'rule', scope: 'agent', text: 'Confirm orders only after Accounts approval when advance terms apply.', enabled: true }, { id: 'rb-06', kind: 'helper', scope: 'agent', text: 'Understand model shorthand (“16 pro max”, “s24 ultra”).', enabled: true }, { id: 'rb-07', kind: 'guardrail', scope: 'agent', text: 'Do not auto-create ledgers in Tally.', enabled: true }, { id: 'rb-08', kind: 'rule', scope: 'agent', text: 'Hand over to the ASM when the dealer asks for custom branding.', enabled: false },
  ];
  const usage = { plan: 'Growth', period: 'Oct 2026', items: [{ label: 'WhatsApp conversations', used: 1860, limit: 3000 }, { label: 'Agent actions', used: 7420, limit: 10000 }, { label: 'Orders synced to ERP', used: 312, limit: 1000 }, { label: 'Users', used: 6, limit: 10 }, { label: 'Storage (GB)', used: 3.4, limit: 25 }] };
  const rateCard = [
    { id: 'rc-1', category: 'Cases', minMarginPct: 28, maxDiscPct: 4, approvalAbove: 100000 }, { id: 'rc-2', category: 'Chargers', minMarginPct: 20, maxDiscPct: 3, approvalAbove: 150000 }, { id: 'rc-3', category: 'Cables', minMarginPct: 30, maxDiscPct: 5, approvalAbove: 100000 },
    { id: 'rc-4', category: 'Power banks', minMarginPct: 16, maxDiscPct: 2, approvalAbove: 200000 }, { id: 'rc-5', category: 'Earbuds', minMarginPct: 24, maxDiscPct: 3, approvalAbove: 150000 }, { id: 'rc-6', category: 'Screen guards', minMarginPct: 40, maxDiscPct: 6, approvalAbove: 80000 }, { id: 'rc-7', category: 'Accessories', minMarginPct: 25, maxDiscPct: 4, approvalAbove: 100000 },
  ];

  /* ───────── dashboard: recomputed from state after every step ───────── */
  const refreshDash = (S) => {
    const d = S.dash || (S.dash = { greeting: 'Good morning, Aarav', activity: [] });
    const live30 = S.orders.filter((o) => o.status !== 'cancelled' && (Date.parse(iso(0, 23, 59)) - Date.parse(o.placedAt)) < 30 * 86400000);
    const rev = live30.reduce((s, o) => s + o.total, 0);
    const dealers = new Set(live30.map((o) => o.partyId)).size;
    const synced = S.orders.filter((o) => o.erp && o.erp.state === 'synced').length, fail = S.orders.filter((o) => o.erp && o.erp.state === 'failed').length, pend = S.orders.filter((o) => o.erp && o.erp.state === 'pending').length;
    const pct = Math.round((synced / Math.max(1, synced + fail + pend)) * 100);
    d.kpis = [
      { key: 'revenue', label: 'Order value (30d)', value: rev, delta: 14.2, fmt: 'inr' }, { key: 'orders', label: 'Orders (30d)', value: live30.length, delta: 9.1, fmt: 'num' }, { key: 'dealers', label: 'Dealers ordering', value: dealers, delta: 6.7, fmt: 'num' },
      { key: 'tally', label: 'Synced to Tally', value: pct, delta: fail ? -(100 - pct) : 0, fmt: 'pct' }, { key: 'pending', label: 'Drafts awaiting approval', value: S.drafts.filter((x) => x.status === 'pending').length, delta: 0, fmt: 'num' },
    ];
    const days = {}; for (let k = 13; k >= 0; k--) days[dayKey(iso(k, 12))] = 0;
    S.orders.forEach((o) => { const k = dayKey(o.placedAt); if (k in days) days[k] += o.total; });
    d.revenue = Object.entries(days).map(([k, v]) => ({ l: new Date(k).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), v }));
    d.funnel = [{ l: 'Stock sheet visits', v: 412 + S.orders.length * 3 }, { l: 'Carts started', v: 84 + S.drafts.length * 2 }, { l: 'Draft orders', v: 60 + S.drafts.length }, { l: 'Orders confirmed', v: live30.length }, { l: 'Synced to Tally', v: synced }];
    const byP = {}; live30.forEach((o) => { byP[o.partyId] = (byP[o.partyId] || 0) + o.total; });
    d.topParties = Object.entries(byP).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, v]) => ({ l: (partyOf(S, id) || {}).name, v }));
    d.alerts = [];
    if (fail) d.alerts.push({ id: 'al-f', text: fail + ' order' + (fail > 1 ? 's' : '') + ' failed to sync to Tally', tone: 'red', href: '/settings/integrations/tally' });
    const pd = S.drafts.filter((x) => x.status === 'pending').length; if (pd) d.alerts.push({ id: 'al-d', text: pd + ' draft order' + (pd > 1 ? 's' : '') + ' waiting for approval', tone: 'amber', href: '/orders/drafts' });
    const unp = S.products.filter((p) => p.status === 'draft').length; if (unp) d.alerts.push({ id: 'al-p', text: unp + ' new products not published to the stock sheet', tone: 'blue', href: '/products' });
    const low = S.products.filter((p) => p.status === 'active' && p.stock < 120).length; if (low) d.alerts.push({ id: 'al-s', text: low + ' products low on stock', tone: 'amber', href: '/products' });
    return d;
  };
  const act = (S, at, text, href) => { S.dash.activity.unshift({ at, text, href }); };
  const log = (S, at, actor, action, target, outcome = 'handled', kind = 'action', channel = 'app') => S.logs.unshift({ id: 'lg-' + Math.random().toString(36).slice(2, 7), at, actor, action, target, outcome, kind, channel });

  /* ───────── assemble seed ───────── */
  const seed = { company, users, parties, contacts, products, categories, stockSheets, threads, leads, rfqs, quotes, orders, drafts, shipments, campaigns, lists, templates, agents, workflows, channels, apps, erpLog, logs, notifications, rulebook, usage, rateCard, tally };
  seed.dash = { greeting: 'Good morning, Aarav', activity: [{ at: iso(0, 8, 51), text: 'WhatsApp order desk drafted DR-2441 for Techno Hub', href: '/orders/drafts/dr-2441' }, { at: iso(0, 7, 5), text: 'SC-26-0398 posted to Tally as SV/26-27/0398', href: '/orders' }, { at: iso(1, 16, 5), text: 'Digital Planet Electronics onboarded as a dealer', href: '/crm/accounts/pt-02' }] };
  refreshDash(seed);

  /* ───────── scenario ───────── */
  const NO = { sharma: 'SC-26-0399', dp: 'SC-26-0400', vasant: 'SC-26-0401' };
  const ID = { sharma: 'o-0399', dp: 'o-0400', vasant: 'o-0401' };
  const createOrder = (S, key, partyId, draft, at, channel, payment, threadId) => {
    const lines = draft.lines.map((l) => Object.assign({}, l, { state: undefined }));
    const o = { id: ID[key], no: NO[key], partyId, status: 'confirmed', total: gross(sub(lines)), placedAt: at, channel, payment, lines, erp: { system: 'Tally', ref: null, state: 'pending', at }, threadId };
    S.orders.unshift(o); draft.status = 'posted';
    const p = partyOf(S, partyId); p.lastOrderAt = at; p.orders30d++; p.lifetime += o.total; p.outstanding += payment === 'Credit' ? o.total : 0;
    return o;
  };
  const syncOk = (S, o, at) => { const p = partyOf(S, o.partyId); o.erp = { system: 'Tally', ref: voucherNo(o.no), state: 'synced', at }; S.erpLog.unshift(logOk(o, p, at)); };
  const thread = (S, id) => S.threads.find((t) => t.id === id);
  const say = (S, id, msg, unread) => { const t = thread(S, id); t.messages.push(msg); t.preview = msg.text; t.lastAt = msg.at; if (unread != null) t.unread = unread; };
  const mid = () => 'm' + Math.random().toString(36).slice(2, 8);
  const cardMsg = (at, text, lines, extra) => m(mid(), 'anuma', text, at, 'card', Object.assign({ kind: 'order', lines: lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })) }, extra));

  const steps = [
    { id: 's01', at: '08:55', actor: 'Neha', title: 'Catalogue v12 published', desc: '4 new products go live on the stock sheet', route: '/products',
      narr: 'Neha publishes catalogue v12 — GaN 45W, ANC Buds Pro, 30K Power Bank and Matte Gaming Glass move from draft to live. The hosted stock sheet now carries 30 products with per-dealer price bands.',
      apply(S) { ['pr-07', 'pr-19', 'pr-22', 'pr-27'].forEach((id) => { const p = prodOf(S, id); p.status = 'active'; p.variants.forEach((v) => (v.stock = 240)); p.stock = p.variants.length * 240; }); const ss = S.stockSheets[0]; ss.version = 'v12'; ss.itemCount = 30; ss.published = true; ss.lastPublished = iso(0, 8, 55); log(S, iso(0, 8, 55), 'Neha Kulkarni', 'published catalogue', 'v12 · 30 products'); act(S, iso(0, 8, 55), 'Catalogue v12 published — 30 products live', '/products'); refreshDash(S); },
      notifies: [{ tab: 'human', from: 'Neha Kulkarni', subject: 'Stock sheet v12 is live', body: '30 products · Band A/B/C prices applied.', href: '/products' }], m: { catalogLive: 30 } },
    { id: 's02', at: '08:58', actor: 'Neha', title: 'Diwali price slab applied', desc: 'Chargers −3% on Band A', route: '/quotes/rate-card',
      narr: 'A Diwali slab trims Band A charger prices by 3%. Every dealer sees their own band price on the sheet; nobody sees another band.',
      apply(S) { S.products.filter((p) => p.category === 'Chargers').forEach((p) => { p.priceBands.A = Math.round(p.priceBands.A * 0.97); p.price = p.priceBands.A; p.variants.forEach((v) => (v.price = p.price)); p.tag = 'Diwali price'; }); S.rateCard.find((r) => r.category === 'Chargers').maxDiscPct = 3; log(S, iso(0, 8, 58), 'Neha Kulkarni', 'applied price slab', 'Diwali · Chargers Band A −3%'); act(S, iso(0, 8, 58), 'Diwali price slab applied to chargers', '/products'); refreshDash(S); } },
    { id: 's03', at: '09:00', actor: 'Anuma', title: 'Stock sheet sent to 118 dealers', desc: 'WhatsApp template stock_sheet_share', route: '/campaigns',
      narr: 'Anuma sends the stock-sheet template on WhatsApp to every active dealer. Within minutes 74 have read it and 19 have already replied.',
      apply(S) { const c = S.campaigns.find((x) => x.id === 'cm-01'); Object.assign(c, { status: 'sent', sent: 118, delivered: 112, read: 74, replied: 19 }); log(S, iso(0, 9, 0), 'Anuma', 'sent campaign', 'Diwali dealer stock sheet v12', 'handled', 'action', 'whatsapp'); act(S, iso(0, 9, 0), 'Stock sheet sent to 118 dealers', '/campaigns'); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'Anuma', subject: 'Campaign sent', body: '118 dealers · 112 delivered · 74 read.', href: '/campaigns' }] },
    { id: 's04', at: '09:12', actor: 'Dealer', title: 'Sharma Mobile Hub orders on WhatsApp', desc: '4 products, Hinglish text', route: '/inbox/threads?case=T-101',
      narr: 'Mukesh Sharma opens the sheet and orders over WhatsApp: GaN chargers, USB-C cables, iPhone 16 Pro clear cases and neckbands.',
      apply(S) { const t = thread(S, 'T-101'); t.status = 'open'; t.owner = 'anuma'; say(S, 'T-101', m(mid(), 'customer', 'Bhai sheet dekh li. 100 GaN 67W, 200 USB-C 1m cable, 60 iPhone 16 Pro clear case aur 50 neckband de do. Kal tak chahiye.', iso(0, 9, 12)), 1); refreshDash(S); },
      notifies: [{ tab: 'human', from: 'Sharma Mobile Hub', subject: 'New order message', body: '100 GaN 67W, 200 cables, 60 cases, 50 neckbands…', href: '/inbox/threads?case=T-101' }], m: { dealers: 1 } },
    { id: 's05', at: '09:13', actor: 'Anuma', title: 'Anuma builds the draft order', desc: 'Matches every line at Band A prices', route: '/orders/drafts/dr-2447',
      narr: 'Anuma reads the message, matches all 4 lines to catalogue variants with ≥96% confidence, applies Sharma’s Band A prices and opens draft DR-2447.',
      apply(S) { const lines = mkLines(S, 'pt-01', [['pr-06', 0, 100, 'confirmed'], ['pr-11', 0, 200, 'confirmed'], ['pr-01', 1, 60, 'confirmed'], ['pr-21', 0, 50, 'confirmed']]); const d = { id: 'dr-2447', no: 'DR-2447', partyId: 'pt-01', threadId: 'T-101', status: 'pending', total: gross(sub(lines)), createdAt: iso(0, 9, 13), by: 'Anuma', note: '4 lines matched at ≥96% confidence', lines }; S.drafts.unshift(d); thread(S, 'T-101').draftId = d.id; say(S, 'T-101', cardMsg(iso(0, 9, 13), 'Sharma ji, order samajh liya — 4 lines Band A rate par. Total ₹' + d.total.toLocaleString('en-IN') + ' (GST ke saath). Draft DR-2447 bana diya.', lines, { draftId: d.id, total: d.total }), 0); log(S, iso(0, 9, 13), 'Anuma', 'drafted order', 'DR-2447', 'handled', 'action', 'whatsapp'); act(S, iso(0, 9, 13), 'Draft DR-2447 created for Sharma Mobile Hub', '/orders/drafts/dr-2447'); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'WhatsApp order desk', subject: 'Draft DR-2447 created', body: 'Sharma Mobile Hub · 4 lines', href: '/orders/drafts/dr-2447' }] },
    { id: 's06', at: '09:14', actor: 'System', title: 'Credit check fails', desc: 'Outstanding + order is over the ₹4L limit', route: '/orders/drafts/dr-2447',
      narr: 'The credit gate runs before anything is confirmed: ₹3.12L outstanding plus this order pushes Sharma over the ₹4L limit, so the draft is held for Accounts instead of being confirmed.',
      apply(S) { const d = S.drafts.find((x) => x.id === 'dr-2447'); const p = partyOf(S, 'pt-01'); const over = p.outstanding + d.total - p.creditLimit; d.flag = 'credit'; d.note = 'Credit hold: outstanding ₹' + p.outstanding.toLocaleString('en-IN') + ' + this order ₹' + d.total.toLocaleString('en-IN') + ' is ₹' + over.toLocaleString('en-IN') + ' over the ₹' + p.creditLimit.toLocaleString('en-IN') + ' limit'; say(S, 'T-101', m(mid(), 'anuma', 'Sharma ji, order Accounts ke approval ke liye ruka hai — purana outstanding ₹' + p.outstanding.toLocaleString('en-IN') + ' hai. Priya aapse baat karengi.', iso(0, 9, 14)), 0); thread(S, 'T-101').owner = 'u5'; log(S, iso(0, 9, 14), 'Anuma', 'held draft: credit limit', 'DR-2447', 'escalated', 'alert', 'whatsapp'); act(S, iso(0, 9, 14), 'DR-2447 held: over credit limit by ₹' + over.toLocaleString('en-IN'), '/orders/drafts/dr-2447'); refreshDash(S); },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Approval needed: DR-2447', body: 'Sharma Mobile Hub is over the credit limit with this order. Priya to approve or ask for advance.', href: '/orders/drafts/dr-2447' }] },
    { id: 's07', at: '09:31', actor: 'Priya', title: 'Accounts approves after ₹1.8L advance', desc: 'UPI advance received; draft approved', route: '/orders/drafts/dr-2447',
      narr: 'Priya asks Sharma for a ₹1.8L advance. The UPI payment lands, outstanding drops to ₹1.32L, the order now fits within the limit and Priya approves the draft.',
      apply(S) { const p = partyOf(S, 'pt-01'); p.outstanding -= 180000; const d = S.drafts.find((x) => x.id === 'dr-2447'); d.status = 'approved'; d.flag = null; d.approver = 'Priya Nair'; d.note = 'Approved by Priya Nair after ₹1,80,000 advance (UPI)'; say(S, 'T-101', m(mid(), 'customer', '₹1,80,000 UPI kar diya, UTR 4091 7733 2210. Check karo.', iso(0, 9, 24)), 0); say(S, 'T-101', m(mid(), 'u5', 'Payment mil gaya Sharma ji, thanks. Order approve kar diya.', iso(0, 9, 31)), 0); log(S, iso(0, 9, 31), 'Priya Nair', 'approved draft', 'DR-2447'); act(S, iso(0, 9, 31), 'Priya approved DR-2447 after ₹1.8L advance', '/orders/drafts/dr-2447'); refreshDash(S); },
      notifies: [{ tab: 'human', from: 'Priya Nair', subject: 'DR-2447 approved', body: 'Advance ₹1,80,000 received. Order can be confirmed.', href: '/orders/drafts/dr-2447' }] },
    { id: 's08', at: '09:32', actor: 'Anuma', title: 'Order SC-26-0399 confirmed', desc: 'Draft posted as a confirmed order', route: '/orders/' + ID.sharma,
      narr: 'The approved draft becomes order SC-26-0399. Tally sync is queued — the order shows “Tally: pending” until the voucher is accepted.',
      apply(S) { const d = S.drafts.find((x) => x.id === 'dr-2447'); const o = createOrder(S, 'sharma', 'pt-01', d, iso(0, 9, 32), 'whatsapp', 'Credit', 'T-101'); thread(S, 'T-101').orderId = o.id; say(S, 'T-101', m(mid(), 'anuma', 'Order SC-26-0399 confirm ho gaya — ₹' + o.total.toLocaleString('en-IN') + '. Kal dispatch.', iso(0, 9, 32)), 0); thread(S, 'T-101').status = 'closed'; log(S, iso(0, 9, 32), 'Anuma', 'confirmed order', o.no, 'handled', 'action', 'whatsapp'); act(S, iso(0, 9, 32), 'Order SC-26-0399 confirmed — ₹' + o.total.toLocaleString('en-IN'), '/orders/' + o.id); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'WhatsApp order desk', subject: 'Order SC-26-0399 confirmed', body: 'Sharma Mobile Hub · queued for Tally', href: '/orders/' + ID.sharma }], m: { orderValue: 0 } },
    { id: 's09', at: '09:35', actor: 'Tally sync', title: 'Sales voucher posted to Tally', desc: 'SV/26-27/0399 · HTTP 200 · 0 errors', route: '/settings/integrations/tally',
      narr: 'Tally voucher sync maps Sharma to the “Sharma Mobile Hub” ledger, each SKU to a Tally stock item, adds CGST+SGST 9% and POSTs the XML to the gateway. Tally answers CREATED=1.',
      apply(S) { const o = S.orders.find((x) => x.id === ID.sharma); syncOk(S, o, iso(0, 9, 35)); log(S, iso(0, 9, 35), 'Tally voucher sync', 'posted voucher', voucherNo(o.no), 'handled', 'action', 'api'); act(S, iso(0, 9, 35), 'SC-26-0399 → Tally voucher ' + voucherNo(o.no), '/settings/integrations/tally'); refreshDash(S); }, m: { syncPct: 100 } },
    { id: 's10', at: '10:05', actor: 'Dealer', title: 'Digital Planet orders on the stock sheet', desc: 'New dealer, 14 lines via web', route: '/orders/' + ID.dp,
      narr: 'Digital Planet (Pune), onboarded last week, orders straight from the hosted stock sheet. The order is inside their ₹2.5L credit line, so it is auto-approved and confirmed without a human.',
      apply(S) { const lines = mkLines(S, 'pt-02', [['pr-06', 1, 40, 'confirmed'], ['pr-07', 0, 60, 'confirmed'], ['pr-11', 1, 120, 'confirmed'], ['pr-12', 0, 60, 'confirmed'], ['pr-16', 2, 24, 'confirmed'], ['pr-20', 0, 30, 'confirmed'], ['pr-25', 3, 60, 'confirmed'], ['pr-26', 0, 40, 'confirmed']]); const d = { id: 'dr-2448', no: 'DR-2448', partyId: 'pt-02', threadId: 'T-102', status: 'approved', total: gross(sub(lines)), createdAt: iso(0, 10, 5), by: 'Stock sheet', note: 'Within ₹2,50,000 credit line — auto-approved', lines, approver: 'Credit gate' }; S.drafts.unshift(d); thread(S, 'T-102').draftId = d.id; say(S, 'T-102', m(mid(), 'customer', 'Order placed on stock sheet — ' + lines.length + ' lines', iso(0, 10, 5), 'card', { kind: 'order', lines: lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })), total: d.total }), 1); const o = createOrder(S, 'dp', 'pt-02', d, iso(0, 10, 6), 'web', 'Credit', 'T-102'); thread(S, 'T-102').orderId = o.id; say(S, 'T-102', m(mid(), 'anuma', 'Thank you Prakash — order SC-26-0400 confirmed, ₹' + o.total.toLocaleString('en-IN') + '.', iso(0, 10, 6)), 0); log(S, iso(0, 10, 6), 'Anuma', 'confirmed order', o.no, 'handled', 'action', 'web'); act(S, iso(0, 10, 6), 'Order SC-26-0400 from Digital Planet — ₹' + o.total.toLocaleString('en-IN'), '/orders/' + o.id); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'Stock sheet concierge', subject: 'Order SC-26-0400 confirmed', body: 'Digital Planet Electronics · first order · queued for Tally', href: '/orders/' + ID.dp }], m: { dealers: 2, orderValue: 0 } },
    { id: 's11', at: '10:08', actor: 'Tally sync', title: 'Tally rejects the voucher', desc: 'HTTP 400 · Ledger “Digital Planet Electronics” not found', route: '/settings/integrations/tally',
      narr: 'Tally has the ledger as “Digital Planet Electronics - Pune”, so the voucher is rejected. The order stays confirmed but is marked sync-failed, and Accounts is alerted instead of a ledger being auto-created.',
      apply(S) { const o = S.orders.find((x) => x.id === ID.dp); const p = partyOf(S, o.partyId); const at = iso(0, 10, 8); const err = 'Ledger "' + p.tallyLedger + '" not found'; o.erp = { system: 'Tally', ref: null, state: 'failed', at, error: err }; S.erpLog.unshift({ id: 'erp-' + o.no + '-fail', orderId: o.id, system: 'Tally', direction: 'out', endpoint: TALLY_URL, method: 'POST', status: 400, ref: voucherNo(o.no), at, request: tallyReq(o, p, o.lines), response: { CREATED: 0, ERRORS: 1, LINEERROR: err, EXCEPTIONS: 0 }, state: 'failed' }); log(S, at, 'Tally voucher sync', 'voucher rejected', voucherNo(o.no) + ' — ledger not found', 'escalated', 'alert', 'api'); act(S, at, 'Tally rejected SC-26-0400: ledger not found', '/settings/integrations/tally'); refreshDash(S); },
      notifies: [{ tab: 'human', from: 'Tally voucher sync', subject: 'Tally sync failed: SC-26-0400', body: 'Ledger "Digital Planet Electronics" not found in Tally. Confirm the mapping to retry.', href: '/orders/' + ID.dp }, { tab: 'agent', from: 'Tally voucher sync', subject: 'Ledger mapping needed', body: 'Closest Tally match: "Digital Planet Electronics - Pune" (97%).', href: '/crm/accounts/pt-02' }], m: { syncPct: 50 } },
    { id: 's12', at: '10:15', actor: 'Priya', title: 'Ledger mapped to “… - Pune”', desc: 'Anuma suggests, Priya confirms', route: '/crm/accounts/pt-02',
      narr: 'Anuma suggests the closest Tally ledger. Priya confirms, the party’s Tally ledger is updated, and Anuma remembers the mapping for future orders.',
      apply(S) { const p = partyOf(S, 'pt-02'); p.tallyLedger = 'Digital Planet Electronics - Pune'; p.tallyLedgerNote = 'Verified against Tally by Priya Nair'; const a = S.agents.find((x) => x.id === 'ag-03'); a.learned.unshift({ id: 'l-dp', text: 'Digital Planet’s Tally ledger is “Digital Planet Electronics - Pune”.', at: iso(0, 10, 15) }); log(S, iso(0, 10, 15), 'Priya Nair', 'mapped Tally ledger', 'Digital Planet Electronics → … - Pune'); act(S, iso(0, 10, 15), 'Ledger mapped for Digital Planet', '/crm/accounts/pt-02'); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'Tally voucher sync', subject: 'Learned a ledger mapping', body: 'Digital Planet → "Digital Planet Electronics - Pune".', href: '/agents/ag-03/training' }] },
    { id: 's13', at: '10:16', actor: 'Tally sync', title: 'Retry succeeds', desc: 'SV/26-27/0400 · HTTP 200', route: '/orders/' + ID.dp,
      narr: 'The failed sync is retried with the corrected ledger name. Tally accepts the voucher and the order flips to “Synced”. Sync rate is back to 100%.',
      apply(S) { const o = S.orders.find((x) => x.id === ID.dp); syncOk(S, o, iso(0, 10, 16)); log(S, iso(0, 10, 16), 'Tally voucher sync', 'retried voucher', voucherNo(o.no), 'handled', 'action', 'api'); act(S, iso(0, 10, 16), 'SC-26-0400 → Tally voucher ' + voucherNo(o.no) + ' (retry)', '/orders/' + o.id); refreshDash(S); }, m: { syncPct: 100 } },
    { id: 's14', at: '11:40', actor: 'Dealer', title: 'Vasant Telecom sends a voice note', desc: 'Anuma transcribes, orders, syncs to Tally', route: '/inbox/threads?case=T-103',
      narr: 'Vasant Telecom orders by voice note in Hindi. Anuma transcribes it, drafts, confirms (within limit) and the voucher posts to Tally on the first try — no human involved.',
      apply(S) { const t = thread(S, 'T-103'); t.status = 'open'; say(S, 'T-103', m(mid(), 'customer', 'Voice note (0:14) · “Do-do GaN 67W wale, tees type-C cable aur pachaas tempered glass S24 ka bhej dena.”', iso(0, 11, 40), 'voice', { seconds: 14, transcript: 'Do-do GaN 67W wale, tees type-C cable aur pachaas tempered glass S24 ka bhej dena.' }), 1); const lines = mkLines(S, 'pt-03', [['pr-06', 0, 20, 'confirmed'], ['pr-13', 0, 30, 'confirmed'], ['pr-24', 3, 50, 'confirmed']]); const d = { id: 'dr-2449', no: 'DR-2449', partyId: 'pt-03', threadId: 'T-103', status: 'approved', total: gross(sub(lines)), createdAt: iso(0, 11, 41), by: 'Anuma', note: 'Voice note transcribed; within credit limit', lines, approver: 'Credit gate' }; S.drafts.unshift(d); t.draftId = d.id; const o = createOrder(S, 'vasant', 'pt-03', d, iso(0, 11, 42), 'whatsapp', 'Credit', 'T-103'); t.orderId = o.id; say(S, 'T-103', cardMsg(iso(0, 11, 42), 'Vasant ji, order confirm — SC-26-0401, ₹' + o.total.toLocaleString('en-IN') + '.', lines, { total: o.total }), 0); syncOk(S, o, iso(0, 11, 45)); t.status = 'closed'; log(S, iso(0, 11, 42), 'Anuma', 'confirmed order (voice)', o.no, 'handled', 'action', 'whatsapp'); log(S, iso(0, 11, 45), 'Tally voucher sync', 'posted voucher', voucherNo(o.no), 'handled', 'action', 'api'); act(S, iso(0, 11, 45), 'SC-26-0401 from Vasant Telecom → Tally ' + voucherNo(o.no), '/orders/' + o.id); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'WhatsApp order desk', subject: 'Order SC-26-0401 confirmed', body: 'Vasant Telecom · voice note · synced to Tally', href: '/orders/' + ID.vasant }], m: { dealers: 3, orderValue: 0, syncPct: 100 } },
    { id: 's15', at: '15:30', actor: 'System', title: 'Dispatch: 3 shipments booked', desc: 'AWBs shared with dealers on WhatsApp', route: '/fulfilment',
      narr: 'Shiprocket books all three orders. AWBs are sent to the dealers automatically and the orders move to Shipped.',
      apply(S) { [['sharma', 'Delhivery', 'T-101'], ['dp', 'Blue Dart', 'T-102'], ['vasant', 'DTDC', 'T-103']].forEach(([k, carrier, tid], i) => { const o = S.orders.find((x) => x.id === ID[k]); const p = partyOf(S, o.partyId); const awb = String(71000000 + i * 3391) + '0' + (4410 + i); const sid = 'sh-' + NO[k].slice(-4); o.status = 'shipped'; o.shipmentId = sid; S.shipments.unshift({ id: sid, orderId: o.id, carrier, awb, status: 'in_transit', eta: iso(-2, 18, 0), from: 'Bhiwandi, MH', to: p.city, events: [{ at: iso(0, 13, 10 + i), text: 'Packed at Main Godown' }, { at: iso(0, 15, 30 + i), text: 'Picked up by ' + carrier }] }); say(S, tid, m(mid(), 'anuma', 'Order ' + NO[k] + ' dispatched via ' + carrier + '. AWB ' + awb + '.', iso(0, 15, 31 + i)), 0); log(S, iso(0, 15, 30 + i), 'Shiprocket', 'booked shipment', sid, 'handled', 'action', 'api'); }); act(S, iso(0, 15, 32), '3 shipments dispatched', '/fulfilment'); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'Anuma', subject: '3 orders dispatched', body: 'AWBs sent to Sharma, Digital Planet and Vasant on WhatsApp.', href: '/fulfilment' }], m: { orderValue: 0 } },
    { id: 's16', at: '18:00', actor: 'Anuma', title: 'End-of-day summary', desc: '3 orders, 4 vouchers attempted, 100% synced', route: '/dashboard',
      narr: 'The day closes: three dealers ordered, one needed Accounts, one needed a ledger fix, all three are in Tally and on trucks. The dashboard reflects every number you watched move.',
      apply(S) { act(S, iso(0, 18, 0), 'Day closed — 3 orders, all synced to Tally', '/dashboard'); refreshDash(S); },
      notifies: [{ tab: 'agent', from: 'Anuma', subject: 'Daily summary', body: '3 orders · 100% synced to Tally · 1 ledger mapping learned.', href: '/dashboard' }], m: { syncPct: 100, orderValue: 0 } },
  ];
  // orderValue series = today's confirmed value so far; derived by replaying the steps on a clone so it always matches the orders
  (function fillOrderValue() {
    const sim = JSON.parse(JSON.stringify(seed));
    const today = dayKey(iso(0, 12));
    steps.forEach((st) => {
      st.apply && st.apply(sim, {});
      if (st.m && 'orderValue' in st.m) st.m.orderValue = sim.orders.filter((o) => dayKey(o.placedAt) === today && Object.values(ID).includes(o.id)).reduce((s, o) => s + o.total, 0);
    });
  })();

  DM.defineUC(UC, {
    short: 'Stuffcool', tagline: 'B2B catalogue → Tally', icon: 'database', home: '/dashboard',
    about: 'Stuffcool sells phone accessories to ~118 dealers. The catalogue is published as a hosted stock sheet with Platinum/Gold/Silver price bands; dealers order on WhatsApp or the web, Anuma drafts orders, runs the credit check, and every confirmed order is posted into Tally as a Sales voucher. Play it to see a failed Tally sync get diagnosed and fixed.',
    charts: [
      { key: 'orderValue', title: 'Order value today', type: 'spark', fmt: 'inr', start: 0, wide: true, delta: true },
      { key: 'catalogLive', title: 'Catalogue items live', type: 'spark', fmt: 'num', start: 26 },
      { key: 'syncPct', title: 'Orders synced to Tally', type: 'spark', fmt: 'pct', start: 100 },
      { key: 'dealers', title: 'Dealers ordering today', type: 'spark', fmt: 'num', start: 0 },
    ],
    steps,
  });
  Object.entries(seed).forEach(([k, v]) => DM.data(UC, k, v));
  DM.stuffcoolFns = { refreshDash };
})();
