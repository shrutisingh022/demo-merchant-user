# Workspace surfaces spec — Agents, Workflows, Channels, Apps (live app, captured 2026-10-27)

Tenants: NuHome `CpMoYBTj` (the NewHome use case, source of truth), Axis India `BqOROWFj` (Access use case), Stuffcool `6AqQi9t4`.
Real viewport 1710x959. App text is **12px** base; card radius 10px (`rounded-lg`), controls `h-7` (28px) `rounded-md` (8px), 12px/500 buttons. Sample data below is paraphrased; invent replacement names/numbers in the demo.

Shared page chrome: rail 216px, content panel inset with 10px radius, top bar 48px. Breadcrumb `Org / Page`. Page container for list pages is **980px wide**, starting x≈469 (centred in 1486px content), h1 20px/600 at y≈80, muted 12px subtitle, primary action button top-right. Agent detail pages use the **full content width** (≈1260px, padding 30px), not 980.

Top-bar icons (all tenants): chat bubble = "Ask Anuma" (see end), bell with red count badge.

---
## 1. AGENTS

### 1.1 List `/agents`
- h1 `Agents` (20px/600), sub `Agents answer your customers on a channel and follow the shared rulebook.`; right: black button `+ Create`.
- 2-column card grid inside 980px (cards 482x111, gap 16, radius 10, 1px border). Card anatomy:
  - top row: 40px black rounded-lg agent mark (the `• ▬` glyph), name 12px/600, sub `Updated 17 days ago` (muted 12px); right: status badge then `⋯` icon button.
  - status badges: `● Live` (green dot, text "Live"), `○ Draft` (grey dot, "Draft"). Outline pill, 11px.
  - footer strip (muted bg, separated by 1px line): when attached: WhatsApp green icon tile + `Lives in` (muted) + **bold** channel name `WhatsApp NuHome Test No - 7391914040 and 1 more`; when not: muted `Not on a channel yet`.
  - last grid cell: dashed-border empty card, centred `+` and `Create`.
- `⋯` menu (dropdown, 144px wide): `Edit`, `Delete` (destructive red).
- NuHome rows: **Anuma** (Live, updated 17 days ago, lives in WhatsApp NuHome Test No - 7391914040 and 1 more), **Catalogue and prices** (Draft, 1 month ago, not on a channel), **test ew** (Draft, 26 days ago, not on a channel).
- Axis India: single agent **test** (Draft, 1 month ago, not on a channel yet).
- Stuffcool: single agent **Order Desk** (Live, updated 4 days ago, `Lives in WhatsApp WhatsApp (+91-8879691427)`).

### 1.2 `+ Create` dialog "New agent" (520x402, radius 14)
- Title 14px/500 `New agent`, sub `A name and a type. The channel decides where it answers.`, close ✕ (24x24).
- Field `Name`: input 28px tall, placeholder `e.g. WhatsApp order desk`.
- `Type`: three radio cards (each 488x48, radius 10, border, px-3 py-2): selected one has dark ring.
  - `Chat` (WhatsApp icon tile) — `WhatsApp, and any messenger. Short replies.` (default selected)
  - `Voice` (phone icon, blue) — `Phone and WhatsApp calls.`
  - `Email` (Gmail M icon) — `Long replies, with the full description.`
- Footer: `Cancel` (outline) and `Create draft` (black, disabled until name typed).

### 1.3 Agent detail header (all tabs)
- `← Back to agents` ghost button (24px tall, 12px/500, muted text, 8px radius).
- 40px black agent mark + name h1-ish (20px/600) + status badge (`Live` green / `Draft`).
- Line: `Lives in` (muted) + pill button (outline, 10px radius, WhatsApp icon) `WhatsApp NuHome Test No - 7391914040 and 1 more`. For a draft agent: muted text `Not on a channel yet — attach it from Channels`.
- Tabs as **segmented pill group** (grey track, active white): `Overview | Training | Test mode | Activity log` (each 25px tall, 12px/500, px 6–12). URLs: `/agents/<id>/overview`, `/training`, `/test-mode`, `/activity-log`.

### 1.4 Overview tab
Two columns: left ≈1128px, right ≈250px.
- Left, top banner (bordered row, lock icon): `Instructions are read-only. Update them in Training.` + right button `✎ Edit in Training` (outline, 24px).
- Left card `Instructions` (card header 33px, 12px/400; body padding 12px). Sections (12px/500 headings), each containing **playbook tags** (10px/500 pill, grey tint, e.g. `P8. Closing`, `P3. Bursts and lengths`, `P4. Notes`, `P5. Corrections`, `P6. Lines that need a person`, `P9. Catalogue matching`, `P2. Questions for the team`, `P1. Hand-off and hand-back`) followed by bullet lists (12px, `•` bullets, line-height ~1.5):
  - `What it does` — all playbook rule bullets (e.g. `Send the full list with Confirm and Change when the buyer says done, no, that's all or ok after a list, or after 10 minutes of quiet with at least one complete line.`, `On Confirm: "Received. <ref>, N lines."`, `On Change: "Which line?"`, `A list of amounts after a burst maps to the photos in the order they were sent.`, `Words like by air, bye air, SM by air … go into notes, exactly as the buyer wrote them.`, `List the line with what was read and "our team is checking this one". Hand it to the account's primary.`, `NuHome labels share one layout: Quality (large caps), SR NO, Design, Shade, Composition, Weight, Width…`, `While a person has the conversation, send nothing.`).
  - tag `This agent only` (slightly darker pill) then agent-specific rules: `Never ask the customer for a delivery address — this merchant does not need it collected in this conversation.`, `Keep every reply extremely short - one short sentence, or a couple of words when that is enough…`, `Treat the abbreviations mts, mtr, mtrs, m, and mt as all referring to meters.`, `Never use em-dashes in replies.`, `Don't always greet customers in Hindi.`, `When a customer orders the same product in multiple meter quantities, combine them into a single line item on the draft order…`.
  - `What it never does` — per-playbook guardrails: `Never say "confirmed" about stock, dispatch or dates.`, `Never treat a second Confirm tap as a second order…`, `Never acknowledge or analyse each photo of a burst separately.`, `Never offer the buyer a catalogue record to choose from.`, `Never match on colour or composition alone…`, `Never answer these yourself, even partly.`, `Never change a line a person edited.` Closing muted line: `Platform safety guardrails always apply on top of these, and can't be switched off.`
  - `Facts that help it read a message` — helper bullets (odd inputs, repeated photos, unit words, bare numbers = metres, quality names, tracking/availability phrasing).
- Right column: one card: row with WhatsApp tile + agent name (bold) + muted `No description yet.`; `Type` label (muted) → pill `Chat` with WhatsApp icon; `Lives in` label → bordered box with channel name.
- **Empty agent** (Stuffcool Order Desk): the Instructions card shows centred `Nothing set up here yet` + `What this agent does, the way it opens a conversation, and the rules it follows all get written in Training. They show up here once they exist.` + button `Go to Training`.

### 1.5 Training tab (`/training`)
- One full-width card (radius 10): header `Train your agent` (14px/500) + sub `Teach it how to respond. Rule changes appear in this conversation.`
- Scroll area chat: user messages = wide grey rounded rectangles (muted bg, radius 10, left-aligned text, up to ~60% width, right side) ; agent replies = white bordered bubbles left; timestamps muted 11px under each (`1 month ago`, `17 days ago`).
- Rule-change cards inside the stream: small header row `Updated rule` / `New rule` with diff chip `+1 −1` / `+1 −0`, then the text: `Updated: "Treat the abbreviations mts, mtr, m, and mt as all referring to meters." → "Treat the abbreviations mts, mtr, mtrs, m, and mt as all referring to meters."`; `Got it — I'll remember: "Never use em-dashes in replies."`
- Typical exchanges (reuse): `what are you current rules` → `**Rules (4):** 1. Never ask …`; `rules?` → `That's handled separately, so I won't list them here — but feel free to ask me to change or add a specific rule, like "stop asking for delivery address."`; unparseable → `I couldn't turn that into a rule — try phrasing it as a specific instruction.`; description-like input → `That looks like a description rather than an instruction for the agent 🙂 …`; links → `I can't open external links or artifacts…`.
- Composer docked at bottom (border-top): rounded textarea placeholder `Tell Anuma how to behave, in plain English`, paperclip icon button (bottom-left), `Send ➤` button bottom-right (grey/disabled until text).
- Empty state (Stuffcool): centred sparkle icon, `Nothing here yet`, `Tell Anuma what Order Desk should do, in your own words. Each thing you say becomes one of its rules straight away.`

### 1.6 Test mode tab (`/test-mode`)
- Left card (≈850px): header row: person icon tile, `You, as a customer` / muted `Answering as it would on WhatsApp NuHome Test No - 7391914040 and 1 more`; chips: `Test run` (outline button with flask icon), amber chip `Nothing goes out` (crossed-send icon); right: `Reset` (outline, ⟲), panel-toggle icon button.
- Body: chat wallpaper (beige) with centred empty state: chat icon, bold `See your agent in action`, muted `Send a message as a customer to try its responses. This is a private test — nothing is sent to your customers.`
- Composer: textarea `Write what a customer would send`, paperclip, `Send ➤`.
- Right card (≈320px): header `What Anuma used` + settings icon button; empty state `Nothing matched yet` / `Product matches will appear here after a test reply.` (after a reply it lists matched products with confidence).

### 1.7 Activity log tab (`/activity-log`)
- Card `Activity log` / sub `Changes and actions recorded for this agent.` Day headings (`9 Oct`, `30 Sep`, `18 Sep`, `16 Sep`) then rows (no zebra): 24px round icon tile at left (▷ play = activated, ‖ pause = paused, speech icon = rule, doc icon = guideline update), text 12px, muted `actor · 7:37 pm` below. Row texts: `Updated Agent: Anuma (Changed fields: is_active)`, `Updated Agent: Anuma (Changed fields: modified_by, is_active)`, `New rule: "Don't always greet customers in Hindi." (+1 -0)`, `Updated Agent: Anuma (Changed fields: guidelines)`. Stuffcool: `Created Agent: Order Desk` / `neil batavia · 6:21 pm` under `23 Oct`.

---
## 2. WORKFLOWS

### 2.1 List `/workflows`
- h1 `Workflows`, sub `Automations that start from an event and run step by step: decide, wait, message, approve.`; black `+ New workflow`.
- Rows: 980x64 bordered radius-10 cards: name 12px/500 `Coral DraftOrder -> SalesOrder Sync` (rendered with arrow), muted `v3 · updated 22/10/2026`, right `Live` green pill + trash icon button.
- Empty (Axis India): centred `No workflows yet` / `Create a workflow to automate a follow-up.` Stuffcool live shows "You don't have access" (feature off) — in the demo, give Stuffcool a workflow `Order → Tally voucher sync` in the same style.

### 2.2 Builder `/workflows/<id>` (full-bleed canvas)
- Top bar (48px, white, border-bottom): back `←` button (28px), name 12px/600 `Coral DraftOrder → SalesOrder Sync`, green `Live` pill, version chip `v3` (outline), muted `Triggered by Draft order status changed`. Right: Undo, Redo (icon buttons; disabled until edits), divider, `Runs` (history icon), `Test` (flask icon), `More actions` (⋮), divider, `Save draft` (outline, disabled until dirty), `Publish` (black, disabled until dirty).
- Banner under bar (grey bg, 12px muted): `In use. Change anything: your first save becomes a draft and the live version stays as it is.` After an edit: chip becomes `Draft v4 · unsaved`, banner becomes red `N things to fix before this can be published.` (nodes with problems get a red border + red ⚠ icon).
- Canvas: React-Flow, dotted background (grey dots ~24px grid), zoom controls bottom-left (`+`, `−`, fit — 28px square buttons stacked, bordered), minimap bottom-right 180x130 (white card with coloured bars: black trigger, amber decision, green action, red end; moves left when a side panel is open).
- Nodes 210px wide, 61px tall (78px when a `Source:` line is shown), white, 1px border, radius 8: header row = 20px tinted icon tile + title 12px/600 + right-aligned run-count chip (`👥 7 (100%)`), body line 12px (`Draft order status changed`, `1 condition in 1 group`, `Push draft order to Coral ERP` + muted `Source:` **Coral ERP**, `End of the workflow`). Selected node: 2px dark border. Icon tints: Trigger grey (⚡), Decision amber (filter icon), Action green (message icon), End red (square), Wait grey-muted (timer), Approval amber (shield).
- Edges: dashed grey curved; on each edge a 20px round `+` button (`Add a step`); Decision outputs carry pills `True` (green tint) and `False` (red tint).
- NuHome graph (positions in CSS px at default zoom): Trigger (387,508) → Decision (698,508) → True: Action (1017,377) → End (1321,508) ; False: End (1010,590). Counts: Trigger 7 (100%), Decision 7 (100%), Action 5 (71%), End 2 (29%) twice.
- Right side panel (384px wide, opens when a node is clicked, canvas shrinks): title 14px/600 + muted description, trash + ✕ icon buttons top-right.
  - **Trigger**: `The event that starts the workflow for a subject.` Card: muted `Trigger · Orders`, bold `Draft order status changed`, `An AI-parsed draft order moved to a new status.`, `Change` button → dialog **Choose a trigger** (636px, search `Search…`, groups `Orders 1`: `Draft order status changed` (✓ selected) ; `Schedule 1`: `At a set time` — `Runs daily, weekly or monthly at an exact time in the timezone you choose (IST by default).`). Schedule trigger config card `Schedule`: `Repeat` select (`Daily`…), `At` time input (`07:00 AM`), `Timezone` select (`Asia/Kolkata`).
  - **Decision**: `Create a filter to decide which path the workflow takes.` Card `Condition 1` with labelled selects: `Variable` (`Status`), `Condition` (`Equals`), `Value` (`confirmed`); `+ Add condition`; full-width `+ Add OR group`.
    - Variable list (listbox 299px wide, 28px items, group headers muted): **Trigger**: Status, Previous status, AI confidence, Is a test order, Handled by, Number of items, Created at, Expires at, Last activity, External order id, Processing error. **Subject**: contact · salutation / first name / last name / email / secondary email / phone / mobile / contact type; account · name / number / account type / email / phone / website / billing city / billing state / billing country / shipping city / shipping state / shipping country.
    - Condition options: Equals, Does not equal, Contains, Is one of, Is not one of, Is set, Is not set.
    - Value options for Status: received, needs_review, rejected, awaiting_quantity, awaiting_confirmation, confirmed, converted.
  - **Action**: `Choose what happens at this step.` Card `Action · Coral ERP` / bold `Push draft order to Coral ERP` / `Create the matching sales order in Coral. Safe to repeat: Coral ignores a second push of the same draft.` / `Change`. Info card: same description bold, `Works on draft_order triggers.`, `Changes something outside Anuma, so it follows your approval policy for this action.`, `Returns` list: Outcome, Reason, Coral sales order id.
    - `Change` → dialog **Choose an action** `What happens at this step.` (search; groups): *Orders* — `Add confirmed draft orders to a spreadsheet` (`Append confirmed draft orders to a spreadsheet tab, one row per line. Each row carries an id, and rows already in the sheet are skipped, so running it twice never duplicates anything.`); *Products & Inventory* — `Update stock from a spreadsheet` (`Read part numbers and quantities from spreadsheet tabs and set stock, one location per tab. Stops before changing anything if the sheet looks broken, out of date or wrong.`); *Webhooks & API* — `Send an HTTP request` (`Call a webhook or API. Values can use {{variables}} from the trigger, the subject and earlier steps.`); *Coral ERP* — `Push draft order to Coral ERP` (✓).
    - Update-stock form: `Spreadsheet app *` select (`No connected app`), `Tab → location (code or name) *` + `+ Add`, `Part number column *`, `Quantity column *`, `Date column (to detect an old sheet)`, `Header row`, `Stop if the sheet is older than (days)`, `Stop if more than this % of part numbers match nothing`.
    - HTTP request form: `URL *` input (placeholder `Text or {{variable}}`) + `Insert` dropdown, `Method` select (`POST`), `Headers` `+ Add`, `JSON body` `+ Add`; info card `Returns`: Status code, Succeeded (2xx), Response body.
  - **Wait**: `Pause the workflow before the next step. No worker is held while waiting.` `Duration` number (`1`) + unit select (`Days`). Node body `Wait for 1 day`.
  - **Approval**: `A person approves before the workflow continues. Rejection ends it.` Field `What should the approver check?` (textarea). Node body `A person approves before continuing`.
  - **End**: no config; node body `End of the workflow`.
- Add-step sheet (opened by edge `+`): right sheet 384px, title `Add a step`, `Choose what happens next.`, search `Search steps`; groups with icon rows (title 12px/500, truncated muted description): Orders, Products & Inventory, Webhooks & API, Coral ERP (same four actions) then **Flow control**: `Decision` (`Split based on conditions`), `Wait` (`Add a time delay`), `Approval` (`A person approves before continuing`).
- `Runs` sheet (384px right sheet with scrim): `Run history` / `What this workflow did. Pick a run to see each step and light it up on the canvas.` List of bordered cards: `25/10/2026, 16:47:18` (12px/500) + `Version 3 · draft_order 178` muted, status pill `Failed` (red tint) or `Succeeded` (green tint). Run detail: `← All runs`, `Version 3 · started 25/10/2026, 16:47:18` + status; `Trigger values` JSON code block (grey bg, mono 11px: error, status, is_test, created_at, expires_at, item_count, managed_by, external_id, previous_status, confidence_score, last_activity_at); then step cards each with title + `Done`/`Failed` pill + timestamp: `Draft order status changed` Done; `1 condition in 1 group` Done `Took the Yes path.` + `Result` JSON `{ "matched": true, "missing": [] }`; `Push draft order to Coral ERP` Failed `3 attempts` red `Customer does not exist: Shruti`. Succeeded runs list e.g. `22/10/2026, 17:22:02 Version 3 · draft_order 169`.
- `Test` sheet: `Test this workflow` / `Walks the steps on this screen with the values below. Nothing is sent, pushed or saved.` Fields: Status (select), Previous status (select), AI confidence, Is a test order (select), Handled by (select), Number of items, Created at, Expires at, Last activity, External order id, Processing error, `Record ID (optional)` + helper `Use a real record's details. When set, the values above are ignored.`, button `Run test`.
- `More actions` menu (240px): `Settings`, `Tidy layout`, `Pause`, `New workflow from this version`, `Delete workflow` (destructive).
- `Settings` sheet: `Workflow settings` / `Who can enter, how often, and what ends a workflow early.` `Re-entry cooldown` number + `Days` select + helper `Leave empty to let each subject enter only once.`; `Allow concurrent runs` switch + `Let a subject be in this workflow more than once at the same time.`; `Termination events` input (placeholder `e.g. order.status_changed.cancelled`) + `+` + helper `When one of these happens for the subject, any waiting or running workflow is cancelled.`

---
## 3. CHANNELS `/settings/channels` (nav label `Channels`, Workspace group)
- h1 `Channels`, sub `Where customers reach you, and which agent answers.`; black `+ Create`.
- 2-column 980px grid, cards 482x105: WhatsApp green tile (40px), name 12px/600 `NuHome Test No - 7391914040`, muted sub `NuHome Test No - 7391914040 — 360dialog` / `Plivo #1`; right: status badge `● Live` / `○ Paused` + `⋮` menu; footer strip: agent icon + `Anuma` and right-aligned muted `19 days ago`.
- Names: `NuHome Test No - 7391914040` (Live, 360dialog, Anuma, 19 days ago); `Plivo #1 (send_whatsapp)` (Paused, Anuma, 6 days ago). Stuffcool: `WhatsApp (+91-8879691427)` live, agent Order Desk.
- Card `⋮` menu (128px): `Edit`, `Delete` (destructive).
- `Edit` → dialog **Configure channel** (520x675): WhatsApp tile + title, sub `Who answers, and what happens when they can't.`; `Name` input; `Connected app` pill `360dialog`; `WhatsApp details` bordered box (label left muted / value right): `Connected number` `+917391914040`, `WhatsApp Business Account ID` `388655514327021`, `Phone Number ID` `331922513348350`, `Webhook URL` mono input (readonly) + `Copy` button; `Default AI agent` select (`Anuma`) + link-button `+ New agent`; box `Channel active` switch (on) with `Off pauses everything: no new conversations, no AI replies, no team routing.`; footer `Cancel`, `Save changes`.
- `+ Create` → dialog **Add channel** (720x697, radius 14): `Select a channel to configure for your agent.` 2-column grid of bordered cards (icon + title 12px/500 + muted 2-line description); active ones: `WhatsApp` (`Connect your whatsapp business account to allow agents to respond to messages`), `Email` (`Connect any email from Gmail, Outlook, etc. to allow agents to respond to emails`), `Voice` (`Enable AI-powered phone calls with voice channel integration via Plivo`), `SMS` (`Connect an SMS provider to send messages to your customers`), `Telegram` (`Connect a Telegram bot to allow agents to respond to messages`). Greyed (opacity .5, right-aligned `Coming soon` chip): `Instagram`, `Website Widget`, `Messenger`, `Push Notifications`, `RCS`, `Slack`, `Freshdesk`, `Zendesk`, `X (Twitter)`, `Agent API`. Picking an active one continues into that provider's configure form (WhatsApp → same fields as Configure channel below: Name, Connected app, WhatsApp details, Default AI agent, Channel active).
- Axis India and Stuffcool have the same Channels page; Stuffcool has one live WhatsApp channel (`WhatsApp (+91-8879691427)`, agent Order Desk).

---
## 4. APPS (NuHome `Apps`; Axis & Stuffcool label `Merchant Apps`) `/settings/integrations`
Observed from the earlier capture (screens at 1456-wide scale):
- h1 `Apps` (`Merchant Apps` in Axis/Stuffcool), sub `Systems connected to your workspace, and everything you can connect.`
- Toolbar: search input `Search apps…` (≈290px) + `Filters` outline button (filter icon).
- 2-column card grid (cards ≈ 405x96 + footer): logo tile (40px) · name 12px/600 (+ tag chip `Beta` grey / `Featured` amber) · category muted (`Team Chat`, `CRM / ERP`, `E-Commerce`, `Spreadsheets`) · status at right `○ Not connected` / `● Connected` · description 12px muted (2 lines) · footer strip buttons: `⚡ Connect` (black, 24px) + `Docs ↗` (ghost) or `Configure` (outline, list icon).
- NuHome cards: `Test send_whatsapp` (Team Chat, Not connected, "No description yet."); `Microsoft Dynamics 365` (CRM / ERP; `Bi-directional sync with Microsoft Dynamics 365 CRM.`); `Zoho CRM` (Beta; `Sync contacts, accounts, and deals with Zoho CRM.`); **`Coral ERP`** (Beta, **Connected**; `Pull products, categories, account/org groups, and org units from Coral ERP; push confirmed draft orders as sales-orders.` button `Configure`); `Shopify` (Featured; `Connect your Shopify store. Read and write products, orders, customers, fulfillments, draft orders, and metafields via the GraphQL Admin API.`); `Google Sheets` (Beta; `Read, write and search rows in a Google Sheet. Share the sheet with Anuma's account and prove it is yours; no Google Cloud setup. A connector only: what…`).
- Card order: connected apps first, then the rest in this order: NuHome → `Coral ERP`, `Test send_whatsapp`, `Microsoft Dynamics 365`, `Zoho CRM`, `Shopify`, `Google Sheets`. Stuffcool → `Google Sheets` (**Connected**, buttons `Configure` + `Docs`; description `Read, write and search rows in a Google Sheet. Share the sheet with Anuma's account and prove it is yours; no Google Cloud setup. A connector only: what the rows mean is up to the workflow that uses them.`), `Test send_whatsapp`, `Microsoft Dynamics 365`, `Zoho CRM`, `Coral ERP` (Not connected), `Shopify`. Axis India → nothing connected (same six cards, all `Not connected`). **There is no Tally app live** — in the Stuffcool demo add a `Tally` card (CRM / ERP, Connected, `Configure`) built exactly like Coral ERP's.
- `Filters` button → popover/menu 224px: muted `Filter by` heading, item `Category ›` opening a submenu with `Team Chat`, `CRM / ERP`, `E-Commerce`, `Spreadsheets`; choosing one filters the grid and the button shows the active filter.
- **Configure page** `/settings/integrations/coral_erp/<id>` (980px, `← Apps` ghost button, 40px puzzle icon tile + h1 `Edit Coral ERP`, muted description `Pull products, categories, account/org groups, and org units from Coral ERP; push confirmed draft orders as sales orders.`, mono tag chips `crm_erp`, `auth: api_key`, `pull_crm_records`, `pull_org_records`). Stacked cards (each with title 14px/500, muted sub, and a small icon button top-right):
  1. `Actions` — `Manually trigger a sync step for this Coral ERP connection.` Buttons (outline, ▷ icon): `Sync Products`, `Sync Customers`, `Sync Org Structure`, `Full Sync`.
  2. `Connection` — `Update the label and settings for this Coral ERP connection. To rotate credentials, uninstall and reinstall.` Field `Label *` (`Coral ERP`) + helper `Distinguishes multiple installs of the same app.`
  3. `Configuration` — `Non-secret settings for how Coral ERP behaves inside Anuma.` Fields (label 12px/600, grey input, muted helper): `Default Courier` (`Coral Courier/Transporter master name sent on pushed sales orders. Blank is accepted by Coral.`), `Sales User Role` (`Name of the merchant Role given to users created from Coral sales people. Defaults to 'Sales'.`), `Order Reference Prefix` = `TEST` (`Optional prefix for the ExternalRef Coral de-duplicates pushed sales orders on, which is otherwise just the draft order's number (e.g. DRF-1001). Set it to TEST on stage and local installs that push to the same Coral database as production, so their numbers can't collide.`), `Sellable Product Groups` (chip list with ×: `Finished Fabrics for JACQUARD FURNISHING - ALBUMS`, `Finished Fabrics for DIGITAL PRINTED FURNISHING - ALBUMS`, `EMBROIDERED FURNISHING FABRICS MULTI - FINISHED FOR ALBUMS`, `Finished Fabrics for UPHOLSTERY - ALBUMS` + `Add`; helper `API_FetchProduct.productGroup values to import as PIM Products; everything else (Yarn, Greige/raw, Job Work, …) is out of scope. …`), `Default Mode of Transport` (`Coral Mode of Transport master name sent on pushed sales orders. Blank is accepted by Coral.`), `Product Attribute Mapping` — 2-col table `Field Name | Coral Attribute` with empty editable rows + `Add row` (helper: `Coral's API_FetchProduct exposes attribute1..attribute23 …`), button `Save changes` (black).
  4. `Recent activity` — `Manual action runs for this connection, most recent first.` List rows: bold action (`coral_erp.sync`, `Sync Products`, `Full Sync`), mono result summary (`products: 0 errors, 0 created_products, 0 created_variants, 0 updated_variants · customers: 0 errors, 27 created, 0 updated · org_units: skipped · sales_users: 3 no_org_unit, 16 created_users, 13 org_unit_links, 22 skipped_no_email, 16 created_merchant_users · account_groups: 0 created, 0 updated · product_categories: 0 created, 0 updated`), and right-aligned timestamp `14/10/2026, 16:11:18`. Another example `products: 11 errors, 87 created_products, 55 created_variants, 0 updated_variants · product_categories: 1 created, 101 updated`.
  The Tally configure page in the demo should reuse this layout (Actions: `Sync Stock Items`, `Sync Ledgers`, `Push Vouchers`, `Full Sync`; Configuration: `Company name`, `Tally gateway URL`, `Sales ledger`, `Voucher prefix`, `Ledger mapping` table).

---
## 5. Ask Anuma panel (chat icon in top bar; all tenants)
- Floating panel on the right (404px wide, ~887px tall, white, 1px border, radius 12, shadow, sits over the content): header = black Anuma mark (28px) + `Anuma` / muted `reads the whole of NuHome`; right icon buttons `Past chats` (history) and `Close` ✕.
- Empty state: large mark, `How can I help you today?`, muted `Ask about the costing cycle — where the delay sits, who is slow to start, what is past the SLA.` Suggestion chips (outline pills, 12px): `Where is the delay coming from?`, `Who is slowest to start?`, `How fast is costing once it starts?`.
- Composer card: textarea `Ask about opportunities, delay, costing…`, bottom-left paperclip + `@` mention buttons, bottom-right mic + round black send button.

---
## 6. Motion / visual facts
- Menus/dialogs: radix with `enter` 100ms (fade + zoom 95%); sheets slide from right with dark scrim; dropdown content `rounded-lg p-1 ring-1 ring-foreground/10 shadow-md`, items `min-h-7 rounded-md px-2 py-1 text-xs`.
- Page enter: `os-enter` 6px rise, 0.3s. Typing wave dots `typing-wave`. Workflow edges dashed; (`wf-edge-flow` keyframe exists for live edge animation).
- Chips: playbook tags 10px/500 pill (grey tint), badges 20px tall pill.
- Colours: success `#13a269`-ish tint backgrounds on `Live`/`Succeeded`; red tint `Failed`; amber `Nothing goes out`.

## Gaps (not captured)
Agent `Test run` button behaviour (not clicked — may call the AI); Google Sheets Configure page in Stuffcool; per-provider forms after picking Email/Voice/SMS/Telegram in Add channel; the `Ask Anuma` conversation view after a message is sent.

## Summary of surprises
1. Live Stuffcool has **no Workflows and no Tally**; the demo must invent both (workflow in the same builder style, Tally app modelled on Coral ERP).
2. Axis India has an empty agent (`test`, Draft), no workflows, no connected apps, and labels Apps as `Merchant Apps`.
3. The agent Overview is a read-only render of the rulebook playbooks (P1–P9 tags); all editing is via Training chat.
4. Workflow builder status chip flips `v3` → `Draft v4 · unsaved`, banner turns red with "N things to fix"; Runs/Test/Settings/Add-step are right sheets (384px) with a dark scrim, not popovers.
5. Chat icon in the top bar opens a floating **Ask Anuma** panel (404px), not a page.
