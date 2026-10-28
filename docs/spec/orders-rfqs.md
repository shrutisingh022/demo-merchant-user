# Spec: Orders (NuHome), Draft Orders (Stuffcool), RFQs (Axis India)

Captured 2026-10-27 from the live app at 1710×959 (screenshots scaled to ~1512 wide). **SAW** = observed in the live UI. **READ** = taken from the repo (`src/app-v2/draft-orders`, `src/components/data-grid`), not observed. Example rows below use invented names/numbers; structure, copy and formats are live.

Tenants: NuHome `/ws/CpMoYBTj`, Axis India `/ws/BqOROWFj`, Stuffcool `/ws/6AqQi9t4`.

---

## 0. Big finding: NuHome "Orders" and Stuffcool "Draft Orders" are the SAME screen

- NuHome rail item **Orders** → `/orders/drafts`; breadcrumb reads `NuHome / Orders`, h1 `Orders`. (SAW. `/orders` itself shows "You don't have access to this" for this user.) The module list in Settings → Navigation labels the draft-order module as "Orders (renamed)".
- Stuffcool rail item **Draft Orders** → `/orders/drafts`; breadcrumb `Stuffcool / Draft Orders`, h1 `Draft Orders`. (SAW.)
- Same page, same columns, same drawer. Only the label differs (the NuHome tenant renamed the module). Empty-state copy follows the label: `No Draft Orders yet` (Stuffcool) / presumably `No Orders yet` (NuHome).
- There is **no confirmed-orders list, no ERP sync-log tab, no "Confirmed" segmented view** in either tenant. Remove those from the demo. The only ERP surface is the collapsible **Coral ERP** card inside the order drawer (see §2.4). (Note: Stuffcool's drawer also says **Coral ERP**, not Tally. Tally in the demo is therefore invented for the Stuffcool scenario; if kept, reuse the same card with the label `Tally`.)
- Axis India has **no Orders and no Draft Orders** in its rail (SAW). Its work is RFQs.

---

## 1. Draft Orders / Orders list (`/orders/drafts`) — SAW

### 1.1 Header
- Breadcrumb: `<Org> / Orders` (NuHome) or `/ Draft Orders` (Stuffcool). 12px; last crumb 500 weight.
- h1: `Orders` / `Draft Orders` (~20px/600, left aligned at content edge; page is full width, 30px side padding, content spans ~1260px wide at 1710).
- Under h1: muted 12px date range text, e.g. `Oct 1, 2026 – Oct 27, 2026`, then a **Compare** switch (small, black when on) + label `Compare`. When the period is Today, text reads `Oct 27, 2026`.
- Right of title row: segmented control (muted pill group, 28px tall): `Today | This week | This month | Custom ✎` (pencil icon after Custom). Default = **This month**. Active = white pill with shadow.
  - Query params: `?period=today` (also week/month); Custom → `?from=2026-06-01&to=2026-10-27`.
  - **Custom** opens a popover calendar (rounded-xl, shadow): header `‹  October 2026  ›`, weekday row `Su Mo Tu We Th Fr Sa`, day grid (outside-month days muted/disabled, selected range filled grey, range ends black pills with white text), below the grid the selected range text `Oct 1, 2026 – Oct 27, 2026` (muted), footer buttons `Cancel` (outline) and `Apply` (black). First click = start, second click = end; clicking an earlier day after one click makes it the start.
- Period ranges: Today = today only; This week = Mon→today (`Oct 26, 2026 – Oct 27, 2026`); This month = 1st→today.

### 1.2 Summary cards (3, equal width, gap ~12px)
Each card: 14px radius, 1px ring, soft shadow. Top row: 28px icon tile (rounded-md, 1px border, white) + label 13px/500. Dashed horizontal divider. Bottom: big number 26px/600 (left), delta chip next to it (`↘ 26.5%` red or `↗ 2.4%` green, 12px/500), sparkline right-aligned (green line, ~80×28px, no fill, 1.5px stroke).
| Card | Icon | Sample (This month, compare on) |
|---|---|---|
| Orders | file-text | `36  ↘ 26.5%` (red) |
| Line items | package | `129  ↗ 2.4%` (green) |
| Escalations | users | `23  ↗ 27.8%` (red — higher is worse) |
- Compare **off**: delta chips disappear; sparkline stays.
- Loading/unknown: value renders as a dash `—`.
- This week sample: `0 ↘ 100.0%` (red) / `0 ↘ 100.0%` (red) / `0 ↘ 100.0%` (green), sparkline flat line. Today: `0`, sparkline drawn very faint/flat.
- Colour logic: arrow follows arithmetic; colour = good/bad (Escalations: fewer is good).
- Cards describe the **period**, the table below does not follow the period (READ: "the control governs the summary, the table keeps its own filters"). In the demo the table shows all drafts regardless of period.

### 1.3 Toolbar (row below cards)
- Left: view dropdown button `▦ All orders ⌄` (outline, 28px). Menu (DM.menu style): small label `Views`; item `All orders` (checked); separator; `+ New view`.
- Right: `▥ Columns` button (outline, 28px) and a search input `🔍 Search orders…` (~254px wide, 28px).
- **Columns** menu: heading `Columns`; checkbox rows with icon + label, all checked by default, in this order: `ID`(file-text), `Date and Time`(calendar), `Contact Name`(user), `Party Name`(building), `Items`(layers), `City`(map-pin), `State`(map-pin), `Case`(message-square), `Assigned to`(user). Black checked boxes.

### 1.4 Grid (AG Grid, quartz, restyled)
Header row 40px, bg very light grey; each header = label (12px/500, muted-ink) + **filter funnel icon** at right edge of cell (all columns), vertical hairline column separators. Default sort: Date and Time descending (↓ arrow after label; only this column sorts). Rows 40px, 12px text, bottom hairline, row hover = faint grey; cursor pointer.
Columns in order (widths at 1710):
| # | Header | Width | Cell | Notes |
|---|---|---|---|---|
| 1 | ID | 110 | `DRF-1144` **mono**, 12px/500 (reads bold) | `DRF-` + 4-digit id (READ: falls back to case number "151026-001" when a case exists, but live shows DRF-id) |
| 2 | Date and Time ↓ | 200 | `25 Oct 2026, 4:47 pm` | 12px, lowercase am/pm, `D Mon YYYY, h:mm am/pm` |
| 3 | Contact Name | 190 | `—` when empty | muted dash |
| 4 | Party Name | flex | **bold (600)** party name or phone number (`+919820320486`) | first text column is bold |
| 5 | Items | 100 | `3` | plain |
| 6 | City | 160 | `Mumbai` / `—` | |
| 7 | State | 160 | `Maharashtra` / `—` | |
| 8 | Case | 160 | `251026-4 ↗` | mono-ish case number + external-link icon (opens inbox thread); `—` when none |
| 9 | Assigned to | 130 | 24px avatar(s) | see below |
- **Assigned to cell**: 24px round avatar. Variants: black Anuma mark (agent), pale-blue disc with letter `A` (Anuma), real photo avatar (human), empty grey outlined person icon (nobody). Blank cell if no assignee data.
- Only **Assigned to** has a working filter: clicking its funnel opens a popover list titled `Assigned to` with one row per active team member name (checkbox-less single list, 12px). Other funnels are drawn but inert (READ: dimmed "coming" filters with hover reason; SAW: clicking Party Name/Date funnels opens nothing).
- Empty state (centered in grid): file icon in grey tile, `No Draft Orders yet` bold 13px, `New records show up here as they're created.` muted 12px. Header row still shows.
- Footer bar (below grid, hairline top): left `36 orders in view` muted; right `50 / page ⌄` (outline pill button) · `1–36 of 36` · `‹ ›` icon buttons (disabled grey when single page). `0 orders in view`, `0–0 of 0` when empty.
- Row click → opens the record drawer and URL becomes `/orders/drafts/<numericId>` (e.g. `/orders/drafts/178`); closing returns to `/orders/drafts` (period params preserved).

### 1.5 Example rows (invented)
| ID | Date and Time | Contact | Party Name | Items | City | State | Case | Assigned |
|---|---|---|---|---|---|---|---|---|
| DRF-1144 | 25 Oct 2026, 4:47 pm | — | Meera Soft Furnishings | 3 | — | — | 251026-4 ↗ | A |
| DRF-1143 | 25 Oct 2026, 4:34 pm | — | Meera Soft Furnishings | 2 | — | — | 251026-3 ↗ | A |
| DRF-1142 | 25 Oct 2026, 3:48 pm | — | Rao Drapes | 1 | — | — | 251026-1 ↗ | A |
| DRF-1136 | 22 Oct 2026, 4:36 pm | — | Test Account – Demo | 1 | Mumbai | Maharashtra | — | photo |
| DRF-1135 | 21 Oct 2026, 9:52 pm | — | +919820000486 | 1 | — | — | 161026-4 ↗ | empty |
| DRF-1134 | 21 Oct 2026, 11:46 am | — | Joshi Interiors | 1 | — | — | 201026-3 ↗ | photo |
| DRF-1133 | 21 Oct 2026, 11:36 am | — | Rao Drapes | 2 | — | — | 201026-1 ↗ | A |
| DRF-1127 | 16 Oct 2026, 7:01 pm | — | Rao Drapes | 8 | — | — | 151026-2 ↗ | A |
| DRF-1123 | 15 Oct 2026, 8:32 pm | — | Pankaj Bhosale | 7 | — | — | 151026-3 ↗ | empty |
| DRF-1119 | 10 Oct 2026, 9:38 pm | — | Pankaj Bhosale | 8 | — | — | — | empty |
Stuffcool live data (for shape): `DRF-1004  21 Aug 2026, 2:58 pm  — | +919167000410 | 1`, `DRF-1003 … YSR 64959 | 1`, `DRF-1002 … YSR 64959 | 2`, `DRF-1001 … Unique V 66808 | 2` (party names there are ERP-style codes/phones; Case and City/State all `—`).

---

## 2. Draft order record — right drawer (SAW; structure confirmed by READ of `draft-order-record.jsx`)

### 2.1 Container
- Sheet from the right, **800px wide**, inset 12px from top/right/bottom, radius 10px (all four corners), 1px ring, scrim dims page (~40% black). Opens with slide+fade (~250ms). Esc / ✕ / `Close` closes.
- Layout: header (≈76px, border-b) · scroll body (padding ~20px) · footer (≈52px, border-t).

### 2.2 Header
- Line 1: `DRF-1144` mono 16px/500 + party name `Shruti`-style bold 16px/500 ("DRF-1002  YSR 64959").
- Line 2 (muted 12px): `25 Oct 2026 · 4:47 pm` · dot · overlapping avatar stack (24px): black Anuma mark, pale `A` disc, human photo (any subset; with nobody assigned: Anuma mark + grey empty person disc).
- Right: `Open chat ↗` outline button with green WhatsApp glyph (label depends on channel: chat/email/SMS/call; READ), then ✕ icon button (28px, outline). `Open chat` jumps to the inbox thread of the case.

### 2.3 Body
1. **Two stat cards** (each ~215×104, side by side, left aligned, NOT full width; same card anatomy as page cards, dashed divider, 26px value):
   - `Time to close` (stopwatch icon) → `8 min` (formats: `N min`, `N.N hr`, `N.N d`; `—` if none).
   - `Interventions` (users icon) → `2` (`0` if none).
2. **Items** section: label `Items` 12px/600 + count chip `3` muted; right side muted `🔒 Locked after confirmation`. Below: table card (rounded-lg, 1px border) with header row: `Product / variant` · `Quantity` · `Unit`; column widths ~550 / 110 / 90 (grid is horizontally clipped by a 5px scrollbar edge). Rows ~55px:
   - Product cell: product name **bold** (12px/600, uppercase as stored e.g. `KARO`) over muted variant line (`109 / NH 2329 / 19`). Empty product → muted `—` (both lines).
   - Quantity: **bold** number (`6`, `67`, `5`).
   - Unit: `Meter` / `Roll` / `Piece`.
   - (READ: a 32px neutral swatch tile precedes the product text in the code; not visible on live because swatches are not stored. Demo should show a fabric/product swatch tile — fake images are required by the brief.)
3. **Coral ERP card** (collapsible; card with border, 14px radius): row = link icon + `Coral ERP` 12px/500; right: status pill (20px, 1px border, rounded-full, 10px/500, 6px dot) reading `● —` (grey dot, muted) when nothing sent; ⌄ chevron (rotates 180° when open). When open: mono grey box (`bg-muted/50`, radius lg, padding 12, 12px mono) listing key/value pairs in two columns: `outcome`, `transaction`, `orderRef`, `customerRef`, `sentAt`, `responseAt`, `lineCount` (shows the number of lines, e.g. `3`), `error`; unset values `—`. READ: with a payload it renders pretty-printed JSON in a `<pre>`; pill dot becomes green (`bg-success`) with the outcome text when posted, destructive on error. **Demo should populate this for posted orders** (outcome `ok`/`created`, transaction id, orderRef like `SO-48213`, customerRef, sentAt/responseAt timestamps, lineCount, error null) and show a red `error` state for the failed-then-retried scenario.
- No tabs, no approve/reject/post buttons, no line editing, no activity list in the live drawer (READ: "This record is read-only"). The design's AI-summary strip and a third "image accuracy" figure exist in code comments only; they are not drawn live.

### 2.4 Footer
Left muted `Received 25 Oct 2026, 4:47 pm`; right `Close` outline button.

### 2.5 Example drawer content (invented)
- `DRF-1144  Meera Soft Furnishings` · `25 Oct 2026 · 4:47 pm` · avatars [Anuma mark][A][photo] · `Time to close 8 min` · `Interventions 2`
- Items 3: `KARO` / `109 / NH 2329 / 19` · 6 · Meter; `BIG VICTORIA` / `21 / SSML2931 / BEIGE` · 67 · Roll; `PRIVE` / `17` · 5 · Roll.

---

## 3. RFQs — Axis India (`/orders/rfqs`) — SAW

Axis uses the **older design language** (h1 28px, 14px subtitle, 32px buttons, radius-8, hand-rolled table not AG Grid). Per the brief: keep the structure/tabs/copy, restyle with the NuHome (Mira) language (h1 20px, 28px controls, AG-style table, ring cards, DM.menu dropdowns).

### 3.1 List page
- Rail: Home · **RFQs** · CRM · Products (no Inbox/Orders). Breadcrumb `Axis India / RFQs`.
- Content width ~1192px centered (starts x≈363 at 1710), no card around the page.
- h1 `RFQs` (live 28px/600). Sub: `Everything a customer has asked you to price — matched against your catalog, then converted into a quote.`
- Top-right action cluster (right aligned with h1): segmented `▥ Board | ☰ List` (default **List**), outline button `+ New RFQ`, black button `⬆ Upload BOQ` (cloud-upload icon).
- Filter row (list view): search `🔍 RFQ number or customer reference` (248×34), then 4 dropdown buttons (outline, chevron):
  - `All statuses` → menu: `All statuses` (✓), `Received`, `Matching`, `Needs Review`, `Ready`, `Quoted`, `Exported` — each with a coloured dot (grey, blue, orange, teal, green, emerald).
  - `All accounts` → popover with search input `Search accounts…` and rows: account name left, mono code right (`AC-1001`). (Live only has one account: `Chidananda K M`.)
  - `Any source` → `Any source` (✓), `Email Attachment`, `Email Body`, `SAP`, `Custom Webhook`, `Manual`.
  - `Newest first` → `Newest first` (✓), `Oldest first`, `Number (desc)`, `Number (asc)`.
- Count line: muted `11 RFQs`.
- Table (bordered rounded card, 40px rows, 12px, column separators with resize affordance, last column clipped):
  | Header | Cell |
  |---|---|
  | RFQ | `RFQ-202608-1011` mono, grey (muted) |
  | Account | **bold** account name if assigned; `Unassigned` regular grey if not |
  | Their reference | free text (empty in live) |
  | Source | `Manual` (others: Email Attachment, Email Body, SAP, Custom Webhook) |
  | Lines (right aligned) | **bold** integer (`120`) |
  | Status | pill with dot: `● Received` grey, `● Needs Review` orange on light-orange fill; others: Matching blue, Ready teal, Quoted green, Exported emerald |
  | Received | `27 Aug 2026` |
  Row click → `/orders/rfqs/<n>`. No pagination bar, no row actions.
- Number format: `RFQ-YYYYMM-NNNN` (`RFQ-202608-1011`).

### 3.2 Board view (`?view=board`; add `&expand=1` when expanded)
- Filter row (board): search, `All accounts`, `Any source`, `Newest first` (no status filter) and, far right, `⇕ Expand` / `⇕ Collapse` button.
- Count `11 RFQs`. Six columns, horizontally scrollable, each ~268px wide, light-grey lane (rounded-xl, p-2), header = status dot + bold status name + count (`10`) muted + right-aligned `522 lines`:
  `● Received 10 · 522 lines` (grey) · `● Matching 0 · 0 lines` (blue) · `● Needs Review 1 · 50 lines` (orange) · `● Ready 0` (teal) · `● Quoted 0` (green) · `● Exported 0` (emerald). Empty lanes are short grey boxes.
- Card (white, rounded-xl, ring): bold account name (or grey `Unassigned`); mono small RFQ number; `Manual` source; hairline; footer row `📄 120 lines` left, `27 Aug 2026` right. **Expanded**: adds a two-cell box `RECEIVED 27 Aug 2026 | AGE 61.3 d` (tiny uppercase labels, 12px values).

### 3.3 New RFQ dialog (SAW)
Modal ~640px, radius 14. Title `New RFQ`; sub `Key in what the customer asked for. Matching runs against the catalog afterwards — you don't need SKUs here.` Fields: `Account (optional)` select `Select account ⌄`; `Customer reference` input `Their RFQ number or subject`; `Notes (optional)` input `Anything the lines don't say`; `Requested lines` label + `+ Add line` outline button; a line row: inputs `What they asked for` (wide), `Their code`, `Qty`, `Unit`, trash icon. Footer: `Cancel` (outline), `Create RFQ` (black, disabled until a line is filled).

### 3.4 Upload BOQ dialog (SAW)
Modal ~400px. Title `Upload BOQ`; sub `One RFQ is created from the sheet, with its lines read out automatically. Set the account and fix any line afterwards.` Drop zone (dashed): cloud-upload icon, bold `Drop a sheet, or click to browse`, muted `.xlsx, .xls or .csv`. Footer `Cancel`, `Upload` (disabled until file).

### 3.5 RFQ record page (`/orders/rfqs/<n>`; tab param `?tab=line-items|timeline|attachments`)
Full page (not a drawer), content ~1260px wide, 30px padding.
- Header row: ← icon button (28px outline) · title `RFQ-202608-1002` **24px/600** + account in muted grey 24px (`Chidananda K M`; `Unassigned` if none) · right cluster: status dropdown button `● Needs Review ⌄` (menu = same 6 dotted options as the filter, no "All"), grey/disabled-looking primary `Convert to quote` (enabled when status allows), `⋯` icon button whose menu has one item `✎ Edit details`.
- Tabs (underline style, 12px, icons): `▦ Overview` · `☰ Items 50` (count chip) · `∿ Activity` · `📎 Attachments`.

**Overview tab**
1. Four stat cards in a row (each ≈300×124): icon tile + label, big number, muted caption:
   - `Matched as proposed` **5** — `Anuma's code, kept as it came` (check-circle)
   - `Replaced` **1** — `Anuma was wrong, a human fixed it` (arrows-left-right)
   - `Expanded` **1** — `One request line, several parts` (layers)
   - `Merged` **0** (value grey when 0) — `Lines bracketed into a group` (box)
2. Two cards side by side (equal), each with header (icon + title, hairline below):
   - `⏲ Needs details` (amber clock): body `No line is waiting on the customer.` (or a list of lines needing details).
   - `🚫 Regret` (red ban icon) with right side `View all` outline button + red count badge `4`: list of regretted lines — bold request title (truncated with …), then the regret note (`testastaesfasdf`, or muted italic-less `No note recorded — nothing says why we aren't quoting it.`), then muted `1 · 121330 Nos` (line no · qty unit).
3. Below, two cards: `∿ ACTIVITY` (small-caps label) with `View all` button — rows: 20px avatar (initial `N`/`CK`), bold email/user + sentence (`Updated Rfq: RFQ-202608-1002 - Manual (Changed fields: account)`), date right (`31 Aug`); and `📎 SOURCE FILES` with count `1 file` right — row: green file tile, filename `27434_-_INPUT.xls`, muted `50 lines off 1 sheet · sender@mail.in · 26 Aug 2026`, `📄 Preview` outline button.

**Items tab** (`?tab=line-items`)
- Toolbar: search `🔍 Search lines, codes, titles`; filter chips with counts: `All 50`(active, grey pill) · `Pending 39` · `Resolved 7` · `Needs details 0` · `Regret 4` (URL `&lines=pending`); right `⌄ Expand all 2` outline button (2 = kit lines).
- Grid (AG-style; no outer card border, hairlines) columns: `#` (row number; becomes a checkbox in edit mode; kit rows show an expand chevron `›` before the number) · `Original request` (flex; text as the customer wrote it; **regret rows are struck through and grey**) · `Type` (`Kit` or empty) · `Matched SKU` (chip: coloured dot + **bold SKU** + muted `+4` = number of alternates; **green** chip = confirmed match, **amber** chip = proposed/unconfirmed, struck grey bold text for regret) · `# Qty` (bold numbers, struck for regret) · `Unit` (`Nos`) · `Review` (right cell: red `🚫 Regret`, green `✓ Confirmed`, empty for pending).
- **Row click enters inline edit mode** (nothing saves until ✓): the `#` cell becomes a checkbox, original-request becomes a focused text input (text pre-selected), Qty and Unit become small inputs, and the Review cell shows three icon buttons: `✓` (confirm, turns green on hover), `⇄` (replace match), `⋯` (more). Escape cancels.
- `⇄` opens **Pick the catalog match** dialog (~636px): small muted `Pick the catalog match`, bold line code (e.g. `ARTU0004M04-001`), ✕. Table: radio/`#` · `Code` (bold) · `Description` (`RING TYPE TERMINAL LUGS - UNINS…` truncated) · `Match` (green-dot chip `● 92%`). Below table, centered: `Didn't find the product you were looking for? **Search catalog**`. Footer: outline `🚫 Regret` left; black `✓ Confirm match` right (disabled until a row is picked).
- Footer summary bar (sticky bottom): left muted `50 lines · 11 decided · 39 remaining · 4 excluded`; right `Matched cost 0.00` · bold `8 quote lines` · muted `39 lines still to decide` · disabled grey `➤ Send to SAP` button (enabled once everything is decided). (`Convert to quote` in the header is the other forward action.)
- Example lines (invented, electrical): `4 Sqmm Bootless Type Lugs → AEC90264-001 +4 · 11200 Nos · ✓ Confirmed`; `6 Sqmm Bootless Type Lugs (Kit)` expandable; `35 Sqmm pin Type Lugs (Kit) — struck — 352.02 Nos — 🚫 Regret`; `2.5 Sqmm Ring Type Lugs with 4mm dia Hole → ARTU0002M04 +4 · 0 Nos · ✓ Confirmed`; `4 Sqmm Ring Type Lugs with 4mm dia Hole → ARTU0004M04-001 +1 (amber) · 0 · (no review)`; `Cable Gland suitable for 11kV, 1C X 630 SQMM Cable with Check nut, Shroud and Earth Tag … → CZG0063LBK-001 · 392 Nos`.

**Activity tab** (`?tab=timeline`): single bordered card; vertical timeline with a circular history icon per row and connecting line; row: sentence 13px (`Updated Rfq: RFQ-202608-1002 - Manual (Changed fields: account)`), muted `actor · 31 Aug 2026, 18:45`; right-aligned small outline tag `logged` or `auto-drafted`.

**Attachments tab** (`?tab=attachments`): one card per file: green file tile, filename bold, muted `1 sheet · 50 lines extracted · 26 Aug 2026, 12:33 · sender@mail.in`, right buttons `👁 View` and `⬇ Download`. (While loading the filename shows `Loading…`.) `Preview`/`View` opens a file-preview dialog with the sheet grid (not captured).

### 3.6 Fake-data guidance for Axis RFQs
11–14 RFQs in `RFQ-2026MM-NNNN` numbering, mostly `Received` with a few `Matching`, `Needs Review`, `Ready`, `Quoted`, `Exported`; sources mix Email Attachment / Email Body / SAP / Custom Webhook / Manual; line counts 2–125; each RFQ needs 20–50 lines with realistic electrical SKUs (lugs, glands, MCBs, cables), a source file (`.xls`/`.pdf`), activity entries, regret notes, kit lines (2) with expandable parts.

---

## 4. Other facts observed that touch this scope
- Notification/Ask panel (chat icon, top right) in Stuffcool opens a side panel: `Anuma` / `reads the whole of Stuffcool` / `How can I help you today?` / `Ask about the costing cycle — where the delay sits, who is slow to start, what is past the SLA.` with three chips `Where is the delay coming from?` · `Who is slowest to start?` · `How fast is costing once it starts?` (not in this spec's scope; flag for the Home/Ask owner).
- NuHome Inbox **View all orders** (SAW): not an orders list. It toggles an inline history in the chat: earlier cases appear above with divider chips (`#271026-1 Current 27 Oct 2026, 1:59 pm`, `Case #251026-4`); the header button turns black and reads `✕ Close all orders`. The inbox footer pill (when a case is selected) reads `No summary · [Anuma mark] Anuma handling · ✋ Take over · 📋 · ⋮`.
- Draft rows in the Case column link to inbox threads (`?thread=<id>`); `Open chat` in the drawer does the same.

## 5. Animation / behaviour noticed
- Drawer: slides in from the right with fade (~250ms ease-out); scrim fades in.
- Period segmented control: instant switch, summary cards re-fetch (values show `—` briefly), sparkline redraws.
- Calendar popover: pop-in (fade+scale .95→1, ~100ms).
- Dropdowns (Views, Columns, RFQ filters, status): shadcn dropdown, 100ms fade/zoom, 10px radius, ring + shadow.
- RFQ Items: inline edit swaps cells without layout jump; kit chevron rotates on expand.
- Board: horizontal scroll with lane widths fixed; Expand toggles card height (adds RECEIVED/AGE box).
- Coral ERP card: chevron rotates 180°, content collapses with height transition.

## 6. Surprises (summary)
1. NuHome "Orders" = the draft-orders module renamed; there is no confirmed-orders list or ERP sync-log screen anywhere — drop those from the demo.
2. The draft record is a read-only 800px drawer with just two figure cards, an items table and a Coral ERP card (no approve/reject/post/edit); ERP info is a key/value box that is empty (`—`) unless posted.
3. Stuffcool's drawer says Coral ERP too — Tally is not what that tenant shows; the Tally story is ours to invent consistently.
4. Only the Assigned-to column filter works; the other column funnels are decorative (dimmed). Summary cards follow the period + Compare; the grid does not.
5. Axis RFQs is a rich page (board + list, kit lines, inline-edit lines, match dialog, Regret, Send to SAP, Convert to quote, source-file preview) in the older design language — keep its structure, restyle to Mira.
