# Trade Rythm — Obsidian Plugin

Personal trading journal plugin for Obsidian with table view, inline editing, PnL dashboard, and trade templates.

## Features

- **Table View** — Browse all trades in a sortable, filterable table
- **Inline Editing** — Double-click cells to edit Date, Status, and PnL directly
- **PnL Dashboard** — Net PnL, win rate, best/worst trade, breakdowns by Model/Symbol/Session
- **Trade Creation** — Creates new trades with full 35-property YAML template
- **Before/During/After Callouts** — Structured trade reflection sections
- **Summary Toggle** — Collapsible checklist for trade plan adherence
- **Auto-Numbering** — Trades are auto-numbered (`Trade #1.md`, `Trade #2.md`, etc.)
- **Backtest Support** — Separate folder and command for backtest entries
- **Filter Bar** — Search by symbol/model, filter by status
- **Sort Columns** — Click any column header to sort

## Installation

Place the folder into your vault's `.obsidian/plugins/trade-rythm/`.
Add `"trade-rythm"` to `.obsidian/community-plugins.json`.
Enable in Obsidian Settings → Community Plugins → Trade Rythm → toggle on.

## Folder Setup

```
Your Vault/
├── Private Github/
│   ├── ︱ Trades Journal/     ← Live trades go here
│   └── ︱ Backtest Journal/    ← Backtest trades go here
```

The `︱` character is **U+FE31**. It renders as a vertical dash in Obsidian. PowerShell may show `ufe31` — cosmetic only.

## Commands

| Command | Description |
|---------|-------------|
| `Trade Rythm: Open Trade Rythm` | Opens the table view / dashboard |
| `Trade Rythm: New Trade Entry` | Creates a new trade |
| `Trade Rythm: New Backtest Entry` | Creates a new backtest |

## Quick Start

1. Command palette → `Trade Rythm: Open Trade Rythm`
2. Click `+ New Trade` to create a trade
3. Fill in YAML frontmatter and callout sections
4. Table auto-refreshes on create/edit
5. Double-click Date, Status, or PnL cells for inline editing
6. Dashboard tab shows PnL stats and breakdowns

## Dashboard

- **Summary Cards** — Total trades, Net PnL, Win rate, Best/Worst trade, Closed trades
- **PnL by Model** — Breakdown per trading model
- **PnL by Symbol** — Breakdown per symbol
- **PnL by Session** — Breakdown per session (Asian, London, NY, etc.)
- **Recent Trades** — Last 10 trades with PnL

## Settings

Settings → Trade Rythm:

- **Trades folder** — Path to live trades (default: `Private Github/︱ Trades Journal`)
- **Backtest folder** — Path to backtests (default: `Private Github/︱ Backtest Journal`)

## License

All Rights Reserved. See LICENSE file. Personal, non-commercial use only — no modifications, credit required.
