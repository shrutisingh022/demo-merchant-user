/* Home (NewHome) / Dashboard (Stuffcool, Access) + Notifications page. Spec: docs/spec/shell-home.md §2, §3, §1.9. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, S = () => DM.S;
  const ME = 'u-rohan';
  const st = document.createElement('style'); st.dataset.for = 'dashboard';
  st.textContent = `
  .hm-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px}.hm-head h1{font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.2}
  .hm-head .dl{font-size:12px;color:var(--muted-foreground);margin-top:4px;display:flex;gap:6px;align-items:center}.hm-head .live{width:6px;height:6px;border-radius:50%;background:var(--success)}
  .hm-head .ctl{margin-left:auto;display:flex;gap:12px}
  .hm-sec{margin-top:28px}.hm-sec:first-of-type{margin-top:0}.hm-sec h2{font-size:14px;font-weight:600}.hm-sec .sub{font-size:12px;color:var(--muted-foreground);margin:2px 0 12px}
  .hm-sec .g3{gap:16px}.hm-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .hm-card{border:1px solid var(--border);border-radius:10px;background:#fff;overflow:hidden}.hm-card .ct{padding:11px 16px;font-size:13px;font-weight:600;border-bottom:1px solid var(--border)}
  .hm-card .dmgrid-wrap{border:0;border-radius:0}
  .hm-empty{border:1px solid var(--border);border-radius:10px;padding:34px 16px;text-align:center;display:flex;flex-direction:column;align-items:center}
  .hm-empty .icotile{margin-bottom:8px}.hm-empty .t{font-size:12px;font-weight:600}.hm-empty .s{font-size:12px;color:var(--muted-foreground);margin-top:2px}
  .badge-task{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;font-size:11px;font-weight:500;background:#fef9e7;color:#9a6208;border:1px solid #f4e3a8}
  .due-over{color:#e03a3a;font-weight:500}.due-soon{color:#9a6208;font-weight:500}.due-ok{color:#737373}
  .who{display:flex;align-items:center;gap:8px}.who .avatar{width:24px;height:24px}.who .un{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#f5f5f5;color:#8a8a8a}
  .chip-role{display:inline-block;margin-left:6px;height:18px;line-height:18px;padding:0 6px;border-radius:6px;background:#f4f4f5;font-size:10.5px;color:#525252;font-weight:400}
  .dash-sel{width:200px;height:32px;justify-content:space-between}.dash-sel .v{flex:1;text-align:center}
  .tlc{border:1px solid var(--border);border-radius:10px;background:#fff;margin-top:16px}.tlc .th{display:flex;align-items:center;gap:8px;padding:14px 16px 4px}.tlc .th b{font-size:14px;font-weight:600}.tlc .th a{margin-left:auto;font-size:12px;font-weight:500;text-decoration:underline;text-underline-offset:3px}
  .tlc .tsub{padding:0 16px 12px;font-size:12px;color:var(--muted-foreground);border-bottom:1px solid var(--border)}
  .tl{padding:6px 16px 8px;position:relative}.tl-row{display:flex;gap:12px;padding:10px 0;align-items:flex-start;position:relative}
  .tl-row:not(:last-child)::before{content:"";position:absolute;left:15px;top:44px;bottom:-12px;width:1px;background:var(--border)}
  .tl-n{width:30px;height:30px;border-radius:50%;border:1px solid var(--border);display:grid;place-items:center;background:#fff;flex:none;z-index:1}.tl-n svg.i{width:14px;height:14px;color:#525252}
  .tl-n.green{border-color:#a7e3c4;background:#f0fbf5}.tl-n.green svg.i{color:var(--success)}.tl-n.red svg.i{color:var(--destructive)}
  .tl-t{font-size:14px;font-weight:500;line-height:1.35}.tl-m{font-size:12px;color:var(--muted-foreground);margin-top:3px}
  .tl-pill{margin-left:auto;flex:none;height:22px;display:inline-flex;align-items:center;padding:0 9px;border-radius:999px;font-size:11.5px;font-weight:500;border:1px solid var(--border);color:#737373;background:#fff;white-space:nowrap}
  .tl-pill.green{background:rgba(19,162,105,.1);border-color:rgba(19,162,105,.35);color:#0b7a4e}.tl-pill.red{background:#fff2f0;border-color:#f5c2bd;color:#b42318}.tl-pill.amber{background:#fefce8;border-color:#f4e3a8;color:#9a6208}.tl-pill.blue{background:#f0f8ff;border-color:#bce4fc;color:#2563eb}
  .dscard{border:1px solid var(--border);border-radius:10px;background:#fff;padding:16px;margin-top:16px}.dscard .t{font-size:14px;font-weight:600}.dscard .n{font-size:34px;font-weight:700;letter-spacing:-.02em;margin-top:8px;line-height:1}.dscard .c{font-size:12px;color:var(--muted-foreground);margin-top:8px}
  .nf-bar{display:flex;align-items:center;gap:12px;margin:20px 0 12px}
  `;
  document.head.appendChild(st);

  /* ───────── helpers ───────── */
  const HM = (DM.ui.home = DM.ui.home || { who: 'yours' });
  const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const rng = (seed) => { let h = hash(seed) || 1; return () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return (h % 10000) / 10000; }; };
  const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const wk = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  const dm = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const user = (id) => (S().users || []).find((u) => u.id === id);
  const party = (id) => (S().parties || []).find((p) => p.id === id);
  const partyName = (t) => (party(t.partyId) || {}).name || t.name || t.contactName || t.phone || 'Unknown number';
  const contactName = (t) => { const c = (S().contacts || []).find((x) => x.id === t.contactId); return (c && c.name) || t.contactName || ''; };
  const mine = (o) => { const p = party(o.partyId); return o.owner === ME || o.assignee === ME || (p && p.owner === ME); };
  const reviewCard = (t) => (t.messages || []).some((m) => m.meta && (m.meta.kind === 'review' || m.meta.type === 'review') && !m.meta.resolved);
  const taskOf = (t) => t.task || (reviewCard(t) ? 'Confirm product' : 'Answer question');
  const handAt = (t) => new Date(t.handoffAt || t.escalatedAt || t.lastAt || DM.now());
  const isWaiting = (t) => t.status !== 'closed' && (t.status === 'escalated' || t.status === 'hold' || (t.owner && t.owner !== 'anuma'));
  const dueMin = (t) => Math.round(15 - (DM.now() - handAt(t)) / 60000);
  const fmtDue = (m) => (m < 0 ? `<span class="due-over">${-m} min over</span>` : m <= 3 ? `<span class="due-soon">${m} min left</span>` : `<span class="due-ok">${m} min left</span>`);
  const whoCell = (id) => { if (!id || id === 'anuma') return `<span class="who"><span class="un">${I('user')}</span>Unassigned</span>`; const u = user(id); return `<span class="who">${DM.avatar((u && u.name) || id, 'sm')}${esc((u && u.name) || id)}</span>`; };
  const fmtSec = (s) => (s < 60 ? Math.round(s) + ' sec' : Math.floor(s / 60) + 'm ' + String(Math.round(s % 60)).padStart(2, '0') + 's').replace(/ 00s$/, '').replace(/^(\d+)m$/, '$1 min');
  const lines = (d) => (d.lines || []).length;

  // Deterministic past-day figures (the live app reports from real history; the demo generates plausible ones).
  const gen = (day) => {
    const r = rng(day + DM.uc); const ps = (S().parties || []).filter((p) => !/^\+?\d/.test(p.name)); const us = (S().users || []).filter((u) => u.role !== 'Admin' && u.role !== 'Owner');
    const orders = Math.round(2 + r() * 8), ln = Math.round(orders * (1.6 + r() * 1.4)), esc_ = Math.round(r() * 4);
    const pick = (a, k) => a[Math.floor(r() * 1000 * (k + 1)) % Math.max(1, a.length)];
    const late = Array.from({ length: Math.min(3, Math.round(r() * 3)) }, (_, k) => { const p = pick(ps, k) || { name: 'Sharma Furnishing' }; return { caseNo: dm(day).split(' ')[0].padStart(2, '0') + '10' + '26-' + (k + 1), account: p.name, contact: ((S().contacts || []).find((c) => c.partyId === p.id) || {}).name || '', task: r() > 0.5 ? 'Answer question' : 'Confirm product', by: (pick(us, k + 3) || { name: 'Rohan Mehta', id: ME }).id, mins: Math.round(16 + r() * 120) }; });
    const buyers = ps.slice(0, 40).map((p, k) => ({ p, k, v: r() })).sort((a, b) => a.v - b.v).slice(0, Math.min(5, orders)).map((x, k) => ({ name: x.p.name, role: k % 3 === 0 ? 'Sales Person' : '', orders: 1 + Math.floor(r() * 2), lines: 1 + Math.floor(r() * 4), hand: Math.floor(r() * 2) }));
    const codes = ((S().styles || []).map((s) => s.code)).length ? (S().styles || []).map((s) => s.code) : ['PRIVE', 'ABANA', 'KARO', 'ZYRA', 'ORION'];
    const products = Array.from({ length: Math.min(5, ln) }, (_, k) => ({ name: codes[Math.floor(r() * 100 + k * 7) % codes.length], lines: 1 + Math.floor(r() * 3), buyers: 1 + Math.floor(r() * 2), qty: Math.round(5 + r() * 60) + ' m' }));
    return { orders, lines: ln, esc: esc_, late, buyers, products, team: { sec: Math.round(90 + r() * 400), cases: 2 + Math.floor(r() * 6) }, desk: { sec: Math.round(3 + r() * 9), cases: 6 + Math.floor(r() * 12) }, within: { pct: Math.round(86 + r() * 14), of: 10 + Math.floor(r() * 10) } };
  };

  /* ───────── Home (NewHome) ───────── */
  const grid = (cols, rows, o) => DM.table(cols, rows, Object.assign({ footer: false, fill: false, cls: 'nobox' }, o));
  const todayData = (who) => {
    const dr = (S().drafts || []).filter((d) => DM.dayOf(d.createdAt) === DM.TODAY && d.status !== 'rejected' && (who === 'everyone' || mine(d)));
    const th = (S().threads || []).filter((t) => (who === 'everyone' || mine(t)));
    const escToday = th.filter((t) => (t.escalatedAt && DM.dayOf(t.escalatedAt) === DM.TODAY) || (!t.escalatedAt && isWaiting(t) && DM.dayOf(t.lastAt) === DM.TODAY)).length;
    // buyers/products from the day's drafts
    const by = {}; dr.forEach((d) => { const n = (party(d.partyId) || {}).name || d.partyName || 'Unknown'; const b = (by[n] = by[n] || { name: n, role: ((S().contacts || []).find((c) => c.partyId === d.partyId) || {}).role || '', orders: 0, lines: 0, hand: 0 }); b.orders++; b.lines += lines(d); });
    th.filter((t) => isWaiting(t) || t.escalatedAt).forEach((t) => { const n = partyName(t); if (by[n]) by[n].hand++; });
    const pr = {}; dr.forEach((d) => (d.lines || []).forEach((l) => { const key = l.style || (l.name || '').split(' ')[0] || 'Item'; const p = (pr[key] = pr[key] || { name: key, lines: 0, buyers: new Set(), qty: 0, unit: l.unit || 'm' }); p.lines++; p.buyers.add(d.partyId); p.qty += +l.qty || 0; }));
    return { orders: dr.length, lines: dr.reduce((a, d) => a + lines(d), 0), esc: escToday, buyers: Object.values(by), products: Object.values(pr).map((p) => ({ name: p.name, lines: p.lines, buyers: p.buyers.size, qty: p.qty ? p.qty + ' ' + p.unit : '—' })) };
  };
  const repliesToday = () => {
    const fb = (S().home || {}).replies; const th = S().threads || []; const tm = [], dk = [];
    th.forEach((t) => { const ms = t.messages || []; for (let i = 0; i < ms.length - 1; i++) { if (ms[i].from === 'customer' && ms[i + 1].from !== 'customer' && ms[i + 1].from !== 'system') { const a = Date.parse(ms[i].at), b = Date.parse(ms[i + 1].at); if (!isNaN(a) && !isNaN(b) && b >= a && DM.dayOf(ms[i].at) === DM.TODAY) (ms[i + 1].from === 'anuma' ? dk : tm).push((b - a) / 1000); } } });
    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const all = tm.concat(dk);
    if (all.length >= 3) { const within = all.filter((s) => s <= 900).length; return { team: tm.length ? { sec: avg(tm), cases: tm.length } : null, desk: dk.length ? { sec: avg(dk), cases: dk.length } : null, within: { pct: Math.round((within / all.length) * 100), of: all.length, n: within } }; }
    return fb ? { team: fb.team, desk: fb.desk, within: fb.within } : { team: null, desk: null, within: null };
  };
  const homeView = (q) => {
    const day = q.get('day'); const who = HM.who; const yday = addDays(DM.TODAY, -1);
    const isToday = !day || day === DM.TODAY; const mode = isToday ? 'today' : day === yday ? 'yesterday' : 'custom';
    const dd = isToday ? DM.TODAY : day;
    const ctl = `<div class="ctl">${DM.seg([{ key: 'yours', label: 'Yours' }, { key: 'everyone', label: 'Everyone' }], who, 'hm-who')}${DM.seg([{ key: 'today', label: 'Today' }, { key: 'yesterday', label: 'Yesterday' }, { key: 'custom', label: 'Custom' }].map((x) => x.key === 'custom' ? { key: 'custom', label: 'Custom ✎' } : x), mode, 'hm-day')}</div>`;
    const dateLine = isToday ? `${wk(dd)} ${dm(dd)} · <i class="live"></i>Live` : `${wk(dd)} ${dm(dd)} · Daily report`;
    let body = '';
    if (isToday) {
      const t = todayData(who); const y = gen(yday); const frac = (DM.now().getHours() * 60 + DM.now().getMinutes()) / 1440; const yo = Math.round(y.orders * frac * 1.15), yl = Math.round(y.lines * frac * 1.15);
      const cap = (v, p) => (v === p ? 'No change' : v > p ? `+${v - p} vs yesterday` : `−${p - v} vs yesterday`);
      const rep = repliesToday();
      const wait = (S().threads || []).filter((x) => isWaiting(x) && (who === 'everyone' || mine(x))).sort((a, b) => dueMin(a) - dueMin(b));
      const cols = [
        { k: 'caseNo', label: 'Case', w: 120, render: (r) => esc(r.caseNo || r.id), text: (r) => r.caseNo || r.id },
        { label: 'Account', minW: 160, bold: true, render: (r) => esc(partyName(r)), text: partyName },
        { label: 'Contact', render: (r) => esc(contactName(r) || '—'), text: contactName, muted: true },
        { label: 'Task', w: 170, render: (r) => `<span class="badge-task">${esc(taskOf(r))}</span>` },
        ...(who === 'everyone' ? [{ label: 'With', w: 180, render: (r) => whoCell(r.owner) }] : []),
        { label: 'Due', w: 130, num: true, render: (r) => fmtDue(dueMin(r)), text: dueMin },
      ];
      body = `
      <section class="hm-sec"><h2>Today</h2><div class="sub">Orders captured and hand-offs to the team, compared with yesterday at this time.</div>
        <div class="grid g3 stagger">${DM.statCard('Orders', '', cap(t.orders, yo), 'file', { count: t.orders })}${DM.statCard('Line items', '', cap(t.lines, yl), 'package', { count: t.lines })}${DM.statCard('Escalations', '', null, 'trianglealert', { count: t.esc })}</div></section>
      <section class="hm-sec"><h2>Waiting</h2><div class="sub">Customers Order Desk has handed to ${who === 'everyone' ? 'the team' : 'you'}, most overdue first.</div>
        ${wait.length ? grid(cols, wait, { id: 'hm-wait', go: (r) => '/inbox/threads?case=' + r.id, cls: '' }) : `<div class="hm-empty"><span class="icotile lg">${I('inbox')}</span><div class="t">${who === 'everyone' ? 'Nothing waiting' : 'Nothing waiting on you'}</div><div class="s">New hand-offs to the team show up here.</div></div>`}</section>
      <section class="hm-sec"><h2>Replies</h2><div class="sub">How fast customers hear back, from Order Desk and from the team.</div>
        <div class="grid g3 stagger">${DM.statCard('Team reply', rep.team ? fmtSec(rep.team.sec) : '—', rep.team ? `${rep.team.cases} case${rep.team.cases === 1 ? '' : 's'}` : 'No team replies measured', 'clock')}${DM.statCard('Order Desk reply', rep.desk ? fmtSec(rep.desk.sec) : '—', rep.desk ? `${rep.desk.cases} case${rep.desk.cases === 1 ? '' : 's'}` : 'No Order Desk replies measured', 'sparkle')}${DM.statCard('Within 15 min', rep.within ? rep.within.pct + '%' : '—', rep.within ? `${rep.within.n} of ${rep.within.of} answered` : 'No answered cases', 'checkcheck')}</div></section>
      ${buyers(who === 'everyone' ? 'Buyers' : 'Your buyers', who === 'everyone' ? 'What every account ordered.' : 'What the accounts you look after ordered.', t, who)}`;
    } else {
      const d = gen(dd), p = gen(addDays(dd, -1)); const delta = (v, pv, bad) => { const df = v - pv; const up = df > 0; const good = bad ? !up : up; return df === 0 ? null : { dir: up ? 'up' : 'down', text: Math.abs(df), tone: good ? 'green' : 'red' }; };
      const lateCols = [{ k: 'caseNo', label: 'Case', w: 120 }, { label: 'Account', bold: true, minW: 160, render: (r) => esc(r.account) }, { label: 'Contact', muted: true, render: (r) => esc(r.contact || '—') }, { label: 'Task', w: 170, render: (r) => `<span class="badge-task">${esc(r.task)}</span>` }, { label: 'Answered by', w: 190, render: (r) => whoCell(r.by) }, { label: 'Took', w: 120, num: true, render: (r) => `<span class="due-over">${r.mins} min</span>`, text: (r) => r.mins }];
      body = `
      <section class="hm-sec"><h2>${new Date(dd + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</h2><div class="sub">Orders captured and hand-offs to the team, compared with the day before.</div>
        <div class="grid g3 stagger">${DM.statCard('Orders', '', '', 'file', { count: d.orders, delta: delta(d.orders, p.orders) })}${DM.statCard('Line items', '', '', 'package', { count: d.lines, delta: delta(d.lines, p.lines) })}${DM.statCard('Escalations', '', '', 'trianglealert', { count: d.esc, delta: delta(d.esc, p.esc, true) })}</div></section>
      <section class="hm-sec"><h2>Late hand-offs</h2><div class="sub">Hand-offs that took longer than 15 minutes to answer.</div>
        ${d.late.length ? grid(lateCols, d.late, { id: 'hm-late', cls: '' }) : `<div class="hm-empty"><span class="icotile lg">${I('checkcheck')}</span><div class="t">No late hand-offs</div><div class="s">Every hand-off that day was answered within 15 minutes.</div></div>`}</section>
      <section class="hm-sec"><h2>Replies</h2><div class="sub">How fast customers hear back, from Order Desk and from the team.</div>
        <div class="grid g3 stagger">${DM.statCard('Team reply', fmtSec(d.team.sec), `${d.team.cases} cases`, 'clock')}${DM.statCard('Order Desk reply', fmtSec(d.desk.sec), `${d.desk.cases} cases`, 'sparkle')}${DM.statCard('Within 15 min', d.within.pct + '%', `${Math.round((d.within.pct / 100) * d.within.of)} of ${d.within.of} answered`, 'checkcheck')}</div></section>
      ${buyers(who === 'everyone' ? 'Buyers' : 'Your buyers', who === 'everyone' ? 'What every account ordered.' : 'What the accounts you look after ordered.', d, who)}`;
    }
    return `<div class="page hm"><div class="hm-head"><div><h1>Home</h1><div class="dl">${dateLine}</div></div>${ctl}</div>${body}</div>`;
  };
  const buyers = (h, sub, t, who) => `<section class="hm-sec"><h2>${h}</h2><div class="sub">${sub}</div><div class="hm-two">
    <div class="hm-card"><div class="ct">Buyers</div>${t.buyers.length ? grid([{ label: 'Buyer', bold: true, minW: 160, render: (r) => esc(r.name) + (r.role ? `<span class="chip-role">${esc(r.role)}</span>` : ''), text: (r) => r.name }, { k: 'orders', label: 'Orders', w: 80, num: true }, { k: 'lines', label: 'Lines', w: 80, num: true }, { k: 'hand', label: 'Hand-offs', w: 100, num: true }], t.buyers, { id: 'hm-buyers' }) : `<div class="hm-empty" style="border:0"><span class="icotile lg">${I('inbox')}</span><div class="t">No orders this day</div><div class="s">Buyers show up here as orders come in.</div></div>`}</div>
    <div class="hm-card"><div class="ct">${who === 'everyone' ? 'Products bought' : 'Products they bought'}</div>${t.products.length ? grid([{ label: 'Product', bold: true, minW: 140, render: (r) => esc(r.name), text: (r) => r.name }, { k: 'lines', label: 'Lines', w: 70, num: true }, { k: 'buyers', label: 'Buyers', w: 80, num: true }, { label: 'Quantity', w: 100, num: true, render: (r) => esc(r.qty), text: (r) => parseFloat(r.qty) || 0 }], t.products, { id: 'hm-products' }) : `<div class="hm-empty" style="border:0"><span class="icotile lg">${I('package')}</span><div class="t">No products this day</div><div class="s">Products show up here as orders come in.</div></div>`}</div></div></section>`;
  DM.act('hm-who', (el) => { HM.who = el.dataset.arg; DM.render(); });
  DM.act('hm-day', (el) => {
    const k = el.dataset.arg; if (k === 'today') return DM.go('/dashboard'); if (k === 'yesterday') return DM.go('/dashboard?day=' + addDays(DM.TODAY, -1));
    const cur = DM.query().get('day') || DM.TODAY; DM.calendar(el, { value: cur, max: DM.TODAY, onPick: (d) => DM.go(d === DM.TODAY ? '/dashboard' : '/dashboard?day=' + d) });
  });

  /* ───────── Dashboard (Stuffcool, Access) ───────── */
  const PERIODS = [['all', 'All time'], ['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days']];
  const inPeriod = (iso, p) => { if (p === 'all') return true; const days = { today: 0, '7d': 7, '30d': 30, '90d': 90 }[p]; const d = new Date(iso); return DM.now() - d <= (days + 1) * 86400000 && (p !== 'today' || DM.dayOf(iso) === DM.TODAY); };
  const evIcon = (l) => { const t = (l.event || '') + ' ' + (l.title || ''); if (/confirmed|accepted|approved|won/i.test(t)) return ['circlecheck', 'green']; if (/failed|errored|bounced/i.test(t)) return ['trianglealert', 'red']; if (/blocked|rejected|cancel|lost|expired|regret/i.test(t)) return ['ban', '']; if (/sent|delivered|published|synced|posted/i.test(t)) return ['send', '']; if (/drafted/i.test(t)) return ['fileedit', '']; if (/refresh|revised/i.test(t)) return ['refresh', '']; if (/scheduled/i.test(t)) return ['clock', '']; if (/received|replied|opened/i.test(t)) return ['chat', '']; if (/^Created|created/i.test(l.title || '')) return ['fileplus', '']; return ['pencil', '']; };
  const chipOf = (l) => { if (l.chip) return l.chip; const t = (l.event || '') + ' ' + (l.title || ''); if (/confirmed|accepted|approved/i.test(t)) return 'confirmed'; if (/failed|errored/i.test(t)) return 'failed'; if (/blocked|rejected/i.test(t)) return 'blocked'; if (/sent|synced|posted/i.test(t)) return 'sent'; if (/^Created/i.test(l.title || '')) return 'auto-drafted'; return 'logged'; };
  const chipTone = (c) => ({ confirmed: 'green', failed: 'red', blocked: 'amber', sent: 'blue' }[c] || '');
  const tfmt = (iso) => { const d = new Date(iso); if (isNaN(d)) return esc(iso || ''); const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }); const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).replace(' ', '').toLowerCase(); return `${day} · ${t}`; };
  const dashView = (q) => {
    const per = q.get('time') || 'all'; const label = (PERIODS.find((p) => p[0] === per) || PERIODS[0])[1];
    const drafts = (S().drafts || []).filter((d) => inPeriod(d.createdAt, per)); const pend = drafts.filter((d) => d.status === 'pending'); const old = pend.filter((d) => DM.now() - new Date(d.createdAt) > 4 * 3600000).length;
    const logs = (S().logs || []).slice().sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 6);
    const rows = logs.map((l) => { const [ic, tone] = evIcon(l); const c = chipOf(l); return `<div class="tl-row" data-rid="${esc(l.id)}"><span class="tl-n ${tone}">${I(ic)}</span><div class="grow" style="min-width:0"><div class="tl-t">${esc(l.title || l.action || '')}</div><div class="tl-m">${esc(l.actor || 'System')} · ${tfmt(l.at)}${l.href ? ` · <a href="#${l.href}" style="text-decoration:underline">${esc(l.hrefLabel || 'Open')}</a>` : ''}</div></div><span class="tl-pill ${chipTone(c)}">${esc(c)}</span></div>`; }).join('');
    return `<div class="page narrow"><div class="ph"><div><h1>Dashboard</h1><p>Track opportunities, response time, and pipeline value in one place.</p></div></div>
      <button class="btn outline dash-sel" data-act="dash-period" data-keepmenu>${I('calendar')}<span class="v">${label}</span>${I('chevD')}</button>
      ${DM.uc === 'stuffcool' ? `<div class="dscard"><div class="t">Drafts pending</div><div class="n"><span data-count="${pend.length}" data-ck="dp">${pend.length}</span></div><div class="c">${old} older than 4 hours</div></div>` : ''}
      <div class="tlc"><div class="th">${I('history')}<b>Deal timeline</b><a href="#/settings/logs">Full log</a></div><div class="tsub">Opportunities, quotes, orders and governance — what Anuma did and what your team did.</div><div class="tl stagger">${rows || DM.empty('history', 'No activity yet', 'Events from Anuma and your team show up here.', { style: 'border:0' })}</div></div></div>`;
  };
  DM.act('dash-period', (el) => { const cur = DM.query().get('time') || 'all'; DM.menu(el, PERIODS.map(([k, l]) => ({ label: l, check: k === cur, run: () => DM.go(k === 'all' ? '/dashboard' : '/dashboard?time=' + k) })), { w: 200, match: true }); });

  DM.page('/dashboard', { title: 'Home', render: ({ q }) => (DM.uc === 'newhome' ? homeView(q) : dashView(q)) });

  /* ───────── Notifications page ───────── */
  const NF = (DM.ui.notif = DM.ui.notif || { tab: 'all', type: 'all' });
  const TYPE_ITEMS = [['all', 'All types'], ['handoff', 'Hand-offs'], ['assigned', 'Assigned chats'], ['review', 'Reviews'], ['changes', 'Updates']];
  DM.page('/notifications', { title: 'Notifications', render: () => {
    const all = DM.notif.all(); const unread = all.filter((n) => n.unread).length;
    let rows = all.filter((n) => (NF.tab === 'all' || (NF.tab === 'unread' ? n.unread : !n.unread)) && (NF.type === 'all' || DM.notif.typeOf(n) === NF.type || (NF.type === 'changes' && DM.notif.typeOf(n) === 'escalated')));
    const tl = (TYPE_ITEMS.find((t) => t[0] === NF.type) || TYPE_ITEMS[0])[1];
    return `<div class="page n712"><div class="ph"><div><h1>Notifications</h1></div><div class="acts"><button class="btn outline" data-act="nf-readall">Mark all read</button></div></div>
      <div class="nf-bar">${DM.seg([{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread', count: unread }, { key: 'read', label: 'Read' }], NF.tab, 'nf-tab')}<button class="btn outline" data-act="nf-type" data-keepmenu>${esc(tl)} ${I('chevD')}</button></div>
      ${rows.length ? `<div class="nlist stagger">${rows.map((n) => DM.notif.row(n)).join('')}</div>` : DM.empty('bell', 'No notifications', NF.tab === 'unread' ? "You're all caught up." : 'Nothing matches these filters.')}</div>`;
  } });
  DM.act('nf-tab', (el) => { NF.tab = el.dataset.arg; DM.render(); });
  DM.act('nf-type', (el) => DM.menu(el, TYPE_ITEMS.map(([k, l]) => ({ label: l, check: NF.type === k, run: () => { NF.type = k; DM.render(); } })), { w: 176 }));
  DM.act('nf-readall', () => { (S().notifications || []).forEach((n) => (n.unread = false)); DM.toast('All notifications marked as read'); DM.render(); });
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('.nlist .nrow'); if (a) { const n = (S().notifications || []).find((x) => String(x.id) === a.dataset.nid); if (n) n.unread = false; } });
})();
