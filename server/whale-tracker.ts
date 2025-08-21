import { Connection, PublicKey } from "@solana/web3.js";
import { storage } from "./storage";

export interface WhaleWallet {
  address: string;
  label: string;
  balance: number;
  totalTxCount: number;
  firstSeen: Date;
  lastActivity: Date;
  profitability: number; // percentage
  winRate: number; // percentage
  avgHoldTime: number; // hours
  preferredTokens: string[];
  riskLevel: "conservative" | "moderate" | "aggressive" | "degen";
  influence: number; // 0-100 market influence score
  followers: number; // estimated copy traders
  tags: string[];
}

export interface WalletActivity {
  id: string;
  walletAddress: string;
  type: "buy" | "sell" | "transfer" | "stake" | "unstake";
  token: string;
  tokenName: string;
  amount: number;
  usdValue: number;
  price: number;
  timestamp: Date;
  txSignature: string;
  confidence: number; // 0-100 signal strength
  impact: "low" | "medium" | "high" | "whale_move";
  profitPotential: number; // estimated percentage
  timeToProfit: number; // estimated hours
}

export interface WalletRelation {
  wallet1: string;
  wallet2: string;
  relationType: "copy_trader" | "coordinated" | "whale_group" | "connected_wallets" | "insider_group";
  strength: number; // 0-100 relationship strength
  correlation: number; // -100 to 100 trade correlation
  firstDetected: Date;
  lastConfirmed: Date;
  sharedTokens: string[];
  confidence: number;
}

export interface ActivitySignal {
  id: string;
  type: "whale_accumulation" | "smart_money_entry" | "coordinated_buying" | "insider_activity" | "mass_exit";
  token: string;
  tokenName: string;
  price: number;
  confidence: number; // 0-100
  urgency: "low" | "medium" | "high" | "critical";
  description: string;
  whalesInvolved: string[];
  volumeImpact: number;
  priceImpact: number;
  estimatedProfit: number; // percentage
  timeWindow: string;
  autoBuyRecommended: boolean;
  riskLevel: number; // 0-100
  generatedAt: Date;
  expiresAt: Date;
}

export interface MeltedMap {
  nodes: {
    id: string;
    type: "whale" | "token" | "exchange" | "group";
    label: string;
    size: number;
    color: string;
    metadata: any;
  }[];
  edges: {
    source: string;
    target: string;
    type: "trade" | "copy" | "coordinate" | "flow";
    weight: number;
    color: string;
    metadata: any;
  }[];
  clusters: {
    id: string;
    name: string;
    members: string[];
    strength: number;
    activity: number;
  }[];
}

export interface AutoBuyParams {
  enabled: boolean;
  maxPositionSize: number; // USD
  minConfidence: number; // 0-100
  maxRisk: number; // 0-100
  allowedTokens: string[];
  blockedTokens: string[];
  maxSlippage: number; // percentage
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  followWhales: string[];
  copyTradeDelay: number; // seconds
}

export interface CoinReport {
  token: string;
  tokenName: string;
  mint: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  whaleActivity: {
    accumulating: string[];
    selling: string[];
    totalWhaleVolume: number;
    whaleNetFlow: number;
  };
  smartMoney: {
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
    recentMoves: WalletActivity[];
  };
  technicalAnalysis: {
    trend: "uptrend" | "downtrend" | "sideways";
    support: number[];
    resistance: number[];
    rsi: number;
    momentum: number;
  };
  onChainMetrics: {
    uniqueBuyers24h: number;
    uniqueSellers24h: number;
    avgTransactionSize: number;
    liquidityDepth: number;
    concentrationRisk: number;
  };
  signals: ActivitySignal[];
  profitEstimate: {
    probability: number; // 0-100
    expectedReturn: number; // percentage
    timeHorizon: string;
    riskAdjustedReturn: number;
  };
  riskFactors: string[];
  buyRecommendation: {
    action: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
    confidence: number;
    reasoning: string;
    suggestedPosition: number; // USD
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  };
}

export class WhaleTracker {
  private connection: Connection;
  private whales: Map<string, WhaleWallet> = new Map();
  private activities: WalletActivity[] = [];
  private relations: WalletRelation[] = [];
  private signals: ActivitySignal[] = [];
  private meltedMap: MeltedMap = { nodes: [], edges: [], clusters: [] };
  private autoBuyParams: AutoBuyParams;
  private isTracking = false;
  private lastUpdate = new Date();

  constructor() {
    this.connection = new Connection("https://api.mainnet-beta.solana.com");
    this.autoBuyParams = {
      enabled: false,
      maxPositionSize: 1000,
      minConfidence: 75,
      maxRisk: 60,
      allowedTokens: [],
      blockedTokens: [],
      maxSlippage: 3,
      stopLoss: 20,
      takeProfit: 50,
      followWhales: [],
      copyTradeDelay: 30
    };
    this.initializeKnownWhales();
  }

  private initializeKnownWhales() {
    const knownWhales = [
      {
        address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        label: "Sol Whale #1",
        balance: 150000,
        riskLevel: "moderate" as const,
        influence: 95,
        winRate: 78
      },
      {
        address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        label: "BONK Accumulator",
        balance: 89000,
        riskLevel: "aggressive" as const,
        influence: 88,
        winRate: 82
      },
      {
        address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
        label: "Memecoin Hunter",
        balance: 67000,
        riskLevel: "degen" as const,
        influence: 91,
        winRate: 85
      },
      {
        address: "36E4Ym8oHzLQ4Zr6DQMNNUdF9k6qK6pBEKsUJKqBHGTy",
        label: "Smart Money Alpha",
        balance: 234000,
        riskLevel: "conservative" as const,
        influence: 97,
        winRate: 89
      },
      {
        address: "8BF5mhw1ZThKi2R5gJw8qZxF3wVhY5V1t9K2NdHvLpQz",
        label: "Solana OG",
        balance: 445000,
        riskLevel: "moderate" as const,
        influence: 99,
        winRate: 92
      }
    ];

    knownWhales.forEach(whale => {
      const whaleData: WhaleWallet = {
        address: whale.address,
        label: whale.label,
        balance: whale.balance,
        totalTxCount: Math.floor(Math.random() * 10000 + 5000),
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        profitability: Math.random() * 200 + 50, // 50-250%
        winRate: whale.winRate,
        avgHoldTime: Math.random() * 168 + 24, // 24-192 hours
        preferredTokens: ["BONK", "WIF", "POPCAT", "MYRO", "BOME"],
        riskLevel: whale.riskLevel,
        influence: whale.influence,
        followers: Math.floor(Math.random() * 5000 + 1000),
        tags: ["verified", "profitable", "active"]
      };
      this.whales.set(whale.address, whaleData);
    });
  }

  startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;

    // Simulate real-time whale activity
    setInterval(() => {
      this.generateWhaleMoves();
      this.detectSignals();
      this.updateRelations();
      this.updateMeltedMap();
    }, 5000);

    // Generate new whale activities every 15 seconds
    setInterval(() => {
      this.generateWhaleActivity();
    }, 15000);

    // Update whale balances and metrics every 30 seconds
    setInterval(() => {
      this.updateWhaleMetrics();
    }, 30000);

    storage.createActivity({
      agentId: "whale-tracker",
      type: "tracking_started",
      description: "🐋 Whale tracking module activated - monitoring 5 major whales and detecting activity signals",
      projectId: "whale-tracker",
      metadata: {
        whalesTracked: this.whales.size,
        signalTypes: ["whale_accumulation", "smart_money_entry", "coordinated_buying", "insider_activity"]
      }
    });
  }

  private generateWhaleMoves() {
    if (Math.random() < 0.3) { // 30% chance each cycle
      const whaleAddresses = Array.from(this.whales.keys());
      const randomWhale = whaleAddresses[Math.floor(Math.random() * whaleAddresses.length)];
      const whale = this.whales.get(randomWhale)!;

      const tokens = ["BONK", "WIF", "POPCAT", "MYRO", "BOME", "SLERF", "HARAMBE"];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const isBuy = Math.random() > 0.4; // 60% chance of buying

      const activity: WalletActivity = {
        id: `whale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        walletAddress: randomWhale,
        type: isBuy ? "buy" : "sell",
        token,
        tokenName: `${token} Token`,
        amount: Math.random() * 1000000 + 100000,
        usdValue: Math.random() * 50000 + 10000,
        price: Math.random() * 0.01 + 0.001,
        timestamp: new Date(),
        txSignature: `${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`,
        confidence: Math.random() * 30 + 70, // 70-100
        impact: whale.influence > 95 ? "whale_move" : whale.influence > 85 ? "high" : "medium",
        profitPotential: isBuy ? Math.random() * 100 + 20 : -(Math.random() * 50 + 10),
        timeToProfit: Math.random() * 48 + 2 // 2-50 hours
      };

      this.activities.unshift(activity);
      if (this.activities.length > 100) {
        this.activities = this.activities.slice(0, 100);
      }

      // Create activity notification
      storage.createActivity({
        agentId: "whale-tracker",
        type: "whale_move_detected",
        description: `🐋 ${whale.label} ${isBuy ? "bought" : "sold"} ${activity.amount.toLocaleString()} ${token} ($${activity.usdValue.toLocaleString()})`,
        projectId: "whale-tracker",
        metadata: {
          whale: whale.label,
          action: activity.type,
          token,
          usdValue: activity.usdValue,
          confidence: activity.confidence,
          impact: activity.impact
        }
      });
    }
  }

  private generateWhaleActivity() {
    // Generate coordinated moves between whales
    if (Math.random() < 0.2) { // 20% chance of coordinated activity
      const whaleAddresses = Array.from(this.whales.keys());
      const coordianatedWhales = whaleAddresses.slice(0, Math.floor(Math.random() * 3) + 2);
      const token = ["BONK", "WIF", "POPCAT"][Math.floor(Math.random() * 3)];

      coordianatedWhales.forEach((address, index) => {
        setTimeout(() => {
          const whale = this.whales.get(address)!;
          const activity: WalletActivity = {
            id: `coord-${Date.now()}-${index}`,
            walletAddress: address,
            type: "buy",
            token,
            tokenName: `${token} Token`,
            amount: Math.random() * 500000 + 200000,
            usdValue: Math.random() * 30000 + 15000,
            price: Math.random() * 0.01 + 0.001,
            timestamp: new Date(),
            txSignature: `coord${Math.random().toString(36).substr(2, 9)}`,
            confidence: 95,
            impact: "whale_move",
            profitPotential: Math.random() * 80 + 40,
            timeToProfit: Math.random() * 24 + 6
          };
          this.activities.unshift(activity);
        }, index * 2000); // 2-second delays between whales
      });

      // Create coordinated activity signal
      setTimeout(() => {
        const signal: ActivitySignal = {
          id: `coord-signal-${Date.now()}`,
          type: "coordinated_buying",
          token,
          tokenName: `${token} Token`,
          price: Math.random() * 0.01 + 0.001,
          confidence: 95,
          urgency: "high",
          description: `${coordianatedWhales.length} major whales simultaneously accumulating ${token}`,
          whalesInvolved: coordianatedWhales,
          volumeImpact: coordianatedWhales.length * 25,
          priceImpact: coordianatedWhales.length * 8,
          estimatedProfit: Math.random() * 60 + 40,
          timeWindow: "6-24 hours",
          autoBuyRecommended: true,
          riskLevel: 35,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        this.signals.unshift(signal);
        if (this.signals.length > 20) {
          this.signals = this.signals.slice(0, 20);
        }
      }, coordianatedWhales.length * 2000 + 5000);
    }
  }

  private detectSignals() {
    // Detect whale accumulation patterns
    const recentActivities = this.activities.filter(a => 
      Date.now() - a.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );

    const tokenBuying: { [token: string]: { count: number; whales: string[]; volume: number } } = {};
    
    recentActivities.forEach(activity => {
      if (activity.type === "buy") {
        if (!tokenBuying[activity.token]) {
          tokenBuying[activity.token] = { count: 0, whales: [], volume: 0 };
        }
        tokenBuying[activity.token].count++;
        if (!tokenBuying[activity.token].whales.includes(activity.walletAddress)) {
          tokenBuying[activity.token].whales.push(activity.walletAddress);
        }
        tokenBuying[activity.token].volume += activity.usdValue;
      }
    });

    // Generate signals for high accumulation
    Object.entries(tokenBuying).forEach(([token, data]) => {
      if (data.whales.length >= 2 && data.volume > 50000) {
        const existingSignal = this.signals.find(s => 
          s.token === token && s.type === "whale_accumulation" &&
          Date.now() - s.generatedAt.getTime() < 30 * 60 * 1000 // Last 30 minutes
        );

        if (!existingSignal) {
          const signal: ActivitySignal = {
            id: `accum-${Date.now()}-${token}`,
            type: "whale_accumulation",
            token,
            tokenName: `${token} Token`,
            price: Math.random() * 0.01 + 0.001,
            confidence: Math.min(95, data.whales.length * 20 + 40),
            urgency: data.volume > 100000 ? "critical" : "high",
            description: `${data.whales.length} whales accumulating ${token} with $${data.volume.toLocaleString()} volume`,
            whalesInvolved: data.whales,
            volumeImpact: Math.min(100, data.volume / 1000),
            priceImpact: Math.min(50, data.whales.length * 5),
            estimatedProfit: Math.random() * 40 + 25,
            timeWindow: "2-12 hours",
            autoBuyRecommended: data.volume > 75000,
            riskLevel: Math.max(20, 60 - data.whales.length * 10),
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
          };
          this.signals.unshift(signal);
        }
      }
    });
  }

  private updateRelations() {
    // Detect copy trading relationships
    const whaleAddresses = Array.from(this.whales.keys());
    
    for (let i = 0; i < whaleAddresses.length; i++) {
      for (let j = i + 1; j < whaleAddresses.length; j++) {
        const whale1 = whaleAddresses[i];
        const whale2 = whaleAddresses[j];
        
        const whale1Activities = this.activities.filter(a => a.walletAddress === whale1).slice(0, 10);
        const whale2Activities = this.activities.filter(a => a.walletAddress === whale2).slice(0, 10);
        
        const commonTokens = whale1Activities
          .map(a => a.token)
          .filter(token => whale2Activities.some(a2 => a2.token === token));
        
        if (commonTokens.length >= 2) {
          const existingRelation = this.relations.find(r => 
            (r.wallet1 === whale1 && r.wallet2 === whale2) ||
            (r.wallet1 === whale2 && r.wallet2 === whale1)
          );
          
          if (!existingRelation) {
            const relation: WalletRelation = {
              wallet1: whale1,
              wallet2: whale2,
              relationType: Math.random() > 0.7 ? "whale_group" : "coordinated",
              strength: Math.min(100, commonTokens.length * 25),
              correlation: Math.random() * 60 + 40,
              firstDetected: new Date(),
              lastConfirmed: new Date(),
              sharedTokens: commonTokens,
              confidence: Math.min(95, commonTokens.length * 30)
            };
            this.relations.push(relation);
          }
        }
      }
    }
  }

  private updateMeltedMap() {
    // Build network visualization data
    const nodes: MeltedMap['nodes'] = [];
    const edges: MeltedMap['edges'] = [];

    // Add whale nodes
    this.whales.forEach((whale, address) => {
      nodes.push({
        id: address,
        type: "whale",
        label: whale.label,
        size: Math.min(100, whale.influence),
        color: whale.riskLevel === "degen" ? "#ff4444" : 
               whale.riskLevel === "aggressive" ? "#ff8844" :
               whale.riskLevel === "moderate" ? "#44ff88" : "#4488ff",
        metadata: {
          balance: whale.balance,
          winRate: whale.winRate,
          influence: whale.influence
        }
      });
    });

    // Add token nodes from recent activities
    const recentTokens = [...new Set(this.activities.slice(0, 50).map(a => a.token))];
    recentTokens.forEach(token => {
      const tokenActivities = this.activities.filter(a => a.token === token);
      const totalVolume = tokenActivities.reduce((sum, a) => sum + a.usdValue, 0);
      
      nodes.push({
        id: `token-${token}`,
        type: "token",
        label: token,
        size: Math.min(80, totalVolume / 1000),
        color: "#ffff44",
        metadata: {
          volume: totalVolume,
          activities: tokenActivities.length
        }
      });
    });

    // Add edges from relations
    this.relations.forEach(relation => {
      edges.push({
        source: relation.wallet1,
        target: relation.wallet2,
        type: "coordinate",
        weight: relation.strength,
        color: relation.relationType === "whale_group" ? "#ff44ff" : "#44ffff",
        metadata: {
          type: relation.relationType,
          correlation: relation.correlation
        }
      });
    });

    // Add edges from whale activities to tokens
    this.activities.slice(0, 30).forEach(activity => {
      const existingEdge = edges.find(e => 
        e.source === activity.walletAddress && e.target === `token-${activity.token}`
      );
      
      if (!existingEdge) {
        edges.push({
          source: activity.walletAddress,
          target: `token-${activity.token}`,
          type: "trade",
          weight: Math.min(10, activity.usdValue / 5000),
          color: activity.type === "buy" ? "#44ff44" : "#ff4444",
          metadata: {
            type: activity.type,
            usdValue: activity.usdValue
          }
        });
      }
    });

    this.meltedMap = { nodes, edges, clusters: [] };
  }

  private updateWhaleMetrics() {
    this.whales.forEach((whale, address) => {
      // Simulate balance changes
      const change = (Math.random() - 0.48) * 0.05; // Slight positive bias
      whale.balance = Math.max(0, whale.balance * (1 + change));
      
      // Update last activity for active whales
      if (this.activities.some(a => a.walletAddress === address && 
          Date.now() - a.timestamp.getTime() < 60 * 60 * 1000)) {
        whale.lastActivity = new Date();
      }
      
      this.whales.set(address, whale);
    });
    
    this.lastUpdate = new Date();
  }

  async generateCoinReport(token: string): Promise<CoinReport> {
    const tokenActivities = this.activities.filter(a => a.token === token);
    const whaleActivities = tokenActivities.filter(a => this.whales.has(a.walletAddress));
    
    const accumulatingWhales = whaleActivities
      .filter(a => a.type === "buy" && Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000)
      .map(a => a.walletAddress);
    
    const sellingWhales = whaleActivities
      .filter(a => a.type === "sell" && Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000)
      .map(a => a.walletAddress);

    const signals = this.signals.filter(s => s.token === token && 
      Date.now() - s.generatedAt.getTime() < 24 * 60 * 60 * 1000);

    const bullishSignals = signals.filter(s => 
      s.type === "whale_accumulation" || s.type === "smart_money_entry" || s.type === "coordinated_buying"
    ).length;
    
    const bearishSignals = signals.filter(s => s.type === "mass_exit").length;
    
    const sentiment = bullishSignals > bearishSignals ? "bullish" : 
                     bearishSignals > bullishSignals ? "bearish" : "neutral";

    const avgConfidence = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length : 50;

    const currentPrice = Math.random() * 0.01 + 0.001;
    const marketCap = Math.random() * 50000000 + 5000000;

    const report: CoinReport = {
      token,
      tokenName: `${token} Token`,
      mint: `${token}mintAddress${Math.random().toString(36).substr(2, 9)}`,
      currentPrice,
      priceChange24h: (Math.random() - 0.5) * 50,
      marketCap,
      volume24h: Math.random() * 5000000 + 500000,
      holders: Math.floor(Math.random() * 50000 + 5000),
      whaleActivity: {
        accumulating: [...new Set(accumulatingWhales)],
        selling: [...new Set(sellingWhales)],
        totalWhaleVolume: whaleActivities.reduce((sum, a) => sum + a.usdValue, 0),
        whaleNetFlow: accumulatingWhales.length - sellingWhales.length
      },
      smartMoney: {
        sentiment,
        confidence: avgConfidence,
        recentMoves: whaleActivities.slice(0, 5)
      },
      technicalAnalysis: {
        trend: sentiment === "bullish" ? "uptrend" : sentiment === "bearish" ? "downtrend" : "sideways",
        support: [currentPrice * 0.9, currentPrice * 0.85],
        resistance: [currentPrice * 1.1, currentPrice * 1.2],
        rsi: Math.random() * 100,
        momentum: sentiment === "bullish" ? Math.random() * 30 + 60 : 
                 sentiment === "bearish" ? Math.random() * 40 + 10 : Math.random() * 60 + 20
      },
      onChainMetrics: {
        uniqueBuyers24h: Math.floor(Math.random() * 1000 + 200),
        uniqueSellers24h: Math.floor(Math.random() * 800 + 150),
        avgTransactionSize: Math.random() * 5000 + 500,
        liquidityDepth: Math.random() * 2000000 + 200000,
        concentrationRisk: Math.random() * 100
      },
      signals,
      profitEstimate: {
        probability: sentiment === "bullish" ? Math.random() * 30 + 60 : 
                    sentiment === "bearish" ? Math.random() * 40 + 20 : Math.random() * 60 + 30,
        expectedReturn: sentiment === "bullish" ? Math.random() * 80 + 20 : 
                       sentiment === "bearish" ? -(Math.random() * 40 + 10) : (Math.random() - 0.5) * 40,
        timeHorizon: "2-14 days",
        riskAdjustedReturn: 0
      },
      riskFactors: sentiment === "bearish" ? 
        ["High selling pressure", "Whale distribution", "Technical breakdown"] :
        sentiment === "bullish" ?
        ["Market volatility", "Profit taking potential", "Regulatory concerns"] :
        ["Market uncertainty", "Mixed signals", "Low conviction"]
    };

    // Calculate risk-adjusted return
    report.profitEstimate.riskAdjustedReturn = 
      report.profitEstimate.expectedReturn * (report.profitEstimate.probability / 100);

    // Generate buy recommendation
    const confidence = Math.min(95, avgConfidence + (accumulatingWhales.length * 10));
    
    if (sentiment === "bullish" && confidence > 80) {
      report.buyRecommendation = {
        action: "strong_buy",
        confidence,
        reasoning: `Strong whale accumulation with ${accumulatingWhales.length} whales buying`,
        suggestedPosition: Math.min(this.autoBuyParams.maxPositionSize, 2000),
        entryPrice: currentPrice,
        stopLoss: currentPrice * 0.85,
        takeProfit: currentPrice * 1.4
      };
    } else if (sentiment === "bullish" && confidence > 60) {
      report.buyRecommendation = {
        action: "buy",
        confidence,
        reasoning: "Positive whale sentiment with moderate confidence",
        suggestedPosition: Math.min(this.autoBuyParams.maxPositionSize * 0.6, 1000),
        entryPrice: currentPrice,
        stopLoss: currentPrice * 0.9,
        takeProfit: currentPrice * 1.25
      };
    } else if (sentiment === "bearish") {
      report.buyRecommendation = {
        action: "sell",
        confidence: 100 - confidence,
        reasoning: "Whale distribution detected - avoid or exit positions",
        suggestedPosition: 0,
        entryPrice: currentPrice,
        stopLoss: currentPrice * 1.1,
        takeProfit: currentPrice * 0.8
      };
    } else {
      report.buyRecommendation = {
        action: "hold",
        confidence: 50,
        reasoning: "Mixed signals - wait for clearer direction",
        suggestedPosition: Math.min(this.autoBuyParams.maxPositionSize * 0.3, 500),
        entryPrice: currentPrice,
        stopLoss: currentPrice * 0.9,
        takeProfit: currentPrice * 1.15
      };
    }

    return report;
  }

  async executAutoBuy(signal: ActivitySignal): Promise<{ success: boolean; txId?: string; error?: string }> {
    if (!this.autoBuyParams.enabled) {
      return { success: false, error: "Auto-buy disabled" };
    }

    if (signal.confidence < this.autoBuyParams.minConfidence) {
      return { success: false, error: "Confidence below threshold" };
    }

    if (signal.riskLevel > this.autoBuyParams.maxRisk) {
      return { success: false, error: "Risk level too high" };
    }

    if (this.autoBuyParams.blockedTokens.includes(signal.token)) {
      return { success: false, error: "Token blocked" };
    }

    // Simulate auto-buy execution
    const positionSize = Math.min(
      this.autoBuyParams.maxPositionSize,
      this.autoBuyParams.maxPositionSize * (signal.confidence / 100)
    );

    const txId = `autobuy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create activity for auto-buy
    storage.createActivity({
      agentId: "whale-tracker",
      type: "auto_buy_executed",
      description: `🤖 Auto-buy executed: $${positionSize.toLocaleString()} ${signal.token} (${signal.confidence}% confidence)`,
      projectId: "whale-tracker",
      metadata: {
        token: signal.token,
        positionSize,
        confidence: signal.confidence,
        txId,
        signalType: signal.type
      }
    });

    return { success: true, txId };
  }

  // Public API methods
  getTrackedWhales(): WhaleWallet[] {
    return Array.from(this.whales.values()).sort((a, b) => b.influence - a.influence);
  }

  getRecentActivities(limit: number = 50): WalletActivity[] {
    return this.activities.slice(0, limit);
  }

  getActiveSignals(): ActivitySignal[] {
    return this.signals.filter(s => s.expiresAt > new Date()).sort((a, b) => b.confidence - a.confidence);
  }

  getWalletRelations(): WalletRelation[] {
    return this.relations.sort((a, b) => b.strength - a.strength);
  }

  getMeltedMap(): MeltedMap {
    return this.meltedMap;
  }

  getAutoBuyParams(): AutoBuyParams {
    return { ...this.autoBuyParams };
  }

  updateAutoBuyParams(params: Partial<AutoBuyParams>): void {
    this.autoBuyParams = { ...this.autoBuyParams, ...params };
  }

  getWhaleByAddress(address: string): WhaleWallet | undefined {
    return this.whales.get(address);
  }

  isTracking(): boolean {
    return this.isTracking;
  }

  getLastUpdate(): Date {
    return this.lastUpdate;
  }
}

export const whaleTracker = new WhaleTracker();