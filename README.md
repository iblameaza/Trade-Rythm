# Trade Rythm

Personal trading journal plugin for Obsidian.

## Features

- **Table view** — browse all trades, sort, filter, search
- **Inline editing** — click any cell to edit, dropdown for setup fields
- **PnL Dashboard** — total PnL, win rate, best/worst trade, profit factor
- **Trade creation** — one-click new trade with full YAML template
- **Checklist Templates** — configure your own checklists in Settings, auto-applied to new trades
- **Draggable lists** — reorder items in Settings by dragging
- **Guide modal** — click "?" button for built-in help
- **Before/During/After callouts** — structured trade reflection
- **After-Action Report** — 3-column board (What Went Well / What Went Wrong / Actionable Improvements)
- **Backtest support** — separate folder and command
- **Auto-create folders** — plugin creates trade/backtest folders on install
- **Folder detection** — plugin detects renamed folders and updates settings
- **Properties compatible** — YAML keys are quoted for Obsidian Properties view

## How to Install

1. Obsidian Settings → Community Plugins → Browse
2. Search "Trade Rythm"
3. Install & Enable

## How to Use

- Click the **$ icon** in the left ribbon, or open Command Palette (`Ctrl+P`) → `Trade Rythm: Open Trade Rythm`
- Click **+ New Trade** to create a trade
- Click a cell to edit inline (dropdown for setup fields)
- Click trade name to open the file
- Switch to **Dashboard** tab for PnL stats
- Click **?** button for built-in guide

### Commands

| Command | Description |
|---------|-------------|
| `Trade Rythm: Open Trade Rythm` | Opens the table/dashboard view |
| `Trade Rythm: New Trade Entry` | Creates a new live trade |
| `Trade Rythm: New Backtest Entry` | Creates a new backtest trade |

## Settings

### Trading Settings

| Setting | Description |
|---------|-------------|
| Trades folder | Vault-relative path to live trades |
| Backtest folder | Vault-relative path to backtest trades |
| Setup folder | Vault-relative path to Trading Settings (Accounts, Models, Sessions, etc.) |
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

## YAML Format

All YAML keys are quoted for Obsidian Properties compatibility:

```yaml
---
"Position": "Sell"
"Symbol": "BTCUSD"
"Model": "TJR Strategy"
"Account": "Futures Binance Account"
"Session": "New York"
"Status": "Closed"
"Type of Trade": "Day Trade"
"Setup Grade": "A"
"Gross PnL": -0.02
"Net PnL": -0.025
"Fees": 0.005
"% Risk": 1
"Entry / Exit Date": "2026-02-18"
"Entry / Exit Date (end)": null
---
```

## Support

If you found this plugin helpful for your journey, you can give me any amount of tip here:
☕ [ko-fi.com/iblameaza](https://ko-fi.com/iblameaza)

## License

GPL v3. Copyright (c) 2026 iblameaza. See [LICENSE](LICENSE) for details.
