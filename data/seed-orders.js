/* data/seed-orders.js — `drafts` (newhome, stuffcool) and `rfqs` (rfq). FAKE data, deterministic, generated at load from the base seeds
   (parties / contacts / users / styles must already be registered: index.html loads data/base-*.js first).

   draft  { id:'d-1144', no:'DRF-1144', n:1144, createdAt:ISO(+05:30), partyId|null, partyName (fallback when partyId null), contactId|null,
            caseId|null (thread id), caseNo|null ('251026-4'), assigned:'anuma'|'agent'|<userId>|null, assignees:['anuma'|'agent'|userId…],
            status:'pending'|'confirmed'|'posted'|'failed', channel:'whatsapp', timeToCloseMin:number|null, interventions:number,
            lines:[{n, styleId, variantId, name (style name, bold), variant (muted line), style (code), qty, unit:'Meter'|'Roll'|'Piece', state:'confirmed'|'pending'|'flagged'}],
            erp:null | {system:'Coral ERP'|'Tally', outcome:'ok'|'error'|null, transaction, orderRef (Coral) | voucherNo+voucherType+ledger (Tally), customerRef, sentAt, responseAt, lineCount, error|null} }

   rfq    { id:'rfq-1001', no:'RFQ-202610-1001', n:1001, partyId|null, contactId|null, reference, source:'Email Attachment'|'Email Body'|'SAP'|'Custom Webhook'|'Manual',
            status:'received'|'matching'|'needs_review'|'ready'|'quoted'|'exported', receivedAt:ISO, owner:userId|null, notes,
            lines:[{id, n, text (as the customer wrote it), code (their code|''), qty, unit:'Nos', type:''|'Kit', decision:'pending'|'confirmed'|'regret'|'needs_details', replaced:bool, expanded:bool, merged:bool,
                    regretNote, detailsNote, match:null|{styleId, variantId, sku, alt:number, confidence:0-100, rate, state:'confirmed'|'proposed'}, parts:[{text, sku, qty}] (Kit)}],
            files:[{id, name, sheets, lines, from, at}], activity:[{id, actor, at, text, tag:'logged'|'auto-drafted'}],
            quote:null|{ref, at, total}, exportedAt:null|ISO, sapRef:null|string }
   Helpers other waves can call: DM.orders.addDraft(S, partial) / DM.orders.nextNo(S) ; DM.rfq.add(S, partial) / DM.rfq.autoMatch(S, line) / DM.rfq.sendToSap(S, id)  (defined in pages/*.js) */
(function () {
  if (!window.DM) return;
  const SEED = DM.seed;
  const rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const iso = (m, d, h, mi) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:00+05:30`;
  const addMin = (s, mins) => new Date(Date.parse(s) + mins * 60000).toISOString().replace('Z', '+00:00');
  const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const pickW = (r, arr) => { let t = arr.reduce((a, x) => a + x[1], 0), x = r() * t; for (const [v, w] of arr) { x -= w; if (x <= 0) return v; } return arr[0][0]; };
  const bucket = (uc) => (SEED[uc] = SEED[uc] || {});
  const caseTag = (iso0, seq) => { const d = new Date(Date.parse(iso0) + 5.5 * 3600000); const p = (x) => String(x).padStart(2, '0'); return p(d.getUTCDate()) + p(d.getUTCMonth() + 1) + String(d.getUTCFullYear()).slice(2) + '-' + seq; };

  /* ───────────────────────── DRAFTS ───────────────────────── */
  const buildDrafts = (uc, o) => {
    const B = bucket(uc); if (!B.parties || !B.styles) return;
    const r = rng(o.seed); const parties = B.parties.filter((p) => p.status !== 'Inactive'); const users = B.users || [];
    const styles = B.styles.filter((s) => s.variants && s.variants.length && s.code !== '--' && s.status === 'Active');
    const asm = users.filter((u) => /ASM|Sales|Manager/i.test(u.role) && !u.me).map((u) => u.id);
    const unit = (s, v) => (o.unitOf ? o.unitOf(s, v, r) : 'Piece');
    const mkLines = (cnt) => { const used = new Set(); const out = []; for (let k = 0; k < cnt; k++) { let s, tries = 0; do { s = styles[Math.floor(r() * styles.length)]; tries++; } while (used.has(s.id) && tries < 8); used.add(s.id); const v = s.variants[Math.floor(r() * s.variants.length)]; out.push({ n: k + 1, styleId: s.id, variantId: v.id, name: s.name, variant: v.name, style: s.code, qty: o.qty(r, s), unit: unit(s, v), state: 'confirmed' }); } return out; };
    const picks = o.slots; // [{no, at:ISO, status, assigned, lines, party:id|'phone'|null, tc, iv, caseSeq|null}]
    const drafts = picks.map((sl, i) => {
      const pty = sl.party === 'phone' ? parties.find((p) => /^\+?\d/.test(p.name) && !(sl._used)) : sl.party ? B.parties.find((p) => p.id === sl.party) : parties[Math.floor(r() * parties.length)];
      const ct = pty && pty.contactIds && pty.contactIds.length ? pty.contactIds[0] : null;
      const lines = mkLines(sl.lines || 1 + Math.floor(r() * 4));
      if (sl.status === 'pending' && r() < 0.5) lines[0].state = 'pending';
      const posted = sl.status === 'posted' || sl.status === 'failed';
      const tc = sl.tc != null ? sl.tc : (r() < 0.12 ? null : Math.max(1, Math.round(2 + r() * 40)));
      const iv = sl.iv != null ? sl.iv : pickW(r, [[0, 3], [1, 3], [2, 2], [3, 1]]);
      const assigned = sl.assigned !== undefined ? sl.assigned : pickW(r, [['anuma', 45], ['agent', 14], [asm[Math.floor(r() * asm.length)] || 'anuma', 30], [null, 11]]);
      const assignees = assigned == null ? [] : assigned === 'anuma' || assigned === 'agent' ? [assigned] : ['anuma', assigned];
      const sent = posted ? addMin(sl.at, (tc || 6) + 2) : null;
      const d = {
        id: 'd-' + sl.no, no: 'DRF-' + sl.no, n: sl.no, createdAt: sl.at, partyId: pty ? pty.id : null, partyName: pty ? pty.name : '+91' + (9800000000 + Math.floor(r() * 99999999)), contactId: ct,
        caseId: null, caseNo: sl.caseSeq === null ? null : caseTag(sl.at, sl.caseSeq || 1 + Math.floor(r() * 4)), assigned, assignees, status: sl.status, channel: 'whatsapp', timeToCloseMin: tc, interventions: iv, lines,
        erp: posted ? o.erp(sl, pty, sent, lines, r) : null,
      };
      return d;
    });
    B.drafts = drafts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  };

  const coralErp = (sl, pty, sent, lines, r) => sl.status === 'failed'
    ? { system: 'Coral ERP', outcome: 'error', transaction: 'CRL-' + (48000 + Math.floor(r() * 900)), orderRef: null, customerRef: pty ? pty.number || pty.id : null, sentAt: sent, responseAt: addMin(sent, 0.1), lineCount: lines.length, error: sl.error || 'HTTP 422 · Customer is on credit hold in Coral ERP' }
    : { system: 'Coral ERP', outcome: 'ok', transaction: 'CRL-' + (48000 + Math.floor(r() * 900)), orderRef: 'SO-' + (47000 + sl.no), customerRef: pty ? pty.number || pty.id : null, sentAt: sent, responseAt: addMin(sent, 0.05), lineCount: lines.length, error: null };
  const tallyErp = (sl, pty, sent, lines, r) => sl.status === 'failed'
    ? { system: 'Tally', outcome: 'error', transaction: 'TLY-' + (7000 + Math.floor(r() * 900)), voucherNo: null, voucherType: 'Sales Order', ledger: pty ? pty.name : null, customerRef: pty ? pty.number || pty.id : null, sentAt: sent, responseAt: addMin(sent, 0.1), lineCount: lines.length, error: sl.error || 'Ledger "' + (pty ? pty.name : 'party') + '" not found in company' }
    : { system: 'Tally', outcome: 'ok', transaction: 'TLY-' + (7000 + Math.floor(r() * 900)), voucherNo: 'SO/26-27/' + String(300 + sl.no % 1000).padStart(4, '0'), voucherType: 'Sales Order', ledger: pty ? pty.name : null, customerRef: pty ? pty.number || pty.id : null, sentAt: sent, responseAt: addMin(sent, 0.05), lineCount: lines.length, error: null };

  // NewHome: 30 drafts, newest DRF-1152 (27 Oct), oldest DRF-1123 (≈ 8 Oct). 5 created today; u-rohan holds 3.
  const nhSlots = (() => {
    const S = [], t = [[27, 16, 22], [27, 14, 5], [27, 12, 31], [27, 10, 48], [27, 9, 12], [26, 18, 40], [26, 15, 9], [26, 11, 26], [25, 16, 47], [25, 16, 34], [25, 15, 48], [24, 17, 3], [24, 12, 15], [23, 19, 21], [22, 16, 36], [21, 21, 52], [21, 11, 46], [21, 11, 36], [20, 15, 10], [19, 18, 44], [16, 19, 1], [16, 12, 30], [15, 20, 32], [14, 14, 18], [13, 17, 5], [12, 10, 40], [10, 21, 38], [10, 12, 9], [9, 16, 51], [8, 11, 20]];
    t.forEach(([d, h, mi], i) => S.push({ no: 1152 - i, at: iso(10, d, h, mi) }));
    const st = ['pending', 'confirmed', 'posted', 'posted', 'confirmed'];
    S.forEach((s, i) => { s.status = i < 5 ? st[i] : i === 7 ? 'failed' : i === 14 ? 'failed' : 'posted'; });
    S[0].assigned = 'u-rohan'; S[2].assigned = 'u-rohan'; S[5].assigned = 'u-rohan'; S[1].assigned = 'u-pankaj'; S[3].assigned = 'anuma'; S[4].assigned = 'agent'; S[8].assigned = 'anuma'; S[9].assigned = 'anuma'; S[10].assigned = 'anuma';
    S[8].lines = 3; S[9].lines = 2; S[10].lines = 1; S[8].tc = 8; S[8].iv = 2; S[8].caseSeq = 4; S[9].caseSeq = 3; S[10].caseSeq = 1; S[12].party = 'phone'; S[16].party = 'phone'; S[20].lines = 8; S[22].lines = 7; S[26].caseSeq = null; S[27].caseSeq = null;
    S[0].party = 'AC-1004'; S[0].lines = 3; S[0].caseSeq = 3; S[2].caseSeq = 2; S[5].caseSeq = 1;
    // September (the previous period for "This month" → realistic Compare deltas)
    [[30, 17, 10], [29, 12, 5], [28, 16, 40], [26, 11, 15], [25, 18, 2], [24, 14, 33], [23, 10, 45], [22, 19, 8], [19, 15, 22], [18, 12, 0], [17, 17, 30], [16, 11, 12], [15, 16, 5], [12, 13, 44], [11, 10, 20], [10, 18, 18], [9, 14, 2], [8, 12, 36], [5, 16, 25], [4, 11, 48], [3, 15, 12], [2, 10, 5]].forEach(([d, h, mi], j) => S.push({ no: 1122 - j, at: iso(9, d, h, mi), status: j === 6 ? 'failed' : 'posted' }));
    return S;
  })();
  buildDrafts('newhome', {
    seed: 11, slots: nhSlots, erp: coralErp,
    qty: (r, s) => [5, 6, 10, 12, 15, 20, 25, 30, 40, 50, 60, 67, 90, 120][Math.floor(r() * 14)],
    unitOf: (s, v, r) => (r() < 0.6 ? 'Meter' : r() < 0.85 ? 'Roll' : 'Piece'),
  });

  // Stuffcool: 20 drafts, newest DRF-1020. ≥3 pending older than 4h (three from yesterday/earlier today), 2 failed Tally pushes.
  const scSlots = (() => {
    const t = [[27, 16, 40, 'pending'], [27, 15, 12, 'confirmed'], [27, 11, 2, 'pending'], [27, 9, 25, 'pending'], [27, 8, 48, 'posted'], [26, 18, 15, 'posted'], [26, 16, 52, 'pending'], [26, 12, 30, 'posted'], [25, 17, 9, 'posted'], [24, 14, 44, 'failed'], [24, 11, 18, 'posted'], [23, 16, 31, 'posted'], [22, 15, 5, 'posted'], [21, 12, 12, 'posted'], [20, 18, 26, 'posted'], [19, 10, 55, 'failed'], [17, 13, 40, 'posted'], [15, 17, 14, 'posted'], [13, 11, 8, 'posted'], [10, 14, 2, 'posted']];
    const sep = [[29, 15, 10, 'posted'], [26, 11, 30, 'posted'], [24, 17, 5, 'posted'], [22, 12, 48, 'failed'], [19, 16, 20, 'posted'], [17, 10, 15, 'posted'], [15, 14, 40, 'posted'], [12, 18, 2, 'posted'], [10, 11, 55, 'posted'], [8, 13, 25, 'posted'], [5, 16, 10, 'posted'], [3, 12, 30, 'posted']];
    return t.map(([d, h, mi, st], i) => ({ no: 1032 - i, at: iso(10, d, h, mi), status: st })).concat(sep.map(([d, h, mi, st], j) => ({ no: 1012 - j, at: iso(9, d, h, mi), status: st })));
  })();
  scSlots[0].assigned = 'u-rohan'; scSlots[1].assigned = 'anuma'; scSlots[2].assigned = 'agent'; scSlots[3].assigned = 'anuma'; scSlots[6].assigned = 'u-sneha'; scSlots[0].lines = 3; scSlots[1].lines = 2; scSlots[12].caseSeq = null; scSlots[0].party = 'AC-1005'; scSlots[2].party = 'AC-1006'; scSlots[3].party = 'AC-1007';
  buildDrafts('stuffcool', {
    seed: 23, slots: scSlots, erp: tallyErp,
    qty: (r) => [2, 4, 5, 6, 10, 12, 20, 24, 25, 50, 100][Math.floor(r() * 11)], unitOf: () => 'Piece',
  });
  // Stuffcool pending drafts keep erp null; confirmed ones (not yet pushed) too.

  /* ───────────────────────── RFQs (Access / Axis) ───────────────────────── */
  const buildRfqs = () => {
    const uc = 'rfq'; const B = bucket(uc); if (!B.parties || !B.styles) return;
    const r = rng(77); const users = B.users || []; const staff = users.filter((u) => /Sales|Manager|Owner/.test(u.role)).map((u) => u.id);
    const styles = B.styles.filter((s) => s.variants && s.variants.length);
    const rate = (sku) => 20 + (hash(sku) % 4800) / 10;
    const lugText = (s) => { const a = s.attrs || {}; const k = ['Bootless Type', 'Ring Type', 'pin Type', 'Fork Type'][hash(s.id) % 4]; return `${a.sizeMm2} Sqmm ${k} Lugs${r() < 0.5 ? ` with ${a.holeMm}mm dia Hole` : ''}`; };
    const textFor = (s) => { const a = s.attrs || {}; switch (a.type) { case 'Copper lug': return lugText(s); case 'MCB': return `${a.poles} ${a.ratingA}A ${a.curve} curve MCB ${a.breakingKa}kA`; case 'Contactor': return `${a.ratingA}A 3 pole contactor, ${a.coilV}V AC coil`; case 'Cable gland': return `${a.sizeMm}mm double compression gland with lock nut, earth tag & long shroud`; case 'SPD': return `Surge protection device 275V 40kA Type-2, 1+NPE`; case 'Busbar': return `Flexible laminated copper busbar ${a.widthMm} x 5 mm, 400 mm long`; case 'DIN rail': return `Galvanised DIN rail TS35, ${/750/.test(s.name) ? 750 : 350} mm`; case 'Hook': return 'Eye hook for panel lifting'; default: return s.name.toLowerCase(); } };
    const mkMatch = (s, conf, state) => { const v = s.variants[Math.floor(r() * s.variants.length)]; return { styleId: s.id, variantId: v.id, sku: v.sku || v.id, alt: Math.floor(r() * 5), confidence: conf, rate: Math.round(rate(v.sku || v.id) * 100) / 100, state }; };
    const staffName = (id) => (users.find((u) => u.id === id) || {}).name || 'Anuma';
    const regretNotes = ['Out of our range — refer to the OEM', 'Customer to confirm the cable size before we quote', 'Discontinued item, no substitute', 'Special order only, minimum quantity not met', ''];
    const CFG = [
      // [daysAgo(from 27 Oct), h, mi, status, source, lines, partyIdx|null]
      [0, 15, 12, 'received', 'Email Attachment', 46, 'AC-1002'], [0, 11, 40, 'received', 'Email Body', 12, 'AC-1006'], [1, 17, 25, 'matching', 'Email Attachment', 58, 'AC-1003'], [1, 10, 8, 'needs_review', 'SAP', 34, 'AC-1011'],
      [2, 14, 50, 'received', 'Custom Webhook', 22, null], [3, 12, 5, 'needs_review', 'Email Attachment', 50, 'AC-1009'], [4, 16, 33, 'ready', 'Email Attachment', 28, 'AC-1013'], [5, 11, 17, 'received', 'Manual', 16, 'AC-1021'],
      [6, 18, 2, 'needs_review', 'Email Attachment', 41, 'AC-1017'], [8, 13, 44, 'matching', 'SAP', 24, 'AC-1004'], [9, 10, 30, 'ready', 'Email Body', 18, 'AC-1015'], [10, 15, 21, 'quoted', 'Email Attachment', 52, 'AC-1010'],
      [12, 12, 9, 'received', 'Custom Webhook', 14, null], [13, 17, 48, 'needs_review', 'Email Attachment', 37, 'AC-1026'], [15, 11, 36, 'quoted', 'Email Attachment', 31, 'AC-1008'], [17, 14, 0, 'exported', 'SAP', 44, 'AC-1002'],
      [19, 16, 27, 'ready', 'Manual', 20, 'AC-1030'], [21, 10, 15, 'exported', 'Email Attachment', 60, 'AC-1019'], [24, 13, 3, 'quoted', 'Email Body', 26, 'AC-1012'], [27, 15, 40, 'exported', 'Email Attachment', 38, 'AC-1023'],
      [31, 11, 22, 'received', 'Custom Webhook', 15, 'AC-1034'], [36, 17, 9, 'exported', 'Email Attachment', 48, 'AC-1005'], [42, 12, 50, 'matching', 'Manual', 11, null], [49, 10, 18, 'quoted', 'Email Attachment', 29, 'AC-1027'],
      [58, 14, 35, 'exported', 'SAP', 33, 'AC-1018'], [63, 9, 45, 'received', 'Email Attachment', 120, 'AC-1001'],
    ];
    const dt = (daysAgo, h, mi) => { const base = Date.UTC(2026, 9, 27, h - 5, mi - 30) - daysAgo * 86400000; return new Date(base).toISOString().replace('Z', '+00:00').replace('.000', ''); };
    const ym = (isoS) => { const d = new Date(Date.parse(isoS) + 5.5 * 3600000); return d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0'); };
    const rfqs = CFG.map((c, i) => {
      const [da, h, mi, status, source, cnt, pid] = c; const at = dt(da, h, mi); const n = 1001 + (CFG.length - 1 - i);
      const party = pid ? B.parties.find((p) => p.id === pid) : null; const ct = party && party.contactIds && party.contactIds[0] ? party.contactIds[0] : null;
      const decided = status === 'ready' || status === 'quoted' || status === 'exported';
      const pPending = status === 'received' ? 0.9 : status === 'matching' ? 0.7 : status === 'needs_review' ? 0.62 : 0;
      const lines = []; let ln = 0;
      for (let k = 0; k < cnt; k++) {
        const s = styles[Math.floor(r() * styles.length)]; const kit = r() < 0.045 && (s.attrs || {}).type === 'Copper lug'; const text = textFor(s) + (kit ? ' (Kit)' : '');
        const qty = [4, 10, 12, 20, 25, 40, 50, 100, 200, 352, 500, 1200, 3500][Math.floor(r() * 13)];
        const regret = (decided ? r() < 0.05 : r() < 0.06);
        const decision = regret ? 'regret' : decided ? 'confirmed' : r() < pPending ? 'pending' : 'confirmed';
        const conf = decision === 'confirmed' ? 88 + Math.floor(r() * 12) : 48 + Math.floor(r() * 44);
        const l = { id: 'l-' + n + '-' + (k + 1), n: ++ln, text, code: r() < 0.3 ? (s.variants[0].sku || '') : '', qty, unit: 'Nos', type: kit ? 'Kit' : '', decision, replaced: decision === 'confirmed' && r() < 0.1, expanded: kit, merged: false, regretNote: regret ? regretNotes[Math.floor(r() * regretNotes.length)] : '', detailsNote: '',
          match: regret && r() < 0.5 ? null : mkMatch(s, conf, decision === 'confirmed' ? 'confirmed' : 'proposed'), parts: [] };
        if (kit) { const sz = (s.attrs || {}).sizeMm2 || 6; l.parts = [{ text: `Lug ${sz} Sqmm`, sku: l.match ? l.match.sku : '', qty: qty }, { text: 'PVC insulation sleeve', sku: 'PVC-SLV-' + sz, qty: qty }, { text: 'Crimp ferrule', sku: 'FER-' + sz, qty: qty }]; }
        lines.push(l);
      }
      if (status === 'needs_review') { const pend = lines.filter((l) => l.decision === 'pending'); if (pend.length < 3) lines.slice(0, 3).forEach((l) => { l.decision = 'pending'; if (l.match) { l.match.state = 'proposed'; l.match.confidence = 52 + Math.floor(r() * 30); } }); }
      if (status === 'needs_review' && r() < 0.5) { const x = lines.find((l) => l.decision === 'pending'); if (x) x.decision = 'needs_details', x.detailsNote = 'Rating and length not mentioned in the BOQ'; }
      const fname = (10000 + Math.floor(r() * 80000)) + (source === 'Email Body' ? '' : '_-_INPUT') + (r() < 0.3 ? '.pdf' : '.xls');
      const files = source === 'Email Body' || source === 'Manual' || source === 'Custom Webhook' ? (source === 'Email Body' ? [] : source === 'Manual' ? [] : [{ id: 'f-' + n, name: 'webhook-payload-' + n + '.json', sheets: 1, lines: cnt, from: 'portal@' + (party ? party.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') : 'customer') + '.example', at }]) : [{ id: 'f-' + n, name: fname, sheets: 1 + (cnt > 50 ? 1 : 0), lines: cnt, from: (ct ? 'purchase' : 'enquiry') + '@' + (party ? party.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') : 'customer') + '.example', at }];
      const owner = staff.length ? staff[i % staff.length] : null;
      const act = [{ id: 'a-' + n + '-1', actor: source === 'Manual' ? staffName(owner) : 'Anuma', at, text: `Created Rfq: RFQ-${ym(at)}-${n} - ${source}`, tag: 'auto-drafted' }];
      if (party) act.unshift({ id: 'a-' + n + '-0', actor: staffName(owner), at: addMin(at, 14), text: `Updated Rfq: RFQ-${ym(at)}-${n} - ${source} (Changed fields: account)`, tag: 'logged' });
      if (status !== 'received') act.unshift({ id: 'a-' + n + '-2', actor: 'Anuma', at: addMin(at, 6), text: `Created ${lines.length} Rfq Line Items and ${Math.max(1, Math.round(lines.length * 0.8))} Variant Match Feedback rows`, tag: 'auto-drafted' });
      if (decided) act.unshift({ id: 'a-' + n + '-3', actor: staffName(owner), at: addMin(at, 90), text: 'Line confirmed: ' + lines[0].text, tag: 'logged' });
      const total = lines.reduce((a, l) => a + (l.decision === 'regret' || !l.match ? 0 : l.qty * l.match.rate), 0);
      let quote = null, exportedAt = null, sapRef = null;
      if (status === 'quoted' || status === 'exported') { quote = { ref: 'QT-2026-' + String(180 + n % 900).padStart(4, '0'), at: addMin(at, 150), total: Math.round(total * 1.18) }; act.unshift({ id: 'a-' + n + '-4', actor: staffName(owner), at: addMin(at, 150), text: `Converted to quote ${quote.ref}`, tag: 'logged' }); }
      if (status === 'exported') { exportedAt = addMin(at, 200); sapRef = 'SAP-SO-' + (4500000 + n * 13); act.unshift({ id: 'a-' + n + '-5', actor: staffName(owner), at: exportedAt, text: `Sent to SAP: ${sapRef}`, tag: 'logged' }); }
      return { id: 'rfq-' + n, no: `RFQ-${ym(at)}-${n}`, n, partyId: party ? party.id : null, contactId: ct, reference: r() < 0.45 ? ['ENQ/' + (2600 + n), 'PO-REQ-' + (700 + n), 'Panel batch ' + (n % 9 + 1), 'Site ' + ['Phase-2', 'Substation A', 'Warehouse', 'Plant 3'][n % 4]][n % 4] : '', source, status, receivedAt: at, owner, notes: '', lines, files, activity: act, quote, exportedAt, sapRef };
    });
    B.rfqs = rfqs.sort((a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt));
  };
  buildRfqs();
})();
