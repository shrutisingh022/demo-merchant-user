# Inbox spec (NuHome + Stuffcool) — live app captured 2026-10-27

Source of truth = merchants.anuma.run, tenants **NuHome** (`/ws/CpMoYBTj/inbox/threads`) and **Stuffcool** (`/ws/6AqQi9t4/inbox/threads`). Axis India has **no Inbox**. All names/numbers below are **invented stand-ins**; structure, copy templates, sizes and colours are exactly what is live. Items marked **[SRC]** were not visible live and come from the repo (`src/app-v2/inbox`). Items marked **[?]** were not observed.

Real live viewport during capture: 1710×959 (DPR 2). Fonts: Inter Variable. Base text in this screen is **12px**. Colours are the shadcn neutral tokens (`foreground oklch(.145 0 0)`, `muted-foreground oklch(.556 0 0)`, `border oklch(.922 0 0)`, `muted oklch(.97 0 0)`).

---
## 1. URL / routing
- `/inbox` → redirects to `/inbox/threads`. Selected case = `?thread=<8-char id>` (first case auto-selected on load).
- Filter tab = `&status=closed` (also `open`, `escalated`; `All` = no param). Sort = `&sort=last_activity.oldest` (newest = no param). Search = `&q=<text>`.
- Header numbers picker is stateful in UI only.
- Layout is 3 columns inside the white content panel: **list 289px** | **chat flex** | **right column 262–320px** (collapsible). Whole inset is 1486×839 at 1710 viewport.

## 2. Case list column (width 289px, full height, right border)
### 2.1 Header block (padding ~14px)
1. **Numbers picker** — button: WhatsApp glyph (green, 16px) + **"All numbers"** (14px/600) + chevron-down. Opens a DropdownMenu (rounded-lg 10px, p-1, ring-1 foreground/10 + shadow-md, width ≈ trigger width 261px):
   - NuHome: item 1 (44px tall, two lines): **All numbers** / muted *Across both WhatsApp inboxes* (checked state implied); items (28px): `+917391914040`, `+91 22 6998 5635`; separator; muted item (32px, icon +) **Add WhatsApp number**.
   - Stuffcool: **All numbers** / *Across all WhatsApp inboxes*; `+918879691427`; separator; **Add WhatsApp number**.
   - Choosing a number filters the list to cases on that inbox; footer count updates.
2. **Search row**: input group (225×28, radius 8, 1px border, white) with search icon left, placeholder **"Search cases"** (12px); a × clear button appears when text present. Right of it a **28×28 icon button (sort)**, aria-label "Newest first. Switch to oldest first", title "Newest first — click for oldest first"; clicking toggles `sort=last_activity.oldest` (icon flips, list reverses, title becomes the reverse sentence). It is a toggle, not a menu.
   - Search matches **case number, name and phone only** (not message text): "gayatri" returned an empty list although a preview contained it. Empty state in the list: round-square icon tile (search icon) + **No matches** (bold) + muted **Nothing here matches “gayatri”**. Footer shows "0 cases · Stuffcool". Search is debounced (~300ms), writes `q=`.
3. **Tabs**: segmented control, container 251×32 (bg muted, radius 10, padding 3), tabs `All · Open · Escalated · Closed` each 12px/500, 25px tall, px-12, radius 8; inactive text 60% foreground; active = white bg + hairline shadow. No counts inside the tabs. (NuHome: All 19 / Open 1 / Escalated 1 / Closed 17; Stuffcool: All 5 / Open 2 / Closed 3 / Escalated 0.) Tab choice → `status=`.

### 2.2 Rows (289×97, padding 10px 14px 8px, gap 6px, bottom border, left-aligned button)
Anatomy, top to bottom:
- **Line 1** (20px): left = **case chip**, right = **time** (12px/400 muted-foreground, right aligned).
  - Case chip = rounded-full pill, 10px/500, padding 2px 8px, 1px border, leading 6px status dot. States:
    - **open**: text `#13a269`, bg `#eefbe8` (success-tint), green dot. Example `● 271026-1`.
    - **escalated**: amber text, amber dot (`#f4b23e` dot, text amber-ink `#9a6208`), row background tinted warm yellow (`warning-tint #fefce8`, ≈ #fefce8 at full row width).
    - **closed**: grey text/dot on grey chip (muted bg). Example `● 251026-2`.
  - **SLA pill** (Stuffcool, open cases only): next to chip — outline amber pill with clock icon, 10px/500 text **"⏱ 21:24 left"** (mm:ss left in the WhatsApp 24h window? it counts a countdown; format `21:24 left`). NuHome (older cases) shows instead a red pill **"⏱ 16:41 over"** on overdue open cases (seen on the first screenshot of case 261026-1 earlier in the session). Pill disappears on closed cases.
  - **Unread chip** (Stuffcool 1008): 18px green (`#13a269`) circle, white 10/600 number, sits left of the time.
  - Time format: today → `1:59pm` / `4:07pm`; yesterday → `Yesterday`; within a week → weekday `Sun`, `Thu`, `Wed`, `Fri`, `Sat`; older → `19 Oct`, `29 Sept`, `16 Sept`, `6 Aug` (day + short month, "Sept" for September).
- **Line 2**: **customer name** bold 12px/600, followed by muted regular **contact name** after a comma when they differ: `Shruti, Shruti singh`, `Asutosh, +917684824635`, `Mani, +919900466819`, `Anuma Intelligence - Test, Pankaj`. Unknown number → just the phone `+918828141788` bold.
- **Line 3**: preview, 12px/400 muted-foreground, 1 line truncated. Outbound previews start with ticks: `✓✓` (grey double tick, 14px) then text; inbound preview is plain; call-transcript preview starts `customer:`. Examples: `Hi! Thanks for reaching out to NuH…`, `Thanks — your order (#164) is confirme…`, `I couldn't confidently match "Leaf No: 9…`, `Document`, `😂`, `Ho`.
- **Right edge, vertically at preview line**: a 24px circular **Anuma mark** (black circle, white ·▬ glyph) with a 2px **green ring** when the AI agent currently holds the case (`● handling`). When a human has taken the case the avatar is that person's photo (24px, 8px radius). Closed cases show neither.
- **Selected row**: bg `muted/60` and a **2px black bar on the left edge**; hover bg `muted`.
- Order: by last activity, newest first.
- **Footer** (44px, top border): muted 12px **"19 cases · NuHome"** / **"5 cases · Stuffcool"** / "1 case · NuHome" (singular) / "0 cases · …".
- Loading: skeleton rows (shimmer) [?]. Empty list (no cases at all) [?].

### 2.3 Case numbering
- NuHome: `DDMMYY-n` — day, month, 2-digit year of the case opening, then a per-day counter: `271026-1`, `261026-1`, `251026-2`, `161026-4`, `060926-6`. In the chat header the same number is shown after the phone; the system line uses the 3-digit form **"case 271026-001 opened"**.
- Stuffcool: plain sequence `1009`, `1008`, `1007`; system line **"case CASE-1009 opened"**; the Activity timeline says **"Case CASE-1009 opened"**.

## 3. Chat column (header 68px + stream + footer)
### 3.1 Header (68px, no border; bg white)
- Left: **Title** 16px/600 = customer/account name (or the phone number); **sub-name** 14px/400 muted right after it on the same line (contact name, e.g. `Neil  Neil`, `Pankaj  Anuma Intelligence - Test`, `+919820320486  +919820320486`). Line 2 (12px muted, mono-ish digits): **phone** `919167000410`, a thin vertical separator, then **case number** `161026-1` (Stuffcool: only `1009`).
- Right button cluster (all 28px high, h-7, radius 10, 1px border except icon-only):
  1. **`🗒 N comments`** (button with file/comment icon). title: "N comments on this case — internal, never sent to the customer". Opens a **popover** (280×357, scrolls) anchored under the button: header **"17 comments"**; rows = avatar (24px photo of human author or black Anuma mark) + author (12px/600) + right-aligned date (`Fri, 11:12am`, `Thu, 11:41am`, `19 Oct, 12:03pm`) + 2-line clamp of the comment text; newest first. Shown only if N>0; button absent otherwise (Stuffcool open cases show no comments button).
  2. **Status dropdown** — pill button `◯ Open ▾` / `◯ Escalated ▾` (leading status icon). Menu 224×92: **Open · Escalated · Closed** with ✓ on the current one. **Closed cases**: button is shown greyed/disabled with title "This case is closed — it reopens on its own if the customer writes again". Choosing a value writes a system line (`System set status to **Closed**`) and an Activity row.
  3. **`⟲ View all orders`** — title "Show every message on this thread". Toggles **all-history mode**: button turns solid black and reads **`✕ Close all orders`**; the stream loads every past case of the same customer, separated by **case dividers** — a centred rounded pill `Case #101026-5` (sticky at top while scrolling; 11px, white bg, hairline border) and in-stream rows with ticket icon `#131026-4 · 13 Oct 2026, 6:30 pm`; "Scroll up to load older messages" at the very top; a small vertical **minimap/scrubber** handle appears at the right edge of the stream.
  4. **Panel toggle** — 28px icon button (title "Show details"/"Hide details", aria "Show details") collapses/expands the right column; when collapsed the chat widens and the button stays at the far right. Hidden for cases that have no right column content? (the right column is always present except for the legacy email layout).
  - [?] An in-chat search icon was visible in an earlier 1710px screenshot only for cases without a right column; not reproducible at 1512px. Treat as optional; if built, it opens an inline search bar above the stream.
- Header responsiveness: at ≤1512px viewport the right column auto-collapses nothing; buttons keep labels.

### 3.2 Stream (`.os-chat-stream`, WhatsApp wallpaper)
- Background: the doodle wallpaper (`chat-wallpaper oklch(.943 .011 71.9)` + doodles) — the same on every WhatsApp case. Stream padding 18px top, ~28px sides; vertical rhythm `space-y-[10px]`, groups separated by 14px; system lines separated by 13px.
- Top: muted underlined link-button **"Show earlier conversation"** (12px, centred); appears when the stream is truncated. Long cases also show **"Show 12 earlier events"** (muted, centred) collapsing old activity lines, and an overlay **scroll-to-bottom FAB** (32px white circle, arrow-down) when scrolled up.
- **Unread divider** (Stuffcool 1009/1008 on first open): full-width hairline with centred muted text **"2 unread messages"**.
- **Inbound bubble**: white bg, radius ≈ 18–22px (capsule when one line), max-width `min(72%, 624px)`, text 13px/400 foreground, padding ≈ 8px 12px, shadow none/very light; time 10px at 60% opacity inline to the right of the last line (`1:59pm`, `12:14pm`). Emoji-only message `😂` renders in the same bubble.
- **Outbound bubble (agent/Anuma or staff)**: bg `#d9fdd3` (`bubble-outbound oklch(.957 .067 141.1)`), text oklch(.215 .019 235) ink, same radius/max-width, aligned right; time + **ticks** (`✓✓` grey = delivered, **blue ✓✓ = read**, single grey ✓ = sent) at bottom-right. To the **right of the bubble (outside)** a 24px avatar: black circular **Anuma mark** for agent messages, **the human's 24px rounded-lg photo** for messages typed by staff.
- **Quoted reply** (outbound or inbound): inside the bubble at top, a rounded inner box (darker green tint on outbound `rgba(0,0,0,.06)` over green; light grey on inbound) with a 3px left accent bar, line 1 bold sender (`916361616209` or `Anuma`), line 2 muted quoted text or `[image]`/`Confirm`.
- **Image bubble**: 252×176 photo (radius 8), time overlaid bottom-right in white on a dark gradient (`3:48pm`); below its bottom-left corner a 22px white circular **reaction badge** with the emoji (❓ 🏷️ 🧐 👀 ✅ ⭐…) — the agent "reacts" to say what it did (❓ cannot read, 🧐 reviewing, 🏷️ product found, 👀 looking, ✅ confirmed). Optional small label chip above the image: **Approved / Rejected / Expired** (white pill, 11px) = outcome of the review that image triggered.
- **Document bubble** (Stuffcool): inbound bubble with file icon, filename `media-1590393192842890`, size chip `46 KB`, download icon; time below. Followed by pill "Order Desk performed Document Analysis >_".
- **Voice note** [SRC `AudioPlayer`]: inbound/outbound bubble containing a muted pill (`rounded-lg bg-muted px-3 py-[9px]`, min-width 228px): 26px round **primary (black) play button** with white ▶/⏸, a **3px track** (border colour) with black played portion, and **`0:11 / 0:34`** (12px muted, current / total; during playback current counts up). Filename is never printed. Followed by the pill **"<Agent> performed Audio Transcription >_"** whose hover card shows the transcript under "Read from the voice note". Call recordings use the same player inside a card (see 3.4).
- **Interactive reply buttons** (Confirm / Edit / Cancel): attached to the bottom of an outbound green bubble — the bubble contains the message text then, below a hairline, **stacked full-width button rows** 32–34px high each separated by hairlines, labels centred 13px/500 (green-ink): `Confirm`, `Edit`, `Cancel`. Other prompts in the same style: `Yes` / `No`, `Wait` / `Proceed without it`, `Correct`.
- **Comment card** (internal note, never sent to customer): full-width-ish centred card (max ≈ 600px), bg **warning-tint yellow `#fefce8`**, **dashed 1px amber border**, radius 14px, padding 14px; header row: comment icon + **author bold** (`Anuma`, `System`, `Shruti Singh`, `neil batavia`) + muted word **Comment** + right-aligned date `Sun, 3:49pm` / `Yesterday, 4:00pm` / `Today, 11:24am` / `16 Oct, 12:48pm`; a dashed divider; body 12–13px preserving line breaks. Body wording patterns:
  - `Agent flagged 1 line(s) for review:` + `- Leaf No: 9999` lines + `(reask)` / `(no_product_entries)`.
  - `Escalated to human: Customer asked: "Hi can you dispatch today?"` (author System).
  - `Customer asked something the agent can't resolve on its own — needs a human reply:` + `- "<question>"`.
  - `The agent prepared an internal note, not a customer-facing reply — nothing was sent.`
  - `All previously flagged lines resolved — back to full automation.`
  - `Line(s) 674 removed from the enquiry: rejected in review by <email> (Image not recognised). The customer is not asked about them.`
  - `Handoff brief — enquiry #146 (Collecting): 1. VISE-3 36 - NH3541 / 08 — 12.000 Roll …`
  - `Resolution summary — enquiry #184: Converted to #164.` + numbered lines `1. EBONY - 09 — 11.000 Meter`; or `…: Abandoned — no resolution.` + `1 line(s) left unresolved at close.`
  - Staff notes: `[Anuma] Attached variant ABANA - 32 / NH 89214 / 11 to Enquiry Line #726.`, `[Anuma] Edited the order — added 1 line.`
  - Sender-unknown: `Sender has no matching Account/Contact in this merchant's CRM — not engaged with order capture; told to contact the team directly.`
- **System line** (centred, 12px): bold actor + regular verb + bold object: `**System** case 261026-001 opened`; `**System** added tag **Unknown**` (tags seen: Unknown, spam, chitchat); `**System** set status to **Closed**`; `**System** set status to **Escalated**`; `**System** assigned conversation to **Shruti Singh**`; `**Shruti Singh** handed back the conversation to **Anuma**`; `**neil batavia** assigned conversation to **self**`; `**System** closed — **Intake enquiry converted → DraftOrder #164**`; `**System** 919960050504 re-opened the conversation`; `**System** assigned conversation to **AI**`. Hand-off sentence: `**Anuma handed this over** — intake line item review · approved|rejected|expired` (+ `2m` = time taken).
- **Tool-call pill** (centred, 285×30): bg muted, 1px border, radius 10, padding 4px 4px 4px 6px, 12px: clock-ish circle icon + `<Agent> performed **Image Analysis**` / `**Product Search** — ZYRA — 01 / NH 3867 / 17 · 100%` / `**Document Analysis**` / `**Audio Transcription**` / `**Found 2 Products**` / `A reviewer resolved — **ABANA — 32 / NH 89214 / 11**` + a tiny `>_` terminal chip at right. `<Agent>` = persona name: **Anuma** (NuHome), **Intake Agent** and **Order Desk** (Stuffcool). **Hover card** (320px, rounded-xl, shadow): header `>_ **What Anuma read**` muted `1 photograph · Fri, 3:24pm` + 36px thumbnail of the media right; hairline; muted label `Read from the image`; value text (OCR) e.g. `Billing B!!!ng@2026`; for product matches a list of lines with confidence.
- **Hover actions** on any outbound bubble (opacity 0 → 1 on hover, placed to the bubble's left): two 24px ghost icon buttons — **React** (smiley) and **Reply to this message**; when the 24h window is closed they are disabled with title "React — WhatsApp's 24-hour window is closed — the customer has to message first".
- Message copy templates from the agent (use verbatim shapes):
  - Greeting: `Hi! Thanks for reaching out to NuHome. Send us a photo or the product name (and quantity) to place an order, and we'll take it from there.`
  - Unknown sender: `Thanks for reaching out to NuHome. We couldn't find your number in our records — please contact the team directly to get set up before placing an order.`
  - Photo ack: `Checking the photo now, back in a moment.` / `Checking the photo — back shortly.` / `Got it — give me a moment to look at that image, I'll get right back to you.`
  - Added: `Got it — ZYRA - 01 / NH 3867 / 17 — 30.000 Meter added.` (+ blank line + `Checking image 2 — will follow up shortly.`)
  - Quantity ask: `Please send the quantity along with the unit for:` + `1. VISE-3 36 - NH3541 / 08` ; multi-item: `Reply with the amount for each, in the same order — one per line, or all on one line separated by commas (e.g. 10, 5).`
  - Running list: `Here's what I have so far:` + `1. VISE-3 36 - NH3541 / 08 — 12.000 Roll` + `Anything else to add?`
  - Low confidence: `I couldn't confidently match "Leaf No: 9999 / Quality: VERONA / Design: VERONA / Width: 140 CM / 30 M" — could you confirm the exact product name, or share a clearer photo?` (shown as an outbound bubble *quoting* the customer's image).
  - No label: `That photo doesn't show a product label. Send a photo of the label or the product name.`
  - Hold: `I'm still looking into this item and don't want to hold up the rest of your order:` + numbered items + `Want to wait while we sort it out, or proceed with the rest without it for now?` [Wait] [Proceed without it]
  - Review nudge: `Checking a few items — will follow up shortly. Could you also share the Sr No for "TWILL 09 - NH 3024 / 03"?`; idle nudge `Just checking in — you still have Quality: Verona 10m on your enquiry. Should I go ahead and confirm it?`
  - Hand-off: `Got it. Our team will pick this up and get back to you shortly.` / `Our team is looking into this and will get back to you shortly.`
  - Confirm prompt: `Please confirm your order:` + `1. EBONY - 09 — 11.000 Meter` [Confirm][Edit][Cancel]; customer taps → inbound bubble quoting the prompt (`Anuma` / `Please confirm your order: …`) with text `Confirm` and a ✅ reaction badge.
  - Confirmed: `Thanks — your order (#164) is confirmed! We'll get started on it right away.` (outbound, quoting `919820320486 / Confirm`) — Stuffcool alt: `Thanks — your order is confirmed. Our team will take it from here.`
  - Image unreadable (Stuffcool): `Hey! Thanks for sharing that 😊 I can see an image but I'm not quite able to make out the details clearly - could you let me know what this is about and what you'd like us to do for you (quote, product info, etc.)?` and `Could you tell me a bit more — what's the occasion, and roughly how many units are you thinking?`

### 3.3 Composer / footer states (floating, centred 12px above bottom; never a full-width bar)
1. **24-hour window closed** (every closed/old case): floating card 442–560×~48, bg white, radius 14, shadow-lg, padding 10: left a 32px rounded tile (red-tinted, lock icon `#e03a3a`); title **"24-hour window closed"** (12px/600); muted line **"<name/phone> last wrote at 4:47pm on Sun 25 Oct. Free text will not be delivered."** (or `…at 12:14pm yesterday.`); right black button **`🗎 Send a template`** (28px). Clicking opens a **Templates popover** (418×241, anchored above the button): header **"Templates"** with × ; one selectable card per approved template: icon tile + **Curated Options Tpl** (12px/600) + body `Hi {{1}}, here are the options we prepared based on our discussion: {{2}} Just reply with the option number ({{3}}) and I'll process it right away.`; disabled black **`➤ Send template`** until one is selected. (Only one template exists in NuHome.)
2. **Open, Anuma handling** (NuHome 271026-1, Stuffcool 1009/1008): floating **work pill** 442×48 (radius 14, bg white, shadow): `No summary` (muted 12px; becomes e.g. `2 items · 1 to match` when an order is in flight [SRC CaseWorkBar]) · vertical hairline · **Anuma mark with green online dot + "Anuma handling"** (name 12px/600 + muted "handling") · black **`✋ Take over`** button (title "Take this case off Anuma and handle it yourself") · 28px clipboard icon button (aria/title **"View details"**) · 28px **⋮** menu button → menu (176×64): **Assign** (user-plus icon), **Comment** (message icon).
   - **View details** opens a centred dialog (≈460×190, radius 14): title **"Order intake"**, sub `Shruti singh · Shruti`, ✕; blue info banner (info icon, dismissible ×) **"Anuma still has this case. Take it over to edit the order."**; body: line items table (or muted centred **"No items on this order yet."**); footer right `Close`. With lines present the dialog is the editable **Current order** (line rows with qty steppers, remove, add line) [SRC OrderDetailsDialog].
3. **Open, human has taken over** [SRC Composer.jsx]: card: header `IS Replying as <You> · 🕐 6h 05m left · ↺ Hand back · ✕`; textarea placeholder **"Write your message here…"**; toolbar `⊕ attach | ☺ emoji | 🎤` (disabled with titles) and right `🗎 Templates` + black `Send ➤`. Quoted reply adds a header "Replying to <who>".
4. **Email / voice-call channel threads** (NuHome `060926-4`, channel Email/Phone): different layout — NOT the WhatsApp wallpaper. Header: 32px round avatar tile `+9`, name `+912269539631` (14px/600) + second line phone; chips row: amber **`✉ Email`** chip, mono ticket chip **`#060926-4`**, blue dotted **`Returning Customer`** tag; right icons: clock (snooze), mail, outlined button **`📞 Phone Call`**. Body = a white card (full width, no wallpaper): `+912269539631 < +912269539631 >` bold + muted `08 Aug, 2:37 pm`, right icons ☆ ↩ ↩↩ ↪ ⋯; text body = call transcript `customer: …` / `agent: Namaste! I'm NuHome's concierge. This call may be recorded for quality and training purposes. How can I help you today?` then voice recording player [SRC VoiceMessageCard]: card (rounded-2xl border bg-card shadow-xs, min-w 260) with AudioPlayer + two-tone agent/customer transcript turns. Bottom reply box (white card, radius 14, border): `Replying as **You** ▾` (small avatar), textarea `Write your reply here…`, icons `📎 ☺ ✦` and right disabled `Send ➤`.

### 3.4 Empty / loading states
- No case selected / empty inbox: [?] (first case auto-selects on load). Loading shows full-page splash (black · ▬ morse mark pulsing) then list skeleton shimmer [?].

## 4. Right column ("details", 262px wide at 1510px; 320px design width)
Two cards in one scroll area, each card radius 14, 1px border, white, margin 12px; header = title 13px/600 + 28px icon tile top-right (history icon for Activity, sparkle for AI summary — decorative, no action).
1. **AI summary** — only when the case has lines/pending tasks (hidden for cases with nothing; Stuffcool shows none). Body 12px: composed sentence, then muted 11px `Updated 22 Oct · 5:57 pm`. Sentence templates (exact):
   - `<First> has N requested item(s). Still needed: 1 product match · 2 quantities. Anuma will ask <First> for the rest.`
   - `<First> has 1 requested item. The product, quantity and unit details are captured. The case is closed.` (…`Anuma has the case.` when open and complete)
   - `<First> has 3 requested items. Still needed: 1 quantity. The case is closed.`
   - With pending approvals: `… 1 human task remains.`; no lines: `One human task is waiting on this case.` / `N human tasks are waiting on this case.`
   - For unnamed numbers the "First" is the phone: `+919820320486 has 1 requested item.`
2. **Activity** — grouped by day with muted 12px date heading (`27 October 2026`, `23 October 2026`); each event a row: **mono 11px time `13:59`** (24h) in a 40px left gutter, 28px actor avatar (grey gear tile for System events; **24px/28px round-square photo** for human actors), event sentence 12px: `Case 271026-001 opened`, `System set status to Closed`, `System closed — Intake enquiry converted → DraftOrder #164`, `Shruti Singh assigned conversation to self`, `Shruti Singh handed back the conversation to Anuma`, `System assigned conversation to neil batavia`, `System added tag chitchat`, `919960050504 re-opened the conversation`. Newest day first; consecutive same-day items are folded into one card; rows 44px (`padding 4px 0 24px`).
   - Stuffcool right column = **Activity only** (no AI summary card) for the observed cases.

## 5. NuHome case inventory (19 cases, for fake-data shaping; names/numbers are stand-ins)
| tag | when | title (+contact) | preview | state | notes |
|---|---|---|---|---|---|
| 271026-1 | 1:59pm | Rohit Menon (Rohit) | Hi! Thanks for reaching out… | open, Anuma handling | brand-new "Hey" → greeting |
| 261026-1 | Yesterday | +91 88281 41788 | Chinmayi here from Studio HBA mumbai | closed, unknown sender | tag Unknown, system comment, auto-reply |
| 251026-2 | Sun | Chida | I couldn't confidently match "Leaf No: 9… | closed | 2 images, product search 100%, reviewer approval, 3 comments, abandoned |
| 161026-1 | Thu | Neil | No sir, not possible. | **escalated**, yellow, Anuma-ring | 17 comments, human (staff photo) replies, assign/hand-back churn |
| 161026-4 | Wed | +91 98203 20486 | Thanks — your order (#164) is confirmed! | closed | converted → DraftOrder #164, 2 comments |
| 211026-3 | Wed | Asutosh, +91 76848 24635 | I couldn't confidently match "Leaf No: 99 Quality: ZYRA… | closed | |
| 211026-1 | Wed | +91 85911 06622 | Thanks for reaching out… couldn't find your number | closed | unknown |
| 191026-2 | 19 Oct | Anuma Intelligence - Test, Pankaj | I couldn't confidently match "Leaf No: 81…WINGS… | closed | image "Expired" label, abandoned, 2 comments |
| 131026-3 | 13 Oct | same | Our team is looking into this… | closed | |
| 101026-2 | 10 Oct | Shruti, Shruti Singh | Heyyy? | closed | |
| 091026-2 | 9 Oct | Mani, +91 99004 66819 | Maine sabse last mein kya order kiya tha… | closed | |
| 091026-8 | 9 Oct | +91 98505 09044 | unknown sender text | closed | |
| 091026-6 | 9 Oct | Asutosh | Checking a few items — will follow up shortly. Could you also share the Sr No for "TWILL 09 - NH 3024 / 03"? | closed | |
| 051026-4 | 9 Oct | Chida | Just checking in — you still have Quality: Verona 10m… | closed | nudge |
| 061026-3 | 6 Oct | Neil | Checking a few items… "VERONA 31 SRNO"? | closed | |
| 250926-2 | 29 Sept | Mani | Just checking in — still waiting to hear back on Verona 33. | closed | |
| 120926-1 | 16 Sept | +91 98203 20486 | Got it — give me a moment to look at that image… | closed | |
| 060926-6 | 6 Aug | +91 79722 45238 | Thanks — your order is confirmed. Our team will take it from here. | closed | |
| 060926-4 | 6 Aug | +91 22695 39631 | customer: Your verification code is 179… | closed | **voice-call transcript, email-style layout** |

Stuffcool (5 cases): `1009 +91 88792 70989 · "Ho"` (open, SLA 21:24 left, Anuma ring, unread "Hi"/"Ho" with **"2 unread messages"** divider), `1008 +91 98256 03129 · "Document"` (open, SLA 20:57 left, unread chip 2, **document bubble** + `Order Desk performed Document Analysis`, tag spam), `1004 · "Gayatri PO PBKLICK10 WINE 30PCS"` (closed, tag chitchat, "re-opened/assigned to AI/set status to Closed"), `1007 · 😂` (closed, tag chitchat, 3× the same clarifying reply, reaction 👀), `1005 · "Hey! Thanks for sharing that 😊…"` (closed, image bubble 3:24pm + reaction 👀 + `Intake Agent performed Image Analysis`).

## 6. WORKED EXAMPLE — NuHome order (all message types, invented data; times 27 Oct)
```
[row] 271026-3 · open · Anuma ring            Rakesh Nair, Rakesh               (customer +91 99876 10432)
sys   System case 271026-003 opened
in    📷 label photo "QUALITY ZYRA / LEAF NO 99 / 140 CM / 100% POLYESTER"            11:02am   [reaction 🧐]
pill  Anuma performed Image Analysis >_                                              (hover: Read from the image: ZYRA · Leaf 99 · 140 CM)
out   Checking the photo now, back in a moment.                                      11:02am ✓✓
pill  Anuma performed Product Search — ZYRA — 01 / NH 3867 / 17 · 100% >_            [reaction 🏷️ on image]
out   Got it — ZYRA - 01 / NH 3867 / 17 added.
      How many would you like for:
      1. ZYRA - 01 / NH 3867 / 17
      Reply with the amount for each, in the same order — one per line, or all on one line separated by commas (e.g. 10, 5).   11:02am ✓✓
in    30 meter                                                                       11:03am
out   1. ZYRA - 01 / NH 3867 / 17 · 30.000 Meter
      Anything else to add?                                                          11:03am ✓✓
in    📷 second label (VERONA 9999)                                                  11:04am   [reaction ❓ → label chip "Rejected"]
pill  Anuma performed Image Analysis >_
cmt   Anuma · Comment · Today, 11:04am
      Agent flagged 1 line(s) for review:
      - Leaf No: 9999
      Quality: VERONA
      Design: VERONA
      Width: 140 CM
      (reask)
out   (quoting 91998761xxxx [image])
      I couldn't confidently match "Leaf No: 9999 / Quality: VERONA / Design: VERONA / Width: 140 CM" — could you confirm the exact product name, or share a clearer photo?   11:04am ✓✓
sys   Anuma handed this over — intake line item review · pending
sys   System set status to Escalated
cmt   System · Comment · Today, 11:05am   Escalated to human: Customer message needs a human: no automatic handler for this message.
sys   System assigned conversation to Pankaj Rane
cmt   Pankaj Rane · Comment · Today, 11:09am   [Anuma] Attached variant ABANA - 32 / NH 89214 / 11 to Enquiry Line #726.
pill  A reviewer resolved — ABANA — 32 / NH 89214 / 11 >_
sys   Pankaj Rane handed back the conversation to Anuma
out   Got it — ABANA - 32 / NH 89214 / 11 added.
      How many would you like for:
      1. ABANA - 32 / NH 89214 / 11  …                                                11:09am ✓✓
in    20 roll                                                                        11:10am
out   Please confirm your order:
      1. ZYRA - 01 / NH 3867 / 17 — 30.000 Meter
      2. ABANA - 32 / NH 89214 / 11 — 20.000 Roll
      ───────── Confirm ───────── Edit ───────── Cancel ─────────                    11:10am ✓✓
in    (quoting Anuma: Please confirm your order: 1. ZYRA …)  Confirm   ✅             11:10am
cmt   Anuma · Comment · Today, 11:10am
      Resolution summary — enquiry #191: Converted to #171.
      1. ZYRA - 01 / NH 3867 / 17 — 30.000 Meter
      2. ABANA - 32 / NH 89214 / 11 — 20.000 Roll
sys   System closed — Intake enquiry converted → DraftOrder #171
out   (quoting 919987610432 / Confirm)  Thanks — your order (#171) is confirmed! We'll get started on it right away.   11:10am ✓✓
right column: AI summary "Rakesh has 2 requested items. The product, quantity and unit details are captured. The case is closed. · Updated 27 Oct · 11:10 am"
              Activity 27 Oct: 11:10 System closed — Intake enquiry converted → DraftOrder #171 · 11:09 Pankaj Rane handed back the conversation to Anuma · 11:09 Pankaj Rane assigned conversation to self · 11:05 System assigned conversation to Pankaj Rane · 11:05 System set status to Escalated · 11:02 Case 271026-003 opened
footer: 24-hour window notice appears only once >24h have passed (otherwise normal state 2 or 3).
```

## 7. WORKED EXAMPLE — Stuffcool inbox (Order desk, voice note → draft order) — shape from live Stuffcool wording + audio spec [SRC]
```
[row] 1010 · open · SLA ⏱ 23:48 left · Anuma ring · unread 1                         +91 98250 77311
sys   System case CASE-1010 opened
in    🎤 voice note  ▶ ───────── 0:00 / 0:19                                        4:12pm      (player pill: black 26px play button, 3px track, "0:19")
pill  Order Desk performed Audio Transcription >_    (hover: What Anuma read · 1 voice note · Tue, 4:12pm · Read from the voice note: "bhai 20 pcs magsafe cover 15 pro max black aur 10 pcs 20W charger bhej dena")
pill  Order Desk performed Product Search — Magsafe Case iPhone 15 Pro Max — Black · 94% >_
out   Got it — here's what I have so far:
      1. Magsafe Case iPhone 15 Pro Max — Black — 20.000 Pcs
      2. 20W USB-C Charger — 10.000 Pcs
      Anything else to add?                                                          4:12pm ✓✓
in    no                                                                             4:13pm
out   Please confirm your order:  … [Confirm][Edit][Cancel]
in    Confirm ✅
cmt   Anuma · Comment · Resolution summary — enquiry #212: Converted to Draft #36.
sys   System closed — Intake enquiry converted → DraftOrder #36                      (Stuffcool nav label: "Draft Orders")
```
After the draft order is confirmed/approved in Draft Orders it is synced to Tally (outside Inbox).

## 8. Behaviours to reproduce (all in-memory)
- Click case → loads chat (instant, os-fade 140ms), URL `?thread=`; list row gets the left black bar. Tabs/search/sort/numbers picker filter the list live and update footer count.
- Status dropdown writes system line + activity row + may move the row between tabs; Closed button is disabled; a new customer message re-opens ("System <phone> re-opened the conversation", status Open, Anuma ring returns).
- Take over → pill becomes composer (state 3) with "Replying as You", Hand back returns to pill; system lines `**You** assigned conversation to **self**` / `handed back the conversation to **Anuma**`.
- Assign (⋮ menu) → people picker popover (photo avatars, search); Comment → inline note composer, posts a yellow comment card.
- Confirm/Edit/Cancel taps by the "customer" (scenario) append the inbound quoted reply and trigger Resolution/closing lines.
- Reactions on image bubbles appear shortly after agent actions (tool pills too).
- Hover bubbles → React / Reply actions (disabled when window closed).
- Keyboard: Esc closes menus/popovers; no custom shortcuts were observed [?].

## 9. Pixel facts (measured, 1710px viewport)
| element | size / style |
|---|---|
| left rail | 216px (8px padding) |
| list column | 289px; row 97px (10/14/8 padding); name 12/600; preview 12/400 muted; time 12/400 muted; case chip 10/500, 20px high |
| tabs container | 251×32, radius 10, pad 3; tab 57×25, radius 8, 12/500 |
| search | 225×28, radius 8, border 1px |
| chat header | 68px; title 16/600; sub-name 14/400 muted; meta 12px |
| header buttons | 28px high, radius 10, 12px text |
| comments popover | 280×357 |
| status menu | 224×92 |
| bubbles | radius 18–22px, 13/400, time 10px @60% |
| image | 252×176 radius 8; reaction badge 22px circle |
| tool pill | 285×30 radius 10 bg muted border |
| work pill / window notice | 442×48 radius 14, shadow-lg, pad 10 |
| templates popover | 418×241 |
| activity row | 44px; time mono 11px |
| avatars | agent mark 24px black circle (green ring 2px when handling); human photo 24px radius 8 |
| status tokens | success `#13a269`/tint `#eefbe8`; warning dot `#f4b23e`, tint `#fefce8`; destructive `#e03a3a`; info `#2563eb` tint `#f0f8ff` border `#bce4fc` |

## 10. Other things noticed (outside inbox, for the lead)
- Top-bar chat icon **"Ask Anuma"** opens a right-hand **sheet** (404×887): heading `Anuma` + `reads the whole of NuHome`, `How can I help you today?`, muted `Ask about the costing cycle — where the delay sits, who is slow to start, what is past the SLA.` and three chips: `Where is the delay coming from?`, `Who is slowest to start?`, `How fast is costing once it starts?`.
- Bell title "Notifications"; Stuffcool/Axis bell has no unread badge in this account.
- App briefly redirected my tab to the Dashboard/Home several times while other tabs switched tenants (the active workspace is shared across tabs) — expect cross-tab interference when capturing in parallel.
