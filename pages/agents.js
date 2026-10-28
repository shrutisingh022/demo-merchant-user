/* Agents — list, create/edit dialogs, detail (Overview · Training · Test mode · Activity log). Spec: docs/spec/workspace.md §1. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc;
  const st = document.createElement('style'); st.dataset.for = 'agents';
  st.textContent = `
  .ag-h{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.ag-h h1{font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:28px}.ag-h p{font-size:12px;color:#737373;margin-top:2px}.ag-h .acts{margin-left:auto}
  .ag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .agcard{border:1px solid var(--border);border-radius:10px;background:#fff;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:box-shadow .15s,border-color .15s,transform .15s}
  .agcard:hover{border-color:#cfcfcf;box-shadow:0 2px 8px rgba(0,0,0,.05);transform:translateY(-1px)}
  .agcard .top{display:flex;align-items:center;gap:12px;padding:12px 12px 12px 12px;min-height:64px}
  .agcard .nm{font-size:12px;font-weight:600;line-height:16px}.agcard .sb{font-size:12px;color:#737373;line-height:16px}
  .agcard .ft{border-top:1px solid var(--border);background:#fafafa;padding:0 12px;height:36px;display:flex;align-items:center;gap:8px;font-size:12px;color:#737373;min-width:0}
  .agcard .ft b{color:#171717;font-weight:600}
  .agcard.new{border-style:dashed;align-items:center;justify-content:center;min-height:111px;color:#525252;gap:2px;font-size:12px;font-weight:500;background:transparent}.agcard.new:hover{background:#fafafa}.agcard.new svg.i{width:16px;height:16px}
  .agmark{display:inline-grid;place-items:center;background:#0a0a0a;border-radius:10px;flex:none}.agmark svg{display:block}
  .wa-tile{width:20px;height:20px;border-radius:6px;background:#1daa68;color:#fff;display:inline-grid;place-items:center;flex:none}.wa-tile svg.i{width:12px;height:12px}
  .ag-type{display:flex;flex-direction:column;gap:8px}
  .ag-radio{display:flex;align-items:center;gap:12px;border:1px solid var(--border);border-radius:10px;padding:8px 12px;height:48px;text-align:left;width:100%;transition:border-color .12s,box-shadow .12s}.ag-radio:hover{background:#fafafa}
  .ag-radio.on{border-color:#0a0a0a;box-shadow:0 0 0 1px #0a0a0a inset}.ag-radio b{font-size:12px;font-weight:500;display:block}.ag-radio span.d{font-size:12px;color:#737373}
  .ag-radio .tile{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:#fff;flex:none}
  .ag-back{margin:-4px 0 12px -8px}
  .ag-title{display:flex;align-items:center;gap:12px}.ag-title h1{font-size:20px;font-weight:600;letter-spacing:-.01em}
  .ag-lives{display:flex;align-items:center;gap:8px;margin:8px 0 16px 52px;font-size:12px;color:#737373}
  .ag-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:10px;height:24px;padding:0 8px;font-size:12px;color:#171717;background:#fff}
  .ag-ov{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:16px;align-items:start}
  .ag-banner{display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:12px;background:#fafafa}.ag-banner .i{width:14px;height:14px;color:#737373}
  .ag-card{border:1px solid var(--border);border-radius:10px;background:#fff}
  .ag-card>.hd{padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;min-height:33px;display:flex;align-items:center}
  .ag-card>.bd{padding:12px}
  .ag-sec h4{font-size:12px;font-weight:500;margin:0 0 6px}.ag-sec{margin-bottom:16px}.ag-sec:last-child{margin-bottom:0}
  .ptag{display:inline-block;font-size:10px;font-weight:500;line-height:16px;padding:0 8px;border-radius:999px;background:#f1f1f1;color:#525252;margin:6px 0 4px}.ptag.me{background:#e4e4e4;color:#262626}
  .ag-sec ul{list-style:none;padding:0;margin:0}.ag-sec li{font-size:12px;line-height:1.5;padding-left:14px;position:relative;margin-bottom:3px}.ag-sec li::before{content:'•';position:absolute;left:3px;color:#737373}
  .ag-meta .row2{display:flex;flex-direction:column;gap:4px;margin-top:12px}.ag-meta .lb{font-size:12px;color:#737373}
  .ag-box{border:1px solid var(--border);border-radius:8px;padding:6px 8px;font-size:12px;background:#fff}
  .ag-chat{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto}
  .ag-u{align-self:flex-end;max-width:62%;background:#f5f5f5;border-radius:10px;padding:8px 12px;font-size:12px;line-height:1.5}
  .ag-a{align-self:flex-start;max-width:70%;background:#fff;border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:12px;line-height:1.5;white-space:pre-wrap}
  .ag-ts{font-size:11px;color:#737373;margin-top:2px}.ag-ts.r{text-align:right}
  .ag-rule{align-self:flex-start;max-width:72%;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:#fff;font-size:12px}
  .ag-rule .rh{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--border);background:#fafafa;font-weight:500}
  .ag-rule .rb{padding:8px 10px;line-height:1.5}.ag-rule .rb .o{color:#737373;text-decoration:line-through}
  .diff{display:inline-flex;gap:4px;font-size:10.5px;font-weight:600;margin-left:auto}.diff .p{color:#13a269}.diff .m{color:#e03a3a}
  .ag-comp{border-top:1px solid var(--border);padding:12px;display:flex;flex-direction:column;gap:6px}
  .ag-ta{display:flex;flex-direction:column;border:1px solid var(--input);border-radius:10px;padding:8px;transition:border-color .12s,box-shadow .12s}.ag-ta:focus-within{border-color:#a3a3a3;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
  .ag-ta textarea{border:0;outline:0;resize:none;font-size:12px;min-height:36px;font-family:inherit;background:transparent}
  .ag-ta .ar{display:flex;align-items:center;gap:6px}
  .ag-test{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}
  .ag-tchat{height:calc(100vh - 262px);min-height:420px;display:flex;flex-direction:column;overflow:hidden}
  .ag-tchat .wall{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:8px}
  .ag-wb{max-width:72%;padding:7px 10px;border-radius:10px;font-size:12px;line-height:1.5;box-shadow:0 1px 1px rgba(0,0,0,.06);white-space:pre-wrap}
  .ag-wb.c{align-self:flex-end;background:var(--bubble-out);color:var(--bubble-out-fg)}.ag-wb.a{align-self:flex-start;background:#fff}
  .ag-wb .btns{display:flex;flex-direction:column;margin:6px -10px -7px;border-top:1px solid rgba(0,0,0,.08)}.ag-wb .btns button{padding:7px;font-size:12px;font-weight:500;color:#0b6bcb;border-top:1px solid rgba(0,0,0,.06)}.ag-wb .btns button:first-child{border-top:0}.ag-wb .btns button:hover{background:rgba(0,0,0,.04)}
  .chip-amber{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;height:22px;padding:0 8px;border-radius:999px;background:#fefce8;color:#9a6208;border:1px solid #f1e3a8}.chip-amber svg.i{width:12px;height:12px}
  .ag-day{font-size:12px;font-weight:500;color:#737373;margin:14px 0 6px}.ag-day:first-child{margin-top:0}
  .ag-act{display:flex;align-items:flex-start;gap:10px;padding:6px 0}.ag-act .t{width:24px;height:24px;border-radius:50%;background:#f5f5f5;display:grid;place-items:center;flex:none;color:#525252}.ag-act .t svg.i{width:12px;height:12px}
  .ag-act .x{font-size:12px;line-height:16px;padding-top:4px}.ag-act .m{font-size:12px;color:#737373}
  .ag-used{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--border);font-size:12px}.ag-used:first-child{border-top:0}
  @media(max-width:1100px){.ag-ov,.ag-test{grid-template-columns:1fr}.ag-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(st);

  const U = (DM.ui.ag = DM.ui.ag || { seen: {}, typing: null, draft: '', test: {}, testDraft: '', used: {}, testTyping: null });
  const S = () => DM.S;
  const agents = () => S().agents || (S().agents = []);
  const byId = (id) => agents().find((a) => a.id === id);
  const MARK = (n = 40) => `<span class="agmark" style="width:${n}px;height:${n}px;border-radius:${Math.round(n / 4)}px"><svg viewBox="0 0 32 32" width="${Math.round(n * .7)}" height="${Math.round(n * .7)}"><circle cx="10.5" cy="16" r="2.3" fill="#fff"/><rect x="15" y="13.8" width="8.5" height="4.4" rx="2.2" fill="#fff"/></svg></span>`;
  DM.agentMark = MARK;
  const TYPES = { chat: { label: 'Chat', icon: 'whatsapp', d: 'WhatsApp, and any messenger. Short replies.', color: '#1daa68' }, voice: { label: 'Voice', icon: 'phone', d: 'Phone and WhatsApp calls.', color: '#2563eb' }, email: { label: 'Email', icon: 'mail', d: 'Long replies, with the full description.', color: '#ea4335' } };
  const tile = (type) => `<span class="wa-tile" style="background:${(TYPES[type] || TYPES.chat).color}">${I((TYPES[type] || TYPES.chat).icon)}</span>`;
  const NOW = () => DM.now().getTime();
  const ago = (iso) => { const m = Math.max(0, Math.round((NOW() - new Date(iso).getTime()) / 60000)); if (m < 1) return 'just now'; if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago'); const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago'); const d = Math.round(h / 24); if (d < 30) return d + (d === 1 ? ' day ago' : ' days ago'); const mo = Math.round(d / 30); return mo + (mo === 1 ? ' month ago' : ' months ago'); };
  const nowIso = () => DM.now().toISOString();
  const channelsOf = (a) => { const c = (S().channels || []).filter((x) => x.agentId === a.id).map((x) => x.name); return c.length ? c : a.channelNames || []; };
  const livesLabel = (a) => { const c = channelsOf(a); return c.length ? esc(c[0]) + (c.length > 1 ? ` and ${c.length - 1} more` : '') : ''; };
  const bold = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const stat = (a) => DM.status(a.status === 'live' ? 'Live' : 'Draft', a.status === 'live' ? 'green' : 'grey');
  const fmtDay = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toLowerCase();
  const TABS = [{ key: 'overview', label: 'Overview' }, { key: 'training', label: 'Training' }, { key: 'test-mode', label: 'Test mode' }, { key: 'activity-log', label: 'Activity log' }];
  const tabKey = (t) => ({ test: 'test-mode', activity: 'activity-log' }[t] || t || 'overview');

  /* ───────── list ───────── */
  const card = (a) => {
    const lv = livesLabel(a);
    return `<div class="agcard" data-go="/agents/${a.id}/overview" data-rid="${a.id}"><div class="top">${MARK(40)}<div class="grow" style="min-width:0"><div class="nm trunc">${esc(a.name)}</div><div class="sb">Updated ${ago(a.updatedAt)}</div></div>${stat(a)}<button class="btn ghost icon sm" data-act="ag-menu" data-arg="${a.id}" title="More">${I('more')}</button></div><div class="ft">${lv ? `${tile(a.type)}<span>Lives in</span><b class="trunc">${lv}</b>` : '<span>Not on a channel yet</span>'}</div></div>`;
  };
  DM.page('/agents', { title: 'Agents', render() {
    const L = agents();
    return `<div class="page narrow"><div class="ag-h"><div><h1>Agents</h1><p>Agents answer your customers on a channel and follow the shared rulebook.</p></div><div class="acts"><button class="btn" data-act="ag-new">${I('plus')} Create</button></div></div><div class="ag-grid stagger">${L.map(card).join('')}<button class="agcard new" data-act="ag-new">${I('plus')}<span>Create</span></button></div></div>`;
  } });

  const typeCards = (cur) => `<div class="ag-type">${Object.entries(TYPES).map(([k, t]) => `<button type="button" class="ag-radio ${k === cur ? 'on' : ''}" data-type="${k}"><span class="tile" style="background:${t.color}">${I(t.icon)}</span><span><b>${t.label}</b><span class="d">${t.d}</span></span></button>`).join('')}</div>`;
  const agentDialog = (a) => {
    let type = a ? a.type : 'chat';
    DM.dialog({ title: a ? 'Edit agent' : 'New agent', sub: a ? 'Rename it or change its type.' : 'A name and a type. The channel decides where it answers.', w: 520,
      body: `<div class="field"><label>Name</label><input class="input" name="name" placeholder="e.g. WhatsApp order desk" value="${esc(a ? a.name : '')}" autocomplete="off"></div><div class="field" style="margin-top:12px"><label>Type</label>${typeCards(type)}</div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: a ? 'Save changes' : 'Create draft', run: (d) => {
        const name = d.querySelector('[name=name]').value.trim(); if (!name) return false;
        if (a) { a.name = name; a.type = type; a.updatedAt = nowIso(); DM.toast('Agent updated'); DM.render(); return; }
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 5);
        agents().push({ id, name, status: 'draft', type, description: '', updatedAt: nowIso(), channelNames: [], instructions: { firstMessage: '', does: [], agentOnly: [], never: [], helpers: [] }, training: [], activity: [{ id: 'ac-1', at: nowIso(), kind: 'created', text: 'Created Agent: ' + name, actor: 'Rohan Mehta' }] });
        DM.toast('Draft created'); DM.go('/agents/' + id + '/overview');
      } }],
      onMount: (d) => {
        const btn = d.querySelectorAll('.modal-f button')[1]; const inp = d.querySelector('[name=name]'); const sync = () => { btn.disabled = !inp.value.trim(); btn.style.opacity = btn.disabled ? '.4' : ''; btn.style.pointerEvents = btn.disabled ? 'none' : ''; }; inp.addEventListener('input', sync); sync();
        d.addEventListener('click', (e) => { const r = e.target.closest('.ag-radio'); if (!r) return; type = r.dataset.type; d.querySelectorAll('.ag-radio').forEach((x) => x.classList.toggle('on', x === r)); });
      } });
  };
  DM.act('ag-new', () => agentDialog(null));
  DM.act('ag-menu', (el) => { const a = byId(el.dataset.arg); if (!a) return; DM.menu(el, [{ label: 'Edit', icon: 'pencil', run: () => agentDialog(a) }, { label: 'Delete', icon: 'trash', danger: true, run: () => DM.dialog({ title: `Delete ${esc(a.name)}?`, sub: 'This removes the agent and its training. Channels it answered on will have no agent.', w: 440, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Delete', cls: 'danger', run: () => { S().agents = agents().filter((x) => x.id !== a.id); DM.toast('Agent deleted'); DM.go('/agents'); } }] }) }], { w: 144, right: true }); });

  /* ───────── detail shell ───────── */
  const header = (a, tab) => {
    const lv = livesLabel(a);
    return `<button class="btn ghost sm ag-back" data-go="/agents">${I('arrowL')} Back to agents</button>
    <div class="ag-title">${MARK(40)}<h1>${esc(a.name)}</h1>${stat(a)}</div>
    <div class="ag-lives">${lv ? `<span>Lives in</span><span class="ag-pill">${tile(a.type)}${lv}</span>` : '<span>Not on a channel yet — attach it from Channels</span>'}</div>
    ${DM.seg(TABS, tab, 'ag-tab')}`;
  };
  DM.act('ag-tab', (el) => { const id = DM.path().split('/')[2]; DM.go(`/agents/${id}/${el.dataset.arg}`); });

  /* ───────── overview ───────── */
  const bullets = (items) => `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const groups = (gs) => gs.map((g) => `<div><span class="ptag">${esc(g.tag)}</span>${bullets(g.items)}</div>`).join('');
  const overview = (a) => {
    const ins = a.instructions || {}; const empty = !(ins.does || []).length && !(ins.agentOnly || []).length && !(ins.never || []).length && !(ins.helpers || []).length && !ins.firstMessage;
    const lv = livesLabel(a);
    const left = empty
      ? `<div class="ag-card"><div class="hd">Instructions</div><div class="bd">${DM.empty('sparkle', 'Nothing set up here yet', 'What this agent does, the way it opens a conversation, and the rules it follows all get written in Training. They show up here once they exist.', { style: 'border:0;padding:36px 16px', action: `<button class="btn outline sm" style="margin-top:12px" data-go="/agents/${a.id}/training">Go to Training</button>` })}</div></div>`
      : `<div class="ag-card"><div class="hd">Instructions</div><div class="bd">
        ${ins.firstMessage ? `<div class="ag-sec"><h4>First message</h4><p style="font-size:12px">${esc(ins.firstMessage)}</p></div>` : ''}
        <div class="ag-sec"><h4>What it does</h4>${groups(ins.does || [])}${(ins.agentOnly || []).length ? `<div><span class="ptag me">This agent only</span>${bullets(ins.agentOnly)}</div>` : ''}</div>
        ${(ins.never || []).length ? `<div class="ag-sec"><h4>What it never does</h4>${groups(ins.never)}<p class="muted" style="font-size:12px;margin-top:8px">Platform safety guardrails always apply on top of these, and can't be switched off.</p></div>` : ''}
        ${(ins.helpers || []).length ? `<div class="ag-sec"><h4>Facts that help it read a message</h4>${bullets(ins.helpers)}</div>` : ''}</div></div>`;
    return `<div class="ag-ov stagger"><div><div class="ag-banner">${I('lockk')}<span class="grow">Instructions are read-only. Update them in Training.</span><button class="btn outline sm" data-go="/agents/${a.id}/training">${I('pencil')} Edit in Training</button></div>${left}</div>
      <div class="ag-card ag-meta"><div class="bd"><div class="row" style="gap:10px">${tile(a.type)}<div><b style="font-size:12px">${esc(a.name)}</b><div class="muted" style="font-size:12px">${esc(a.description || 'No description yet.')}</div></div></div>
      <div class="row2"><span class="lb">Type</span><span class="ag-pill" style="align-self:flex-start">${tile(a.type)}${(TYPES[a.type] || TYPES.chat).label}</span></div>
      <div class="row2"><span class="lb">Lives in</span><div class="ag-box">${lv || '<span class="muted">Not on a channel yet</span>'}</div></div></div></div></div>`;
  };

  /* ───────── training ───────── */
  const trainMsgs = (a) => {
    const seen = U.seen['t:' + a.id] || 0; let out = '';
    (a.training || []).forEach((m, i) => {
      const cls = i >= seen && U.seen['t:' + a.id] !== undefined ? ' msg-new' : '';
      if (m.role === 'user') out += `<div class="${cls}" style="align-self:flex-end;max-width:62%"><div class="ag-u">${esc(m.text)}</div><div class="ag-ts r">${ago(m.at)}</div></div>`;
      else if (m.role === 'agent') out += `<div class="${cls}" style="align-self:flex-start;max-width:70%"><div class="ag-a">${bold(m.text)}</div><div class="ag-ts">${ago(m.at)}</div></div>`;
      else out += `<div class="ag-rule${cls}"><div class="rh">${I(m.kind === 'new' ? 'fileplus' : 'fileedit')} ${m.kind === 'new' ? 'New rule' : 'Updated rule'}<span class="diff"><span class="p">+${m.plus}</span><span class="m">−${m.minus}</span></span></div><div class="rb">${m.kind === 'updated' ? `Updated: “<span class="o">${esc(m.from)}</span>” → “${esc(m.to)}”` : esc(m.to)}</div></div>`;
    });
    if (U.typing === a.id) out += `<div class="typing"><i></i><i></i><i></i></div>`;
    return out;
  };
  const training = (a) => {
    const has = (a.training || []).length || U.typing === a.id;
    return `<div class="ag-card" style="display:flex;flex-direction:column;height:calc(100vh - 236px);min-height:440px"><div class="hd" style="display:block;padding:12px 16px;height:auto"><div style="font-size:14px;font-weight:500">Train your agent</div><div class="muted" style="font-size:12px">Teach it how to respond. Rule changes appear in this conversation.</div></div>
      <div class="ag-chat grow" id="ag-chat">${has ? trainMsgs(a) : DM.empty('sparkle', 'Nothing here yet', `Tell Anuma what ${a.name} should do, in your own words. Each thing you say becomes one of its rules straight away.`, { style: 'border:0;margin:auto' })}</div>
      <div class="ag-comp"><div class="ag-ta"><textarea data-input="ag-train" rows="2" placeholder="Tell Anuma how to behave, in plain English">${esc(U.draft)}</textarea><div class="ar"><button class="btn ghost icon sm" data-act="ag-attach" title="Attach a file — coming soon">${I('paperclip')}</button><span class="grow"></span><button class="btn sm" data-act="ag-send" ${U.draft.trim() ? '' : 'disabled'}>Send ${I('send')}</button></div></div></div></div>`;
  };
  const tokens = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
  const cap = (s) => { s = s.trim().replace(/^(also|please|and|then)\s+/i, ''); s = s.charAt(0).toUpperCase() + s.slice(1); return /[.!?]$/.test(s) ? s : s + '.'; };
  const trainReply = (a, text) => {
    const t = text.trim(); const ins = a.instructions; const now = nowIso();
    const push = (m) => a.training.push({ id: 'tr-' + (a.training.length + 1), at: now, ...m });
    const log = (kind, txt) => { (a.activity = a.activity || []).unshift({ id: 'ac-' + (a.activity.length + 1) + Math.random().toString(36).slice(2, 4), at: now, kind, text: txt, actor: 'Rohan Mehta' }); };
    if (/https?:\/\/|www\./i.test(t)) return push({ role: 'agent', text: "I can't open external links or artifacts — paste the instruction here and I'll turn it into a rule." });
    if (/^rules\??$/i.test(t)) return push({ role: 'agent', text: 'That\'s handled separately, so I won\'t list them here — but feel free to ask me to change or add a specific rule, like "stop asking for delivery address."' });
    if (/\b(what|which|show|list)\b.*\brules?\b|\bcurrent rules\b/i.test(t)) { const r = ins.agentOnly || []; return push({ role: 'agent', text: r.length ? `**Rules (${r.length}):** ` + r.map((x, i) => `${i + 1}. ${x}`).join(' ') : `${a.name} has no rules of its own yet. Tell me something it should always or never do.` }); }
    if (/^(you are|you're|this agent|the agent is|this is an? )/i.test(t)) return push({ role: 'agent', text: 'That looks like a description rather than an instruction for the agent 🙂 Try telling me what to do, like "keep replies to one short sentence."' });
    const m = t.match(/^(?:change|update|replace)\s+(.*?)\s+(?:to|with|so that)\s+(.+)$/i);
    const instr = /^(never|always|don'?t|do not|stop|keep|use|treat|ask|send|reply|say|greet|combine|only|make|avoid|when|if|also|please|read|write|round|add|include|skip)\b|\bshould\b/i.test(t);
    if (m) { const base = tokens(m[1]); let best = null, bs = 0; (ins.agentOnly || []).forEach((r) => { const s = tokens(r).filter((w) => base.includes(w)).length; if (s > bs) { bs = s; best = r; } }); const nr = cap(m[2]); if (best && bs >= 1) { ins.agentOnly[ins.agentOnly.indexOf(best)] = nr; push({ role: 'rule', kind: 'updated', from: best, to: nr, plus: 1, minus: 1 }); push({ role: 'agent', text: `Updated. I'll follow: "${nr}"` }); log('rule', `Updated rule: "${nr}" (+1 -1)`); log('guideline', `Updated Agent: ${a.name} (Changed fields: guidelines)`); return; } }
    if (instr || m) { const nr = cap(m ? m[2] : t); (ins.agentOnly = ins.agentOnly || []).push(nr); push({ role: 'rule', kind: 'new', to: nr, plus: 1, minus: 0 }); push({ role: 'agent', text: `Got it — I'll remember: "${nr}"` }); log('rule', `New rule: "${nr}" (+1 -0)`); log('guideline', `Updated Agent: ${a.name} (Changed fields: guidelines)`); a.updatedAt = now; return; }
    push({ role: 'agent', text: "I couldn't turn that into a rule — try phrasing it as a specific instruction." });
  };
  const curAgent = () => byId(DM.path().split('/')[2]);
  DM.input('ag-train', (v, el) => { U.draft = v; const b = el.closest('.ag-comp').querySelector('[data-act=ag-send]'); if (b) b.disabled = !v.trim(); });
  DM.act('ag-attach', () => DM.toast('Attach a file — coming soon', 'info'));
  DM.act('ag-send', () => {
    const a = curAgent(); const t = U.draft.trim(); if (!a || !t) return;
    a.training = a.training || []; U.seen['t:' + a.id] = a.training.length; a.training.push({ id: 'tr-' + (a.training.length + 1), role: 'user', text: t, at: nowIso() }); U.draft = ''; U.typing = a.id; DM.render();
    setTimeout(() => { trainReply(a, t); U.typing = null; if (curAgent() === a) DM.render(); }, 900 + Math.min(700, t.length * 8));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && e.target.dataset && e.target.dataset.input === 'ag-train') { e.preventDefault(); DM.acts['ag-send'](); } if (e.key === 'Enter' && !e.shiftKey && e.target.dataset && e.target.dataset.input === 'ag-test') { e.preventDefault(); DM.acts['ag-tsend'](); } });

  /* ───────── test mode ───────── */
  const SAMPLES = { newhome: 'Hi, need ashvi 40 meter and belmont 25 mtr', stuffcool: 'hello need 20k mini powerbank 50 pcs and type c cable 100', rfq: 'Please quote tinned copper lug 16 sq mm 3500 nos and 25 sq mm 1200 nos' };
  const matchLines = (text) => {
    const styles = S().styles || []; const out = []; const alias = { '20k': '20000', '10k': '10000', '5k': '5000', tc: 'type-c', typec: 'type-c' };
    const stop = ['need', 'please', 'quote', 'hello', 'meter', 'meters', 'mtr', 'mts', 'pcs', 'nos', 'kindly', 'send', 'want', 'roll', 'rolls', 'and', 'for'];
    const dflt = DM.uc === 'stuffcool' ? 'pcs' : DM.uc === 'rfq' ? 'nos' : 'm';
    text.split(/\n|,|;| and /i).map((x) => x.trim()).filter(Boolean).forEach((line) => {
      const qm = line.match(/(\d[\d,]*)\s*(pcs|pieces?|nos?|rolls?|m\b|mtrs?|mts|meters?|units?)/i) || line.match(/(\d{2,5})\s*$/); const qty = qm ? qm[1].replace(/,/g, '') : null;
      const unit = /pcs|piece/i.test(line) ? 'pcs' : /\bnos?\b/i.test(line) ? 'nos' : /roll/i.test(line) ? 'rolls' : /(\d)\s*m\b|mtr|mts|meter/i.test(line) ? 'm' : dflt;
      const toks = line.replace(/\b(\d+)\s*k\b/gi, '$1k').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).map((w) => alias[w] || w).filter((w) => (w.length > 2 || /^\d{2}$/.test(w)) && !stop.includes(w) && w !== qty);
      if (!toks.length) return;
      let best = null, bs = 0; styles.forEach((s) => { const hay = (s.code + ' ' + s.name + ' ' + (s.category || '')).toLowerCase(); const ht = new Set(hay.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)); const sc = toks.filter((w) => (/^\d+$/.test(w) ? ht.has(w) : hay.includes(w))).length; if (sc > bs) { bs = sc; best = s; } });
      if (best && bs >= 1) { const v = (best.variants || [])[0]; let h = 0; for (const c of best.code + line) h = (h * 31 + c.charCodeAt(0)) >>> 0; out.push({ name: v ? v.name : best.name, style: best.name || best.code, conf: 72 + (h % 27), qty, unit }); }
    });
    return out;
  };
  const tk = () => DM.uc + ':' + (curAgent() || {}).id;
  const tstate = () => (U.test[tk()] = U.test[tk()] || { msgs: [], used: [] });
  const testView = (a) => {
    const ts = tstate(); const lv = livesLabel(a);
    const seen = U.seen['x:' + tk()]; const bub = ts.msgs.map((m, i) => `<div class="ag-wb ${m.from === 'customer' ? 'c' : 'a'} ${seen !== undefined && i >= seen ? 'msg-new' : ''}">${bold(m.text)}${m.buttons ? `<div class="btns">${m.buttons.map((b) => `<button data-act="ag-tbtn" data-arg="${esc(b)}">${esc(b)}</button>`).join('')}</div>` : ''}</div>`).join('');
    return `<div class="ag-test"><div class="ag-card ag-tchat"><div class="hd" style="padding:10px 12px;gap:10px;height:auto"><span class="icotile">${I('user')}</span><div class="grow" style="min-width:0"><b style="font-size:12px">You, as a customer</b><div class="muted trunc" style="font-size:12px">Answering as it would on ${lv ? lv : a.type === 'email' ? 'email' : 'WhatsApp'}</div></div><button class="btn outline sm" data-act="ag-trun">${I('wand')} Test run</button><span class="chip-amber">${I('ban')} Nothing goes out</span><button class="btn outline sm" data-act="ag-treset">${I('rotate')} Reset</button><button class="btn ghost icon sm" data-act="ag-tpanel" title="Toggle panel">${I('sidebar')}</button></div>
      <div class="wall chatbg" id="ag-wall">${ts.msgs.length || U.testTyping === tk() ? bub + (U.testTyping === tk() ? '<div class="typing"><i></i><i></i><i></i></div>' : '') : `<div class="empty-card" style="margin:auto;border:0;background:transparent">${DM.icoTile('chat', 'lg')}<div class="b" style="margin-top:10px">See your agent in action</div><div class="muted" style="max-width:300px;margin-top:2px">Send a message as a customer to try its responses. This is a private test — nothing is sent to your customers.</div></div>`}</div>
      <div class="ag-comp"><div class="ag-ta"><textarea data-input="ag-test" rows="2" placeholder="Write what a customer would send">${esc(U.testDraft)}</textarea><div class="ar"><button class="btn ghost icon sm" data-act="ag-attach" title="Attach a file — coming soon">${I('paperclip')}</button><span class="grow"></span><button class="btn sm" data-act="ag-tsend" ${U.testDraft.trim() ? '' : 'disabled'}>Send ${I('send')}</button></div></div></div></div>
      <div class="ag-card" style="${U.hidePanel ? 'display:none' : ''}"><div class="hd" style="justify-content:space-between;padding:8px 12px"><b style="font-size:12px;font-weight:500">What Anuma used</b><button class="btn ghost icon sm" data-act="ag-tsettings" title="Match settings">${I('settings')}</button></div><div class="bd">${ts.used.length ? ts.used.map((u) => `<div class="ag-used"><span class="grow trunc"><b style="font-weight:500">${esc(u.name)}</b><div class="muted xs">${esc(u.style)}${u.qty ? ' · ' + u.qty + ' ' + u.unit : ''}</div></span>${DM.status(u.conf + '%', u.conf >= 85 ? 'green' : 'amber')}</div>`).join('') : DM.empty('scan', 'Nothing matched yet', 'Product matches will appear here after a test reply.', { style: 'border:0;padding:28px 8px' })}</div></div></div>`;
  };
  const testReply = (text) => {
    const ts = tstate(); const lines = matchLines(text); const now = nowIso();
    if (!lines.length) { ts.msgs.push({ from: 'agent', text: DM.uc === 'rfq' ? 'Thanks, I have the request. Our team is checking this one.' : 'Our team is checking this one.' }); return; }
    ts.used = lines.map((l) => ({ ...l }));
    const rd = lines.map((l, i) => `${i + 1}. ${l.name}${l.qty ? ' — ' + l.qty + ' ' + l.unit : ''}${l.conf < 80 ? ' (our team is checking this one)' : ''}`).join('\n');
    ts.msgs.push({ from: 'agent', text: rd, buttons: ['Confirm', 'Change'] });
  };
  const tsend = (text) => { const ts = tstate(); const key = tk(); U.seen['x:' + key] = ts.msgs.length; ts.msgs.push({ from: 'customer', text }); U.testDraft = ''; U.testTyping = key; DM.render(); setTimeout(() => { U.seen['x:' + key] = ts.msgs.length; testReply(text); U.testTyping = null; if (tk() === key) DM.render(); }, 1100); };
  DM.input('ag-test', (v, el) => { U.testDraft = v; const b = el.closest('.ag-comp').querySelector('[data-act=ag-tsend]'); if (b) b.disabled = !v.trim(); });
  DM.act('ag-tsend', () => { const t = U.testDraft.trim(); if (t) tsend(t); });
  DM.act('ag-trun', () => tsend(SAMPLES[DM.uc] || SAMPLES.newhome));
  DM.act('ag-treset', () => { U.test[tk()] = { msgs: [], used: [] }; U.testTyping = null; DM.render(); DM.toast('Test conversation reset', 'rotate'); });
  DM.act('ag-tpanel', () => { U.hidePanel = !U.hidePanel; DM.render(); });
  DM.act('ag-tsettings', () => DM.toast('Match settings live in the Rulebook (Limits & approvals)', 'info'));
  DM.act('ag-tbtn', (el) => { const ts = tstate(); const key = tk(); const v = el.dataset.arg; U.seen['x:' + key] = ts.msgs.length; ts.msgs.push({ from: 'customer', text: v }); U.testTyping = key; DM.render(); setTimeout(() => { U.seen['x:' + key] = ts.msgs.length; const n = ts.used.length || 1; ts.msgs.push({ from: 'agent', text: v === 'Confirm' ? `Received. TEST-${String(Math.floor(1000 + Math.random() * 8999))}, ${n} line${n > 1 ? 's' : ''}.` : 'Which line?' }); U.testTyping = null; if (tk() === key) DM.render(); }, 800); });

  /* ───────── activity log ───────── */
  const ACT = { activated: 'play', paused: 'pause', rule: 'chat', guideline: 'file', created: 'fileplus' };
  const activity = (a) => {
    const rows = (a.activity || []).slice().sort((x, y) => new Date(y.at) - new Date(x.at)); const days = []; const map = {};
    rows.forEach((r) => { const d = DM.dayOf(r.at); if (!map[d]) { map[d] = []; days.push(d); } map[d].push(r); });
    return `<div class="ag-card"><div class="hd" style="display:block;padding:12px 16px;height:auto"><div style="font-size:14px;font-weight:500">Activity log</div><div class="muted" style="font-size:12px">Changes and actions recorded for this agent.</div></div><div class="bd" style="padding:8px 16px 16px">${rows.length ? days.map((d) => `<div class="ag-day">${fmtDay(map[d][0].at)}</div>${map[d].map((r) => `<div class="ag-act" data-rid="${esc(a.id + r.id)}"><span class="t">${I(ACT[r.kind] || 'pencil')}</span><div><div class="x">${esc(r.text)}</div><div class="m">${esc(r.actor)} · ${fmtTime(r.at)}</div></div></div>`).join('')}`).join('') : '<div class="muted" style="padding:20px 0">Nothing recorded yet.</div>'}</div></div>`;
  };

  /* ───────── detail routes ───────── */
  DM.page('/agents/:id', { render({ params }) { return `<div class="page wide"><div class="muted">Opening…</div></div>`; }, after(root, { params }) { DM.go('/agents/' + params.id + '/overview'); } });
  DM.page('/agents/:id/:tab', { title: 'Agent', render({ params }) {
    const a = byId(params.id); if (!a) return `<div class="page narrow">${DM.empty('bot', 'Agent not found', 'It may have been deleted.', { action: '<button class="btn outline sm" style="margin-top:12px" data-go="/agents">Back to agents</button>' })}</div>`;
    const tab = tabKey(params.tab); const body = tab === 'training' ? training(a) : tab === 'test-mode' ? testView(a) : tab === 'activity-log' ? activity(a) : overview(a);
    return `<div class="page wide">${header(a, tab)}<div style="margin-top:12px">${body}</div></div>`;
  }, after(root, { params }) {
    const a = byId(params.id); if (!a) return; const tab = tabKey(params.tab);
    if (tab === 'training') { U.seen['t:' + a.id] = (a.training || []).length; const c = document.getElementById('ag-chat'); if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' }); }
    if (tab === 'test-mode') { const w = document.getElementById('ag-wall'); if (w) w.scrollTo({ top: w.scrollHeight, behavior: 'smooth' }); }
  } });
})();
