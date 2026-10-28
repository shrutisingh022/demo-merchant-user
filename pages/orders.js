/* pages/orders.js — shared helpers for the Orders / Draft Orders list (pages/drafts.js) and RFQs (pages/rfqs.js).
   There is no confirmed-orders list in the live tenants: `/orders` simply redirects to the draft-orders page.
   Public helpers (also for the scenario wave):
     DM.orders.nextNo(S)                      → next DRF number (int)
     DM.orders.addDraft(S, partial)           → pushes a draft (id/no/createdAt/status/lines defaults) at the top of S.drafts and returns it
     DM.orders.fmtDT(iso) / fmtD(iso)         → '25 Oct 2026, 4:47 pm' / '27 Aug 2026' (IST)
     DM.orders.assignee(a, size)              → avatar for 'agent' (black mark) | 'anuma' (pale-blue A) | userId (photo) | null (empty person)
     DM.orders.stack(list)                    → overlapping avatar stack
     DM.orders.party(S, id) / user(S, id) / thread(S, draft) / swatch(variantId)
     DM.orders.range(a, b, max)               → range calendar popover (Cancel/Apply)  */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc;
  const S = () => DM.S;
  const css = document.createElement('style'); css.dataset.for = 'orders';
  css.textContent = `
  .asg{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;flex:none;overflow:hidden;box-sizing:border-box;font-size:11px;font-weight:600}
  .asg.agent{background:#0a0a0a}.asg.agent svg{width:24px;height:24px}
  .asg.anu{background:#dbeafe;color:#1d4ed8}
  .asg.none{border:1px solid #d4d4d4;color:#a3a3a3;background:#fff}.asg.none svg.i{width:13px;height:13px}
  .asg-stack{display:inline-flex}.asg-stack>*{box-shadow:0 0 0 2px #fff}.asg-stack>*+*{margin-left:-6px}
  .asg-cell{display:flex;align-items:center;gap:6px}
  .calpop .cd.inr{background:#f1f1f1;border-radius:0}.calpop .cd.end{background:#0a0a0a;color:#fff;border-radius:8px}.calpop .cd.sel{background:#0a0a0a;color:#fff}
  .calpop .cr-sum{margin:8px 0 6px;font-size:12px;color:#737373;text-align:center}.calpop .cr-f{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}
  .calpop.wide{width:272px}
  .case-link{display:inline-flex;gap:5px;align-items:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}.case-link:hover{text-decoration:underline}.case-link svg.i{width:11px;height:11px;color:#737373}
  `;
  document.head.appendChild(css);

  /* ───────── formatting (IST) ───────── */
  const P = (v) => { const d = new Date(v); const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(d); const o = {}; f.forEach((x) => (o[x.type] = x.value)); return o; };
  const fmtDT = (v) => { if (!v) return '—'; const o = P(v); return `${o.day} ${o.month} ${o.year}, ${o.hour}:${o.minute} ${String(o.dayPeriod).toLowerCase()}`; };
  const fmtD = (v) => { if (!v) return '—'; const o = P(v); return `${o.day} ${o.month} ${o.year}`; };
  const fmtTm = (v) => { const o = P(v); return `${o.hour}:${o.minute} ${String(o.dayPeriod).toLowerCase()}`; };
  const nowD = () => { const n = DM.now(); return n instanceof Date ? n : new Date(n); };

  /* ───────── lookups ───────── */
  const party = (s, id) => (s.parties || []).find((p) => p.id === id);
  const user = (s, id) => (s.users || []).find((u) => u.id === id);
  const thread = (s, d) => { const T = s.threads || []; if (d.caseId) { const t = T.find((x) => x.id === d.caseId); if (t) return t; } if (d.caseNo) return T.find((t) => DM.caseNo(t) === d.caseNo) || null; return null; };
  const styleOf = (s, id) => (s.styles || []).find((x) => x.id === id);
  const variantOf = (s, vid) => { for (const st of s.styles || []) { const v = (st.variants || []).find((x) => x.id === vid); if (v) return { style: st, v }; } return null; };
  const swatch = (vid) => { const f = variantOf(S(), vid); return f && f.v.img ? f.v.img : ''; };

  /* ───────── avatars ───────── */
  const assignee = (a, size) => {
    const px = size || 24;
    if (!a) return `<span class="asg none" title="Unassigned" style="width:${px}px;height:${px}px">${I('user')}</span>`;
    if (a === 'agent') return `<span class="asg agent" title="Anuma" style="width:${px}px;height:${px}px">${DM.mark(px)}</span>`;
    if (a === 'anuma') return `<span class="asg anu" title="Anuma" style="width:${px}px;height:${px}px">A</span>`;
    const u = user(S(), a); return `<span title="${esc(u ? u.name : a)}" style="display:inline-flex">${DM.avatar(u ? u.name : a, 'sm round', { org: false })}</span>`;
  };
  const stack = (list) => `<span class="asg-stack">${(list || []).map((a) => assignee(a)).join('')}</span>`;

  /* ───────── drafts API ───────── */
  const nextNo = (s) => (s.drafts || []).reduce((m, d) => Math.max(m, d.n || 0), 1000) + 1;
  const addDraft = (s, p) => {
    const n = p.n || nextNo(s); const created = p.createdAt || nowD().toISOString();
    const d = Object.assign({ id: 'd-' + n, no: 'DRF-' + n, n, createdAt: created, partyId: null, partyName: '', contactId: null, caseId: null, caseNo: null, assigned: 'anuma', assignees: ['anuma'], status: 'pending', channel: 'whatsapp', timeToCloseMin: null, interventions: 0, lines: [], erp: null }, p);
    d.id = p.id || 'd-' + n; d.no = p.no || 'DRF-' + n; d.n = n; d.createdAt = created;
    if (!d.partyName && d.partyId) { const pt = party(s, d.partyId); d.partyName = pt ? pt.name : ''; }
    (s.drafts = s.drafts || []).unshift(d); return d;
  };

  /* ───────── range calendar (Cancel / Apply) ───────── */
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const range = (anchor, o) => {
    document.querySelectorAll('.calpop').forEach((e) => e.remove());
    let a = o.from || null, b = o.to || null; const max = o.max ? new Date(o.max + 'T00:00:00') : null; let view = new Date((a || o.max) + 'T00:00:00'); view = new Date(view.getFullYear(), view.getMonth(), 1);
    const r = anchor.getBoundingClientRect(); const pop = document.createElement('div'); pop.className = 'calpop wide'; document.body.appendChild(pop);
    const human = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const draw = () => {
      const y = view.getFullYear(), m = view.getMonth(); const first = new Date(y, m, 1); const start = new Date(y, m, 1 - first.getDay()); const cells = [];
      for (let k = 0; k < 42; k++) { const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + k); const s = iso(d); const out = d.getMonth() !== m; const dis = max && d > max; const inr = a && b && s > a && s < b; cells.push(`<button class="cd ${out ? 'out' : ''} ${dis ? 'dis' : ''} ${s === a || s === b ? 'end' : ''} ${inr ? 'inr' : ''}" ${dis ? 'disabled' : ''} data-d="${s}">${d.getDate()}</button>`); }
      pop.innerHTML = `<div class="ch"><button class="btn ghost icon sm cprev">${I('chevL')}</button><b class="grow" style="text-align:center">${view.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</b><button class="btn ghost icon sm cnext">${I('chevR')}</button></div><div class="cw">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((x) => `<span>${x}</span>`).join('')}</div><div class="cg">${cells.join('')}</div><div class="cr-sum">${a ? human(a) + (b ? ' – ' + human(b) : ' – …') : 'Pick a start date'}</div><div class="cr-f"><button class="btn outline sm ccancel">Cancel</button><button class="btn sm capply" ${a && b ? '' : 'disabled'}>Apply</button></div>`;
      pop.querySelector('.cprev').onclick = () => { view = new Date(y, m - 1, 1); draw(); }; pop.querySelector('.cnext').onclick = () => { view = new Date(y, m + 1, 1); draw(); };
      pop.querySelectorAll('.cd:not(.dis)').forEach((x) => (x.onclick = () => { const s = x.dataset.d; if (!a || (a && b)) { a = s; b = null; } else if (s < a) { a = s; } else { b = s; } draw(); }));
      pop.querySelector('.ccancel').onclick = () => pop.remove(); pop.querySelector('.capply').onclick = () => { pop.remove(); o.onApply(a, b); };
    }; draw();
    pop.style.top = r.bottom + 6 + 'px'; pop.style.left = Math.max(8, Math.min(r.right - 272, innerWidth - 284)) + 'px';
    setTimeout(() => document.addEventListener('mousedown', function f(e) { if (!e.target.closest('.calpop')) { pop.remove(); document.removeEventListener('mousedown', f); } }), 0);
  };

  DM.orders = { nextNo, addDraft, fmtDT, fmtD, fmtTm, assignee, stack, party, user, thread, swatch, variantOf, styleOf, range, nowD, iso };
  DM.page('/orders', { title: 'Orders', render: () => '', after: () => DM.go('/orders/drafts') });
})();
