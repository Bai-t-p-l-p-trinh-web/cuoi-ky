/**
 * Simple in-memory cache utility
 * Sử dụng cho các API calls thường xuyên như categories, locations
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  /**
   * Set cache với TTL (seconds)
   */
  set(key, value, ttlSeconds = 300) {
    // Default 5 minutes
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, value);
    this.ttl.set(key, expiry);
  }

  /**
   * Get cache value nếu chưa expired
   */
  get(key) {
    const expiry = this.ttl.get(key);

    if (!expiry || Date.now() > expiry) {
      // Cache expired
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }
}

// Create global cache instance
const cache = new SimpleCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

/**
 * Cache middleware wrapper for async functions
 */
const withCache = (fn, keyGenerator, ttlSeconds = 300) => {
  return async (...args) => {
    const cacheKey = keyGenerator(...args);
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    console.log(`Cache MISS: ${cacheKey}`);
    const result = await fn(...args);
    cache.set(cacheKey, result, ttlSeconds);
    return result;
  };
};

module.exports = {
  cache,
  withCache,
};
