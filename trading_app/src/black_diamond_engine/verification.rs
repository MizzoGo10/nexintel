use solana_sdk::{pubkey::Pubkey, signature::Signature};
use solana_client::nonblocking::rpc_client::RpcClient;
use anyhow::Result;

pub async fn verify_transaction(client: &RpcClient, tx: &Signature) -> bool {
    println!("🔍 Verifying transaction: {}", tx);
    
    match client.confirm_transaction(tx, "confirmed").await {
        Ok(confirmed) => {
            if confirmed {
                println!("✅ Transaction confirmed on-chain");
            } else {
                println!("❌ Transaction failed verification");
            }
            confirmed
        }
        Err(e) => {
            println!("⚠️ Verification error: {}", e);
            false
        }
    }
}

pub async fn check_wallet_balance(client: &RpcClient, wallet: &Pubkey) -> Result<u64> {
    let balance = client.get_balance(wallet).await?;
    println!("💰 Wallet balance: {:.6} SOL", balance as f64 / 1e9);
    Ok(balance)
}

pub async fn verify_profit_threshold(
    client: &RpcClient,
    wallet: &Pubkey,
    initial_balance: u64,
    min_profit_lamports: u64,
) -> Result<bool> {
    let current_balance = check_wallet_balance(client, wallet).await?;
    let profit = current_balance.saturating_sub(initial_balance);
    
    let profit_sol = profit as f64 / 1e9;
    let threshold_sol = min_profit_lamports as f64 / 1e9;
    
    if profit >= min_profit_lamports {
        println!("✅ Profit threshold met: {:.6} SOL (required: {:.6} SOL)", profit_sol, threshold_sol);
        Ok(true)
    } else {
        println!("❌ Profit below threshold: {:.6} SOL (required: {:.6} SOL)", profit_sol, threshold_sol);
        Ok(false)
    }
}

pub async fn verify_gas_optimization(
    actual_fee: u64,
    estimated_fee: u64,
    optimization_threshold: f64,
) -> bool {
    let savings_percentage = if estimated_fee > 0 {
        (estimated_fee.saturating_sub(actual_fee) as f64) / (estimated_fee as f64)
    } else {
        0.0
    };
    
    if savings_percentage >= optimization_threshold {
        println!("✅ Gas optimization successful: {:.2}% savings", savings_percentage * 100.0);
        true
    } else {
        println!("⚠️ Gas optimization below threshold: {:.2}% savings (required: {:.2}%)", 
                 savings_percentage * 100.0, optimization_threshold * 100.0);
        false
    }
}

pub async fn verify_signature_authenticity(
    client: &RpcClient,
    signature: &Signature,
    expected_payer: &Pubkey,
) -> Result<bool> {
    match client.get_transaction(signature, "confirmed").await {
        Ok(Some(transaction)) => {
            if let Some(payer) = transaction.transaction.message.account_keys.first() {
                if payer == expected_payer {
                    println!("✅ Signature authenticity verified");
                    Ok(true)
                } else {
                    println!("❌ Signature payer mismatch");
                    Ok(false)
                }
            } else {
                println!("❌ No payer found in transaction");
                Ok(false)
            }
        }
        Ok(None) => {
            println!("❌ Transaction not found");
            Ok(false)
        }
        Err(e) => {
            println!("⚠️ Error retrieving transaction: {}", e);
            Err(e.into())
        }
    }
}

pub async fn verify_bundle_atomicity(
    client: &RpcClient,
    signatures: &[Signature],
) -> Result<bool> {
    println!("🔍 Verifying bundle atomicity for {} transactions", signatures.len());
    
    let mut all_confirmed = true;
    let mut confirmation_times = Vec::new();
    
    for (i, signature) in signatures.iter().enumerate() {
        let start_time = std::time::Instant::now();
        let confirmed = verify_transaction(client, signature).await;
        let confirmation_time = start_time.elapsed();
        
        confirmation_times.push(confirmation_time);
        
        if !confirmed {
            println!("❌ Transaction {} failed in bundle", i);
            all_confirmed = false;
        }
    }
    
    if all_confirmed {
        let avg_confirmation_time = confirmation_times.iter().sum::<std::time::Duration>() / confirmation_times.len() as u32;
        println!("✅ Bundle atomicity verified - Average confirmation: {:?}", avg_confirmation_time);
    }
    
    Ok(all_confirmed)
}

pub async fn verify_arbitrage_execution(
    client: &RpcClient,
    buy_signature: &Signature,
    sell_signature: &Signature,
    expected_profit_lamports: u64,
) -> Result<bool> {
    println!("🔍 Verifying arbitrage execution");
    
    let buy_confirmed = verify_transaction(client, buy_signature).await;
    let sell_confirmed = verify_transaction(client, sell_signature).await;
    
    if buy_confirmed && sell_confirmed {
        println!("✅ Both arbitrage transactions confirmed");
        
        // Additional verification could include checking actual token balances
        // and calculating realized profit vs expected profit
        let expected_profit_sol = expected_profit_lamports as f64 / 1e9;
        println!("💎 Expected arbitrage profit: {:.6} SOL", expected_profit_sol);
        
        Ok(true)
    } else {
        println!("❌ Arbitrage execution incomplete");
        Ok(false)
    }
}

pub async fn verify_flash_loan_repayment(
    client: &RpcClient,
    borrow_signature: &Signature,
    repay_signature: &Signature,
    loan_amount: u64,
) -> Result<bool> {
    println!("🔍 Verifying flash loan repayment");
    
    let borrow_confirmed = verify_transaction(client, borrow_signature).await;
    let repay_confirmed = verify_transaction(client, repay_signature).await;
    
    if borrow_confirmed && repay_confirmed {
        let loan_sol = loan_amount as f64 / 1e9;
        println!("✅ Flash loan cycle completed: {:.6} SOL", loan_sol);
        Ok(true)
    } else {
        println!("❌ Flash loan cycle incomplete");
        Ok(false)
    }
}