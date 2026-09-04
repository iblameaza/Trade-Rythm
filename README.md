# Trade Rythm

Personal trading journal plugin for Obsidian.

- **Table view** — browse all trades, sort, filter, search
<img width="634" height="224" alt="Table Preview" src="https://github.com/user-attachments/assets/cc22f756-02fe-4ccf-ba07-94ed52e1d0ae" />

- **Inline editing** — double-click any cell to edit
- **PnL Dashboard** — total PnL, win rate, best/worst trade, profit factor
<img width="637" height="234" alt="PnL Dashboard Preview" src="https://github.com/user-attachments/assets/acbdfc72-4255-4e38-b49b-fa0565982477" />

- **Trade creation** — one-click new trade with full YAML template (35+ fields)
- **Before/During/After callouts** — structured trade reflection
- **Trade Timeline** — editable table outside callout for logging trades
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
- Double-click any cell to edit inline
- Switch to **Dashboard** tab for PnL stats

### Commands

| Command | Description |
|---------|-------------|
| `Trade Rythm: Open Trade Rythm` | Opens the table/dashboard view |
| `Trade Rythm: New Trade Entry` | Creates a new live trade |
| `Trade Rythm: New Backtest Entry` | Creates a new backtest trade |

## Settings

| Setting | Description |
|---------|-------------|
| Trades folder | Vault-relative path to live trades |
| Backtest folder | Vault-relative path to backtest trades |
| Setup folder | Vault-relative path to Trading Settings (Accounts, Models, Sessions, etc.) |
| Table font size | Font size for the trades table (px) |

## Folder Structure

```
Your Vault/
└── Private Github/
    ├── Trades Journal/      ← Live trades
    ├── Backtest Journal/     ← Backtest trades
    └── Trading Settings/     ← Accounts, Models, Sessions, etc.
        ├── Accounts/
        ├── Models/
        ├── Sessions/
        ├── Symbols/
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
"Gross PnL": -0.02
"Fees": 0
"% Risk": 0
"Backtest?": false
"Entry / Exit Date": "2026-02-18T23:00:00.000+07:00"
---
```

## Support
If you found this plugin helpful for your journey, you can give me any amount of tip here:
☕ [ko-fi.com/iblameaza](https://ko-fi.com/iblameaza)

## License

MIT
