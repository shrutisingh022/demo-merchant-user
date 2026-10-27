/* RFQs — list + detail. Port of app-v2/orders/rfqs. */
(function () {
  const { esc, fmt, icon: I } = DM;
  const st = document.createElement('style'); st.dataset.for = 'rfqs';
  st.textContent = `
  .rfq-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}
  @media(max-width:1180px){.rfq-grid{grid-template-columns:1fr}}
  .rfq-src{padding:14px 16px;font-size:13px}
  .rfq-mail{border:1px solid var(--border);border-radius:10px;background:#fff}
  .rfq-mail .h{padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;color:var(--muted-foreground)}
  .rfq-mail .bd{padding:12px 14px;white-space:pre-wrap;font-size:13px}
  .rfq-file{display:flex;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:10px;margin-bottom:10px}
  .rfq-file .ic{width:36px;height:42px;border-radius:6px;background:var(--muted);display:grid;place-items:center}
  .rfq-conf{display:inline-flex;align-items:center;gap:6px;font-size:12px}
  .rfq-conf i{display:block;width:34px;height:5px;border-radius:3px;background:var(--muted);overflow:hidden;position:relative}
  .rfq-conf i b{position:absolute;inset:0 auto 0 0;border-radius:3px}
  .rfq-num{width:78px;height:28px;text-align:right;padding:0 8px}
  .rfq-orig{font-size:12px;color:var(--muted-foreground);max-width:230px}
  .rfq-picker-row{display:flex;gap:10px;align-items:center;padding:8px 10px;border:1px solid var(--border);border-radius:9px;cursor:pointer;margin-bottom:6px}
  .rfq-picker-row:hover{background:var(--muted)}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.rfqs = DM.ui.rfqs || { tab: 'all', q: '', src: 'all', owner: 'all' });
  const STATUS = { new: ['New', 'blue'], review: ['In review', 'amber'], quoted: ['Quoted', 'violet'], won: ['Won', 'green'], lost: ['Lost', 'red'] };
  const SRC = { email: ['mail', 'Email'], whatsapp: ['chat', 'WhatsApp'], pdf: ['file', 'PDF'], excel: ['sheet', 'Excel'], portal: ['globe', 'Portal'] };
  const pn = (id) => (DM.by(DM.S.parties || [], id) || {}).name || '—';
  const un = (id) => { if (id === 'anuma') return 'Anuma'; const u = DM.by(DM.S.users || [], id); return u ? u.name : (id || 'Unassigned'); };
  const total = (r) => (r.lines || []).reduce((a, l) => a + (l.state !== 'unmatched' && l.price ? l.price * (l.qty || 0) : 0), 0);
  const sbadge = (s) => { const [l, t] = STATUS[s] || [s, '']; return DM.badge(l, t, true); };
  const conf = (c, state) => { const col = state === 'matched' ? 'var(--success)' : state === 'review' ? 'var(--warning)' : 'var(--destructive)'; return `<span class="rfq-conf"><i><b style="width:${c || 0}%;background:${col}"></b></i><span class="mono">${c || 0}%</span></span>`; };
  const get = (id) => DM.by(DM.S.rfqs || [], id);
  const refresh = (r) => { r.total = total(r); };

  /* ── list ── */
  function list() {
    const all = DM.S.rfqs || [];
    const q = U.q.toLowerCase();
    let rows = all.filter((r) => (U.tab === 'all' || r.status === U.tab) && (U.src === 'all' || r.source.type === U.src) && (U.owner === 'all' || r.owner === U.owner)
      && (!q || (r.no + ' ' + pn(r.partyId) + ' ' + (r.subject || '')).toLowerCase().includes(q)));
    const cnt = (s) => all.filter((r) => r.status === s).length;
    const wonVal = all.filter((r) => r.status === 'won').reduce((a, r) => a + (r.total || 0), 0);
    const open = all.filter((r) => ['new', 'review'].includes(r.status));
    const owners = [...new Set(all.map((r) => r.owner).filter(Boolean))];
    const cols = [
      { label: 'RFQ', render: (r) => `<span class="b">${esc(r.no)}</span>` },
      { label: 'Party', render: (r) => `<div class="row">${DM.avatar(pn(r.partyId), 'sm')}<span class="trunc">${esc(pn(r.partyId))}</span></div>` },
      { label: 'Subject', render: (r) => `<span class="trunc" style="max-width:240px;display:block">${esc(r.subject || '')}</span>` },
      { label: 'Source', render: (r) => { const s = SRC[r.source.type] || ['file', r.source.type]; return `<span class="badge outline">${I(s[0])}${s[1]}</span>`; } },
      { label: 'Lines', render: (r) => { const m = r.lines.filter((l) => l.state === 'matched').length; return `<span class="mono">${m}/${r.lines.length}</span> ${m < r.lines.length ? '<span class="badge amber">needs review</span>' : ''}`; } },
      { label: 'Value', num: true, render: (r) => fmt.inr(r.total || total(r)) },
      { label: 'Due', render: (r) => { const late = new Date(r.due) < new Date('2026-10-27') && ['new', 'review'].includes(r.status); return `<span class="${late ? 'down' : ''}">${fmt.date(r.due)}</span>`; } },
      { label: 'Owner', render: (r) => esc(un(r.owner)) },
      { label: 'Status', render: (r) => sbadge(r.status) },
    ];
    return `<div class="page">
      ${DM.header('RFQs', 'Inbound requests for quotation, parsed and matched to your catalogue.', `${DM.btn('Import', 'rfq-import', { cls: 'outline', icon: 'upload' })}${DM.btn('New RFQ', 'rfq-new', { icon: 'plus' })}`)}
      <div class="grid g4" style="margin-bottom:16px">
        ${DM.stat('Open RFQs', open.length, `${cnt('new')} new · ${cnt('review')} in review`, { icon: 'sheet' })}
        ${DM.stat('Awaiting quote', fmt.inrc(open.reduce((a, r) => a + (r.total || total(r)), 0)), 'est. value', { icon: 'clock' })}
        ${DM.stat('Quoted', cnt('quoted'), 'sent to customer', { icon: 'send' })}
        ${DM.stat('Won', fmt.inrc(wonVal), `${cnt('won')} RFQs`, { icon: 'check', tone: 'up' })}
      </div>
      ${DM.tabs([{ key: 'all', label: 'All', count: all.length }, ...Object.entries(STATUS).map(([k, v]) => ({ key: k, label: v[0], count: cnt(k) }))], U.tab, 'rfq-tab')}
      <div class="row wrap" style="margin-bottom:12px">
        ${DM.searchBox('rfq-q', 'Search RFQs…', U.q)}
        <select class="select" style="width:150px" data-change="rfq-src"><option value="all">All sources</option>${Object.entries(SRC).map(([k, v]) => `<option value="${k}" ${U.src === k ? 'selected' : ''}>${v[1]}</option>`).join('')}</select>
        <select class="select" style="width:160px" data-change="rfq-owner"><option value="all">All owners</option>${owners.map((o) => `<option value="${o}" ${U.owner === o ? 'selected' : ''}>${esc(un(o))}</option>`).join('')}</select>
        <span class="muted sm right">${rows.length} of ${all.length}</span>
      </div>
      ${DM.table(cols, rows, { go: (r) => '/orders/rfqs/' + r.id, empty: 'No RFQs match these filters.' })}
    </div>`;
  }
  DM.act('rfq-tab', (el) => { U.tab = el.dataset.arg; DM.render(); });
  DM.input('rfq-q', (v) => { U.q = v; DM.render(); });
  DM.input('rfq-src', (v) => { U.src = v; DM.render(); });
  DM.input('rfq-owner', (v) => { U.owner = v; DM.render(); });
  DM.act('rfq-import', () => DM.modal({
    title: 'Import RFQ', body: `<div class="col"><div class="rfq-file"><div class="ic">${I('upload')}</div><div class="grow"><div class="b sm">Drop a PDF, Excel or email (.eml)</div><div class="xs muted">Anuma reads the lines and matches them to your catalogue.</div></div></div>${DM.field('Or paste the request text', 'text', { area: true, rows: 5, ph: '10 x MCB 32A DP\n5 x 2.5 sqmm wire 90m …' })}</div>`,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Parse & create', run: (m) => { const t = DM.formData(m).text.trim(); if (!t) { DM.toast('Paste some text or pick a file first', 'alert'); return false; } createFromText(t); } }],
  }));
  function nextNo() { const n = (DM.S.rfqs || []).map((r) => parseInt(String(r.no).replace(/\D/g, ''), 10) || 0); return Math.max(1000, ...n) + 1; }
  function createFromText(t) {
    const party = (DM.S.parties || [])[0]; const prods = DM.S.products || [];
    const lines = t.split('\n').filter((x) => x.trim()).map((x, i) => {
      const m = x.match(/(\d+)/); const words = x.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      let best = null, bs = 0; prods.forEach((p) => { const s = words.filter((w) => p.name.toLowerCase().includes(w)).length; if (s > bs) { bs = s; best = p; } });
      const ok = best && bs >= 2; return { n: i + 1, text: x.trim(), productId: ok ? best.id : null, name: ok ? best.name : '', qty: m ? +m[1] : 1, unit: ok ? best.unit : 'pcs', price: ok ? best.price : 0, confidence: ok ? Math.min(96, 55 + bs * 14) : 0, state: ok ? (bs >= 3 ? 'matched' : 'review') : 'unmatched' };
    });
    const r = { id: 'RFQ-' + nextNo(), no: 'RFQ-' + nextNo(), partyId: party && party.id, source: { type: 'email' }, receivedAt: '2026-10-27T11:00:00', due: '2026-10-30', status: 'review', owner: 'anuma', subject: 'Pasted request', notes: t, total: 0, lines };
    refresh(r); DM.S.rfqs.unshift(r); DM.toast('RFQ created with ' + lines.length + ' lines'); DM.go('/orders/rfqs/' + r.id);
  }
  DM.act('rfq-new', () => DM.modal({
    title: 'New RFQ', body: `<div class="col">${DM.field('Customer', 'party', { options: (DM.S.parties || []).map((p) => p.name) })}${DM.field('Subject', 'subject', { ph: 'e.g. Site wiring — Tower B' })}${DM.field('Due date', 'due', { type: 'date', value: '2026-10-31' })}${DM.field('Request text (one line per item)', 'text', { area: true, rows: 5 })}</div>`,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create RFQ', run: (m) => { const f = DM.formData(m); const p = (DM.S.parties || []).find((x) => x.name === f.party); createFromText(f.text || 'Item 1'); const r = DM.S.rfqs[0]; if (p) r.partyId = p.id; r.subject = f.subject || r.subject; r.due = f.due || r.due; DM.render(); } }],
  }));

  /* ── detail ── */
  function sourcePreview(r) {
    const th = r.threadId && DM.by(DM.S.threads || [], r.threadId);
    const t = r.source.type;
    if (t === 'whatsapp') {
      const msgs = th ? th.messages.slice(-5) : [{ from: 'customer', text: r.notes || r.lines.map((l) => l.text).join('\n'), at: fmt.dt(r.receivedAt) }];
      return `<div class="chatbg" style="border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;max-height:260px;overflow:auto">${msgs.map((m) => `<div class="bub ${m.from !== 'customer' ? 'out' : ''}">${esc(m.text || '[' + m.type + ']')}<span class="tm">${esc(m.at)}</span></div>`).join('')}</div>`;
    }
    if (t === 'pdf' || t === 'excel') {
      return `<div class="rfq-file"><div class="ic">${I(t === 'pdf' ? 'file' : 'sheet')}</div><div class="grow"><div class="b sm">${esc(r.source.file || (t === 'pdf' ? 'RFQ.pdf' : 'RFQ.xlsx'))}</div><div class="xs muted">${r.lines.length} line items detected · received ${fmt.dt(r.receivedAt)}</div></div><button class="btn outline sm" data-act="toast" data-arg="Preview opened (demo)">${I('eye')} Open</button></div>
      <div class="tblwrap"><table class="tbl"><tbody>${r.lines.slice(0, 6).map((l) => `<tr><td class="muted" style="width:34px">${l.n}</td><td>${esc(l.text)}</td></tr>`).join('')}</tbody></table></div>`;
    }
    return `<div class="rfq-mail"><div class="h"><div><b style="color:var(--foreground)">${esc(r.subject || '')}</b></div><div>From ${esc(pn(r.partyId))} · ${fmt.dt(r.receivedAt)}</div></div><div class="bd">${esc(r.notes || r.lines.map((l) => `${l.qty} × ${l.text}`).join('\n'))}</div></div>`;
  }
  function detail({ params }) {
    const r = get(params.id);
    if (!r) return `<div class="page"><div class="empty"><h3>RFQ not found</h3><p style="margin-top:12px"><a class="btn outline" href="#/orders/rfqs">Back to RFQs</a></p></div></div>`;
    const party = DM.by(DM.S.parties || [], r.partyId) || {};
    const unresolved = r.lines.filter((l) => l.state !== 'matched').length;
    const q = r.quoteId && DM.by(DM.S.quotes || [], r.quoteId);
    const canQuote = ['new', 'review'].includes(r.status);
    const acts = `${r.threadId ? DM.btn('Open thread', '', { cls: 'outline', go: '/inbox/threads?case=' + r.threadId, icon: 'chat' }) : ''}
      ${q ? DM.btn('View quote', '', { cls: 'outline', go: '/quotes/' + q.id, icon: 'receipt' }) : ''}
      ${r.status === 'quoted' ? `${DM.btn('Mark lost', 'rfq-status', { cls: 'outline', arg: r.id + '|lost' })}${DM.btn('Mark won', 'rfq-status', { arg: r.id + '|won', icon: 'check' })}` : ''}
      ${canQuote ? DM.btn('Create quote', 'rfq-quote', { arg: r.id, icon: 'receipt', attrs: unresolved ? 'title="Resolve unmatched lines for best results"' : '' }) : ''}`;
    const cols = r.lines.map((l, i) => `<tr class="${l.state !== 'matched' ? '' : ''}">
      <td class="muted">${l.n}</td>
      <td><div class="rfq-orig">${esc(l.text)}</div></td>
      <td>${l.productId ? `<div class="b sm">${esc(l.name)}</div><div class="xs muted">${esc((DM.by(DM.S.products || [], l.productId) || {}).sku || '')}</div>` : `<span class="badge red">No match</span>`}</td>
      <td>${conf(l.confidence, l.state)}</td>
      <td class="num"><input class="input rfq-num mono" type="number" min="0" value="${l.qty}" data-change="rfq-qty" data-r="${r.id}" data-i="${i}" ${['won', 'lost'].includes(r.status) ? 'disabled' : ''}> <span class="xs muted">${esc(l.unit || '')}</span></td>
      <td class="num"><input class="input rfq-num mono" type="number" min="0" value="${l.price || 0}" data-change="rfq-price" data-r="${r.id}" data-i="${i}" ${['won', 'lost'].includes(r.status) ? 'disabled' : ''}></td>
      <td class="num mono">${l.state === 'unmatched' ? '—' : fmt.inr((l.price || 0) * (l.qty || 0))}</td>
      <td style="white-space:nowrap">${l.state !== 'matched' ? DM.btn(l.productId ? 'Confirm' : 'Match', 'rfq-resolve', { cls: 'outline sm', arg: r.id + '|' + i }) : `<span class="badge green">${I('check')}Matched</span>`}</td></tr>`).join('');
    return `<div class="page">
      <div class="row sm muted" style="margin-bottom:8px"><a href="#/orders/rfqs" class="row">${I('chevL')} RFQs</a></div>
      ${DM.header(`${esc(r.no)} ${sbadge(r.status)}`, `${esc(pn(r.partyId))} · ${esc(r.subject || '')}`, acts)}
      <div class="rfq-grid"><div class="col" style="gap:16px">
        <div class="card"><div class="card-h"><h3 class="grow">Original request</h3><span class="badge outline">${I((SRC[r.source.type] || ['file'])[0])}${(SRC[r.source.type] || [0, r.source.type])[1]}</span></div><div class="rfq-src">${sourcePreview(r)}</div></div>
        <div class="card"><div class="card-h"><h3 class="grow">Line items</h3>${unresolved ? DM.badge(unresolved + ' need attention', 'amber', true) : DM.badge('All lines matched', 'green', true)}${DM.btn('Add line', 'rfq-addline', { cls: 'outline sm', arg: r.id, icon: 'plus' })}</div>
          <div style="overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>As written</th><th>Matched product</th><th>Confidence</th><th class="num">Qty</th><th class="num">Rate (₹)</th><th class="num">Amount</th><th></th></tr></thead><tbody>${cols}</tbody></table></div>
          <div class="row" style="padding:12px 16px;border-top:1px solid var(--border)"><span class="muted sm">${r.lines.length} lines</span><span class="right b mono" style="font-size:15px">Total ${fmt.inr(r.total)}</span></div></div>
      </div>
      <div class="col" style="gap:16px">
        <div class="card pad"><h3 style="margin-bottom:10px">Details</h3><dl class="kv">
          <dt>Customer</dt><dd><a href="#/crm/accounts/${esc(r.partyId)}" class="b">${esc(pn(r.partyId))}</a></dd>
          <dt>City</dt><dd>${esc(party.city || '—')}</dd><dt>Received</dt><dd>${fmt.dt(r.receivedAt)}</dd><dt>Due</dt><dd>${fmt.date(r.due)}</dd>
          <dt>Owner</dt><dd>${esc(un(r.owner))}</dd><dt>Credit terms</dt><dd>${esc(party.terms || '—')}</dd></dl></div>
        <div class="card pad"><h3 style="margin-bottom:8px">Status</h3><div class="col" style="gap:6px">${Object.entries(STATUS).map(([k, v]) => `<button class="row sm" style="padding:6px 8px;border-radius:8px;${r.status === k ? 'background:var(--muted);font-weight:600' : ''}" data-act="rfq-status" data-arg="${r.id}|${k}">${r.status === k ? I('check') : '<span style="width:16px"></span>'}${v[0]}</button>`).join('')}</div></div>
        ${q ? `<div class="card pad"><h3 style="margin-bottom:6px">Quote</h3><div class="row"><span class="b">${esc(q.no)}</span>${DM.badge(q.status.replace('_', ' '), q.status === 'sent' ? 'green' : 'amber', true)}</div><div class="muted sm" style="margin:4px 0 10px">${fmt.inr(q.total)} · margin ${q.marginPct}%</div>${DM.btn('Open quote', '', { cls: 'outline sm', go: '/quotes/' + q.id })}</div>` : ''}
      </div></div></div>`;
  }
  const lineOf = (el) => { const r = get(el.dataset.r); return r && [r, r.lines[+el.dataset.i]]; };
  DM.input('rfq-qty', (v, el) => { const [r, l] = lineOf(el); l.qty = Math.max(0, +v); refresh(r); DM.render(); });
  DM.input('rfq-price', (v, el) => { const [r, l] = lineOf(el); l.price = Math.max(0, +v); refresh(r); DM.render(); });
  DM.act('rfq-status', (el) => {
    const [id, s] = el.dataset.arg.split('|'); const r = get(id); if (!r) return;
    const go = () => { r.status = s; DM.toast(`${r.no} marked ${STATUS[s][0].toLowerCase()}`); DM.render(); };
    s === 'lost' ? DM.confirm('Mark RFQ as lost?', `${esc(r.no)} will be closed as lost.`, go, 'Mark lost') : go();
  });
  DM.act('rfq-addline', (el) => { const r = get(el.dataset.arg); r.lines.push({ n: r.lines.length + 1, text: 'New line', productId: null, name: '', qty: 1, unit: 'pcs', price: 0, confidence: 0, state: 'unmatched' }); DM.render(); });
  DM.act('rfq-resolve', (el) => {
    const [id, i] = el.dataset.arg.split('|'); const r = get(id); const l = r.lines[+i];
    if (l.productId) { l.state = 'matched'; l.confidence = Math.max(l.confidence, 90); refresh(r); DM.toast('Line confirmed'); return DM.render(); }
    let query = '';
    const body = () => { const ps = (DM.S.products || []).filter((p) => !query || (p.name + p.sku + p.category).toLowerCase().includes(query)).slice(0, 12); return ps.map((p) => `<div class="rfq-picker-row" data-pick="${p.id}"><span class="avatar sm" style="background:${p.color || '#999'};border-radius:6px"></span><div class="grow"><div class="b sm">${esc(p.name)}</div><div class="xs muted">${esc(p.sku)} · ${esc(p.category || '')}</div></div><span class="mono sm">${fmt.inr(p.price)}</span></div>`).join('') || '<div class="empty">No products found</div>'; };
    DM.modal({ title: `Match “${esc(l.text)}”`, body: `<div class="search" style="margin-bottom:10px">${I('search')}<input class="input" style="width:100%" placeholder="Search catalogue…" id="rfq-pq"></div><div id="rfq-pl">${body()}</div>`, onMount: (m) => {
      const pl = m.querySelector('#rfq-pl'); m.querySelector('#rfq-pq').addEventListener('input', (e) => { query = e.target.value.toLowerCase(); pl.innerHTML = body(); });
      pl.addEventListener('click', (e) => { const row = e.target.closest('[data-pick]'); if (!row) return; const p = DM.by(DM.S.products, row.dataset.pick); Object.assign(l, { productId: p.id, name: p.name, unit: p.unit, price: p.price, confidence: 100, state: 'matched' }); refresh(r); DM.closeModal(); DM.toast('Matched to ' + p.name); DM.render(); });
    } });
  });
  DM.act('rfq-quote', (el) => {
    const r = get(el.dataset.arg); const lines = r.lines.filter((l) => l.productId && l.qty > 0);
    if (!lines.length) return DM.toast('Match at least one line first', 'alert');
    const go = () => {
      const n = (DM.S.quotes || []).length + 1; const sum = lines.reduce((a, l) => a + l.price * l.qty, 0);
      const q = { id: 'Q-' + (DM.uid('').slice(1)), no: 'QT-' + (2000 + n), rfqId: r.id, partyId: r.partyId, status: sum > 150000 ? 'pending_approval' : 'draft', total: sum, marginPct: 18, validTill: '2026-11-10', createdAt: '2026-10-27T12:00:00', terms: 'Net 30 · prices exclusive of GST',
        lines: lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price, discPct: 0 })) };
      (DM.S.quotes = DM.S.quotes || []).unshift(q); r.quoteId = q.id; r.status = 'quoted'; DM.toast(`Quote ${q.no} created`); DM.go('/quotes/' + q.id);
    };
    const un = r.lines.length - lines.length;
    un ? DM.confirm('Some lines are unmatched', `${un} line(s) have no product and will be left out of the quote.`, go, 'Create quote anyway') : go();
  });

  DM.page('/orders/rfqs', { title: 'RFQs', render: list });
  DM.page('/orders/rfqs/:id', { title: 'RFQ', crumb: (p) => p.id, render: detail });
  DM.searchProviders.push((q) => (DM.S.rfqs || []).filter((r) => (r.no + pn(r.partyId) + (r.subject || '')).toLowerCase().includes(q)).slice(0, 5).map((r) => ({ label: r.no + ' · ' + pn(r.partyId), sub: 'RFQ', icon: 'sheet', url: '/orders/rfqs/' + r.id })));
})();
