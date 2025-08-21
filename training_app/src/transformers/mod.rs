pub mod hybrid_lstm_quantum;
pub mod temporal_signal_generator;
pub mod chaos_modeling_engine;
pub mod golden_ratio_analyst;

pub use hybrid_lstm_quantum::HybridLSTMQuantum;
pub use temporal_signal_generator::TemporalSignalGenerator;
pub use chaos_modeling_engine::ChaosModelingEngine;
pub use golden_ratio_analyst::GoldenRatioAnalyst;

use std::collections::HashMap;
use anyhow::Result;

#[derive(Debug, Clone)]
pub struct TransformerMetrics {
    pub accuracy: f64,
    pub training_epochs: u32,
    pub last_update: u64,
    pub profit_contribution: f64,
    pub quantum_coherence: f64,
}

pub struct TransformerOrchestrator {
    pub models: HashMap<String, Box<dyn TransformerModel>>,
    pub metrics: HashMap<String, TransformerMetrics>,
    pub active_training: bool,
}

pub trait TransformerModel {
    fn train(&mut self, dataset: &[Vec<f32>]) -> Result<()>;
    fn predict(&self, input: &[f32]) -> Vec<f32>;
    fn get_accuracy(&self) -> f64;
    fn get_model_name(&self) -> String;
    fn export_weights(&self) -> HashMap<String, Vec<f32>>;
}

impl TransformerOrchestrator {
    pub fn new() -> Self {
        TransformerOrchestrator {
            models: HashMap::new(),
            metrics: HashMap::new(),
            active_training: false,
        }
    }

    pub fn register_model(&mut self, name: String, model: Box<dyn TransformerModel>) {
        let metrics = TransformerMetrics {
            accuracy: 0.0,
            training_epochs: 0,
            last_update: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            profit_contribution: 0.0,
            quantum_coherence: 0.0,
        };
        
        self.models.insert(name.clone(), model);
        self.metrics.insert(name, metrics);
    }

    pub async fn train_all_models(&mut self, dataset: &[Vec<f32>]) -> Result<()> {
        self.active_training = true;
        
        for (name, model) in &mut self.models {
            println!("Training transformer: {}", name);
            model.train(dataset)?;
            
            if let Some(metrics) = self.metrics.get_mut(name) {
                metrics.accuracy = model.get_accuracy();
                metrics.training_epochs += 1;
                metrics.last_update = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs();
            }
        }
        
        self.active_training = false;
        Ok(())
    }

    pub fn get_training_report(&self) -> TrainingReport {
        let total_models = self.models.len();
        let avg_accuracy = if total_models > 0 {
            self.metrics.values().map(|m| m.accuracy).sum::<f64>() / total_models as f64
        } else {
            0.0
        };
        
        let total_epochs: u32 = self.metrics.values().map(|m| m.training_epochs).sum();
        
        TrainingReport {
            total_models,
            average_accuracy: avg_accuracy,
            total_training_epochs: total_epochs,
            active_training: self.active_training,
            models: self.metrics.clone(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TrainingReport {
    pub total_models: usize,
    pub average_accuracy: f64,
    pub total_training_epochs: u32,
    pub active_training: bool,
    pub models: HashMap<String, TransformerMetrics>,
}