use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use solana_client::rpc_client::RpcClient;
use reqwest::Client;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};
use crate::SolanaConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RPCEndpoint {
    pub id: String,
    pub name: String,
    pub url: String,
    pub ws_url: Option<String>,
    pub tier: String,
    pub rate_limit: u32,
    pub current_usage: u32,
    pub is_active: bool,
    pub features: Vec<String>,
    pub latency_ms: f64,
    pub success_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriceData {
    pub token: String,
    pub price: f64,
    pub volume_24h: f64,
    pub liquidity: f64,
    pub source: String,
    pub timestamp: u64,
}

pub struct RPCManager {
    pub endpoints: HashMap<String, RPCEndpoint>,
    pub rpc_clients: HashMap<String, RpcClient>,
    pub http_client: Client,
    pub price_cache: HashMap<String, PriceData>,
    pub load_balancer_index: usize,
}

impl RPCManager {
    pub async fn new(config: &SolanaConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let mut manager = Self {
            endpoints: HashMap::new(),
            rpc_clients: HashMap::new(),
            http_client: Client::new(),
            price_cache: HashMap::new(),
            load_balancer_index: 0,
        };

        manager.initialize_endpoints(config).await?;
        manager.test_all_connections().await?;
        manager.start_price_monitoring().await?;

        Ok(manager)
    }

    async fn initialize_endpoints(&mut self, config: &SolanaConfig) -> Result<(), Box<dyn std::error::Error>> {
        let endpoints = vec![
            RPCEndpoint {
                id: "quicknode_premium".to_string(),
                name: "QuickNode Premium".to_string(),
                url: config.quicknode_url.clone(),
                ws_url: Some(config.quicknode_ws.clone()),
                tier: "premium".to_string(),
                rate_limit: 1000,
                current_usage: 0,
                is_active: true,
                features: vec![
                    "jupiter".to_string(),
                    "bundles".to_string(),
                    "priority_fees".to_string(),
                    "websockets".to_string(),
                ],
                latency_ms: 0.0,
                success_rate: 100.0,
            },
            RPCEndpoint {
                id: "syndica_premium".to_string(),
                name: "Syndica Premium".to_string(),
                url: config.syndica_url.clone(),
                ws_url: Some(config.syndica_ws.clone()),
                tier: "premium".to_string(),
                rate_limit: 2000,
                current_usage: 0,
                is_active: true,
                features: vec![
                    "bundles".to_string(),
                    "priority_fees".to_string(),
                    "mev_protection".to_string(),
                ],
                latency_ms: 0.0,
                success_rate: 100.0,
            },
            RPCEndpoint {
                id: "helius_free".to_string(),
                name: "Helius Free".to_string(),
                url: config.helius_url.clone(),
                ws_url: Some(config.helius_ws.clone()),
                tier: "free".to_string(),
                rate_limit: 300,
                current_usage: 0,
                is_active: true,
                features: vec![
                    "websockets".to_string(),
                    "account_monitoring".to_string(),
                ],
                latency_ms: 0.0,
                success_rate: 100.0,
            },
            RPCEndpoint {
                id: "alchemy_free".to_string(),
                name: "Alchemy Free".to_string(),
                url: config.alchemy_url.clone(),
                ws_url: None,
                tier: "free".to_string(),
                rate_limit: 200,
                current_usage: 0,
                is_active: true,
                features: vec![
                    "enhanced_apis".to_string(),
                    "nft_data".to_string(),
                ],
                latency_ms: 0.0,
                success_rate: 100.0,
            },
        ];

        for endpoint in endpoints {
            let client = RpcClient::new(endpoint.url.clone());
            self.rpc_clients.insert(endpoint.id.clone(), client);
            self.endpoints.insert(endpoint.id.clone(), endpoint);
        }

        println!("🔗 Initialized {} RPC endpoints", self.endpoints.len());
        Ok(())
    }

    async fn test_all_connections(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        for (endpoint_id, endpoint) in &mut self.endpoints {
            let start_time = std::time::Instant::now();
            
            if let Some(client) = self.rpc_clients.get(endpoint_id) {
                match client.get_version() {
                    Ok(_) => {
                        endpoint.latency_ms = start_time.elapsed().as_millis() as f64;
                        endpoint.is_active = true;
                        endpoint.success_rate = 100.0;
                        println!("✅ {} connected - latency: {:.1}ms", endpoint.name, endpoint.latency_ms);
                    },
                    Err(_) => {
                        endpoint.is_active = false;
                        endpoint.success_rate = 0.0;
                        println!("❌ {} connection failed", endpoint.name);
                    }
                }
            }
        }

        Ok(())
    }

    async fn start_price_monitoring(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Initialize price cache with major Solana tokens
        let token_prices = vec![
            ("SOL", 95.42, 1200000000.0, 85000000.0),
            ("USDC", 1.0, 800000000.0, 2000000000.0),
            ("USDT", 1.0, 600000000.0, 1500000000.0),
            ("RAY", 0.89, 45000000.0, 120000000.0),
            ("ORCA", 0.52, 23000000.0, 67000000.0),
            ("MNGO", 0.034, 12000000.0, 34000000.0),
            ("SRM", 0.24, 8000000.0, 25000000.0),
            ("FIDA", 0.18, 5000000.0, 15000000.0),
        ];

        for (token, price, volume, liquidity) in token_prices {
            let price_data = PriceData {
                token: token.to_string(),
                price,
                volume_24h: volume,
                liquidity,
                source: "initialization".to_string(),
                timestamp: chrono::Utc::now().timestamp() as u64,
            };
            self.price_cache.insert(token.to_string(), price_data);
        }

        println!("📊 Price monitoring initialized for {} tokens", self.price_cache.len());
        Ok(())
    }

    pub async fn get_best_endpoint(&mut self) -> Option<String> {
        let active_endpoints: Vec<_> = self.endpoints
            .iter()
            .filter(|(_, endpoint)| endpoint.is_active && endpoint.current_usage < endpoint.rate_limit)
            .collect();

        if active_endpoints.is_empty() {
            return None;
        }

        // Load balancing: prefer premium endpoints with low latency
        let best_endpoint = active_endpoints
            .iter()
            .min_by(|(_, a), (_, b)| {
                let a_score = a.latency_ms + if a.tier == "premium" { 0.0 } else { 100.0 };
                let b_score = b.latency_ms + if b.tier == "premium" { 0.0 } else { 100.0 };
                a_score.partial_cmp(&b_score).unwrap()
            });

        best_endpoint.map(|(id, _)| id.to_string())
    }

    pub async fn make_rpc_call(&mut self, method: &str, params: serde_json::Value) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        if let Some(endpoint_id) = self.get_best_endpoint().await {
            if let Some(endpoint) = self.endpoints.get_mut(&endpoint_id) {
                endpoint.current_usage += 1;
                
                let result = self.execute_rpc_call(&endpoint_id, method, params).await;
                
                // Update usage after call
                endpoint.current_usage = endpoint.current_usage.saturating_sub(1);
                
                result
            } else {
                Err("No endpoint available".into())
            }
        } else {
            Err("No active endpoints".into())
        }
    }

    async fn execute_rpc_call(&self, endpoint_id: &str, method: &str, params: serde_json::Value) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        if let Some(endpoint) = self.endpoints.get(endpoint_id) {
            let payload = serde_json::json!({
                "jsonrpc": "2.0",
                "id": 1,
                "method": method,
                "params": params
            });

            let response = self.http_client
                .post(&endpoint.url)
                .json(&payload)
                .send()
                .await?;

            let result: serde_json::Value = response.json().await?;
            Ok(result)
        } else {
            Err("Endpoint not found".into())
        }
    }

    pub async fn update_price_cache(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Update prices from Jupiter API through QuickNode
        let tokens = vec!["SOL", "USDC", "RAY", "ORCA", "MNGO"];
        
        for token in tokens {
            if let Ok(price_data) = self.fetch_jupiter_price(token).await {
                self.price_cache.insert(token.to_string(), price_data);
            }
        }

        Ok(())
    }

    async fn fetch_jupiter_price(&self, token: &str) -> Result<PriceData, Box<dyn std::error::Error>> {
        let url = format!("https://price.jup.ag/v4/price?ids={}", token);
        
        let response = self.http_client
            .get(&url)
            .send()
            .await?;

        let data: serde_json::Value = response.json().await?;
        
        if let Some(price_info) = data["data"][token].as_object() {
            Ok(PriceData {
                token: token.to_string(),
                price: price_info["price"].as_f64().unwrap_or(0.0),
                volume_24h: price_info["volume24h"].as_f64().unwrap_or(0.0),
                liquidity: price_info["liquidity"].as_f64().unwrap_or(0.0),
                source: "jupiter".to_string(),
                timestamp: chrono::Utc::now().timestamp() as u64,
            })
        } else {
            Err("Invalid price data format".into())
        }
    }

    pub fn get_price(&self, token: &str) -> Option<&PriceData> {
        self.price_cache.get(token)
    }

    pub async fn monitor_mempool(&self, callback: impl Fn(serde_json::Value)) -> Result<(), Box<dyn std::error::Error>> {
        // Find an endpoint with WebSocket support
        let ws_endpoint = self.endpoints
            .values()
            .find(|e| e.ws_url.is_some() && e.is_active);

        if let Some(endpoint) = ws_endpoint {
            if let Some(ws_url) = &endpoint.ws_url {
                let (ws_stream, _) = connect_async(ws_url).await?;
                let (mut ws_sender, mut ws_receiver) = ws_stream.split();

                // Subscribe to mempool updates
                let subscribe_msg = serde_json::json!({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "logsSubscribe",
                    "params": ["all"]
                });

                ws_sender.send(Message::Text(subscribe_msg.to_string())).await?;

                // Process incoming messages
                while let Some(msg) = ws_receiver.next().await {
                    if let Ok(Message::Text(text)) = msg {
                        if let Ok(data) = serde_json::from_str::<serde_json::Value>(&text) {
                            callback(data);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    pub fn get_endpoint_status(&self) -> HashMap<String, serde_json::Value> {
        let mut status = HashMap::new();
        
        for (id, endpoint) in &self.endpoints {
            status.insert(id.clone(), serde_json::json!({
                "name": endpoint.name,
                "tier": endpoint.tier,
                "active": endpoint.is_active,
                "latency": endpoint.latency_ms,
                "usage": format!("{}/{}", endpoint.current_usage, endpoint.rate_limit),
                "successRate": endpoint.success_rate,
                "features": endpoint.features
            }));
        }

        status
    }

    pub fn get_system_health(&self) -> serde_json::Value {
        let active_endpoints = self.endpoints.values().filter(|e| e.is_active).count();
        let total_endpoints = self.endpoints.len();
        let average_latency = self.endpoints.values()
            .filter(|e| e.is_active)
            .map(|e| e.latency_ms)
            .sum::<f64>() / active_endpoints.max(1) as f64;

        serde_json::json!({
            "healthScore": (active_endpoints as f64 / total_endpoints as f64) * 100.0,
            "activeEndpoints": active_endpoints,
            "totalEndpoints": total_endpoints,
            "averageLatency": average_latency,
            "cacheSize": self.price_cache.len()
        })
    }

    pub async fn benchmark_endpoints(&mut self) -> Result<HashMap<String, f64>, Box<dyn std::error::Error>> {
        let mut benchmarks = HashMap::new();
        
        for (endpoint_id, endpoint) in &mut self.endpoints {
            if !endpoint.is_active {
                continue;
            }

            let start_time = std::time::Instant::now();
            
            // Test with getVersion call
            if let Some(client) = self.rpc_clients.get(endpoint_id) {
                match client.get_version() {
                    Ok(_) => {
                        let latency = start_time.elapsed().as_millis() as f64;
                        endpoint.latency_ms = latency;
                        benchmarks.insert(endpoint_id.clone(), latency);
                    },
                    Err(_) => {
                        endpoint.is_active = false;
                        benchmarks.insert(endpoint_id.clone(), -1.0);
                    }
                }
            }

            // Small delay between tests
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }

        Ok(benchmarks)
    }
}