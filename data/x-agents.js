/* Rework data for agents + workflows (loads after the use-case seeds): updatedAt on agents, versions on workflows,
   and the use-case-matching workflow graph (Trigger → Decision → Action → End) in first position. */
(function () {
  const AGO = { rfq: [3, 12, 40], stuffcool: [5, 9, 31], newhome: [17, 30, 25] }; // days before 2026-10-27
  const base = new Date('2026-10-27T10:00:00+05:30').getTime();
  const iso = (days) => new Date(base - days * 86400000).toISOString();

  // use-case-specific live workflow, matching the NuHome screen: node.count/pct are the run chips
  const FLOW = {
    newhome: { id: 'wf-coral', name: 'Coral DraftOrder → SalesOrder Sync', status: 'active', version: 3, updated: '2026-10-22', runs: 7, lastRun: '2026-10-27T04:00:00.000Z', trigger: 'Draft order status changed',
      nodes: [
        { id: 'n1', type: 'trigger', label: 'Draft order status changed', detail: 'Draft order status changed', count: 7, pct: 100 },
        { id: 'n2', type: 'decision', label: '1 condition in 1 group', detail: '1 condition in 1 group', count: 7, pct: 100 },
        { id: 'n3', type: 'action', label: 'Push draft order to Coral ERP', detail: 'Push draft order to Coral ERP', source: 'Coral ERP', count: 5, pct: 71 },
        { id: 'n4', type: 'end', label: 'End of the workflow', detail: 'End of the workflow', count: 2, pct: 29 },
        { id: 'n5', type: 'end', label: 'End of the workflow', detail: 'End of the workflow', count: 2, pct: 29 },
      ],
      edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'TRUE' }, { from: 'n3', to: 'n4' }, { from: 'n2', to: 'n5', label: 'FALSE' }] },
    stuffcool: { id: 'wf-tally', name: 'Order → Tally voucher sync', status: 'active', version: 4, updated: '2026-10-24', runs: 42, lastRun: '2026-10-27T01:35:00.000Z', trigger: 'Order status changed',
      nodes: [
        { id: 'n1', type: 'trigger', label: 'Order status changed', detail: 'Order status changed', count: 42, pct: 100 },
        { id: 'n2', type: 'decision', label: 'Status is Confirmed', detail: '1 condition in 1 group', count: 42, pct: 100 },
        { id: 'n3', type: 'action', label: 'Post sales voucher to Tally', detail: 'Post order as a sales voucher', source: 'Tally (tally-gw.stuffcool.local:9000)', count: 31, pct: 74 },
        { id: 'n4', type: 'end', label: 'End of the workflow', detail: 'End of the workflow', count: 31, pct: 74 },
        { id: 'n5', type: 'end', label: 'End of the workflow', detail: 'End of the workflow', count: 11, pct: 26 },
      ],
      edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'TRUE' }, { from: 'n3', to: 'n4' }, { from: 'n2', to: 'n5', label: 'FALSE' }] },
    rfq: { id: 'wf-rfq-quote', name: 'RFQ → Quote approval', status: 'active', version: 3, updated: '2026-10-23', runs: 28, lastRun: '2026-10-27T03:00:00.000Z', trigger: 'RFQ status changed',
      nodes: [
        { id: 'n1', type: 'trigger', label: 'RFQ status changed', detail: 'RFQ status changed', count: 28, pct: 100 },
        { id: 'n2', type: 'decision', label: 'Quote value above ₹1,00,000', detail: '1 condition in 1 group', count: 28, pct: 100 },
        { id: 'n3', type: 'action', label: 'Request approval from Owner', detail: 'Hold the quote until approved', source: 'Approvers', count: 9, pct: 32 },
        { id: 'n4', type: 'action', label: 'Send quote to contractor', detail: 'Email the quote PDF and WhatsApp the link', source: 'Gmail + WhatsApp', count: 19, pct: 68 },
        { id: 'n5', type: 'end', label: 'End of the workflow', detail: 'End of the workflow', count: 9, pct: 32 },
        { id: 'n6', type: 'end', label: 'End of the workflow', detail: 'End of the workflow', count: 19, pct: 68 },
      ],
      edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'TRUE' }, { from: 'n3', to: 'n5' }, { from: 'n2', to: 'n4', label: 'FALSE' }, { from: 'n4', to: 'n6' }] },
  };

  Object.keys(AGO).forEach((uc) => {
    const s = DM.seed[uc]; if (!s) return;
    (s.agents || []).forEach((a, i) => { a.updatedAt = iso(AGO[uc][i] != null ? AGO[uc][i] : 20 + i); a.type = 'Chat'; a.description = a.description || ''; });
    // the first agent lives on two channels (e.g. "WhatsApp … and 1 more")
    const a0 = (s.agents || [])[0]; const ch = s.channels || [];
    if (a0) { const second = ch.find((c) => c.id !== a0.channelId && c.type === 'email') || ch.find((c) => c.id !== a0.channelId); a0.channelIds = [a0.channelId, second && second.id].filter(Boolean); }
    (s.agents || []).slice(1).forEach((a) => { a.channelIds = a.channelId ? [a.channelId] : []; });
    const wfs = s.workflows || (s.workflows = []);
    wfs.forEach((w, i) => { w.version = w.version || (i % 3) + 1; w.updated = w.updated || (w.lastRun ? String(w.lastRun).slice(0, 10) : '2026-10-18'); });
    const f = FLOW[uc]; const exists = wfs.findIndex((w) => w.id === f.id); if (exists >= 0) wfs.splice(exists, 1);
    wfs.unshift(DM.clone ? DM.clone(f) : JSON.parse(JSON.stringify(f)));
  });
})();
