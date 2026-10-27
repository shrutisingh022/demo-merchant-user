/* Inbox — NuHome live design: case list · WhatsApp chat · AI summary + activity. Also /inbox/channels.
   Message conventions: type 'text' (meta.quote{from,text}, meta.choice, meta.actor, meta.template) | 'image'{meta.swatch,meta.caption,text}
   | 'voice'{meta.seconds,meta.transcript,text} | 'file'{meta.name,meta.size} | 'comment'{meta.actor} (internal yellow note)
   | 'card'{meta.kind|meta.type: read|match|review|resolution|summary|draft|quote|choice}. System lines: from 'system' (meta.actor, meta.tone). */
(function () {
  const D = window.DM, I = D.icon, esc = D.esc;
  const st = document.createElement('style'); st.dataset.for = 'inbox';
  st.textContent = `
  .ib{display:grid;grid-template-columns:289px minmax(0,1fr) 262px;height:100%;min-height:0;position:relative}
  .ib.nor,.ib.over{grid-template-columns:289px minmax(0,1fr)}
  .ib .col-l,.ib .col-m{display:flex;flex-direction:column;min-height:0;min-width:0}.ib .col-m{position:relative}
  @media(max-width:1560px){.ib-head .lbl{display:none}}
  .ib .col-l{border-right:1px solid var(--border);background:#fff}
  .ib .col-p{border-left:1px solid var(--border);overflow:auto;background:#fafafa;padding:10px;display:flex;flex-direction:column;gap:10px}
  .ib.over .col-p{position:absolute;right:0;top:0;bottom:0;width:290px;z-index:6;box-shadow:-10px 0 30px rgba(0,0,0,.14)}
  .ib-lh{padding:14px 14px 10px}
  .ib-chbtn{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;padding:3px 6px;margin:0 -6px;border-radius:8px;transition:background-color .15s}.ib-chbtn:hover{background:var(--muted)}
  .waic{width:18px;height:18px;border-radius:50%;background:#25d366;color:#fff;display:inline-grid;place-items:center;flex:none}.waic svg.i{width:11px;height:11px;stroke-width:2.4}
  .ib-tabs{display:flex;gap:3px;padding:2px 14px 12px;border-bottom:1px solid var(--border)}.ib-tabs .pill{height:25px}
  .ib-tabs .pill{flex:none;padding:4px 8px}.ib-tabs .pills{width:100%;justify-content:space-between}.ib-tabs .pill{flex:1;justify-content:center}
  .ib-list{flex:1;overflow:auto;min-height:0}
  .ib-foot{padding:9px 14px;border-top:1px solid var(--border);font-size:11.5px;color:var(--muted-foreground)}
  .crow{display:flex;flex-direction:column;gap:6px;min-height:97px;padding:10px 14px 8px;border-bottom:1px solid var(--border);cursor:pointer;position:relative;border-left:2px solid transparent;transition:background-color .15s}.crow .cname{font-size:12px;font-weight:600;line-height:16px}.crow .cpre{margin-top:0}.crow .mark22{width:24px;height:24px}.crow .avatar{box-shadow:0 0 0 2px #fff}
  .crow:hover{background:var(--hover-cream)}.crow.on{background:#f4f4f5;border-left-color:#0a0a0a}.crow.esc{background:#fffbe6}.crow.esc.on{background:#fcf3c8}
  .ctag{display:inline-flex;align-items:center;gap:5px;font:500 10px ui-monospace,SFMono-Regular,Menlo,monospace;background:#f1f1f1;color:#404040;border-radius:5px;padding:0 6px;height:18px}
  .ctag i{width:6px;height:6px;border-radius:50%;background:#a3a3a3}.ctag.open{background:#e9f8ef;color:#0b7a4e}.ctag.open i{background:var(--success)}.ctag.esc{background:#fdf0d2;color:#9a6208}.ctag.esc i{background:var(--warning)}
  .sla{display:inline-flex;align-items:center;gap:3px;font-size:11px;color:#c2410c}.sla svg.i{width:11px;height:11px}
  .cpre{display:flex;align-items:center;gap:5px;color:var(--muted-foreground);font-size:12px;margin-top:3px;min-width:0}.cpre span{min-width:0}
  .amark{position:absolute;right:12px;bottom:10px;display:flex}
  .ib-head{display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid var(--border);background:#fff;min-height:68px;height:68px}
  .ib-head h2{font-size:16px;font-weight:600;display:flex;gap:6px;align-items:baseline;min-width:0}
  .ib-stream{flex:1;overflow:auto;padding:14px 22px 110px;display:flex;flex-direction:column;gap:7px;min-height:0;position:relative}
  .ib-stream>*{flex-shrink:0}
  .mrow{display:flex;gap:8px;align-items:flex-end}.mrow.out{justify-content:flex-end}
  .lb{display:inline-flex;flex-wrap:wrap;align-items:flex-end;gap:2px 12px;max-width:min(72%,520px);padding:7px 10px;border-radius:10px;background:#fff;box-shadow:0 1px 1px rgba(0,0,0,.07);font-size:13px;line-height:1.4;white-space:pre-wrap}
  .lb.out{background:var(--bubble-out);color:var(--bubble-out-fg)}
  .ltm{margin-left:auto;font-size:10.5px;color:#6b7280;display:inline-flex;align-items:center;gap:3px;white-space:nowrap}.lb.out .ltm{color:#5b6b60}
  .tick{width:15px;height:11px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.tick.rd{color:var(--whatsapp-read)}
  .lquote{flex:1 1 100%;background:rgba(0,0,0,.05);border-radius:7px;padding:5px 8px;font-size:12px;color:#525252;white-space:pre-wrap;margin-bottom:3px}.lquote b{display:block;color:#1f2937;font-size:11.5px}
  .lb.out .lquote{background:rgba(0,0,0,.06)}
  .lbtns{flex:1 1 100%;margin:6px -10px -7px;border-top:1px solid rgba(0,0,0,.1);display:flex;flex-direction:column}
  .lbtns button{padding:8px;text-align:center;font-size:13px;font-weight:500;color:#0b6e99;border-top:1px solid rgba(0,0,0,.08)}.lbtns button:first-child{border-top:0}.lbtns button:hover:not([disabled]){background:rgba(255,255,255,.55)}.lbtns button[disabled]{color:#8b9aa3;cursor:default}
  .react{margin:-4px 0 0 6px;font-size:13px;background:#fff;border-radius:999px;width:22px;height:22px;display:grid;place-items:center;box-shadow:0 1px 2px rgba(0,0,0,.15);position:relative;top:-6px}
  .sysline{align-self:center;font-size:10.5px;color:#6b7280;text-align:center;padding:1px 8px;max-width:80%}.sysline b{color:#262626;font-weight:600}
  .sysline.amber b{color:#9a6208}.sysline.blue b{color:#1e40af}.sysline.green b{color:#0b7a4e}
  .cmt{align-self:center;width:min(570px,88%);background:#fffbe3;border:1px dashed #d9c767;border-radius:12px;padding:9px 13px;font-size:13px;box-shadow:0 1px 1px rgba(0,0,0,.04)}
  .cmt .ch{display:flex;align-items:center;gap:6px;font-size:12px;color:#525252;padding-bottom:6px;margin-bottom:6px;border-bottom:1px dashed #e6d98a}.cmt .ch b{color:#171717}.cmt .ch .ts{margin-left:auto;font-size:11px;color:#8a8a8a}
  .cmt .cb{white-space:pre-wrap}
  .dayrow{align-self:center;font-size:11px;background:rgba(255,255,255,.8);border-radius:6px;padding:2px 9px;color:#6b7280;margin:6px 0 2px}
  .earlier{align-self:center;font-size:11.5px;color:#6b7280;padding:2px 8px}.earlier:hover{color:#171717}
  .mark22{width:22px;height:22px;border-radius:50%;background:#0a0a0a;display:grid;place-items:center;flex:none;box-shadow:0 0 0 2px #fff}.mark22 i{display:flex;align-items:center;gap:1.5px}.mark22 i::before{content:"";width:3px;height:3px;border-radius:50%;background:#fff}.mark22 i::after{content:"";width:6px;height:3px;border-radius:2px;background:#fff}
  .mark22.green{box-shadow:0 0 0 1.5px #25d366}
  .tile{border-radius:8px;border:1px solid rgba(0,0,0,.08);background-size:cover;background-position:center}
  .wave{display:flex;align-items:center;gap:2px;height:26px}.wave i{width:2.5px;background:#8696a0;border-radius:2px;display:block}
  .ibc{width:min(520px,86%);border:1px solid var(--border);border-radius:12px;background:#fff;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.05);font-size:13px}
  .ibc .h{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);background:#fafafa;font-size:12.5px;font-weight:500}
  .ibc.done{border-color:var(--info-border)}.ibc.done .h{background:var(--info-tint);color:#1e40af}
  .ibc .b2{padding:10px 12px}
  .ibc .f{display:flex;gap:8px;align-items:center;padding:9px 12px;border-top:1px solid var(--border)}
  .rdgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 14px;font-size:12.5px}.rdgrid span{color:var(--muted-foreground);display:block;font-size:11px}
  .float{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;width:min(640px,calc(100% - 40px));z-index:3}
  .winc{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--border);border-radius:14px;padding:10px 12px;box-shadow:0 6px 22px rgba(0,0,0,.12)}
  .comp{background:#fff;border:1px solid var(--border);border-radius:14px;padding:8px 10px;box-shadow:0 6px 22px rgba(0,0,0,.12)}
  .comp textarea{width:100%;border:0;resize:none;font-size:13px;outline:none;min-height:36px;max-height:110px;padding:4px 2px}
  .acard{background:#fff;border:1px solid var(--border);border-radius:14px;padding:12px 14px}
  .acard h4{display:flex;align-items:center;font-size:13.5px;font-weight:600;margin-bottom:8px}
  .acard h4 .btn{margin-left:auto}
  .evgrp{font-size:10.5px;letter-spacing:.06em;color:#6b7280;margin:10px 0 6px;text-transform:uppercase}
  .ev{display:flex;gap:9px;align-items:flex-start;padding:5px 0;font-size:12.5px}.ev .t{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:#6b7280;width:38px;flex:none;padding-top:3px}
  .ev .g{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);display:grid;place-items:center;flex:none;background:#fff}.ev .g svg.i{width:12px;height:12px;color:#6b7280}
  .dl{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px dashed var(--border);font-size:12.5px}.dl:last-child{border-bottom:0}
  .stp{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:6px;overflow:hidden}.stp button{width:20px;height:22px;font-size:13px}.stp button:hover{background:var(--muted)}.stp span{min-width:24px;text-align:center;font-size:12px}
  .stream-tp{display:flex;gap:8px;align-items:flex-end}.stream-tp.out{justify-content:flex-end}
  .dim{opacity:.3}mark{background:#fde68a;border-radius:2px}
  .xf{animation:os-fade .3s both}.pop{animation:badge-pop .32s ease both}
  .lbtns button{transition:background-color .12s,transform .1s}.lbtns button:active:not([disabled]){transform:scale(.97);background:rgba(255,255,255,.85)}
  .wave i{transition:background-color .12s}.wave.playing i{animation:wv var(--dur,10s) linear forwards;animation-delay:calc(var(--i) * var(--dur,10s) / 30)}@keyframes wv{to{background:#0b7a4e}}
  .tile{cursor:zoom-in;transition:transform .15s}.tile:hover{transform:scale(1.01)}
  .skrow{min-height:97px;padding:12px 14px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:9px}
  .sk{height:10px;border-radius:5px}
  .rd-card{width:min(520px,86%);border:1px solid var(--border);border-radius:12px;background:#fff;padding:12px 14px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
  .cqbar{display:flex;gap:8px;align-items:center;padding:6px 14px;border-bottom:1px solid var(--border);background:#fff}
  `;
  document.head.appendChild(st);

  const S = () => D.S;
  const IST = 'Asia/Kolkata', NOW0 = Date.parse('2026-10-27T05:30:00Z'), DAY = 864e5;
  const ui = () => (D.ui.inbox = D.ui.inbox || { tab: 'all', q: '', ch: 'all', draft: {}, auto: false, typing: null, voiceOpen: {}, sort: 'recent', tick: 0, csearch: false, cq: '', rcol: null });
  const now = () => NOW0 + (ui().tick || 0) * 60000;
  const CH = { whatsapp: ['chat', '#25d366', 'WhatsApp'], email: ['mail', '#2563eb', 'Email'], indiamart: ['tag', '#e0642b', 'IndiaMART'], web: ['globe', '#7c3aed', 'Web form'], telegram: ['send', '#0ea5e9', 'Telegram'] };
  const TICKS = (rd) => `<svg class="tick ${rd ? 'rd' : ''}" viewBox="0 0 24 24"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`;
  const TICK1 = `<svg class="tick" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>`;
  const WA = `<span class="waic">${I('chat')}</span>`;
  const MARK = (g) => `<span class="mark22 ${g ? 'green' : ''}"><i></i></span>`;
  const party = (id) => D.by(S().parties, id) || { id, name: id || 'Unknown' };
  const contact = (id) => D.by(S().contacts, id);
  const userName = (id) => (id === 'anuma' ? 'Anuma' : id === 'me' ? 'You' : id === 'system' ? 'System' : (D.by(S().users, id) || {}).name || id);
  const me = () => ((S().users || [])[0] || { id: 'me', name: 'You' });
  const nameOf = (t) => (t.unknownPhone ? t.unknownPhone : party(t.partyId).name);
  const ms = (x) => { const v = typeof x === 'number' ? x : Date.parse(x); return isNaN(v) ? null : v; };
  const hasClock = (x) => ms(x) != null;
  const tf = (x) => { if (!x) return ''; if (!hasClock(x)) return String(x); return new Date(ms(x)).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: IST }).replace(/\s/g, '').toLowerCase(); };
  const dayKey = (x) => new Date(ms(x) ?? now()).toLocaleDateString('en-CA', { timeZone: IST });
  const dayLabel = (x) => { const k = dayKey(x), t = dayKey(now()), y = dayKey(now() - DAY); if (k === t) return 'Today'; if (k === y) return 'Yesterday'; return new Date(ms(x)).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: IST }); };
  const listDate = (x) => { if (!hasClock(x)) return ''; const k = dayKey(x), t = dayKey(now()), y = dayKey(now() - DAY); if (k === t) return tf(x); if (k === y) return 'Yesterday'; if (now() - ms(x) < 6 * DAY) return new Date(ms(x)).toLocaleDateString('en-IN', { weekday: 'short', timeZone: IST }); return new Date(ms(x)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: IST }); };
  const longDay = (x) => new Date(ms(x)).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: IST });
  const nowIso = () => new Date(NOW0 + (ui().tick = (ui().tick || 0) + 1) * 60000).toISOString();
  const floor = () => (S().policy && S().policy.confidenceFloor) || 85;
  const bgOf = (s) => (!s ? '#e5e5e5' : /^(data:|url\(|http|assets)/.test(s) ? `url("${String(s).replace(/^url\(|\)$/g, '')}") center/cover` : s);
  const threads = () => S().threads || [];
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const kindOf = (m) => (m.meta || {}).kind || (m.meta || {}).type;
  const sel = (q) => { const id = (q && q.get('case')) || ui().sel; return threads().find((t) => t.id === id) || null; };
  const cur = () => threads().find((t) => t.id === ui().sel);

  /* case numbers: DDMMYY-n (n = order of opening that day) */
  let tagMemo = { k: '', m: {} };
  const firstAt = (t) => { const m = (t.messages || []).find((x) => hasClock(x.at)); return m ? m.at : t.lastAt; };
  function tags() {
    const key = threads().map((t) => t.id + (firstAt(t) || '')).join('|'); if (tagMemo.k === key) return tagMemo.m;
    const L = threads().map((t) => ({ t, at: ms(firstAt(t)) ?? 0 })).sort((a, b) => a.at - b.at); const cnt = {}, out = {};
    L.forEach(({ t, at }) => { const dk = new Date(at).toLocaleDateString('en-CA', { timeZone: IST }); cnt[dk] = (cnt[dk] || 0) + 1; const [y, mo, d] = dk.split('-'); out[t.id] = d + mo + y.slice(2) + '-' + cnt[dk]; });
    tagMemo = { k: key, m: out }; return out;
  }
  const caseNo = (t) => tags()[t.id] || String(t.caseNo || t.id);
  const lastInbound = (t) => { const m = [...(t.messages || [])].reverse().find((x) => x.from === 'customer' && hasClock(x.at)); return m ? ms(m.at) : null; };
  const windowClosed = (t) => { if (t.channel !== 'whatsapp') return false; const l = lastInbound(t); return l == null || now() - l > DAY; };
  const escalated = (t) => t.status === 'hold' || (t.status !== 'closed' && t.owner !== 'anuma' && t.escalated !== false);
  const slaOver = (t) => { if (t.status === 'closed' || t.lastDirection !== 'in') return null; const l = lastInbound(t); if (l == null) return null; const over = now() - l - 15 * 60000; if (over <= 0) return null; const mins = Math.floor(over / 60000); return Math.floor(mins / 60) + ':' + String(mins % 60).padStart(2, '0'); };

  /* ── case list ── */
  function filtered() {
    const u = ui(); let L = threads().slice();
    if (u.tab === 'open') L = L.filter((t) => t.status !== 'closed'); else if (u.tab === 'esc') L = L.filter(escalated); else if (u.tab === 'closed') L = L.filter((t) => t.status === 'closed');
    if (u.ch !== 'all') { const c = (S().channels || []).find((x) => x.id === u.ch); L = L.filter((t) => (c ? t.channel === c.type : t.channel === u.ch)); }
    if (u.q) { const q = u.q.toLowerCase(); L = L.filter((t) => (nameOf(t) + ' ' + caseNo(t) + ' ' + (t.preview || '') + ' ' + (t.subject || '')).toLowerCase().includes(q)); }
    if (u.sort === 'unread') L.sort((a, b) => (b.unread || 0) - (a.unread || 0)); else if (u.sort === 'old') L.sort((a, b) => (ms(a.lastAt) || 0) - (ms(b.lastAt) || 0)); else L.sort((a, b) => (ms(b.lastAt) || 0) - (ms(a.lastAt) || 0));
    return L;
  }
  function row(t, c) {
    const p = party(t.partyId), cn = contact(t.contactId), over = slaOver(t), esc_ = escalated(t), open = t.status === 'open' && !esc_;
    const second = t.unknownPhone ? '' : (cn && cn.name && cn.name !== p.name ? `<span class="muted" style="font-weight:400">, ${esc(cn.name)}</span>` : '');
    const closedMsg = t.lastDirection === 'out';
    return `<div class="crow ${c && c.id === t.id ? 'on' : ''} ${esc_ ? 'esc' : ''}" data-act="ib-open" data-arg="${t.id}" data-sig="${esc([t.lastAt, t.unread, t.status, t.owner, t.preview].join('|'))}">
      <div class="row gap4"><span class="ctag ${esc_ ? 'esc' : open ? 'open' : ''}"><i></i>${esc(caseNo(t))}</span>${over ? `<span class="sla">${I('clock')} ${over} over</span>` : ''}${t.unread ? `<span class="unread" data-u="${t.unread}" style="height:16px;min-width:16px;font-size:10px">${t.unread}</span>` : ''}<span class="grow"></span><span class="xs muted">${esc(listDate(t.lastAt))}</span></div>
      <div class="trunc cname">${esc(nameOf(t))}${second}</div>
      <div class="cpre">${closedMsg ? TICKS(t.status === 'closed') : ''}<span class="trunc">${esc(t.preview || t.subject || '')}</span></div>
      ${t.owner === 'anuma' ? (t.status !== 'closed' ? `<span class="amark" title="Anuma">${MARK(open)}</span>` : '') : `<span class="amark" title="Assigned to ${esc(userName(t.owner))}">${D.avatar(userName(t.owner), 'sm', { org: false })}</span>`}</div>`;
  }

  /* ── messages ── */
  function voice(m, out) {
    const h = hash(m.id), open = ui().voiceOpen[m.id], meta = m.meta || {}, s = meta.seconds || 12, tr = meta.transcript || m.text;
    const bars = Array.from({ length: 30 }, (_, i) => `<i style="--i:${i};height:${5 + ((h >> (i % 20)) & 7) * 2 + (i % 5)}px"></i>`).join('');
    return `<div class="lb ${out ? 'out' : ''}" style="min-width:240px"><div class="row" style="width:100%"><button class="btn sm icon ghost" data-act="ib-play" data-arg="${m.id}">${I('play')}</button><div class="wave" style="--dur:${s}s">${bars}</div><span class="xs muted">0:${String(s).padStart(2, '0')}</span></div>${tr ? `<button class="xs muted" data-act="ib-transcript" data-arg="${m.id}" style="width:100%;text-align:left;margin-top:2px">${open ? 'Hide' : 'Show'} transcript</button>${open ? `<div class="sm" style="font-style:italic;width:100%">“${esc(tr)}”</div>` : ''}` : ''}<span class="ltm">${tf(m.at)}</span></div>`;
  }
  function reviewCard(m, t) {
    const r = m.meta, res = r.resolved || r.resolution || (t.resolutions || {})[m.id], done = !!res, pct = (r.best || {}).confidence || 0;
    return `<div class="ibc ${done ? 'done' : ''}"><div class="h">${done ? I('check') : I('alert').replace('class="i "', 'class="i" style="color:#d97706"')}<span>${done ? 'Resolved by a person' : 'Anuma stopped here'}</span><span class="xs muted" style="font-weight:400">${r.transcript ? 'Voice note' : 'Photo'}</span><span class="right xs muted">${tf(m.at)}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1.2fr"><div class="b2" style="border-right:1px solid var(--border)"><div class="xs muted">${r.swatch || r.photo ? 'Customer image' : 'What Anuma heard'}</div>${r.swatch || r.photo ? `<div class="tile" style="width:104px;height:78px;margin-top:6px;background:${bgOf(r.swatch || r.photo)}"></div>` : ''}${r.transcript ? `<div class="sm" style="font-style:italic;margin-top:6px">“${esc(r.transcript)}”</div>` : ''}<div class="xs muted" style="margin-top:8px">What Anuma read</div><div class="sm b mono">${(r.read || []).map(([k, v]) => esc(k + ' ' + v)).join(' · ')}</div></div>
      <div class="b2"><div class="xs muted">${done ? 'Chosen by a person' : 'Proposed catalogue match'}</div><div class="row" style="margin-top:6px"><span class="sm b">${esc(done ? res.name : (r.best || {}).name || '—')}</span>${done ? '' : `<span class="badge ${pct >= floor() ? 'green' : 'amber'}">${pct}% match</span>`}</div>${done ? `<div class="xs" style="color:#1e40af;margin-top:4px">${res.how === 'catalogue' ? 'Chosen from the catalogue' : 'Accepted'} by ${esc(userName(res.by))}</div>` : ''}</div></div>
      <div class="f" style="${done ? 'color:var(--muted-foreground)' : 'color:#92400e;background:#fffbeb'};font-size:12px">${done ? '' : I('alert')}<span>${esc(r.why || '')}</span></div>
      ${done ? '' : `<div class="f"><button class="btn outline sm" data-act="ib-find" data-arg="${m.id}">${I('search')} Find in catalogue</button><button class="btn sm" data-act="ib-accept" data-arg="${m.id}">${I('check')} Accept and send</button></div>`}</div>`;
  }
  function summaryBubble(m, t) {
    const x = m.meta || {}, lines = (x.lines || []);
    const body = m.text && /\n/.test(m.text) ? m.text : (m.text ? m.text + '\n' : 'Please confirm your order:\n') + lines.map((l, i) => `${l.n || i + 1}. ${l.name} — ${l.qty ?? '–'} ${l.unit || ''}`.trim()).join('\n');
    const answered = x.answered || (t.answered || {})[m.id] || (t.messages || []).some((q) => q.from === 'customer' && q.meta && q.meta.choice && (q.meta.quoteOf === m.id || (!q.meta.quoteOf && ms(q.at) >= ms(m.at))));
    return `<div class="lb out" style="min-width:300px;max-width:min(76%,480px)"><span style="width:100%">${esc(body.trim())}</span><span class="ltm" style="width:100%;justify-content:flex-end">${tf(m.at)} ${TICKS(true)}</span><div class="lbtns">${x.options.map((o) => `<button ${answered ? 'disabled' : ''} data-act="ib-opt" data-arg="${m.id}|${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  }
  function card(m, t) {
    const k = kindOf(m), x = m.meta || {};
    if (k === 'review') return reviewCard(m, t);
    if (k === 'resolution') return `<div class="ibc done"><div class="h">${I('check')}<span>${esc(userName(m.from))} resolved a line</span><span class="right xs muted">${tf(m.at)}</span></div><div class="b2"><div class="sm b">${esc(x.name || '')}</div><div class="xs muted">${x.how === 'catalogue' ? 'Chosen from the catalogue' : 'Accepted the proposed match'}${m.text ? ' · ' + esc(m.text) : ''}</div></div></div>`;
    if (k === 'read') return `<div class="ibc"><div class="h">${I('eye')}<span>${esc(x.title || 'Anuma read this')}</span><span class="right xs muted">${tf(m.at)}</span></div><div class="b2 row" style="align-items:flex-start;gap:12px">${x.swatch ? `<div class="tile" style="width:72px;height:56px;background:${bgOf(x.swatch)};flex:none"></div>` : ''}<div class="grow">${x.transcript ? `<div class="sm" style="font-style:italic;margin-bottom:6px">“${esc(x.transcript)}”</div>` : ''}<div class="rdgrid">${(x.fields || []).map(([a, b]) => `<div><span>${esc(a)}</span>${esc(b)}</div>`).join('')}</div></div></div></div>`;
    if (k === 'match') { const c = x.confidence || 0; return `<div class="ibc"><div class="h">${I('check').replace('class="i "', 'class="i" style="color:#13a269"')}<span>${m.text ? esc(m.text) : 'Matched to catalogue'}</span><span class="right xs muted">${tf(m.at)}</span></div><div class="b2 row"><div class="grow"><div class="sm b">${esc(x.name)}</div><div class="xs muted">${esc(x.productId || '')}</div></div><span class="badge ${c >= floor() ? 'green' : 'amber'}">${c}% match</span></div></div>`; }
    if (k === 'summary') { if (x.options && x.options.length) return summaryBubble(m, t); return `<div class="ibc"><div class="h">${I('clipboard')}<span>${esc(x.title || 'Order summary')}</span><span class="right xs muted">${tf(m.at)}</span></div><div class="b2">${(x.lines || []).map((l) => `<div class="row sm" style="padding:3px 0"><span class="grow">${esc(l.name)}</span><span class="mono muted">${l.qty ?? '–'} ${esc(l.unit || '')}</span>${l.price && l.qty ? `<span class="mono" style="min-width:70px;text-align:right">${D.fmt.inr(l.qty * l.price)}</span>` : ''}</div>`).join('')}${x.total ? `<div class="sep"></div><div class="row b sm"><span class="grow">Total</span><span class="mono">${typeof x.total === 'number' && x.total < 1000 && !(x.lines || []).some((l) => l.price > 0 && l.qty) ? x.total : D.fmt.inr(x.total)}</span></div>` : ''}</div></div>`; }
    if (k === 'draft') { const d = D.by(S().drafts, x.draftId); return `<div class="ibc"><div class="h">${I('file')}<span>Draft order ${esc((d && d.no) || '')}</span><span class="right">${d ? D.status(d.status, d.status === 'pending' ? 'amber' : d.status === 'rejected' ? 'red' : 'green') : ''}</span></div><div class="b2 row"><div class="grow sm">${d ? (d.lines || []).length + ' lines · ' + D.fmt.inr(d.total) : esc(m.text || '')}</div>${d ? `<a class="btn outline sm" href="#/orders/drafts/${d.id}">Open</a>` : ''}</div></div>`; }
    if (k === 'quote') return `<div class="ibc"><div class="h">${I('receipt')}<span>Quote ${esc(x.no || '')}</span><span class="right xs muted">${tf(m.at)}</span></div><div class="b2 row"><div class="grow"><div class="b">${D.fmt.inr(x.total)}</div><div class="xs muted">Valid till ${esc(x.validTill || '—')}</div></div>${x.quoteId ? `<a class="btn outline sm" href="#/quotes/${x.quoteId}">Open quote</a>` : ''}</div></div>`;
    if (k === 'choice') return `<div class="ibc"><div class="b2"><div class="sm" style="margin-bottom:8px">${esc(m.text || '')}</div><div class="row wrap">${(x.options || []).map((o) => `<button class="btn outline sm" data-act="ib-choice" data-arg="${esc(o)}">${esc(o)}</button>`).join('')}</div></div></div>`;
    return `<div class="lb out">${esc(m.text || '')}<span class="ltm">${tf(m.at)}</span></div>`;
  }
  const sysPrefix = (m) => { const users = (S().users || []).map((u) => u.name).concat(['Anuma', 'System']); const a = (m.meta || {}).actor; if (a) return [a, m.text]; const hit = users.find((n) => n && m.text.startsWith(n + ' ')); return hit ? [hit, m.text.slice(hit.length).trim()] : ['System', m.text]; };
  const agentOut = (m) => m.from !== 'customer' && m.from !== 'system';
  function quoteFor(m, t) {
    const q = (m.meta || {}).quote; if (q) return `<div class="lquote"><b>${esc(q.from || '')}</b>${esc(q.text || '')}</div>`;
    if (!(m.meta || {}).choice) return '';
    const src = (t.messages || []).find((x) => x.id === (m.meta || {}).quoteOf) || [...(t.messages || [])].reverse().find((x) => x !== m && kindOf(x) === 'summary' && ms(x.at) <= ms(m.at));
    if (!src) return ''; const lines = (src.meta.lines || []).map((l, i) => `${l.n || i + 1}. ${l.name} — ${l.qty ?? '–'} ${l.unit || ''}`).join(' ');
    return `<div class="lquote"><b>Anuma</b>${esc('Please confirm your order: ' + lines)}</div>`;
  }
  function bubble(m, t, u) {
    const out = agentOut(m), q = u.cq && !JSON.stringify(m).toLowerCase().includes(u.cq.toLowerCase());
    const wrap = (inner) => `<div class="mrow ${out ? 'out' : ''} ${q ? 'dim' : ''}" data-mid="${m.id}">${inner}</div>`;
    const side = out ? (m.from === 'anuma' ? MARK(t.status === 'open') : D.avatar(userName(m.from), 'sm')) : '';
    if (m.type === 'comment') return `<div class="cmt ${q ? 'dim' : ''}"><div class="ch">${I('chat')}<b>${esc((m.meta || {}).actor || userName(m.from))}</b><span>Comment</span><span class="ts">${esc(dayLabel(m.at))}, ${tf(m.at)}</span></div><div class="cb">${esc(m.text)}</div></div>`;
    if (m.from === 'system') { const [who, rest] = sysPrefix(m); return `<div class="sysline ${(m.meta || {}).tone || ''} ${q ? 'dim' : ''}"><b>${esc(who)}</b> ${esc(rest)}</div>`; }
    if (m.type === 'card') { const k = kindOf(m); if (k === 'summary' && (m.meta.options || []).length) return wrap(summaryBubble(m, t) + side); return wrap(card(m, t) + side); }
    let b;
    const readTick = t.status === 'closed' || (t.messages || []).some((x) => x.from === 'customer' && ms(x.at) > ms(m.at));
    const sending = out && (m.meta || {}).sentAt && Date.now() - m.meta.sentAt < 650;
    const tm_ = `<span class="ltm">${tf(m.at)}${out ? (sending ? TICK1 : TICKS(readTick)) : ''}</span>`;
    if (m.type === 'image') b = `<div class="lb ${out ? 'out' : ''}" style="padding:4px;flex-direction:column;align-items:stretch"><div class="tile" data-act="ib-lightbox" data-arg="${m.id}" style="width:220px;height:150px;background:${bgOf((m.meta || {}).swatch)}"></div><div style="display:flex;gap:10px;padding:4px 6px 1px">${(m.meta || {}).caption || m.text ? `<span>${esc((m.meta || {}).caption || m.text)}</span>` : ''}${tm_}</div></div>`;
    else if (m.type === 'voice') b = voice(m, out);
    else if (m.type === 'file') { const f = m.meta || {}; b = `<div class="lb ${out ? 'out' : ''}" data-act="toast" data-arg="Opening ${esc(f.name || 'file')} (demo)" style="cursor:pointer;min-width:230px"><div class="row" style="width:100%">${I('file')}<div class="grow"><div class="sm b trunc">${esc(f.name || 'document')}</div><div class="xs muted">${esc(f.size || '')}</div></div>${I('download')}</div>${m.text ? `<span>${esc(m.text)}</span>` : ''}${tm_}</div>`; }
    else b = `<div class="lb ${out ? 'out' : ''}">${quoteFor(m, t)}<span>${esc(m.text || '')}</span>${tm_}</div>`;
    const react = (m.meta || {}).choice && /confirm/i.test(m.text || '') ? '<span class="react">✅</span>' : '';
    return wrap(b + side) + react;
  }

  /* ── order lines / right column ── */
  function linesFor(t) {
    const S_ = S();
    if (t.draftId) { const d = D.by(S_.drafts, t.draftId); if (d) return { kind: 'draft', ref: d, lines: d.lines || [] }; }
    if (t.orderId) { const o = D.by(S_.orders, t.orderId); if (o) return { kind: 'order', ref: o, lines: o.lines || [] }; }
    if (t.rfqId) { const r = D.by(S_.rfqs, t.rfqId); if (r) return { kind: 'rfq', ref: r, lines: r.lines || [] }; }
    return null;
  }
  const recalc = (d) => { d.total = (d.lines || []).reduce((a, l) => a + (l.qty || 0) * (l.price || 0), 0); };
  function summaryText(t) {
    const p = party(t.partyId), first = t.unknownPhone ? 'This sender' : ((contact(t.contactId) || {}).name || p.name || 'The customer').split(' ')[0];
    const lf = linesFor(t), st = t.status === 'closed' ? 'closed' : t.status === 'hold' ? 'on hold' : 'open';
    if (!lf || !lf.lines.length) { const last = [...(t.messages || [])].reverse().find((m) => m.from === 'customer' && m.text); return `${first} has no requested items yet. ${last ? 'Last message: “' + last.text.slice(0, 70) + (last.text.length > 70 ? '…' : '') + '”. ' : ''}The case is ${st}.`; }
    const n = lf.lines.length, bad = lf.lines.filter((l) => ['flagged', 'review', 'unmatched', 'pending'].includes(l.state)).length;
    return `${first} has ${n} requested item${n === 1 ? '' : 's'}. ${bad ? `${bad} line${bad === 1 ? '' : 's'} still need${bad === 1 ? 's' : ''} a person to confirm the match.` : 'The product, quantity and unit details are captured.'} The case is ${st}.`;
  }
  function events(t) {
    const E = (t.events || []).map((e) => ({ at: e.at, actor: e.actor, text: e.text })), seen = new Set(E.map((e) => e.at + e.text));
    (t.messages || []).forEach((m) => { if (m.from !== 'system' || m.type === 'comment') return; const [who, rest] = sysPrefix(m); const k = m.at + rest; if (!seen.has(k) && hasClock(m.at)) E.push({ at: m.at, actor: who, text: rest }); });
    if (!E.some((e) => /opened/i.test(e.text)) && hasClock(firstAt(t))) E.push({ at: firstAt(t), actor: 'System', text: 'Case ' + caseNo(t) + ' opened' });
    return E.filter((e) => hasClock(e.at)).sort((a, b) => ms(b.at) - ms(a.at));
  }
  function activity(t) {
    const E = events(t); if (!E.length) return '<div class="sm muted">No activity yet.</div>'; let last = '';
    return E.map((e) => { const k = dayKey(e.at), head = k !== last ? `<div class="evgrp">${new Date(ms(e.at)).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: IST })}</div>` : ''; last = k; const sys = e.actor === 'System' || e.actor === 'Anuma';
      return head + `<div class="ev"><span class="t">${new Date(ms(e.at)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: IST })}</span><span class="g">${sys ? I('settings') : D.avatar(e.actor, 'sm')}</span><div class="grow"><b>${esc(e.actor)}</b> ${esc(e.text)}</div></div>`; }).join('');
  }
  function rightCol(t) {
    const users = S().users || [], lf = linesFor(t), p = party(t.partyId), c = contact(t.contactId);
    const lineRow = (l, i) => `<div class="dl"><span class="muted mono" style="min-width:14px">${l.n || i + 1}</span><div class="grow"><div class="b">${esc(l.name || l.text)}</div>${l.state ? `<span class="badge ${{ confirmed: 'green', matched: 'green', flagged: 'amber', review: 'amber', unmatched: 'red', pending: '' }[l.state] || ''}">${esc(l.state)}</span>` : ''}${l.price ? `<span class="xs muted" style="margin-left:6px">${D.fmt.inr(l.price)}/${esc(l.unit || 'unit')}</span>` : ''}</div>${lf.kind === 'draft' ? `<div class="stp"><button data-act="ib-qty" data-arg="${i}:-1">−</button><span class="mono">${l.qty ?? '–'}</span><button data-act="ib-qty" data-arg="${i}:1">+</button></div><button class="btn ghost icon sm" data-act="ib-rmline" data-arg="${i}" title="Remove">${I('x')}</button>` : `<span class="mono sm">${l.qty ?? ''} ${esc(l.unit || '')}</span>`}</div>`;
    const lastMsg = (t.messages || []).slice(-1)[0];
    return `<div class="col-p">
      <div class="acard"><h4>AI summary<button class="btn outline icon sm" data-act="ib-resum" title="Refresh summary">${I('sparkle')}</button></h4><div style="font-size:12.5px;line-height:1.5">${esc(summaryText(t))}</div><div class="xs muted" style="margin-top:8px">Updated ${lastMsg && hasClock(lastMsg.at) ? new Date(ms(lastMsg.at)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: IST }) + ' · ' + tf(lastMsg.at).replace(/(am|pm)/, ' $1') : 'just now'}</div></div>
      <div class="acard"><h4>${lf ? (lf.kind === 'draft' ? 'Draft ' + esc(lf.ref.no || '') : lf.kind === 'order' ? 'Order ' + esc(lf.ref.no || '') : 'RFQ ' + esc(lf.ref.no || '')) : 'Current order'}${lf && lf.kind === 'draft' ? `<span style="margin-left:auto">${D.status(lf.ref.status, lf.ref.status === 'pending' ? 'amber' : lf.ref.status === 'rejected' ? 'red' : 'green')}</span>` : ''}</h4>
        ${lf && lf.lines.length ? lf.lines.map(lineRow).join('') : '<div class="sm muted">No lines yet.</div>'}
        ${lf && lf.kind === 'draft' ? `<div class="row b sm" style="margin-top:8px"><span class="grow">Total</span><span class="mono">${D.fmt.inr(lf.ref.total)}</span></div>` : ''}
        <div class="row wrap" style="margin-top:10px">${!lf || lf.kind === 'rfq' ? `<button class="btn sm" data-act="ib-mkdraft">${I('plus')} ${lf ? 'Create draft' : 'Create draft order'}</button>` : ''}
          ${lf && lf.kind === 'draft' ? `<button class="btn outline sm" data-act="ib-addline">${I('plus')} Add line</button><button class="btn outline sm" data-act="ib-sendsum">${I('send')} Send</button>${lf.ref.status === 'pending' ? `<button class="btn sm" data-act="ib-approve">${I('check')} Approve</button>` : ''}<a class="btn ghost sm" href="#/orders/drafts/${lf.ref.id}">Open</a>` : ''}
          ${lf && lf.kind === 'rfq' ? `<a class="btn ghost sm" href="#/orders/rfqs/${lf.ref.id}">Open RFQ</a>` : ''}${lf && lf.kind === 'order' ? `<a class="btn ghost sm" href="#/orders/${lf.ref.id}">Open order</a>` : ''}</div></div>
      <div class="acard"><h4>Case</h4>
        <div class="row" style="margin-bottom:8px"><span class="sm muted" style="width:52px">Owner</span><button class="btn outline grow" style="justify-content:flex-start" data-act="ib-assign">${t.owner === 'anuma' ? MARK(false) : D.avatar(userName(t.owner), 'sm', { org: false })}<span class="grow trunc" style="text-align:left">${t.owner === 'anuma' ? 'Anuma (AI)' : esc(userName(t.owner))}</span>${I('chevD')}</button></div>
        ${t.owner !== 'anuma' ? `<button class="btn outline sm" style="width:100%" data-act="ib-handback">${I('bot')} Hand back to Anuma</button>` : '<div class="xs muted">Anuma is handling this case and hands off to a person when unsure.</div>'}
        ${t.note ? `<div class="xs" style="margin-top:8px;padding:8px;background:var(--muted);border-radius:8px">${esc(t.note)}</div>` : ''}
        <div class="row wrap" style="margin-top:10px">${t.partyId ? `<a class="btn outline sm" href="#/crm/accounts/${p.id}">${I('users')} Party</a>` : ''}${t.dealId ? `<a class="btn outline sm" href="#/leads/${t.dealId}">${I('handshake')} Deal</a>` : t.partyId ? `<button class="btn outline sm" data-act="ib-mkdeal">${I('plus')} Deal</button>` : ''}${t.rfqId ? `<a class="btn outline sm" href="#/orders/rfqs/${t.rfqId}">${I('sheet')} RFQ</a>` : ''}</div>
        ${c ? `<div class="xs muted" style="margin-top:8px">${esc(c.name)}${c.role ? ' · ' + esc(c.role) : ''}${c.phone ? ' · ' + esc(c.phone) : ''}</div>` : ''}</div>
      <div class="acard"><h4>Activity<span style="margin-left:auto" class="muted">${I('history')}</span></h4>${activity(t)}</div></div>`;
  }

  /* ── chat column ── */
  const statusMeta = (t) => (t.status === 'closed' ? ['Closed', 'x'] : t.status === 'hold' ? ['On hold', 'clock'] : ['Open', 'check']);
  function floating(t, u) {
    if (windowClosed(t)) { const li = lastInbound(t), cn = contact(t.contactId); return `<div class="float"><div class="winc"><span class="icotile">${I('lock')}</span><div class="grow" style="min-width:0"><div class="b sm">24-hour window closed</div><div class="xs muted">${esc(((cn && cn.name) || nameOf(t)).split(' ')[0])} last wrote ${li ? 'at ' + tf(li) + ' on ' + longDay(li) : 'never'}. Free text will not be delivered.</div></div><button class="btn" data-act="ib-template">${I('file')} Send a template</button></div></div>`; }
    return `<div class="float"><div class="comp"><textarea rows="1" id="ib-ta" data-input="ib-draft" placeholder="${t.owner === 'anuma' ? 'Reply as yourself — this takes the case from Anuma' : 'Write a reply…'}">${esc(u.draft[t.id] || '')}</textarea>
      <div class="row"><button class="btn ghost icon sm" data-act="ib-attach" title="Attach">${I('paperclip')}</button><button class="btn ghost sm" data-act="ib-suggest">${I('sparkle')} Suggest reply</button><button class="btn ghost sm" data-act="ib-quick">${I('zap')} Templates</button>
      <span class="row xs muted right" style="gap:6px" title="Anuma answers the simulated customer reply automatically">Auto-reply ${D.switch(u.auto, 'ib-auto')}</span><button class="btn ghost sm" data-act="ib-sim" title="Simulate an incoming customer message">${I('user')} Simulate customer</button><button class="btn sm" data-act="ib-send">${I('send')} Send</button></div></div></div>`;
  }
  function chat(t, u, showR, narrow) {
    const cn = contact(t.contactId), p = party(t.partyId), [stLabel, stIcon] = statusMeta(t);
    const comments = (t.messages || []).filter((m) => m.type === 'comment').length;
    const phone = (cn && cn.phone) || p.phone || t.unknownPhone || '';
    const ownerN = t.owner === 'anuma' ? 'Anuma' : userName(t.owner);
    return `<div class="ib-head"><div class="grow" style="min-width:0"><h2><span class="trunc">${esc(nameOf(t))}</span>${cn && cn.name && !t.unknownPhone && cn.name !== p.name ? `<span class="muted" style="font-weight:400;font-size:13px">${esc(cn.name)}</span>` : ''}</h2><div class="xs muted row gap4"><span id="ib-sub" class="row gap4">${subHtml(t, phone)}</span></div></div>
      <button class="btn outline sm" data-act="ib-assign" title="Assign this case">${t.owner === 'anuma' ? MARK(false) : D.avatar(ownerN, 'sm', { org: false })}<span class="lbl">${esc(ownerN)}</span> ${I('chevD')}</button>
      <button class="btn outline sm" data-act="ib-comments">${I('chat')} <span>${comments}</span><span class="lbl"> comment${comments === 1 ? '' : 's'}</span></button>
      <button class="btn outline sm" data-act="ib-status">${I(stIcon)} <span class="lbl">${stLabel}</span> ${I('chevD')}</button>
      <button class="btn outline sm" data-act="ib-orders">${I('history')} <span class="lbl">View all orders</span></button>
      <button class="btn outline icon sm" data-act="ib-csearch" title="Search in conversation">${I('search')}</button>
      <button class="btn outline icon sm" data-act="ib-toggle-r" title="Details panel">${I('sidebar')}</button></div>
      ${u.csearch ? `<div class="cqbar">${I('search')}<input class="input" data-input="ib-cq" placeholder="Search in this conversation" value="${esc(u.cq)}" style="width:100%"><button class="btn ghost icon sm" data-act="ib-csearch">${I('x')}</button></div>` : ''}
      <div class="ib-stream chatbg" id="ib-stream">${streamInner(t, u)}</div>${floating(t, u)}`;
  }


  /* ═══ motion engine: staged message reveal, typing indicator, list FLIP, skeletons ═══ */
  const ST = () => (ui().st = ui().st || { seen: {}, queue: [], pending: new Set(), fresh: new Set(), timer: null, tp: null, lastIdx: -2, uc: null, tops: null, sig: null, skel: false, skelBusy: false });
  const needsStage = (m) => m.from === 'customer' || m.from === 'anuma' || m.type === 'card';
  const typesOut = (m) => m.from !== 'customer' && m.from !== 'system' && m.type !== 'comment';
  const inThreads = () => /^\/inbox\/threads/.test(D.path());
  function plan(c) {
    const st = ST(), idx = D.scn.index;
    const jump = st.lastIdx !== -2 && (idx < st.lastIdx || idx - st.lastIdx > 1); st.lastIdx = idx;
    if (st.uc !== D.uc || jump) { st.seen = {}; st.queue = []; st.pending = new Set(); st.fresh = new Set(); st.tp = null; clearTimeout(st.timer); st.timer = null; st.uc = D.uc; st.sig = null; st.tops = null; st.init = false; }
    const first = !st.init; st.init = true;
    threads().forEach((t) => {
      const ids = (t.messages || []).map((m) => m.id), isSel = !!c && t.id === c.id;
      if (!st.seen[t.id]) { if (first || !isSel) { st.seen[t.id] = new Set(ids); return; } st.seen[t.id] = new Set(); }
      if (!isSel) { st.seen[t.id] = new Set(ids); return; }
      const prev = st.seen[t.id], keep = new Set(ids.filter((i) => prev.has(i)));
      (t.messages || []).forEach((m) => {
        if (keep.has(m.id)) return; keep.add(m.id);
        if (needsStage(m)) { st.pending.add(m.id); st.queue.push({ tid: t.id, id: m.id }); } else { st.fresh.add(m.id); setTimeout(() => st.fresh.delete(m.id), 500); }
      });
      st.seen[t.id] = keep;
    });
    // entering the inbox → shimmer skeleton rows for half a second
    if (!/^\/inbox\/threads/.test(D._lastPath || '') && !st.skelBusy) { st.skel = true; st.skelBusy = true; setTimeout(() => { st.skel = false; st.skelBusy = false; if (inThreads()) D.render(); }, 520); }
  }
  function flush() { const st = ST(); clearTimeout(st.timer); st.timer = null; st.queue = []; st.pending = new Set(); st.tp = null; }
  function kick() {
    const st = ST(); if (st.timer || !st.queue.length) return;
    const { tid, id } = st.queue[0], t = threads().find((x) => x.id === tid), m = t && (t.messages || []).find((x) => x.id === id);
    if (!m || tid !== ui().sel) { st.queue.shift(); st.pending.delete(id); return kick(); }
    const outTyping = typesOut(m) && m.type !== 'card';
    let wait = outTyping ? Math.min(1400, 800 + String(m.text || '').length * 9) : m.type === 'card' ? 900 : m.type === 'image' ? 520 : 280;
    if (st.queue.length > 3) wait = Math.round(wait * 0.55);
    st.tp = outTyping ? { tid, kind: 'typing', who: m.from } : m.type === 'card' ? { tid, kind: 'read' } : null;
    refreshStream();
    st.timer = setTimeout(() => { st.timer = null; st.queue.shift(); st.pending.delete(id); st.tp = null; st.fresh.add(id); refreshStream(); setTimeout(() => st.fresh.delete(id), 500); kick(); }, wait);
  }
  function subHtml(t, phone) {
    const tp = ST().tp;
    if (tp && tp.tid === t.id && tp.kind === 'typing') return `<span style="color:var(--success);font-weight:500">${tp.who === 'anuma' ? 'Anuma is typing…' : 'typing…'}</span>`;
    return `<span class="mono">${esc(t.unknownPhone ? (CH[t.channel] || CH.web)[2] + ' · not in CRM' : phone || (CH[t.channel] || CH.web)[2])}</span><span style="width:1px;height:10px;background:var(--border)"></span><span class="mono">${esc(caseNo(t))}</span>`;
  }
  function streamInner(t, u) {
    const st = ST(); let msgs = (t.messages || []).filter((m) => !st.pending.has(m.id));
    const hidden = !u.expanded && msgs.length > 40 ? msgs.length - 40 : 0; if (hidden) msgs = msgs.slice(hidden);
    let last = '';
    const body = msgs.map((m) => {
      const k = hasClock(m.at) ? dayKey(m.at) : ''; const sep = k && k !== last ? `<div class="dayrow">${dayLabel(m.at)}</div>` : ''; if (k) last = k;
      let h = bubble(m, t, u); if (st.fresh.has(m.id)) h = h.replace('class="', 'class="msg-new ');
      return sep + h;
    }).join('');
    const tp = st.tp && st.tp.tid === t.id ? st.tp : null;
    const tpH = !tp ? '' : tp.kind === 'typing' ? `<div class="stream-tp ${tp.who === 'customer' ? '' : 'out'} msg-new" aria-label="typing"><div class="typing ${tp.who === 'customer' ? '' : 'out'}"><i></i><i></i><i></i></div>${tp.who === 'customer' ? '' : (tp.who === 'anuma' ? MARK(t.status === 'open') : D.avatar(userName(tp.who), 'sm', { org: false }))}</div>`
      : `<div class="stream-tp out msg-new"><div class="rd-card"><div class="xs muted" style="margin-bottom:8px">Anuma is reading…</div><div class="sk shimmer" style="width:55%"></div><div class="sk shimmer" style="width:85%;margin-top:8px"></div><div class="sk shimmer" style="width:40%;margin-top:8px"></div></div>${MARK(true)}</div>`;
    return `${hidden ? `<button class="earlier" data-act="ib-earlier">Show earlier conversation</button>` : ''}${body}${tpH}`;
  }
  function refreshStream() {
    if (!inThreads()) return; const t = cur(), u = ui(), el = document.getElementById('ib-stream'); if (!t || !el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    el.innerHTML = streamInner(t, u);
    const sub = document.getElementById('ib-sub'); if (sub) { const cn = contact(t.contactId), p = party(t.partyId); sub.innerHTML = subHtml(t, (cn && cn.phone) || p.phone || t.unknownPhone || ''); }
    if (near || ST().tp) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    refreshList();
  }
  function listHtml(L, c) {
    if (ST().skel) return Array.from({ length: 6 }, (_, i) => `<div class="skrow"><div class="sk shimmer" style="width:${34 + (i % 3) * 8}%"></div><div class="sk shimmer" style="width:${52 + (i % 4) * 9}%;height:12px"></div><div class="sk shimmer" style="width:${68 - (i % 3) * 10}%"></div></div>`).join('');
    return L.map((t) => row(t, c)).join('') || '<div class="empty">No cases match.</div>';
  }
  function refreshList() {
    if (!inThreads()) return; const el = document.getElementById('ib-list'); if (!el) return; const sc = el.scrollTop;
    el.innerHTML = listHtml(filtered(), cur()); el.scrollTop = sc; listFx(document.getElementById('view'));
  }
  // FLIP slide for reordered rows, flash for changed rows, pop for new unread chips
  function listFx(root) {
    const list = root.querySelector('#ib-list'); if (!list || ST().skel) return; const st = ST(), prevTop = st.tops, prevSig = st.sig, tops = {}, sig = {};
    list.querySelectorAll('.crow').forEach((r) => {
      const id = r.dataset.arg, top = r.offsetTop; tops[id] = top; sig[id] = [r.dataset.sig, (r.querySelector('.unread') || {}).dataset ? r.querySelector('.unread').dataset.u : '0'];
      if (prevTop && prevTop[id] != null && prevTop[id] !== top && r.animate) r.animate([{ transform: `translateY(${prevTop[id] - top}px)` }, { transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.22,.8,.24,1)' });
      if (prevSig && !prevSig[id]) r.classList.add('row-new'); else if (prevSig && prevSig[id][0] !== sig[id][0]) { r.classList.add('row-new'); const un = r.querySelector('.unread'); if (un && +sig[id][1] > +prevSig[id][1]) un.classList.add('pop'); }
    });
    st.tops = tops; st.sig = sig;
  }
  // assignment menu with photo avatars

  D.page('/inbox/threads', {
    title: 'Inbox', crumb: 'Inbox',
    render({ q }) {
      const u = ui(), L = filtered(), c = sel(q) || L[0] || null; if (c) u.sel = c.id;
      const narrow = innerWidth < 1480;
      const showR = u.rcol == null ? !narrow : u.rcol;
      plan(c);
      const tabs = [['all', 'All'], ['open', 'Open'], ['esc', 'Escalated'], ['closed', 'Closed']];
      const chs = S().channels || []; const chSel = chs.find((x) => x.id === u.ch);
      return `<div class="page-full"><div class="ib ${showR ? '' : 'nor'} ${showR && narrow ? 'over' : ''}">
        <div class="col-l"><div class="ib-lh"><button class="ib-chbtn" data-act="ib-chpick">${WA}<span>${chSel ? esc(chSel.name || chSel.number) : u.ch !== 'all' ? (CH[u.ch] || CH.web)[2] : 'All numbers'}</span>${I('chevD')}</button>
          <div class="row" style="margin-top:10px"><div class="search grow">${I('search')}<input class="input" style="width:100%" data-input="ib-q" placeholder="Search cases" value="${esc(u.q)}"></div><button class="btn outline icon sm" data-act="ib-sort" title="Sort">${I('filter')}</button></div></div>
          <div class="ib-tabs"><div class="pills">${tabs.map(([k, l]) => `<button class="pill ${u.tab === k ? 'on' : ''}" data-act="ib-tab" data-arg="${k}">${l}</button>`).join('')}</div></div>
          <div class="ib-list" id="ib-list">${listHtml(L, c)}</div><div class="ib-foot">${threads().length} cases · Demo Merchant User</div></div>
        <div class="col-m ${u.xfade ? 'xf' : ''}">${c ? chat(c, u, showR, narrow) : '<div class="empty" style="margin:auto">Select a case</div>'}</div>
        ${c && showR ? rightCol(c) : ''}</div></div>`;
    },
    after(view, { q }) {
      const s = view.querySelector('#ib-stream'); if (s) { const u = ui(); if (u.stick !== false) s.scrollTop = s.scrollHeight; u.stick = true; u.xfade = false; }
      listFx(view); kick();
      const t = sel(q) || filtered()[0]; if (t && t.unread && ui().sel === t.id) { t.unread = 0; D.render(); }
      const ta = view.querySelector('#ib-ta'); if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; }
    },
  });

  D.page('/inbox/channels', {
    title: 'Inbox channels', crumb: 'Channels',
    render() {
      const chs = S().channels || [];
      return `<div class="page">${D.header('Channels', 'Where conversations come from, and how busy each channel is.', `<a class="btn outline" href="#/settings/channels">${I('settings')} Manage channels</a><a class="btn" href="#/inbox/threads">${I('inbox')} Open inbox</a>`)}
      <div class="grid g2">${chs.map((c) => { const ty = CH[c.type] || CH.web; const ts = threads().filter((t) => t.channel === c.type); const un = ts.reduce((a, t) => a + (t.unread || 0), 0); return `<div class="card pad col"><div class="row"><span class="icotile" style="background:${ty[1]};color:#fff;border:0">${I(ty[0]).replace('class="i "', 'class="i" style="color:#fff"')}</span><div class="grow"><div class="b">${esc(c.name || ty[2])}</div><div class="xs muted">${esc(c.number || c.provider || '')}</div></div>${D.status(c.state === 'connected' ? 'Live' : c.state === 'needs_reauth' ? 'Needs re-auth' : 'Paused', c.state === 'connected' ? 'green' : 'amber')}</div>
        <div class="grid g3" style="gap:6px"><div><div class="xs muted">Cases</div><div class="b mono">${ts.length}</div></div><div><div class="xs muted">Unread</div><div class="b mono">${un}</div></div><div><div class="xs muted">Webhook</div><div class="b sm">${c.webhook === 'healthy' ? '<span class="up">Healthy</span>' : '<span class="down">Failing</span>'}</div></div></div>
        <div class="row"><button class="btn outline sm" data-act="ib-chfilter" data-arg="${c.id || c.type}">${I('inbox')} View cases</button><button class="btn ghost sm" data-act="ib-chtest" data-arg="${esc(c.name || ty[2])}">${I('zap')} Send test</button></div></div>`; }).join('') || D.empty('radio', 'No channels connected', 'Connect a channel to start receiving cases.')}</div></div>`;
    },
  });

  /* ── mutations ── */
  function push(t, m) {
    t.messages = t.messages || []; t.messages.push(Object.assign({ id: D.uid('m'), at: nowIso() }, m));
    if (m.type === 'comment' || m.from === 'system') return;
    t.preview = m.type === 'text' ? m.text : m.type === 'image' ? '📷 Photo' : m.type === 'voice' ? '🎤 Voice note' : m.type === 'file' ? '📎 ' + ((m.meta || {}).name || 'File') : (m.text || t.preview);
    t.lastAt = t.messages.at(-1).at; t.lastDirection = m.from === 'customer' ? 'in' : 'out';
  }
  const sys = (t, text, actor) => push(t, { from: 'system', type: 'text', text, meta: { actor: actor || 'System' } });
  const A = D.act;
  A('ib-open', (el) => { const u = ui(); flush(); u.xfade = u.sel !== el.dataset.arg; u.sel = el.dataset.arg; u.stick = true; u.cq = ''; u.csearch = false; history.replaceState(null, '', '#/inbox/threads?case=' + el.dataset.arg); D.render(); });

  A('ib-assign', (el) => {
    const t = cur(); if (!t) return; const users = (S().users || []).filter((u) => u.status !== 'invited');
    const items = [{ label: 'Anuma (AI)', icon: 'bot', check: t.owner === 'anuma', run: () => assignTo('anuma') }].concat(users.map((u) => ({ label: u.name + (u.role ? ' · ' + u.role : ''), icon: 'user', check: t.owner === u.id, run: () => assignTo(u.id) })));
    D.menu(el, items, { match: true });
    const m = document.querySelector('.menu'); if (m) m.querySelectorAll('[data-mk]').forEach((b) => { const k = +b.dataset.mk; if (k === 0) return; const svg = b.querySelector('svg'); if (svg) svg.outerHTML = D.avatar(users[k - 1].name, 'sm', { org: false }); });
  });
  function assignTo(v) { const t = cur(); if (!t || t.owner === v) return; t.owner = v; if (v !== 'anuma' && t.status === 'closed') t.status = 'open'; sys(t, v === 'anuma' ? 'handed back the conversation to Anuma' : 'assigned conversation to ' + userName(v), me().name); D.toast(v === 'anuma' ? 'Handed back to Anuma' : userName(v) + ' now owns this case'); D.render(); }
  D.input('ib-owner', (v) => assignTo(v));
  A('ib-play', (el) => {
    const row_ = el.closest('.lb'), w = row_ && row_.querySelector('.wave'); if (!w) return; const on = w.classList.toggle('playing'); const secs = parseFloat((w.style.getPropertyValue('--dur') || '10s')) || 10;
    el.innerHTML = I(on ? 'pause' : 'play'); clearTimeout(w._t); if (on) w._t = setTimeout(() => { w.classList.remove('playing'); el.innerHTML = I('play'); }, secs * 1000);
  });
  A('ib-lightbox', (el) => {
    const t = cur(), m = (t.messages || []).find((x) => x.id === el.dataset.arg); if (!m) return; const imgs = (t.messages || []).filter((x) => x.type === 'image'); const k = imgs.findIndex((x) => x.id === m.id);
    D.modal({ title: esc((m.meta || {}).caption || m.text || 'Photo') + ` <span class="muted xs" style="font-weight:400">· ${k + 1} of ${imgs.length}</span>`, lg: true, body: `<div class="tile" style="width:100%;height:min(60vh,460px);background:${bgOf((m.meta || {}).swatch)};cursor:default;border-radius:12px"></div><div class="xs muted" style="margin-top:8px">Sent ${esc(tf(m.at))} · ${esc(nameOf(t))}</div>`, actions: [{ label: 'Close', cls: 'outline' }] });
  });
  A('ib-tab', (el) => { ui().tab = el.dataset.arg; D.render(); });
  A('ib-toggle-r', () => { const u = ui(); const narrow = innerWidth < 1480; const cur_ = u.rcol == null ? !narrow : u.rcol; u.rcol = !cur_; u.stick = false; D.render(); });
  A('ib-sort', (el) => D.menu(el, [['recent', 'Most recent', 'clock'], ['old', 'Oldest first', 'history'], ['unread', 'Most unread', 'bell']].map(([k, l, ic]) => ({ label: l, icon: ui().sort === k ? 'check' : ic, run: () => { ui().sort = k; D.render(); } }))));
  A('ib-chpick', (el) => D.menu(el, [{ label: 'All numbers', icon: 'chat', check: ui().ch === 'all', hint: String(threads().length), run: () => { ui().ch = 'all'; D.render(); } }].concat((S().channels || []).map((c) => ({ label: (c.name || (CH[c.type] || CH.web)[2]) + (c.number ? ' · ' + c.number : ''), icon: (CH[c.type] || CH.web)[0], check: ui().ch === (c.id || c.type), hint: String(threads().filter((t) => t.channel === c.type).length), run: () => { ui().ch = c.id || c.type; D.render(); } }))), { match: true }));
  A('ib-transcript', (el) => { const v = ui().voiceOpen; v[el.dataset.arg] = !v[el.dataset.arg]; ui().stick = false; D.render(); });
  A('ib-earlier', () => { ui().expanded = true; ui().stick = false; D.render(); });
  A('ib-auto', () => { ui().auto = !ui().auto; D.toast(ui().auto ? 'Anuma will auto-reply to simulated customer messages' : 'Auto-reply off', 'sparkle'); ui().stick = false; D.render(); });
  A('ib-csearch', () => { const u = ui(); u.csearch = !u.csearch; if (!u.csearch) u.cq = ''; u.stick = false; D.render(); });
  A('ib-resum', () => { D.toast('Summary refreshed', 'sparkle'); ui().stick = false; D.render(); });
  D.input('ib-q', (v) => { ui().q = v; ui().stick = false; D.render(); });
  D.input('ib-cq', (v) => { ui().cq = v; ui().stick = false; D.render(); });
  D.input('ib-draft', (v, el) => { const t = cur(); if (t) ui().draft[t.id] = v; el.style.height = 'auto'; el.style.height = Math.min(110, el.scrollHeight) + 'px'; });
  A('ib-handback', () => { const t = cur(); if (!t) return; t.owner = 'anuma'; if (t.status === 'hold') t.status = 'open'; sys(t, 'handed back the conversation to Anuma', me().name); push(t, { from: 'anuma', type: 'text', text: 'Thanks — I’ll take it from here and keep the customer posted.' }); D.toast('Handed back to Anuma', 'bot'); D.render(); });
  A('ib-status', (el) => { const t = cur(); if (!t) return; const set = (s, l) => () => { t.status = s; sys(t, 'set status to ' + l, me().name); D.toast('Case ' + l.toLowerCase()); D.render(); }; D.menu(el, [['open', 'Open', 'check'], ['hold', 'On hold', 'clock'], ['closed', 'Closed', 'x']].map(([s, l, ic]) => ({ label: l, icon: t.status === s ? 'check' : ic, run: set(s, l) }))); });
  A('ib-send', () => { const t = cur(), u = ui(); const v = (u.draft[t.id] || '').trim(); if (!v) return D.toast('Type a message first', 'info'); if (t.owner === 'anuma') { t.owner = me().id; sys(t, 'assigned conversation to self', me().name); } push(t, { from: me().id, type: 'text', text: v, meta: { sentAt: Date.now() } }); u.draft[t.id] = ''; u.stick = true; D.render(); setTimeout(() => refreshStream(), 700); if (u.auto) setTimeout(() => simulate(t.id), 1100); });
  document.addEventListener('keydown', (e) => { if (e.target && e.target.id === 'ib-ta' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); D.acts['ib-send'](); } });
  A('ib-suggest', () => { const t = cur(); const last = [...(t.messages || [])].reverse().find((m) => m.from === 'customer' && m.text); const p = party(t.partyId); ui().draft[t.id] = `Hi ${((contact(t.contactId) || {}).name || p.name || 'there').split(' ')[0]}, thanks for the details${last ? ' on “' + last.text.slice(0, 40) + (last.text.length > 40 ? '…' : '') + '”' : ''}. I’ve noted everything and will confirm availability and pricing shortly.`; D.toast('Anuma drafted a reply', 'sparkle'); ui().stick = false; D.render(); });
  A('ib-quick', (el) => { const T = (S().templates || []).filter((x) => x.status === 'approved').slice(0, 6); const t = cur(); D.menu(el, (T.length ? T : [{ name: 'Acknowledge', body: 'Thanks — we’ve received this and will revert shortly.' }]).map((x) => ({ label: x.name, icon: 'zap', run: () => { ui().draft[t.id] = x.body; ui().stick = false; D.render(); } }))); });
  A('ib-attach', (el) => { const t = cur(); const add = (m) => { push(t, Object.assign({ from: me().id }, m)); ui().stick = true; D.render(); }; D.menu(el, [{ label: 'Image', icon: 'image', run: () => add({ type: 'image', text: 'Reference photo', meta: { swatch: '#d6c7b0' } }) }, { label: 'Voice note', icon: 'mic', run: () => add({ type: 'voice', text: '', meta: { seconds: 14, transcript: 'Sharing the dispatch details in the voice note.' } }) }, { label: 'File (PDF)', icon: 'file', run: () => add({ type: 'file', meta: { name: 'Price-list-Oct-2026.pdf', size: '184 KB' } }) }]); });
  A('ib-sim', () => simulate(ui().sel, true));
  const CUST = ['Ok, please go ahead.', 'Can you share the best rate for 500+ units?', 'Delivery kab tak hoga?', 'Thanks, received. Will confirm payment today.', 'Please add 10 more of the same.'];
  function simulate(id) {
    const t = threads().find((x) => x.id === id); if (!t) return; const u = ui(); const text = CUST[hash(t.id + (t.messages || []).length) % CUST.length];
    push(t, { from: 'customer', type: 'text', text }); if (t.id !== u.sel) t.unread = (t.unread || 0) + 1; if (t.status === 'closed') { t.status = 'open'; sys(t, 'reopened the case — customer replied'); } u.stick = true; D.render();
    if (u.auto && t.owner === 'anuma') setTimeout(() => { const r = /rate|price/i.test(text) ? 'For 500+ units I can offer a slab rate — sharing a revised quote in a moment.' : /deliver|kab/i.test(text) ? 'Dispatch is planned within 2 working days of confirmation; I’ll share the tracking link.' : /pay/i.test(text) ? 'Noted — I’ll mark the order as payment-pending until it reflects.' : 'Done — I’ve updated the order and will confirm shortly.'; push(t, { from: 'anuma', type: 'text', text: r }); D.render(); }, 500);
  }
  A('ib-new', () => D.go('/inbox/threads'));
  A('ib-chfilter', (el) => { ui().ch = el.dataset.arg; ui().tab = 'all'; D.go('/inbox/threads'); });
  A('ib-chtest', (el) => D.toast('Test message sent via ' + el.dataset.arg, 'send'));
  A('ib-choice', (el) => { const t = cur(); push(t, { from: 'customer', type: 'text', text: el.dataset.arg, meta: { choice: true } }); ui().stick = true; D.render(); });

  /* interactive Confirm / Edit / Cancel */
  A('ib-opt', (el) => {
    const t = cur(), [mid, opt] = el.dataset.arg.split('|'), m = (t.messages || []).find((x) => x.id === mid); if (!m) return;
    (t.answered = t.answered || {})[mid] = true; push(t, { from: 'customer', type: 'text', text: opt, meta: { choice: true, quoteOf: mid } });
    const d = t.draftId && D.by(S().drafts, t.draftId), n = (m.meta.lines || []).length;
    if (opt === 'Confirm') {
      if (d && d.status === 'pending') d.status = 'approved'; if (d) (d.lines || []).forEach((l) => { if (l.state !== 'flagged') l.state = 'confirmed'; });
      const ref = (d && d.no) || (t.orderId && (D.by(S().orders, t.orderId) || {}).no) || 'your order';
      push(t, { from: 'anuma', type: 'text', text: `Received. ${ref}, ${n} line${n === 1 ? '' : 's'}.` });
      push(t, { from: 'system', type: 'comment', text: `Resolution summary — Converted to ${ref}.\n` + (m.meta.lines || []).map((l, i) => `${l.n || i + 1}. ${l.name} — ${l.qty ?? '–'} ${l.unit || ''}`).join('\n'), meta: { actor: 'Anuma' } });
      sys(t, `closed — Intake enquiry converted → ${ref}`); t.status = 'closed'; D.toast('Order confirmed · ' + ref, 'check');
    } else if (opt === 'Edit') { push(t, { from: 'anuma', type: 'text', text: 'Which line?' }); t.answered[mid] = false; D.toast('Anuma asked which line to change', 'info'); }
    else { if (d) d.status = 'rejected'; push(t, { from: 'anuma', type: 'text', text: 'Cancelled. Nothing was sent to the team.' }); sys(t, 'closed — enquiry cancelled by customer'); t.status = 'closed'; D.toast('Order cancelled', 'x'); }
    ui().stick = true; D.render();
  });

  /* drawers: comments + orders */
  function commentsDrawer() {
    const t = cur(); if (!t) return; const C = (t.messages || []).filter((m) => m.type === 'comment');
    D.drawer({ title: `Comments · ${esc(caseNo(t))}`, body: `<div class="col" style="gap:10px">${C.map((m) => `<div class="cmt" style="width:100%;align-self:stretch"><div class="ch">${I('chat')}<b>${esc((m.meta || {}).actor || userName(m.from))}</b><span class="ts">${esc(dayLabel(m.at))}, ${tf(m.at)}</span></div><div class="cb">${esc(m.text)}</div></div>`).join('') || '<div class="muted sm">No comments yet. Comments are internal — the customer never sees them.</div>'}
      <div class="field" style="margin-top:6px"><label>Add a comment</label><textarea class="textarea" id="cm-ta" rows="3" placeholder="Visible to your team only"></textarea></div><div class="row"><button class="btn right" data-act="ib-addcomment">${I('plus')} Add comment</button></div></div>` });
  }
  A('ib-comments', commentsDrawer);
  A('ib-addcomment', () => { const ta = document.getElementById('cm-ta'), v = ta && ta.value.trim(); if (!v) return D.toast('Write a comment first', 'info'); push(cur(), { from: me().id, type: 'comment', text: v, meta: { actor: me().name } }); D.closeDrawer(); ui().stick = true; D.render(); D.toast('Comment added'); });
  A('ib-orders', () => {
    const t = cur(); if (!t) return; if (!t.partyId) return D.toast('No orders — this sender is not in the CRM yet', 'info');
    const O = (S().orders || []).filter((o) => o.partyId === t.partyId), Dr = (S().drafts || []).filter((d) => d.partyId === t.partyId);
    const r = (kind, x, url) => `<div class="listrow" data-go="${url}" style="border:1px solid var(--border);border-radius:10px;margin-bottom:8px"><span class="icotile">${I(kind === 'o' ? 'clipboard' : 'file')}</span><div class="grow"><div class="row"><b class="mono sm">${esc(x.no)}</b>${D.status(x.status, ['confirmed', 'delivered', 'posted', 'approved', 'shipped'].includes(x.status) ? 'green' : x.status === 'cancelled' || x.status === 'rejected' ? 'red' : 'amber')}</div><div class="xs muted">${D.fmt.date(x.placedAt || x.createdAt)} · ${(x.lines || []).length} lines</div></div><b class="mono sm">${D.fmt.inr(x.total)}</b></div>`;
    D.drawer({ title: `Orders · ${esc(nameOf(t))}`, body: `${Dr.length ? '<div class="sect" style="margin-top:0">Draft orders</div>' + Dr.map((d) => r('d', d, '/orders/drafts/' + d.id)).join('') : ''}${O.length ? '<div class="sect">Orders</div>' + O.map((o) => r('o', o, '/orders/' + o.id)).join('') : ''}${!O.length && !Dr.length ? D.empty('clipboard', 'No orders yet', 'Orders for this party show up here.') : ''}` });
  });
  A('ib-template', () => {
    const t = cur(); const T = (S().templates || []).filter((x) => x.status === 'approved' && (!x.channel || x.channel === 'whatsapp')); const L = T.length ? T : [{ id: 'tp-a', name: 'order_followup', body: 'Hi, this is a follow-up on your recent enquiry. Reply here to continue.' }, { id: 'tp-b', name: 'catalogue_share', body: 'Hello! Here is our latest catalogue. Reply with the items you need.' }];
    D.modal({ title: 'Send a template', body: `<p class="sm muted" style="margin-bottom:10px">The 24-hour window is closed, so only approved templates can be delivered.</p><div class="col">${L.map((x, i) => `<div class="listrow" data-tpl="${i}" style="border:1px solid var(--border);border-radius:10px"><span class="icotile">${I('file')}</span><div class="grow"><div class="b sm">${esc(x.name)}</div><div class="xs muted">${esc((x.body || '').slice(0, 120))}</div></div><button class="btn outline sm" data-tpl="${i}">Send</button></div>`).join('')}</div>`,
      onMount(mo) { mo.addEventListener('click', (e) => { const r = e.target.closest('[data-tpl]'); if (!r) return; const x = L[+r.dataset.tpl]; D.closeModal(); push(t, { from: me().id, type: 'text', text: x.body, meta: { template: x.name } }); ui().stick = true; D.toast('Template “' + x.name + '” sent', 'send'); D.render(); }); } });
  });

  /* review / catalogue */
  function resolve(msgId, prod, how) {
    const t = cur(), m = (t.messages || []).find((x) => x.id === msgId); if (!m) return;
    (t.resolutions = t.resolutions || {})[msgId] = { productId: prod.productId || prod.id, name: prod.name, by: me().id, how, at: tf(nowIso()) };
    const lf = linesFor(t);
    if (lf && lf.kind === 'draft') { const ln = lf.lines.find((l) => l.state === 'flagged' || l.state === 'pending') || null; if (ln) { ln.productId = prod.productId || prod.id; ln.name = prod.name; ln.state = 'confirmed'; const pr = D.by(S().products, ln.productId); if (pr && !ln.price) ln.price = pr.price; recalc(lf.ref); } }
    push(t, { from: 'anuma', type: 'text', text: `Confirmed with ${userName(me().id)}: ${prod.name}. I’ve added it to your order.` });
    ui().stick = true; D.toast('Match sent to customer'); D.render();
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
  A('ib-mkdraft', () => { const t = cur(); const d = ensureDraft(t, true); sys(t, 'started draft order ' + d.no, 'Anuma'); D.toast('Draft order ' + d.no + ' created', 'file'); D.render(); });
  A('ib-addline', () => { const t = cur(); const d = ensureDraft(t); pickProduct((p) => { d.lines.push({ productId: p.id, name: p.name, qty: 1, unit: p.unit, price: p.price, state: 'confirmed' }); recalc(d); ui().stick = false; D.render(); }, 'Add a line'); });
  A('ib-qty', (el) => { const d = ensureDraft(cur()); const [i, dl] = el.dataset.arg.split(':').map(Number); d.lines[i].qty = Math.max(1, (d.lines[i].qty || 1) + dl); recalc(d); ui().stick = false; D.render(); });
  A('ib-rmline', (el) => { const d = ensureDraft(cur()); d.lines.splice(+el.dataset.arg, 1); recalc(d); ui().stick = false; D.render(); });
  A('ib-approve', () => { const t = cur(), d = ensureDraft(t); d.status = 'approved'; sys(t, 'approved draft ' + d.no, me().name); D.toast('Draft approved', 'check'); D.render(); });
  A('ib-sendsum', () => { const t = cur(), d = ensureDraft(t); push(t, { from: me().id, type: 'card', text: 'Please confirm your order:', meta: { kind: 'summary', title: 'Order summary ' + d.no, lines: d.lines, total: d.total, options: ['Confirm', 'Edit', 'Cancel'] } }); ui().stick = true; D.toast('Summary sent to customer', 'send'); D.render(); });
  A('ib-mkdeal', () => { const t = cur(), p = party(t.partyId); const l = { id: D.uid('L'), title: (t.subject || 'New enquiry') + ' — ' + p.name, partyId: t.partyId, stage: 'New', value: (linesFor(t) || { lines: [] }).lines.reduce((a, x) => a + (x.qty || 0) * (x.price || 0), 0), owner: t.owner === 'anuma' ? me().id : t.owner, source: (CH[t.channel] || CH.web)[2], createdAt: nowIso(), closeAt: '2026-11-15', notes: '' }; (S().leads = S().leads || []).unshift(l); t.dealId = l.id; D.toast('Deal created', 'handshake'); D.render(); });
})();
