/* data/seed-inbox.js — Inbox seed for NewHome ("newhome") and Stuffcool ("stuffcool"). The Access use case ("rfq") has no Inbox.
   Keys: numbers, templates, threads, aiSummaries.   FAKE data. Shapes are documented in docs/CONTRACT_V2.md (Inbox section).

   thread  { id:'t-<n>', caseNo, numberId, channel:'whatsapp'|'email', partyId?, contactId?, name?, subName?, phone, status:'open'|'escalated'|'closed',
             owner:'anuma'|<userId>, openedAt, lastAt, unread:n, tags:[], slaDueAt?, handoffAt?, escalatedAt?, task?, noSummary?, lines:[{id,label,variantId?,qty,unit,state:'ok'|'flagged'}], draftNo?, messages:[…] }
   message { id, from:'customer'|'anuma'|<userId>|'system', type, at(ISO), … }
     text     { text, quote?:{who,text}, buttons?:[label], ticks?:'sent'|'delivered'|'read', reaction? }
     image    { src, caption?, reaction?, label?:'Approved'|'Rejected'|'Expired', quote? }
     audio    { seconds, transcript, quote? }        file { name, size }
     template { name, text }                         comment { by:'Anuma'|'System'|<userId>|<name>, text }
     tool     { agent, tool, detail?, hover?:{head,sub,label,value,lines?:[{name,conf}],thumb?} }
     system   { text:'**System** added tag **Unknown**' }   (Activity column is derived from system messages; `act` overrides the activity wording)
     call     { turns:[{who:'customer'|'agent',text}], seconds, subject? }            (email / phone-call layout)
   Scenario authors: push messages onto thread.messages (ids unique), set status/owner/lastAt via DM.inbox helpers in pages/inbox.js. */
(function () {
  if (!window.DM) return;
  const T0 = Date.UTC(2026, 9, 27);
  const day = (n) => new Date(T0 - n * 864e5).toISOString().slice(0, 10);
  const at = (n, hm) => `${day(n)}T${String(hm).padStart(5, '0')}:00+05:30`;
  const addm = (hm, m) => { let [h, mi] = hm.split(':').map(Number); mi += m; h += Math.floor(mi / 60); mi %= 60; return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0'); };
  let seq = 0; const mid = () => 'm' + (++seq);
  const svg = (w, h, inner) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>${inner}</svg>`);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // fabric album page photo with a printed label
  const labelImg = (lines, bg = '#d9cfbd', tint = '#b59a76') => svg(504, 352, `<defs><pattern id='p' width='14' height='14' patternUnits='userSpaceOnUse' patternTransform='rotate(35)'><rect width='14' height='14' fill='${bg}'/><rect width='5' height='14' fill='${tint}' opacity='.35'/></pattern></defs><rect width='504' height='352' fill='url(#p)'/><rect x='70' y='60' width='364' height='232' rx='6' fill='#fbfaf6' transform='rotate(-2 252 176)'/><g transform='rotate(-2 252 176)' font-family='monospace' font-size='22' fill='#2a2a2a'>${lines.map((l, i) => `<text x='96' y='${104 + i * 34}'>${esc(l)}</text>`).join('')}</g>`);
  const swatchImg = (c1, c2 = '#ffffff') => svg(504, 352, `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}' stop-opacity='.55'/></linearGradient><pattern id='w' width='8' height='8' patternUnits='userSpaceOnUse'><path d='M0 4h8M4 0v8' stroke='#000' stroke-opacity='.07'/></pattern></defs><rect width='504' height='352' fill='url(#g)'/><rect width='504' height='352' fill='url(#w)'/>`);
  const boxImg = (c, label) => svg(504, 352, `<rect width='504' height='352' fill='#eef0f3'/><rect x='150' y='40' width='204' height='272' rx='28' fill='${c}'/><rect x='170' y='62' width='164' height='228' rx='18' fill='#fff' opacity='.12'/><circle cx='252' cy='96' r='9' fill='#000' opacity='.5'/><text x='252' y='334' font-family='sans-serif' font-size='18' text-anchor='middle' fill='#555'>${esc(label)}</text>`);

  // message builders
  const cu = (a, text, o) => Object.assign({ id: mid(), from: 'customer', type: 'text', at: a, text }, o);
  const an = (a, text, o) => Object.assign({ id: mid(), from: 'anuma', type: 'text', at: a, text, ticks: 'read' }, o);
  const us = (u, a, text, o) => Object.assign({ id: mid(), from: u, type: 'text', at: a, text, ticks: 'read' }, o);
  const im = (a, src, o) => Object.assign({ id: mid(), from: 'customer', type: 'image', at: a, src }, o);
  const au = (a, seconds, transcript, o) => Object.assign({ id: mid(), from: 'customer', type: 'audio', at: a, seconds, transcript }, o);
  const tl = (a, agent, tool, detail, hover) => ({ id: mid(), from: 'anuma', type: 'tool', at: a, agent, tool, detail, hover });
  const cm = (a, by, text) => ({ id: mid(), from: 'system', type: 'comment', at: a, by, text });
  const sy = (a, text, act) => ({ id: mid(), from: 'system', type: 'system', at: a, text, act });
  const opened = (a, no, uc) => sy(a, uc === 'stuffcool' ? `**System** case **CASE-${no}** opened` : `**System** case ${no.replace('-', '-00')} opened`, uc === 'stuffcool' ? `Case CASE-${no} opened` : `Case ${no.replace('-', '-00')} opened`);
  const pad3 = (no) => no.replace('-', '-00');

  // normalise a thread: chronological messages, lastAt = last customer-visible message, defaults
  const CHAT = { text: 1, image: 1, audio: 1, file: 1, template: 1, call: 1 };
  const finish = (t) => {
    t.channel = t.channel || 'whatsapp'; t.tags = t.tags || []; t.unread = t.unread || 0; t.lines = t.lines || [];
    t.messages.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    const vis = t.messages.filter((m) => CHAT[m.type]); t.lastAt = (vis[vis.length - 1] || t.messages[t.messages.length - 1]).at; t.openedAt = t.messages[0].at;
  };
  const seedFor = (uc) => {
    const base = DM.seed[uc] || {}; const styles = base.styles || []; const parties = base.parties || []; const contacts = base.contacts || [];
    const P = (id) => parties.find((p) => p.id === id) || {}; const C = (id) => contacts.find((c) => c.id === id) || {};
    const sty = (code) => styles.find((s) => s.code === code || s.id === 'st-' + String(code).toLowerCase()) || styles[0];
    // "STYLE - leaf / design / shade" label + variant id
    const V = (code, n = 0) => { const s = sty(code) || { name: code, variants: [] }; const v = (s.variants || [])[n] || (s.variants || [])[0] || {}; return { label: (s.name || code) + ' - ' + (v.name || ''), variantId: v.id, styleId: s.id }; };
    return { P, C, V };
  };

  /* ═══════════════════════════ NEWHOME ═══════════════════════════ */
  const newhome = () => {
    const { P, C, V } = seedFor('newhome'); const agent = 'Anuma'; let n = 0; const threads = [];
    const NUM1 = 'wa-1', NUM2 = 'wa-2';
    const push = (t) => { t.id = 't-' + (++n); t.numberId = t.numberId || NUM1; finish(t); threads.push(t); return t; };
    const who = (t) => { const p = P(t.partyId), c = C(t.contactId); return { p, c, phone: t.phone || c.phone || p.phone }; };

    // full order conversation generator (photo → read → match → qty → confirm → DRF)
    const orderFlow = (o) => {
      const d = o.d, no = o.caseNo; let hm = o.hm; const tick = (m = 1) => (hm = addm(hm, m)); const A = () => at(d, hm); const M = [];
      const first = V(o.items[0][0], o.items[0][1]);
      M.push(opened(A(), no));
      M.push(im(A(), labelImg(['QUALITY  ' + o.items[0][0].toUpperCase(), 'LEAF NO  ' + (10 + (n % 80)), 'WIDTH  140 CM', '100% POLYESTER']), { reaction: '🧐' })); tick(0);
      M.push(tl(A(), agent, 'Image Analysis', '', { head: 'What Anuma read', sub: '1 photograph · ' + 'Today', label: 'Read from the image', value: 'Quality ' + o.items[0][0].toUpperCase() + ' · Leaf ' + (10 + (n % 80)) + ' · 140 CM' }));
      M.push(an(A(), 'Checking the photo now, back in a moment.')); tick(0);
      M.push(tl(A(), agent, 'Product Search', '— ' + first.label + ' · 100%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: first.label, conf: 100 }] }));
      M.push(an(A(), `Got it — ${first.label} added.\nHow many would you like for:\n1. ${first.label}\nReply with the amount for each, in the same order — one per line, or all on one line separated by commas (e.g. 10, 5).`)); tick();
      M.push(cu(A(), o.items[0][2] + ' ' + (o.items[0][3] === 'Roll' ? 'roll' : 'meter')));
      M.push(an(A(), `1. ${first.label} — ${o.items[0][2]}.000 ${o.items[0][3]}\nAnything else to add?`)); tick();
      let lines = [{ id: 'l1', label: first.label, variantId: first.variantId, qty: o.items[0][2], unit: o.items[0][3], state: 'ok' }];
      if (o.items[1]) {
        const second = V(o.items[1][0], o.items[1][1]);
        if (o.hitl) {
          M.push(im(A(), labelImg(['QUALITY  VERONA', 'LEAF NO  9999', 'WIDTH  140 CM', '30 M'], '#cfd6d4', '#8aa39b'), { reaction: '❓', label: 'Rejected' })); tick(0);
          M.push(tl(A(), agent, 'Image Analysis', '', { head: 'What Anuma read', sub: '1 photograph', label: 'Read from the image', value: 'Quality VERONA · Leaf 9999 · 140 CM' }));
          M.push(cm(A(), 'Anuma', 'Agent flagged 1 line(s) for review:\n- Leaf No: 9999\nQuality: VERONA\nDesign: VERONA\nWidth: 140 CM\n(reask)'));
          M.push(an(A(), 'I couldn\'t confidently match "Leaf No: 9999 / Quality: VERONA / Design: VERONA / Width: 140 CM" — could you confirm the exact product name, or share a clearer photo?', { quote: { who: o.phone || 'customer', text: '[image]' } })); tick();
          M.push(sy(A(), '**Anuma handed this over** — intake line item review · pending'));
          M.push(sy(A(), '**System** set status to **Escalated**'));
          M.push(cm(A(), 'System', 'Escalated to human: Customer message needs a human: no automatic handler for this message.'));
          M.push(sy(A(), `**System** assigned conversation to **${o.humanName}**`)); tick(4);
          M.push(sy(A(), `**${o.humanName}** assigned conversation to **self**`));
          M.push(cm(A(), o.human, `[Anuma] Attached variant ${second.label} to Enquiry Line #${700 + (n % 90)}.`));
          M.push(tl(A(), agent, 'A reviewer resolved', '— ' + second.label, { head: 'Review', sub: 'Resolved by ' + o.humanName, label: 'Attached variant', value: second.label })); tick(1);
          M.push(sy(A(), `**${o.humanName}** handed back the conversation to **Anuma**`));
        } else {
          M.push(im(A(), swatchImg('#9aa6c4'), { reaction: '🏷️' })); tick(0);
          M.push(tl(A(), agent, 'Product Search', '— ' + second.label + ' · 97%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: second.label, conf: 97 }] }));
        }
        M.push(an(A(), `Got it — ${second.label} added.\nHow many would you like for:\n1. ${second.label}`)); tick();
        M.push(cu(A(), o.items[1][2] + ' ' + (o.items[1][3] === 'Roll' ? 'roll' : 'meter'))); tick(0);
        lines.push({ id: 'l2', label: second.label, variantId: second.variantId, qty: o.items[1][2], unit: o.items[1][3], state: 'ok' });
      }
      const list = lines.map((l, i) => `${i + 1}. ${l.label} — ${l.qty}.000 ${l.unit}`).join('\n');
      const prompt = 'Please confirm your order:\n' + list;
      M.push(an(A(), prompt, { buttons: ['Confirm', 'Edit', 'Cancel'] })); tick();
      M.push(cu(A(), 'Confirm', { quote: { who: 'Anuma', text: prompt.replace(/\n/g, ' ') }, reaction: '✅' }));
      M.push(cm(A(), 'Anuma', `Resolution summary — enquiry #${180 + (n % 40)}: Converted to #${o.draft}.\n${list}`));
      M.push(sy(A(), `**System** closed — **Intake enquiry converted → DraftOrder #${o.draft}**`, `System closed — Intake enquiry converted → DraftOrder #${o.draft}`));
      M.push(an(A(), `Thanks — your order (#${o.draft}) is confirmed! We'll get started on it right away.`, { quote: { who: o.phone || 'customer', text: 'Confirm' } }));
      return { messages: M, lines };
    };

    // ── open / escalated cases (the live ones, today) ──
    push({ caseNo: '271026-1', partyId: 'AC-1001', phone: '+919004455210', status: 'open', owner: 'anuma', unread: 1, slaDueAt: at(0, '17:38'),
      messages: [opened(at(0, '13:58'), '271026-1'), cu(at(0, '13:59'), 'Hey'), an(at(0, '13:59'), 'Hi! Thanks for reaching out to NuHome. Send us a photo or the product name (and quantity) to place an order, and we\'ll take it from there.', { ticks: 'read' }), cu(at(0, '14:01'), 'Do you have blackout fabric in 150 cm?')] });

    push({ caseNo: '271026-2', partyId: 'AC-1005', contactId: 'CT-1041', status: 'open', owner: 'anuma', unread: 2, slaDueAt: at(0, '18:12'),
      lines: [{ id: 'l1', label: V('ASHVI', 0).label, variantId: V('ASHVI', 0).variantId, qty: 40, unit: 'Meter', state: 'ok' }, { id: 'l2', label: V('BELMONT', 1).label, variantId: V('BELMONT', 1).variantId, qty: null, unit: '', state: 'ok' }],
      messages: [opened(at(0, '15:20'), '271026-2'), im(at(0, '15:21'), labelImg(['QUALITY  ASHVI', 'LEAF NO  04', 'WIDTH  137 CM'], '#cfd6c4', '#7d9a6a'), { reaction: '🏷️' }),
        tl(at(0, '15:21'), agent, 'Product Search', '— ' + V('ASHVI', 0).label + ' · 100%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: V('ASHVI', 0).label, conf: 100 }] }),
        an(at(0, '15:21'), `Got it — ${V('ASHVI', 0).label} added.\nHow many would you like for:\n1. ${V('ASHVI', 0).label}`), cu(at(0, '15:23'), '40 meter'),
        an(at(0, '15:23'), `1. ${V('ASHVI', 0).label} — 40.000 Meter\nAnything else to add?`), im(at(0, '15:40'), swatchImg('#b88c6b'), { reaction: '👀' }), cu(at(0, '15:41'), 'aur ye wala bhi chahiye'), ],
      });

    // rohan's escalated case
    const t4 = push({ caseNo: '271026-4', partyId: 'AC-1013', contactId: 'CT-1049', status: 'escalated', owner: 'u-rohan', unread: 0, handoffAt: at(0, '15:50'), escalatedAt: at(0, '15:50'), task: 'Answer question', slaDueAt: at(0, '16:05'),
      messages: [opened(at(0, '15:48'), '271026-4'), cu(at(0, '15:49'), 'Hi can you dispatch the Calista order today? Truck leaving at 6'), an(at(0, '15:49'), 'Our team is looking into this and will get back to you shortly.'),
        sy(at(0, '15:50'), '**System** set status to **Escalated**'), cm(at(0, '15:50'), 'System', 'Escalated to human: Customer asked: "Hi can you dispatch the Calista order today? Truck leaving at 6"'), sy(at(0, '15:50'), '**System** assigned conversation to **Rohan Mehta**')] });
    // rohan's human-owned open case
    push({ caseNo: '271026-5', partyId: 'AC-1016', contactId: 'CT-1016', status: 'open', owner: 'u-rohan', unread: 0, slaDueAt: at(0, '19:30'),
      messages: [opened(at(0, '12:02'), '271026-5'), cu(at(0, '12:03'), 'Namaste, rate list update hua kya?'), an(at(0, '12:03'), 'Our team is looking into this and will get back to you shortly.'), sy(at(0, '12:04'), '**System** assigned conversation to **Rohan Mehta**'),
        us('u-rohan', at(0, '12:10'), 'Namaste ji, haan — new rate list kal se lagu hai. Main PDF bhej raha hoon.'), cu(at(0, '12:12'), 'ok dhanyawad')] });

    const pk = push({ caseNo: '261026-2', partyId: 'AC-1015', contactId: 'CT-1038', status: 'escalated', owner: 'u-pankaj', unread: 0, handoffAt: at(1, '17:20'), escalatedAt: at(1, '17:20'), task: 'Confirm product', slaDueAt: at(1, '17:35'),
      lines: [{ id: 'l1', label: V('DAMASK', 0).label, variantId: V('DAMASK', 0).variantId, qty: 20, unit: 'Meter', state: 'ok' }, { id: 'l2', label: 'Leaf No: 9999 · Quality: VERONA', variantId: null, qty: 30, unit: 'Meter', state: 'flagged' }],
      messages: [opened(at(1, '17:08'), '261026-2'), im(at(1, '17:09'), labelImg(['QUALITY  DAMASK', 'LEAF NO  11', 'WIDTH  150 CM'], '#cfd0d6', '#8a8ec2'), { reaction: '🏷️' }),
        tl(at(1, '17:09'), agent, 'Product Search', '— ' + V('DAMASK', 0).label + ' · 100%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: V('DAMASK', 0).label, conf: 100 }] }),
        an(at(1, '17:09'), `Got it — ${V('DAMASK', 0).label} added.\nHow many would you like for:\n1. ${V('DAMASK', 0).label}`), cu(at(1, '17:11'), '20 meter'),
        im(at(1, '17:18'), labelImg(['QUALITY  VERONA', 'LEAF NO  9999', '30 M'], '#d9d3cd', '#a28a75'), { reaction: '❓', label: 'Rejected' }), tl(at(1, '17:18'), agent, 'Image Analysis', '', { head: 'What Anuma read', sub: '1 photograph', label: 'Read from the image', value: 'Quality VERONA · Leaf 9999' }),
        cm(at(1, '17:19'), 'Anuma', 'Agent flagged 1 line(s) for review:\n- Leaf No: 9999\nQuality: VERONA\n(reask)'), an(at(1, '17:19'), 'I couldn\'t confidently match "Leaf No: 9999 / Quality: VERONA / 30 M" — could you confirm the exact product name, or share a clearer photo?', { quote: { who: '+919407857310', text: '[image]' } }),
        sy(at(1, '17:20'), '**Anuma handed this over** — intake line item review · pending'), sy(at(1, '17:20'), '**System** set status to **Escalated**'), sy(at(1, '17:20'), '**System** assigned conversation to **Pankaj Rane**')] });

    // 161026-1 — the busy escalated one (rohan), churn of assign / hand-back
    const hist = []; const h = (x) => hist.push(x);
    h(opened(at(11, '10:40'), '161026-1')); h(cu(at(11, '10:41'), 'Rate kam karo bhai, bulk order hai')); h(an(at(11, '10:41'), 'Our team is looking into this and will get back to you shortly.'));
    h(sy(at(11, '10:42'), '**System** set status to **Escalated**')); h(cm(at(11, '10:42'), 'System', 'Escalated to human: Customer message needs a human: no automatic handler for this message.')); h(sy(at(11, '10:42'), '**System** assigned conversation to **Pankaj Rane**'));
    h(sy(at(11, '10:55'), '**Pankaj Rane** assigned conversation to **self**')); h(us('u-pankaj', at(11, '10:58'), 'Namaste ji, kitne meter ka order hai?')); h(cu(at(11, '11:02'), '2000 meter Calista, 4 colours'));
    h(cm(at(11, '11:04'), 'u-pankaj', 'Needs a Band A rate — checking with Neha.')); h(us('u-pankaj', at(11, '11:20'), 'Band A pe ₹212/m ho sakta hai, payment advance mein.')); h(cu(at(11, '11:25'), 'Bhai rate thoda kam karo, 205 pe do'));
    h(sy(at(11, '11:26'), '**Pankaj Rane** handed back the conversation to **Anuma**')); h(an(at(11, '11:26'), 'Our team is looking into this and will get back to you shortly.')); h(sy(at(11, '11:27'), '**System** assigned conversation to **Rohan Mehta**'));
    h(cm(at(11, '11:30'), 'u-rohan', 'Approved ₹208/m max. Do not go below.')); h(us('u-rohan', at(11, '11:34'), '₹208 pe final kar sakte hain, delivery 5 din mein.')); h(cu(at(11, '12:02'), 'No sir, not possible.'));
    h(cm(at(11, '12:05'), 'u-rohan', 'Customer declined ₹208. Following up Thursday.'));
    push({ caseNo: '161026-1', partyId: 'AC-1010', contactId: 'CT-1015', status: 'escalated', owner: 'u-rohan', unread: 0, handoffAt: at(11, '11:26'), escalatedAt: at(11, '11:26'), task: 'Answer question', slaDueAt: at(11, '11:41'), messages: hist });

    // ── closed cases ──
    // 261026-1 unknown sender
    push({ caseNo: '261026-1', phone: '+918828141788', status: 'closed', owner: 'anuma', tags: ['Unknown'],
      messages: [cu(at(1, '12:14'), 'Hi Arpita'), opened(at(1, '12:14'), '261026-1'), sy(at(1, '12:14'), '**System** added tag **Unknown**'), cm(at(1, '12:14'), 'System', 'Sender has no matching Account/Contact in this merchant\'s CRM — not engaged with order capture; told to contact the team directly.'),
        an(at(1, '12:14'), 'Thanks for reaching out to NuHome. We couldn\'t find your number in our records — please contact the team directly to get set up before placing an order.'), cu(at(1, '12:14'), 'Chinmayi here from Studio HBA mumbai'), sy(at(1, '12:14'), '**System** set status to **Closed**')] });

    // 251026-2 abandoned after product search + reviewer approval
    push({ caseNo: '251026-2', partyId: 'AC-1008', contactId: 'CT-1019', status: 'closed', owner: 'anuma',
      messages: [opened(at(2, '15:48'), '251026-2'), im(at(2, '15:48'), labelImg(['QUALITY  ' + V('ELARA', 0).label.split(' - ')[0], 'LEAF NO  35', '30 M'], '#d6cfc7', '#a98f78'), { reaction: '🏷️', label: 'Approved' }),
        tl(at(2, '15:48'), agent, 'Product Search', '— ' + V('ELARA', 0).label + ' · 100%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: V('ELARA', 0).label, conf: 100 }] }),
        an(at(2, '15:48'), `Got it — ${V('ELARA', 0).label} — 30.000 Meter added.\n\nChecking image 2 — will follow up shortly.`),
        im(at(2, '15:49'), labelImg(['LEAF NO  9999', 'QUALITY  VERONA', 'DESIGN  VERONA', 'WIDTH  140 CM', '30 M'], '#cfd6d4', '#8aa39b'), { reaction: '❓' }),
        cm(at(2, '15:49'), 'Anuma', 'Agent flagged 1 line(s) for review:\n- Leaf No: 9999\nQuality: VERONA\nDesign: VERONA\nWidth: 140 CM\n3 (reask)'),
        an(at(2, '15:49'), 'I couldn\'t confidently match "Leaf No: 9999 / Quality: VERONA / Design: VERONA / Width: 140 CM / 30 M" — could you confirm the exact product name, or share a clearer photo?', { quote: { who: '+919428046231', text: '[image]' } }),
        cm(at(1, '16:00'), 'Anuma', 'Resolution summary — enquiry #187: Abandoned — no resolution.\n1. ' + V('ELARA', 0).label + ' — 30.000 Meter\n2. Leaf No: 9999 — OPEN ITEM (reask)\n1 line(s) left unresolved at close.'),
        sy(at(1, '16:00'), '**System** set status to **Closed**'), cm(at(0, '11:24'), 'u-pankaj', '[Anuma] Attached variant ' + V('ELARA', 1).label + ' to Enquiry Line #726.')] });

    // 161026-4 converted order
    const f4 = orderFlow({ d: 11, hm: '14:02', caseNo: '161026-4', items: [['DAMASK', 1, 12, 'Roll']], draft: 164, phone: '+918862073341' });
    push({ caseNo: '161026-4', partyId: 'AC-1003', phone: '+918862073341', status: 'closed', owner: 'anuma', messages: f4.messages, lines: f4.lines, draftNo: 'DRF-1144' });

    // 211026-3 failed match
    push({ caseNo: '211026-3', partyId: 'AC-1006', contactId: 'CT-1040', status: 'closed', owner: 'anuma',
      messages: [opened(at(6, '10:21'), '211026-3'), im(at(6, '10:21'), labelImg(['LEAF NO  99', 'QUALITY  ZYRA', '30 M'], '#d8d2cc', '#a8937c'), { reaction: '❓' }), cm(at(6, '10:22'), 'Anuma', 'Agent flagged 1 line(s) for review:\n- Leaf No: 99\nQuality: ZYRA\n(reask)'),
        an(at(6, '10:22'), 'I couldn\'t confidently match "Leaf No: 99 Quality: ZYRA 30 M" — could you confirm the exact product name, or share a clearer photo?', { quote: { who: '+919203801265', text: '[image]' } }), sy(at(5, '10:30'), '**System** set status to **Closed**')] });

    push({ caseNo: '211026-1', phone: '+918591106622', status: 'closed', owner: 'anuma', tags: ['Unknown'],
      messages: [opened(at(6, '09:12'), '211026-1'), cu(at(6, '09:12'), '[image]'), sy(at(6, '09:12'), '**System** added tag **Unknown**'), an(at(6, '09:12'), 'Thanks for reaching out to NuHome. We couldn\'t find your number in our records — please contact the team directly to get set up before placing an order.'), sy(at(6, '09:12'), '**System** set status to **Closed**')] });

    push({ caseNo: '191026-2', partyId: 'AC-1007', contactId: 'CT-1026', status: 'closed', owner: 'anuma',
      messages: [opened(at(8, '16:40'), '191026-2'), im(at(8, '16:40'), labelImg(['LEAF NO  81', 'WINGS', '12 M'], '#d8d6cf', '#a6a28a'), { reaction: '❓', label: 'Expired' }), cm(at(8, '16:41'), 'Anuma', 'Agent flagged 1 line(s) for review:\n- Leaf No: 81\n(no_product_entries)'), an(at(8, '16:41'), 'I couldn\'t confidently match "Leaf No: 81 WINGS" — could you confirm the exact product name, or share a clearer photo?', { quote: { who: '+919314111708', text: '[image]' } }),
        cm(at(7, '16:45'), 'System', 'Line(s) 674 removed from the enquiry: rejected in review by pankaj.rane@demo-merchant.example (Image not recognised). The customer is not asked about them.'), sy(at(7, '16:45'), '**System** set status to **Closed**')] });

    push({ caseNo: '131026-3', partyId: 'AC-1007', contactId: 'CT-1063', status: 'closed', owner: 'anuma', messages: [opened(at(14, '13:30'), '131026-3'), cu(at(14, '13:31'), 'Kya Elara 20 meter mil jayega?'), an(at(14, '13:31'), 'Our team is looking into this and will get back to you shortly.'), sy(at(14, '13:32'), '**System** set status to **Closed**')] });
    push({ caseNo: '101026-2', partyId: 'AC-1011', contactId: 'CT-1032', status: 'closed', owner: 'anuma', messages: [opened(at(17, '11:05'), '101026-2'), cu(at(17, '11:05'), 'Heyyy?'), an(at(17, '11:05'), 'Hi! Thanks for reaching out to NuHome. Send us a photo or the product name (and quantity) to place an order, and we\'ll take it from there.'), sy(at(17, '11:30'), '**System** set status to **Closed**')] });
    push({ caseNo: '091026-2', partyId: 'AC-1002', contactId: 'CT-1002', status: 'closed', owner: 'anuma', messages: [opened(at(18, '17:20'), '091026-2'), cu(at(18, '17:20'), 'Maine sabse last mein kya order kiya tha?'), an(at(18, '17:20'), 'Our team is looking into this and will get back to you shortly.'), sy(at(18, '17:50'), '**System** set status to **Closed**')] });
    push({ caseNo: '091026-8', phone: '+919850509044', status: 'closed', owner: 'anuma', tags: ['Unknown'], messages: [opened(at(18, '12:10'), '091026-8'), cu(at(18, '12:10'), 'Hello, is this the fabric dealer?'), sy(at(18, '12:10'), '**System** added tag **Unknown**'), an(at(18, '12:10'), 'Thanks for reaching out to NuHome. We couldn\'t find your number in our records — please contact the team directly to get set up before placing an order.'), sy(at(18, '12:12'), '**System** set status to **Closed**')] });
    push({ caseNo: '091026-6', partyId: 'AC-1006', contactId: 'CT-1060', status: 'closed', owner: 'anuma', messages: [opened(at(18, '10:02'), '091026-6'), im(at(18, '10:02'), labelImg(['TWILL 09', 'NH 3024 / 03'], '#d6d3cd', '#9c9382')), an(at(18, '10:03'), 'Checking a few items — will follow up shortly. Could you also share the Sr No for "TWILL 09 - NH 3024 / 03"?'), sy(at(17, '10:30'), '**System** set status to **Closed**')] });
    push({ caseNo: '051026-4', partyId: 'AC-1008', contactId: 'CT-1061', status: 'closed', owner: 'anuma', messages: [opened(at(22, '15:00'), '051026-4'), cu(at(22, '15:01'), 'Verona 10m chahiye'), an(at(21, '10:00'), 'Just checking in — you still have Quality: Verona 10m on your enquiry. Should I go ahead and confirm it?'), sy(at(20, '10:00'), '**System** set status to **Closed**')] });
    push({ caseNo: '061026-3', partyId: 'AC-1010', contactId: 'CT-1044', status: 'closed', owner: 'anuma', messages: [opened(at(21, '12:40'), '061026-3'), cu(at(21, '12:40'), 'VERONA 31 SRNO 41'), an(at(21, '12:41'), 'Checking a few items — will follow up shortly. Could you also share the "VERONA 31 SRNO"?'), sy(at(20, '12:40'), '**System** set status to **Closed**')] });
    push({ caseNo: '250926-2', partyId: 'AC-1002', contactId: 'CT-1002', status: 'closed', owner: 'anuma', messages: [opened(at(32, '14:00'), '250926-2'), cu(at(32, '14:01'), 'Verona 33 ka rate?'), an(at(31, '10:00'), 'Just checking in — still waiting to hear back on Verona 33.'), sy(at(30, '10:00'), '**System** set status to **Closed**')] });
    push({ caseNo: '120926-1', partyId: 'AC-1003', phone: '+918862073341', status: 'closed', owner: 'anuma', messages: [opened(at(45, '09:30'), '120926-1'), im(at(45, '09:30'), swatchImg('#c9a98b')), an(at(45, '09:30'), 'Got it — give me a moment to look at that image, I\'ll get right back to you.'), sy(at(44, '09:30'), '**System** set status to **Closed**')] });
    push({ caseNo: '060926-6', partyId: 'AC-1009', phone: '+919339366863', status: 'closed', owner: 'anuma', messages: [opened(at(51, '16:10'), '060926-6'), cu(at(51, '16:11'), 'Calista 18 blue 15 roll'), an(at(51, '16:11'), `Please confirm your order:\n1. ${V('CALISTA', 0).label} — 15.000 Roll`, { buttons: ['Confirm', 'Edit', 'Cancel'] }), cu(at(51, '16:12'), 'Confirm', { reaction: '✅', quote: { who: 'Anuma', text: 'Please confirm your order:' } }), an(at(51, '16:12'), 'Thanks — your order is confirmed. Our team will take it from here.'), sy(at(51, '16:12'), '**System** closed — **Intake enquiry converted → DraftOrder #151**', 'System closed — Intake enquiry converted → DraftOrder #151')] });
    // email / phone call layout
    push({ caseNo: '060926-4', channel: 'email', phone: '+912269539631', name: '+912269539631', status: 'closed', owner: 'anuma', tags: ['Returning Customer'],
      messages: [opened(at(51, '14:37'), '060926-4'), { id: mid(), from: 'customer', type: 'call', at: at(51, '14:37'), subject: 'Phone call', seconds: 74, turns: [{ who: 'agent', text: 'Namaste! I\'m NuHome\'s concierge. This call may be recorded for quality and training purposes. How can I help you today?' }, { who: 'customer', text: 'Your verification code is 179… sorry, wrong number.' }, { who: 'agent', text: 'No problem. Have a good day!' }] }, sy(at(51, '14:40'), '**System** set status to **Closed**')] });

    // + the numbered check: order flow with human review (richer closed example, 211026-2 style)
    const f7 = orderFlow({ d: 3, hm: '11:02', caseNo: '241026-1', items: [['AMARA', 0, 30, 'Meter'], ['CAMEO', 0, 20, 'Roll']], hitl: true, human: 'u-pankaj', humanName: 'Pankaj Rane', draft: 171, phone: '+919860367599' });
    push({ caseNo: '241026-1', partyId: 'AC-1028', contactId: 'CT-1028', status: 'closed', owner: 'anuma', messages: f7.messages, lines: f7.lines, draftNo: 'DRF-1150' });

    // sort & fix: assign Rohan owned flags + numbers
    threads.forEach((t) => { if (t.partyId === 'AC-1016' || t.partyId === 'AC-1003') t.numberId = NUM2; });
    return threads;
  };

  /* ═══════════════════════════ STUFFCOOL ═══════════════════════════ */
  const stuffcool = () => {
    const { P, C, V } = seedFor('stuffcool'); let n = 0; const threads = []; const agent = 'Order Desk';
    const push = (t) => { t.id = 't-' + (++n); t.numberId = 'wa-1'; finish(t); threads.push(t); return t; };
    const hello = 'Hi! Thanks for reaching out to Stuffcool. Tell us what you need — product name and quantity — and we\'ll take it from there.';
    const confirm = (a, lines) => an(a, 'Please confirm your order:\n' + lines.map((l, i) => `${i + 1}. ${l}`).join('\n'), { buttons: ['Confirm', 'Edit', 'Cancel'] });

    push({ caseNo: '1009', partyId: 'AC-1001', phone: '+918879270989', status: 'open', owner: 'anuma', unread: 2, slaDueAt: at(0, '17:35'), noSummary: true, tags: [],
      messages: [opened(at(0, '16:07'), '1009', 'stuffcool'), an(at(0, '16:07'), hello), cu(at(0, '16:08'), 'Hi'), cu(at(0, '16:08'), 'Ho')] });
    push({ caseNo: '1008', partyId: 'AC-1002', contactId: 'CT-1014', phone: '+917021844365', status: 'open', owner: 'u-rohan', unread: 0, slaDueAt: at(0, '17:10'), tags: ['spam'], handoffAt: at(0, '15:50'), task: 'Confirm product',
      messages: [opened(at(0, '15:44'), '1008', 'stuffcool'), { id: mid(), from: 'customer', type: 'file', at: at(0, '15:44'), name: 'media-1590393192842890', size: '46 KB' },
        tl(at(0, '15:44'), agent, 'Document Analysis', '', { head: 'What Order Desk read', sub: '1 document · Today', label: 'Read from the document', value: 'Purchase order — 12 line items, total ₹58,400' }), sy(at(0, '15:50'), '**System** set status to **Escalated**'), sy(at(0, '15:50'), '**System** assigned conversation to **Rohan Mehta**'), sy(at(0, '15:52'), '**Rohan Mehta** set status to **Open**')] });
    push({ caseNo: '1012', partyId: 'AC-1009', contactId: 'CT-1021', status: 'open', owner: 'anuma', unread: 1, slaDueAt: at(0, '19:15'), draftNo: null,
      lines: [{ id: 'l1', label: V('sc010', 0).label, variantId: V('sc010', 0).variantId, qty: 50, unit: 'Pcs', state: 'ok' }],
      messages: [opened(at(0, '14:10'), '1012', 'stuffcool'), cu(at(0, '14:11'), 'Bhai 20W charger chahiye white wala, 50 pcs'),
        tl(at(0, '14:11'), agent, 'Product Search', '— ' + V('sc010', 0).label + ' · 96%', { head: 'Product match', sub: '1 product', label: 'Matched in the catalogue', lines: [{ name: V('sc010', 0).label, conf: 96 }] }),
        an(at(0, '14:11'), `Got it — here's what I have so far:\n1. ${V('sc010', 0).label} — 50.000 Pcs\nAnything else to add?`), cu(at(0, '14:30'), 'aur 100 pcs type c cable bhi'), cu(at(0, '14:31'), 'pink color')] });
    push({ caseNo: '1011', partyId: 'AC-1010', contactId: 'CT-1026', status: 'escalated', owner: 'u-rohan', unread: 0, handoffAt: at(0, '13:20'), escalatedAt: at(0, '13:20'), task: 'Answer question', slaDueAt: at(0, '13:35'),
      messages: [opened(at(0, '13:18'), '1011', 'stuffcool'), cu(at(0, '13:19'), 'Dealer price band kya hai mere liye? Band B ya C?'), an(at(0, '13:19'), 'Our team is looking into this and will get back to you shortly.'), sy(at(0, '13:20'), '**System** set status to **Escalated**'), cm(at(0, '13:20'), 'System', 'Customer asked something the agent can\'t resolve on its own — needs a human reply:\n- "Dealer price band kya hai mere liye? Band B ya C?"'), sy(at(0, '13:20'), '**System** assigned conversation to **Rohan Mehta**')] });
    push({ caseNo: '1010', partyId: 'AC-1013', contactId: 'CT-1004', status: 'open', owner: 'u-rohan', unread: 0, slaDueAt: at(0, '21:30'),
      messages: [opened(at(0, '11:40'), '1010', 'stuffcool'), cu(at(0, '11:41'), 'Diwali scheme ka pdf bhejna'), an(at(0, '11:41'), 'Our team is looking into this and will get back to you shortly.'), sy(at(0, '11:42'), '**System** assigned conversation to **Rohan Mehta**'), us('u-rohan', at(0, '11:55'), 'Namaste! Diwali scheme ka PDF bhej diya hai, 10% extra on 100+ pcs.'), cu(at(0, '12:02'), 'Thanks 🙏')] });
    push({ caseNo: '1007', partyId: 'AC-1003', phone: '+919136602278', status: 'closed', owner: 'anuma', tags: ['chitchat'],
      messages: [opened(at(3, '18:02'), '1007', 'stuffcool'), cu(at(3, '18:02'), '😂'), im(at(3, '18:02'), boxImg('#6b7280', 'meme'), { reaction: '👀' }), an(at(3, '18:02'), 'Could you tell me a bit more — what\'s the occasion, and roughly how many units are you thinking?'), an(at(3, '18:03'), 'Could you tell me a bit more — what\'s the occasion, and roughly how many units are you thinking?'), sy(at(3, '18:03'), '**System** added tag **chitchat**'), sy(at(2, '18:30'), '**System** set status to **Closed**')].filter((m) => m.type !== 'image') });
    const vn = V('sc012', 0), v2 = V('sc020', 0);
    push({ caseNo: '1006', partyId: 'AC-1011', contactId: 'CT-1020', status: 'closed', owner: 'anuma', draftNo: 'DRF-36',
      lines: [{ id: 'l1', label: vn.label, variantId: vn.variantId, qty: 20, unit: 'Pcs', state: 'ok' }, { id: 'l2', label: v2.label, variantId: v2.variantId, qty: 10, unit: 'Pcs', state: 'ok' }],
      messages: [opened(at(5, '16:12'), '1006', 'stuffcool'), au(at(5, '16:12'), 19, 'bhai 20 pcs 65W GaN charger green aur 10 pcs type c lightning cable grey bhej dena'),
        tl(at(5, '16:12'), agent, 'Audio Transcription', '', { head: 'What Order Desk read', sub: '1 voice note', label: 'Read from the voice note', value: '"bhai 20 pcs 65W GaN charger green aur 10 pcs type c lightning cable grey bhej dena"' }),
        tl(at(5, '16:12'), agent, 'Product Search', '— ' + vn.label + ' · 94%', { head: 'Product match', sub: '2 products', label: 'Matched in the catalogue', lines: [{ name: vn.label, conf: 94 }, { name: v2.label, conf: 91 }] }),
        an(at(5, '16:12'), `Got it — here's what I have so far:\n1. ${vn.label} — 20.000 Pcs\n2. ${v2.label} — 10.000 Pcs\nAnything else to add?`), cu(at(5, '16:13'), 'no'), confirm(at(5, '16:13'), [`${vn.label} — 20.000 Pcs`, `${v2.label} — 10.000 Pcs`]),
        cu(at(5, '16:14'), 'Confirm', { reaction: '✅', quote: { who: 'Order Desk', text: 'Please confirm your order:' } }), cm(at(5, '16:14'), 'Anuma', 'Resolution summary — enquiry #212: Converted to Draft #36.'), sy(at(5, '16:14'), '**System** closed — **Intake enquiry converted → DraftOrder #36**', 'System closed — Intake enquiry converted → DraftOrder #36'),
        an(at(5, '16:14'), 'Thanks — your order is confirmed. Our team will take it from here.')] });
    push({ caseNo: '1005', partyId: 'AC-1004', phone: '+918105533714', contactId: 'CT-1009', status: 'closed', owner: 'anuma', tags: [],
      messages: [opened(at(7, '15:24'), '1005', 'stuffcool'), im(at(7, '15:24'), boxImg('#334155', 'unclear'), { reaction: '👀' }), tl(at(7, '15:24'), 'Intake Agent', 'Image Analysis', '', { head: 'What Intake Agent read', sub: '1 photograph', label: 'Read from the image', value: 'Unable to read the details clearly' }),
        an(at(7, '15:24'), 'Hey! Thanks for sharing that 😊 I can see an image but I\'m not quite able to make out the details clearly - could you let me know what this is about and what you\'d like us to do for you (quote, product info, etc.)?'), sy(at(6, '15:30'), '**System** set status to **Closed**')] });
    push({ caseNo: '1004', partyId: 'AC-1012', contactId: 'CT-1005', status: 'closed', owner: 'anuma', tags: ['chitchat'],
      messages: [opened(at(9, '12:20'), '1004', 'stuffcool'), cu(at(9, '12:20'), 'Orbit PO PBKLICK10 MAGSAFE 30PCS'), sy(at(9, '12:21'), '**System** re-opened the conversation', 'Orbit Communication re-opened the conversation'), sy(at(9, '12:21'), '**System** assigned conversation to **AI**'), an(at(9, '12:21'), 'Could you tell me a bit more — what\'s the occasion, and roughly how many units are you thinking?'), sy(at(8, '12:30'), '**System** added tag **chitchat**'), sy(at(8, '12:30'), '**System** set status to **Closed**')] });
    push({ caseNo: '1003', partyId: 'AC-1013', contactId: 'CT-1034', status: 'closed', owner: 'anuma', draftNo: 'DRF-35',
      messages: [opened(at(12, '10:05'), '1003', 'stuffcool'), cu(at(12, '10:05'), 'Neckband blue 40 pcs'), an(at(12, '10:05'), `Please confirm your order:\n1. ${V('sc026', 0).label} — 40.000 Pcs`, { buttons: ['Confirm', 'Edit', 'Cancel'] }), cu(at(12, '10:06'), 'Confirm', { reaction: '✅', quote: { who: 'Order Desk', text: 'Please confirm your order:' } }), sy(at(12, '10:06'), '**System** closed — **Intake enquiry converted → DraftOrder #35**', 'System closed — Intake enquiry converted → DraftOrder #35'), an(at(12, '10:06'), 'Thanks — your order is confirmed. Our team will take it from here.')] });
    push({ caseNo: '1002', partyId: 'AC-1014', phone: '+919447205139', status: 'closed', owner: 'anuma', tags: ['Unknown'], messages: [opened(at(15, '09:10'), '1002', 'stuffcool'), cu(at(15, '09:10'), 'Stuffcool dealer kaise bane?'), an(at(15, '09:10'), 'Our team is looking into this and will get back to you shortly.'), sy(at(14, '09:30'), '**System** set status to **Closed**')] });
    push({ caseNo: '1001', partyId: 'AC-1016', phone: '+919176639455', status: 'closed', owner: 'anuma', messages: [opened(at(20, '14:00'), '1001', 'stuffcool'), cu(at(20, '14:00'), 'Cable ka rate?'), an(at(19, '10:00'), 'Just checking in — still waiting to hear back on your cable enquiry.'), sy(at(18, '10:00'), '**System** set status to **Closed**')] });
    return threads;
  };

  const TEMPLATES = {
    newhome: [{ id: 'tp-1', name: 'Curated Options Tpl', text: 'Hi {{1}}, here are the options we prepared based on our discussion: {{2}} Just reply with the option number ({{3}}) and I\'ll process it right away.' }],
    stuffcool: [{ id: 'tp-1', name: 'Order Update Tpl', text: 'Hi {{1}}, an update on your order {{2}}: {{3}}. Reply here if you need anything changed.' }, { id: 'tp-2', name: 'Catalogue Share Tpl', text: 'Hi {{1}}, here is our latest dealer catalogue: {{2}}. Tell us the models and quantities and we will place the order for you.' }],
  };
  const NUMBERS = {
    newhome: [{ id: 'wa-1', label: '+917391914040', provider: '360dialog' }, { id: 'wa-2', label: '+91 22 6998 5635', provider: '360dialog' }],
    stuffcool: [{ id: 'wa-1', label: '+918879691427', provider: '360dialog' }],
  };

  // seeds are registered after base data loads; guard for either order
  const build = () => {
    ['newhome', 'stuffcool'].forEach((uc) => {
      const threads = uc === 'newhome' ? newhome() : stuffcool();
      threads.sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
      DM.data(uc, 'numbers', NUMBERS[uc]); DM.data(uc, 'templates', TEMPLATES[uc]); DM.data(uc, 'threads', threads); DM.data(uc, 'aiSummaries', {});
    });
  };
  build();
})();
