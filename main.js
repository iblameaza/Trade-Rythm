/// <reference types="obsidian" />
/**
 * Trade Rythm — custom Obsidian plugin
 * Table view, inline editing, PnL dashboard, trade creation.
 */

const { Plugin, ItemView, PluginSettingTab, Setting, Notice, Modal } = require("obsidian");

const VIEW_TYPE = "trade-rythm-db";

// ─── Settings ───────────────────────────────────────────
const SETUP_CATEGORIES = {
  accounts: { label: "Accounts", folder: "Accounts", hasYaml: true, multi: false, defaults: [] },
  models: { label: "Models", folder: "Models", multi: false, defaults: [] },
  sessions: { label: "Sessions", folder: "Sessions", multi: false, defaults: ["Asian", "London Open", "London Closed", "New York", "Out of Session"] },
  symbols: { label: "Symbols", folder: "Symbols", multi: false, defaults: ["BTC/USD", "SOL/USD", "EUR/USD", "GBP/USD", "USD/JPY", "USD/CAD", "AUD/USD", "NZD/USD", "USD/CHF", "XAU/USD"] },
  entryTimeframes: { label: "Entry Timeframes", folder: "Entry Timeframes", multi: false, defaults: ["1 minutes", "3 minutes", "5 minutes", "15 minutes", "30 minutes", "1 Hour", "3 Hour", "4 Hour", "1 Day"] },
  confluences: { label: "Confluences", folder: "Confluences", multi: true, defaults: ["HTF Trend Alignment", "SMT Divergence with Relative", "SMT Divergence with DXY", "Entry in OTE", "Displacement", "Aligned with Seasonal", "Commercials at Net Extreme", "Open Interest Rising"] },
  keyLevels: { label: "Key Levels", folder: "Key Levels", multi: true, defaults: ["Order Block (1H)", "Order Block (4H)", "Order Block (1D)", "Liquidity Sweep", "Liquidity Vload", "Imbalance", "PDH", "OTE", "PDL", "Internal to External Liq", "External to Internal Liq", "Rejection Block (1H)", "Rejection Block (4H)", "Rejection Block (1D)"] },
  entrySignals: { label: "Entry Signals", folder: "Entry Signals", multi: true, defaults: ["Candle Confirmation", "CSD", "Inversion-FVG"] },
  marketConditions: { label: "Market Conditions", folder: "Market Conditions", multi: false, defaults: ["Pullback in uptrend", "Pullback in downtrend", "High volatility", "Low volatility", "Strong uptrend (HTF)", "Strong uptrend (LTF)", "Strong downtrend (HTF)", "Strong downtrend (LTF)", "Sideways (HTF)", "Sideways (LTF)", "Consolidation before breakout", "Consolidation before reversal", "Slowing momentum", "News-driven spike", "Economic news impact"] },
  slManagement: { label: "SL Management", folder: "SL Management", multi: false, defaults: ["Locked Profit", "Moved to BE", "Hit Initial SL", "Hit Trailed SL", "Widened SL", "Initial SL Maintained", "Partial SL Adjustment", "Pre-News Tightening", "Delayed SL Placement", "Removed SL", "No SL"] },
  tpManagement: { label: "TP Management", folder: "TP Management", multi: false, defaults: ["Final TP Hit", "Partial 1 Taken", "Partial 2 Taken", "Partial 3 Taken", "Let Runner Go", "Pre-News Exit", "No Momentum Exit", "Manual Close (Profit)", "Manual Close (BE)", "Manual Close (Loss)", "Setup Invalidated"] },
  newsImpact: { label: "News Impact", folder: "News Impact", multi: false, defaults: ["High", "Medium", "Low"] },
  typesOfTrade: { label: "Types of Trade", folder: "Types of Trade", multi: false, defaults: ["Scalping", "Day Trade", "Short Term Trade", "Swing Trade", "Position Trade"] },
  mistakes: { label: "Mistakes", folder: "Mistakes", multi: true, defaults: [] },
  orderTypes: { label: "Order Types", folder: "Order Types", multi: false, defaults: ["Limit Order", "Market Order", "Stop Order"] },
  setupGrades: { label: "Setup Grades", folder: "Setup Grades", multi: false, defaults: ["A+", "A", "B", "C", "F"] },
  positions: { label: "Positions", folder: "Positions", multi: false, defaults: ["Long", "Short"] },
};

const DEFAULT_SETTINGS = {
  tradeFolder: "Private Github/\ufe31 Trades Journal",
  backtestFolder: "Private Github/\ufe31 Backtest Journal",
  attachmentsFolder: "attachments",
  setupFolder: "Private Github/\ufe31 Trading Settings",
  previewMode: "live",
  dashboardAccount: "",
  tableFontSize: "12",
  columns: [
    "Symbol", "Direction", "Account", "Type of Trade", "Entry TimeFrame",
    "Entry Signal", "Market Conditions", "Key Levels", "Confluences",
    "Session", "Model", "Bias", "Order Type", "S/L Pips", "% Risk",
    "Status", "Entry / Exit Date",
    "Gross PnL", "Setup Grade", "SL Management", "TP Management",
    "Max RR reached", "Actual RR achieved: W(+1), L(-1), BE(0)",
    "Fees", "News Impact", "Mistakes", "Bias Review",
    "Entry Performance", "Psychology Tracker", "LeaderBoard",
    "Weekly Report", "Tradingview Chart",
    "Entry / Exit Date (end)", "No-Explanation?"
  ],
  templateYaml: [
    'Symbol: ',
    'Position: ',
    'Account: ',
    'Type of Trade: ',
    'Entry TimeFrame: ',
    'Entry Signal: ',
    'Market Conditions: ',
    'Key Levels: ',
    'Confluences: ',
    'Session: ',
    'Model: ',
    'Bias: ',
    'Order Type: ',
    '"S/L Pips": ',
    '"% Risk": ',
    'Status: Open',
    '"Entry / Exit Date": "{{date}}"',
    'Gross PnL: ',
    'Setup Grade: ',
    'SL Management: ',
    'TP Management: ',
    'Max RR reached: ',
    '"Actual RR achieved: W(+1), L(-1), BE(0)": ',
    'Fees: ',
    'News Impact: ',
    'Mistakes: ',
    'Bias Review: ',
    'Entry Performance: ',
    'Psychology Tracker: ',
    'LeaderBoard: ',
    'Weekly Report: ',
    'Tradingview Chart: ',
    '"Entry / Exit Date (end)": ',
    'No-Explanation?: false',
  ]
};

// ─── Plugin ─────────────────────────────────────────────
class TradeRythmPlugin extends Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.settings = Object.assign({}, DEFAULT_SETTINGS);
  }

  async onload() {
    new Notice("Trade Rythm: loading...");
    console.log("Trade Rythm plugin loading...");
    await this.loadSettings();
    try {
      await this.initSetupFolders();
    } catch (e) {
      console.error("Trade Rythm initSetupFolders error:", e);
    }
    // migrate old "Trading Setup" → "Trading Settings"
    try {
      const newPath = this.settings.setupFolder.replace("Trading Setup", "Trading Settings");
      if (this.settings.setupFolder !== newPath) {
        if (await this.app.vault.adapter.exists(this.settings.setupFolder)) {
          const oldFolder = this.app.vault.getAbstractFileByPath(this.settings.setupFolder);
          if (oldFolder) {
            await this.app.vault.rename(oldFolder, newPath);
            console.log("Migrated Trading Setup → Trading Settings");
          }
        }
        this.settings.setupFolder = newPath;
        await this.saveSettings();
      }
    } catch (e) {
      console.log("Trade Rythm: setup folder migration skipped:", e.message);
    }

    this.addRibbonIcon("dollar-sign", "Trade Rythm", () => this.activateView());

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

    this.app.workspace.onLayoutReady(async () => {
      if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length === 0) {
        await this.activateView();
      }
    });

    console.log("Trade Rythm plugin loaded successfully");
    new Notice("Trade Rythm: loaded successfully!");
  }

  onunload() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((l) => l.detach());
  }

  async activateView() {
    try {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
      if (leaves.length > 0) {
        this.app.workspace.revealLeaf(leaves[0]);
        return;
      }
      const leaf = this.app.workspace.getLeftLeaf(false);
      if (!leaf) {
        new Notice("Trade Rythm: no leaf available");
        return;
      }
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    } catch (e) {
      console.error("Trade Rythm activateView error:", e);
      new Notice("Trade Rythm: " + e.message);
    }
  }

  async createNewTrade(isBacktest) {
    const folder = isBacktest ? this.settings.backtestFolder : this.settings.tradeFolder;
    const label = isBacktest ? "Backtest" : "Trade";

    const files = this.app.vault.getMarkdownFiles();
    const maxNum = files
      .filter((f) => f.path.startsWith(folder))
      .reduce((max, f) => {
        const m = f.name.match(new RegExp(`^Trade (\\d+)`));
        return m ? Math.max(max, parseInt(m[1])) : max;
      }, 0);
    const nextNum = maxNum + 1;

    const suffix = isBacktest ? " (Backtest)" : "";
    const fileName = `Trade ${nextNum}${suffix}.md`;
    const filePath = `${folder}/${fileName}`;

    const today = new Date().toISOString().split("T")[0];
    const yamlLines = this.settings.templateYaml.map((l) =>
      l.replace("{{date}}", today)
    );

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
      const newFile = await this.app.vault.create(filePath, body);
      const leaf = this.app.workspace.getLeaf(false);
      if (leaf && newFile) {
        await leaf.openFile(newFile);
      }
    } catch (e) {
      console.error("Trade Rythm create error:", e);
      new Notice(`Trade Rythm: ${e.message}`);
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
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((l) => {
      if (l.view instanceof DatabaseView) l.view.render();
    });
  }

  // ─── Setup Folder Helpers ────────────────────
  getSetupFolderPath(category) {
    const cfg = SETUP_CATEGORIES[category];
    return cfg ? `${this.settings.setupFolder}/${cfg.folder}` : null;
  }

  async ensureFolder(path) {
    try {
      if (await this.app.vault.adapter.exists(path)) return;
      await this.app.vault.createFolder(path);
    } catch (e) {
      console.error(`Trade Rythm ensureFolder error for "${path}":`, e);
    }
  }

  async getSetupItems(category) {
    const folderPath = this.getSetupFolderPath(category);
    if (!folderPath) return [];
    try {
      const items = await this.app.vault.adapter.list(folderPath);
      const files = items.files.filter((f) => f.endsWith(".md")).sort();
      return files.map((f) => {
        const name = f.split("/").pop().replace(/\.md$/i, "");
        return { name, path: f };
      });
    } catch {
      return [];
    }
  }

  async addSetupItem(category, name, extraData) {
    try {
      const folderPath = this.getSetupFolderPath(category);
      if (!folderPath) return;
      await this.ensureFolder(folderPath);
      const filePath = `${folderPath}/${name}.md`;
      if (await this.app.vault.adapter.exists(filePath)) return;
      let body = `---\ntype: ${category}\n`;
      if (extraData) {
        for (const [k, v] of Object.entries(extraData)) {
          body += `${k}: ${v}\n`;
        }
      }
      body += "---\n";
      await this.app.vault.create(filePath, body);
    } catch (e) {
      console.error(`Trade Rythm addSetupItem error (${category}/${name}):`, e);
    }
  }

  async deleteSetupItem(category, name) {
    try {
      const folderPath = this.getSetupFolderPath(category);
      if (!folderPath) return;
      const filePath = `${folderPath}/${name}.md`;
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file) await this.app.vault.delete(file);
    } catch (e) {
      console.error(`Trade Rythm deleteSetupItem error (${category}/${name}):`, e);
    }
  }

  async initSetupFolders() {
    for (const [key, cfg] of Object.entries(SETUP_CATEGORIES)) {
      const folderPath = this.getSetupFolderPath(key);
      await this.ensureFolder(folderPath);
      if (cfg.defaults.length > 0) {
        const items = await this.getSetupItems(key);
        for (const def of cfg.defaults) {
          if (!items.find((i) => i.name === def)) {
            await this.addSetupItem(key, def);
          }
        }
      }
    }
  }

  async readSetupFileYaml(category, name) {
    const folderPath = this.getSetupFolderPath(category);
    if (!folderPath) return null;
    const filePath = `${folderPath}/${name}.md`;
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!file) return null;
    const cache = this.app.metadataCache.getFileCache(file);
    return cache?.frontmatter || null;
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
    this.activeTab = "trades";
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

    const header = this.containerEl.createEl("div", { cls: "tj-header" });
    header.createEl("h2", { text: "Trade Rythm" });
    const kofi = header.createEl("a", {
      cls: "tj-kofi",
      attr: { href: "https://ko-fi.com/iblameaza", target: "_blank", title: "Support me on Ko-fi" },
    });
    kofi.innerHTML = '☕ <span>Support me</span>';

    const tabBar = this.containerEl.createEl("div", { cls: "tj-tabs" });
    this.tabTrades = tabBar.createEl("button", {
      text: "Trades",
      cls: "tj-tab tj-tab-active",
    });
    this.tabDashboard = tabBar.createEl("button", {
      text: "Dashboard",
      cls: "tj-tab",
    });
    this.btnSettings = tabBar.createEl("button", {
      text: "Settings",
      cls: "tj-tab",
    });
    this.tabTrades.addEventListener("click", () => this.switchTab("trades"));
    this.tabDashboard.addEventListener("click", () => this.switchTab("dashboard"));
    this.btnSettings.addEventListener("click", () => {
      new SettingsModal(this.app, this.plugin).open();
    });

    const btnBar = this.containerEl.createEl("div", { cls: "tj-btn-bar" });

    this.btnModeToggle = btnBar.createEl("button", {
      text: "Backtest",
      cls: "tj-btn",
    });
    this.btnModeToggle.addEventListener("click", () => {
      this.plugin.settings.previewMode = this.plugin.settings.previewMode === "live" ? "backtest" : "live";
      this.plugin.saveSettings();
      this.render();
    });

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

    this.accountBtn = btnBar.createEl("button", {
      text: "All Accounts ▼",
      cls: "tj-btn",
    });
    this.accountBtn.addEventListener("click", async (e) => {
      if (this.activeTab !== "dashboard") return;
      const accounts = await this.plugin.getSetupItems("accounts");
      const current = this.plugin.settings.dashboardAccount || "";
      const popup = this.accountBtn.createEl("div", { cls: "tj-account-popup" });
      const allItem = popup.createEl("div", { cls: "tj-account-item" + (!current ? " tj-account-sel" : "") });
      allItem.textContent = "All Accounts";
      allItem.addEventListener("mousedown", (e2) => {
        e2.preventDefault();
        this.plugin.settings.dashboardAccount = "";
        this.plugin.saveSettings();
        popup.remove();
      });
      for (const a of accounts) {
        const item = popup.createEl("div", { cls: "tj-account-item" + (a.name === current ? " tj-account-sel" : "") });
        item.textContent = a.name;
        item.addEventListener("mousedown", (e2) => {
          e2.preventDefault();
          this.plugin.settings.dashboardAccount = a.name;
          this.plugin.saveSettings();
          popup.remove();
        });
      }
      const closePopup = (e2) => {
        if (!popup || popup.contains(e2.target)) return;
        popup.remove();
        document.removeEventListener("mousedown", closePopup, true);
      };
      document.addEventListener("mousedown", closePopup, true);
    });

    this.contentEl = this.containerEl.createEl("div", { cls: "tj-content" });

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

  updateModeUI() {
    const isLive = this.plugin.settings.previewMode === "live";
    this.btnModeToggle.textContent = isLive ? "Backtest" : "Live";
    this.btnModeToggle.style.display = this.activeTab === "trades" ? "" : "none";
    const da = this.plugin.settings.dashboardAccount || "All Accounts";
    this.accountBtn.textContent = da + " ▼";
    this.accountBtn.style.display = this.activeTab === "dashboard" ? "" : "none";
  }

  async render() {
    if (this._rendering) return;
    this._rendering = true;
    try {
    this.contentEl.empty();
    this.updateModeUI();
    this.containerEl.style.setProperty("--tj-table-font-size", (this.plugin.settings.tableFontSize || "12") + "px");
    await this.loadTrades();

    if (this.activeTab === "dashboard") {
      const accountFilter = this.plugin.settings.dashboardAccount || "";
      this.filteredTrades = accountFilter
        ? this.trades.filter((t) => t.account === accountFilter)
        : [...this.trades];
      this.renderDashboard();
    } else {
      await this.applyFilters();
      this.renderFilterBar();
      this.renderTable();
    }
    } finally { this._rendering = false; }
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
      let fm = cache?.frontmatter || null;
      if (!fm) {
        fm = await this.readFrontmatterFromFile(file);
        if (!fm) continue;
      }
      const isBacktest = file.path.startsWith(backtestFolder);

      const tradeName = file.basename.replace(/#/g, "");
      const tradeNum = parseInt(file.basename.match(/\d+/)?.[0]) || 0;
      this.trades.push({
        file,
        name: tradeName,
        tradeNum,
        isBacktest,
        frontmatter: fm,
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
        entrySignal: this.parseListStr(fm["Entry Signal"]),
        marketConditions: fm["Market Conditions"] ? this.stripWiki(fm["Market Conditions"]) : "",
        slManagement: fm["SL Management"] ? this.stripWiki(fm["SL Management"]) : "",
        tpManagement: fm["TP Management"] ? this.stripWiki(fm["TP Management"]) : "",
        newsImpact: fm["News Impact"] ? this.stripWiki(fm["News Impact"]) : "",
        mistakes: this.parseList(fm.Mistakes),
        confluences: this.parseList(fm.Confluences),
        keyLevels: this.parseList(fm["Key Levels"]),
        mistakesStr: this.parseListStr(fm.Mistakes),
        confluencesStr: this.parseListStr(fm.Confluences),
        keyLevelsStr: this.parseListStr(fm["Key Levels"]),
      });
    }
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

  async applyFilters() {
    const mode = this.plugin.settings.previewMode;
    let list = this.trades.filter((t) =>
      mode === "live" ? !t.isBacktest : t.isBacktest
    );

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(term) ||
          t.model.toLowerCase().includes(term) ||
          t.direction.toLowerCase().includes(term)
      );
    }

    for (const [key, val] of Object.entries(this.filters)) {
      if (!val) continue;
      list = list.filter((t) => {
        const v = String(t[key] || "").toLowerCase();
        return v.includes(val.toLowerCase());
      });
    }

    if (this.sortKey) {
      const sortCols = {
        symbol: "symbols", direction: "positions", session: "sessions",
        account: "accounts", model: "models", tradeType: "typesOfTrade",
        setupGrade: "setupGrades", orderType: "orderTypes",
        entrySignal: "entrySignals", marketConditions: "marketConditions",
        slManagement: "slManagement", tpManagement: "tpManagement",
        newsImpact: "newsImpact",
      };
      let orderMap = null;
      const cat = sortCols[this.sortKey];
      if (cat) {
        const items = await this.plugin.getSetupItems(cat);
        orderMap = {};
        items.forEach((item, idx) => { orderMap[item.name.toLowerCase()] = idx; });
      }

      list.sort((a, b) => {
        let av = a[this.sortKey];
        let bv = b[this.sortKey];
        if (this.sortKey === "name") {
          av = a.tradeNum;
          bv = b.tradeNum;
        } else if (this.sortKey === "date") {
          av = av ? new Date(av).getTime() : 0;
          bv = bv ? new Date(bv).getTime() : 0;
        } else if (this.sortKey === "pnl") {
          av = av ?? -999999;
          bv = bv ?? -999999;
        } else if (orderMap) {
          const ai = orderMap[String(av || "").toLowerCase()] ?? 99999;
          const bi = orderMap[String(bv || "").toLowerCase()] ?? 99999;
          return ai < bi ? (this.sortAsc ? -1 : 1) : ai > bi ? (this.sortAsc ? 1 : -1) : 0;
        } else {
          av = String(av || "").toLowerCase();
          bv = String(bv || "").toLowerCase();
        }
        return av < bv ? (this.sortAsc ? -1 : 1) : av > bv ? (this.sortAsc ? 1 : -1) : 0;
      });
    }

    this.filteredTrades = list;
  }

  renderFilterBar() {
    const bar = this.contentEl.createEl("div", { cls: "tj-filter-bar" });

    const search = bar.createEl("input", {
      cls: "tj-search",
      attr: { type: "text", placeholder: "Search symbol, model..." },
    });
    search.value = this.searchTerm;
    search.addEventListener("input", () => {
      this.searchTerm = search.value;
      this.render();
    });

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

    const sel = bar.createEl("select", { cls: "tj-filter-select" });
    sel.createEl("option", { text: "All Status", value: "" });
    sel.createEl("option", { text: "Closed", value: "Closed" });
    sel.createEl("option", { text: "Open", value: "Open" });
    sel.addEventListener("change", () => {
      this.filters.status = sel.value;
      this.render();
    });

    bar.createEl("span", {
      text: `${this.filteredTrades.length} trades`,
      cls: "tj-count",
    });
  }

  renderTable() {
    const cols = this.plugin.settings.columns;

    const wrapper = this.contentEl.createEl("div", { cls: "tj-table-wrapper" });
    const table = wrapper.createEl("table", { cls: "tj-table" });
    const thead = table.createEl("thead");
    const tbody = table.createEl("tbody");

    const tr = thead.createEl("tr");
    const tradeArrow = this.sortKey === "name" ? (this.sortAsc ? " ↑" : " ↓") : "";
    const tradeTh = tr.createEl("th", { text: "Trade" + tradeArrow, cls: "tj-th tj-th-name" + (this.sortKey === "name" ? " tj-th-sorted" : "") });
    tradeTh.addEventListener("click", () => {
      if (this.sortKey === "name") {
        if (this.sortAsc) { this.sortAsc = false; }
        else { this.sortKey = null; }
      } else {
        this.sortKey = "name";
        this.sortAsc = true;
      }
      this.render();
    });
    cols.forEach((col) => {
      const key = this.colKey(col);
      const sorted = this.sortKey === key;
      const arrow = sorted ? (this.sortAsc ? " ↑" : " ↓") : "";
      const th = tr.createEl("th", {
        text: col + arrow,
        cls: "tj-th" + (sorted ? " tj-th-sorted" : ""),
      });
      th.addEventListener("click", () => {
        if (this.sortKey === key) {
          if (this.sortAsc) { this.sortAsc = false; }
          else { this.sortKey = null; }
        } else {
          this.sortKey = key;
          this.sortAsc = true;
        }
        this.render();
      });
    });

    this.filteredTrades.forEach((trade, i) => {
      const row = tbody.createEl("tr", { cls: "tj-row" });
      row.addEventListener("dblclick", () => {
        this.app.workspace.getLeaf(false).openFile(trade.file);
      });

      const name = trade.file.basename.replace(/#/g, "");
      row.createEl("td", { text: name, cls: "tj-td tj-td-name" });

      cols.forEach((col) => {
        const key = this.colKey(col);
        const td = row.createEl("td", { cls: "tj-td" });
        if (col === "Entry / Exit Date" || col === "Entry / Exit Date (end)") td.addClass("tj-date-cell");

        const val = this.getCellValue(trade, col);
        const isNumeric = typeof val === "number";

        if (isNumeric) {
          td.setText(val.toFixed(2));
          td.toggleClass("tj-pnl-positive", val > 0);
          td.toggleClass("tj-pnl-negative", val < 0);
        } else {
          td.setText(val || "");
        }

        td.addEventListener("click", (e) => {
          e.stopPropagation();
          const readonly = ["Gross PnL", "Fees", "S/L Pips", "% Risk", "Max RR reached", "Actual RR achieved: W(+1), L(-1), BE(0)", "Entry / Exit Date", "Entry / Exit Date (end)"];
          if (readonly.includes(col)) return;
          const editable = ["Status", "Account", "Model", "Session", "Symbol", "Entry TimeFrame", "Entry Signal", "Setup Grade", "Type of Trade", "Order Type", "Market Conditions", "SL Management", "TP Management", "News Impact", "Confluences", "Key Levels", "Mistakes", "Direction"];
          if (editable.includes(col)) {
            this.createInlineEditor(td, trade, col, true);
          }
        });
        td.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.app.workspace.getLeaf(true).openFile(trade.file);
        });
      });
    });

    if (this.filteredTrades.length === 0) {
      const row = tbody.createEl("tr");
      const td = row.createEl("td", {
        attr: { colspan: String(cols.length + 1) },
        cls: "tj-td-empty",
      });
      td.style.textAlign = "center";
      td.setText("No trades found. Click '+ New Trade' to create one.");
    }
  }

  async readFrontmatterFromFile(file) {
    try {
      const content = await this.app.vault.read(file);
      const lines = content.split("\n");
      if (lines[0]?.trim() !== "---") return null;
      let end = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "---") { end = i; break; }
      }
      if (end < 0) return null;
      const fm = {};
      for (let i = 1; i < end; i++) {
        const line = lines[i];
        const colon = line.indexOf(":");
        if (colon < 0) continue;
        let key = line.slice(0, colon).trim();
        let val = line.slice(colon + 1).trim();
        if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
        if (val === "null" || val === "") {
          fm[key] = null;
        } else if (val === "true") { fm[key] = true; }
        else if (val === "false") { fm[key] = false; }
        else if (/^-?\d+(\.\d+)?$/.test(val)) { fm[key] = parseFloat(val); }
        else {
          if (fm[key] !== undefined) {
            if (!Array.isArray(fm[key])) fm[key] = [fm[key]];
            fm[key].push(val);
          } else {
            fm[key] = val;
          }
        }
      }
      return Object.keys(fm).length > 0 ? fm : null;
    } catch { return null; }
  }

  colKey(col) {
    const map = {
      Trade: "name",
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
      "Entry Signal": "entrySignal",
      "Market Conditions": "marketConditions",
      "SL Management": "slManagement",
      "TP Management": "tpManagement",
      "News Impact": "newsImpact",
      Mistakes: "mistakesStr",
      Confluences: "confluencesStr",
      "Key Levels": "keyLevelsStr",
    };
    return map[col] || col;
  }

  getCellValue(trade, col) {
    switch (col) {
      case "Entry / Exit Date": return trade.date;
      case "Symbol": return trade.symbol;
      case "Model": return trade.model;
      case "Direction": return trade.direction;
      case "Status": return trade.status;
      case "Gross PnL": return trade.pnl;
      case "Session": return trade.session;
      case "Setup Grade": return trade.setupGrade;
      case "Account": return trade.account;
      case "Type of Trade": return trade.tradeType;
      case "Order Type": return trade.orderType;
      case "Entry Signal": return trade.entrySignal || "";
      case "Market Conditions": return trade.marketConditions || "";
      case "SL Management": return trade.slManagement || "";
      case "TP Management": return trade.tpManagement || "";
      case "News Impact": return trade.newsImpact || "";
      case "Mistakes": return trade.mistakesStr;
      case "Confluences": return trade.confluencesStr;
      case "Key Levels": return trade.keyLevelsStr;
      default: {
        const fm = trade.frontmatter;
        const raw = fm[col];
        if (raw === null || raw === undefined) return "";
        return this.stripWiki(String(raw));
      }
    }
  }

  static YAML_KEY_MAP = { Direction: "Position" };

  async getSetupOptions(col) {
    const map = {
      Account: "accounts", Model: "models", Session: "sessions", Symbol: "symbols",
      "Entry TimeFrame": "entryTimeframes", "Entry Signal": "entrySignals",
      "Market Conditions": "marketConditions", "SL Management": "slManagement",
      "TP Management": "tpManagement", "News Impact": "newsImpact",
      "Type of Trade": "typesOfTrade", "Order Type": "orderTypes",
      "Setup Grade": "setupGrades", Confluences: "confluences",
      "Key Levels": "keyLevels", Mistakes: "mistakes",
      Direction: "positions",
    };
    const cat = map[col];
    if (!cat) return null;
    return await this.plugin.getSetupItems(cat);
  }

  isMultiColumn(col) {
    const map = { Confluences: "confluences", "Key Levels": "keyLevels", Mistakes: "mistakes", "Entry Signal": "entrySignals" };
    const cat = map[col];
    return cat ? (SETUP_CATEGORIES[cat]?.multi || false) : false;
  }

  yamlKey(col) {
    return DatabaseView.YAML_KEY_MAP[col] || col;
  }

  async createInlineEditor(td, trade, col, showDropdown) {
    const current = this.getCellValue(trade, col);
    const options = await this.getSetupOptions(col);
    const isMulti = this.isMultiColumn(col);
    td.empty();
    td.style.position = "relative";

    const selected = isMulti ? current.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const wrapper = td.createEl("div", { cls: "tj-editor-wrapper" });

    const saveAndClose = async (val) => {
      const newVal = val != null ? val : "";
      const key = this.yamlKey(col);
      const fm = trade.frontmatter;
      if (isMulti) {
        fm[key] = newVal.split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        fm[key] = newVal;
      }
      await this.writeFrontmatter(trade.file, fm);
      await this.waitForMetadata(trade.file);
    };

    if (options && options.length > 0) {
      const popup = wrapper.createEl("div", { cls: "tj-dropdown-popup" });

      options.forEach((o) => {
        const item = popup.createEl("div", { cls: "tj-dropdown-item" });
        const isSel = isMulti ? selected.includes(o.name) : (o.name === current);
        if (isMulti) {
          item.createEl("span", { text: isSel ? "☑ " : "☐ ", cls: "tj-dd-check" });
        }
        item.createEl("span", { text: o.name });
        if (isSel) item.addClass("tj-dd-selected");

        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isMulti) {
            const idx = selected.indexOf(o.name);
            if (idx >= 0) selected.splice(idx, 1);
            else selected.push(o.name);
            const val = selected.join(", ");
            item.toggleClass("tj-dd-selected");
            const cb = item.querySelector(".tj-dd-check");
            if (cb) cb.textContent = selected.includes(o.name) ? "☑ " : "☐ ";
            const doneBtn = popup.querySelector(".tj-dd-done");
            if (doneBtn) doneBtn.dataset.val = val;
          } else {
            saveAndClose(o.name);
          }
        });
      });

      if (isMulti) {
        const doneBtn = popup.createEl("button", {
          text: "Done", cls: "tj-btn tj-btn-sm tj-btn-primary tj-dd-done",
        });
        doneBtn.dataset.val = selected.join(", ");
        doneBtn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          saveAndClose(doneBtn.dataset.val);
        });
      }

      document.addEventListener("mousedown", (e) => {
        if (!wrapper.contains(e.target)) {
          if (isMulti) saveAndClose(selected.join(", "));
          const p = wrapper.querySelector(".tj-dropdown-popup");
          if (p) p.remove();
        }
      }, { once: true });
    } else {
      const input = wrapper.createEl("input", {
        cls: "tj-inline-editor", attr: { type: "text", placeholder: "None" },
      });
      input.value = current;
      input.focus();
      input.select();
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { saveAndClose(input.value.trim() || ""); }
        if (e.key === "Escape") { input.blur(); }
      });
      document.addEventListener("mousedown", (e) => {
        if (!wrapper.contains(e.target)) {
          saveAndClose(input.value.trim() || "");
        }
      }, { once: true });
    }
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

  waitForMetadata(file) {
    return new Promise((resolve) => {
      const cached = this.app.metadataCache.getFileCache(file);
      if (cached?.frontmatter) { resolve(); return; }
      const handler = (changedFile) => {
        if (changedFile.path === file.path) {
          this.app.metadataCache.off("changed", handler);
          resolve();
        }
      };
      this.app.metadataCache.on("changed", handler);
      setTimeout(() => resolve(), 3000);
    });
  }

  renderDashboard() {
    const closed = this.filteredTrades.filter((t) => t.status === "Closed");
    const all = this.filteredTrades;

    const netPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const wins = closed.filter((t) => t.pnl > 0);
    const losses = closed.filter((t) => t.pnl < 0);
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
    const best = closed.length > 0 ? Math.max(...closed.map((t) => t.pnl ?? 0)) : 0;
    const worst = closed.length > 0 ? Math.min(...closed.map((t) => t.pnl ?? 0)) : 0;

    const dash = this.contentEl.createEl("div", { cls: "tj-dashboard" });

    const cards = dash.createEl("div", { cls: "tj-dash-cards" });
    this.dashCard(cards, "Total Trades", String(all.length), "");
    this.dashCard(cards, "Net PnL", `$${netPnl.toFixed(2)}`, netPnl >= 0 ? "tj-pnl-positive" : "tj-pnl-negative");
    this.dashCard(cards, "Win Rate", `${winRate.toFixed(1)}%`, winRate >= 50 ? "tj-pnl-positive" : "tj-pnl-negative");
    this.dashCard(cards, "Best Trade", `$${best.toFixed(2)}`, "tj-pnl-positive");
    this.dashCard(cards, "Worst Trade", `$${worst.toFixed(2)}`, "tj-pnl-negative");

    const chartRow = dash.createEl("div", { cls: "tj-chart-row" });
    this.renderDrawdownChart(chartRow, closed);
    this.renderPerformanceChart(chartRow, closed);

    this.renderGroupBreakdown(dash, "PnL by Model", closed, "model");
    this.renderGroupBreakdown(dash, "PnL by Symbol", closed, "symbol");
    this.renderGroupBreakdown(dash, "PnL by Session", closed, "session");
  }

  renderDrawdownChart(parent, trades) {
    const sorted = [...trades].filter((t) => t.pnl != null).sort((a, b) => (a.date < b.date ? -1 : 1));
    if (sorted.length < 2) {
      const box = parent.createEl("div", { cls: "tj-chart-box" });
      box.createEl("div", { text: "Drawdown", cls: "tj-chart-title" });
      box.createEl("div", { text: "Not enough data", cls: "tj-chart-empty" });
      return;
    }
    let equity = 0, peak = -Infinity;
    const ddSeries = [];
    for (let i = 0; i < sorted.length; i++) {
      equity += sorted[i].pnl ?? 0;
      peak = Math.max(peak, equity);
      const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
      ddSeries.push(Math.max(0, dd));
    }
    this.renderLineChart(parent, "Drawdown", ddSeries, "#e74c3c", "%");
  }

  renderPerformanceChart(parent, trades) {
    const sorted = [...trades].filter((t) => t.pnl != null).sort((a, b) => (a.date < b.date ? -1 : 1));
    if (sorted.length < 2) {
      const box = parent.createEl("div", { cls: "tj-chart-box" });
      box.createEl("div", { text: "Performance Profile", cls: "tj-chart-title" });
      box.createEl("div", { text: "Not enough data", cls: "tj-chart-empty" });
      return;
    }
    let cum = 0;
    const eqSeries = sorted.map((t) => { cum += t.pnl ?? 0; return cum; });
    this.renderLineChart(parent, "Performance Profile", eqSeries, "#2ecc71", "$");
  }

  renderLineChart(parent, title, series, color, prefix) {
    const box = parent.createEl("div", { cls: "tj-chart-box" });
    box.createEl("div", { text: title, cls: "tj-chart-title" });
    const svg = box.createEl("svg", { cls: "tj-chart-svg", attr: { viewBox: "0 0 400 160", preserveAspectRatio: "xMidYMid meet" } });
    const W = 400, H = 160, pad = 5;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const points = series.map((v, i) => {
      const x = pad + (i / (series.length - 1)) * (W - 2 * pad);
      const y = H - pad - ((v - min) / range) * (H - 2 * pad);
      return `${x},${y}`;
    });
    const polyline = svg.createEl("polyline", { attr: { points: points.join(" "), fill: "none", stroke: color, "stroke-width": "2", "stroke-linejoin": "round" } });
    const lastVal = series[series.length - 1];
    const label = box.createEl("div", { cls: "tj-chart-label", text: `${prefix}${lastVal.toFixed(1)}` });
    label.style.color = color;
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

// ─── Setup Modal ───────────────────────────────────────
class SettingsModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  static formatCurrency(val, currency) {
    const symbols = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", IDR: "Rp" };
    const sym = symbols[currency] || currency + " ";
    return sym + Number(val).toFixed(2);
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("tj-modal");
    contentEl.createEl("h2", { text: "Trading Settings" });

    for (const [key, cfg] of Object.entries(SETUP_CATEGORIES)) {
      const items = await this.plugin.getSetupItems(key);
      const sec = contentEl.createEl("div", { cls: "tj-setup-section" });
      sec.createEl("h3", { text: cfg.label });

      if (key === "accounts") {
        await this.renderAccountList(sec, items);
      } else {
        this.renderSimpleList(sec, key, items);
      }
    }

    const closeBtn = contentEl.createEl("div", { cls: "tj-modal-btns" });
    closeBtn.createEl("button", { text: "Close", cls: "tj-btn" })
      .addEventListener("click", () => this.close());
  }

  async renderAccountList(sec, items) {
    const addRow = sec.createEl("div", { cls: "tj-setup-add-row" });
    const nameI = addRow.createEl("input", { cls: "tj-sm-input", attr: { type: "text", placeholder: "Name" } });
    const balI = addRow.createEl("input", { cls: "tj-sm-input", attr: { type: "number", placeholder: "Balance" } });
    const curI = addRow.createEl("input", { cls: "tj-sm-input tj-sm-small", attr: { type: "text", placeholder: "USD", value: "USD" } });
    const typeS = addRow.createEl("select", { cls: "tj-sm-input tj-sm-small" });
    typeS.createEl("option", { text: "Live", value: "live" });
    typeS.createEl("option", { text: "Demo", value: "demo" });
    const addBtn = addRow.createEl("button", { text: "Add", cls: "tj-btn tj-btn-sm tj-btn-primary" });
    addBtn.addEventListener("click", async () => {
      const name = nameI.value.trim();
      if (!name) { new Notice("Name required"); return; }
      await this.plugin.addSetupItem("accounts", name, { initialBalance: balI.value || "0", currency: curI.value.toUpperCase() || "USD", type: typeS.value });
      nameI.value = ""; balI.value = ""; this.onOpen();
    });

    if (items.length === 0) return;

    const tbl = sec.createEl("table", { cls: "tj-table tj-setup-table" });
    const hdr = tbl.createEl("thead").createEl("tr");
    ["Name", "Balance", "Currency", "Type", ""].forEach((t) => hdr.createEl("th", { text: t }));
    const bdy = tbl.createEl("tbody");
    for (const item of items) {
      const fm = await this.plugin.readSetupFileYaml("accounts", item.name);
      const bal = fm?.initialBalance || "0";
      const cur = fm?.currency || "USD";
      const typ = fm?.type || "live";
      const pnl = 0; // computed from trades
      const row = bdy.createEl("tr");
      row.createEl("td", { text: item.name });
      row.createEl("td", { text: SettingsModal.formatCurrency(parseFloat(bal), cur) });
      row.createEl("td", { text: cur });
      row.createEl("td", { text: typ });
      const del = row.createEl("td").createEl("button", { text: "✕", cls: "tj-btn tj-btn-sm tj-btn-danger" });
      del.addEventListener("click", async () => {
        await this.plugin.deleteSetupItem("accounts", item.name);
        this.onOpen();
      });
    }
  }

  renderSimpleList(sec, key, items) {
    const addRow = sec.createEl("div", { cls: "tj-setup-add-row" });
    const input = addRow.createEl("input", { cls: "tj-sm-input", attr: { type: "text", placeholder: `Add ${SETUP_CATEGORIES[key].label.slice(0, -1)}...` } });
    const addBtn = addRow.createEl("button", { text: "Add", cls: "tj-btn tj-btn-sm tj-btn-primary" });
    addBtn.addEventListener("click", async () => {
      const name = input.value.trim();
      if (!name) return;
      await this.plugin.addSetupItem(key, name);
      input.value = "";
      this.onOpen();
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") addBtn.click(); });

    if (items.length === 0) return;
    const list = sec.createEl("ul", { cls: "tj-setup-list" });
    items.forEach((item) => {
      const li = list.createEl("li");
      li.createEl("span", { text: item.name });
      const del = li.createEl("button", { text: "✕", cls: "tj-btn tj-btn-sm tj-btn-danger" });
      del.addEventListener("click", async () => {
        await this.plugin.deleteSetupItem(key, item.name);
        this.onOpen();
      });
    });
  }

  onClose() {
    this.contentEl.empty();
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

    new Setting(containerEl)
      .setName("Setup folder")
      .setDesc("Vault-relative path to Trading Settings (Accounts, Models, Sessions, etc.)")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.setupFolder)
          .onChange(async (v) => {
            this.plugin.settings.setupFolder = v;
            await this.plugin.saveSettings();
            await this.plugin.initSetupFolders();
          })
      );

    new Setting(containerEl)
      .setName("Table font size")
      .setDesc("Font size for the trades table (px)")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.tableFontSize)
          .onChange(async (v) => {
            this.plugin.settings.tableFontSize = v || "12";
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
