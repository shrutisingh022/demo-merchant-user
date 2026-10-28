/* pages/rfqs.js — Access (Axis India) RFQs: list | board, New RFQ, Upload BOQ, and the record page (Overview · Items · Activity · Attachments)
   with inline line editing, kit lines, "Pick the catalog match", Regret, Send to SAP and Convert to quote (recorded on the RFQ itself — there is no Quotes module).
   Spec: docs/spec/orders-rfqs.md §3 (live design is older; re-skinned here in Mira). State: DM.S.rfqs (shape in data/seed-orders.js).
   Helpers for scenarios: DM.rfq.add(S, partial) · DM.rfq.autoMatch(S, line) · DM.rfq.candidates(S, text, n) · DM.rfq.setDecision(S, rfq, line, decision, note) · DM.rfq.reflow(rfq) · DM.rfq.sendToSap(S, id) · DM.rfq.convert(S, id) */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, O = DM.orders;
  const S = () => DM.S;
  if (!DM.icons.layers) DM.icons.layers = '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>';
  const COLORS = { received: '#a3a3a3', matching: '#3b82f6', needs_review: '#f59e0b', ready: '#14b8a6', quoted: '#22c55e', exported: '#059669' };
  ['received', 'matching', 'needs_review', 'ready', 'quoted', 'exported'].forEach((k) => (DM.icons['dot-' + k] = `<circle cx="12" cy="12" r="5" fill="${COLORS[k]}" stroke="none"/>`));
  const ST = { received: 'Received', matching: 'Matching', needs_review: 'Needs Review', ready: 'Ready', quoted: 'Quoted', exported: 'Exported' };
  const SOURCES = ['Email Attachment', 'Email Body', 'SAP', 'Custom Webhook', 'Manual'];
  const SORTS = [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['num-desc', 'Number (desc)'], ['num-asc', 'Number (asc)']];

  const css = document.createElement('style'); css.dataset.for = 'rfqs';
  css.textContent = `
  .spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .rfq-page{max-width:1252px}
  .rfq-ph{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.rfq-ph h1{font-size:20px;font-weight:600;letter-spacing:-.01em}.rfq-ph p{font-size:12px;color:#737373;margin-top:4px;max-width:640px}
  .rfq-ph .acts{margin-left:auto;display:flex;gap:8px;align-items:center}
  .rfq-f{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  .rfq-f .sgroup{width:248px}
  .fbtn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--input);border-radius:8px;font-size:12px;background:#fff;white-space:nowrap}.fbtn:hover{background:#f5f5f5}.fbtn svg.i{width:14px;height:14px;color:#737373}.fbtn.on{border-color:#0a0a0a}
  .rfq-cnt{font-size:12px;color:#737373;margin:0 0 8px}
  .rpill{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 9px;border-radius:999px;font-size:11.5px;font-weight:500;background:#fff;border:1px solid var(--border);white-space:nowrap}.rpill i{width:6px;height:6px;border-radius:50%}
  .rpill.needs_review{background:#fff7ed;border-color:#fed7aa;color:#9a3412}
  .rno{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#737373}
  /* board */
  .board{display:grid;grid-auto-flow:column;grid-auto-columns:268px;gap:12px;overflow-x:auto;padding-bottom:10px}
  .lane{background:#f5f5f5;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:8px;min-height:80px;align-self:start;width:268px}
  .lane-h{display:flex;align-items:center;gap:8px;padding:4px 4px 2px;font-size:12px}.lane-h i{width:8px;height:8px;border-radius:50%}.lane-h b{font-weight:600}.lane-h .l{margin-left:auto;color:#737373;font-size:11px}
  .rcard{background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.08);padding:12px;cursor:pointer;transition:box-shadow .15s,transform .15s;text-align:left;width:100%}.rcard:hover{box-shadow:0 0 0 1px rgba(10,10,10,.18),0 4px 10px rgba(0,0,0,.05);transform:translateY(-1px)}
  .rcard .nm{font-weight:600;font-size:12px}.rcard .nm.u{font-weight:400;color:#737373}.rcard .rn{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#737373;margin-top:2px}
  .rcard .ft{display:flex;align-items:center;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:11.5px;color:#525252}.rcard .ft .d{margin-left:auto;color:#737373}.rcard .ft svg.i{width:13px;height:13px}
  .rcard .xp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;background:#fafafa;border-radius:8px;padding:8px}.rcard .xp span{display:block;font-size:9.5px;letter-spacing:.06em;color:#737373;text-transform:uppercase}.rcard .xp b{font-weight:500;font-size:12px}
  /* record */
  .rh{display:flex;align-items:center;gap:12px;margin-bottom:12px}.rh h1{font-size:24px;font-weight:600;letter-spacing:-.015em;line-height:30px}.rh h1 .ac{color:#a3a3a3;font-weight:600;margin-left:10px}
  .rh .acts{margin-left:auto;display:flex;gap:8px;align-items:center}
  .rtabs{display:flex;gap:2px;border-bottom:1px solid var(--border);margin:0 0 16px}
  .rtab{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;font-size:12px;color:#737373;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .15s}.rtab:hover{color:#171717}.rtab.on{color:#171717;border-color:#171717;font-weight:500}.rtab svg.i{width:14px;height:14px}
  .rgrid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}
  .rgrid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:12px}
  .rcardx{border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.08);background:#fff;overflow:hidden}
  .rcardx-h{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);font-weight:500;font-size:12px}.rcardx-h .ic{display:inline-grid;place-items:center}.rcardx-h .r{margin-left:auto;display:flex;gap:8px;align-items:center}
  .rcardx-b{padding:12px 16px;font-size:12px}
  .rcardx .small-l{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#737373;font-weight:600}
  .regline{padding:8px 0;border-top:1px solid var(--border)}.regline:first-child{border-top:0;padding-top:0}.regline .t{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.regline .n{color:#737373;margin-top:2px}
  .actrow{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--border)}.actrow:first-child{border-top:0;padding-top:0}
  .redbadge{display:inline-grid;place-items:center;min-width:18px;height:18px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:10.5px;font-weight:600;padding:0 5px}
  .fil{display:flex;align-items:center;gap:10px}.fil .ft{width:32px;height:32px;border-radius:8px;background:#dcfce7;color:#15803d;display:grid;place-items:center;flex:none}.fil .nm{font-weight:600}
  /* items grid */
  .it-tools{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}
  .chipf{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;color:#525252;transition:background-color .15s}.chipf:hover{background:#f5f5f5}.chipf.on{background:#ebebeb;color:#171717;font-weight:500}.chipf .c{color:#737373}
  .igrid{border:1px solid var(--border);border-radius:10px;overflow:hidden;background:#fff}
  .ir{display:grid;grid-template-columns:56px minmax(0,1fr) 64px 250px 84px 64px 150px;align-items:center;border-top:1px solid var(--border);min-height:40px;font-size:12px;transition:background-color .12s}
  .ir>div{padding:0 12px;min-width:0}.ir.h{background:#fafafa;border-top:0;height:40px;color:#525252;font-weight:500}
  .ir.b:hover{background:rgba(245,245,245,.7);cursor:pointer}.ir.ed{background:#f8fafc;box-shadow:inset 2px 0 0 #0a0a0a}
  .ir .n{color:#737373;display:flex;align-items:center;gap:4px}.ir .n .chev{width:16px;height:16px;display:grid;place-items:center;border-radius:4px;transition:transform .2s}.ir .n .chev:hover{background:#ebebeb}.ir .n .chev.open{transform:rotate(90deg)}
  .ir .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ir.rg .t,.ir.rg .q,.ir.rg .sk b{text-decoration:line-through;color:#a3a3a3}
  .ir .q{font-weight:600;text-align:right}.ir .u{color:#525252}
  .skuc{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;max-width:100%}.skuc b{font-weight:600;overflow:hidden;text-overflow:ellipsis}.skuc i{width:6px;height:6px;border-radius:50%;flex:none}
  .skuc.g{background:#ecfdf5;box-shadow:inset 0 0 0 1px #bbf7d0}.skuc.g i{background:#22c55e}.skuc.a{background:#fffbeb;box-shadow:inset 0 0 0 1px #fde68a}.skuc.a i{background:#f59e0b}.skuc.x{background:#f5f5f5}.skuc.x i{background:#a3a3a3}.skuc .m{color:#737373}
  .rv{display:flex;justify-content:flex-end;align-items:center;gap:4px}
  .rv .ok{color:#15803d;display:inline-flex;gap:4px;align-items:center}.rv .rgt{color:#b91c1c;display:inline-flex;gap:4px;align-items:center}.rv .dt{color:#b45309;display:inline-flex;gap:4px;align-items:center}.rv svg.i{width:13px;height:13px}
  .ir .input{height:26px;font-size:12px;padding:0 8px}
  .ir.part{background:#fafafa}.ir.part .t{color:#525252;padding-left:20px}
  .ibar{position:sticky;bottom:0;display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--border);border-radius:10px;margin-top:12px;padding:10px 14px;font-size:12px;box-shadow:0 -6px 12px rgba(255,255,255,.9)}
  .ibar .r{margin-left:auto;display:flex;align-items:center;gap:14px}
  .sheetg{border:1px solid var(--border);border-radius:8px;overflow:hidden;max-height:340px;overflow:auto}.sheetg table{width:100%;border-collapse:collapse;font-size:12px}.sheetg th,.sheetg td{padding:6px 10px;border-bottom:1px solid var(--border);text-align:left;white-space:nowrap}.sheetg th{background:#fafafa;position:sticky;top:0;font-weight:500}
  .mt-row{display:grid;grid-template-columns:32px 150px minmax(0,1fr) 80px;align-items:center;min-height:36px;border-top:1px solid var(--border);font-size:12px;cursor:pointer}.mt-row.h{background:#fafafa;border-top:0;color:#525252;font-weight:500;cursor:default}.mt-row>div{padding:0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mt-row:not(.h):hover{background:#f5f5f5}.mt-row.sel{background:#f0f8ff}
  .rad{width:14px;height:14px;border-radius:50%;border:1.5px solid #a3a3a3;display:inline-block;position:relative}.sel .rad{border-color:#0a0a0a}.sel .rad::after{content:"";position:absolute;inset:2px;border-radius:50%;background:#0a0a0a}
  .confc{display:inline-flex;gap:5px;align-items:center}.confc i{width:6px;height:6px;border-radius:50%;background:#22c55e}.confc.m i{background:#f59e0b}.confc.l i{background:#ef4444}
  .linkb{color:#171717;text-decoration:underline;cursor:pointer;font-weight:500}
  .drop{border:1.5px dashed #d4d4d4;border-radius:12px;padding:28px 16px;text-align:center;cursor:pointer;transition:background-color .15s,border-color .15s}.drop:hover,.drop.over{background:#fafafa;border-color:#737373}
  .nl{display:grid;grid-template-columns:minmax(0,1fr) 110px 70px 80px 28px;gap:8px;margin-bottom:8px}
  .tl{position:relative;padding:0 16px}.tl .row2{position:relative;display:flex;gap:12px;padding:14px 0;border-top:1px solid var(--border)}.tl .row2:first-child{border-top:0}
  .tl .ic{width:28px;height:28px;border-radius:50%;border:1px solid var(--border);display:grid;place-items:center;flex:none;background:#fff;z-index:1}.tl .ic svg.i{width:14px;height:14px;color:#525252}
  .tag-o{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;border:1px solid var(--border);font-size:11px;color:#525252}
  `;
  document.head.appendChild(css);

  /* ───────── helpers ───────── */
  const ui = () => (DM.ui.rfq = DM.ui.rfq || { q: '', status: '', account: '', source: '', sort: 'newest', lq: '', lf: 'all', edit: null, open: {}, focus: false });
  const R = () => S().rfqs || [];
  const meUser = () => (S().users || []).find((u) => u.me) || { id: 'u-rohan', name: 'Rohan Mehta' };
  const party = (id) => (S().parties || []).find((p) => p.id === id);
  const acct = (r) => { const p = r.partyId && party(r.partyId); return p ? p.name : ''; };
  const pill = (k) => `<span class="rpill ${k}"><i style="background:${COLORS[k]}"></i>${ST[k]}</span>`;
  const nowIso = () => O.nowD().toISOString();
  const upN = (s) => DM.fmt.num(s);
  const money = (n) => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ym = (v) => { const d = new Date(Date.parse(v) + 5.5 * 3600000); return d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0'); };
  const tabQ = () => DM.query().get('tab') || 'overview';
  const base = (id) => '/orders/rfqs/' + id;
  const listPath = () => { const v = DM.query().get('view'); return '/orders/rfqs' + (v === 'board' ? '?view=board' + (DM.query().get('expand') ? '&expand=1' : '') : ''); };
  const decided = (l) => l.decision === 'confirmed' || l.decision === 'regret';
  const tally = (r) => { const L = r.lines; const c = { all: L.length, pending: 0, resolved: 0, details: 0, regret: 0 }; L.forEach((l) => { if (l.decision === 'pending') c.pending++; else if (l.decision === 'confirmed') c.resolved++; else if (l.decision === 'needs_details') c.details++; else if (l.decision === 'regret') c.regret++; }); return c; };
  const hl = (r) => ({ proposed: r.lines.filter((l) => l.decision === 'confirmed' && !l.replaced).length, replaced: r.lines.filter((l) => l.replaced).length, expanded: r.lines.filter((l) => l.type === 'Kit').length, merged: r.lines.filter((l) => l.merged).length });
  const rateOf = (l) => (l.match && l.match.rate) || 0;

  /* ───────── activity / logs / status ───────── */
  const addAct = (r, text, tag) => { r.activity.unshift({ id: DM.uid('a'), actor: meUser().name, at: nowIso(), text, tag: tag || 'logged' }); };
  const addLog = (s, title, chip, event, href) => { (s.logs = s.logs || []).unshift({ id: DM.uid('lg'), at: nowIso(), actor: meUser().name, title, chip: chip || 'logged', event: event || '', href: href || '' }); };
  const reflow = (r) => {
    if (r.status === 'quoted' || r.status === 'exported') return;
    const t = tally(r); if (t.pending === 0 && t.details === 0) r.status = 'ready'; else if (t.resolved > 0 || t.pending > 0) r.status = (t.pending > 0 && r.status === 'ready') ? 'needs_review' : (r.status === 'received' ? 'matching' : r.status === 'ready' ? 'needs_review' : r.status);
  };
  const setStatus = (r, k) => { if (r.status === k) return; const from = r.status; r.status = k; addAct(r, `Updated Rfq: ${r.no} - ${r.source} (Changed fields: status)`); addLog(S(), `Updated Rfq: ${r.no} (Changed fields: status)`, 'logged', 'rfq_status', '#/orders/rfqs/' + r.id); DM.toast(`Status set to ${ST[k]}`); };

  /* ───────── catalog matching ───────── */
  const tok = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').split(' ').filter((x) => x && !['the', 'with', 'and', 'for', 'type', 'of', 'a'].includes(x));
  const allVariants = (s) => { const out = []; (s.styles || []).forEach((st) => (st.variants || []).forEach((v) => out.push({ st, v }))); return out; };
  const stext = (st, v) => [st.name, v.name, v.sku, st.code, JSON.stringify(st.attrs || {}), st.category].join(' ');
  const candidates = (s, text, n) => {
    const q = tok(text); const nums = q.filter((x) => /^\d/.test(x)); const rate = (sku) => 20 + ((() => { let h = 7; for (const c of String(sku)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; })() % 4800) / 10;
    const out = allVariants(s).map(({ st, v }) => { const t = tok(stext(st, v)); const set = new Set(t); let sc = 0; q.forEach((w) => { if (set.has(w)) sc += /^\d/.test(w) ? 2.5 : 1; else if (t.some((x) => x.startsWith(w) && w.length > 3)) sc += 0.5; }); const total = q.length + nums.length * 1.5 || 1; return { st, v, score: sc / total, rate: Math.round(rate(v.sku || v.id) * 100) / 100 }; }).filter((x) => x.score > 0.12).sort((a, b) => b.score - a.score).slice(0, n || 8);
    out.forEach((x) => (x.conf = Math.max(38, Math.min(97, Math.round(40 + x.score * 62)))));
    return out;
  };
  const autoMatch = (s, line) => { const c = candidates(s, line.text, 6); if (!c.length) { line.match = null; return line; } const b = c[0]; line.match = { styleId: b.st.id, variantId: b.v.id, sku: b.v.sku || b.v.id, alt: Math.max(0, c.length - 1), confidence: b.conf, rate: b.rate, state: 'proposed' }; return line; };

  /* ───────── public API (scenario wave) ───────── */
  const add = (s, p) => {
    const rf = s.rfqs = s.rfqs || []; const n = p.n || rf.reduce((m, r) => Math.max(m, r.n || 0), 1000) + 1; const at = p.receivedAt || nowIso();
    const r = Object.assign({ id: 'rfq-' + n, no: `RFQ-${ym(at)}-${n}`, n, partyId: null, contactId: null, reference: '', source: 'Manual', status: 'received', receivedAt: at, owner: meUser().id, notes: '', lines: [], files: [], activity: [], quote: null, exportedAt: null, sapRef: null }, p);
    r.id = p.id || 'rfq-' + n; r.no = p.no || `RFQ-${ym(at)}-${n}`; r.n = n; r.receivedAt = at;
    r.lines.forEach((l, i) => { l.id = l.id || `l-${n}-${i + 1}`; l.n = l.n || i + 1; l.unit = l.unit || 'Nos'; l.type = l.type || ''; l.decision = l.decision || 'pending'; l.parts = l.parts || []; if (l.match === undefined) autoMatch(s, l); });
    if (!r.activity.length) r.activity.push({ id: DM.uid('a'), actor: p.source === 'Manual' ? meUser().name : 'Anuma', at, text: `Created Rfq: ${r.no} - ${r.source}`, tag: 'auto-drafted' });
    rf.unshift(r); return r;
  };
  const setDecision = (s, r, line, decision, note) => { line.decision = decision; if (decision === 'regret') { line.regretNote = note || ''; } if (decision === 'confirmed' && line.match) line.match.state = 'confirmed'; reflow(r); };
  const sendToSap = (s, id) => {
    const r = (s.rfqs || []).find((x) => x.id === id); if (!r) return null; r.status = 'exported'; r.exportedAt = nowIso(); r.sapRef = 'SAP-SO-' + (4500000 + r.n * 13);
    r.activity.unshift({ id: DM.uid('a'), actor: meUser().name, at: r.exportedAt, text: `Sent to SAP: ${r.sapRef}`, tag: 'logged' });
    (s.logs = s.logs || []).unshift({ id: DM.uid('lg'), at: r.exportedAt, actor: meUser().name, title: `Sent RFQ ${r.no} to SAP (${r.sapRef})`, chip: 'sent', event: 'rfq_sent', href: '#/orders/rfqs/' + r.id }); return r;
  };
  const convert = (s, id) => {
    const r = (s.rfqs || []).find((x) => x.id === id); if (!r) return null; const total = r.lines.reduce((a, l) => a + (l.decision === 'confirmed' ? l.qty * rateOf(l) : 0), 0);
    r.quote = { ref: 'QT-2026-' + String(180 + (r.n % 900)).padStart(4, '0'), at: nowIso(), total: Math.round(total * 1.18) }; r.status = 'quoted';
    r.activity.unshift({ id: DM.uid('a'), actor: meUser().name, at: r.quote.at, text: `Converted to quote ${r.quote.ref}`, tag: 'logged' });
    (s.logs = s.logs || []).unshift({ id: DM.uid('lg'), at: r.quote.at, actor: meUser().name, title: `Converted ${r.no} to quote ${r.quote.ref}`, chip: 'confirmed', event: 'quote_confirmed', href: '#/orders/rfqs/' + r.id }); return r;
  };
  DM.rfq = { add, autoMatch, candidates, setDecision, reflow, sendToSap, convert, tally };

  /* ───────── LIST + BOARD ───────── */
  const filtered = () => {
    const u = ui(); let L = R().slice(); const q = u.q.toLowerCase();
    if (u.status && DM.query().get('view') !== 'board') L = L.filter((r) => r.status === u.status);
    if (u.account) L = L.filter((r) => (u.account === 'none' ? !r.partyId : r.partyId === u.account));
    if (u.source) L = L.filter((r) => r.source === u.source);
    if (q) L = L.filter((r) => (r.no + ' ' + r.reference + ' ' + acct(r) + ' ' + r.notes).toLowerCase().includes(q));
    L.sort((a, b) => u.sort === 'oldest' ? Date.parse(a.receivedAt) - Date.parse(b.receivedAt) : u.sort === 'num-desc' ? b.n - a.n : u.sort === 'num-asc' ? a.n - b.n : Date.parse(b.receivedAt) - Date.parse(a.receivedAt));
    return L;
  };
  const fb = (label, act, on, icon) => `<button class="fbtn ${on ? 'on' : ''}" data-act="${act}">${icon ? I(icon) : ''}${esc(label)}${I('chevD')}</button>`;
  const header = (view) => `<div class="rfq-ph"><div><h1>RFQs</h1><p>Everything a customer has asked you to price — matched against your catalog, then converted into a quote.</p></div><div class="acts">
    <div class="pills" role="tablist"><button role="tab" class="pill ${view === 'board' ? 'on' : ''}" data-act="rfq-view" data-arg="board">${I('columns')} Board</button><button role="tab" class="pill ${view !== 'board' ? 'on' : ''}" data-act="rfq-view" data-arg="list">${I('list')} List</button></div>
    <button class="btn outline" data-act="rfq-new">${I('plus')} New RFQ</button><button class="btn" data-act="rfq-upload">${I('upload')} Upload BOQ</button></div></div>`;
  const pageList = () => {
    const u = ui(); const Q = DM.query(); const view = Q.get('view') === 'board' ? 'board' : 'list'; const expand = !!Q.get('expand'); const L = filtered();
    const aLabel = u.account ? (u.account === 'none' ? 'Unassigned' : (party(u.account) || {}).name || 'All accounts') : 'All accounts';
    const bar = `<div class="rfq-f">${DM.searchGroup('rfq-q', 'RFQ number or customer reference', u.q)}${view === 'list' ? fb(u.status ? ST[u.status] : 'All statuses', 'rfq-f-status', !!u.status) : ''}${fb(aLabel.length > 26 ? aLabel.slice(0, 24) + '…' : aLabel, 'rfq-f-acct', !!u.account)}${fb(u.source || 'Any source', 'rfq-f-source', !!u.source)}${fb((SORTS.find((s) => s[0] === u.sort) || SORTS[0])[1], 'rfq-f-sort', false)}${view === 'board' ? `<button class="fbtn right" data-act="rfq-expand">${I('chevupdown')} ${expand ? 'Collapse' : 'Expand'}</button>` : ''}</div><div class="rfq-cnt">${L.length} RFQ${L.length === 1 ? '' : 's'}</div>`;
    const changed = DM.changedRows('rfqs', L, (r) => r.status + '|' + r.lines.length, 'id');
    if (view === 'board') {
      const lanes = Object.keys(ST).map((k) => { const items = L.filter((r) => r.status === k); const ln = items.reduce((a, r) => a + r.lines.length, 0); return `<div class="lane"><div class="lane-h"><i style="background:${COLORS[k]}"></i><b>${ST[k]}</b><span class="muted">${items.length}</span><span class="l">${upN(ln)} lines</span></div>${items.map((r) => { const nm = acct(r); const age = ((O.nowD() - Date.parse(r.receivedAt)) / 86400000).toFixed(1); return `<a class="rcard ${changed.has(r.id) ? 'row-new' : ''}" href="#${base(r.id)}" data-rid="${r.id}"><div class="nm ${nm ? '' : 'u'}">${esc(nm || 'Unassigned')}</div><div class="rn">${esc(r.no)}</div><div class="xs muted" style="margin-top:4px">${esc(r.source)}</div>${expand ? `<div class="xp"><div><span>Received</span><b>${esc(O.fmtD(r.receivedAt))}</b></div><div><span>Age</span><b>${age} d</b></div></div>` : ''}<div class="ft">${I('file')} ${r.lines.length} lines<span class="d">${esc(O.fmtD(r.receivedAt))}</span></div></a>`; }).join('')}</div>`; }).join('');
      return `<div class="page rfq-page stagger">${header(view)}${bar}<div class="board">${lanes}</div></div>`;
    }
    const cols = [
      { k: 'no', label: 'RFQ', w: 170, filter: false, text: (r) => r.no, render: (r) => `<span class="rno">${esc(r.no)}</span>` },
      { k: 'acct', label: 'Account', flex: 1.4, minW: 200, filter: false, text: (r) => acct(r), render: (r) => (acct(r) ? `<b style="font-weight:600">${esc(acct(r))}</b>` : '<span class="muted">Unassigned</span>') },
      { k: 'reference', label: 'Their reference', flex: 1, minW: 150, filter: false, render: (r) => (r.reference ? esc(r.reference) : '') },
      { k: 'source', label: 'Source', w: 150, filter: false },
      { k: 'lines', label: 'Lines', w: 90, num: true, filter: false, text: (r) => r.lines.length, render: (r) => `<b style="font-weight:600">${r.lines.length}</b>` },
      { k: 'status', label: 'Status', w: 150, filter: false, text: (r) => ST[r.status], render: (r) => pill(r.status) },
      { k: 'receivedAt', label: 'Received', w: 130, filter: false, text: (r) => r.receivedAt, render: (r) => esc(O.fmtD(r.receivedAt)) },
    ];
    return `<div class="page rfq-page">${header(view)}${bar}${DM.table(cols, L, { id: 'rfq-grid', footer: false, go: (r) => base(r.id), rowCls: (r) => (changed.has(r.id) ? 'row-new' : ''), offset: 396, empty: { icon: 'file', title: 'No RFQs match', sub: 'Try a different filter, or create one with New RFQ.' } })}</div>`;
  };

  /* ───────── RECORD ───────── */
  const lineMatches = (r) => { const u = ui(); const q = u.lq.toLowerCase(); return r.lines.filter((l) => { if (u.lf === 'pending' && l.decision !== 'pending') return false; if (u.lf === 'resolved' && l.decision !== 'confirmed') return false; if (u.lf === 'details' && l.decision !== 'needs_details') return false; if (u.lf === 'regret' && l.decision !== 'regret') return false; if (q && !(l.text + ' ' + (l.code || '') + ' ' + (l.match ? l.match.sku : '')).toLowerCase().includes(q)) return false; return true; }); };
  const skuChip = (l) => { if (!l.match) return '<span class="skuc x"><i></i><span class="muted">No match yet</span></span>'; const tone = l.decision === 'confirmed' ? 'g' : 'a'; return `<button class="skuc ${tone}" data-act="rfq-match" data-arg="${l.id}" title="Pick the catalog match"><i></i><b>${esc(l.match.sku)}</b>${l.match.alt ? `<span class="m">+${l.match.alt}</span>` : ''}</button>`; };
  const reviewCell = (l, editing) => { if (editing) return `<div class="rv"><button class="btn ghost icon sm" title="Confirm" data-act="rfq-confirm" data-arg="${l.id}">${I('check')}</button><button class="btn ghost icon sm" title="Replace match" data-act="rfq-match" data-arg="${l.id}">${I('swap')}</button><button class="btn ghost icon sm" title="More" data-act="rfq-more" data-arg="${l.id}">${I('more')}</button></div>`; return `<div class="rv">${l.decision === 'confirmed' ? `<span class="ok">${I('check')} Confirmed</span>` : l.decision === 'regret' ? `<span class="rgt">${I('ban')} Regret</span>` : l.decision === 'needs_details' ? `<span class="dt">${I('clock')} Needs details</span>` : ''}</div>`; };
  const itemsTab = (r) => {
    const u = ui(); const t = tally(r); const L = lineMatches(r); const kits = r.lines.filter((l) => l.type === 'Kit'); const allOpen = kits.length && kits.every((l) => u.open[l.id]);
    const chips = [['all', 'All', t.all], ['pending', 'Pending', t.pending], ['resolved', 'Resolved', t.resolved], ['details', 'Needs details', t.details], ['regret', 'Regret', t.regret]].map(([k, l, n]) => `<button class="chipf ${u.lf === k ? 'on' : ''}" data-act="rfq-lf" data-arg="${k}">${l} <span class="c">${n}</span></button>`).join('');
    const rows = L.map((l) => { const ed = u.edit && u.edit.lineId === l.id; const kit = l.type === 'Kit'; const open = kit && u.open[l.id];
      const main = `<div class="ir b ${l.decision === 'regret' ? 'rg' : ''} ${ed ? 'ed' : ''}" data-rid="${l.id}" ${ed ? '' : `data-act="rfq-edit" data-arg="${l.id}"`}>
        <div class="n">${kit ? `<span class="chev ${open ? 'open' : ''}" data-act="rfq-kit" data-arg="${l.id}">${I('chevR')}</span>` : ''}${ed ? '<span class="chk on">' + I('check') + '</span>' : l.n}</div>
        <div class="t" title="${esc(l.text)}">${ed ? `<input class="input" data-input="rfq-et" value="${esc(u.edit.text)}" style="width:100%">` : esc(l.text)}</div>
        <div>${kit ? '<span class="tag-o">Kit</span>' : ''}</div><div class="sk">${skuChip(l)}</div>
        <div class="q">${ed ? `<input class="input" data-input="rfq-eq" value="${esc(u.edit.qty)}" style="text-align:right">` : upN(l.qty)}</div><div class="u">${ed ? `<input class="input" data-input="rfq-eu" value="${esc(u.edit.unit)}">` : esc(l.unit)}</div>
        <div>${reviewCell(l, ed)}</div></div>`;
      const parts = open ? l.parts.map((p, i) => `<div class="ir part b"><div class="n"></div><div class="t">${esc(p.text)}</div><div></div><div class="sk"><span class="skuc x"><i></i><b>${esc(p.sku)}</b></span></div><div class="q">${upN(p.qty)}</div><div class="u">${esc(l.unit)}</div><div></div></div>`).join('') : '';
      return main + parts; }).join('');
    const conf = r.lines.filter((l) => l.decision === 'confirmed'); const cost = conf.reduce((a, l) => a + l.qty * rateOf(l), 0); const rem = t.pending + t.details; const dec = t.resolved + t.regret;
    const canSap = rem === 0 && r.status !== 'exported';
    return `<div class="it-tools">${DM.searchGroup('rfq-lq', 'Search lines, codes, titles', u.lq)}${chips}<span class="grow"></span>${kits.length ? `<button class="btn outline sm" data-act="rfq-expall">${I('chevupdown')} ${allOpen ? 'Collapse all' : 'Expand all'} ${kits.length}</button>` : ''}</div>
      <div class="igrid"><div class="ir h"><div>#</div><div>Original request</div><div>Type</div><div>Matched SKU</div><div style="text-align:right">Qty</div><div>Unit</div><div style="text-align:right">Review</div></div>${rows || '<div class="empty" style="padding:36px 0">No lines match this filter.</div>'}</div>
      <div class="ibar"><span class="muted">${t.all} lines · ${dec} decided · ${rem} remaining · ${t.regret} excluded</span><span class="r"><span class="muted">Matched cost <b style="color:#171717">${money(cost)}</b></span><b>${conf.length} quote lines</b><span class="muted">${rem} lines still to decide</span><button class="btn sm" ${canSap ? '' : 'disabled'} data-act="rfq-sap">${I('send')} Send to SAP</button></span></div>`;
  };
  const activityTab = (r) => `<div class="rcardx"><div class="tl">${r.activity.map((a) => `<div class="row2"><span class="ic">${I('history')}</span><div class="grow"><div style="font-size:12.5px">${esc(a.text)}</div><div class="muted" style="margin-top:3px">${esc(a.actor)} · ${esc(O.fmtD(a.at))}, ${esc(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(a.at)))}</div></div><span class="tag-o">${esc(a.tag || 'logged')}</span></div>`).join('')}</div></div>`;
  const fileRow = (r, f, btns) => `<div class="fil"><span class="ft">${I('file')}</span><div class="grow" style="min-width:0"><div class="nm trunc">${esc(f.name)}</div><div class="muted">${f.sheets} sheet${f.sheets === 1 ? '' : 's'} · ${f.lines} lines extracted · ${esc(O.fmtD(f.at))} · ${esc(f.from)}</div></div>${btns}</div>`;
  const attachTab = (r) => (r.files.length ? r.files.map((f) => `<div class="rcardx" style="margin-bottom:12px"><div class="rcardx-b">${fileRow(r, f, `<button class="btn outline sm" data-act="rfq-preview" data-arg="${f.id}">${I('eye')} View</button><button class="btn outline sm" data-act="rfq-download" data-arg="${f.id}">${I('download')} Download</button>`)}</div></div>`).join('') : `<div class="empty-card">${DM.empty('paperclip', 'No attachments', 'This RFQ was keyed in or received without a source file.')}</div>`);
  const overviewTab = (r) => {
    const h = hl(r); const t = tally(r); const reg = r.lines.filter((l) => l.decision === 'regret'); const det = r.lines.filter((l) => l.decision === 'needs_details');
    const c = (l, v, s, ic) => `<div class="card statc"><div class="statc-h">${DM.icoTile(ic)}<span class="grow">${l}</span></div><div class="statc-d"></div><div class="statc-v" style="${v === 0 ? 'color:#a3a3a3' : ''}">${DM.cnt(v, 'num', 'rfq-' + l)}</div><div class="statc-s">${s}</div></div>`;
    return `<div class="rgrid4 stagger">${c('Matched as proposed', h.proposed, "Anuma's code, kept as it came", 'circlecheck')}${c('Replaced', h.replaced, 'Anuma was wrong, a human fixed it', 'swap')}${c('Expanded', h.expanded, 'One request line, several parts', 'layers')}${c('Merged', h.merged, 'Lines bracketed into a group', 'box')}</div>
      <div class="rgrid2"><div class="rcardx"><div class="rcardx-h"><span class="ic" style="color:#d97706">${I('clock')}</span>Needs details</div><div class="rcardx-b">${det.length ? det.map((l) => `<div class="regline"><div class="t">${esc(l.text)}</div><div class="n">${esc(l.detailsNote || 'Waiting on the customer')}</div></div>`).join('') : '<span class="muted">No line is waiting on the customer.</span>'}</div></div>
      <div class="rcardx"><div class="rcardx-h"><span class="ic" style="color:#dc2626">${I('ban')}</span>Regret<span class="r">${reg.length ? `<button class="btn outline sm" data-act="rfq-viewall-regret">View all</button><span class="redbadge">${reg.length}</span>` : ''}</span></div><div class="rcardx-b">${reg.length ? reg.slice(0, 4).map((l) => `<div class="regline"><div class="t">${esc(l.text)}</div><div class="n">${l.regretNote ? esc(l.regretNote) : "No note recorded — nothing says why we aren't quoting it."}</div><div class="n xs">${l.n} · ${upN(l.qty)} ${esc(l.unit)}</div></div>`).join('') : '<span class="muted">Nothing excluded so far.</span>'}</div></div></div>
      <div class="rgrid2"><div class="rcardx"><div class="rcardx-h"><span class="small-l grow">Activity</span><button class="btn outline sm" data-act="rfq-tab" data-arg="timeline">View all</button></div><div class="rcardx-b">${r.activity.slice(0, 4).map((a) => `<div class="actrow">${a.actor === 'Anuma' ? O.assignee('agent') : DM.avatar(a.actor, 'sm', { org: false })}<div class="grow" style="min-width:0"><div><b style="font-weight:600">${esc(a.actor)}</b> ${esc(a.text)}</div></div><span class="muted xs">${esc(O.fmtD(a.at).slice(0, 6))}</span></div>`).join('')}</div></div>
      <div class="rcardx"><div class="rcardx-h"><span class="small-l grow">Source files</span><span class="muted">${r.files.length} file${r.files.length === 1 ? '' : 's'}</span></div><div class="rcardx-b">${r.files.length ? r.files.map((f) => fileRow(r, f, `<button class="btn outline sm" data-act="rfq-preview" data-arg="${f.id}">${I('eye')} Preview</button>`)).join('<div style="height:10px"></div>') : '<span class="muted">No source file — keyed in by hand.</span>'}</div></div></div>`;
  };
  const recordPage = (r) => {
    const tab = tabQ(); const t = tally(r); const canConv = t.pending === 0 && t.details === 0 && r.status !== 'quoted' && r.status !== 'exported';
    const tabs = [['overview', 'Overview', 'layout', null], ['line-items', 'Items', 'list', t.all], ['timeline', 'Activity', 'history', null], ['attachments', 'Attachments', 'paperclip', null]];
    const body = tab === 'line-items' ? itemsTab(r) : tab === 'timeline' ? activityTab(r) : tab === 'attachments' ? attachTab(r) : overviewTab(r);
    return `<div class="page rfq-page"><div class="rh"><button class="btn outline icon" data-go="${listPath()}" title="Back to RFQs">${I('arrowL')}</button><h1>${esc(r.no)}<span class="ac">${esc(acct(r) || 'Unassigned')}</span></h1>
      <div class="acts"><button class="fbtn" data-act="rfq-status">${I('dot-' + r.status).replace('class="i "', 'class="i" style="color:' + COLORS[r.status] + '"')}${ST[r.status]}${I('chevD')}</button><button class="btn" data-act="rfq-convert" style="${canConv ? '' : 'opacity:.45'}" ${r.status === 'quoted' || r.status === 'exported' ? 'disabled' : ''}>Convert to quote</button><button class="btn outline icon" data-act="rfq-menu" title="More">${I('more')}</button></div></div>
      ${r.quote ? `<div class="xs muted" style="margin:-6px 0 10px">Quote ${esc(r.quote.ref)} · ${DM.fmt.inr(r.quote.total)}${r.sapRef ? ' · SAP ' + esc(r.sapRef) : ''}</div>` : ''}
      <div class="rtabs">${tabs.map(([k, l, ic, n]) => `<button class="rtab ${tab === k ? 'on' : ''}" data-act="rfq-tab" data-arg="${k}">${I(ic)}${l}${n != null ? ` <span class="cnt-chip">${n}</span>` : ''}</button>`).join('')}</div>
      <div class="pg-enter" key="${tab}">${body}</div></div>`;
  };

  DM.page('/orders/rfqs', { title: 'RFQs', render: pageList });
  DM.page('/orders/rfqs/:id', {
    title: 'RFQs', crumb: () => 'RFQs',
    render: ({ params }) => { const r = R().find((x) => x.id === params.id); return r ? recordPage(r) : `<div class="page"><div class="empty-card">${DM.empty('file', 'RFQ not found', 'It may have been removed.', { action: `<button class="btn outline sm" style="margin-top:12px" data-go="/orders/rfqs">Back to RFQs</button>` })}</div></div>`; },
    after: () => { const u = ui(); if (u.focus) { u.focus = false; const el = document.querySelector('[data-input="rfq-et"]'); if (el) { el.focus(); el.select(); } } },
  });

  /* ───────── popovers & dialogs ───────── */
  const cur = () => R().find((x) => x.id === (DM.match(DM.path()) || { params: {} }).params.id);
  const popover = (anchor, html, mount) => {
    document.querySelectorAll('.menu').forEach((m) => m.remove()); const r = anchor.getBoundingClientRect(); const m = document.createElement('div'); m.className = 'menu'; m.style.cssText = `width:300px;padding:4px`; m.innerHTML = html; document.body.appendChild(m);
    m.style.top = r.bottom + 4 + 'px'; m.style.left = Math.max(8, Math.min(r.left, innerWidth - 308)) + 'px'; mount && mount(m); return m;
  };
  DM.act('rfq-view', (el) => { const v = el.dataset.arg; DM.go('/orders/rfqs' + (v === 'board' ? '?view=board' : '')); });
  DM.act('rfq-expand', () => { const Q = DM.query(); DM.go('/orders/rfqs?view=board' + (Q.get('expand') ? '' : '&expand=1')); });
  DM.input('rfq-q', (v) => { ui().q = v; DM.render(); });
  DM.act('rfq-f-status', (el) => DM.menu(el, [{ label: 'All statuses', check: !ui().status, run: () => { ui().status = ''; DM.render(); } }, ...Object.keys(ST).map((k) => ({ label: ST[k], icon: 'dot-' + k, check: ui().status === k, run: () => { ui().status = k; DM.render(); } }))], { w: 200 }));
  DM.act('rfq-f-source', (el) => DM.menu(el, [{ label: 'Any source', check: !ui().source, run: () => { ui().source = ''; DM.render(); } }, ...SOURCES.map((s) => ({ label: s, check: ui().source === s, run: () => { ui().source = s; DM.render(); } }))], { w: 200 }));
  DM.act('rfq-f-sort', (el) => DM.menu(el, SORTS.map(([k, l]) => ({ label: l, check: ui().sort === k, run: () => { ui().sort = k; DM.render(); } })), { w: 180 }));
  DM.act('rfq-f-acct', (el) => {
    const draw = (m, q) => { const L = (S().parties || []).filter((p) => R().some((r) => r.partyId === p.id)).filter((p) => !q || (p.name + ' ' + p.number).toLowerCase().includes(q)).slice(0, 40); m.querySelector('.al').innerHTML = `<button class="mi" data-v="" style="display:flex;width:100%;padding:6px 8px;border-radius:8px;gap:8px;min-height:28px;align-items:center"><span class="grow">All accounts</span>${!ui().account ? I('check') : ''}</button><button class="mi" data-v="none" style="display:flex;width:100%;padding:6px 8px;border-radius:8px;gap:8px;min-height:28px;align-items:center"><span class="grow">Unassigned</span>${ui().account === 'none' ? I('check') : ''}</button>${L.map((p) => `<button class="mi" data-v="${p.id}" style="display:flex;width:100%;padding:6px 8px;border-radius:8px;gap:8px;min-height:28px;align-items:center;text-align:left"><span class="grow trunc">${esc(p.name)}</span><span class="rno">${esc(p.number)}</span>${ui().account === p.id ? I('check') : ''}</button>`).join('')}`; m.querySelectorAll('.mi').forEach((b) => { b.onmouseenter = () => (b.style.background = '#f5f5f5'); b.onmouseleave = () => (b.style.background = ''); b.onclick = () => { ui().account = b.dataset.v; m.remove(); DM.render(); }; }); };
    popover(el, `<div class="sgroup" style="width:100%;margin-bottom:4px">${I('search')}<input placeholder="Search accounts…"></div><div class="al" style="max-height:300px;overflow:auto"></div>`, (m) => { draw(m, ''); const inp = m.querySelector('input'); inp.focus(); inp.oninput = () => draw(m, inp.value.toLowerCase()); setTimeout(() => document.addEventListener('mousedown', function f(e) { if (!e.target.closest('.menu')) { m.remove(); document.removeEventListener('mousedown', f); } }), 0); });
  });

  // New RFQ
  DM.act('rfq-new', () => {
    const rowHtml = () => `<div class="nl"><input class="input" placeholder="What they asked for" data-f="text"><input class="input" placeholder="Their code" data-f="code"><input class="input" placeholder="Qty" data-f="qty" inputmode="numeric"><input class="input" placeholder="Unit" data-f="unit" value="Nos"><button class="btn ghost icon sm" data-f="del" title="Remove">${I('trash')}</button></div>`;
    DM.dialog({ title: 'New RFQ', sub: "Key in what the customer asked for. Matching runs against the catalog afterwards — you don't need SKUs here.", w: 640,
      body: `<div class="col" style="gap:12px"><div class="field"><label>Account (optional)</label><select class="select" name="acct"><option value="">Select account</option>${(S().parties || []).slice(0, 60).map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Customer reference</label><input class="input" name="ref" placeholder="Their RFQ number or subject"></div><div class="field"><label>Notes (optional)</label><input class="input" name="notes" placeholder="Anything the lines don't say"></div><div><div class="row" style="margin-bottom:8px"><b style="font-size:12px">Requested lines</b><button class="btn outline sm right" data-f="add">${I('plus')} Add line</button></div><div id="nl-rows">${rowHtml()}</div></div></div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create RFQ', run: (d) => {
        const lines = [...d.querySelectorAll('.nl')].map((g) => ({ text: g.querySelector('[data-f=text]').value.trim(), code: g.querySelector('[data-f=code]').value.trim(), qty: parseFloat(g.querySelector('[data-f=qty]').value) || 1, unit: g.querySelector('[data-f=unit]').value.trim() || 'Nos' })).filter((l) => l.text);
        if (!lines.length) { DM.toast('Add at least one requested line', 'info'); return false; }
        const pid = d.querySelector('[name=acct]').value || null; const pt = pid && party(pid);
        const r = add(S(), { partyId: pid, contactId: pt && pt.contactIds ? pt.contactIds[0] : null, reference: d.querySelector('[name=ref]').value, notes: d.querySelector('[name=notes]').value, source: 'Manual', lines });
        r.status = r.lines.some((l) => l.match && l.match.confidence < 80) ? 'needs_review' : 'matching';
        addLog(S(), `Created Rfq: ${r.no} - Manual`, 'auto-drafted', 'rfq_created', '#/orders/rfqs/' + r.id); DM.toast('RFQ created'); DM.go(base(r.id)); } }],
      onMount: (d) => { d.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (!b) return; if (b.dataset.f === 'add') d.querySelector('#nl-rows').insertAdjacentHTML('beforeend', rowHtml()); if (b.dataset.f === 'del' && d.querySelectorAll('.nl').length > 1) b.closest('.nl').remove(); }); } });
  });
  // Upload BOQ
  DM.act('rfq-upload', () => {
    let file = null;
    DM.dialog({ title: 'Upload BOQ', sub: 'One RFQ is created from the sheet, with its lines read out automatically. Set the account and fix any line afterwards.', w: 420,
      body: `<label class="drop" id="drop">${I('upload')}<div class="b" style="margin-top:8px">Drop a sheet, or click to browse</div><div class="muted xs">.xlsx, .xls or .csv</div><input type="file" id="boq" accept=".xlsx,.xls,.csv" style="display:none"></label><div id="boq-name" class="xs muted" style="margin-top:8px"></div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Upload', run: (d) => { if (!file) { DM.toast('Choose a sheet first', 'info'); return false; } importBoq(file); } }],
      onMount: (d) => { const inp = d.querySelector('#boq'), dz = d.querySelector('#drop'); const pick = (f) => { file = f; d.querySelector('#boq-name').textContent = f.name + ' · ' + Math.max(1, Math.round(f.size / 1024)) + ' KB'; }; inp.onchange = () => inp.files[0] && pick(inp.files[0]); dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('over'); }; dz.ondragleave = () => dz.classList.remove('over'); dz.ondrop = (e) => { e.preventDefault(); dz.classList.remove('over'); e.dataTransfer.files[0] && pick(e.dataTransfer.files[0]); }; } });
  });
  const importBoq = (f) => {
    const finish = (lines) => { const r = add(S(), { source: 'Manual', lines, files: [{ id: DM.uid('f'), name: f.name, sheets: 1, lines: lines.length, from: meUser().name.toLowerCase().replace(/\s+/g, '.') + '@demo.anuma.run', at: nowIso() }] }); r.status = 'needs_review'; addLog(S(), `Created Rfq: ${r.no} - Manual (BOQ ${f.name})`, 'auto-drafted', 'rfq_created', '#/orders/rfqs/' + r.id); DM.toast(`RFQ created from ${f.name}`); DM.go(base(r.id)); };
    if (/\.csv$/i.test(f.name)) { const rd = new FileReader(); rd.onload = () => { const rows = String(rd.result).split(/\r?\n/).map((x) => x.split(',')).filter((x) => x[0] && x[0].trim()); const lines = rows.slice(/qty|description|item/i.test(rows[0] && rows[0].join(' ')) ? 1 : 0).slice(0, 80).map((c) => ({ text: String(c[0]).replace(/^"|"$/g, '').trim(), qty: parseFloat(c[1]) || 1, unit: (c[2] || 'Nos').trim() })); finish(lines.length ? lines : sample(18)); }; rd.readAsText(f); } else finish(sample(22));
  };
  const sample = (n) => { const V = allVariants(S()); const out = []; for (let i = 0; i < n && V.length; i++) { const x = V[(i * 7 + 3) % V.length]; out.push({ text: (x.st.name.length > 70 ? x.st.name.slice(0, 70) : x.st.name), qty: [10, 25, 50, 100, 200, 500][i % 6], unit: 'Nos' }); } return out; };

  /* ───────── record actions ───────── */
  DM.act('rfq-tab', (el) => { const r = cur(); if (!r) return; ui().edit = null; DM.go(base(r.id) + (el.dataset.arg === 'overview' ? '' : '?tab=' + el.dataset.arg)); });
  DM.act('rfq-viewall-regret', () => { const r = cur(); if (!r) return; ui().lf = 'regret'; DM.go(base(r.id) + '?tab=line-items'); });
  DM.act('rfq-status', (el) => { const r = cur(); if (!r) return; DM.menu(el, Object.keys(ST).map((k) => ({ label: ST[k], icon: 'dot-' + k, check: r.status === k, run: () => { setStatus(r, k); DM.render(); } })), { w: 200, right: true }); });
  DM.act('rfq-menu', (el) => { const r = cur(); if (!r) return; DM.menu(el, [{ label: 'Edit details', icon: 'pencil', run: () => editDetails(r) }, { label: 'Download lines (CSV)', icon: 'download', run: () => downloadLines(r) }], { w: 200, right: true }); });
  const editDetails = (r) => DM.dialog({ title: 'Edit details', w: 460, body: `<div class="col" style="gap:12px"><div class="field"><label>Account</label><select class="select" name="acct"><option value="">Unassigned</option>${(S().parties || []).slice(0, 60).map((p) => `<option value="${p.id}" ${p.id === r.partyId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Customer reference</label><input class="input" name="ref" value="${esc(r.reference)}"></div><div class="field"><label>Notes</label><textarea class="textarea" name="notes" rows="3">${esc(r.notes)}</textarea></div></div>`,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (d) => { const ch = []; const pid = d.querySelector('[name=acct]').value || null; if (pid !== r.partyId) { ch.push('account'); r.partyId = pid; const p = pid && party(pid); r.contactId = p && p.contactIds ? p.contactIds[0] || null : null; } const ref = d.querySelector('[name=ref]').value; if (ref !== r.reference) { ch.push('reference'); r.reference = ref; } const nt = d.querySelector('[name=notes]').value; if (nt !== r.notes) { ch.push('notes'); r.notes = nt; } if (ch.length) { addAct(r, `Updated Rfq: ${r.no} - ${r.source} (Changed fields: ${ch.join(', ')})`); addLog(S(), `Updated Rfq: ${r.no} (Changed fields: ${ch.join(', ')})`, 'logged', 'rfq_updated', '#/orders/rfqs/' + r.id); DM.toast('Details saved'); } DM.render(); } }] });
  const downloadLines = (r) => DM.downloadCSV(r.no + '-lines.csv', [['#', 'Original request', 'Qty', 'Unit', 'Matched SKU', 'Decision']].concat(r.lines.map((l) => [l.n, l.text, l.qty, l.unit, l.match ? l.match.sku : '', l.decision])));
  DM.act('rfq-convert', () => { const r = cur(); if (!r) return; const t = tally(r); if (t.pending || t.details) return DM.toast(`${t.pending + t.details} lines still to decide`, 'info'); convert(S(), r.id); DM.toast(`Converted to quote ${r.quote.ref}`); DM.render(); });
  DM.act('rfq-sap', (el) => { const r = cur(); if (!r) return; el.disabled = true; el.innerHTML = `<span class="spin"></span> Sending…`; setTimeout(() => { sendToSap(S(), r.id); DM.toast(`Sent to SAP · ${r.sapRef}`, 'send'); DM.render(); }, 900); });
  DM.act('rfq-preview', (el) => { const r = cur(); if (!r) return; const f = r.files.find((x) => x.id === el.dataset.arg); if (!f) return;
    DM.dialog({ title: f.name, sub: `${f.sheets} sheet${f.sheets === 1 ? '' : 's'} · ${f.lines} lines · from ${esc(f.from)}`, w: 860, body: `<div class="sheetg"><table><thead><tr><th>Sr</th><th>Description</th><th>Code</th><th>Qty</th><th>UOM</th></tr></thead><tbody>${r.lines.slice(0, 60).map((l) => `<tr><td>${l.n}</td><td>${esc(l.text)}</td><td>${esc(l.code || '')}</td><td>${upN(l.qty)}</td><td>${esc(l.unit)}</td></tr>`).join('')}</tbody></table></div>`, actions: [{ label: 'Close', cls: 'outline' }] }); });
  DM.act('rfq-download', (el) => { const r = cur(); if (r) downloadLines(r); });
  DM.act('rfq-lf', (el) => { ui().lf = el.dataset.arg; DM.render(); });
  DM.input('rfq-lq', (v) => { ui().lq = v; DM.render(); });
  DM.act('rfq-kit', (el, e) => { e && e.stopPropagation && e.stopPropagation(); const id = el.dataset.arg; ui().open[id] = !ui().open[id]; DM.render(); });
  DM.act('rfq-expall', () => { const r = cur(); if (!r) return; const kits = r.lines.filter((l) => l.type === 'Kit'); const all = kits.every((l) => ui().open[l.id]); kits.forEach((l) => (ui().open[l.id] = !all)); DM.render(); });
  DM.act('rfq-edit', (el, e) => { if (e && e.target && e.target.closest('button,input,.chev')) return; const r = cur(); if (!r) return; const l = r.lines.find((x) => x.id === el.dataset.arg); if (!l) return; ui().edit = { lineId: l.id, text: l.text, qty: String(l.qty), unit: l.unit }; ui().focus = true; DM.render(); });
  DM.input('rfq-et', (v) => { if (ui().edit) ui().edit.text = v; }); DM.input('rfq-eq', (v) => { if (ui().edit) ui().edit.qty = v; }); DM.input('rfq-eu', (v) => { if (ui().edit) ui().edit.unit = v; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ui().edit && /^\/orders\/rfqs\/[^/]+$/.test(DM.path())) { ui().edit = null; DM.render(); } });
  const saveEdit = (r, l) => { const e = ui().edit; if (!e) return; const ch = []; if (e.text.trim() && e.text !== l.text) { l.text = e.text.trim(); ch.push('text'); } const q = parseFloat(e.qty); if (!isNaN(q) && q !== l.qty) { l.qty = q; ch.push('quantity'); } if (e.unit.trim() && e.unit !== l.unit) { l.unit = e.unit.trim(); ch.push('unit'); } return ch; };
  DM.act('rfq-confirm', (el) => { const r = cur(); if (!r) return; const l = r.lines.find((x) => x.id === el.dataset.arg); if (!l) return; const ch = saveEdit(r, l); if (ch && ch.includes('text')) autoMatch(S(), l); if (!l.match) { ui().edit = null; return openMatch(r, l); } ui().edit = null; setDecision(S(), r, l, 'confirmed'); addAct(r, `Line confirmed: ${l.match ? l.match.sku : l.text} × ${l.qty}`); addLog(S(), `Line confirmed: ${l.text}`, 'confirmed', 'line_confirmed', '#/orders/rfqs/' + r.id); DM.toast('Line confirmed'); DM.render(); });
  DM.act('rfq-more', (el) => { const r = cur(); if (!r) return; const l = r.lines.find((x) => x.id === el.dataset.arg); DM.menu(el, [{ label: 'Regret this line', icon: 'ban', run: () => regretDialog(r, l) }, { label: 'Needs details from customer', icon: 'clock', run: () => { ui().edit = null; l.decision = 'needs_details'; l.detailsNote = 'Waiting on the customer'; reflow(r); addAct(r, `Updated Rfq Line Item: ${l.text} (Changed fields: disposition)`); DM.render(); } }, { label: 'Reset to pending', icon: 'rotate', run: () => { ui().edit = null; l.decision = 'pending'; if (l.match) l.match.state = 'proposed'; reflow(r); DM.render(); } }], { w: 220, right: true }); });
  const regretDialog = (r, l) => DM.dialog({ title: 'Regret this line', sub: 'The line is left out of the quote. A note helps whoever reads this later.', w: 460, body: `<div class="field"><label>Note (optional)</label><textarea class="textarea" name="note" rows="3" placeholder="Why are we not quoting it?"></textarea></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Regret line', cls: 'danger', run: (d) => { ui().edit = null; setDecision(S(), r, l, 'regret', d.querySelector('[name=note]').value.trim()); addAct(r, `Updated Rfq Line Item: ${l.text} - ${l.qty} ${l.unit} (Changed fields: disposition)`); DM.toast('Line marked as regret'); DM.render(); } }] });
  DM.act('rfq-match', (el, e) => { e && e.stopPropagation && e.stopPropagation(); const r = cur(); if (!r) return; const l = r.lines.find((x) => x.id === el.dataset.arg); if (l) openMatch(r, l); });
  const openMatch = (r, l) => {
    let sel = null, mode = 'cand', q = ''; let cand = candidates(S(), l.text, 6); if (l.match && !cand.some((c) => c.v.id === l.match.variantId)) { const f = allVariants(S()).find((x) => x.v.id === l.match.variantId); if (f) cand.unshift({ st: f.st, v: f.v, conf: l.match.confidence, rate: l.match.rate }); }
    const rowsHtml = (L) => `<div class="mt-row h"><div></div><div>Code</div><div>Description</div><div>Match</div></div>${L.map((c) => `<div class="mt-row ${sel === c.v.id ? 'sel' : ''}" data-v="${c.v.id}"><div><span class="rad"></span></div><div><b style="font-weight:600">${esc(c.v.sku || c.v.id)}</b></div><div title="${esc(c.v.name)}">${esc(c.v.name)}</div><div><span class="confc ${c.conf < 60 ? 'l' : c.conf < 80 ? 'm' : ''}"><i></i>${c.conf != null ? c.conf + '%' : ''}</span></div></div>`).join('') || '<div class="empty" style="padding:24px 0">No close matches.</div>'}`;
    DM.dialog({ title: `<div><div class="xs muted" style="font-weight:400">Pick the catalog match</div><b>${esc(l.code || l.text.slice(0, 48))}</b></div>`, w: 636,
      body: `<div id="mt"></div><div id="mt-s" style="text-align:center;margin-top:12px;font-size:12px" class="muted">Didn't find the product you were looking for? <a class="linkb" id="mt-sb">Search catalog</a></div>`,
      actions: [{ label: 'Regret', cls: 'outline', run: () => { setTimeout(() => regretDialog(r, l), 80); } }, { label: 'Confirm match', run: (d) => { if (!sel) { DM.toast('Pick a catalog match first', 'info'); return false; } const f = allVariants(S()).find((x) => x.v.id === sel); const prev = l.match && l.match.variantId; const c = candidates(S(), l.text, 6).find((x) => x.v.id === sel); l.match = { styleId: f.st.id, variantId: f.v.id, sku: f.v.sku || f.v.id, alt: Math.max(0, cand.length - 1), confidence: c ? c.conf : 92, rate: c ? c.rate : 120, state: 'confirmed' }; if (prev && prev !== sel) l.replaced = true; ui().edit = null; setDecision(S(), r, l, 'confirmed'); addAct(r, `Line confirmed: ${l.match.sku} × ${upN(l.qty)}`); addLog(S(), `Line confirmed: ${f.st.name}`, 'confirmed', 'line_confirmed', '#/orders/rfqs/' + r.id); DM.toast('Match confirmed'); DM.render(); } }],
      onMount: (d) => { const box = d.querySelector('#mt'); const draw = () => { const L = mode === 'search' ? allVariants(S()).filter(({ st, v }) => !q || (st.name + ' ' + v.name + ' ' + (v.sku || '')).toLowerCase().includes(q)).slice(0, 12).map(({ st, v }) => ({ st, v, conf: null })) : cand; box.innerHTML = (mode === 'search' ? `<div class="sgroup" style="width:100%;margin-bottom:8px">${I('search')}<input id="mt-q" placeholder="Search catalog by code or description…" value="${esc(q)}"></div>` : '') + `<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">${rowsHtml(L)}</div>`; const qi = box.querySelector('#mt-q'); if (qi) { qi.focus(); qi.setSelectionRange(q.length, q.length); qi.oninput = () => { q = qi.value.toLowerCase(); draw(); }; } box.querySelectorAll('.mt-row[data-v]').forEach((row) => (row.onclick = () => { sel = row.dataset.v; draw(); const b = d.querySelector('[data-modal-act="1"]'); if (b) b.disabled = false; })); }; draw(); const b = d.querySelector('[data-modal-act="1"]'); if (b) b.disabled = true; d.querySelector('#mt-sb').onclick = () => { mode = 'search'; sel = null; d.querySelector('#mt-s').remove(); draw(); }; } });
  };
})();
