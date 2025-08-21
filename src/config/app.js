/**
 * Configurações da aplicação PDF Generator
 */

module.exports = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 8095,
    host: process.env.HOST || "0.0.0.0",
    environment: process.env.NODE_ENV || "development"
  },

  // Configurações do Playwright
  browser: {
    maxConcurrentBrowsers: parseInt(process.env.MAX_CONCURRENT_BROWSERS) || 2,
    maxPagesPerBrowser: parseInt(process.env.MAX_PAGES_PER_BROWSER) || 5,
    browserTimeout: parseInt(process.env.BROWSER_TIMEOUT) || 30000,
    pageTimeout: parseInt(process.env.PAGE_TIMEOUT) || 15000,
    
    // Argumentos otimizados para Chromium
    launchOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-sync',
        '--disable-default-apps',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--memory-pressure-off',
        '--max_old_space_size=256',
        '--disable-ipc-flooding-protection'
      ]
    }
  },

  // Configurações de rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minuto
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 15
  },

  // Configurações de PDF
  pdf: {
    format: "A4",
    printBackground: true,
    scale: 1,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  },

  // Configurações de logs
  logging: {
    level: process.env.LOG_LEVEL || "info",
    memoryLogInterval: parseInt(process.env.MEMORY_LOG_INTERVAL) || 30000,
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL) || 300000
  }
};
