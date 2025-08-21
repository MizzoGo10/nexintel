import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { storage } from "./storage";
import crypto from "crypto";

export interface SystemWallet {
  id: string;
  userId: string;
  walletType: "hot_trading" | "active_receiving" | "vault_portfolio" | "agent_imported";
  actualAddress: string; // Real blockchain address
  systemAddress: string; // System-generated proxy address displayed to users
  encryptedPrivateKey: string;
  balance: number;
  isSystemManaged: boolean;
  keyStorageEnabled: boolean;
  keyAccessCount: number;
  maxFreeAccess: number;
  securityPlan: "none" | "basic" | "premium" | "enterprise";
  agentId?: string; // If imported from agent
  agentWalletData?: {
    agentName: string;
    importedAt: Date;
    originalAddress: string;
    permissions: string[];
  };
  metadata: {
    label: string;
    description: string;
    lastActivity: Date;
    totalTransactions: number;
    totalVolume: number;
    riskLevel: "low" | "medium" | "high";
  };
  createdAt: Date;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  fromWalletId: string;
  toWalletId?: string;
  fromSystemAddress: string;
  toSystemAddress: string;
  actualFromAddress: string;
  actualToAddress: string;
  amount: number;
  token: string;
  transactionType: "transfer" | "trade" | "stake" | "receive" | "agent_operation";
  status: "pending" | "processing" | "completed" | "failed";
  fees: number;
  txHash?: string;
  agentInitiated?: boolean;
  agentId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface SecurityPlan {
  id: string;
  name: string;
  type: "basic" | "premium" | "enterprise";
  monthlyPrice: number;
  features: {
    unlimitedKeyAccess: boolean;
    prioritySupport: boolean;
    advancedEncryption: boolean;
    multiDeviceSync: boolean;
    backupRecovery: boolean;
    auditLogs: boolean;
    whitelistIps: boolean;
    hardwareSecurityModule: boolean;
  };
  keyViewingFees: {
    freeViews: number;
    payPerViewPrice: number;
  };
  storageFeatures: {
    maxWallets: number;
    autoBackup: boolean;
    encryptionLevel: "standard" | "military" | "quantum";
    accessLogging: boolean;
  };
}

export interface AgentWallet {
  agentId: string;
  agentName: string;
  walletAddress: string;
  importedAt: Date;
  permissions: ("read" | "trade" | "transfer" | "stake")[];
  isActive: boolean;
  totalValue: number;
  lastSync: Date;
  metadata: {
    description: string;
    riskLevel: "low" | "medium" | "high";
    strategiesUsed: string[];
    performance: {
      totalProfit: number;
      winRate: number;
      totalTrades: number;
    };
  };
}

export interface KeyAccessLog {
  id: string;
  userId: string;
  walletId: string;
  accessType: "view" | "export" | "backup";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  paymentRequired: boolean;
  amountCharged: number;
  securityPlan: string;
}

export class MultiWalletSystem {
  private connection: Connection;
  private systemWallets: Map<string, SystemWallet> = new Map();
  private transactions: Map<string, WalletTransaction> = new Map();
  private securityPlans: Map<string, SecurityPlan> = new Map();
  private agentWallets: Map<string, AgentWallet> = new Map();
  private keyAccessLogs: Map<string, KeyAccessLog> = new Map();
  private systemMasterKey: string;
  private addressMappings: Map<string, string> = new Map(); // system address -> actual address

  constructor() {
    this.connection = new Connection("https://api.mainnet-beta.solana.com");
    this.systemMasterKey = this.generateMasterKey();
    this.initializeSystem();
  }

  private generateMasterKey(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private generateSystemAddress(actualAddress: string): string {
    // Generate a unique system address that maps to the actual address
    const hash = crypto.createHash('sha256').update(actualAddress + this.systemMasterKey).digest('hex');
    return `SYS${hash.substring(0, 40).toUpperCase()}`;
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.systemMasterKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-gcm', this.systemMasterKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private async initializeSystem() {
    this.initializeSecurityPlans();
    this.createDefaultWallets();
    this.startSystemMonitoring();

    storage.createActivity({
      agentId: "multi-wallet-system",
      type: "system_initialized",
      description: "Multi-wallet system initialized with proxy addresses and security plans",
      projectId: "wallet-system",
      metadata: {
        systemWallets: this.systemWallets.size,
        securityPlans: this.securityPlans.size,
        agentWallets: this.agentWallets.size
      }
    });
  }

  private initializeSecurityPlans() {
    const plans: SecurityPlan[] = [
      {
        id: "basic",
        name: "Basic Security",
        type: "basic",
        monthlyPrice: 9.99,
        features: {
          unlimitedKeyAccess: false,
          prioritySupport: false,
          advancedEncryption: true,
          multiDeviceSync: false,
          backupRecovery: true,
          auditLogs: false,
          whitelistIps: false,
          hardwareSecurityModule: false
        },
        keyViewingFees: {
          freeViews: 5,
          payPerViewPrice: 0.50
        },
        storageFeatures: {
          maxWallets: 10,
          autoBackup: true,
          encryptionLevel: "standard",
          accessLogging: true
        }
      },
      {
        id: "premium",
        name: "Premium Security",
        type: "premium",
        monthlyPrice: 29.99,
        features: {
          unlimitedKeyAccess: true,
          prioritySupport: true,
          advancedEncryption: true,
          multiDeviceSync: true,
          backupRecovery: true,
          auditLogs: true,
          whitelistIps: true,
          hardwareSecurityModule: false
        },
        keyViewingFees: {
          freeViews: -1, // unlimited
          payPerViewPrice: 0
        },
        storageFeatures: {
          maxWallets: 50,
          autoBackup: true,
          encryptionLevel: "military",
          accessLogging: true
        }
      },
      {
        id: "enterprise",
        name: "Enterprise Security",
        type: "enterprise",
        monthlyPrice: 99.99,
        features: {
          unlimitedKeyAccess: true,
          prioritySupport: true,
          advancedEncryption: true,
          multiDeviceSync: true,
          backupRecovery: true,
          auditLogs: true,
          whitelistIps: true,
          hardwareSecurityModule: true
        },
        keyViewingFees: {
          freeViews: -1, // unlimited
          payPerViewPrice: 0
        },
        storageFeatures: {
          maxWallets: -1, // unlimited
          autoBackup: true,
          encryptionLevel: "quantum",
          accessLogging: true
        }
      }
    ];

    plans.forEach(plan => {
      this.securityPlans.set(plan.id, plan);
    });
  }

  private createDefaultWallets() {
    const defaultWallets = [
      {
        type: "hot_trading" as const,
        label: "Hot Trading Wallet",
        description: "For active trading and quick transactions",
        balance: 1000
      },
      {
        type: "active_receiving" as const,
        label: "Active Receiving Wallet", 
        description: "For receiving payments and deposits",
        balance: 5000
      },
      {
        type: "vault_portfolio" as const,
        label: "Vault Portfolio Wallet",
        description: "Secure storage for long-term holdings",
        balance: 25000
      }
    ];

    defaultWallets.forEach(config => {
      this.createSystemWallet("default-user", config.type, {
        label: config.label,
        description: config.description,
        initialBalance: config.balance,
        securityPlan: "basic"
      });
    });
  }

  private startSystemMonitoring() {
    // Monitor transactions every 30 seconds
    setInterval(() => {
      this.processSystemTransactions();
    }, 30000);

    // Update wallet balances every 60 seconds
    setInterval(() => {
      this.updateWalletBalances();
    }, 60000);

    // Clean up old logs every hour
    setInterval(() => {
      this.cleanupAccessLogs();
    }, 3600000);
  }

  private processSystemTransactions() {
    const pendingTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.status === "pending");

    pendingTransactions.forEach(async (tx) => {
      // Simulate transaction processing
      const processingTime = Math.random() * 10000 + 5000; // 5-15 seconds
      
      setTimeout(() => {
        tx.status = Math.random() > 0.05 ? "completed" : "failed"; // 95% success rate
        tx.completedAt = new Date();
        tx.txHash = `tx-${Math.random().toString(36).substr(2, 9)}`;
        
        if (tx.status === "completed") {
          // Update wallet balances
          const fromWallet = this.systemWallets.get(tx.fromWalletId);
          const toWallet = tx.toWalletId ? this.systemWallets.get(tx.toWalletId) : null;
          
          if (fromWallet) {
            fromWallet.balance -= (tx.amount + tx.fees);
            fromWallet.metadata.totalTransactions++;
            fromWallet.metadata.totalVolume += tx.amount;
            fromWallet.metadata.lastActivity = new Date();
            this.systemWallets.set(tx.fromWalletId, fromWallet);
          }
          
          if (toWallet) {
            toWallet.balance += tx.amount;
            toWallet.metadata.totalTransactions++;
            toWallet.metadata.totalVolume += tx.amount;
            toWallet.metadata.lastActivity = new Date();
            this.systemWallets.set(tx.toWalletId, toWallet);
          }
        }
        
        this.transactions.set(tx.id, tx);
      }, processingTime);
    });
  }

  private updateWalletBalances() {
    this.systemWallets.forEach((wallet, id) => {
      if (wallet.walletType === "hot_trading") {
        // Simulate trading activity
        const change = (Math.random() - 0.45) * 0.05; // Slight positive bias
        wallet.balance = Math.max(0, wallet.balance * (1 + change));
      } else if (wallet.walletType === "vault_portfolio") {
        // Simulate staking rewards
        const stakingReward = wallet.balance * 0.0001; // 0.01% daily
        wallet.balance += stakingReward;
      }
      
      this.systemWallets.set(id, wallet);
    });
  }

  private cleanupAccessLogs() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    this.keyAccessLogs.forEach((log, id) => {
      if (log.timestamp < thirtyDaysAgo) {
        this.keyAccessLogs.delete(id);
      }
    });
  }

  async createSystemWallet(userId: string, walletType: SystemWallet['walletType'], options: {
    label: string;
    description: string;
    initialBalance?: number;
    securityPlan?: string;
    agentId?: string;
  }): Promise<SystemWallet> {
    const keypair = Keypair.generate();
    const actualAddress = keypair.publicKey.toString();
    const systemAddress = this.generateSystemAddress(actualAddress);
    const walletId = `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const wallet: SystemWallet = {
      id: walletId,
      userId,
      walletType,
      actualAddress,
      systemAddress,
      encryptedPrivateKey: this.encrypt(Buffer.from(keypair.secretKey).toString('hex')),
      balance: options.initialBalance || 0,
      isSystemManaged: true,
      keyStorageEnabled: true,
      keyAccessCount: 0,
      maxFreeAccess: 3,
      securityPlan: (options.securityPlan as SystemWallet['securityPlan']) || "none",
      agentId: options.agentId,
      metadata: {
        label: options.label,
        description: options.description,
        lastActivity: new Date(),
        totalTransactions: 0,
        totalVolume: 0,
        riskLevel: walletType === "hot_trading" ? "high" : 
                   walletType === "active_receiving" ? "medium" : "low"
      },
      createdAt: new Date(),
      isActive: true
    };

    this.systemWallets.set(walletId, wallet);
    this.addressMappings.set(systemAddress, actualAddress);

    storage.createActivity({
      agentId: "wallet-manager",
      type: "wallet_created",
      description: `${walletType.replace('_', ' ')} wallet created: ${systemAddress}`,
      projectId: "wallet-system",
      metadata: {
        walletId,
        walletType,
        systemAddress,
        securityPlan: wallet.securityPlan,
        agentId: options.agentId
      }
    });

    return wallet;
  }

  async importAgentWallet(agentData: {
    agentId: string;
    agentName: string;
    walletAddress: string;
    permissions: ("read" | "trade" | "transfer" | "stake")[];
    description: string;
  }): Promise<{ systemWallet: SystemWallet; agentWallet: AgentWallet }> {
    // Create agent wallet record
    const agentWallet: AgentWallet = {
      agentId: agentData.agentId,
      agentName: agentData.agentName,
      walletAddress: agentData.walletAddress,
      importedAt: new Date(),
      permissions: agentData.permissions,
      isActive: true,
      totalValue: Math.random() * 50000 + 10000, // Simulated value
      lastSync: new Date(),
      metadata: {
        description: agentData.description,
        riskLevel: "medium",
        strategiesUsed: ["arbitrage", "whale_following"],
        performance: {
          totalProfit: Math.random() * 10000 + 5000,
          winRate: 65 + Math.random() * 30,
          totalTrades: Math.floor(Math.random() * 1000 + 100)
        }
      }
    };

    // Create system wallet for the agent
    const systemWallet = await this.createSystemWallet("system", "agent_imported", {
      label: `${agentData.agentName} Agent Wallet`,
      description: `Imported wallet from ${agentData.agentName} agent`,
      initialBalance: agentWallet.totalValue,
      securityPlan: "premium",
      agentId: agentData.agentId
    });

    // Add agent-specific data to system wallet
    systemWallet.agentWalletData = {
      agentName: agentData.agentName,
      importedAt: new Date(),
      originalAddress: agentData.walletAddress,
      permissions: agentData.permissions
    };

    this.agentWallets.set(agentData.agentId, agentWallet);
    this.systemWallets.set(systemWallet.id, systemWallet);

    storage.createActivity({
      agentId: "agent-wallet-importer",
      type: "agent_wallet_imported",
      description: `Agent wallet imported: ${agentData.agentName} (${systemWallet.systemAddress})`,
      projectId: "wallet-system",
      metadata: {
        agentId: agentData.agentId,
        agentName: agentData.agentName,
        originalAddress: agentData.walletAddress,
        systemAddress: systemWallet.systemAddress,
        permissions: agentData.permissions
      }
    });

    return { systemWallet, agentWallet };
  }

  async transferBetweenWallets(params: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    token: string;
    agentInitiated?: boolean;
    agentId?: string;
  }): Promise<WalletTransaction> {
    const fromWallet = this.systemWallets.get(params.fromWalletId);
    const toWallet = this.systemWallets.get(params.toWalletId);

    if (!fromWallet || !toWallet) {
      throw new Error("Wallet not found");
    }

    if (fromWallet.balance < params.amount) {
      throw new Error("Insufficient balance");
    }

    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fees = params.amount * 0.001; // 0.1% fee

    const transaction: WalletTransaction = {
      id: transactionId,
      fromWalletId: params.fromWalletId,
      toWalletId: params.toWalletId,
      fromSystemAddress: fromWallet.systemAddress,
      toSystemAddress: toWallet.systemAddress,
      actualFromAddress: fromWallet.actualAddress,
      actualToAddress: toWallet.actualAddress,
      amount: params.amount,
      token: params.token,
      transactionType: "transfer",
      status: "pending",
      fees,
      agentInitiated: params.agentInitiated || false,
      agentId: params.agentId,
      createdAt: new Date()
    };

    this.transactions.set(transactionId, transaction);

    storage.createActivity({
      agentId: params.agentId || "wallet-system",
      type: "wallet_transfer",
      description: `Transfer: ${params.amount} ${params.token} from ${fromWallet.systemAddress} to ${toWallet.systemAddress}`,
      projectId: "wallet-system",
      metadata: {
        transactionId,
        fromWalletType: fromWallet.walletType,
        toWalletType: toWallet.walletType,
        amount: params.amount,
        token: params.token,
        agentInitiated: params.agentInitiated
      }
    });

    return transaction;
  }

  async accessPrivateKey(walletId: string, userId: string, accessType: "view" | "export" | "backup", clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<{ success: boolean; privateKey?: string; chargeAmount?: number; message: string }> {
    const wallet = this.systemWallets.get(walletId);
    if (!wallet || wallet.userId !== userId) {
      return { success: false, message: "Wallet not found or access denied" };
    }

    const securityPlan = this.securityPlans.get(wallet.securityPlan);
    let chargeAmount = 0;
    let accessGranted = false;

    if (securityPlan) {
      if (securityPlan.features.unlimitedKeyAccess) {
        accessGranted = true;
      } else {
        const freeViewsRemaining = securityPlan.keyViewingFees.freeViews - wallet.keyAccessCount;
        if (freeViewsRemaining > 0) {
          accessGranted = true;
        } else {
          chargeAmount = securityPlan.keyViewingFees.payPerViewPrice;
          accessGranted = true; // Assume payment is processed
        }
      }
    } else {
      // No security plan - limited free access
      if (wallet.keyAccessCount < wallet.maxFreeAccess) {
        accessGranted = true;
      } else {
        chargeAmount = 0.50; // Default pay-per-view price
        accessGranted = true; // Assume payment is processed
      }
    }

    // Log the access attempt
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const accessLog: KeyAccessLog = {
      id: logId,
      userId,
      walletId,
      accessType,
      timestamp: new Date(),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      paymentRequired: chargeAmount > 0,
      amountCharged: chargeAmount,
      securityPlan: wallet.securityPlan
    };

    this.keyAccessLogs.set(logId, accessLog);

    if (accessGranted) {
      wallet.keyAccessCount++;
      this.systemWallets.set(walletId, wallet);

      const privateKey = this.decrypt(wallet.encryptedPrivateKey);

      storage.createActivity({
        agentId: "key-access-manager",
        type: "private_key_accessed",
        description: `Private key ${accessType} for wallet ${wallet.systemAddress}`,
        projectId: "wallet-system",
        metadata: {
          walletId,
          accessType,
          chargeAmount,
          securityPlan: wallet.securityPlan,
          accessCount: wallet.keyAccessCount
        }
      });

      return {
        success: true,
        privateKey,
        chargeAmount,
        message: chargeAmount > 0 ? 
          `Access granted. Charged $${chargeAmount.toFixed(2)}` : 
          "Access granted"
      };
    }

    return { success: false, message: "Access denied" };
  }

  // Public API methods
  getSystemWallets(userId: string): SystemWallet[] {
    return Array.from(this.systemWallets.values())
      .filter(wallet => wallet.userId === userId && wallet.isActive)
      .map(wallet => ({
        ...wallet,
        encryptedPrivateKey: "***HIDDEN***" // Never expose in API responses
      }));
  }

  getWalletTransactions(walletId: string, limit: number = 50): WalletTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.fromWalletId === walletId || tx.toWalletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getSecurityPlans(): SecurityPlan[] {
    return Array.from(this.securityPlans.values());
  }

  getAgentWallets(): AgentWallet[] {
    return Array.from(this.agentWallets.values()).filter(wallet => wallet.isActive);
  }

  getKeyAccessLogs(userId: string, limit: number = 100): KeyAccessLog[] {
    return Array.from(this.keyAccessLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getSystemStats() {
    const wallets = Array.from(this.systemWallets.values());
    const transactions = Array.from(this.transactions.values());
    const agentWallets = Array.from(this.agentWallets.values());
    
    return {
      totalWallets: wallets.length,
      activeWallets: wallets.filter(w => w.isActive).length,
      totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
      walletsByType: {
        hot_trading: wallets.filter(w => w.walletType === "hot_trading").length,
        active_receiving: wallets.filter(w => w.walletType === "active_receiving").length,
        vault_portfolio: wallets.filter(w => w.walletType === "vault_portfolio").length,
        agent_imported: wallets.filter(w => w.walletType === "agent_imported").length
      },
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(tx => tx.status === "completed").length,
      totalVolume: transactions
        .filter(tx => tx.status === "completed")
        .reduce((sum, tx) => sum + tx.amount, 0),
      agentWalletsImported: agentWallets.length,
      activeAgentWallets: agentWallets.filter(w => w.isActive).length,
      keyAccessesToday: Array.from(this.keyAccessLogs.values())
        .filter(log => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return log.timestamp >= today;
        }).length
    };
  }

  resolveSystemAddress(systemAddress: string): string | null {
    return this.addressMappings.get(systemAddress) || null;
  }

  async upgradeSecurityPlan(walletId: string, newPlan: string): Promise<boolean> {
    const wallet = this.systemWallets.get(walletId);
    const plan = this.securityPlans.get(newPlan);
    
    if (!wallet || !plan) {
      return false;
    }

    wallet.securityPlan = plan.type;
    wallet.keyAccessCount = 0; // Reset access count
    this.systemWallets.set(walletId, wallet);

    storage.createActivity({
      agentId: "security-manager",
      type: "security_plan_upgraded",
      description: `Security plan upgraded to ${plan.name} for wallet ${wallet.systemAddress}`,
      projectId: "wallet-system",
      metadata: {
        walletId,
        previousPlan: wallet.securityPlan,
        newPlan: plan.type,
        monthlyPrice: plan.monthlyPrice
      }
    });

    return true;
  }
}

export const multiWalletSystem = new MultiWalletSystem();