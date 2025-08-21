import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, getMint } from '@solana/spl-token';

export class SolanaService {
  private connection: Connection;
  private wsConnection: Connection;

  constructor() {
    // Use the provided QuikNode endpoint
    const rpcUrl = 'https://empty-hidden-spring.solana-mainnet.quiknode.pro/ea24f1bb95ea3b2dc4cddbe74a4bce8e10eaa88e';
    
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.wsConnection = this.connection;
  }

  async getClusterInfo() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      const blockHeight = await this.connection.getBlockHeight();
      
      return {
        version: version['solana-core'],
        slot,
        blockHeight,
        cluster: 'mainnet-beta'
      };
    } catch (error) {
      console.error('Error fetching cluster info:', error);
      throw error;
    }
  }

  async getTokenInfo(mintAddress: string) {
    try {
      const mint = new PublicKey(mintAddress);
      const mintInfo = await getMint(this.connection, mint);
      
      return {
        address: mintAddress,
        decimals: mintInfo.decimals,
        supply: mintInfo.supply.toString(),
        isInitialized: mintInfo.isInitialized,
        freezeAuthority: mintInfo.freezeAuthority?.toString() || null,
        mintAuthority: mintInfo.mintAuthority?.toString() || null
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  async getAccountBalance(publicKey: string) {
    try {
      const pubkey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }

  async getTokenBalance(walletAddress: string, mintAddress: string) {
    try {
      const wallet = new PublicKey(walletAddress);
      const mint = new PublicKey(mintAddress);
      const tokenAccount = await getAssociatedTokenAddress(mint, wallet);
      
      const tokenAccountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return {
        balance: tokenAccountInfo.value.amount,
        decimals: tokenAccountInfo.value.decimals,
        uiAmount: tokenAccountInfo.value.uiAmount
      };
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return null;
    }
  }

  async getRecentTransactions(publicKey: string, limit: number = 10) {
    try {
      const pubkey = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            fee: tx?.meta?.fee || 0,
            success: tx?.meta?.err === null
          };
        })
      );
      
      return transactions;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  async monitorWallet(publicKey: string, callback: (data: any) => void) {
    try {
      const pubkey = new PublicKey(publicKey);
      
      this.wsConnection.onAccountChange(pubkey, (accountInfo) => {
        callback({
          type: 'account_change',
          publicKey: publicKey,
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toString(),
          executable: accountInfo.executable
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error setting up wallet monitoring:', error);
      return false;
    }
  }
}

export const solanaService = new SolanaService();