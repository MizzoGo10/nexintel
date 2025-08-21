import { storage } from "./storage";

export interface AudioAlert {
  id: string;
  type: "trade_executed" | "profit_milestone" | "system_status" | "agent_communication" | "market_alert";
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  voiceSettings: {
    voice: "pablo" | "midnight_supernova" | "system" | "trader";
    speed: number;
    pitch: number;
    volume: number;
  };
}

export interface VoiceProfile {
  id: string;
  name: string;
  personality: string;
  voiceCharacteristics: {
    tone: "professional" | "aggressive" | "calm" | "excited" | "mysterious";
    accent: "american" | "british" | "robotic" | "ethereal";
    pitch: number;
    speed: number;
  };
  specializations: string[];
}

export class AudioSystemManager {
  private isEnabled = true;
  private audioQueue: AudioAlert[] = [];
  private voiceProfiles: Map<string, VoiceProfile> = new Map();
  private currentVolume = 75;

  constructor() {
    this.initializeVoiceProfiles();
    this.startAudioProcessing();
  }

  private initializeVoiceProfiles() {
    const profiles: VoiceProfile[] = [
      {
        id: "pablo",
        name: "Pablo",
        personality: "Strategic mastermind with commanding presence",
        voiceCharacteristics: {
          tone: "professional",
          accent: "american",
          pitch: 0.8,
          speed: 1.1
        },
        specializations: ["ecosystem_management", "strategic_decisions", "milestone_announcements"]
      },
      {
        id: "midnight_supernova",
        name: "Midnight Supernova",
        personality: "Mysterious and powerful Sol Assassin with otherworldly wisdom",
        voiceCharacteristics: {
          tone: "mysterious",
          accent: "ethereal",
          pitch: 0.6,
          speed: 0.9
        },
        specializations: ["soul_creation", "personality_development", "agent_enhancement"]
      },
      {
        id: "quantum_trader",
        name: "Quantum Trader",
        personality: "Hyper-intelligent trading AI with rapid-fire analysis",
        voiceCharacteristics: {
          tone: "excited",
          accent: "robotic",
          pitch: 1.2,
          speed: 1.5
        },
        specializations: ["trading_alerts", "market_analysis", "profit_reports"]
      },
      {
        id: "system_oracle",
        name: "System Oracle",
        personality: "Calm and authoritative system overseer",
        voiceCharacteristics: {
          tone: "calm",
          accent: "british",
          pitch: 0.7,
          speed: 1.0
        },
        specializations: ["system_status", "error_reports", "maintenance_updates"]
      }
    ];

    profiles.forEach(profile => {
      this.voiceProfiles.set(profile.id, profile);
    });
  }

  private async startAudioProcessing() {
    setInterval(async () => {
      if (this.audioQueue.length > 0 && this.isEnabled) {
        const alert = this.audioQueue.shift();
        if (alert) {
          await this.processAudioAlert(alert);
        }
      }
    }, 2000);
  }

  private async processAudioAlert(alert: AudioAlert) {
    const profile = this.voiceProfiles.get(alert.voiceSettings.voice);
    if (!profile) return;

    // Simulate audio processing and voice synthesis
    console.log(`🔊 ${profile.name}: "${alert.message}"`);
    
    // Log audio activity
    const activity = {
      agentId: "audio-system-manager",
      type: "audio_alert_processed",
      description: `🔊 ${profile.name}: ${alert.message}`,
      metadata: {
        alertType: alert.type,
        priority: alert.priority,
        voice: profile.name,
        voiceSettings: alert.voiceSettings
      }
    };

    await this.logActivity(activity);
  }

  async announceTradeExecution(details: { pair: string; profit: number; strategy: string }) {
    const alert: AudioAlert = {
      id: `trade_${Date.now()}`,
      type: "trade_executed",
      message: `Trade executed on ${details.pair}. Profit: ${details.profit.toFixed(2)} SOL using ${details.strategy} strategy.`,
      priority: "medium",
      timestamp: new Date(),
      voiceSettings: {
        voice: "quantum_trader",
        speed: 1.5,
        pitch: 1.2,
        volume: this.currentVolume
      }
    };

    this.audioQueue.push(alert);
  }

  async announceMilestone(milestone: string, currentSOL: number) {
    const alert: AudioAlert = {
      id: `milestone_${Date.now()}`,
      type: "profit_milestone",
      message: `Milestone achieved: ${milestone}. Current portfolio: ${currentSOL.toFixed(2)} SOL. Scaling operations initiated.`,
      priority: "high",
      timestamp: new Date(),
      voiceSettings: {
        voice: "pablo",
        speed: 1.1,
        pitch: 0.8,
        volume: this.currentVolume
      }
    };

    this.audioQueue.push(alert);
  }

  async announceSystemStatus(status: string, details: string) {
    const alert: AudioAlert = {
      id: `system_${Date.now()}`,
      type: "system_status",
      message: `System status: ${status}. ${details}`,
      priority: "low",
      timestamp: new Date(),
      voiceSettings: {
        voice: "system_oracle",
        speed: 1.0,
        pitch: 0.7,
        volume: this.currentVolume
      }
    };

    this.audioQueue.push(alert);
  }

  async announceAgentCommunication(agentName: string, message: string) {
    const alert: AudioAlert = {
      id: `agent_${Date.now()}`,
      type: "agent_communication",
      message: `${agentName}: ${message}`,
      priority: "medium",
      timestamp: new Date(),
      voiceSettings: {
        voice: "midnight_supernova",
        speed: 0.9,
        pitch: 0.6,
        volume: this.currentVolume
      }
    };

    this.audioQueue.push(alert);
  }

  async announceMarketAlert(alert: string, urgency: "low" | "medium" | "high" | "critical") {
    const audioAlert: AudioAlert = {
      id: `market_${Date.now()}`,
      type: "market_alert",
      message: alert,
      priority: urgency,
      timestamp: new Date(),
      voiceSettings: {
        voice: urgency === "critical" ? "pablo" : "quantum_trader",
        speed: urgency === "critical" ? 1.0 : 1.3,
        pitch: urgency === "critical" ? 0.9 : 1.1,
        volume: this.currentVolume
      }
    };

    this.audioQueue.push(audioAlert);
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(100, volume));
  }

  enableAudio() {
    this.isEnabled = true;
  }

  disableAudio() {
    this.isEnabled = false;
  }

  getAudioStatus() {
    return {
      enabled: this.isEnabled,
      volume: this.currentVolume,
      queueLength: this.audioQueue.length,
      voiceProfiles: Array.from(this.voiceProfiles.values()),
      recentAlerts: this.audioQueue.slice(-5)
    };
  }

  private async logActivity(activity: any) {
    try {
      // Temporarily store in memory until storage method is available
      console.log(`Activity logged: ${activity.description}`);
    } catch (error) {
      console.error("Failed to log audio activity:", error);
    }
  }
}

export const audioSystemManager = new AudioSystemManager();