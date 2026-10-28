/* Products — styles tree (Collapsed | Expanded), Categories modal, style drawer as a route. Spec: docs/spec/crm-products.md §3. Same component for all three use cases. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc, S = () => DM.S;
  const st = document.createElement('style'); st.dataset.for = 'products';
  st.textContent = `
  .pr-h{display:flex;align-items:flex-start;margin-bottom:14px}.pr-h h1{font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.2}.pr-h .px-sub{font-size:12px;color:var(--muted-foreground);margin-top:3px}
  .pr-h .right{margin-left:auto}
  .pr-mod{display:inline-flex;align-items:center;gap:6px;margin-left:4px;font-size:12px;color:var(--muted-foreground)}.pr-mod .btn{height:24px}
  .pr-cell{display:flex;align-items:center;gap:8px;min-width:0}.pr-cell .px-chev{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;flex:none;color:#737373;transition:transform .15s ease,background-color .15s}.pr-cell .px-chev:hover{background:#f0f0f0}.pr-cell .px-chev.open{transform:rotate(90deg)}
  .pr-cell .px-nm{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pr-cell .px-ct{color:var(--muted-foreground);font-weight:400;flex:none}
  .pr-cell.child{padding-left:30px;font-weight:500}.pr-cell.child .px-arr{color:#a3a3a3;flex:none}
  .px-vthumb{width:22px;height:22px;border-radius:6px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(10,10,10,.08)}
  .px-dsec{margin-top:18px}.px-dsec:first-child{margin-top:2px}.px-dsec-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}.px-dsec-h h3{font-size:12px;font-weight:600}
  .px-vgrid{border:1px solid var(--border);border-radius:10px;overflow:hidden}.px-vgrid .px-vh{display:grid;grid-template-columns:1fr 110px;height:32px;align-items:center;padding:0 12px;background:#fafafa;border-bottom:1px solid var(--border);font-weight:500;color:#525252}
  .px-vgrid .px-vb{max-height:252px;overflow:auto}.px-vrow{display:grid;grid-template-columns:1fr 110px;height:36px;align-items:center;padding:0 12px;border-bottom:1px solid #eee;cursor:pointer;gap:8px;transition:background-color .12s}.px-vrow:last-child{border:0}.px-vrow:hover{background:#fafafa}.px-vrow.sel{background:#f5f5f5;box-shadow:inset 2px 0 0 #171717}
  .px-vrow .px-n{display:flex;gap:8px;align-items:center;min-width:0;font-weight:500}.px-vrow .px-n span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .px-rcard{border:1px solid var(--border);border-radius:10px;overflow:hidden}.px-rcard .px-rh{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border)}.px-rcard .px-rh b{font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.px-rcard .px-rh .muted{flex:none}
  .px-rcard .px-img{width:48px;height:48px;border-radius:10px;object-fit:cover;box-shadow:0 0 0 1px rgba(10,10,10,.08);flex:none}
  .px-kv2{display:grid;grid-template-columns:150px 1fr;gap:10px 16px;padding:14px;font-size:12px}.px-kv2 .px-l{color:var(--muted-foreground)}.px-kv2 .px-v{min-width:0;word-break:break-word}
  .px-coll{border:1px solid var(--border);border-radius:10px;margin-top:12px;overflow:hidden}.px-coll>button{display:flex;align-items:center;gap:8px;width:100%;height:36px;padding:0 12px;font-weight:600;text-align:left}.px-coll>button svg.i{transition:transform .15s}.px-coll.open>button svg.i{transform:rotate(90deg)}
  .px-coll .px-cb{display:none;border-top:1px solid var(--border)}.px-coll.open .px-cb{display:block}
  .px-json{margin:0;padding:14px;background:#0a0a0a;color:#e5e5e5;font:11.5px/1.55 ui-monospace,Menlo,monospace;overflow:auto;max-height:260px;white-space:pre}.px-json .px-k{color:#93c5fd}.px-json .px-s{color:#86efac}.px-json .px-n{color:#fcd34d}
  .px-cat-row{display:flex;align-items:center;gap:8px;min-height:39px;padding:0 12px;border-bottom:1px solid var(--border);font-size:12px}.px-cat-row:last-child{border:0}.px-cat-row:hover{background:#fafafa}
  .px-cat-row .px-nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.px-cat-row .px-ct{color:var(--muted-foreground);font-size:11px}.px-cat-row .px-acts{display:none;gap:6px}.px-cat-row:hover .px-acts{display:flex}
  .px-cat-row .px-acts .btn{width:28px;height:28px}.px-cat-row input{height:28px}
  .px-cat-list{border:1px solid var(--border);border-radius:10px;max-height:330px;overflow:auto;margin-top:12px}
  .px-cat-foot{display:flex;align-items:center;margin-top:14px}.px-cat-foot .muted{flex:1}
  `;
  document.head.appendChild(st);

  /* ───────── state & data ───────── */
  const defUI = () => ({ q: '', cat: '', status: '', mode: 'collapsed', open: new Set(), closed: new Set(), view: '', views: [], rec: null, keepPage: null });
  const ui = () => { const m = (DM.ui.prodv2 = DM.ui.prodv2 || {}); return (m[DM.uc] = m[DM.uc] || defUI()); };
  const GID = () => 'prod-' + DM.uc;
  const styles = () => S().styles || [];
  const cats = () => S().categories || (S().categories = []);
  const styleById = (id) => styles().find((s) => s.id === id);
  const isOpen = (s) => (ui().mode === 'expanded' ? !ui().closed.has(s.id) : ui().open.has(s.id));
  const statusBadge = (s) => DM.status(s || 'Active', s === 'Inactive' ? 'grey' : 'green');
  const mutedOrDash = (v) => (v ? esc(v) : '<span class="muted">—</span>');
  const thumb = (v) => (v && v.img ? `<img class="px-vthumb" src="${v.img}" alt="">` : '');
  const sortKey = (r) => String(r.style.name).toLowerCase() + '\u0000' + (r.kind === 'variant' ? '1' + String(r.v.name).toLowerCase() : '0');
  const hasSku = () => DM.uc !== 'newhome';

  const matchStyle = (s, q) => !q || (s.name + ' ' + (s.code || '') + ' ' + (s.category || '') + ' ' + s.variants.map((v) => v.name).join(' ')).toLowerCase().includes(q);
  const filtered = () => { const u = ui(), q = u.q.toLowerCase().trim(); return styles().filter((s) => (!u.cat || s.category === u.cat) && (!u.status || (s.status || 'Active') === u.status) && matchStyle(s, q)); };
  const buildRows = () => {
    const out = [];
    filtered().forEach((s) => {
      out.push({ rid: s.id, kind: 'style', style: s, id: s.id, name: s.name, category: s.category, status: s.status || 'Active' });
      if (isOpen(s)) s.variants.forEach((v) => out.push({ rid: v.id, kind: 'variant', style: s, v, id: v.id, name: v.name, category: s.category, status: v.status || s.status || 'Active' }));
    });
    return out;
  };
  const modified = () => { const u = ui(); return !!(u.q || u.cat || u.status || u.mode === 'expanded' || u.open.size || u.closed.size); };

  /* ───────── list ───────── */
  const catFilter = () => ({ menu: { label: 'Category', title: 'Filter by category', items: cats().map((c) => ({ label: c.name, value: c.name })), value: ui().cat }, onChange: (v) => { ui().cat = v; DM.render(); } });
  const statusFilter = () => ({ menu: { label: 'Status', title: 'Filter by status', items: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], value: ui().status }, onChange: (v) => { ui().status = v; DM.render(); } });
  const grid = () => DM.table([
    { k: 'name', label: 'SR · Style reference', sortable: true, sort: 'asc', minW: 300, flex: 5, filter: { tip: "Search finds styles by name; a name filter isn't wired up yet." }, text: sortKey,
      render: (r) => r.kind === 'style' ? `<div class="pr-cell"><button class="px-chev ${isOpen(r.style) ? 'open' : ''}" data-act="prod-toggle" data-arg="${esc(r.style.id)}" title="${isOpen(r.style) ? 'Collapse this style' : 'Expand this style'}">${I('chevR')}</button><span class="px-nm">${esc(r.style.name)}</span><span class="px-ct">${r.style.variants.length}</span></div>` : `<div class="pr-cell child"><span class="px-arr">↳</span>${thumb(r.v)}<span class="px-nm">${esc(r.v.name)}</span></div>` },
    { k: 'category', label: 'Category', minW: 220, flex: 5, filter: catFilter(), render: (r) => mutedOrDash(r.category) },
    { k: 'status', label: 'Status', w: 150, filter: statusFilter(), render: (r) => statusBadge(r.status) },
  ], buildRows(), { id: GID(), onRow: (r) => DM.go('/products/' + encodeURIComponent(r.style.id) + (r.kind === 'variant' ? '?record=' + encodeURIComponent(r.v.id) : '')), footer: 'styles', offset: 312, rowCls: (r) => (r.kind === 'variant' ? 'row-child' : ''), empty: { icon: 'package', title: 'No styles match', sub: 'Try a different search or clear the filters.' } });

  const viewLabel = () => ui().view || 'All styles';
  const listHTML = () => {
    const u = ui(); const g = DM.ui._grid[GID()]; const off = g ? g.hidden.size : 0;
    const mod = modified() ? `<span class="pr-mod">Modified<button class="btn outline sm" data-act="prod-saveview">Save view</button><button class="btn ghost icon sm" data-act="prod-reset" title="Reset view">${I('x')}</button></span>` : '';
    return `<div class="page wide"><div class="pr-h"><div><h1>Products</h1><div class="px-sub">${DM.fmt.num(styles().length)} styles</div></div><div class="right"><button class="btn outline" data-act="prod-cats">${I('tag')}Categories</button></div></div>
      <div class="toolbar"><div class="row" style="gap:8px">${DM.viewBtn(viewLabel(), 'prod-views')}<div class="pills" role="tablist"><button role="tab" class="pill ${u.mode === 'collapsed' ? 'on' : ''}" data-act="prod-mode" data-arg="collapsed">${I('chevU')}Collapsed</button><button role="tab" class="pill ${u.mode === 'expanded' ? 'on' : ''}" data-act="prod-mode" data-arg="expanded">${I('chevD')}Expanded</button></div>${mod}</div>
      <div class="row right" style="gap:8px">${DM.colsBtn(GID(), off)}${DM.searchGroup('prod-q', 'Search styles…', u.q)}</div></div>${grid()}</div>`;
  };
  DM.input('prod-q', (v) => { ui().q = v; DM.render(); });
  DM.act('prod-mode', (el) => { const u = ui(); u.mode = el.dataset.arg; u.open = new Set(); u.closed = new Set(); u.keepPage = null; DM.render(); });
  DM.act('prod-toggle', (el) => {
    const u = ui(), id = el.dataset.arg, s = styleById(id); if (!s) return; const g = DM.grid(GID()); u.keepPage = g ? g.api.paginationGetCurrentPage() : null;
    const set = u.mode === 'expanded' ? u.closed : u.open; set.has(id) ? set.delete(id) : set.add(id); DM.render();
  });
  const saveViewDialog = () => {
    const u = ui();
    DM.dialog({ title: 'Save view', sub: 'Keeps the current search, filters and expand state as a named view.', w: 396, body: `<div class="field"><label>Name</label><input class="input" name="vn" placeholder="e.g. Jacquard styles" autofocus></div>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Save view', run: (d) => { const n = d.querySelector('[name=vn]').value.trim(); if (!n) { DM.toast('Give the view a name', 'info'); return false; } u.views = u.views.filter((x) => x.name !== n).concat([{ name: n, q: u.q, cat: u.cat, status: u.status, mode: u.mode, open: [...u.open], closed: [...u.closed] }]); u.view = n; DM.toast('View saved'); DM.render(); } }] });
  };
  const applyView = (v) => { const u = ui(); u.view = v ? v.name : ''; u.q = v ? v.q : ''; u.cat = v ? v.cat : ''; u.status = v ? v.status : ''; u.mode = v ? v.mode : 'collapsed'; u.open = new Set(v ? v.open : []); u.closed = new Set(v ? v.closed : []); u.keepPage = null; DM.render(); };
  DM.act('prod-views', (el) => { const u = ui(); DM.menu(el, [{ heading: 'Views' }, { label: 'All styles', check: !u.view, run: () => applyView(null) }, ...u.views.map((v) => ({ label: v.name, check: u.view === v.name, run: () => applyView(v) })), { sep: true }, { label: '+ New view', icon: 'plus', run: saveViewDialog }], { w: 256 }); });
  DM.act('prod-saveview', saveViewDialog);
  DM.act('prod-reset', () => applyView(null));

  /* ───────── style drawer ───────── */
  const sheetEl = () => document.querySelector('.sheet-wrap[data-sheet="prod"]');
  const jsonView = (o) => { const esc2 = (s) => esc(s); const lines = (v, ind) => { const pad = '  '.repeat(ind); if (v === null) return '<span class="px-n">null</span>'; if (typeof v === 'string') return `<span class="px-s">"${esc2(v)}"</span>`; if (typeof v === 'number' || typeof v === 'boolean') return `<span class="px-n">${v}</span>`; if (Array.isArray(v)) return '[' + (v.length ? '\n' + v.map((x) => pad + '  ' + lines(x, ind + 1)).join(',\n') + '\n' + pad : '') + ']'; const ks = Object.keys(v); return '{' + (ks.length ? '\n' + ks.map((k) => pad + '  <span class="px-k">"' + esc2(k) + '"</span>: ' + lines(v[k], ind + 1)).join(',\n') + '\n' + pad : '') + '}'; }; return lines(o, 0); };
  const selVariant = (s) => { const u = ui(); return s.variants.find((v) => v.id === u.rec) || s.variants[0]; };
  const drawerBody = (s) => {
    const v = selVariant(s), u = ui();
    const info = hasSku() ? `<div class="px-coll ${u.coll && u.coll.info ? 'open' : ''}" data-coll="info"><button data-act="prod-coll" data-arg="info">${I('chevR')}Product information</button><div class="px-cb"><div class="px-kv2"><span class="px-l">Category</span><span class="px-v">${esc(s.category || '—')}</span><span class="px-l">Product type</span><span class="px-v">${esc(s.productType || 'Goods')}</span><span class="px-l">Status</span><span class="px-v">${statusBadge(s.status)}</span><span class="px-l">Taxable</span><span class="px-v">${s.taxable === false ? 'No' : 'Yes'}</span><span class="px-l">External reference</span><span class="px-v">${esc(s.externalRef || '—')}</span></div></div></div>
      <div class="px-coll ${u.coll && u.coll.src ? 'open' : ''}" data-coll="src"><button data-act="prod-coll" data-arg="src">${I('chevR')}Source fields</button><div class="px-cb"><pre class="px-json">${jsonView({ record: { id: v.id, name: v.name, sku: v.sku || null, in_stock: v.inStock }, product: { id: s.id, name: s.name, status: s.status || 'Active' }, fields: s.attrs || {}, category: s.category || null, variant_count: s.variants.length, variant_title: 'Default Variant', custom_fields: {} })}</pre></div></div>` : '';
    return `<div class="px-dsec"><div class="px-dsec-h"><h3>Variants</h3></div><div class="px-vgrid"><div class="px-vh"><span>Name</span><span>Status</span></div><div class="px-vb">${s.variants.map((x) => `<div class="px-vrow ${x.id === v.id ? 'sel' : ''}" data-act="prod-rec" data-arg="${esc(x.id)}"><span class="px-n">${thumb(x)}<span>${esc(x.name)}</span></span>${statusBadge(x.status || s.status)}</div>`).join('')}</div></div></div>
      <div class="px-dsec"><div class="px-rcard"><div class="px-rh">${v.img ? `<img class="px-img" src="${v.img}" alt="">` : ''}<b>${esc(v.name)}</b><span class="muted">Selected record</span></div><div class="px-kv2"><span class="px-l">Name</span><span class="px-v">${esc(v.name)}</span>${hasSku() ? `<span class="px-l">SKU</span><span class="px-v" style="font-family:ui-monospace,Menlo,monospace">${esc(v.sku || '—')}</span>` : ''}${DM.uc === 'newhome' ? `<span class="px-l">Leaf / design / shade</span><span class="px-v">${esc([v.leaf, v.design, v.shade].filter(Boolean).join(' / ') || '—')}</span><span class="px-l">Width · GSM</span><span class="px-v">${esc([v.width, v.gsm ? v.gsm + ' GSM' : ''].filter(Boolean).join(' · ') || '—')}</span>` : ''}${v.price != null ? `<span class="px-l">Price</span><span class="px-v">${DM.fmt.inr(v.price)}${v.mrp ? ` <span class="muted">· MRP ${DM.fmt.inr(v.mrp)}</span>` : ''}</span>` : ''}<span class="px-l">In stock</span><span class="px-v">${DM.fmt.num(v.inStock || 0)}${v.unit ? ' ' + esc(v.unit) : ''}</span></div></div></div>${info}`;
  };
  const headSub = (s) => `${esc(s.category || '—')}<span>·</span>${s.variants.length} record${s.variants.length === 1 ? '' : 's'}`;
  const openDrawer = (s, rec) => {
    const u = ui(); if (rec) u.rec = rec; else if (!sheetEl() || u.cur !== s.id) u.rec = s.variants[0] && s.variants[0].id; u.cur = s.id;
    const w = sheetEl();
    if (w && w.dataset.sid === s.id) { DM.sheetBody(w, drawerBody(s)); return; }
    const nw = DM.sheet({ id: 'prod', w: 800, title: `<span style="font-size:16px;font-weight:600">${esc(s.name)}</span>`, sub: headSub(s), body: drawerBody(s), footer: `<span class="muted grow">${s.variants.length} records in this style</span><button class="btn outline sm" data-sheet-close>Close</button>`, onClose: () => { u.cur = null; DM.go('/products'); } });
    nw.dataset.sid = s.id;
  };
  DM.act('prod-rec', (el) => { const u = ui(), s = styleById(u.cur); if (!s) return; u.rec = el.dataset.arg; history.replaceState(null, '', '#/products/' + encodeURIComponent(s.id) + '?record=' + encodeURIComponent(u.rec)); const w = sheetEl(); if (w) { const b = w.querySelector('.sheet-b'); const sc = b.scrollTop, vb = b.querySelector('.px-vb'), vs = vb ? vb.scrollTop : 0; b.innerHTML = drawerBody(s); b.scrollTop = sc; const nv = b.querySelector('.px-vb'); if (nv) nv.scrollTop = vs; } });
  DM.act('prod-coll', (el) => { const u = ui(); u.coll = u.coll || {}; u.coll[el.dataset.arg] = !u.coll[el.dataset.arg]; el.closest('.px-coll').classList.toggle('open', !!u.coll[el.dataset.arg]); });

  /* ───────── categories modal ───────── */
  const catCount = (name) => styles().filter((s) => s.category === name).length;
  const catState = { q: '', edit: null, del: null };
  const catListHTML = () => {
    const q = catState.q.toLowerCase().trim(); const list = cats().filter((c) => !q || c.name.toLowerCase().includes(q));
    return list.length ? list.map((c) => c.id === catState.edit ? `<div class="px-cat-row"><input class="input grow" id="cat-edit" value="${esc(c.name)}"><button class="btn sm" data-act="prod-cat-save" data-arg="${esc(c.id)}">Save</button><button class="btn outline sm" data-act="prod-cat-cancel">Cancel</button></div>` : c.id === catState.del ? `<div class="px-cat-row"><span class="px-nm">Delete “${esc(c.name)}”?${catCount(c.name) ? ` <span class="muted">${catCount(c.name)} styles will have no category.</span>` : ''}</span><button class="btn danger sm" data-act="prod-cat-del" data-arg="${esc(c.id)}">Delete</button><button class="btn outline sm" data-act="prod-cat-cancel">Cancel</button></div>` : `<div class="px-cat-row"><span class="px-nm" title="${esc(c.name)}">${esc(c.name)}</span><span class="px-ct">${catCount(c.name)}</span><span class="px-acts"><button class="btn outline icon sm" data-act="prod-cat-edit" data-arg="${esc(c.id)}" title="Rename">${I('pencil')}</button><button class="btn outline icon sm" data-act="prod-cat-ask" data-arg="${esc(c.id)}" title="Delete">${I('trash')}</button></span></div>`).join('') : `<div class="empty" style="padding:28px">No categories match.</div>`;
  };
  const catPaint = () => { const d = document.getElementById('cat-modal'); if (!d) return; d.querySelector('.px-cat-list').innerHTML = catListHTML(); d.querySelector('.cat-n').textContent = DM.fmt.num(cats().length) + ' categories'; const add = d.querySelector('[data-act="prod-cat-add"]'); const t = catState.q.trim(); add.disabled = !t || cats().some((c) => c.name.toLowerCase() === t.toLowerCase()); const e = d.querySelector('#cat-edit'); if (e) { e.focus(); e.select(); } };
  DM.act('prod-cats', () => { catState.q = ''; catState.edit = null; catState.del = null; DM.dialog({ title: 'Categories', w: 460, body: `<div id="cat-modal"><div class="row" style="gap:8px"><div class="sgroup grow">${I('search')}<input id="cat-q" placeholder="Search or add a category…" autocomplete="off"></div><button class="btn" data-act="prod-cat-add" disabled>${I('plus')}Add</button></div><div class="px-cat-list"></div><div class="px-cat-foot"><span class="muted cat-n"></span><button class="btn" data-act="close-modal">Done</button></div></div>`, actions: [], onMount: (d) => { catPaint(); const q = d.querySelector('#cat-q'); q.addEventListener('input', () => { catState.q = q.value; catPaint(); }); q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const b = d.querySelector('[data-act="prod-cat-add"]'); if (!b.disabled) b.click(); } }); } }); });
  DM.act('prod-cat-add', () => { const name = catState.q.trim(); if (!name || cats().some((c) => c.name.toLowerCase() === name.toLowerCase())) return; cats().push({ id: 'cat-' + (cats().reduce((m, c) => Math.max(m, parseInt(String(c.id).replace(/\D/g, '')) || 0), 0) + 1), name, count: 0 }); const q = document.getElementById('cat-q'); if (q) q.value = ''; catState.q = ''; DM.toast('Category added'); catPaint(); DM.render(); });
  DM.act('prod-cat-edit', (el) => { catState.edit = el.dataset.arg; catState.del = null; catPaint(); const e = document.getElementById('cat-edit'); e && e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') document.querySelector('[data-act="prod-cat-save"]').click(); if (ev.key === 'Escape') { ev.stopPropagation(); catState.edit = null; catPaint(); } }); });
  DM.act('prod-cat-save', (el) => { const c = cats().find((x) => x.id === el.dataset.arg), e = document.getElementById('cat-edit'); const name = e ? e.value.trim() : ''; if (!c || !name) return; if (cats().some((x) => x.id !== c.id && x.name.toLowerCase() === name.toLowerCase())) { DM.toast('A category with that name exists', 'info'); return; } const old = c.name; styles().forEach((s) => { if (s.category === old) s.category = name; }); c.name = name; if (ui().cat === old) ui().cat = name; catState.edit = null; DM.toast('Category renamed'); catPaint(); DM.render(); });
  DM.act('prod-cat-cancel', () => { catState.edit = null; catState.del = null; catPaint(); });
  DM.act('prod-cat-ask', (el) => { catState.del = el.dataset.arg; catState.edit = null; catPaint(); });
  DM.act('prod-cat-del', (el) => { const c = cats().find((x) => x.id === el.dataset.arg); if (!c) return; styles().forEach((s) => { if (s.category === c.name) s.category = ''; }); S().categories = cats().filter((x) => x.id !== c.id); if (ui().cat === c.name) ui().cat = ''; catState.del = null; DM.toast('Category deleted'); catPaint(); DM.render(); });

  /* ───────── routes ───────── */
  DM.page('/products', { title: 'Products', render: () => listHTML(), after: (root) => {
    DM.closeSheet('prod'); ui().cur = null;
    const u = ui(); const c = root.querySelector('.gf-count'); if (c) c.textContent = DM.fmt.num(filtered().length) + ' styles in view';
    if (u.keepPage != null) { const g = DM.grid(GID()); if (g) g.api.paginationGoToPage(u.keepPage); u.keepPage = null; }
  } });
  DM.page('/products/:id', { title: 'Products', render: ({ params }) => { if (/^\/products/.test(DM._lastPath || '')) DM._lastPath = DM.path(); return listHTML(); }, after: (root, { params, q }) => {
    const c = root.querySelector('.gf-count'); if (c) c.textContent = DM.fmt.num(filtered().length) + ' styles in view';
    const s = styleById(params.id); if (!s) { DM.toast('Style not found', 'info'); DM.go('/products'); return; }
    openDrawer(s, q.get('record'));
  } });
  DM.searchProviders.push((q) => styles().filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5).map((s) => ({ label: s.name, sub: 'Style', icon: 'package', url: '/products/' + s.id })));
})();
