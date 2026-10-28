/* CRM/Products enrichment on top of data/base-<uc>.js (runs right after the base files).
   - Rohan Mehta (u-rohan, the signed-in persona) owns 9 named parties per use case so "Yours" views (Home) are never empty.
   - Every party has consistent ownerIds / contactIds; every category count matches its styles; styles w/o status default to Active. */
(function () {
  if (!window.DM || !DM.seed) return;
  ['newhome', 'stuffcool', 'rfq'].forEach((uc) => {
    const s = DM.seed[uc]; if (!s || !s.parties) return;
    const named = s.parties.filter((p) => p.city && !/^\+?\d/.test(p.name));
    named.filter((_, i) => i % 5 === 1).slice(0, 9).forEach((p) => { p.salesId = 'u-rohan'; });
    s.parties.forEach((p) => { p.ownerIds = [p.asmId, p.salesId].filter(Boolean); p.contactIds = (p.contactIds || []).filter((id) => s.contacts.some((c) => c.id === id)); });
    // The base files emit SVG data URIs with raw '#' and '%' characters (invalid); re-encode them so the variant images actually load.
    const PRE = 'data:image/svg+xml,';
    const fixImg = (u) => (u && u.indexOf(PRE) === 0 ? PRE + encodeURIComponent(u.slice(PRE.length).replace(/%3C/g, '<').replace(/%3E/g, '>')) : u);
    (s.styles || []).forEach((st) => { st.status = st.status || 'Active'; (st.variants || []).forEach((v) => { v.status = v.status || 'Active'; if (v.inStock == null) v.inStock = 0; v.img = fixImg(v.img); }); });
    (s.categories || []).forEach((c) => { c.count = (s.styles || []).filter((x) => x.category === c.name).length; });
  });
})();
