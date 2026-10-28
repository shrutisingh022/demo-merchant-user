/* Channels, Apps (Merchant Apps) + ERP configure pages (Coral ERP / Tally / SAP), Logs. Spec: docs/spec/workspace.md §3–4, docs/spec/shell-home.md §4. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, S = () => DM.S, A = DM.act;
  const X = DM.sx; const { frame, head, card, field, chip, crumb, formVals } = X;

  const st = document.createElement('style'); st.dataset.for = 'integrations';
  st.textContent = `
  .ig-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ig-card{background:#fff;border-radius:10px;box-shadow:0 0 0 1px rgba(10,10,10,.1);display:flex;flex-direction:column;overflow:hidden;transition:box-shadow .15s}.ig-card:hover{box-shadow:0 0 0 1px rgba(10,10,10,.18)}
  .ig-top{display:flex;gap:12px;padding:12px 14px;align-items:flex-start;flex:1}
  .ig-tile{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;flex:none;font-weight:700;font-size:15px}.ig-tile svg.i{width:18px;height:18px}
  .ig-name{font-size:12px;font-weight:600;display:flex;gap:6px;align-items:center}.ig-sub{font-size:12px;color:var(--muted-foreground);margin-top:1px}
  .ig-desc{font-size:12px;color:var(--muted-foreground);margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.45}
  .ig-foot{display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(245,245,245,.6);border-top:1px solid var(--border);font-size:12px;color:var(--muted-foreground)}
  .ig-tag{font-size:10px;font-weight:500;padding:0 6px;height:16px;line-height:16px;border-radius:999px;background:#f1f1f1;color:#525252}.ig-tag.feat{background:#fff4d6;color:#9a6208}
  .ig-sel{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ig-opt{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--border);border-radius:10px;padding:10px 12px;text-align:left;transition:background .12s,border-color .12s}.ig-opt:hover:not(.off){background:#f5f5f5;border-color:#d4d4d4}.ig-opt.off{opacity:.5;cursor:default}
  .ig-opt .t{font-size:12px;font-weight:500;display:flex;gap:6px;align-items:center}.ig-opt .d{font-size:11.5px;color:var(--muted-foreground);margin-top:2px;line-height:1.4}
  .ig-box{border:1px solid var(--border);border-radius:10px}.ig-box .r{display:flex;gap:12px;align-items:center;padding:9px 12px;border-top:1px solid var(--border);font-size:12px}.ig-box .r:first-child{border-top:0}.ig-box .r .k{color:var(--muted-foreground);width:190px;flex:none}.ig-box .r .v{flex:1;min-width:0}
  .ig-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.ig-tags span{font-family:ui-monospace,Menlo,monospace;font-size:11px;background:#f4f4f5;border-radius:6px;padding:2px 7px;color:#404040}
  .ig-act{display:flex;gap:8px;flex-wrap:wrap}
  .ig-rec{display:flex;gap:14px;align-items:flex-start;padding:11px 16px;border-top:1px solid var(--border);animation:os-enter .3s both}.ig-rec:first-child{border-top:0}
  .ig-rec .a{font-size:12px;font-weight:600;display:flex;gap:8px;align-items:center}.ig-rec .m{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#525252;margin-top:3px;line-height:1.5;word-break:break-word}.ig-rec .ts{margin-left:auto;font-size:11px;color:var(--muted-foreground);white-space:nowrap;font-variant-numeric:tabular-nums}
  .spin{width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;display:inline-block;animation:ig-spin .7s linear infinite}@keyframes ig-spin{to{transform:rotate(360deg)}}
  .ig-chips{display:flex;gap:6px;flex-wrap:wrap}.ig-chips .c{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 6px 0 10px;border-radius:8px;background:#f4f4f5;font-size:11.5px}.ig-chips .c button{width:14px;height:14px;display:grid;place-items:center;border-radius:50%;color:#737373}.ig-chips .c button:hover{background:#e5e5e5}
  .ig-map{border:1px solid var(--border);border-radius:10px;overflow:hidden}.ig-map .h,.ig-map .r{display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;padding:6px 10px;align-items:center}.ig-map .h{background:#fafafa;font-size:11px;color:#737373;font-weight:500;padding:8px 10px}.ig-map .r{border-top:1px solid var(--border)}
  .lg-day{font-size:12px;font-weight:500;color:var(--muted-foreground);margin:16px 0 8px}.lg-day:first-of-type{margin-top:0}
  .lg-row{display:flex;gap:14px;padding:12px 16px;border-top:1px solid var(--border)}.lg-row:first-child{border-top:0}
  .lg-t{width:48px;flex:none;font-size:12px;color:var(--muted-foreground);font-variant-numeric:tabular-nums;padding-top:1px}.lg-chips{display:flex;gap:6px;margin-bottom:6px}
  .lg-vc{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;background:#f5f5f5;color:#525252;font-size:11px;font-weight:500}
  .lg-pg{display:flex;align-items:center;margin-top:16px;font-size:12px;color:var(--muted-foreground)}.lg-pg .btns{margin-left:auto;display:flex;gap:6px}
  .lg-pg .btn{width:32px;height:32px;padding:0;border-radius:8px}.lg-pg .btn.cur{background:#0a0a0a;color:#fff;border-color:#0a0a0a}
  `;
  document.head.appendChild(st);

  const appsLabel = () => (DM.uc === 'newhome' ? 'Apps' : 'Merchant Apps');
  const nowIso = () => DM.now().toISOString();
  const rel = (iso) => X.ago(iso);
  const UI = () => (DM.ui.ig = DM.ui.ig || { q: '', cat: '', logPage: 0, chips: null });

  /* ═════════════════ CHANNELS ═════════════════ */
  const CH = {
    whatsapp: ['WhatsApp', 'Connect your whatsapp business account to allow agents to respond to messages', 'chat', '#e6f7ec', '#16a34a'],
    email: ['Email', 'Connect any email from Gmail, Outlook, etc. to allow agents to respond to emails', 'mail', '#e8f0fe', '#2563eb'],
    voice: ['Voice', 'Enable AI-powered phone calls with voice channel integration via Plivo', 'phone', '#f3e8ff', '#7c3aed'],
    sms: ['SMS', 'Connect an SMS provider to send messages to your customers', 'chat', '#fff4e5', '#d97706'],
    telegram: ['Telegram', 'Connect a Telegram bot to allow agents to respond to messages', 'send', '#e0f2fe', '#0284c7'],
  };
  const SOON = ['Instagram', 'Website Widget', 'Messenger', 'Push Notifications', 'RCS', 'Slack', 'Freshdesk', 'Zendesk', 'X (Twitter)', 'Agent API'];
  const chTile = (t, s = 40) => { const c = CH[t] || CH.whatsapp; return `<span class="ig-tile" style="background:${c[3]};color:${c[4]};width:${s}px;height:${s}px">${I(c[2])}</span>`; };
  const channelsPage = () => {
    const chs = S().channels || [];
    const cards = chs.map((c) => `<div class="ig-card" data-rid="${c.id}"><div class="ig-top">${chTile(c.type)}<div class="grow" style="min-width:0"><div class="ig-name trunc">${esc(c.name)}</div><div class="ig-sub trunc">${esc(c.name)} — ${esc(c.provider)}</div></div>${DM.status(c.state === 'live' ? 'Live' : c.state === 'paused' ? 'Paused' : 'Needs re-auth', c.state === 'live' ? 'green' : c.state === 'paused' ? 'grey' : 'amber')}<button class="btn ghost icon sm" data-act="ch-menu" data-arg="${c.id}" title="More">${I('more')}</button></div><div class="ig-foot">${I('bot')}<span style="color:#171717;font-weight:500">${esc(c.agent || 'No agent')}</span><span class="grow"></span><span>${esc(rel(c.updatedAt))}</span></div></div>`).join('');
    return frame(head('Channels', 'Where customers reach you, and which agent answers.', `<button class="btn" data-act="ch-create">${I('plus')} Create</button>`) + (chs.length ? `<div class="ig-grid stagger">${cards}</div>` : DM.empty('radio', 'No channels yet', 'Add a channel so customers can reach your agent.')));
  };
  DM.page('/settings/channels', { title: 'Channels', render: channelsPage });
  const agentNames = (cur) => { const a = (S().agents || []).map((x) => x.name); if (cur && !a.includes(cur)) a.unshift(cur); return a.length ? a : [cur || 'Anuma']; };
  const channelForm = (c, isNew, type) => {
    const t = c ? c.type : type; const meta = CH[t] || CH.whatsapp;
    const rows = t === 'whatsapp'
      ? `<div class="ig-box" style="margin-top:2px"><div class="r"><span class="k">Connected number</span><span class="v">${esc(c ? c.number : '+91 98200 00000')}</span></div><div class="r"><span class="k">WhatsApp Business Account ID</span><span class="v">${esc((c && c.wabaId) || '—')}</span></div><div class="r"><span class="k">Phone Number ID</span><span class="v">${esc((c && c.phoneId) || '—')}</span></div><div class="r"><span class="k">Webhook URL</span><span class="v row" style="gap:6px"><input class="sx-in mono" readonly value="${esc((c && c.webhook) || 'https://hooks.demo-merchant.example/whatsapp/new')}"><button class="btn outline sm" data-act="copy" data-arg="${esc((c && c.webhook) || '')}">Copy</button></span></div></div>`
      : `<div class="ig-box"><div class="r"><span class="k">${t === 'email' ? 'Mailbox' : 'Connected account'}</span><span class="v">${esc(c ? c.number : '')}</span></div><div class="r"><span class="k">Webhook URL</span><span class="v row" style="gap:6px"><input class="sx-in mono" readonly value="${esc((c && c.webhook) || '')}"><button class="btn outline sm" data-act="copy" data-arg="${esc((c && c.webhook) || '')}">Copy</button></span></div></div>`;
    const providers = t === 'whatsapp' ? ['360dialog', 'Plivo'] : t === 'email' ? ['Gmail', 'Outlook'] : [meta[0] + ' provider'];
    return `<div class="row" style="gap:10px;margin-bottom:14px">${chTile(t)}<div><div style="font-size:14px;font-weight:600">${isNew ? 'Add ' + meta[0] + ' channel' : 'Configure channel'}</div><div class="muted">Who answers, and what happens when they can't.</div></div></div>
      <div class="sx-fs">${field('Name', 'name', { value: c ? c.name : '', ph: t === 'email' ? 'e.g. Orders mailbox' : 'e.g. Order Desk' })}
      <div class="sx-f"><label>Connected app</label>${isNew ? `<select class="select" name="provider">${providers.map((p) => `<option>${p}</option>`).join('')}</select>` : `<div><span class="sx-chip">${esc(c.provider)}</span></div>`}</div>
      ${isNew && t !== 'whatsapp' && t !== 'email' ? '' : isNew ? field(t === 'email' ? 'Mailbox address' : 'WhatsApp number', 'number', { ph: t === 'email' ? 'orders@company.com' : '+91 98765 43210' }) : `<div class="sx-f"><label>${t === 'whatsapp' ? 'WhatsApp details' : 'Details'}</label>${rows}</div>`}
      <div class="sx-f"><label>Default AI agent</label><div class="row" style="gap:8px"><select class="select" name="agent" style="flex:1">${agentNames(c && c.agent).map((a) => `<option ${c && c.agent === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select><a class="btn outline sm" data-go="/agents" onclick="DM.closeModal()">${I('plus')} New agent</a></div></div>
      <div class="sx-box"><div class="grow"><div class="t">Channel active</div><div class="d">Off pauses everything: no new conversations, no AI replies, no team routing.</div></div>${DM.switch(!c || c.active, 'ch-sw', '')}</div></div>`;
  };
  A('ch-sw', (el) => el.classList.toggle('on'));
  const editChannel = (id) => {
    const c = S().channels.find((x) => x.id === id); if (!c) return;
    DM.dialog({ title: '', w: 520, body: channelForm(c, false), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { const v = formVals(d); if (!v.name.trim()) { DM.toast('Give the channel a name', 'alert'); return false; } const on = d.querySelector('.switch').classList.contains('on'); Object.assign(c, { name: v.name.trim(), agent: v.agent, active: on, state: on ? 'live' : 'paused', updatedAt: nowIso() }); const n = (S().numbers || []).find((x) => x.channelId === c.id); if (n) n.label = c.name; DM.toast('Channel saved'); setTimeout(() => DM.render(), 0); } }] });
  };
  A('ch-menu', (el) => { const id = el.dataset.arg; DM.menu(el, [{ label: 'Edit', icon: 'pencil', run: () => editChannel(id) }, { label: 'Delete', icon: 'trash', danger: true, run: () => { const c = S().channels.find((x) => x.id === id); DM.confirm('Delete channel', `Delete <b>${esc(c.name)}</b>? Conversations already received stay in the Inbox, but no new ones will arrive.`, () => { S().channels = S().channels.filter((x) => x.id !== id); S().numbers = (S().numbers || []).filter((n) => n.channelId !== id); DM.toast('Channel deleted', 'trash'); DM.render(); }, 'Delete'); } }], { right: true, w: 128 }); });
  A('ch-create', () => {
    const opts = Object.entries(CH).map(([k, c]) => `<button class="ig-opt" data-act="ch-pick" data-arg="${k}">${chTile(k, 32)}<div><div class="t">${c[0]}</div><div class="d">${esc(c[1])}</div></div></button>`).join('') + SOON.map((n) => `<div class="ig-opt off"><span class="ig-tile" style="background:#f5f5f5;color:#737373;width:32px;height:32px">${I('blocks')}</span><div class="grow"><div class="t">${n}<span class="sx-chip muted" style="margin-left:auto">Coming soon</span></div></div></div>`).join('');
    DM.dialog({ title: 'Add channel', sub: 'Select a channel to configure for your agent.', w: 720, body: `<div class="ig-sel">${opts}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }] });
  });
  A('ch-pick', (el) => {
    const type = el.dataset.arg; DM.closeModal();
    setTimeout(() => DM.dialog({ title: '', w: 520, body: channelForm(null, true, type), actions: [{ label: 'Back', cls: 'outline', run: () => { setTimeout(() => DM.acts['ch-create'](), 0); } }, { label: 'Create channel', run: (d) => {
      const v = formVals(d); if (!v.name.trim()) { DM.toast('Give the channel a name', 'alert'); return false; }
      const on = d.querySelector('.switch').classList.contains('on'); const id = 'ch-' + (S().channels.length + 1 + Math.floor(Math.random() * 90));
      const ch = { id, type, name: v.name.trim(), provider: v.provider || CH[type][0], state: on ? 'live' : 'paused', agent: v.agent, updatedAt: nowIso(), number: v.number || '', wabaId: type === 'whatsapp' ? '4' + Math.floor(Math.random() * 1e14) : undefined, phoneId: type === 'whatsapp' ? '1' + Math.floor(Math.random() * 1e14) : undefined, webhook: `https://hooks.demo-merchant.example/${type}/${id}`, active: on };
      S().channels.push(ch); if (type === 'whatsapp') (S().numbers = S().numbers || []).push({ id: 'num-' + id, label: ch.name, number: ch.number, channelId: id });
      DM.toast('Channel created', 'radio'); setTimeout(() => DM.render(), 0); } }] }), 160);
  });

  /* ═════════════════ APPS ═════════════════ */
  const logoTile = (a, s = 40) => `<span class="ig-tile" style="background:${a.logo.bg};color:${a.logo.fg};width:${s}px;height:${s}px;font-size:${a.logo.t.length > 1 ? 11 : 15}px">${a.logo.t ? esc(a.logo.t) : I('puzzle')}</span>`;
  const appsPage = () => {
    const u = UI(); const apps = [...(S().apps || [])].sort((a, b) => (a.state === 'connected' ? 0 : 1) - (b.state === 'connected' ? 0 : 1));
    const q = u.q.toLowerCase(); const list = apps.filter((a) => (!q || (a.name + ' ' + a.category + ' ' + a.desc).toLowerCase().includes(q)) && (!u.cat || a.category === u.cat));
    const cards = list.map((a) => `<div class="ig-card" data-rid="${a.slug}"><div class="ig-top">${logoTile(a)}<div class="grow" style="min-width:0"><div class="ig-name">${esc(a.name)}${a.tag ? `<span class="ig-tag ${a.tag === 'Featured' ? 'feat' : ''}">${a.tag}</span>` : ''}</div><div class="ig-sub">${esc(a.category)}</div><div class="ig-desc">${esc(a.desc)}</div></div>${DM.status(a.state === 'connected' ? 'Connected' : 'Not connected', a.state === 'connected' ? 'green' : 'grey')}</div><div class="ig-foot">${a.state === 'connected' ? `<button class="btn outline sm" data-go="/settings/integrations/${a.slug}">${I('list')} Configure</button>${a.slug === 'google-sheets' || a.slug === 'tally' || a.slug === 'coral-erp' || a.slug === 'sap' ? '' : ''}` : `<button class="btn sm" data-act="app-connect" data-arg="${a.slug}">${I('zap')} Connect</button>`}<button class="btn ghost sm" data-act="app-docs" data-arg="${esc(a.name)}">Docs ${I('ext')}</button></div></div>`).join('');
    return frame(head(appsLabel(), 'Systems connected to your workspace, and everything you can connect.') +
      `<div class="row" style="margin-bottom:12px;gap:8px"><div class="sgroup">${I('search')}<input data-input="ig-q" placeholder="Search apps…" value="${esc(u.q)}"></div><button class="btn outline sm" data-act="app-filters">${I('filter')} Filters${u.cat ? ' · ' + esc(u.cat) : ''}</button>${u.cat ? `<button class="btn ghost sm" data-act="app-clear">${I('x')} Clear</button>` : ''}</div>` +
      (list.length ? `<div class="ig-grid stagger">${cards}</div>` : DM.empty('blocks', 'No apps match', 'Try a different search or clear the filter.')));
  };
  DM.page('/settings/integrations', { title: appsLabel(), render: appsPage });
  DM.input('ig-q', (v) => { UI().q = v; DM.render(); });
  A('app-clear', () => { UI().cat = ''; DM.render(); });
  A('app-docs', (el) => DM.toast('Docs for ' + el.dataset.arg + ' open in a new tab', 'ext'));
  A('app-filters', (el) => {
    const cats = [...new Set((S().apps || []).map((a) => a.category))];
    DM.menu(el, [{ heading: 'Filter by' }, { label: 'Category', icon: 'tag', hint: '›', run: () => setTimeout(() => DM.menu(el, [{ heading: 'Category' }, ...cats.map((c) => ({ label: c, check: UI().cat === c, run: () => { UI().cat = UI().cat === c ? '' : c; DM.render(); } }))], { w: 200 }), 0) }], { w: 224 });
  });
  A('app-connect', (el) => {
    const a = S().apps.find((x) => x.slug === el.dataset.arg); const erp = ['coral-erp', 'tally', 'sap'].includes(a.slug);
    DM.dialog({ title: 'Connect ' + esc(a.name), sub: erp ? 'Enter the connection details. Credentials are stored encrypted and never shown again.' : 'Authorise Anuma to read and write on your behalf.', w: 520,
      body: `<div class="sx-fs">${field('Label', 'label', { value: a.name, hint: 'Distinguishes multiple installs of the same app.' })}${field(a.slug === 'tally' ? 'Tally gateway URL' : a.slug === 'sap' ? 'Gateway base URL' : 'API key', 'key', { ph: a.slug === 'tally' ? 'http://tally-gw.company.local:9000' : a.slug === 'sap' ? 'https://sap-gw.company.com/sap/opu/odata/…' : 'Paste the key from your ' + a.name + ' account', mono: true })}</div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Connect', run: (d) => { const v = formVals(d); if (!v.key.trim()) { DM.toast('Add the connection detail first', 'alert'); return false; }
        const b = d.querySelector('.modal-f .btn:last-child'); b.innerHTML = '<span class="spin"></span> Connecting…'; b.disabled = true;
        setTimeout(() => { a.state = 'connected'; a.installId = 'in-' + a.slug.slice(0, 6); a.connectedAt = nowIso(); a.config = Object.assign({}, ({ 'coral-erp': { label: v.label, productGroups: [], attrMap: [] }, tally: { label: v.label, gatewayUrl: v.key, companyName: (S().company || {}).legalName || '', salesLedger: 'Sales', voucherType: 'Sales', voucherPrefix: 'SC', godown: 'Main Location', autoPost: true, ledgerMap: [] }, sap: { label: v.label, baseUrl: v.key, companyCode: '1000', salesOrg: '1000', distChannel: '10', division: '00', docType: 'OR', plant: '1010', attrMap: [] } })[a.slug] || { label: v.label }); DM.closeModal(); DM.toast(a.name + ' connected', 'zap'); DM.render(); }, 900); return false; } }] });
  });

  /* ───────── configure page ───────── */
  const META = {
    'coral-erp': { desc: 'Pull products, categories, account/org groups, and org units from Coral ERP; push confirmed draft orders as sales orders.', tags: ['crm_erp', 'auth: api_key', 'pull_crm_records', 'pull_org_records'], actions: ['Sync Products', 'Sync Customers', 'Sync Org Structure', 'Full Sync'], res: { 'Sync Products': 'products: 0 errors, 3 created_products, 9 created_variants, 41 updated_variants · product_categories: 0 created, 2 updated', 'Sync Customers': 'customers: 0 errors, 2 created, 55 updated · sales_users: 0 no_org_unit, 1 created_users, 0 skipped_no_email', 'Sync Org Structure': 'org_units: 0 errors, 0 created, 9 updated · account_groups: 0 created, 3 updated', 'Full Sync': 'products: 0 errors, 3 created_products, 9 created_variants, 41 updated_variants · customers: 0 errors, 2 created, 55 updated · org_units: 0 created, 9 updated · account_groups: 0 created, 3 updated' } },
    tally: { desc: 'Pull stock items and ledgers from Tally Prime; post confirmed draft orders as sales vouchers.', tags: ['crm_erp', 'auth: gateway_url', 'pull_stock_items', 'push_vouchers'], actions: ['Sync Stock Items', 'Sync Ledgers', 'Push Vouchers', 'Full Sync'], res: { 'Sync Stock Items': 'stock_items: 0 errors, 2 created, 131 updated · groups: 0 created, 1 updated', 'Sync Ledgers': 'ledgers: 0 errors, 1 created, 37 updated · unmapped_parties: 1', 'Push Vouchers': 'vouchers: 0 errors, 1 posted · pending: 0', 'Full Sync': 'stock_items: 0 errors, 2 created, 131 updated · ledgers: 0 errors, 1 created, 37 updated · vouchers: 1 posted' } },
    sap: { desc: 'Pull materials and customers from SAP S/4HANA; send confirmed RFQ lines and quotes to SAP as sales documents.', tags: ['crm_erp', 'auth: oauth2', 'pull_materials', 'push_sales_documents'], actions: ['Sync Materials', 'Sync Customers', 'Push Documents', 'Full Sync'], res: { 'Sync Materials': 'materials: 0 errors, 2 created, 213 updated · plants: 0 created, 1 updated', 'Sync Customers': 'customers: 0 errors, 1 created, 33 updated', 'Push Documents': 'documents: 0 errors, 1 created · pending: 0', 'Full Sync': 'materials: 0 errors, 2 created, 213 updated · customers: 0 errors, 1 created, 33 updated · documents: 1 created' } },
    'google-sheets': { desc: 'Read, write and search rows in a Google Sheet. A connector only: what the rows mean is up to the workflow that uses them.', tags: ['spreadsheets', 'auth: oauth'], actions: [], res: {} },
  };
  const tsFull = (iso) => { const d = new Date(iso); return d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }) + ', ' + d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }); };
  const recent = (a) => { const rows = (S().erpLog || []).filter((r) => r.app === a.slug); return rows.length ? rows.map((r) => `<div class="ig-rec" data-rid="${r.id}"><div class="grow" style="min-width:0"><div class="a">${esc(r.action)}${r.draftNo ? `<span class="monotag">${esc(r.draftNo)}</span>` : ''}${r.state === 'failed' ? DM.status('Failed', 'red') : r.state === 'pending' ? DM.status('Pending', 'amber') : r.kind === 'push' ? DM.status(r.ref || 'Posted', 'green') : ''}${r.retried ? '<span class="sx-chip muted">retried</span>' : ''}</div><div class="m">${esc(r.result)}</div>${r.state === 'failed' ? `<div style="margin-top:6px"><button class="btn outline sm" data-act="erp-retry" data-arg="${r.id}">${I('refresh')} Retry</button></div>` : ''}</div><div class="ts">${esc(tsFull(r.at))}</div></div>`).join('') : `<div class="muted" style="padding:22px;text-align:center">No manual actions have run on this connection yet.</div>`; };
  const cfgFields = (a) => {
    const c = a.config || {};
    if (a.slug === 'coral-erp') return `<div class="sx-fs">${field('Default Courier', 'defaultCourier', { value: c.defaultCourier, hint: 'Coral Courier/Transporter master name sent on pushed sales orders. Blank is accepted by Coral.' })}${field('Sales User Role', 'salesUserRole', { value: c.salesUserRole, hint: "Name of the merchant Role given to users created from Coral sales people. Defaults to 'Sales'." })}${field('Order Reference Prefix', 'orderRefPrefix', { value: c.orderRefPrefix, hint: "Optional prefix for the ExternalRef Coral de-duplicates pushed sales orders on, which is otherwise just the draft order's number (e.g. DRF-1001). Set it on stage and local installs that push to the same Coral database as production, so their numbers can't collide." })}
      <div class="sx-f"><label>Sellable Product Groups</label><div class="ig-chips">${(c.productGroups || []).map((g, i) => `<span class="c">${esc(g)}<button data-act="cfg-pg-del" data-arg="${i}">${I('x')}</button></span>`).join('')}</div><div class="row" style="gap:8px;margin-top:6px"><input class="sx-in" id="cfg-pg" placeholder="Add a product group"><button class="btn outline sm" data-act="cfg-pg-add">Add</button></div><div class="hint">API_FetchProduct.productGroup values to import as PIM Products; everything else (Yarn, Greige/raw, Job Work, …) is out of scope.</div></div>
      ${field('Default Mode of Transport', 'defaultTransport', { value: c.defaultTransport, hint: 'Coral Mode of Transport master name sent on pushed sales orders. Blank is accepted by Coral.' })}${mapTable(a, 'Field Name', 'Coral Attribute', "Coral's API_FetchProduct exposes attribute1..attribute23. Map the ones your catalogue uses.")}</div>`;
    if (a.slug === 'tally') return `<div class="sx-fs">${field('Company name', 'companyName', { value: c.companyName, hint: 'Exactly as it appears in Tally Prime.' })}${field('Tally gateway URL', 'gatewayUrl', { value: c.gatewayUrl, mono: true, hint: 'Where the Tally HTTP gateway listens on your network.' })}<div class="sx-g2">${field('Sales ledger', 'salesLedger', { value: c.salesLedger })}${field('Voucher type', 'voucherType', { options: ['Sales', 'Sales Order'], value: c.voucherType })}</div><div class="sx-g2">${field('Voucher prefix', 'voucherPrefix', { value: c.voucherPrefix, hint: 'Numbers look like SC-26-0399.' })}${field('Godown', 'godown', { value: c.godown })}</div><div class="sx-box"><div class="grow"><div class="t">Post confirmed orders automatically</div><div class="d">When a draft order is approved, create the sales voucher in Tally without waiting for a person.</div></div>${DM.switch(c.autoPost, 'cfg-sw', '')}</div>${mapTable(a, 'Party', 'Tally ledger', 'Parties map to Tally ledgers by name. Unmapped parties are created on first post.', 'ledgerMap', 'party', 'ledger')}</div>`;
    if (a.slug === 'sap') return `<div class="sx-fs">${field('Gateway base URL', 'baseUrl', { value: c.baseUrl, mono: true })}<div class="sx-g2">${field('Company code', 'companyCode', { value: c.companyCode })}${field('Sales organisation', 'salesOrg', { value: c.salesOrg })}</div><div class="sx-g2">${field('Distribution channel', 'distChannel', { value: c.distChannel })}${field('Division', 'division', { value: c.division })}</div><div class="sx-g2">${field('Document type', 'docType', { value: c.docType, hint: 'OR = standard sales order.' })}${field('Plant', 'plant', { value: c.plant })}</div>${mapTable(a, 'Field Name', 'SAP Field', 'Which SAP fields the catalogue columns are written to.')}</div>`;
    return `<div class="sx-fs">${field('Sheet name', 'sheetName', { value: c.sheetName || '' })}${field('Sheet ID', 'sheetId', { value: c.sheetId || '', mono: true })}</div>`;
  };
  const mapTable = (a, h1, h2, helper, key = 'attrMap', k1 = 'field', k2 = 'attr') => { const rows = (a.config && a.config[key]) || []; return `<div class="sx-f"><label>${key === 'ledgerMap' ? 'Ledger mapping' : 'Product Attribute Mapping'}</label><div class="ig-map"><div class="h"><span>${h1}</span><span>${h2}</span><span></span></div>${rows.map((r, i) => `<div class="r"><input class="sx-in" data-mk="${k1}" data-mi="${i}" value="${esc(r[k1])}"><input class="sx-in" data-mk="${k2}" data-mi="${i}" value="${esc(r[k2])}"><button class="btn ghost icon sm" data-act="cfg-map-del" data-arg="${key}|${i}">${I('trash')}</button></div>`).join('')}<div class="r" style="grid-template-columns:1fr"><button class="btn ghost sm" style="justify-self:start" data-act="cfg-map-add" data-arg="${key}|${k1}|${k2}">${I('plus')} Add row</button></div></div><div class="hint">${esc(helper)}</div></div>`; };
  const cfgPage = ({ params }) => {
    const a = (S().apps || []).find((x) => x.slug === params.slug);
    if (!a) return frame(DM.empty('blocks', 'App not found', 'It may not be available in this workspace.'));
    const m = META[a.slug] || { desc: a.desc, tags: [a.category.toLowerCase()], actions: [], res: {} };
    const back = `<button class="btn ghost sm" style="margin-bottom:12px" data-go="/settings/integrations">${I('arrowL')} ${appsLabel()}</button>`;
    if (a.state !== 'connected') return frame(back + `<div class="row" style="gap:12px;margin-bottom:16px">${logoTile(a)}<div><h1 style="font-size:20px;font-weight:600">${esc(a.name)}</h1><div class="muted">${esc(a.desc)}</div></div></div>` + card('Not connected', 'Connect ' + esc(a.name) + ' to configure it.', `<button class="btn" data-act="app-connect" data-arg="${a.slug}">${I('zap')} Connect</button>`));
    const acts = m.actions.length ? card('Actions', `Manually trigger a sync step for this ${esc(a.name)} connection.`, `<div class="ig-act">${m.actions.map((x) => `<button class="btn outline" data-act="app-run" data-arg="${a.slug}|${esc(x)}">${I('play')} ${esc(x)}</button>`).join('')}</div>`, { right: `<span class="icotile">${I('zap')}</span>` }) : '';
    const conn = card('Connection', `Update the label and settings for this ${esc(a.name)} connection. To rotate credentials, uninstall and reinstall.`, `<div class="sx-fs">${field('Label', 'label', { value: (a.config || {}).label || a.name, req: true, hint: 'Distinguishes multiple installs of the same app.' })}</div>`, { right: `<button class="btn outline sm" style="color:#e03a3a;border-color:#f3c6c6" data-act="app-uninstall" data-arg="${a.slug}">Uninstall</button>` });
    const conf = card('Configuration', `Non-secret settings for how ${esc(a.name)} behaves inside Anuma.`, `<div id="cfg-form">${cfgFields(a)}<div style="margin-top:16px"><button class="btn" data-act="cfg-save" data-arg="${a.slug}">Save changes</button></div></div>`, { right: `<span class="icotile">${I('sliders')}</span>` });
    const rec = card('Recent activity', 'Manual action runs for this connection, most recent first.', recent(a), { flush: true, right: `<span class="icotile">${I('history')}</span>` });
    return frame(back + `<div class="row" style="gap:12px;margin-bottom:16px;align-items:flex-start">${logoTile(a)}<div><h1 style="font-size:20px;font-weight:600;letter-spacing:-.01em">Edit ${esc(a.name)}</h1><div class="muted" style="margin-top:2px">${esc(m.desc)}</div><div class="ig-tags">${m.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div></div><div class="sx-stack">${acts}${conn}${conf}${rec}</div>`);
  };
  DM.page('/settings/integrations/:slug', { title: 'Apps', render: cfgPage, after: () => crumb(appsLabel()) });
  const appBySlug = (slug) => S().apps.find((x) => x.slug === slug);
  const readCfg = (a) => { const f = document.getElementById('cfg-form'); if (!f) return; f.querySelectorAll('[name]').forEach((e) => { a.config[e.name] = e.value; }); f.querySelectorAll('[data-mi]').forEach((e) => { /* map rows are read via the nearest key */ }); ['attrMap', 'ledgerMap'].forEach((key) => { if (!a.config[key]) return; const rows = [...f.querySelectorAll('.ig-map .r')].filter((r) => r.querySelector('[data-mi]')); const k1 = rows[0] && rows[0].querySelector('[data-mk]') ? rows[0].querySelector('[data-mk]').dataset.mk : null; if (!k1) return; a.config[key] = rows.map((r) => { const ins = r.querySelectorAll('[data-mk]'); return { [ins[0].dataset.mk]: ins[0].value, [ins[1].dataset.mk]: ins[1].value }; }); }); const sw = f.querySelector('.switch'); if (sw && 'autoPost' in a.config) a.config.autoPost = sw.classList.contains('on'); const l = document.querySelector('input[name=label]'); if (l) a.config.label = l.value; };
  A('cfg-sw', (el) => el.classList.toggle('on'));
  A('cfg-save', (el) => { const a = appBySlug(el.dataset.arg); readCfg(a); DM.toast('Configuration saved'); });
  A('cfg-pg-add', () => { const a = S().apps.find((x) => x.slug === 'coral-erp'); const i = document.getElementById('cfg-pg'); if (!i || !i.value.trim()) return; readCfg(a); a.config.productGroups.push(i.value.trim()); DM.render(); });
  A('cfg-pg-del', (el) => { const a = S().apps.find((x) => x.slug === 'coral-erp'); readCfg(a); a.config.productGroups.splice(+el.dataset.arg, 1); DM.render(); });
  A('cfg-map-add', (el) => { const [key, k1, k2] = el.dataset.arg.split('|'); const slug = DM.path().split('/').pop(); const a = appBySlug(slug); readCfg(a); a.config[key] = a.config[key] || []; a.config[key].push({ [k1]: '', [k2]: '' }); DM.render(); });
  A('cfg-map-del', (el) => { const [key, i] = el.dataset.arg.split('|'); const a = appBySlug(DM.path().split('/').pop()); readCfg(a); a.config[key].splice(+i, 1); DM.render(); });
  A('app-uninstall', (el) => { const a = appBySlug(el.dataset.arg); DM.confirm('Uninstall ' + esc(a.name), 'Syncs stop and stored credentials are deleted. Mapping and history stay for 30 days.', () => { a.state = 'available'; a.config = null; a.installId = null; DM.toast(a.name + ' uninstalled', 'trash'); DM.go('/settings/integrations'); }, 'Uninstall'); });
  A('app-run', (el) => {
    const [slug, label] = el.dataset.arg.split('|'); const a = appBySlug(slug); const m = META[slug];
    el.disabled = true; el.innerHTML = '<span class="spin"></span> Running…';
    setTimeout(() => { S().erpLog = S().erpLog || []; S().erpLog.unshift({ id: DM.uid('erp'), app: slug, action: label, kind: 'sync', state: 'success', at: nowIso(), result: (m.res[label] || 'ok') }); DM.toast(label + ' finished', 'check'); DM.render(); }, 1300 + Math.random() * 600);
    void a;
  });
  A('erp-retry', (el) => {
    const r = S().erpLog.find((x) => x.id === el.dataset.arg); if (!r) return;
    el.disabled = true; el.innerHTML = '<span class="spin"></span> Retrying…';
    setTimeout(() => { const a = appBySlug(r.app); const ref = a.slug === 'tally' ? 'SC-26-0' + (399 + Math.floor(Math.random() * 3)) : a.slug === 'sap' ? 'SD-4500012' + (940 + Math.floor(Math.random() * 40)) : 'SO-26-0' + (4820 + Math.floor(Math.random() * 40)); r.state = 'success'; r.retried = true; r.status = 200; r.error = ''; r.ref = ref; r.result = (a.slug === 'tally' ? 'Sales voucher ' + ref + ' posted' : a.slug === 'sap' ? 'Sales order ' + ref + ' created' : 'Sales order created · Coral ref ' + ref) + ' · retry succeeded'; DM.toast('Retry succeeded — ' + ref, 'check'); DM.render(); }, 1100);
  });

  /* ═════════════════ LOGS ═════════════════ */
  const hhmm = (iso) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  const dayHead = (iso) => new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
  const chipTone = { confirmed: 'green', failed: 'red', blocked: 'amber', sent: 'blue' };
  const logsPage = () => {
    const all = [...(S().logs || [])].sort((a, b) => (a.at < b.at ? 1 : -1)); const u = UI(); const per = 50; const pages = Math.max(1, Math.ceil(all.length / per)); u.logPage = Math.min(u.logPage, pages - 1);
    const slice = all.slice(u.logPage * per, (u.logPage + 1) * per); const groups = []; slice.forEach((r) => { const d = DM.dayOf(r.at); let g = groups[groups.length - 1]; if (!g || g.d !== d) groups.push((g = { d, head: dayHead(r.at), rows: [] })); g.rows.push(r); });
    const body = groups.map((g) => `<div class="lg-day">${g.head}</div><div class="sx-card" style="overflow:hidden">${g.rows.map((r) => `<div class="lg-row" data-rid="${r.id}"><span class="lg-t">${hhmm(r.at)}</span><div style="min-width:0"><div class="lg-chips"><span class="lg-vc">generic ${esc(r.verb || 'updated')}</span><span class="sx-chip ${chipTone[r.chip] || ''}">${esc(r.chip || 'logged')}</span></div><div style="font-size:12px;line-height:1.45">${esc(r.title)}</div><div class="muted" style="margin-top:3px">${esc(r.actor)}${r.entity ? ' · ' + esc(r.entity) : ''}</div></div></div>`).join('')}</div>`).join('');
    const pg = all.length > per ? `<div class="lg-pg"><span>${u.logPage * per + 1}-${Math.min(all.length, (u.logPage + 1) * per)} of ${all.length}</span><div class="btns"><button class="btn outline" data-act="lg-pg" data-arg="${u.logPage - 1}" ${u.logPage === 0 ? 'disabled' : ''}>${I('chevL')}</button>${Array.from({ length: pages }, (_, i) => `<button class="btn ${i === u.logPage ? 'cur' : 'outline'}" data-act="lg-pg" data-arg="${i}">${i + 1}</button>`).join('')}<button class="btn outline" data-act="lg-pg" data-arg="${u.logPage + 1}" ${u.logPage >= pages - 1 ? 'disabled' : ''}>${I('chevR')}</button></div></div>` : '';
    return frame(head('Logs', 'Everything Anuma and your team did, newest first.') + (all.length ? body + pg : DM.empty('history', 'Nothing logged yet', 'Actions by Anuma and your team show up here.')));
  };
  DM.page('/settings/logs', { title: 'Logs', render: logsPage });
  A('lg-pg', (el) => { UI().logPage = +el.dataset.arg; DM.render(); const v = document.getElementById('view'); v && (v.scrollTop = 0); });
})();
