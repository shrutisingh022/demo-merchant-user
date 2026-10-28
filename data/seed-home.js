/* Seeds for the shell: notifications (bell + /notifications), Ask Anuma past chats, per-use-case Home helper data.
   Loaded AFTER seed-inbox.js so notifications can be derived from the seeded threads (real case numbers, real accounts). */
(function () {
  const DM = window.DM;
  const NOW = Date.parse('2026-10-27T17:30:00+05:30');
  const iso = (minAgo) => new Date(NOW - minAgo * 60000).toISOString();
  const KINDS = ['review', 'handoff', 'assigned', 'escalated', 'review', 'handoff', 'assigned', 'changes'];
  const PREVIEW = {
    review: ["A product the customer sent couldn't be matched confidently.", 'An image the customer sent could not be identified.'],
    handoff: ['Customer asked: "Delivery date?"', 'Customer asked: "Can you dispatch this today?"', 'Customer asked: "Rate thoda kam karo"'],
    assigned: ['Sent a photo', '"Design 4102 grey velvet 60 m"', 'Voice note (0:14)'],
    escalated: ['Customer asked a question the agent can\'t answer on its own.', 'Customer hit an unexpected error in the capture flow.'],
    changes: ['Intake rep message ops proposal is waiting for your review.', 'Guideline change from training is waiting for your review.'],
  };
  const TITLE = { review: 'Product for review', handoff: 'Hand-off', assigned: 'Chat assigned to you', escalated: 'Escalated to you', changes: 'Changes to review' };
  const fromThreads = (uc) => {
    const S = DM.seed[uc] || {}; const th = (S.threads || []).slice().sort((a, b) => String(b.lastAt || '').localeCompare(String(a.lastAt || '')));
    const parties = S.parties || []; const out = [];
    th.slice(0, 15).forEach((t, k) => {
      const kind = KINDS[k % KINDS.length]; const party = parties.find((p) => p.id === t.partyId);
      const acct = (party && party.name) || t.name || t.contactName || t.phone || 'Unknown number';
      out.push({ id: 'nt-' + (k + 1), type: kind, title: TITLE[kind], account: acct, caseNo: t.caseNo, caseId: t.id, at: t.lastAt || iso(60 * (k + 1)), unread: k < 6 && k % 4 !== 3, preview: PREVIEW[kind][k % PREVIEW[kind].length], thumb: kind === 'review' || kind === 'assigned' ? ['#cdb99a', '#8a9a8a', '#a7b4c8', '#d7c3b3'][k % 4] : null });
    });
    return out;
  };
  const STATIC = (accts) => accts.map((a, k) => ({ id: 'nt-' + (k + 1), type: KINDS[k % KINDS.length], title: TITLE[KINDS[k % KINDS.length]], account: a, caseNo: '2' + (60 - k) + '1026-' + (1 + (k % 3)), at: iso(90 + k * 420), unread: k < 6 && k % 4 !== 3, preview: PREVIEW[KINDS[k % KINDS.length]][k % PREVIEW[KINDS[k % KINDS.length]].length], thumb: k % 3 === 0 ? ['#cdb99a', '#8a9a8a', '#a7b4c8'][k % 3] : null }));
  const FALLBACK_NH = ['Studio Kavya Interiors', 'Mahajan Curtain House', 'Raj Home Decor', 'Patel Furnishing', 'Aarav Drapes', 'Neelam Fabrics', 'Sagar Soft Furnishing', 'Om Sai Decor', 'Gupta Textile Mart', 'Lakshmi Handlooms', 'Dhanraj Furnishings', 'Meera Designs', 'Kapoor Upholstery', 'Verma Cloth House', 'Shree Ganesh Traders'];
  const FALLBACK_SC = ['Sharma Mobile Hub', 'Digital Planet', 'Vasant Telecom', 'Gadget Galaxy', 'Mobile Bazaar', 'Techno Point'];

  const CHATS = {
    newhome: [
      { id: 'ac-1', group: 'Previous 30 days', title: 'Which cases are waiting on the team?', messages: [{ role: 'u', text: 'Which cases are waiting on the team?' }, { role: 'a', text: '**2 cases** are with the team right now:\n• **261026-2** — held by Pankaj Rane\n• **271026-3** — held by Vineet Shukla\nSLA for a hand-off is 15 minutes.' }] },
      { id: 'ac-2', group: 'Previous 30 days', title: 'Who ordered velvet this week?', messages: [{ role: 'u', text: 'Who ordered velvet this week?' }, { role: 'a', text: 'Velvet was ordered by **4 accounts** this week:\n• **Mahajan Curtain House** — 60 m\n• **Raj Home Decor** — 35 m\n• **Aarav Drapes** — 20 m\n• **Patel Furnishing** — 20 m' }] },
      { id: 'ac-3', group: 'Previous 30 days', title: 'How fast does Order Desk reply?', messages: [{ role: 'u', text: 'How fast does Order Desk reply?' }, { role: 'a', text: 'Order Desk replied to **18 of 19** messages within 15 minutes. Average reply time is **6 seconds**.' }] },
      { id: 'ac-4', group: 'September 2026', title: 'Which designs are most asked for?', messages: [{ role: 'u', text: 'Which designs are most asked for?' }, { role: 'a', text: 'Top designs by lines this month:\n• **PRIVE** — 41 lines\n• **ABANA** — 33 lines\n• **KARO** — 27 lines' }] },
      { id: 'ac-5', group: 'September 2026', title: 'Show me flagged lines from last week', messages: [] },
    ],
    stuffcool: [
      { id: 'ac-1', group: 'Previous 30 days', title: 'Which drafts are waiting for approval?', messages: [{ role: 'u', text: 'Which drafts are waiting for approval?' }, { role: 'a', text: '**3 draft orders** are pending, all older than 4 hours.' }] },
      { id: 'ac-2', group: 'Previous 30 days', title: 'Did every order reach Tally?', messages: [{ role: 'u', text: 'Did every order reach Tally?' }, { role: 'a', text: '**17 of 18** vouchers reached Tally. One was rejected for a missing ledger and has been retried.' }] },
      { id: 'ac-3', group: 'September 2026', title: 'Top dealers by order value', messages: [] },
    ],
    rfq: [
      { id: 'ac-1', group: 'Previous 30 days', title: 'Where is the delay coming from?', messages: [{ role: 'u', text: 'Where is the delay coming from?' }, { role: 'a', text: 'Most of the wait sits between **intake and costing**. Median time to first quote is about **3h 40m**.' }] },
      { id: 'ac-2', group: 'Previous 30 days', title: 'Who is slowest to start?', messages: [] },
      { id: 'ac-3', group: 'September 2026', title: 'How fast is costing once it starts?', messages: [] },
    ],
  };
  // Replies fallback (used when the threads carry no reply timestamps): avg seconds + case counts
  const HOME = {
    newhome: { replies: { team: { sec: 212, cases: 5 }, desk: { sec: 6, cases: 14 }, within: { pct: 94, of: 17, n: 16 } } },
    stuffcool: { replies: { team: { sec: 168, cases: 3 }, desk: { sec: 5, cases: 9 }, within: { pct: 92, of: 12, n: 11 } } },
    rfq: { replies: null },
  };
  ['newhome', 'stuffcool', 'rfq'].forEach((uc) => {
    let n = fromThreads(uc);
    if (!n.length) n = uc === 'newhome' ? STATIC(FALLBACK_NH) : uc === 'stuffcool' ? STATIC(FALLBACK_SC) : [];
    DM.data(uc, 'notifications', n);
    DM.data(uc, 'askChats', CHATS[uc]);
    DM.data(uc, 'home', HOME[uc]);
  });
})();
