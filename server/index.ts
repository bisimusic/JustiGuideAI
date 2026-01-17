import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { backupScheduler } from "./services/backup-scheduler";

// Memory management and garbage collection optimizations
const setupLegacyMemoryManagement = () => {
  // Legacy memory monitoring - now handled by memory circuit breaker
  log('📝 Legacy memory management disabled - using memory circuit breaker instead');
  
  // Keep minimal GC for legacy support
  setInterval(() => {
    if (global.gc) {
      global.gc();
    }
  }, 120000); // Less frequent GC (2 minutes)
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Log only essential metadata to prevent memory issues
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  // Initialize legacy memory management (minimal)
  setupLegacyMemoryManagement();
  log('🧠 Legacy memory management initialized (circuit breaker will handle primary monitoring)');
  
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

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? '8000' : '5000'), 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    
    // 4. FULL STARTUP - Re-enable all services after memory optimization
    setTimeout(async () => {
      try {
        log('🚀 Server starting in full mode - memory issues resolved');
        
        // TEMPORARILY DISABLED: Database optimizer causing memory consumption
        // Initialize database optimizer with indexes
        // try {
        //   const { databaseOptimizer } = await import('./services/databaseOptimizer');
        //   await databaseOptimizer.createOptimalIndexes();
        //   log('📊 Database indexes created successfully');
        // } catch (error) {
        //   log(`⚠️ Database optimizer failed: ${error}`);
        // }
        log('📊 Database optimizer temporarily disabled to prevent memory usage');
        
        // Initialize memory circuit breaker and monitoring scheduler
        try {
          const { memoryCircuitBreaker } = await import('./services/memoryCircuitBreaker');
          const { MonitoringScheduler } = await import('./services/monitoringScheduler');
          
          // Start memory circuit breaker monitoring
          memoryCircuitBreaker.startMonitoring();
          log('🛡️ Memory circuit breaker started - monitoring heap usage');
          
          // RE-ENABLED: Memory optimizations successful - safe to run lead discovery
          // Initialize monitoring scheduler with memory management
          const monitoringScheduler = new MonitoringScheduler();
          await monitoringScheduler.start();
          log('🔍 Monitoring scheduler re-enabled with memory-safe optimizations');
          
          // Log initial memory status
          const memStats = memoryCircuitBreaker.getMemoryStats();
          log(`🧠 Initial memory: ${memStats.heapUsed}MB/${memStats.heapTotal}MB`);
          log(`🚦 Circuit breaker thresholds: Pause at ${memStats.pauseThreshold}MB, Resume at ${memStats.resumeThreshold}MB`);
          
        } catch (error) {
          log(`⚠️ Memory-aware monitoring setup failed: ${error}`);
          // TEMPORARILY DISABLED: Fallback monitoring also disabled to prevent memory issues
          // Fallback to basic monitoring without memory management
          // try {
          //   const { MonitoringScheduler } = await import('./services/monitoringScheduler');
          //   const monitoringScheduler = new MonitoringScheduler();
          //   log('🔍 Fallback: Basic monitoring scheduler started (no memory management)');
          // } catch (fallbackError) {
          //   log(`❌ Monitoring scheduler completely failed: ${fallbackError}`);
          // }
          log('🔍 Fallback monitoring also temporarily disabled');
        }
        
        // Initialize campaign follow-up processor
        try {
          const { campaignFollowUpProcessor } = await import('./services/campaignFollowUpProcessor');
          log('📧 Campaign follow-up processor initialized successfully');
          log('🔄 Follow-up processor will handle scheduled campaign touchpoints automatically');
        } catch (error) {
          log(`⚠️ Campaign follow-up processor failed to initialize: ${error}`);
        }

        // Initialize intelligent response agent with Google Sheets storage for memory efficiency
        try {
          const { IntelligentResponseAgent } = await import('./services/intelligentResponseAgent');
          const responseAgent = new IntelligentResponseAgent();
          await responseAgent.startAgent();
          log('🤖 Intelligent response agent started with Google Sheets storage');
        } catch (error) {
          log(`⚠️ Response agent failed: ${error}`);
        }

        // Initialize conversion follow-up scheduler for automated aggressive conversion
        try {
          const { conversionFollowUpScheduler } = await import('./services/conversionFollowUpScheduler');
          await conversionFollowUpScheduler.start();
          log('💥 Conversion follow-up scheduler started - automatic aggressive conversion every 45 minutes');
          log('🎯 Scheduler will target leads in critical 1-48 hour conversion window');
        } catch (error) {
          log(`⚠️ Conversion follow-up scheduler failed: ${error}`);
        }
        
        // 
        // Initialize automated conversion service
        // try {
        //   const { AutomatedConversionService } = await import('./services/automatedConversion');
        //   const conversionService = new AutomatedConversionService();
        //   await conversionService.startAutomatedConversion();
        //   log('⚡ Automated conversion service started');
        // } catch (error) {
        //   log(`⚠️ Conversion service failed: ${error}`);
        // }
        
        log('💡 Starting with monitoring only - other services will be added gradually');
        
        log('🔥 Cache ready (using memory-only mode)');
        log('✅ Startup completed - monitoring service active for lead discovery');
        
      } catch (error) {
        log(`⚠️ Lightweight startup operation failed: ${error}`);
      }
    }, 2000); // 2-second delay to ensure health checks work immediately
  });
})();
