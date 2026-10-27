/* Extra inbox seed data (runs after data/<uc>.js): showcase cases the live NuHome inbox has — an unknown-number case with a
   system COMMENT, and a closed case converted to a draft order through Confirm / Edit / Cancel buttons — plus comments,
   events and hand-off notes on existing threads. Mutates DM.seed[uc].threads / drafts only. */
(function () {
  const D = window.DM;
  const BIZ = { rfq: 'Access Electricals', stuffcool: 'Stuffcool', newhome: 'NuHome' };
  const iso = (h, m, day) => `2026-10-${day}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`;
  const MSG = (id, from, type, text, at, meta) => Object.assign({ id, from, type, text, at }, meta ? { meta } : {});
  const ucs = Object.keys(D.seed || {});
  ucs.forEach((uc) => {
    const S = D.seed[uc]; if (!S || !S.threads) return;
    const biz = BIZ[uc] || 'our team';
    const parties = S.parties || [], products = S.products || [], contacts = S.contacts || [], users = S.users || [];
    const human = (users[1] || users[0] || { id: 'u1', name: 'Team member' });
    const owner = (users[0] || human);

    /* (a) unknown number — no CRM match, Anuma tells them to contact the team */
    S.threads.push({
      id: 'x-unk-' + uc, partyId: '', unknownPhone: '+91 91882 81417', contactId: '', channel: 'whatsapp', subject: 'Unknown sender', owner: 'anuma', status: 'open', unread: 0,
      preview: 'Chinmayi here from Studio HBA mumbai', lastAt: iso(6, 44, 25), lastDirection: 'in', priority: 'normal',
      events: [{ at: iso(6, 44, 25), actor: 'System', text: 'Case opened' }, { at: iso(6, 44, 25), actor: 'System', text: 'Tag Unknown added' }],
      messages: [
        MSG('xu1', 'customer', 'text', 'Hi Arpita', iso(6, 44, 25)),
        MSG('xu2', 'system', 'text', 'case opened', iso(6, 44, 25), { actor: 'System' }),
        MSG('xu3', 'system', 'text', 'added tag Unknown', iso(6, 44, 25), { actor: 'System' }),
        MSG('xu4', 'system', 'comment', 'Sender has no matching Account/Contact in this merchant’s CRM — not engaged with order capture; told to contact the team directly.', iso(6, 44, 25), { actor: 'System' }),
        MSG('xu5', 'anuma', 'text', `Thanks for reaching out to ${biz}. We couldn’t find your number in our records — please contact the team directly to get set up before placing an order.`, iso(6, 45, 25)),
        MSG('xu6', 'customer', 'text', 'Chinmayi here from Studio HBA mumbai', iso(6, 45, 25)),
      ],
    });

    /* (b) closed case converted to a draft order via Confirm / Edit / Cancel */
    const P = parties[2] || parties[0]; if (!P) return;
    const C = contacts.find((c) => c.partyId === P.id) || {};
    const pick = products.filter((p) => p.status !== 'draft').slice(3, 6);
    const lines = pick.map((p, i) => ({ n: i + 1, productId: p.id, name: p.name, qty: [6, 67, 5][i] || 5, unit: p.unit || 'nos', price: p.price, state: 'confirmed' }));
    const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
    const draftId = 'dr-x-' + uc, no = 'DRF-1144';
    (S.drafts = S.drafts || []).push({ id: draftId, no, partyId: P.id, threadId: 'x-conv-' + uc, status: 'posted', total, createdAt: iso(11, 16, 25), by: 'Anuma', note: 'Converted from WhatsApp case', lines });
    const sumText = 'Please confirm your order:\n' + lines.map((l) => `${l.n}. ${l.name} — ${l.qty} ${l.unit}`).join('\n');
    S.threads.push({
      id: 'x-conv-' + uc, partyId: P.id, contactId: C.id || '', channel: 'whatsapp', subject: 'Order via WhatsApp', owner: 'anuma', status: 'closed', unread: 0,
      preview: `Thanks — your order (${no}) is confirmed!`, lastAt: iso(11, 20, 25), lastDirection: 'out', priority: 'normal', draftId,
      events: [
        { at: iso(11, 8, 25), actor: 'System', text: 'Case opened' }, { at: iso(11, 14, 25), actor: 'System', text: 'Status set to Escalated' }, { at: iso(11, 14, 25), actor: human.name, text: 'assigned conversation to self' },
        { at: iso(11, 15, 25), actor: human.name, text: 'handed back the conversation to Anuma' }, { at: iso(11, 19, 25), actor: 'System', text: `closed — Intake enquiry converted → ${no}` },
      ],
      messages: [
        MSG('xc1', 'customer', 'text', lines.map((l) => `${l.name} ${l.qty} ${l.unit}`).join(', '), iso(11, 8, 25)),
        MSG('xc2', 'anuma', 'text', 'Got it — 3 items captured. Anything else?', iso(11, 9, 25)),
        MSG('xc3', 'customer', 'text', 'no', iso(11, 14, 25)),
        MSG('xc4', 'system', 'text', 'handed back the conversation to Anuma', iso(11, 15, 25), { actor: human.name }),
        MSG('xc5', 'anuma', 'card', sumText, iso(11, 16, 25), { kind: 'summary', title: 'Order summary', lines, total, options: ['Confirm', 'Edit', 'Cancel'], answered: true }),
        MSG('xc6', 'customer', 'text', 'Confirm', iso(11, 17, 25), { choice: true, quoteOf: 'xc5' }),
        MSG('xc7', 'system', 'comment', `Resolution summary — enquiry #189: Converted to ${no}.\n` + lines.map((l) => `${l.n}. ${l.name} — ${l.qty} ${l.unit}`).join('\n'), iso(11, 18, 25), { actor: 'Anuma' }),
        MSG('xc8', 'system', 'text', `closed — Intake enquiry converted → ${no}`, iso(11, 19, 25), { actor: 'System' }),
        MSG('xc9', 'anuma', 'text', `Thanks — your order (${no}) is confirmed! We’ll get started on it right away.`, iso(11, 20, 25)),
      ],
    });

    /* comments + notes on existing threads owned by a person */
    const own = S.threads.filter((t) => t.owner && t.owner !== 'anuma' && !String(t.id).startsWith('x-'));
    own.slice(0, 2).forEach((t, i) => {
      const last = (t.messages || []).slice(-1)[0];
      const at = (last && last.at) ? new Date(Date.parse(last.at) + 60000).toISOString() : iso(5, 0, 27);
      t.messages.push(MSG('xk-' + t.id, 'system', 'comment', i ? `Credit limit review pending with accounts — hold dispatch until they confirm.` : `Customer is price-sensitive on this one. Keep the quote within the agreed band and loop in ${owner.name} before sharing a revised rate.`, at, { actor: (D.by ? (users.find((u) => u.id === t.owner) || human).name : human.name) }));
    });
  });
})();
