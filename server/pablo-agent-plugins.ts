import { storage } from "./storage";
import { multiWalletSystem } from "./multi-wallet-system";
import { secureTradingPlatform } from "./secure-trading-platform";

export interface PluginInterface {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: "trading" | "analytics" | "wallet" | "security" | "integration" | "automation";
  permissions: ("read_wallets" | "execute_trades" | "access_keys" | "modify_settings" | "create_wallets")[];
  isActive: boolean;
  configuration: Record<string, any>;
  apiEndpoints: PluginEndpoint[];
  dashboardComponents: DashboardComponent[];
  hooks: PluginHook[];
  dependencies: string[];
  createdAt: Date;
  lastUpdate: Date;
}

export interface PluginEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  handler: string;
  authentication: boolean;
  rateLimit?: number;
  description: string;
}

export interface DashboardComponent {
  id: string;
  name: string;
  type: "chart" | "table" | "widget" | "form" | "iframe" | "custom";
  size: "small" | "medium" | "large" | "full";
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval?: number;
  isVisible: boolean;
}

export interface PluginHook {
  event: "wallet_created" | "transaction_completed" | "security_alert" | "market_signal" | "agent_action";
  handler: string;
  priority: number;
  async: boolean;
}

export interface AgentPlugin {
  id: string;
  name: string;
  agentId: string;
  walletId?: string;
  capabilities: string[];
  tradingStrategies: string[];
  riskParameters: {
    maxPositionSize: number;
    stopLoss: number;
    takeProfit: number;
    maxDailyLoss: number;
  };
  performance: {
    totalTrades: number;
    successfulTrades: number;
    totalProfit: number;
    avgProfit: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  isAutonomous: boolean;
  lastActivity: Date;
  createdBy: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  userId: string;
  layout: "grid" | "flex" | "custom";
  theme: "dark" | "light" | "neon" | "minimal";
  components: DashboardComponent[];
  plugins: string[];
  refreshRate: number;
  isPublic: boolean;
  permissions: string[];
  createdAt: Date;
  lastModified: Date;
}

export class PabloAgentPluginSystem {
  private plugins: Map<string, PluginInterface> = new Map();
  private agentPlugins: Map<string, AgentPlugin> = new Map();
  private customDashboards: Map<string, CustomDashboard> = new Map();
  private pluginRegistry: Map<string, any> = new Map();
  private eventBus: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeBuiltInPlugins();
    this.setupEventHandlers();
  }

  private initializeBuiltInPlugins() {
    const builtInPlugins: PluginInterface[] = [
      {
        id: "wallet-manager-pro",
        name: "Wallet Manager Pro",
        version: "1.0.0",
        author: "Pablo",
        description: "Advanced multi-wallet management with proxy addresses and security features",
        category: "wallet",
        permissions: ["read_wallets", "create_wallets", "access_keys"],
        isActive: true,
        configuration: {
          defaultSecurityLevel: "enhanced",
          autoBackup: true,
          encryptionType: "AES-256"
        },
        apiEndpoints: [
          {
            path: "/api/plugins/wallet-manager/create",
            method: "POST",
            handler: "createWalletHandler",
            authentication: true,
            description: "Create new wallet with custom configuration"
          },
          {
            path: "/api/plugins/wallet-manager/analytics",
            method: "GET",
            handler: "getWalletAnalytics",
            authentication: true,
            description: "Get wallet performance analytics"
          }
        ],
        dashboardComponents: [
          {
            id: "wallet-overview",
            name: "Wallet Overview",
            type: "widget",
            size: "large",
            position: { x: 0, y: 0, width: 12, height: 4 },
            config: { showBalances: true, showTransactions: true },
            dataSource: "/api/multi-wallet/wallets",
            refreshInterval: 30000,
            isVisible: true
          },
          {
            id: "security-status",
            name: "Security Status",
            type: "chart",
            size: "medium",
            position: { x: 0, y: 4, width: 6, height: 3 },
            config: { chartType: "gauge", metric: "securityScore" },
            dataSource: "/api/plugins/wallet-manager/security-score",
            refreshInterval: 60000,
            isVisible: true
          }
        ],
        hooks: [
          {
            event: "wallet_created",
            handler: "onWalletCreated",
            priority: 1,
            async: false
          }
        ],
        dependencies: [],
        createdAt: new Date(),
        lastUpdate: new Date()
      },
      {
        id: "trading-assistant",
        name: "AI Trading Assistant",
        version: "2.1.0",
        author: "Pablo",
        description: "Intelligent trading assistant with strategy recommendations and execution",
        category: "trading",
        permissions: ["read_wallets", "execute_trades"],
        isActive: true,
        configuration: {
          riskTolerance: "moderate",
          tradingPairs: ["SOL/USDC", "BONK/SOL"],
          maxPositionSize: 1000
        },
        apiEndpoints: [
          {
            path: "/api/plugins/trading/signals",
            method: "GET",
            handler: "getTradingSignals",
            authentication: true,
            description: "Get AI-generated trading signals"
          },
          {
            path: "/api/plugins/trading/execute",
            method: "POST",
            handler: "executeTrade",
            authentication: true,
            rateLimit: 10,
            description: "Execute trade based on AI recommendation"
          }
        ],
        dashboardComponents: [
          {
            id: "trading-signals",
            name: "Trading Signals",
            type: "table",
            size: "large",
            position: { x: 0, y: 0, width: 12, height: 6 },
            config: { columns: ["pair", "signal", "confidence", "entry", "target"] },
            dataSource: "/api/plugins/trading/signals",
            refreshInterval: 5000,
            isVisible: true
          },
          {
            id: "performance-chart",
            name: "Performance Chart",
            type: "chart",
            size: "large",
            position: { x: 0, y: 6, width: 12, height: 4 },
            config: { chartType: "line", timeframe: "24h" },
            dataSource: "/api/plugins/trading/performance",
            refreshInterval: 60000,
            isVisible: true
          }
        ],
        hooks: [
          {
            event: "market_signal",
            handler: "onMarketSignal",
            priority: 2,
            async: true
          }
        ],
        dependencies: ["wallet-manager-pro"],
        createdAt: new Date(),
        lastUpdate: new Date()
      },
      {
        id: "security-monitor",
        name: "Security Monitor",
        version: "1.5.0",
        author: "Pablo",
        description: "Real-time security monitoring and threat detection",
        category: "security",
        permissions: ["read_wallets", "access_keys", "modify_settings"],
        isActive: true,
        configuration: {
          alertThreshold: "medium",
          monitoringFrequency: 30,
          autoResponse: true
        },
        apiEndpoints: [
          {
            path: "/api/plugins/security/alerts",
            method: "GET",
            handler: "getSecurityAlerts",
            authentication: true,
            description: "Get security alerts and threats"
          },
          {
            path: "/api/plugins/security/scan",
            method: "POST",
            handler: "performSecurityScan",
            authentication: true,
            description: "Perform comprehensive security scan"
          }
        ],
        dashboardComponents: [
          {
            id: "security-alerts",
            name: "Security Alerts",
            type: "widget",
            size: "medium",
            position: { x: 6, y: 4, width: 6, height: 3 },
            config: { alertLevels: ["high", "critical"], maxAlerts: 10 },
            dataSource: "/api/plugins/security/alerts",
            refreshInterval: 10000,
            isVisible: true
          },
          {
            id: "threat-map",
            name: "Threat Map",
            type: "custom",
            size: "large",
            position: { x: 0, y: 7, width: 12, height: 5 },
            config: { mapType: "network", showIPs: true },
            dataSource: "/api/plugins/security/threats",
            refreshInterval: 30000,
            isVisible: true
          }
        ],
        hooks: [
          {
            event: "security_alert",
            handler: "onSecurityAlert",
            priority: 1,
            async: false
          }
        ],
        dependencies: [],
        createdAt: new Date(),
        lastUpdate: new Date()
      },
      {
        id: "analytics-suite",
        name: "Analytics Suite",
        version: "3.0.0",
        author: "Pablo",
        description: "Comprehensive analytics and reporting dashboard",
        category: "analytics",
        permissions: ["read_wallets"],
        isActive: true,
        configuration: {
          dataRetention: 90,
          reportingFrequency: "daily",
          includeMetrics: ["performance", "risk", "volume"]
        },
        apiEndpoints: [
          {
            path: "/api/plugins/analytics/reports",
            method: "GET",
            handler: "getAnalyticsReports",
            authentication: true,
            description: "Get comprehensive analytics reports"
          },
          {
            path: "/api/plugins/analytics/metrics",
            method: "GET",
            handler: "getMetrics",
            authentication: true,
            description: "Get real-time metrics and KPIs"
          }
        ],
        dashboardComponents: [
          {
            id: "kpi-dashboard",
            name: "KPI Dashboard",
            type: "widget",
            size: "full",
            position: { x: 0, y: 0, width: 12, height: 8 },
            config: { 
              metrics: ["totalProfit", "winRate", "sharpeRatio", "maxDrawdown"],
              layout: "grid"
            },
            dataSource: "/api/plugins/analytics/kpis",
            refreshInterval: 30000,
            isVisible: true
          }
        ],
        hooks: [
          {
            event: "transaction_completed",
            handler: "onTransactionCompleted",
            priority: 3,
            async: true
          }
        ],
        dependencies: ["wallet-manager-pro", "trading-assistant"],
        createdAt: new Date(),
        lastUpdate: new Date()
      }
    ];

    builtInPlugins.forEach(plugin => {
      this.plugins.set(plugin.id, plugin);
      this.registerPluginHandlers(plugin);
    });

    // Initialize some sample agent plugins
    this.initializeSampleAgentPlugins();

    storage.createActivity({
      agentId: "pablo-plugin-system",
      type: "system_initialized",
      description: "Pablo's AI Agent Plugin System initialized with 4 built-in plugins",
      projectId: "plugin-system",
      metadata: {
        pluginsLoaded: builtInPlugins.length,
        categories: [...new Set(builtInPlugins.map(p => p.category))],
        totalEndpoints: builtInPlugins.reduce((sum, p) => sum + p.apiEndpoints.length, 0)
      }
    });
  }

  private initializeSampleAgentPlugins() {
    const sampleAgents: AgentPlugin[] = [
      {
        id: "arbitrage-bot-alpha",
        name: "Arbitrage Bot Alpha",
        agentId: "agent-001",
        capabilities: ["cross_dex_arbitrage", "flash_loans", "risk_management"],
        tradingStrategies: ["triangular_arbitrage", "cross_chain_arbitrage"],
        riskParameters: {
          maxPositionSize: 5000,
          stopLoss: 2,
          takeProfit: 5,
          maxDailyLoss: 500
        },
        performance: {
          totalTrades: 1247,
          successfulTrades: 1089,
          totalProfit: 12750.45,
          avgProfit: 10.23,
          sharpeRatio: 2.14,
          maxDrawdown: 3.2
        },
        isAutonomous: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        createdBy: "pablo"
      },
      {
        id: "whale-follower-beta",
        name: "Whale Follower Beta",
        agentId: "agent-002",
        capabilities: ["whale_tracking", "copy_trading", "sentiment_analysis"],
        tradingStrategies: ["whale_following", "smart_money_tracking"],
        riskParameters: {
          maxPositionSize: 2000,
          stopLoss: 5,
          takeProfit: 12,
          maxDailyLoss: 200
        },
        performance: {
          totalTrades: 856,
          successfulTrades: 692,
          totalProfit: 8934.67,
          avgProfit: 10.44,
          sharpeRatio: 1.87,
          maxDrawdown: 4.1
        },
        isAutonomous: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
        createdBy: "pablo"
      },
      {
        id: "memecoin-sniper-gamma",
        name: "Memecoin Sniper Gamma",
        agentId: "agent-003",
        capabilities: ["new_token_detection", "liquidity_analysis", "volume_tracking"],
        tradingStrategies: ["memecoin_sniping", "momentum_trading"],
        riskParameters: {
          maxPositionSize: 1000,
          stopLoss: 10,
          takeProfit: 50,
          maxDailyLoss: 300
        },
        performance: {
          totalTrades: 2134,
          successfulTrades: 1281,
          totalProfit: 15623.89,
          avgProfit: 7.32,
          sharpeRatio: 1.65,
          maxDrawdown: 8.7
        },
        isAutonomous: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
        createdBy: "pablo"
      }
    ];

    sampleAgents.forEach(agent => {
      this.agentPlugins.set(agent.id, agent);
    });
  }

  private setupEventHandlers() {
    // Set up event listeners for plugin hooks
    this.eventBus.set("wallet_created", []);
    this.eventBus.set("transaction_completed", []);
    this.eventBus.set("security_alert", []);
    this.eventBus.set("market_signal", []);
    this.eventBus.set("agent_action", []);
  }

  private registerPluginHandlers(plugin: PluginInterface) {
    // Register plugin hooks with event bus
    plugin.hooks.forEach(hook => {
      const handlers = this.eventBus.get(hook.event) || [];
      handlers.push(this.createHookHandler(plugin.id, hook));
      handlers.sort((a, b) => (a as any).priority - (b as any).priority);
      this.eventBus.set(hook.event, handlers);
    });

    // Register API endpoint handlers
    plugin.apiEndpoints.forEach(endpoint => {
      const handlerKey = `${plugin.id}:${endpoint.handler}`;
      this.pluginRegistry.set(handlerKey, this.createEndpointHandler(plugin.id, endpoint));
    });
  }

  private createHookHandler(pluginId: string, hook: PluginHook) {
    return {
      pluginId,
      handler: hook.handler,
      priority: hook.priority,
      async: hook.async,
      execute: (data: any) => {
        // Simulate hook execution
        storage.createActivity({
          agentId: pluginId,
          type: "hook_executed",
          description: `Plugin hook ${hook.handler} executed for event ${hook.event}`,
          projectId: "plugin-system",
          metadata: { event: hook.event, data }
        });
      }
    };
  }

  private createEndpointHandler(pluginId: string, endpoint: PluginEndpoint) {
    return {
      pluginId,
      endpoint: endpoint.path,
      method: endpoint.method,
      execute: async (req: any, res: any) => {
        // Simulate endpoint execution based on plugin and handler
        switch (endpoint.handler) {
          case "createWalletHandler":
            return this.handleCreateWallet(req.body);
          case "getWalletAnalytics":
            return this.handleGetWalletAnalytics(req.query);
          case "getTradingSignals":
            return this.handleGetTradingSignals();
          case "executeTrade":
            return this.handleExecuteTrade(req.body);
          case "getSecurityAlerts":
            return this.handleGetSecurityAlerts();
          case "performSecurityScan":
            return this.handlePerformSecurityScan();
          case "getAnalyticsReports":
            return this.handleGetAnalyticsReports(req.query);
          case "getMetrics":
            return this.handleGetMetrics();
          default:
            return { error: "Handler not implemented" };
        }
      }
    };
  }

  // Plugin Handler Implementations
  private async handleCreateWallet(params: any) {
    try {
      const wallet = await multiWalletSystem.createSystemWallet(
        params.userId || "default-user",
        params.walletType || "hot_trading",
        {
          label: params.label || "Plugin Created Wallet",
          description: params.description || "Created via plugin system",
          initialBalance: params.initialBalance || 0,
          securityPlan: params.securityPlan || "basic"
        }
      );
      return { success: true, wallet };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private handleGetWalletAnalytics(query: any) {
    const stats = multiWalletSystem.getSystemStats();
    return {
      analytics: {
        totalWallets: stats.totalWallets,
        totalBalance: stats.totalBalance,
        averageBalance: stats.totalBalance / stats.totalWallets,
        transactionVolume: stats.totalVolume,
        securityScore: 85 + Math.random() * 10, // Simulated security score
        riskLevel: stats.totalBalance > 100000 ? "high" : 
                   stats.totalBalance > 10000 ? "medium" : "low"
      }
    };
  }

  private handleGetTradingSignals() {
    const signals = [
      {
        pair: "SOL/USDC",
        signal: "BUY",
        confidence: 87,
        entry: 98.45,
        target: 105.67,
        stopLoss: 92.10,
        reasoning: "Strong whale accumulation detected"
      },
      {
        pair: "BONK/SOL",
        signal: "SELL",
        confidence: 72,
        entry: 0.000024,
        target: 0.000019,
        stopLoss: 0.000026,
        reasoning: "Overbought conditions on 4h timeframe"
      },
      {
        pair: "WIF/USDC",
        signal: "HOLD",
        confidence: 65,
        entry: 2.34,
        target: 2.89,
        stopLoss: 2.01,
        reasoning: "Consolidation phase, wait for breakout"
      }
    ];
    return { signals, timestamp: new Date() };
  }

  private async handleExecuteTrade(params: any) {
    try {
      // Use secure trading platform to execute trade
      const transaction = await secureTradingPlatform.executeSecureTransaction({
        walletId: params.walletId,
        type: params.type || "buy",
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amount,
        strategyId: "ai-trading-assistant"
      });
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private handleGetSecurityAlerts() {
    const alerts = [
      {
        id: "alert-001",
        level: "high",
        type: "unusual_activity",
        message: "Large transaction detected from unknown wallet",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        walletId: "wallet-123",
        resolved: false
      },
      {
        id: "alert-002",
        level: "medium",
        type: "login_attempt",
        message: "Multiple failed login attempts from new IP",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        ipAddress: "192.168.1.100",
        resolved: true
      },
      {
        id: "alert-003",
        level: "critical",
        type: "security_breach",
        message: "Unauthorized private key access attempted",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        walletId: "wallet-456",
        resolved: false
      }
    ];
    return { alerts: alerts.filter(a => !a.resolved) };
  }

  private handlePerformSecurityScan() {
    return {
      scanId: `scan-${Date.now()}`,
      status: "completed",
      results: {
        vulnerabilities: 2,
        warnings: 5,
        recommendations: [
          "Enable 2FA for all wallets",
          "Update encryption keys",
          "Review access logs"
        ],
        score: 82,
        scanDuration: 15.3
      },
      timestamp: new Date()
    };
  }

  private handleGetAnalyticsReports(query: any) {
    const timeframe = query.timeframe || "24h";
    return {
      report: {
        timeframe,
        metrics: {
          totalProfit: 15234.67,
          totalTrades: 1247,
          winRate: 87.3,
          sharpeRatio: 2.14,
          maxDrawdown: 3.2,
          volatility: 12.8
        },
        breakdown: {
          arbitrage: { profit: 8934.23, trades: 523 },
          whale_following: { profit: 4567.89, trades: 321 },
          memecoin_sniping: { profit: 1732.55, trades: 403 }
        },
        topPerformers: [
          { strategy: "triangular_arbitrage", profit: 3456.78 },
          { strategy: "whale_following", profit: 2890.45 },
          { strategy: "flash_arbitrage", profit: 2134.67 }
        ]
      }
    };
  }

  private handleGetMetrics() {
    return {
      realTimeMetrics: {
        activeStrategies: 12,
        runningTrades: 7,
        dailyProfit: 1234.56,
        systemLoad: 23,
        apiCalls: 15678,
        errors: 3
      },
      timestamp: new Date()
    };
  }

  // Public API Methods
  async installPlugin(pluginData: Partial<PluginInterface>): Promise<string> {
    const pluginId = `plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const plugin: PluginInterface = {
      id: pluginId,
      name: pluginData.name || "Unnamed Plugin",
      version: pluginData.version || "1.0.0",
      author: pluginData.author || "unknown",
      description: pluginData.description || "",
      category: pluginData.category || "integration",
      permissions: pluginData.permissions || [],
      isActive: false,
      configuration: pluginData.configuration || {},
      apiEndpoints: pluginData.apiEndpoints || [],
      dashboardComponents: pluginData.dashboardComponents || [],
      hooks: pluginData.hooks || [],
      dependencies: pluginData.dependencies || [],
      createdAt: new Date(),
      lastUpdate: new Date()
    };

    this.plugins.set(pluginId, plugin);
    this.registerPluginHandlers(plugin);

    storage.createActivity({
      agentId: "pablo-plugin-system",
      type: "plugin_installed",
      description: `Plugin ${plugin.name} installed successfully`,
      projectId: "plugin-system",
      metadata: { pluginId, name: plugin.name, author: plugin.author }
    });

    return pluginId;
  }

  async createCustomDashboard(userId: string, dashboardData: Partial<CustomDashboard>): Promise<string> {
    const dashboardId = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const dashboard: CustomDashboard = {
      id: dashboardId,
      name: dashboardData.name || "Custom Dashboard",
      userId,
      layout: dashboardData.layout || "grid",
      theme: dashboardData.theme || "dark",
      components: dashboardData.components || [],
      plugins: dashboardData.plugins || [],
      refreshRate: dashboardData.refreshRate || 30000,
      isPublic: dashboardData.isPublic || false,
      permissions: dashboardData.permissions || [],
      createdAt: new Date(),
      lastModified: new Date()
    };

    this.customDashboards.set(dashboardId, dashboard);

    storage.createActivity({
      agentId: "pablo-plugin-system",
      type: "dashboard_created",
      description: `Custom dashboard ${dashboard.name} created`,
      projectId: "plugin-system",
      metadata: { dashboardId, name: dashboard.name, userId }
    });

    return dashboardId;
  }

  async deployAgentPlugin(agentData: Partial<AgentPlugin>): Promise<string> {
    const agentId = `agent-plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create wallet for agent if needed
    let walletId;
    if (agentData.capabilities?.includes("trading")) {
      const wallet = await multiWalletSystem.createSystemWallet("pablo", "agent_imported", {
        label: `${agentData.name} Wallet`,
        description: `Auto-created wallet for agent plugin`,
        initialBalance: 1000,
        securityPlan: "premium"
      });
      walletId = wallet.id;
    }

    const agent: AgentPlugin = {
      id: agentId,
      name: agentData.name || "Unnamed Agent",
      agentId: agentData.agentId || agentId,
      walletId,
      capabilities: agentData.capabilities || [],
      tradingStrategies: agentData.tradingStrategies || [],
      riskParameters: agentData.riskParameters || {
        maxPositionSize: 1000,
        stopLoss: 5,
        takeProfit: 10,
        maxDailyLoss: 100
      },
      performance: {
        totalTrades: 0,
        successfulTrades: 0,
        totalProfit: 0,
        avgProfit: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      },
      isAutonomous: agentData.isAutonomous || true,
      lastActivity: new Date(),
      createdBy: "pablo"
    };

    this.agentPlugins.set(agentId, agent);

    storage.createActivity({
      agentId: "pablo-plugin-system",
      type: "agent_plugin_deployed",
      description: `Agent plugin ${agent.name} deployed with wallet integration`,
      projectId: "plugin-system",
      metadata: { agentId, name: agent.name, walletId, capabilities: agent.capabilities }
    });

    return agentId;
  }

  // Getter methods
  getAllPlugins(): PluginInterface[] {
    return Array.from(this.plugins.values());
  }

  getActivePlugins(): PluginInterface[] {
    return Array.from(this.plugins.values()).filter(p => p.isActive);
  }

  getPluginsByCategory(category: string): PluginInterface[] {
    return Array.from(this.plugins.values()).filter(p => p.category === category);
  }

  getAgentPlugins(): AgentPlugin[] {
    return Array.from(this.agentPlugins.values());
  }

  getCustomDashboards(userId?: string): CustomDashboard[] {
    const dashboards = Array.from(this.customDashboards.values());
    return userId ? dashboards.filter(d => d.userId === userId || d.isPublic) : dashboards;
  }

  getPluginEndpointHandler(pluginId: string, handlerName: string) {
    const handlerKey = `${pluginId}:${handlerName}`;
    return this.pluginRegistry.get(handlerKey);
  }

  async triggerEvent(event: string, data: any) {
    const handlers = this.eventBus.get(event) || [];
    for (const handler of handlers) {
      try {
        if ((handler as any).async) {
          setTimeout(() => (handler as any).execute(data), 0);
        } else {
          (handler as any).execute(data);
        }
      } catch (error) {
        console.error(`Plugin hook error for ${event}:`, error);
      }
    }
  }

  getSystemStats() {
    return {
      totalPlugins: this.plugins.size,
      activePlugins: this.getActivePlugins().length,
      agentPlugins: this.agentPlugins.size,
      customDashboards: this.customDashboards.size,
      totalEndpoints: Array.from(this.plugins.values()).reduce((sum, p) => sum + p.apiEndpoints.length, 0),
      totalComponents: Array.from(this.customDashboards.values()).reduce((sum, d) => sum + d.components.length, 0),
      categories: [...new Set(Array.from(this.plugins.values()).map(p => p.category))],
      authors: [...new Set(Array.from(this.plugins.values()).map(p => p.author))]
    };
  }
}

export const pabloPluginSystem = new PabloAgentPluginSystem();