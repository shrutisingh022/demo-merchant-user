/* Inbox — 3-pane conversation desk (threads · chat · deal panel) + channels view.
   Message conventions (see report): type 'text' | 'image'{meta.swatch,text=caption} | 'voice'{meta.seconds,text=transcript}
   | 'file'{meta.name,meta.size} | 'card'{meta.kind:'read'|'match'|'review'|'summary'|'quote'|'choice', ...}. */
(function () {
  const D = window.DM, I = D.icon, esc = D.esc;
  const st = document.createElement('style'); st.dataset.for = 'inbox';
  st.textContent = `
  .ib{display:grid;grid-template-columns:340px minmax(0,1fr) 330px;height:100%;min-height:0}
  .ib.nopanel{grid-template-columns:340px minmax(0,1fr)}
  .ib .col-l,.ib .col-r{display:flex;flex-direction:column;min-height:0;min-width:0}
  .ib .col-l{border-right:1px solid var(--border)}.ib .col-m{display:flex;flex-direction:column;min-height:0;min-width:0}
  .ib .col-p{border-left:1px solid var(--border);overflow:auto;background:#fff}
  .ib-lh{padding:12px 14px 0}.ib-lh h2{font-size:16px;font-weight:600}
  .ib-tabs{display:flex;gap:2px;padding:0 10px;border-bottom:1px solid var(--border);overflow:auto}
  .ib-list{flex:1;overflow:auto;min-height:0}
  .ib-row .ch{width:15px;height:15px;border-radius:50%;display:inline-grid;place-items:center;color:#fff;flex:none}
  .ib-row .ch svg{width:9px;height:9px}
  .ib-head{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border);background:#fff}
  .ib-owner{display:flex;align-items:center;gap:8px;padding:8px 16px;background:var(--owner-muted);border-bottom:1px solid var(--owner-border);color:var(--owner);font-size:13px}
  .ib-stream{flex:1;overflow:auto;padding:14px 18px;display:flex;flex-direction:column;gap:6px;min-height:0}
  .ib-stream>*{flex-shrink:0}.ib-stream .snd{font-size:11px;color:var(--muted-foreground);margin:6px 2px 0}
  .ib-stream .snd.out{align-self:flex-end}
  .ib-day{align-self:center;font-size:11px;background:rgba(255,255,255,.75);border-radius:6px;padding:2px 9px;color:var(--muted-foreground);margin:4px 0}
  .ib-comp{border-top:1px solid var(--border);background:#fff;padding:10px 14px}
  .ib-comp textarea{width:100%;border:1px solid var(--input);border-radius:10px;padding:9px 12px;resize:none;font-size:13.5px;outline:none;min-height:42px;max-height:120px}
  .ib-comp textarea:focus{border-color:var(--ring);box-shadow:0 0 0 3px rgba(0,0,0,.06)}
  .tile{border-radius:8px;border:1px solid rgba(0,0,0,.08);background-size:cover;background-position:center}
  .wave{display:flex;align-items:center;gap:2px;height:26px}.wave i{width:2.5px;background:#8696a0;border-radius:2px;display:block}
  .ibc{align-self:flex-end;width:min(560px,92%);border:1px solid var(--border);border-radius:10px;background:#fff;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.05)}
  .ibc.l{align-self:flex-start}
  .ibc .h{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);background:#fafafa;font-size:13px;font-weight:500}
  .ibc.done{border-color:var(--info-border)}.ibc.done .h{background:var(--info-tint);color:#1e40af}
  .ibc .b2{padding:10px 12px}
  .ibc .f{display:flex;gap:8px;align-items:center;padding:9px 12px;border-top:1px solid var(--border)}
  .rdgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 14px;font-size:12.5px}.rdgrid span{color:var(--muted-foreground);display:block;font-size:11px}
  .dp-sec{padding:14px 16px;border-bottom:1px solid var(--border)}.dp-sec h4{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted-foreground);font-weight:600;margin-bottom:8px;display:flex;align-items:center}
  .dl{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px dashed var(--border);font-size:12.5px}.dl:last-child{border-bottom:0}
  .stp{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:6px;overflow:hidden}.stp button{width:20px;height:22px;font-size:13px}.stp button:hover{background:var(--muted)}.stp span{min-width:24px;text-align:center;font-size:12px}
  .chcard{display:flex;gap:14px;align-items:flex-start;padding:16px}
  .typing{align-self:flex-start;background:#fff;border-radius:10px;padding:8px 12px;display:flex;gap:3px}.typing i{width:6px;height:6px;border-radius:50%;background:#a3a3a3;animation:tp 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}@keyframes tp{50%{opacity:.25;transform:translateY(-2px)}}
  @media(max-width:1280px){.ib{grid-template-columns:300px minmax(0,1fr)}.ib .col-p{display:none}.ib.showpanel .col-p{display:block;position:absolute;right:0;top:0;bottom:0;width:330px;box-shadow:-8px 0 30px rgba(0,0,0,.12);z-index:5}}
  `;
  document.head.appendChild(st);

  const S = () => D.S;
  const ui = () => (D.ui.inbox = D.ui.inbox || { tab: 'all', q: '', ch: 'all', draft: {}, auto: false, panel: innerWidth > 1500, typing: null, voiceOpen: {}, sort: 'recent' });
  const CH = { whatsapp: ['chat', '#1daa68', 'WhatsApp'], email: ['mail', '#2563eb', 'Email'], indiamart: ['tag', '#e0642b', 'IndiaMART'], web: ['globe', '#7c3aed', 'Web form'], telegram: ['send', '#0ea5e9', 'Telegram'] };
  const party = (id) => D.by(S().parties, id) || { id, name: id || 'Unknown party' };
  const contact = (id) => D.by(S().contacts, id);
  const userName = (id) => (id === 'anuma' ? 'Anuma' : id === 'me' ? 'You' : (D.by(S().users, id) || {}).name || id);
  const me = () => ((S().users || [])[0] || { id: 'me', name: 'You' });
  const tm = (x) => { if (!x) return ''; if (/^\d{1,2}:\d{2}/.test(x) && !/\d{4}-/.test(x)) return x; const d = new Date(x); return isNaN(d) ? String(x) : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }); };
  const dtShort = (x) => { if (!x) return ''; if (/^\d{1,2}:\d{2}/.test(x) && !/\d{4}-/.test(x)) return x; const d = new Date(x); if (isNaN(d)) return String(x); return d.toLocaleString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + tm(x); };
  const nowIso = () => { const b = new Date('2026-10-27T11:00:00+05:30'); b.setMinutes(b.getMinutes() + (ui().tick = (ui().tick || 0) + 1)); return b.toISOString(); };
  const floor = () => (S().policy && S().policy.confidenceFloor) || 85;
  const bgOf = (s) => (!s ? '#e5e5e5' : /^(data:|url\(|http|assets)/.test(s) ? `url("${String(s).replace(/^url\(|\)$/g, '')}") center/cover` : s);
  const threads = () => S().threads || [];
  const sel = (q) => { const id = (q && q.get('case')) || ui().sel; return threads().find((t) => t.id === id) || null; };
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

  /* ── thread list ── */
  function filtered() {
    const u = ui(); let L = threads().slice();
    if (u.tab === 'needs') L = L.filter((t) => t.owner !== 'anuma' && t.status !== 'closed');
    else if (u.tab === 'anuma') L = L.filter((t) => t.owner === 'anuma' && t.status !== 'closed');
    else if (u.tab === 'unread') L = L.filter((t) => t.unread);
    else if (u.tab === 'closed') L = L.filter((t) => t.status === 'closed');
    else if (u.tab === 'hold') L = L.filter((t) => t.status === 'hold');
    if (u.ch !== 'all') L = L.filter((t) => t.channel === u.ch);
    if (u.q) { const q = u.q.toLowerCase(); L = L.filter((t) => (party(t.partyId).name + ' ' + (t.preview || '') + ' ' + (t.subject || '')).toLowerCase().includes(q)); }
    if (u.sort === 'unread') L.sort((a, b) => (b.unread || 0) - (a.unread || 0));
    else if (u.sort === 'recent' && L.every((t) => !isNaN(Date.parse(t.lastAt)))) L.sort((a, b) => Date.parse(b.lastAt) - Date.parse(a.lastAt));
    return L;
  }
  function row(t, cur) {
    const p = party(t.partyId), c = CH[t.channel] || CH.web;
    const mine = t.owner !== 'anuma';
    return `<div class="listrow ib-row ${cur && cur.id === t.id ? 'on' : ''}" data-act="ib-open" data-arg="${t.id}">
      <div style="position:relative">${D.avatar(p.name)}<span class="ch" style="position:absolute;right:-3px;bottom:-3px;background:${c[1]};border:1.5px solid #fff">${I(c[0])}</span></div>
      <div class="grow"><div class="row"><span class="b trunc grow" style="font-size:13.5px">${esc(p.name)}</span><span class="xs muted">${esc(dtShort(t.lastAt))}</span></div>
      <div class="row gap4"><span class="sm muted trunc grow">${t.lastDirection === 'out' ? '✓ ' : ''}${esc(t.preview || t.subject || '')}</span>${t.unread ? `<span class="unread">${t.unread}</span>` : ''}</div>
      <div class="row gap4 wrap" style="margin-top:4px">${mine ? `<span class="badge blue">${esc(userName(t.owner))}</span>` : `<span class="badge">${I('sparkle').replace('class="i "', 'class="i" style="width:10px;height:10px"')} Anuma</span>`}${t.status === 'hold' ? D.badge('On hold', 'amber') : ''}${t.status === 'closed' ? D.badge('Closed') : ''}${t.priority === 'high' ? D.badge('Priority', 'red', 1) : ''}${t.slaMinutes != null ? `<span class="badge ${t.slaMinutes < 30 ? 'red' : 'outline'}">${I('clock').replace('class="i "', 'class="i" style="width:10px;height:10px"')} ${t.slaMinutes}m</span>` : ''}</div></div></div>`;
  }

  /* ── messages ── */
  function senderLine(m) { if (m.from === 'customer' || m.from === 'system') return ''; return `<div class="snd out">${esc(userName(m.from))}</div>`; }
  function voice(m) {
    const n = 34, h = hash(m.id), open = ui().voiceOpen[m.id];
    const bars = Array.from({ length: n }, (_, i) => `<i style="height:${6 + ((h >> (i % 20)) & 7) * 2.2 + (i % 5)}px"></i>`).join('');
    const s = (m.meta && m.meta.seconds) || 12;
    return `<div class="bub ${m.from === 'customer' ? '' : 'out'}" style="min-width:250px"><div class="row"><button class="btn sm icon ghost" data-act="toast" data-arg="Playing voice note (demo)">${I('play')}</button><div class="wave">${bars}</div><span class="xs muted">0:${String(s).padStart(2, '0')}</span></div>${m.text ? `<button class="xs muted" data-act="ib-transcript" data-arg="${m.id}" style="margin-top:2px">${open ? 'Hide' : 'Show'} transcript</button>${open ? `<div class="sm" style="font-style:italic;margin-top:3px">“${esc(m.text)}”</div>` : ''}` : ''}<span class="tm">${tm(m.at)}</span></div>`;
  }
  function reviewCard(m, t) {
    const r = m.meta, res = r.resolution, done = !!res, pct = (r.best || {}).confidence || 0;
    return `<div class="ibc ${done ? 'done' : ''}" data-review="${esc(r.reviewId || m.id)}"><div class="h">${done ? I('check') : I('alert').replace('class="i "', 'class="i" style="color:#d97706"')}<span>${done ? 'Resolved by a person' : 'Anuma stopped here'}</span><span class="xs muted" style="font-weight:400">${r.transcript ? 'Voice note' : 'Photo'} · needs a person</span><span class="right xs muted">${tm(m.at)}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1.2fr"><div class="b2" style="border-right:1px solid var(--border)"><div class="xs muted">${r.swatch || r.photo ? 'Customer image' : 'What Anuma heard'}</div>${r.swatch || r.photo ? `<div class="tile" style="width:104px;height:78px;margin-top:6px;background:${bgOf(r.swatch || r.photo)}"></div>` : ''}${r.transcript ? `<div class="sm" style="font-style:italic;margin-top:6px">“${esc(r.transcript)}”</div>` : ''}<div class="xs muted" style="margin-top:8px">What Anuma read</div><div class="sm b mono">${(r.read || []).map(([k, v]) => esc(k + ' ' + v)).join(' · ')}</div></div>
      <div class="b2"><div class="xs muted">${done ? 'Chosen by a person' : 'Proposed catalogue match'}</div><div class="row" style="margin-top:6px"><span class="sm b ${done ? '' : ''}">${esc(done ? res.name : (r.best || {}).name || '—')}</span>${done ? '' : `<span class="badge ${pct >= floor() ? 'green' : 'amber'}">${pct}% match</span>`}</div>${done ? `<div class="xs" style="color:#1e40af;margin-top:4px">${res.how === 'catalogue' ? 'Chosen from the catalogue' : 'Accepted'} by ${esc(userName(res.by))} · ${esc(res.at || '')}</div>` : ''}</div></div>
      <div class="f ${done ? '' : ''}" style="${done ? 'color:var(--muted-foreground)' : 'color:#92400e;background:#fffbeb'}font-size:12px">${done ? '' : I('alert')}<span>${esc(r.why || '')}</span></div>
      ${done ? '' : `<div class="f"><button class="btn outline sm" data-act="ib-find" data-arg="${m.id}">${I('search')} Find in catalogue</button><button class="btn sm" data-act="ib-accept" data-arg="${m.id}">${I('check')} Accept and send</button></div>`}</div>`;
  }
  function card(m, t) {
    const k = (m.meta || {}).kind, x = m.meta || {};
    if (k === 'review') return reviewCard(m, t);
    if (k === 'read') return `<div class="ibc"><div class="h">${I('eye')}<span>Anuma read this</span><span class="right xs muted">${tm(m.at)}</span></div><div class="b2 row" style="align-items:flex-start;gap:12px">${x.swatch ? `<div class="tile" style="width:72px;height:56px;background:${bgOf(x.swatch)};flex:none"></div>` : ''}<div class="rdgrid grow">${(x.fields || []).map(([a, b]) => `<div><span>${esc(a)}</span>${esc(b)}</div>`).join('')}</div></div></div>`;
    if (k === 'match') { const c = x.confidence || 0; return `<div class="ibc"><div class="h">${I('check').replace('class="i "', 'class="i" style="color:#13a269"')}<span>Matched to catalogue</span><span class="right xs muted">${tm(m.at)}</span></div><div class="b2 row"><div class="grow"><div class="sm b">${esc(x.name)}</div><div class="xs muted">${esc(x.productId || '')}</div></div><span class="badge ${c >= floor() ? 'green' : 'amber'}">${c}% match</span></div></div>`; }
    if (k === 'summary') return `<div class="ibc"><div class="h">${I('clipboard')}<span>${esc(x.title || 'Order summary')}</span><span class="right xs muted">${tm(m.at)}</span></div><div class="b2">${(x.lines || []).map((l) => `<div class="row sm" style="padding:3px 0"><span class="grow">${esc(l.name)}</span><span class="mono muted">${l.qty} ${esc(l.unit || '')}</span>${l.price ? `<span class="mono" style="min-width:70px;text-align:right">${D.fmt.inr(l.qty * l.price)}</span>` : ''}</div>`).join('')}${x.total ? `<div class="sep"></div><div class="row b sm"><span class="grow">Total</span><span class="mono">${D.fmt.inr(x.total)}</span></div>` : ''}</div></div>`;
    if (k === 'quote') return `<div class="ibc"><div class="h">${I('receipt')}<span>Quote ${esc(x.no || '')}</span><span class="right xs muted">${tm(m.at)}</span></div><div class="b2 row"><div class="grow"><div class="b">${D.fmt.inr(x.total)}</div><div class="xs muted">Valid till ${esc(x.validTill || '—')}</div></div>${x.quoteId ? `<a class="btn outline sm" href="#/quotes/${x.quoteId}">Open quote</a>` : ''}</div></div>`;
    if (k === 'choice') return `<div class="ibc l"><div class="b2"><div class="sm" style="margin-bottom:8px">${esc(m.text || '')}</div><div class="row wrap">${(x.options || []).map((o) => `<button class="btn outline sm" data-act="ib-choice" data-arg="${esc(o)}">${esc(o)}</button>`).join('')}</div></div></div>`;
    return `<div class="bub ${m.from === 'customer' ? '' : 'out'}">${esc(m.text || '')}<span class="tm">${tm(m.at)}</span></div>`;
  }
  function bubble(m, t) {
    if (m.from === 'system') return `<div class="bub sys">${esc(m.text)}</div>`;
    const out = m.from !== 'customer'; let body;
    if (m.type === 'card') body = card(m, t);
    else if (m.type === 'image') body = `<div class="bub ${out ? 'out' : ''}" style="padding:4px"><div class="tile" style="width:220px;height:150px;background:${bgOf((m.meta || {}).swatch)}"></div>${m.text ? `<div style="padding:5px 6px 0">${esc(m.text)}</div>` : ''}<span class="tm" style="padding:0 6px 2px">${tm(m.at)}</span></div>`;
    else if (m.type === 'voice') body = voice(m);
    else if (m.type === 'file') { const f = m.meta || {}; body = `<div class="bub ${out ? 'out' : ''}" data-act="toast" data-arg="Opening ${esc(f.name || 'file')} (demo)" style="cursor:pointer;min-width:220px"><div class="row">${I('file')}<div class="grow"><div class="sm b trunc">${esc(f.name || 'document')}</div><div class="xs muted">${esc(f.size || '')}</div></div>${I('download')}</div>${m.text ? `<div style="margin-top:4px">${esc(m.text)}</div>` : ''}<span class="tm">${tm(m.at)}</span></div>`; }
    else body = `<div class="bub ${out ? 'out' : ''}">${esc(m.text || '')}<span class="tm">${tm(m.at)}</span></div>`;
    const wrap = m.type === 'card' && ((m.meta || {}).kind === 'choice') ? '' : '';
    return (out && m.type !== 'card' ? senderLine(m) : out && m.type === 'card' ? senderLine(m) : '') + body + wrap;
  }

  /* ── deal panel ── */
  function linesFor(t) {
    const S_ = S();
    if (t.draftId) { const d = D.by(S_.drafts, t.draftId); if (d) return { kind: 'draft', ref: d, lines: d.lines || [] }; }
    if (t.orderId) { const o = D.by(S_.orders, t.orderId); if (o) return { kind: 'order', ref: o, lines: o.lines || [] }; }
    if (t.rfqId) { const r = D.by(S_.rfqs, t.rfqId); if (r) return { kind: 'rfq', ref: r, lines: r.lines || [] }; }
    return null;
  }
  const recalc = (d) => { d.total = (d.lines || []).reduce((a, l) => a + (l.qty || 0) * (l.price || 0), 0); };
  function panel(t) {
    const p = party(t.partyId), c = contact(t.contactId) || (S().contacts || []).find((x) => x.partyId === t.partyId);
    const lf = linesFor(t); const users = S().users || [];
    const lineRow = (l, i) => `<div class="dl"><span class="muted mono" style="min-width:16px">${l.n || i + 1}</span><div class="grow"><div class="b">${esc(l.name || l.text)}</div>${l.state ? `<span class="badge ${{ confirmed: 'green', matched: 'green', flagged: 'amber', review: 'amber', unmatched: 'red', pending: '' }[l.state] || ''}">${esc(l.state)}</span>` : ''}${l.price ? `<span class="xs muted" style="margin-left:6px">${D.fmt.inr(l.price)}/${esc(l.unit || 'unit')}</span>` : ''}</div>${lf.kind === 'draft' ? `<div class="stp"><button data-act="ib-qty" data-arg="${i}:-1">−</button><span class="mono">${l.qty}</span><button data-act="ib-qty" data-arg="${i}:1">+</button></div><button class="btn ghost icon sm" data-act="ib-rmline" data-arg="${i}" title="Remove">${I('x')}</button>` : `<span class="mono sm">${l.qty ?? ''} ${esc(l.unit || '')}</span>`}</div>`;
    return `<div class="col-p">
      <div class="dp-sec"><h4>Case</h4>
        <div class="row" style="margin-bottom:8px"><span class="sm muted" style="width:60px">Status</span>${t.status === 'closed' ? D.badge('Closed') : t.status === 'hold' ? D.badge('On hold', 'amber', 1) : D.badge('Open', 'green', 1)}<button class="btn ghost sm right" data-act="ib-status">${I('chevD')}</button></div>
        <div class="row" style="margin-bottom:8px"><span class="sm muted" style="width:60px">Owner</span><select class="select" style="height:28px" data-change="ib-owner"><option value="anuma" ${t.owner === 'anuma' ? 'selected' : ''}>Anuma (AI)</option>${users.map((u) => `<option value="${u.id}" ${t.owner === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></div>
        ${t.owner !== 'anuma' ? `<button class="btn outline sm" style="width:100%" data-act="ib-handback">${I('bot')} Hand back to Anuma</button>` : '<div class="xs muted">Anuma is handling this case and will hand off to a person when unsure.</div>'}
        ${t.note ? `<div class="xs" style="margin-top:8px;padding:8px;background:var(--muted);border-radius:8px">${esc(t.note)}</div>` : ''}</div>
      <div class="dp-sec"><h4>${lf ? (lf.kind === 'draft' ? 'Current order · draft ' + esc(lf.ref.no || '') : lf.kind === 'order' ? 'Order ' + esc(lf.ref.no || '') : 'RFQ ' + esc(lf.ref.no || '')) : 'Current order'}${lf && lf.kind === 'draft' ? `<span class="right">${D.badge(lf.ref.status, lf.ref.status === 'approved' || lf.ref.status === 'posted' ? 'green' : 'amber')}</span>` : ''}</h4>
        ${lf && lf.lines.length ? lf.lines.map(lineRow).join('') : '<div class="sm muted">No lines yet.</div>'}
        ${lf && lf.kind === 'draft' ? `<div class="row b sm" style="margin-top:8px"><span class="grow">Total</span><span class="mono">${D.fmt.inr(lf.ref.total)}</span></div>` : ''}
        <div class="row wrap" style="margin-top:10px">
          ${!lf || lf.kind === 'rfq' ? `<button class="btn sm" data-act="ib-mkdraft">${I('plus')} ${lf ? 'Create draft from RFQ' : 'Create draft order'}</button>` : ''}
          ${lf && lf.kind === 'draft' ? `<button class="btn outline sm" data-act="ib-addline">${I('plus')} Add line</button><button class="btn outline sm" data-act="ib-sendsum">${I('send')} Send to customer</button>${lf.ref.status === 'pending' ? `<button class="btn sm" data-act="ib-approve">${I('check')} Approve</button>` : ''}<a class="btn ghost sm" href="#/orders/drafts/${lf.ref.id}">Open</a>` : ''}
          ${lf && lf.kind === 'rfq' ? `<a class="btn ghost sm" href="#/orders/rfqs/${lf.ref.id}">Open RFQ</a>` : ''}${lf && lf.kind === 'order' ? `<a class="btn ghost sm" href="#/orders/${lf.ref.id}">Open order</a>` : ''}</div></div>
      <div class="dp-sec"><h4>Party</h4><div class="row" style="margin-bottom:8px">${D.avatar(p.name, 'lg')}<div class="grow"><a class="b" href="#/crm/accounts/${p.id}">${esc(p.name)}</a><div class="xs muted">${esc([p.city, p.type].filter(Boolean).join(' · '))}</div></div></div>
        <dl class="kv" style="grid-template-columns:90px 1fr"><dt>Contact</dt><dd>${c ? esc(c.name) + (c.role ? ' · ' + esc(c.role) : '') : '—'}</dd><dt>Phone</dt><dd>${esc((c && c.phone) || p.phone || '—')}</dd><dt>Terms</dt><dd>${esc(p.terms || '—')}</dd><dt>Credit</dt><dd class="mono">${p.creditLimit ? D.fmt.inrc(p.outstanding || 0) + ' / ' + D.fmt.inrc(p.creditLimit) : '—'}</dd><dt>Last order</dt><dd>${p.lastOrderAt ? D.fmt.date(p.lastOrderAt) : '—'}</dd></dl>
        ${p.creditLimit && p.outstanding > p.creditLimit ? `<div class="badge red" style="margin-top:8px">${I('alert')} Over credit limit</div>` : ''}</div>
      <div class="dp-sec"><h4>Linked</h4><div class="col" style="gap:6px">${t.dealId ? `<a class="btn outline sm" href="#/leads/${t.dealId}">${I('handshake')} Deal</a>` : ''}${t.rfqId ? `<a class="btn outline sm" href="#/orders/rfqs/${t.rfqId}">${I('sheet')} RFQ</a>` : ''}${t.orderId ? `<a class="btn outline sm" href="#/orders/${t.orderId}">${I('clipboard')} Order</a>` : ''}<a class="btn outline sm" href="#/crm/accounts/${p.id}">${I('users')} Party record</a>${!t.dealId ? `<button class="btn outline sm" data-act="ib-mkdeal">${I('plus')} Create deal</button>` : ''}</div></div>
    </div>`;
  }

  /* ── page ── */
  function chat(t) {
    const p = party(t.partyId), c = CH[t.channel] || CH.web, u = ui();
    let lastDay = '';
    const msgs = (t.messages || []).map((m) => { const d = /\d{4}-\d{2}-\d{2}/.test(m.at || '') ? new Date(m.at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''; const sep = d && d !== lastDay ? `<div class="ib-day">${d}</div>` : ''; if (d) lastDay = d; return sep + bubble(m, t); }).join('');
    return `<div class="ib-head">${D.avatar(p.name)}<div class="grow"><div class="b">${esc(p.name)}</div><div class="xs muted row gap4"><span class="ch" style="width:12px;height:12px;border-radius:50%;background:${c[1]};display:inline-grid;place-items:center;color:#fff">${I(c[0]).replace('class="i "', 'class="i" style="width:8px;height:8px"')}</span>${c[2]}${t.subject ? ' · ' + esc(t.subject) : ''}</div></div>
        <button class="btn outline sm" data-act="ib-status">${t.status === 'closed' ? 'Reopen' : 'Resolve'}</button><button class="btn ghost icon sm" data-act="ib-toggle-panel" title="Details">${I('sidebar')}</button></div>
      ${t.owner !== 'anuma' ? `<div class="ib-owner">${D.avatar(userName(t.owner), 'sm')}<span class="grow"><b>${esc(userName(t.owner))}</b> has this case. Anuma is paused on this thread.</span><button class="btn outline sm" data-act="ib-handback">Hand back to Anuma</button></div>` : ''}
      <div class="ib-stream chatbg" id="ib-stream">${msgs}${u.typing === t.id ? '<div class="typing"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="ib-comp"><textarea rows="1" id="ib-ta" data-input="ib-draft" placeholder="${t.owner === 'anuma' ? 'Reply as yourself — this takes the case from Anuma' : 'Write a reply…'}">${esc(u.draft[t.id] || '')}</textarea>
        <div class="row wrap" style="margin-top:8px"><button class="btn ghost icon sm" data-act="ib-attach" title="Attach">${I('paperclip')}</button><button class="btn ghost sm" data-act="ib-suggest">${I('sparkle')} Suggest reply</button><button class="btn ghost sm" data-act="ib-quick">${I('zap')} Templates</button>
        <div class="row xs muted right" style="gap:6px" title="Anuma answers the simulated customer reply automatically"><span>Auto-reply</span>${D.switch(u.auto, 'ib-auto')}</div>
        <button class="btn ghost sm" data-act="ib-sim" title="Simulate an incoming customer message">${I('user')} Simulate customer</button><button class="btn sm" data-act="ib-send">${I('send')} Send</button></div></div>`;
  }
  D.page('/inbox/threads', {
    title: 'Inbox', crumb: 'Threads',
    render({ q }) {
      const u = ui(), L = filtered(), cur = sel(q) || L[0] || null; if (cur) u.sel = cur.id;
      const all = threads(); const cnt = (f) => all.filter(f).length;
      const tabs = [['all', 'All', all.length], ['needs', 'Needs you', cnt((t) => t.owner !== 'anuma' && t.status !== 'closed')], ['anuma', 'Anuma', cnt((t) => t.owner === 'anuma' && t.status !== 'closed')], ['unread', 'Unread', cnt((t) => t.unread)], ['closed', 'Closed', cnt((t) => t.status === 'closed')]];
      return `<div class="page-full"><div class="ib ${u.panel ? '' : 'nopanel'} ${u.panel ? 'showpanel' : ''}">
        <div class="col-l"><div class="ib-lh"><div class="row"><h2 class="grow">Inbox</h2><button class="btn ghost icon sm" data-act="ib-sort" title="Sort">${I('filter')}</button><button class="btn sm" data-act="ib-new">${I('plus')} New</button></div>
          <div class="row" style="margin:10px 0"><div class="search grow">${I('search')}<input class="input" style="width:100%" data-input="ib-q" placeholder="Search conversations" value="${esc(u.q)}"></div><select class="select" style="width:112px" data-change="ib-ch"><option value="all">All channels</option>${Object.entries(CH).map(([k, v]) => `<option value="${k}" ${u.ch === k ? 'selected' : ''}>${v[2]}</option>`).join('')}</select></div></div>
          <div class="ib-tabs">${tabs.map(([k, l, n]) => `<button class="tab ${u.tab === k ? 'on' : ''}" data-act="ib-tab" data-arg="${k}">${l}${n ? ` <span class="badge">${n}</span>` : ''}</button>`).join('')}</div>
          <div class="ib-list">${L.map((t) => row(t, cur)).join('') || '<div class="empty">No conversations match.</div>'}</div></div>
        <div class="col-m">${cur ? chat(cur) : '<div class="empty" style="margin:auto">Select a conversation</div>'}</div>
        ${cur && u.panel ? panel(cur) : ''}</div></div>`;
    },
    after(view, { q }) {
      const s = view.querySelector('#ib-stream'); if (s) { const u = ui(); if (u.stick !== false) s.scrollTop = s.scrollHeight; }
      const t = sel(q) || filtered()[0]; if (t && t.unread) { t.unread = 0; D.render(); }
      const ta = view.querySelector('#ib-ta'); if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; }
    },
  });

  D.page('/inbox/channels', {
    title: 'Inbox channels', crumb: 'Channels',
    render() {
      const chs = S().channels || [];
      return `<div class="page">${D.header('Inbox channels', 'Where conversations come from, and how busy each channel is.', `<a class="btn outline" href="#/settings/channels">${I('settings')} Manage channels</a><a class="btn" href="#/inbox/threads">${I('inbox')} Open inbox</a>`)}
      <div class="grid g3">${chs.map((c) => { const ty = CH[c.type] || CH.web; const ts = threads().filter((t) => t.channel === c.type); const un = ts.reduce((a, t) => a + (t.unread || 0), 0); return `<div class="card pad col"><div class="row"><span class="avatar" style="background:${ty[1]}">${I(ty[0])}</span><div class="grow"><div class="b">${esc(c.name || ty[2])}</div><div class="xs muted">${esc(c.number || c.provider || '')}</div></div>${D.badge(c.state === 'connected' ? 'Connected' : c.state === 'needs_reauth' ? 'Needs re-auth' : 'Disconnected', c.state === 'connected' ? 'green' : 'amber', 1)}</div>
        <div class="grid g3" style="gap:6px"><div><div class="xs muted">Threads</div><div class="b mono">${ts.length}</div></div><div><div class="xs muted">Unread</div><div class="b mono">${un}</div></div><div><div class="xs muted">Webhook</div><div class="b sm">${c.webhook === 'healthy' ? '<span class="up">Healthy</span>' : '<span class="down">Failing</span>'}</div></div></div>
        <div class="row"><button class="btn outline sm" data-act="ib-chfilter" data-arg="${c.type}">${I('inbox')} View threads</button><button class="btn ghost sm" data-act="ib-chtest" data-arg="${esc(c.name || ty[2])}">${I('zap')} Send test</button></div></div>`; }).join('') || '<div class="empty">No channels connected.</div>'}</div>
      <div class="card pad" style="margin-top:16px"><h3>Volume by channel</h3><div style="margin-top:10px">${D.chart.hbars(Object.entries(CH).map(([k, v]) => ({ l: v[2], v: threads().filter((t) => t.channel === k).length })).filter((x) => x.v).sort((a, b) => b.v - a.v))}</div></div></div>`;
    },
  });

  /* ── mutations ── */
  function cur() { return threads().find((t) => t.id === ui().sel); }
  function push(t, m) { t.messages = t.messages || []; t.messages.push(Object.assign({ id: D.uid('m'), at: nowIso() }, m)); t.preview = m.type === 'text' ? m.text : m.type === 'image' ? '📷 Photo' : m.type === 'voice' ? '🎤 Voice note' : m.type === 'file' ? '📎 ' + ((m.meta || {}).name || 'File') : t.preview; t.lastAt = t.messages.at(-1).at; t.lastDirection = m.from === 'customer' ? 'in' : 'out'; }
  const A = D.act;
  A('ib-open', (el) => { ui().sel = el.dataset.arg; ui().stick = true; history.replaceState(null, '', '#/inbox/threads?case=' + el.dataset.arg); D.render(); });
  A('ib-tab', (el) => { ui().tab = el.dataset.arg; D.render(); });
  A('ib-toggle-panel', () => { ui().panel = !ui().panel; D.render(); });
  A('ib-sort', (el) => D.menu(el, [{ label: 'Most recent', icon: 'clock', run: () => { ui().sort = 'recent'; D.render(); } }, { label: 'Most unread', icon: 'bell', run: () => { ui().sort = 'unread'; D.render(); } }]));
  A('ib-transcript', (el) => { const v = ui().voiceOpen; v[el.dataset.arg] = !v[el.dataset.arg]; ui().stick = false; D.render(); });
  A('ib-auto', () => { ui().auto = !ui().auto; D.toast(ui().auto ? 'Anuma will auto-reply to simulated customer messages' : 'Auto-reply off', 'sparkle'); D.render(); });
  D.input('ib-q', (v) => { ui().q = v; D.render(); });
  D.input('ib-ch', (v) => { ui().ch = v; D.render(); });
  D.input('ib-draft', (v, el) => { const t = cur(); if (t) ui().draft[t.id] = v; el.style.height = 'auto'; el.style.height = Math.min(120, el.scrollHeight) + 'px'; });
  D.input('ib-owner', (v) => { const t = cur(); if (!t) return; t.owner = v; push(t, { from: 'system', type: 'text', text: v === 'anuma' ? 'Case handed back to Anuma' : userName(v) + ' took over this case' }); D.toast(v === 'anuma' ? 'Handed back to Anuma' : userName(v) + ' now owns this case'); D.render(); });
  A('ib-handback', () => { const t = cur(); if (!t) return; t.owner = 'anuma'; push(t, { from: 'system', type: 'text', text: 'Case handed back to Anuma' }); push(t, { from: 'anuma', type: 'text', text: 'Thanks — I’ll take it from here and keep the customer posted.' }); D.toast('Handed back to Anuma', 'bot'); D.render(); });
  A('ib-status', (el) => { const t = cur(); if (!t) return; if (t.status === 'closed') { t.status = 'open'; D.toast('Case reopened'); D.render(); } else D.menu(el, [{ label: 'Resolve & close', icon: 'check', run: () => { t.status = 'closed'; D.toast('Case closed'); D.render(); } }, { label: t.status === 'hold' ? 'Take off hold' : 'Put on hold', icon: 'clock', run: () => { t.status = t.status === 'hold' ? 'open' : 'hold'; D.render(); } }]); });
  A('ib-send', () => { const t = cur(), u = ui(); const v = (u.draft[t.id] || '').trim(); if (!v) return D.toast('Type a message first', 'info'); if (t.owner === 'anuma') { t.owner = me().id; push(t, { from: 'system', type: 'text', text: me().name + ' took over this case' }); } push(t, { from: me().id, type: 'text', text: v }); u.draft[t.id] = ''; u.stick = true; D.render(); if (u.auto) setTimeout(() => simulate(t.id), 1100); });
  document.addEventListener('keydown', (e) => { if (e.target && e.target.id === 'ib-ta' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); D.acts['ib-send'](); } });
  A('ib-suggest', () => { const t = cur(); const last = [...(t.messages || [])].reverse().find((m) => m.from === 'customer' && m.text); const p = party(t.partyId); ui().draft[t.id] = `Hi ${((contact(t.contactId) || {}).name || p.name).split(' ')[0]}, thanks for the details${last ? ' on “' + last.text.slice(0, 40) + (last.text.length > 40 ? '…' : '') + '”' : ''}. I’ve noted everything and will confirm availability and pricing shortly.`; D.toast('Anuma drafted a reply', 'sparkle'); D.render(); });
  A('ib-quick', (el) => { const T = (S().templates || []).filter((x) => x.status === 'approved').slice(0, 6); const t = cur(); D.menu(el, (T.length ? T : [{ name: 'Acknowledge', body: 'Thanks — we’ve received this and will revert shortly.' }]).map((x) => ({ label: x.name, icon: 'zap', run: () => { ui().draft[t.id] = x.body; D.render(); } }))); });
  A('ib-attach', (el) => { const t = cur(); const add = (m) => { push(t, Object.assign({ from: me().id }, m)); ui().stick = true; D.render(); }; D.menu(el, [{ label: 'Image', icon: 'image', run: () => add({ type: 'image', text: 'Reference photo', meta: { swatch: '#d6c7b0' } }) }, { label: 'Voice note', icon: 'mic', run: () => add({ type: 'voice', text: 'Sharing the dispatch details in the voice note.', meta: { seconds: 14 } }) }, { label: 'File (PDF)', icon: 'file', run: () => add({ type: 'file', meta: { name: 'Price-list-Oct-2026.pdf', size: '184 KB' } }) }]); });
  A('ib-sim', () => simulate(ui().sel, true));
  const CUST = ['Ok, please go ahead.', 'Can you share the best rate for 500+ units?', 'Delivery kab tak hoga?', 'Thanks, received. Will confirm payment today.', 'Please add 10 more of the same.'];
  function simulate(id, user) {
    const t = threads().find((x) => x.id === id); if (!t) return; const u = ui(); const text = CUST[hash(t.id + (t.messages || []).length) % CUST.length];
    push(t, { from: 'customer', type: 'text', text }); if (t.id !== u.sel) t.unread = (t.unread || 0) + 1; u.stick = true; D.render();
    if (u.auto && t.owner === 'anuma') { u.typing = t.id; D.render(); setTimeout(() => { u.typing = null; const r = /rate|price/i.test(text) ? 'For 500+ units I can offer a slab rate — sharing a revised quote in a moment.' : /deliver|kab/i.test(text) ? 'Dispatch is planned within 2 working days of confirmation; I’ll share the tracking link.' : /pay/i.test(text) ? 'Noted — I’ll mark the order as payment-pending until it reflects.' : 'Done — I’ve updated the order and will confirm shortly.'; push(t, { from: 'anuma', type: 'text', text: r }); D.render(); }, 1300); }
  }
  A('ib-new', () => { const ps = S().parties || []; D.modal({ title: 'New conversation', body: `<div class="col">${D.field('Party', 'party', { options: ps.map((p) => p.name) })}${D.field('Channel', 'ch', { options: ['WhatsApp', 'Email'] })}${D.field('First message', 'msg', { area: 1, ph: 'Hello…' })}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Start', run: (m) => { const f = D.formData(m); const p = ps.find((x) => x.name === f.party); if (!p || !f.msg.trim()) { D.toast('Pick a party and write a message', 'info'); return false; } const t = { id: D.uid('T'), partyId: p.id, channel: f.ch === 'Email' ? 'email' : 'whatsapp', owner: me().id, status: 'open', unread: 0, preview: f.msg, lastAt: nowIso(), messages: [] }; threads().unshift(t); push(t, { from: me().id, type: 'text', text: f.msg }); ui().sel = t.id; D.render(); } }] }); });
  A('ib-chfilter', (el) => { ui().ch = el.dataset.arg; ui().tab = 'all'; D.go('/inbox/threads'); });
  A('ib-chtest', (el) => D.toast('Test message sent via ' + el.dataset.arg, 'send'));
  A('ib-choice', (el) => { const t = cur(); push(t, { from: 'customer', type: 'text', text: el.dataset.arg }); ui().stick = true; D.render(); });

  /* review / catalogue */
  function resolve(msgId, prod, how) {
    const t = cur(), m = (t.messages || []).find((x) => x.id === msgId); if (!m) return;
    m.meta.resolution = { productId: prod.productId || prod.id, name: prod.name, by: me().id, how, at: tm(nowIso()) };
    const lf = linesFor(t);
    if (lf && lf.kind === 'draft') { const ln = lf.lines.find((l) => l.state === 'flagged' || l.state === 'pending') || null; if (ln) { ln.productId = prod.productId || prod.id; ln.name = prod.name; ln.state = 'confirmed'; const pr = D.by(S().products, ln.productId); if (pr && !ln.price) ln.price = pr.price; recalc(lf.ref); } }
    push(t, { from: 'anuma', type: 'text', text: `Confirmed with ${userName(me().id)}: ${prod.name}. I’ve added it to your order.` });
    t.owner !== 'anuma' && 0; ui().stick = true; D.toast('Match sent to customer'); D.render();
  }
  A('ib-accept', (el) => { const t = cur(), m = t.messages.find((x) => x.id === el.dataset.arg); resolve(m.id, m.meta.best, 'accept'); });
  A('ib-find', (el) => pickProduct((p) => resolve(el.dataset.arg, p, 'catalogue')));
  function pickProduct(cb, title = 'Find in catalogue') {
    const P = S().products || [];
    const list = (q) => P.filter((p) => !q || (p.name + ' ' + p.sku + ' ' + (p.category || '')).toLowerCase().includes(q.toLowerCase())).slice(0, 30).map((p) => `<div class="listrow" data-pick="${p.id}" style="border-radius:8px"><span class="tile" style="width:32px;height:32px;background:${p.color || '#e5e5e5'};flex:none"></span><div class="grow"><div class="sm b">${esc(p.name)}</div><div class="xs muted">${esc(p.sku)} · ${esc(p.category || '')}</div></div><span class="mono sm">${D.fmt.inr(p.price)}</span></div>`).join('') || '<div class="empty">No products match.</div>';
    D.modal({ title, body: `<div class="search" style="margin-bottom:10px">${I('search')}<input class="input" style="width:100%" id="pk-q" placeholder="Search by name or SKU"></div><div id="pk-l" style="max-height:340px;overflow:auto">${list('')}</div>`, onMount(m) { m.querySelector('#pk-q').addEventListener('input', (e) => { m.querySelector('#pk-l').innerHTML = list(e.target.value); }); m.addEventListener('click', (e) => { const r = e.target.closest('[data-pick]'); if (r) { const p = P.find((x) => x.id === r.dataset.pick); D.closeModal(); cb(p); } }); } });
  }

  /* draft mutations */
  function ensureDraft(t, fromRfq) {
    let d = t.draftId && D.by(S().drafts, t.draftId); if (d) return d;
    const r = fromRfq && t.rfqId && D.by(S().rfqs, t.rfqId); const n = (S().drafts || []).length + 1;
    d = { id: D.uid('DO'), no: 'DO-' + String(2000 + n), partyId: t.partyId, threadId: t.id, status: 'pending', total: 0, createdAt: nowIso(), by: 'Anuma', note: '', lines: r ? r.lines.filter((l) => l.productId).map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unit: l.unit, price: l.price, state: l.state === 'matched' ? 'confirmed' : 'flagged' })) : [] };
    recalc(d); (S().drafts = S().drafts || []).unshift(d); t.draftId = d.id; return d;
  }
  A('ib-mkdraft', () => { const t = cur(); const d = ensureDraft(t, true); D.toast('Draft order ' + d.no + ' created', 'file'); D.render(); });
  A('ib-addline', () => { const t = cur(); const d = ensureDraft(t); pickProduct((p) => { d.lines.push({ productId: p.id, name: p.name, qty: 1, unit: p.unit, price: p.price, state: 'confirmed' }); recalc(d); D.render(); }, 'Add a line'); });
  A('ib-qty', (el) => { const d = ensureDraft(cur()); const [i, dl] = el.dataset.arg.split(':').map(Number); d.lines[i].qty = Math.max(1, (d.lines[i].qty || 1) + dl); recalc(d); D.render(); });
  A('ib-rmline', (el) => { const d = ensureDraft(cur()); d.lines.splice(+el.dataset.arg, 1); recalc(d); D.render(); });
  A('ib-approve', () => { const t = cur(), d = ensureDraft(t); d.status = 'approved'; push(t, { from: 'system', type: 'text', text: 'Draft ' + d.no + ' approved by ' + me().name }); D.toast('Draft approved', 'check'); D.render(); });
  A('ib-sendsum', () => { const t = cur(), d = ensureDraft(t); push(t, { from: me().id, type: 'card', meta: { kind: 'summary', title: 'Order summary ' + d.no, lines: d.lines, total: d.total } }); ui().stick = true; D.toast('Summary sent to customer', 'send'); D.render(); });
  A('ib-mkdeal', () => { const t = cur(), p = party(t.partyId); const l = { id: D.uid('L'), title: (t.subject || 'New enquiry') + ' — ' + p.name, partyId: t.partyId, stage: 'New', value: (linesFor(t) || { lines: [] }).lines.reduce((a, x) => a + (x.qty || 0) * (x.price || 0), 0), owner: t.owner === 'anuma' ? me().id : t.owner, source: (CH[t.channel] || CH.web)[2], createdAt: nowIso(), closeAt: '2026-11-15', notes: '' }; (S().leads = S().leads || []).unshift(l); t.dealId = l.id; D.toast('Deal created', 'handshake'); D.render(); });
})();
