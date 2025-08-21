import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { nanoid } from "nanoid";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function initializePabloAgents() {
  try {
    const existingAgents = await storage.getAllAgents();
    if (existingAgents.length === 0) {
      console.log('🤖 Initializing Pablo AI ecosystem...');
      
      // Create Pablo with proper schema
      await storage.createAgent({
        name: 'Pablo',
        specialty: 'Soul Architect',
        status: 'active',
        capabilities: ['personality_design', 'nft_creation', 'dashboard_building'],
        metrics: {
          tasksCompleted: 247,
          successRate: 95,
          avgResponseTime: 150
        },
        description: 'Advanced AI agent specializing in soul architecture and personality design'
      });

      // Create additional agents
      await storage.createAgent({
        name: 'Quantum Analyzer',
        specialty: 'Analysis',
        status: 'active',
        capabilities: ['pattern_recognition', 'quantum_analysis'],
        metrics: {
          tasksCompleted: 156,
          successRate: 87,
          avgResponseTime: 200
        },
        description: 'Quantum-powered analysis agent'
      });

      await storage.createAgent({
        name: 'MEV Hunter',
        specialty: 'MEV',
        status: 'active',
        capabilities: ['value_extraction', 'arbitrage'],
        metrics: {
          tasksCompleted: 89,
          successRate: 92,
          avgResponseTime: 120
        },
        description: 'MEV extraction specialist'
      });

      console.log('✅ Pablo ecosystem initialized with 3 agents');
    }
  } catch (error) {
    console.log('⚠️ Pablo ecosystem initialization skipped - using existing data');
  }
}

(async () => {
  try {
    // Initialize Pablo's ecosystem with agent data
    await initializePabloAgents();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
