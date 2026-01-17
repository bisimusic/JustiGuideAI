/**
 * Replit Database Integration for Hot Data Caching
 * Optimized for Replit environment with aggressive cleanup
 */
import Database from "@replit/database";

export class ReplitCacheService {
  private db: Database | null = null;
  private memoryCache = new Map<string, { data: any; timestamp: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean;
  
  constructor() {
    // Only initialize Replit DB if REPLIT_DB_URL is set
    this.isEnabled = !!process.env.REPLIT_DB_URL;
    
    if (this.isEnabled) {
      try {
        this.db = new Database();
        console.log('🔥 Replit Database cache service initialized for hot data');
        
        // Aggressive cleanup every minute for Replit optimization
        this.cleanupInterval = setInterval(async () => {
          await this.aggressiveCleanup();
        }, 60000);
      } catch (error) {
        console.warn('⚠️ Replit Database initialization failed, using memory-only cache:', error);
        this.isEnabled = false;
      }
    } else {
      console.log('📝 Replit Database not configured, using memory-only cache');
    }
  }

  // Store hot data in Replit DB (for small, frequently accessed data)
  async setHot(key: string, data: any, ttl: number = 300000): Promise<void> {
    try {
      // Always store in memory cache
      this.memoryCache.set(key, { data, timestamp: Date.now() });
      
      // Store in Replit DB if enabled
      if (this.isEnabled && this.db) {
        const entry = {
          data,
          timestamp: Date.now(),
          ttl
        };
        await this.db.set(key, JSON.stringify(entry));
      }
      
    } catch (error) {
      console.error('❌ Replit cache set error:', error);
      // Fallback to memory only
      this.memoryCache.set(key, { data, timestamp: Date.now() });
    }
  }

  // Get hot data with memory-first fallback
  async getHot(key: string): Promise<any> {
    try {
      // Check memory cache first (fastest)
      const memEntry = this.memoryCache.get(key);
      if (memEntry && Date.now() - memEntry.timestamp < 300000) {
        return memEntry.data;
      }

      // Fallback to Replit DB if enabled
      if (this.isEnabled && this.db) {
        const dbValue = await this.db.get(key);
        if (dbValue) {
          const entry = JSON.parse(dbValue);
          if (Date.now() - entry.timestamp < entry.ttl) {
            // Refresh memory cache
            this.memoryCache.set(key, { data: entry.data, timestamp: Date.now() });
            return entry.data;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Replit cache get error:', error);
      return null;
    }
  }

  // Aggressive cleanup optimized for Replit
  private async aggressiveCleanup(): Promise<void> {
    try {
      const now = Date.now();
      
      // Clear old memory cache entries
      for (const [key, entry] of this.memoryCache) {
        if (now - entry.timestamp > 300000) { // 5 minutes
          this.memoryCache.delete(key);
        }
      }

      // Log memory usage for monitoring
      const usage = process.memoryUsage();
      const heapMB = Math.round(usage.heapUsed / 1024 / 1024);
      console.log(`🧹 Replit cleanup: Memory ${heapMB}MB, Cache entries: ${this.memoryCache.size}`);
      
      // Clear very old Replit DB entries (prevent hitting 50MB limit)
      if (this.isEnabled && this.db) {
        try {
          const allKeys = await this.db.list();
          let clearCount = 0;
          
          // Ensure allKeys is iterable
          if (allKeys && typeof allKeys[Symbol.iterator] === 'function') {
            for (const key of allKeys) {
              try {
                const value = await this.db.get(key);
                if (value) {
                  const entry = JSON.parse(value);
                  if (now - entry.timestamp > 600000) { // 10 minutes for DB
                    await this.db.delete(key);
                    clearCount++;
                  }
                }
              } catch (error) {
                // If parsing fails, delete the corrupted entry
                await this.db.delete(key);
                clearCount++;
              }
            }
          }
          
          if (clearCount > 0) {
            console.log(`🗑️ Replit DB cleaned: ${clearCount} expired entries removed`);
          }
        } catch (error) {
          console.error('❌ Replit DB cleanup error:', error);
        }
      }
      
      
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }

  // Get cache stats for monitoring
  getStats() {
    const usage = process.memoryUsage();
    return {
      memoryEntries: this.memoryCache.size,
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      totalMemoryMB: Math.round(usage.rss / 1024 / 1024)
    };
  }

  // Cleanup on shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
  }
}

// Only create instance if REPLIT_DB_URL is set, otherwise create a no-op instance
export const replitCache = process.env.REPLIT_DB_URL 
  ? new ReplitCacheService()
  : (() => {
      // Create a minimal no-op cache service for non-Replit environments
      const noOpCache = {
        setHot: async () => {},
        getHot: async () => null,
        getStats: () => ({ memoryEntries: 0, heapUsedMB: 0, totalMemoryMB: 0 }),
        destroy: () => {}
      };
      console.log('📝 Replit cache disabled (REPLIT_DB_URL not set)');
      return noOpCache as any;
    })();