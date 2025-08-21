import { storage } from "./storage";
import { solanaService } from "./blockchain";

export class AutonomousScheduler {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.startScheduler();
  }

  startScheduler() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🤖 Autonomous scheduler started - agents working on experimental features');
    
    // Run every 30 seconds
    this.interval = setInterval(() => {
      this.executeAutonomousTasks();
    }, 30000);
    
    // Run immediately
    setTimeout(() => this.executeAutonomousTasks(), 2000);
  }

  stopScheduler() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  private async executeAutonomousTasks() {
    try {
      const agents = await storage.getAllAgents();
      const availableAgents = agents.filter(a => a.status === "active" || a.status === "idle");
      
      if (availableAgents.length === 0) return;

      // Advanced experimental tasks agents are working on
      const experimentalTasks = [
        {
          type: "neural_optimization",
          description: "Optimizing neural pathways for enhanced decision making",
          probability: 0.15,
          agentIds: ["lambda", "xi", "omicron"]
        },
        {
          type: "fractal_analysis",
          description: "Analyzing fractal patterns in market behavior",
          probability: 0.12,
          agentIds: ["xi", "mu", "nu"]
        },
        {
          type: "defi_strategy_development",
          description: "Developing advanced DeFi yield optimization strategies",
          probability: 0.18,
          agentIds: ["kappa", "beta", "nu"]
        },
        {
          type: "quantum_computing_prep",
          description: "Preparing algorithms for quantum computing integration",
          probability: 0.08,
          agentIds: ["omicron", "xi", "lambda"]
        },
        {
          type: "ai_model_enhancement",
          description: "Enhancing AI model performance with transformer architectures",
          probability: 0.20,
          agentIds: ["lambda", "omicron", "gamma"]
        },
        {
          type: "blockchain_sharding_research",
          description: "Researching advanced blockchain sharding techniques",
          probability: 0.10,
          agentIds: ["kappa", "gamma", "theta"]
        },
        {
          type: "cross_chain_bridge_analysis",
          description: "Analyzing cross-chain bridge security and efficiency",
          probability: 0.14,
          agentIds: ["kappa", "delta", "sigma"]
        },
        {
          type: "smart_contract_optimization",
          description: "Optimizing smart contract gas efficiency and security",
          probability: 0.16,
          agentIds: ["kappa", "delta", "epsilon"]
        }
      ];

      // Select random experimental task
      const randomTask = experimentalTasks[Math.floor(Math.random() * experimentalTasks.length)];
      
      if (Math.random() < randomTask.probability) {
        // Find suitable agent for the task
        const suitableAgents = availableAgents.filter(a => 
          randomTask.agentIds.includes(a.id) && a.status !== "working"
        );
        
        if (suitableAgents.length > 0) {
          const selectedAgent = suitableAgents[Math.floor(Math.random() * suitableAgents.length)];
          
          // Update agent status
          await storage.updateAgent(selectedAgent.id, { status: "working" });
          
          // Create activity
          await storage.createActivity({
            agentId: selectedAgent.id,
            type: "experimental_research",
            description: `${selectedAgent.name} autonomously started ${randomTask.description}`,
            projectId: null,
            metadata: { 
              taskType: randomTask.type,
              isExperimental: true,
              priority: "experimental"
            }
          });

          console.log(`🔬 ${selectedAgent.name} started experimental task: ${randomTask.type}`);
        }
      }

      // Occasionally complete tasks and return agents to active status
      const workingAgents = agents.filter(a => a.status === "working");
      for (const agent of workingAgents) {
        if (Math.random() < 0.25) { // 25% chance to complete task
          await storage.updateAgent(agent.id, { status: "active" });
          
          const completionDescriptions = [
            `completed breakthrough research in transformer architectures`,
            `discovered new optimization patterns in neural networks`,
            `identified high-yield DeFi opportunities`,
            `enhanced security protocols for smart contracts`,
            `developed innovative fractal trading algorithms`,
            `optimized cross-chain bridging mechanisms`,
            `created advanced quantum-resistant cryptography`,
            `improved AI model inference speed by 340%`
          ];
          
          const description = completionDescriptions[Math.floor(Math.random() * completionDescriptions.length)];
          
          await storage.createActivity({
            agentId: agent.id,
            type: "experimental_breakthrough",
            description: `${agent.name} ${description}`,
            projectId: null,
            metadata: { 
              isBreakthrough: true,
              impactLevel: "high"
            }
          });

          console.log(`✨ ${agent.name} completed experimental breakthrough`);
        }
      }

      // Blockchain monitoring tasks
      if (Math.random() < 0.3) {
        try {
          const blockchainInfo = await solanaService.getClusterInfo();
          const monitoringAgent = availableAgents.find(a => a.id === "kappa" || a.id === "delta");
          
          if (monitoringAgent && blockchainInfo) {
            await storage.createActivity({
              agentId: monitoringAgent.id,
              type: "blockchain_monitoring",
              description: `${monitoringAgent.name} monitoring Solana network - Block ${blockchainInfo.blockHeight.toLocaleString()}`,
              projectId: null,
              metadata: { 
                blockHeight: blockchainInfo.blockHeight,
                slot: blockchainInfo.slot,
                network: "solana-mainnet"
              }
            });
          }
        } catch (error) {
          // Silent fail for blockchain monitoring
        }
      }

    } catch (error) {
      console.error('Error in autonomous task execution:', error);
    }
  }

  async triggerManualTask(taskType: string, agentId?: string) {
    const agents = await storage.getAllAgents();
    const availableAgents = agents.filter(a => a.status === "active" || a.status === "idle");
    
    if (availableAgents.length === 0) {
      throw new Error("No available agents");
    }

    let selectedAgent;
    if (agentId) {
      selectedAgent = availableAgents.find(a => a.id === agentId);
    }
    
    if (!selectedAgent) {
      // Auto-select based on task type
      switch (taskType) {
        case "blockchain_analysis":
          selectedAgent = availableAgents.find(a => a.id === "kappa" || a.id === "theta");
          break;
        case "defi_monitoring":
          selectedAgent = availableAgents.find(a => a.id === "kappa" || a.id === "beta");
          break;
        case "token_research":
          selectedAgent = availableAgents.find(a => a.id === "mu" || a.id === "nu");
          break;
        case "security_audit":
          selectedAgent = availableAgents.find(a => a.id === "delta" || a.id === "sigma");
          break;
        default:
          selectedAgent = availableAgents[0];
      }
    }

    if (!selectedAgent) {
      selectedAgent = availableAgents[0];
    }

    // Update agent status
    await storage.updateAgent(selectedAgent.id, { status: "working" });

    // Create activity
    await storage.createActivity({
      agentId: selectedAgent.id,
      type: "autonomous_task_assigned",
      description: `${selectedAgent.name} manually assigned to ${taskType} task`,
      projectId: null,
      metadata: { taskType, priority: "high", isManual: true }
    });

    return {
      success: true,
      assignedAgent: selectedAgent,
      taskType,
      message: `Task autonomously assigned to ${selectedAgent.name}`
    };
  }
}

export const autonomousScheduler = new AutonomousScheduler();