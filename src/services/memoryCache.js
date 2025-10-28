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
  // Índice secundário por chave primária (licencaId:orcamentoId)
  this.primaryIndex = new Map();
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
      // Remove do índice primário se apontar para esta chave
      this.removeFromPrimaryIndex(cached.metadata, key);
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

    // Garante exclusividade por (licencaId,orcamentoId)
    if (metadata.licencaId !== undefined && metadata.orcamentoId !== undefined) {
      const baseKey = `${metadata.licencaId}:${metadata.orcamentoId}`;
      const prevKey = this.primaryIndex.get(baseKey);
      if (prevKey && prevKey !== key) {
        const prevEntry = this.cache.get(prevKey);
        if (prevEntry) {
          this.cache.delete(prevKey);
          this.stats.evictions++;
          this.stats.totalSize -= prevEntry.size;
          Logger.debug(`Cache OVERWRITE (primary ${baseKey}): ${prevKey} -> ${key}`);
        }
      }
      this.primaryIndex.set(baseKey, key);
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
  this.removeFromPrimaryIndex(entry.metadata, oldestKey);
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
  this.removeFromPrimaryIndex(entry.metadata, key);
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
  this.primaryIndex.clear();
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
      this.removeFromPrimaryIndex(cached.metadata, key);
      this.stats.evictions++;
      return false;
    }
    
    return true;
  }

  // Remove índice primário se correspondente à chave fornecida
  removeFromPrimaryIndex(metadata = {}, key) {
    if (metadata.licencaId === undefined || metadata.orcamentoId === undefined) return;
    const baseKey = `${metadata.licencaId}:${metadata.orcamentoId}`;
    const mapped = this.primaryIndex.get(baseKey);
    if (mapped === key) {
      this.primaryIndex.delete(baseKey);
    }
  }
}

// Instância singleton
module.exports = new MemoryCache();
