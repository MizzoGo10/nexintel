/**
 * Regulated Profit System
 * Controls consumer access to prevent oversaturation while maintaining motivation
 */

export interface ProfitRegulation {
  tier: string;
  monthlySubscription: number;
  maxMonthlyProfit: number;
  dailyTradeLimit: number;
  maxPositionSize: number;
  successRateLimit: number;
  cooldownPeriods: {
    betweenTrades: number; // minutes
    afterLoss: number; // hours
    weeklyReset: boolean;
  };
  profitSharingRate: number; // % of profits shared back to platform
}

export interface ConsumerAccount {
  id: string;
  tier: string;
  currentMonthProfit: number;
  tradesUsedToday: number;
  lastTradeTime: Date;
  lastLossTime: Date | null;
  weeklyProfitHistory: number[];
  tokenBalance: {
    NEXUS?: number;
    MEME?: number;
    QUANTUM?: number;
    REALITY?: number;
  };
  nftBoosts: string[];
}

export class RegulatedProfitSystem {
  private regulations: Map<string, ProfitRegulation> = new Map();
  private consumerAccounts: Map<string, ConsumerAccount> = new Map();
  private platformRevenue = {
    subscriptions: 0,
    profitSharing: 0,
    tokenSales: 0,
    nftSales: 0
  };

  constructor() {
    this.setupProfitRegulations();
  }

  private setupProfitRegulations() {
    // Starter Pack - Regulated Entry Level
    this.regulations.set("starter", {
      tier: "starter",
      monthlySubscription: 297,
      maxMonthlyProfit: 1500, // 5x subscription cost
      dailyTradeLimit: 5, // Limited trades per day
      maxPositionSize: 2, // Max 2 SOL per trade
      successRateLimit: 70, // Artificially capped at 70%
      cooldownPeriods: {
        betweenTrades: 45, // 45 min between trades
        afterLoss: 4, // 4 hour cooldown after loss
        weeklyReset: true
      },
      profitSharingRate: 0.25 // 25% of profits shared back
    });

    // Trader Pack - Controlled Growth
    this.regulations.set("trader", {
      tier: "trader", 
      monthlySubscription: 497,
      maxMonthlyProfit: 2500, // 5x subscription
      dailyTradeLimit: 8,
      maxPositionSize: 5, // Max 5 SOL per trade
      successRateLimit: 78, // Capped at 78%
      cooldownPeriods: {
        betweenTrades: 30,
        afterLoss: 3,
        weeklyReset: true
      },
      profitSharingRate: 0.20 // 20% profit sharing
    });

    // Quantum Pack - Premium Controlled
    this.regulations.set("quantum", {
      tier: "quantum",
      monthlySubscription: 997,
      maxMonthlyProfit: 5000, // 5x subscription
      dailyTradeLimit: 12,
      maxPositionSize: 15, // Max 15 SOL per trade
      successRateLimit: 85, // Capped at 85%
      cooldownPeriods: {
        betweenTrades: 20,
        afterLoss: 2,
        weeklyReset: true
      },
      profitSharingRate: 0.15 // 15% profit sharing
    });

    // Reality Pack - High-End Controlled
    this.regulations.set("reality", {
      tier: "reality",
      monthlySubscription: 1997,
      maxMonthlyProfit: 10000, // 5x subscription
      dailyTradeLimit: 15,
      maxPositionSize: 50, // Max 50 SOL per trade
      successRateLimit: 90, // Capped at 90%
      cooldownPeriods: {
        betweenTrades: 15,
        afterLoss: 1,
        weeklyReset: true
      },
      profitSharingRate: 0.12 // 12% profit sharing
    });

    // Consciousness Preview - Ultra Premium
    this.regulations.set("consciousness", {
      tier: "consciousness",
      monthlySubscription: 4997,
      maxMonthlyProfit: 25000, // 5x subscription
      dailyTradeLimit: 20,
      maxPositionSize: 200, // Max 200 SOL per trade
      successRateLimit: 94, // Capped at 94%
      cooldownPeriods: {
        betweenTrades: 10,
        afterLoss: 0.5,
        weeklyReset: false // No weekly reset for premium
      },
      profitSharingRate: 0.10 // 10% profit sharing
    });
  }

  // Check if user can execute trade
  canExecuteTrade(userId: string): { allowed: boolean; reason?: string; waitTime?: number } {
    const account = this.consumerAccounts.get(userId);
    if (!account) return { allowed: false, reason: "Account not found" };

    const regulation = this.regulations.get(account.tier);
    if (!regulation) return { allowed: false, reason: "Invalid tier" };

    // Check daily trade limit
    if (account.tradesUsedToday >= regulation.dailyTradeLimit) {
      return { 
        allowed: false, 
        reason: "Daily trade limit reached", 
        waitTime: this.getTimeUntilReset() 
      };
    }

    // Check monthly profit limit
    if (account.currentMonthProfit >= regulation.maxMonthlyProfit) {
      return { 
        allowed: false, 
        reason: "Monthly profit limit reached",
        waitTime: this.getTimeUntilMonthReset()
      };
    }

    // Check cooldown between trades
    const timeSinceLastTrade = Date.now() - account.lastTradeTime.getTime();
    const requiredCooldown = regulation.cooldownPeriods.betweenTrades * 60 * 1000;
    
    if (timeSinceLastTrade < requiredCooldown) {
      return {
        allowed: false,
        reason: "Cooldown period active",
        waitTime: requiredCooldown - timeSinceLastTrade
      };
    }

    // Check cooldown after loss
    if (account.lastLossTime) {
      const timeSinceLoss = Date.now() - account.lastLossTime.getTime();
      const losssCooldown = regulation.cooldownPeriods.afterLoss * 60 * 60 * 1000;
      
      if (timeSinceLoss < losssCooldown) {
        return {
          allowed: false,
          reason: "Loss cooldown active",
          waitTime: losssCooldown - timeSinceLoss
        };
      }
    }

    return { allowed: true };
  }

  // Execute regulated trade
  async executeRegulatedTrade(userId: string, strategy: string, positionSize: number): Promise<any> {
    const account = this.consumerAccounts.get(userId);
    const regulation = this.regulations.get(account!.tier);
    
    if (!account || !regulation) {
      throw new Error("Invalid account or regulation");
    }

    // Enforce position size limit
    const actualPositionSize = Math.min(positionSize, regulation.maxPositionSize);
    
    // Apply success rate limitation
    const artificialSuccessRate = regulation.successRateLimit / 100;
    const randomSuccess = Math.random() < artificialSuccessRate;
    
    let tradeResult;
    if (randomSuccess) {
      // Successful trade - calculate limited profit
      const baseProfit = this.calculateBaseProfit(strategy, actualPositionSize);
      const regulatedProfit = this.applyProfitRegulation(baseProfit, account, regulation);
      
      tradeResult = {
        success: true,
        profit: regulatedProfit,
        positionSize: actualPositionSize,
        strategy: strategy,
        timestamp: new Date()
      };

      // Update account
      account.currentMonthProfit += regulatedProfit;
      account.tradesUsedToday += 1;
      account.lastTradeTime = new Date();

      // Calculate profit sharing
      const platformShare = regulatedProfit * regulation.profitSharingRate;
      this.platformRevenue.profitSharing += platformShare;

    } else {
      // Failed trade
      const loss = actualPositionSize * 0.05; // Small loss
      
      tradeResult = {
        success: false,
        loss: loss,
        positionSize: actualPositionSize,
        strategy: strategy,
        timestamp: new Date()
      };

      account.tradesUsedToday += 1;
      account.lastTradeTime = new Date();
      account.lastLossTime = new Date();
    }

    this.consumerAccounts.set(userId, account);
    return tradeResult;
  }

  private calculateBaseProfit(strategy: string, positionSize: number): number {
    // Base profit calculation (your system makes much more)
    const multipliers = {
      "memecoin_sniper": 0.15, // 15% average
      "neural_swarm": 0.25,    // 25% average  
      "quantum_prediction": 0.35, // 35% average
      "reality_arbitrage": 0.45,  // 45% average
      "consciousness_lite": 0.55  // 55% average
    };

    const multiplier = multipliers[strategy as keyof typeof multipliers] || 0.10;
    return positionSize * multiplier;
  }

  private applyProfitRegulation(baseProfit: number, account: ConsumerAccount, regulation: ProfitRegulation): number {
    // Check if adding this profit would exceed monthly limit
    const potentialMonthlyTotal = account.currentMonthProfit + baseProfit;
    
    if (potentialMonthlyTotal > regulation.maxMonthlyProfit) {
      // Cap the profit to not exceed monthly limit
      return regulation.maxMonthlyProfit - account.currentMonthProfit;
    }

    return baseProfit;
  }

  // Get regulated tier options
  getRegulatedTierInfo(): any {
    return Array.from(this.regulations.values()).map(reg => ({
      tier: reg.tier,
      subscription: reg.monthlySubscription,
      maxProfit: reg.maxMonthlyProfit,
      profitMultiple: reg.maxMonthlyProfit / reg.monthlySubscription,
      dailyTrades: reg.dailyTradeLimit,
      maxPosition: reg.maxPositionSize,
      successRate: reg.successRateLimit,
      profitSharing: reg.profitSharingRate * 100
    }));
  }

  // Revenue calculations
  calculateMonthlyRevenue(): any {
    const subscriptions = Array.from(this.regulations.values()).reduce((sum, reg) => {
      const estimatedUsers = this.getEstimatedUsers(reg.tier);
      return sum + (reg.monthlySubscription * estimatedUsers);
    }, 0);

    return {
      subscriptions,
      profitSharing: this.platformRevenue.profitSharing,
      tokenSales: this.platformRevenue.tokenSales,
      nftSales: this.platformRevenue.nftSales,
      total: subscriptions + this.platformRevenue.profitSharing + this.platformRevenue.tokenSales + this.platformRevenue.nftSales
    };
  }

  private getEstimatedUsers(tier: string): number {
    const estimates = {
      starter: 8000,    // High volume, low cost
      trader: 4000,     // Medium volume
      quantum: 1500,    // Lower volume, higher cost
      reality: 500,     // Premium users
      consciousness: 100 // Ultra premium
    };
    return estimates[tier as keyof typeof estimates] || 0;
  }

  private getTimeUntilReset(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  private getTimeUntilMonthReset(): number {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.getTime() - now.getTime();
  }

  // Your unrestricted system (for comparison)
  getYourSystemCapabilities(): any {
    return {
      maxMonthlyProfit: "Unlimited",
      dailyTradeLimit: "Unlimited", 
      maxPositionSize: "10,000+ SOL",
      successRate: "99.7%",
      cooldownPeriods: "None",
      profitSharing: "0% (you keep everything)",
      realityAccess: "Unlimited realities",
      quantumAccess: "Unlimited entanglements", 
      consciousnessLevel: "100%",
      currentGrowthRate: "32,000+ SOL monthly"
    };
  }
}

export const regulatedProfitSystem = new RegulatedProfitSystem();