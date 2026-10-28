/* Settings: Company, Navigation, Humans, Rulebook, Usage. Spec: docs/spec/settings.md. Shared helpers exposed as DM.sx for integrations.js. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, S = () => DM.S;
  const A = DM.act;
  const ORG = 'Demo Merchant User';
  const TODAY = '2026-10-27';

  Object.assign(DM.icons, {
    sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    puzzle: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    shieldx: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m14.5 9.5-5 5"/><path d="m9.5 9.5 5 5"/>',
  });

  /* ───────── styles ───────── */
  const st = document.createElement('style'); st.dataset.for = 'settings';
  st.textContent = `
  .sx{font-size:12px}
  .sx-h{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.sx-h h1{font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.2}.sx-h .sx-sub{font-size:12px;color:var(--muted-foreground);margin-top:4px}
  .sx-h .sx-acts{margin-left:auto;display:flex;gap:8px;align-items:center}
  .sx-stack{display:flex;flex-direction:column;gap:16px}
  .sx-card{background:#fff;border-radius:10px;box-shadow:0 0 0 1px rgba(10,10,10,.1)}
  .sx-ch{display:flex;align-items:flex-start;gap:8px;padding:14px 16px 0}.sx-ch .t{font-size:14px;font-weight:600;display:flex;gap:8px;align-items:center}.sx-ch .d{font-size:12px;color:var(--muted-foreground);margin-top:2px}.sx-ch .r{margin-left:auto;display:flex;gap:6px;align-items:center}
  .sx-cb{padding:12px 16px 16px}.sx-cb.flush{padding:0}
  .sx-row{display:flex;align-items:center;gap:12px;padding:0 16px;min-height:50px;border-top:1px solid var(--border)}.sx-row:first-child{border-top:0}
  .sx-row .lbl{font-size:13px;font-weight:500}
  .sx-tag{font-size:11px;color:var(--muted-foreground)}
  .sx-kv{display:grid;grid-template-columns:1fr 1fr;gap:14px 24px}.sx-kv .k{font-size:11px;color:var(--muted-foreground);margin-bottom:2px}.sx-kv .v{font-size:13px}
  .sx-logo{width:48px;height:48px;border-radius:10px;overflow:hidden;display:grid;place-items:center;background:#0a0a0a;flex:none}.sx-logo img{width:100%;height:100%;object-fit:cover}.sx-logo.lg{width:64px;height:64px;border-radius:12px}
  .sx-logo.ph{background:#f5f5f5;color:#737373;font-weight:600;font-size:14px}
  .sx-dash{border:1px dashed #d4d4d4;border-radius:10px;padding:12px;display:flex;align-items:center;gap:14px}
  .sx-collapse{border:1px solid var(--border);background:rgba(245,245,245,.35);border-radius:10px;overflow:hidden}
  .sx-collapse>button{width:100%;display:flex;align-items:center;gap:8px;padding:10px 14px;text-align:left}
  .sx-collapse .chev{margin-left:auto;transition:transform .2s}.sx-collapse.open .chev{transform:rotate(180deg)}
  .sx-collapse .body{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;padding:4px 14px 14px;animation:os-fade .2s both}
  .sx-collapse .body div{display:flex;gap:8px;align-items:center}.sx-collapse .body svg{color:#13a269;width:14px;height:14px}
  .sx-foot{padding:10px 16px;background:rgba(245,245,245,.6);border-top:1px solid var(--border);font-size:12px;color:var(--muted-foreground);border-radius:0 0 10px 10px}.sx-foot a{color:#171717;font-weight:500;cursor:pointer}
  .sx-in{height:28px;width:100%;border:1px solid var(--input);border-radius:8px;padding:0 10px;font-size:12px;outline:none;background:#fff;transition:border-color .15s,box-shadow .15s}.sx-in:focus{border-color:#a3a3a3;box-shadow:0 0 0 3px rgba(10,10,10,.06)}
  textarea.sx-in{height:auto;padding:8px 10px;line-height:1.5;resize:vertical}
  .sx-f{display:flex;flex-direction:column;gap:5px}.sx-f>label{font-size:12px;font-weight:500}.sx-f .hint{font-size:11px;color:var(--muted-foreground)}
  .sx-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sx-fs{display:flex;flex-direction:column;gap:12px}
  .sx-box{border:1px solid var(--border);border-radius:10px;padding:10px 12px;display:flex;align-items:flex-start;gap:10px}
  .sx-box .t{font-size:12px;font-weight:500}.sx-box .d{font-size:11.5px;color:var(--muted-foreground);margin-top:1px}
  .sx-chk{width:15px;height:15px;border:1.5px solid #a3a3a3;border-radius:4px;display:inline-grid;place-items:center;flex:none;margin-top:1px;cursor:pointer;transition:background .12s,border-color .12s}.sx-chk.on{background:#0a0a0a;border-color:#0a0a0a;color:#fff}.sx-chk svg.i{width:11px;height:11px;stroke-width:3}
  .sx-chip{display:inline-flex;align-items:center;gap:5px;height:20px;border-radius:999px;padding:0 8px;font-size:11px;font-weight:500;border:1px solid var(--border);background:#fff;white-space:nowrap}
  .sx-chip.dark{background:#0a0a0a;color:#fff;border-color:#0a0a0a}.sx-chip.amber{background:#fff8e6;color:#9a6208;border-color:#f4e3a8}.sx-chip.muted{background:#f5f5f5;border-color:transparent;color:#525252}
  .sx-chip.green{background:#eefbe8;color:#0b7a4e;border-color:#c7ecc0}
  .sx-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a3a3a3}.sx-dot.g{background:#13a269}
  .hm-n{display:flex;align-items:center;gap:8px}.hm-n .avatar{width:20px;height:20px;border-radius:6px;font-size:9px}
  .hm-ic{display:inline-flex;gap:6px;align-items:center}.hm-ic .btn.icon{width:24px;height:24px;border-radius:7px}
  .sx-nm{display:flex;align-items:center;gap:12px;min-height:50px;padding:0 16px;border-top:1px solid var(--border)}.sx-nm:first-child{border-top:0}
  .sx-nm .icotile{width:28px;height:28px}
  .sx-mx{width:100%;border-collapse:collapse;font-size:12px}.sx-mx th{position:sticky;top:0;background:#fff;text-align:center;font-weight:500;color:#737373;padding:8px 6px;border-bottom:1px solid var(--border);z-index:1}.sx-mx th:first-child,.sx-mx td:first-child{text-align:left;padding-left:2px}
  .sx-mx td{padding:7px 6px;text-align:center;border-bottom:1px solid rgba(10,10,10,.06)}.sx-mx .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#e5e5e5}.sx-mx .dot.on{background:#0a0a0a}
  .sx-prose p{font-size:13px;line-height:1.55;margin:0 0 8px}.sx-prose.clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.sx-prose p:last-child{margin-bottom:0}
  .sx-read{font-size:12px;font-weight:500;text-decoration:underline;cursor:pointer;margin-top:6px;display:inline-block}
  .sx-pills{display:flex;flex-wrap:wrap;gap:6px}.sx-pill{display:inline-flex;align-items:center;gap:6px;height:24px;border-radius:999px;padding:0 6px 0 10px;border:1px solid #f3c6c6;background:#fff;font-size:12px;animation:pop-in .15s both}.sx-pill button{width:14px;height:14px;display:grid;place-items:center;border-radius:50%;color:#a3a3a3}.sx-pill button:hover{background:#f5f5f5;color:#171717}
  .sx-pill.add{border:1px dashed #d4d4d4;padding:0 10px;color:#525252;cursor:pointer}
  .sx-pb{display:flex;align-items:center;gap:12px;padding:10px 16px;border-top:1px solid var(--border);cursor:pointer;transition:background .12s}.sx-pb:first-child{border-top:0}.sx-pb:hover{background:rgba(245,245,245,.6)}
  .sx-pb .pr{width:28px;height:28px;border:1px solid var(--border);border-radius:8px;display:grid;place-items:center;font-size:11px;font-weight:500;flex:none}
  .sx-pb .tt{font-size:13px;font-weight:500;display:flex;gap:6px;align-items:center}.sx-pb .ds{font-size:12px;color:var(--muted-foreground)}.sx-pb .ct{margin-left:auto;font-size:12px;color:var(--muted-foreground);display:flex;gap:6px;align-items:center}.sx-pb .ct b{color:#171717;font-weight:600}
  .sx-li{display:flex;align-items:flex-start;gap:10px;padding:9px 16px;border-top:1px solid var(--border);font-size:13px;line-height:1.45}.sx-li:first-child{border-top:0}.sx-li svg.i{margin-top:2px;flex:none;width:14px;height:14px}.sx-li .x{margin-left:auto;color:#a3a3a3;flex:none}.sx-li .x:hover{color:#171717}
  .sx-lim{display:flex;align-items:center;gap:16px;padding:12px 16px;border-top:1px solid var(--border)}.sx-lim:first-child{border-top:0}.sx-lim .t{font-size:13px;font-weight:500}.sx-lim .d{font-size:12px;color:var(--muted-foreground);margin-top:1px}.sx-lim select{width:150px;flex:none}
  .u-bar{height:8px;border-radius:999px;background:#f1f1f1;position:relative;overflow:hidden}.u-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;transition:width .7s cubic-bezier(.22,.8,.24,1)}.u-bar .proj{background:repeating-linear-gradient(135deg,rgba(19,162,105,.35) 0 3px,transparent 3px 6px);border-radius:0 999px 999px 0}
  .u-wrap{position:relative}.u-tick{position:absolute;top:-3px;bottom:-3px;width:1.5px;background:#a3a3a3}
  .u-don{position:relative;width:64px;height:64px;flex:none}.u-don svg{transform:rotate(-90deg)}.u-don circle{transition:stroke-dashoffset .8s cubic-bezier(.22,.8,.24,1)}.u-don .p{position:absolute;inset:0;display:grid;place-items:center;font-size:12px;font-weight:600}
  .sx-chk.dis{opacity:.5;cursor:default}
  `;
  document.head.appendChild(st);

  /* ───────── shared helpers (also used by integrations.js) ───────── */
  const U = () => (DM.ui.set = DM.ui.set || { navTab: 'labels', navAll: false, q: {}, read: {}, edit: null, neverAll: false, adding: false, subOpen: false });
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const frame = (inner, cls = '') => `<div class="page narrow sx ${cls}">${inner}</div>`;
  const head = (title, sub, right = '') => `<div class="sx-h"><div><h1>${title}</h1>${sub ? `<div class="sx-sub">${sub}</div>` : ''}</div><div class="sx-acts">${right}</div></div>`;
  const card = (title, desc, body, o = {}) => `<div class="sx-card ${o.cls || ''}" ${o.attrs || ''}>${title ? `<div class="sx-ch"><div class="grow"><div class="t">${title}</div>${desc ? `<div class="d">${desc}</div>` : ''}</div>${o.right ? `<div class="r">${o.right}</div>` : ''}</div>` : ''}<div class="sx-cb ${o.flush ? 'flush' : ''}">${body}</div>${o.foot ? `<div class="sx-foot">${o.foot}</div>` : ''}</div>`;
  const field = (label, name, o = {}) => `<div class="sx-f ${o.cls || ''}"><label>${esc(label)}${o.req ? ' *' : ''}</label>${o.area ? `<textarea class="sx-in" name="${name}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(o.value || '')}</textarea>` : o.options ? `<select class="select" name="${name}">${o.options.map((x) => `<option ${x === o.value ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>` : `<input class="sx-in" name="${name}" type="${o.type || 'text'}" value="${esc(o.value ?? '')}" placeholder="${esc(o.ph || '')}" ${o.ro ? 'readonly' : ''} ${o.mono ? 'style="font-family:ui-monospace,Menlo,monospace"' : ''}>`}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
  const chk = (on, act, arg, o = {}) => `<button class="sx-chk ${on ? 'on' : ''} ${o.dis ? 'dis' : ''}" ${act && !o.dis ? `data-act="${act}" data-arg="${esc(arg ?? '')}"` : ''} role="checkbox" aria-checked="${!!on}">${on ? I('check') : ''}</button>`;
  const chip = (t, tone = '') => `<span class="sx-chip ${tone}">${esc(t)}</span>`;
  const crumb = (label) => { const b = document.querySelector('#crumb b'); if (b) b.textContent = label; };
  const fmtD = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }); };
  const ago = (iso) => { const m = Math.round((new Date('2026-10-27T17:30:00+05:30') - new Date(iso)) / 60000); if (m < 60) return m + ' min ago'; if (m < 1440) return Math.round(m / 60) + ' hours ago'; const d = Math.round(m / 1440); return d === 1 ? '1 day ago' : d + ' days ago'; };
  const me = () => (S().users || []).find((u) => u.me) || { id: 'u-rohan', name: 'Rohan Mehta' };
  const userName = (id) => { const u = (S().users || []).find((x) => x.id === id); return u ? u.name : id; };
  const formVals = (root) => { const o = {}; root.querySelectorAll('[name]').forEach((e) => { o[e.name] = e.type === 'checkbox' ? e.checked : e.value; }); return o; };
  DM.sx = { U, frame, head, card, field, chk, chip, crumb, fmtD, ago, me, userName, formVals, slug };

  /* ───────── nav labels (Settings → Navigation renames the rail live) ───────── */
  const ORIG = {};
  const applyNavLabels = () => {
    const map = (S() && S().navLabels) || {};
    DM.NAV.forEach((g) => g.items.forEach((it) => { const k = DM.uc + '|' + it.key; if (!(k in ORIG)) ORIG[k] = it.label; it.label = map[it.key] || ORIG[k]; }));
  };
  const rs = DM.resetState;
  DM.resetState = function () { const r = rs.apply(this, arguments); try { applyNavLabels(); } catch (e) {} return r; };
  DM.applyNavLabels = applyNavLabels;

  /* ───────── /settings redirect ───────── */
  DM.page('/settings', { title: 'Settings', render: () => { setTimeout(() => DM.go('/settings/organisation'), 0); return ''; } });

  /* ═════════════════ COMPANY ═════════════════ */
  const logoTile = (c, size = 48) => (c.logoUrl ? `<span class="sx-logo ${size > 48 ? 'lg' : ''}"><img src="${esc(c.logoUrl)}" alt=""></span>` : c.logoRemoved ? `<span class="sx-logo ph ${size > 48 ? 'lg' : ''}">DM</span>` : `<span class="sx-logo ${size > 48 ? 'lg' : ''}">${DM.mark(size > 48 ? 36 : 30)}</span>`);
  const companyPage = () => {
    const c = S().company || {}, pl = S().plan || {}; const u = U();
    const total = (pl.allowances || []).length + (pl.modules || []).length;
    const val = (v) => (v ? esc(v) : '<span class="muted">Not set</span>');
    const header = `<div class="row" style="gap:14px;margin-bottom:16px">${logoTile(c)}<div><div class="row" style="gap:8px"><h1 style="font-size:20px;font-weight:600;letter-spacing:-.01em">${ORG}</h1>${pl.badge ? chip(pl.badge) : ''}</div><div class="muted" style="margin-top:3px"><span class="mono">${esc(c.handle || '@demo-merchant')}</span> · ${esc(c.timezone || 'Asia/Kolkata')}</div></div></div>`;
    const logoCard = card('Logo', 'Shown on quotes, order confirmations and this workspace.', `<div class="sx-dash">${logoTile(c, 64)}<div class="grow"><div style="font-size:13px;font-weight:500">Current logo</div><div class="muted" style="margin-top:2px">PNG, JPG, SVG or WebP, up to 2 MB.</div></div><button class="btn outline sm" data-act="co-logo-remove" ${c.logoRemoved ? 'disabled' : ''}>Remove</button><button class="btn sm" data-act="co-logo-replace">${I('upload')} Replace</button><input type="file" id="co-logo-file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden></div>`, { right: `<button class="btn outline icon sm" data-act="co-logo-tip" title="Logo guidelines">${I('image')}</button>` });
    const rec = card('Company record', 'Who the business is, as it appears on invoices and to dealers.', `<div class="sx-kv">${[['Legal name', c.legalName], ['Billing email', c.billingEmail], ['Phone', c.phone], ['Customer email', c.customerEmail], ['Domain', c.domain], ['Handle', c.handle, true], ['Timezone', c.timezone], ['Currency', c.currency]].map(([k, v, m]) => `<div><div class="k">${k}</div><div class="v ${m ? 'mono' : ''}">${val(v)}</div></div>`).join('')}</div>`, { right: `<button class="btn outline sm" data-act="co-edit">${I('pencil')} Edit</button><button class="btn outline icon sm" data-act="co-export" title="Export company record">${I('file')}</button>` });
    const allow = (pl.allowances || []).map(([v, l]) => `<div>${I('check')}<span>${esc(v)} ${esc(l)}</span></div>`).join('');
    const mods = (pl.modules || []).map((m) => `<div>${I('check')}<span>${esc(m)}</span></div>`).join('');
    const sub = card('Subscription', esc(pl.name || 'Test') + ' · renewal', `<div class="sx-collapse ${u.subOpen ? 'open' : ''}"><button data-act="co-sub"><div><div style="font-size:13px;font-weight:500">Plan allowances and modules</div><div class="muted">${total} included allowances and modules</div></div><span class="chev">${I('chevD')}</span></button>${u.subOpen ? `<div class="body">${allow}${mods}</div>` : ''}</div>`, { right: chip('Active', 'green'), foot: 'Changes to the plan go through your Anuma contact. Live meters are in <a data-go="/settings/usage">Usage ↗</a>.' });
    return frame(header + `<div class="sx-stack">${logoCard}${rec}${sub}</div>`);
  };
  DM.page('/settings/organisation', { title: 'Company', render: companyPage, after: () => crumb('Company') });
  A('co-sub', () => { const u = U(); u.subOpen = !u.subOpen; DM.render(); });
  A('co-logo-tip', () => DM.toast('PNG, JPG, SVG or WebP, up to 2 MB', 'image'));
  A('co-logo-remove', () => { const c = S().company; c.logoUrl = null; c.logoRemoved = true; DM.toast('Logo removed', 'trash'); DM.render(); });
  A('co-logo-replace', () => { const f = document.getElementById('co-logo-file'); if (!f) return; f.onchange = () => { const file = f.files && f.files[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) return DM.toast('That file is over 2 MB', 'alert'); const r = new FileReader(); r.onload = () => { const c = S().company; c.logoUrl = r.result; c.logoRemoved = false; DM.toast('Logo updated', 'check'); DM.render(); }; r.readAsDataURL(file); }; f.click(); });
  A('co-export', () => { const c = S().company; DM.downloadCSV && DM.downloadCSV('company-record.csv', [['Field', 'Value'], ['Legal name', c.legalName], ['Billing email', c.billingEmail], ['Phone', c.phone || ''], ['Customer email', c.customerEmail], ['Domain', c.domain], ['Handle', c.handle], ['Timezone', c.timezone], ['Currency', c.currency]]); DM.toast('Company record downloaded', 'download'); });
  A('co-edit', () => {
    const c = S().company;
    DM.dialog({ title: 'Company record', sub: 'The statutory record behind invoices.', w: 520,
      body: `<div class="sx-fs">${field('Legal name', 'legalName', { value: c.legalName })}<div class="sx-g2">${field('Billing email', 'billingEmail', { value: c.billingEmail, type: 'email' })}${field('Phone', 'phone', { value: c.phone || '', ph: '+91 98765 43210' })}</div><div class="sx-g2">${field('Customer email', 'customerEmail', { value: c.customerEmail, hint: 'Shown to dealers' })}${field('Domain', 'domain', { value: c.domain, ph: 'e.g. anuma.in' })}</div>${field('Handle', 'handle', { value: c.handle, ph: '@demo-merchant', mono: true })}<div class="muted" style="font-size:11px">Set when the workspace was created. Timezone and currency are read-only here too.</div></div>`,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { const v = formVals(d); if (!v.legalName.trim()) { DM.toast('Legal name is required', 'alert'); return false; } Object.assign(S().company, { legalName: v.legalName.trim(), billingEmail: v.billingEmail.trim(), phone: v.phone.trim() || null, customerEmail: v.customerEmail.trim(), domain: v.domain.trim(), handle: v.handle.trim() }); DM.toast('Company record saved'); setTimeout(() => DM.render(), 0); } }] });
  });

  /* ═════════════════ NAVIGATION ═════════════════ */
  const navPage = () => {
    const u = U(); const mods = (S().navModules || []).filter((m) => u.navAll || m.group === 'd');
    const labels = u.navTab === 'labels';
    const rows = mods.map((m) => `<div class="sx-nm" data-rid="nav-${m.key}"><span class="icotile">${I(m.icon)}</span><span class="lbl" style="font-size:13px;font-weight:500">${esc(m.label)}</span>${m.renamed ? '<span class="sx-tag">renamed</span>' : ''}<span class="grow"></span><button class="btn outline sm" data-act="${labels ? 'nav-rename' : 'nav-fields'}" data-arg="${m.key}">${labels ? 'Rename' : 'Manage fields'}</button></div>`).join('');
    return frame(head('Navigation', 'Workspace labels and the fields your team captures.', `<span class="sx-chip">${I('building')} ${ORG}</span>`) +
      `<div class="row" style="margin-bottom:12px">${DM.seg([{ key: 'labels', label: 'Workspace labels' }, { key: 'fields', label: 'Custom fields' }], u.navTab, 'nav-tab')}<span class="grow"></span><label class="row" style="gap:8px;cursor:pointer">${DM.switch(u.navAll, 'nav-all', '')}<span style="font-size:12px;font-weight:500">Show all modules</span></label></div>` +
      `<div class="sx-card" style="overflow:hidden">${rows}</div>`);
  };
  DM.page('/settings/navigation', { title: 'Navigation', render: navPage, after: () => crumb('Navigation') });
  A('nav-tab', (el) => { U().navTab = el.dataset.arg; DM.render(); });
  A('nav-all', () => { const u = U(); u.navAll = !u.navAll; DM.render(); });
  A('nav-rename', (el) => {
    const m = S().navModules.find((x) => x.key === el.dataset.arg); if (!m) return;
    const w = DM.sheet({ id: 'nav-rename', w: 384, radius: 14, title: 'Rename ' + esc(m.canonical), sub: 'The name shown in your navigation. Leave it blank to use the default.',
      body: `<div class="sx-fs" style="padding-top:8px">${field('Display label', 'label', { value: m.label })}<div class="muted" style="font-size:11px;margin-top:-6px">Canonical: ${esc(m.canonical)}</div></div>`,
      footer: `<button class="btn outline" data-sheet-close>Cancel</button><button class="btn" data-act="nav-rename-save" data-arg="${m.key}">Save</button>` });
    const inp = w.querySelector('input'); inp && inp.focus();
  });
  A('nav-rename-save', (el) => {
    const w = document.querySelector('.sheet-wrap[data-sheet="nav-rename"]'); const m = S().navModules.find((x) => x.key === el.dataset.arg); if (!w || !m) return;
    const v = w.querySelector('input[name=label]').value.trim(); m.label = v || m.canonical; m.renamed = m.label !== m.canonical;
    if (m.rail) { S().navLabels = S().navLabels || {}; S().navLabels[m.rail] = m.label; applyNavLabels(); }
    w._close(); DM.toast('Label saved'); setTimeout(() => DM.render(), 160);
  });
  const fieldsBody = (m) => {
    const list = (S().navFields[m.key] || []);
    return `<div style="padding-top:4px"><div style="font-size:12px;font-weight:600;margin-bottom:6px">Existing</div>${list.length ? `<div class="sx-card" style="overflow:hidden">${list.map((f, i) => `<div class="sx-nm" style="min-height:42px"><div class="grow"><div style="font-size:12px;font-weight:500">${esc(f.label)} ${f.required ? chip('required', 'amber') : ''}</div><div class="muted mono" style="font-size:11px">${esc(f.key)} · ${esc(f.type)}</div></div><button class="btn ghost icon sm" data-act="nav-field-del" data-arg="${m.key}|${i}">${I('trash')}</button></div>`).join('')}</div>` : `<div class="muted" style="border:1px dashed #d4d4d4;border-radius:10px;padding:14px;text-align:center">No custom fields yet. Add the first one below.</div>`}
      <div class="sx-collapse ${U().fieldOpen ? 'open' : ''}" style="margin-top:14px"><button data-act="nav-field-open"><div><div style="font-size:13px;font-weight:500">Add a custom field</div><div class="muted">Choose a label, field type and validation rules.</div></div><span class="chev">${I('chevD')}</span></button>${U().fieldOpen ? `<div class="sx-fs" style="padding:4px 14px 14px;grid-column:1/-1;display:flex" id="nf-form">
        <div class="sx-g2">${field('Key', 'key', { ph: 'gst', hint: 'stored in metadata as this key' })}${field('Label', 'label', { ph: 'GST Number', hint: 'shown on the entity form' })}</div>
        <div class="sx-g2">${field('Data type', 'type', { options: ['Text', 'Number', 'Yes / No', 'Date', 'Date + time', 'Single-select', 'Multi-select'], value: 'Text' })}${field('Position', 'position', { value: '0', type: 'number' })}</div>
        <div class="sx-g2">${field('Regex', 'regex', { ph: '^[0-9A-Z]{15}$', hint: 'optional — validated on write', mono: true })}${field('Default', 'def', { ph: 'leave blank for none' })}</div>
        <div class="row" style="gap:20px"><label class="row" style="gap:8px">${DM.switch(false, 'nf-sw', 'required')}<span>Required</span></label><label class="row" style="gap:8px">${DM.switch(true, 'nf-sw', 'active')}<span>Active</span></label></div>
        <div><button class="btn" data-act="nav-field-add" data-arg="${m.key}" id="nf-add" disabled>${I('plus')} Add field</button></div></div>` : ''}</div></div>`;
  };
  A('nav-fields', (el) => {
    const m = S().navModules.find((x) => x.key === el.dataset.arg); if (!m) return; U().fieldOpen = false;
    DM.sheet({ id: 'nav-fields', w: 420, radius: 14, title: 'Custom fields · ' + esc(m.canonical), sub: 'Fields added here appear on every ' + esc(m.canonical.toLowerCase()) + ' form.', body: fieldsBody(m), footer: `<button class="btn outline" data-sheet-close>Close</button>`, onMount: (w) => bindFieldForm(w, m) });
  });
  const bindFieldForm = (w, m) => {
    const f = w.querySelector('#nf-form'); if (!f) return; const btn = f.querySelector('#nf-add');
    const check = () => { btn.disabled = !(f.querySelector('[name=key]').value.trim() && f.querySelector('[name=label]').value.trim()); };
    f.addEventListener('input', check); check();
  };
  const refreshFields = (m) => { const w = document.querySelector('.sheet-wrap[data-sheet="nav-fields"]'); if (!w) return; DM.sheetBody(w, fieldsBody(m)); bindFieldForm(w, m); };
  A('nav-field-open', () => { const w = document.querySelector('.sheet-wrap[data-sheet="nav-fields"]'); const m = S().navModules.find((x) => 'Custom fields · ' + x.canonical === w.querySelector('.sheet-t').textContent); U().fieldOpen = !U().fieldOpen; refreshFields(m); });
  A('nf-sw', (el) => el.classList.toggle('on'));
  A('nav-field-add', (el) => {
    const w = document.querySelector('.sheet-wrap[data-sheet="nav-fields"]'); const m = S().navModules.find((x) => x.key === el.dataset.arg); const f = w.querySelector('#nf-form'); const v = {};
    f.querySelectorAll('[name]').forEach((e) => (v[e.name] = e.value));
    const sw = [...f.querySelectorAll('.switch')]; (S().navFields[m.key] = S().navFields[m.key] || []).push({ key: v.key.trim(), label: v.label.trim(), type: v.type, position: +v.position || 0, regex: v.regex, def: v.def, required: sw[0].classList.contains('on'), active: sw[1].classList.contains('on') });
    U().fieldOpen = false; refreshFields(m); DM.toast('Custom field added');
  });
  A('nav-field-del', (el) => { const [k, i] = el.dataset.arg.split('|'); const m = S().navModules.find((x) => x.key === k); S().navFields[k].splice(+i, 1); refreshFields(m); DM.toast('Custom field removed', 'trash'); });

  /* ═════════════════ HUMANS ═════════════════ */
  const roleDesc = (name) => { const r = (S().roles || []).find((x) => x.name === name); return r ? r.desc : ''; };
  const humansTab = (p) => (p === 'roles' ? 'roles' : p === 'invites' ? 'invites' : 'members');
  const roleCount = (name) => (S().users || []).filter((u) => u.role === name).length;
  const humansPage = ({ params }) => {
    const tab = humansTab(params.tab); const u = U(); const users = S().users || [], roles = S().roles || [], inv = S().invites || [];
    const q = (u.q[tab] || '').toLowerCase();
    const acts = tab === 'members' ? `<button class="btn outline" data-act="hu-new">New member</button><button class="btn" data-act="hu-invite">${I('userplus')} Invite</button>` : tab === 'roles' ? `<button class="btn" data-act="hu-role-new">${I('plus')} New role</button>` : `<button class="btn" data-act="hu-invite">${I('userplus')} Invite</button>`;
    const bar = `<div class="row" style="margin-bottom:12px">${DM.seg([{ key: 'members', label: 'Members', count: users.length }, { key: 'roles', label: 'Roles', count: roles.length }, { key: 'invites', label: 'Invites', count: inv.length }], tab, 'hu-tab', { chips: true })}<span class="grow"></span><div class="sgroup" style="width:200px">${I('search')}<input data-input="hu-q" placeholder="${tab === 'members' ? 'Search people…' : tab === 'roles' ? 'Search roles…' : 'Search invites…'}" value="${esc(u.q[tab] || '')}"></div></div>`;
    let body = '';
    if (tab === 'members') {
      const rows = users.filter((x) => !q || (x.name + x.email + x.role).toLowerCase().includes(q));
      body = DM.table([
        { k: 'name', label: 'Name', bold: true, flex: 1.5, minW: 200, filter: false, text: (x) => x.name, render: (x) => `<span class="hm-n">${DM.avatar(x.name, '', { org: false })}${esc(x.name)}${x.me ? ' <span class="muted" style="font-weight:400">(you)</span>' : ''}</span>` },
        { k: 'email', label: 'Email', muted: true, flex: 1.6, minW: 180, filter: false },
        { k: 'role', label: 'Role', w: 110, filter: false },
        { k: 'status', label: 'Status', w: 100, filter: false, text: (x) => x.status, render: (x) => (x.status === 'Primary' ? `<span class="sx-chip dark">Primary</span>` : x.status === 'Admin' ? `<span class="sx-chip">Admin</span>` : `<span class="sx-chip">Member</span>`) },
        { k: 'joined', label: 'Joined', w: 110, filter: false, text: (x) => fmtD(x.joined), render: (x) => esc(fmtD(x.joined)) },
        { k: 'act', label: '', w: 120, filter: false, text: () => '', render: (x) => `<span class="hm-ic">${x.hasPhone !== false && x.phone ? `<button class="btn outline icon sm" data-act="hu-call" data-arg="${x.id}" title="Call">${I('phone')}</button>` : ''}<button class="btn outline icon sm" data-act="hu-mail" data-arg="${x.id}" title="Email">${I('mail')}</button><button class="btn ghost icon sm" data-act="hu-menu" data-arg="${x.id}" title="More">${I('more')}</button></span>` },
      ], rows, { id: 'hu-members', footer: 'people', fill: rows.length > 11, offset: 262, empty: { icon: 'users', title: 'No matches', sub: 'Try a different name or email.' } });
    } else if (tab === 'roles') {
      const rows = roles.filter((r) => !q || (r.name + r.desc).toLowerCase().includes(q));
      body = DM.table([
        { k: 'name', label: 'Role', bold: true, w: 150, filter: false },
        { k: 'members', label: 'Members', w: 100, num: true, filter: false, text: (r) => roleCount(r.name), render: (r) => roleCount(r.name) },
        { k: 'escalation', label: 'Agent escalation', w: 150, filter: false, text: (r) => (r.escalation ? 'On' : 'Off'), render: (r) => `<span class="row" style="gap:6px;font-size:11px"><i class="sx-dot ${r.escalation ? 'g' : ''}"></i>${r.escalation ? 'On' : 'Off'}</span>` },
        { k: 'desc', label: 'What it does', muted: true, flex: 2, minW: 240, filter: false },
        { k: 'act', label: '', w: 48, filter: false, text: () => '', render: (r) => `<button class="btn ghost icon sm" data-act="hu-role-menu" data-arg="${r.id}">${I('more')}</button>` },
      ], rows, { id: 'hu-roles', footer: 'roles', click: 'hu-role-open', fill: false, empty: { icon: 'shield', title: 'No roles found' } });
    } else {
      const rows = inv.filter((r) => !q || (r.email + r.role).toLowerCase().includes(q));
      body = DM.table([
        { k: 'email', label: 'Email', bold: true, flex: 1.6, minW: 220, filter: false, render: (r) => `<span class="row" style="gap:8px;font-weight:500">${I('mail')}${esc(r.email)}</span>`, text: (r) => r.email },
        { k: 'role', label: 'Role', w: 110, filter: false },
        { k: 'by', label: 'Invited by', flex: 1, filter: false, text: (r) => userName(r.invitedBy), render: (r) => esc(userName(r.invitedBy)) },
        { k: 'sent', label: 'Sent', w: 110, filter: false, text: (r) => fmtD(r.sent), render: (r) => esc(fmtD(r.sent)) },
        { k: 'expires', label: 'Expires', w: 110, filter: false, text: (r) => fmtD(r.expires), render: (r) => esc(fmtD(r.expires)) },
        { k: 'status', label: 'Status', w: 100, filter: false, render: (r) => chip(r.status, 'amber') },
        { k: 'act', label: '', w: 48, filter: false, text: () => '', render: (r) => `<button class="btn ghost icon sm" data-act="hu-inv-menu" data-arg="${r.id}">${I('more')}</button>` },
      ], rows, { id: 'hu-invites', footer: 'invites', fill: false, empty: { icon: 'mail', title: 'No pending invites', sub: 'Invite a teammate to see them here.' } });
    }
    return frame(head('Humans', 'Manage who has access to this workspace and what they can do.', acts) + bar + body);
  };
  DM.page('/settings/users', { title: 'Humans', render: humansPage, after: () => crumb('Humans') });
  DM.page('/settings/users/:tab', { title: 'Humans', render: humansPage, after: () => crumb('Humans') });
  A('hu-tab', (el) => DM.go('/settings/users' + (el.dataset.arg === 'members' ? '' : '/' + el.dataset.arg)));
  DM.input('hu-q', (v) => { const tab = humansTab((DM.match(DM.path()) || { params: {} }).params.tab); U().q[tab] = v; DM.render(); });
  A('hu-call', (el) => { const u = S().users.find((x) => x.id === el.dataset.arg); DM.toast('Calling ' + (u && u.phone ? u.phone : ''), 'phone'); });
  A('hu-mail', (el) => { const u = S().users.find((x) => x.id === el.dataset.arg); DM.copy(u.email); });
  const roleSelect = (value) => `<div class="sx-f"><label>Role</label><select class="select" name="role">${(S().roles || []).map((r) => `<option ${r.name === value ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select><div class="hint" id="role-desc">${esc(roleDesc(value))}</div></div>`;
  const bindRole = (d) => { const s = d.querySelector('select[name=role]'); if (s) s.addEventListener('change', () => { d.querySelector('#role-desc').textContent = roleDesc(s.value); }); };
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  A('hu-new', () => DM.dialog({ title: 'New member', sub: 'Adds them straight away, no invite email. They can set a password from “Send password reset”.', w: 520,
    body: `<div class="sx-fs">${field('Email', 'email', { ph: 'name@company.com', type: 'email' })}<div class="sx-g2">${field('First name', 'first', { ph: 'Priya' })}${field('Last name', 'last', { ph: 'Raman' })}</div>${field('Phone', 'phone', { ph: '+91 98765 43210' })}${roleSelect('ASM')}<div class="sx-box"><button class="sx-chk" data-act="hu-adm" role="checkbox" aria-checked="false"></button><div><div class="t">Admin</div><div class="d">Add them first, then reopen them to make them an admin.</div></div></div></div>`, onMount: bindRole,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Add member', run: (d) => { const v = formVals(d); if (!validEmail(v.email)) { DM.toast('Enter a valid email', 'alert'); return false; } const first = v.first.trim() || v.email.split('@')[0]; const last = v.last.trim(); const id = 'u-' + slug(first) + (S().users.some((x) => x.id === 'u-' + slug(first)) ? '-2' : ''); S().users.push({ id, name: (first + ' ' + last).trim(), firstName: first, lastName: last, email: v.email.trim(), phone: v.phone.trim() || null, role: v.role, isAdmin: false, status: 'Member', joined: TODAY, photo: true, me: false, hasPhone: !!v.phone.trim(), hasEmail: true }); DM.toast('Member added', 'userplus'); setTimeout(() => DM.render(), 0); } }] }));
  A('hu-adm', (el) => { el.classList.toggle('on'); el.innerHTML = el.classList.contains('on') ? I('check') : ''; });
  A('hu-invite', () => DM.dialog({ title: 'Invite a teammate', sub: 'They\'ll receive an email with a sign-in link.', w: 520,
    body: `<div class="sx-fs">${field('Email', 'email', { ph: 'name@company.com', type: 'email' })}${field('Phone number', 'phone', { ph: '+91 98765 43210' })}${roleSelect('ASM')}</div>`, onMount: bindRole,
    actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Send invite', run: (d) => { const v = formVals(d); if (!validEmail(v.email)) { DM.toast('Enter a valid email', 'alert'); return false; } S().invites.unshift({ id: DM.uid('inv'), email: v.email.trim(), role: v.role, invitedBy: me().id, sent: TODAY, expires: '2026-10-29', status: 'pending' }); DM.toast('Invite sent to ' + v.email.trim(), 'send'); DM.go('/settings/users/invites'); } }] }));
  const editMember = (id) => {
    const x = S().users.find((u) => u.id === id); if (!x) return;
    DM.dialog({ title: 'Edit member', sub: `${esc(x.email)} — the role decides which modules they can see and act on.`, w: 520,
      body: `<div class="sx-fs"><div class="sx-g2">${field('First name', 'first', { value: x.firstName || x.name.split(' ')[0] })}${field('Last name', 'last', { value: x.lastName || x.name.split(' ').slice(1).join(' ') })}</div>${field('Phone', 'phone', { value: x.phone || '' })}${roleSelect(x.role)}<div class="sx-box"><button class="sx-chk ${x.isAdmin ? 'on' : ''}" data-act="hu-adm" role="checkbox" aria-checked="${!!x.isAdmin}">${x.isAdmin ? I('check') : ''}</button><div><div class="t">Admin</div><div class="d">Full access to every module — overrides the role above.</div></div></div></div>`, onMount: bindRole,
      actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { const v = formVals(d); x.firstName = v.first.trim(); x.lastName = v.last.trim(); x.name = (x.firstName + ' ' + x.lastName).trim() || x.name; x.phone = v.phone.trim() || null; x.hasPhone = !!x.phone; x.role = v.role; const a = d.querySelector('.sx-box .sx-chk'); x.isAdmin = a.classList.contains('on'); if (x.status !== 'Primary') x.status = x.isAdmin ? 'Admin' : 'Member'; DM.toast('Member updated'); setTimeout(() => DM.render(), 0); } }] });
  };
  A('hu-menu', (el) => { const id = el.dataset.arg; const x = S().users.find((u) => u.id === id); DM.menu(el, [{ label: 'Edit', icon: 'pencil', run: () => editMember(id) }, { label: 'Delete', icon: 'trash', danger: true, disabled: x.me, run: () => DM.confirm('Delete member', `Remove <b>${esc(x.name)}</b> from this workspace? They will lose access immediately.`, () => { S().users = S().users.filter((u) => u.id !== id); DM.toast('Member deleted', 'trash'); DM.render(); }, 'Delete') }], { right: true, w: 140 }); });
  A('hu-inv-menu', (el) => { const id = el.dataset.arg; const r = S().invites.find((i) => i.id === id); DM.menu(el, [{ label: 'Edit role', icon: 'pencil', run: () => DM.dialog({ title: 'Edit invite role', sub: esc(r.email), body: `<div class="sx-fs">${roleSelect(r.role)}</div>`, onMount: bindRole, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save', run: (d) => { r.role = formVals(d).role; DM.toast('Invite updated'); setTimeout(() => DM.render(), 0); } }] }) }, { label: 'Resend', icon: 'send', run: () => { r.sent = TODAY; r.expires = '2026-10-29'; DM.toast('Invite resent to ' + r.email, 'send'); DM.render(); } }, { label: 'Revoke', icon: 'ban', danger: true, run: () => DM.confirm('Revoke invite', `The link sent to <b>${esc(r.email)}</b> will stop working.`, () => { S().invites = S().invites.filter((i) => i.id !== id); DM.toast('Invite revoked', 'ban'); DM.render(); }, 'Revoke') }], { right: true, w: 160 }); });

  /* roles */
  const roleForm = (r) => `<div class="sx-fs">${field('Role name', 'name', { value: r ? r.name : '', ph: 'e.g. Dispatch' })}${field('Description', 'desc', { value: r ? r.desc : '', area: true, rows: 3, ph: 'What this role is for' })}<div class="sx-box"><button class="sx-chk ${!r || r.escalation ? 'on' : ''}" data-act="hu-adm" role="checkbox" data-n="esc">${!r || r.escalation ? I('check') : ''}</button><div><div class="t">AI may escalate to this role</div></div></div><div class="sx-box"><button class="sx-chk ${!r || r.active ? 'on' : ''}" data-act="hu-adm" role="checkbox" data-n="act">${!r || r.active ? I('check') : ''}</button><div><div class="t">Active</div></div></div><div class="sx-box"><button class="sx-chk ${r && r.onlyAssigned ? 'on' : ''}" data-act="hu-adm" role="checkbox" data-n="own">${r && r.onlyAssigned ? I('check') : ''}</button><div><div class="t">Only sees assigned accounts</div><div class="d">Chats, orders, quotes, contacts and opportunities are limited to the accounts this person is assigned to — assign them on each client's page. Admins and the owner are never limited.</div></div></div></div>`;
  const readRole = (d) => { const v = formVals(d); const f = (n) => d.querySelector(`.sx-chk[data-n=${n}]`).classList.contains('on'); return { name: v.name.trim(), desc: v.desc.trim(), escalation: f('esc'), active: f('act'), onlyAssigned: f('own') }; };
  A('hu-role-new', () => DM.dialog({ title: 'New role', sub: 'Roles decide which modules a person can see and act on.', w: 520, body: roleForm(null), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create role', run: (d) => { const v = readRole(d); if (!v.name) { DM.toast('Give the role a name', 'alert'); return false; } if (S().roles.some((r) => r.name.toLowerCase() === v.name.toLowerCase())) { DM.toast('That role already exists', 'alert'); return false; } S().roles.push(Object.assign({ id: 'role-' + slug(v.name), access: Object.fromEntries(S().accessModules.map((m) => [m, [1, 0, 0, 0, 0]])) }, v)); DM.toast('Role created'); setTimeout(() => DM.render(), 0); } }] }));
  const editRole = (id) => { const r = S().roles.find((x) => x.id === id); DM.dialog({ title: 'Edit role', sub: 'Renaming a role updates it for everyone assigned to it. Permissions are edited on the matrix below.', w: 520, body: roleForm(r), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { const v = readRole(d); if (!v.name) { DM.toast('Give the role a name', 'alert'); return false; } const old = r.name; Object.assign(r, v); (S().users || []).forEach((u) => { if (u.role === old) u.role = v.name; }); (S().invites || []).forEach((i) => { if (i.role === old) i.role = v.name; }); DM.toast('Role updated'); setTimeout(() => { DM.render(); const w = document.querySelector('.sheet-wrap[data-sheet="role"]'); if (w) openRole(id, true); }, 0); } }] }); };
  const delRole = (id) => { const r = S().roles.find((x) => x.id === id); if (roleCount(r.name)) return DM.toast(`${roleCount(r.name)} people still have the ${r.name} role`, 'alert'); DM.confirm('Delete role', `Delete the <b>${esc(r.name)}</b> role? This can't be undone.`, () => { S().roles = S().roles.filter((x) => x.id !== id); DM.closeSheet('role'); DM.toast('Role deleted', 'trash'); DM.render(); }, 'Delete'); };
  A('hu-role-menu', (el) => { const id = el.dataset.arg; DM.menu(el, [{ label: 'Edit', icon: 'pencil', run: () => editRole(id) }, { label: 'Delete', icon: 'trash', danger: true, run: () => delRole(id) }], { right: true, w: 140 }); });
  const matrix = (r, edit) => { const draft = U().permDraft || r.access; const mods = S().accessModules || []; const cols = ['View', 'Create', 'Edit', 'Delete', 'Approve'];
    return `<table class="sx-mx"><thead><tr><th>Module</th>${cols.map((c, i) => `<th>${c}${edit ? `<div>${chk(mods.every((m) => draft[m][i]), 'perm-col', i)}</div>` : ''}</th>`).join('')}</tr></thead><tbody>${mods.map((m) => `<tr><td>${edit ? `<span class="row" style="gap:8px;cursor:pointer" data-act="perm-row" data-arg="${esc(m)}">${chk(draft[m].every((x) => x), '', '')}${esc(m)}</span>` : esc(m)}</td>${draft[m].map((on, i) => `<td>${edit ? chk(on, 'perm-cell', m + '|' + i) : `<i class="dot ${on ? 'on' : ''}"></i>`}</td>`).join('')}</tr>`).join('')}</tbody></table>`; };
  const roleBody = (r, edit) => { const ms = (S().users || []).filter((u) => u.role === r.name);
    return `<div style="padding-top:4px"><div class="sx-kv" style="grid-template-columns:110px 1fr;gap:10px 12px;margin-bottom:16px"><div class="k" style="margin:0">Members</div><div>${ms.length ? `<span class="row" style="gap:4px;flex-wrap:wrap">${ms.slice(0, 8).map((u) => DM.avatar(u.name, 'sm', { org: false })).join('')}${ms.length > 8 ? `<span class="muted">+${ms.length - 8}</span>` : ''}</span>` : '<span class="muted">Nobody yet</span>'}</div><div class="k" style="margin:0">Agent escalation</div><div><span class="row" style="gap:6px"><i class="sx-dot ${r.escalation ? 'g' : ''}"></i>${r.escalation ? 'On' : 'Off'}</span></div><div class="k" style="margin:0">Status</div><div>${chip(r.active ? 'Active' : 'Inactive', r.active ? 'green' : 'muted')}</div></div><div style="font-size:13px;font-weight:600;margin-bottom:6px">Access</div>${matrix(r, edit)}</div>`; };
  const roleFooter = (r, edit) => (edit ? `<span class="grow"></span><button class="btn outline" data-act="perm-cancel" data-arg="${r.id}">Cancel</button><button class="btn" data-act="perm-save" data-arg="${r.id}">Save permissions</button>` : `<button class="btn outline" style="color:#e03a3a;border-color:#f3c6c6" data-act="hu-role-del" data-arg="${r.id}">${I('trash')} Delete</button><span class="grow"></span><button class="btn outline" data-act="perm-edit" data-arg="${r.id}">Edit permissions</button><button class="btn outline" data-act="hu-role-edit" data-arg="${r.id}">${I('pencil')} Edit</button>`);
  const openRole = (id, reuse) => { const r = S().roles.find((x) => x.id === id); if (!r) return; U().permDraft = null;
    const w = DM.sheet({ id: 'role', w: 520, radius: 14, title: esc(r.name), sub: esc(r.desc), body: roleBody(r, false), footer: roleFooter(r, false) }); void reuse; return w; };
  A('hu-role-open', (el) => openRole(el.dataset.arg));
  A('hu-role-edit', (el) => editRole(el.dataset.arg)); A('hu-role-del', (el) => delRole(el.dataset.arg));
  const reroll = (r, edit) => { const w = document.querySelector('.sheet-wrap[data-sheet="role"]'); if (!w) return; const sc = w.querySelector('.sheet-b').scrollTop; w.querySelector('.sheet-b').innerHTML = roleBody(r, edit); w.querySelector('.sheet-b').scrollTop = sc; w.querySelector('.sheet-f').innerHTML = roleFooter(r, edit); };
  A('perm-edit', (el) => { const r = S().roles.find((x) => x.id === el.dataset.arg); U().permDraft = DM.clone(r.access); reroll(r, true); });
  A('perm-cancel', (el) => { const r = S().roles.find((x) => x.id === el.dataset.arg); U().permDraft = null; reroll(r, false); });
  A('perm-save', (el) => { const r = S().roles.find((x) => x.id === el.dataset.arg); r.access = U().permDraft; U().permDraft = null; reroll(r, false); DM.toast('Permissions saved'); });
  const curRole = () => { const w = document.querySelector('.sheet-wrap[data-sheet="role"]'); const t = w && w.querySelector('.sheet-t').textContent; return (S().roles || []).find((x) => x.name === t); };
  A('perm-cell', (el) => { const [m, i] = el.dataset.arg.split('|'); const d = U().permDraft; d[m][+i] = d[m][+i] ? 0 : 1; reroll(curRole(), true); });
  A('perm-col', (el) => { const i = +el.dataset.arg; const d = U().permDraft; const all = Object.keys(d).every((m) => d[m][i]); Object.keys(d).forEach((m) => (d[m][i] = all ? 0 : 1)); reroll(curRole(), true); });
  A('perm-row', (el) => { const m = el.dataset.arg; const d = U().permDraft; const all = d[m].every((x) => x); d[m] = d[m].map(() => (all ? 0 : 1)); reroll(curRole(), true); });

  /* ═════════════════ RULEBOOK ═════════════════ */
  const rbTabs = (cur) => `<div class="row" style="margin-bottom:12px">${DM.seg([{ key: 'voice', label: 'Voice & tone' }, { key: 'rules', label: 'Playbooks' }, { key: 'limits', label: 'Limits & approvals' }], cur, 'rb-tab')}</div>`;
  A('rb-tab', (el) => DM.go('/settings/rulebook' + (el.dataset.arg === 'voice' ? '' : '/' + el.dataset.arg)));
  const prose = (paras, key, empty) => { if (!paras || !paras.length) return `<div class="muted" style="font-size:13px">${esc(empty)}</div>`; const open = U().read[key]; const long = paras.join(' ').length > 260; return `<div class="sx-prose ${open || !long ? '' : 'clamp'}">${paras.map((p) => `<p>${esc(p)}</p>`).join('')}</div>${long ? `<a class="sx-read" data-act="rb-read" data-arg="${key}">${open ? 'Show less' : 'Read all'}</a>` : ''}`; };
  A('rb-read', (el) => { const u = U(); u.read[el.dataset.arg] = !u.read[el.dataset.arg]; DM.render(); });
  const editBtns = (key, label = 'Edit') => (U().edit === key ? `<button class="btn outline sm" data-act="rb-cancel">Cancel</button><button class="btn sm" data-act="rb-save" data-arg="${key}">Save</button>` : `<button class="btn outline sm" data-act="rb-edit" data-arg="${key}">${label === 'Edit' ? I('pencil') + ' ' : ''}${label}</button>`);
  A('rb-edit', (el) => { U().edit = el.dataset.arg; DM.render(); }); A('rb-cancel', () => { U().edit = null; DM.render(); });
  const paras = (t) => String(t).split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean);
  const voicePage = () => {
    const rb = S().rulebook || {}, u = U(); const ns = rb.neverSay || []; const shown = u.neverAll ? ns : ns.slice(0, 8); const ch = rb.channels || {};
    const how = card('How it writes', '', u.edit === 'how' ? `<textarea class="sx-in" id="rb-how" rows="10">${esc((rb.howItWrites || []).join('\n\n'))}</textarea>` : prose(rb.howItWrites, 'how', 'No tone described yet — edit to set the identity.'), { right: editBtns('how') });
    const never = card('Never say ' + `<span class="sx-chip muted">${ns.length}</span>`, 'Words and fragments that never go out to a customer.', ns.length || u.adding ? `<div class="sx-pills">${shown.map((p, i) => `<span class="sx-pill">${esc(p)}<button data-act="rb-nd" data-arg="${i}" title="Remove">${I('x')}</button></span>`).join('')}${u.adding ? `<span class="row" style="gap:6px"><input class="sx-in" id="rb-np" style="width:220px" placeholder="A word or fragment" data-input="rb-np-in" value="${esc(u.np || '')}"><button class="btn sm" id="rb-np-add" data-act="rb-na" ${u.np ? '' : 'disabled'}>Add</button><button class="btn outline sm" data-act="rb-nc">Cancel</button></span>` : `<span class="sx-pill add" data-act="rb-nadd">${I('plus')} Add phrase</span>`}</div>${ns.length > 8 ? `<a class="sx-read" data-act="rb-nall">${u.neverAll ? 'Show fewer phrases' : 'View all ' + ns.length + ' phrases'}</a>` : ''}` : `<div class="sx-pills"><span class="sx-pill add" data-act="rb-nadd">${I('plus')} Add phrase</span></div><div class="muted" style="margin-top:8px;font-size:13px">Nothing on the list — Anuma may use any wording the rest of the rulebook allows.</div>`, { right: `<button class="btn outline icon sm" data-act="rb-ntip" title="What this does">${I('ban')}</button>` });
    const chBody = u.edit === 'channels'
      ? `<div class="sx-fs"><div class="sx-f"><label>WhatsApp</label><textarea class="sx-in" id="rb-wa" rows="9">${esc((ch.whatsapp || []).join('\n\n'))}</textarea></div><div class="sx-f"><label>Email</label><textarea class="sx-in" id="rb-em" rows="3">${esc(ch.email || '')}</textarea></div><div class="sx-f"><label>Voice</label><textarea class="sx-in" id="rb-vo" rows="3">${esc(ch.voice || '')}</textarea></div><div class="sx-f"><label>Voice speaker</label><input class="sx-in" id="rb-sp" value="${esc(ch.speaker || '')}"></div></div>`
      : `<div class="sx-fs" style="gap:14px"><div><div class="muted" style="font-size:11px;margin-bottom:4px">WhatsApp</div>${prose(ch.whatsapp, 'wa', 'Nothing yet — edit to add.')}</div><div><div class="muted" style="font-size:11px;margin-bottom:4px">Email</div>${prose(ch.email ? [ch.email] : [], 'em', 'Nothing yet — edit to add.')}</div><div style="border-top:1px solid var(--border);padding-top:12px"><div class="muted" style="font-size:11px;margin-bottom:4px">Voice</div>${prose(ch.voice ? [ch.voice] : [], 'vo', 'Nothing yet — edit to add.')}${ch.speaker ? `<div style="margin-top:8px;font-size:13px"><span class="muted">Speaker:</span> ${esc(ch.speaker)}</div>` : ''}</div></div>`;
    const chs = card('Per-channel rules', 'Extra rules that apply on one channel only.', chBody, { right: editBtns('channels') + `<button class="btn outline icon sm" data-act="rb-ctip">${I('chat')}</button>` });
    const ins = card('Custom instructions', 'What Anuma should assume about ' + ORG + '.', u.edit === 'instr' ? `<textarea class="sx-in" id="rb-in" rows="6">${esc((rb.instructions || []).join('\n\n'))}</textarea>` : prose(rb.instructions, 'in', 'Nothing yet — edit to add.'), { right: editBtns('instr') + `<button class="btn outline icon sm" data-act="rb-itip">${I('sliders')}</button>` });
    return frame(head('Rulebook', 'How Anuma sounds and behaves, and what it may do without you.') + rbTabs('voice') + `<div class="sx-stack">${how}${never}${chs}${ins}</div>`);
  };
  DM.page('/settings/rulebook', { title: 'Rulebook', render: voicePage, after: () => crumb('Rulebook') });
  A('rb-save', (el) => {
    const rb = S().rulebook, k = el.dataset.arg, v = (id) => (document.getElementById(id) || {}).value || '';
    if (k === 'how') rb.howItWrites = paras(v('rb-how')); else if (k === 'instr') rb.instructions = paras(v('rb-in')); else if (k === 'channels') { rb.channels.whatsapp = paras(v('rb-wa')); rb.channels.email = v('rb-em').trim(); rb.channels.voice = v('rb-vo').trim(); rb.channels.speaker = v('rb-sp').trim(); }
    U().edit = null; DM.toast('Rulebook saved'); DM.render();
  });
  A('rb-nd', (el) => { S().rulebook.neverSay.splice(+el.dataset.arg, 1); DM.render(); });
  A('rb-nall', () => { const u = U(); u.neverAll = !u.neverAll; DM.render(); });
  A('rb-nadd', () => { const u = U(); u.adding = true; u.np = ''; DM.render(); setTimeout(() => { const i = document.getElementById('rb-np'); i && i.focus(); }, 30); });
  A('rb-nc', () => { U().adding = false; DM.render(); });
  DM.input('rb-np-in', (v) => { U().np = v; const b = document.getElementById('rb-np-add'); if (b) b.disabled = !v.trim(); });
  A('rb-na', () => { const u = U(); const t = (u.np || '').trim(); if (!t) return; S().rulebook.neverSay.push(t); u.np = ''; u.adding = false; u.neverAll = true; DM.toast('Phrase added'); DM.render(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'rb-np') { const b = document.getElementById('rb-np-add'); b && !b.disabled && b.click(); } });
  A('rb-ntip', () => DM.toast('Anuma will never use these words with a customer', 'ban')); A('rb-ctip', () => DM.toast('Rules here apply to one channel only', 'chat')); A('rb-itip', () => DM.toast('Context Anuma assumes about the business', 'info'));

  /* playbooks */
  const pbCount = (n, s) => `<b>${n}</b> ${s}${n === 1 ? '' : 's'}`;
  const playbooksPage = () => {
    const pbs = [...(S().playbooks || [])].sort((a, b) => b.priority - a.priority);
    const rows = pbs.map((p) => `<div class="sx-pb" data-go="/settings/rulebook/rules/${p.id}" data-rid="${p.id}"><span class="pr">${p.priority}</span><div class="grow" style="min-width:0"><div class="tt">${esc(p.title)}${!p.active && !p.empty ? chip('Paused', 'muted') : ''}${p.empty ? chip('Empty', 'muted') : ''}</div><div class="ds trunc">${esc(p.desc)}</div></div><div class="ct">${pbCount(p.rules.length, 'rule')} · ${pbCount(p.guardrails.length, 'guardrail')} · ${pbCount(p.helpers.length, 'helper')}${I('chevR')}</div></div>`).join('');
    return frame(head('Rulebook', 'How Anuma sounds and behaves, and what it may do without you.') + rbTabs('rules') + card('Playbooks ' + `<span class="sx-chip muted">${pbs.length}</span>`, 'Situations, each with its rules, guardrails and helpers.', rows, { flush: true, right: `<button class="btn sm" data-act="pb-new">${I('plus')} New rule</button><button class="btn outline icon sm" data-act="pb-tip">${I('book')}</button>` }));
  };
  DM.page('/settings/rulebook/rules', { title: 'Rulebook', render: playbooksPage, after: () => crumb('Rulebook') });
  A('pb-tip', () => DM.toast('Playbooks sit on top of Voice & tone', 'book'));
  const pbForm = (p) => `<div class="sx-fs">${field('Title', 'title', { value: p ? p.title : '', ph: 'e.g. Delivery questions' })}${field('Description', 'desc', { value: p ? p.desc : '', area: true, rows: 2, ph: 'The situation this playbook covers' })}${field('Priority', 'priority', { value: p ? p.priority : 30, type: 'number', hint: 'When two disagree, the lower number wins.' })}</div>`;
  A('pb-new', () => DM.dialog({ title: 'New playbook', sub: 'A situation with its own rules, guardrails and helpers.', w: 520, body: pbForm(null), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Create', run: (d) => { const v = formVals(d); if (!v.title.trim()) { DM.toast('Give the playbook a title', 'alert'); return false; } const id = 'pb-' + (S().playbooks.length + 1 + Math.floor(Math.random() * 90)); S().playbooks.push({ id, priority: +v.priority || 0, title: v.title.trim(), desc: v.desc.trim(), active: true, empty: true, rules: [], guardrails: [], helpers: [], editedAt: '2026-10-27T17:30:00+05:30' }); DM.toast('Playbook created'); DM.go('/settings/rulebook/rules/' + id); } }] }));
  const pbPage = ({ params }) => {
    const p = (S().playbooks || []).find((x) => x.id === params.id); if (!p) return frame(DM.empty('book', 'Playbook not found', 'It may have been deleted.', { action: '' }));
    const list = (kind, icon, tone) => (p[kind].length ? p[kind].map((x, i) => `<div class="sx-li" data-rid="${x.id}">${I(icon)}<span class="grow">${esc(x.text)}</span><button class="x" data-act="pb-del" data-arg="${p.id}|${kind}|${i}" title="Remove">${I('x')}</button></div>`).join('') : '') + `<div class="sx-li" style="color:#737373" data-add="${kind}">${U().padd === kind ? `<input class="sx-in" id="pb-ni" placeholder="Write it as one clear sentence" style="flex:1"><button class="btn sm" data-act="pb-addok" data-arg="${p.id}|${kind}">Add</button><button class="btn outline sm" data-act="pb-addno">Cancel</button>` : `<a style="cursor:pointer;display:flex;gap:6px;align-items:center" data-act="pb-add" data-arg="${kind}">${I('plus')} Add ${kind === 'rules' ? 'rule' : kind === 'guardrails' ? 'guardrail' : 'helper'}</a>`}</div>`;
    return frame(`<a class="row muted" style="gap:6px;cursor:pointer;margin-bottom:10px" data-go="/settings/rulebook/rules">${I('arrowL')} Rulebook</a>` + head(esc(p.title), esc(p.desc), `<button class="btn outline" data-act="pb-edit" data-arg="${p.id}">${I('pencil')} Edit</button><button class="btn outline" style="color:#e03a3a;border-color:#f3c6c6" data-act="pb-delete" data-arg="${p.id}">${I('trash')} Delete</button>`) +
      `<div class="sx-stack">${card('Details', '', `<div class="sx-kv" style="grid-template-columns:110px 1fr;align-items:center;gap:12px"><div class="muted">Status</div><div class="row" style="gap:8px">${DM.switch(p.active, 'pb-active', p.id)}${chip(p.active ? 'Active' : 'Inactive', p.active ? 'green' : 'muted')}<span class="muted">Paused playbooks are ignored until switched back on.</span></div><div class="muted">Priority</div><div class="row" style="gap:8px"><input class="sx-in" style="width:64px;text-align:center" type="number" value="${p.priority}" data-input="pb-prio" data-pb="${p.id}"><span class="muted">When two disagree, the lower number wins.</span></div><div class="muted">Edited</div><div>${esc(ago(p.editedAt))}</div></div>`, { right: `<span class="icotile">${I('sliders')}</span>` })}
      ${card('Rules ' + `<span class="sx-chip muted">${p.rules.length}</span>`, 'What is always true in this situation.', list('rules', 'circlecheck'), { flush: true })}
      ${card('Guardrails ' + `<span class="sx-chip muted">${p.guardrails.length}</span>`, 'Hard lines Anuma may never cross here.', list('guardrails', 'shieldx'), { flush: true })}
      ${card('Helpers ' + `<span class="sx-chip muted">${p.helpers.length}</span>`, 'Moves that tend to work, offered rather than enforced.', list('helpers', 'bulb'), { flush: true })}</div><p class="muted" style="margin-top:14px;font-size:12px">How Anuma writes is set once in <a style="text-decoration:underline;cursor:pointer" data-go="/settings/rulebook">Voice</a>, above — a playbook is only the judgement that sits on top of it.</p>`);
  };
  DM.page('/settings/rulebook/rules/:id', { title: 'Rulebook', render: pbPage, after: () => crumb('Rulebook') });
  A('pb-active', (el) => { const p = S().playbooks.find((x) => x.id === el.dataset.arg); p.active = !p.active; p.editedAt = '2026-10-27T17:30:00+05:30'; DM.toast(p.active ? 'Playbook is active' : 'Playbook paused'); DM.render(); });
  DM.input('pb-prio', (v, el) => { const p = S().playbooks.find((x) => x.id === el.dataset.pb); p.priority = +v || 0; });
  A('pb-add', (el) => { U().padd = el.dataset.arg; DM.render(); setTimeout(() => { const i = document.getElementById('pb-ni'); i && i.focus(); }, 30); });
  A('pb-addno', () => { U().padd = null; DM.render(); });
  A('pb-addok', (el) => { const [id, kind] = el.dataset.arg.split('|'); const v = (document.getElementById('pb-ni') || {}).value || ''; if (!v.trim()) return; const p = S().playbooks.find((x) => x.id === id); p[kind].push({ id: DM.uid('x'), text: v.trim() }); p.empty = false; p.editedAt = '2026-10-27T17:30:00+05:30'; U().padd = null; DM.toast('Added'); DM.render(); });
  A('pb-del', (el) => { const [id, kind, i] = el.dataset.arg.split('|'); const p = S().playbooks.find((x) => x.id === id); p[kind].splice(+i, 1); DM.render(); });
  A('pb-edit', (el) => { const p = S().playbooks.find((x) => x.id === el.dataset.arg); DM.dialog({ title: 'Edit playbook', w: 520, body: pbForm(p), actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save changes', run: (d) => { const v = formVals(d); if (!v.title.trim()) { DM.toast('Give the playbook a title', 'alert'); return false; } Object.assign(p, { title: v.title.trim(), desc: v.desc.trim(), priority: +v.priority || 0, editedAt: '2026-10-27T17:30:00+05:30' }); DM.toast('Playbook saved'); setTimeout(() => DM.render(), 0); } }] }); });
  A('pb-delete', (el) => { const p = S().playbooks.find((x) => x.id === el.dataset.arg); DM.confirm('Delete playbook', `Delete <b>${esc(p.title)}</b> and all its rules, guardrails and helpers?`, () => { S().playbooks = S().playbooks.filter((x) => x.id !== p.id); DM.toast('Playbook deleted', 'trash'); DM.go('/settings/rulebook/rules'); }, 'Delete'); });

  /* limits */
  const limitsPage = () => {
    const rows = ((S().limits || {}).rows || []).map((r) => `<div class="sx-lim"><div class="grow"><div class="t">${esc(r.label)}</div><div class="d">${esc(r.desc)}</div></div><select class="select" data-change="lim-set" data-key="${r.key}">${['Requires approval', 'Auto-approve', 'Auto-draft', 'Auto-send', 'Off'].map((o) => `<option ${o === r.value ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`).join('');
    return frame(head('Rulebook', 'How Anuma sounds and behaves, and what it may do without you.') + rbTabs('limits') + card('Autonomy per action', '', rows, { flush: true, right: `<span class="icotile">${I('sliders')}</span>` }));
  };
  DM.page('/settings/rulebook/limits', { title: 'Rulebook', render: limitsPage, after: () => crumb('Rulebook') });
  DM.input('lim-set', (v, el) => { const r = S().limits.rows.find((x) => x.key === el.dataset.key); if (r) { r.value = v; DM.toast(`${r.label}: ${v}`); } });

  /* ═════════════════ USAGE ═════════════════ */
  const compact = (n) => { if (n >= 1e6) { const v = n / 1e6; return (v >= 10 ? Math.round(v) : +v.toFixed(1)) + 'M'; } if (n >= 1e3) { const v = n / 1e3; return (v >= 10 ? Math.round(v) : +v.toFixed(1)) + 'K'; } if (n > 0 && n < 1) return String(+n.toFixed(3)); return String(Math.round(n * 10) / 10); };
  const pctTxt = (p) => (p > 0 && p < 1 ? '<1%' : Math.round(p) + '%');
  const usagePage = () => {
    const us = S().usage; if (!us) return frame(DM.empty('gauge', 'No usage yet', ''));
    const pos = (us.day / us.days) * 100; const left = us.days - us.day;
    const mv = (k, cap) => { const used = us.used[k] || 0; const proj = (used / us.day) * us.days; return { used, proj, p: (used / cap) * 100, pp: (proj / cap) * 100 }; };
    const find = (k) => us.meters.flatMap((m) => m.rows).find((r) => r.key === k);
    const donut = (k, title, hardCap) => { const r = find(k); const m = mv(k, r.cap); const C = 2 * Math.PI * 26; return `<div class="sx-card" style="padding:14px 16px;display:flex;gap:14px;align-items:center"><div class="u-don"><svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#f1f1f1" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="#13a269" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-c="${C}" data-p="${Math.min(100, m.p)}"/></svg><span class="p">${pctTxt(m.p)}</span></div><div style="min-width:0"><div class="row" style="gap:6px;font-size:12px;font-weight:500">${esc(title)}${hardCap ? '<span class="muted">· hard cap</span>' : ''}</div><div style="margin-top:2px"><span style="font-size:18px;font-weight:600"><span data-ucount="${m.used}">${compact(m.used)}</span></span> <span class="muted">/ ${compact(r.cap)}</span></div><div class="muted" style="font-size:11px;margin-top:2px">On pace for ${pctTxt(m.pp)} by ${fmtD(us.end).replace(/ 2026/, '')}</div></div></div>`; };
    const section = (s) => `<div class="sx-card" style="padding:14px 16px"><div class="row"><div style="font-size:14px;font-weight:600">${s.section}</div><span class="grow"></span><span class="icotile">${I(s.icon)}</span></div>${s.rows.map((r) => { const m = mv(r.key, r.cap); const projTxt = m.used > 0 ? `Projected by ${fmtD(us.end).replace(/ 2026/, '')}: <b>${compact(m.proj)}</b> (${pctTxt(m.pp)})` : 'Not used this cycle'; return `<div style="margin-top:14px"><div class="row" style="gap:8px"><span style="font-size:13px;font-weight:500">${esc(r.label)}</span>${r.hard ? '<span class="sx-chip amber">hard cap</span>' : ''}<span class="grow"></span><span class="muted"><b style="color:#171717;font-weight:600">${compact(m.used)}</b> / ${compact(r.cap)} ${esc(r.unit)}</span><span style="font-size:11px;font-weight:600;color:${m.p > 0 ? '#13a269' : '#a3a3a3'};width:34px;text-align:right">${pctTxt(m.p)}</span></div><div class="u-wrap" style="margin-top:6px"><div class="u-bar"><i style="width:0;background:#13a269" data-w="${Math.min(100, m.p)}"></i><i class="proj" style="width:0;left:0;z-index:0" data-w="${Math.min(100, Math.max(m.pp, m.p))}" data-under="1"></i></div><span class="u-tick" style="left:${pos}%"></span></div><div class="row muted" style="margin-top:4px;font-size:11px"><span>${projTxt}</span><span class="grow"></span><span>${esc(r.over)}</span></div></div>`; }).join('')}</div>`;
    return frame(head('Usage', 'Where this cycle stands against your plan.', `<span class="sx-chip">${esc(us.badge)}</span>`) + `<div class="sx-stack">
      <div class="sx-card" style="padding:14px 16px"><div class="row"><span style="font-size:14px;font-weight:600">Day ${us.day} of ${us.days}</span><span class="muted">of this cycle</span><span class="grow"></span><span class="muted">${left} days left</span></div><div class="u-bar" style="height:8px;margin-top:10px"><i style="width:0;background:#0a0a0a" data-w="${pos}"></i></div><div class="row muted" style="margin-top:6px;font-size:11px"><span>${fmtD(us.start)}</span><span class="grow"></span><span>${fmtD(us.end)}</span></div></div>
      <div class="grid g3" style="gap:16px">${donut('tokens', 'AI Token', true)}${donut('actions', 'AI Action')}${donut('email', 'Email Send')}</div>
      <div class="row muted" style="gap:16px;font-size:11px"><span class="row" style="gap:6px"><i style="width:18px;height:6px;border-radius:3px;background:#13a269"></i>Used</span><span class="row" style="gap:6px"><i style="width:2px;height:12px;background:#a3a3a3"></i>Where the cycle is today</span><span class="row" style="gap:6px"><i style="width:18px;height:6px;border-radius:3px;background:repeating-linear-gradient(135deg,rgba(19,162,105,.45) 0 3px,transparent 3px 6px)"></i>Projected at this pace</span></div>
      ${us.meters.map(section).join('')}
      <p class="muted" style="font-size:12px;margin:2px 0 0">Nothing hard-stops mid-order. Past a limit, usage bills at the plan's overage rate and shows here first. Meters marked hard cap pause at the quota until the next cycle.</p></div>`);
  };
  DM.page('/settings/usage', { title: 'Usage', render: usagePage, after: (root) => {
    crumb('Usage');
    setTimeout(() => { root.querySelectorAll('[data-w]').forEach((e) => (e.style.width = e.dataset.w + '%')); root.querySelectorAll('circle[data-p]').forEach((c) => (c.style.strokeDashoffset = +c.dataset.c * (1 - +c.dataset.p / 100))); }, 40);
    root.querySelectorAll('[data-ucount]').forEach((e) => { const to = parseFloat(e.dataset.ucount); const t0 = performance.now(); const tick = (t) => { const p = Math.min(1, (t - t0) / 700); e.textContent = compact(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); else e.textContent = compact(to); }; requestAnimationFrame(tick); });
  } });
})();
