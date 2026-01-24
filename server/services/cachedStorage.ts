/**
 * Cached Storage Service
 * Provides caching layer over the storage service to improve performance
 */
import { storage } from "../storage";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CachedStorage {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 60000; // 1 minute default TTL
  private readonly STATS_TTL = 30000; // 30 seconds for stats
  private readonly LEADS_TTL = 60000; // 1 minute for leads

  /**
   * Get dashboard stats with caching
   */
  async getDashboardStats() {
    const cacheKey = "dashboard:stats";
    const cached = this.getFromCache(cacheKey, this.STATS_TTL);
    
    if (cached) {
      return cached;
    }

    const stats = await storage.getDashboardStats();
    this.setCache(cacheKey, stats, this.STATS_TTL);
    return stats;
  }

  /**
   * Get leads with caching
   */
  async getLeads(limit: number = 50, offset: number = 0) {
    const cacheKey = `leads:${limit}:${offset}`;
    const cached = this.getFromCache(cacheKey, this.LEADS_TTL);
    
    if (cached) {
      return cached;
    }

    const leads = await storage.getLeads(limit, offset);
    this.setCache(cacheKey, leads, this.LEADS_TTL);
    return leads;
  }

  /**
   * Get leads by platform with caching
   */
  async getLeadsByPlatform(platform: string, limit: number = 50) {
    const cacheKey = `leads:platform:${platform}:${limit}`;
    const cached = this.getFromCache(cacheKey, this.LEADS_TTL);
    
    if (cached) {
      return cached;
    }

    const leads = await storage.getLeadsByPlatform(platform);
    const limitedLeads = leads.slice(0, limit);
    this.setCache(cacheKey, limitedLeads, this.LEADS_TTL);
    return limitedLeads;
  }

  /**
   * Get high priority leads with caching
   */
  async getHighPriorityLeads(limit: number = 20) {
    const cacheKey = `leads:high-priority:${limit}`;
    const cached = this.getFromCache(cacheKey, this.LEADS_TTL);
    
    if (cached) {
      return cached;
    }

    // Get all leads and filter by priority
    const allLeads = await storage.getLeads(1000); // Get more to filter
    const highPriorityLeads = allLeads
      .filter((lead: any) => {
        const score = lead.aiScore || lead.score || 0;
        return score >= 7.0; // High priority threshold
      })
      .sort((a: any, b: any) => {
        const scoreA = a.aiScore || a.score || 0;
        const scoreB = b.aiScore || b.score || 0;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    this.setCache(cacheKey, highPriorityLeads, this.LEADS_TTL);
    return highPriorityLeads;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    const validEntries = entries.filter(([_, entry]) => now - entry.timestamp < entry.ttl);
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Flush all cache
   */
  async flushAllCache(): Promise<boolean> {
    try {
      this.cache.clear();
      return true;
    } catch (error) {
      console.error("Error flushing cache:", error);
      return false;
    }
  }

  /**
   * Warmup cache by preloading common queries
   */
  async warmupCache(): Promise<void> {
    try {
      // Preload dashboard stats
      await this.getDashboardStats();
      
      // Preload first page of leads
      await this.getLeads(50, 0);
      
      // Preload high priority leads
      await this.getHighPriorityLeads(20);
      
      console.log("✅ Cache warmup completed");
    } catch (error) {
      console.error("❌ Cache warmup failed:", error);
    }
  }

  /**
   * Invalidate cache for a specific lead
   */
  async invalidateLeadCache(leadId: string): Promise<void> {
    // Invalidate all lead-related caches
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith("leads:")) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Also invalidate stats cache since lead count may have changed
    this.cache.delete("dashboard:stats");
  }

  /**
   * Get value from cache if valid
   */
  private getFromCache<T>(key: string, ttl: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): string {
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length;
      totalSize += JSON.stringify(entry.data).length;
      totalSize += 24; // Approximate overhead for Map entry
    }
    
    const kb = totalSize / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    return `${(kb / 1024).toFixed(2)} MB`;
  }
}

export const cachedStorage = new CachedStorage();
