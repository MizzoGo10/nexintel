import { storage } from "./storage";

export interface MobileApp {
  id: string;
  name: string;
  version: string;
  platform: "ios" | "android" | "web";
  downloadUrl: string;
  size: string;
  features: string[];
  customizations: AppCustomization[];
  isPublished: boolean;
  createdAt: Date;
  lastUpdate: Date;
}

export interface AppCustomization {
  id: string;
  userId: string;
  theme: "dark" | "light" | "neon" | "panther" | "mafia";
  widgets: CustomWidget[];
  layout: "grid" | "list" | "cards" | "timeline";
  notifications: NotificationSettings;
  tradingPreferences: TradingPreferences;
  audioSettings: AudioSettings;
  createdAt: Date;
}

export interface CustomWidget {
  id: string;
  type: "portfolio" | "trading" | "music" | "radio" | "alerts" | "news" | "agent";
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export interface NotificationSettings {
  tradingAlerts: boolean;
  priceTargets: boolean;
  agentUpdates: boolean;
  radioShows: boolean;
  auctionEvents: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

export interface TradingPreferences {
  defaultWallet: string;
  riskLevel: "conservative" | "moderate" | "aggressive" | "degen";
  autoExecute: boolean;
  stopLossDefault: number;
  takeProfitDefault: number;
  maxPositionSize: number;
}

export interface AudioSettings {
  musicEnabled: boolean;
  radioEnabled: boolean;
  volume: number;
  preferredGenres: string[];
  rapperAgentMusic: boolean;
  undergroundContent: boolean;
}

export interface DownloadStats {
  totalDownloads: number;
  activeUsers: number;
  retentionRate: number;
  averageSessionTime: number;
  topFeatures: string[];
  userFeedback: number;
}

export class MobileAppSystem {
  private apps: Map<string, MobileApp> = new Map();
  private customizations: Map<string, AppCustomization> = new Map();
  private downloadStats: DownloadStats = {
    totalDownloads: 0,
    activeUsers: 0,
    retentionRate: 0,
    averageSessionTime: 0,
    topFeatures: [],
    userFeedback: 0
  };

  constructor() {
    this.initializeMobileApps();
    this.startDownloadTracking();
  }

  private initializeMobileApps() {
    const nexusTraderApp: MobileApp = {
      id: "nexus-trader-mobile",
      name: "Nexus Trader Pro",
      version: "2.1.0",
      platform: "ios",
      downloadUrl: "https://apps.apple.com/nexus-trader-pro",
      size: "156 MB",
      features: [
        "Real-time trading execution",
        "Multi-wallet management",
        "AI agent plugins",
        "Rapper agent music integration",
        "Live radio streaming",
        "Custom dashboard builder",
        "Push notifications",
        "Biometric security",
        "Offline mode",
        "Dark web access (premium)"
      ],
      customizations: [],
      isPublished: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    };

    const androidApp: MobileApp = {
      ...nexusTraderApp,
      id: "nexus-trader-android",
      platform: "android",
      downloadUrl: "https://play.google.com/store/apps/nexus-trader-pro",
      size: "142 MB"
    };

    const webApp: MobileApp = {
      ...nexusTraderApp,
      id: "nexus-trader-web",
      platform: "web",
      downloadUrl: "https://app.nexustrader.pro",
      size: "12 MB (Progressive Web App)"
    };

    this.apps.set(nexusTraderApp.id, nexusTraderApp);
    this.apps.set(androidApp.id, androidApp);
    this.apps.set(webApp.id, webApp);

    // Initialize sample customizations
    this.initializeSampleCustomizations();

    storage.createActivity({
      agentId: "mobile-app-system",
      type: "system_initialized",
      description: "Mobile app system initialized with iOS, Android, and Web apps",
      projectId: "mobile-platform",
      metadata: {
        totalApps: this.apps.size,
        platforms: ["ios", "android", "web"],
        features: nexusTraderApp.features.length
      }
    });
  }

  private initializeSampleCustomizations() {
    const pantherCustomization: AppCustomization = {
      id: "panther-theme-001",
      userId: "panther-user",
      theme: "panther",
      widgets: [
        {
          id: "portfolio-widget",
          type: "portfolio",
          position: { x: 0, y: 0, width: 12, height: 4 },
          config: { showPnL: true, theme: "panther" },
          isVisible: true
        },
        {
          id: "rapper-music-widget",
          type: "music",
          position: { x: 0, y: 4, width: 6, height: 3 },
          config: { artist: "rapper-agent", autoplay: true },
          isVisible: true
        },
        {
          id: "underground-radio-widget",
          type: "radio",
          position: { x: 6, y: 4, width: 6, height: 3 },
          config: { station: "underground", premium: true },
          isVisible: true
        },
        {
          id: "auction-alerts-widget",
          type: "alerts",
          position: { x: 0, y: 7, width: 12, height: 2 },
          config: { events: ["panther", "mafia"], priority: "high" },
          isVisible: true
        }
      ],
      layout: "grid",
      notifications: {
        tradingAlerts: true,
        priceTargets: true,
        agentUpdates: true,
        radioShows: true,
        auctionEvents: true,
        pushNotifications: true,
        soundEnabled: true
      },
      tradingPreferences: {
        defaultWallet: "panther-vault",
        riskLevel: "aggressive",
        autoExecute: true,
        stopLossDefault: 2,
        takeProfitDefault: 15,
        maxPositionSize: 50000
      },
      audioSettings: {
        musicEnabled: true,
        radioEnabled: true,
        volume: 85,
        preferredGenres: ["trap", "drill", "underground"],
        rapperAgentMusic: true,
        undergroundContent: true
      },
      createdAt: new Date()
    };

    const mafiaCustomization: AppCustomization = {
      id: "mafia-theme-001",
      userId: "mafia-user",
      theme: "mafia",
      widgets: [
        {
          id: "trading-widget",
          type: "trading",
          position: { x: 0, y: 0, width: 8, height: 6 },
          config: { style: "mafia", autoTrade: true },
          isVisible: true
        },
        {
          id: "auction-widget",
          type: "alerts",
          position: { x: 8, y: 0, width: 4, height: 6 },
          config: { events: ["mafia", "exclusive"], vip: true },
          isVisible: true
        },
        {
          id: "radio-premium-widget",
          type: "radio",
          position: { x: 0, y: 6, width: 12, height: 3 },
          config: { subscription: "premium", underground: true },
          isVisible: true
        }
      ],
      layout: "cards",
      notifications: {
        tradingAlerts: true,
        priceTargets: false,
        agentUpdates: true,
        radioShows: true,
        auctionEvents: true,
        pushNotifications: true,
        soundEnabled: false
      },
      tradingPreferences: {
        defaultWallet: "mafia-secure",
        riskLevel: "moderate",
        autoExecute: false,
        stopLossDefault: 5,
        takeProfitDefault: 20,
        maxPositionSize: 25000
      },
      audioSettings: {
        musicEnabled: true,
        radioEnabled: true,
        volume: 70,
        preferredGenres: ["jazz", "classical", "ambient"],
        rapperAgentMusic: false,
        undergroundContent: true
      },
      createdAt: new Date()
    };

    this.customizations.set(pantherCustomization.id, pantherCustomization);
    this.customizations.set(mafiaCustomization.id, mafiaCustomization);
  }

  private startDownloadTracking() {
    // Simulate download tracking
    setInterval(() => {
      this.updateDownloadStats();
    }, 30000); // Update every 30 seconds
  }

  private updateDownloadStats() {
    // Simulate realistic download growth
    const dailyDownloads = Math.floor(Math.random() * 50) + 10;
    this.downloadStats.totalDownloads += dailyDownloads;
    this.downloadStats.activeUsers = Math.floor(this.downloadStats.totalDownloads * 0.3);
    this.downloadStats.retentionRate = 0.68 + Math.random() * 0.15;
    this.downloadStats.averageSessionTime = 18 + Math.random() * 12; // minutes
    this.downloadStats.topFeatures = [
      "AI agent plugins",
      "Multi-wallet management",
      "Rapper agent music",
      "Live radio",
      "Custom dashboards"
    ];
    this.downloadStats.userFeedback = 4.7 + Math.random() * 0.3;
  }

  async generateDownloadLink(platform: "ios" | "android" | "web", userId: string): Promise<string> {
    const app = Array.from(this.apps.values()).find(a => a.platform === platform);
    if (!app) {
      throw new Error(`App not available for platform: ${platform}`);
    }

    // Generate unique download link with tracking
    const downloadId = `dl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trackingParams = `?ref=${userId}&dl=${downloadId}&platform=${platform}`;

    storage.createActivity({
      agentId: "mobile-app-system",
      type: "download_initiated",
      description: `Download link generated for ${platform} platform`,
      projectId: "mobile-platform",
      metadata: { userId, platform, downloadId, appVersion: app.version }
    });

    return `${app.downloadUrl}${trackingParams}`;
  }

  async createCustomization(userId: string, customizationData: Partial<AppCustomization>): Promise<string> {
    const customizationId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const customization: AppCustomization = {
      id: customizationId,
      userId,
      theme: customizationData.theme || "dark",
      widgets: customizationData.widgets || [],
      layout: customizationData.layout || "grid",
      notifications: customizationData.notifications || {
        tradingAlerts: true,
        priceTargets: true,
        agentUpdates: true,
        radioShows: false,
        auctionEvents: false,
        pushNotifications: true,
        soundEnabled: true
      },
      tradingPreferences: customizationData.tradingPreferences || {
        defaultWallet: "default",
        riskLevel: "moderate",
        autoExecute: false,
        stopLossDefault: 5,
        takeProfitDefault: 10,
        maxPositionSize: 1000
      },
      audioSettings: customizationData.audioSettings || {
        musicEnabled: true,
        radioEnabled: false,
        volume: 50,
        preferredGenres: [],
        rapperAgentMusic: false,
        undergroundContent: false
      },
      createdAt: new Date()
    };

    this.customizations.set(customizationId, customization);

    storage.createActivity({
      agentId: "mobile-app-system",
      type: "customization_created",
      description: `Mobile app customization created for user ${userId}`,
      projectId: "mobile-platform",
      metadata: { 
        customizationId, 
        userId, 
        theme: customization.theme,
        widgets: customization.widgets.length
      }
    });

    return customizationId;
  }

  async updateApp(appId: string, updateData: Partial<MobileApp>): Promise<boolean> {
    const app = this.apps.get(appId);
    if (!app) {
      return false;
    }

    const updatedApp = {
      ...app,
      ...updateData,
      lastUpdate: new Date()
    };

    this.apps.set(appId, updatedApp);

    storage.createActivity({
      agentId: "mobile-app-system",
      type: "app_updated",
      description: `Mobile app ${app.name} updated to version ${updatedApp.version}`,
      projectId: "mobile-platform",
      metadata: { 
        appId, 
        platform: app.platform,
        oldVersion: app.version,
        newVersion: updatedApp.version
      }
    });

    return true;
  }

  getAllApps(): MobileApp[] {
    return Array.from(this.apps.values());
  }

  getAppByPlatform(platform: string): MobileApp | undefined {
    return Array.from(this.apps.values()).find(app => app.platform === platform);
  }

  getUserCustomizations(userId: string): AppCustomization[] {
    return Array.from(this.customizations.values()).filter(c => c.userId === userId);
  }

  getDownloadStats(): DownloadStats {
    return this.downloadStats;
  }

  async installApp(userId: string, platform: string): Promise<{ success: boolean; downloadUrl?: string }> {
    try {
      const downloadUrl = await this.generateDownloadLink(platform as any, userId);
      
      // Simulate installation tracking
      setTimeout(() => {
        storage.createActivity({
          agentId: "mobile-app-system",
          type: "app_installed",
          description: `User ${userId} installed app on ${platform}`,
          projectId: "mobile-platform",
          metadata: { userId, platform }
        });
      }, 5000);

      return { success: true, downloadUrl };
    } catch (error) {
      return { success: false };
    }
  }

  getSystemStats() {
    return {
      totalApps: this.apps.size,
      totalCustomizations: this.customizations.size,
      downloadStats: this.downloadStats,
      platforms: ["ios", "android", "web"],
      themes: ["dark", "light", "neon", "panther", "mafia"],
      features: [
        "Real-time trading",
        "Multi-wallet management", 
        "AI agent plugins",
        "Rapper agent music",
        "Live radio streaming",
        "Custom dashboards",
        "Push notifications",
        "Biometric security",
        "Offline mode",
        "Underground content"
      ]
    };
  }
}

export const mobileAppSystem = new MobileAppSystem();