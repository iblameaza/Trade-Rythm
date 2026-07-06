# Trade Rythm

A personal trading journal plugin for Obsidian. Table view, inline editing, PnL dashboard.

---

## How to Install

**Requires [BRAT](https://obsidian.md/plugins?id=obsidian42-brat)** (Obsidian42 — BRAT).

1. Install BRAT from Community Plugins
2. BRAT Settings → "Add Beta plugin" → paste this repo's URL
3. Enable **Trade Rythm** in Community Plugins

Alternatively, copy the `trade-rythm-obsidian` folder into your vault's `.obsidian/plugins/` and add `"trade-rythm"` to `.obsidian/community-plugins.json`.

---

## How to Use

1. Click the **$ icon** in the left ribbon, or run `Trade Rythm: Open Trade Rythm` from Command Palette (`Ctrl+P`)
2. Click **+ New Trade** to create a trade file
3. Fill in the YAML fields and callout sections
4. Double-click any cell in the table to edit inline
5. Switch to the **Dashboard** tab for PnL stats

| Command | What it does |
|---------|-------------|
| `Trade Rythm: Open Trade Rythm` | Opens the table/dashboard view |
| `Trade Rythm: New Trade Entry` | Creates a new live trade |
| `Trade Rythm: New Backtest Entry` | Creates a new backtest trade |

---

## Folder Structure

```
Your Vault/
└── Private Github/
    ├── ︱ Trades Journal/      ← Live trades go here
    └── ︱ Backtest Journal/     ← Backtest trades go here
```

The `︱` character is **U+FE31** — it renders as a vertical dash in Obsidian.

---

## Features

- **Table view** — browse all trades, sort by any column, filter by text
- **Inline editing** — double-click to edit, changes save to the file
- **PnL Dashboard** — total PnL, win rate, best/worst trade, profit factor
- **35+ YAML fields** — matches the original Notion template
- **Before/During/After callouts** — structured trade reflection
- **Auto-numbering** — trades named `Trade #1.md`, `Trade #2.md`, etc.
- **Backtest support** — separate folder and command

---

## Support

If this plugin helps your trading, consider buying me a coffee:

☕ [ko-fi.com/iblameaza](https://ko-fi.com/iblameaza)

---

## License

Personal, non-commercial use only. No modifications, no derivatives. Credit required. See LICENSE file.
