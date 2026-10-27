/* Quotes — approvals queue, all quotes, quote detail (editable), rate card, presentation, hosted customer quote /q/:id. */
(function () {
  const D = window.DM, I = D.icon, esc = D.esc;
  const st = document.createElement('style'); st.dataset.for = 'quotes';
  st.textContent = `
  .qt-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}
  .qt-in{width:84px;height:28px;text-align:right;font-variant-numeric:tabular-nums}
  .doc{background:#fff;border:1px solid var(--border);border-radius:14px;max-width:820px;margin:0 auto;box-shadow:0 8px 30px rgba(0,0,0,.05)}
  .doc .dh{padding:26px 30px;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:center}
  .doc .db{padding:22px 30px}.doc table{width:100%;border-collapse:collapse;font-size:13px}.doc th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted-foreground);text-align:left;padding:8px 6px;border-bottom:1px solid var(--border)}.doc td{padding:9px 6px;border-bottom:1px solid var(--border)}
  .doc .num{text-align:right;font-variant-numeric:tabular-nums}
  .mdot{width:8px;height:8px;border-radius:50%;display:inline-block}
  .qt-ap{transition:opacity .25s ease,transform .25s ease,max-height .3s ease}.qt-out{opacity:0;transform:translateX(28px)}
  @media(max-width:1100px){.qt-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  const S = () => D.S, NOW = '2026-10-27T11:00:00+05:30';
  const ui = () => (D.ui.quotes = D.ui.quotes || { f: 'all', q: '', pres: { brand: '#171717', logo: true, gst: true, terms: true, accept: true, validity: 14, footer: 'Thank you for choosing us. Prices are valid for the period shown.', title: 'Quotation' } });
  const quotes = () => S().quotes || [];
  const cn = (n, k, fmt) => `<span data-count="${n}" data-ck="${k}"${fmt ? ` data-fmt="${fmt}"` : ''}>${fmt === 'inrc' ? D.fmt.inrc(n) : fmt === 'pct' ? Math.round(n) + '%' : D.fmt.num(n)}</span>`;
  const party = (id) => D.by(S().parties, id) || { id, name: id || '—' };
  const uname = (id) => (D.by(S().users, id) || {}).name || id || '—';
  const me = () => (S().users || [])[0] || { id: 'me', name: 'You' };
  const TONE = { draft: '', pending_approval: 'amber', sent: 'blue', accepted: 'green', rejected: 'red' };
  const LBL = { draft: 'Draft', pending_approval: 'Needs approval', sent: 'Sent', accepted: 'Accepted', rejected: 'Rejected' };
  const STONE = { draft: 'grey', pending_approval: 'amber', sent: 'blue', accepted: 'green', rejected: 'red' };
  const bd = (s) => D.status(LBL[s] || s, STONE[s] || 'grey');
  const rate = () => S().rateCard || [];
  const prodOf = (l) => D.by(S().products, l.productId) || {};
  const rule = (l) => { const c = prodOf(l).category; return rate().find((r) => r.category === c) || rate().find((r) => /default|all/i.test(r.category)) || { minMarginPct: 10, maxDiscPct: 10, approvalAbove: 500000 }; };
  const net = (l) => (l.qty || 0) * (l.price || 0) * (1 - (l.discPct || 0) / 100);
  const cost = (l) => (l.qty || 0) * (prodOf(l).cost || (prodOf(l).price || l.price || 0) * 0.78);
  function calc(q) {
    q.total = Math.round(q.lines.reduce((a, l) => a + net(l), 0)); const c = q.lines.reduce((a, l) => a + cost(l), 0);
    q.marginPct = q.total ? Math.round(((q.total - c) / q.total) * 1000) / 10 : 0; return q;
  }
  function flags(q) {
    const f = []; q.lines.forEach((l) => { const r = rule(l); if ((l.discPct || 0) > r.maxDiscPct) f.push(`${l.name}: discount ${l.discPct}% exceeds ${r.maxDiscPct}% limit`); });
    const mn = Math.max(0, ...q.lines.map((l) => rule(l).minMarginPct)); if (q.lines.length && q.marginPct < Math.min(...q.lines.map((l) => rule(l).minMarginPct))) f.push(`Margin ${q.marginPct}% is below the ${Math.min(...q.lines.map((l) => rule(l).minMarginPct))}% floor`);
    const ab = Math.min(...q.lines.map((l) => rule(l).approvalAbove), Infinity); if (isFinite(ab) && q.total > ab) f.push(`Value ${D.fmt.inr(q.total)} is above ${D.fmt.inrc(ab)} approval threshold`);
    return f;
  }
  const hasLinks = (q) => !!(S().rfqs && q.rfqId);
  const mdot = (m, floor = 12) => `<span class="mdot" style="background:${m >= floor + 6 ? 'var(--success)' : m >= floor ? 'var(--warning)' : 'var(--destructive)'}"></span>`;

  /* ── list pages ── */
  function stats() {
    const Q = quotes(); const sum = (f) => Q.filter(f).reduce((a, q) => a + q.total, 0);
    const open = Q.filter((q) => ['draft', 'sent', 'pending_approval'].includes(q.status)); const acc = Q.filter((q) => q.status === 'accepted'); const dec = Q.filter((q) => ['accepted', 'rejected'].includes(q.status)).length;
    return `<div class="grid g4 stagger" style="margin-bottom:16px">${D.statCard('Open quotes', cn(open.length, 'q1'), D.fmt.inrc(sum((q) => ['draft', 'sent', 'pending_approval'].includes(q.status))) + ' in play', 'receipt')}${D.statCard('Awaiting approval', cn(Q.filter((q) => q.status === 'pending_approval').length, 'q2'), 'Needs a manager', 'shield')}${D.statCard('Accepted', cn(sum((q) => q.status === 'accepted'), 'q3', 'inrc'), acc.length + ' quotes', 'check')}${D.statCard('Win rate', cn((acc.length / Math.max(1, dec)) * 100, 'q4', 'pct'), 'accepted ÷ decided', 'chart')}</div>`;
  }
  D.page('/quotes/all', {
    title: 'Quotes', crumb: 'All quotes',
    render() {
      const u = ui(); let L = quotes().slice(); const cnt = (s) => quotes().filter((q) => q.status === s).length;
      if (u.f !== 'all') L = L.filter((q) => q.status === u.f);
      if (u.q) L = L.filter((q) => (q.no + party(q.partyId).name).toLowerCase().includes(u.q.toLowerCase()));
      return `<div class="page wide">${D.header('Quotes', 'Everything you have quoted, from draft to accepted.', `<a class="btn outline" href="#/quotes/approvals">${I('shield')} Approvals${cnt('pending_approval') ? ` <span class="badge amber">${cnt('pending_approval')}</span>` : ''}</a><button class="btn" data-act="qt-new">${I('plus')} New quote</button>`)}${stats()}
      <div class="toolbar">${D.seg([{ key: 'all', label: 'All', count: quotes().length }, ...Object.keys(LBL).map((k) => ({ key: k, label: LBL[k], count: cnt(k) }))], u.f, 'qt-f')}<div class="row gap12 right">${D.searchBox('qt-q', 'Search quote or party…', u.q)}</div></div>
      ${D.table([{ label: 'Quote', render: (q) => `<span class="b">${esc(q.no)}</span>` }, { label: 'Party', render: (q) => esc(party(q.partyId).name) }, { label: 'Status', render: (q) => bd(q.status) }, { label: 'Total', num: 1, render: (q) => D.fmt.inr(q.total) }, { label: 'Margin', num: 1, render: (q) => `${mdot(q.marginPct)} ${q.marginPct ?? '—'}%` }, { label: 'Valid till', render: (q) => D.fmt.date(q.validTill) }, { label: 'Created', render: (q) => `<span class="muted">${D.fmt.date(q.createdAt)}</span>` }], L, { go: (q) => '/quotes/' + q.id, pageSize: 50, empty: 'No quotes in this view.' })}</div>`;
    },
  });
  D.page('/quotes/approvals', {
    title: 'Quote approvals', crumb: 'Approvals',
    render() {
      const P = quotes().filter((q) => q.status === 'pending_approval'), done = quotes().filter((q) => q.decision).slice(0, 6);
      return `<div class="page">${D.header('Approvals', 'Quotes that broke a margin, discount or value rule wait here for a manager.', `<a class="btn outline" href="#/quotes/rate-card">${I('tag')} Rate card</a>`)}
      ${P.length ? `<div class="col" style="gap:12px">${P.map((q) => { const f = flags(q); return `<div class="card pad qt-ap" data-rid="${q.id}"><div class="row">${D.avatar(party(q.partyId).name, 'lg')}<div class="grow"><a class="b" style="font-size:15px" href="#/quotes/${q.id}">${esc(q.no)}</a> <span class="muted">· ${esc(party(q.partyId).name)}</span><div class="xs muted">Requested ${D.fmt.dt(q.createdAt)} · ${q.lines.length} lines</div></div><div style="text-align:right"><div class="b mono" style="font-size:16px">${D.fmt.inr(q.total)}</div><div class="xs">${mdot(q.marginPct)} margin ${q.marginPct}%</div></div></div>
        ${f.length ? `<div class="col" style="gap:4px;margin:10px 0">${f.map((x) => `<div class="sm row" style="color:var(--warning-ink)">${I('alert')}${esc(x)}</div>`).join('')}</div>` : '<div class="xs muted" style="margin:8px 0">Manually sent for approval.</div>'}
        <div class="row"><button class="btn" data-act="qt-approve" data-arg="${q.id}">${I('check')} Approve & send</button><button class="btn outline" data-act="qt-reject" data-arg="${q.id}">${I('x')} Reject</button><a class="btn ghost" href="#/quotes/${q.id}">Review lines</a></div></div>`; }).join('')}</div>` : `<div class="card"><div class="empty">${I('check')}<h3 style="margin-top:8px">All clear</h3><p>No quotes are waiting for approval.</p></div></div>`}
      ${done.length ? `<h3 style="margin:22px 0 8px">Recently decided</h3>${D.table([{ label: 'Quote', render: (q) => `<b>${esc(q.no)}</b>` }, { label: 'Party', render: (q) => esc(party(q.partyId).name) }, { label: 'Decision', render: (q) => D.status(q.decision.verdict, q.decision.verdict === 'Approved' ? 'green' : 'red') }, { label: 'By', render: (q) => esc(uname(q.decision.by)) }, { label: 'Note', render: (q) => `<span class="muted">${esc(q.decision.note || '')}</span>` }], done, { go: (q) => '/quotes/' + q.id })}` : ''}</div>`;
    },
  });

  /* ── detail ── */
  const totals = (q) => `<dl class="kv" style="grid-template-columns:1fr auto"><dt>Subtotal</dt><dd class="mono" style="text-align:right">${D.fmt.inr(q.total)}</dd><dt>GST (18%)</dt><dd class="mono" style="text-align:right">${D.fmt.inr(q.total * 0.18)}</dd><dt class="b" style="color:var(--foreground)">Grand total</dt><dd class="mono b" style="text-align:right">${D.fmt.inr(q.total * 1.18)}</dd></dl><div class="sep"></div><div class="row sm"><span class="grow">Margin</span><span class="b mono">${mdot(q.marginPct)} ${q.marginPct}%</span></div>`;
  const detailDef = {
    title: 'Quote', crumb: (p) => (D.by(S().quotes, p.id) || {}).no || p.id,
    render({ params }) {
      const q = D.by(quotes(), params.id); if (!q) return `<div class="page"><div class="empty"><h3>Quote not found</h3><a class="btn outline" href="#/quotes/all">All quotes</a></div></div>`;
      const ed = q.status === 'draft' || q.status === 'rejected', f = flags(q), p = party(q.partyId);
      const acts = q.status === 'draft' || q.status === 'rejected' ? (f.length ? `<button class="btn" data-act="qt-request" data-arg="${q.id}">${I('shield')} Request approval</button>` : `<button class="btn" data-act="qt-send" data-arg="${q.id}">${I('send')} Send to customer</button>`) : q.status === 'pending_approval' ? `<button class="btn outline" data-act="qt-reject" data-arg="${q.id}">Reject</button><button class="btn" data-act="qt-approve" data-arg="${q.id}">${I('check')} Approve & send</button>` : q.status === 'sent' ? `<button class="btn outline" data-act="qt-copy" data-arg="${q.id}">${I('link')} Copy link</button><button class="btn" data-act="qt-accept" data-arg="${q.id}">${I('check')} Mark accepted</button>` : q.status === 'accepted' ? (q.orderId ? `<a class="btn" href="#/orders/${q.orderId}">${I('clipboard')} Open order</a>` : `<button class="btn" data-act="qt-order" data-arg="${q.id}">${I('clipboard')} Create order</button>`) : '';
      return `<div class="page" style="max-width:1180px"><div class="row" style="margin-bottom:6px"><a class="btn ghost sm" href="#/quotes/all">${I('arrowL')} Quotes</a></div>
      ${D.header(`${esc(q.no)} ${bd(q.status)}`, `${esc(p.name)} · created ${D.fmt.date(q.createdAt)}`, `<a class="btn outline" href="#/q/${q.id}" >${I('eye')} Customer view</a>${acts}`)}
      ${f.length && ['draft', 'rejected', 'pending_approval'].includes(q.status) ? `<div class="card pad" style="background:var(--warning-tint);border-color:#fde68a;margin-bottom:14px"><div class="b sm" style="color:var(--warning-ink);margin-bottom:4px">${I('alert')} Needs approval before sending</div>${f.map((x) => `<div class="sm" style="color:var(--warning-ink)">• ${esc(x)}</div>`).join('')}</div>` : ''}
      ${q.rejectReason ? `<div class="card pad" style="background:var(--destructive-tint);margin-bottom:14px"><div class="sm"><b>Rejected:</b> ${esc(q.rejectReason)}</div></div>` : ''}
      <div class="qt-grid"><div class="card"><div class="card-h"><h3 class="grow">Line items</h3>${ed ? `<button class="btn outline sm" data-act="qt-addline" data-arg="${q.id}">${I('plus')} Add line</button>` : ''}</div>
        <table class="tbl"><thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate (₹)</th><th class="num">Disc %</th><th class="num">Amount</th><th></th></tr></thead><tbody>${q.lines.map((l, i) => `<tr><td class="muted">${i + 1}</td><td><div class="b">${esc(l.name)}</div><div class="xs muted">${esc(prodOf(l).sku || '')} · ${esc(l.unit || '')}</div></td>${['qty', 'price', 'discPct'].map((k) => `<td class="num">${ed ? `<input class="input qt-in" type="number" min="0" value="${l[k] ?? 0}" data-qline="${q.id}:${i}:${k}">` : (k === 'price' ? D.fmt.inr(l[k]) : l[k] ?? 0)}</td>`).join('')}<td class="num b" id="qa-${i}">${D.fmt.inr(net(l))}</td><td>${ed ? `<button class="btn ghost icon sm" data-act="qt-rmline" data-arg="${q.id}:${i}">${I('x')}</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">No lines yet — add an item.</div></td></tr>'}</tbody></table></div>
      <div class="col"><div class="card pad" id="qt-totals">${totals(q)}</div>
        <div class="card pad col"><h3>Terms</h3>${D.field('Valid till', 'validTill', { type: 'date', value: (q.validTill || '').slice(0, 10) }).replace('<input', `<input data-qfield="${q.id}:validTill" ${ed ? '' : 'disabled'}`)}${`<div class="field"><label>Payment & delivery</label><textarea class="textarea" rows="4" data-qfield="${q.id}:terms" ${ed ? '' : 'disabled'}>${esc(q.terms || '')}</textarea></div>`}</div>
        <div class="card pad"><h3 style="margin-bottom:8px">Linked</h3><div class="col" style="gap:6px">${q.rfqId ? `<a class="btn outline sm" href="#/orders/rfqs/${q.rfqId}">${I('sheet')} RFQ</a>` : ''}${q.leadId ? `<a class="btn outline sm" href="#/leads/${q.leadId}">${I('handshake')} Deal</a>` : ''}<a class="btn outline sm" href="#/crm/accounts/${p.id}">${I('users')} ${esc(p.name)}</a>${q.approver ? `<div class="xs muted">Approver: ${esc(uname(q.approver))}</div>` : ''}</div></div></div></div></div>`;
    },
  };
  document.addEventListener('input', (e) => {
    const t = e.target; if (t.dataset && t.dataset.qline) { const [id, i, k] = t.dataset.qline.split(':'); const q = D.by(quotes(), id); if (!q) return; q.lines[+i][k] = Math.max(0, +t.value || 0); calc(q); const a = document.getElementById('qa-' + i); if (a) a.textContent = D.fmt.inr(net(q.lines[+i])); const tt = document.getElementById('qt-totals'); if (tt) tt.innerHTML = totals(q); }
    else if (t.dataset && t.dataset.qfield) { const [id, k] = t.dataset.qfield.split(':'); const q = D.by(quotes(), id); if (q) q[k] = t.value; }
  });
  document.addEventListener('change', (e) => { if (e.target.dataset && e.target.dataset.qline) D.render(); });

  /* ── rate card ── */
  D.page('/quotes/rate-card', {
    title: 'Rate card', crumb: 'Rate card',
    render() {
      const R = rate();
      return `<div class="page">${D.header('Rate card', 'Margin floors and discount limits. A quote that breaks a rule is held for approval.', `<button class="btn outline" data-act="qt-rc-add">${I('plus')} Add rule</button><button class="btn" data-act="toast" data-arg="Rate card saved">${I('check')} Save</button>`)}
      <div class="tblwrap"><table class="tbl"><thead><tr><th>Category</th><th class="num">Min margin %</th><th class="num">Max discount %</th><th class="num">Approval above (₹)</th><th></th></tr></thead><tbody>${R.map((r, i) => `<tr><td class="b">${esc(r.category)}</td>${[['minMarginPct'], ['maxDiscPct'], ['approvalAbove']].map(([k]) => `<td class="num"><input class="input qt-in" style="width:${k === 'approvalAbove' ? 120 : 84}px" type="number" value="${r[k]}" data-rc="${i}:${k}"></td>`).join('')}<td><button class="btn ghost icon sm" data-act="qt-rc-del" data-arg="${i}">${I('trash')}</button></td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">No rules yet.</div></td></tr>'}</tbody></table></div>
      <div class="card pad" style="margin-top:14px"><h3>How it works</h3><p class="sm muted" style="margin-top:4px">Anuma checks each quote line against its category rule. Margin below the floor, a discount over the limit, or a total above the approval value sends the quote to <a href="#/quotes/approvals" class="b">Approvals</a> instead of the customer.</p></div></div>`;
    },
  });
  document.addEventListener('input', (e) => { const t = e.target; if (t.dataset && t.dataset.rc) { const [i, k] = t.dataset.rc.split(':'); const r = rate()[+i]; if (r) r[k] = +t.value || 0; } });

  /* ── presentation ── */
  function docHtml(q, pr, hosted) {
    const p = party(q.partyId), co = S().company || { name: 'Demo Merchant User' };
    return `<div class="doc"><div class="dh" style="border-top:5px solid ${pr.brand}">${pr.logo ? `<span class="avatar lg" style="background:${pr.brand};border-radius:10px">${D.initials(co.name)}</span>` : ''}<div class="grow"><div class="b" style="font-size:17px">${esc(co.name)}</div><div class="xs muted">${esc([co.address, co.city].filter(Boolean).join(', '))}${pr.gst && co.gstin ? ' · GSTIN ' + esc(co.gstin) : ''}</div></div><div style="text-align:right"><div class="b" style="font-size:18px;letter-spacing:.02em;color:${pr.brand}">${esc(pr.title)}</div><div class="xs muted">${esc(q.no)} · ${D.fmt.date(q.createdAt)}</div></div></div>
      <div class="db"><div class="row" style="align-items:flex-start;margin-bottom:16px"><div class="grow"><div class="xs muted">Prepared for</div><div class="b">${esc(p.name)}</div><div class="sm muted">${esc(p.city || '')}${pr.gst && p.gstin ? ' · GSTIN ' + esc(p.gstin) : ''}</div></div><div style="text-align:right"><div class="xs muted">Valid till</div><div class="b">${D.fmt.date(q.validTill)}</div></div></div>
      <table><thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${q.lines.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.name)}${l.discPct ? ` <span class="xs muted">(-${l.discPct}%)</span>` : ''}</td><td class="num">${l.qty} ${esc(l.unit || '')}</td><td class="num">${D.fmt.inr(l.price)}</td><td class="num">${D.fmt.inr(net(l))}</td></tr>`).join('')}</tbody></table>
      <div style="margin:14px 0 0 auto;width:260px;font-size:13px"><div class="row"><span class="grow muted">Subtotal</span><span class="mono">${D.fmt.inr(q.total)}</span></div>${pr.gst ? `<div class="row"><span class="grow muted">GST 18%</span><span class="mono">${D.fmt.inr(q.total * 0.18)}</span></div>` : ''}<div class="row b" style="font-size:15px;margin-top:4px"><span class="grow">Total</span><span class="mono">${D.fmt.inr(q.total * (pr.gst ? 1.18 : 1))}</span></div></div>
      ${pr.terms && q.terms ? `<div style="margin-top:18px"><div class="xs muted">Terms</div><div class="sm">${esc(q.terms)}</div></div>` : ''}
      <div class="xs muted" style="margin-top:16px">${esc(pr.footer)}</div>
      ${hosted ? (q.status === 'accepted' ? `<div class="badge green" style="margin-top:16px;height:30px;padding:0 12px">${I('check')} You accepted this quote</div>` : q.status === 'rejected' ? `<div class="badge red" style="margin-top:16px">This quote was declined</div>` : `<div class="row" style="margin-top:20px"><button class="btn" style="background:${pr.brand};border-color:${pr.brand}" data-act="qt-host-accept" data-arg="${q.id}">${I('check')} Accept quote</button><button class="btn outline" data-act="qt-host-changes" data-arg="${q.id}">Request changes</button><button class="btn ghost" data-act="qt-host-decline" data-arg="${q.id}">Decline</button><button class="btn ghost right" data-act="toast" data-arg="Downloading PDF (demo)">${I('download')} PDF</button></div>`) : ''}</div></div>`;
  }
  D.page('/quotes/presentation', {
    title: 'Quote presentation', crumb: 'Presentation',
    render() {
      const pr = ui().pres, q = quotes()[0] || { no: 'QT-0000', partyId: '', lines: [], total: 0, createdAt: NOW, validTill: NOW };
      const sw = (k, l) => `<div class="row"><span class="grow sm">${l}</span>${D.switch(pr[k], 'qt-pres', k)}</div>`;
      return `<div class="page">${D.header('Quote presentation', 'What your customers see when they open a quote link.', `<button class="btn" data-act="toast" data-arg="Presentation saved">${I('check')} Save</button>`)}
      <div class="grid" style="grid-template-columns:300px minmax(0,1fr);align-items:start"><div class="card pad col" style="gap:14px"><div class="field"><label>Document title</label><input class="input" data-pres="title" value="${esc(pr.title)}"></div><div class="field"><label>Brand colour</label><div class="row">${['#171717', '#2563eb', '#0d9488', '#b45309', '#7c3aed'].map((c) => `<button data-act="qt-pres-color" data-arg="${c}" style="width:26px;height:26px;border-radius:50%;background:${c};outline:${pr.brand === c ? '2px solid ' + c : 'none'};outline-offset:2px"></button>`).join('')}</div></div>${sw('logo', 'Show logo')}${sw('gst', 'Show GST breakdown')}${sw('terms', 'Show terms')}${sw('accept', 'Allow online acceptance')}<div class="field"><label>Footer note</label><textarea class="textarea" rows="3" data-pres="footer">${esc(pr.footer)}</textarea></div><a class="btn outline" href="#/q/${q.id}">${I('ext')} Open hosted page</a></div>
      <div>${docHtml(q, pr, false)}</div></div></div>`;
    },
  });
  document.addEventListener('input', (e) => { const k = e.target.dataset && e.target.dataset.pres; if (k) { ui().pres[k] = e.target.value; const prev = document.querySelector('.doc'); if (prev) { const q = quotes()[0]; if (q) prev.outerHTML = docHtml(q, ui().pres, false); } } });
  D.page('/q/:id', {
    title: 'Quote', crumb: 'Customer view',
    render({ params }) { const q = D.by(quotes(), params.id); if (!q) return `<div class="page"><div class="empty"><h3>This quote link has expired</h3></div></div>`; return `<div class="page" style="background:var(--muted);min-height:100%;max-width:none"><div class="row" style="max-width:820px;margin:0 auto 12px"><a class="btn ghost sm" href="#/quotes/${q.id}">${I('arrowL')} Back to admin view</a><span class="badge outline right">Customer-facing page</span></div>${docHtml(q, ui().pres, true)}</div>`; },
  });

  D.page('/quotes/:id', detailDef);

  /* ── actions ── */
  const A = D.act, O = (q) => (S().orders = S().orders || []);
  A('qt-f', (el) => { ui().f = el.dataset.arg; D.render(); });
  D.input('qt-q', (v) => { ui().q = v; D.render(); });
  A('qt-pres', (el) => { const k = el.dataset.arg; ui().pres[k] = !ui().pres[k]; D.render(); });
  A('qt-pres-color', (el) => { ui().pres.brand = el.dataset.arg; D.render(); });
  A('qt-new', () => {
    const ps = S().parties || []; D.modal({ title: 'New quote', body: D.field('Party', 'party', { options: ps.map((p) => p.name) }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create', run: (m) => { const p = ps.find((x) => x.name === D.formData(m).party); const qs = quotes(); const q = { id: D.uid('Q'), no: 'QT-' + (3000 + qs.length + 1), partyId: (p || {}).id, status: 'draft', total: 0, marginPct: 0, validTill: '2026-11-10', createdAt: NOW, terms: '50% advance, balance on delivery. Prices exclusive of GST.', lines: [] }; (S().quotes = qs).unshift(q); D.go('/quotes/' + q.id); } }] });
  });
  A('qt-addline', (el) => {
    const q = D.by(quotes(), el.dataset.arg), P = S().products || [];
    const list = (s) => P.filter((p) => !s || (p.name + p.sku).toLowerCase().includes(s.toLowerCase())).slice(0, 30).map((p) => `<div class="listrow" data-pick="${p.id}"><div class="grow"><div class="sm b">${esc(p.name)}</div><div class="xs muted">${esc(p.sku)} · ${esc(p.category || '')}</div></div><span class="mono sm">${D.fmt.inr(p.price)}</span></div>`).join('') || '<div class="empty">No products.</div>';
    D.modal({ title: 'Add line', body: `<div class="search" style="margin-bottom:10px">${I('search')}<input class="input" style="width:100%" id="qp-q" placeholder="Search products"></div><div id="qp-l" style="max-height:340px;overflow:auto">${list('')}</div>`, onMount(m) { m.querySelector('#qp-q').addEventListener('input', (e) => { m.querySelector('#qp-l').innerHTML = list(e.target.value); }); m.addEventListener('click', (e) => { const r = e.target.closest('[data-pick]'); if (!r) return; const p = P.find((x) => x.id === r.dataset.pick); q.lines.push({ productId: p.id, name: p.name, qty: 1, unit: p.unit, price: p.price, discPct: 0 }); calc(q); D.closeModal(); D.render(); }); } });
  });
  A('qt-rmline', (el) => { const [id, i] = el.dataset.arg.split(':'); const q = D.by(quotes(), id); q.lines.splice(+i, 1); calc(q); D.render(); });
  const setStatus = (q, s) => { q.status = s; q.history = (q.history || []).concat({ at: NOW, status: s }); };
  A('qt-request', (el) => { const q = D.by(quotes(), el.dataset.arg); calc(q); setStatus(q, 'pending_approval'); (S().notifications = S().notifications || []).unshift({ id: D.uid('n'), tab: 'human', from: 'Anuma', subject: `Quote ${q.no} needs approval`, body: flags(q)[0] || 'Sent for manager approval', href: '/quotes/approvals', at: NOW, unread: true }); D.toast('Sent for approval', 'shield'); D.render(); });
  const approveNow = (el) => { const q = D.by(quotes(), el.dataset.arg); q.approver = me().id; q.decision = { verdict: 'Approved', by: me().id, note: '' }; setStatus(q, 'sent'); D.toast(`${q.no} approved and sent to ${party(q.partyId).name}`, 'check'); D.render(); };
  A('qt-approve', (el) => { const c = el.closest && el.closest('.qt-ap'); if (c) { c.classList.add('qt-out'); setTimeout(() => approveNow(el), 260); } else approveNow(el); });
  A('qt-reject', (el) => { const q = D.by(quotes(), el.dataset.arg); D.modal({ title: `Reject ${q.no}`, body: D.field('Reason (shared with the owner)', 'reason', { area: 1, ph: 'e.g. Reduce discount to 8% and resubmit' }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Reject quote', cls: 'danger', run: (m) => { q.rejectReason = D.formData(m).reason || 'No reason given'; q.decision = { verdict: 'Rejected', by: me().id, note: q.rejectReason }; setStatus(q, 'rejected'); D.toast(q.no + ' rejected', 'x'); D.render(); } }] }); });
  A('qt-send', (el) => { const q = D.by(quotes(), el.dataset.arg); calc(q); setStatus(q, 'sent'); const t = (S().threads || []).find((x) => (q.rfqId && x.rfqId === q.rfqId) || x.partyId === q.partyId); if (t) { (t.messages = t.messages || []).push({ id: D.uid('m'), from: me().id, type: 'card', at: NOW, meta: { kind: 'quote', no: q.no, total: q.total, validTill: D.fmt.date(q.validTill), quoteId: q.id } }); t.preview = 'Quote ' + q.no + ' sent'; t.quoteId = q.id; } D.toast(`Quote sent to ${party(q.partyId).name}`, 'send'); D.render(); });
  A('qt-copy', (el) => { const url = location.origin + location.pathname + '#/q/' + el.dataset.arg; try { navigator.clipboard.writeText(url); } catch (e) {} D.toast('Quote link copied', 'link'); });
  A('qt-accept', (el) => accept(D.by(quotes(), el.dataset.arg)));
  function accept(q) { setStatus(q, 'accepted'); const l = (S().leads || []).find((x) => x.id === q.leadId || (q.rfqId && x.rfqId === q.rfqId)); if (l && l.stage !== 'Won') { l.stage = 'Won'; (l.history = l.history || []).push({ at: NOW, text: `Quote ${q.no} accepted — deal won`, by: 'Anuma' }); } const r = q.rfqId && D.by(S().rfqs, q.rfqId); if (r) r.status = 'won'; D.toast(`Quote ${q.no} accepted`, 'check'); D.render(); }
  A('qt-order', (el) => { const q = D.by(quotes(), el.dataset.arg), os = O(q); const o = { id: D.uid('O'), no: 'SO-' + (4000 + os.length + 1), partyId: q.partyId, status: 'confirmed', total: Math.round(q.total * 1.18), placedAt: NOW, channel: 'Quote', payment: 'Pending', lines: q.lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price * (1 - (l.discPct || 0) / 100) })), erp: null, quoteId: q.id }; os.unshift(o); q.orderId = o.id; D.toast('Order ' + o.no + ' created', 'clipboard'); D.go('/orders/' + o.id); });
  A('qt-host-accept', (el) => { accept(D.by(quotes(), el.dataset.arg)); D.toast('Thank you! We’ll confirm dispatch shortly.', 'check'); });
  A('qt-host-decline', (el) => { const q = D.by(quotes(), el.dataset.arg); D.confirm('Decline this quote?', 'The sender will be told you declined.', () => { setStatus(q, 'rejected'); q.rejectReason = 'Declined by customer'; D.render(); }, 'Decline'); });
  A('qt-host-changes', (el) => { const q = D.by(quotes(), el.dataset.arg); D.modal({ title: 'Request changes', body: D.field('What would you like changed?', 'msg', { area: 1, ph: 'e.g. Need a better rate on 500+ units' }), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Send request', run: (m) => { const t = (S().threads || []).find((x) => x.partyId === q.partyId); const msg = D.formData(m).msg || 'Please revise the quote.'; if (t) { (t.messages = t.messages || []).push({ id: D.uid('m'), from: 'customer', type: 'text', text: 'Re ' + q.no + ': ' + msg, at: NOW }); t.preview = msg; t.unread = (t.unread || 0) + 1; } D.toast('Request sent to the seller', 'send'); } }] }); });
  A('qt-rc-add', () => D.modal({ title: 'Add rate rule', body: `<div class="col">${D.field('Category', 'category', { ph: 'e.g. Cables' })}<div class="grid g3">${D.field('Min margin %', 'minMarginPct', { type: 'number', value: 12 })}${D.field('Max discount %', 'maxDiscPct', { type: 'number', value: 8 })}${D.field('Approval above ₹', 'approvalAbove', { type: 'number', value: 500000 })}</div></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add rule', run: (m) => { const f = D.formData(m); if (!f.category.trim()) { D.toast('Name the category', 'info'); return false; } (S().rateCard = rate()).push({ id: D.uid('rc'), category: f.category, minMarginPct: +f.minMarginPct, maxDiscPct: +f.maxDiscPct, approvalAbove: +f.approvalAbove }); D.render(); } }] }));
  A('qt-rc-del', (el) => { rate().splice(+el.dataset.arg, 1); D.render(); });
})();
