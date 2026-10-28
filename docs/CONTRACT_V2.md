# CONTRACT V2 — strict replica rebuild (supersedes docs/CONTRACT.md where they differ)

The user's brief (final): the demo is a **mirror image of the live merchants.anuma.run tenants**, built tab by tab from `docs/spec/*.md` (read the ones for your surface fully; spec files are the source of truth, `docs/LIVE_DESIGN.md` is the older summary). Three use cases, one merchant ("Demo Merchant User"). **Be strict: only what exists in the live tenants. Remove everything else.**

## Use cases (labels exactly as shown in the header switcher)
| key | label | live source | rail (NAVIGATE → WORKSPACE) |
|---|---|---|---|
| `newhome` | **NewHome use case** — subtitle "Orders to Coral" | NuHome tenant | Home, Inbox, Orders, CRM, Products → Agents, Workflows, Channels, Apps, Logs, Settings |
| `stuffcool` | **Stuffcool use case** — subtitle "Inbox to Tally" | Stuffcool tenant (+ Workflows, − Campaigns, per the user) | Dashboard, Inbox, Draft Orders, CRM, Products → Agents, Workflows, Channels, Merchant Apps, Logs, Settings |
| `rfq` | **Access use case** — subtitle "RFQs" | Axis India tenant (no Inbox, no Orders) | Home, RFQs, CRM, Products → Agents, Workflows, Channels, Merchant Apps, Logs, Settings |
Settings popover (all): Company, Navigation, Humans, Rulebook, Usage. Org name in the shell = **Demo Merchant User** (single org). Always write **Coral** / **Coral ERP**, never "Coralio". Design language for ALL three = Mira (docs/spec/shell-home.md §1 and css/app.css tokens): Newhome is pixel-exact; Access/Stuffcool keep their own structure but are re-skinned to the same language (the live ones are older design — the demo is not).

## Removed (delete code + seed, no leftovers)
Deals/Leads, Quotes, Campaigns (+lists), Fulfilment/Shipping, Reports, Insights, Production, Packaging, Governance, Getting-started wizard, confirmed-Orders list & ERP sync-log tab (live NuHome "Orders" = the draft-orders page at `/orders/drafts`), hosted quote/stock pages, Personal/Templates/Tax/Shipping/Invoices settings pages (unless a spec says reachable), rate card. The three use cases must not reference them.

## Routes (hash routes `#/…`, same paths as live)
`/dashboard` (Home/Dashboard), `/inbox/threads?case=<id>`, `/orders/drafts`, `/orders/drafts/:id` (live opens an 800px drawer from the list; keep a route that opens that drawer), `/orders/rfqs`, `/orders/rfqs/:id`, `/crm/accounts`, `/crm/accounts/:id` (drawer), `/crm/contacts`, `/crm/contacts/:id`, `/products`, `/products/:id` (drawer), `/agents`, `/agents/:id/:tab` (overview|training|test|activity), `/workflows`, `/workflows/:id`, `/settings/channels`, `/settings/integrations`, `/settings/integrations/:slug`, `/settings/logs`, `/settings/organisation|navigation|users|rulebook|usage`, `/notifications`. Ask Anuma = right sheet from the chat icon (not a route).

## Shared ID conventions (so seeds from different authors line up)
- users: `u-<firstname lowercase>` (e.g. `u-rohan`); the signed-in persona is **Rohan Mehta** (`u-rohan`, Admin).
- parties (CRM accounts): id = number, `AC-1001…`; contacts: `CT-1001…`, field `partyId`.
- products: **styles** `S.styles[]` = `{id:'st-<code>', code, sr, category, status, variants:[{id:'v-<code>-<n>', …}]}`; order/RFQ/draft lines reference `variantId` (and `styleId`). (Axis/Stuffcool products also modelled as styles with variants — see spec/crm-products.md "data patterns".) A flat `S.products` is NOT used any more.
- threads (Inbox cases): id `t-<n>`, case number field `caseNo` like `271026-1` (DDMMYY-seq); `partyId`/`contactId` optional (unknown numbers have none); numbers (WhatsApp senders) in `S.channels`.
- drafts (the live "Orders"/"Draft Orders"): id `d-<n>`, number `DRF-1144`; rfqs: id `rfq-<n>`; agents: slug ids (`anuma`, …); workflows `wf-<n>`; apps by slug (`coral-erp`, `tally`, `sap`, …); logs `lg-<n>`; notifications `nt-<n>`.
- Dates ISO, "today" = **2026-10-27**, local clock IST; money INR numbers.

## State keys (DM.S.<key>) and OWNER of each seed (all three use cases per owner)
| key | shape source | seed owner |
|---|---|---|
| `plan`, `roles`, `invites`, `navModules`, `rulebook`, `playbooks`, `limits`, `usage` | spec/settings.md | settings fork → `data/seed-settings.js` |
| `company`, `users` (≥12 per UC, Admin Rohan Mehta + ASM/Sales people with photo names), `parties`, `contacts`, `styles`, `categories` | spec/crm-products.md + spec/settings.md (Humans/Company shapes) | base-data fork → `data/base-newhome.js`, `data/base-stuffcool.js`, `data/base-rfq.js` |
| `channels`, `numbers`, `apps`, `erpLog`, `logs` | spec/workspace.md + shell-home §4 | integrations fork → `data/seed-integrations.js` |
| `agents`, `workflows` | spec/workspace.md | agents fork → `data/seed-agents.js` |
| `threads`, `templates`, `aiSummaries` | spec/inbox.md | inbox fork → `data/seed-inbox.js` |
| `drafts`, `rfqs` | spec/orders-rfqs.md | orders fork → `data/seed-orders.js` |
| `notifications`, `home`/`dash`, `askChats` | spec/shell-home.md | shell fork → `data/seed-home.js` |
Pages only read/write `DM.S`; `DM.data(uc,key,val)` registers seeds. Scenario files `data/newhome.js`, `data/stuffcool.js`, `data/rfq.js` hold ONLY `DM.defineUC(...)` + steps (written in the last wave, after seeds exist). Do not create new top-level keys without telling the owner's spec; UI-only state goes in `DM.ui.<module>`.

## Rules for everyone
- Fake data only (no real names/numbers from the live tenants); fake people photos via `DM.avatar` (rounded-lg), fake product/fabric images as generated SVG data URIs. Data must *feel* live-sized: realistic counts (CRM 30–60 parties visible, 25-per-page paging works; Products 40+ styles), consistent numbering, Indian names/cities/GSTINs, plausible timestamps relative to 27 Oct 2026.
- First/name columns follow the spec (weights, mono click-to-copy numbers, badges); sizes 12px base, 28px controls, AG Grid tables via `DM.table` (extend core only via the shell fork).
- Menus/selects = shadcn "mira" (`DM.menu`); dialogs/sheets like live (overlay black/40, 100–150ms enter); motion per spec §5 (os-enter 6px rise, 100ms popover zoom, shimmer skeletons, count-ups).
- Every control that exists live must work in the demo against `DM.S` (dropdowns filter/sort for real, tabs switch, dialogs save, toasts confirm). Things the live app marks disabled/inert stay disabled with the same tooltip.
- Zero console errors in all 3 use cases; replay scenario steps via the header player. No commits (lead commits).

---
## Shell helper API (written by the shell fork — js/core.js, js/ui.js, js/shell.js)
Files: `index.html` loads core.js → ui.js → shell.js → scenario files → seeds → pages. Pages register with `DM.page(pattern, {title, render({params,q}), after(root,{params,q})})`; interactions via `data-act`/`DM.act`, `data-go`, `data-input`/`DM.input`.

**Tables** — `DM.table(cols, rows, opts)` (AG Grid, live look). col: `{k,label,w|flex,minW,num,mono(click-to-copy number),bold(500 first text col),muted,sortable,sort:'asc',render(row)->html,text(row)->string,filter:false | {tip} (disabled funnel w/ tooltip; default tip "This filter isn't wired up yet.") | {menu:{label,title,items:[{label,value}],value},onChange(value)}}`. opts: `{id, go(row)->path, click:'act'(data-arg=row[idKey]), idKey, rowCls(row), footer:'parties'|false, pageSize:50, fill:true|false, offset:px, rowHeight, hidden:[keys], cls, empty:{icon,title,sub}, onRow(row,ev)}`. Footer = "N parties in view" + "50 / page ▾ 1–50 of N ‹ ›" (25/50/100). Only columns with `sortable` sort (live: just the first text column). Rows ≥12 → grid fills viewport (`fill`), else auto height. `DM.grid(id)` → `{api,cols,st,rows}`; `DM.colsBtn(gridId, nOff)` + `DM.colsMenu` ("Columns · N off" menu toggles real columns); first visit shows a 400ms shimmer skeleton.
**Layout bits** — `DM.toolbar(left,right)`, `DM.viewBtn(label,act)` (grid icon + chevron), `DM.searchGroup(inputId, placeholder, value)` (288×28), `DM.seg(items,cur,act,{chips})` (segmented tablist; items `{key,label,count,icon}`), `DM.statCard(label,value,sub,icon,{tile:'left'|'right',count:n,fmt,delta:{dir,text,tone},divider:false})` (live anatomy; `tile:'right'` = CRM style), `DM.status(label,tone)` (outline pill + dot: green|amber|red|blue|grey), `DM.mono(text)`, `DM.empty(icon,title,sub,{action,style})`, `DM.icoTile(icon)`, `DM.skel/DM.skelRows` (shimmer), `DM.cnt(n,fmt,key)` (count-up span), `DM.changedRows(key,rows,sigFn)` (ids new/changed since last render), `DM.caseNo(thread)`.
**Overlays** — `DM.sheet({id,w:800|384|404,title,sub,tabs,tab,tabAct,body,footer,headerExtra,scrim:false,onClose,onMount})` right sheet 12px from edges radius 10 + black/45 scrim, slide .2s; `DM.closeSheet(id)`, `DM.sheetBody(sheetEl,html)` (cross-fades tab body); `DM.dialog({title,sub,body,actions:[{label,cls,run(el)->false keeps open}],w})` (centred, radius 14); `DM.menu(anchor,items,{w,right,up,match,onClose})` items `{label,icon,hint,check,danger,disabled,run}|{heading}|{sep:true}|{custom:html}`; native `<select>` auto-upgrades to it; `DM.calendar(anchor,{value:'YYYY-MM-DD',max,onPick})`; `DM.toast(msg,icon)`; `DM.copy(text)`; `DM.avatar(name,cls,{org})` (photo rounded-lg; `cls` sm=24 lg=40 xl=56; orgs/numbers → initials tile); `DM.notif.row(n)`, `DM.notif.typeOf(n)`.
**Shell** — `DM.NAV` (getter, per use case; honours `DM.S.navHidden:[keys]` for Settings→Navigation toggles; keys: dashboard,inbox,orders,rfqs,crm,products), `DM.navLabel(key)` (rail label per UC, e.g. orders → 'Orders'|'Draft Orders'), `DM.shell.allowed(path)`, `DM.shell.refresh()` (re-render header), `DM.now()` (demo clock = 27 Oct 2026 17:30 IST, or the current step's `at` HH:MM), `DM.TODAY`, `DM.dayOf(iso)` (IST day), `DM.ask` (Ask sheet state). Org name constant 'Demo Merchant User'; persona Rohan Mehta (`u-rohan`).
**Motion** — `data-rid="id"` (new items flash+rise after scenario steps), `data-count="n" data-fmt data-ck` (count-up), `.stagger` (children enter in sequence), `.msg-new`, `.row-new`, `.typing`, `.shimmer`, `.pg-enter` (page rise 6px). Keyframes: os-enter, os-fade, anuma-rise, pop-in, slide-r, typing-wave, badge-pop, tw-shimmer.

## Field expectations the shell reads (owners please seed these)
- **threads**: `status` ('open'|'escalated'|'hold'|'closed'), `owner` ('anuma'|user id), `handoffAt` (ISO; start of the 15-min SLA; fallback `escalatedAt`, `lastAt`), `task` ('Confirm product'|'Answer question'; fallback: unresolved review card ⇒ Confirm product), `escalatedAt`, `partyId`/`contactId`/`name`/`phone`, `caseNo`, `lastAt`, `messages[].{from,at}` (ISO `at` lets Home compute reply times; `from:'customer'|'anuma'|<user id>`).
- **users/parties ownership**: make Rohan Mehta (`u-rohan`) own ≥6 parties and be owner/assignee of ≥3 open cases and ≥2 drafts so Home's default "Yours" view is not empty.
- **drafts**: `createdAt` ISO, `status`, `partyId`, `lines[].{name,style?,qty,unit}`; ≥4 created on 2026-10-27 (NewHome) so "Today" has numbers; Stuffcool: ≥3 `pending` drafts older than 4h.
- **logs** (Deal timeline + /settings/logs): `{id, at(ISO), actor, title, entity?, verb?:'created'|'updated'|'deleted', chip?:'logged'|'auto-drafted'|'confirmed'|'failed'|'blocked'|'sent', event?:'line_confirmed'|…, href?}`; newest first by `at`. Scenario steps may push rows (`S.logs.unshift`) and the timeline re-renders with a flash.
- **notifications** are derived in `data/seed-home.js` from seeded threads (needs `threads` seeded before it — index.html order already guarantees); scenario `notifies` (engine) append rows `{type,title,account,caseNo,preview,at}` (legacy `{subject,body,from}` still renders).
