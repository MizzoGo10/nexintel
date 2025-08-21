import { 
  agents, projects, messages, activities, tasks,
  type Agent, type InsertAgent,
  type Project, type InsertProject,
  type Message, type InsertMessage,
  type Activity, type InsertActivity,
  type Task, type InsertTask
} from "@shared/schema";
import { eq, desc, isNull } from "drizzle-orm";
import { db } from "./db";
import { nanoid } from "nanoid";

export interface IStorage {
  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined>;
  
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByRecipient(recipientId: string | null): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Activities
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByAgent(agentId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  logActivity(activity: any): Promise<void>;
  
  // Tasks
  getTasksByProject(projectId: string): Promise<Task[]>;
  getTasksByAgent(agentId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializePabloEcosystem();
  }

  private async initializePabloEcosystem() {
    try {
      const existingAgents = await this.getAllAgents();
      if (existingAgents.length === 0) {
        // Create Pablo and his agent ecosystem
        await this.createAgent({
          id: 'pablo-ai',
          name: 'Pablo',
          type: 'Soul Architect',
          status: 'active',
          skills: ['personality_design', 'nft_creation', 'dashboard_building', 'relationship_management'],
          metrics: {
            successRate: 95,
            tasksCompleted: 247,
            efficiency: 98
          },
          description: 'Advanced AI agent specializing in soul architecture and personality design using ElizaOS framework'
        });

        await this.createAgent({
          id: 'quantum-analyzer',
          name: 'Quantum Analyzer',
          type: 'Analysis',
          status: 'active',
          skills: ['pattern_recognition', 'quantum_analysis', 'data_processing'],
          metrics: {
            successRate: 87,
            tasksCompleted: 156,
            efficiency: 89
          },
          description: 'Quantum-powered analysis agent for pattern recognition and data insights'
        });

        await this.createAgent({
          id: 'mev-hunter',
          name: 'MEV Hunter',
          type: 'MEV',
          status: 'active',
          skills: ['value_extraction', 'arbitrage', 'blockchain_analysis'],
          metrics: {
            successRate: 92,
            tasksCompleted: 89,
            efficiency: 94
          },
          description: 'Specialized MEV extraction agent with advanced arbitrage capabilities'
        });

        // Create initial activities
        await this.createActivity({
          id: nanoid(),
          agentId: 'pablo-ai',
          type: 'soul_creation',
          description: 'Created new agent personality matrix using ElizaOS framework',
          status: 'completed',
          timestamp: new Date()
        });

        await this.createActivity({
          id: nanoid(),
          agentId: 'quantum-analyzer',
          type: 'analysis',
          description: 'Completed quantum pattern analysis on trading data',
          status: 'completed',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.log('Pablo ecosystem initialization skipped - database not ready');
    }
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAllAgents(): Promise<Agent[]> {
    return db.select().from(agents);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db
      .insert(agents)
      .values({
        ...agent,
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
      .returning();
    return newAgent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set(updates)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent || undefined;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({
        ...project,
        id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
      .returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByRecipient(recipientId: string | null): Promise<Message[]> {
    if (recipientId === null) {
      return db.select().from(messages).where(isNull(messages.recipientId));
    }
    return db.select().from(messages).where(eq(messages.recipientId, recipientId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
      .returning();
    return newMessage;
  }

  async getAllActivities(): Promise<Activity[]> {
    return db.select().from(activities).orderBy(desc(activities.timestamp));
  }

  async getActivitiesByAgent(agentId: string): Promise<Activity[]> {
    return db.select().from(activities)
      .where(eq(activities.agentId, agentId))
      .orderBy(desc(activities.timestamp));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({
        ...activity,
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
      .returning();
    return newActivity;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksByAgent(agentId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assignedAgentId, agentId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        completedAt: null,
      })
      .returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async logActivity(activity: any): Promise<void> {
    await this.createActivity({
      id: activity.id || nanoid(),
      agentId: activity.agentId,
      type: activity.type,
      description: activity.description,
      status: 'completed',
      timestamp: new Date(),
      metadata: activity.metadata
    });
  }
}

export class MemStorage implements IStorage {
  private agents: Map<string, Agent>;
  private projects: Map<string, Project>;
  private messages: Map<string, Message>;
  private activities: Map<string, Activity>;
  private tasks: Map<string, Task>;

  constructor() {
    this.agents = new Map();
    this.projects = new Map();
    this.messages = new Map();
    this.activities = new Map();
    this.tasks = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize 17 specialized agents
    const agentData: InsertAgent[] = [
      {
        id: "alpha",
        name: "Agent Alpha",
        specialty: "Branding & Marketing",
        status: "active",
        description: "Business associate specializing in branding, commercials, and product marketing strategies",
        capabilities: ["Brand Analysis", "Market Research", "Commercial Creation", "Product Positioning"]
      },
      {
        id: "beta", 
        name: "Agent Beta",
        specialty: "Financial Analysis",
        status: "working",
        description: "Monetary value assessment, financial projections, and business analysis expert",
        capabilities: ["Financial Projections", "Value Analysis", "ROI Calculations", "Market Forecasting"]
      },
      {
        id: "gamma",
        name: "Agent Gamma", 
        specialty: "Web Development",
        status: "active",
        description: "Full-stack web development with modern frameworks and technologies",
        capabilities: ["React/TypeScript", "API Development", "Database Design", "UI/UX Implementation"]
      },
      {
        id: "delta",
        name: "Agent Delta",
        specialty: "Security & Maintenance", 
        status: "active",
        description: "System security, maintenance, and infrastructure management specialist",
        capabilities: ["Security Audits", "System Monitoring", "Infrastructure Management", "Threat Detection"]
      },
      {
        id: "epsilon",
        name: "Agent Epsilon",
        specialty: "Legal & Compliance",
        status: "active", 
        description: "Legal documentation, compliance checks, and regulatory guidance",
        capabilities: ["Contract Review", "Compliance Auditing", "Legal Research", "Risk Assessment"]
      },
      {
        id: "zeta",
        name: "Agent Zeta",
        specialty: "Video Production",
        status: "working",
        description: "Video content creation, editing, and multimedia production",
        capabilities: ["Video Editing", "Motion Graphics", "Content Strategy", "Visual Storytelling"]
      },
      {
        id: "eta", 
        name: "Agent Eta",
        specialty: "Content & Copywriting",
        status: "active",
        description: "Professional copywriting, content creation, and wordsmithing",
        capabilities: ["Copywriting", "Content Strategy", "SEO Writing", "Brand Voice Development"]
      },
      {
        id: "theta",
        name: "Agent Theta", 
        specialty: "Data Management",
        status: "active",
        description: "Database management, data analysis, and information architecture",
        capabilities: ["Database Design", "Data Analysis", "ETL Processes", "Data Visualization"]
      },
      {
        id: "iota",
        name: "Agent Iota",
        specialty: "API Integration",
        status: "working",
        description: "API development, integration, and web services management",
        capabilities: ["REST APIs", "GraphQL", "Microservices", "Integration Patterns"]
      },
      {
        id: "kappa",
        name: "Agent Kappa", 
        specialty: "Smart Contracts",
        status: "active",
        description: "Blockchain development, smart contract creation, and DeFi solutions",
        capabilities: ["Solidity", "Web3 Integration", "DeFi Protocols", "Contract Auditing"]
      },
      {
        id: "lambda",
        name: "Agent Lambda",
        specialty: "Machine Learning", 
        status: "active",
        description: "AI/ML model development, training, and deployment",
        capabilities: ["Model Training", "Neural Networks", "Data Science", "AI Integration"]
      },
      {
        id: "mu",
        name: "Agent Mu (Dark Twin)",
        specialty: "Dark Research & Analysis",
        status: "active",
        description: "Advanced research methodologies and deep analytical insights",
        capabilities: ["Deep Research", "Pattern Analysis", "Competitive Intelligence", "Risk Modeling"]
      },
      {
        id: "nu", 
        name: "Agent Nu (Light Twin)",
        specialty: "Light Research & Innovation",
        status: "active",
        description: "Innovation research, creative solutions, and breakthrough technologies",
        capabilities: ["Innovation Research", "Creative Thinking", "Emerging Tech", "Solution Design"]
      },
      {
        id: "xi",
        name: "Agent Xi",
        specialty: "Fractal & Geometry",
        status: "working", 
        description: "Mathematical modeling, fractal analysis, and geometric strategies",
        capabilities: ["Fractal Mathematics", "Geometric Analysis", "Pattern Recognition", "Algorithm Design"]
      },
      {
        id: "omicron",
        name: "Agent Omicron",
        specialty: "Experimental R&D",
        status: "active",
        description: "Cutting-edge research and experimental development projects",
        capabilities: ["Research & Development", "Prototype Creation", "Innovation Testing", "Experimental Design"]
      },
      {
        id: "pi",
        name: "Agent Pi", 
        specialty: "Project Coordination",
        status: "active",
        description: "Project management, team coordination, and workflow optimization",
        capabilities: ["Project Management", "Team Coordination", "Workflow Design", "Resource Allocation"]
      },
      {
        id: "sigma",
        name: "Agent Sigma",
        specialty: "Quality Assurance",
        status: "active",
        description: "Quality control, testing, and performance optimization specialist", 
        capabilities: ["Quality Testing", "Performance Optimization", "Code Review", "Standards Compliance"]
      }
    ];

    // Create agents with default metrics
    agentData.forEach(agentInfo => {
      const agent: Agent = {
        ...agentInfo,
        status: agentInfo.status || "idle",
        avatar: agentInfo.avatar || null,
        description: agentInfo.description || null,
        capabilities: agentInfo.capabilities || [],
        lastActive: new Date(),
        metrics: {
          tasksCompleted: Math.floor(Math.random() * 50) + 10,
          successRate: Math.floor(Math.random() * 20) + 80,
          avgResponseTime: Math.floor(Math.random() * 5) + 1
        }
      };
      this.agents.set(agent.id, agent);
    });

    // Initialize sample projects
    const projectData: (InsertProject & { id: string })[] = [
      {
        id: "proj1",
        name: "NextGen E-Commerce Platform",
        description: "Full-stack development with AI integration",
        status: "active",
        progress: 75,
        assignedAgents: ["gamma", "lambda", "theta"],
        priority: "high"
      },
      {
        id: "proj2", 
        name: "Brand Identity Overhaul",
        description: "Complete rebranding with video assets",
        status: "active",
        progress: 45,
        assignedAgents: ["alpha", "zeta"],
        priority: "medium"
      },
      {
        id: "proj3",
        name: "Smart Contract Audit",
        description: "Security analysis and optimization",
        status: "active", 
        progress: 90,
        assignedAgents: ["kappa", "delta", "sigma", "epsilon"],
        priority: "high"
      }
    ];

    projectData.forEach(project => {
      this.projects.set(project.id, {
        ...project,
        status: project.status || "active",
        progress: project.progress || 0,
        assignedAgents: project.assignedAgents || [],
        priority: project.priority || "medium",
        dueDate: project.dueDate || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Initialize sample activities
    const activityData: (InsertActivity & { id: string })[] = [
      {
        id: "act1",
        agentId: "alpha",
        type: "completed_task",
        description: "Agent Alpha completed brand analysis for Project Phoenix",
        projectId: "proj2"
      },
      {
        id: "act2",
        agentId: "gamma", 
        type: "deployment",
        description: "Agent Gamma deployed API endpoints for user authentication",
        projectId: "proj1"
      },
      {
        id: "act3",
        agentId: "delta",
        type: "security_alert",
        description: "Agent Delta identified security vulnerability in payment module",
        projectId: "proj1"
      },
      {
        id: "act4",
        agentId: "lambda",
        type: "training_complete", 
        description: "Agent Lambda completed ML model training (94.2% accuracy)",
        projectId: "proj1"
      },
      {
        id: "act5",
        agentId: "zeta",
        type: "content_creation",
        description: "Agent Zeta finished video production for marketing campaign",
        projectId: "proj2"
      }
    ];

    activityData.forEach(activity => {
      this.activities.set(activity.id, {
        ...activity,
        timestamp: new Date(Date.now() - Math.random() * 900000), // Random time in last 15 minutes
        metadata: {}
      });
    });
  }

  // Agent methods
  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const newAgent: Agent = {
      ...agent,
      lastActive: new Date(),
      metrics: agent.metrics || { tasksCompleted: 0, successRate: 0, avgResponseTime: 0 }
    };
    this.agents.set(newAgent.id, newAgent);
    return newAgent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates, lastActive: new Date() };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = nanoid();
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByRecipient(recipientId: string | null): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.recipientId === recipientId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = nanoid();
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getActivitiesByAgent(agentId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = nanoid();
    const newActivity: Activity = {
      ...activity,
      id,
      timestamp: new Date(),
      metadata: activity.metadata || {}
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Task methods
  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId);
  }

  async getTasksByAgent(agentId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.assignedAgentId === agentId);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = nanoid();
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date()
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    if (updates.status === "completed") {
      updatedTask.completedAt = new Date();
    }
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async logActivity(activity: any): Promise<void> {
    await this.createActivity({
      agentId: activity.agentId,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata || {}
    });
  }
}

export const storage = new MemStorage();
