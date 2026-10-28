# Spec: app shell, Home / Dashboard, Notifications, Ask panel, Logs

Captured 2026-10-27 from the signed-in live app at a real viewport of **1710×959** (CSS px; the screenshot tool downsizes, so trust the measurements here, not the screenshots). Real customer data is NOT reproduced: example rows are invented, structure and formats are exact.

Tenants (use these URLs; the workspace root redirects to the last visited route, so click the rail item instead of relying on the root):
- NuHome (the **NewHome** use case): `/ws/CpMoYBTj`
- Axis India (the **Access** use case): `/ws/BqOROWFj`
- Stuffcool: `/ws/6AqQi9t4`

Typography baseline everywhere: Inter, **12px** body (`text-xs`), muted text `oklch(0.556 0 0)`, foreground `oklch(0.145 0 0)`, border `oklch(0.922 0 0)`, radius base 10px. Tables are AG Grid. All popovers/menus use the same shadcn "mira" look (below).

---

## 1. Shell

### 1.1 Layout
- Window background `#fafafa`. Rail = **216px** wide container with 8px padding (inner 200px). Content = white inset panel starting at x=216, **margin 8px**, radius **10px**, height `100vh − 16px`, shadow ring `0 0 0 1px rgba(10,10,10,.06)`-ish.
- Top bar inside the panel: **48px** tall, padding `0 30px`, gap 24px. Left: breadcrumb. Right: chat icon button + bell icon button (28px square, radius 8, ghost; bell has a red count badge `9+`, 16px high, white 9.5px/600 text, radius full, offset top-right).
- Page content area is a centred column; widths used on live: Home 1104px, Logs/Agents/Channels/Apps/Settings 980px, Notifications 712px, legacy Axis/Stuffcool Dashboard 1080px. Data pages (CRM, Products, Orders, RFQs) are full width with 30px side padding.
- Page enter animation: `os-enter` (opacity 0→1, translateY 6px→0, ~300ms ease). Popovers `enter` 100ms (fade + zoom 95→100%). Sidebar items transition `background-color, color 0.2s linear`.

### 1.2 Breadcrumb
`<Org name> / <Page>` — org name muted, page name foreground/500, 12px, separator `/`. **Only the top-level module label is shown — detail pages do not add a segment** (Axis `/orders/rfqs/2` shows `Axis India / RFQs`; NuHome Humans shows `NuHome / Humans`; agent detail shows `NuHome / Agents`; workflow detail `NuHome / Workflows`). Notifications page shows only `NuHome` (no page segment). In the demo the org name is **Demo Merchant User**.

### 1.3 Rail
Top → bottom:
1. **Org switcher** button: 200×40, radius 8, padding `0 8px`, gap 8. 28px org tile (rounded-lg; NuHome = black tile with white `•▬` mark; Axis = small flag-style logo image; Stuffcool = dark triangle mark; fallback = 28px `#f5f5f5` tile with 10px/500 initials), name 12px/500 above role 11px muted ("Admin"/"Member"), chevron-down on the right (flips to chevron-up while open). Hover bg `#f5f5f5`.
2. **Search** button: 200×32, radius 10, 1px border, search icon, text "Search…" 12px muted, right-aligned `⌘K` kbd (10.5px muted, no box).
3. Group label **NAVIGATE** — 10px/500 uppercase, letter-spacing ~.05em, colour foreground @60%, height 28px, padding `0 8px`.
4. Nav items: height **32px**, padding `0 8px`, radius **10px**, 12px, icon 16px (lucide), gap 8, colour foreground @80%; hover bg `#f5f5f5`; active bg `#f5f5f5` + text foreground weight 500. Optional trailing muted count.
5. Flexible space, then a 1px divider (`border-top`) and group label **WORKSPACE**, then items. **Settings** is the last item with a trailing chevron-up (opens a menu upward).
6. Divider, then the **account row**: 200×~44, radius 10, 32px **rounded-lg photo** (radius 8, `object-fit: cover`), name 12px/500, email 11px muted (trunc), trailing chevron-up. Clicking opens the account menu.

Rail contents per tenant (labels/icons exact; icons are lucide):
| Tenant | NAVIGATE | WORKSPACE |
|---|---|---|
| NuHome | Home (layout-dashboard), Inbox (inbox), Orders (file-text), CRM (users), Products (package) | Agents (bot), Workflows (workflow), Channels (radio), Apps (blocks), Logs (history), Settings (settings) |
| Axis India | Home (label "Home", page titled "Dashboard"), RFQs (file-text), CRM, Products | Agents, Workflows, Channels, **Merchant Apps**, Logs, Settings |
| Stuffcool | Dashboard, Inbox, Draft Orders, CRM, Products, Campaigns | Agents, Channels, **Merchant Apps**, Logs, Settings (no Workflows live; per the user's latest brief the demo gives Stuffcool **Workflows** and drops **Campaigns**) |

Routes: NuHome Home `/`, Inbox `/inbox/threads`, Orders `/orders/drafts`, CRM `/crm/accounts`, Products `/products`, Agents `/agents`, Workflows `/workflows`, Channels `/settings/channels`, Apps `/settings/integrations`, Logs `/settings/logs`, Settings → `/settings/organisation|navigation|users|rulebook|usage`. Axis: RFQs `/orders/rfqs`. Stuffcool: Draft Orders `/orders/drafts`, Campaigns `/campaigns`.

### 1.4 Org switcher menu (click the org button)
Menu 256×193, radius 10, padding 4, ring + shadow-md, opens below the trigger, left aligned at x=8.
- Label row **Organisation** (12px/500 muted, padding `6px 8px`).
- Items (40px tall, radius 8, padding `4px 8px`, gap 8): 28px tile + name 12px/500 over role 11px muted; the current org has a trailing ✓.
  - `Axis India — Admin`, `NuHome — Admin ✓`, `Stuffcool — Member` (live). Demo: only **Demo Merchant User — Admin ✓**.
- 1px separator, then **Organisation settings** (28px item, gear icon 16px) → `/settings/organisation`.

### 1.5 Settings menu (click Settings in the rail)
Menu 224 wide × 168, padding 4, opens **above** the Settings row, left edge x=8. Five 32px items (icon 16px + label 12px, radius 8): **Company**, **Navigation**, **Humans**, **Rulebook**, **Usage**. Same five in all three tenants. Hover/focus bg `#f5f5f5`.

### 1.6 Account menu (click the account row)
224×136 menu above the row. Header block (name 12px/500, email 12px muted, padding `6px 8px 4px`) with a 1px separator under it; **Edit profile** (user-cog icon, 32px item) → profile; separator; **Sign out** (log-out icon, **destructive red** text/icon, 32px item).

### 1.7 ⌘K command palette
Opens centred, ~24% from top. Dialog **520×441**, radius **14px**, padding 4, ring + big shadow, dark overlay (`black/40`, fade 150ms).
- Search row: 480×20 input with leading search icon, placeholder **"Search or jump to a section…"**, 12px.
- List (max height 360, padding 4): group headings 12px/500 muted padding `6px 10px`; items 496×32, radius 8, padding `6px 8px`, icon 16px + label; the **selected** row has bg `#f5f5f5` and a trailing `↵` hint.
- Groups: **Navigate** (the NAVIGATE rail items) and **Workspace** (Agents, Workflows, Channels, Apps/Merchant Apps, Logs, Settings, **Company, Navigation, Humans, Rulebook, Usage**) — 16 items in NuHome. It searches **section names only**; any non-matching text (e.g. a customer name) → centred "No results found." (dialog shrinks to 520×169).
- Footer bar (37px, padding `8px 12px`, top border): `↑ ↓ Navigate`, `↵ Open`, right `esc Close` (kbd chips).
- Items per tenant follow the rail (Axis: Home, RFQs, CRM, Products, …; Stuffcool: Dashboard, Inbox, Draft Orders, CRM, Products, Campaigns, …).

### 1.7a Chat icon → "Ask Anuma" side sheet
Click the chat (message-square) icon. A right sheet **404px wide**, full height (inset 8px), radius 14, ring + shadow-lg, slides in; the page content behind stays interactive-looking (no heavy dim).
- Header: 28px black Anuma mark, **Anuma** 14px/500, sub "reads the whole of {Org}" 12px muted (e.g. "reads the whole of NuHome"); right: **Past chats** (history icon, 28px) and **Close** (x) buttons.
- Empty state (vertically centred): 40px black round mark, **"How can I help you today?"** 14px/500, muted paragraph "Ask about the costing cycle — where the delay sits, who is slow to start, what is past the SLA." (max ~280px, centred).
- Suggestion chips (24px high, full-radius, 1px border, 12px/500, horizontally scrollable): **"Where is the delay coming from?"**, **"Who is slowest to start?"**, **"How fast is costing once it starts?"**
- Composer card (378×~76, radius 10, border, focus ring): textarea placeholder **"Ask about opportunities, delay, costing…"** (after the first message: **"Ask a follow-up…"**); bottom row of 28px ghost icon buttons: attach (paperclip, tooltip "Attach a file — coming soon"), mention (`@`), spacer, voice (mic, "Voice input — coming soon"), **Send** (28px round, grey when empty, black when text present, arrow-up icon).
- **Past chats** view: header history icon becomes active; full-width outline **"New chat"** button (pencil icon); group headings **"Previous 30 days"**, **"September 2026"** (muted 12px); rows are full-width bordered cards (radius 8, padding `6px 10px`, 12px): e.g. "Where is the delay coming from?", "Hi, how many products are there?", "Where is the delay coming from?", "How fast is costing once it starts?", "<Contact> — Customer Test", "Catalogue and prices — Customer Test".
- Conversation view: user message = right-aligned bubble (muted bg, radius ~16px, 12px); assistant = left, 24px black mark avatar + text block with **bold bullet leads** (list style disc), paragraph spacing ~8px; example assistant copy: "I don't have enough context to answer your question about where a delay is coming from. Could you provide more details? For example: • **Are you asking about a specific order?** (If so, which customer or order ID?) • **Is this about a product shipment or delivery?** • **Are you referring to a sales cycle or deal progression?** …"
- Same panel & copy in Axis and Stuffcool ("reads the whole of Axis India" / "…of Stuffcool").

### 1.8 Bell popover (click the bell)
Popover **416×526** (max), radius 10, ring + shadow, right-aligned under the bell (x≈1256, y=56). Header: **Notifications** 14px/600 + black count chip (`15`, 18px high, white 10.5px). List rows (each ~66px, padding `10px 16px`, divider between): left 28px bordered icon tile (radius 8): **scan** icon = Product for review, **arrow-left-right** = Hand-off, **message-square-reply** = Chat assigned to you, **arrow-up-right** = Escalated to you, **file-diff** = Changes to review. Title line: 12px; **bold (600) when unread, regular muted when read**, then `·`, green WhatsApp glyph, `<Account> · <case no>` muted, date right (`25 Oct`, 11px), unread = black 7px dot. Second line = preview (12px, may start with a 20px rounded-sm thumbnail of the photo the customer sent). Unread rows have bg `muted/60`. Footer: full-width outline button **"View all notifications →"** (32px).
- Empty state (Axis/Stuffcool): header "Notifications" (no chip), centred 36px tile with bell icon, **"No notifications yet"** 12px/600, **"You're all caught up. New updates will show up here."** muted, then the footer button.

### 1.9 Notifications page `/notifications`
Breadcrumb shows only the org. Column 712px wide centred. h1 **Notifications** 20/600 with outline **Mark all read** button (32px, radius 8, 12px/500) at right. Below: segmented control `All | Unread (15) | Read` (32px tall, muted bg, radius 10, padding 3; the count is a plain muted number), and a select-style filter button **"All types ▾"** (outline, 32px) whose menu (176×148, items 28px, ✓ on selected) has: **All types, Hand-offs, Assigned chats, Reviews, Updates**.
- Bordered list card (radius 10). Rows 71–75px tall, padding `10px 16px`, divider lines; layout = icon tile + (title/muted line, preview line) + right date + unread dot. Unread = bold title + `muted/60` bg. 50 rows then older ones.
- Row types/copy seen: "Product for review · <contact> · 251026-002 — A product the customer sent couldn't be matched confidently." / "An image the customer sent could not be identified."; "Hand-off · … — Customer asked: \"Delivery date?\""; "Chat assigned to you · … — +91xxxxxxxxxx: “Sent a photo”"; "Escalated to you — You were assigned a conversation: 161026-001" / "Customer asked a question the agent can't answer on its own." / "Customer hit an unexpected error in the capture flow."; "Changes to review — Intake rep message ops proposal is waiting for your review." Click a row → the case in Inbox.

---

## 2. Home (NuHome) — `/` (label "Home")

Container 1104px centred (x=407 at 1710 wide), sections 16px gaps. Everything uses the **Mira card**: radius 10, ring/border, soft shadow `0 2px 6px rgba(0,0,0,.03)`.

### 2.1 Heading row
- h1 **Home** (20/600, tracking-tight) with date line **"Tuesday 27 Oct · ● Live"** (12px muted; green 6px dot + "Live" on Today only).
- Right: two segmented controls (role=tablist, each 25px high buttons, 12px/500, radius 8, muted track radius 10 padding 3):
  - **Yours | Everyone** (default Yours) — "Yours" scopes Waiting and Your buyers to the signed-in user's accounts/cases; Everyone = whole team.
  - **Today | Yesterday | Custom ✎** (default Today). *Custom* opens a **calendar popover** (single-day picker): header `‹ October 2026 ›`, weekday row `Su Mo Tu We Th Fr Sa`, 28px day cells (selected = black filled rounded-lg with white text; today = muted bg; future days muted/disabled; leading/trailing days of other months faint). Picking a day sets `?day=YYYY-MM-DD`. Yesterday = `?day=<yesterday>`.

### 2.2 Today state (default)
Subtitle for section **Today**: "Orders captured and hand-offs to the team, compared with yesterday at this time."
Three stat cards (357×137, gap 16). Card anatomy: header row (px-16 py-12, gap 12): 28px bordered icon tile + label 14/500; 1px **dashed** divider (`mx-16`); body (px-16 py-12): value **30px/600** (lh 36) and under it 12px muted caption.
- **Orders** (file-text) — value, caption "No change" / "+N vs yesterday".
- **Line items** (package) — same.
- **Escalations** (triangle-alert) — value only (no caption when 0).
Section **Waiting** — "Customers Order Desk has handed to you, most overdue first." (Everyone: "…has handed to the team, most overdue first."). Content = grid (AG Grid, same look as tables) with columns **Case** (120px, plain 12px), **Account** (flex, 160 min), **Contact** (flex), **Task** (170, amber/warning badge: "Confirm product" | "Answer question"), **With** (180, hidden in "Yours"; 24px avatar + name, or grey person glyph + "Unassigned"), **Due** (130, right aligned, tabular: red/500 "126 min over", amber "2 min left" when ≤3, muted otherwise). SLA = **15 min**. Sorted by Due ascending.
Empty: bordered card 1104×~160, centred 28px tile with inbox icon, **"Nothing waiting on you"** 12px/600, **"New hand-offs to the team show up here."** (Everyone: "Nothing waiting").
Section **Replies** — "How fast customers hear back, from Order Desk and from the team." Three stat cards: **Team reply** (clock) value e.g. `—` / `3 min`, caption "No team replies measured" / "N cases"; **Order Desk reply** (sparkles) `4 sec` caption "1 case"; **Within 15 min** (check-check) `100%` caption "1 of 1 answered".
Section **Your buyers** — "What the accounts you look after ordered." (Everyone: heading **Buyers**, sub "What every account ordered."). Two cards side by side (544×225, gap 16): **Buyers** and **Products they bought** (Everyone: **Products bought**). Card title 13/600 row with bottom border; then a compact AG grid: Buyers columns **Buyer** (name + grey chip "Sales Person" when the contact has a role), **Orders**, **Lines**, **Hand-offs** (numbers right aligned); Products columns **Product** (style name, bold), **Lines**, **Buyers**, **Quantity** (e.g. `40 m`). Empty: "No orders this day / Buyers show up here as orders come in." and "No products this day / Products show up here as orders come in."

### 2.3 Past-day state (`?day=`)
- Date line becomes **"Monday 26 Oct · Daily report"** (no Live dot); section heading is the date **"Mon 26 Oct"** with sub "Orders captured and hand-offs to the team, compared with the day before."
- Stat cards show a value with a **delta chip** instead of caption: arrow icon (↗ up / ↘ down) + number; colour by meaning: Orders/Line items down = red, up = green; Escalations up = red, down = green. e.g. `3 ↗2` (green) / `0 ↘3` (red) / `2 ↗2` (red for escalations).
- **Waiting is replaced by "Late hand-offs"** — "Hand-offs that took longer than 15 minutes to answer." Grid columns **Case, Account, Contact, Task (badge), Answered by (24px green-tinted initial avatar "S" + name), Took (red right-aligned "126 min")**. Empty: **"No late hand-offs" / "Every hand-off that day was answered within 15 minutes."**
- Replies and Buyers sections as above for that day.

### 2.4 Example data for the demo (invented)
Orders 3 (+2), Line items 4 (+3), Escalations 2 (+2); Late hand-offs: `211026-002 · Sharma Furnishing · 98xxxxxx01 · Answer question · Rohan Mehta · 126 min`; Buyers: `Sharma Furnishing · Sales Person · 1 order · 2 lines · 1 hand-off`; Products bought: `PRIVE · 2 lines · 1 buyer · 40 m`, `ABANA · 1 · 1 · 10 m`.

---

## 3. Dashboard (Axis India & Stuffcool) — legacy layout to be re-skinned in Mira

URL `/` (rail label Home on Axis, Dashboard on Stuffcool). Live uses an **older design** (zinc palette, black text); the demo keeps the structure/copy and swaps to Mira tokens/sizes (foreground `oklch(.145 0 0)`, muted `oklch(.556 0 0)`, card radius 10, 12px base).
- Container 1080px centred. h1 **Dashboard** (live 28/600 → demo 20/600 to match Mira), sub **"Track opportunities, response time, and pipeline value in one place."** (live 14px zinc-500 → demo 12px muted).
- **Date filter**: select-style combobox 200×40 (live) with calendar icon and centred value; demo 200×32 outline select. Options (menu 200×140, 28px items, ✓ on current): **All time, Today, Last 7 days, Last 30 days, Last 90 days** → `?time=today|7d|30d|90d`; the KPI cards (e.g. Drafts pending) recompute; the timeline stays a recent feed.
- **Stuffcool only — "Drafts pending" card**: full-width card, title 14.5/600 "Drafts pending", number **34/700**, caption **"3 older than 4 hours"** (13px muted). Counts `status = pending` drafts; caption counts those pending > 4h.
- **Deal timeline** card (both): header icon `history` + **Deal timeline** 16/600, right link **Full log** (12.5/500 underlined → live `/rules/logs`; **demo → `/settings/logs`**), sub "Opportunities, quotes, orders and governance — what Anuma did and what your team did." (12.5 muted). Body = vertical timeline, **6 rows**, a 1px rail line connecting 30px ring nodes (1px border, white bg). Row: node icon (by event suffix: `*_confirmed|accepted|approved|won` → check-circle in green ring; `*_sent|delivered|published` → send; `*_failed|errored|bounced` → alert-triangle; `*_blocked|rejected|cancelled|lost|expired` → ban; `*_drafted` → file-edit; `*_created` → file-plus; `*_revised` → refresh; `*_scheduled` → clock; `*_received|replied` → message-square; default → pencil); title 14/500 (e.g. "Line confirmed: Copper Lug 16mm × 12mm", "Updated Rfq Line Item: Copper Lug 16mm × 12mm - 3500.000 No (Changed fields: disposition)", "Created Rfq Line Item Component: TINNED COPPER LUGS - DIN 16 - 12 - ATD0016M12 x3500.000", "Created Variant Match Feedback: down: copper lug 16mm 12mm", "Updated Invite: <email> -> Axis India (accepted) (Changed fields: status)", Stuffcool: "Created App Event Log: Stuffcool — 360dialog (WhatsApp — 360dialog) — unknown [pending]", "Case CASE-1009 opened", "Updated Number Sequence: CASE - case (Changed fields: last_number)", "Contact '+91…' created"); meta line `actor · 6 Oct · 7:53pm` 12px muted (+ optional "Open <number>" link for opportunities); **right-aligned pill** (22px, radius full, 11.5/500, padding 0 9px): `confirmed` = green text on 10% green tint + green border; `logged` = white bg, 1px border, muted text; `auto-drafted` = same neutral outline; others by tone (failed red, blocked amber, sent blue). Row height ~48–60px; skeleton rows while loading.
- Axis India has no KPI card above the timeline in live; the demo may add RFQ KPI cards (Open RFQs, Quotes sent, Win rate, Avg time to quote) in the same Mira card style **only if the Access tenant spec elsewhere calls for it**; default = timeline only.

---

## 4. Logs — `/settings/logs` (all tenants identical)
- Centred 980px column. h1 **Logs** 20/600, sub **"Everything Anuma and your team did, newest first."** (12px muted). No filters, no search.
- Day headings (`13 Oct`, `09 Oct`; `DD Mon`, 12px/500 muted, 16px high, 16px above each group) each followed by a **bordered card (radius 10)** containing rows separated by 1px dividers.
- Row (≈92px: padding `12px 16px`): left column = time `17:18` (12px muted, tabular, width 48px); right column stacks: (1) chips row — chip A muted-bg full-radius `generic deleted|created|updated` (22px, 11px/500, padding `2px 8px`, muted text), chip B outline (bg card, 1px border, 24px) `logged` | `auto-drafted`; (2) title 12px/400 foreground e.g. "Updated Rulebook: Brand Voice (Changed fields: banned_phrases)", "Created Rulebook: P6. Lines that need a person", "Deleted Rulebook: test", Stuffcool "Deleted Rulebook: Quotes and playbooks", Axis "Created Playbook: test"; (3) muted 12px `actor · rulebook #25` (actor = display name or email).
- Pagination (only when >50): bottom row, left text `1-50 of 136` muted, right square 32px buttons `‹ 1 2 3 ›` — current page black filled white text radius 8, others outline; arrows disabled when at ends.
- Counts live: NuHome 136 rows (3 pages), Stuffcool ~10 rows in 4 day groups, Axis 1 row (one day).

---

## 5. Motion & states noticed
- Boot: full-screen white overlay with the morse `• ▬` mark pulsing (dot/dash opacity .25↔1, 1.4s) then fading out.
- Sidebar hover/active `0.2s linear`; button press scale subtle; menus `enter` 100ms (opacity + scale .95→1, origin = trigger side); sheet (Ask panel, drawers) slide-in ~250ms; toggles (Yours/Everyone etc.) change the white thumb instantly (tab role) and refetch with the section skeleton (shimmer `tw-shimmer`).
- Stat numbers animate on change in the app; unread dots are static; the bell badge pops.
- Focus rings: 3px ring `foreground/10` + border darkening; inputs 28px high, radius 8.

## 6. Demo mapping notes (for phase 2)
- Org name everywhere = **Demo Merchant User** (single org; switcher lists only it, with "Organisation settings").
- Use-case labels in the header switcher: **NewHome use case**, **Stuffcool use case**, **Access use case** (rail/pages differ per spec above; Access = no Inbox, RFQ-led; Stuffcool = Inbox + Draft Orders + Workflows, no Campaigns).
- Account row = a stock-photo person (rounded-lg 32px); use the same persona in logs/avatars.
- Replace "Coralio" anywhere with **Coral** (the live app says "Coral ERP").
- "Full log" links → `/settings/logs`; the legacy `/rules/logs` side-rail page is out of scope.
