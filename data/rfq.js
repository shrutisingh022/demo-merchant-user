/* Use case 1 — Access Electricals: RFQ → quote → order. Seed data + scenario. */
(function () {
  const UC = 'rfq';
  const pad = (n) => String(n).padStart(2, '0');
  const BASE = Date.parse('2026-10-27T09:30:00+05:30');
  const ago = (d, h = 0, m = 0) => new Date(BASE - ((d * 24 + h) * 60 + m) * 60000).toISOString();
  const at = (h, m) => `2026-10-27T${pad(h)}:${pad(m)}:00+05:30`;
  const dayAt = (day, h, m) => `2026-10-${pad(day)}T${pad(h)}:${pad(m)}:00+05:30`;

  /* ───────── users ───────── */
  const users = [
    { id: 'u1', name: 'Demo Merchant User', role: 'Owner', email: 'demo@anuma.run', phone: '+91 98200 11001', status: 'active', last: ago(0, 0, 12), modules: ['all'] },
    { id: 'u2', name: 'Rohit Verma', role: 'ASM', email: 'rohit.verma@access-electricals.example', phone: '+91 98110 22002', status: 'active', last: ago(0, 1), modules: ['inbox', 'leads', 'rfqs', 'quotes', 'crm'] },
    { id: 'u3', name: 'Sneha Kulkarni', role: 'Sales', email: 'sneha.kulkarni@access-electricals.example', phone: '+91 98220 33003', status: 'active', last: ago(0, 0, 25), modules: ['inbox', 'leads', 'rfqs', 'quotes', 'orders', 'crm'] },
    { id: 'u4', name: 'Imran Sheikh', role: 'Accounts', email: 'imran.sheikh@access-electricals.example', phone: '+91 98330 44004', status: 'active', last: ago(0, 2), modules: ['orders', 'drafts', 'crm', 'reports'] },
    { id: 'u5', name: 'Deepa Nair', role: 'Admin', email: 'deepa.nair@access-electricals.example', phone: '+91 98450 55005', status: 'active', last: ago(1), modules: ['all'] },
    { id: 'u6', name: 'Karan Mehta', role: 'ASM', email: 'karan.mehta@access-electricals.example', phone: '+91 98765 66006', status: 'active', last: ago(0, 4), modules: ['inbox', 'leads', 'rfqs', 'quotes', 'crm'] },
    { id: 'u7', name: 'Pooja Iyer', role: 'Sales', email: 'pooja.iyer@access-electricals.example', phone: '+91 99000 77007', status: 'invited', last: null, modules: ['inbox', 'rfqs'] },
  ];

  /* ───────── products ───────── */
  // id, sku, name, category, brand, unit, price, mrp, stock, hsn, tax, color
  const PR = [
    ['p01', 'VX-SW-6A1W-WH', 'Modular Switch 6A 1-Way White', 'Switches & Sockets', 'Voltix', 'pcs', 38, 55, 2400, '8536', 18, '#e5e7eb'],
    ['p02', 'VX-SK-616-3P', 'Modular Socket 6/16A 3-Pin', 'Switches & Sockets', 'Voltix', 'pcs', 92, 130, 1800, '8536', 18, '#d4d4d8'],
    ['p03', 'VX-SW-16A1W-WH', 'Modular Switch 16A 1-Way White', 'Switches & Sockets', 'Voltix', 'pcs', 64, 90, 1500, '8536', 18, '#e5e7eb'],
    ['p04', 'VX-FR-5ST', 'Fan Regulator 5-Step Modular', 'Switches & Sockets', 'Voltix', 'pcs', 285, 390, 640, '8536', 18, '#cbd5e1'],
    ['p05', 'VX-MB-8M', 'Concealed Metal Box 8 Module', 'Switches & Sockets', 'Voltix', 'pcs', 118, 160, 900, '8538', 18, '#a8a29e'],
    ['p06', 'AG-MCB-1P-06C', 'MCB 1P 6A C-Curve 10kA', 'Protection', 'Ampere Guard', 'pcs', 148, 215, 1200, '8536', 18, '#fecaca'],
    ['p07', 'AG-MCB-1P-16C', 'MCB 1P 16A C-Curve 10kA', 'Protection', 'Ampere Guard', 'pcs', 152, 220, 1500, '8536', 18, '#fecaca'],
    ['p08', 'AG-MCB-1P-32C', 'MCB 1P 32A C-Curve 10kA', 'Protection', 'Ampere Guard', 'pcs', 165, 240, 900, '8536', 18, '#fecaca'],
    ['p09', 'AG-MCB-3P-63C', 'MCB 3P 63A C-Curve 10kA', 'Protection', 'Ampere Guard', 'pcs', 1180, 1650, 220, '8536', 18, '#fca5a5'],
    ['p10', 'AG-RCCB-2P-40', 'RCCB 2P 40A 30mA', 'Protection', 'Ampere Guard', 'pcs', 1050, 1480, 260, '8536', 18, '#fdba74'],
    ['p11', 'AG-DB-8W-SPN', 'Distribution Board 8-Way SPN IP43', 'Distribution Boards', 'Ampere Guard', 'pcs', 1490, 2100, 140, '8537', 18, '#93c5fd'],
    ['p12', 'AG-DB-12W-TPN', 'Distribution Board 12-Way TPN', 'Distribution Boards', 'Ampere Guard', 'pcs', 3250, 4400, 60, '8537', 18, '#93c5fd'],
    ['p13', 'KV-FRLS-15-90R', 'FRLS House Wire 1.5 sq mm 90m Red', 'Wires & Cables', 'Kavach', 'coil', 1320, 1760, 800, '8544', 18, '#f87171'],
    ['p14', 'KV-FRLS-25-90R', 'FRLS House Wire 2.5 sq mm 90m Red', 'Wires & Cables', 'Kavach', 'coil', 2080, 2780, 620, '8544', 18, '#f87171'],
    ['p15', 'KV-FRLS-40-90R', 'FRLS House Wire 4 sq mm 90m Red', 'Wires & Cables', 'Kavach', 'coil', 3290, 4380, 300, '8544', 18, '#f87171'],
    ['p16', 'KV-FRLS-60-90R', 'FRLS House Wire 6 sq mm 90m Red', 'Wires & Cables', 'Kavach', 'coil', 4950, 6600, 180, '8544', 18, '#f87171'],
    ['p17', 'KV-ARM-3C16', 'Armoured Cable 3 Core x 16 sq mm Al', 'Wires & Cables', 'Kavach', 'mtr', 412, 560, 2200, '8544', 18, '#64748b'],
    ['p18', 'KV-ARM-4C25', 'Armoured Cable 4 Core x 25 sq mm Al', 'Wires & Cables', 'Kavach', 'mtr', 735, 990, 1400, '8544', 18, '#64748b'],
    ['p19', 'KV-FLX-3C15', 'Copper Flexible Cable 3 Core 1.5 sq mm 100m', 'Wires & Cables', 'Kavach', 'coil', 4650, 6100, 90, '8544', 18, '#fb923c'],
    ['p20', 'DL-PVC-25-3M', 'PVC Conduit 25mm 3m ISI Heavy', 'Conduits & Fittings', 'Duraline', 'pcs', 62, 84, 5000, '3917', 18, '#fde68a'],
    ['p21', 'DL-PVC-32-3M', 'PVC Conduit 32mm 3m ISI Heavy', 'Conduits & Fittings', 'Duraline', 'pcs', 88, 118, 3200, '3917', 18, '#fde68a'],
    ['p22', 'DL-BND-25', 'Conduit Bend 25mm', 'Conduits & Fittings', 'Duraline', 'pcs', 9, 14, 9000, '3917', 18, '#fef3c7'],
    ['p23', 'LM-PNL-2X2-40', 'LED Panel 2x2 40W 6500K', 'Lighting', 'Lumera', 'pcs', 1190, 1990, 520, '9405', 12, '#fef9c3'],
    ['p24', 'LM-PNL-2X2-36B', 'LED Panel 2x2 36W Backlit 4000K', 'Lighting', 'Lumera', 'pcs', 1090, 1790, 410, '9405', 12, '#fef9c3'],
    ['p25', 'LM-DL-12R', 'LED Downlight 12W Round 3000K', 'Lighting', 'Lumera', 'pcs', 245, 420, 1800, '9405', 12, '#fef08a'],
    ['p26', 'LM-BT-20-4FT', 'LED Batten 20W 4ft 6500K', 'Lighting', 'Lumera', 'pcs', 310, 520, 1300, '9405', 12, '#fef08a'],
    ['p27', 'LM-ST-60', 'LED Street Light 60W IP66', 'Lighting', 'Lumera', 'pcs', 1840, 2900, 140, '9405', 12, '#fde047'],
    ['p28', 'ZP-CF-1200-5S', 'Ceiling Fan 1200mm 5-Star BLDC', 'Fans', 'Zephyr', 'pcs', 2380, 3490, 210, '8414', 18, '#bae6fd'],
    ['p29', 'ZP-EF-150', 'Exhaust Fan 150mm Heavy Duty', 'Fans', 'Zephyr', 'pcs', 890, 1290, 160, '8414', 18, '#bae6fd'],
    ['p30', 'DL-CT-PERF-100', 'Perforated Cable Tray 100x50 GI 2m', 'Cable Management', 'Duraline', 'pcs', 685, 940, 340, '7326', 18, '#d6d3d1'],
    ['p31', 'DL-ES-GI-25X3', 'GI Earthing Strip 25x3 mm', 'Cable Management', 'Duraline', 'mtr', 138, 190, 1500, '7326', 18, '#d6d3d1'],
    ['p32', 'DL-CG-BR-25', 'Brass Cable Gland 25mm', 'Cable Management', 'Duraline', 'pcs', 42, 60, 2500, '7419', 18, '#fcd34d'],
    ['p33', 'AG-ISO-4P-63', 'Isolator 4P 63A', 'Protection', 'Ampere Guard', 'pcs', 1380, 1950, 80, '8536', 18, '#fdba74'],
    ['p34', 'AG-COS-32', 'Changeover Switch 32A 2P', 'Protection', 'Ampere Guard', 'pcs', 920, 1300, 55, '8536', 18, '#fdba74'],
  ];
  const VARIANTS = {
    p01: [['White', 38], ['Grey', 41], ['Champagne', 46]],
    p02: [['White', 92], ['Grey', 96], ['Champagne', 108]],
    p28: [['Ivory', 2380], ['Brown', 2380], ['Matte Black', 2540]],
    p23: [['6500K Cool White', 1190], ['4000K Neutral', 1190], ['3000K Warm', 1230]],
  };
  const products = PR.map(([id, sku, name, category, brand, unit, price, mrp, stock, hsn, tax, color]) => ({
    id, sku, name, category, brand, unit, price, mrp, stock, hsn, tax, color, status: id === 'p27' ? 'draft' : 'active',
    attrs: Object.assign({ Brand: brand, Standard: 'IS/ISI', Warranty: category === 'Lighting' || category === 'Fans' ? '2 years' : category === 'Wires & Cables' ? 'Lifetime' : '5 years' }, id.startsWith('p0') && +id.slice(1) <= 5 ? { Module: 'Modular', Finish: 'Matt' } : {}),
    variants: (VARIANTS[id] || [[category === 'Wires & Cables' ? 'Standard' : 'Default', price]]).map(([label, p], i) => ({ id: id + '-v' + (i + 1), label, sku: sku + '-' + (i + 1), price: p, stock: Math.round(stock / (VARIANTS[id] ? VARIANTS[id].length : 1)) })),
  }));
  const PM = Object.fromEntries(products.map((p) => [p.id, p]));
  const ln = (pid, qty, extra = {}) => Object.assign({ productId: pid, name: PM[pid].name, qty, unit: PM[pid].unit, price: PM[pid].price }, extra);
  const sum = (lines) => lines.reduce((a, l) => a + l.qty * l.price, 0);

  /* ───────── parties & contacts ───────── */
  const parties = [
    ['pt01', 'Meridian Projects Pvt Ltd', 'Pune', 'West', 'EPC Contractor', 'u3', '+91 20 4120 8800', 'procurement@meridianprojects.example', '27AABCM4417K1ZP', 'Net 30', 'A', 2500000, 640000, 5, 22, 11800000, 'active', ['EPC', 'key-account']],
    ['pt02', 'Shree Sai Electricals & Traders', 'Nashik', 'West', 'Dealer', 'u3', '+91 98221 40012', 'shreesai.nashik@example.com', '27AAFFS9122D1ZQ', 'Advance', 'B', 400000, 0, 12, 41, 3150000, 'active', ['dealer']],
    ['pt03', 'Brightline Infra Solutions', 'Mumbai', 'West', 'EPC Contractor', 'u3', '+91 22 6644 3300', 'purchase@brightlineinfra.example', '27AAKCB6618H1ZT', 'Net 45', 'A', 3000000, 1180000, 9, 17, 9400000, 'active', ['EPC']],
    ['pt04', 'Kalyani Builders & Developers', 'Pune', 'West', 'Builder', 'u3', '+91 20 2612 4455', 'accounts@kalyanibuilders.example', '27AACFK2290L1Z2', 'Net 30', 'A', 1500000, 310000, 33, 8, 4260000, 'quiet', ['builder']],
    ['pt05', 'Nirmal Electro Mart', 'Indore', 'Central', 'Dealer', 'u2', '+91 731 405 2210', 'nirmalelectro@example.com', '23AAGFN5531C1ZB', 'Net 15', 'B', 350000, 88000, 4, 36, 2870000, 'active', ['dealer']],
    ['pt06', 'Apex MEP Contractors', 'Bengaluru', 'South', 'MEP Contractor', 'u6', '+91 80 4097 1100', 'projects@apexmep.example', '29AAICA3317E1ZD', 'Net 30', 'A', 2000000, 540000, 16, 12, 7120000, 'active', ['MEP']],
    ['pt07', 'Gujarat Power Systems LLP', 'Ahmedabad', 'West', 'Contractor', 'u3', '+91 79 4001 7788', 'tender@gujpower.example', '24AAUFG8810P1ZA', 'Net 30', 'B', 1200000, 420000, 11, 9, 3340000, 'active', ['contractor']],
    ['pt08', 'Sunrise Hospitality Projects', 'Hyderabad', 'South', 'Builder', 'u6', '+91 40 6677 2211', 'procurement@sunrisehp.example', '36AABCS7712M1Z5', 'Net 45', 'A', 2500000, 960000, 24, 6, 5890000, 'active', ['hospitality']],
    ['pt09', 'Delhi Wiring House', 'Delhi', 'North', 'Dealer', 'u2', '+91 11 4357 9021', 'delhiwiring@example.com', '07AAFFD4423B1ZV', 'Advance', 'B', 500000, 0, 7, 48, 4620000, 'active', ['dealer']],
    ['pt10', 'Raman & Sons Electricals', 'Chennai', 'South', 'Dealer', 'u6', '+91 44 2831 6640', 'raman.sons@example.com', '33AABFR1105Q1Z8', 'Net 15', 'B', 450000, 112000, 5, 29, 3980000, 'active', ['dealer']],
    ['pt11', 'TechSpace Interiors', 'Gurugram', 'North', 'Interior Contractor', 'u2', '+91 124 450 8800', 'sourcing@techspace.example', '06AAECT9921K1ZH', 'Net 30', 'B', 800000, 275000, 8, 10, 2260000, 'active', ['interiors']],
    ['pt12', 'Anand Textile Mills', 'Surat', 'West', 'Industrial End-User', 'u3', '+91 261 244 7001', 'maintenance@anandtextile.example', '24AAACA6602J1ZM', 'Net 60', 'A', 2000000, 770000, 41, 4, 5310000, 'quiet', ['industrial']],
    ['pt13', 'Heritage Hospitals Pvt Ltd', 'Jaipur', 'North', 'Institution', 'u2', '+91 141 405 6600', 'stores@heritagehospitals.example', '08AABCH4410R1ZE', 'Net 45', 'A', 1800000, 340000, 14, 5, 3780000, 'active', ['healthcare']],
    ['pt14', 'Vikram Electro Works', 'Lucknow', 'North', 'Dealer', 'u2', '+91 522 405 1177', 'vikramelectro@example.com', '09AAFFV7714H1ZK', 'Net 15', 'B', 300000, 64000, 21, 14, 1450000, 'quiet', ['dealer']],
    ['pt15', 'Skyline Realty Group', 'Navi Mumbai', 'West', 'Builder', 'u3', '+91 22 2757 3300', 'projects@skylinerealty.example', '27AACCS3309N1Z1', 'Net 45', 'A', 3500000, 1620000, 6, 13, 12600000, 'active', ['builder', 'key-account']],
    ['pt16', 'Coastal Facility Services', 'Kochi', 'South', 'Facility Management', 'u6', '+91 484 405 2290', 'ops@coastalfm.example', '32AACFC8805D1ZY', 'Net 30', 'B', 900000, 190000, 18, 7, 1980000, 'active', ['facility']],
  ].map(([id, name, city, region, type, owner, phone, email, gstin, terms, priceBand, creditLimit, outstanding, lastD, orders30d, lifetime, status, tags]) => ({ id, name, city, region, type, owner, phone, email, gstin, terms, priceBand: 'Band ' + priceBand, creditLimit, outstanding, lastOrderAt: ago(lastD), orders30d, lifetime, status, tags }));

  const contacts = [
    ['ct01', 'pt01', 'Prashant Joshi', 'Procurement Manager', '+91 98221 55010', 'prashant.joshi@meridianprojects.example', 1],
    ['ct02', 'pt01', 'Neha Deshpande', 'Site Engineer – Tower B', '+91 98221 55011', 'neha.d@meridianprojects.example', 0],
    ['ct03', 'pt02', 'Sanjay Pawar', 'Owner', '+91 98221 40012', 'shreesai.nashik@example.com', 1],
    ['ct04', 'pt03', 'Ritu Malhotra', 'Head – Purchase', '+91 98200 66021', 'ritu.m@brightlineinfra.example', 1],
    ['ct05', 'pt03', 'Farhan Qureshi', 'Estimator', '+91 98200 66022', 'farhan.q@brightlineinfra.example', 0],
    ['ct06', 'pt04', 'Mahesh Kalyani', 'Director', '+91 98230 71031', 'mahesh@kalyanibuilders.example', 1],
    ['ct07', 'pt05', 'Nirmal Jain', 'Proprietor', '+91 98270 81040', 'nirmalelectro@example.com', 1],
    ['ct08', 'pt06', 'Arvind Rao', 'Projects Lead', '+91 98450 91050', 'arvind.rao@apexmep.example', 1],
    ['ct09', 'pt06', 'Divya Shetty', 'Procurement', '+91 98450 91051', 'divya.s@apexmep.example', 0],
    ['ct10', 'pt07', 'Hardik Patel', 'Estimation Head', '+91 98250 10060', 'hardik@gujpower.example', 1],
    ['ct11', 'pt08', 'Srinivas Reddy', 'GM – Procurement', '+91 98480 20070', 'srinivas@sunrisehp.example', 1],
    ['ct12', 'pt09', 'Gurpreet Singh', 'Proprietor', '+91 98100 30080', 'delhiwiring@example.com', 1],
    ['ct13', 'pt10', 'Raman Subramanian', 'Proprietor', '+91 98400 40090', 'raman.sons@example.com', 1],
    ['ct14', 'pt11', 'Ishaan Khanna', 'Sourcing Manager', '+91 98110 50100', 'ishaan@techspace.example', 1],
    ['ct15', 'pt12', 'Bharat Anand', 'Plant Maintenance Head', '+91 98240 60110', 'bharat@anandtextile.example', 1],
    ['ct16', 'pt13', 'Dr. Meenakshi Rathore', 'Administrator', '+91 98290 70120', 'admin@heritagehospitals.example', 1],
    ['ct17', 'pt14', 'Vikram Tiwari', 'Proprietor', '+91 98380 80130', 'vikramelectro@example.com', 1],
    ['ct18', 'pt15', 'Aditya Chopra', 'VP – Projects', '+91 98190 90140', 'aditya@skylinerealty.example', 1],
    ['ct19', 'pt15', 'Pallavi Gokhale', 'Purchase Executive', '+91 98190 90141', 'pallavi@skylinerealty.example', 0],
    ['ct20', 'pt16', 'Joseph Mathew', 'Operations Manager', '+91 98470 11150', 'joseph@coastalfm.example', 1],
  ].map(([id, partyId, name, role, phone, email, primary]) => ({ id, partyId, name, role, phone, email, primary: !!primary }));

  /* ───────── rate card ───────── */
  const rateCard = [
    { id: 'rc1', category: 'Switches & Sockets', minMarginPct: 18, maxDiscPct: 8, approvalAbove: 500000 },
    { id: 'rc2', category: 'Protection', minMarginPct: 16, maxDiscPct: 8, approvalAbove: 500000 },
    { id: 'rc3', category: 'Distribution Boards', minMarginPct: 15, maxDiscPct: 7, approvalAbove: 500000 },
    { id: 'rc4', category: 'Wires & Cables', minMarginPct: 10, maxDiscPct: 6, approvalAbove: 500000 },
    { id: 'rc5', category: 'Conduits & Fittings', minMarginPct: 20, maxDiscPct: 10, approvalAbove: 500000 },
    { id: 'rc6', category: 'Lighting', minMarginPct: 22, maxDiscPct: 12, approvalAbove: 500000 },
    { id: 'rc7', category: 'Fans', minMarginPct: 18, maxDiscPct: 8, approvalAbove: 500000 },
    { id: 'rc8', category: 'Cable Management', minMarginPct: 20, maxDiscPct: 10, approvalAbove: 500000 },
  ];

  /* ───────── RFQs (seed) ───────── */
  // line spec: [productId, qty, confidence?, rawText?]
  const mkLines = (spec) => spec.map(([pid, qty, conf, text], i) => (pid
    ? { n: i + 1, text: text || PM[pid].name, productId: pid, name: PM[pid].name, qty, unit: PM[pid].unit, price: PM[pid].price, confidence: conf || 97, state: (conf || 97) < 80 ? 'review' : 'matched' }
    : { n: i + 1, text, productId: null, name: '', qty, unit: 'pcs', price: 0, confidence: 0, state: 'unmatched' }));
  const mkRfq = (num, partyId, contactId, status, subject, srcType, file, recvDays, dueDays, owner, notes, spec, extra = {}) => {
    const lines = mkLines(spec);
    return Object.assign({ id: 'rfq-' + num, no: 'RFQ-' + num, partyId, contactId, source: { type: srcType, file }, receivedAt: ago(recvDays, 2), due: ago(-dueDays), status, owner, subject, notes, total: sum(lines.filter((l) => l.productId)), lines }, extra);
  };
  const rfqs = [
    mkRfq(1001, 'pt03', 'ct04', 'won', 'Andheri commercial fit-out – full electrical package', 'email', 'BIS_Andheri_Electrical_BOQ.pdf', 24, -17, 'u3', 'Repeat client. Price-matched on cables.', [['p01', 800], ['p02', 420], ['p07', 150], ['p08', 80], ['p14', 120], ['p13', 100], ['p23', 90], ['p20', 600]], { quoteId: 'qt-1001' }),
    mkRfq(1002, 'pt06', 'ct08', 'won', 'Whitefield IT park – Phase 2 distribution', 'excel', 'Apex_WF2_Material_List.xlsx', 19, -12, 'u6', 'Delivery in 3 lots.', [['p11', 22], ['p12', 6], ['p09', 18], ['p17', 900], ['p18', 400], ['p30', 160]], { quoteId: 'qt-1002' }),
    mkRfq(1003, 'pt04', 'ct06', 'lost', 'Kalyani Heights – wiring & switchgear', 'whatsapp', null, 22, -15, 'u3', 'Lost on price to a local trader by ~4%.', [['p13', 300], ['p14', 260], ['p15', 90], ['p01', 1200], ['p02', 700]], { quoteId: 'qt-1003' }),
    mkRfq(1004, 'pt07', 'ct10', 'quoted', 'GIDC substation upgrade', 'pdf', 'GPS_GIDC_Tender_Annex_C.pdf', 6, 2, 'u3', 'Awaiting tender committee.', [['p18', 1200], ['p17', 1800], ['p31', 800], ['p32', 120], ['p33', 10], ['p34', 8]], { quoteId: 'qt-1004' }),
    mkRfq(1005, 'pt08', 'ct11', 'quoted', 'Sunrise Resort – guest-room electricals', 'email', 'Sunrise_Resort_BOQ_Rev3.pdf', 8, 3, 'u6', 'Wants warm-white downlights only.', [['p25', 1400], ['p01', 1800], ['p02', 900], ['p04', 120], ['p28', 80], ['p06', 300]], { quoteId: 'qt-1005' }),
    mkRfq(1006, 'pt11', 'ct14', 'review', 'Gurugram office fit-out – floor 7 & 8', 'email', 'TechSpace_Fl7-8_Electrical.pdf', 1, 1, 'u2', '2 lines need customer clarification on lux levels.', [['p24', 140], ['p26', 220], ['p01', 300], ['p13', 60, 72, 'wire 1.5 red 90m (any make)'], [null, 40, 0, 'Occupancy sensor ceiling mount 360°']], { quoteId: 'qt-1006' }),
    mkRfq(1007, 'pt12', 'ct15', 'new', 'Weaving shed – MCC panel feeders', 'whatsapp', null, 0, 2, 'u3', '', [['p18', 600], ['p33', 6], ['p09', 12, 68, '63A TP MCB']]),
    mkRfq(1008, 'pt13', 'ct16', 'quoted', 'Heritage Hospitals – OT wing', 'pdf', 'Heritage_OT_Wing_Spec.pdf', 5, 4, 'u2', 'Needs IP54 DBs, hospital-grade sockets.', [['p11', 14], ['p12', 4], ['p10', 40], ['p02', 260], ['p23', 120]], { quoteId: 'qt-1008' }),
    mkRfq(1009, 'pt15', 'ct18', 'quoted', 'Skyline Orchid – Tower C finishing', 'email', 'Orchid_TowerC_Electrical_RFQ.pdf', 4, 5, 'u3', 'Large; competing with two other bids.', [['p01', 2400], ['p02', 1300], ['p03', 600], ['p07', 500], ['p08', 260], ['p14', 420], ['p13', 380], ['p25', 1800], ['p28', 140]], { quoteId: 'qt-1009' }),
    mkRfq(1010, 'pt16', 'ct20', 'new', 'Mall HVAC & lighting retrofit', 'whatsapp', null, 0, 3, 'u6', '', [['p27', 60, 91], ['p26', 400], [null, 80, 0, 'DALI dimmable driver 40W']]),
    mkRfq(1011, 'pt02', 'ct03', 'won', 'Shop stock top-up – switches & MCBs', 'whatsapp', null, 11, -8, 'u3', 'Dealer reorder.', [['p01', 500], ['p07', 200], ['p06', 120], ['p20', 400]], { quoteId: 'qt-1011' }),
    mkRfq(1012, 'pt05', 'ct07', 'lost', 'Wires bulk – festival season', 'whatsapp', null, 17, -12, 'u2', 'Bought elsewhere; cash discount asked.', [['p13', 200], ['p14', 160]]),
    mkRfq(1013, 'pt09', 'ct12', 'new', 'Daily stock order sheet', 'excel', 'DWH_Oct27_Order.xlsx', 0, 1, 'u2', '', [['p01', 400], ['p05', 200], ['p20', 300], ['p29', 40], ['p04', 80, 79, 'regulator 5 step white']]),
    mkRfq(1014, 'pt10', 'ct13', 'won', 'T Nagar showroom lighting', 'email', 'Raman_Showroom_Lighting.pdf', 13, -9, 'u6', '', [['p23', 60], ['p25', 300], ['p26', 80]], { quoteId: 'qt-1014' }),
  ];

  /* ───────── quotes (seed) ───────── */
  const mkQuote = (num, rfqId, status, disc, validDays, approver, createdD, extra = {}) => {
    const r = rfqs.find((x) => x.id === rfqId);
    const lines = r.lines.filter((l) => l.productId).map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: Math.round(l.price * (1 - disc / 100)), discPct: disc }));
    return Object.assign({ id: 'qt-' + num, no: 'QT-2026-' + num, rfqId, partyId: r.partyId, status, total: sum(lines), marginPct: Math.round((22 - disc * 0.9) * 10) / 10, validTill: ago(-validDays), createdAt: ago(createdD, 1), approver, lines, terms: 'Prices ex-GST. Delivery 5–7 working days from PO. Payment as per account terms.' }, extra);
  };
  const quotes = [
    mkQuote(1001, 'rfq-1001', 'accepted', 6, -4, 'u1', 23), mkQuote(1002, 'rfq-1002', 'accepted', 5, -2, 'u1', 18),
    mkQuote(1003, 'rfq-1003', 'rejected', 4, -3, null, 21), mkQuote(1004, 'rfq-1004', 'sent', 5, 6, 'u1', 5),
    mkQuote(1005, 'rfq-1005', 'sent', 6, 7, 'u1', 7), mkQuote(1006, 'rfq-1006', 'draft', 3, 7, null, 0),
    mkQuote(1008, 'rfq-1008', 'pending_approval', 7, 7, null, 1), mkQuote(1009, 'rfq-1009', 'sent', 6, 8, 'u1', 3),
    mkQuote(1011, 'rfq-1011', 'accepted', 3, -2, null, 10), mkQuote(1014, 'rfq-1014', 'accepted', 5, -4, null, 12),
  ];

  /* ───────── orders / drafts / shipments ───────── */
  const mkOrder = (num, partyId, daysAgo, status, payment, spec, channel, extra = {}) => {
    const lines = spec.map(([pid, q]) => ln(pid, q));
    return Object.assign({ id: 'ord-' + num, no: 'SO-2026-' + num, partyId, status, total: sum(lines), placedAt: ago(daysAgo, 3), channel, payment, lines, erp: null }, extra);
  };
  const orders = [
    mkOrder(5001, 'pt03', 24, 'delivered', 'Credit', [['p01', 800], ['p02', 420], ['p07', 150], ['p14', 120], ['p23', 90]], 'email', { shipmentId: 'sh-7001' }),
    mkOrder(5002, 'pt06', 18, 'delivered', 'Credit', [['p11', 22], ['p12', 6], ['p09', 18], ['p17', 900]], 'email', { shipmentId: 'sh-7002' }),
    mkOrder(5003, 'pt02', 10, 'delivered', 'Paid', [['p01', 500], ['p07', 200], ['p06', 120]], 'whatsapp'),
    mkOrder(5004, 'pt10', 12, 'delivered', 'Credit', [['p23', 60], ['p25', 300]], 'email'),
    mkOrder(5005, 'pt09', 9, 'delivered', 'Paid', [['p01', 600], ['p05', 300], ['p20', 500]], 'whatsapp'),
    mkOrder(5006, 'pt05', 8, 'delivered', 'Credit', [['p13', 120], ['p14', 90]], 'whatsapp'),
    mkOrder(5007, 'pt15', 7, 'shipped', 'Credit', [['p01', 1800], ['p02', 900], ['p07', 400], ['p28', 80]], 'email', { shipmentId: 'sh-7003' }),
    mkOrder(5008, 'pt08', 6, 'shipped', 'Credit', [['p25', 900], ['p04', 120], ['p06', 300]], 'email', { shipmentId: 'sh-7004' }),
    mkOrder(5009, 'pt13', 5, 'packed', 'Credit', [['p11', 14], ['p10', 40], ['p02', 200]], 'email', { shipmentId: 'sh-7005' }),
    mkOrder(5010, 'pt14', 5, 'processing', 'Pending', [['p01', 300], ['p20', 400]], 'whatsapp'),
    mkOrder(5011, 'pt07', 4, 'processing', 'Credit', [['p18', 400], ['p31', 500], ['p32', 80]], 'pdf'),
    mkOrder(5012, 'pt11', 3, 'confirmed', 'Credit', [['p24', 60], ['p26', 120]], 'email'),
    mkOrder(5013, 'pt09', 2, 'confirmed', 'Paid', [['p29', 30], ['p04', 60], ['p01', 250]], 'whatsapp'),
    mkOrder(5014, 'pt16', 2, 'processing', 'Credit', [['p26', 200], ['p25', 150]], 'whatsapp'),
    mkOrder(5015, 'pt02', 1, 'confirmed', 'Paid', [['p03', 200], ['p08', 100], ['p22', 800]], 'whatsapp'),
    mkOrder(5016, 'pt12', 1, 'cancelled', 'Pending', [['p33', 4], ['p34', 4]], 'whatsapp'),
  ];
  const drafts = [
    { id: 'dr-3001', no: 'DO-3001', partyId: 'pt05', threadId: 't-103', status: 'pending', createdAt: ago(0, 3), by: 'Anuma', note: 'Parsed from WhatsApp, 1 line flagged for brand.', lines: [ln('p13', 100, { state: 'confirmed' }), ln('p14', 80, { state: 'confirmed' }), ln('p15', 20, { state: 'flagged' })] },
    { id: 'dr-3002', no: 'DO-3002', partyId: 'pt09', threadId: 't-105', status: 'pending', createdAt: ago(0, 5), by: 'Anuma', note: 'Daily dealer sheet matched 5/5 lines.', lines: [ln('p01', 400, { state: 'confirmed' }), ln('p05', 200, { state: 'confirmed' }), ln('p20', 300, { state: 'confirmed' })] },
    { id: 'dr-3003', no: 'DO-3003', partyId: 'pt14', threadId: null, status: 'pending', createdAt: ago(1), by: 'Rohit Verma', note: 'Phone order keyed by ASM.', lines: [ln('p07', 150, { state: 'confirmed' }), ln('p08', 100, { state: 'confirmed' })] },
    { id: 'dr-3004', no: 'DO-3004', partyId: 'pt02', threadId: 't-101', status: 'approved', createdAt: ago(2), by: 'Anuma', note: 'Approved by Imran.', lines: [ln('p03', 200, { state: 'confirmed' }), ln('p08', 100, { state: 'confirmed' })] },
    { id: 'dr-3005', no: 'DO-3005', partyId: 'pt12', threadId: null, status: 'rejected', createdAt: ago(3), by: 'Anuma', note: 'Rejected — customer over credit limit.', lines: [ln('p33', 4, { state: 'confirmed' }), ln('p34', 4, { state: 'confirmed' })] },
    { id: 'dr-3006', no: 'DO-3006', partyId: 'pt10', threadId: null, status: 'posted', createdAt: ago(4), by: 'Karan Mehta', note: 'Posted as SO-2026-5004.', lines: [ln('p23', 60, { state: 'confirmed' })] },
  ].map((d) => Object.assign(d, { total: sum(d.lines) }));
  const mkShip = (id, orderId, carrier, awb, status, etaD, from, to, evts) => ({ id, orderId, carrier, awb, status, eta: ago(-etaD), from, to, events: evts.map(([d, h, text]) => ({ at: ago(d, h), text })) });
  const shipments = [
    mkShip('sh-7001', 'ord-5001', 'Delhivery Freight', 'DLV8800123401', 'delivered', -20, 'Bhiwandi WH', 'Mumbai – Andheri East', [[22, 4, 'Picked up'], [21, 2, 'Reached Mumbai hub'], [20, 6, 'Delivered – signed by site engineer']]),
    mkShip('sh-7002', 'ord-5002', 'VRL Logistics', 'VRL4402199812', 'delivered', -14, 'Bhiwandi WH', 'Bengaluru – Whitefield', [[16, 5, 'Picked up'], [14, 3, 'In transit – Pune hub'], [12, 8, 'Delivered']]),
    mkShip('sh-7003', 'ord-5007', 'Gati KWE', 'GKE2210984412', 'in_transit', 1, 'Bhiwandi WH', 'Navi Mumbai – Kharghar', [[5, 4, 'Picked up'], [1, 6, 'Out for delivery – lot 1 of 2']]),
    mkShip('sh-7004', 'ord-5008', 'Safexpress', 'SFX9981204455', 'in_transit', 2, 'Bhiwandi WH', 'Hyderabad – Gachibowli', [[5, 7, 'Picked up'], [2, 3, 'Reached Hyderabad hub']]),
    mkShip('sh-7005', 'ord-5009', 'Delhivery Freight', 'DLV8800456712', 'pickup', 4, 'Bhiwandi WH', 'Jaipur – Malviya Nagar', [[0, 6, 'Pickup scheduled for tomorrow 10:00']]),
  ];

  /* ───────── threads (seed) ───────── */
  const M = (id, from, text, d, h, type = 'text', meta) => ({ id, from, type, text, at: ago(d, h), meta });
  const threads = [
    { id: 't-101', partyId: 'pt02', contactId: 'ct03', channel: 'whatsapp', subject: 'Reorder — switches & MCBs', owner: 'anuma', status: 'open', unread: 0, preview: 'Order confirmed ✔ SO-2026-5003 will dispatch tomorrow', lastAt: ago(1, 1), priority: 'normal', draftId: 'dr-3004', messages: [
      M('t101-1', 'customer', 'Namaste, 500 pcs 6A switch white, 200 MCB 16A aur 120 MCB 6A chahiye. Rate bhejo', 2, 6), M('t101-2', 'anuma', 'Namaste Sanjay ji! Dealer rate (Band B): Switch 6A ₹36.5, MCB 16A ₹146, MCB 6A ₹142. Total ₹ 66,320 + GST. Confirm kar du?', 2, 6),
      M('t101-3', 'customer', 'Haan confirm. Advance bhej diya', 2, 5), M('t101-4', 'anuma', 'Payment received ₹78,258. Draft order DO-3004 sent for approval.', 2, 5), M('t101-5', 'u4', 'Approved. Packing today.', 2, 3), M('t101-6', 'anuma', 'Order confirmed ✔ SO-2026-5003 will dispatch tomorrow', 1, 1)] },
    { id: 't-102', partyId: 'pt03', contactId: 'ct04', channel: 'email', subject: 'Re: Quote status — Powai Phase-3', owner: 'u3', status: 'open', unread: 1, preview: 'Can we get a revised rate if we lock 3 months of supply?', lastAt: ago(0, 1), priority: 'high', dealId: 'ld-103', messages: [
      M('t102-1', 'customer', 'Hi team, following up on our Powai Phase-3 electrical BOQ. We need rates valid for 90 days.', 1, 4), M('t102-2', 'anuma', 'Hi Ritu, we have noted the request. Sneha Kulkarni will share a 90-day price-hold proposal today.', 1, 4),
      M('t102-3', 'u3', 'Hi Ritu — attaching a 90-day price-hold quote. Cable rates indexed to copper LME, rest fixed.', 1, 1, 'file', { name: 'QT-Powai-P3-v2.pdf' }), M('t102-4', 'customer', 'Thanks. Can we get a revised rate if we lock 3 months of supply?', 0, 1)] },
    { id: 't-103', partyId: 'pt05', contactId: 'ct07', channel: 'whatsapp', subject: 'Wire order', owner: 'anuma', status: 'open', unread: 2, preview: '4mm ka bhi 20 coil add karo', lastAt: ago(0, 3), priority: 'normal', draftId: 'dr-3001', messages: [
      M('t103-1', 'customer', 'Bhai wire 1.5 ke 100 coil, 2.5 ke 80 coil', 0, 4), M('t103-2', 'anuma', 'Noted: FRLS 1.5 sqmm ×100 coil, 2.5 sqmm ×80 coil (Kavach 90m). Anything else?', 0, 4),
      M('t103-3', 'customer', '4mm ka bhi 20 coil add karo', 0, 3), M('t103-4', 'anuma', 'Added 4 sqmm ×20 coil — but brand not clear (Kavach assumed). Draft DO-3001 is with Imran.', 0, 3, 'card', { kind: 'draft', draftId: 'dr-3001' })] },
    { id: 't-104', partyId: 'pt15', contactId: 'ct18', channel: 'email', subject: 'Orchid Tower C — revised quantities', owner: 'u3', status: 'hold', unread: 0, preview: 'Hold until client finalises layout', lastAt: ago(1, 6), priority: 'high', rfqId: 'rfq-1009', messages: [
      M('t104-1', 'customer', 'Quantities for Tower C changed after the architect revision, will resend by Thursday.', 2, 2), M('t104-2', 'u3', 'Noted Aditya — keeping RFQ-1009 on hold; current quote stays valid till 4 Nov.', 2, 1), M('t104-3', 'system', 'Thread put on hold by Sneha Kulkarni', 1, 6, 'text')] },
    { id: 't-105', partyId: 'pt09', contactId: 'ct12', channel: 'whatsapp', subject: 'Daily order', owner: 'anuma', status: 'open', unread: 1, preview: 'Excel bhej raha hu', lastAt: ago(0, 5), priority: 'normal', rfqId: 'rfq-1013', draftId: 'dr-3002', messages: [
      M('t105-1', 'customer', 'Excel bhej raha hu aaj ka', 0, 6), M('t105-2', 'customer', 'DWH_Oct27_Order.xlsx', 0, 6, 'file', { name: 'DWH_Oct27_Order.xlsx', size: '18 KB' }), M('t105-3', 'anuma', 'Got it. 5 lines read, 4 matched, 1 regulator needs a colour — white or grey?', 0, 5)] },
    { id: 't-106', partyId: 'pt06', contactId: 'ct08', channel: 'email', subject: 'Whitefield P2 — lot 2 dispatch', owner: 'u6', status: 'open', unread: 0, preview: 'Lot 2 arrives Thursday, please keep unloading crew ready', lastAt: ago(1, 2), priority: 'normal', messages: [
      M('t106-1', 'customer', 'When can we expect lot 2 of DBs and MCBs?', 2, 3), M('t106-2', 'u6', 'Lot 2 left Bhiwandi this morning, AWB VRL4402199812.', 2, 1), M('t106-3', 'anuma', 'Lot 2 arrives Thursday, please keep unloading crew ready', 1, 2)] },
    { id: 't-107', partyId: 'pt12', contactId: 'ct15', channel: 'whatsapp', subject: 'Isolators & changeover', owner: 'anuma', status: 'open', unread: 1, preview: '6 nos 4P isolator chahiye 63A', lastAt: ago(0, 7), priority: 'normal', rfqId: 'rfq-1007', messages: [
      M('t107-1', 'customer', 'MCC feeders ke liye 6 nos 4P isolator chahiye 63A, aur 600 mtr 4C 25 armoured', 0, 7), M('t107-2', 'anuma', 'Created RFQ-1007 with 2 lines. 63A TP MCB wording unclear — please confirm if you need an MCB or an isolator.', 0, 7)] },
    { id: 't-108', partyId: 'pt08', contactId: 'ct11', channel: 'indiamart', subject: 'IndiaMART lead — LED downlights bulk', owner: 'anuma', status: 'open', unread: 0, preview: 'Lead enquiry: 1400 pcs 12W warm white', lastAt: ago(2, 2), priority: 'normal', messages: [
      M('t108-1', 'customer', 'Need 1400 pcs 12W warm white downlight for resort, quote asap. Delivery Hyderabad.', 2, 3), M('t108-2', 'anuma', 'Thanks Srinivas — Lumera 12W Round 3000K at ₹230 on 1000+ qty. RFQ-1005 raised.', 2, 3)] },
    { id: 't-109', partyId: 'pt11', contactId: 'ct14', channel: 'email', subject: 'Fl 7 & 8 electrical RFQ — clarifications', owner: 'u2', status: 'open', unread: 1, preview: 'Lux level for open-plan is 400 or 500?', lastAt: ago(0, 2), priority: 'normal', rfqId: 'rfq-1006', messages: [
      M('t109-1', 'customer', 'Please find RFQ for Fl 7 & 8.', 1, 5), M('t109-2', 'customer', 'TechSpace_Fl7-8_Electrical.pdf', 1, 5, 'file', { name: 'TechSpace_Fl7-8_Electrical.pdf', size: '286 KB' }),
      M('t109-3', 'anuma', 'Received. 5 lines read; occupancy sensor not in catalogue — Rohit will confirm alternates.', 1, 5), M('t109-4', 'u2', 'Ishaan, lux level for open-plan is 400 or 500? Affects panel wattage.', 0, 2)] },
    { id: 't-110', partyId: 'pt13', contactId: 'ct16', channel: 'web', subject: 'Web form — OT wing enquiry', owner: 'u2', status: 'closed', unread: 0, preview: 'Quote sent, awaiting PO', lastAt: ago(4, 2), priority: 'normal', rfqId: 'rfq-1008', messages: [
      M('t110-1', 'customer', 'OT wing: IP54 DBs, hospital-grade sockets. Please quote.', 5, 3), M('t110-2', 'u2', 'Quote QT-2026-1008 sent for approval.', 4, 2)] },
  ];

  /* ───────── leads ───────── */
  const leads = [
    ['ld-101', 'Andheri fit-out — repeat supply', 'pt03', 'Won', 1920000, 'u3', 'Email', 24, -17, 'rfq-1001'], ['ld-102', 'Whitefield Phase 2 distribution', 'pt06', 'Won', 2380000, 'u6', 'Email', 19, -12, 'rfq-1002'],
    ['ld-103', 'Powai Phase-3 price hold', 'pt03', 'Negotiation', 3150000, 'u3', 'Email', 9, 6, null], ['ld-104', 'GIDC substation upgrade', 'pt07', 'Quoted', 1860000, 'u3', 'PDF', 6, 2, 'rfq-1004'],
    ['ld-105', 'Sunrise Resort guest rooms', 'pt08', 'Quoted', 2540000, 'u6', 'IndiaMART', 8, 3, 'rfq-1005'], ['ld-106', 'Skyline Orchid Tower C', 'pt15', 'Negotiation', 4380000, 'u3', 'Email', 4, 5, 'rfq-1009'],
    ['ld-107', 'Heritage OT wing', 'pt13', 'Quoted', 1340000, 'u2', 'Web form', 5, 4, 'rfq-1008'], ['ld-108', 'TechSpace Fl 7 & 8', 'pt11', 'Qualified', 690000, 'u2', 'Email', 1, 7, 'rfq-1006'],
    ['ld-109', 'Anand Textile — MCC feeders', 'pt12', 'New', 540000, 'u3', 'WhatsApp', 0, 9, 'rfq-1007'], ['ld-110', 'Mall retrofit — lighting', 'pt16', 'New', 780000, 'u6', 'WhatsApp', 0, 10, 'rfq-1010'],
    ['ld-111', 'Kalyani Heights wiring', 'pt04', 'Lost', 1210000, 'u3', 'WhatsApp', 22, -15, 'rfq-1003'], ['ld-112', 'Festival wires bulk', 'pt05', 'Lost', 380000, 'u2', 'WhatsApp', 17, -12, 'rfq-1012'],
  ].map(([id, title, partyId, stage, value, owner, source, c, close, rfqId]) => ({ id, title, partyId, stage, value, owner, source, createdAt: ago(c), closeAt: ago(-close), rfqId, notes: '' }));

  /* ───────── marketing ───────── */
  const lists = [
    { id: 'ls1', name: 'Active dealers', count: 6, rule: 'type = Dealer AND status = active', updatedAt: ago(2) }, { id: 'ls2', name: 'EPC & MEP contractors', count: 5, rule: 'type contains Contractor', updatedAt: ago(5) },
    { id: 'ls3', name: 'Quiet 30+ days', count: 3, rule: 'last order > 30 days', updatedAt: ago(1) }, { id: 'ls4', name: 'Builders — West region', count: 3, rule: 'type = Builder AND region = West', updatedAt: ago(9) },
  ];
  const templates = [
    ['tp1', 'rfq_ack_v2', 'whatsapp', 'Utility', 'approved', 'Hi {{1}}, we have received your RFQ {{2}}. Our team will share prices by {{3}}.'], ['tp2', 'quote_ready', 'whatsapp', 'Utility', 'approved', 'Hi {{1}}, your quote {{2}} for ₹{{3}} is ready: {{4}}'],
    ['tp3', 'price_update_oct', 'whatsapp', 'Marketing', 'approved', 'Hi {{1}}, Kavach FRLS wire prices change on {{2}}. Lock rates now with a PO before then.'], ['tp4', 'dispatch_notice', 'whatsapp', 'Utility', 'approved', 'Your order {{1}} has been dispatched via {{2}}. AWB {{3}}.'],
    ['tp5', 'festive_led_offer', 'whatsapp', 'Marketing', 'pending', 'Diwali offer: Lumera LED panels at special dealer pricing till {{1}}.'], ['tp6', 'payment_reminder', 'whatsapp', 'Utility', 'approved', 'Hi {{1}}, a gentle reminder: invoice {{2}} of ₹{{3}} is due on {{4}}.'],
    ['tp7', 'rfq_followup_email', 'email', 'Utility', 'approved', 'Subject: Following up on {{1}}\n\nHi {{2}}, did our quote work for you? Happy to revise.'], ['tp8', 'new_catalogue', 'email', 'Marketing', 'rejected', 'Our 2026 catalogue is out. Download: {{1}}'],
  ].map(([id, name, channel, category, status, body]) => ({ id, name, channel, category, status, lang: 'en', body }));
  const campaigns = [
    ['cp1', 'Kavach wire price-lock notice', 'whatsapp', 'sent', 'Active dealers', 'ls1', 6, 6, 5, 3, 2, 9, 'tp3'], ['cp2', 'Diwali LED panel offer', 'whatsapp', 'scheduled', 'EPC & MEP contractors', 'ls2', 0, 0, 0, 0, 0, 2, 'tp5'],
    ['cp3', 'Win-back: quiet 30+ days', 'whatsapp', 'running', 'Quiet 30+ days', 'ls3', 3, 3, 2, 1, 0, 4, 'tp6'], ['cp4', 'New catalogue 2026', 'email', 'draft', 'Builders — West region', 'ls4', 0, 0, 0, 0, 0, 1, 'tp8'],
    ['cp5', 'Quote follow-up nudges', 'email', 'sent', 'EPC & MEP contractors', 'ls2', 5, 5, 4, 2, 1, 14, 'tp7'],
  ].map(([id, name, channel, status, audience, listId, sent, delivered, read, replied, orders, d, templateId]) => ({ id, name, channel, status, audience, listId, sent, delivered, read, replied, orders, createdAt: ago(d), templateId }));

  /* ───────── agents ───────── */
  const agents = [
    { id: 'ag1', name: 'RFQ intake desk', status: 'live', channelId: 'ch2', role: 'Reads RFQs arriving by email and WhatsApp (PDF, Excel, plain text), extracts line items, matches them to the catalogue and prepares a draft quote for the sales owner.', initialMessage: 'Hi, this is Access Electricals. Share your requirement — PDF, Excel or plain text — and we will revert with prices.',
      rules: [{ id: 'r1', kind: 'rule', scope: 'inherited', text: 'Never quote below the rate-card minimum margin for any category.' }, { id: 'r2', kind: 'guardrail', scope: 'inherited', text: 'Quotes above ₹5,00,000 or with discount above rate-card max must be approved by the owner.' }, { id: 'r3', kind: 'rule', scope: 'agent', text: 'Match lines at 80%+ confidence automatically; below that, ask the sales owner to resolve.' }, { id: 'r4', kind: 'helper', scope: 'agent', text: 'If a line is not stocked, say so plainly and offer the nearest alternative; never invent SKUs.' }, { id: 'r5', kind: 'rule', scope: 'agent', text: 'Acknowledge every RFQ within 5 minutes with the RFQ number and expected quote time.' }],
      sources: [{ id: 's1', type: 'document', title: 'Access Electricals — Price list Oct 2026.xlsx', state: 'indexed', addedBy: 'Deepa Nair', addedAt: ago(9), usedIn: 212 }, { id: 's2', type: 'document', title: 'Kavach cable equivalence chart.pdf', state: 'indexed', addedBy: 'Sneha Kulkarni', addedAt: ago(21), usedIn: 87 }, { id: 's3', type: 'link', title: 'access-electricals.example/terms', state: 'indexed', addedBy: 'Deepa Nair', addedAt: ago(30), usedIn: 54 }, { id: 's4', type: 'chat', title: 'WhatsApp thread — Shree Sai (reorder style)', state: 'pending', addedBy: 'Rohit Verma', addedAt: ago(1), usedIn: 0 }],
      learned: [{ id: 'l1', text: '“Red 90 mtr” on a wire line means FRLS house wire, 90m coil.', at: ago(11) }, { id: 'l2', text: 'Dealers in Nashik prefer WhatsApp text in Hinglish; reply in the same style.', at: ago(7) }, { id: 'l3', text: 'Meridian Projects RFQs always come with an annexure of units; read page 3 first.', at: ago(4) }],
      gaps: [{ id: 'g1', text: 'No catalogue entry for fire-survival (FS) cables', count: 4 }, { id: 'g2', text: 'Occupancy / PIR sensors not stocked', count: 3 }, { id: 'g3', text: 'DALI dimmable drivers asked 2 times', count: 2 }],
      training: [{ id: 'tr1', at: ago(6), by: 'Sneha Kulkarni', prompt: 'When customers write “1.5 red”, assume FRLS 1.5 sq mm house wire.', added: ['Treat “red 90m” as FRLS house wire coil.'], removed: [] }, { id: 'tr2', at: ago(14), by: 'Deepa Nair', prompt: 'Stop offering free delivery on orders below ₹50,000.', added: ['Free delivery only on orders ≥ ₹50,000 within 150 km.'], removed: ['Free delivery on all orders in Maharashtra.'] }],
      activity: [{ id: 'a1', at: ago(0, 2), action: 'Parsed RFQ-1013 from Excel (5 lines)', outcome: 'handled', channel: 'whatsapp', caseId: 't-105' }, { id: 'a2', at: ago(0, 7), action: 'Created RFQ-1007, 1 line escalated', outcome: 'escalated', channel: 'whatsapp', caseId: 't-107' }, { id: 'a3', at: ago(1, 5), action: 'Matched 4/5 lines for RFQ-1006', outcome: 'validation', channel: 'email', caseId: 't-109' }, { id: 'a4', at: ago(2, 3), action: 'Raised RFQ-1005 from IndiaMART lead', outcome: 'handled', channel: 'indiamart', caseId: 't-108' }],
      kpis: { handled: 148, autoRate: 71, escalated: 23, avgReplySec: 42 } },
    { id: 'ag2', name: 'Order status line', status: 'live', channelId: 'ch1', role: 'Answers “where is my order” on WhatsApp using shipment tracking and invoices, and nudges customers on pending payments.', initialMessage: 'Hello! Share your order number or party name and I will fetch the latest status.',
      rules: [{ id: 'r1', kind: 'rule', scope: 'inherited', text: 'Never quote below the rate-card minimum margin for any category.' }, { id: 'r2', kind: 'guardrail', scope: 'agent', text: 'Never share another party’s order or price information.' }, { id: 'r3', kind: 'helper', scope: 'agent', text: 'Include AWB and carrier link in every dispatch reply.' }],
      sources: [{ id: 's1', type: 'document', title: 'Carrier SLA & pincode matrix.pdf', state: 'indexed', addedBy: 'Imran Sheikh', addedAt: ago(19), usedIn: 64 }],
      learned: [{ id: 'l1', text: 'Gati lots usually show “out for delivery” only on the day of arrival.', at: ago(8) }], gaps: [{ id: 'g1', text: 'Customers ask for e-way bill copies', count: 3 }],
      training: [{ id: 'tr1', at: ago(12), by: 'Imran Sheikh', prompt: 'Share invoice PDF when asked for bill.', added: ['Attach tax invoice PDF if requested.'], removed: [] }],
      activity: [{ id: 'a1', at: ago(0, 4), action: 'Shared AWB for SO-2026-5007', outcome: 'handled', channel: 'whatsapp', caseId: 't-106' }, { id: 'a2', at: ago(1, 8), action: 'Escalated e-way bill request', outcome: 'escalated', channel: 'whatsapp', caseId: null }],
      kpis: { handled: 96, autoRate: 88, escalated: 8, avgReplySec: 19 } },
    { id: 'ag3', name: 'Dealer win-back', status: 'draft', channelId: null, role: 'Re-engages dealers with no order in 30+ days with a personalised price-lock message.', initialMessage: 'Hi, quick check-in from Access Electricals…',
      rules: [{ id: 'r1', kind: 'guardrail', scope: 'agent', text: 'Maximum one outbound nudge per dealer per week.' }], sources: [], learned: [], gaps: [], training: [], activity: [], kpis: { handled: 0, autoRate: 0, escalated: 0, avgReplySec: 0 } },
  ];

  /* ───────── workflows ───────── */
  const nd = (id, type, label, detail, x, y) => ({ id, type, label, detail, x, y });
  const workflows = [
    { id: 'wf1', name: 'RFQ intake & parse', status: 'active', trigger: 'New email or WhatsApp with attachment', runs: 312, lastRun: ago(0, 1), nodes: [nd('n1', 'trigger', 'Inbound RFQ', 'Email to rfq@ or WhatsApp media', 40, 120), nd('n2', 'action', 'Extract line items', 'PDF / Excel / text parser', 280, 120), nd('n3', 'action', 'Match to catalogue', 'Confidence floor 80%', 520, 120), nd('n4', 'condition', 'Any line below 80%?', 'Yes → human review', 760, 120), nd('n5', 'action', 'Assign to sales owner', 'Notify in app + WhatsApp', 1000, 60), nd('n6', 'action', 'Draft quote', 'Apply rate card', 1000, 190)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5', label: 'Yes' }, { from: 'n4', to: 'n6', label: 'No' }] },
    { id: 'wf2', name: 'Quote approval routing', status: 'active', trigger: 'Quote created', runs: 74, lastRun: ago(1), nodes: [nd('n1', 'trigger', 'Quote created', '', 40, 100), nd('n2', 'condition', 'Value > ₹5,00,000 or discount > rate-card max?', '', 280, 100), nd('n3', 'action', 'Request approval from Owner', 'Approvals queue', 560, 40), nd('n4', 'action', 'Send quote to customer', 'Email + WhatsApp', 560, 170)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }, { from: 'n2', to: 'n4', label: 'No' }] },
    { id: 'wf3', name: 'Stock-short alert', status: 'active', trigger: 'Quote accepted', runs: 29, lastRun: ago(2), nodes: [nd('n1', 'trigger', 'Quote accepted', '', 40, 100), nd('n2', 'condition', 'Any line qty > stock?', '', 280, 100), nd('n3', 'action', 'Alert purchase team', 'Slack #purchase', 560, 40), nd('n4', 'delay', 'Wait for restock ETA', '', 560, 170), nd('n5', 'action', 'Split shipment', 'Partial dispatch + backorder', 800, 170)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }, { from: 'n2', to: 'n4', label: 'Yes' }, { from: 'n4', to: 'n5' }] },
    { id: 'wf4', name: 'Dormant dealer win-back', status: 'draft', trigger: 'Weekly, Monday 10:00', runs: 0, lastRun: null, nodes: [nd('n1', 'trigger', 'Every Monday', '', 40, 100), nd('n2', 'condition', 'No order in 30 days?', '', 280, 100), nd('n3', 'action', 'Send price-lock template', 'WhatsApp', 560, 100)], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'Yes' }] },
  ];

  /* ───────── channels, apps ───────── */
  const channels = [
    { id: 'ch1', type: 'whatsapp', name: 'WhatsApp — Sales desk', number: '+91 98200 98200', provider: '360dialog', state: 'connected', webhook: 'healthy', lastEvent: ago(0, 0, 4) },
    { id: 'ch2', type: 'email', name: 'rfq@access-electricals.example', number: 'rfq@access-electricals.example', provider: 'Gmail', state: 'connected', webhook: 'healthy', lastEvent: ago(0, 1) },
    { id: 'ch3', type: 'indiamart', name: 'IndiaMART Leads', number: 'Seller ID 4417209', provider: 'IndiaMART', state: 'connected', webhook: 'healthy', lastEvent: ago(2) },
    { id: 'ch4', type: 'web', name: 'Website RFQ form', number: 'access-electricals.example/rfq', provider: 'Embedded form', state: 'connected', webhook: 'healthy', lastEvent: ago(4) },
    { id: 'ch5', type: 'telegram', name: 'Telegram bot — Site engineers', number: '@AccessElectricalsBot', provider: 'Telegram', state: 'disconnected', webhook: 'failing', lastEvent: ago(19) },
  ];
  const apps = [
    ['gsheets', 'Google Sheets', 'Export RFQs, quotes and stock to a live sheet.', 'Productivity', 'connected', 'ops@access-electricals.example', 'RFQ tracker sheet', '#16a34a', 'S'],
    ['gmail', 'Gmail', 'Read RFQ emails and send quotes from your own address.', 'Email', 'connected', 'rfq@access-electricals.example', null, '#dc2626', 'G'],
    ['whatsapp', 'WhatsApp Business (360dialog)', 'Cloud API for the sales desk number.', 'Messaging', 'connected', '+91 98200 98200', null, '#16a34a', 'W'],
    ['indiamart', 'IndiaMART', 'Pull buy-leads straight into Inbox.', 'Lead sources', 'connected', 'Seller 4417209', null, '#2563eb', 'I'],
    ['shiprocket', 'Shiprocket', 'Book freight and track AWBs.', 'Shipping', 'connected', 'Access Electricals', null, '#7c3aed', 'S'],
    ['tally', 'Tally Prime', 'Post invoices and vouchers to Tally.', 'Accounting', 'available', null, null, '#b45309', 'T'],
    ['zohobooks', 'Zoho Books', 'Sync invoices and payments.', 'Accounting', 'available', null, null, '#dc2626', 'Z'],
    ['razorpay', 'Razorpay', 'Collect advance via payment links.', 'Payments', 'available', null, null, '#1d4ed8', 'R'],
    ['shopify', 'Shopify', 'Import dealer-portal orders.', 'Commerce', 'available', null, null, '#4d7c0f', 'S'],
    ['slack', 'Slack', 'Alerts for approvals and stock shortages.', 'Notifications', 'available', null, null, '#7e22ce', '#'],
    ['telegram', 'Telegram', 'Bot for site engineers.', 'Messaging', 'available', null, null, '#0284c7', 'T'],
    ['plivo', 'Plivo', 'SMS and voice fallbacks.', 'Messaging', 'available', null, null, '#059669', 'P'],
  ].map(([slug, name, desc, category, state, account, lastSync, icon, letter]) => ({ slug, name, desc, category, state, account, lastSync: state === 'connected' ? ago(0, 0, 8) : undefined, config: lastSync ? { sheet: lastSync, autoSync: true } : state === 'connected' ? {} : undefined, icon, letter }));

  /* ───────── logs, notifications, rulebook, usage, dash ───────── */
  const logSeed = [
    ['Anuma', 'Parsed RFQ-1013 from Excel', 'RFQ-1013', 'handled', 'action', 'whatsapp', 2], ['Anuma', 'Flagged line “63A TP MCB”', 'RFQ-1007', 'escalated', 'alert', 'whatsapp', 7], ['Rohit Verma', 'Asked client for lux level', 'RFQ-1006', 'sent', 'action', 'email', 2],
    ['Anuma', 'Matched 4/5 lines', 'RFQ-1006', 'validation', 'validation', 'email', 29], ['Imran Sheikh', 'Approved draft DO-3004', 'SO-2026-5003', 'approved', 'action', 'web', 48], ['Anuma', 'Order confirmed message sent', 'Shree Sai Electricals', 'handled', 'action', 'whatsapp', 25],
    ['Sneha Kulkarni', 'Put thread on hold', 'RFQ-1009', 'done', 'action', 'email', 30], ['Anuma', 'Raised RFQ from IndiaMART lead', 'RFQ-1005', 'handled', 'action', 'indiamart', 52], ['Demo Merchant User', 'Approved quote QT-2026-1005', 'QT-2026-1005', 'approved', 'action', 'web', 150],
    ['System', 'Telegram webhook failing (HTTP 401)', 'Telegram bot', 'failed', 'alert', 'telegram', 220], ['Anuma', 'Stock alert: Kavach FRLS 6 sq mm below reorder level', 'KV-FRLS-60-90R', 'alerted', 'alert', 'web', 270], ['Karan Mehta', 'Posted draft DO-3006', 'SO-2026-5004', 'posted', 'action', 'web', 330],
    ['Anuma', 'Quote follow-up sent (day 3)', 'QT-2026-1004', 'handled', 'action', 'email', 360], ['Deepa Nair', 'Updated rate card: Lighting max disc 12%', 'Rate card', 'saved', 'action', 'web', 410], ['Anuma', 'Read PDF annexure (3 pages)', 'RFQ-1009', 'handled', 'action', 'email', 540],
    ['Sneha Kulkarni', 'Edited quote line discounts', 'QT-2026-1009', 'saved', 'action', 'web', 560], ['System', 'Google Sheets sync complete (14 rows)', 'RFQ tracker sheet', 'synced', 'action', 'web', 600], ['Anuma', 'Escalated e-way bill request', 'Order status line', 'escalated', 'alert', 'whatsapp', 680],
    ['Rohit Verma', 'Created party Nirmal Electro Mart contact', 'ct07', 'created', 'action', 'web', 720], ['Anuma', 'Training applied: “red 90m” = FRLS wire', 'RFQ intake desk', 'learned', 'action', 'web', 800], ['System', 'Carrier booking confirmed (Gati)', 'SO-2026-5007', 'booked', 'action', 'web', 1000],
    ['Anuma', 'Draft DO-3002 created', 'Delhi Wiring House', 'handled', 'action', 'whatsapp', 1100], ['Imran Sheikh', 'Rejected draft DO-3005 (credit limit)', 'DO-3005', 'rejected', 'action', 'web', 1500], ['Anuma', 'Win-back message queued', 'Quiet 30+ days', 'scheduled', 'action', 'whatsapp', 1600], ['System', 'Daily backup finished', 'Workspace', 'ok', 'action', 'web', 1700],
  ];
  const logs = logSeed.map(([actor, action, target, outcome, kind, channel, mins], i) => ({ id: 'lg' + (i + 1), at: ago(0, 0, mins), actor, action, target, outcome, kind, channel }));
  const notifications = [
    { id: 'nt1', tab: 'human', from: 'Anuma', subject: 'RFQ-1007 needs your decision', body: '“63A TP MCB” — MCB or isolator? Waiting on Sneha.', href: '/orders/rfqs/rfq-1007', at: ago(0, 7), unread: true },
    { id: 'nt2', tab: 'human', from: 'Anuma', subject: 'Quote QT-2026-1008 awaiting approval', body: 'Heritage Hospitals — ₹13.4 L, discount 7% on cables.', href: '/quotes/approvals', at: ago(1), unread: true },
    { id: 'nt3', tab: 'agent', from: 'RFQ intake desk', subject: 'Parsed RFQ-1013 (5 lines)', body: '4 matched automatically, 1 needs a colour.', href: '/orders/rfqs/rfq-1013', at: ago(0, 2), unread: false },
    { id: 'nt4', tab: 'agent', from: 'Order status line', subject: 'SO-2026-5007 out for delivery', body: 'Gati AWB GKE2210984412 — lot 1 of 2.', href: '/orders/ord-5007', at: ago(1, 6), unread: false },
    { id: 'nt5', tab: 'human', from: 'System', subject: 'Telegram channel disconnected', body: 'Webhook returned 401. Re-authorise the bot token.', href: '/settings/channels', at: ago(0, 4), unread: true },
  ];
  const rulebook = [
    ['rule', 'inherited', 'Never quote below the rate-card minimum margin for any category.'], ['guardrail', 'inherited', 'Quotes above ₹5,00,000 need owner approval before sending.'], ['rule', 'inherited', 'Prices are ex-GST; always mention “GST extra as applicable”.'], ['guardrail', 'inherited', 'Never share one customer’s price or order with another.'],
    ['rule', 'agent', 'Match lines at 80%+ confidence automatically; below that, ask a human.'], ['helper', 'agent', 'Reply in the customer’s language and style (Hindi / Hinglish / English).'], ['rule', 'inherited', 'Free delivery on orders ≥ ₹50,000 within 150 km of Bhiwandi.'], ['guardrail', 'inherited', 'Quote validity is 14 days unless the owner extends it.'],
  ].map(([kind, scope, text], i) => ({ id: 'rb' + (i + 1), kind, scope, text, enabled: i !== 7 || true }));
  const usage = { plan: 'Growth', period: 'Oct 1 – Oct 31, 2026', items: [{ label: 'Messages handled', used: 6840, limit: 10000 }, { label: 'Documents parsed (PDF/Excel)', used: 312, limit: 500 }, { label: 'Agent seats', used: 3, limit: 5 }, { label: 'Human seats', used: 7, limit: 10 }, { label: 'Storage (GB)', used: 4.8, limit: 20 }] };
  const Q0 = 4860000;
  const OPEN0 = rfqs.filter((r) => ['new', 'review'].includes(r.status)).length;
  const dash = {
    kpis: [{ key: 'quoted', label: 'Quoted this month', value: Q0, delta: 12, fmt: 'inr' }, { key: 'open', label: 'Open RFQs', value: OPEN0, delta: -2, fmt: 'num' }, { key: 'resp', label: 'Avg time to quote', value: 190, delta: -18, fmt: 'min' }, { key: 'win', label: 'Win rate', value: 41, delta: 3, fmt: 'pct' }, { key: 'orders', label: 'Orders (30d)', value: orders.length, delta: 8, fmt: 'num' }, { key: 'revenue', label: 'Revenue (30d)', value: orders.reduce((a, o) => a + (o.status === 'cancelled' ? 0 : o.total), 0), delta: 9, fmt: 'inr' }],
    revenue: [{ l: 'Apr', v: 3.1e6 }, { l: 'May', v: 3.6e6 }, { l: 'Jun', v: 3.3e6 }, { l: 'Jul', v: 4.2e6 }, { l: 'Aug', v: 4.8e6 }, { l: 'Sep', v: 5.1e6 }, { l: 'Oct', v: 4.4e6 }],
    funnel: [{ l: 'RFQs received', v: 64 }, { l: 'Matched', v: 58 }, { l: 'Quoted', v: 49 }, { l: 'Won', v: 20 }],
    topParties: parties.slice().sort((a, b) => b.lifetime - a.lifetime).slice(0, 5).map((p) => ({ l: p.name, v: p.lifetime })),
    alerts: [{ id: 'al1', text: 'RFQ-1007 has a line waiting on a human decision', tone: 'amber', href: '/orders/rfqs/rfq-1007' }, { id: 'al2', text: 'Quote QT-2026-1008 is waiting for your approval', tone: 'blue', href: '/quotes/approvals' }, { id: 'al3', text: 'FRLS 6 sq mm wire stock is below reorder level (180 coils)', tone: 'red', href: '/products/p16' }, { id: 'al4', text: 'Telegram channel disconnected', tone: 'red', href: '/settings/channels' }],
    activity: logs.slice(0, 6).map((l) => ({ at: l.at, text: l.actor + ' · ' + l.action, href: null })),
  };

  /* ───────── scenario ───────── */
  const KEY_RFQ_SPEC = [
    ['p01', 600, 99, 'Modular switch 6A 1-way (white)'], ['p02', 380, 98, 'Modular socket 6/16A 3 pin'], ['p04', 90, 96, 'Fan regulator 5 step modular'], ['p07', 120, 97, 'MCB SP 16A C curve'], ['p08', 60, 95, 'MCB SP 32A C curve'], ['p09', 24, 93, 'MCB TPN 63A C curve'],
    ['p14', 160, 71, 'FRLS wire 2.5mm red 90mtr'], ['p13', 140, 94, 'FRLS wire 1.5 sq mm 90 mtr'], ['p16', 200, 91, 'FRLS wire 6 sq mm 90m'], ['p10', 18, 52, 'RCBO 1P+N 32A 30mA'], ['p31', 400, 74, 'GI earthing strip 25x3'], [null, 600, 0, 'Fire survival cable 2C x 1.5 sq mm (FS)'],
  ];
  const rfqById = (S, id) => S.rfqs.find((x) => x.id === id);
  const log = (S, t, actor, action, target, outcome, kind = 'action', channel = 'web') => S.logs.unshift({ id: DM.uid('lg'), at: t, actor, action, target, outcome, kind, channel });
  const msg = (S, tid, from, text, t, type = 'text', meta) => { const th = S.threads.find((x) => x.id === tid); th.messages.push({ id: DM.uid('m'), from, type, text, at: t, meta }); th.preview = type === 'file' ? '📎 ' + text : text; th.lastAt = t; th.unread = from === 'customer' ? (th.unread || 0) + 1 : 0; };
  const kpi = (S, key, fn) => { const k = S.dash.kpis.find((x) => x.key === key); if (k) k.value = fn(k.value); };
  const quoteDraft = () => {
    const disc = { p01: 4, p02: 4, p04: 3, p07: 5, p08: 5, p09: 5, p14: 7, p13: 7, p16: 7, p10: 4, p31: 5, p23: 6, p28: 3 };
    const spec = [['p01', 600], ['p02', 380], ['p04', 90], ['p07', 120], ['p08', 60], ['p09', 24], ['p14', 160], ['p13', 140], ['p16', 200], ['p10', 18], ['p31', 400], ['p23', 40], ['p28', 6]];
    const lines = spec.map(([pid, q]) => ({ productId: pid, name: PM[pid].name, qty: q, unit: PM[pid].unit, price: Math.round(PM[pid].price * (1 - disc[pid] / 100)), discPct: disc[pid] }));
    const total = sum(lines); const list = spec.reduce((a, [pid, q]) => a + PM[pid].price * q, 0);
    return { lines, total, marginPct: Math.round((1 - (list * 0.78) / total) * 1000) / 10 };
  };
  const QD = quoteDraft();
  const ORDER_LINES = QD.lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price }));

  const steps = [
    { id: 's1', at: '10:42', actor: 'Customer', title: 'RFQ lands in the shared inbox', desc: 'Meridian Projects emails a 3-page PDF for Tower B.', narr: 'Prashant Joshi at Meridian Projects emails the Tower B electrical RFQ with a PDF attached to rfq@. It lands in the Inbox as a new thread — nobody has touched it yet.', route: '/inbox/threads?case=t-201',
      apply(S) { S.threads.unshift({ id: 't-201', partyId: 'pt01', contactId: 'ct01', channel: 'email', subject: 'RFQ — Tower B electrical package (MPPL/TB/E-014)', owner: 'anuma', status: 'open', unread: 2, preview: '📎 MPPL_TowerB_Electrical_RFQ.pdf', lastAt: at(10, 42), priority: 'high', messages: [{ id: 't201-1', from: 'customer', type: 'text', at: at(10, 42), text: 'Hi team,\n\nPlease find attached our RFQ for the Tower B electrical package (MPPL/TB/E-014). We need your best rates and delivery schedule by 4 PM today — site mobilisation starts Monday.\n\nRegards,\nPrashant Joshi\nProcurement Manager, Meridian Projects Pvt Ltd' }, { id: 't201-2', from: 'customer', type: 'file', at: at(10, 42), text: 'MPPL_TowerB_Electrical_RFQ.pdf', meta: { size: '412 KB', pages: 3 } }] }); log(S, at(10, 42), 'System', 'Email received from procurement@meridianprojects.example', 'rfq@access-electricals.example', 'received', 'action', 'email'); },
      notifies: [{ tab: 'agent', from: 'RFQ intake desk', subject: 'New email with attachment from Meridian Projects', body: 'Reading MPPL_TowerB_Electrical_RFQ.pdf…', href: '/inbox/threads?case=t-201', at: at(10, 42) }], m: { open: OPEN0 + 1 } },
    { id: 's2', at: '10:43', actor: 'Anuma', title: 'Anuma reads the PDF', desc: '12 line items extracted from page 3 annexure.', narr: 'Anuma opens the PDF, finds the BOQ annexure on page 3 and extracts 12 line items with quantities and units. RFQ-1015 is created and linked to the thread.', route: '/orders/rfqs/rfq-1015',
      apply(S) { const lines = KEY_RFQ_SPEC.slice(0, 12).map(([, q, , text], i) => ({ n: i + 1, text, productId: null, name: '', qty: q, unit: i === 8 ? 'coil' : 'pcs', price: 0, confidence: 0, state: 'review' })); S.rfqs.unshift({ id: 'rfq-1015', no: 'RFQ-1015', partyId: 'pt01', contactId: 'ct01', source: { type: 'pdf', file: 'MPPL_TowerB_Electrical_RFQ.pdf' }, receivedAt: at(10, 42), due: at(16, 0), status: 'new', owner: 'anuma', subject: 'Tower B electrical package (MPPL/TB/E-014)', notes: 'Customer needs prices by 4 PM. Site mobilisation Monday.', threadId: 't-201', total: 0, lines }); S.threads.find((t) => t.id === 't-201').rfqId = 'rfq-1015'; msg(S, 't-201', 'system', 'Anuma created RFQ-1015 from the attachment (12 lines)', at(10, 43)); log(S, at(10, 43), 'Anuma', 'Parsed PDF — 12 lines', 'RFQ-1015', 'handled', 'action', 'email'); } },
    { id: 's3', at: '10:44', actor: 'Anuma', title: 'Lines matched to the catalogue', desc: '8 matched ≥90%, 3 need review, 1 not stocked.', narr: 'Each line is matched against 34 catalogue items. Eight match with 91–99% confidence. Three fall below the 80% floor and one — fire-survival cable — isn’t in the catalogue at all.', route: '/orders/rfqs/rfq-1015',
      apply(S) { const r = rfqById(S, 'rfq-1015'); r.lines = r.lines.map((l, i) => { const [pid, q, conf] = KEY_RFQ_SPEC[i]; if (!pid) return Object.assign(l, { state: 'unmatched', confidence: 0 }); return Object.assign(l, { productId: pid, name: PM[pid].name, price: PM[pid].price, confidence: conf, state: conf < 80 ? 'review' : 'matched' }); }); r.total = sum(r.lines.filter((l) => l.productId)); log(S, at(10, 44), 'Anuma', 'Matched 11 of 12 lines (3 flagged)', 'RFQ-1015', 'validation', 'validation', 'email'); }, m: { resp: 190 } },
    { id: 's4', at: '10:46', actor: 'Customer', title: 'WhatsApp follow-up adds two lines', desc: 'Panels and fans added on the sales desk number.', narr: 'Prashant also pings the sales WhatsApp number: add 40 LED panels and 6 ceiling fans, same site. Anuma links the chat to the existing RFQ instead of opening a new one.', route: '/inbox/threads?case=t-202',
      apply(S) { S.threads.unshift({ id: 't-202', partyId: 'pt01', contactId: 'ct01', channel: 'whatsapp', subject: 'Tower B — add-ons', owner: 'anuma', status: 'open', unread: 1, preview: 'Aur 40 nos 2x2 panel aur 6 fan add kar dena', lastAt: at(10, 46), priority: 'high', rfqId: 'rfq-1015', messages: [{ id: 't202-1', from: 'customer', type: 'text', at: at(10, 46), text: 'Bhai mail bheja hai Tower B ka. Usme aur 40 nos 2x2 40W panel aur 6 ceiling fan 1200mm 5 star add kar dena. Same site.' }] }); const r = rfqById(S, 'rfq-1015'); r.lines.push({ n: 13, text: 'Panel light 2x2 40w', productId: 'p23', name: PM.p23.name, qty: 40, unit: 'pcs', price: PM.p23.price, confidence: 96, state: 'matched' }, { n: 14, text: 'Ceiling fan 1200mm 5 star', productId: 'p28', name: PM.p28.name, qty: 6, unit: 'pcs', price: PM.p28.price, confidence: 92, state: 'matched' }); r.total = sum(r.lines.filter((l) => l.productId)); r.notes += ' WhatsApp add-on: 40 panels + 6 fans.'; log(S, at(10, 46), 'Anuma', 'Linked WhatsApp message to RFQ-1015 (+2 lines)', 'RFQ-1015', 'handled', 'action', 'whatsapp'); } },
    { id: 's5', at: '10:47', actor: 'Anuma', title: 'Acknowledged on both channels, owner assigned', desc: 'Sneha Kulkarni is notified; 3 lines flagged.', narr: 'Anuma replies on email and WhatsApp with the RFQ number and a 4 PM commitment, assigns Sneha Kulkarni (Meridian’s account owner) and flags three lines for her to review.', route: '/orders/rfqs/rfq-1015',
      apply(S) { msg(S, 't-201', 'anuma', 'Hi Prashant, we have received RFQ MPPL/TB/E-014 (our ref RFQ-1015, 12 lines + 2 added on WhatsApp). Sneha Kulkarni will share prices before 4 PM today.', at(10, 47)); msg(S, 't-202', 'anuma', 'Namaste Prashant ji, panel aur fan add kar diye hain (RFQ-1015). 4 baje tak rate mil jayega.', at(10, 47)); const r = rfqById(S, 'rfq-1015'); r.status = 'review'; r.owner = 'u3'; S.threads.filter((t) => t.rfqId === 'rfq-1015').forEach((t) => (t.owner = 'u3')); log(S, at(10, 47), 'Anuma', 'Assigned RFQ-1015 to Sneha Kulkarni', 'RFQ-1015', 'assigned'); },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'RFQ-1015 needs review — 3 lines flagged', body: 'Meridian Projects, Tower B. Due 4 PM today.', href: '/orders/rfqs/rfq-1015', at: at(10, 47) }] },
    { id: 's6', at: '11:05', actor: 'Sneha', title: 'Sneha resolves the flagged lines', desc: 'Two accepted, RCBO swapped for RCCB; FS cable marked no-bid.', narr: 'Sneha accepts the 2.5 sq mm wire and the earthing strip suggestions, swaps the unavailable RCBO for a 40A RCCB (with a note to the customer) and marks the fire-survival cable as “not stocked – no bid”.', route: '/orders/rfqs/rfq-1015',
      apply(S) { const r = rfqById(S, 'rfq-1015'); const set = (n, pid, extra) => { const l = r.lines.find((x) => x.n === n); Object.assign(l, { productId: pid, name: PM[pid].name, price: PM[pid].price, unit: PM[pid].unit, state: 'matched', confidence: 100, resolvedBy: 'u3' }, extra); }; set(7, 'p14'); set(10, 'p10', { note: 'RCCB 2P 40A offered in place of RCBO — customer to confirm', qty: 18 }); set(11, 'p31'); Object.assign(r.lines.find((x) => x.n === 12), { note: 'Not stocked — no bid. Can source FS cable on request.', state: 'unmatched' }); r.total = sum(r.lines.filter((l) => l.productId)); r.notes += ' RCBO substituted by RCCB.'; log(S, at(11, 5), 'Sneha Kulkarni', 'Resolved 3 flagged lines, 1 no-bid', 'RFQ-1015', 'resolved'); }, m: { open: OPEN0 + 1 } },
    { id: 's7', at: '11:12', actor: 'Anuma', title: 'Stock check finds a shortfall', desc: 'FRLS 6 sq mm: need 200 coils, only 180 on hand.', narr: 'Before pricing, Anuma checks stock. Kavach FRLS 6 sq mm wire is short by 20 coils — restock ETA 3 days. The line is annotated so the quote and dispatch plan can split.', route: '/orders/rfqs/rfq-1015',
      apply(S) { const r = rfqById(S, 'rfq-1015'); r.lines.find((x) => x.n === 9).note = 'Stock 180 coils — 20 short, restock ETA 3 days'; S.products.find((p) => p.id === 'p16').stock = 180; log(S, at(11, 12), 'Anuma', 'Stock short on KV-FRLS-60-90R (20 coils)', 'RFQ-1015', 'alerted', 'alert'); },
      notifies: [{ tab: 'agent', from: 'RFQ intake desk', subject: 'Stock short on FRLS 6 sq mm for RFQ-1015', body: '200 requested, 180 available. Restock ETA 3 days.', href: '/products/p16', at: at(11, 12) }] },
    { id: 's8', at: '11:20', actor: 'Anuma', title: 'Quote drafted from the rate card', desc: 'QT-2026-1015 — 13 lines, margin 15–22%.', narr: 'Anuma applies the rate card per category and drafts QT-2026-1015 with 13 priced lines. Cables carry a 7% discount, which the customer asked for — more than the 6% rate-card ceiling.', route: '/quotes/qt-1015',
      apply(S) { S.quotes.unshift({ id: 'qt-1015', no: 'QT-2026-1015', rfqId: 'rfq-1015', partyId: 'pt01', status: 'draft', total: QD.total, marginPct: QD.marginPct, validTill: dayAt(10, 18, 0).replace('T18', 'T18'), createdAt: at(11, 20), approver: null, lines: DM.clone(QD.lines), terms: 'Prices ex-GST. Delivery 5–7 working days from PO; FRLS 6 sq mm in 2 lots. Payment Net 30.' }); rfqById(S, 'rfq-1015').quoteId = 'qt-1015'; rfqById(S, 'rfq-1015').total = QD.total; log(S, at(11, 20), 'Anuma', 'Drafted quote QT-2026-1015', 'RFQ-1015', 'created'); } },
    { id: 's9', at: '11:24', actor: 'System', title: 'Quote routed for approval', desc: 'Value ₹16.7 L > ₹5 L and cable disc 7% > 6%.', narr: 'The “Quote approval routing” workflow fires: the quote is above ₹5,00,000 and cable discount exceeds the rate-card maximum. It goes to the owner’s approvals queue.', route: '/quotes/approvals',
      apply(S) { S.quotes.find((q) => q.id === 'qt-1015').status = 'pending_approval'; log(S, at(11, 24), 'System', 'Approval requested — value and discount over limit', 'QT-2026-1015', 'pending', 'alert'); },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Approve QT-2026-1015 — Meridian Projects', body: '₹16.7 L, cables at 7% (max 6%). Due to customer by 4 PM.', href: '/quotes/approvals', at: at(11, 24) }] },
    { id: 's10', at: '11:40', actor: 'Owner', title: 'Owner approves with a cap', desc: 'Approved, cable discount capped at 7%.', narr: 'You approve the quote with a note: cable discount capped at 7% and no further movement without asking. The approval is logged against the quote.', route: '/quotes/qt-1015',
      apply(S) { const q = S.quotes.find((x) => x.id === 'qt-1015'); q.status = 'draft'; q.approver = 'u1'; q.approvedAt = at(11, 40); q.approvalNote = 'Approved. Cables max 7% — no further movement without asking.'; log(S, at(11, 40), 'Demo Merchant User', 'Approved quote with cap on cable discount', 'QT-2026-1015', 'approved'); } },
    { id: 's11', at: '11:46', actor: 'Anuma', title: 'Quote sent on email and WhatsApp', desc: 'PDF + hosted link. Time to quote: 64 min.', narr: 'Anuma sends the approved quote as a PDF on email and a hosted-quote link on WhatsApp, with the RCCB substitution and the two-lot delivery plan spelled out. Time to quote: 64 minutes.', route: '/inbox/threads?case=t-201',
      apply(S) { const q = S.quotes.find((x) => x.id === 'qt-1015'); q.status = 'sent'; q.sentAt = at(11, 46); const r = rfqById(S, 'rfq-1015'); r.status = 'quoted'; msg(S, 't-201', 'anuma', 'Hi Prashant, please find our quotation QT-2026-1015 for Tower B (₹' + Math.round(QD.total).toLocaleString('en-IN') + ' ex-GST). Notes: (1) RCCB 2P 40A offered in place of RCBO 1P+N; (2) FRLS 6 sq mm ships in 2 lots (180 now, 20 in 3 days); (3) fire-survival cable not stocked.', at(11, 46)); msg(S, 't-201', 'anuma', 'QT-2026-1015.pdf', at(11, 46), 'file', { size: '186 KB', pages: 4 }); msg(S, 't-202', 'anuma', 'Rate bhej diya hai mail par. Link: merchants.anuma.run/q/QT-2026-1015', at(11, 46)); S.leads.unshift({ id: 'ld-113', title: 'Meridian Tower B electrical package', partyId: 'pt01', stage: 'Quoted', value: QD.total, owner: 'u3', source: 'Email', createdAt: at(10, 42), closeAt: dayAt(30, 12, 0), rfqId: 'rfq-1015', notes: '' }); kpi(S, 'quoted', (v) => v + QD.total); kpi(S, 'resp', () => 64); kpi(S, 'open', (v) => v - 1); log(S, at(11, 46), 'Anuma', 'Sent quote QT-2026-1015 (email + WhatsApp)', 'RFQ-1015', 'sent', 'action', 'email'); },
      m: { quoted: Q0 + QD.total, resp: 64, open: OPEN0 } },
    { id: 's12', at: '14:10', actor: 'Customer', title: 'Customer negotiates', desc: 'Asks for 5% more on cables if confirmed today.', narr: 'Prashant comes back on WhatsApp: another 5% on cables if Meridian confirms today. Anuma checks the guardrail — the owner already capped cable discount — and counters with free site delivery instead of more discount.', route: '/inbox/threads?case=t-202',
      apply(S) { msg(S, 't-202', 'customer', 'Cable pe aur 5% kam kar do toh aaj hi confirm kar dete hain', at(14, 10)); msg(S, 't-202', 'anuma', 'Prashant ji, cable pe 7% already approved hai aur isse aage owner ki permission chahiye. Main aapko site delivery free kar sakta hu (₹ 28,000 ka freight) agar aaj confirm karo. Theek rahega?', at(14, 11)); log(S, at(14, 11), 'Anuma', 'Countered with free delivery (guardrail: cable disc capped)', 'QT-2026-1015', 'handled', 'action', 'whatsapp'); } },
    { id: 's13', at: '14:32', actor: 'Customer', title: 'Customer accepts', desc: 'Quote accepted, RFQ and deal marked Won.', narr: 'Prashant confirms: “Done, send PI.” The quote flips to Accepted, RFQ-1015 and the deal are marked Won and the win rate ticks up.', route: '/orders/rfqs/rfq-1015',
      apply(S) { msg(S, 't-202', 'customer', 'Done. Free delivery pe confirm. PI bhej do', at(14, 32)); msg(S, 't-201', 'customer', 'We confirm QT-2026-1015 with free delivery to site. PO will follow by tomorrow.', at(14, 33)); const q = S.quotes.find((x) => x.id === 'qt-1015'); q.status = 'accepted'; q.acceptedAt = at(14, 32); q.terms += ' Free site delivery agreed.'; rfqById(S, 'rfq-1015').status = 'won'; S.leads.find((l) => l.id === 'ld-113').stage = 'Won'; kpi(S, 'win', () => 44); log(S, at(14, 32), 'Customer', 'Accepted QT-2026-1015', 'RFQ-1015', 'won'); },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Won: Meridian Tower B — ₹' + Math.round(QD.total).toLocaleString('en-IN'), body: 'Customer accepted QT-2026-1015 with free site delivery.', href: '/orders/rfqs/rfq-1015', at: at(14, 32) }], m: { win: 44 } },
    { id: 's14', at: '14:35', actor: 'Anuma', title: 'Draft order created from the quote', desc: 'DO-3007 sent to Accounts for credit check.', narr: 'Anuma converts the accepted quote into draft order DO-3007 and asks Imran in Accounts to verify Meridian’s credit (limit ₹25 L, ₹6.4 L outstanding).', route: '/orders/drafts/dr-3007',
      apply(S) { S.drafts.unshift({ id: 'dr-3007', no: 'DO-3007', partyId: 'pt01', threadId: 't-201', status: 'pending', createdAt: at(14, 35), by: 'Anuma', note: 'From QT-2026-1015. Credit: ₹6.4 L of ₹25 L used.', total: QD.total, lines: QD.lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price, state: 'confirmed' })) }); S.threads.find((t) => t.id === 't-201').draftId = 'dr-3007'; log(S, at(14, 35), 'Anuma', 'Created draft order DO-3007', 'QT-2026-1015', 'created'); },
      notifies: [{ tab: 'human', from: 'Anuma', subject: 'Draft order DO-3007 needs approval', body: 'Meridian Projects — credit check required.', href: '/orders/drafts/dr-3007', at: at(14, 35) }] },
    { id: 's15', at: '14:50', actor: 'Imran', title: 'Accounts approves — order confirmed', desc: 'SO-2026-5017 on Net 30 credit terms.', narr: 'Imran verifies credit and approves. The draft is posted as order SO-2026-5017 on Net 30; Anuma confirms it to the customer on both channels.', route: '/orders/ord-5017',
      apply(S) { const d = S.drafts.find((x) => x.id === 'dr-3007'); d.status = 'posted'; d.note += ' Approved by Imran Sheikh.'; S.orders.unshift({ id: 'ord-5017', no: 'SO-2026-5017', partyId: 'pt01', status: 'confirmed', total: QD.total, placedAt: at(14, 50), channel: 'email', payment: 'Credit', lines: DM.clone(ORDER_LINES), erp: null, threadId: 't-201', quoteId: 'qt-1015' }); msg(S, 't-201', 'anuma', 'Order confirmed ✔ SO-2026-5017 (₹' + Math.round(QD.total).toLocaleString('en-IN') + ' ex-GST, Net 30). Dispatch plan to follow shortly.', at(14, 51)); msg(S, 't-202', 'anuma', 'Order confirm ho gaya ✔ SO-2026-5017. Dispatch details thodi der mein.', at(14, 51)); kpi(S, 'orders', (v) => v + 1); kpi(S, 'revenue', (v) => v + QD.total); const p = S.parties.find((x) => x.id === 'pt01'); p.outstanding += QD.total; p.orders30d += 1; p.lastOrderAt = at(14, 50); log(S, at(14, 50), 'Imran Sheikh', 'Approved draft DO-3007 → SO-2026-5017', 'SO-2026-5017', 'approved'); } },
    { id: 's16', at: '15:20', actor: 'System', title: 'Split shipment booked', desc: 'Lot 1 picked up; 20 coils of 6 sq mm on backorder.', narr: 'Because of the 20-coil shortfall, the order is split. Lot 1 (everything else + 180 coils) is picked up by Delhivery Freight today; lot 2 is on backorder against the restock ETA. The customer gets the AWB on WhatsApp.', route: '/fulfilment',
      apply(S) { S.shipments.unshift({ id: 'sh-7006', orderId: 'ord-5017', carrier: 'Delhivery Freight', awb: 'DLV8800789120', status: 'pickup', eta: dayAt(29, 18, 0), from: 'Bhiwandi WH', to: 'Pune – Hinjewadi, Tower B site', events: [{ at: at(15, 20), text: 'Lot 1 of 2 booked — pickup scheduled 17:30' }, { at: at(15, 20), text: 'Lot 2 (20 coils FRLS 6 sq mm) on backorder — ETA 3 days' }] }); const o = S.orders.find((x) => x.id === 'ord-5017'); o.status = 'processing'; o.shipmentId = 'sh-7006'; o.note = 'Lot 2: 20 coils FRLS 6 sq mm on backorder'; msg(S, 't-202', 'anuma', 'Lot 1 dispatch ho gaya — Delhivery AWB DLV8800789120, kal tak site pe. 6 sq mm ke 20 coil 3 din mein alag lot mein.', at(15, 21)); log(S, at(15, 20), 'System', 'Booked Delhivery Freight — lot 1 of 2', 'SO-2026-5017', 'booked'); },
      notifies: [{ tab: 'agent', from: 'Order status line', subject: 'Lot 1 of SO-2026-5017 booked', body: 'AWB DLV8800789120. Customer notified on WhatsApp.', href: '/orders/ord-5017', at: at(15, 20) }] },
    { id: 's17', at: '15:30', actor: 'Anuma', title: 'The loop is closed', desc: 'Dashboard shows the new quote value, win and order.', narr: 'Within five hours of an emailed PDF, Meridian has a priced quote, an approved discount, a confirmed order and a tracked shipment — and every step is on the dashboard, in the inbox and in the audit log.', route: '/dashboard',
      apply(S) { S.dash.alerts.unshift({ id: 'al-new', text: 'SO-2026-5017: 20 coils FRLS 6 sq mm on backorder', tone: 'amber', href: '/orders/ord-5017' }); S.dash.activity.unshift({ at: at(15, 30), text: 'Anuma · Meridian Tower B won — SO-2026-5017', href: '/orders/ord-5017' }); log(S, at(15, 30), 'Anuma', 'Closed loop: RFQ-1015 → SO-2026-5017', 'RFQ-1015', 'ok'); }, m: { quoted: Q0 + QD.total, win: 44, open: OPEN0 } },
  ];

  /* ───────── register ───────── */
  DM.defineUC(UC, {
    short: 'Access Electricals', tagline: 'RFQ → quote → order', icon: 'sheet', home: '/dashboard',
    about: 'Access Electricals distributes switches, MCBs, cables, conduits and lighting to contractors and dealers. RFQs arrive as PDFs, Excel sheets and WhatsApp messages. Play the scenario to watch one Pune contractor’s Tower B RFQ become a priced, approved, accepted quote, a confirmed order and a split shipment.',
    charts: [
      { key: 'quoted', title: 'Quoted this month', type: 'spark', fmt: 'inr', start: Q0, delta: true },
      { key: 'open', title: 'RFQs open', type: 'spark', fmt: 'num', start: OPEN0, color: '#d97706' },
      { key: 'resp', title: 'Avg time to quote', type: 'spark', fmt: 'min', start: 190, color: '#0d9488', delta: true },
      { key: 'win', title: 'Win rate', type: 'spark', fmt: 'pct', start: 41, color: '#7c3aed', delta: true },
    ],
    steps,
  });

  const D = (k, v) => DM.data(UC, k, v);
  D('company', { name: 'Demo Merchant User', legal: 'Access Electricals Pvt Ltd', gstin: '27AAKCA5521Q1ZR', address: 'Unit 14, Kalher Industrial Estate, Bhiwandi, Maharashtra 421302', city: 'Bhiwandi', phone: '+91 98200 98200', email: 'hello@access-electricals.example', website: 'access-electricals.example', industry: 'Electrical supplies distribution', currency: 'INR', logoColor: '#171717' });
  D('users', users); D('parties', parties); D('contacts', contacts); D('products', products); D('threads', threads); D('leads', leads); D('rfqs', rfqs); D('quotes', quotes);
  D('orders', orders); D('drafts', drafts); D('shipments', shipments); D('campaigns', campaigns); D('lists', lists); D('templates', templates); D('agents', agents); D('workflows', workflows);
  D('channels', channels); D('apps', apps); D('erpLog', []); D('logs', logs); D('notifications', notifications); D('rulebook', rulebook); D('usage', usage); D('rateCard', rateCard); D('dash', dash);
})();
