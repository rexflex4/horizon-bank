# Hyakugo Bank Portal (Multi-File with real web)

A multi-file responsive web prototype inspired by **The Hyakugo Bank, Ltd. (株式会社 百五銀行)** featuring a public banking website, a 3D interactive online banking portal (**Hyakugo Direct**), and a live **Admin Control Panel**.

> **Disclaimer:** This is an educational/UI prototype demo. All balances, interest rates, and notices are simulated.

## Project Structure

- `index.html` — Public Hyakugo Bank website (hero, rates, services, interesting info, notices)
- `banking.html` — Hyakugo Direct online banking portal (JPY accounts, 3D tilting/flipping 105BESTIO card, transfers, ledger)
- `admin.html` — Admin Control Panel (message templates, alert bar, hero editor, interesting info manager, live rates)
- `css/styles.css` — Shared Hyakugo Crimson theme, responsive grid, and 3D card styles
- `js/store.js` — Shared CMS state & `localStorage` persistence
- `js/public.js` — Dynamic homepage rendering & cross-tab sync
- `js/banking.js` — 3D card interactions, privacy toggle, and JPY transfer logic
- `js/admin.js` — Admin template publishing and live content controls

## Live Features

1. **Admin Control Panel (`admin.html`):** Apply one-click banking message templates to the top alert bar or notices feed, publish "Interesting Information" articles, and update FX/interest rates.
2. **3D Online Banking (`banking.html`):** Hover to tilt the Hyakugo 105BESTIO card in 3D, flip it to view the back/CVV, freeze/unfreeze it, and send JPY (`¥`) transfers that update the live statement.
