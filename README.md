# Trade Rythm

A minimalist trading journal plugin for Obsidian — designed to live alongside your existing notes, not replace them.

## Why Trade Rythm?

Most trading journal plugins demand a complete overhaul of your workflow. Trade Rythm takes a different approach: **a clean, unobtrusive sidebar panel** that integrates seamlessly with your existing Obsidian vault. Whether you're journaling personal reflections, tracking projects, or managing a trading portfolio — Trade Rythm stays out of your way until you need it.

**Simple by design.** No overwhelming dashboards, no complex configurations. Just a straightforward table view and essential analytics when you want them. Switch between your trading journal and any other note with a single click.

---

## Features

- **Sidebar panel** — opens from the left ribbon, doesn't hijack your workspace
- **Table view** — browse all trades, sort, filter, search
- **Inline editing** — click any cell to edit via dropdown panel
- **PnL Dashboard** — total PnL, win rate, best/worst trade, profit factor
- **Trade creation** — one-click new trade with YAML template
- **Checklist Templates** — configure your own checklists in Settings
- **Draggable lists** — reorder items by dragging
- **Guide modal** — click "?" for built-in help
- **Before/During/After callouts** — structured trade reflection
- **After-Action Report** — 3-column board (What Went Well / Wrong / Improvements)
- **Backtest support** — separate folder and command
- **Properties compatible** — YAML keys quoted for Obsidian Properties view

---

## How to Install

1. Obsidian Settings → Community Plugins → Browse
2. Search "Trade Rythm"
3. Install & Enable

---

## How to Use

- Click the **$ icon** in the left ribbon to open the sidebar panel
- Click **+ New Trade** to create a trade
- Click a cell to edit inline (dropdown for setup fields)
- Click trade name to open the file
- Switch to **Dashboard** tab for PnL stats
- Click **?** button for built-in guide

---

## Commands

| Command | Description |
|---------|-------------|
| `Trade Rythm: Open Trade Rythm` | Opens the table/dashboard view |
| `Trade Rythm: New Trade Entry` | Creates a new live trade |
| `Trade Rythm: New Backtest Entry` | Creates a new backtest trade |

---

## Settings

### Trading Settings

| Setting | Description |
|---------|-------------|
| Trades folder | Vault-relative path to live trades |
| Backtest folder | Vault-relative path to backtest trades |
| Setup folder | Vault-relative path to Trading Settings |
| Table font size | Font size for the trades table (px) |

### Setup Categories

Manage your trading setup in the Settings tab:

- **Accounts** — name, balance, currency, type (live/demo)
- **Models** — trading strategies/models
- **Sessions** — trading sessions (e.g., New York, London)
- **Symbols** — trading pairs
- **Order Types** — market, limit, etc.
- **Setup Grades** — A/B/C/D ratings

### Checklist Templates

Configure your default checklists for new trades:

- **Pre-Trade Checklist** — your pre-trade routine
- **Entry Rules** — criteria for entering a position
- **Exit Rules** — criteria for taking profit/cutting losses

Items are draggable for easy reordering.

---

## Folder Structure

```
Your Vault/
├── Trades Journal/         ← Live trades
├── Backtest Journal/       ← Backtest trades
└── Trading Settings/       ← Accounts, Models, Sessions, etc.
    ├── Accounts/
    ├── Models/
    ├── Sessions/
    ├── Symbols/
    ├── Order Types/
    ├── Setup Grades/
    └── ...
```

**Note:** Plugin auto-creates these folders on install. If you rename them, plugin detects and updates settings automatically.

---

## YAML Format

All YAML keys are quoted for Obsidian Properties compatibility:

```yaml
---
"Status": "Open"
"Account": "Binance"
"Model": "TJR"
"Symbol": "BTCUSD"
"Position": "Long"
"Entry / Exit Date": "2026-09-08"
"News Impact": "FOMC"
"Bias": "Bullish"
"Market Conditions": "Trending"
"Type of Trade": "Day Trade"
"Entry TimeFrame": "15m"
"Confluences": "OB + FVG"
"Key Levels": "Daily High"
"Entry Signals": "BOS"
"Order Type": "Market Order"
"S/L Pips": 50
"% Risk": 1
"SL Management": "Trailing stop"
"Max RR reached": 2.5
"Actual RR achieved": "W(+1), L(-1), BE(0)"
"TP Management": "Partial at 1.5R"
"Gross PnL": 0.02
"Fees": 0.005
"Net PnL": 0.015
"Setup Grade": "A"
"Mistakes": []
"No Explanation?": false
---
```

---

## Support

If you found this plugin helpful for your journey, you can give me any amount of tip here:
☕ [ko-fi.com/iblameaza](https://ko-fi.com/iblameaza)

---

## License

All Rights Reserved. Copyright (c) 2026 iblameaza. See [LICENSE](LICENSE) for details.
