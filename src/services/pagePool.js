/**
 * Pool de Páginas Reutilizáveis
 * Evita overhead de criação/destruição de páginas
 */

const Logger = require('../utils/logger');
const config = require('../config/app');

class PagePool {
  constructor() {
    this.availablePages = [];
    this.busyPages = new Set();
    this.pageCreationPromises = new Map();
    this.stats = {
      created: 0,
      reused: 0,
      destroyed: 0,
      maxConcurrent: 0
    };
    
    // Limpeza automática de páginas ociosas
    setInterval(() => this.cleanupIdlePages(), 60000); // 1 minuto
    
    Logger.info(`Page Pool inicializado - Máximo: ${config.browser.maxPagePool} páginas`);
  }

  // Obtém página do pool ou cria nova
  async getPage(browser) {
    // Tenta reutilizar página disponível
    if (this.availablePages.length > 0) {
      const page = this.availablePages.pop();
      
      try {
        // Verifica se página ainda está válida
        if (!page.isClosed()) {
          this.busyPages.add(page);
          this.stats.reused++;
          
          // Limpa estado da página
          await this.resetPage(page);
          
          Logger.debug(`Page Pool REUSE - Disponíveis: ${this.availablePages.length}`);
          return page;
        }
      } catch (error) {
        Logger.debug('Página inválida removida do pool');
      }
    }

    // Cria nova página se pool vazio ou páginas inválidas
    return await this.createNewPage(browser);
  }

  // Cria nova página com configurações otimizadas
  async createNewPage(browser) {
    try {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 800 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
        javaScriptEnabled: true,
        acceptDownloads: false,
        bypassCSP: true,
        ignoreHTTPSErrors: true,
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo'
      });

      // Configurações de performance
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      });

    
    await page.route('**/*', (route) => {
        const req = route.request();
        const type = req.resourceType();
        const url = req.url();
        if (['websocket', 'eventsource', 'media'].includes(type)) return route.abort();
        if (type === 'script' && /(googletagmanager|google-analytics|gtag|facebook|fbevents|hotjar|segment|mixpanel)/i.test(url)) return route.abort();
        return route.continue();
    });

      // Timeouts otimizados
      page.setDefaultTimeout(config.browser.pageTimeout);
      page.setDefaultNavigationTimeout(config.browser.browserTimeout);

      this.busyPages.add(page);
      this.stats.created++;
      this.stats.maxConcurrent = Math.max(this.stats.maxConcurrent, this.busyPages.size);
      
      Logger.debug(`Page Pool CREATE - Total criadas: ${this.stats.created}`);
      return page;

    } catch (error) {
      Logger.error('Erro ao criar página:', error);
      throw error;
    }
  }

  // Reseta página para reutilização
  async resetPage(page) {
    try {
      // Remove event listeners
      page.removeAllListeners();
      
      // Limpa storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        if (window.caches) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
      });

      // Reset de viewport se necessário
      await page.setViewport({ width: 1200, height: 800 });
      
    } catch (error) {
      Logger.debug('Erro ao resetar página, será descartada:', error.message);
      throw error;
    }
  }

  // Retorna página para o pool
  async releasePage(page) {
    if (!page || page.isClosed()) {
      return;
    }

    this.busyPages.delete(page);

    try {
      // Se pool não está cheio, retorna página para reutilização
      if (this.availablePages.length < config.browser.maxPagePool) {
        await this.resetPage(page);
        
        // Marca timestamp para limpeza automática
        page._poolTimestamp = Date.now();
        this.availablePages.push(page);
        
        Logger.debug(`Page Pool RELEASE - Disponíveis: ${this.availablePages.length}`);
      } else {
        // Pool cheio, destrói página
        await page.close();
        this.stats.destroyed++;
        Logger.debug('Page Pool DESTROY - Pool cheio');
      }
    } catch (error) {
      Logger.debug('Erro ao retornar página para pool:', error.message);
      try {
        await page.close();
        this.stats.destroyed++;
      } catch (closeError) {
        // Ignora erro de fechamento
      }
    }
  }

  // Limpa páginas ociosas automaticamente
  async cleanupIdlePages() {
    const now = Date.now();
    const idleTimeout = config.browser.pagePoolIdleTimeout;
    let cleaned = 0;

    const pagesToKeep = [];
    
    for (const page of this.availablePages) {
      const idleTime = now - (page._poolTimestamp || now);
      
      if (idleTime > idleTimeout || page.isClosed()) {
        try {
          if (!page.isClosed()) {
            await page.close();
          }
          this.stats.destroyed++;
          cleaned++;
        } catch (error) {
          Logger.debug('Erro ao limpar página ociosa:', error.message);
        }
      } else {
        pagesToKeep.push(page);
      }
    }

    this.availablePages = pagesToKeep;

    if (cleaned > 0) {
      Logger.info(`Page Pool cleanup: ${cleaned} páginas ociosas removidas`);
    }
  }

  // Força fechamento de todas as páginas
  async closeAll() {
    Logger.info(`Fechando todas as páginas do pool (${this.availablePages.length + this.busyPages.size})`);
    
    // Fecha páginas disponíveis
    for (const page of this.availablePages) {
      try {
        if (!page.isClosed()) {
          await page.close();
        }
      } catch (error) {
        Logger.debug('Erro ao fechar página disponível:', error.message);
      }
    }

    // Fecha páginas em uso (força)
    for (const page of this.busyPages) {
      try {
        if (!page.isClosed()) {
          await page.close();
        }
      } catch (error) {
        Logger.debug('Erro ao fechar página em uso:', error.message);
      }
    }

    this.availablePages = [];
    this.busyPages.clear();
  }

  // Estatísticas do pool
  getStats() {
    return {
      available: this.availablePages.length,
      busy: this.busyPages.size,
      total: this.availablePages.length + this.busyPages.size,
      maxPool: config.browser.maxPagePool,
      efficiency: this.stats.created > 0 
        ? ((this.stats.reused / (this.stats.created + this.stats.reused)) * 100).toFixed(1) + '%'
        : '0%',
      ...this.stats
    };
  }
}

module.exports = PagePool;
