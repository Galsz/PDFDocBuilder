/**
 * Service responsável pelo gerenciamento do pool de browsers Playwright
 */

const { chromium } = require("playwright");
const config = require("../config/app");
const Logger = require("../utils/logger");

class PlaywrightBrowserPool {
  constructor() {
    this.browsers = [];
    this.maxBrowsers = config.browser.maxConcurrentBrowsers;
    this.maxPagesPerBrowser = config.browser.maxPagesPerBrowser;
    this.activeBrowsers = 0;
    this.queue = [];
    this.browserPages = new Map();
    
    Logger.info(`Inicializando pool de browsers - Máximo: ${this.maxBrowsers}`);
  }

  async getBrowser() {
    // Procura browser com páginas disponíveis
    for (const browser of this.browsers) {
      const pageCount = this.browserPages.get(browser) || 0;
      if (pageCount < this.maxPagesPerBrowser && browser.isConnected()) {
        return browser;
      }
    }

    // Se pode criar mais browsers, crie um novo
    if (this.activeBrowsers < this.maxBrowsers) {
      this.activeBrowsers++;
      const browser = await this.createBrowser();
      this.browsers.push(browser);
      this.browserPages.set(browser, 0);
      return browser;
    }

    // Se não pode criar mais, aguarda na fila
    return new Promise((resolve) => {
      this.queue.push(resolve);
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
      this.activeBrowsers--;
    }
    this.processQueue();
  }

  processQueue() {
    if (this.queue.length > 0) {
      for (const browser of this.browsers) {
        const pageCount = this.browserPages.get(browser) || 0;
        if (pageCount < this.maxPagesPerBrowser && browser.isConnected()) {
          const resolve = this.queue.shift();
          resolve(browser);
          break;
        }
      }
    }
  }

  async closeAll() {
    Logger.info(`Fechando todos os browsers (${this.browsers.length})`);
    const allBrowsers = [...this.browsers];
    this.browsers = [];
    this.browserPages.clear();
    
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
    return {
      activeBrowsers: this.activeBrowsers,
      queueLength: this.queue.length,
      totalPages: Array.from(this.browserPages.values()).reduce((sum, count) => sum + count, 0)
    };
  }

  async cleanupIdleBrowsers() {
    const stats = this.getStats();
    
    // Se não há páginas ativas e temos muitos browsers, fecha alguns
    if (stats.totalPages === 0 && stats.activeBrowsers > 1) {
      Logger.info('Limpeza: fechando browsers ociosos');
      const browsersToClose = this.browsers.splice(1); // Mantém apenas 1
      for (const browser of browsersToClose) {
        try {
          await browser.close();
          this.removeBrowser(browser);
        } catch (err) {
          Logger.error('Erro ao fechar browser ocioso:', err);
        }
      }
    }
  }
}

module.exports = PlaywrightBrowserPool;
