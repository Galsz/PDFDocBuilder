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

  templates: {
    defaultTemplateId: process.env.DEFAULT_TEMPLATE_ID || "default"
  },

  reports: {
    defaultReportType: process.env.DEFAULT_REPORT_TYPE || "orcamento"
  },

  // Configurações do Playwright - OTIMIZADO PARA ALTA DEMANDA
  browser: {
    maxConcurrentBrowsers: parseInt(process.env.MAX_CONCURRENT_BROWSERS) || 4,
    maxPagesPerBrowser: parseInt(process.env.MAX_PAGES_PER_BROWSER) || 10,
    browserTimeout: parseInt(process.env.BROWSER_TIMEOUT) || 45000,
    pageTimeout: parseInt(process.env.PAGE_TIMEOUT) || 20000,
    // Timeout dedicado para aguardar vaga no pool (fila)
    queueTimeout: parseInt(process.env.QUEUE_TIMEOUT) || 45000,
    
    // Pool de páginas reutilizáveis
    enablePagePool: process.env.ENABLE_PAGE_POOL !== 'false',
    maxPagePool: parseInt(process.env.MAX_PAGE_POOL) || 20,
    pagePoolIdleTimeout: parseInt(process.env.PAGE_POOL_IDLE_TIMEOUT) || 30000,
    
    // Pre-aquecimento de browsers para evitar cold start
    prewarm: {
      enabled: process.env.PREWARM_ENABLED !== 'false',
      count: parseInt(process.env.PREWARM_COUNT) || undefined // undefined = maxBrowsers
    },
    
    // Argumentos ultra-otimizados para alta performance
    launchOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees,VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-sync',
        '--disable-default-apps',
        '--disable-web-security',
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-session-crashed-bubble',
        '--metrics-recording-only',
        '--no-first-run',
        '--no-zygote',
        '--memory-pressure-off',
        '--disable-ipc-flooding-protection',
        '--disable-domain-reliability',
        '--disable-component-update',
        '--aggressive-cache-discard',
        '--enable-fast-unload'
      ]
    }
  },

  // Configurações de rate limiting - AJUSTADO PARA ALTA DEMANDA
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minuto
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 300, // 5 req/segundo
    enableBurst: process.env.ENABLE_BURST !== 'false',
    burstLimit: parseInt(process.env.BURST_LIMIT) || 50 // Rajadas até 50 req
  },

  // Configurações de cache inteligente
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL) || 1800, // 30 minutos
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100, // 100 PDFs em memória
    // Chave baseada em licencaId, orcamentoId e hash estável de config
    // Inclua um campo "dataVersion" dentro de config para refletir mudanças de dados
    hashFields: (process.env.CACHE_HASH_FIELDS || 'licencaId,orcamentoId,templateId,reportType,configData').split(',')
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
