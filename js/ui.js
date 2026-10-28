/* Shared UI components (Mira / live-app look): AG Grid table, stat cards, segmented controls, sheets, dialogs, calendar, skeletons. */
(function () {
  const DM = window.DM, I = DM.icon, esc = DM.esc;
  Object.assign(DM.icons, {
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    checkcheck: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/>',
    swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    reply: '<path d="M21 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16l4-4h12a2 2 0 0 0 2-2v-1"/><path d="m16 8-3 3 3 3"/><path d="M21 11h-8"/>',
    uprightarrow: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    filediff: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 13h6"/><path d="M12 10v6"/>',
    atsign: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
    arrowup2: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    usercog: '<circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/>',
    fileplus: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/>',
    fileedit: '<path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    circlecheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    trianglealert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    lockk: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    inboxk: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    whatsapp: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    sortup: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    sortdown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    chevupdown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  });
  const ic = (n, c = '') => I(n, c);

  /* ───────── primitives ───────── */
  DM.icoTile = (name, cls = '') => `<span class="icotile ${cls}">${I(name)}</span>`;
  DM.mono = (t) => `<span class="monotag">${esc(t)}</span>`;
  DM.status = (label, tone = 'green') => `<span class="stat-badge ${tone}"><i></i>${esc(label)}</span>`;
  DM.empty = (icon, title, sub, o = {}) => `<div class="empty-card" ${o.style ? `style="${o.style}"` : ''}><span class="icotile lg">${I(icon)}</span><div class="b" style="margin-top:10px">${esc(title)}</div>${sub ? `<div class="muted sm" style="margin-top:2px;max-width:340px">${esc(sub)}</div>` : ''}${o.action || ''}</div>`;
  DM.skel = (h = 12, w = '100%', cls = '') => `<div class="shimmer ${cls}" style="height:${h}px;width:${typeof w === 'number' ? w + 'px' : w}"></div>`;
  DM.skelRows = (n = 6, h = 40) => Array.from({ length: n }, () => `<div class="shimmer" style="height:${h - 12}px;margin:6px 12px;border-radius:6px"></div>`).join('');
  // stat card — live anatomy. o.tile: 'left' (Home: tile + label, dashed divider) | 'right' (CRM: label, tile right, no divider); o.count animates the number; o.delta {dir,text,tone}
  DM.statCard = (label, value, sub, icon, o = {}) => {
    const tile = icon ? `<span class="icotile">${I(icon)}</span>` : '';
    const tl = o.tile === 'right';
    const val = o.count != null ? `<span data-count="${o.count}" data-fmt="${o.fmt || 'num'}" data-ck="${esc(label)}">${DM.fmt.num(o.count)}</span>` : value;
    const delta = o.delta ? `<span class="delta ${o.delta.tone || ''}">${I(o.delta.dir === 'down' ? 'chevD' : 'uprightarrow')}${esc(o.delta.text)}</span>` : '';
    return `<div class="card statc ${tl ? 'tr' : ''} ${o.cls || ''}" ${o.rid ? `data-rid="${o.rid}"` : ''}><div class="statc-h">${tl ? '' : tile}<span class="grow">${esc(label)}</span>${tl ? tile : ''}</div>${o.divider === false || tl ? '' : '<div class="statc-d"></div>'}<div class="statc-v">${val}${delta}</div>${sub != null && sub !== '' ? `<div class="statc-s ${o.tone || ''}">${sub}</div>` : ''}</div>`;
  };
  // segmented control (live tablist look)
  DM.seg = (items, cur, act, o = {}) => `<div class="pills" role="tablist">${items.map((t) => { const k = t.key ?? t; const l = t.label ?? t; return `<button role="tab" class="pill ${k === cur ? 'on' : ''}" data-act="${act}" data-arg="${esc(k)}">${t.icon ? I(t.icon) : ''}${esc(l)}${t.count != null ? ` <span class="${o.chips ? 'cnt-chip' : 'muted'}">${t.count}</span>` : ''}</button>`; }).join('')}</div>`;
  DM.toolbar = (left = '', right = '') => `<div class="toolbar"><div class="row gap12">${left}</div><div class="row gap12 right">${right}</div></div>`;
  DM.viewBtn = (label, act = 'view-menu', arg = '') => `<button class="btn outline sm viewbtn" data-act="${act}" data-arg="${esc(arg)}">${I('grid')} ${esc(label)} ${I('chevD')}</button>`;
  DM.colsBtn = (gid, nOff = 0) => `<button class="btn outline sm colsbtn" data-act="grid-cols" data-gid="${esc(gid || '')}">${I('columns')} Columns${nOff ? ' · ' + nOff + ' off' : ''}</button>`;
  DM.searchGroup = (id, ph, val = '') => `<div class="sgroup">${I('search')}<input data-input="${id}" placeholder="${esc(ph)}" value="${esc(val)}"></div>`;
  DM.copy = (text) => { try { navigator.clipboard && navigator.clipboard.writeText(String(text)); } catch (e) {} DM.toast('Copied', 'copy'); };
  DM.act('copy', (el) => DM.copy(el.dataset.arg));

  /* ───────── AG Grid table ─────────
     DM.table(cols, rows, opts)
       col: { k, label, w(px)|flex, num, mono (click-to-copy number), bold (medium 500 first text col), muted, sortable, sort:'asc'|'desc',
              render(row)->html, text(row)->string for sort/filter, filter:{tip} (disabled) | {menu:{label,items:[{label,value}],value}, onChange(v)} | false }
       opts: { id, go(row)->path, click:'actName' (data-arg=row[idKey]), idKey, rowCls(row), footer:'parties' (label) | false, pageSize:50, fill:true|false, offset:px,
               rowHeight:40, hidden:[colKeys], empty:{icon,title,sub}, onRow(row,ev) }
     DM.grid(id) -> {api, cols, state}   DM.colsMenu(anchor,id)   */
  DM._grids = []; DM._gridApis = []; DM.ui._grid = DM.ui._grid || {}; DM._gridReg = {};
  const strip = (h) => String(h == null ? '' : h).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  DM.table = (cols, rows, o = {}) => {
    const idx = DM._grids.length; const id = o.id || 'g' + idx;
    const st = (DM.ui._grid[id] = DM.ui._grid[id] || { size: o.pageSize || 50, hidden: new Set(o.hidden || []) });
    if (!rows.length) { const e = o.empty || {}; return DM.empty(e.icon || 'inbox', e.title || 'Nothing here yet', e.sub || ''); }
    DM._grids.push({ id, cols, rows, o, st });
    const fill = o.fill ?? rows.length > 11;
    return `<div class="dmgrid-wrap ${fill ? 'fill' : 'auto'} ${o.cls || ''}" data-gidx="${idx}" ${fill ? `style="height:calc(100vh - ${o.offset || 292}px);min-height:300px"` : ''}><div class="dmgrid ag-theme-quartz"></div>${o.footer === false ? '' : `<div class="gfoot"><span class="muted gf-count">${DM.fmt.num(rows.length)} ${esc(o.footer || 'rows')} in view</span><div class="row gap4 right gf-pager"></div></div>`}</div>`;
  };
  class HeaderComp {
    init(p) {
      const c = p.col; this.p = p; const el = (this.el = document.createElement('div')); el.className = 'ag-hc';
      let ft = '';
      if (c.filter !== false) {
        const f = c.filter || {}; const on = !!f.menu; const tip = on ? (f.menu.title || 'Filter by ' + c.label.toLowerCase()) : (f.tip || "This filter isn't wired up yet.");
        ft = `<button class="ag-ft ${on ? 'on' : 'dis'} ${on && f.menu.value != null && f.menu.value !== '' ? 'active' : ''}" ${on ? '' : 'disabled'} title="${esc(tip)}">${I('filter')}</button>`;
      }
      el.innerHTML = `<button class="ag-hl ${c.sortable ? '' : 'nosort'}" ${c.sortable ? `title="Sort by ${esc(c.label.toLowerCase())}"` : ''}><span>${esc(c.label)}</span><span class="ag-sa"></span></button>${ft}`;
      const sa = el.querySelector('.ag-sa'); const upd = () => { const s = p.column.getSort(); sa.innerHTML = s === 'asc' ? I('sortup') : s === 'desc' ? I('sortdown') : ''; };
      upd(); p.column.addEventListener('sortChanged', upd);
      if (c.sortable) el.querySelector('.ag-hl').addEventListener('click', (e) => p.progressSort(e.shiftKey));
      const b = el.querySelector('.ag-ft.on');
      if (b) b.addEventListener('click', (e) => { e.stopPropagation(); const f = c.filter.menu; DM.menu(b, [{ heading: f.label || c.label }, { sep: true }, ...f.items.map((it) => ({ label: it.label, check: it.value === f.value, run: () => c.filter.onChange && c.filter.onChange(it.value === f.value ? '' : it.value) }))], { w: 176 }); });
    }
    getGui() { return this.el; }
    refresh() { return false; }
  }
  const mountOne = (el) => {
    const g = DM._grids[+el.dataset.gidx]; if (!g) return; const { cols, rows, o, st, id } = g;
    const gridEl = el.querySelector('.dmgrid'); const fill = el.classList.contains('fill');
    const seenKey = DM.path() + '|' + DM.uc + '|' + id; DM._gridSeen = DM._gridSeen || {};
    const first = !DM._gridSeen[seenKey]; DM._gridSeen[seenKey] = 1;
    const colDefs = cols.map((c) => {
      const key = c.k || c.label; const cd = {
        headerName: c.label, field: c.k, colId: key, headerComponent: HeaderComp, headerComponentParams: { col: c }, sortable: !!c.sortable, sort: c.sort, hide: st.hidden.has(key), suppressMovable: true,
        resizable: true, flex: c.w ? undefined : (c.flex || 1), width: c.w ? parseInt(c.w) : undefined, minWidth: c.w ? parseInt(c.w) : (c.minW || 100), type: c.num ? 'rightAligned' : undefined,
        cellClass: [c.bold ? 'c-bold' : '', c.muted ? 'c-muted' : '', c.mono ? 'c-mono' : ''].filter(Boolean).join(' '),
        valueGetter: (p) => (c.text ? c.text(p.data) : c.render && !c.mono ? strip(c.render(p.data)) : p.data[c.k]),
        comparator: c.num ? (a, b) => parseFloat(String(a).replace(/[^0-9.-]/g, '')) - parseFloat(String(b).replace(/[^0-9.-]/g, '')) : undefined,
        cellRenderer: (p) => {
          const d = document.createElement('div'); d.className = 'agc'; const v = c.k ? p.data[c.k] : null;
          if (c.mono) { const t = c.render ? strip(c.render(p.data)) : v; d.innerHTML = t ? `<button class="monocell" title="Click to copy" data-copy="${esc(t)}">${esc(t)}${I('copy')}</button>` : '<span class="muted">—</span>'; d.querySelector('button') && d.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); DM.copy(t); }); return d; }
          if (c.render) { d.innerHTML = c.render(p.data); return d; }
          d.innerHTML = v == null || v === '' ? '<span class="muted">—</span>' : esc(v); return d;
        },
      }; return cd;
    });
    const api = agGrid.createGrid(gridEl, {
      rowData: rows, headerHeight: 40, rowHeight: o.rowHeight || 40, suppressCellFocus: true, animateRows: false, suppressMovableColumns: true,
      domLayout: fill ? 'normal' : 'autoHeight', pagination: o.footer !== false && rows.length > 0, suppressPaginationPanel: true, paginationPageSize: st.size,
      defaultColDef: { sortable: false, resizable: true, filter: false, suppressHeaderMenuButton: true }, columnDefs: colDefs, getRowClass: o.rowCls ? (p) => o.rowCls(p.data) : undefined,
      onRowClicked: (e) => { if (e.event && e.event.target.closest('button,a,input,select')) return; if (o.onRow) return o.onRow(e.data, e.event); if (o.go) DM.go(o.go(e.data)); else if (o.click && DM.acts[o.click]) DM.acts[o.click]({ dataset: { arg: e.data[o.idKey || 'id'] }, tagName: 'DIV' }, e.event); },
    });
    DM._gridApis.push(api); DM._gridReg[id] = { api, cols, st, rows };
    // custom pager
    const pg = el.querySelector('.gf-pager');
    if (pg) {
      const total = rows.length; const draw = () => {
        const size = st.size, cur = api.paginationGetCurrentPage(), pages = Math.max(1, Math.ceil(total / size)); const a = total ? cur * size + 1 : 0, b = Math.min(total, (cur + 1) * size);
        pg.innerHTML = `<button class="btn outline sm pgsize">${size} / page</button><span class="muted mono-ish">${DM.fmt.num(a)}–${DM.fmt.num(b)} of ${DM.fmt.num(total)}</span><button class="btn outline sm icon pgprev" ${cur <= 0 ? 'disabled' : ''} title="Previous page">${I('chevL')}</button><button class="btn outline sm icon pgnext" ${cur >= pages - 1 ? 'disabled' : ''} title="Next page">${I('chevR')}</button>`;
        pg.querySelector('.pgprev').onclick = () => api.paginationGoToPreviousPage(); pg.querySelector('.pgnext').onclick = () => api.paginationGoToNextPage();
        pg.querySelector('.pgsize').onclick = (e) => DM.menu(e.currentTarget, [25, 50, 100].map((n) => ({ label: n + ' / page', check: n === st.size, run: () => { st.size = n; api.setGridOption('paginationPageSize', n); draw(); } })), { w: 120 });
      };
      api.addEventListener('paginationChanged', draw); draw();
    }
    if (first) { const sk = document.createElement('div'); sk.className = 'grid-skel'; sk.innerHTML = DM.skelRows(Math.min(10, rows.length), 40); el.appendChild(sk); setTimeout(() => { sk.style.opacity = 0; setTimeout(() => sk.remove(), 200); }, 380); }
  };
  DM.mountGrids = (root) => { DM._gridApis.forEach((a) => { try { a.destroy(); } catch (e) {} }); DM._gridApis = []; DM._gridReg = {}; if (!window.agGrid) return; root.querySelectorAll('.dmgrid-wrap').forEach(mountOne); };
  DM.afterHooks.unshift((root) => DM.mountGrids(root));
  DM.grid = (id) => DM._gridReg[id];
  DM.colsMenu = (anchor, id, labels) => {
    const g = DM.grid(id); if (!g) return DM.toast('Column chooser');
    const draw = () => { const items = g.cols.map((c) => { const key = c.k || c.label; return { label: c.label, check: !g.st.hidden.has(key), run: () => { const hide = !g.st.hidden.has(key); hide ? g.st.hidden.add(key) : g.st.hidden.delete(key); g.api.setColumnsVisible([key], !hide); const b = document.querySelector(`.colsbtn[data-gid="${id}"]`); if (b) b.innerHTML = `${I('columns')} Columns${g.st.hidden.size ? ' · ' + g.st.hidden.size + ' off' : ''}`; setTimeout(() => { DM.menu(b || anchor, [{ heading: 'Columns' }, { sep: true }].concat(draw()), { w: 192 }); }, 0); } }; }); return items; };
    DM.menu(anchor, [{ heading: 'Columns' }, { sep: true }].concat(draw()), { w: 192 });
  };
  DM.act('grid-cols', (el) => DM.colsMenu(el, el.dataset.gid));

  /* ───────── sheets (right drawers) ─────────
     DM.sheet({ id, w:800|384|404, title, sub, tabs:[{key,label}], tab, body, footer, scrim:true, onClose, headerExtra, inset }) → element; DM.closeSheet(id?) */
  DM.sheet = (o) => {
    DM.closeSheet(o.id); const wrap = document.createElement('div'); wrap.className = 'sheet-wrap ' + (o.scrim === false ? 'noscrim' : ''); if (o.id) wrap.dataset.sheet = o.id;
    wrap.innerHTML = `<div class="sheet" style="width:${o.w || 800}px;${o.radius ? `border-radius:${o.radius}px;` : ''}"><div class="sheet-h"><div class="grow" style="min-width:0"><div class="sheet-t">${o.title || ''}</div>${o.sub ? `<div class="sheet-s">${o.sub}</div>` : ''}</div>${o.headerExtra || ''}<button class="btn ghost icon sm" data-sheet-close title="Close">${I('x')}</button></div>${o.tabs ? `<div class="sheet-tabs">${DM.seg(o.tabs, o.tab || o.tabs[0].key, o.tabAct || 'sheet-tab')}</div>` : ''}<div class="sheet-b">${o.body || ''}</div>${o.footer !== undefined ? `<div class="sheet-f">${o.footer}</div>` : ''}</div>`;
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 160); o.onClose && o.onClose(); };
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap && o.scrim !== false) close(); }); wrap.addEventListener('click', (e) => { if (e.target.closest('[data-sheet-close]')) close(); });
    wrap._close = close; document.body.appendChild(wrap); o.onMount && o.onMount(wrap); return wrap;
  };
  DM.closeSheet = (id) => document.querySelectorAll('.sheet-wrap' + (id ? `[data-sheet="${id}"]` : '')).forEach((w) => w.remove());
  DM.sheetBody = (wrap, html) => { const b = wrap.querySelector('.sheet-b'); b.innerHTML = html; b.classList.remove('xf'); void b.offsetWidth; b.classList.add('xf'); };

  /* ───────── dialogs ───────── DM.dialog({title, sub, body, actions:[{label,cls,run(el)}], w}) — centred, radius 14, black/40 overlay */
  DM.dialog = (o) => DM.modal({ title: o.title, body: (o.sub ? `<p class="muted sm" style="margin:-4px 0 12px">${o.sub}</p>` : '') + (o.body || ''), actions: o.actions || [], lg: false, onMount: (d) => { const m = d.querySelector('.modal'); if (o.w) m.style.width = `min(${o.w}px,94vw)`; o.onMount && o.onMount(d); } });

  /* ───────── calendar popover ───────── DM.calendar(anchor, {value:'2026-10-27', max:'2026-10-27', onPick(iso)}) */
  DM.calendar = (anchor, o) => {
    document.querySelectorAll('.calpop').forEach((e) => e.remove());
    let v = new Date(o.value + 'T00:00:00'); let view = new Date(v.getFullYear(), v.getMonth(), 1); const max = o.max ? new Date(o.max + 'T00:00:00') : null; const today = new Date((o.max || o.value) + 'T00:00:00');
    const r = anchor.getBoundingClientRect(); const pop = document.createElement('div'); pop.className = 'calpop'; document.body.appendChild(pop);
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const draw = () => {
      const y = view.getFullYear(), m = view.getMonth(); const first = new Date(y, m, 1); const start = new Date(y, m, 1 - first.getDay()); const cells = [];
      for (let k = 0; k < 42; k++) { const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + k); const out = d.getMonth() !== m; const dis = max && d > max; cells.push(`<button class="cd ${out ? 'out' : ''} ${dis ? 'dis' : ''} ${iso(d) === iso(v) ? 'sel' : ''} ${iso(d) === iso(today) ? 'today' : ''}" ${dis ? 'disabled' : ''} data-d="${iso(d)}">${d.getDate()}</button>`); }
      pop.innerHTML = `<div class="ch"><button class="btn ghost icon sm cprev">${I('chevL')}</button><b class="grow" style="text-align:center">${view.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</b><button class="btn ghost icon sm cnext">${I('chevR')}</button></div><div class="cw">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((x) => `<span>${x}</span>`).join('')}</div><div class="cg">${cells.join('')}</div>`;
      pop.querySelector('.cprev').onclick = () => { view = new Date(y, m - 1, 1); draw(); }; pop.querySelector('.cnext').onclick = () => { view = new Date(y, m + 1, 1); draw(); };
      pop.querySelectorAll('.cd:not(.dis)').forEach((b) => (b.onclick = () => { pop.remove(); o.onPick(b.dataset.d); }));
    }; draw();
    pop.style.top = r.bottom + 6 + 'px'; pop.style.left = Math.max(8, Math.min(r.right - 252, innerWidth - 260)) + 'px';
    setTimeout(() => document.addEventListener('mousedown', function f(e) { if (!e.target.closest('.calpop')) { pop.remove(); document.removeEventListener('mousedown', f); } }), 0);
  };
  /* ───────── shared small helpers ─────────
     DM.cnt(n, 'num'|'inr'|'inrc'|'pct', key)  → <span> that counts up (core animates [data-count])
     DM.changedRows(key, rows, sigFn, idKey)   → Set of row ids new/changed since this surface last rendered (first visit flashes nothing)
     DM.caseNo(thread)                         → 'DDMMYY-n' case tag (thread.caseNo wins when seeded) */
  const FMTS = { inr: DM.fmt.inr, inrc: DM.fmt.inrc, pct: (x) => Math.round(x) + '%', num: (x) => DM.fmt.num(Math.round(x)) };
  DM.cnt = (n, f = 'num', ck) => { const v = +n || 0; return `<span data-count="${v}" data-fmt="${f}"${ck ? ` data-ck="${ck}"` : ''}>${(FMTS[f] || FMTS.num)(v)}</span>`; };
  DM.ui.rowsSeen = DM.ui.rowsSeen || {};
  DM.changedRows = (key, rows, sig = () => '', idk = 'id') => { const k = key + '|' + DM.uc; const prev = DM.ui.rowsSeen[k]; const cur = {}; const out = new Set(); rows.forEach((r) => { const id = r[idk]; cur[id] = sig(r); if (prev && prev[id] !== cur[id]) out.add(id); }); DM.ui.rowsSeen[k] = cur; return out; };
  const msx = (x) => { const v = typeof x === 'number' ? x : Date.parse(x); return isNaN(v) ? null : v; };
  const firstAtX = (t) => { const m = (t.messages || []).find((x) => msx(x.at) != null); return m ? m.at : t.lastAt; };
  let tagM = { k: '', m: {} };
  DM.caseNo = (t) => {
    if (!t) return ''; if (t.caseNo) return t.caseNo; const th = DM.S.threads || []; const key = th.map((x) => x.id + (firstAtX(x) || '')).join('|');
    if (tagM.k !== key) { const L = th.map((x) => ({ x, at: msx(firstAtX(x)) ?? 0 })).sort((a, b) => a.at - b.at); const cnt = {}, out = {}; L.forEach(({ x, at }) => { const dk = new Date(at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); cnt[dk] = (cnt[dk] || 0) + 1; const [y, mo, d] = dk.split('-'); out[x.id] = d + mo + y.slice(2) + '-' + cnt[dk]; }); tagM = { k: key, m: out }; }
    return tagM.m[t.id] || String(t.id);
  };
  DM.downloadCSV = (name, rows) => { const csv = rows.map((r) => r.map((c) => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; a.click(); };
})();
