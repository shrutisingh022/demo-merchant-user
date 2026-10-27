/* pages/dashboard.js — Dashboard, Notifications, Ask, Getting started, Insights, Reports, Production, Packaging */
(function () {
  const I = DM.icon, esc = DM.esc, F = DM.fmt;
  const S = () => DM.S;
  const arr = (k) => S()[k] || [];
  const party = (id) => DM.by(arr('parties'), id) || { name: id || '—' };
  const user = (id) => (id === 'anuma' ? { name: 'Anuma' } : DM.by(arr('users'), id) || { name: id || '—' });
  const sum = (a, f) => a.reduce((t, x) => t + (+f(x) || 0), 0);
  const TODAY = new Date('2026-10-27T12:00:00+05:30');
  const ui = (DM.ui.dash = DM.ui.dash || { range: '30d' });

  const st = document.createElement('style');
  st.dataset.for = 'dashboard';
  st.textContent = `
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
  .askbar{display:flex;gap:8px;align-items:center;border:1px solid var(--border);border-radius:12px;padding:6px 6px 6px 14px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)}
  .askbar input{flex:1;border:0;outline:0;font-size:13px;height:32px;background:transparent}
  .chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:999px;padding:4px 11px;font-size:12px;background:#fff;color:#404040;transition:background .14s,transform .1s}.chip:active{transform:scale(.97)}
  .chip:hover{background:var(--muted)}
  .tl{position:relative;padding-left:18px}.tl::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:1px;background:var(--border)}
  .tl .it{position:relative;padding:6px 0;font-size:12px}.tl .it::before{content:"";position:absolute;left:-17px;top:11px;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--chart-2)}
  .alert{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;border:1px solid var(--border);cursor:pointer;font-size:12px;transition:background .14s,transform .14s}.alert:hover{transform:translateY(-1px)}.alert:hover{background:var(--hover-cream)}
  .alert.amber{background:var(--warning-tint);border-color:#f6e7a7}.alert.red{background:var(--destructive-tint);border-color:#fccfc8}.alert.blue{background:var(--info-tint);border-color:var(--info-border)}.alert.green{background:var(--success-tint);border-color:#cdeebd}
  .askwrap{display:flex;flex-direction:column;height:100%;min-height:0}.askmsgs{flex:1;overflow:auto;padding:24px 0}
  .askcol{max-width:760px;margin:0 auto;padding:0 20px;width:100%}
  .amsg{display:flex;gap:12px;margin-bottom:18px}.amsg-new{animation:anuma-rise .32s cubic-bezier(.22,.8,.24,1) both}.amsg.u{justify-content:flex-end}.amsg.u .bubble{background:var(--muted);border-radius:14px;padding:8px 13px;max-width:80%}
  .amsg .av{width:26px;height:26px;display:grid;place-items:center;flex:none}
  .dots i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a3a3a3;margin-right:3px;animation:bl 1s infinite}.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
  @keyframes bl{0%,80%,100%{opacity:.25}40%{opacity:1}}
  .gsnav{display:flex;flex-direction:column;gap:2px}.gsstep{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:9px;font-size:12px;transition:background .14s}.gsstep.on{background:var(--muted);font-weight:500}.gsstep:hover{background:var(--muted)}
  .gsstep .n{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border);display:grid;place-items:center;font-size:11px;background:#fff}.gsstep.done .n{background:#171717;color:#fff;border-color:#171717}
  .rcard{display:flex;gap:12px;padding:14px;cursor:pointer;align-items:flex-start;transition:border-color .14s}.rcard:hover{border-color:#bdbdbd}.rcard.on{border-color:#171717;box-shadow:0 0 0 1px #171717 inset}
  .ico{width:34px;height:34px;border-radius:9px;background:var(--muted);display:grid;place-items:center;flex:none}
  .stagebar{display:flex;gap:3px}.stagebar i{height:6px;flex:1;border-radius:3px;background:var(--muted)}.stagebar i.on{background:var(--chart-2)}`;
  st.textContent += `
  .livedot{display:inline-flex;align-items:center;gap:5px}.livedot i{width:6px;height:6px;border-radius:50%;background:var(--success)}
  .wrow{align-items:center}.wrow:last-child{border-bottom:0}
  .slapill{display:inline-flex;gap:4px;align-items:center;color:#b45309;background:#fffbeb;border-radius:999px;padding:0 8px;height:20px;font-size:11.5px;font-family:ui-monospace,Menlo,monospace}.slapill svg.i{width:12px;height:12px}
  .cardgrid .card-h{border-bottom:1px solid var(--border)}.cardgrid .dmgrid .ag-root-wrapper,.card>.dmgrid .ag-root-wrapper{border:0;border-radius:0}.cardgrid .dmgrid,.card>.dmgrid{border-radius:0 0 14px 14px}
  .hempty{display:flex;flex-direction:column;align-items:center;padding:34px 16px;gap:4px;text-align:center}
  .nrow{display:flex;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;align-items:flex-start}.nrow:last-child{border-bottom:0}.nrow:hover{background:var(--hover-cream)}`;
  st.textContent += `
  .wrow.row-new{animation:anuma-rise .35s cubic-bezier(.22,.8,.24,1) both,row-flash 1.8s ease both}
  .nrow.row-new{animation:anuma-rise .35s cubic-bezier(.22,.8,.24,1) both,row-flash 1.8s ease both}
  .nrow,.wrow{transition:background-color .14s}
  @keyframes dm-spin{to{transform:rotate(360deg)}}.spin{animation:dm-spin .8s linear infinite}
  .pop{animation:badge-pop .35s ease both}
  .skel-ov{position:absolute;inset:0;background:#fff;z-index:6;overflow:hidden;border-radius:10px;transition:opacity .25s}.skel-ov.out{opacity:0}
  .skel-ov .sr{height:40px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:20px;padding:0 12px}.skel-ov .sr.h{background:#fafafa}
  .skel-ov .sr i{display:block;height:9px;border-radius:5px}
  .hover-card{transition:transform .15s,box-shadow .15s}.hover-card:hover{transform:translateY(-1px);box-shadow:0 0 0 1px rgba(10,10,10,.14),0 6px 16px rgba(0,0,0,.06)}
  .rcard:hover{transform:translateY(-1px)}`;
  document.head.appendChild(st);

  /* ───────── shared motion helpers (also used by orders / rfqs / fulfilment) ───────── */
  const FMT = { inr: F.inr, inrc: F.inrc, pct: (x) => Math.round(x) + '%', num: (x) => F.num(Math.round(x)) };
  // number that counts up to n (core animates [data-count])
  DM.cnt = DM.cnt || ((n, f = 'num', ck) => { const v = +n || 0; return `<span data-count="${v}" data-fmt="${f}"${ck ? ` data-ck="${ck}"` : ''}>${(FMT[f] || FMT.num)(v)}</span>`; });
  // which ids are new / changed since this surface last rendered (first visit flashes nothing)
  DM.ui.rowsSeen = DM.ui.rowsSeen || {};
  DM.changedRows = DM.changedRows || ((key, rows, sig = (r) => '', idk = 'id') => { const k = key + '|' + DM.uc; const prev = DM.ui.rowsSeen[k]; const cur = {}; const out = new Set(); rows.forEach((r) => { const id = r[idk]; cur[id] = sig(r); if (prev && prev[id] !== cur[id]) out.add(id); }); DM.ui.rowsSeen[k] = cur; return out; });
  // case numbers DDMMYY-n (same scheme the Inbox uses) so every page shows the same tag
  const msx = (x) => { const v = typeof x === 'number' ? x : Date.parse(x); return isNaN(v) ? null : v; };
  const firstAtX = (t) => { const m = (t.messages || []).find((x) => msx(x.at) != null); return m ? m.at : t.lastAt; };
  let tagM = { k: '', m: {} };
  DM.caseNo = DM.caseNo || ((t) => {
    if (!t) return ''; const th = DM.S.threads || []; const key = th.map((x) => x.id + (firstAtX(x) || '')).join('|');
    if (tagM.k !== key) { const L = th.map((x) => ({ x, at: msx(firstAtX(x)) ?? 0 })).sort((a, b) => a.at - b.at); const cnt = {}, out = {}; L.forEach(({ x, at }) => { const dk = new Date(at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); cnt[dk] = (cnt[dk] || 0) + 1; const [y, mo, d] = dk.split('-'); out[x.id] = d + mo + y.slice(2) + '-' + cnt[dk]; }); tagM = { k: key, m: out }; }
    return tagM.m[t.id] || String(t.caseNo || t.id);
  });
  // 400ms shimmer skeleton over every AG Grid the first time a route is opened
  const skelDone = new Set();
  DM.afterHooks.push((root) => {
    const key = DM.path() + '|' + DM.uc; const grids = root.querySelectorAll('.dmgrid'); if (!grids.length || skelDone.has(key)) return; skelDone.add(key);
    const w = [90, 160, 70, 120, 80, 100, 140, 60];
    grids.forEach((el) => {
      el.style.position = 'relative'; const ov = document.createElement('div'); ov.className = 'skel-ov';
      const row = (h) => `<div class="sr ${h ? 'h' : ''}">${[0, 1, 2, 3, 4].map((c) => `<i class="shimmer" style="width:${w[(c * 3 + (h ? 0 : 1) + Math.floor(Math.random() * 3)) % w.length]}px"></i>`).join('')}</div>`;
      ov.innerHTML = row(true) + Array.from({ length: Math.min(10, Math.ceil(el.clientHeight / 40)) }, () => row(false)).join('');
      el.appendChild(ov); setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 260); }, 420);
    });
  });

  /* ───────── derived data ───────── */
  const activeOrders = () => arr('orders').filter((o) => o.status !== 'cancelled');
  function live() {
    const o = activeOrders(), rf = arr('rfqs'), dr = arr('drafts'), th = arr('threads'), q = arr('quotes');
    const erp = arr('erpLog');
    return {
      orders: o.length, orderValue: sum(o, (x) => x.total),
      openRfq: rf.filter((r) => ['new', 'review'].includes(r.status)).length,
      rfqValue: sum(rf.filter((r) => ['new', 'review'].includes(r.status)), (r) => r.total),
      drafts: dr.filter((d) => d.status === 'pending').length,
      unread: th.filter((t) => t.unread).length, threads: th.filter((t) => t.status !== 'closed').length,
      quotesPending: q.filter((x) => x.status === 'pending_approval').length, quoted: sum(q.filter((x) => ['sent', 'accepted', 'pending_approval'].includes(x.status)), (x) => x.total),
      synced: erp.filter((e) => e.state === 'synced').length, failed: erp.filter((e) => e.state === 'failed').length, erpPending: erp.filter((e) => e.state === 'pending').length,
      erpName: (arr('apps').find((a) => ['tally', 'coralio'].includes(a.slug)) || {}).name || '',
    };
  }
  const monthLabel = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  function revenueSeries() {
    const d = S().dash || {};
    if (d.revenue && d.revenue.length) {
      // overlay live orders placed in latest bucket so the chart moves with the scenario
      const base = d.revenue.map((x) => ({ l: x.l, v: x.v }));
      const seedIds = new Set((DM.seed[DM.uc].orders || []).map((o) => o.id));
      const extra = sum(arr('orders').filter((o) => !seedIds.has(o.id) && o.status !== 'cancelled'), (o) => o.total);
      base[base.length - 1].v += extra;
      return base;
    }
    const m = {};
    arr('orders').forEach((o) => { const k = monthLabel(o.placedAt); m[k] = (m[k] || 0) + o.total; });
    return Object.entries(m).slice(-8).map(([l, v]) => ({ l, v }));
  }
  function funnelSeries() {
    const d = S().dash || {};
    const stages = ['New', 'Qualified', 'Quoted', 'Negotiation', 'Won'];
    const live = stages.map((s) => ({ l: s, v: arr('leads').filter((x) => x.stage === s).length }));
    if (live.some((x) => x.v)) return live;
    return d.funnel || live;
  }
  function topParties() {
    const d = S().dash || {};
    const m = {};
    arr('orders').filter((o) => o.status !== 'cancelled').forEach((o) => { const n = party(o.partyId).name; m[n] = (m[n] || 0) + o.total; });
    const l = Object.entries(m).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v).slice(0, 6);
    return l.length ? l : d.topParties || [];
  }
  function attention() {
    const L = live(), out = [];
    if (L.failed) out.push({ tone: 'red', text: `${L.failed} order${L.failed > 1 ? 's' : ''} failed to sync to ${L.erpName || 'ERP'}`, href: '/orders' });
    if (L.drafts) out.push({ tone: 'amber', text: `${L.drafts} draft order${L.drafts > 1 ? 's' : ''} waiting for your review`, href: '/orders/drafts' });
    if (L.openRfq) out.push({ tone: 'blue', text: `${L.openRfq} RFQ${L.openRfq > 1 ? 's' : ''} open (${F.inrc(L.rfqValue)})`, href: '/orders/rfqs' });
    if (L.quotesPending) out.push({ tone: 'amber', text: `${L.quotesPending} quote${L.quotesPending > 1 ? 's' : ''} need approval`, href: '/quotes/approvals' });
    if (L.unread) out.push({ tone: 'blue', text: `${L.unread} unread conversation${L.unread > 1 ? 's' : ''} in Inbox`, href: '/inbox/threads' });
    ((S().dash || {}).alerts || []).forEach((a) => out.push({ tone: a.tone || 'blue', text: a.text, href: a.href || '/dashboard' }));
    return out.slice(0, 7);
  }
  function activity() {
    const fromLogs = arr('logs').slice(0, 6).map((l) => ({ at: l.at, text: `${l.action}${l.target ? ' — ' + l.target : ''}`, href: '/settings/logs' }));
    const base = ((S().dash || {}).activity || []).concat(fromLogs);
    const fromNotes = arr('notifications').filter((n) => n.step != null).map((n) => ({ at: n.at, text: n.subject, href: n.href || '/notifications' }));
    return fromNotes.concat(base).slice(0, 9);
  }

  /* ───────── Home (live NuHome design) ───────── */
  const NOW = new Date('2026-10-27T17:30:00+05:30');
  const DAY = 864e5, IST = 330 * 60000;
  const dayStart = (d) => Math.floor((new Date(d).getTime() + IST) / DAY) * DAY - IST;
  const hm = ui.home = ui.home || { who: 'all', range: 'today', from: '2026-10-20', to: '2026-10-27' };
  const ts = (v) => { if (v == null) return NaN; if (typeof v === 'number') return v; if (/^\d{1,2}:\d{2}$/.test(String(v))) { const [h, m] = String(v).split(':').map(Number); return dayStart(NOW) + (h * 60 + m) * 60000; } return Date.parse(v); };
  function win() {
    const t0 = dayStart(NOW);
    if (hm.range === 'today') return { s: t0, e: t0 + DAY, ps: t0 - DAY, pe: NOW.getTime() - DAY, label: 'yesterday at this time' };
    if (hm.range === 'yesterday') return { s: t0 - DAY, e: t0, ps: t0 - 2 * DAY, pe: t0 - DAY, label: 'the day before' };
    const s = dayStart(hm.from), e = dayStart(hm.to) + DAY; return { s, e, ps: s - (e - s), pe: s, label: 'the previous period' };
  }
  const me = () => { const u = arr('users').find((x) => /owner|admin/i.test(x.role)) || arr('users')[0]; return u ? u.id : null; };
  const mineParty = (pid) => hm.who === 'all' || (party(pid) || {}).owner === me();
  const mineThread = (t) => hm.who === 'all' || t.owner === me() || (party(t.partyId) || {}).owner === me();
  const caseNo = (t) => DM.caseNo(t);
  const captured = () => arr('orders').filter((o) => o.status !== 'cancelled').map((o) => ({ at: ts(o.placedAt), o, partyId: o.partyId })).concat(arr('drafts').filter((d) => !['posted', 'rejected'].includes(d.status)).map((d) => ({ at: ts(d.createdAt), o: d, partyId: d.partyId }))).filter((x) => mineParty(x.partyId));
  const inWin = (t, a, b) => t >= a && t < b;
  const fmtDur = (sec) => (sec < 90 ? Math.round(sec) + 's' : sec < 5400 ? Math.floor(sec / 60) + 'm ' + String(Math.round(sec % 60)).padStart(2, '0') + 's' : (sec / 3600).toFixed(1) + 'h');
  function homeStats() {
    const w = win(), cap = captured();
    const cur = cap.filter((x) => inWin(x.at, w.s, w.e)), prv = cap.filter((x) => inWin(x.at, w.ps, w.pe));
    const lines = (a) => a.reduce((n, x) => n + ((x.o.lines || []).length || 1), 0);
    const esc_ = (a, b) => arr('threads').filter((t) => mineThread(t) && t.owner && t.owner !== 'anuma' && inWin(ts(t.lastAt), a, b)).length;
    // replies: walk every thread's messages; a reply = first non-customer message after a customer message
    const team = [], desk = [];
    arr('threads').filter(mineThread).forEach((t) => { let wait = null; (t.messages || []).forEach((m) => { const at = ts(m.at); if (m.from === 'customer') { if (wait == null) wait = at; } else if (m.from !== 'system' && wait != null) { const d = (at - wait) / 1000; if (d >= 0 && d < 86400 && inWin(wait, w.s, w.e)) (m.from === 'anuma' ? desk : team).push(d); wait = null; } }); });
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    const all = team.concat(desk);
    return { cur, prv, w, orders: [cur.length, prv.length], lines: [lines(cur), lines(prv)], esc: [esc_(w.s, w.e), esc_(w.ps, w.pe)], team: avg(team), desk: avg(desk), within: all.length ? (all.filter((d) => d <= 900).length / all.length) * 100 : null, nTeam: team.length, nDesk: desk.length, nAll: all.length };
  }
  const delta = (pair, w, unit = '') => { const d = pair[0] - pair[1]; return d === 0 ? 'No change' : `<span class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}${unit} ${d > 0 ? 'more' : 'fewer'}</span> than ${w.label}`; };
  const stat = (l, v, sub, o = {}) => DM.statCard(l, v, sub, o.icon, o);
  const rangeLabel = () => (hm.range === 'custom' ? `${F.date(hm.from)} – ${F.date(hm.to)}` : hm.range === 'yesterday' ? 'Yesterday' : 'Today');
  function waitingList() {
    const hand = arr('threads').filter((t) => mineThread(t) && t.owner && t.owner !== 'anuma' && t.status !== 'closed').sort((a, b) => ts(a.lastAt) - ts(b.lastAt));
    if (!hand.length) return DM.empty('inbox', 'Nothing waiting on you', 'New hand-offs to the team show up here.');
    return `<div class="card">${hand.slice(0, 6).map((t) => { const p = party(t.partyId), u = user(t.owner), mins = Math.max(0, Math.round((NOW.getTime() - ts(t.lastAt)) / 60000) - 15), over = mins > 0, dur = mins >= 1440 ? Math.floor(mins / 1440) + 'd' : mins >= 60 ? Math.floor(mins / 60) + 'h ' + String(mins % 60).padStart(2, '0') + 'm' : mins + 'm'; return `<div class="listrow wrow" data-rid="${esc(t.id)}" data-go="/inbox/threads?case=${esc(t.id)}">${DM.mono(caseNo(t))}<div class="grow" style="min-width:0"><div class="b trunc">${esc(p.name)}</div><div class="xs muted trunc">${esc(t.preview || t.subject || '')}</div></div>${over ? `<span class="slapill">${I('clock')} ${dur} over</span>` : `<span class="xs muted">within SLA</span>`}<span style="display:inline-flex;align-items:center;gap:6px" title="${esc(u.name)}">${DM.avatar(u.name, 'sm')}<span class="xs muted">${esc(String(u.name).split(' ')[0])}</span></span></div>`; }).join('')}</div>`;
  }
  function buyersCards(st) {
    const by = {}, pr = {};
    st.cur.forEach((x) => { const n = party(x.partyId).name; (by[n] = by[n] || { name: n, orders: 0, value: 0 }); by[n].orders++; by[n].value += +x.o.total || 0; (x.o.lines || []).forEach((l) => { (pr[l.name] = pr[l.name] || { name: l.name, qty: 0, orders: 0, unit: l.unit }); pr[l.name].qty += +l.qty || 0; pr[l.name].orders++; }); });
    const B = Object.values(by).sort((a, b) => b.value - a.value), P = Object.values(pr).sort((a, b) => b.qty - a.qty);
    const wrap = (title, body) => `<div class="card cardgrid"><div class="card-h"><b>${title}</b></div>${body}</div>`;
    return `<div class="grid g2">${wrap('Buyers', B.length ? DM.table([{ label: 'Party', render: (r) => `<span class="row" style="gap:8px">${DM.avatar(r.name, 'sm', { org: true })}<b class="trunc">${esc(r.name)}</b></span>` }, { label: 'Orders', num: true, w: '100px', render: (r) => r.orders }, { label: 'Value', num: true, w: '120px', render: (r) => F.inr(r.value) }], B.slice(0, 8), { noPager: true }) : `<div class="hempty">${DM.icoTile('inbox', 'lg')}<div class="b">No orders this ${hm.range === 'custom' ? 'period' : 'day'}</div><div class="muted sm">Buyers show up here as orders come in.</div></div>`)}${wrap('Products they bought', P.length ? DM.table([{ label: 'Product', render: (r) => esc(r.name) }, { label: 'Qty', num: true, w: '110px', render: (r) => F.num(r.qty) + (r.unit ? ' ' + esc(r.unit) : '') }, { label: 'Orders', num: true, w: '100px', render: (r) => r.orders }], P.slice(0, 8), { noPager: true }) : `<div class="hempty">${DM.icoTile('package', 'lg')}<div class="b">No products this ${hm.range === 'custom' ? 'period' : 'day'}</div><div class="muted sm">Products show up here as orders come in.</div></div>`)}</div>`;
  }
  DM.page('/dashboard', {
    title: 'Home',
    crumb: 'Home',
    render() {
      const st = homeStats(), w = st.w;
      const none = (l) => `<span class="muted">${l}</span>`;
      return `<div class="page stagger">
        <div class="ph"><div><h1>Home</h1><p>${new Date(NOW).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })} · <span class="livedot"><i></i>Live</span></p></div>
          <div class="acts">${DM.seg([{ key: 'mine', label: 'Yours' }, { key: 'all', label: 'Everyone' }], hm.who, 'home-who')}${DM.seg([{ key: 'today', label: 'Today' }, { key: 'yesterday', label: 'Yesterday' }, { key: 'custom', label: hm.range === 'custom' ? rangeLabel() + ' ✎' : 'Custom ✎' }], hm.range, 'home-range')}</div></div>
        <div class="sect">${hm.range === 'custom' ? 'Selected period' : rangeLabel()}</div><div class="sub">Orders captured and hand-offs to the team, compared with ${w.label}.</div>
        <div class="grid g3 stagger">${stat('Orders', DM.cnt(st.orders[0]), delta(st.orders, w), { icon: 'clipboard' })}${stat('Line items', DM.cnt(st.lines[0]), delta(st.lines, w), { icon: 'package' })}${stat('Escalations', DM.cnt(st.esc[0]), st.esc[0] || st.esc[1] ? delta(st.esc, w) : '', { icon: 'alert' })}</div>
        <div class="sect">Waiting</div><div class="sub">Customers Order Desk has handed to you, most overdue first.</div>${waitingList()}
        <div class="sect">Replies</div><div class="sub">How fast customers hear back, from Order Desk and from the team.</div>
        <div class="grid g3 stagger">${stat('Team reply', st.team == null ? '—' : fmtDur(st.team), st.team == null ? 'No team replies measured' : `Average over ${st.nTeam} repl${st.nTeam > 1 ? 'ies' : 'y'}`, { icon: 'clock' })}${stat('Order Desk reply', st.desk == null ? '—' : fmtDur(st.desk), st.desk == null ? 'No Order Desk replies measured' : `Average over ${st.nDesk} repl${st.nDesk > 1 ? 'ies' : 'y'}`, { icon: 'sparkle' })}${stat('Within 15 min', st.within == null ? '—' : DM.cnt(st.within, 'pct'), st.within == null ? 'No answered cases' : `Of ${st.nAll} answered messages`, { icon: 'check' })}</div>
        <div class="sect">Your buyers</div><div class="sub">What the accounts you look after ordered.</div>${buyersCards(st)}
      </div>`;
    },
  });
  DM.act('home-who', (el) => { hm.who = el.dataset.arg; DM.render(); });
  DM.act('home-range', (el) => {
    const k = el.dataset.arg;
    if (k !== 'custom') { hm.range = k; DM.render(); return; }
    DM.modal({ title: 'Custom period', body: `<div class="grid g2">${DM.field('From', 'from', { type: 'date', value: hm.from })}${DM.field('To', 'to', { type: 'date', value: hm.to })}</div><p class="sm muted" style="margin-top:10px">Compared with the period of the same length just before it.</p>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Apply', run: (m) => { const f = DM.formData(m); if (!f.from || !f.to || f.to < f.from) { DM.toast('Pick a valid range', 'alert'); return false; } hm.from = f.from; hm.to = f.to; hm.range = 'custom'; DM.render(); } }] });
  });
  const goAsk = (q) => { if (q && q.trim()) DM.go('/ask?q=' + encodeURIComponent(q.trim())); };

  /* CSV helper */
  function downloadCSV(name, rows) {
    const csv = rows.map((r) => r.map((c) => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    DM.toast('Downloaded ' + name, 'download');
  }
  DM.downloadCSV = DM.downloadCSV || downloadCSV;

  /* ───────── Notifications ───────── */
  const nui = (DM.ui.notif = DM.ui.notif || { tab: 'human' });
  const nIcon = (n) => (/hand-?off|escalat/i.test(n.subject || '') ? 'arrowR' : /assigned/i.test(n.subject || '') ? 'chat' : /review|flag|needs you|waiting/i.test(n.subject || '') ? 'eye' : /fail|error|reject/i.test(n.subject || '') ? 'alert' : /not posted|sync|coral|tally/i.test(n.subject || '') ? 'refresh' : 'bell');
  DM.page('/notifications', {
    title: 'Notifications', crumb: 'Notifications',
    render() {
      const all = arr('notifications');
      const list = all.filter((n) => (n.tab || 'human') === nui.tab);
      const cnt = (t) => all.filter((n) => (n.tab || 'human') === t).length;
      return `<div class="page">
        ${DM.header('Notifications', 'Things that need a human, and what your agents did.', `${DM.btn('Mark all read', 'notif-readall', { cls: 'outline', icon: 'check' })}`)}
        <div style="margin-bottom:12px">${DM.seg([{ key: 'human', label: 'Humans', count: cnt('human') }, { key: 'agent', label: 'Agents', count: cnt('agent') }], nui.tab, 'notif-tab')}</div>
        ${list.length ? `<div class="card">${list.map((n) => `<div class="nrow" data-rid="${esc(n.id)}" data-act="notif-open" data-arg="${esc(n.id)}">${DM.icoTile(nIcon(n))}<div class="grow" style="min-width:0"><div class="row"><b>${esc(n.subject)}</b><span class="muted xs">· ${esc(n.from || 'Anuma')}</span><span class="grow"></span><span class="xs muted">${esc(String(n.at).length > 8 ? F.dt(n.at) : n.at || '')}</span>${n.unread ? '<i class="udot"></i>' : ''}</div><div class="sm muted" style="margin-top:2px">${esc(n.body || '')}</div></div></div>`).join('')}</div>` : DM.empty('bell', 'You are all caught up', nui.tab === 'human' ? 'Hand-offs and assignments show up here.' : 'What your agents did shows up here.')}
      </div>`;
    },
  });
  DM.act('notif-tab', (el) => { nui.tab = el.dataset.arg; DM.render(); });
  DM.act('notif-readall', () => { arr('notifications').forEach((n) => { n.unread = false; }); DM.toast('All marked as read'); DM.render(); });
  DM.act('notif-open', (el) => { const n = DM.by(arr('notifications'), el.dataset.arg); if (!n) return; n.unread = false; if (n.href) DM.go(n.href); else DM.render(); });

  /* ───────── Ask Anuma ───────── */
  const aui = (DM.ui.ask = DM.ui.ask || { msgs: [], typing: false, text: '', seen: {} });
  const SUGGEST = ['Top parties', 'Open RFQs', 'Overdue orders', 'Low stock products', 'Sales this month', 'What needs my attention?'];
  const mini = (cols, rows) => `<div class="tblwrap" style="margin:8px 0"><table class="tbl"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  function answer(q) {
    const t = q.toLowerCase(), L = live();
    const orders = activeOrders();
    if (/top|best|biggest|party|parties|dealer|customer/.test(t) && !/rfq/.test(t)) {
      const tp = topParties().slice(0, 5);
      return `Here are your top parties by booked value:` + mini(['Party', 'Booked'], tp.map((p) => [esc(p.l), `<span class="mono">${F.inr(p.v)}</span>`])) + `<a class="btn outline sm" href="#/crm/accounts">${I('users')} Open CRM</a>`;
    }
    if (/rfq|enquir|inquir/.test(t)) {
      const r = arr('rfqs').filter((x) => ['new', 'review'].includes(x.status));
      return r.length ? `You have <b>${r.length}</b> open RFQs worth <b>${F.inrc(L.rfqValue)}</b>:` + mini(['RFQ', 'Party', 'Lines', 'Value'], r.slice(0, 6).map((x) => [`<a href="#/orders/rfqs/${x.id}" style="text-decoration:underline">${esc(x.no || x.id)}</a>`, esc(party(x.partyId).name), (x.lines || []).length, F.inr(x.total)])) : 'No open RFQs right now — everything has been quoted.';
    }
    if (/overdue|late|delay|stuck|pending order/.test(t)) {
      const o = orders.filter((x) => ['confirmed', 'processing'].includes(x.status) || x.payment === 'Pending').slice(0, 6);
      return o.length ? `${o.length} orders are waiting on dispatch or payment:` + mini(['Order', 'Party', 'Status', 'Value'], o.map((x) => [`<a href="#/orders/${x.id}" style="text-decoration:underline">${esc(x.no)}</a>`, esc(party(x.partyId).name), DM.badge(x.status, x.status === 'processing' ? 'blue' : 'amber'), F.inr(x.total)])) : 'Nothing is overdue.';
    }
    if (/stock|inventory|low/.test(t)) {
      const p = arr('products').filter((x) => x.stock != null).sort((a, b) => a.stock - b.stock).slice(0, 5);
      return 'The five lowest-stock products:' + mini(['Product', 'SKU', 'Stock'], p.map((x) => [`<a href="#/products/${x.id}" style="text-decoration:underline">${esc(x.name)}</a>`, esc(x.sku), `<span class="mono ${x.stock < 20 ? 'down' : ''}">${F.num(x.stock)} ${esc(x.unit || '')}</span>`]));
    }
    if (/sales|revenue|month|booked|turnover/.test(t)) {
      return `You've booked <b>${F.inr(L.orderValue)}</b> across <b>${L.orders}</b> orders. Quoted value in play: <b>${F.inrc(L.quoted)}</b>.` + `<div style="max-width:420px;margin-top:8px">${DM.chart.bars(revenueSeries(), { w: 420, h: 90, fmt: F.inr })}</div>`;
    }
    if (/sync|tally|coralio|erp/.test(t)) {
      return L.erpName ? `${L.erpName}: <b>${L.synced}</b> synced, <b>${L.erpPending}</b> pending, <b>${L.failed}</b> failed. <a href="#/settings/integrations" style="text-decoration:underline">Open Apps</a>.` : 'No ERP is connected in this workspace.';
    }
    if (/attention|today|todo|need|urgent|priority/.test(t)) {
      const a = attention();
      return a.length ? 'Here is what needs you:<ul style="margin:6px 0 0 18px">' + a.map((x) => `<li><a href="#${x.href}" style="text-decoration:underline">${esc(x.text)}</a></li>`).join('') + '</ul>' : 'Nothing needs you right now. 🎉';
    }
    if (/draft/.test(t)) return `${L.drafts} draft orders are waiting. <a href="#/orders/drafts" style="text-decoration:underline">Review them</a>.`;
    if (/quote/.test(t)) return `${L.quotesPending} quotes await approval; ${F.inrc(L.quoted)} quoted in total. <a href="#/quotes/all" style="text-decoration:underline">Open quotes</a>.`;
    return `I can answer questions about parties, RFQs, orders, stock, quotes and syncing. Try one of the suggestions below.`;
  }
  function askSend(q) {
    q = (q || '').trim(); if (!q || aui.typing) return;
    aui.msgs.push({ r: 'u', t: esc(q) }); aui.text = ''; aui.typing = true; DM.render();
    setTimeout(() => { aui.typing = false; aui.msgs.push({ r: 'a', t: answer(q) }); if (DM.path().startsWith('/ask')) DM.render(); }, 900 + Math.random() * 500);
  }
  const askPage = {
    title: 'Ask Anuma', crumb: 'Ask Anuma',
    render({ q }) {
      const pre = q.get('q'); if (pre && !aui.seen[pre]) { aui.seen[pre] = 1; setTimeout(() => askSend(pre), 50); }
      return `<div class="page-full askwrap"><div class="askmsgs"><div class="askcol">
        ${aui.msgs.length ? '' : `<div style="text-align:center;padding:40px 0 20px"><div class="icotile" style="margin:0 auto 12px;background:#171717;color:#fff;width:44px;height:44px;border-radius:12px">${I('sparkle')}</div><h1 style="font-size:22px;font-weight:600">Ask Anuma</h1><p class="muted" style="margin-top:4px">Questions are answered from this workspace's live data.</p></div>`}
        ${aui.msgs.map((m, k) => m.r === 'u' ? `<div class="amsg u ${k >= (aui.shown || 0) ? 'amsg-new' : ''}"><div class="bubble">${m.t}</div></div>` : `<div class="amsg ${k >= (aui.shown || 0) ? 'amsg-new' : ''}"><div class="av">${DM.mark(26)}</div><div class="grow" style="font-size:13px">${m.t}</div></div>`).join('')}
        ${aui.typing ? `<div class="amsg"><div class="av">${DM.mark(26)}</div><div class="dots" style="padding-top:8px"><i></i><i></i><i></i></div></div>` : ''}
      </div></div>
      <div class="askcol" style="padding-bottom:18px"><div class="row wrap" style="margin-bottom:10px;gap:6px">${SUGGEST.map((c) => `<button class="chip" data-act="ask-chip" data-arg="${esc(c)}">${esc(c)}</button>`).join('')}${aui.msgs.length ? `<button class="chip right" data-act="ask-clear">${I('rotate')} New chat</button>` : ''}</div>
      <div class="askbar">${I('sparkle')}<input data-input="ask-text" placeholder="Ask about orders, parties, stock…" value="${esc(aui.text)}"><button class="btn sm" data-act="ask-go" ${aui.typing ? 'disabled' : ''}>${I('send')}</button></div></div></div>`;
    },
    after(v) { const m = v.querySelector('.askmsgs'); if (m) m.scrollTo({ top: m.scrollHeight, behavior: 'smooth' }); aui.shown = aui.msgs.length; },
  };
  DM.page('/ask', askPage); DM.page('/ask/:id', askPage);
  DM.input('ask-text', (v) => { aui.text = v; });
  DM.act('ask-go', () => askSend(aui.text)); DM.act('ask-chip', (el) => askSend(el.dataset.arg));
  DM.act('ask-clear', () => { aui.msgs = []; aui.typing = false; DM.render(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.input === 'ask-text') askSend(aui.text); });

  /* ───────── Getting started ───────── */
  const GS = [
    { key: 'import', label: 'Import your data', icon: 'upload', sub: 'Bring in products and parties from files or your ERP.' },
    { key: 'listen', label: 'Connect channels', icon: 'radio', sub: 'Let Anuma listen on WhatsApp, email and more.' },
    { key: 'make-sense', label: 'Make sense of it', icon: 'wand', sub: 'Review how Anuma reads a sample message.' },
    { key: 'shipping', label: 'Shipping', icon: 'truck', sub: 'Choose carriers and defaults.' },
    { key: 'govern', label: 'Set the rules', icon: 'shield', sub: 'Decide when a human steps in.' },
    { key: 'go-live', label: 'Go live', icon: 'rocket', sub: 'Final checks and switch on.' },
  ];
  const gs = (DM.ui.gs = DM.ui.gs || { done: new Set(['import']), src: 'file', progress: 0, ch: { whatsapp: true, email: false, indiamart: false }, car: { shiprocket: true, delhivery: false, bluedart: false }, floor: 80, timer: 30, hitl: { price: true, newparty: true, credit: true, photo: false }, live: false });
  function gsShell(key, body) {
    const i = GS.findIndex((s) => s.key === key), cur = GS[i], nxt = GS[i + 1], prv = GS[i - 1];
    return `<div class="page"><div class="grid" style="grid-template-columns:240px minmax(0,1fr);align-items:start">
      <div class="card pad"><div class="b" style="margin-bottom:2px">Getting started</div><div class="xs muted" style="margin-bottom:10px">${gs.done.size} of ${GS.length} complete</div><div class="bar" style="margin-bottom:10px"><i style="width:${(gs.done.size / GS.length) * 100}%"></i></div>
      <div class="gsnav">${GS.map((s, k) => `<a class="gsstep ${s.key === key ? 'on' : ''} ${gs.done.has(s.key) ? 'done' : ''}" href="#/getting-started/${s.key}"><span class="n">${gs.done.has(s.key) ? I('check').replace('class="i "', 'class="i" style="width:12px;height:12px"') : k + 1}</span>${esc(s.label)}</a>`).join('')}</div></div>
      <div class="card pad"><div class="row" style="margin-bottom:4px"><div class="icotile">${I(cur.icon)}</div><div><h3 style="font-size:16px">${esc(cur.label)}</h3><div class="sm muted">${esc(cur.sub)}</div></div></div><div class="sep"></div>${body}
      <div class="sep"></div><div class="row">${prv ? DM.btn('Back', null, { cls: 'outline', go: '/getting-started/' + prv.key, icon: 'arrowL' }) : ''}<span class="right row">${DM.btn('Skip', 'gs-skip', { cls: 'ghost', arg: key })}${DM.btn(nxt ? 'Save & continue' : 'Finish', 'gs-done', { arg: key })}</span></div></div></div></div>`;
  }
  DM.page('/getting-started', { title: 'Getting started', crumb: 'Getting started', render() { const nxt = GS.find((s) => !gs.done.has(s.key)) || GS[0]; return `<div class="page fadein" style="max-width:760px">${DM.header('Get Anuma ready for your business', 'Six short steps. You can come back to any of them.')}<div class="col">${GS.map((s, k) => `<a class="card rcard" href="#/getting-started/${s.key}"><div class="icotile">${I(s.icon)}</div><div class="grow"><div class="b">${k + 1}. ${esc(s.label)}</div><div class="sm muted">${esc(s.sub)}</div></div>${gs.done.has(s.key) ? DM.badge('Done', 'green') : s.key === nxt.key ? DM.badge('Up next', 'blue') : ''}${I('chevR')}</a>`).join('')}</div></div>`; } });
  DM.page('/getting-started/import', { title: 'Import', crumb: 'Getting started', render() {
    const srcs = [['file', 'Upload a file', 'CSV or Excel', 'upload'], ['erp', 'Connect your ERP', (live().erpName || 'Tally / ERP'), 'database'], ['sheet', 'Google Sheet', 'Sync a sheet', 'sheet']];
    return gsShell('import', `<div class="grid g3">${srcs.map(([k, l, s, ic]) => `<div class="card rcard ${gs.src === k ? 'on' : ''}" data-act="gs-src" data-arg="${k}"><div class="icotile">${I(ic)}</div><div><div class="b sm">${l}</div><div class="xs muted">${esc(s)}</div></div></div>`).join('')}</div>
      <div class="card pad" style="margin-top:14px;border-style:dashed;text-align:center">${gs.progress >= 100 ? `<div class="up b">${I('check')} Imported ${arr('products').length} products and ${arr('parties').length} parties</div>` : gs.progress > 0 ? `<div class="sm" style="margin-bottom:8px">Importing…</div><div class="bar"><i style="width:${gs.progress}%"></i></div>` : `<div class="muted sm" style="margin-bottom:10px">${gs.src === 'file' ? 'Drop a file here, or' : 'Ready to pull data from the selected source'}</div>${DM.btn(gs.src === 'file' ? 'Use sample file' : 'Start import', 'gs-import', { cls: 'outline', icon: 'upload' })}`}</div>`);
  } });
  DM.page('/getting-started/listen', { title: 'Channels', crumb: 'Getting started', render() {
    const ch = [['whatsapp', 'WhatsApp Business', 'Customers message you; Anuma replies and records orders.', 'chat'], ['email', 'Email inbox', 'Parse RFQs and POs from attached PDFs and sheets.', 'mail'], ['indiamart', 'IndiaMART leads', 'Pull buy-leads straight into Deals.', 'globe']];
    return gsShell('listen', `<div class="col">${ch.map(([k, l, s, ic]) => `<div class="card pad row"><div class="icotile">${I(ic)}</div><div class="grow"><div class="b sm">${l}</div><div class="xs muted">${s}</div></div>${gs.ch[k] ? DM.badge('Connected', 'green', true) : ''}${DM.switch(gs.ch[k], 'gs-ch', k)}</div>`).join('')}</div>`);
  } });
  DM.page('/getting-started/make-sense', { title: 'Make sense', crumb: 'Getting started', render() {
    const r = arr('rfqs')[0], lines = (r && r.lines || []).slice(0, 4);
    const sample = lines.length ? lines.map((l) => l.text).join('\n') : '2 x sample item\n10 m cable roll\nplease quote best price';
    return gsShell('make-sense', `<div class="grid g2"><div><div class="xs muted b" style="margin-bottom:6px">WHAT THE CUSTOMER SENT</div><div class="card pad" style="background:var(--chat-wallpaper);white-space:pre-wrap;font-size:13px">${esc(sample)}</div></div><div><div class="xs muted b" style="margin-bottom:6px">WHAT ANUMA READ</div>${lines.length ? DM.table([{ label: 'Item', render: (l) => esc(l.name || l.text) }, { label: 'Qty', num: true, render: (l) => esc(l.qty + ' ' + (l.unit || '')) }, { label: 'Match', render: (l) => DM.badge(l.confidence != null ? l.confidence + '%' : l.state, l.state === 'matched' ? 'green' : 'amber') }], lines) : '<div class="empty">Parsed lines appear here once RFQs arrive.</div>'}</div></div><div class="row" style="margin-top:12px">${DM.btn('Looks right', 'toast', { cls: 'outline', arg: 'Thanks — Anuma will keep learning from corrections', icon: 'check' })}${DM.btn('Something is off', 'toast', { cls: 'outline', arg: 'Noted — a human will review similar messages', icon: 'flag' })}</div>`);
  } });
  DM.page('/getting-started/shipping', { title: 'Shipping', crumb: 'Getting started', render() {
    return gsShell('shipping', `<div class="col">${[['shiprocket', 'Shiprocket'], ['delhivery', 'Delhivery'], ['bluedart', 'Blue Dart']].map(([k, l]) => `<div class="card pad row">${DM.avatar(l, '', { org: true })}<div class="grow"><div class="b sm">${l}</div><div class="xs muted">${gs.car[k] ? 'Enabled for all pincodes' : 'Not enabled'}</div></div>${DM.switch(gs.car[k], 'gs-car', k)}</div>`).join('')}</div><div class="grid g2" style="margin-top:14px">${DM.field('Default pickup address', 'addr', { value: (S().company || {}).address || '' })}${DM.field('Free shipping above (₹)', 'free', { type: 'number', value: 25000 })}</div>`);
  } });
  DM.page('/getting-started/govern', { title: 'Rules', crumb: 'Getting started', render() {
    const rules = [['price', 'A price differs from the price list'], ['newparty', 'The sender is not a known party'], ['credit', 'The order would exceed the credit limit'], ['photo', 'A photo cannot be matched to a product']];
    return gsShell('govern', `<div class="field"><label>Confidence floor: <b>${gs.floor}%</b></label><input type="range" min="50" max="99" value="${gs.floor}" data-input="gs-floor" style="width:100%"><div class="xs muted">Matches below this are handed to a person.</div></div>
      <div class="field" style="margin-top:14px"><label>Re-notify after: <b>${gs.timer} min</b></label><input type="range" min="5" max="120" step="5" value="${gs.timer}" data-input="gs-timer" style="width:100%"></div>
      <div class="b sm" style="margin:16px 0 8px">Hand to a human when…</div><div class="col">${rules.map(([k, l]) => `<div class="card pad row"><div class="grow sm">${l}</div>${DM.switch(gs.hitl[k], 'gs-hitl', k)}</div>`).join('')}</div>`);
  } });
  DM.page('/getting-started/go-live', { title: 'Go live', crumb: 'Getting started', render() {
    const chk = GS.slice(0, 5).map((s) => [s.label, gs.done.has(s.key)]);
    const ready = chk.every((c) => c[1]);
    return gsShell('go-live', `<div class="col">${chk.map(([l, ok]) => `<div class="row">${ok ? `<span class="chk on">${I('check').replace('class="i "', 'class="i" style="width:11px;height:11px"')}</span>` : '<span class="chk"></span>'}<span class="${ok ? '' : 'muted'}">${esc(l)}</span>${ok ? '' : `<a class="xs right" style="text-decoration:underline" href="#/getting-started/${GS.find((s) => s.label === l).key}">Do it now</a>`}</div>`).join('')}</div><div class="card pad row" style="margin-top:14px;background:${gs.live ? 'var(--success-tint)' : 'var(--muted)'}"><div class="grow"><div class="b">${gs.live ? 'Anuma is live 🎉' : 'Ready when you are'}</div><div class="sm muted">${gs.live ? 'Agents are now answering on your connected channels.' : ready ? 'Everything is set. Switch Anuma on.' : 'Finish the steps above, or go live anyway.'}</div></div>${DM.btn(gs.live ? 'Pause' : 'Go live', 'gs-live', { cls: gs.live ? 'outline' : '' })}</div>`);
  } });
  DM.act('gs-src', (el) => { gs.src = el.dataset.arg; gs.progress = 0; DM.render(); });
  DM.act('gs-import', () => { if (gs.timerId) return; gs.progress = 8; DM.render(); gs.timerId = setInterval(() => { gs.progress = Math.min(100, gs.progress + 23); if (gs.progress >= 100) { clearInterval(gs.timerId); gs.timerId = null; DM.toast('Import complete'); } if (DM.path() === '/getting-started/import') DM.render(); }, 450); });
  DM.act('gs-ch', (el) => { const k = el.dataset.arg; gs.ch[k] = !gs.ch[k]; DM.toast((gs.ch[k] ? 'Connected ' : 'Disconnected ') + k); DM.render(); });
  DM.act('gs-car', (el) => { const k = el.dataset.arg; gs.car[k] = !gs.car[k]; DM.render(); });
  DM.act('gs-hitl', (el) => { const k = el.dataset.arg; gs.hitl[k] = !gs.hitl[k]; DM.render(); });
  DM.input('gs-floor', (v) => { gs.floor = +v; const l = document.querySelector('#view label b'); if (l) l.textContent = v + '%'; });
  DM.input('gs-timer', (v) => { gs.timer = +v; const l = document.querySelectorAll('#view label b')[1]; if (l) l.textContent = v + ' min'; });
  DM.act('gs-done', (el) => { const k = el.dataset.arg, i = GS.findIndex((s) => s.key === k); gs.done.add(k); DM.toast('Saved'); DM.go(GS[i + 1] ? '/getting-started/' + GS[i + 1].key : '/dashboard'); });
  DM.act('gs-skip', (el) => { const i = GS.findIndex((s) => s.key === el.dataset.arg); DM.go(GS[i + 1] ? '/getting-started/' + GS[i + 1].key : '/getting-started'); });
  DM.act('gs-live', () => { gs.live = !gs.live; gs.done.add('go-live'); DM.toast(gs.live ? 'Anuma is live' : 'Paused', gs.live ? 'rocket' : 'pause'); DM.render(); });

  /* ───────── Insights ───────── */
  DM.page('/insights', { title: 'Insights', crumb: 'Insights', render() {
    const th = arr('threads'), L = live();
    const ch = {}; th.forEach((t) => { ch[t.channel] = (ch[t.channel] || 0) + 1; });
    const chItems = Object.entries(ch).map(([l, v]) => ({ l, v }));
    const cats = {}; arr('products').forEach((p) => { cats[p.category] = (cats[p.category] || 0) + 1; });
    const catItems = Object.entries(cats).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v).slice(0, 6);
    const won = arr('leads').filter((l) => l.stage === 'Won').length, tot = arr('leads').length || 1;
    const ag = arr('agents');
    const auto = ag.length ? Math.round(sum(ag, (a) => (a.kpis || {}).autoRate) / ag.length) : 0;
    return `<div class="page">${DM.header('Insights', 'How demand is turning into revenue.', DM.btn('Export', 'ins-export', { cls: 'outline', icon: 'download' }))}
      <div class="kpis stagger" style="margin-bottom:14px">${stat('Win rate', DM.cnt((won / tot) * 100, 'pct'), `${won} of ${tot} deals`, { icon: 'star' })}${stat('Automation rate', DM.cnt(auto, 'pct'), 'handled without a human', { icon: 'bot' })}${stat('Avg order value', DM.cnt(L.orders ? L.orderValue / L.orders : 0, 'inrc'), F.num(L.orders) + ' orders', { icon: 'rupee' })}${stat('Quoted', DM.cnt(L.quoted, 'inrc'), L.quotesPending + ' awaiting approval', { icon: 'receipt' })}</div>
      <div class="grid g3"><div class="card pad"><h3 style="margin-bottom:8px">Conversations by channel</h3><div class="row" style="gap:16px">${DM.chart.donut(chItems.length ? chItems : [{ l: '-', v: 1 }])}<div class="col sm" style="gap:5px">${chItems.map((c) => `<div class="row"><span class="grow">${esc(c.l)}</span><b class="mono">${c.v}</b></div>`).join('')}</div></div></div>
      <div class="card pad"><h3 style="margin-bottom:10px">Catalogue by category</h3>${DM.chart.hbars(catItems)}</div>
      <div class="card pad"><h3 style="margin-bottom:10px">Pipeline stages</h3>${DM.chart.hbars(funnelSeries())}</div></div>
      <div class="card pad" style="margin-top:12px"><h3 style="margin-bottom:8px">Revenue trend</h3>${DM.chart.spark(revenueSeries().map((r) => r.v), { w: 800, h: 90 })}</div></div>`;
  } });
  DM.act('ins-export', () => downloadCSV('insights.csv', [['Stage', 'Deals']].concat(funnelSeries().map((f) => [f.l, f.v]))));

  /* ───────── Reports ───────── */
  const rui = (DM.ui.reports = DM.ui.reports || { cur: 'sales', range: '30d' });
  const REPORTS = {
    sales: { label: 'Sales by party', icon: 'rupee', sub: 'Booked value and order count per party', cols: ['Party', 'Orders', 'Value'], rows: () => { const m = {}; activeOrders().forEach((o) => { const p = party(o.partyId).name; (m[p] = m[p] || [0, 0]); m[p][0]++; m[p][1] += o.total; }); return Object.entries(m).sort((a, b) => b[1][1] - a[1][1]).map(([p, [n, v]]) => [p, n, v]); }, fmt: [0, 0, F.inr] },
    products: { label: 'Product demand', icon: 'package', sub: 'Units ordered per product', cols: ['Product', 'Units', 'Value'], rows: () => { const m = {}; activeOrders().forEach((o) => (o.lines || []).forEach((l) => { (m[l.name] = m[l.name] || [0, 0]); m[l.name][0] += +l.qty || 0; m[l.name][1] += (+l.qty || 0) * (+l.price || 0); })); return Object.entries(m).sort((a, b) => b[1][1] - a[1][1]).map(([p, [n, v]]) => [p, n, v]); }, fmt: [0, F.num, F.inr] },
    receivables: { label: 'Receivables', icon: 'clock', sub: 'Outstanding per party versus credit limit', cols: ['Party', 'Outstanding', 'Credit limit'], rows: () => arr('parties').map((p) => [p.name, p.outstanding || 0, p.creditLimit || 0]).sort((a, b) => b[1] - a[1]), fmt: [0, F.inr, F.inr] },
    rfq: { label: 'RFQ funnel', icon: 'sheet', sub: 'RFQs by status', cols: ['Status', 'RFQs', 'Value'], rows: () => ['new', 'review', 'quoted', 'won', 'lost'].map((s) => { const r = arr('rfqs').filter((x) => x.status === s); return [s, r.length, sum(r, (x) => x.total)]; }), fmt: [0, 0, F.inr] },
    sync: { label: 'ERP sync health', icon: 'refresh', sub: 'Integration calls by outcome', cols: ['State', 'Calls'], rows: () => ['synced', 'pending', 'failed'].map((s) => [s, arr('erpLog').filter((e) => e.state === s).length]), fmt: [0, 0] },
  };
  DM.page('/reports', { title: 'Reports', crumb: 'Reports', render() {
    const R = REPORTS[rui.cur], rows = R.rows();
    return `<div class="page wide">${DM.header('Reports', 'Pick a report, filter, and download it.', `${DM.pills([{ key: '7d', label: '7d' }, { key: '30d', label: '30d' }, { key: '90d', label: '90d' }, { key: 'all', label: 'All time' }], rui.range, 'rep-range')}${DM.btn('Download CSV', 'rep-dl', { icon: 'download' })}`)}
      <div class="grid" style="grid-template-columns:260px minmax(0,1fr);align-items:start"><div class="col">${Object.entries(REPORTS).map(([k, r]) => `<div class="card rcard ${rui.cur === k ? 'on' : ''}" data-act="rep-pick" data-arg="${k}"><div class="icotile">${I(r.icon)}</div><div><div class="b sm">${r.label}</div><div class="xs muted">${r.sub}</div></div></div>`).join('')}</div>
      <div class="col"><div class="card pad"><div class="row"><h3>${R.label}</h3><span class="xs muted right">${rows.length} rows · ${rui.range}</span></div>${rows.length && typeof rows[0][rows[0].length - 1] === 'number' ? `<div style="margin-top:8px">${DM.chart.hbars(rows.slice(0, 6).map((r) => ({ l: r[0], v: r[r.length - 1] })), { fmt: R.fmt[R.fmt.length - 1] || ((v) => v) })}</div>` : ''}</div>
      ${DM.table(R.cols.map((c, i) => ({ label: c, num: i > 0, render: (r) => { const f = R.fmt[i]; return esc(f ? f(r[i]) : r[i]); } })), rows.map((r) => r.slice()).map((r, i) => Object.assign(r, { id: i })))}</div></div></div>`;
  } });
  DM.act('rep-pick', (el) => { rui.cur = el.dataset.arg; DM.render(); });
  DM.act('rep-range', (el) => { rui.range = el.dataset.arg; DM.render(); });
  DM.act('rep-dl', () => { const R = REPORTS[rui.cur]; downloadCSV(rui.cur + '-report.csv', [R.cols].concat(R.rows())); });

  /* ───────── Production + Packaging ───────── */
  const STAGES = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];
  const pui = (DM.ui.prod = DM.ui.prod || { tab: 'queue' });
  const prodOrders = () => arr('orders').filter((o) => ['confirmed', 'processing', 'packed'].includes(o.status));
  DM.page('/production', { title: 'Production', crumb: 'Production', render() {
    const all = prodOrders();
    const rows = pui.tab === 'all' ? all : all.filter((o) => o.status === (pui.tab === 'queue' ? 'confirmed' : pui.tab === 'running' ? 'processing' : 'packed'));
    const n = (s) => all.filter((o) => o.status === s).length;
    return `<div class="page wide">${DM.header('Production', 'Turn confirmed orders into packed, ready-to-ship work.')}
      <div class="kpis stagger" style="margin-bottom:14px">${stat('In queue', DM.cnt(n('confirmed')), 'confirmed, not started', { icon: 'clock' })}${stat('In production', DM.cnt(n('processing')), 'being made / picked', { icon: 'factory' })}${stat('Ready to pack', DM.cnt(n('packed')), 'packed', { icon: 'box' })}${stat('Units on floor', DM.cnt(sum(all, (o) => sum(o.lines || [], (l) => l.qty))), '', { icon: 'package' })}</div>
      <div style="margin:14px 0 10px">${DM.seg([{ key: 'queue', label: 'Queue', count: n('confirmed') }, { key: 'running', label: 'In production', count: n('processing') }, { key: 'done', label: 'Packed', count: n('packed') }, { key: 'all', label: 'All' }], pui.tab, 'prod-tab')}</div>
      ${DM.table([{ label: 'Order', render: (o) => `<a class="b" href="#/orders/${o.id}" style="text-decoration:underline">${esc(o.no)}</a>` }, { label: 'Party', render: (o) => esc(party(o.partyId).name) }, { label: 'Items', render: (o) => `${(o.lines || []).length} lines · ${sum(o.lines || [], (l) => l.qty)} units` }, { label: 'Progress', render: (o) => `<div class="stagebar" style="width:110px">${STAGES.slice(0, 4).map((s, i) => `<i class="${STAGES.indexOf(o.status) >= i ? 'on' : ''}"></i>`).join('')}</div>` }, { label: 'Status', render: (o) => DM.status(o.status[0].toUpperCase() + o.status.slice(1), o.status === 'processing' ? 'blue' : o.status === 'packed' ? 'green' : 'amber') }, { label: '', render: (o) => o.status === 'confirmed' ? DM.btn('Start', 'prod-adv', { cls: 'sm', arg: o.id }) : o.status === 'processing' ? DM.btn('Mark packed', 'prod-adv', { cls: 'sm outline', arg: o.id }) : DM.btn('Packing slip', null, { cls: 'sm ghost', go: '/packaging/' + o.id }) }], rows, { empty: 'Nothing in this stage.' })}</div>`;
  } });
  DM.act('prod-tab', (el) => { pui.tab = el.dataset.arg; DM.render(); });
  DM.act('prod-adv', (el) => { const o = DM.by(arr('orders'), el.dataset.arg); if (!o) return; o.status = o.status === 'confirmed' ? 'processing' : 'packed'; DM.toast(`${o.no} → ${o.status}`); DM.render(); });

  DM.page('/packaging', { title: 'Packaging', crumb: 'Packaging', render() {
    const o = arr('orders').filter((x) => ['confirmed', 'processing', 'packed', 'shipped'].includes(x.status));
    return `<div class="page wide">${DM.header('Packaging', 'Packing slips and box plans for open orders.')}${DM.table([{ label: 'Order', render: (r) => `<b>${esc(r.no)}</b>` }, { label: 'Party', render: (r) => esc(party(r.partyId).name) }, { label: 'Boxes', num: true, render: (r) => Math.max(1, Math.ceil(sum(r.lines || [], (l) => l.qty) / 40)) }, { label: 'Status', render: (r) => DM.badge(r.status, r.status === 'packed' || r.status === 'shipped' ? 'green' : 'amber', true) }], o, { go: (r) => '/packaging/' + r.id, empty: 'No orders to pack.' })}</div>`;
  } });
  DM.page('/packaging/:id/edit', { title: 'Edit packing', crumb: 'Packaging', render({ params }) {
    const o = DM.by(arr('orders'), params.id); if (!o) return '<div class="page"><div class="empty">Order not found</div></div>';
    return `<div class="page fadein" style="max-width:640px">${DM.header('Edit packing · ' + esc(o.no))}<div class="card pad col" id="pk-form">${DM.field('Boxes', 'boxes', { type: 'number', value: Math.max(1, Math.ceil(sum(o.lines || [], (l) => l.qty) / 40)) })}${DM.field('Weight (kg)', 'kg', { type: 'number', value: 12 })}${DM.field('Notes', 'note', { area: true, ph: 'Fragile, keep upright…' })}<div class="row">${DM.btn('Save', 'pk-save', { arg: o.id })}${DM.btn('Cancel', null, { cls: 'outline', go: '/packaging/' + o.id })}</div></div></div>`;
  } });
  DM.page('/packaging/:id', { title: 'Packing slip', crumb: (p) => p.id, render({ params }) {
    const o = DM.by(arr('orders'), params.id); if (!o) return '<div class="page"><div class="empty">Order not found</div></div>';
    const units = sum(o.lines || [], (l) => l.qty), boxes = Math.max(1, Math.ceil(units / 40));
    return `<div class="page fadein" style="max-width:900px">${DM.header(`Packing slip · ${esc(o.no)}`, `${esc(party(o.partyId).name)} · ${boxes} box${boxes > 1 ? 'es' : ''} · ${units} units`, `${DM.btn('Edit', null, { cls: 'outline', go: '/packaging/' + o.id + '/edit', icon: 'edit' })}${DM.btn('Print', 'pk-print', { cls: 'outline', icon: 'file' })}${o.status === 'packed' || o.status === 'shipped' ? DM.badge('Packed', 'green', true) : DM.btn('Mark packed', 'prod-adv-pk', { arg: o.id, icon: 'check' })}`)}
      <div class="card">${DM.table([{ label: '#', render: (l) => (o.lines.indexOf(l) + 1) }, { label: 'Item', render: (l) => esc(l.name) }, { label: 'Qty', num: true, render: (l) => esc(l.qty + ' ' + (l.unit || '')) }, { label: 'Packed', render: (l) => `<span class="chk ${o.status === 'packed' || o.status === 'shipped' ? 'on' : ''}">${o.status === 'packed' || o.status === 'shipped' ? I('check').replace('class="i "', 'class="i" style="width:11px;height:11px"') : ''}</span>` }], o.lines || [])}</div>
      <div class="row" style="margin-top:12px">${DM.btn('Back to packaging', null, { cls: 'ghost', go: '/packaging', icon: 'arrowL' })}${DM.btn('Open order', null, { cls: 'ghost', go: '/orders/' + o.id, icon: 'ext' })}</div></div>`;
  } });
  DM.act('prod-adv-pk', (el) => { const o = DM.by(arr('orders'), el.dataset.arg); if (!o) return; o.status = 'packed'; DM.toast(o.no + ' packed'); DM.render(); });
  DM.act('pk-print', () => { DM.toast('Sent to printer (demo)', 'file'); });
  DM.act('pk-save', (el) => { DM.toast('Packing details saved'); DM.go('/packaging/' + el.dataset.arg); });
})();
