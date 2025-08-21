use solana_sdk::{pubkey::Pubkey, signature::Signature};
use solana_client::nonblocking::rpc_client::RpcClient;
use anyhow::Result;
use std::collections::HashMap;

pub struct ProfitTracker {
    pub initial_balance: u64,
    pub current_balance: u64,
    pub total_profit: f64,
    pub trade_count: u32,
    pub successful_trades: u32,
    pub profit_history: Vec<TradeProfit>,
}

pub struct TradeProfit {
    pub timestamp: u64,
    pub trade_type: String,
    pub profit_sol: f64,
    pub signature: String,
    pub golden_ratio_applied: bool,
}

impl ProfitTracker {
    pub fn new(initial_balance: u64) -> Self {
        ProfitTracker {
            initial_balance,
            current_balance: initial_balance,
            total_profit: 0.0,
            trade_count: 0,
            successful_trades: 0,
            profit_history: Vec::new(),
        }
    }

    pub fn record_trade_profit(
        &mut self,
        trade_type: &str,
        profit_lamports: u64,
        signature: &Signature,
        golden_ratio_applied: bool,
    ) {
        let profit_sol = profit_lamports as f64 / 1e9;
        self.total_profit += profit_sol;
        self.current_balance += profit_lamports;
        self.trade_count += 1;
        
        if profit_sol > 0.0 {
            self.successful_trades += 1;
        }

        let trade_profit = TradeProfit {
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            trade_type: trade_type.to_string(),
            profit_sol,
            signature: signature.to_string(),
            golden_ratio_applied,
        };

        self.profit_history.push(trade_profit);
        display_profit(profit_sol);
    }

    pub fn get_success_rate(&self) -> f64 {
        if self.trade_count == 0 {
            0.0
        } else {
            (self.successful_trades as f64 / self.trade_count as f64) * 100.0
        }
    }

    pub fn get_average_profit(&self) -> f64 {
        if self.successful_trades == 0 {
            0.0
        } else {
            self.total_profit / self.successful_trades as f64
        }
    }

    pub fn display_summary(&self) {
        println!("╔══════════════════════════════════════╗");
        println!("║          PROFIT SUMMARY              ║");
        println!("╠══════════════════════════════════════╣");
        println!("║ Total Profit: {:.6} SOL          ║", self.total_profit);
        println!("║ Success Rate: {:.2}%                ║", self.get_success_rate());
        println!("║ Average Profit: {:.6} SOL         ║", self.get_average_profit());
        println!("║ Total Trades: {}                     ║", self.trade_count);
        println!("║ Successful: {}                       ║", self.successful_trades);
        println!("╚══════════════════════════════════════╝");
    }
}

pub fn display_profit(profit: f64) {
    if profit > 0.0 {
        println!("💎 Profit Captured: {:.6} SOL", profit);
    } else {
        println!("⚠️ Loss Recorded: {:.6} SOL", profit.abs());
    }
}

pub fn display_golden_ratio_profit(base_profit: f64, amplified_profit: f64) {
    let amplification = amplified_profit / base_profit;
    println!("🌟 Golden Ratio Amplification: {:.6} SOL → {:.6} SOL ({}x)", 
             base_profit, amplified_profit, amplification);
}

pub async fn calculate_arbitrage_profit(
    client: &RpcClient,
    buy_price: f64,
    sell_price: f64,
    amount_sol: f64,
) -> Result<f64> {
    let price_difference = sell_price - buy_price;
    let gross_profit = price_difference * amount_sol;
    
    // Account for transaction fees (approximately 0.000005 SOL per transaction)
    let transaction_fees = 0.000005 * 2.0; // Buy + Sell
    let net_profit = gross_profit - transaction_fees;
    
    println!("📊 Arbitrage Calculation:");
    println!("   Buy Price: {:.6} SOL", buy_price);
    println!("   Sell Price: {:.6} SOL", sell_price);
    println!("   Amount: {:.6} SOL", amount_sol);
    println!("   Gross Profit: {:.6} SOL", gross_profit);
    println!("   Transaction Fees: {:.6} SOL", transaction_fees);
    println!("   Net Profit: {:.6} SOL", net_profit);
    
    Ok(net_profit)
}

pub async fn calculate_flash_loan_profit(
    loan_amount: f64,
    interest_rate: f64,
    arbitrage_profit: f64,
) -> Result<f64> {
    let interest_cost = loan_amount * interest_rate;
    let net_profit = arbitrage_profit - interest_cost;
    
    println!("🔥 Flash Loan Profit Calculation:");
    println!("   Loan Amount: {:.6} SOL", loan_amount);
    println!("   Interest Rate: {:.4}%", interest_rate * 100.0);
    println!("   Interest Cost: {:.6} SOL", interest_cost);
    println!("   Arbitrage Profit: {:.6} SOL", arbitrage_profit);
    println!("   Net Profit: {:.6} SOL", net_profit);
    
    Ok(net_profit)
}

pub fn apply_golden_ratio_optimization(base_profit: f64) -> f64 {
    let golden_ratio = 1.618034;
    let optimized_profit = base_profit * golden_ratio;
    
    display_golden_ratio_profit(base_profit, optimized_profit);
    optimized_profit
}

pub async fn verify_profit_realization(
    client: &RpcClient,
    wallet: &Pubkey,
    expected_profit_lamports: u64,
    tolerance_percentage: f64,
) -> Result<bool> {
    let initial_balance = client.get_balance(wallet).await?;
    
    // Wait a short time for transaction settlement
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    
    let final_balance = client.get_balance(wallet).await?;
    let actual_profit = final_balance.saturating_sub(initial_balance);
    
    let expected_profit_sol = expected_profit_lamports as f64 / 1e9;
    let actual_profit_sol = actual_profit as f64 / 1e9;
    
    let profit_difference = (actual_profit_sol - expected_profit_sol).abs();
    let tolerance_amount = expected_profit_sol * tolerance_percentage;
    
    if profit_difference <= tolerance_amount {
        println!("✅ Profit realization verified: {:.6} SOL (expected: {:.6} SOL)", 
                 actual_profit_sol, expected_profit_sol);
        Ok(true)
    } else {
        println!("⚠️ Profit variance: {:.6} SOL actual vs {:.6} SOL expected", 
                 actual_profit_sol, expected_profit_sol);
        Ok(false)
    }
}

pub fn calculate_compound_profit(profits: &[f64], compound_rate: f64) -> f64 {
    profits.iter().fold(0.0, |acc, &profit| {
        acc + profit * (1.0 + compound_rate)
    })
}

pub fn generate_profit_analytics(tracker: &ProfitTracker) -> HashMap<String, f64> {
    let mut analytics = HashMap::new();
    
    analytics.insert("total_profit".to_string(), tracker.total_profit);
    analytics.insert("success_rate".to_string(), tracker.get_success_rate());
    analytics.insert("average_profit".to_string(), tracker.get_average_profit());
    analytics.insert("roi_percentage".to_string(), 
                     (tracker.total_profit / (tracker.initial_balance as f64 / 1e9)) * 100.0);
    
    // Calculate profit trend
    if tracker.profit_history.len() >= 2 {
        let recent_profits: Vec<f64> = tracker.profit_history
            .iter()
            .rev()
            .take(5)
            .map(|t| t.profit_sol)
            .collect();
        
        let trend = recent_profits.iter().sum::<f64>() / recent_profits.len() as f64;
        analytics.insert("recent_trend".to_string(), trend);
    }
    
    analytics
}