import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  status: text("status").notNull().default("idle"), // active, working, idle
  avatar: text("avatar"),
  description: text("description"),
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  lastActive: timestamp("last_active").defaultNow(),
  metrics: jsonb("metrics").$type<{
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
    efficiency?: number;
  }>().default({ tasksCompleted: 0, successRate: 0, avgResponseTime: 0 }),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"), // active, completed, paused
  progress: integer("progress").default(0), // 0-100
  assignedAgents: jsonb("assigned_agents").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  priority: text("priority").default("medium"), // low, medium, high
  dueDate: timestamp("due_date"),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(), // agent id or 'user'
  recipientId: text("recipient_id"), // agent id, null for broadcast
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  messageType: text("message_type").default("text"), // text, system, notification
  projectId: text("project_id"),
});

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  type: text("type").notNull(), // completed_task, started_project, sent_message, etc.
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  projectId: text("project_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  assignedAgentId: text("assigned_agent_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, in_progress, completed, failed
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  estimatedDuration: integer("estimated_duration"), // in minutes
});

// Dark Matter Engines
export const darkMatterEngines = pgTable("dark_matter_engines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // chaos, golden_ratio, quantum_fractal, dark_flow, void_resonance
  description: text("description").notNull(),
  isActive: boolean("is_active").default(false),
  powerLevel: integer("power_level").default(0), // 0-100
  mathematics: jsonb("mathematics").$type<{
    primaryEquation: string;
    quantumField: string;
    fractalDimension: number;
    chaosParameter: number;
  }>().notNull(),
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  riskLevel: text("risk_level").notNull(), // contained, experimental, reality_bending
  createdBy: text("created_by").notNull(),
  lastActivation: timestamp("last_activation"),
  performanceMetrics: jsonb("performance_metrics").$type<{
    consistencyRate: number;
    profitExtraction: number;
    marketDistortion: number;
    temporalAccuracy: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Unstoppable Strategies
export const unstoppableStrategies = pgTable("unstoppable_strategies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  engines: jsonb("engines").$type<string[]>().default([]), // DarkMatterEngine IDs
  isDeployed: boolean("is_deployed").default(false),
  consistencyScore: integer("consistency_score").default(0), // 0-100
  extractionRate: real("extraction_rate").default(0), // profit per hour
  adaptabilityIndex: integer("adaptability_index").default(0),
  immunityFactors: jsonb("immunity_factors").$type<string[]>().default([]),
  failsafes: jsonb("failsafes").$type<string[]>().default([]),
  marketConditions: text("market_conditions").notNull(), // bull, bear, sideways, chaos, all
  createdAt: timestamp("created_at").defaultNow(),
  lastOptimization: timestamp("last_optimization").defaultNow(),
});

// Custom Price Feeds
export const customPriceFeeds = pgTable("custom_price_feeds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sources: jsonb("sources").$type<string[]>().default([]),
  aggregationMethod: text("aggregation_method").notNull(), // weighted_average, median, quantum_consensus, dark_matter_resonance
  updateFrequency: integer("update_frequency").notNull(), // milliseconds
  accuracy: real("accuracy").notNull(), // percentage
  latency: integer("latency").notNull(), // milliseconds
  isActive: boolean("is_active").default(false),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading Strategies
export const tradingStrategies = pgTable("trading_strategies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // scalping, swing, arbitrage, defi_yield, mev, cross_chain, algorithmic, ai_driven
  complexity: text("complexity").notNull(), // beginner, intermediate, advanced, experimental
  expectedReturn: text("expected_return").notNull(),
  riskLevel: text("risk_level").notNull(), // low, medium, high, extreme
  timeframe: text("timeframe").notNull(),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  implementation: text("implementation").notNull(),
  backtestResults: jsonb("backtest_results").$type<{
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }>(),
  agentContributors: jsonb("agent_contributors").$type<string[]>().default([]),
  status: text("status").default("concept"), // concept, development, testing, production, deprecated
  createdAt: timestamp("created_at").defaultNow(),
});

// Hyper-Speed Legendary Strategies  
export const hyperSpeedStrategies = pgTable("hyper_speed_strategies", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  entrySOL: text("entry_sol").notNull(),
  targetSOL: text("target_sol").notNull(),
  completionTime: text("completion_time").notNull(),
  scalingMultiplier: text("scaling_multiplier").notNull(),
  winRate: text("win_rate").notNull(),
  profitVelocity: text("profit_velocity").notNull(),
  specialFeatures: jsonb("special_features").$type<string[]>().default([]),
  quantumMath: text("quantum_math").notNull(),
  neuralIntegration: text("neural_integration").notNull(),
  phases: jsonb("phases").notNull(),
  performance: jsonb("performance").notNull(),
  isDeployed: boolean("is_deployed").default(false),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bio-Quantum Innovations
export const bioQuantumInnovations = pgTable("bio_quantum_innovations", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // cellular_energy, quantum_consciousness, mathematical_frameworks, reality_manipulation, transformer_engineering
  technology: text("technology").notNull(),
  application: text("application").notNull(),
  performance: text("performance").notNull(),
  implementation: text("implementation").notNull(),
  specialty: text("specialty").notNull(),
  entrySOL: text("entry_sol"),
  maxReturn: text("max_return"),
  avgReturn: text("avg_return"),
  winRate: text("win_rate"),
  completionTime: text("completion_time"),
  riskLevel: text("risk_level").notNull(), // safe, moderate, high, extreme, transcendent
  testingResults: jsonb("testing_results"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction Patterns
export const transactionPatterns = pgTable("transaction_patterns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  patternType: text("pattern_type").notNull(), // arbitrage, mev, defi_interaction, whale_movement, bot_activity, flash_loan, sandwich_attack
  conditions: jsonb("conditions").$type<Record<string, any>>().default({}),
  frequency: integer("frequency").default(0),
  successRate: real("success_rate").default(0),
  averageProfit: real("average_profit").default(0),
  historicalDataTimeframe: text("historical_data_timeframe"),
  historicalDataSampleSize: integer("historical_data_sample_size").default(0),
  strategicValue: text("strategic_value").notNull(), // high, medium, low
  discoveredBy: text("discovered_by").notNull(), // agent ID
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Innovations (Progress Tracking)
export const innovations = pgTable("innovations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // dark_matter, quantum_trading, strategy_framework, price_feeds, autonomous_systems
  status: text("status").notNull(), // research, development, testing, deployment, complete
  progress: integer("progress").default(0), // 0-100
  priority: text("priority").notNull(), // critical, high, medium, low
  assignedAgents: jsonb("assigned_agents").$type<string[]>().default([]),
  startDate: timestamp("start_date").defaultNow(),
  estimatedCompletion: timestamp("estimated_completion").notNull(),
  actualCompletion: timestamp("actual_completion"),
  description: text("description").notNull(),
  technicalDetails: jsonb("technical_details").$type<string[]>().default([]),
  systemImpact: jsonb("system_impact").$type<{
    profitabilityIncrease: number;
    riskReduction: number;
    automationLevel: number;
    marketAdvantage: string;
  }>().notNull(),
  dependencies: jsonb("dependencies").$type<string[]>().default([]), // other innovation IDs
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Innovation Milestones
export const innovationMilestones = pgTable("innovation_milestones", {
  id: text("id").primaryKey(),
  innovationId: text("innovation_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Strategic Datasets
export const strategicDatasets = pgTable("strategic_datasets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // arbitrage_opportunities, mev_patterns, yield_farming, whale_tracking, protocol_analysis
  dataPoints: integer("data_points").default(0),
  qualityScore: integer("quality_score").default(0), // 0-100
  timeRangeStart: timestamp("time_range_start").notNull(),
  timeRangeEnd: timestamp("time_range_end").notNull(),
  updateFrequency: text("update_frequency").notNull(), // real-time, hourly, daily, weekly
  sources: jsonb("sources").$type<string[]>().default([]),
  curatedBy: jsonb("curated_by").$type<string[]>().default([]), // agent IDs
  applications: jsonb("applications").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  lastActive: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDarkMatterEngineSchema = createInsertSchema(darkMatterEngines).omit({
  id: true,
  createdAt: true,
});

export const insertUnstoppableStrategySchema = createInsertSchema(unstoppableStrategies).omit({
  id: true,
  createdAt: true,
  lastOptimization: true,
});

export const insertCustomPriceFeedSchema = createInsertSchema(customPriceFeeds).omit({
  id: true,
  createdAt: true,
});

export const insertTradingStrategySchema = createInsertSchema(tradingStrategies).omit({
  id: true,
  createdAt: true,
});

export const insertHyperSpeedStrategySchema = createInsertSchema(hyperSpeedStrategies).omit({
  id: true,
  createdAt: true,
});

export const insertBioQuantumInnovationSchema = createInsertSchema(bioQuantumInnovations).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionPatternSchema = createInsertSchema(transactionPatterns).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertInnovationSchema = createInsertSchema(innovations).omit({
  id: true,
  startDate: true,
  createdAt: true,
});

export const insertInnovationMilestoneSchema = createInsertSchema(innovationMilestones).omit({
  id: true,
  createdAt: true,
});

export const insertStrategicDatasetSchema = createInsertSchema(strategicDatasets).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Relations
export const agentRelations = relations(agents, ({ many }) => ({
  activities: many(activities),
  tasks: many(tasks),
  messages: many(messages),
}));

export const projectRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  messages: many(messages),
}));

export const innovationRelations = relations(innovations, ({ many }) => ({
  milestones: many(innovationMilestones),
}));

export const innovationMilestoneRelations = relations(innovationMilestones, ({ one }) => ({
  innovation: one(innovations, {
    fields: [innovationMilestones.innovationId],
    references: [innovations.id],
  }),
}));

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type DarkMatterEngine = typeof darkMatterEngines.$inferSelect;
export type InsertDarkMatterEngine = z.infer<typeof insertDarkMatterEngineSchema>;
export type UnstoppableStrategy = typeof unstoppableStrategies.$inferSelect;
export type InsertUnstoppableStrategy = z.infer<typeof insertUnstoppableStrategySchema>;
export type CustomPriceFeed = typeof customPriceFeeds.$inferSelect;
export type InsertCustomPriceFeed = z.infer<typeof insertCustomPriceFeedSchema>;
export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertTradingStrategy = z.infer<typeof insertTradingStrategySchema>;
export type HyperSpeedStrategy = typeof hyperSpeedStrategies.$inferSelect;
export type InsertHyperSpeedStrategy = z.infer<typeof insertHyperSpeedStrategySchema>;
export type BioQuantumInnovation = typeof bioQuantumInnovations.$inferSelect;
export type InsertBioQuantumInnovation = z.infer<typeof insertBioQuantumInnovationSchema>;
export type TransactionPattern = typeof transactionPatterns.$inferSelect;
export type InsertTransactionPattern = z.infer<typeof insertTransactionPatternSchema>;
export type Innovation = typeof innovations.$inferSelect;
export type InsertInnovation = z.infer<typeof insertInnovationSchema>;
export type InnovationMilestone = typeof innovationMilestones.$inferSelect;
export type InsertInnovationMilestone = z.infer<typeof insertInnovationMilestoneSchema>;
export type StrategicDataset = typeof strategicDatasets.$inferSelect;
export type InsertStrategicDataset = z.infer<typeof insertStrategicDatasetSchema>;
