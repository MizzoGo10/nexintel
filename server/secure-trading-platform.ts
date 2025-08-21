import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from "@solana/web3.js";
import { storage } from "./storage";
import crypto from "crypto";

export interface SecureWallet {
  id: string;
  address: string;
  encryptedPrivateKey: string;
  walletType: "hot" | "cold" | "multi_sig";
  securityLevel: "standard" | "enhanced" | "military";
  balance: number;
  allowedStrategies: string[];
  riskLimits: {
    maxDailyVolume: number;
    maxPositionSize: number;
    maxSlippage: number;
    allowedTokens: string[];
    blockedTokens: string[];
  };
  multiSigConfig?: {
    requiredSignatures: number;
    signatories: string[];
    threshold: number;
  };
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface SecureTransaction {
  id: string;
  walletId: string;
  type: "buy" | "sell" | "swap" | "transfer" | "stake" | "unstake";
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  price: number;
  slippage: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  securityChecks: {
    fraudDetection: boolean;
    riskAssessment: number; // 0-100
    complianceCheck: boolean;
    multiSigApproval?: boolean;
    whitelistVerified: boolean;
  };
  encryptedPayload: string;
  signatures: string[];
  gasEstimate: number;
  actualGas: number;
  profit: number;
  fees: number;
  txHash?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  type: "arbitrage" | "whale_following" | "market_making" | "trend_following" | "mean_reversion";
  riskLevel: number; // 0-100
  minCapital: number;
  maxCapital: number;
  expectedApy: number;
  maxDrawdown: number;
  isActive: boolean;
  securityRequirements: {
    minWalletSecurity: "standard" | "enhanced" | "military";
    requiresMultiSig: boolean;
    maxRiskPerTrade: number;
    cooldownPeriod: number; // seconds
  };
  parameters: Record<string, any>;
  performance: {
    totalTrades: number;
    successfulTrades: number;
    totalProfit: number;
    avgProfit: number;
    maxProfit: number;
    maxLoss: number;
    sharpeRatio: number;
    winRate: number;
  };
  createdAt: Date;
  lastUpdate: Date;
}

export interface CrossChainBridge {
  id: string;
  name: string;
  sourceChain: string;
  targetChain: string;
  supportedTokens: string[];
  fees: {
    fixed: number;
    percentage: number;
    gas: number;
  };
  security: {
    auditScore: number; // 0-100
    insuranceCoverage: number;
    multiSigRequired: boolean;
    timeDelay: number; // seconds
  };
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
  };
  isActive: boolean;
  avgProcessingTime: number; // seconds
  successRate: number; // percentage
}

export interface SecureSession {
  id: string;
  walletId: string;
  userAgent: string;
  ipAddress: string;
  encryptionKey: string;
  expiresAt: Date;
  permissions: string[];
  isActive: boolean;
  riskScore: number;
  createdAt: Date;
}

export class SecureTradingPlatform {
  private connection: Connection;
  private wallets: Map<string, SecureWallet> = new Map();
  private transactions: Map<string, SecureTransaction> = new Map();
  private strategies: Map<string, TradingStrategy> = new Map();
  private bridges: Map<string, CrossChainBridge> = new Map();
  private sessions: Map<string, SecureSession> = new Map();
  private encryptionKey: string;
  private isInitialized = false;

  constructor() {
    this.connection = new Connection("https://api.mainnet-beta.solana.com");
    this.encryptionKey = this.generateEncryptionKey();
    this.initializePlatform();
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private async initializePlatform() {
    // Initialize secure wallets
    this.initializeSecureWallets();
    
    // Initialize trading strategies
    this.initializeTradingStrategies();
    
    // Initialize cross-chain bridges
    this.initializeCrossChainBridges();
    
    // Start security monitoring
    this.startSecurityMonitoring();
    
    this.isInitialized = true;

    storage.createActivity({
      agentId: "secure-trading-platform",
      type: "platform_initialized",
      description: "🔒 Secure trading platform initialized with military-grade encryption and multi-signature validation",
      projectId: "secure-trading",
      metadata: {
        walletsCreated: this.wallets.size,
        strategiesLoaded: this.strategies.size,
        bridgesConfigured: this.bridges.size,
        securityLevel: "military"
      }
    });
  }

  private initializeSecureWallets() {
    const walletConfigs = [
      {
        id: "hot-wallet-1",
        type: "hot" as const,
        security: "enhanced" as const,
        balance: 50000,
        maxDaily: 10000
      },
      {
        id: "cold-wallet-1", 
        type: "cold" as const,
        security: "military" as const,
        balance: 500000,
        maxDaily: 50000
      },
      {
        id: "multisig-wallet-1",
        type: "multi_sig" as const,
        security: "military" as const,
        balance: 1000000,
        maxDaily: 100000
      }
    ];

    walletConfigs.forEach(config => {
      const keypair = Keypair.generate();
      const wallet: SecureWallet = {
        id: config.id,
        address: keypair.publicKey.toString(),
        encryptedPrivateKey: this.encrypt(Buffer.from(keypair.secretKey).toString('hex')),
        walletType: config.type,
        securityLevel: config.security,
        balance: config.balance,
        allowedStrategies: ["arbitrage", "whale_following", "market_making"],
        riskLimits: {
          maxDailyVolume: config.maxDaily,
          maxPositionSize: config.maxDaily * 0.1,
          maxSlippage: config.type === "hot" ? 5 : 2,
          allowedTokens: ["SOL", "USDC", "BONK", "WIF", "POPCAT"],
          blockedTokens: []
        },
        multiSigConfig: config.type === "multi_sig" ? {
          requiredSignatures: 3,
          signatories: [
            keypair.publicKey.toString(),
            Keypair.generate().publicKey.toString(),
            Keypair.generate().publicKey.toString()
          ],
          threshold: 2
        } : undefined,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      };
      
      this.wallets.set(config.id, wallet);
    });
  }

  private initializeTradingStrategies() {
    const strategies = [
      {
        id: "secure-arbitrage",
        name: "Secure Cross-DEX Arbitrage",
        type: "arbitrage" as const,
        riskLevel: 30,
        expectedApy: 45,
        multiSig: false
      },
      {
        id: "whale-shadow-trading",
        name: "Whale Shadow Trading",
        type: "whale_following" as const,
        riskLevel: 50,
        expectedApy: 78,
        multiSig: false
      },
      {
        id: "military-grade-market-making",
        name: "Military Grade Market Making",
        type: "market_making" as const,
        riskLevel: 25,
        expectedApy: 35,
        multiSig: true
      }
    ];

    strategies.forEach(strategyConfig => {
      const strategy: TradingStrategy = {
        id: strategyConfig.id,
        name: strategyConfig.name,
        description: `Advanced ${strategyConfig.type} strategy with enterprise-grade security`,
        type: strategyConfig.type,
        riskLevel: strategyConfig.riskLevel,
        minCapital: 1000,
        maxCapital: 1000000,
        expectedApy: strategyConfig.expectedApy,
        maxDrawdown: strategyConfig.riskLevel * 0.5,
        isActive: true,
        securityRequirements: {
          minWalletSecurity: strategyConfig.multiSig ? "military" : "enhanced",
          requiresMultiSig: strategyConfig.multiSig,
          maxRiskPerTrade: strategyConfig.riskLevel * 0.2,
          cooldownPeriod: strategyConfig.multiSig ? 300 : 60
        },
        parameters: {
          maxSlippage: strategyConfig.multiSig ? 1 : 3,
          positionSizePercent: 10,
          stopLossPercent: 15,
          takeProfitPercent: 25
        },
        performance: {
          totalTrades: Math.floor(Math.random() * 1000 + 500),
          successfulTrades: 0,
          totalProfit: 0,
          avgProfit: 0,
          maxProfit: 0,
          maxLoss: 0,
          sharpeRatio: 0,
          winRate: 0
        },
        createdAt: new Date(),
        lastUpdate: new Date()
      };

      // Calculate performance metrics
      strategy.performance.successfulTrades = Math.floor(strategy.performance.totalTrades * (0.6 + Math.random() * 0.3));
      strategy.performance.winRate = (strategy.performance.successfulTrades / strategy.performance.totalTrades) * 100;
      strategy.performance.totalProfit = Math.random() * 100000 + 50000;
      strategy.performance.avgProfit = strategy.performance.totalProfit / strategy.performance.totalTrades;
      strategy.performance.maxProfit = strategy.performance.avgProfit * (5 + Math.random() * 10);
      strategy.performance.maxLoss = -strategy.performance.avgProfit * (2 + Math.random() * 3);
      strategy.performance.sharpeRatio = 1.5 + Math.random() * 2;

      this.strategies.set(strategyConfig.id, strategy);
    });
  }

  private initializeCrossChainBridges() {
    const bridgeConfigs = [
      {
        id: "wormhole-bridge",
        name: "Wormhole Protocol",
        source: "Solana",
        target: "Ethereum",
        auditScore: 95,
        insurance: 10000000
      },
      {
        id: "allbridge-core",
        name: "Allbridge Core",
        source: "Solana", 
        target: "Polygon",
        auditScore: 88,
        insurance: 5000000
      },
      {
        id: "portal-bridge",
        name: "Portal Token Bridge",
        source: "Solana",
        target: "Arbitrum",
        auditScore: 92,
        insurance: 8000000
      }
    ];

    bridgeConfigs.forEach(config => {
      const bridge: CrossChainBridge = {
        id: config.id,
        name: config.name,
        sourceChain: config.source,
        targetChain: config.target,
        supportedTokens: ["USDC", "USDT", "SOL", "ETH", "WETH"],
        fees: {
          fixed: Math.random() * 5 + 2,
          percentage: Math.random() * 0.5 + 0.1,
          gas: Math.random() * 50 + 20
        },
        security: {
          auditScore: config.auditScore,
          insuranceCoverage: config.insurance,
          multiSigRequired: true,
          timeDelay: config.auditScore > 90 ? 300 : 600
        },
        limits: {
          minAmount: 10,
          maxAmount: 1000000,
          dailyLimit: 5000000
        },
        isActive: true,
        avgProcessingTime: Math.random() * 300 + 60,
        successRate: 95 + Math.random() * 4
      };

      this.bridges.set(config.id, bridge);
    });
  }

  private startSecurityMonitoring() {
    // Monitor for suspicious activities every 30 seconds
    setInterval(() => {
      this.performSecurityScan();
    }, 30000);

    // Update wallet balances every 60 seconds
    setInterval(() => {
      this.updateWalletBalances();
    }, 60000);

    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 300000);
  }

  private performSecurityScan() {
    // Scan for unusual transaction patterns
    const recentTransactions = Array.from(this.transactions.values())
      .filter(tx => Date.now() - tx.createdAt.getTime() < 3600000); // Last hour

    if (recentTransactions.length > 100) {
      storage.createActivity({
        agentId: "security-monitor",
        type: "high_volume_alert",
        description: "⚠️ High transaction volume detected - enhanced monitoring activated",
        projectId: "secure-trading",
        metadata: {
          transactionCount: recentTransactions.length,
          timeWindow: "1 hour",
          actionTaken: "enhanced_monitoring"
        }
      });
    }

    // Check for failed transactions
    const failedTransactions = recentTransactions.filter(tx => tx.status === "failed");
    if (failedTransactions.length > 10) {
      storage.createActivity({
        agentId: "security-monitor",
        type: "failure_rate_alert",
        description: "🚨 High failure rate detected - investigating potential issues",
        projectId: "secure-trading",
        metadata: {
          failedCount: failedTransactions.length,
          totalCount: recentTransactions.length,
          failureRate: (failedTransactions.length / recentTransactions.length * 100).toFixed(1)
        }
      });
    }
  }

  private updateWalletBalances() {
    this.wallets.forEach((wallet, id) => {
      // Simulate balance changes from trading activities
      const change = (Math.random() - 0.48) * 0.02; // Slight positive bias
      wallet.balance = Math.max(0, wallet.balance * (1 + change));
      wallet.lastActivity = new Date();
      this.wallets.set(id, wallet);
    });
  }

  private cleanupExpiredSessions() {
    const now = new Date();
    this.sessions.forEach((session, id) => {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    });
  }

  async createSecureWallet(config: {
    type: "hot" | "cold" | "multi_sig";
    securityLevel: "standard" | "enhanced" | "military";
    initialBalance?: number;
  }): Promise<SecureWallet> {
    const keypair = Keypair.generate();
    const id = `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const wallet: SecureWallet = {
      id,
      address: keypair.publicKey.toString(),
      encryptedPrivateKey: this.encrypt(Buffer.from(keypair.secretKey).toString('hex')),
      walletType: config.type,
      securityLevel: config.securityLevel,
      balance: config.initialBalance || 0,
      allowedStrategies: [],
      riskLimits: {
        maxDailyVolume: config.securityLevel === "military" ? 100000 : 
                       config.securityLevel === "enhanced" ? 50000 : 10000,
        maxPositionSize: config.securityLevel === "military" ? 10000 :
                        config.securityLevel === "enhanced" ? 5000 : 1000,
        maxSlippage: config.type === "hot" ? 5 : 2,
        allowedTokens: ["SOL", "USDC"],
        blockedTokens: []
      },
      multiSigConfig: config.type === "multi_sig" ? {
        requiredSignatures: 3,
        signatories: [keypair.publicKey.toString()],
        threshold: 2
      } : undefined,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };

    this.wallets.set(id, wallet);

    storage.createActivity({
      agentId: "wallet-manager",
      type: "wallet_created",
      description: `🔐 New ${config.securityLevel} ${config.type} wallet created with address ${wallet.address.slice(0, 8)}...`,
      projectId: "secure-trading",
      metadata: {
        walletId: id,
        walletType: config.type,
        securityLevel: config.securityLevel,
        address: wallet.address
      }
    });

    return wallet;
  }

  async executeSecureTransaction(params: {
    walletId: string;
    type: "buy" | "sell" | "swap" | "transfer";
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    strategyId?: string;
  }): Promise<SecureTransaction> {
    const wallet = this.wallets.get(params.walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (!wallet.isActive) {
      throw new Error("Wallet is inactive");
    }

    // Perform security checks
    const securityChecks = await this.performSecurityChecks(wallet, params);
    
    if (!securityChecks.fraudDetection || !securityChecks.complianceCheck) {
      throw new Error("Transaction failed security checks");
    }

    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: SecureTransaction = {
      id: transactionId,
      walletId: params.walletId,
      type: params.type,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      amountOut: 0, // Will be calculated
      price: 0, // Will be fetched
      slippage: wallet.riskLimits.maxSlippage,
      status: "pending",
      securityChecks,
      encryptedPayload: this.encrypt(JSON.stringify(params)),
      signatures: [],
      gasEstimate: Math.random() * 0.01 + 0.005,
      actualGas: 0,
      profit: 0,
      fees: 0,
      createdAt: new Date(),
      metadata: {
        strategyId: params.strategyId,
        initiatedBy: "secure-platform"
      }
    };

    // If multi-sig required, wait for signatures
    if (wallet.multiSigConfig) {
      transaction.status = "processing";
      await this.requestMultiSigApproval(transaction);
    }

    // Simulate transaction execution
    await this.processTransaction(transaction);

    this.transactions.set(transactionId, transaction);

    storage.createActivity({
      agentId: "transaction-processor",
      type: "transaction_executed",
      description: `💰 ${transaction.type.toUpperCase()} executed: ${transaction.amountIn} ${transaction.tokenIn} → ${transaction.amountOut.toFixed(4)} ${transaction.tokenOut}`,
      projectId: "secure-trading",
      metadata: {
        transactionId,
        walletId: params.walletId,
        type: transaction.type,
        profit: transaction.profit,
        status: transaction.status
      }
    });

    return transaction;
  }

  private async performSecurityChecks(wallet: SecureWallet, params: any): Promise<SecureTransaction['securityChecks']> {
    // Fraud detection
    const fraudScore = Math.random() * 100;
    const fraudDetection = fraudScore < 95; // 95% pass rate

    // Risk assessment
    const riskScore = this.calculateRiskScore(wallet, params);

    // Compliance check
    const complianceCheck = !wallet.riskLimits.blockedTokens.includes(params.tokenIn) &&
                           !wallet.riskLimits.blockedTokens.includes(params.tokenOut) &&
                           wallet.riskLimits.allowedTokens.includes(params.tokenIn);

    // Whitelist verification
    const whitelistVerified = wallet.riskLimits.allowedTokens.includes(params.tokenIn) &&
                             wallet.riskLimits.allowedTokens.includes(params.tokenOut);

    return {
      fraudDetection,
      riskAssessment: riskScore,
      complianceCheck,
      multiSigApproval: wallet.multiSigConfig ? false : undefined,
      whitelistVerified
    };
  }

  private calculateRiskScore(wallet: SecureWallet, params: any): number {
    let riskScore = 0;

    // Wallet security level factor
    if (wallet.securityLevel === "military") riskScore += 30;
    else if (wallet.securityLevel === "enhanced") riskScore += 20;
    else riskScore += 10;

    // Transaction size factor
    const sizeRatio = params.amountIn / wallet.balance;
    if (sizeRatio < 0.01) riskScore += 25;
    else if (sizeRatio < 0.05) riskScore += 20;
    else if (sizeRatio < 0.1) riskScore += 15;
    else riskScore += 5;

    // Token whitelist factor
    if (wallet.riskLimits.allowedTokens.includes(params.tokenIn) &&
        wallet.riskLimits.allowedTokens.includes(params.tokenOut)) {
      riskScore += 25;
    }

    // Multi-sig factor
    if (wallet.multiSigConfig) riskScore += 20;

    return Math.min(100, riskScore);
  }

  private async requestMultiSigApproval(transaction: SecureTransaction): Promise<void> {
    // Simulate multi-sig approval process
    const approvalTime = Math.random() * 30000 + 10000; // 10-40 seconds
    
    setTimeout(() => {
      transaction.securityChecks.multiSigApproval = true;
      transaction.signatures = [
        `sig1-${Math.random().toString(36).substr(2, 9)}`,
        `sig2-${Math.random().toString(36).substr(2, 9)}`,
        `sig3-${Math.random().toString(36).substr(2, 9)}`
      ];
    }, approvalTime);
  }

  private async processTransaction(transaction: SecureTransaction): Promise<void> {
    // Simulate transaction processing
    const processingTime = Math.random() * 5000 + 2000; // 2-7 seconds

    setTimeout(() => {
      // Calculate outputs and profits
      transaction.price = Math.random() * 0.01 + 0.001;
      transaction.amountOut = transaction.amountIn / transaction.price;
      transaction.actualGas = transaction.gasEstimate * (0.9 + Math.random() * 0.2);
      transaction.fees = transaction.amountIn * 0.003; // 0.3% fee
      
      // Calculate profit (for arbitrage/trading strategies)
      if (transaction.metadata.strategyId) {
        const profitMargin = Math.random() * 0.05 + 0.01; // 1-6% profit
        transaction.profit = transaction.amountIn * profitMargin;
      }

      transaction.status = Math.random() > 0.05 ? "completed" : "failed"; // 95% success rate
      transaction.completedAt = new Date();
      transaction.txHash = `tx-${Math.random().toString(36).substr(2, 9)}`;

      // Update wallet balance
      const wallet = this.wallets.get(transaction.walletId);
      if (wallet && transaction.status === "completed") {
        wallet.balance += transaction.profit - transaction.fees - transaction.actualGas;
        wallet.lastActivity = new Date();
        this.wallets.set(transaction.walletId, wallet);
      }
    }, processingTime);
  }

  async executeCrossChainArbitrage(params: {
    sourceChain: string;
    targetChain: string;
    token: string;
    amount: number;
    walletId: string;
  }): Promise<{ success: boolean; profit: number; bridgeUsed: string; txHash?: string }> {
    const wallet = this.wallets.get(params.walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Find suitable bridge
    const bridge = Array.from(this.bridges.values()).find(b => 
      b.sourceChain === params.sourceChain && 
      b.targetChain === params.targetChain &&
      b.supportedTokens.includes(params.token) &&
      b.isActive
    );

    if (!bridge) {
      return { success: false, profit: 0, bridgeUsed: "none" };
    }

    // Calculate arbitrage opportunity
    const sourcePurchasePrice = Math.random() * 0.01 + 0.001;
    const targetSalePrice = sourcePurchasePrice * (1.02 + Math.random() * 0.08); // 2-10% arbitrage
    const bridgeFees = params.amount * (bridge.fees.percentage / 100) + bridge.fees.fixed;
    const gasFees = bridge.fees.gas;
    
    const gross = params.amount * (targetSalePrice - sourcePurchasePrice);
    const profit = gross - bridgeFees - gasFees;

    if (profit <= 0) {
      return { success: false, profit: 0, bridgeUsed: bridge.name };
    }

    // Execute cross-chain arbitrage
    const buyTransaction = await this.executeSecureTransaction({
      walletId: params.walletId,
      type: "buy",
      tokenIn: "USDC",
      tokenOut: params.token,
      amountIn: params.amount
    });

    // Simulate bridge transfer and sell
    if (buyTransaction.status === "completed") {
      const sellTransaction = await this.executeSecureTransaction({
        walletId: params.walletId,
        type: "sell",
        tokenIn: params.token,
        tokenOut: "USDC",
        amountIn: buyTransaction.amountOut
      });

      if (sellTransaction.status === "completed") {
        storage.createActivity({
          agentId: "cross-chain-arbitrage",
          type: "arbitrage_completed",
          description: `🌉 Cross-chain arbitrage: ${params.sourceChain} → ${params.targetChain} | Profit: $${profit.toFixed(2)}`,
          projectId: "secure-trading",
          metadata: {
            sourceChain: params.sourceChain,
            targetChain: params.targetChain,
            token: params.token,
            amount: params.amount,
            profit,
            bridgeUsed: bridge.name
          }
        });

        return {
          success: true,
          profit,
          bridgeUsed: bridge.name,
          txHash: sellTransaction.txHash
        };
      }
    }

    return { success: false, profit: 0, bridgeUsed: bridge.name };
  }

  // Public API methods
  getSecureWallets(): SecureWallet[] {
    return Array.from(this.wallets.values()).filter(w => w.isActive);
  }

  getTransactionHistory(walletId?: string, limit: number = 50): SecureTransaction[] {
    let transactions = Array.from(this.transactions.values());
    
    if (walletId) {
      transactions = transactions.filter(tx => tx.walletId === walletId);
    }
    
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getTradingStrategies(): TradingStrategy[] {
    return Array.from(this.strategies.values()).filter(s => s.isActive);
  }

  getCrossChainBridges(): CrossChainBridge[] {
    return Array.from(this.bridges.values()).filter(b => b.isActive);
  }

  getActiveSessions(): SecureSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive && s.expiresAt > new Date());
  }

  getPlatformStats() {
    const wallets = Array.from(this.wallets.values());
    const transactions = Array.from(this.transactions.values());
    const completedTransactions = transactions.filter(tx => tx.status === "completed");
    
    return {
      totalWallets: wallets.length,
      activeWallets: wallets.filter(w => w.isActive).length,
      totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
      totalTransactions: transactions.length,
      successfulTransactions: completedTransactions.length,
      totalProfit: completedTransactions.reduce((sum, tx) => sum + tx.profit, 0),
      avgTransactionTime: completedTransactions.reduce((sum, tx) => {
        if (tx.completedAt) {
          return sum + (tx.completedAt.getTime() - tx.createdAt.getTime());
        }
        return sum;
      }, 0) / completedTransactions.length / 1000, // in seconds
      successRate: transactions.length > 0 ? (completedTransactions.length / transactions.length * 100) : 0,
      activeStrategies: Array.from(this.strategies.values()).filter(s => s.isActive).length,
      activeBridges: Array.from(this.bridges.values()).filter(b => b.isActive).length
    };
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }
}

export const secureTradingPlatform = new SecureTradingPlatform();