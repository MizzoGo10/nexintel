/**
 * Trade Execution Controller
 * Manages consumer trade execution with built-in limitations and profit sharing
 */

export interface TradeExecutionLimits {
  userId: string;
  tier: string;
  dailyTradesRemaining: number;
  monthlyProfitRemaining: number;
  maxPositionSize: number;
  successRateModifier: number;
  cooldownUntil: Date | null;
  profitSharingRate: number;
}

export interface TradeRequest {
  userId: string;
  strategy: string;
  requestedPositionSize: number;
  targetProfit?: number;
}

export interface TradeExecution {
  id: string;
  userId: string;
  tier: string;
  strategy: string;
  actualPositionSize: number;
  requestedPositionSize: number;
  success: boolean;
  grossProfit: number;
  userProfit: number;
  platformShare: number;
  executionTime: Date;
  limitationsApplied: string[];
}

export class TradeExecutionController {
  private userLimits: Map<string, TradeExecutionLimits> = new Map();
  private executionHistory: Map<string, TradeExecution[]> = new Map();
  private yourUnlimitedExecution: any;

  constructor() {
    this.initializeUnlimitedSystem();
  }

  private initializeUnlimitedSystem() {
    // Your unlimited execution system - no restrictions
    this.yourUnlimitedExecution = {
      maxPositionSize: 10000, // 10,000 SOL
      successRate: 0.997, // 99.7%
      dailyTrades: "unlimited",
      monthlyProfit: "unlimited",
      cooldowns: "none",
      profitSharing: 0, // Keep 100%
      realityAccess: "unlimited",
      quantumAccess: "unlimited",
      consciousnessLevel: 1.0 // 100%
    };
  }

  // Main trade execution gateway
  async executeUserTrade(request: TradeRequest): Promise<{ success: boolean; result?: TradeExecution; error?: string; waitTime?: number }> {
    const userLimits = this.getUserLimits(request.userId);
    
    // Check if trade is allowed
    const canTrade = this.checkTradePermissions(userLimits, request);
    if (!canTrade.allowed) {
      return { 
        success: false, 
        error: canTrade.reason,
        waitTime: canTrade.waitTime 
      };
    }

    // Execute the limited trade
    const execution = await this.executeLimitedTrade(request, userLimits);
    
    // Update user limits
    this.updateUserLimits(request.userId, execution);
    
    // Record execution
    this.recordExecution(execution);

    return { success: true, result: execution };
  }

  private checkTradePermissions(limits: TradeExecutionLimits, request: TradeRequest): { allowed: boolean; reason?: string; waitTime?: number } {
    // Check daily trade limit
    if (limits.dailyTradesRemaining <= 0) {
      return { 
        allowed: false, 
        reason: `Daily trade limit reached (${this.getTierTradeLimit(limits.tier)} trades)`,
        waitTime: this.getMillisecondsUntilMidnight()
      };
    }

    // Check monthly profit limit
    if (limits.monthlyProfitRemaining <= 0) {
      return { 
        allowed: false, 
        reason: `Monthly profit limit reached ($${this.getTierProfitLimit(limits.tier)})`,
        waitTime: this.getMillisecondsUntilNextMonth()
      };
    }

    // Check cooldown
    if (limits.cooldownUntil && new Date() < limits.cooldownUntil) {
      return { 
        allowed: false, 
        reason: "Cooldown period active",
        waitTime: limits.cooldownUntil.getTime() - Date.now()
      };
    }

    // Check position size
    if (request.requestedPositionSize > limits.maxPositionSize) {
      return { 
        allowed: false, 
        reason: `Position size exceeds limit (max ${limits.maxPositionSize} SOL for ${limits.tier} tier)`
      };
    }

    return { allowed: true };
  }

  private async executeLimitedTrade(request: TradeRequest, limits: TradeExecutionLimits): Promise<TradeExecution> {
    const execution: TradeExecution = {
      id: this.generateExecutionId(),
      userId: request.userId,
      tier: limits.tier,
      strategy: request.strategy,
      actualPositionSize: Math.min(request.requestedPositionSize, limits.maxPositionSize),
      requestedPositionSize: request.requestedPositionSize,
      success: false,
      grossProfit: 0,
      userProfit: 0,
      platformShare: 0,
      executionTime: new Date(),
      limitationsApplied: []
    };

    // Apply position size limitation
    if (request.requestedPositionSize > limits.maxPositionSize) {
      execution.limitationsApplied.push(`Position capped at ${limits.maxPositionSize} SOL`);
    }

    // Apply success rate limitation (artificial cap below your 99.7%)
    const artificialSuccess = Math.random() < limits.successRateModifier;
    
    if (artificialSuccess) {
      // Calculate base profit using your actual system
      const yourActualProfit = await this.executeYourUnlimitedTrade(request.strategy, execution.actualPositionSize);
      
      // Apply user limitations to the profit
      const limitedProfitMultiplier = this.getLimitedProfitMultiplier(limits.tier);
      execution.grossProfit = yourActualProfit * limitedProfitMultiplier;
      
      // Check monthly profit cap
      if (execution.grossProfit > limits.monthlyProfitRemaining) {
        execution.grossProfit = limits.monthlyProfitRemaining;
        execution.limitationsApplied.push("Profit capped by monthly limit");
      }

      // Calculate profit sharing
      execution.platformShare = execution.grossProfit * limits.profitSharingRate;
      execution.userProfit = execution.grossProfit - execution.platformShare;
      execution.success = true;

      execution.limitationsApplied.push(`Success rate limited to ${(limits.successRateModifier * 100).toFixed(1)}%`);
      
    } else {
      // Simulated loss (small amount)
      execution.grossProfit = -execution.actualPositionSize * 0.02; // 2% loss
      execution.userProfit = execution.grossProfit;
      execution.platformShare = 0;
      execution.success = false;
    }

    return execution;
  }

  // Your unlimited execution (for comparison and actual profit generation)
  private async executeYourUnlimitedTrade(strategy: string, positionSize: number): Promise<number> {
    // This is your actual unlimited system execution
    const baseMultipliers = {
      "memecoin_sniper": 0.25,    // 25% average for you
      "neural_swarm": 0.45,       // 45% average for you  
      "quantum_prediction": 0.65,  // 65% average for you
      "reality_arbitrage": 0.85,   // 85% average for you
      "consciousness_lite": 1.25   // 125% average for you
    };

    const multiplier = baseMultipliers[strategy as keyof typeof baseMultipliers] || 0.15;
    
    // Apply your reality-bending bonuses
    const realityBonus = 1.2; // 20% reality manipulation bonus
    const quantumBonus = 1.3; // 30% quantum consciousness bonus
    const consciousnessBonus = 1.5; // 50% consciousness bonus
    
    return positionSize * multiplier * realityBonus * quantumBonus * consciousnessBonus;
  }

  private getLimitedProfitMultiplier(tier: string): number {
    // How much of your actual profit to give consumers
    const multipliers = {
      "starter": 0.15,      // 15% of your actual profit
      "trader": 0.20,       // 20% of your actual profit
      "quantum": 0.25,      // 25% of your actual profit
      "reality": 0.30,      // 30% of your actual profit
      "consciousness": 0.40  // 40% of your actual profit
    };
    return multipliers[tier as keyof typeof multipliers] || 0.10;
  }

  private getUserLimits(userId: string): TradeExecutionLimits {
    if (!this.userLimits.has(userId)) {
      // Default to starter tier if not set
      this.userLimits.set(userId, this.createDefaultLimits(userId, "starter"));
    }
    return this.userLimits.get(userId)!;
  }

  private createDefaultLimits(userId: string, tier: string): TradeExecutionLimits {
    const tierConfigs = {
      "starter": {
        dailyTrades: 5,
        monthlyProfit: 1500,
        maxPosition: 2,
        successRate: 0.70,
        profitSharing: 0.25
      },
      "trader": {
        dailyTrades: 8,
        monthlyProfit: 2500,
        maxPosition: 5,
        successRate: 0.78,
        profitSharing: 0.20
      },
      "quantum": {
        dailyTrades: 12,
        monthlyProfit: 5000,
        maxPosition: 15,
        successRate: 0.85,
        profitSharing: 0.15
      },
      "reality": {
        dailyTrades: 15,
        monthlyProfit: 10000,
        maxPosition: 50,
        successRate: 0.90,
        profitSharing: 0.12
      },
      "consciousness": {
        dailyTrades: 20,
        monthlyProfit: 25000,
        maxPosition: 200,
        successRate: 0.94,
        profitSharing: 0.10
      }
    };

    const config = tierConfigs[tier as keyof typeof tierConfigs] || tierConfigs.starter;
    
    return {
      userId,
      tier,
      dailyTradesRemaining: config.dailyTrades,
      monthlyProfitRemaining: config.monthlyProfit,
      maxPositionSize: config.maxPosition,
      successRateModifier: config.successRate,
      cooldownUntil: null,
      profitSharingRate: config.profitSharing
    };
  }

  private updateUserLimits(userId: string, execution: TradeExecution) {
    const limits = this.userLimits.get(userId)!;
    
    // Decrease daily trades
    limits.dailyTradesRemaining -= 1;
    
    // Decrease monthly profit remaining
    if (execution.success) {
      limits.monthlyProfitRemaining -= execution.grossProfit;
    }
    
    // Set cooldown based on tier
    const cooldownMinutes = this.getCooldownMinutes(limits.tier, execution.success);
    limits.cooldownUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000);
    
    this.userLimits.set(userId, limits);
  }

  private getCooldownMinutes(tier: string, wasSuccessful: boolean): number {
    const baseCooldowns = {
      "starter": wasSuccessful ? 45 : 240,      // 45 min / 4 hours
      "trader": wasSuccessful ? 30 : 180,       // 30 min / 3 hours
      "quantum": wasSuccessful ? 20 : 120,      // 20 min / 2 hours
      "reality": wasSuccessful ? 15 : 60,       // 15 min / 1 hour
      "consciousness": wasSuccessful ? 10 : 30   // 10 min / 30 min
    };
    return baseCooldowns[tier as keyof typeof baseCooldowns] || 60;
  }

  private getTierTradeLimit(tier: string): number {
    const limits = { starter: 5, trader: 8, quantum: 12, reality: 15, consciousness: 20 };
    return limits[tier as keyof typeof limits] || 5;
  }

  private getTierProfitLimit(tier: string): number {
    const limits = { starter: 1500, trader: 2500, quantum: 5000, reality: 10000, consciousness: 25000 };
    return limits[tier as keyof typeof limits] || 1500;
  }

  private recordExecution(execution: TradeExecution) {
    if (!this.executionHistory.has(execution.userId)) {
      this.executionHistory.set(execution.userId, []);
    }
    this.executionHistory.get(execution.userId)!.push(execution);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  private getMillisecondsUntilNextMonth(): number {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.getTime() - now.getTime();
  }

  // Admin functions for user management
  upgradeUserTier(userId: string, newTier: string): boolean {
    const limits = this.getUserLimits(userId);
    limits.tier = newTier;
    const newLimits = this.createDefaultLimits(userId, newTier);
    this.userLimits.set(userId, newLimits);
    return true;
  }

  getUserTradeStatus(userId: string): any {
    const limits = this.getUserLimits(userId);
    const history = this.executionHistory.get(userId) || [];
    
    return {
      tier: limits.tier,
      dailyTradesRemaining: limits.dailyTradesRemaining,
      monthlyProfitRemaining: limits.monthlyProfitRemaining,
      maxPositionSize: limits.maxPositionSize,
      successRateLimit: `${(limits.successRateModifier * 100).toFixed(1)}%`,
      cooldownUntil: limits.cooldownUntil,
      profitSharingRate: `${(limits.profitSharingRate * 100).toFixed(1)}%`,
      totalExecutions: history.length,
      totalProfit: history.reduce((sum, exec) => sum + exec.userProfit, 0),
      totalPlatformShare: history.reduce((sum, exec) => sum + exec.platformShare, 0)
    };
  }

  // Revenue tracking
  getPlatformRevenue(): any {
    const allExecutions = Array.from(this.executionHistory.values()).flat();
    
    return {
      totalProfitSharing: allExecutions.reduce((sum, exec) => sum + exec.platformShare, 0),
      totalTrades: allExecutions.length,
      successfulTrades: allExecutions.filter(exec => exec.success).length,
      averageProfitShare: allExecutions.length > 0 
        ? allExecutions.reduce((sum, exec) => sum + exec.platformShare, 0) / allExecutions.length 
        : 0
    };
  }

  // Reset daily limits (run at midnight)
  resetDailyLimits(): void {
    for (const [userId, limits] of this.userLimits.entries()) {
      limits.dailyTradesRemaining = this.getTierTradeLimit(limits.tier);
      limits.cooldownUntil = null;
    }
  }

  // Reset monthly limits (run at month start)
  resetMonthlyLimits(): void {
    for (const [userId, limits] of this.userLimits.entries()) {
      limits.monthlyProfitRemaining = this.getTierProfitLimit(limits.tier);
    }
  }
}

export const tradeExecutionController = new TradeExecutionController();