/**
 * Sistema de Cache em Memória para PDFs
 * Otimizado para alta performance e baixo uso de memória
 */

const crypto = require('crypto');
const Logger = require('../utils/logger');
const config = require('../config/app');

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalSize: 0
    };
    
    // Auto-limpeza para evitar vazamentos de memória
    setInterval(() => this.cleanup(), 300000); // 5 minutos
    
    Logger.info(`Cache inicializado - Máximo: ${config.cache.maxSize} PDFs`);
  }

  // Gera hash único baseado nos dados do PDF
  generateKey(data) {
    const hashData = {};
    
    // Extrai apenas campos relevantes para o hash
    config.cache.hashFields.forEach(field => {
      if (data[field] !== undefined) {
        hashData[field] = data[field];
      }
    });
    
    const content = JSON.stringify(hashData, Object.keys(hashData).sort());
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  // Busca PDF no cache
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Verifica se não expirou
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      this.stats.evictions++;
      return null;
    }

    // Atualiza último acesso
    cached.lastAccess = Date.now();
    this.stats.hits++;
    
    Logger.debug(`Cache HIT: ${key} (${this.stats.hits}/${this.stats.hits + this.stats.misses})`);
    return cached.data;
  }

  // Armazena PDF no cache
  set(key, buffer, metadata = {}) {
    if (!config.cache.enabled) return false;

    // Remove entrada mais antiga se atingiu limite
    if (this.cache.size >= config.cache.maxSize) {
      this.evictOldest();
    }

    const entry = {
      data: buffer,
      metadata,
      created: Date.now(),
      lastAccess: Date.now(),
      expires: Date.now() + (config.cache.ttl * 1000),
      size: buffer.length
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.totalSize += buffer.length;
    
    Logger.debug(`Cache SET: ${key} (${Math.round(buffer.length/1024)}KB)`);
    return true;
  }

  // Remove entrada mais antiga (LRU)
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.totalSize -= entry.size;
      Logger.debug(`Cache EVICT: ${oldestKey}`);
    }
  }

  // Limpeza automática de entradas expiradas
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
        this.stats.evictions++;
        this.stats.totalSize -= entry.size;
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.info(`Cache cleanup: ${cleaned} entradas expiradas removidas`);
    }
  }

  // Estatísticas do cache
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)
      : 0;

    return {
      enabled: config.cache.enabled,
      size: this.cache.size,
      maxSize: config.cache.maxSize,
      hitRate: `${hitRate}%`,
      totalSizeMB: Math.round(this.stats.totalSize / 1024 / 1024),
      ...this.stats
    };
  }

  // Força limpeza completa
  clear() {
    this.cache.clear();
    this.stats.totalSize = 0;
    Logger.info('Cache completamente limpo');
  }

  // Existe no cache?
  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    // Verifica expiração
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      this.stats.evictions++;
      return false;
    }
    
    return true;
  }
}

// Instância singleton
module.exports = new MemoryCache();
