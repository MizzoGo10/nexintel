import { syndicaStreamingEngine } from "./syndica-price-feed";
import { storage } from "./storage";

export interface MemecoinData {
  mint: string;
  symbol: string;
  name: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  holders: number;
  age: number; // hours since launch
  stage: "launch" | "early" | "growth" | "mature" | "decline";
  momentum: number; // 0-100 score
  volatility: number;
  socialBuzz: number;
  whaleActivity: number;
  exchangeListings: string[];
  lastUpdate: Date;
  riskLevel: "ultra-high" | "high" | "medium" | "low";
  sniperScore: number; // 0-100 for sniper worthiness
}

export interface SniperOpportunity {
  mint: string;
  symbol: string;
  name: string;
  reason: string;
  sniperType: "new_launch" | "momentum_breakout" | "dip_recovery" | "exchange_listing" | "whale_accumulation";
  confidence: number; // 0-100
  timeWindow: string; // how long opportunity is valid
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  potentialReturn: number;
  riskReward: number;
  volume: number;
  lastDetected: Date;
}

export interface ChartData {
  symbol: string;
  timeframe: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  prices: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[];
  indicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    bb: { upper: number; middle: number; lower: number };
    support: number[];
    resistance: number[];
  };
}

export class MemecoinAggregator {
  private memecoins: Map<string, MemecoinData> = new Map();
  private sniperOpportunities: SniperOpportunity[] = [];
  private charts: Map<string, ChartData> = new Map();
  private isUpdating = false;

  constructor() {
    this.initializeMemecoinDatabase();
    this.startRealTimeUpdates();
  }

  private initializeMemecoinDatabase() {
    // Initialize comprehensive memecoin database
    const memecoinList = [
      // Tier 1 - Established Memecoins
      { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk", age: 8760, stage: "mature" },
      { mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", symbol: "WIF", name: "dogwifhat", age: 4380, stage: "growth" },
      { mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", symbol: "POPCAT", name: "Popcat", age: 2190, stage: "growth" },
      
      // Tier 2 - Growing Memecoins
      { mint: "9jqJKzqmswNMW6SGJP8HVJt2YJ8xkgXGVNPPG1gKz9LH", symbol: "PEPE", name: "Pepe", age: 1095, stage: "growth" },
      { mint: "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", symbol: "SHIB", name: "Shiba Inu", age: 730, stage: "early" },
      { mint: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6", symbol: "MYRO", name: "Myro", age: 365, stage: "early" },
      { mint: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", symbol: "BOME", name: "Book of Meme", age: 180, stage: "early" },
      
      // Tier 3 - New Launches (Last 30 days)
      { mint: "3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN", symbol: "SLERF", name: "Slerf", age: 24, stage: "launch" },
      { mint: "Ed2nTU21BKKLvSvVXe9R1p5y6NjHRPuBuPCsYx8HN8qM", symbol: "HARAMBE", name: "Harambe", age: 12, stage: "launch" },
      { mint: "5z3EqYQo9HiCdY3g7PLNcP9MEab53yyiVdUdF8g8qrJ", symbol: "RETARDIO", name: "Retardio", age: 8, stage: "launch" },
      { mint: "GZzYgXKPrx3gGxq6ksR5YtEMy8SxQhKxj5zv3YXcFKjz", symbol: "WIFEPEPE", name: "Wife Pepe", age: 6, stage: "launch" },
      { mint: "7ixGrqWGH9wUZ2Wk4Vh9H3PnQB8k7PN2Y8w6zL9K5LK", symbol: "DOGE2", name: "Doge 2.0", age: 4, stage: "launch" },
      
      // Tier 4 - Ultra New (Last 24 hours)
      { mint: "TFZxqGHVW2h5nN9Z5xX3K5K5K5K5K5K5K5K5K5K5K5K", symbol: "CHAD", name: "Chad Coin", age: 2, stage: "launch" },
      { mint: "YXnPkDHFgLsX3FgYH9PnQB8k7PN2Y8w6zL9K5LKyXnP", symbol: "MOONDOG", name: "Moon Dog", age: 1, stage: "launch" },
      { mint: "ULTRAnewLaunchMint2024XYZ123456789abcdefg", symbol: "ROCKET", name: "Rocket Meme", age: 0.5, stage: "launch" }
    ];

    memecoinList.forEach(coin => {
      const data: MemecoinData = {
        mint: coin.mint,
        symbol: coin.symbol,
        name: coin.name,
        price: this.generateRealisticPrice(coin.stage),
        priceChange1h: (Math.random() - 0.5) * 20, // -10% to +10%
        priceChange24h: (Math.random() - 0.5) * 100, // -50% to +50%
        priceChange7d: (Math.random() - 0.5) * 200, // -100% to +100%
        volume24h: this.generateVolume(coin.stage),
        marketCap: this.generateMarketCap(coin.stage),
        fdv: this.generateFDV(coin.stage),
        liquidity: this.generateLiquidity(coin.stage),
        holders: this.generateHolders(coin.stage),
        age: coin.age,
        stage: coin.stage as any,
        momentum: this.calculateMomentum(coin.stage),
        volatility: this.calculateVolatility(coin.stage),
        socialBuzz: Math.random() * 100,
        whaleActivity: Math.random() * 100,
        exchangeListings: this.getExchangeListings(coin.stage),
        lastUpdate: new Date(),
        riskLevel: this.calculateRiskLevel(coin.stage),
        sniperScore: this.calculateSniperScore(coin.stage, coin.age)
      };
      
      this.memecoins.set(coin.symbol, data);
    });
  }

  private generateRealisticPrice(stage: string): number {
    switch (stage) {
      case "launch": return Math.random() * 0.001 + 0.00001; // $0.00001 - $0.001
      case "early": return Math.random() * 0.01 + 0.001; // $0.001 - $0.01
      case "growth": return Math.random() * 0.1 + 0.01; // $0.01 - $0.1
      case "mature": return Math.random() * 1 + 0.1; // $0.1 - $1
      default: return Math.random() * 0.01;
    }
  }

  private generateVolume(stage: string): number {
    switch (stage) {
      case "launch": return Math.random() * 100000 + 10000; // $10K - $100K
      case "early": return Math.random() * 1000000 + 100000; // $100K - $1M
      case "growth": return Math.random() * 10000000 + 1000000; // $1M - $10M
      case "mature": return Math.random() * 100000000 + 10000000; // $10M - $100M
      default: return Math.random() * 100000;
    }
  }

  private generateMarketCap(stage: string): number {
    switch (stage) {
      case "launch": return Math.random() * 1000000 + 100000; // $100K - $1M
      case "early": return Math.random() * 10000000 + 1000000; // $1M - $10M
      case "growth": return Math.random() * 100000000 + 10000000; // $10M - $100M
      case "mature": return Math.random() * 1000000000 + 100000000; // $100M - $1B
      default: return Math.random() * 1000000;
    }
  }

  private generateFDV(stage: string): number {
    return this.generateMarketCap(stage) * (1 + Math.random());
  }

  private generateLiquidity(stage: string): number {
    return this.generateVolume(stage) * 0.1; // 10% of daily volume
  }

  private generateHolders(stage: string): number {
    switch (stage) {
      case "launch": return Math.floor(Math.random() * 1000 + 100); // 100 - 1K
      case "early": return Math.floor(Math.random() * 10000 + 1000); // 1K - 10K
      case "growth": return Math.floor(Math.random() * 100000 + 10000); // 10K - 100K
      case "mature": return Math.floor(Math.random() * 1000000 + 100000); // 100K - 1M
      default: return Math.floor(Math.random() * 1000);
    }
  }

  private calculateMomentum(stage: string): number {
    const baseMomentum = {
      launch: 85,
      early: 70,
      growth: 60,
      mature: 40,
      decline: 20
    };
    return (baseMomentum[stage as keyof typeof baseMomentum] || 50) + (Math.random() - 0.5) * 30;
  }

  private calculateVolatility(stage: string): number {
    const baseVolatility = {
      launch: 95,
      early: 80,
      growth: 65,
      mature: 40,
      decline: 60
    };
    return (baseVolatility[stage as keyof typeof baseVolatility] || 50) + (Math.random() - 0.5) * 20;
  }

  private getExchangeListings(stage: string): string[] {
    const exchanges = {
      launch: ["Raydium", "Orca"],
      early: ["Raydium", "Orca", "Jupiter"],
      growth: ["Raydium", "Orca", "Jupiter", "MEXC"],
      mature: ["Raydium", "Orca", "Jupiter", "MEXC", "KuCoin", "Binance"]
    };
    return exchanges[stage as keyof typeof exchanges] || ["Raydium"];
  }

  private calculateRiskLevel(stage: string): "ultra-high" | "high" | "medium" | "low" {
    const riskLevels = {
      launch: "ultra-high",
      early: "high",
      growth: "medium",
      mature: "low",
      decline: "high"
    };
    return riskLevels[stage as keyof typeof riskLevels] || "high";
  }

  private calculateSniperScore(stage: string, age: number): number {
    let score = 0;
    
    // Age factor (newer = higher score)
    if (age < 1) score += 40; // Ultra new
    else if (age < 24) score += 35; // Very new
    else if (age < 168) score += 25; // New (1 week)
    else if (age < 720) score += 15; // Recent (1 month)
    else score += 5;
    
    // Stage factor
    const stageScores = { launch: 30, early: 25, growth: 15, mature: 5, decline: 10 };
    score += stageScores[stage as keyof typeof stageScores] || 10;
    
    // Random factors (momentum, social, etc.)
    score += Math.random() * 30;
    
    return Math.min(100, Math.max(0, score));
  }

  private startRealTimeUpdates() {
    // Update prices and detect opportunities every 3 seconds
    setInterval(() => {
      this.updatePrices();
      this.detectSniperOpportunities();
    }, 3000);

    // Generate new launches every 5 minutes
    setInterval(() => {
      this.generateNewLaunch();
    }, 300000);
  }

  private updatePrices() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    this.memecoins.forEach((coin, symbol) => {
      // Update price with realistic volatility
      const volatilityFactor = coin.volatility / 100;
      const priceChange = (Math.random() - 0.5) * volatilityFactor * 0.1; // Max 10% change per update
      coin.price = Math.max(0.000001, coin.price * (1 + priceChange));
      
      // Update other metrics
      coin.priceChange1h = coin.priceChange1h * 0.9 + priceChange * 100 * 0.1;
      coin.volume24h = coin.volume24h * (1 + (Math.random() - 0.5) * 0.2);
      coin.momentum = Math.max(0, Math.min(100, coin.momentum + (Math.random() - 0.5) * 10));
      coin.socialBuzz = Math.max(0, Math.min(100, coin.socialBuzz + (Math.random() - 0.5) * 15));
      coin.whaleActivity = Math.max(0, Math.min(100, coin.whaleActivity + (Math.random() - 0.5) * 20));
      coin.lastUpdate = new Date();
      
      this.memecoins.set(symbol, coin);
    });

    this.isUpdating = false;
  }

  private detectSniperOpportunities() {
    const opportunities: SniperOpportunity[] = [];
    
    this.memecoins.forEach((coin) => {
      // New launch detection
      if (coin.age < 24 && coin.sniperScore > 70) {
        opportunities.push({
          mint: coin.mint,
          symbol: coin.symbol,
          name: coin.name,
          reason: `Ultra-fresh launch (${coin.age.toFixed(1)}h old) with high momentum score`,
          sniperType: "new_launch",
          confidence: coin.sniperScore,
          timeWindow: "6-12 hours",
          entryPrice: coin.price,
          targetPrice: coin.price * (2 + Math.random() * 3), // 2-5x target
          stopLoss: coin.price * 0.5, // 50% stop loss
          potentialReturn: (2 + Math.random() * 3) * 100 - 100,
          riskReward: (2 + Math.random() * 3) / 0.5,
          volume: coin.volume24h,
          lastDetected: new Date()
        });
      }

      // Momentum breakout detection
      if (coin.momentum > 85 && coin.priceChange1h > 15) {
        opportunities.push({
          mint: coin.mint,
          symbol: coin.symbol,
          name: coin.name,
          reason: `Strong momentum breakout: ${coin.priceChange1h.toFixed(1)}% in 1h`,
          sniperType: "momentum_breakout",
          confidence: Math.min(95, coin.momentum),
          timeWindow: "1-3 hours",
          entryPrice: coin.price,
          targetPrice: coin.price * 1.5,
          stopLoss: coin.price * 0.85,
          potentialReturn: 50,
          riskReward: 0.5 / 0.15,
          volume: coin.volume24h,
          lastDetected: new Date()
        });
      }

      // Dip recovery detection
      if (coin.priceChange24h < -30 && coin.priceChange1h > 5 && coin.momentum > 60) {
        opportunities.push({
          mint: coin.mint,
          symbol: coin.symbol,
          name: coin.name,
          reason: `Dip recovery: Down ${Math.abs(coin.priceChange24h).toFixed(1)}% 24h but recovering`,
          sniperType: "dip_recovery",
          confidence: 75,
          timeWindow: "2-6 hours",
          entryPrice: coin.price,
          targetPrice: coin.price * 1.3,
          stopLoss: coin.price * 0.9,
          potentialReturn: 30,
          riskReward: 0.3 / 0.1,
          volume: coin.volume24h,
          lastDetected: new Date()
        });
      }

      // Whale accumulation detection
      if (coin.whaleActivity > 80 && coin.volume24h > coin.marketCap * 0.1) {
        opportunities.push({
          mint: coin.mint,
          symbol: coin.symbol,
          name: coin.name,
          reason: `High whale activity detected with volume ${(coin.volume24h / coin.marketCap * 100).toFixed(1)}% of mcap`,
          sniperType: "whale_accumulation",
          confidence: coin.whaleActivity,
          timeWindow: "4-24 hours",
          entryPrice: coin.price,
          targetPrice: coin.price * 2,
          stopLoss: coin.price * 0.8,
          potentialReturn: 100,
          riskReward: 1 / 0.2,
          volume: coin.volume24h,
          lastDetected: new Date()
        });
      }
    });

    // Keep only top 20 opportunities by confidence
    this.sniperOpportunities = opportunities
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20);
  }

  private generateNewLaunch() {
    const newSymbols = ["MOON", "PUMP", "DEGEN", "SAFE", "BABY", "MINI", "ULTRA", "MEGA", "SUPER", "TURBO"];
    const newNames = ["Moon", "Pump", "Degen", "Safe", "Baby", "Mini", "Ultra", "Mega", "Super", "Turbo"];
    
    const randomIndex = Math.floor(Math.random() * newSymbols.length);
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    const symbol = `${newSymbols[randomIndex]}${randomSuffix}`;
    const name = `${newNames[randomIndex]} ${randomSuffix}`;
    const mint = `NEW${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    const newCoin: MemecoinData = {
      mint,
      symbol,
      name,
      price: Math.random() * 0.001 + 0.00001,
      priceChange1h: (Math.random() - 0.3) * 50, // Slight positive bias
      priceChange24h: 0, // Just launched
      priceChange7d: 0,
      volume24h: Math.random() * 50000 + 5000,
      marketCap: Math.random() * 500000 + 50000,
      fdv: Math.random() * 1000000 + 100000,
      liquidity: Math.random() * 25000 + 2500,
      holders: Math.floor(Math.random() * 500 + 50),
      age: 0.1, // 6 minutes old
      stage: "launch",
      momentum: Math.random() * 40 + 60, // 60-100
      volatility: Math.random() * 20 + 80, // 80-100
      socialBuzz: Math.random() * 50 + 25,
      whaleActivity: Math.random() * 30 + 10,
      exchangeListings: ["Raydium"],
      lastUpdate: new Date(),
      riskLevel: "ultra-high",
      sniperScore: this.calculateSniperScore("launch", 0.1)
    };
    
    this.memecoins.set(symbol, newCoin);
    
    // Broadcast new launch
    storage.createActivity({
      agentId: "memecoin-launcher",
      type: "new_launch_detected",
      description: `🚀 NEW LAUNCH: ${symbol} (${name}) just launched with ${newCoin.sniperScore.toFixed(0)} sniper score`,
      projectId: "memecoin-aggregator",
      metadata: {
        symbol,
        name,
        mint,
        sniperScore: newCoin.sniperScore,
        initialPrice: newCoin.price,
        initialLiquidity: newCoin.liquidity
      }
    });
  }

  // Public API methods
  getTopGainers(limit: number = 10): MemecoinData[] {
    return Array.from(this.memecoins.values())
      .sort((a, b) => b.priceChange24h - a.priceChange24h)
      .slice(0, limit);
  }

  getTopLosers(limit: number = 10): MemecoinData[] {
    return Array.from(this.memecoins.values())
      .sort((a, b) => a.priceChange24h - b.priceChange24h)
      .slice(0, limit);
  }

  getNewLaunches(hoursLimit: number = 24): MemecoinData[] {
    return Array.from(this.memecoins.values())
      .filter(coin => coin.age <= hoursLimit)
      .sort((a, b) => a.age - b.age);
  }

  getSniperList(): SniperOpportunity[] {
    return this.sniperOpportunities;
  }

  getByStage(stage: string): MemecoinData[] {
    return Array.from(this.memecoins.values())
      .filter(coin => coin.stage === stage)
      .sort((a, b) => b.volume24h - a.volume24h);
  }

  getMomentumCoins(threshold: number = 70): MemecoinData[] {
    return Array.from(this.memecoins.values())
      .filter(coin => coin.momentum >= threshold)
      .sort((a, b) => b.momentum - a.momentum);
  }

  getAllMemecoins(): MemecoinData[] {
    return Array.from(this.memecoins.values())
      .sort((a, b) => b.marketCap - a.marketCap);
  }

  getMemecoinBySymbol(symbol: string): MemecoinData | undefined {
    return this.memecoins.get(symbol);
  }

  getCustomizedFeed(filters: {
    minMarketCap?: number;
    maxMarketCap?: number;
    minAge?: number;
    maxAge?: number;
    stages?: string[];
    minMomentum?: number;
    minSniperScore?: number;
  }): MemecoinData[] {
    return Array.from(this.memecoins.values()).filter(coin => {
      if (filters.minMarketCap && coin.marketCap < filters.minMarketCap) return false;
      if (filters.maxMarketCap && coin.marketCap > filters.maxMarketCap) return false;
      if (filters.minAge && coin.age < filters.minAge) return false;
      if (filters.maxAge && coin.age > filters.maxAge) return false;
      if (filters.stages && !filters.stages.includes(coin.stage)) return false;
      if (filters.minMomentum && coin.momentum < filters.minMomentum) return false;
      if (filters.minSniperScore && coin.sniperScore < filters.minSniperScore) return false;
      return true;
    }).sort((a, b) => b.sniperScore - a.sniperScore);
  }

  getMarketOverview() {
    const coins = Array.from(this.memecoins.values());
    return {
      totalCoins: coins.length,
      totalMarketCap: coins.reduce((sum, coin) => sum + coin.marketCap, 0),
      totalVolume24h: coins.reduce((sum, coin) => sum + coin.volume24h, 0),
      newLaunches24h: coins.filter(coin => coin.age <= 24).length,
      sniperOpportunities: this.sniperOpportunities.length,
      avgPriceChange24h: coins.reduce((sum, coin) => sum + coin.priceChange24h, 0) / coins.length,
      topGainerChange: Math.max(...coins.map(coin => coin.priceChange24h)),
      topLoserChange: Math.min(...coins.map(coin => coin.priceChange24h))
    };
  }
}

export const memecoinAggregator = new MemecoinAggregator();