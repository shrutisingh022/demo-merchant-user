/* App shell: rail, top bar, org/settings/account menus, ⌘K palette, Ask Anuma sheet, bell popover, demo player. Per-use-case rail. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, SH = DM.shell;
  const ORG = 'Demo Merchant User';
  const UC_LABEL = { newhome: ['NewHome use case', 'Orders to Coral', 'inbox'], stuffcool: ['Stuffcool use case', 'Inbox to Tally', 'inbox'], rfq: ['Access use case', 'RFQs', 'file'] };
  const ucLabel = (k) => (UC_LABEL[k] || [DM.ucs[k] ? DM.ucs[k].short : k, '', 'zap']);
  const MARK = (n = 28) => `<svg viewBox="0 0 32 32" width="${n}" height="${n}" style="flex:none"><rect width="32" height="32" rx="8" fill="#0a0a0a"/><circle cx="10.5" cy="16" r="2.3" fill="#fff"/><rect x="15" y="13.8" width="8.5" height="4.4" rx="2.2" fill="#fff"/></svg>`;
  DM.mark = MARK;
  const nowIso = '2026-10-27';
  // The demo clock: 27 Oct 2026, 17:30 IST — or the current scenario step's time when it carries HH:MM.
  DM.TODAY = nowIso;
  DM.now = () => { try { const st = DM.scn.index >= 0 && DM.ucs[DM.uc].steps[DM.scn.index]; if (st && /^\d{1,2}:\d{2}$/.test(st.at || '')) return new Date(nowIso + 'T' + String(st.at).padStart(5, '0') + ':00+05:30'); } catch (e) {} return new Date(nowIso + 'T17:30:00+05:30'); };
  DM.dayOf = (v) => { const d = new Date(v); return isNaN(d) ? '' : d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); };

  /* ───────── navigation per use case ───────── */
  const SETTINGS = [['organisation', 'Company', 'building'], ['navigation', 'Navigation', 'layout'], ['users', 'Humans', 'users'], ['rulebook', 'Rulebook', 'book'], ['usage', 'Usage', 'gauge']];
  const WORKSPACE = (apps) => [
    { key: 'agents', label: 'Agents', icon: 'bot', url: '/agents', prefix: '/agents' },
    { key: 'workflows', label: 'Workflows', icon: 'workflow', url: '/workflows', prefix: '/workflows' },
    { key: 'channels', label: 'Channels', icon: 'radio', url: '/settings/channels', prefix: '/settings/channels' },
    { key: 'apps', label: apps, icon: 'blocks', url: '/settings/integrations', prefix: '/settings/integrations' },
    { key: 'logs', label: 'Logs', icon: 'history', url: '/settings/logs', prefix: '/settings/logs' },
    { key: 'settings', label: 'Settings', icon: 'settings', url: '/settings/organisation', prefix: '/settings', menu: true, exclude: ['/settings/channels', '/settings/integrations', '/settings/logs'] },
  ];
  const NAVS = {
    newhome: [[
      { key: 'dashboard', label: 'Home', icon: 'dashboard', url: '/dashboard', prefix: '/dashboard' },
      { key: 'inbox', label: 'Inbox', icon: 'inbox', url: '/inbox/threads', prefix: '/inbox' },
      { key: 'orders', label: 'Orders', icon: 'file', url: '/orders/drafts', prefix: '/orders' },
      { key: 'crm', label: 'CRM', icon: 'users', url: '/crm/accounts', prefix: '/crm' },
      { key: 'products', label: 'Products', icon: 'package', url: '/products', prefix: '/products' }], WORKSPACE('Apps')],
    stuffcool: [[
      { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', url: '/dashboard', prefix: '/dashboard' },
      { key: 'inbox', label: 'Inbox', icon: 'inbox', url: '/inbox/threads', prefix: '/inbox' },
      { key: 'orders', label: 'Draft Orders', icon: 'file', url: '/orders/drafts', prefix: '/orders' },
      { key: 'crm', label: 'CRM', icon: 'users', url: '/crm/accounts', prefix: '/crm' },
      { key: 'products', label: 'Products', icon: 'package', url: '/products', prefix: '/products' }], WORKSPACE('Merchant Apps')],
    rfq: [[
      { key: 'dashboard', label: 'Home', icon: 'dashboard', url: '/dashboard', prefix: '/dashboard' },
      { key: 'rfqs', label: 'RFQs', icon: 'file', url: '/orders/rfqs', prefix: '/orders' },
      { key: 'crm', label: 'CRM', icon: 'users', url: '/crm/accounts', prefix: '/crm' },
      { key: 'products', label: 'Products', icon: 'package', url: '/products', prefix: '/products' }], WORKSPACE('Merchant Apps')],
  };
  const hiddenKeys = () => (DM.S && DM.S.navHidden) || [];
  Object.defineProperty(DM, 'NAV', { get() { const n = NAVS[DM.uc] || NAVS.newhome; return [{ label: 'Navigate', items: n[0].filter((i) => i.key === 'dashboard' || !hiddenKeys().includes(i.key)) }, { label: 'Workspace', items: n[1] }]; } });
  const flat = () => DM.NAV.flatMap((g) => g.items);
  const activeNav = (path) => { let best = null, bl = -1; for (const it of flat()) { const pre = it.prefix; if ((path === pre || path.startsWith(pre + '/')) && !(it.exclude || []).some((x) => path.startsWith(x)) && pre.length > bl) { best = it; bl = pre.length; } } return best; };
  SH.allowed = (path) => path === '/notifications' || !!activeNav(path);
  DM.navLabel = (key) => { const it = flat().find((i) => i.key === key); return it ? it.label : ''; };

  /* ───────── mount + rail ───────── */
  SH.mount = () => {
    DM.root.innerHTML = `<div id="app"><aside id="rail"></aside><main id="main"><div id="topbar"></div><div id="view"></div></main></div><div id="toasts"></div><div id="boot"><div class="m"><i></i><i></i></div></div>`;
  };
  SH.rail = (path) => {
    const act = activeNav(path); const [g1, g2] = DM.NAV;
    const item = (it) => { const on = act && act.key === it.key; return `<a class="navitem ${on ? 'active' : ''}" ${it.menu ? 'data-act="settings-menu" data-keepmenu' : `href="#${it.url}"`} data-nav="${it.key}">${I(it.icon)}<span class="grow">${esc(it.label)}</span>${it.menu ? I('chevU', 'sm') : ''}</a>`; };
    document.getElementById('rail').innerHTML = `
      <button class="orgbtn" data-act="org-menu" data-keepmenu>${MARK(28)}<div class="grow"><div class="nm">${ORG}</div><div class="sub">Admin</div></div>${I(DM.ui.orgOpen ? 'chevU' : 'chevD', 'sm')}</button>
      <button class="searchbtn" data-act="palette">${I('search')}<span class="grow">Search…</span><kbd>⌘K</kbd></button>
      <nav id="nav"><div class="navgrp">NAVIGATE</div>${g1.items.map(item).join('')}<div class="grow"></div><div class="navdiv"></div><div class="navgrp">WORKSPACE</div>${g2.items.map(item).join('')}</nav>
      <div class="navdiv"></div>
      <button class="acct" data-act="account-menu" data-keepmenu>${DM.avatar('Rohan Mehta', 'photo', {})}<div class="grow" style="min-width:0"><div class="nm trunc">Rohan Mehta</div><div class="em trunc">rohan@demo.anuma.run</div></div>${I('chevU', 'sm')}</button>`;
  };

  /* ───────── top bar + demo player ───────── */
  const demoBar = () => {
    if (DM.ui.demoHidden) return '';
    const U = DM.ucs[DM.uc]; const i = DM.scn.index; const n = U.steps.length; const st = U.steps[i];
    return `<div class="demobar ${DM.scn.playing ? 'playing' : ''}">
      <button class="btn ghost sm ucbtn" data-act="uc-menu" data-keepmenu title="Switch use case">${I(ucLabel(DM.uc)[2])}<span>${esc(ucLabel(DM.uc)[0])}</span>${I('chevD')}</button>
      <span class="sepv"></span>
      <button class="btn ghost icon" data-act="scn-prev" ${i < 0 ? 'disabled' : ''} title="Previous step">${I('skipB')}</button>
      <button class="btn ghost icon" data-act="scn-play" title="${DM.scn.playing ? 'Pause' : 'Play scenario'}">${I(DM.scn.playing ? 'pause' : 'play')}</button>
      <button class="btn ghost icon" data-act="scn-next" ${i >= n - 1 ? 'disabled' : ''} title="Next step">${I('skipF')}</button>
      <span class="lbl" data-act="steps-pop" data-keepmenu title="All steps"><i class="play-ind"></i><span class="mono">${i < 0 ? '0' : i + 1}/${n}</span><span class="trunc">${i < 0 ? 'Play the scenario' : esc(st.title)}</span>${I('chevD')}</span>
      <button class="btn ghost icon" data-act="scn-reset" title="Reset scenario">${I('rotate')}</button>
      <button class="btn ghost icon" data-act="demo-hide" title="Hide demo controls">${I('x')}</button></div>`;
  };
  SH.top = (path, m) => {
    const act = activeNav(path); const unread = (DM.S.notifications || []).filter((n) => n.unread).length;
    const crumb = path === '/notifications' ? '' : `<span class="muted sep">/</span><b>${esc(act ? act.label : '')}</b>`;
    document.getElementById('topbar').innerHTML = `<div id="crumb"><span class="muted">${ORG}</span>${crumb}</div>
      <div class="row gap4 right">${demoBar()}
      <button class="btn ghost icon" data-act="ask-open" data-keepmenu title="Ask Anuma">${I('chat')}</button>
      <button class="btn ghost icon bellbtn" data-act="bell" data-keepmenu title="Notifications">${I('bell')}${unread ? `<span class="bellcount">${unread > 9 ? '9+' : unread}</span>` : ''}</button></div>`;
  };
  SH.refresh = () => { const p = DM.path(); SH.top(p, DM.match(p)); SH.after(p); };
  SH.after = () => {
    let h = document.getElementById('demohandle');
    if (DM.ui.demoHidden) { if (!h) { h = document.createElement('button'); h.id = 'demohandle'; h.className = 'demohandle'; h.dataset.act = 'demo-show'; h.innerHTML = I('play') + ' Demo'; document.body.appendChild(h); } } else if (h) h.remove();
  };
  DM.stepsPopover = (anchor) => {
    document.querySelectorAll('.stepspop').forEach((e) => e.remove());
    const U = DM.ucs[DM.uc]; const i = DM.scn.index; const r = anchor.getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'stepspop';
    d.innerHTML = `<div class="sp-narr"><b>${esc(ucLabel(DM.uc)[0])}</b> · ${esc(i >= 0 ? (U.steps[i].narr || U.steps[i].desc || U.steps[i].title) : (U.about || ucLabel(DM.uc)[1]))}</div>${U.steps.map((s, k) => `<button class="sp-row ${k <= i ? 'done' : ''} ${k === i ? 'cur' : ''}" data-k="${k}"><span class="sp-n">${k + 1}</span><span class="grow"><b class="sm" style="display:block;font-weight:500">${esc(s.title)}</b><span class="xs muted">${esc(s.desc || '')}</span></span><span class="xs muted">${esc(s.at || '')}</span></button>`).join('')}`;
    d.style.top = r.bottom + 6 + 'px'; d.style.left = Math.max(8, Math.min(r.left, innerWidth - 396)) + 'px'; document.body.appendChild(d);
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { d.remove(); DM.scnStop(); DM.scnApply(+b.dataset.k); } });
    setTimeout(() => document.addEventListener('mousedown', function f(e) { if (!e.target.closest('.stepspop')) d.remove(); document.removeEventListener('mousedown', f); }), 0);
  };

  /* ───────── menus ───────── */
  const A = DM.acts;
  A['scn-next'] = () => { DM.scnStop(); DM.scnNext(); }; A['scn-prev'] = () => { DM.scnStop(); DM.scnPrev(); };
  A['scn-play'] = () => (DM.scn.playing ? DM.scnStop() : DM.scnPlay()); A['scn-reset'] = () => DM.scnReset();
  A['steps-pop'] = (el) => DM.stepsPopover(el);
  A['demo-hide'] = () => { DM.scnStop(); DM.ui.demoHidden = true; SH.refresh(); };
  A['demo-show'] = () => { DM.ui.demoHidden = false; SH.refresh(); };
  A['uc-menu'] = (el) => DM.menu(el, Object.keys(DM.ucs).map((k) => ({ label: ucLabel(k)[0], hint: ucLabel(k)[1], icon: ucLabel(k)[2], check: k === DM.uc, run: () => DM.setUC(k) })), { right: true, w: 260 });
  A['palette'] = () => SH.palette();
  A['org-menu'] = (el) => { DM.ui.orgOpen = true; DM.menu(el, [{ heading: 'Organisation' }, { orgitem: true }, { sep: true }, { label: 'Organisation settings', icon: 'settings', run: () => DM.go('/settings/organisation') }], { w: 256, onClose: () => { DM.ui.orgOpen = false; SH.rail(DM.path()); } }); SH.rail(DM.path()); };
  A['settings-menu'] = (el) => DM.menu(el, SETTINGS.map(([k, l, ic]) => ({ label: l, icon: ic, run: () => DM.go('/settings/' + k) })), { w: 224, up: true });
  A['account-menu'] = (el) => DM.menu(el, [{ custom: `<div class="mhead"><div class="nm">Rohan Mehta</div><div class="muted">rohan@demo.anuma.run</div></div>` }, { sep: true }, { label: 'Edit profile', icon: 'usercog', run: () => SH.profile() }, { sep: true }, { label: 'Sign out', icon: 'logout', danger: true, run: () => DM.toast('This is a demo workspace — there is nothing to sign out of.', 'info') }], { w: 224, up: true });
  SH.profile = () => DM.dialog({ title: 'Edit profile', w: 420, body: `<div class="col" style="gap:12px">${DM.field('Name', 'name', { value: 'Rohan Mehta' })}${DM.field('Email', 'email', { value: 'rohan@demo.anuma.run' })}${DM.field('Phone', 'phone', { value: '+91 98765 43210' })}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: () => { DM.toast('Profile saved'); } }] });

  /* ───────── ⌘K palette (section names only) ───────── */
  SH.palette = () => {
    document.getElementById('palette-wrap') && document.getElementById('palette-wrap').remove();
    const w = document.createElement('div'); w.id = 'palette-wrap';
    w.innerHTML = `<div class="palette"><div class="pin">${I('search')}<input placeholder="Search or jump to a section…" autofocus></div><div class="res"></div><div class="pfoot"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span class="right"><kbd>esc</kbd> Close</span></div></div>`; document.body.appendChild(w);
    const inp = w.querySelector('input'), res = w.querySelector('.res'); let sel = 0, list = [];
    const groups = () => { const [g1, g2] = DM.NAV; const ws = g2.items.map((i) => ({ label: i.label, icon: i.icon, url: i.url })).concat(SETTINGS.map(([k, l, ic]) => ({ label: l, icon: ic, url: '/settings/' + k }))); return [['Navigate', g1.items.map((i) => ({ label: i.label, icon: i.icon, url: i.url }))], ['Workspace', ws]]; };
    const draw = () => {
      const q = inp.value.toLowerCase().trim(); list = []; let html = '';
      groups().forEach(([h, items]) => { const f = items.filter((d) => !q || d.label.toLowerCase().includes(q)); if (!f.length) return; html += `<div class="pg">${h}</div>`; f.forEach((d) => { html += `<a data-k="${list.length}" class="${list.length === sel ? 'sel' : ''}">${I(d.icon)}<span class="grow">${esc(d.label)}</span>${list.length === sel ? '<span class="muted">↵</span>' : ''}</a>`; list.push(d); }); });
      sel = Math.min(sel, Math.max(0, list.length - 1)); res.innerHTML = html || '<div class="pempty">No results found.</div>';
      w.querySelector('.palette').classList.toggle('small', !list.length);
    };
    const go = (k) => { const d = list[k]; if (d) { w.remove(); DM.go(d.url); } };
    inp.addEventListener('input', () => { sel = 0; draw(); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, list.length - 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') go(sel); else if (e.key === 'Escape') w.remove(); });
    res.addEventListener('click', (e) => { const a = e.target.closest('[data-k]'); if (a) go(+a.dataset.k); });
    w.addEventListener('mousedown', (e) => { if (e.target === w) w.remove(); }); draw(); inp.focus();
  };

  /* ───────── notifications (shared by bell popover + /notifications page) ───────── */
  const TYPES = { review: ['scan', 'Product for review'], handoff: ['swap', 'Hand-off'], assigned: ['reply', 'Chat assigned to you'], escalated: ['uprightarrow', 'Escalated to you'], changes: ['filediff', 'Changes to review'] };
  const typeOf = (n) => n.type || (/hand-?off/i.test(n.title || n.subject || '') ? 'handoff' : /assigned/i.test(n.title || n.subject || '') ? 'assigned' : /review|match|unmatched|flag/i.test(n.title || n.subject || '') ? 'review' : /escalat/i.test(n.title || n.subject || '') ? 'escalated' : 'changes');
  const dshort = (a) => { if (!a) return ''; if (/^\d{1,2}:\d{2}/.test(a)) return a; const d = new Date(a); return isNaN(d) ? a : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(/^0/, ''); };
  DM.notif = {
    types: TYPES, typeOf,
    all: () => (DM.S.notifications || []),
    row(n, big) {
      const t = typeOf(n); const [icon, label] = TYPES[t]; const title = n.title || n.subject || label; const th = (DM.S.threads || []).find((x) => (n.caseId && x.id === n.caseId) || (n.caseNo && x.caseNo === n.caseNo)); const href = n.href || (th ? '/inbox/threads?case=' + th.id : DM.uc === 'rfq' ? '/orders/rfqs' : '/inbox/threads');
      const meta = [n.account || n.from, n.caseNo].filter(Boolean).join(' · ');
      return `<a class="nrow ${n.unread ? 'unread' : ''}" href="#${href}" data-nid="${esc(n.id)}"><span class="icotile">${I(icon)}</span><div class="grow" style="min-width:0"><div class="row gap4"><span class="nt">${esc(title)}</span>${meta ? `<span class="muted">·</span><span class="wa">${I('whatsapp')}</span><span class="muted trunc">${esc(meta)}</span>` : ''}<span class="grow"></span><span class="xs muted nd">${esc(dshort(n.at))}</span>${n.unread ? '<i class="udot"></i>' : ''}</div><div class="np trunc">${n.thumb ? `<i class="nthumb" style="background:${esc(n.thumb)}"></i>` : ''}${esc(n.preview || n.body || '')}</div></div></a>`;
    },
  };
  DM.bellPopover = () => {
    document.querySelectorAll('.bellpop').forEach((e) => e.remove());
    const N = DM.notif.all(); const unread = N.filter((n) => n.unread).length;
    const d = document.createElement('div'); d.className = 'bellpop';
    d.innerHTML = `<div class="bp-h"><b>Notifications</b>${N.length ? `<span class="cnt-chip dark">${N.length}</span>` : ''}</div><div class="bp-list">${N.length ? N.slice(0, 6).map((n) => DM.notif.row(n)).join('') : `<div class="bp-empty"><span class="icotile lg">${I('bell')}</span><div class="b">No notifications yet</div><div class="muted">You're all caught up. New updates will show up here.</div></div>`}</div><a class="btn outline bp-f" href="#/notifications">View all notifications ${I('arrowR')}</a>`;
    document.body.appendChild(d);
    d.addEventListener('click', (e) => { const a = e.target.closest('.nrow'); if (a) { const n = DM.S.notifications.find((x) => String(x.id) === a.dataset.nid); if (n) n.unread = false; } if (e.target.closest('a')) { d.remove(); setTimeout(() => SH.refresh(), 0); } });
    setTimeout(() => document.addEventListener('mousedown', function f(e) { if (!e.target.closest('.bellpop') && !e.target.closest('.bellbtn')) { d.remove(); document.removeEventListener('mousedown', f); } else if (!document.body.contains(d)) document.removeEventListener('mousedown', f); }), 0);
  };
  A['bell'] = () => { if (document.querySelector('.bellpop')) document.querySelector('.bellpop').remove(); else DM.bellPopover(); };

  /* ───────── Ask Anuma sheet ───────── */
  const ASK = { open: false, view: 'chat', msgs: [], typing: false };
  DM.ask = ASK;
  const SUGG = {
    newhome: ['Which cases are waiting on the team?', 'Who is slowest to reply?', 'What did Anuma capture today?'],
    stuffcool: ['Which drafts are waiting for approval?', 'Did every order reach Tally?', 'Which dealers ordered today?'],
    rfq: ['Where is the delay coming from?', 'Who is slowest to start?', 'How fast is costing once it starts?'],
  };
  const PH = { newhome: 'Ask about cases, orders, buyers…', stuffcool: 'Ask about drafts, dealers, Tally…', rfq: 'Ask about opportunities, delay, costing…' };
  const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n').map((l) => (/^• /.test(l) ? `<li>${l.slice(2)}</li>` : l ? `<p>${l}</p>` : '')).join('').replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
  const answer = (q) => {
    const S = DM.S; q = q.toLowerCase(); const th = S.threads || [], dr = S.drafts || [], rq = S.rfqs || [], lg = S.erpLog || [], us = S.users || [];
    const nm = (id) => (us.find((u) => u.id === id) || {}).name || id;
    if (/wait|hand|escalat|team/.test(q) && th.length) { const w = th.filter((t) => t.status === 'escalated' || (t.status !== 'closed' && t.owner && t.owner !== 'anuma')); return w.length ? `**${w.length} case${w.length > 1 ? 's' : ''}** are with the team right now:\n${w.slice(0, 4).map((t) => `• **${t.caseNo || t.id}** — ${t.name || t.subject || (S.parties || []).find((p) => p.id === t.partyId)?.name || 'Unknown number'}, held by ${t.owner === 'anuma' ? 'Anuma' : nm(t.owner)}`).join('\n')}\nSLA for a hand-off is 15 minutes.` : 'Nothing is waiting on the team. Every hand-off so far has been answered inside the 15 minute SLA.'; }
    if (/draft|approv|pending/.test(q) && dr.length) { const p = dr.filter((d) => d.status === 'pending'); return `**${p.length} draft order${p.length === 1 ? '' : 's'}** pending:\n${p.slice(0, 4).map((d) => `• **${d.no || d.id}** — ${d.partyName || (S.parties || []).find((x) => x.id === d.partyId)?.name || ''}`).join('\n') || '• none'}\nTotal drafts today: ${dr.length}.`; }
    if (/tally|coral|sync|erp|sap/.test(q)) { const f = lg.filter((l) => l.state === 'failed'); return `**${lg.length} ERP call${lg.length === 1 ? '' : 's'}** logged, **${f.length} failed**.${f.length ? '\n' + f.slice(0, 3).map((l) => `• **${l.ref || l.id}** — ${l.endpoint || ''}`).join('\n') : '\nAll recent pushes reached the ERP.'}`; }
    if (/rfq|delay|costing|slow|start/.test(q) && rq.length) { const open = rq.filter((r) => !['won', 'lost', 'regretted', 'converted'].includes(r.status)); return `The longest wait is in **intake → costing**.\n• **${open.length} RFQs** are still open.\n• Median time to first quote is about **3h 40m**.\n• Slowest to start: **${nm((us.find((u) => u.role === 'Sales') || us[0] || {}).id) || 'the sales desk'}**.\nWant a breakdown by account?`; }
    if (/dealer|buyer|account|ordered|today/.test(q)) { const n = (S.parties || []).slice(0, 3).map((p) => `• **${p.name}**`).join('\n'); return `Accounts active today:\n${n || '• none yet'}`; }
    return `I don't have enough context to answer that yet. Could you give me a little more detail? For example:\n• **Are you asking about a specific case or account?**\n• **Is this about an order that is still in draft?**\n• **Which day should I look at?**`;
  };
  const askHtml = () => {
    const U = DM.uc; const head = `<div class="ask-h">${MARK(28)}<div class="grow"><div class="b" style="font-size:14px">Anuma</div><div class="xs muted">reads the whole of ${ORG}</div></div><button class="btn ghost icon sm ${ASK.view === 'past' ? 'on' : ''}" data-act="ask-past" title="Past chats">${I('history')}</button><button class="btn ghost icon sm" data-act="ask-close" title="Close">${I('x')}</button></div>`;
    let body;
    if (ASK.view === 'past') {
      const chats = (DM.S.askChats || []); const groups = {}; chats.forEach((c) => (groups[c.group || 'Previous 30 days'] = groups[c.group || 'Previous 30 days'] || []).push(c));
      body = `<div class="ask-b past"><button class="btn outline" style="width:100%" data-act="ask-new">${I('pencil')} New chat</button>${Object.entries(groups).map(([g, cs]) => `<div class="ask-g">${esc(g)}</div>${cs.map((c) => `<button class="ask-row" data-act="ask-load" data-arg="${esc(c.id)}">${esc(c.title)}</button>`).join('')}`).join('')}</div>`;
    } else if (!ASK.msgs.length) {
      body = `<div class="ask-b empty"><div class="ask-mid">${MARK(40).replace('rx="8"', 'rx="16"')}<div class="b" style="font-size:14px;margin-top:12px">How can I help you today?</div><p class="muted">Ask about the order cycle — what is waiting on the team, what is past the SLA, and what reached your ERP.</p></div></div>`;
    } else {
      body = `<div class="ask-b chat" id="ask-scroll">${ASK.msgs.map((m) => m.role === 'u' ? `<div class="am u msg-new">${esc(m.text)}</div>` : `<div class="am a msg-new">${MARK(24)}<div class="at">${md(m.text)}</div></div>`).join('')}${ASK.typing ? `<div class="am a">${MARK(24)}<div class="typing"><i></i><i></i><i></i></div></div>` : ''}</div>`;
    }
    const chips = ASK.view === 'chat' && !ASK.msgs.length ? `<div class="ask-chips">${(SUGG[U] || SUGG.newhome).map((c) => `<button class="chip" data-act="ask-send" data-arg="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : '';
    const comp = ASK.view === 'past' ? '' : `${chips}<div class="ask-comp"><textarea data-input="ask-text" rows="2" placeholder="${ASK.msgs.length ? 'Ask a follow-up…' : (PH[U] || PH.newhome)}">${esc(ASK.draft || '')}</textarea><div class="row gap4"><button class="btn ghost icon sm" disabled title="Attach a file — coming soon">${I('paperclip')}</button><button class="btn ghost icon sm" disabled>${I('atsign')}</button><span class="grow"></span><button class="btn ghost icon sm" disabled title="Voice input — coming soon">${I('mic')}</button><button class="ask-send ${ASK.draft ? 'on' : ''}" data-act="ask-send">${I('arrowup2')}</button></div></div>`;
    return head + body + comp;
  };
  const askDraw = (keepFocus) => { let el = document.getElementById('ask-sheet'); if (!el) return; const pos = keepFocus && document.activeElement && document.activeElement.tagName === 'TEXTAREA' ? document.activeElement.selectionStart : null; el.querySelector('.ask-in').innerHTML = askHtml(); const sc = el.querySelector('#ask-scroll'); if (sc) sc.scrollTop = sc.scrollHeight; const ta = el.querySelector('textarea'); if (ta && pos !== null) { ta.focus(); ta.setSelectionRange(pos, pos); } };
  SH.askOpen = () => {
    if (document.getElementById('ask-sheet')) return; ASK.open = true;
    const el = document.createElement('div'); el.id = 'ask-sheet'; el.className = 'asksheet'; el.innerHTML = '<div class="ask-in"></div>'; document.body.appendChild(el); askDraw();
    setTimeout(() => { const t = el.querySelector('textarea'); t && t.focus(); }, 250);
  };
  const askClose = () => { const el = document.getElementById('ask-sheet'); if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 180); } ASK.open = false; };
  A['ask-open'] = () => (document.getElementById('ask-sheet') ? askClose() : SH.askOpen());
  A['ask-close'] = askClose;
  A['ask-past'] = () => { ASK.view = ASK.view === 'past' ? 'chat' : 'past'; askDraw(); };
  A['ask-new'] = () => { ASK.view = 'chat'; ASK.msgs = []; ASK.draft = ''; askDraw(); };
  A['ask-load'] = (el) => { const c = (DM.S.askChats || []).find((x) => x.id === el.dataset.arg); ASK.msgs = c ? (c.messages || []).map((m) => ({ ...m })) : []; ASK.view = 'chat'; askDraw(); };
  DM.input('ask-text', (v) => { ASK.draft = v; const b = document.querySelector('.ask-send'); if (b) b.classList.toggle('on', !!v.trim()); });
  const askSend = (text) => {
    text = (text || ASK.draft || '').trim(); if (!text || ASK.typing) return; ASK.msgs.push({ role: 'u', text }); ASK.draft = ''; ASK.view = 'chat'; ASK.typing = true; askDraw();
    setTimeout(() => { ASK.typing = false; ASK.msgs.push({ role: 'a', text: answer(text) }); askDraw(); }, 900 + Math.random() * 600);
  };
  A['ask-send'] = (el) => askSend(el.dataset.arg);
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && e.target.matches && e.target.matches('.ask-comp textarea')) { e.preventDefault(); askSend(); } });
  SH.escape = () => { if (document.getElementById('palette-wrap')) { document.getElementById('palette-wrap').remove(); return true; } return false; };
  A['ask'] = () => SH.askOpen();
})();
