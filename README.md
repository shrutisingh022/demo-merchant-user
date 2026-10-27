# Anuma — Demo Merchant User

A click-through demo of the Anuma merchant admin (merchants.anuma.run, newhome design) for one merchant, **Demo Merchant User**. Plain HTML, CSS and JS: no build step, no backend. All data is generated and held in memory.

## Run

```bash
python3 -m http.server 8765
```

Open http://localhost:8765. Opening `index.html` directly also works.

## Use cases (right-hand Scenarios panel)

| Use case | Story |
|---|---|
| **Access Electricals** | RFQ by email/WhatsApp → parsed lines → catalogue match → quote and approval → order |
| **Stuffcool** | B2B catalogue and dealer price bands → dealer orders → vouchers synced to Tally |
| **NewHome** | WhatsApp orders (text, photo, voice) → ASM review → orders posted to the Coralio API |

The look follows the live NuHome tenant of merchants.anuma.run (notes in `docs/LIVE_DESIGN.md`); tables are AG Grid. Switch use cases from the small switcher in the top bar. The Scenarios panel (Play, step, jump, reset) appears in Inbox. Each step changes what the admin shows: inbox messages, RFQs, drafts, orders, ERP sync log, dashboard KPIs. The panel charts update as steps land.

## Layout

- `js/core.js` — shell, router, scenario engine, UI helpers
- `css/app.css` — design tokens and primitives
- `data/<use-case>.js` — seed data and scenario steps
- `pages/*.js` — one file per admin module
- `docs/CONTRACT.md` — state shapes and conventions
