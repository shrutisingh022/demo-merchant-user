# CRM + Products — live spec (NuHome, Axis India, Stuffcool)

Captured from the signed-in live app at a 1710×959 viewport, 2026-10-27. Tenants: NuHome `ws/CpMoYBTj`, Axis India `ws/BqOROWFj`, Stuffcool `ws/6AqQi9t4`.
Everything below was observed read-only. Rows quoted here are **format examples only** — the demo must use invented names/numbers.

**Headline: CRM and Products are the same components in all three tenants.** Only the rail, data volume and data vocabulary differ. Build one implementation, parameterised by seed data.

Not observed (flagged so nobody assumes): the party **delete confirmation** (the delete click was blocked by the safety classifier), the **Stuffcool style drawer** (only its list was captured), any **create-party / create-product / import** screen (none of the three tenants shows a button for them — parties, contacts and products arrive via sync; the only create paths are the drawer's *Add contact* form and the Categories modal's *Add*).

---

## 0. Shared primitives (measured)

| Thing | Value |
|---|---|
| Page title `h1` | 20px / 600; at x=246 (rail 216 + 30 page padding) |
| Content width | full width of the inset (no max-width) with 30px side padding |
| Stat card | 345×117 in a 4-up row (gap ~14), radius 10px (ring + soft shadow, no hard border), header row: label 13px/500 left + 28px icon tile at far left **before** the label (icon tile left, label right of it), dashed divider, number **30px/600**, optional muted sub-line |
| Segmented toggle (Parties \| Contacts) | wrapper 150×32, radius 10, padding 3, bg muted; button 25px tall, radius 8, padding 2/12, 12px/500; active = white + shadow |
| View button (`All parties ▾`) | 112×28, radius 8, 12px/500, grid icon left, chevron right |
| Columns button | 122×28, radius 8, label `Columns` + ` · 1 off` when columns hidden |
| Search | 288×28 in a rounded-md bordered group, search icon left, placeholder `Search parties…` / `Search contacts…` / `Search styles…` |
| Toolbar row | view button left, columns button + search right, y ≈ 305; 12px below the segmented control |
| AG Grid | 40px header, 40px rows, 12px font, 12px cell padding, outer radius 10 with 1px border; footer bar 44px: left `6,305 parties in view` (muted), right `50 / page` button (73×28) + `1–50 of 6,305` + ‹ › icon buttons |
| Page-size menu | `25 / page`, `50 / page`, `100 / page` (default 50) |
| Header cell | label button (left) + 24px filter tile (right). Filter tile is **disabled** (muted/50, `cursor-not-allowed`, tooltip text below) unless noted |
| Number cell | `<button title="Click to copy">` with `font-mono text-xs tabular-nums`, regular weight, foreground colour; a copy icon appears on hover |
| First text column (Party / Contact / SR·Style) | **font-medium (500)** — reads as the bold column; truncates with ellipsis |
| Muted cells | `—` em dash in muted-foreground for empties; Contacts and WhatsApp cells in muted colour |
| Status badge | inline-flex h-6, radius full, 1px border, 6px dot (`size-1.5`, green = success) + `Active` 12px/500; inactive uses a grey dot |
| Drawer | `fixed`, right-anchored, **800×879**, 12px from right/top/bottom edge, radius 10, bg popover, `shadow-lg`, 12px text; enter animation `enter 0.2s`, transform transition 200ms ease-in-out; scrim black ~50%; header (title + sub-row) → tab strip → scrollable body → footer with right-aligned `Close` button (black outline small) |
| Empty-state card | bordered rounded card, centred icon tile (grey rounded square), bold 12px title, muted sentence |
| Avatar chips in lists | 28px **round** pastel circle with a letter (soft green/red/violet/blue/lime), as the contact rows; account-team people use a 28px rounded-square **photo** |

Disabled-filter tooltips (verbatim, exactly as the `title` attribute):
- `This filter isn't wired up yet.` (Number, Party, City, State columns)
- `Needs contact names on the party row.` (Parties → Contacts column)
- `Needs the party's city on the contact row.` / `Needs the party's state on the contact row.` (Contacts → City, State)
- `Search finds styles by name; a name filter isn't wired up yet.` (Products → SR · Style reference)

Enabled filters are **dropdown menus**, not AG filter popovers (menu width 176, label row + separator + items):
- Phone (WhatsApp column; `title="Filter by phone"`): label `Phone`, items `Has a phone number`, `No phone number`.
- Status (`title="Filter by status"`): label `Status`, items `Active`, `Inactive`.
- Category (Products; `title="Filter by category"`): label `Category`, then **100** scrollable items (see §3).

Only the first text column is sortable (header button title `Sort by party`, default **ascending**, arrow ↑ beside the label). Other headers are not sortable.

Views menu (identical in every list): heading `Views`, item for the current view (`All parties` / `All contacts` / `All styles`), separator, `+ New view`. Width 256, item height 28.

Columns menu: label `Columns`, then one checkbox row per column with a small leading icon; unchecked column not shown. A **"Modified · Save view · ×"** strip appears next to the view controls after changing the grid state (see §3).

---

## 1. CRM — Parties  (`/ws/<id>/crm` → redirects to `/crm/accounts`)

**Breadcrumb:** `<Org> / CRM`. **Title:** `CRM` (no subtitle, no header buttons).

**Stat cards (4):** `Parties` · `Contacts` · `Confirmed orders` · `Open chats`. Icons: building, users, package, chat-bubble. NuHome: 6,305 / 7,568 / 90 / 2. Axis: 1 / 1 / 0 / 0. Stuffcool: 22 / 7 / 1 / 2. (Demo: invent larger consistent numbers; Confirmed orders and Open chats must follow the live scenario state.)

**Segmented:** `Parties` (active) | `Contacts`. **View:** `All parties` (only view). **Search:** `Search parties…`.

**Columns (in order; width at 1710px; col-id):**

| # | Header | Width | col-id | Cell format | Filter |
|---|---|---|---|---|---|
| 1 | Number | 110 | number | mono `AC-1010` (click-to-copy) | disabled |
| 2 | Party | 446 | name | **medium**; sorted ↑ | disabled |
| 3 | Contacts | 260 | contacts | muted; contact names joined, `—` if none | disabled (`Needs contact names on the party row.`) |
| 4 | WhatsApp | 170 | phone | muted; `+91…` or 10-digit; `—` | enabled (phone menu) |
| 5 | City | 150 | billing_city | regular, UPPERCASE as stored | disabled |
| 6 | State | 160 | billing_state | regular, title case | disabled |
| 7 | Status | 130 | is_active | status badge `Active` | enabled (status menu) |
| off | Billing street | — | — | hidden by default | — |

Columns menu rows (icon + label): `# Number`, `Party` (building), `Contacts` (users), `WhatsApp` (phone), `City` (pin), `State` (map), `Status` (check-circle), `Billing street` (unchecked by default). Button reads `Columns · 1 off`.

**Example rows (format only):**
```
AC-1003  +912269539631             —   +912269539631   —        —            Active
AC-1010  13 13 MOTOR WORKS         —   —               MUMBAI   Maharashtra  Active
AC-1012  3 D FURNISHING COLLECTIONS - MUMBAI  —  9323196711  GREATER MUMBAI  Maharashtra  Active
AC-1016  A - 1 TRADERS HOUSE OF FURNISHING ITEMS - PUNE (D)  —  9822457013  PUNE  Maharashtra  Active
AC-1018  A AND T SOLUTIONS - DELHI (C&C)  —  9711038152  DELHI  Delhi  Active
AC-1022  A DECOR FURNISHINGS -CHENNAI *PS*  —  9841134665  CHENNAI  Tamilnadu  Active
```
Party naming model (NuHome, textile dealers): `<TRADE NAME> - <CITY>` upper-case, optional suffixes ` (D)`, ` (C&C)`, `[DEACTIVATED]`, `*PS*`; WhatsApp-created parties are titled with the raw phone number (`+91…`) until named; numbers run `AC-1003…`. Sorted A→Z with phone-number parties first.
Stuffcool (phone-accessory dealers, auto-created from WhatsApp): `+918879270989`, `Alfa 1`, `Brights 52956`, `Chida`, `Irfan Distributors`, `RB Ent 107239`, numbers `AC-1013…AC-1034`.
Axis: 1 party `Chidananda K M`, `AC-1001`, city/state `—` (demo: electrical contractors/EPC firms: `<NAME> ELECTRICALS - <CITY>`).

### 1.1 Party drawer (`/crm/accounts/:id`, opens over the list; Close/× returns to the list)

Header: title (party name, 16px/600) + muted `N contacts` (and a small overlapping avatar stack of up to 3 contact avatars when contacts exist); second line: mono `AC-1010` · `MUMBAI, Maharashtra` · status badge; right: red trash icon button (delete) + × close.
Tab strip (segmented-style, left): `Overview` · `People` · `Orders` · `Chats` · `All fields`.

**Overview**
1. Three stat cards: `Confirmed orders`, `Open chats`, `Contacts` (icon tile left of label, dashed divider, 30px number).
2. `Your account team` heading + right link-button `Manage team`. Card: when empty → empty-state `Nobody assigned yet` / `Use Manage team to assign someone.`; when assigned → row with 28px rounded-square **photo**, bold name, muted role (`ASM responsible`).
3. `Contacts` + muted count; right buttons `Link existing` (link icon) and `+ Add contact`. Empty state `No contacts yet` / `Contacts added to this party show up here.` Populated: stacked **bordered cards** (52px tall, radius 10): 28px round pastel letter avatar (or neutral person icon for the unnamed phone contact), name (12px/600), muted `Primary · +919900466819` / `Secondary · +91…`, right chevron. Click → the contact detail (see People).
4. `Confirmed orders · all contacts` → card titled `Orders` containing an AG-style table, columns: `ID` (mono `DRF-1136`), `Date and Time` (`22 Oct 2026, 4:36 pm`), `Contact Name`, `Party Name`, `Items`, `City`, `State` (horizontally scrollable). Empty: icon + `No confirmed orders yet` / `Confirmed orders will show up here.`
5. `Chats · all contacts` → card `Chats`, columns `Case` (mono `191026-002`), `Subject` (`—`), `Contacts` (`Pankaj`), `Status` (plain text `closed`), `Last update` (`19/10/2026, 13:25`). Empty: `No chats yet` / `No conversations for this party yet.`
6. `Company details` card, 3-column key/value grid: `Party number`, `Account type` (`Customer`), `Company phone`, `Email`, `Billing address` (`MUMBAI, Maharashtra, 400049`, truncated), `Shipping address`.

**People** — `Contacts N` + `Link existing` + `+ Add contact`; the contact cards (above). Selecting a card reveals below it: contact name (16px) with right-aligned buttons `Edit`, `Remove from party`, red `Delete`; key/values `WhatsApp number`, `Email` (placeholder style `lead-919900466819@placeholder.invalid`), `Contact number` (`CT-8535`); then `Chats started by <name>` card (`Chats`: empty `No chats yet` / `No conversations started by this contact yet.`) and `Confirmed orders` card (empty `No orders yet` / `No confirmed orders from this contact yet.`).

**Orders** — label `Confirmed orders` left, dropdown `All contacts ▾` right (filters by contact), card `Orders` (same table as Overview).
**Chats** — label `All chats`, dropdown `All contacts ▾`, card `Chats`.
**All fields** — `Your account team` block (same as Overview) then two key/value cards:
- `Identity & reach`: `Party number`, `Name`, `Account type`, `Status` (badge), `Company phone`, `Email`, `Website` (`Not provided`), `Source` (`api`).
- `Addresses`: `City`, `State`, `Country` (`India`), `Billing street` (long single line), `Shipping address`.

**Manage team dialog** (opens centred over the drawer, 396 wide, radius 14, own close ×): bordered card titled `Segmentation` with a tag icon button on the right; rows separated by hairlines:
- `Area` — lock icon + muted `Nothing stores an area on an account yet.`
- `ASM responsible` — value (`Nobody` or the person) + small outlined button `Assign one` (user-plus icon).
- `Sales person` — `Nobody` + `Assign one`.
- `Segments` — lock icon + `Nothing writes a segment yet.`
`Assign one` opens a popover list headed `ASM responsible` (resp. `Sales person`) listing every human: 20px round pastel letter avatar + name (`Asutosh Mahapatra`, …), 24px row height, scrollable (max ~10 visible).

**Add contact** (inline form that expands under the Contacts heading; the `Add contact` button disables while open): heading `New contact` + muted `Adds a contact linked to the selected client.`; `Contact type` radios `Primary` (default) / `Secondary`; `Client *` (disabled select pre-filled with the party); two-column `First name *` / `Last name`; `Email` / `Phone`; right-aligned `Cancel` and black `Save`.

**Link existing** modal (centred, 396 wide, radius 14): title `Link existing contact`; body `Add someone already in your contacts to <Party>. Anyone on another party has to be removed from it first.`; search `Search by name, phone or email`; result list (5 visible, scroll): name (12px/600) + muted second line `On <OTHER PARTY> · remove them the…` (rows are greyed/disabled when on another party) and a muted mono id `CT-8578` at right; footer `Cancel` + disabled `Link contact` (link icon).

**Delete** — red trash in the drawer header; confirmation not observed. Use the live code's pattern: destructive confirm dialog titled `Delete <name>?` with `Cancel` / red `Delete`.

---

## 2. CRM — Contacts  (`/crm/contacts`)

Same page, segmented `Contacts` active. **Stat cards (2):** `Contacts` 7,568 and `Linked parties` 4,975 (building icon).
View `All contacts` (menu: `Views`, `All contacts`, `+ New view`). Search `Search contacts…`.

| # | Header | Width | col-id | Format | Filter |
|---|---|---|---|---|---|
| 1 | Number | 110 | number | mono `CT-1003` | disabled |
| 2 | Contact | 240 | name | **medium**, ↑ default; phone-number contacts show the number | disabled |
| 3 | WhatsApp | 170 | phone | muted | enabled (phone menu) |
| 4 | Party | 596 | account_name | regular | disabled |
| 5 | City | 150 | city | `—` | disabled (`Needs the party's city on the contact row.`) |
| 6 | State | 160 | state | `—` | disabled (`Needs the party's state on the contact row.`) |
| off | Email | — | — | hidden by default | — |

Columns button: `Columns · 1 off`. Row click opens `/crm/contacts/:id` = the **same drawer as the party** (their party), landing on **People** with that contact preselected. Footer `7,568 contacts in view`.
Example rows: `CT-1003 +912269539631 | +912269539631 | +912269539631 | — | —`; `CT-8535 +919900466819 | +919900466819 | Anuma Intelligence - Test`; `CT-1009 3 D FURNISHING COLLECTIONS - … | — | 3 D FURNISHING COLLECTIONS - MUMBAI`.

---

## 3. Products  (`/ws/<id>/products`)

**Breadcrumb** `<Org> / Products`. **Header:** `Products` + muted sub-line `1,059 styles` (NuHome) / `13,142 styles` (Axis); right: outlined button `Categories` (tag icon). No create/import button.
**Toolbar:** `All styles ▾` view button · segmented `Collapsed` | `Expanded` (213×32; icons: collapse arrows / expand arrows; default Collapsed) · right: `Columns` (no "off" count; all 3 visible) + `Search styles…`.
After you change the grid (expand a row / toggle Expanded) a **"Modified"** muted label + outlined `Save view` + `×` (reset) appear inline after the segmented control.
View menu: `Views`, `All styles`, `+ New view`. Columns menu: `Columns`, `SR · Style reference`, `Category`, `Status` (all checked).

| Header | Width | col-id | Format | Filter |
|---|---|---|---|---|
| SR · Style reference | 638 | name | chevron-right (title `Expand this style`) + **medium** style code + muted variant count (`ABANA 42`); ↑ default | disabled (`Search finds styles by name; a name filter isn't wired up yet.`) |
| Category | 638 | category_name | regular | enabled — category menu |
| Status | 150 | is_active | badge | enabled — status menu |

Footer: `1,059 styles in view`, `50 / page`, `1–50 of 1,059`.

**Collapsed:** one row per style. **Expanded** (or chevron click): child rows inserted under the parent, indented with a `↳` glyph, medium-weight variant label, same category/status cells (40px rows). Parent keeps its chevron + count.

**Row click (parent or child) → drawer `/products/:styleId?record=:variantId`** (800×879, same shell as CRM drawer):
- Header: style name (16px/600, truncates), sub-line `<Category> · N records`, × close.
- `Variants` heading → mini grid: `Name` (medium) | `Status` (badge), rows 36px, scrollable.
- `Selected record` card: record name (+ muted `Selected record` label at right), then key/values `Name`, `In stock` (NuHome) / `Name`, `SKU`, `In stock` (Axis).
- Axis/Stuffcool-style config adds two collapsibles (chevron + label): `Product information` (`Category`, `Product type` `Goods`, `Status` badge, `Taxable` `Yes`, `External reference`) and `Source fields` (dark monospace JSON viewer: `record`, `product`, `fields`, `category`, `variant_count`, `variant_title` `"Default Variant"`, `custom_fields`).
- Footer: left muted `40 records in this style`, right `Close`.

**Categories modal** (centred ~460 wide, radius 14): title `Categories`, × top-right; search/add input `Search or add a category…` with `+ Add` (disabled until text); list rows 39px with hairlines, 12px text; on hover the row gets muted bg and right-aligned **pencil** (edit) and **trash** (delete) outlined 28px icon buttons; footer muted `104 categories` + black `Done`.

**Category filter menu**: 100 items (scrollable, width 176). NuHome categories (format examples): `BEAM`, `BED LINEN PIECES`, `CURTAIN FABRIC PIECES`, `Curtain Automataion`, `DIGITAL PRINTED PAPER`, `DIGITAL PRINTING`, `DYED FABRICS FOR MULTIHEAD EMBROIDERY`, `Dyeing & Finishing`, `EMBROIDERED FURNISHING FABRICS MULTI - FINISHED`, `EMBROIDERED FURNISHING FABRICS MULTI - FINISHED FOR ALBUMS`, `Embroidery Job Pcs Multi`, `FABRICS SCHIFLLI`, `FINISH FABRICS`, `FINISH FABRICS - PCS`, `FOIL PRINTING`, `Finished Fabrics for JACQUARD FURNISHING - ALBUMS`, `Finished Fabrics for DIGITAL PRINTED FURNISHING - ALBUMS`, `Finished Fabrics for UPHOLSTERY - ALBUMS`. Axis categories are short codes: `FGTRAD`, `SEMIFG`.

### Data model / naming (so fake data mirrors it)
- **NuHome (textile):** style = quality/design family, upper-case single word + variant count: `ABANA 42`, `ABHA 10`, `ABR 35`, `ACE. 18`, `ACRES 18`, `ADMIRE 40`, `ADORA 48`, `AGAVE 40`, `AGNI 19`, `AKAN 22`, `ALBA 30`, `ALBERTA 48`, `AKIRO 1`; an unnamed bucket `-- 8` sorts first. **Variant (record) name = `<leaf no> / <design code> / <shade no>`**, e.g. `01 / NH 209414 / 02`, `02 / NH 209405 / 02`, `10 / NH 209414 / 01`, `01 / NH 89203 / 12`, `01 / NH 27901 / 78 PURPLE`. Selected record shows only `Name` + `In stock` (0 for most).
- **Axis (electrical):** style = full product description in caps, variants 2 each (the item + its short code): `'U' - BOLT ROD CLAMPS - TYPE 'E' SINGLE PLATE FOR 14.2 TO 20 MM ROD DIA WITH BRASS U BOLT,BRASS NUTS` → variants `<same description>` and `URC2025EV2`; SKU `URC2025EV2-001`; others: `1 NPE SURGE PROTECTION DEVICE FOR AC 275V, 40kA (TYPE-2)`, `1'' DOUBLE COMPRESSION GLAND WITH LOCK NUT, EARTH TAGS AND LONG SHROUD`, `*EYE HOOK*` (category `SEMIFG`), `TINNED COPPER LUGS - DIN 16 - 12 - ATD0016M12`. Category column shows `FGTRAD` / `SEMIFG`.
- **Stuffcool (phone accessories), 667 styles:** each style is a full product title with colour in the name and a small variant count; the Category column is a **product-line / collection name** (often `—` when unset), not a broad category. Sorted A→Z, digits first. Examples (format only): `1# 22.5W- 10000 mAh QCPD Powerbank- Black Matt` (1, category `—`) · `10,000 mAh 40W Powerbank With C Plus C Port` (1, `Mega 40`) · `10000 mAh Magnetic Wireless Power Bank Black` (1, `Magnetic Wireless Powerbank-PBMONDE`) · `10000 mAh QCPD Powerbank with C and L Cable Silver` (2, `Miles`) · `10000mAh Magnetic Wireless Powerbank` (4, `Magnetic Wireless Powerbank-PBCLICKDUO`) · `10000mAh Magnetic Wireless Powerbank With Type C Cable` (1, `Clicktrio`) · `10000mAh Mega II 30W Powerbank` (2, `—`) · `2 in 1 iWatch/Airpod Charger White` (1, `Apple Watch & Airpod Charger`) · `20,000 mAh QCPD Mini powerbank` (1, `Roam Plus`). Sub-line `667 styles`; same toolbar, columns, drawer as the others (drawer not opened).

---

## 4. Differences between tenants

| | NuHome | Axis India | Stuffcool |
|---|---|---|---|
| Rail | Home, Inbox, Orders, CRM, Products | Home, RFQs, CRM, Products | Dashboard, Inbox, Draft Orders, CRM, Products, Campaigns |
| CRM page | identical | identical | identical |
| Products page | identical | identical (+ Product information/Source fields in the drawer) | identical list (667 styles; titles carry colour; category = product line, often `—`) |
| Data scale | 6,305 parties / 1,059 styles | 1 party / 13,142 styles | 22 parties / 667 styles |

## 5. Animations seen
Drawer slides in from the right with fade (200ms ease-in-out); scrim fades; menus zoom/fade 100ms; row hover tint (muted/50); expanding a style inserts rows without a full-grid reflow; disabled filter tiles show a not-allowed cursor.

## 6. Surprises
1. **Most column filters are intentionally disabled** with tooltips — only phone and status (CRM) and category and status (Products) work, and they are dropdown menus, not AG filter popovers.
2. **Number columns are monospace "click to copy" buttons** (regular weight); the bold column is the name column (weight 500).
3. **Drawer is 800px wide** (not 520) and opens as a route (`/crm/accounts/:id`, `/crm/contacts/:id`, `/products/:id?record=`); contact URLs open the *party* drawer on People.
4. **Products has no create/import** in any tenant; Categories modal is the only editor.
5. **CRM and Products are the same in all three tenants** — only seed data and rail differ, so Axis and Stuffcool need the NuHome page re-used with their own data (Axis: electrical products/contractors; Stuffcool: phone-accessory dealers).
