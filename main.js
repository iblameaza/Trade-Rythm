/// <reference types="obsidian" />
/**
 * Trade Rythm — custom Obsidian plugin
 * Table view, inline editing, PnL dashboard, trade creation.
 */

const VIEW_TYPE = "trade-rythm-db";

// ─── Settings ───────────────────────────────────────────
const DEFAULT_SETTINGS = {
  tradeFolder: "Private Github/\ufe31 Trades Journal",
  backtestFolder: "Private Github/\ufe31 Backtest Journal",
  attachmentsFolder: "attachments",
  columns: [
    "Entry / Exit Date", "Symbol", "Model", "Direction", "Status",
    "Gross PnL", "Session", "Setup Grade", "Account", "Type of Trade",
    "Order Type", "Mistakes", "Confluences", "Key Levels",
    "SL Management", "TP Management", "Entry Signal", "Bias",
    "Market Conditions", "Entry TimeFrame", "Fees", "News Impact",
    "S/L Pips", "% Risk", "Max RR reached",
    "Actual RR achieved: W(+1), L(-1), BE(0)",
    "Bias Review", "Entry Performance", "LeaderBoard",
    "Psychology Tracker", "Weekly Report", "No-Explanation?",
    "Entry / Exit Date (end)", "Tradingview Chart"
  ],
  templateYaml: [
    'Position: Buy / Sell',
    'Symbol: ',
    'Model: ',
    'Account: ',
    'Session: ',
    'Status: Open / Closed',
    'Gross PnL: ',
    'Setup Grade: ',
    'Order Type: ',
    'Type of Trade: ',
    'Entry TimeFrame: ',
    'Entry Signal: ',
    'Bias: ',
    'Bias Review: ',
    'Confluences: ',
    'Key Levels: ',
    'SL Management: ',
    'TP Management: ',
    'Mistakes: ',
    'Market Conditions: ',
    'News Impact: ',
    'Entry Performance: ',
    'LeaderBoard: ',
    'Psychology Tracker: ',
    'Weekly Report: ',
    '"S/L Pips": ',
    'Fees: ',
    '"% Risk": ',
    'Max RR reached: ',
    '"Actual RR achieved: W(+1), L(-1), BE(0)": ',
    '"Entry / Exit Date": "{{date}}"',
    '"Entry / Exit Date (end)": ',
    'No-Explanation?: false',
    'Tradingview Chart: ',
  ]
};

// ─── Plugin ─────────────────────────────────────────────
class TradeRythmPlugin extends Plugin {
  constructor() {
    super();
    this.settings = Object.assign({}, DEFAULT_SETTINGS);
  }

  async onload() {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf) => new DatabaseView(leaf, this));

    this.addCommand({
      id: "open-trade-rythm-db",
      name: "Open Trade Rythm",
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: "new-trade-entry",
      name: "New Trade Entry",
      callback: () => this.createNewTrade(false),
    });

    this.addCommand({
      id: "new-backtest-entry",
      name: "New Backtest Entry",
      callback: () => this.createNewTrade(true),
    });

    this.addSettingTab(new TradeRythmSettingsTab(this.app, this));

    // Wait for layout to be ready before opening the view
    this.app.workspace.onLayoutReady(async () => {
      if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length === 0) {
        await this.activateView();
      }
    });
  }

  onunload() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((l) => l.detach());
  }

  async activateView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (leaves.length > 0) {
      this.app.workspace.revealLeaf(leaves[0]);
      return;
    }
    const leaf = this.app.workspace.getLeftLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  async createNewTrade(isBacktest) {
    const folder = isBacktest ? this.settings.backtestFolder : this.settings.tradeFolder;
    const label = isBacktest ? "Backtest" : "Trade";

    // Get next trade number
    const files = this.app.vault.getMarkdownFiles();
    const maxNum = files
      .filter((f) => f.path.startsWith(folder))
      .reduce((max, f) => {
        const m = f.name.match(new RegExp(`^Trade #(\\d+)`));
        return m ? Math.max(max, parseInt(m[1])) : max;
      }, 0);
    const nextNum = maxNum + 1;

    const suffix = isBacktest ? " (Backtest)" : "";
    const fileName = `Trade #${nextNum}${suffix}.md`;
    const filePath = `${folder}/${fileName}`;

    // Build YAML
    const today = new Date().toISOString().split("T")[0];
    const yamlLines = this.settings.templateYaml.map((l) =>
      l.replace("{{date}}", today)
    );

    // Build body
    const body = [
      "---",
      ...yamlLines,
      "---",
      "",
      "> [!note] Before Trading",
      ">",
      "> _Market context, key levels, bias, confluences..._",
      ">",
      "> - Bias / Direction:",
      "> - Key Levels:",
      "> - Market Conditions:",
      "> - Confluences:",
      "",
      "> [!note] During Trading",
      ">",
      "> _How did the trade unfold? Entry, management, emotions..._",
      ">",
      "> - Entry Signal / Execution:",
      "> - TP / SL Management:",
      "> - Emotions During Trade:",
      "",
      "> [!note] After Trading",
      ">",
      "> _Outcome, lessons learned, mistakes to improve..._",
      ">",
      "> - Outcome:",
      "> - Mistakes Made:",
      "> - Lessons Learned:",
      "",
      "> [!faq]- Summary Template",
      ">",
      "> - [ ] Entry Signal Quality",
      "> - [ ] Risk Management Followed",
      "> - [ ] Trade Plan Adhered To",
      "> - [ ] Emotions Under Control",
      "> - [ ] Lesson Documented",
      "",
      "---",
      "",
      "### Screenshots",
      "",
      "<!-- Drag & drop screenshots here, or use ![[image.png]] -->",
      "",
      "[[TRADING]]",
    ].join("\n");

    try {
      await this.app.vault.create(filePath, body);
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(
        this.app.vault.getAbstractFileByPath(filePath)
      );
    } catch (e) {
      new Notice(`Error creating ${label}: ${e.message}`);
    }
  }

  async loadSettings() {
    const data = await this.loadData();
    if (data) {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Refresh open views
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((l) => {
      if (l.view instanceof DatabaseView) l.view.render();
    });
  }
}

// ─── Database View ──────────────────────────────────────
class DatabaseView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.trades = [];
    this.filteredTrades = [];
    this.sortKey = null;
    this.sortAsc = true;
    this.filters = {};
    this.searchTerm = "";
    this.activeTab = "trades"; // "trades" | "dashboard"
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Trade Rythm";
  }

  getIcon() {
    return "dollar-sign";
  }

  async onOpen() {
    this.containerEl.empty();
    this.containerEl.addClass("trade-rythm-plugin");

    // Header
    const header = this.containerEl.createEl("div", { cls: "tj-header" });
    header.createEl("h2", { text: "Trade Rythm" });

    // Tab bar
    const tabBar = this.containerEl.createEl("div", { cls: "tj-tabs" });
    this.tabTrades = tabBar.createEl("button", {
      text: "Trades",
      cls: "tj-tab tj-tab-active",
    });
    this.tabDashboard = tabBar.createEl("button", {
      text: "Dashboard",
      cls: "tj-tab",
    });
    this.tabTrades.addEventListener("click", () => this.switchTab("trades"));
    this.tabDashboard.addEventListener("click", () => this.switchTab("dashboard"));

    // New trade button
    const btnBar = this.containerEl.createEl("div", { cls: "tj-btn-bar" });
    const btnNew = btnBar.createEl("button", {
      text: "+ New Trade",
      cls: "tj-btn tj-btn-primary",
    });
    btnNew.addEventListener("click", () => this.plugin.createNewTrade(false));

    const btnBacktest = btnBar.createEl("button", {
      text: "+ New Backtest",
      cls: "tj-btn",
    });
    btnBacktest.addEventListener("click", () =>
      this.plugin.createNewTrade(true)
    );

    // Content area
    this.contentEl = this.containerEl.createEl("div", { cls: "tj-content" });

    // Listen for file changes
    this.registerEvent(
      this.app.metadataCache.on("changed", () => this.render())
    );
    this.registerEvent(
      this.app.vault.on("create", () => this.render())
    );
    this.registerEvent(
      this.app.vault.on("delete", () => this.render())
    );

    await this.render();
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.tabTrades.toggleClass("tj-tab-active", tab === "trades");
    this.tabDashboard.toggleClass("tj-tab-active", tab === "dashboard");
    this.render();
  }

  async render() {
    this.contentEl.empty();
    await this.loadTrades();

    if (this.activeTab === "dashboard") {
      this.renderDashboard();
    } else {
      this.renderFilterBar();
      this.renderTable();
    }
  }

  async loadTrades() {
    this.trades = [];
    const tradeFolder = this.plugin.settings.tradeFolder;
    const backtestFolder = this.plugin.settings.backtestFolder;

    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      if (
        !file.path.startsWith(tradeFolder) &&
        !file.path.startsWith(backtestFolder)
      ) {
        continue;
      }
      const cache = this.app.metadataCache.getFileCache(file);
      if (!cache || !cache.frontmatter) continue;

      const fm = cache.frontmatter;
      const isBacktest = file.path.startsWith(backtestFolder);

      this.trades.push({
        file,
        isBacktest,
        frontmatter: fm,
        // Computed
        date: fm["Entry / Exit Date"] || "",
        symbol: fm.Symbol ? this.stripWiki(fm.Symbol) : "",
        model: fm.Model ? this.stripWiki(fm.Model) : "",
        direction: fm.Position || "",
        status: fm.Status || "",
        pnl: fm["Gross PnL"] !== undefined ? fm["Gross PnL"] : null,
        session: fm.Session ? this.stripWiki(fm.Session) : "",
        setupGrade: fm["Setup Grade"] ? this.stripWiki(fm["Setup Grade"]) : "",
        account: fm.Account ? this.stripWiki(fm.Account) : "",
        tradeType: fm["Type of Trade"] ? this.stripWiki(fm["Type of Trade"]) : "",
        orderType: fm["Order Type"] ? this.stripWiki(fm["Order Type"]) : "",
        mistakes: this.parseList(fm.Mistakes),
        confluences: this.parseList(fm.Confluences),
        keyLevels: this.parseList(fm["Key Levels"]),
        mistakesStr: this.parseListStr(fm.Mistakes),
      });
    }

    this.applyFilters();
  }

  stripWiki(val) {
    if (!val) return "";
    const s = String(val);
    return s.replace(/\[\[|\]\]/g, "");
  }

  parseList(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => this.stripWiki(v));
    return [this.stripWiki(val)];
  }

  parseListStr(val) {
    return this.parseList(val).join(", ");
  }

  applyFilters() {
    let list = [...this.trades];

    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(term) ||
          t.model.toLowerCase().includes(term) ||
          t.direction.toLowerCase().includes(term)
      );
    }

    // Column filters
    for (const [key, val] of Object.entries(this.filters)) {
      if (!val) continue;
      list = list.filter((t) => {
        const v = String(t[key] || "").toLowerCase();
        return v.includes(val.toLowerCase());
      });
    }

    // Sort
    if (this.sortKey) {
      list.sort((a, b) => {
        let av = a[this.sortKey];
        let bv = b[this.sortKey];
        if (this.sortKey === "date") {
          av = av ? new Date(av).getTime() : 0;
          bv = bv ? new Date(bv).getTime() : 0;
        } else if (this.sortKey === "pnl") {
          av = av ?? -999999;
          bv = bv ?? -999999;
        } else {
          av = String(av || "").toLowerCase();
          bv = String(bv || "").toLowerCase();
        }
        return av < bv ? (this.sortAsc ? -1 : 1) : av > bv ? (this.sortAsc ? 1 : -1) : 0;
      });
    }

    this.filteredTrades = list;
  }

  // ── Filter Bar ───────────────────────────────────────
  renderFilterBar() {
    const bar = this.contentEl.createEl("div", { cls: "tj-filter-bar" });

    // Search
    const search = bar.createEl("input", {
      cls: "tj-search",
      attr: { type: "text", placeholder: "Search symbol, model..." },
    });
    search.value = this.searchTerm;
    search.addEventListener("input", () => {
      this.searchTerm = search.value;
      this.render();
    });

    // Symbol filter
    const symbols = [...new Set(this.trades.map((t) => t.symbol).filter(Boolean))].sort();
    if (symbols.length > 0) {
      const sel = bar.createEl("select", { cls: "tj-filter-select" });
      sel.createEl("option", { text: "All Symbols", value: "" });
      symbols.forEach((s) => sel.createEl("option", { text: s, value: s }));
      sel.addEventListener("change", () => {
        this.filters.symbol = sel.value;
        this.render();
      });
    }

    // Model filter
    const models = [...new Set(this.trades.map((t) => t.model).filter(Boolean))].sort();
    if (models.length > 0) {
      const sel = bar.createEl("select", { cls: "tj-filter-select" });
      sel.createEl("option", { text: "All Models", value: "" });
      models.forEach((m) => sel.createEl("option", { text: m, value: m }));
      sel.addEventListener("change", () => {
        this.filters.model = sel.value;
        this.render();
      });
    }

    // Status filter
    const sel = bar.createEl("select", { cls: "tj-filter-select" });
    sel.createEl("option", { text: "All Status", value: "" });
    sel.createEl("option", { text: "Closed", value: "Closed" });
    sel.createEl("option", { text: "Open", value: "Open" });
    sel.addEventListener("change", () => {
      this.filters.status = sel.value;
      this.render();
    });

    // Count
    bar.createEl("span", {
      text: `${this.filteredTrades.length} trades`,
      cls: "tj-count",
    });
  }

  // ── Table ─────────────────────────────────────────────
  renderTable() {
    const cols = this.plugin.settings.columns;

    const wrapper = this.contentEl.createEl("div", { cls: "tj-table-wrapper" });
    const table = wrapper.createEl("table", { cls: "tj-table" });
    const thead = table.createEl("thead");
    const tbody = table.createEl("tbody");

    // Header row
    const tr = thead.createEl("tr");
    tr.createEl("th", { text: "#", cls: "tj-th-num" });
    cols.forEach((col) => {
      const key = this.colKey(col);
      const th = tr.createEl("th", {
        text: col,
        cls: "tj-th" + (this.sortKey === key ? " tj-th-sorted" : ""),
      });
      th.addEventListener("click", () => {
        if (this.sortKey === key) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortKey = key;
          this.sortAsc = true;
        }
        this.render();
      });
    });

    // Data rows
    this.filteredTrades.forEach((trade, i) => {
      const row = tbody.createEl("tr", { cls: "tj-row" });
      row.addEventListener("dblclick", () => {
        this.app.workspace.getLeaf(false).openFile(trade.file);
      });

      row.createEl("td", { text: String(i + 1), cls: "tj-td tj-td-num" });

      cols.forEach((col) => {
        const key = this.colKey(col);
        const td = row.createEl("td", { cls: "tj-td" });

        const val = this.getCellValue(trade, col);
        const isNumeric = typeof val === "number";

        if (isNumeric) {
          td.setText(val.toFixed(2));
          td.toggleClass("tj-pnl-positive", val > 0);
          td.toggleClass("tj-pnl-negative", val < 0);
        } else if (col === "Screenshots" && val) {
          td.setText(val);
        } else {
          td.setText(val || "");
        }

        // Inline editing
        td.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          if (col === "Entry / Exit Date" || col === "Gross PnL" || col === "Status") {
            this.createInlineEditor(td, trade, col);
          }
        });
      });
    });

    if (this.filteredTrades.length === 0) {
      const row = tbody.createEl("tr");
      const td = row.createEl("td", {
        attr: { colspan: String(cols.length + 1) },
        cls: "tj-td-empty",
      });
      td.setText("No trades found. Click '+ New Trade' to create one.");
    }
  }

  colKey(col) {
    const map = {
      "Entry / Exit Date": "date",
      Symbol: "symbol",
      Model: "model",
      Direction: "direction",
      Status: "status",
      "Gross PnL": "pnl",
      Session: "session",
      "Setup Grade": "setupGrade",
      Account: "account",
      "Type of Trade": "tradeType",
      "Order Type": "orderType",
      Mistakes: "mistakesStr",
    };
    return map[col] || col;
  }

  getCellValue(trade, col) {
    switch (col) {
      case "Entry / Exit Date":
        return trade.date;
      case "Symbol":
        return trade.symbol;
      case "Model":
        return trade.model;
      case "Direction":
        return trade.direction;
      case "Status":
        return trade.status;
      case "Gross PnL":
        return trade.pnl;
      case "Session":
        return trade.session;
      case "Setup Grade":
        return trade.setupGrade;
      case "Account":
        return trade.account;
      case "Type of Trade":
        return trade.tradeType;
      case "Order Type":
        return trade.orderType;
      case "Mistakes":
        return trade.mistakesStr;
      case "Confluences":
        return trade.confluences.join(", ");
      case "Key Levels":
        return trade.keyLevels.join(", ");
      default: {
        const fm = trade.frontmatter;
        const raw = fm[col];
        if (raw === null || raw === undefined) return "";
        const s = String(raw);
        return s.replace(/\[\[|\]\]/g, "");
      }
    }
  }

  async createInlineEditor(td, trade, col) {
    const current = this.getCellValue(trade, col);
    td.empty();
    const input = td.createEl("input", {
      cls: "tj-inline-editor",
      attr: { type: "text", value: current },
    });
    input.focus();
    input.select();

    const save = async () => {
      const newVal = input.value.trim();
      const fm = trade.frontmatter;
      if (col === "Gross PnL") {
        fm["Gross PnL"] = parseFloat(newVal) || 0;
      } else if (col === "Status") {
        fm["Status"] = newVal;
      } else if (col === "Entry / Exit Date") {
        fm["Entry / Exit Date"] = newVal;
      }
      await this.writeFrontmatter(trade.file, fm);
      this.render();
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { input.blur(); }
      if (e.key === "Escape") { this.render(); }
    });
  }

  async writeFrontmatter(file, frontmatter) {
    const content = await this.app.vault.read(file);
    const lines = content.split("\n");
    let inFm = false;
    let fmEnd = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        if (!inFm) {
          inFm = true;
        } else {
          fmEnd = i;
          break;
        }
      }
    }
    if (fmEnd < 0) return;

    // Build new frontmatter lines
    const newLines = ["---"];
    for (const [key, val] of Object.entries(frontmatter)) {
      const yamlKey = key.includes(":") || key.includes("/") ? `"${key}"` : key;
      if (val === null || val === undefined) {
        newLines.push(`${yamlKey}: null`);
      } else if (typeof val === "string" && val.startsWith("[[") && val.endsWith("]]")) {
        newLines.push(`${yamlKey}: ${val}`);
      } else if (typeof val === "string") {
        newLines.push(`${yamlKey}: ${val}`);
      } else if (typeof val === "number") {
        newLines.push(`${yamlKey}: ${val}`);
      } else if (typeof val === "boolean") {
        newLines.push(`${yamlKey}: ${val}`);
      } else if (Array.isArray(val)) {
        val.forEach((v) => newLines.push(`${yamlKey}: ${v}`));
      } else {
        newLines.push(`${yamlKey}: ${val}`);
      }
    }
    newLines.push("---");

    const rest = lines.slice(fmEnd + 1).join("\n");
    await this.app.vault.modify(file, newLines.join("\n") + "\n" + rest);
  }

  // ── Dashboard ─────────────────────────────────────────
  renderDashboard() {
    const trades = this.filteredTrades.filter((t) => t.status === "Closed");
    const allTrades = this.filteredTrades;

    const closedPnl = trades
      .map((t) => t.pnl ?? 0)
      .reduce((a, b) => a + b, 0);
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const best = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl ?? 0)) : 0;
    const worst = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl ?? 0)) : 0;

    const dash = this.contentEl.createEl("div", { cls: "tj-dashboard" });

    // Summary cards
    const cards = dash.createEl("div", { cls: "tj-dash-cards" });

    this.dashCard(cards, "Total Trades", String(allTrades.length), "");
    this.dashCard(
      cards,
      "Net PnL",
      `$${closedPnl.toFixed(2)}`,
      closedPnl >= 0 ? "tj-pnl-positive" : "tj-pnl-negative"
    );
    this.dashCard(cards, "Win Rate", `${winRate.toFixed(1)}%`, winRate >= 50 ? "tj-pnl-positive" : "tj-pnl-negative");
    this.dashCard(cards, "Best Trade", `$${best.toFixed(2)}`, "tj-pnl-positive");
    this.dashCard(cards, "Worst Trade", `$${worst.toFixed(2)}`, "tj-pnl-negative");
    this.dashCard(cards, "Closed Trades", String(trades.length), "");

    // PnL by Model
    this.renderGroupBreakdown(dash, "PnL by Model", trades, "model");

    // PnL by Symbol
    this.renderGroupBreakdown(dash, "PnL by Symbol", trades, "symbol");

    // PnL by Session
    this.renderGroupBreakdown(dash, "PnL by Session", trades, "session");

    // Recent trades
    const recent = [...allTrades]
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      })
      .slice(0, 10);

    if (recent.length > 0) {
      const sec = dash.createEl("div", { cls: "tj-dash-section" });
      sec.createEl("h3", { text: "Recent Trades" });
      const tbl = sec.createEl("table", { cls: "tj-table tj-dash-table" });
      const hdr = tbl.createEl("thead").createEl("tr");
      hdr.createEl("th", { text: "Date" });
      hdr.createEl("th", { text: "Symbol" });
      hdr.createEl("th", { text: "Dir" });
      hdr.createEl("th", { text: "Model" });
      hdr.createEl("th", { text: "PnL" });
      const bdy = tbl.createEl("tbody");
      recent.forEach((t) => {
        const r = bdy.createEl("tr");
        r.createEl("td", { text: t.date ? t.date.slice(0, 10) : "" });
        r.createEl("td", { text: t.symbol });
        r.createEl("td", { text: t.direction });
        r.createEl("td", { text: t.model });
        const pnlTd = r.createEl("td", {
          text: t.pnl !== null ? `$${t.pnl.toFixed(2)}` : "",
        });
        pnlTd.toggleClass("tj-pnl-positive", t.pnl > 0);
        pnlTd.toggleClass("tj-pnl-negative", t.pnl < 0);
      });
    }
  }

  dashCard(parent, label, value, cls) {
    const card = parent.createEl("div", { cls: "tj-dash-card" });
    card.createEl("div", { text: label, cls: "tj-dash-label" });
    card.createEl("div", { text: value, cls: "tj-dash-value" + (cls ? " " + cls : "") });
  }

  renderGroupBreakdown(parent, title, trades, key) {
    const groups = {};
    trades.forEach((t) => {
      const k = t[key] || "Uncategorized";
      if (!groups[k]) groups[k] = [];
      groups[k].push(t);
    });

    const entries = Object.entries(groups)
      .map(([k, v]) => ({
        name: k,
        count: v.length,
        pnl: v.reduce((s, t) => s + (t.pnl ?? 0), 0),
        avg: v.reduce((s, t) => s + (t.pnl ?? 0), 0) / v.length,
        wins: v.filter((t) => t.pnl > 0).length,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    if (entries.length === 0) return;

    const sec = parent.createEl("div", { cls: "tj-dash-section" });
    sec.createEl("h3", { text: title });
    const tbl = sec.createEl("table", { cls: "tj-table tj-dash-table" });
    const hdr = tbl.createEl("thead").createEl("tr");
    hdr.createEl("th", { text: "Name" });
    hdr.createEl("th", { text: "Trades" });
    hdr.createEl("th", { text: "Net PnL" });
    hdr.createEl("th", { text: "Avg PnL" });
    hdr.createEl("th", { text: "Wins" });
    const bdy = tbl.createEl("tbody");
    entries.forEach((e) => {
      const r = bdy.createEl("tr");
      r.createEl("td", { text: e.name });
      r.createEl("td", { text: String(e.count) });
      const pnlTd = r.createEl("td", { text: `$${e.pnl.toFixed(2)}` });
      pnlTd.toggleClass("tj-pnl-positive", e.pnl > 0);
      pnlTd.toggleClass("tj-pnl-negative", e.pnl < 0);
      r.createEl("td", { text: `$${e.avg.toFixed(2)}` });
      r.createEl("td", { text: String(e.wins) });
    });
  }
}

// ─── Settings Tab ───────────────────────────────────────
class TradeRythmSettingsTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Trade Rythm Settings" });

    new Setting(containerEl)
      .setName("Trades folder")
      .setDesc("Vault-relative path to live trades")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.tradeFolder)
          .onChange(async (v) => {
            this.plugin.settings.tradeFolder = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Backtest folder")
      .setDesc("Vault-relative path to backtest trades")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.backtestFolder)
          .onChange(async (v) => {
            this.plugin.settings.backtestFolder = v;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Commands" });
    const cmdDiv = containerEl.createEl("div", { cls: "tj-settings-commands" });
    cmdDiv.createEl("p", {
      text: "Use Ctrl+P (Cmd+P) and search for:",
    });
    const ul = cmdDiv.createEl("ul");
    ul.createEl("li", { text: "Trade Rythm: Open Trade Rythm" });
    ul.createEl("li", { text: "Trade Rythm: New Trade Entry" });
    ul.createEl("li", { text: "Trade Rythm: New Backtest Entry" });
  }
}

// ─── Module Export ──────────────────────────────────────
module.exports = TradeRythmPlugin;
