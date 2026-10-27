# Demo Merchant User — build contract

Static HTML/CSS/JS, **no build step, no backend, no frameworks** (vanilla JS + inline SVG). Open `index.html` (or `python3 -m http.server`). It replicates the Anuma merchant admin (merchants.anuma.run, "newhome" design = `src/app-v2` + `src/app/proto` in https://github.com/build-iterator/anuma-merchant-app, cloned at `SRC` below) with one merchant, **Demo Merchant User**, and three switchable use cases in the right-hand Scenarios panel:

| key | use case | story |
|---|---|---|
| `rfq` | **Access Electricals — RFQ** | Electrical-supplies distributor. Contractors email/WhatsApp RFQs (PDF/Excel/text) → Anuma parses lines, matches to catalogue, flags unmatched → quote with margin rules/approval → sent → order |
| `stuffcool` | **Stuffcool — B2B catalog → Tally** | Phone-accessories brand selling to dealers. Catalogue + dealer price bands published as hosted stock sheet; dealers order; confirmed orders sync as sales vouchers into **Tally** |
| `newhome` | **NewHome — orders → Coralio API** | Curtain-fabric maker (NuHome). Dealers order on WhatsApp (text, photo of swatch, voice); Anuma reads, matches, hands low-confidence lines to the ASM (HITL), confirmed orders are posted to the **Coralio API** |

Everything is mock data, but **every link, button, form, filter, tab, toggle, modal must work** against in-memory state (`DM.S`). Nothing may be a dead `href="#"` or a no-op. If an action has no meaningful effect, it still gives feedback (toast) and mutates state where sensible (e.g. approving a draft changes its status and the sidebar badge).

`SRC` = `/private/tmp/claude-501/-Users-shrutisingh-Library-Application-Support-Claude-scratch-workspaces-e2ffbb60-ff60-46e1-ab2c-3501274d4040-0b23d854-6e60-4d56-b359-4f9e28721e8c-scratch-2026-10-27-91b7a2/a3b64857-d646-4634-9524-b710a65a7707/scratchpad/src` (branch `develop`). Read the real React pages for layout/columns/copy and recreate them. `src/app/proto/_fixtures/nuhome/*` has real NuHome content (journey.js is the 26-step WhatsApp order journey).

Design tokens, primitives and shell are in `css/app.css` and `js/core.js` — **read both first**; do not edit them (tell the lead if something is missing). Add page-specific CSS in a `<style>` string injected by your own page file (`DM.css('...')` is NOT provided — create one `<style data-for="yourfile">` in `document.head` at load).

## Files & ownership
`data/<uc>.js` (one per use case: seed + scenario) · `pages/*.js` (one per module, see index.html script list). Each file is an IIFE. Never write to a file you don't own.

## Core API (js/core.js)
- Routing: `DM.page('/orders/rfqs/:id', { title, crumb(params)|string, render({params,q,path}) -> html string, after(viewEl,{params,q}) })`. Hash routes (`#/orders/rfqs/RFQ-1`). `DM.go(path)`, `DM.query()` → URLSearchParams, `DM.render()` re-renders current page (keeps input focus for inputs with `data-input`).
- Declarative interaction (event delegation, no inline JS): `data-act="name" data-arg="x"` → `DM.act('name', (el, ev) => {...})`; `data-go="/path"` navigates on click; `data-input="name"` → `DM.input('name', (value, el) => {...})` (fires on `input`); `data-change="name"` for selects. Prefix action names with your module (`rfq-…`) to avoid collisions. After mutating `DM.S`, call `DM.render()`.
- State: `DM.S` = live state for the active use case (deep clone of `DM.seed[uc]`; reset on use-case switch / scenario reset / scenario step jump). Pages **only read/write `DM.S.*`**, never seed. UI-only state (tab, filter text, selection) lives in `DM.ui.<module>` objects (persist across renders, survive within a use case).
- UI helpers: `DM.icon(name)` (see `DM.icons` keys), `DM.esc`, `DM.fmt.{inr,inrc,num,date,dt,ago,pct}`, `DM.avatar(name,cls)`, `DM.badge(text,tone,dot)` tones: green amber red blue violet outline, `DM.btn(label,act,{cls,arg,go,icon,attrs})`, `DM.header(titleHtml,subHtml,actionsHtml)`, `DM.stat(label,value,sub,{icon,tone})`, `DM.tabs(items,cur,act)`, `DM.pills`, `DM.switch(on,act,arg)`, `DM.searchBox(id,ph,val)`, `DM.table(cols,rows,{go,click,idKey,rowCls,empty})`, `DM.chart.{spark,bars,hbars,donut}`, `DM.field(label,name,{value,options,area,type})`, `DM.formData(el)`, `DM.modal({title,body,actions:[{label,cls,run(el)}],lg})` (`run` returning false keeps it open), `DM.confirm`, `DM.drawer`, `DM.menu(anchorEl, [{label,icon,run}])`, `DM.toast(msg,icon)`, `DM.by(arr,id)`, `DM.uid`, `DM.color`, `DM.initials`, `DM.searchProviders.push(q => [{label,sub,icon,url}])` (⌘K palette results: register parties/products/orders).
- CSS classes: see css/app.css (`.page`, `.card`, `.card.pad`, `.grid.g2/g3/g4`, `.row`, `.col`, `.grow`, `.right`, `.muted`, `.sm`, `.xs`, `.b`, `.mono`, `.btn(.outline/.ghost/.danger/.sm/.icon)`, `.badge`, `.tbl`, `.tblwrap`, `.tabs/.tab`, `.pills/.pill`, `.input/.select/.textarea`, `.field`, `.split`/`.pane`, `.listrow`, `.bub(.out/.sys)`, `.chatbg`, `.kanban/.kcol/.kcard`, `.bar`, `.kv`, `.empty`, `.fadein`, `.hl` (flash-highlight a just-changed row)). Page wrapper: `<div class="page">…</div>`; full-bleed split pages use `<div class="page-full">`.
- Nav is fixed in core (`DM.NAV`): Dashboard, Inbox `/inbox/threads`, Deals `/leads`, RFQs `/orders/rfqs`, Quotes `/quotes/all`, Orders `/orders`, Draft orders `/orders/drafts`, CRM `/crm/accounts`, Products `/products`, Campaigns `/campaigns`, Fulfilment `/fulfilment`, Reports `/reports`, Governance `/governance/policy`; Workspace: Agents `/agents`, Workflows `/workflows`, Channels `/settings/channels`, Apps `/settings/integrations`, Logs `/settings/logs`, Settings (Company, Personal, Navigation, Humans, Rulebook, Templates, Usage, Tax, Shipping, Invoices → `/settings/<key>`); plus `/notifications` (page by pages/dashboard.js), `/ask`, `/getting-started`, `/insights`, `/production`, `/packaging`, `/quotes/{approvals,all,rate-card,presentation}`, `/governance/{policy,workflows,autonomy,approvals}`. **Every one of these routes must resolve to a real page.** Route ownership is in the table below.

## Page ownership (pages/*.js)
| file | routes |
|---|---|
| dashboard.js | `/dashboard`, `/notifications`, `/ask`(+`/ask/:id`), `/getting-started`(+steps import, listen, make-sense, shipping, govern, go-live), `/insights`, `/reports`, `/production`, `/packaging`(+`/:id`) |
| inbox.js | `/inbox/threads`(+`?case=<id>` selected thread), `/inbox/channels` |
| leads.js | `/leads` (board+table), `/leads/:id` |
| quotes.js | `/quotes/approvals`, `/quotes/all`, `/quotes/:id`, `/quotes/rate-card`, `/quotes/presentation`, hosted quote `/q/:id` |
| rfqs.js | `/orders/rfqs`, `/orders/rfqs/:id` |
| orders.js | `/orders`, `/orders/:id`, `/orders/parent` |
| drafts.js | `/orders/drafts`, `/orders/drafts/:id` |
| fulfilment.js | `/fulfilment`, `/shipping` |
| crm.js | `/crm/accounts`, `/crm/accounts/:id`, `/crm/accounts/create`, `/crm/contacts`, `/crm/contacts/:id`, `/crm/contacts/new` |
| products.js | `/products`, `/products/:id`, `/products/create`, `/products/import`, hosted stock sheet `/stock/:id` |
| campaigns.js | `/campaigns` (tabs campaigns/lists/templates), `/campaigns/new`, `/campaigns/:id` |
| agents.js | `/agents`, `/agents/:id`, `/agents/:id/:tab` (overview, training, test, activity) |
| workflows.js | `/workflows`, `/workflows/:id` (visual builder canvas), `/governance/*` |
| settings.js | `/settings/organisation|personal|navigation|users|rulebook|templates|usage|taxes|shipping|invoices` |
| integrations.js | `/settings/integrations`, `/settings/integrations/:slug`, `/settings/channels`, `/settings/logs` |
| misc.js | `/` redirect → use-case home, 404 helpers, anything unclaimed |

## Use-case registration (data/<uc>.js)
```js
DM.defineUC('rfq', { short:'Access Electricals', tagline:'RFQ → quote → order', icon:'sheet', home:'/dashboard',
  about:'one-paragraph description shown before play',
  charts:[{key:'quoted', title:'Quoted value', type:'spark'|'bars', fmt:'inr'|'pct'|'min'|'num', start:0, color, wide, labels?}],
  steps:[{ id, at:'10:42', actor:'Customer'|'Anuma'|'Pankaj'|'System', title, desc, narr /*panel text*/, route:'/inbox/threads?case=T1' /*page to show*/,
           apply(S){ /* mutate DM.S.* — idempotent from a clean seed; steps are replayed from step 0 on jump */ },
           notifies:[{tab:'human'|'agent',from,subject,body,href,when}], m:{quoted:184000} /* appends a point to each chart series named by key */ }] });
DM.data('rfq','parties',[...]);  // one DM.data call per key
```
Scenario rules: 12–26 steps. Steps change **what the admin shows** (new inbox message, RFQ appears, line gets matched, draft order created, order status flips, ERP sync record appears, KPIs move). Pages must not hardcode these — read `DM.S`.

## State shapes (`DM.S.<key>`; ids are strings; money in INR rupees as numbers; dates ISO strings, use realistic recent dates around **2026-10-27**)
```
company   {name:'Demo Merchant User',legal,gstin,address,city,phone,email,website,industry,currency:'INR',logoColor}
users     [{id,name,role:'Owner'|'Admin'|'ASM'|'Sales'|'Accounts',email,phone,status:'active'|'invited',last,modules:[...]}]
parties   [{id,name,city,region,type,owner(userId),phone,email,gstin,terms,priceBand,creditLimit,outstanding,lastOrderAt,orders30d,lifetime,status:'active'|'quiet'|'blocked',tags:[]}]
contacts  [{id,partyId,name,role,phone,email,primary}]
products  [{id,sku,name,category,brand,unit,price,mrp,stock,hsn,tax,color(hex placeholder tile),status:'active'|'draft',attrs:{k:v},variants:[{id,label,sku,price,stock}],priceBands?:{A:..,B:..}}]
threads   [{id,partyId,contactId,channel:'whatsapp'|'email'|'indiamart'|'web',subject,owner:'anuma'|userId,status:'open'|'hold'|'closed',unread,preview,lastAt,priority,messages:[{id,from:'customer'|'anuma'|userId|'system',type:'text'|'image'|'voice'|'file'|'card',text,at,meta?}],dealId?,rfqId?,draftId?,orderId?,note?}]
leads     [{id,title,partyId,stage:'New'|'Qualified'|'Quoted'|'Negotiation'|'Won'|'Lost',value,owner,source,createdAt,closeAt,rfqId?,notes}]
rfqs      [{id,no,partyId,contactId,source:{type:'email'|'whatsapp'|'pdf'|'excel'|'portal',file?},receivedAt,due,status:'new'|'review'|'quoted'|'won'|'lost',owner,subject,notes,threadId?,quoteId?,total,lines:[{n,text,productId|null,name,qty,unit,price,confidence(0-100),state:'matched'|'review'|'unmatched'}]}]
quotes    [{id,no,rfqId?,partyId,status:'draft'|'pending_approval'|'sent'|'accepted'|'rejected',total,marginPct,validTill,createdAt,approver?,lines:[{productId,name,qty,unit,price,discPct}],terms}]
orders    [{id,no,partyId,status:'confirmed'|'processing'|'packed'|'shipped'|'delivered'|'cancelled',total,placedAt,channel,payment:'Paid'|'Credit'|'Pending',lines:[{productId,name,qty,unit,price}],erp:null|{system:'Tally'|'Coralio',ref,state:'pending'|'synced'|'failed',at,error?},shipmentId?,threadId?}]
drafts    [{id,no,partyId,threadId?,status:'pending'|'approved'|'rejected'|'posted',total,createdAt,by,note,lines:[{productId,name,qty,unit,price,state:'pending'|'flagged'|'confirmed'}]}]
shipments [{id,orderId,carrier,awb,status:'pending'|'pickup'|'in_transit'|'delivered'|'rto',eta,from,to,events:[{at,text}]}]
campaigns [{id,name,channel,status:'draft'|'scheduled'|'sent'|'running',audience,listId,sent,delivered,read,replied,orders,createdAt,templateId}]
lists     [{id,name,count,rule,updatedAt}]   templates [{id,name,channel,category,status:'approved'|'pending'|'rejected',lang,body}]
agents    [{id,name,status:'live'|'draft'|'paused',channelId,role,initialMessage,rules:[{id,kind:'rule'|'guardrail'|'helper',scope:'inherited'|'agent',text}],sources:[{id,type:'link'|'document'|'chat',title,state,addedBy,addedAt,usedIn}],learned:[{id,text,at}],gaps:[{id,text,count}],training:[{id,at,by,prompt,added:[],removed:[]}],activity:[{id,at,action,outcome:'handled'|'escalated'|'validation',channel,caseId}],kpis:{handled,autoRate,escalated,avgReplySec}}]
workflows [{id,name,status:'active'|'draft'|'paused',trigger,runs,lastRun,nodes:[{id,type:'trigger'|'condition'|'action'|'delay',label,detail,x,y}],edges:[{from,to,label?}]}]
channels  [{id,type:'whatsapp'|'email'|'indiamart'|'web'|'telegram',name,number,provider,state:'connected'|'needs_reauth'|'disconnected',webhook:'healthy'|'failing',lastEvent}]
apps      [{slug,name,desc,category,state:'connected'|'available',account?,lastSync?,config?:{...},icon(color hex),letter}]   // must include the ERP for the use case: tally | coralio, plus gsheets, shopify, gmail, indiamart, shiprocket, razorpay
erpLog    [{id,orderId,system,direction:'out',endpoint,method,status:200|202|400|500,ref,at,request:{...},response:{...},state:'synced'|'failed'|'pending'}]
logs      [{id,at,actor,action,target,outcome,kind:'action'|'alert'|'validation',channel}]
notifications [{id,tab:'human'|'agent',from,subject,body,href,at,unread}]
rulebook  [{id,kind,scope,text,enabled}]   usage {plan,period,items:[{label,used,limit}]}
rateCard  [{id,category,minMarginPct,maxDiscPct,approvalAbove}]
dash      {greeting?, kpis:[{key,label,value,delta,fmt:'inr'|'num'|'pct'|'min'}], revenue:[{l,v}], funnel:[{l,v}], topParties:[{l,v}], alerts:[{id,text,tone,href}], activity:[{at,text,href}]}   // seed; dashboard page may overlay live counts computed from S
```
Seed volumes (each use case): ≥14 parties (+ ≥18 contacts), ≥28 products (realistic names/SKUs/prices), ≥10 threads (6+ messages on the 3 key ones), ≥10 leads, ≥8 rfqs (rfq UC: ≥14), ≥8 quotes, ≥16 orders, ≥5 drafts, ≥5 shipments, ≥5 campaigns, 4 lists, 8 templates, ≥3 agents, ≥4 workflows, 5 channels, ≥12 apps, ≥25 logs, ≥10 users-less-than 8, ≥8 rulebook rules. Realistic Indian business data (GSTIN format, ₹, cities, phone +91). Never real people's data; invent names.

## Quality bar
Looks like the real product (neutral shadcn look, Inter, light rail, white panel). Dense but airy tables, status badges, empty states, hover states. Responsive down to ~1100px. No console errors on any route for any of the 3 use cases. Test by loading `index.html` in the browser pane (`file://` or a local server at port 8765 if running) and visiting every route you own in all 3 use cases (switch with `localStorage.setItem('dm.uc','stuffcool')` + reload or the panel).
