/* Use case: NewHome — WhatsApp orders → Coralio API. Seed data + 22-step scenario. See docs/CONTRACT.md */
(function () {
  const UC = 'newhome';
  const T0 = new Date('2026-10-27T10:18:00+05:30').getTime(); // scenario clock start
  const iso = (min) => new Date(T0 + min * 60000).toISOString();
  const hh = (min) => { const d = new Date(T0 + min * 60000 + 5.5 * 3600000); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); };
  const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h; };
  const pick = (arr, s) => arr[hash(s) % arr.length];
  const DAY = 1440;
  const FLOOR = 80, TIMER = 30;

  /* ───────── humans ───────── */
  const users = [
    { id: 'u-owner', name: 'Aarav Mehta', role: 'Owner', email: 'aarav@nuhome-demo.in', phone: '+91 98200 11001', status: 'active', last: iso(-12), modules: ['all'] },
    { id: 'u-pankaj', name: 'Pankaj Rane', role: 'ASM', email: 'pankaj@nuhome-demo.in', phone: '+91 98200 11002', status: 'active', last: iso(-5), modules: ['inbox', 'crm', 'orders', 'drafts'] },
    { id: 'u-sheetla', name: 'Sheetla Pandey', role: 'ASM', email: 'sheetla@nuhome-demo.in', phone: '+91 98250 11003', status: 'active', last: iso(-95), modules: ['inbox', 'crm', 'orders'] },
    { id: 'u-vineet', name: 'Vineet Shukla', role: 'ASM', email: 'vineet@nuhome-demo.in', phone: '+91 98390 11004', status: 'active', last: iso(-240), modules: ['inbox', 'crm', 'orders'] },
    { id: 'u-simran', name: 'Simran Kaur', role: 'ASM', email: 'simran@nuhome-demo.in', phone: '+91 98760 11005', status: 'active', last: iso(-60), modules: ['inbox', 'crm', 'orders'] },
    { id: 'u-krishna', name: 'Krishna Nair', role: 'ASM', email: 'krishna@nuhome-demo.in', phone: '+91 98470 11006', status: 'invited', last: null, modules: ['inbox', 'crm'] },
    { id: 'u-ankit', name: 'Ankit Kumar', role: 'Sales', email: 'ankit@nuhome-demo.in', phone: '+91 98210 11007', status: 'active', last: iso(-30), modules: ['inbox', 'crm', 'orders', 'products'] },
    { id: 'u-accounts', name: 'Meena Iyer', role: 'Accounts', email: 'meena@nuhome-demo.in', phone: '+91 98200 11008', status: 'active', last: iso(-150), modules: ['orders', 'drafts', 'reports'] },
  ];
  const OWNER_BY_REGION = { 'Mumbai Central': 'u-pankaj', 'Surat Gujarat': 'u-sheetla', 'Punjab · J&K · Chandigarh': 'u-simran', 'UP East': 'u-vineet', 'South India': 'u-krishna', 'Mumbai Western': 'u-ankit', 'Delhi NCR': 'u-ankit' };

  /* ───────── products ───────── */
  // [design, shade, quality, leaf, rate/m, widthCm, gsm, hex, nameOverride, idOverride, skuOverride]
  const PR = [
    ['4021', 'Beige', 'Jacquard', 4, 320, 137, 410, '#cdb99a'], ['4088', 'Ivory', 'Jacquard', 4, 340, 137, 360, '#efe6d2'],
    ['4033', 'Maroon', 'Jacquard', 4, 335, 137, 400, '#7b2d3a'], ['4047', 'Sage', 'Jacquard', 4, 330, 137, 395, '#a3b18a'],
    ['4056', 'Charcoal', 'Jacquard', 5, 345, 137, 420, '#3b3f45'], ['4061', 'Gold', 'Jacquard', 5, 355, 137, 415, '#c9a24a'],
    ['4102', 'Grey', 'Velvet', 7, 410, 140, 380, '#9aa0a6'], ['Leaf 12', 'Blue', 'Velvet', 12, 460, 140, 420, '#2f4f86', 'Blue Velvet leaf 12', 'p-velvet-blue-12', 'NH-VL12-BL'],
    ['Leaf 12', 'Emerald', 'Velvet', 12, 460, 140, 420, '#1f6f5c', 'Emerald Velvet leaf 12', 'p-velvet-emerald-12', 'NH-VL12-EM'], ['4110', 'Wine', 'Velvet', 8, 440, 140, 400, '#5b1f33'],
    ['4115', 'Navy', 'Velvet', 8, 450, 140, 405, '#1f2c4d'], ['4121', 'Mustard', 'Velvet', 9, 430, 140, 395, '#d4a017'],
    ['99302', '20', 'Polyester blend', 12, 290, 137, 360, '#b8a99a', 'Design 99302 Shade 20', 'p-99302-20', 'NH-99302-20'], ['99302', '21', 'Polyester blend', 12, 290, 137, 360, '#a89684', 'Design 99302 Shade 21', 'p-99302-21', 'NH-99302-21'],
    ['99305', '04', 'Polyester blend', 13, 275, 137, 340, '#8d7b68', 'Design 99305 Shade 04', 'p-99305-04', 'NH-99305-04'], ['99310', '11', 'Polyester blend', 13, 285, 137, 350, '#c7b8a1', 'Design 99310 Shade 11', 'p-99310-11', 'NH-99310-11'],
    ['2210', 'White', 'Sheer', 2, 180, 280, 60, '#f5f5f0'], ['2214', 'Cream', 'Sheer', 2, 185, 280, 62, '#f1e8d0'], ['2220', 'Grey', 'Sheer', 2, 190, 280, 64, '#d3d3d3'],
    ['3301', 'Charcoal', 'Blackout', 3, 260, 280, 280, '#33363b'], ['3305', 'Beige', 'Blackout', 3, 265, 280, 285, '#bfae94'], ['3312', 'Navy', 'Blackout', 3, 270, 280, 290, '#233050'],
    ['5501', 'Tan', 'Chenille', 15, 520, 140, 520, '#b08968'], ['5507', 'Olive', 'Chenille', 15, 540, 140, 530, '#6b705c'], ['5512', 'Rust', 'Chenille', 16, 560, 140, 540, '#a44a3f'],
    ['6101', 'Natural', 'Cotton canvas', 10, 210, 150, 300, '#e3d5b8'], ['6104', 'Indigo', 'Cotton canvas', 10, 225, 150, 310, '#3a4f7a'],
    ['7001', 'Natural', 'Linen blend', 11, 380, 140, 250, '#d8cbb0'], ['7004', 'Slate', 'Linen blend', 11, 390, 140, 255, '#6c757d'],
  ];
  const HSN = { Jacquard: '5407', Velvet: '5801', 'Polyester blend': '5407', Sheer: '5407', Blackout: '5903', Chenille: '5801', 'Cotton canvas': '5208', 'Linen blend': '5309' };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const products = PR.map((r, i) => {
    const [design, shade, quality, leaf, price, width, gsm, color, nm, idO, skuO] = r;
    const name = nm || `Design ${design} ${shade}`;
    const id = idO || `p-${slug(design)}-${slug(shade)}`;
    const sku = skuO || `NH-${design}-${String(shade).slice(0, 2).toUpperCase()}`;
    const stock = i === 8 ? 85 : i === 19 ? 120 : 220 + (hash(id) % 2900);
    return {
      id, sku, name, category: quality, brand: 'NuHome', unit: 'm', price, mrp: Math.round(price * 1.18), stock, hsn: HSN[quality], tax: 5, color,
      status: i === 26 ? 'draft' : 'active',
      attrs: { Design: design, Shade: shade, Width: width + ' cm', GSM: String(gsm), 'Leaf no': String(leaf), Quality: quality },
      variants: [
        { id: id + '-cut', label: 'Cut service (per m)', sku: sku + '-CUT', price, stock },
        { id: id + '-roll', label: 'Full roll (~50 m)', sku: sku + '-ROLL', price: Math.round(price * 0.97), stock: Math.floor(stock / 50) },
      ],
      priceBands: { A: Math.round(price * 0.9), B: Math.round(price * 0.93), C: Math.round(price * 0.96) },
    };
  });
  const prod = (id) => products.find((p) => p.id === id);
  const bandPct = (band) => (/Band A/.test(band) ? 10 : /Band B/.test(band) ? 7 : 4);
  const bandRate = (p, pct) => Math.round(p.price * (1 - pct / 100));

  /* ───────── parties & contacts ───────── */
  // [id, name, city, region, stateCode, type, terms, band]
  const PS = [
    ['curtain-decor-nx', 'Curtain Decor NX', 'Thane', 'Mumbai Central', '27', 'Retailer', '15/30', 'Band A · 10%'],
    ['vijay-handlooms', 'Vijay Handlooms', 'Kalyan', 'Mumbai Central', '27', 'Wholesaler', '15/30', 'Band A · 10%'],
    ['sanjay-home-decor', 'Sanjay Home Decor', 'Kalyan', 'Mumbai Central', '27', 'Retailer', '15/30', 'Band B · 7%'],
    ['pankaj-decor', 'Pankaj Decor', 'Nashik', 'Mumbai Central', '27', 'Retailer', '15/30', 'Band B · 7%'],
    ['lavish-living', 'Lavish Living', 'Thane', 'Mumbai Central', '27', 'Retailer', '15/30', 'Band B · 7%'],
    ['sai-home-decor', 'Sai Home Decor', 'Nashik', 'Mumbai Central', '27', 'Retailer', '15/30', 'Band C · 4%'],
    ['desire-sofa-mall', 'Desire Sofa Mall', 'Nashik', 'Mumbai Central', '27', 'Upholsterer', '15/30', 'Band B · 7%'],
    ['royal-sofa-mattress', 'Royal Sofa & Mattress', 'Valsad', 'Surat Gujarat', '24', 'Upholsterer', '15/30', 'Band B · 7%'],
    ['umiya-rexine', 'Umiya Rexine', 'Surat', 'Surat Gujarat', '24', 'Wholesaler', '15/30', 'Band A · 10%'],
    ['kalyan-furnishing', 'Kalyan Furnishing', 'Vadodara', 'Surat Gujarat', '24', 'Retailer', '15/30', 'Band C · 4%'],
    ['knox-kuchen', 'Knox Kuchen', 'Surat', 'Surat Gujarat', '24', 'Retailer', '15/30', 'Band B · 7%'],
    ['patidar-home-decor', 'Patidar Home Decor', 'Bilimora', 'Surat Gujarat', '24', 'Retailer', '15/30', 'Band C · 4%'],
    ['jain-furnishing', 'Jain Furnishing', 'Chandigarh', 'Punjab · J&K · Chandigarh', '04', 'Wholesaler', '30/45', 'Band A · 10%'],
    ['eternity-floors', 'Eternity Floors', 'Srinagar', 'Punjab · J&K · Chandigarh', '01', 'Retailer', '30/45', 'Band B · 7%'],
    ['klassic-furnishers', 'Klassic Furnishers', 'Jammu', 'Punjab · J&K · Chandigarh', '01', 'Retailer', '30/45', 'Band B · 7%'],
    ['bm-textiles', 'B.M. Textiles', 'Srinagar', 'Punjab · J&K · Chandigarh', '01', 'Wholesaler', '30/45', 'Band C · 4%'],
    ['prem-furnishing', 'Prem Furnishing', 'Lucknow', 'UP East', '09', 'Retailer', '15/30', 'Band B · 7%'],
    ['bbl-enterprises', 'BBL Enterprises Pvt. Ltd.', 'Lucknow', 'UP East', '09', 'Wholesaler', '15/30', 'Band A · 10%'],
    ['home-furnishing-kanpur', 'Home Furnishing Kanpur', 'Kanpur', 'UP East', '09', 'Retailer', '15/30', 'Band C · 4%'],
    ['parda-house', 'Parda House', 'Bahraich', 'UP East', '09', 'Retailer', '15/30', 'Band C · 4%'],
    ['desire-interiors', 'Desire Interiors', 'Lucknow', 'UP East', '09', 'Retailer', '15/30', 'Band B · 7%'],
    ['sunshine-trading', 'Sunshine Trading Co.', 'Chennai', 'South India', '33', 'Wholesaler', '15/30', 'Band A · 10%'],
    ['classic-furnishings', 'Classic Furnishings', 'Thrissur', 'South India', '32', 'Retailer', '15/30', 'Band B · 7%'],
    ['lucky-drapes', 'Lucky Drapes', 'Calicut', 'South India', '32', 'Retailer', '15/30', 'Band C · 4%'],
    ['tailor-tarif', 'Tailor Tarif', 'Andheri', 'Mumbai Western', '27', 'Tailor', '15/30', 'Band B · 7%'],
    ['mohan-furnishing', 'Mohan Furnishing', 'Andheri', 'Mumbai Western', '27', 'Retailer', '15/30', 'Band B · 7%'],
    ['comforts-delhi', 'Comforts New Delhi', 'New Delhi', 'Delhi NCR', '07', 'Retailer', '15/30', 'Band A · 10%'],
    ['shanker-furnishing', 'Shanker Furnishing', 'New Delhi', 'Delhi NCR', '07', 'Retailer', '15/30', 'Band C · 4%'],
  ];
  const FN = ['Mahesh', 'Pooja', 'Rakesh', 'Sunita', 'Imran', 'Deepak', 'Kavita', 'Suresh', 'Nitin', 'Farhan', 'Anita', 'Harish', 'Lalit', 'Jaspreet', 'Manpreet', 'Vikram', 'Ramesh', 'Sandeep', 'Neha', 'Arjun', 'Tarun', 'Kiran', 'Bharat', 'Salim', 'Dinesh'];
  const LN = ['Patil', 'Mehta', 'Shah', 'Khan', 'Desai', 'Gupta', 'Verma', 'Singh', 'Kaur', 'Nair', 'Menon', 'Pillai', 'Joshi', 'Sharma', 'Bhatt', 'Yadav', 'Tiwari', 'Iyer'];
  const phone = (s) => '+91 9' + String(hash(s)).padStart(9, '0').slice(0, 4) + ' ' + String(hash(s + 'x')).padStart(5, '0').slice(0, 5);
  const gstin = (p, st) => st + 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('').filter((_, i) => (hash(p) >> (i % 12)) & 1).slice(0, 5).join('').padEnd(5, 'K') + String(hash(p + 'g')).padStart(4, '0').slice(0, 4) + 'F1Z' + (hash(p) % 9 + 1);
  const parties = PS.map(([id, name, city, region, st, type, terms, band], i) => {
    const jr = id === 'curtain-decor-nx';
    const limit = jr ? 500000 : (2 + (hash(id) % 8)) * 100000;
    const out = jr ? 208400 : Math.round(limit * (0.15 + (hash(id + 'o') % 70) / 100) / 100) * 100;
    const over = id === 'prem-furnishing';
    return {
      id, name, city, region, type, owner: OWNER_BY_REGION[region], phone: jr ? '+91 99870 22019' : phone(id), email: id.split('-')[0] + '@' + slug(name).slice(0, 14) + '.in',
      gstin: gstin(id, st), terms, priceBand: band, creditLimit: limit, outstanding: over ? limit + 46200 : out,
      lastOrderAt: iso(-(jr ? 2 * DAY : (hash(id) % 40) * DAY + 600)), orders30d: jr ? 18 : (hash(id) % 14), lifetime: jr ? 3350000 : (3 + (hash(id) % 60)) * 100000,
      status: ['sai-home-decor', 'parda-house', 'bm-textiles'].includes(id) ? 'quiet' : over ? 'blocked' : 'active',
      tags: [type, ...(over ? ['Over credit limit'] : []), ...(['sai-home-decor', 'parda-house', 'bm-textiles'].includes(id) ? ['Quiet 30+ days'] : []), ...(limit >= 700000 ? ['High value'] : [])],
      overLimit: over,
    };
  });
  const party = (id) => parties.find((p) => p.id === id);
  const contacts = [];
  parties.forEach((p, i) => {
    const jr = p.id === 'curtain-decor-nx';
    const n1 = jr ? 'Mahesh Patil' : pick(FN, p.id) + ' ' + pick(LN, p.id + '1');
    contacts.push({ id: `c-${p.id}-1`, partyId: p.id, name: n1, role: 'Owner', phone: p.phone, email: n1.split(' ')[0].toLowerCase() + '@' + p.email.split('@')[1], primary: true });
    if (jr || i % 3 === 0) { const n2 = jr ? 'Pooja Mehta' : pick(FN, p.id + 'b') + ' ' + pick(LN, p.id + '2'); contacts.push({ id: `c-${p.id}-2`, partyId: p.id, name: n2, role: jr ? 'Accounts' : 'Accounts', phone: '+91 9' + String(hash(p.id + 'c')).padStart(9, '0').slice(0, 4) + ' ' + String(hash(p.id + 'd')).padStart(5, '0').slice(0, 5), email: n2.split(' ')[0].toLowerCase() + '.acc@' + p.email.split('@')[1], primary: false }); }
  });
  const contactOf = (pid) => contacts.find((c) => c.partyId === pid && c.primary);

  /* ───────── orders + Coralio log ───────── */
  const lineOf = (pid, qty, pct = 0) => { const p = prod(pid); return { productId: pid, name: p.name, qty, unit: 'm', price: bandRate(p, pct) }; };
  const mkLines = (partyId, specs) => { const pct = bandPct(party(partyId).priceBand); return specs.map(([pid, q]) => lineOf(pid, q, pct)); };
  const sum = (lines) => lines.reduce((a, l) => a + l.qty * l.price, 0);
  // [no, party, daysAgo(+hours via fraction), specs, status, payment, erpState, channel]
  const OS = [
    ['0899', 'vijay-handlooms', 0.05, [['p-4102-grey', 60], ['p-4021-beige', 40]], 'processing', 'Credit', 'synced', 'whatsapp'],
    ['0898', 'sanjay-home-decor', 0.12, [['p-4033-maroon', 80]], 'confirmed', 'Credit', 'pending', 'whatsapp'],
    ['0897', 'desire-sofa-mall', 0.2, [['p-5501-tan', 25], ['p-5507-olive', 25]], 'confirmed', 'Paid', 'synced', 'whatsapp'],
    ['0896', 'tailor-tarif', 1, [['p-4088-ivory', 30], ['p-2210-white', 100]], 'packed', 'Credit', 'synced', 'whatsapp'],
    ['0895', 'umiya-rexine', 1, [['p-99302-20', 150], ['p-99302-21', 100]], 'confirmed', 'Pending', 'failed', 'email'],
    ['0894', 'lavish-living', 1.2, [['p-4115-navy', 40]], 'packed', 'Credit', 'synced', 'whatsapp'],
    ['0893', 'jain-furnishing', 2, [['p-4056-charcoal', 120], ['p-4061-gold', 60], ['p-4047-sage', 60]], 'shipped', 'Credit', 'synced', 'web'],
    ['0892', 'bbl-enterprises', 2, [['p-3301-charcoal', 200], ['p-3312-navy', 150]], 'shipped', 'Credit', 'synced', 'email'],
    ['0891', 'sunshine-trading', 3, [['p-4110-wine', 90], ['p-4121-mustard', 70]], 'shipped', 'Paid', 'synced', 'whatsapp'],
    ['0890', 'mohan-furnishing', 3, [['p-2214-cream', 160]], 'delivered', 'Paid', 'synced', 'whatsapp'],
    ['0889', 'royal-sofa-mattress', 4, [['p-5512-rust', 45], ['p-5501-tan', 30]], 'delivered', 'Credit', 'synced', 'whatsapp'],
    ['0888', 'knox-kuchen', 5, [['p-6101-natural', 100], ['p-6104-indigo', 100]], 'delivered', 'Credit', 'synced', 'whatsapp'],
    ['0887', 'comforts-delhi', 5, [['p-7001-natural', 80], ['p-7004-slate', 80]], 'delivered', 'Paid', 'synced', 'web'],
    ['0886', 'classic-furnishings', 6, [['p-4033-maroon', 50], ['p-4088-ivory', 50]], 'delivered', 'Credit', 'synced', 'whatsapp'],
    ['0885', 'eternity-floors', 7, [['p-4102-grey', 70]], 'delivered', 'Credit', 'synced', 'email'],
    ['0884', 'curtain-decor-nx', 8, [['p-4021-beige', 90], ['p-4088-ivory', 60]], 'delivered', 'Credit', 'synced', 'whatsapp'],
    ['0883', 'pankaj-decor', 9, [['p-99305-04', 120]], 'delivered', 'Paid', 'synced', 'whatsapp'],
    ['0882', 'desire-interiors', 10, [['p-3305-beige', 140]], 'delivered', 'Credit', 'synced', 'whatsapp'],
    ['0881', 'klassic-furnishers', 11, [['p-4115-navy', 55], ['p-4056-charcoal', 40]], 'cancelled', 'Pending', 'failed', 'whatsapp'],
    ['0880', 'shanker-furnishing', 12, [['p-99310-11', 90]], 'delivered', 'Credit', 'synced', 'web'],
  ];
  const orders = [], erpLog = [];
  OS.forEach(([n, pid, ago, specs, status, pay, erpState, ch], i) => {
    const lines = mkLines(pid, specs), total = sum(lines), at = iso(-ago * DAY);
    const no = 'NX-2026-' + n, ref = 'CRL-SO-' + (48100 + (900 - +n));
    const err = erpState === 'failed' ? (status === 'cancelled' ? 'Order cancelled before posting' : '422 party credit hold in Coralio: outstanding exceeds limit') : undefined;
    orders.push({ id: 'o-' + n, no, partyId: pid, status, total, placedAt: at, channel: ch, payment: pay, lines, erp: { system: 'Coralio', ref: erpState === 'synced' ? ref : null, state: erpState, at: iso(-ago * DAY + 2), ...(err ? { error: err } : {}) }, threadId: i === 0 ? 't-1012' : undefined });
    const body = { external_ref: no, party_code: 'NH-' + pid.slice(0, 10).toUpperCase().replace(/-/g, ''), order_date: at.slice(0, 10), lines: lines.map((l) => ({ item_code: prod(l.productId).sku, uom: 'MTR', qty: l.qty, rate: l.price })) };
    if (erpState !== 'pending') erpLog.push({ id: 'erp-' + n, orderId: 'o-' + n, system: 'Coralio', direction: 'out', endpoint: 'https://api.coralio.example/v2/sales-orders', method: 'POST', status: erpState === 'synced' ? 201 : 422, ref: erpState === 'synced' ? ref : null, at: iso(-ago * DAY + 2), request: body, response: erpState === 'synced' ? { id: ref, status: 'BOOKED', doc_no: 'SO/26-27/' + (4100 + (900 - +n)), total: total } : { error: { code: 'VALIDATION_FAILED', message: err } }, state: erpState === 'synced' ? 'synced' : 'failed' });
  });

  /* ───────── shipments ───────── */
  const CARR = ['Delhivery', 'VRL Logistics', 'Gati', 'Safexpress', 'Blue Dart'];
  const shipments = orders.filter((o) => ['packed', 'shipped', 'delivered'].includes(o.status)).slice(0, 9).map((o, i) => {
    const st = o.status === 'packed' ? 'pending' : o.status === 'shipped' ? 'in_transit' : 'delivered';
    const p = party(o.partyId);
    return { id: 'sh-' + o.no.slice(-4), orderId: o.id, carrier: CARR[i % 5], awb: String(70000000000 + hash(o.id) % 9999999999), status: st, eta: iso(DAY * (st === 'delivered' ? -1 : 2) - i * 60), from: 'NuHome DC, Bhiwandi', to: p.city,
      events: [{ at: o.placedAt, text: 'Order booked in Coralio' }, { at: iso(-DAY * 1.5), text: 'Picked and packed at Bhiwandi DC' }, ...(st !== 'pending' ? [{ at: iso(-DAY), text: 'Handed to ' + CARR[i % 5] }] : []), ...(st === 'delivered' ? [{ at: iso(-DAY / 2), text: 'Delivered, signed by ' + (contactOf(o.partyId) || {}).name }] : [])] };
  });

  /* ───────── threads (seed) ───────── */
  const M = (id, from, text, min, type = 'text', meta) => ({ id, from, type, text, at: iso(min), ...(meta ? { meta } : {}) });
  const thr = (id, partyId, channel, owner, unread, status, preview, lastMin, messages, extra = {}) => ({ id, caseNo: +id.slice(2), partyId, contactId: (contactOf(partyId) || {}).id, channel, subject: extra.subject || '', owner, status, unread, preview, lastAt: iso(lastMin), priority: extra.priority || 'normal', messages, ...extra });
  const threads = [
    thr('t-1012', 'vijay-handlooms', 'whatsapp', 'anuma', 2, 'open', 'Bhai rate thoda kam karo', -22, [
      M('a1', 'customer', 'Design 4102 Grey ka rate batao, 60 meter', -80), M('a2', 'anuma', 'Design 4102 Grey, Velvet 140 cm. Aapka Band A rate ₹369 per m. 60 m = ₹22,140.', -78),
      M('a3', 'customer', 'Bhai rate thoda kam karo', -22),
      M('a4', 'customer', 'Pichli baar 355 pe diya tha', -21)], { orderId: 'o-0899', statusLabel: 'Open', statusTone: 'grey', slaMinutes: 365 }),
    thr('t-1011', 'sai-home-decor', 'whatsapp', 'anuma', 0, 'closed', 'Window missed, no reply in 24h', -DAY * 1.2, [
      M('b1', 'anuma', 'Namaste! NuHome order desk here. Naye designs ka catalogue bhejun?', -DAY * 2), M('b2', 'system', 'No reply for 24h. Case closed.', -DAY * 1.2, 'text', { tone: 'grey' })], { statusLabel: 'Closed', statusTone: 'grey' }),
    thr('t-1010', 'umiya-rexine', 'email', 'u-sheetla', 0, 'open', 'Re: PO 4417 — 99302 series 250 m', -300, [
      M('c1', 'customer', 'Please book 150 m of 99302 Shade 20 and 100 m of Shade 21 against PO 4417.', -DAY - 60), M('c2', 'anuma', 'Booked as draft DR-2026-0412. Posting to Coralio now.', -DAY - 55),
      M('c3', 'system', 'Coralio rejected NX-2026-0895: party credit hold. Handed to Sheetla.', -DAY - 50, 'text', { tone: 'red' }), M('c4', 'u-sheetla', 'Spoke to accounts, releasing after the part payment lands tomorrow.', -300),
      M('c5', 'customer', 'Payment of ₹60,000 sent via NEFT today. UTR 3320441187.', -295), M('c6', 'u-sheetla', 'Received, thank you. Will repost today.', -290)], { orderId: 'o-0895', subject: 'Re: PO 4417 — 99302 series 250 m', statusLabel: 'With Sheetla', statusTone: 'blue' }),
    thr('t-1013', 'prem-furnishing', 'whatsapp', 'u-vineet', 1, 'hold', 'Credit hold: ₹46,200 over limit', -150, [
      M('d1', 'customer', '100 m Design 4033 Maroon bhej do', -170), M('d2', 'anuma', 'Draft bana diya hai, par account limit ke upar hai. Vineet ji aapse baat karenge.', -168),
      M('d3', 'system', 'Credit hold: outstanding ₹5,46,200 against limit ₹5,00,000', -168, 'text', { tone: 'amber' }), M('d4', 'u-vineet', 'Prem ji, ₹50,000 ka payment aaj kar dijiye, order kal nikal dunga.', -150), M('d5', 'customer', 'Theek hai bhai, shaam tak karta hu', -140)], { draftId: 'd-3', statusLabel: 'Credit hold', statusTone: 'amber', priority: 'high' }),
    thr('t-1014', 'tailor-tarif', 'whatsapp', 'anuma', 1, 'open', 'Design 4088 Ivory mil gaya. Iska kitna meter?', -35, [
      M('e1', 'customer', 'Photo bheja hai', -62), M('e2', 'customer', '', -62, 'image', { swatch: '#efe6d2', caption: 'Label photo' }),
      M('e3', 'anuma', 'Design 4088 Ivory mil gaya, 94% match. Iska kitna meter?', -61, 'card', { type: 'match', productId: 'p-4088-ivory', name: 'Design 4088 Ivory', confidence: 94 }),
      M('e4', 'customer', '30 meter aur 2210 white 100 meter', -35)], { orderId: 'o-0896', statusLabel: 'Open', statusTone: 'grey' }),
    thr('t-1015', 'desire-sofa-mall', 'whatsapp', 'anuma', 0, 'open', 'Order NX-2026-0897 confirmed, Coralio ref pending', -48, [
      M('f1', 'customer', '', -75, 'voice', { seconds: 9, transcript: 'chenille tan 25 meter aur olive 25 meter' }),
      M('f2', 'anuma', 'Voice note sun liya: 5501 Tan 25 m, 5507 Olive 25 m. Confirm?', -74), M('f3', 'customer', 'Confirm', -70), M('f4', 'anuma', 'Order NX-2026-0897 confirm ho gaya. Payment ke baad dispatch.', -69)], { orderId: 'o-0897', statusLabel: 'Closed', statusTone: 'green' }),
    thr('t-1016', 'bbl-enterprises', 'email', 'u-vineet', 0, 'open', 'Quote request: blackout 350 m', -DAY * 0.5, [
      M('g1', 'customer', 'Need your best on Blackout 3301 Charcoal 200 m and 3312 Navy 150 m, delivery Lucknow.', -DAY * 0.7), M('g2', 'anuma', 'Quote QT-2026-0188 prepared at Band A: ₹1,00,350 ex-GST. Sending for Vineet to approve.', -DAY * 0.65), M('g3', 'u-vineet', 'Approved, sent.', -DAY * 0.5)], { subject: 'Quote request: blackout 350 m', statusLabel: 'With Vineet', statusTone: 'blue' }),
    thr('t-1017', 'sunshine-trading', 'whatsapp', 'u-krishna', 0, 'open', 'Dispatch ka update?', -DAY * 0.4, [M('h1', 'customer', 'NX-0891 dispatch ka update?', -DAY * 0.45), M('h2', 'anuma', 'VRL AWB 70123456789, kal Chennai pahunch jayega.', -DAY * 0.44), M('h3', 'customer', 'Ok dhanyavaad', -DAY * 0.4)], { orderId: 'o-0891' }),
    thr('t-1018', 'jain-furnishing', 'web', 'anuma', 3, 'open', 'Web form: new designs sample request', -18, [M('i1', 'customer', 'Please send swatch book for the 4100 velvet series to our Chandigarh showroom.', -20), M('i2', 'customer', 'Contact: Jaspreet, 98760 33221', -18)], { subject: 'Sample request', statusLabel: 'New', statusTone: 'grey' }),
    thr('t-1019', 'comforts-delhi', 'indiamart', 'u-ankit', 1, 'open', 'IndiaMART lead: linen blend 500 m', -95, [M('j1', 'customer', 'Looking for linen blend, 500 m monthly, Delhi. Share rate and sample.', -95)], { subject: 'IndiaMART enquiry', statusLabel: 'New', statusTone: 'grey' }),
    thr('t-1020', 'lucky-drapes', 'whatsapp', 'anuma', 0, 'closed', 'Order cancelled by customer', -DAY * 3, [M('k1', 'customer', '3305 beige 90 m', -DAY * 3 - 40), M('k2', 'anuma', 'Total 90 m, Confirm / Add more / Cancel?', -DAY * 3 - 38, 'card', { type: 'summary', total: 90 }), M('k3', 'customer', 'Cancel, rate mismatch', -DAY * 3)], { statusLabel: 'Cancelled', statusTone: 'red' }),
    thr('t-1021', 'knox-kuchen', 'whatsapp', 'u-sheetla', 0, 'open', 'Canvas samples dispatched', -DAY * 1.5, [M('l1', 'customer', 'Canvas 6101 aur 6104 ka sample bhejo', -DAY * 2), M('l2', 'u-sheetla', 'Courier se nikal diya, AWB aaj shaam tak.', -DAY * 1.5)]),
  ];

  /* ───────── deals / RFQs / quotes / drafts ───────── */
  const leads = [
    ['L-2041', 'Showroom refresh — velvet range', 'vijay-handlooms', 'Negotiation', 240000, 'u-pankaj', 'WhatsApp', 6], ['L-2040', 'BBL blackout bulk, Lucknow', 'bbl-enterprises', 'Quoted', 100350, 'u-vineet', 'Email', 3],
    ['L-2039', 'Hotel lobby chenille project', 'sunshine-trading', 'Qualified', 410000, 'u-krishna', 'IndiaMART', 12], ['L-2038', 'Monthly linen blend supply', 'comforts-delhi', 'New', 190000, 'u-ankit', 'IndiaMART', 2],
    ['L-2037', 'Swatch book + trial order', 'jain-furnishing', 'New', 65000, 'u-simran', 'Web form', 1], ['L-2036', 'Diwali stock — jacquard', 'curtain-decor-nx', 'Won', 95000, 'u-pankaj', 'WhatsApp', -3],
    ['L-2035', 'Upholstery chenille, Valsad', 'royal-sofa-mattress', 'Won', 76500, 'u-sheetla', 'WhatsApp', -6], ['L-2034', 'Sheer + blackout combo', 'mohan-furnishing', 'Negotiation', 88000, 'u-ankit', 'Email', 9],
    ['L-2033', '99302 series PO 4417', 'umiya-rexine', 'Won', 195000, 'u-sheetla', 'Email', -2], ['L-2032', 'Kerala wedding season velvets', 'classic-furnishings', 'Qualified', 132000, 'u-krishna', 'WhatsApp', 14],
    ['L-2031', 'Canvas samples + order', 'knox-kuchen', 'Quoted', 42000, 'u-sheetla', 'WhatsApp', 5], ['L-2030', 'Price dispute, lost to local mill', 'sai-home-decor', 'Lost', 38000, 'u-pankaj', 'WhatsApp', -9],
  ].map(([id, title, partyId, stage, value, owner, source, close]) => ({ id, title, partyId, stage, value, owner, source, createdAt: iso(-DAY * 6), closeAt: iso(DAY * close), notes: '' }));

  const rl = (specs) => specs.map(([text, pid, qty, conf], k) => { const p = pid && prod(pid); return { n: k + 1, text, productId: pid, name: p ? p.name : '', qty, unit: 'm', price: p ? p.price : 0, confidence: conf, state: !pid ? 'unmatched' : conf >= FLOOR ? 'matched' : 'review' }; });
  const rfqs = [
    ['RFQ-1101', 'bbl-enterprises', 'email', 'Blackout 350 m, Lucknow', 'quoted', -DAY * 0.7, 'u-vineet', rl([['Blackout charcoal 280cm — 200 mtr', 'p-3301-charcoal', 200, 96], ['Blackout navy — 150 mtr', 'p-3312-navy', 150, 93]])],
    ['RFQ-1102', 'comforts-delhi', 'portal', 'Linen blend 500 m monthly', 'new', -95, 'u-ankit', rl([['Linen blend natural 500 m', 'p-7001-natural', 300, 90], ['Linen slate', 'p-7004-slate', 200, 84]])],
    ['RFQ-1103', 'sunshine-trading', 'pdf', 'Hotel lobby chenille', 'review', -DAY, 'u-krishna', rl([['Chenille tan 140cm', 'p-5501-tan', 200, 91], ['Chenille rust', 'p-5512-rust', 150, 88], ['Olive 5507', 'p-5507-olive', 120, 95], ['Dark brown chenille (leaf ?)', null, 100, 31]])],
    ['RFQ-1104', 'mohan-furnishing', 'email', 'Sheer + blackout combo', 'quoted', -DAY * 2, 'u-ankit', rl([['Sheer white 2210 — 160 m', 'p-2210-white', 160, 97], ['Blackout beige 3305 — 100 m', 'p-3305-beige', 100, 95]])],
    ['RFQ-1105', 'classic-furnishings', 'whatsapp', 'Wedding season velvets', 'review', -DAY * 1.2, 'u-krishna', rl([['Wine velvet 4110, 80m', 'p-4110-wine', 80, 92], ['Mustard velvet', 'p-4121-mustard', 60, 79], ['Emerald velvet leaf 12', 'p-velvet-emerald-12', 40, 74]])],
    ['RFQ-1106', 'knox-kuchen', 'excel', 'Canvas bulk', 'won', -DAY * 4, 'u-sheetla', rl([['6101 natural canvas', 'p-6101-natural', 100, 99], ['6104 indigo canvas', 'p-6104-indigo', 100, 98]])],
    ['RFQ-1107', 'jain-furnishing', 'email', 'Jacquard assortment', 'lost', -DAY * 6, 'u-simran', rl([['4056 charcoal', 'p-4056-charcoal', 120, 97], ['4061 gold', 'p-4061-gold', 60, 96]])],
    ['RFQ-1108', 'eternity-floors', 'pdf', 'Srinagar showroom', 'new', -40, 'u-simran', rl([['Grey velvet 4102', 'p-4102-grey', 70, 94], ['Charcoal jacquard', 'p-4056-charcoal', 50, 71], ['Pashmina-look fabric (no code)', null, 30, 18]])],
  ].map(([no, pid, st, subject, status, rec, owner, lines]) => ({ id: no, no, partyId: pid, contactId: (contactOf(pid) || {}).id, source: { type: st, file: ['pdf', 'excel'].includes(st) ? slug(subject) + '.' + (st === 'pdf' ? 'pdf' : 'xlsx') : undefined }, receivedAt: iso(rec), due: iso(rec + DAY * 2), status, owner, subject, notes: '', total: lines.reduce((a, l) => a + l.qty * l.price, 0), lines }));

  const ql = (specs, pct) => specs.map(([pid, q, d]) => { const p = prod(pid); return { productId: pid, name: p.name, qty: q, unit: 'm', price: bandRate(p, pct), discPct: d || 0 }; });
  const quotes = [
    ['QT-2026-0188', 'RFQ-1101', 'bbl-enterprises', 'sent', [['p-3301-charcoal', 200], ['p-3312-navy', 150]], 10, 28, 'u-vineet'], ['QT-2026-0187', 'RFQ-1104', 'mohan-furnishing', 'accepted', [['p-2210-white', 160], ['p-3305-beige', 100]], 7, 24, 'u-ankit'],
    ['QT-2026-0186', null, 'vijay-handlooms', 'pending_approval', [['p-4102-grey', 120], ['p-4110-wine', 60], ['p-4115-navy', 60]], 10, 15, 'u-pankaj'], ['QT-2026-0185', 'RFQ-1106', 'knox-kuchen', 'accepted', [['p-6101-natural', 100], ['p-6104-indigo', 100]], 7, 26, 'u-sheetla'],
    ['QT-2026-0184', 'RFQ-1107', 'jain-furnishing', 'rejected', [['p-4056-charcoal', 120], ['p-4061-gold', 60]], 10, 21, 'u-simran'], ['QT-2026-0183', null, 'sunshine-trading', 'draft', [['p-5501-tan', 200], ['p-5512-rust', 150]], 10, 19, null],
    ['QT-2026-0182', null, 'comforts-delhi', 'sent', [['p-7001-natural', 300]], 10, 27, 'u-ankit'], ['QT-2026-0181', null, 'classic-furnishings', 'pending_approval', [['p-4110-wine', 80], ['p-4121-mustard', 60]], 7, 17, 'u-krishna'],
  ].map(([no, rfqId, pid, status, specs, pct, margin, approver], i) => { const lines = ql(specs, pct); return { id: no, no, rfqId, partyId: pid, status, total: sum(lines), marginPct: margin, validTill: iso(DAY * (7 - i)), createdAt: iso(-DAY * (i + 1) * 0.8), approver, lines, terms: '50% advance for Band C, otherwise ' + party(pid).terms + ' credit. Prices ex-GST (5%). Cut service charged at list.' }; });

  const dl = (partyId, specs, flagged) => mkLines(partyId, specs).map((l, k) => ({ ...l, state: flagged === k ? 'flagged' : 'confirmed' }));
  const drafts = [
    ['d-1', 'DR-2026-0414', 'vijay-handlooms', 't-1012', 'pending', 'Anuma', 'Rate negotiation pending on 4102 Grey', [['p-4102-grey', 60], ['p-4021-beige', 40]], -1],
    ['d-2', 'DR-2026-0413', 'tailor-tarif', 't-1014', 'pending', 'Anuma', 'Meters recorded for 4088 Ivory; sheer pending', [['p-4088-ivory', 30], ['p-2210-white', 100]], -1],
    ['d-3', 'DR-2026-0412b', 'prem-furnishing', 't-1013', 'pending', 'Anuma', 'Credit hold: ₹46,200 over limit, Vineet to release', [['p-4033-maroon', 100]], -1],
    ['d-4', 'DR-2026-0412', 'umiya-rexine', 't-1010', 'posted', 'Anuma', 'Posted to Coralio after payment', [['p-99302-20', 150], ['p-99302-21', 100]], -1],
    ['d-5', 'DR-2026-0411', 'sunshine-trading', null, 'approved', 'u-krishna', 'Approved, queued for Coralio', [['p-4110-wine', 90], ['p-4121-mustard', 70]], -1],
    ['d-6', 'DR-2026-0410', 'klassic-furnishers', null, 'rejected', 'u-simran', 'Customer cancelled', [['p-4115-navy', 55], ['p-4056-charcoal', 40]], -1],
  ].map(([id, no, pid, thread, status, by, note, specs, fl], i) => { const lines = dl(pid, specs, status === 'pending' && id !== 'd-2' ? 0 : -1); return { id, no, partyId: pid, threadId: thread, status, total: sum(lines), createdAt: iso(-60 - i * 90), by, note, lines }; });
  drafts[2].lines[0].state = 'flagged';

  /* ───────── campaigns, lists, templates ───────── */
  const lists = [
    { id: 'ls-1', name: 'Over credit limit', count: parties.filter((p) => p.overLimit).length, rule: 'outstanding > credit limit', updatedAt: iso(-60) },
    { id: 'ls-2', name: 'Quiet 30+ days', count: parties.filter((p) => p.status === 'quiet').length, rule: 'last order older than 30 days', updatedAt: iso(-60) },
    { id: 'ls-3', name: 'High value dealers', count: parties.filter((p) => p.tags.includes('High value')).length, rule: 'credit limit ≥ ₹7,00,000', updatedAt: iso(-DAY) },
    { id: 'ls-4', name: 'Mumbai Central dealers', count: parties.filter((p) => p.region === 'Mumbai Central').length, rule: 'region = Mumbai Central', updatedAt: iso(-DAY * 2) },
  ];
  const templates = [
    ['tp-1', 'order_confirm_v2', 'whatsapp', 'Utility', 'rejected', 'Order {{1}} confirmed. {{2}} items, {{3}} m. Dispatch after payment.'], ['tp-2', 'order_dispatched', 'whatsapp', 'Utility', 'approved', 'Your order {{1}} has left our Bhiwandi DC via {{2}}. AWB {{3}}.'],
    ['tp-3', 'catalogue_share', 'whatsapp', 'Marketing', 'approved', 'Namaste {{1}}! Our new {{2}} range is here. Reply with a swatch photo or design no to order.'], ['tp-4', 'payment_reminder', 'whatsapp', 'Utility', 'approved', 'Hi {{1}}, ₹{{2}} is due on {{3}}. Reply PAID once done.'],
    ['tp-5', 'welcome_dealer', 'whatsapp', 'Utility', 'approved', 'Namaste {{1}}! NuHome order desk here. Swatch photo bhejiye ya design aur shade batayiye.'], ['tp-6', 'restock_alert', 'whatsapp', 'Marketing', 'pending', '{{1}} is back in stock: {{2}} m available. Want me to reserve?'],
    ['tp-7', 'quote_cover', 'email', 'Quote', 'approved', 'Dear {{1}}, please find quote {{2}} attached. Valid till {{3}}.'], ['tp-8', 'statement_monthly', 'email', 'Statement', 'approved', 'Dear {{1}}, your account statement for {{2}} is attached.'],
  ].map(([id, name, channel, category, status, body]) => ({ id, name, channel, category, status, lang: 'en', body }));
  const campaigns = [
    ['cm-1', 'Diwali velvet range — dealers', 'whatsapp', 'sent', 'High value dealers', 'ls-3', 38, 37, 31, 14, 6, 'tp-3'], ['cm-2', 'New 4100 series launch', 'whatsapp', 'running', 'All dealers', null, 120, 112, 88, 21, 4, 'tp-3'],
    ['cm-3', 'Reorder nudge — quiet 30+ days', 'whatsapp', 'scheduled', 'Quiet 30+ days', 'ls-2', 0, 0, 0, 0, 0, 'tp-6'], ['cm-4', 'Credit statement reminders', 'email', 'sent', 'Over credit limit', 'ls-1', 12, 12, 9, 3, 2, 'tp-8'],
    ['cm-5', 'Mumbai Central restock alert', 'whatsapp', 'draft', 'Mumbai Central dealers', 'ls-4', 0, 0, 0, 0, 0, 'tp-6'],
  ].map(([id, name, channel, status, audience, listId, sent, delivered, read, replied, ords, templateId]) => ({ id, name, channel, status, audience, listId, sent, delivered, read, replied, orders: ords, createdAt: iso(-DAY * (Math.abs(hash(id)) % 12 + 1)), templateId }));

  /* ───────── agents ───────── */
  const ag = {
    id: 'whatsapp-order-desk', name: 'WhatsApp order desk', status: 'live', channelId: 'ch-wa',
    role: 'Takes swatch photos, text and voice notes from NuHome dealers on WhatsApp, reads the label, matches the catalogue, asks for meters, builds the draft order, hands to the ASM when it is not sure and posts confirmed orders to Coralio.',
    initialMessage: 'Namaste {party}! NuHome order desk here. Swatch label ka photo bhejiye, ya design aur shade batayiye. Main catalogue mein match karke order bana dunga.',
    rules: [
      { id: 'r1', kind: 'rule', scope: 'inherited', text: "Never quote a price below the party's price band." },
      { id: 'r2', kind: 'rule', scope: 'agent', text: 'Ask for meters per line before sending a summary.' },
      { id: 'r3', kind: 'guardrail', scope: 'inherited', text: 'Do not confirm an order for a party over its credit limit; hand to the ASM.' },
      { id: 'r4', kind: 'rule', scope: 'agent', text: 'Read SR no, Design, Shade, Width, GSM, quality and leaf no from every label photo.' },
      { id: 'r5', kind: 'rule', scope: 'agent', text: `When a match is below ${FLOOR}%, tell the customer you are checking, stop adding lines and hand to the ASM.` },
      { id: 'r6', kind: 'guardrail', scope: 'agent', text: "Reply in the customer's mix of Hindi and English, sentence case, no jargon." },
      { id: 'r7', kind: 'helper', scope: 'agent', text: 'Send the order summary as a numbered list with Confirm, Add more and Cancel buttons.' },
      { id: 'r8', kind: 'helper', scope: 'inherited', text: "Use the party's primary contact name in the welcome message." },
      { id: 'r9', kind: 'rule', scope: 'agent', text: 'After a confirmed order, post it to Coralio and tell the customer the booking reference.' },
    ],
    sources: [
      { id: 'src-1', type: 'document', title: 'NuHome catalogue Oct 2026.pdf', state: 'indexed', addedBy: 'Pankaj', addedAt: iso(-DAY * 12), usedIn: 41 },
      { id: 'src-2', type: 'link', title: 'nuhome-demo.in/collections/jacquard', state: 'indexed', addedBy: 'Aarav', addedAt: iso(-DAY * 6), usedIn: 12 },
      { id: 'src-3', type: 'chat', title: 'Chat with Vijay Handlooms, 3 Oct', state: 'indexed', addedBy: 'Pankaj', addedAt: iso(-DAY * 8), usedIn: 4 },
      { id: 'src-4', type: 'document', title: 'Price bands FY27.xlsx', state: 'pending', addedBy: 'Meena', addedAt: iso(-60), usedIn: 0 },
      { id: 'src-5', type: 'link', title: 'nuhome-demo.in/velvet-range', state: 'failed', addedBy: 'Aarav', addedAt: iso(-DAY * 2), usedIn: 0 },
    ],
    learned: [
      { id: 'lf-1', text: "Dealers write the leaf number as 'leaf 12 wala', not 'leaf no 12'.", at: iso(-DAY * 8) },
      { id: 'lf-2', text: 'Width on NuHome labels is centimetres; 54 inch on old labels equals 137 cm.', at: iso(-DAY * 12) },
      { id: 'lf-3', text: 'Band A parties get 10% off the list rate on cut service.', at: iso(-60) },
    ],
    gaps: [
      { id: 'gap-1', text: 'No source covers the 99302 series; two cases stalled on it this week.', count: 2 },
      { id: 'gap-2', text: 'Velvet range page failed to index; leaf numbers for velvets come only from chat.', count: 1 },
      { id: 'gap-3', text: 'Coralio item codes for velvets differ from NuHome SKUs (NH-VL12-BL vs NH-VLV-12-BL).', count: 1 },
    ],
    training: [
      { id: 'ts-3', at: iso(-DAY * 1.2), by: 'Pankaj', prompt: 'Ask for meters, not pieces. Fabric is sold by the meter.', added: ['Ask for meters per line before sending a summary.'], removed: ['Ask for quantity in pieces before sending a summary.'] },
      { id: 'ts-2', at: iso(-DAY * 4), by: 'Aarav', prompt: 'Always read the leaf number from the label, dealers quote it.', added: ['Read SR no, Design, Shade, Width, GSM, quality and leaf no from every label photo.'], removed: [] },
      { id: 'ts-1', at: iso(-DAY * 9), by: 'Meena', prompt: 'Welcome message should name the shop.', added: ["Use the party's primary contact name in the welcome message."], removed: [] },
    ],
    activity: [
      { id: 'ac-1', at: iso(-8), action: 'Matched image to Design 4088 Ivory at 94% for Tailor Tarif', outcome: 'handled', channel: 'whatsapp', caseId: 't-1014' },
      { id: 'ac-2', at: iso(-48), action: 'Confirmed order NX-2026-0897 for Desire Sofa Mall', outcome: 'handled', channel: 'whatsapp', caseId: 't-1015' },
      { id: 'ac-3', at: iso(-168), action: 'Credit hold on Prem Furnishing, handed to Vineet', outcome: 'escalated', channel: 'whatsapp', caseId: 't-1013' },
      { id: 'ac-4', at: iso(-DAY - 50), action: 'Coralio rejected NX-2026-0895, handed to Sheetla', outcome: 'escalated', channel: 'email', caseId: 't-1010' },
      { id: 'ac-5', at: iso(-DAY * 1.2), action: 'Window missed on case 1011, customer did not reply in 24h', outcome: 'validation', channel: 'whatsapp', caseId: 't-1011' },
      { id: 'ac-6', at: iso(-DAY * 1.3), action: 'Template order_confirm_v2 rejected by Meta, category mismatch', outcome: 'validation', channel: 'whatsapp', caseId: null },
      { id: 'ac-7', at: iso(-DAY * 3), action: 'Customer cancelled case 1020 on rate mismatch', outcome: 'handled', channel: 'whatsapp', caseId: 't-1020' },
    ],
    kpis: { handled: 142, autoRate: 71, escalated: 41, avgReplySec: 18 },
  };
  const agents = [
    ag,
    { id: 'voice-reception', name: 'Voice reception', status: 'paused', channelId: 'ch-voice', role: 'Answers the NuHome landline, takes the party name and the order in words, and opens a case on WhatsApp for the same number.', initialMessage: 'NuHome order desk here. Aap kaunsi shop se baat kar rahe hain?',
      rules: [{ id: 'v-r1', kind: 'rule', scope: 'inherited', text: "Never quote a price below the party's price band." }, { id: 'v-r2', kind: 'guardrail', scope: 'agent', text: 'Transfer to a person after two failed party lookups.' }, { id: 'v-r3', kind: 'helper', scope: 'agent', text: 'Repeat the design and meters back before ending the call.' }],
      sources: [{ id: 'v-src-1', type: 'document', title: 'NuHome catalogue Oct 2026.pdf', state: 'indexed', addedBy: 'Pankaj', addedAt: iso(-DAY * 12), usedIn: 6 }], learned: [], gaps: [{ id: 'v-gap-1', text: 'Callers name the town, not the party; no source maps town to party.', count: 3 }],
      training: [{ id: 'v-ts-1', at: iso(-DAY * 10), by: 'Aarav', prompt: 'Repeat the order back before hanging up.', added: ['Repeat the design and meters back before ending the call.'], removed: [] }],
      activity: [{ id: 'v-ac-1', at: iso(-DAY * 3), action: 'Paused by Aarav', outcome: 'handled', channel: 'voice', caseId: null }, { id: 'v-ac-2', at: iso(-DAY * 3.2), action: 'Call from Nashik, party not found twice, transferred', outcome: 'escalated', channel: 'voice', caseId: null }], kpis: { handled: 23, autoRate: 48, escalated: 12, avgReplySec: 6 } },
    { id: 'email-rfq-intake', name: 'Email RFQ intake', status: 'draft', channelId: 'ch-mail', role: 'Reads RFQ emails from institutional buyers, extracts the line items and opens a draft quote.', initialMessage: '',
      rules: [{ id: 'e-r1', kind: 'rule', scope: 'inherited', text: "Never quote a price below the party's price band." }, { id: 'e-r2', kind: 'guardrail', scope: 'inherited', text: 'Do not confirm an order for a party over its credit limit; hand to the ASM.' }], sources: [], learned: [], gaps: [], training: [], activity: [], kpis: { handled: 0, autoRate: 0, escalated: 0, avgReplySec: 0 } },
  ];

  /* ───────── workflows ───────── */
  const wf = (id, name, status, trigger, runs, lastMin, nodes, edges) => ({ id, name, status, trigger, runs, lastRun: iso(lastMin), nodes, edges });
  const workflows = [
    wf('wf-1', 'Confirmed order → post to Coralio', 'active', 'Order confirmed', 412, -48, [
      { id: 'n1', type: 'trigger', label: 'Order confirmed', detail: 'Any channel', x: 40, y: 150 }, { id: 'n2', type: 'action', label: 'Map items to Coralio codes', detail: 'SKU → item_code via item map', x: 280, y: 150 },
      { id: 'n3', type: 'action', label: 'POST /v2/sales-orders', detail: 'api.coralio.example, idempotency key = order no', x: 520, y: 150 }, { id: 'n4', type: 'condition', label: 'HTTP 2xx?', detail: '', x: 760, y: 150 },
      { id: 'n5', type: 'action', label: 'Send booking ref on WhatsApp', detail: 'Template order_dispatched', x: 1000, y: 70 }, { id: 'n6', type: 'delay', label: 'Wait 2 min, retry up to 3×', detail: 'Exponential backoff', x: 1000, y: 230 }, { id: 'n7', type: 'action', label: 'Notify ASM + Accounts', detail: 'Bell + WhatsApp', x: 1240, y: 230 }],
      [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5', label: 'Yes' }, { from: 'n4', to: 'n6', label: 'No' }, { from: 'n6', to: 'n7' }]),
    wf('wf-2', 'Low-confidence match → ASM review', 'active', `Match confidence < ${FLOOR}%`, 187, -168, [
      { id: 'n1', type: 'trigger', label: `Match below ${FLOOR}%`, detail: 'Any line on any case', x: 40, y: 130 }, { id: 'n2', type: 'action', label: 'Assign to ASM by region', detail: 'Party.owner', x: 280, y: 130 }, { id: 'n3', type: 'action', label: 'Notify ASM', detail: 'Bell + WhatsApp', x: 520, y: 130 },
      { id: 'n4', type: 'delay', label: `Wait ${TIMER} min`, detail: 'handoffTimerMin', x: 760, y: 130 }, { id: 'n5', type: 'condition', label: 'ASM replied?', detail: '', x: 1000, y: 130 }, { id: 'n6', type: 'action', label: 'Notify again, SLA red', detail: '', x: 1240, y: 130 }],
      [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' }, { from: 'n5', to: 'n6', label: 'No' }]),
    wf('wf-3', 'Credit hold on draft', 'active', 'Draft order created', 96, -168, [
      { id: 'n1', type: 'trigger', label: 'Draft order created', detail: '', x: 40, y: 120 }, { id: 'n2', type: 'condition', label: 'Outstanding + total > limit?', detail: 'Party credit limit', x: 280, y: 120 }, { id: 'n3', type: 'action', label: 'Hold draft, tell customer it is being checked', detail: '', x: 560, y: 60 }, { id: 'n4', type: 'action', label: 'Notify ASM (bell only)', detail: '', x: 820, y: 60 }],
      [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }, { from: 'n3', to: 'n4' }]),
    wf('wf-4', 'Quiet 30 days reorder nudge', 'paused', 'Every weekday 10:00', 24, -DAY * 5, [
      { id: 'n1', type: 'trigger', label: 'Schedule: weekdays 10:00', detail: 'IST', x: 40, y: 110 }, { id: 'n2', type: 'condition', label: 'Quiet 30+ days?', detail: 'List: Quiet 30+ days', x: 300, y: 110 }, { id: 'n3', type: 'action', label: 'Send restock_alert', detail: 'WhatsApp template', x: 560, y: 110 }],
      [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }]),
    wf('wf-5', 'Daily Coralio reconciliation', 'draft', 'Every day 23:00', 0, -DAY * 9, [
      { id: 'n1', type: 'trigger', label: 'Schedule: daily 23:00', detail: '', x: 40, y: 100 }, { id: 'n2', type: 'action', label: 'GET /v2/sales-orders?since=today', detail: 'Coralio', x: 300, y: 100 }, { id: 'n3', type: 'action', label: 'Write diff to Google Sheet', detail: 'Reconciliation sheet', x: 560, y: 100 }],
      [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }]),
  ];

  /* ───────── channels, apps ───────── */
  const channels = [
    { id: 'ch-wa', type: 'whatsapp', name: 'WhatsApp order desk', number: '+91 98200 98200', provider: '360dialog', state: 'connected', webhook: 'healthy', lastEvent: iso(-8) },
    { id: 'ch-mail', type: 'email', name: 'orders@nuhome-demo.in', number: 'orders@nuhome-demo.in', provider: 'Gmail', state: 'connected', webhook: 'healthy', lastEvent: iso(-DAY * 0.5) },
    { id: 'ch-im', type: 'indiamart', name: 'IndiaMART leads', number: 'GL-4471209', provider: 'IndiaMART', state: 'needs_reauth', webhook: 'failing', lastEvent: iso(-95) },
    { id: 'ch-web', type: 'web', name: 'nuhome-demo.in order form', number: 'nuhome-demo.in/order', provider: 'Web form', state: 'connected', webhook: 'healthy', lastEvent: iso(-18) },
    { id: 'ch-voice', type: 'telegram', name: 'Voice line (landline)', number: '+91 22 6366 7349', provider: 'Plivo', state: 'disconnected', webhook: 'failing', lastEvent: iso(-DAY * 3) },
  ];
  const app = (slug, name, desc, category, state, icon, extra = {}) => ({ slug, name, desc, category, state, icon, letter: name[0], ...extra });
  const apps = [
    app('coralio', 'Coralio', 'Textile ERP. Anuma posts confirmed orders as sales orders and reads the item master.', 'ERP', 'connected', '#0f766e', { account: 'nuhome-prod · api.coralio.example', lastSync: iso(-48), config: { baseUrl: 'https://api.coralio.example/v2', endpoint: 'POST /sales-orders', auth: 'Bearer ••••••••', idempotency: 'order no', retries: 3, itemMap: 'SKU → item_code', syncItems: true } }),
    app('tally', 'Tally Prime', 'Accounting. Sales vouchers via Tally connector.', 'Accounting', 'available', '#1d4ed8'), app('gsheets', 'Google Sheets', 'Export orders, reconcile stock and Coralio bookings.', 'Productivity', 'connected', '#16a34a', { account: 'ops@nuhome-demo.in', lastSync: iso(-DAY * 0.2) }),
    app('shopify', 'Shopify', 'Sync the D2C catalogue and online orders.', 'Commerce', 'available', '#65a30d'), app('gmail', 'Gmail', 'Read RFQ emails and send quotes.', 'Email', 'connected', '#dc2626', { account: 'orders@nuhome-demo.in', lastSync: iso(-30) }),
    app('indiamart', 'IndiaMART', 'Pull buy-leads into the inbox.', 'Marketplace', 'connected', '#ea580c', { account: 'GL-4471209', lastSync: iso(-95) }), app('shiprocket', 'Shiprocket', 'Create shipments and track AWBs.', 'Logistics', 'available', '#7c3aed'),
    app('delhivery', 'Delhivery', 'Pickup requests and tracking.', 'Logistics', 'connected', '#dc2626', { account: 'NUHOME-B2B', lastSync: iso(-DAY * 0.1) }), app('razorpay', 'Razorpay', 'Payment links in quotes and order summaries.', 'Payments', 'available', '#2563eb'),
    app('dialog360', '360dialog', 'WhatsApp Business API provider.', 'Messaging', 'connected', '#0d9488', { account: '+91 98200 98200', lastSync: iso(-8) }), app('plivo', 'Plivo', 'Voice and SMS.', 'Messaging', 'connected', '#059669', { account: 'PL-22093', lastSync: iso(-DAY * 3) }),
    app('slack', 'Slack', 'Post order and escalation alerts to a channel.', 'Collaboration', 'available', '#9333ea'), app('telegram', 'Telegram', 'Bot for ASMs to review hand-offs.', 'Messaging', 'available', '#0ea5e9'), app('zoho', 'Zoho Books', 'Invoices and GST filing.', 'Accounting', 'available', '#be123c'),
  ];

  /* ───────── logs, notifications, misc ───────── */
  const L = (m, actor, action, target, outcome, kind, channel) => ({ id: 'lg-' + Math.abs(hash(m + action)), at: iso(-m), actor, action, target, outcome, kind, channel });
  const logs = [
    [8, 'Anuma', 'Matched image to Design 4088 Ivory (94%)', 'Case 1014', 'handled', 'action', 'whatsapp'], [35, 'Anuma', 'Asked for meters on Design 4088 Ivory', 'Case 1014', 'handled', 'action', 'whatsapp'], [48, 'Anuma', 'Posted NX-2026-0897 to Coralio, ref CRL-SO-48103', 'Order NX-2026-0897', 'synced', 'action', 'api'],
    [69, 'Anuma', 'Confirmed order NX-2026-0897', 'Case 1015', 'handled', 'action', 'whatsapp'], [74, 'Anuma', 'Transcribed voice note (9s)', 'Case 1015', 'handled', 'action', 'whatsapp'], [95, 'Anuma', 'IndiaMART lead imported', 'Comforts New Delhi', 'handled', 'action', 'indiamart'],
    [95, 'System', 'IndiaMART key expired, re-auth needed', 'Channel IndiaMART', 'failed', 'alert', 'indiamart'], [140, 'Prem Furnishing', 'Replied: payment by evening', 'Case 1013', 'info', 'action', 'whatsapp'], [150, 'Vineet Shukla', 'Replied on credit hold', 'Case 1013', 'handled', 'action', 'whatsapp'],
    [168, 'Anuma', 'Credit hold: ₹5,46,200 vs limit ₹5,00,000', 'Draft DR-2026-0412b', 'escalated', 'validation', 'whatsapp'], [168, 'Anuma', 'Handed case 1013 to Vineet', 'Case 1013', 'escalated', 'action', 'whatsapp'], [290, 'Sheetla Pandey', 'Reposted NX-2026-0895 to Coralio', 'Order NX-2026-0895', 'failed', 'action', 'api'],
    [300, 'System', 'Coralio 422: party credit hold', 'Order NX-2026-0895', 'failed', 'alert', 'api'], [DAY * 0.5, 'Vineet Shukla', 'Approved quote QT-2026-0188', 'Quote QT-2026-0188', 'handled', 'action', 'email'], [DAY * 0.7, 'Anuma', 'Parsed RFQ email into 2 lines', 'RFQ-1101', 'handled', 'action', 'email'],
    [DAY, 'Anuma', 'Parsed PDF into 4 lines, 1 unmatched', 'RFQ-1103', 'escalated', 'validation', 'email'], [DAY * 1.2, 'System', 'Case closed after 24h without reply', 'Case 1011', 'expired', 'validation', 'whatsapp'], [DAY * 1.3, 'System', 'Template order_confirm_v2 rejected by Meta', 'Template', 'failed', 'alert', 'whatsapp'],
    [DAY * 1.5, 'Sheetla Pandey', 'Dispatched canvas samples', 'Case 1021', 'handled', 'action', 'whatsapp'], [DAY * 2, 'Aarav Mehta', 'Edited rule: ask for meters', 'Agent WhatsApp order desk', 'handled', 'action', 'app'], [DAY * 2.2, 'Anuma', 'Posted NX-2026-0896 to Coralio', 'Order NX-2026-0896', 'synced', 'action', 'api'],
    [DAY * 3, 'Aarav Mehta', 'Paused agent Voice reception', 'Agent', 'handled', 'action', 'app'], [DAY * 3, 'Anuma', 'Cancelled by customer: rate mismatch', 'Case 1020', 'handled', 'action', 'whatsapp'], [DAY * 4, 'Meena Iyer', 'Uploaded Price bands FY27.xlsx', 'Agent source', 'pending', 'action', 'app'],
    [DAY * 5, 'System', 'Workflow Quiet 30 days paused', 'Workflow', 'handled', 'action', 'app'], [DAY * 6, 'Anuma', 'Synced item master from Coralio (29 items)', 'App Coralio', 'synced', 'action', 'api'], [DAY * 8, 'Pankaj Rane', 'Added chat as source', 'Agent source', 'handled', 'action', 'app'],
  ].map((a) => L(...a));
  const notifications = [
    { id: 'nt-1', tab: 'human', from: 'Anuma', subject: 'Credit hold on Prem Furnishing', body: 'Draft DR-2026-0412b is ₹46,200 over the credit limit. Needs a release.', href: '/orders/drafts/d-3', at: iso(-168), unread: false },
    { id: 'nt-2', tab: 'agent', from: 'Anuma', subject: 'Template order_confirm_v2 rejected', body: 'Meta flagged a category mismatch. Edit and resubmit.', href: '/campaigns', at: iso(-DAY * 1.3), unread: false },
    { id: 'nt-3', tab: 'human', from: 'Coralio', subject: 'NX-2026-0895 not posted', body: 'Party credit hold in Coralio. Repost after payment clears.', href: '/orders/o-0895', at: iso(-300), unread: false },
  ];
  const rulebook = ag.rules.filter((r) => r.scope === 'inherited').concat([
    { id: 'rb-5', kind: 'rule', scope: 'inherited', text: 'Fabric is sold by the meter; always confirm quantity in meters.' }, { id: 'rb-6', kind: 'guardrail', scope: 'inherited', text: 'Never share another dealer’s price band or outstanding.' },
    { id: 'rb-7', kind: 'helper', scope: 'inherited', text: 'Quote ex-GST and mention 5% GST separately.' }, { id: 'rb-8', kind: 'rule', scope: 'inherited', text: 'Orders above ₹5,00,000 need owner approval before posting to Coralio.' }, { id: 'rb-9', kind: 'guardrail', scope: 'inherited', text: 'Dispatch only after payment for Band C dealers; credit terms apply to Band A and B.' },
  ]).map((r, i) => ({ id: 'rb-' + (i + 1), kind: r.kind, scope: r.scope, text: r.text, enabled: i !== 6 }));
  const rateCard = [['Jacquard', 12, 10, 150000], ['Velvet', 14, 8, 150000], ['Polyester blend', 9, 12, 100000], ['Sheer & blackout', 11, 10, 100000], ['Chenille & upholstery', 15, 6, 200000]].map(([category, min, max, ap], i) => ({ id: 'rc-' + i, category, minMarginPct: min, maxDiscPct: max, approvalAbove: ap }));
  const company = { name: 'Demo Merchant User', legal: 'NuHome Decor Pvt. Ltd.', gstin: '27AABCN4471K1Z6', address: 'Gala 14, Anjur Phata Industrial Estate, Bhiwandi', city: 'Bhiwandi, Maharashtra 421302', phone: '+91 98200 98200', email: 'orders@nuhome-demo.in', website: 'nuhome-demo.in', industry: 'Home furnishing fabrics', currency: 'INR', logoColor: '#7b2d3a' };
  const usage = { plan: 'Growth', period: 'Oct 2026', items: [{ label: 'WhatsApp conversations', used: 1840, limit: 3000 }, { label: 'Label & voice reads', used: 612, limit: 1500 }, { label: 'Orders posted to ERP', used: 118, limit: 500 }, { label: 'Agents', used: 3, limit: 5 }, { label: 'Humans', used: 8, limit: 10 }] };

  const todayTotal = orders.filter((o) => Date.parse(o.placedAt) > T0 - DAY * 0.4).reduce((a, o) => a + o.total, 0);
  const dash = {
    kpis: [
      { key: 'orders', label: 'Order value today', value: todayTotal, delta: 12, fmt: 'inr' }, { key: 'auto', label: 'Auto-resolved', value: 71, delta: 3, fmt: 'pct' }, { key: 'handle', label: 'Avg handling time', value: 6, delta: -8, fmt: 'min' },
      { key: 'posts', label: 'Coralio posts today', value: 18, delta: 5, fmt: 'num' }, { key: 'open', label: 'Open cases', value: threads.filter((t) => t.status === 'open').length, delta: 0, fmt: 'num' }, { key: 'handoffs', label: 'Hand-offs to ASM', value: 4, delta: 1, fmt: 'num' },
    ],
    revenue: [['Oct 14', 286], ['15', 352], ['16', 310], ['17', 398], ['18', 244], ['19', 187], ['20', 421], ['21', 465], ['22', 389], ['23', 512], ['24', 447], ['25', 301], ['26', 358], ['27', Math.round(todayTotal / 1000)]].map(([l, v]) => ({ l, v: v * 1000 })),
    funnel: [{ l: 'WhatsApp cases', v: 142 }, { l: 'Draft orders', v: 121 }, { l: 'Confirmed', v: 104 }, { l: 'Posted to Coralio', v: 99 }],
    topParties: parties.slice().sort((a, b) => b.lifetime - a.lifetime).slice(0, 6).map((p) => ({ l: p.name, v: p.lifetime })),
    alerts: [{ id: 'al-1', text: 'Coralio rejected NX-2026-0895 (credit hold)', tone: 'red', href: '/orders/o-0895' }, { id: 'al-2', text: 'IndiaMART key needs re-auth', tone: 'amber', href: '/settings/channels' }, { id: 'al-3', text: 'Template order_confirm_v2 rejected by Meta', tone: 'amber', href: '/campaigns' }],
    activity: [{ at: iso(-8), text: 'Anuma matched Design 4088 Ivory for Tailor Tarif', href: '/inbox/threads?case=t-1014' }, { at: iso(-48), text: 'NX-2026-0897 confirmed for Desire Sofa Mall', href: '/orders/o-0897' }, { at: iso(-168), text: 'Credit hold on Prem Furnishing', href: '/orders/drafts/d-3' }],
  };

  /* ───────── scenario: dealer WhatsApp order → Coralio ───────── */
  const JP = 'curtain-decor-nx', JT = 't-1001', JD = 'd-nx-0911', JO = 'o-nx-0911', JNO = 'NX-2026-0911', JREF = 'CRL-SO-48213';
  const BAND = bandPct('Band A · 10%');
  const jl = (n, pid, qty, state, note) => { const p = prod(pid); return { n, productId: pid, name: p.name, qty, unit: 'm', price: bandRate(p, BAND), state, ...(note ? { note } : {}) }; };
  const L1p = jl(1, 'p-4021-beige', null, 'pending'), L1d = jl(1, 'p-4021-beige', 45, 'pending', 'Recorded');
  const L2f = { n: 2, productId: null, name: 'Image 2, awaiting a person', qty: null, unit: 'm', price: 0, state: 'flagged' }, L2p = jl(2, 'p-4088-ivory', null, 'pending'), L2d = jl(2, 'p-4088-ivory', 30, 'pending', 'Recorded');
  const L3f = { n: 3, productId: null, name: 'Voice note, awaiting a person', qty: 20, unit: 'm', price: 0, state: 'flagged' }, L3d = jl(3, 'p-velvet-blue-12', 20, 'pending', 'Recorded');
  const prop = (ls) => ls.map((l) => ({ ...l, note: 'Proposed' })), conf = (ls) => ls.map((l) => ({ ...l, state: 'confirmed', note: undefined }));
  const J_TOTAL = (ls) => ls.reduce((a, l) => a + (l.qty || 0) * l.price, 0);
  const CONFIRMED = conf([L1d, L2d, L3d]);
  const ORDER_VALUE = J_TOTAL(CONFIRMED);
  const RES_READ1 = [['SR no', '41'], ['Design', '4021'], ['Shade', 'Beige'], ['Width', '137 cm'], ['GSM', '410'], ['Quality', 'Jacquard']];
  const RES_READ2 = [['SR no', '61'], ['Design', '4090'], ['Shade', 'Ivory'], ['Width', '137 cm'], ['GSM', '360'], ['Leaf no', '12']];
  const THREAD_ROUTE = '/inbox/threads?case=' + JT;

  const getThread = (S) => {
    let th = S.threads.find((t) => t.id === JT);
    if (!th) { th = { id: JT, caseNo: 1001, partyId: JP, contactId: 'c-curtain-decor-nx-1', channel: 'whatsapp', subject: '', owner: 'anuma', status: 'open', unread: 0, preview: '', lastAt: iso(0), priority: 'high', messages: [], statusLabel: 'New', statusTone: 'grey', slaMinutes: 485, note: 'Opened now, owner Anuma' }; S.threads.unshift(th); }
    return th;
  };
  const getDraft = (S) => {
    let d = S.drafts.find((x) => x.id === JD);
    if (!d) { d = { id: JD, no: 'DR-2026-0415', partyId: JP, threadId: JT, status: 'pending', total: 0, createdAt: iso(4), by: 'Anuma', note: 'Draft from WhatsApp case 1001', lines: [] }; S.drafts.unshift(d); getThread(S).draftId = JD; }
    return d;
  };
  const setLines = (S, lines) => { const d = getDraft(S); d.lines = lines.map((l) => ({ ...l })); d.total = J_TOTAL(lines); };
  const kpi = (S, key, val) => { const k = S.dash.kpis.find((x) => x.key === key); if (k) k.value = val; };
  const logIt = (S, t, actor, action, target, outcome, kind = 'action', channel = 'whatsapp', caseId = JT) => {
    S.logs.unshift({ id: 'lg-s' + S.logs.length + '-' + t, at: iso(t), actor, action, target, outcome, kind, channel });
    if (actor === 'Anuma') S.agents[0].activity.unshift({ id: 'ac-s' + S.agents[0].activity.length + '-' + t, at: iso(t), action, outcome: outcome === 'escalated' ? 'escalated' : kind === 'validation' ? 'validation' : 'handled', channel, caseId });
    S.dash.activity.unshift({ at: iso(t), text: action, href: caseId ? '/inbox/threads?case=' + caseId : '/dashboard' });
  };
  const sys = (id, text, tone) => ({ id, from: 'system', type: 'text', text, meta: { tone } });
  const card = (id, from, meta, text = '') => ({ id, from, type: 'card', text, meta });
  const txt = (id, from, text) => ({ id, from, type: 'text', text });

  // Build a scenario step. o: { t, actor, title, desc, narr, route, msgs, thread:{owner,label,tone,unread,note,sla,status}, lines, m, notifies, extra(S) }
  let sIdx = 0;
  const step = (o) => {
    const n = ++sIdx;
    return {
      id: 'nh-' + String(n).padStart(2, '0'), at: hh(o.t), actor: o.actor, title: o.title, desc: o.desc, narr: o.narr, route: o.route === undefined ? THREAD_ROUTE : o.route,
      notifies: (o.notifies || []).map((x) => ({ ...x, when: hh(o.t), at: iso(o.t) })), m: o.m,
      apply(S) {
        const th = getThread(S);
        (o.msgs || []).forEach((mm, k) => {
          if (mm.resolves) { const rv = th.messages.find((x) => x.meta && x.meta.reviewId === mm.resolves); if (rv) rv.meta.resolved = mm.resolution; th.messages.push(card(mm.id, 'u-pankaj', { type: 'resolution', ...mm.resolution, reviewId: mm.resolves }, mm.text)); return; }
          th.messages.push(JSON.parse(JSON.stringify({ ...mm, at: iso(o.t) })));
        });
        const T = o.thread || {};
        if (T.owner) th.owner = T.owner; if (T.label) { th.statusLabel = T.label; th.statusTone = T.tone || 'grey'; } if (T.unread != null) th.unread = T.unread; if (T.note) th.note = T.note; if (T.sla) th.slaTone = T.sla; if (T.status) th.status = T.status;
        const last = [...th.messages].reverse().find((x) => x.from !== 'system' && (x.type === 'text' || x.type === 'image' || x.type === 'voice'));
        if (last) th.preview = last.type === 'image' ? '📷 Photo' : last.type === 'voice' ? '🎤 Voice note' : last.text;
        th.lastAt = iso(o.t);
        if (o.lines) setLines(S, o.lines);
        if (o.extra) o.extra(S, th);
      },
    };
  };

  const steps = [
    step({ t: 0, actor: 'System', title: 'Dealer messages the order desk', desc: 'Inbound WhatsApp opens case 1001; phone matches Curtain Decor NX.', narr: 'Mahesh Patil of Curtain Decor NX writes to the WhatsApp order desk. Anuma matches the phone number to the party list (Band A, Mumbai Central, ASM Pankaj Rane) and opens case 1001.',
      msgs: [txt('j1', 'customer', 'Namaste, order dena hai'), sys('j2', 'Case 1001 opened', 'grey'), sys('j3', 'Matched to Curtain Decor NX · Mahesh Patil (primary person)', 'green')], thread: { label: 'New', tone: 'grey', unread: 1, note: 'Matched to the party by phone' }, m: { auto: 71, handle: 6 },
      extra: (S) => { kpi(S, 'open', S.threads.filter((t) => t.status === 'open').length); } }),
    step({ t: 1, actor: 'Anuma', title: 'Welcome in Hindi + English', desc: 'Anuma greets by name and asks for a label photo.', narr: 'Anuma replies in the dealer\'s own mix of Hindi and English, using the welcome script from the order desk agent.',
      msgs: [txt('j4', 'anuma', 'Namaste Mahesh ji! NuHome order desk here. Swatch label ka photo bhejiye, ya design aur shade batayiye. Main catalogue mein match karke order bana dunga.')], thread: { label: 'Open', tone: 'grey', unread: 0 }, m: { auto: 71 } }),
    step({ t: 3, actor: 'Customer', title: 'Two swatch photos arrive', desc: 'Text, then two label photos.', narr: 'The dealer sends two photos of fabric labels from his shelf. This is how most NuHome orders start: no part numbers, just a picture.',
      msgs: [txt('j5', 'customer', '2 designs bhejta hu'), { id: 'j6', from: 'customer', type: 'image', text: '', meta: { swatch: '#cdb99a', caption: 'Image 1' } }, { id: 'j7', from: 'customer', type: 'image', text: '', meta: { swatch: '#f1e9d8', caption: 'Image 2' } }], thread: { unread: 3, label: 'Open', tone: 'grey' }, m: { handle: 6 } }),
    step({ t: 3, actor: 'Anuma', title: 'Anuma reads both labels', desc: 'OCR of SR no, design, shade, width, GSM, quality, leaf no.', narr: 'Anuma reads every printed field off both labels. Nothing is guessed yet: these are the raw reads that the catalogue match will use.',
      msgs: [txt('j8', 'anuma', 'I can see 2 images, give me a few seconds to process them.'), card('j9', 'anuma', { type: 'read', title: 'Image 1, what Anuma read', fields: RES_READ1, swatch: '#cdb99a' }), card('j10', 'anuma', { type: 'read', title: 'Image 2, what Anuma read', fields: RES_READ2, swatch: '#f1e9d8' })], thread: { unread: 0, label: 'Reading', tone: 'grey' }, m: { handle: 5 },
      notifies: [{ tab: 'agent', from: 'Anuma', subject: 'Reading 2 label photos on case 1001', body: 'Curtain Decor NX sent two swatch photos.', href: THREAD_ROUTE }] }),
    step({ t: 4, actor: 'Anuma', title: 'Draft started, image 1 matched at 94%', desc: 'Design 4021 Beige clears the 80% floor; meters asked.', narr: `Anuma starts a draft order and matches image 1 to Design 4021 Beige at 94%, above the ${FLOOR}% confidence floor. It asks for the meters.`, route: THREAD_ROUTE,
      msgs: [sys('j11', 'Draft order started', 'grey'), card('j12', 'anuma', { type: 'match', productId: 'p-4021-beige', name: 'Design 4021 Beige', confidence: 94, tone: 'green' }, `94% confidence match, above the ${FLOOR}% floor`), txt('j13', 'anuma', 'Image 1: Design 4021 Shade Beige, 137 cm, match ho gaya. Kitne meter chahiye?')], thread: { label: 'Draft', tone: 'grey' }, lines: [L1p], m: { auto: 71, handle: 5 } }),
    step({ t: 5, actor: 'Anuma', title: 'Image 2 only 62%: stop', desc: 'Label reads Design 4090, catalogue has no 4090. No line added.', narr: `Image 2's best match is Design 4088 Ivory at 62%, below the ${FLOOR}% floor. Anuma does not add the line. It stops, rather than guess a fabric the dealer will receive.`,
      msgs: [card('j14', 'anuma', { type: 'match', productId: 'p-4088-ivory', name: 'Design 4088 Ivory', confidence: 62, tone: 'amber' }, `62% best match, below the ${FLOOR}% floor. Stopped.`)], thread: { label: 'Flagged', tone: 'amber' }, lines: [L1p, L2f], m: { auto: 69 } }),
    step({ t: 5, actor: 'Anuma', title: 'Hand-off to Pankaj (HITL)', desc: 'Review card with photo, reads, best match and why it stopped.', narr: 'Anuma tells the dealer it is checking and hands the case to ASM Pankaj Rane. Pankaj gets a bell and WhatsApp alert and a review card with the photo, what Anuma read and why it stopped.',
      msgs: [txt('j15', 'anuma', 'Ek design check karke batata hu, thoda time lagega.'), card('j16', 'anuma', { type: 'review', reviewId: 'review-1', swatch: '#f1e9d8', read: RES_READ2, best: { productId: 'p-4088-ivory', name: 'Design 4088 Ivory', confidence: 62 }, why: `Why it stopped: best match is 62%, floor is ${FLOOR}%. Label reads Design 4090, the catalogue has no 4090.` }), sys('j17', 'Anuma handed this case to Pankaj', 'blue'), sys('j18', 'Pankaj notified · app and WhatsApp', 'grey')],
      thread: { owner: 'u-pankaj', label: 'With Pankaj', tone: 'blue', note: `Pankaj since ${hh(5)}, re-notify in ${TIMER} min` }, m: { auto: 67, handle: 8 },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Curtain Decor NX needs you on case 1001', body: `Image 2 matched at 62%, below the ${FLOOR}% floor. Label reads SR no 61, Design 4090, Shade Ivory. Mahesh Patil is waiting.`, href: THREAD_ROUTE }],
      extra: (S) => { logIt(S, 5, 'Anuma', 'Handed case 1001 to Pankaj (match 62% below floor)', 'Case 1001', 'escalated', 'action'); kpi(S, 'handoffs', 5); } }),
    step({ t: 8, actor: 'Customer', title: 'Meters for image 1 recorded', desc: 'Anuma records 45 m inside its own lane while Pankaj is away.', narr: 'The dealer is still typing. Anuma stays inside its lane: it records 45 m on line 1 (a matched line) but adds nothing for the flagged image.',
      msgs: [txt('j19', 'customer', 'Image 1 ka 45 meter'), sys('j20', 'Line 1: 45 m recorded', 'green')], thread: { unread: 1 }, lines: [L1d, L2f], m: { handle: 8 } }),
    step({ t: 8 + TIMER, actor: 'System', title: `${TIMER} min, Pankaj hasn't replied`, desc: 'Timer fires: notify again, SLA clock turns red.', narr: `Pankaj has not replied for ${TIMER} minutes (the handoff timer in the order desk's escalation policy). Anuma notifies him again and the SLA clock on the case goes red.`, route: '/notifications',
      msgs: [sys('j21', `No reply from Pankaj for ${TIMER} min. Notified again.`, 'red')], thread: { sla: 'red', note: `Re-notified at +${TIMER} min, still with Pankaj` }, m: { auto: 64, handle: 13 },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Still waiting on you: Curtain Decor NX, image 2', body: `No reply for ${TIMER} min. Mahesh Patil is still waiting on image 2.`, href: THREAD_ROUTE }] }),
    step({ t: 10 + TIMER, actor: 'Pankaj', title: 'Pankaj finds the design', desc: 'Finds Design 4088 Ivory in the catalogue and tells the dealer.', narr: 'Pankaj opens the review card, searches the catalogue and picks Design 4088 Ivory (same quality). The review card shows his resolution.',
      msgs: [{ id: 'j22', resolves: 'review-1', resolution: { productId: 'p-4088-ivory', name: 'Design 4088 Ivory', by: 'Pankaj Rane', how: 'catalogue' }, text: 'Resolved by Pankaj: Design 4088 Ivory' }, txt('j23', 'u-pankaj', 'Yeh Design 4088 Shade Ivory hai, same quality. Chalega?')], thread: { unread: 0, sla: 'normal', note: 'Pankaj chose Design 4088 Ivory for line 2' }, lines: [L1d, L2p], m: { handle: 12 } }),
    step({ t: 11 + TIMER, actor: 'Pankaj', title: 'Hand back to Anuma', desc: 'Owner flips back; Anuma asks meters for image 2.', narr: 'Pankaj hands the case back. Ownership flips everywhere (inbox owner bar, case card, drafts) and Anuma picks up by asking for the quantity.',
      msgs: [sys('j24', 'Pankaj handed this case back to Anuma', 'grey'), txt('j25', 'anuma', 'Design 4088 Ivory mil gaya. Iska kitna meter?')], thread: { owner: 'anuma', label: 'Open', tone: 'grey', note: 'Anuma, handed back by Pankaj' }, m: { auto: 66, handle: 11 },
      notifies: [{ tab: 'agent', from: 'Pankaj', subject: 'Anuma has case 1001 again', body: 'Pankaj handed back. Anuma will ask Mahesh Patil for meters on Design 4088 Ivory.', href: THREAD_ROUTE }] }),
    step({ t: 14 + TIMER, actor: 'Customer', title: '30 m for image 2', desc: 'Line 2 recorded.', narr: 'The dealer answers "30 meter". Line 2 is recorded against Design 4088 Ivory.', msgs: [txt('j26', 'customer', '30 meter'), sys('j27', 'Line 2: 30 m recorded', 'green')], thread: { unread: 1 }, lines: [L1d, L2d], m: { handle: 11 } }),
    step({ t: 15 + TIMER, actor: 'Anuma', title: 'Order summary with buttons', desc: 'Total 75 m: Confirm / Add more / Cancel.', narr: 'Anuma sends the order summary as a WhatsApp interactive message. The draft order now shows two proposed lines at Band A rates.', route: '/orders/drafts/' + JD,
      msgs: [card('j28', 'anuma', { type: 'summary', total: 75, lines: [L1d, L2d].map((l) => ({ n: l.n, name: l.name, qty: l.qty, unit: 'm', price: l.price })), options: ['Confirm', 'Add more', 'Cancel'] }, 'Order ready hai. Total 75 m. Confirm karein, add more, ya cancel?')], thread: { unread: 0, label: 'Awaiting confirm', tone: 'violet' }, lines: prop([L1d, L2d]), m: { auto: 67, handle: 11 } }),
    step({ t: 16 + TIMER, actor: 'Customer', title: 'Customer taps "Add more"', desc: 'Dealer wants one more item.', narr: 'The dealer taps "Add more". The case goes back to Open and Anuma asks for the next photo or design number.', route: THREAD_ROUTE,
      msgs: [{ id: 'j29', from: 'customer', type: 'text', text: 'Add more', meta: { choice: true } }, txt('j30', 'anuma', 'Theek hai, agla photo ya design number bhejiye.')], thread: { unread: 1, label: 'Open', tone: 'grey' }, lines: [L1d, L2d] }),
    step({ t: 17 + TIMER, actor: 'Customer', title: 'Voice note: "leaf 12 blue velvet"', desc: 'Anuma transcribes an 11-second voice note.', narr: 'The dealer sends an 11-second voice note in Hindi. Anuma transcribes it and extracts leaf no, quality, shade and meters.',
      msgs: [{ id: 'j31', from: 'customer', type: 'voice', text: '', meta: { seconds: 11, transcript: 'leaf 12 wala blue velvet 20 meter' } }, txt('j32', 'anuma', 'Voice note mil gaya, sun raha hoon.'), card('j33', 'anuma', { type: 'read', title: 'Voice note, what Anuma heard', transcript: 'leaf 12 wala blue velvet 20 meter', fields: [['Leaf no', '12'], ['Quality', 'Velvet'], ['Shade', 'Blue'], ['Meters', '20']] })], thread: { unread: 0, label: 'Reading', tone: 'grey' }, m: { auto: 68, handle: 10 } }),
    step({ t: 18 + TIMER, actor: 'Anuma', title: 'Voice match 55%: second hand-off', desc: 'Two velvets carry leaf 12; Anuma stops and asks Pankaj again.', narr: `Two velvets in the catalogue carry leaf 12 (Blue and Emerald) and the voice note names no design. Best match is 55%, below ${FLOOR}%. Hand-off number two.`,
      msgs: [sys('j34', `Best match 55%, below the ${FLOOR}% floor`, 'amber'), txt('j35', 'anuma', 'Ek minute, check karke batata hu.'), card('j36', 'anuma', { type: 'review', reviewId: 'review-2', transcript: 'leaf 12 wala blue velvet 20 meter', read: [['Leaf no', '12'], ['Quality', 'Velvet'], ['Shade', 'Blue'], ['Meters', '20']], best: { productId: 'p-velvet-blue-12', name: 'Blue Velvet leaf 12', confidence: 55 }, why: `Why it stopped: best match is 55%, floor is ${FLOOR}%. Two velvets carry leaf 12 and the note names no design.` }), sys('j37', 'Anuma handed this case to Pankaj', 'blue')],
      thread: { owner: 'u-pankaj', label: 'With Pankaj', tone: 'blue', note: `Pankaj since ${hh(18 + TIMER)}, re-notify in ${TIMER} min` }, lines: [L1d, L2d, L3f], m: { auto: 66, handle: 11 },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Curtain Decor NX needs you again on case 1001', body: `Voice note asked for leaf 12 wala blue velvet 20 meter. Best match is 55%, below the ${FLOOR}% floor.`, href: THREAD_ROUTE }],
      extra: (S) => { logIt(S, 18 + TIMER, 'Anuma', 'Handed case 1001 to Pankaj again (voice match 55%)', 'Case 1001', 'escalated'); kpi(S, 'handoffs', 6); } }),
    step({ t: 22 + TIMER, actor: 'Pankaj', title: 'Pankaj accepts Blue Velvet leaf 12', desc: 'Resolves, hands back, Anuma re-sends the summary (95 m).', narr: 'Pankaj accepts Blue Velvet leaf 12 and hands back. Anuma sends the refreshed summary with three lines, 95 m in total.', route: '/orders/drafts/' + JD,
      msgs: [{ id: 'j38', resolves: 'review-2', resolution: { productId: 'p-velvet-blue-12', name: 'Blue Velvet leaf 12', by: 'Pankaj Rane', how: 'accept' }, text: 'Resolved by Pankaj: Blue Velvet leaf 12' }, txt('j39', 'u-pankaj', 'Blue Velvet leaf 12 confirm, 20 meter.'), sys('j40', 'Pankaj handed this case back to Anuma', 'grey'), card('j41', 'anuma', { type: 'summary', total: 95, lines: [L1d, L2d, L3d].map((l) => ({ n: l.n, name: l.name, qty: l.qty, unit: 'm', price: l.price })), options: ['Confirm', 'Add more', 'Cancel'] }, 'Order ready hai. Total 95 m. Confirm karein, add more, ya cancel?')],
      thread: { owner: 'anuma', label: 'Awaiting confirm', tone: 'violet', note: 'Anuma, handed back by Pankaj. 2 hand-offs so far' }, lines: prop([L1d, L2d, L3d]), m: { auto: 68, handle: 11 },
      notifies: [{ tab: 'agent', from: 'Pankaj', subject: 'Anuma has case 1001 again', body: 'Pankaj accepted Blue Velvet leaf 12 and handed back.', href: THREAD_ROUTE }] }),
    step({ t: 24 + TIMER, actor: 'Customer', title: 'Customer confirms. Order created', desc: `${JNO} · 3 lines · 95 m · ₹${ORDER_VALUE.toLocaleString('en-IN')}.`, narr: `The dealer taps Confirm. Anuma creates order ${JNO} (3 lines, 95 m, Band A rates) and closes the case. The Coralio post is queued.`, route: '/orders/' + JO,
      msgs: [{ id: 'j42', from: 'customer', type: 'text', text: 'Confirm', meta: { choice: true } }, txt('j43', 'anuma', `Ji Mahesh ji. Order confirm ho gaya. Order no ${JNO}, 3 items, 95 m. Payment ke baad dispatch hoga. Update yahin milega.`), sys('j44', `Order ${JNO} confirmed · case closed`, 'green')],
      thread: { label: 'Closed', tone: 'green', status: 'closed', unread: 0, sla: 'stopped', note: 'Closed, 3 lines, 95 m, 2 hand-offs' }, lines: CONFIRMED, m: { orders: todayTotal + ORDER_VALUE, auto: 70, handle: 12 },
      notifies: [{ tab: 'human', from: 'Anuma', subject: `Order ${JNO} confirmed`, body: 'Curtain Decor NX, 3 items, 95 m. Anuma closed the case.', href: '/orders/' + JO }, { tab: 'agent', from: 'Anuma', subject: `Order ${JNO} confirmed`, body: 'Curtain Decor NX, 3 items, 95 m.', href: '/orders/' + JO }],
      extra: (S, th) => {
        const d = getDraft(S); d.status = 'approved'; d.note = 'Confirmed by the dealer on WhatsApp';
        S.orders.unshift({ id: JO, no: JNO, partyId: JP, status: 'confirmed', total: ORDER_VALUE, placedAt: iso(24 + TIMER), channel: 'whatsapp', payment: 'Credit', lines: CONFIRMED.map(({ productId, name, qty, unit, price }) => ({ productId, name, qty, unit, price })), erp: { system: 'Coralio', ref: null, state: 'pending', at: iso(24 + TIMER) }, threadId: JT });
        th.orderId = JO; kpi(S, 'orders', todayTotal + ORDER_VALUE); kpi(S, 'open', S.threads.filter((t) => t.status === 'open').length);
        logIt(S, 24 + TIMER, 'Anuma', `Confirmed order ${JNO} for Curtain Decor NX`, 'Order ' + JNO, 'handled', 'action', 'whatsapp');
      } }),
  ];

  // Coralio request builder
  const coralioReq = (velvetCode) => ({ external_ref: JNO, idempotency_key: 'anuma-' + JNO, party_code: 'NH-CURTAINDECORNX', order_date: iso(0).slice(0, 10), price_band: 'A', terms: '15/30', salesman_code: 'PANKAJ-RANE', source: 'anuma-whatsapp', lines: CONFIRMED.map((l) => ({ item_code: l.productId === 'p-velvet-blue-12' ? velvetCode : prod(l.productId).sku, uom: 'MTR', qty: l.qty, rate: l.price })) });
  const T_POST = 25 + TIMER;
  steps.push(
    step({ t: T_POST, actor: 'System', title: 'POST to Coralio: 422', desc: 'Item code for the velvet is not in Coralio item master.', route: '/settings/integrations/coralio',
      narr: `Workflow "Confirmed order → post to Coralio" calls POST /v2/sales-orders. Coralio answers 422: NH-VL12-BL does not exist in its item master (velvets are coded NH-VLV-12-BL there). The order stays confirmed in Anuma with the sync flagged.`,
      msgs: [], thread: {}, m: { posts: 18 }, notifies: [{ tab: 'human', from: 'Coralio', subject: `Coralio rejected ${JNO}`, body: 'Item NH-VL12-BL not found in item master. Anuma is fixing the mapping and will retry.', href: '/orders/' + JO }],
      extra: (S) => {
        const o = S.orders.find((x) => x.id === JO); o.erp = { system: 'Coralio', ref: null, state: 'failed', at: iso(T_POST), error: '422 lines[2].item_code NH-VL12-BL not found in item master' };
        S.erpLog.unshift({ id: 'erp-nx-1', orderId: JO, system: 'Coralio', direction: 'out', endpoint: 'https://api.coralio.example/v2/sales-orders', method: 'POST', status: 422, ref: null, at: iso(T_POST), request: coralioReq('NH-VL12-BL'), response: { error: { code: 'VALIDATION_FAILED', message: 'lines[2].item_code NH-VL12-BL not found in item master', field: 'lines[2].item_code', request_id: 'req_9f3c21' } }, state: 'failed' });
        const a = S.apps.find((x) => x.slug === 'coralio'); a.lastSync = iso(T_POST);
        S.workflows[0].runs++; S.workflows[0].lastRun = iso(T_POST);
        S.dash.alerts.unshift({ id: 'al-nx', text: `Coralio rejected ${JNO} (item code)`, tone: 'red', href: '/orders/' + JO });
        logIt(S, T_POST, 'System', `Coralio 422 on ${JNO}: item NH-VL12-BL not found`, 'Order ' + JNO, 'failed', 'alert', 'api', null);
      } }),
    step({ t: T_POST + 1, actor: 'Anuma', title: 'Anuma fixes the mapping and retries', desc: 'Maps NH-VL12-BL → NH-VLV-12-BL, 201 BOOKED.', route: '/orders/' + JO,
      narr: `Anuma looks up the velvet in the Coralio item master, saves the mapping NH-VL12-BL → NH-VLV-12-BL so it never fails again, and retries with the same idempotency key. Coralio returns 201 BOOKED, ref ${JREF}.`,
      msgs: [], m: { posts: 19 }, notifies: [{ tab: 'agent', from: 'Anuma', subject: `${JNO} booked in Coralio`, body: `Ref ${JREF}. Item map for velvets updated.`, href: '/orders/' + JO }],
      extra: (S) => {
        const o = S.orders.find((x) => x.id === JO); o.erp = { system: 'Coralio', ref: JREF, state: 'synced', at: iso(T_POST + 1) };
        const l1 = S.erpLog.find((x) => x.id === 'erp-nx-1'); if (l1) l1.retriedBy = 'erp-nx-2';
        S.erpLog.unshift({ id: 'erp-nx-2', orderId: JO, system: 'Coralio', direction: 'out', endpoint: 'https://api.coralio.example/v2/sales-orders', method: 'POST', status: 201, ref: JREF, at: iso(T_POST + 1), request: coralioReq('NH-VLV-12-BL'), response: { id: JREF, status: 'BOOKED', doc_no: 'SO/26-27/4213', total: ORDER_VALUE, lines: 3 }, state: 'synced', retryOf: 'erp-nx-1' });
        const d = getDraft(S); d.status = 'posted'; d.note = 'Posted to Coralio ' + JREF;
        const a = S.apps.find((x) => x.slug === 'coralio'); a.lastSync = iso(T_POST + 1); a.config.itemMap = 'SKU → item_code (29 mapped, 1 override: NH-VL12-BL → NH-VLV-12-BL)';
        S.dash.alerts = S.dash.alerts.filter((x) => x.id !== 'al-nx'); kpi(S, 'posts', 19);
        S.agents[0].gaps = S.agents[0].gaps.filter((g) => g.id !== 'gap-3');
        logIt(S, T_POST + 1, 'Anuma', `Posted ${JNO} to Coralio, ref ${JREF} (after item-map fix)`, 'Order ' + JNO, 'synced', 'action', 'api', null);
      } }),
    step({ t: T_POST + 3, actor: 'Anuma', title: 'Dealer told, shipment queued', desc: `Booking ref sent on WhatsApp; Delhivery pickup requested.`, route: '/fulfilment',
      narr: 'Anuma tells Mahesh the Coralio booking reference and creates a shipment. The fulfilment board shows it as pending pickup; the order flips to processing.',
      msgs: [txt('j45', 'anuma', `Mahesh ji, ${JNO} Coralio mein book ho gaya (ref ${JREF}). Payment aate hi dispatch, Delhivery se 2 din mein Thane.`)], thread: {}, m: { handle: 9 },
      extra: (S) => {
        const o = S.orders.find((x) => x.id === JO); o.status = 'processing';
        S.shipments.unshift({ id: 'sh-0911', orderId: JO, carrier: 'Delhivery', awb: '70112233445', status: 'pending', eta: iso(T_POST + 2 * DAY), from: 'NuHome DC, Bhiwandi', to: 'Thane', events: [{ at: iso(T_POST + 1), text: 'Order booked in Coralio ' + JREF }, { at: iso(T_POST + 3), text: 'Pickup requested with Delhivery' }] });
        o.shipmentId = 'sh-0911'; logIt(S, T_POST + 3, 'Anuma', `Sent Coralio ref ${JREF} to Mahesh Patil and requested pickup`, 'Order ' + JNO, 'handled', 'action', 'whatsapp');
      } }),
    step({ t: T_POST + 8, actor: 'Pankaj', title: 'Pankaj trains Anuma from the case', desc: 'Adds a rule so velvets and leaf numbers are asked back.', route: '/agents/whatsapp-order-desk/training',
      narr: 'From the finished case Pankaj teaches the order desk: when a voice note gives only a leaf number and quality, ask which shade before matching. The guideline lands in the agent\'s Training history and the auto-resolve rate moves up.',
      msgs: [], m: { auto: 74, handle: 9 }, notifies: [{ tab: 'agent', from: 'Pankaj', subject: 'Order desk guideline updated', body: 'Ask for shade when only leaf no and quality are given.', href: '/agents/whatsapp-order-desk/training' }],
      extra: (S) => {
        const a = S.agents[0];
        a.rules.push({ id: 'r10', kind: 'rule', scope: 'agent', text: 'When a voice note gives only leaf no and quality, ask which shade before matching.' });
        a.training.unshift({ id: 'ts-4', at: iso(T_POST + 8), by: 'Pankaj', prompt: 'If someone says leaf 12 velvet and nothing else, ask the shade first.', added: ['When a voice note gives only leaf no and quality, ask which shade before matching.'], removed: [] });
        a.learned.unshift({ id: 'lf-4', text: 'Two velvets carry leaf 12 (Blue, Emerald); always confirm the shade.', at: iso(T_POST + 8) });
        a.kpis = { ...a.kpis, autoRate: 74, handled: a.kpis.handled + 1 }; kpi(S, 'auto', 74); kpi(S, 'handle', 5);
        S.rulebook.push({ id: 'rb-s', kind: 'rule', scope: 'agent', text: 'When a voice note gives only leaf no and quality, ask which shade before matching.', enabled: true });
        logIt(S, T_POST + 8, 'Pankaj Rane', 'Added guideline to WhatsApp order desk', 'Agent WhatsApp order desk', 'handled', 'action', 'app', null);
      } }),
  );

  DM.defineUC(UC, {
    short: 'NewHome', tagline: 'WhatsApp orders → Coralio API', icon: 'chat', home: '/inbox/threads',
    about: 'NuHome Decor sells curtain and upholstery fabric to ~60 dealers across India. Dealers order on WhatsApp with swatch photos, text and voice notes. Anuma reads labels, matches the catalogue, hands low-confidence lines to the ASM (human-in-the-loop), and posts confirmed orders to the Coralio ERP API. Press Play to watch one order from first message to booked sales order.',
    charts: [
      { key: 'orders', title: 'Order value today', type: 'spark', fmt: 'inr', start: todayTotal, delta: true },
      { key: 'auto', title: 'Auto-resolved', type: 'spark', fmt: 'pct', start: 71, delta: true, color: '#0d9488' },
      { key: 'handle', title: 'Avg handling time', type: 'spark', fmt: 'min', start: 6, color: '#d97706' },
      { key: 'posts', title: 'Coralio posts today', type: 'spark', fmt: 'num', start: 18, delta: true, color: '#7c3aed' },
    ],
    steps,
  });

  DM.data(UC, 'company', company); DM.data(UC, 'users', users); DM.data(UC, 'parties', parties); DM.data(UC, 'contacts', contacts); DM.data(UC, 'products', products);
  DM.data(UC, 'threads', threads); DM.data(UC, 'leads', leads); DM.data(UC, 'rfqs', rfqs); DM.data(UC, 'quotes', quotes); DM.data(UC, 'orders', orders); DM.data(UC, 'drafts', drafts);
  DM.data(UC, 'shipments', shipments); DM.data(UC, 'campaigns', campaigns); DM.data(UC, 'lists', lists); DM.data(UC, 'templates', templates); DM.data(UC, 'agents', agents);
  DM.data(UC, 'workflows', workflows); DM.data(UC, 'channels', channels); DM.data(UC, 'apps', apps); DM.data(UC, 'erpLog', erpLog); DM.data(UC, 'logs', logs);
  DM.data(UC, 'notifications', notifications); DM.data(UC, 'rulebook', rulebook); DM.data(UC, 'usage', usage); DM.data(UC, 'rateCard', rateCard); DM.data(UC, 'dash', dash);
})();
