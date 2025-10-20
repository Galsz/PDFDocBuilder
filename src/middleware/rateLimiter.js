/**
 * Middleware de Rate Limiting
 */

const config = require("../config/app");
const Logger = require("../utils/logger");

class RateLimiter {
  constructor() {
    this.requestCounts = new Map();
    this.windowMs = config.rateLimit.windowMs;
    this.maxRequests = config.rateLimit.maxRequestsPerMinute;
    this.cleanupInterval = null;
  }

  middleware() {
    return (req, res, next) => {
      const clientId = req.ip;
      const now = Date.now();
      
      if (!this.requestCounts.has(clientId)) {
        this.requestCounts.set(clientId, { count: 1, timestamp: now });
        return next();
      }
      
      const clientData = this.requestCounts.get(clientId);
      
      if (now - clientData.timestamp > this.windowMs) {
        clientData.count = 1;
        clientData.timestamp = now;
        return next();
      }
      
      if (clientData.count >= this.maxRequests) {
        const retryAfter = Math.ceil((this.windowMs - (now - clientData.timestamp)) / 1000);
        
        Logger.warn(`Rate limit exceeded for IP: ${clientId}`);
        
        return res.status(429).json({ 
          error: "Muitas requisições. Tente novamente em 1 minuto.",
          retryAfter
        });
      }
      
      clientData.count++;
      next();
    };
  }

  // Limpeza periódica dos contadores
  startCleanup() {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [clientId, data] of this.requestCounts.entries()) {
        if (now - data.timestamp > this.windowMs * 2) {
          this.requestCounts.delete(clientId);
        }
      }
    }, this.windowMs);
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

module.exports = RateLimiter;
