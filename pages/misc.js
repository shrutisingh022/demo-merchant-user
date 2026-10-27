/* pages/misc.js — '/' redirect, catch-all 404, ⌘K search providers */
(function () {
  const I = DM.icon, esc = DM.esc;
  const arr = (k) => DM.S[k] || [];
  const has = (q, ...vals) => vals.some((v) => String(v == null ? '' : v).toLowerCase().includes(q));

  DM.page('/', {
    title: 'Home',
    render() {
      const home = (DM.ucs[DM.uc] && DM.ucs[DM.uc].home) || '/dashboard';
      setTimeout(() => DM.go(home), 0);
      return '<div class="page"><div class="empty">Loading…</div></div>';
    },
  });

  // Registered last: anything no page claimed lands here.
  DM.page('*', {
    title: 'Not found', crumb: 'Not found',
    render({ path }) {
      const q = path.split('/').filter(Boolean).pop() || '';
      const near = DM.allDestinations().filter((d) => q && d.url.toLowerCase().includes(q.toLowerCase().slice(0, 4))).slice(0, 5);
      return `<div class="page fadein" style="max-width:560px"><div class="empty" style="display:flex;flex-direction:column;align-items:center">
        ${DM.icoTile('search', 'lg')}
        <h2 style="font-size:18px;color:var(--foreground)">We couldn't find that page</h2>
        <p class="sm" style="margin-top:4px"><code>${esc(path)}</code> doesn't exist in this demo workspace.</p>
        ${near.length ? `<div class="col" style="margin:16px 0;text-align:left">${near.map((d) => `<a class="alert blue" href="#${d.url}">${I(d.icon)}<span class="grow">${esc(d.label)}</span>${I('chevR')}</a>`).join('')}</div>` : ''}
        <div class="row" style="justify-content:center;margin-top:16px">${DM.btn('Go to Home', null, { go: '/dashboard', icon: 'dashboard' })}${DM.btn('Search everything', 'misc-search', { cls: 'outline', icon: 'search' })}</div>
      </div></div>`;
    },
  });
  DM.act('misc-search', () => DM.acts.palette());

  /* ───────── ⌘K providers (read live DM.S) ───────── */
  DM.searchProviders.push((q) => arr('parties').filter((p) => has(q, p.name, p.city, p.gstin)).slice(0, 6).map((p) => ({ label: p.name, sub: 'Party · ' + (p.city || ''), icon: 'users', url: '/crm/accounts/' + p.id })));
  DM.searchProviders.push((q) => arr('contacts').filter((c) => has(q, c.name, c.phone, c.email)).slice(0, 4).map((c) => ({ label: c.name, sub: 'Contact · ' + (c.role || ''), icon: 'user', url: '/crm/contacts/' + c.id })));
  DM.searchProviders.push((q) => arr('products').filter((p) => has(q, p.name, p.sku, p.category, p.brand)).slice(0, 6).map((p) => ({ label: p.name, sub: 'Product · ' + p.sku, icon: 'package', url: '/products/' + p.id })));
  DM.searchProviders.push((q) => arr('orders').filter((o) => has(q, o.no, o.id)).slice(0, 5).map((o) => ({ label: o.no, sub: 'Order · ' + o.status, icon: 'clipboard', url: '/orders/' + o.id })));
  DM.searchProviders.push((q) => arr('rfqs').filter((r) => has(q, r.no, r.subject, r.id)).slice(0, 4).map((r) => ({ label: r.no || r.id, sub: 'RFQ · ' + (r.subject || ''), icon: 'sheet', url: '/orders/rfqs/' + r.id })));
  DM.searchProviders.push((q) => arr('drafts').filter((d) => has(q, d.no, d.id)).slice(0, 4).map((d) => ({ label: d.no, sub: 'Draft order', icon: 'file', url: '/orders/drafts/' + d.id })));
  DM.searchProviders.push((q) => arr('quotes').filter((x) => has(q, x.no, x.id)).slice(0, 4).map((x) => ({ label: x.no, sub: 'Quote · ' + x.status, icon: 'receipt', url: '/quotes/' + x.id })));
  DM.searchProviders.push((q) => arr('threads').filter((t) => has(q, t.subject, t.preview)).slice(0, 5).map((t) => ({ label: t.subject || t.preview, sub: 'Conversation', icon: 'inbox', url: '/inbox/threads?case=' + t.id })));
  DM.searchProviders.push((q) => arr('leads').filter((l) => has(q, l.title)).slice(0, 4).map((l) => ({ label: l.title, sub: 'Deal · ' + l.stage, icon: 'handshake', url: '/leads/' + l.id })));
  DM.searchProviders.push((q) => arr('agents').filter((a) => has(q, a.name)).slice(0, 3).map((a) => ({ label: a.name, sub: 'Agent', icon: 'bot', url: '/agents/' + a.id })));
})();
