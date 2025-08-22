/**
 * Service responsável pelo gerenciamento do pool de browsers Playwright
 * OTIMIZADO para alta demanda com Page Pool
 */

const { chromium } = require("playwright");
const config = require("../config/app");
const Logger = require("../utils/logger");
const PagePool = require("./pagePool");

class PlaywrightBrowserPool {
  constructor() {
    this.browsers = [];
    this.maxBrowsers = config.browser.maxConcurrentBrowsers;
    this.maxPagesPerBrowser = config.browser.maxPagesPerBrowser;
    this.activeBrowsers = 0;
    this.pendingLaunches = 0; // novos lançamentos em progresso
    this.queue = [];
    this.browserPages = new Map();
    this.browserLastUsed = new Map();
    
    // Pool de páginas reutilizáveis
    this.pagePool = config.browser.enablePagePool ? new PagePool() : null;
    
    // Monitor de deadlock
    this.deadlockMonitor = setInterval(() => {
      this.checkForDeadlock();
    }, 30000); // Verifica a cada 30 segundos
    
    Logger.info(`Pool inicializado - Browsers: ${this.maxBrowsers}, Pages/Browser: ${this.maxPagesPerBrowser}, PagePool: ${config.browser.enablePagePool ? 'Enabled' : 'Disabled'}`);
  }

  checkForDeadlock() {
    const stats = this.getStats();
    
    // Detecta condições de deadlock:
    // 1. Fila grande com browsers disponíveis
    // 2. Todos os browsers com 0 páginas mas fila não sendo processada
    // 3. Fila estagnada por muito tempo
    if (stats.queueLength > 3 && stats.totalPages === 0 && stats.activeBrowsers > 0) {
      Logger.warn(`DEADLOCK DETECTADO: Fila ${stats.queueLength}, Páginas ${stats.totalPages}, Browsers ${stats.activeBrowsers}`);
      this.recoverFromDeadlock();
    }
    
    // Log periódico para debugging
    if (stats.queueLength > 0 || stats.totalPages > stats.totalCapacity * 0.8) {
      Logger.info(`Pool Status: ${JSON.stringify(stats)}`);
    }
  }

  async getBrowser() {
    // Primeiro, limpar browsers desconectados
    await this.cleanupDisconnectedBrowsers();
    
    // Procura browser com páginas disponíveis (com load balancing)
    let bestBrowser = null;
    let minPages = this.maxPagesPerBrowser;
    
    for (const browser of this.browsers) {
      try {
        if (!browser.isConnected()) continue;
        
        const pageCount = this.browserPages.get(browser) || 0;
        if (pageCount < this.maxPagesPerBrowser && pageCount < minPages) {
          bestBrowser = browser;
          minPages = pageCount;
          
          // Se encontrou browser vazio, usa imediatamente
          if (pageCount === 0) break;
        }
      } catch (error) {
        Logger.warn(`Browser desconectado detectado: ${error.message}`);
        await this.removeBrowser(browser);
      }
    }
    
    if (bestBrowser) {
      this.browserLastUsed.set(bestBrowser, Date.now());
      return bestBrowser;
    }

    // Se ainda há capacidade (browsers prontos + lançando < max), lançar novo browser
    const capacityInUse = this.browsers.length + this.pendingLaunches;
    if (capacityInUse < this.maxBrowsers) {
      this.pendingLaunches++;
      try {
        const browser = await this.createBrowser();
        this.browsers.push(browser);
        this.browserPages.set(browser, 0);
        this.browserLastUsed.set(browser, Date.now());
        this.activeBrowsers++; // conta apenas quando realmente disponível
        this.processQueue();
        return browser;
      } catch (error) {
        Logger.error(`Falha ao criar browser: ${error.message}`);
        throw error;
      } finally {
        this.pendingLaunches--;
        this.processQueue();
      }
    }

    // Se não pode criar mais, aguarda na fila com timeout reduzido
    return new Promise((resolve, reject) => {
      const timeoutMs = config.browser.queueTimeout || config.browser.browserTimeout;
      const timeout = setTimeout(() => {
        const index = this.queue.findIndex(item => item.resolve === resolve);
        if (index > -1) {
          this.queue.splice(index, 1);
          Logger.warn(`Timeout na fila do pool: ${this.queue.length} requisições restantes`);
          reject(new Error(`Timeout: Pool de browsers esgotado após ${timeoutMs}ms - Fila: ${this.queue.length}`));
        }
      }, timeoutMs);
      
      this.queue.push({ resolve, reject, timeout });
      Logger.info(`Adicionado à fila: ${this.queue.length} requisições esperando, browsers ativos: ${this.activeBrowsers}/${this.maxBrowsers}`);
    });
  }

  async createBrowser() {
    Logger.info(`Criando novo browser (${this.activeBrowsers}/${this.maxBrowsers})`);
    
    const browser = await chromium.launch({
      ...config.browser.launchOptions,
      timeout: config.browser.browserTimeout
    });

    // Monitora desconexão
    browser.on('disconnected', () => {
      Logger.warn('Browser desconectado, removendo do pool');
      this.removeBrowser(browser);
    });

    return browser;
  }

  incrementPageCount(browser) {
    const current = this.browserPages.get(browser) || 0;
    this.browserPages.set(browser, current + 1);
  }

  decrementPageCount(browser) {
    const current = this.browserPages.get(browser) || 0;
    this.browserPages.set(browser, Math.max(0, current - 1));
    this.processQueue();
  }

  removeBrowser(browser) {
    const index = this.browsers.indexOf(browser);
    if (index > -1) {
      this.browsers.splice(index, 1);
      this.browserPages.delete(browser);
      this.browserLastUsed.delete(browser);
      this.activeBrowsers--;
      Logger.info(`Browser removido: ${this.activeBrowsers}/${this.maxBrowsers} ativos`);
    }
    this.processQueue();
  }

  async cleanupDisconnectedBrowsers() {
    const disconnected = [];
    
    for (const browser of this.browsers) {
      try {
        if (!browser.isConnected()) {
          disconnected.push(browser);
        }
      } catch (error) {
        disconnected.push(browser);
      }
    }
    
    for (const browser of disconnected) {
      Logger.warn('Removendo browser desconectado durante cleanup');
      this.removeBrowser(browser);
    }
    
    return disconnected.length;
  }

  processQueue() {
    if (this.queue.length === 0) return;
    
    Logger.debug(`Processando fila: ${this.queue.length} esperando`);
    
    // Tentar resolver multiple requisições da fila
    let resolved = 0;
    
    for (let i = 0; i < this.queue.length && resolved < 3; i++) {
      let foundBrowser = false;
      
      for (const browser of this.browsers) {
        try {
          if (!browser.isConnected()) continue;
          
          const pageCount = this.browserPages.get(browser) || 0;
          if (pageCount < this.maxPagesPerBrowser) {
            const queueItem = this.queue.splice(i, 1)[0];
            clearTimeout(queueItem.timeout);
            this.browserLastUsed.set(browser, Date.now());
            queueItem.resolve(browser);
            foundBrowser = true;
            resolved++;
            i--; // Ajustar índice após splice
            break;
          }
        } catch (error) {
          Logger.warn(`Erro ao verificar browser na fila: ${error.message}`);
        }
      }
      
      if (!foundBrowser) break;
    }
    
    if (resolved > 0) {
      Logger.info(`Resolvidas ${resolved} requisições da fila, ${this.queue.length} restantes`);
    }
  }

  // Método para obter página otimizada
  async getPage(browser) {
    if (this.pagePool) {
      return await this.pagePool.getPage(browser);
    } else {
      // Fallback para criação tradicional
      return await browser.newPage({
        viewport: { width: 1200, height: 800 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false
      });
    }
  }

  // Método para liberar página otimizada
  async releasePage(page) {
    if (this.pagePool) {
      await this.pagePool.releasePage(page);
    } else {
      // Fallback para fechamento tradicional
      try {
        if (!page.isClosed()) {
          await page.close();
        }
      } catch (error) {
        Logger.debug('Erro ao fechar página:', error.message);
      }
    }
  }

  async closeAll() {
    Logger.info(`Fechando todos os browsers (${this.browsers.length})`);
    
    // Limpar monitor de deadlock
    if (this.deadlockMonitor) {
      clearInterval(this.deadlockMonitor);
      this.deadlockMonitor = null;
    }
    
    // Fecha page pool primeiro
    if (this.pagePool) {
      await this.pagePool.closeAll();
    }
    
    const allBrowsers = [...this.browsers];
    this.browsers = [];
    this.browserPages.clear();
    this.browserLastUsed.clear();
    
    // Limpa fila pendente
    while (this.queue.length > 0) {
      const queueItem = this.queue.shift();
      clearTimeout(queueItem.timeout);
      queueItem.reject(new Error('Browser pool sendo fechado'));
    }
    
    for (const browser of allBrowsers) {
      try {
        await browser.close();
      } catch (err) {
        Logger.error('Erro ao fechar browser:', err);
      }
    }
    this.activeBrowsers = 0;
  }

  getStats() {
    const pagePoolStats = this.pagePool ? this.pagePool.getStats() : null;
    const totalPages = Array.from(this.browserPages.values()).reduce((sum, count) => sum + count, 0);
    const totalCapacity = this.maxBrowsers * this.maxPagesPerBrowser;
    
    return {
      activeBrowsers: this.activeBrowsers,
      readyBrowsers: this.browsers.length,
      pendingLaunches: this.pendingLaunches,
      maxBrowsers: this.maxBrowsers,
      queueLength: this.queue.length,
      totalPages,
      maxPagesPerBrowser: this.maxPagesPerBrowser,
      totalCapacity,
      utilization: `${((totalPages / totalCapacity) * 100).toFixed(1)}%`,
      browserDetails: this.browsers.map(browser => ({
        connected: browser.isConnected(),
        pages: this.browserPages.get(browser) || 0,
        lastUsed: this.browserLastUsed.get(browser) || 0
      })),
      pagePool: pagePoolStats
    };
  }

  // Método para detectar e resolver deadlocks
  async recoverFromDeadlock() {
    Logger.warn('DETECTADO POSSÍVEL DEADLOCK - Iniciando recuperação de emergência');
    
    const stats = this.getStats();
    Logger.info(`Stats antes da recuperação: ${JSON.stringify(stats)}`);
    
    // 1. Limpar browsers desconectados
    const cleaned = await this.cleanupDisconnectedBrowsers();
    Logger.info(`Browsers desconectados removidos: ${cleaned}`);
    
    // 2. Se ainda há fila e capacidade disponível, forçar criação de browser
    if (this.queue.length > 0 && this.activeBrowsers < this.maxBrowsers) {
      try {
        Logger.info('Criando browser de emergência para resolver fila');
        const browser = await this.createBrowser();
        this.browsers.push(browser);
        this.browserPages.set(browser, 0);
        this.browserLastUsed.set(browser, Date.now());
        this.activeBrowsers++;
        this.processQueue();
      } catch (error) {
        Logger.error(`Falha ao criar browser de emergência: ${error.message}`);
      }
    }
    
    // 3. Se a fila ainda existe e está muito grande, limpar timeouts antigos
    if (this.queue.length > 5) {
      const now = Date.now();
      let cleared = 0;
      
      this.queue = this.queue.filter(item => {
        if (!item.timeout._destroyed && (now - item.timeout._idleStart) > 20000) {
          clearTimeout(item.timeout);
          item.reject(new Error('Timeout limpo durante recuperação de deadlock'));
          cleared++;
          return false;
        }
        return true;
      });
      
      Logger.warn(`Timeouts antigos limpos durante recuperação: ${cleared}`);
    }
    
    const newStats = this.getStats();
    Logger.info(`Stats após recuperação: ${JSON.stringify(newStats)}`);
  }

  async cleanupIdleBrowsers() {
    const now = Date.now();
    const idleTimeout = 300000; // 5 minutos
    const stats = this.getStats();
    
    // Se temos browsers ociosos e o pool não está sendo usado intensivamente
    if (stats.totalPages === 0 && this.activeBrowsers > 1) {
      const browsersToClose = [];
      
      for (const browser of this.browsers) {
        const lastUsed = this.browserLastUsed.get(browser) || now;
        if (now - lastUsed > idleTimeout) {
          browsersToClose.push(browser);
        }
      }
      
      // Mantém pelo menos 1 browser
      if (browsersToClose.length < this.browsers.length) {
        for (const browser of browsersToClose) {
          try {
            await browser.close();
            this.removeBrowser(browser);
            Logger.info('Browser ocioso fechado por inatividade');
          } catch (err) {
            Logger.error('Erro ao fechar browser ocioso:', err);
          }
        }
      }
    }
    
    // Limpeza do page pool
    if (this.pagePool) {
      await this.pagePool.cleanupIdlePages();
    }
  }

  // Pre-aquecimento de browsers para evitar cold start
  async prewarm(count = (config.browser.prewarm?.count ?? this.maxBrowsers)) {
    const target = Math.min(count, this.maxBrowsers);
    const need = Math.max(0, target - this.browsers.length - this.pendingLaunches);
    if (need <= 0) return;
    
    Logger.info(`Pre-warm iniciando: target=${target}, atual=${this.browsers.length}, lançando=${need}`);
    
    for (let i = 0; i < need; i++) {
      this.pendingLaunches++;
      try {
        const browser = await this.createBrowser();
        this.browsers.push(browser);
        this.browserPages.set(browser, 0);
        this.browserLastUsed.set(browser, Date.now());
        this.activeBrowsers++;
      } catch (error) {
        Logger.warn(`Falha ao preaquecer browser: ${error.message}`);
        break;
      } finally {
        this.pendingLaunches--;
      }
    }
    
    Logger.info(`Pre-warm concluído: ready=${this.browsers.length}, ativos=${this.activeBrowsers}`);
  }

  async prewarmIfEnabled() {
    if (config.browser.prewarm?.enabled) {
      await this.prewarm();
    }
  }
}

module.exports = PlaywrightBrowserPool;
