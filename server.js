/**
 * PDF Generator Service - Servidor Principal
 * Arquitetura modular com Playwright
 */

// Carrega variáveis de ambiente primeiro
require('dotenv').config();

const express = require("express");
const path = require("path");

// Importações dos módulos
const config = require("./src/config/app");
const Logger = require("./src/utils/logger");
const BrowserPool = require("./src/services/browserPool");
const PDFController = require("./src/controllers/pdfController");
const RateLimiter = require("./src/middleware/rateLimiter");

class PDFServer {
  constructor() {
    this.app = express();
    this.browserPool = new BrowserPool();
    this.pdfController = new PDFController(this.browserPool);
    this.rateLimiter = new RateLimiter();
    this.monitoringIntervals = [];
    this.serverInstance = null;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupGracefulShutdown();
    this.startMonitoring();
  }

  setupMiddleware() {
    // Middleware básico
    this.app.use(express.json({ limit: "10mb" }));
    const publicDir = path.join(__dirname, "public");
    const themesDir = path.join(publicDir, "themes");
    const assetsDir = path.join(publicDir, "assets");
    const componentsDir = path.join(publicDir, "components");
    const manifestsDir = path.join(publicDir, "manifests");
    const reportsDir = path.join(publicDir, "reports");

    // Serve temas, assets compartilhados e artefatos de relatório com rotas explícitas
    this.app.use(
      "/relatorio/themes",
      express.static(themesDir, { extensions: ["html"] })
    );
    this.app.use(
      "/relatorio/components",
      express.static(componentsDir, { extensions: ["js"] })
    );
    this.app.use(
      "/relatorio/assets",
      express.static(assetsDir, { maxAge: "6h", immutable: false })
    );
    this.app.use(
      "/relatorio/manifests",
      express.static(manifestsDir, { cacheControl: false, etag: false })
    );
    this.app.use("/relatorio/reports", express.static(reportsDir));

    this.app.get("/relatorio", (_, res) =>
      res.sendFile(path.join(publicDir, "index.html"))
    );
    this.app.get("/relatorio/index.html", (_, res) =>
      res.sendFile(path.join(publicDir, "index.html"))
    );
    
    // Rate limiting
    this.app.use("/gerar-pdf", this.rateLimiter.middleware());
    this.app.use(
      "/relatorios/orcamento",
      this.rateLimiter.middleware()
    );
    
    // Disponibiliza browserPool para controllers
    this.app.locals.browserPool = this.browserPool;
    
    Logger.info("Middleware configurado");
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => this.pdfController.healthCheck(req, res));
    
    // Geração de PDF
    this.app.post("/gerar-pdf", (req, res) => this.pdfController.generatePDF(req, res));
    this.app.post("/relatorios/orcamento", (req, res) =>
      this.pdfController.generateOrcamentoReport(req, res)
    );
    
    Logger.info("Rotas configuradas");
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      Logger.info(`Recebido ${signal}, iniciando graceful shutdown...`);
      
      try {
        await this.stop();
        Logger.info("Serviço finalizado com sucesso");
        process.exit(0);
      } catch (err) {
        Logger.error("Erro durante shutdown:", err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    Logger.info("Graceful shutdown configurado");
  }

  startMonitoring() {
    // Monitoramento de memória
    const memoryInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const stats = this.browserPool.getStats();
      
      Logger.info(`MEMORY - RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`, {
        browsers: stats.activeBrowsers,
        pages: stats.totalPages,
        queue: stats.queueLength
      });
    }, config.logging.memoryLogInterval);
    this.monitoringIntervals.push(memoryInterval);

    // Limpeza periódica
    const cleanupInterval = setInterval(async () => {
      try {
        await this.browserPool.cleanupIdleBrowsers();
      } catch (err) {
        Logger.error("Erro na limpeza periódica:", err);
      }
    }, config.logging.cleanupInterval);
    this.monitoringIntervals.push(cleanupInterval);

    // Inicia limpeza do rate limiter
    this.rateLimiter.startCleanup();
    
    Logger.info("Monitoramento iniciado");
  }

  async start() {
    // Pre-warm de browsers para evitar cold start, se habilitado
    if (typeof this.browserPool.prewarmIfEnabled === 'function') {
      await this.browserPool.prewarmIfEnabled();
    }

    await new Promise((resolve, reject) => {
      this.serverInstance = this.app
        .listen(config.server.port, config.server.host, () => {
          Logger.info(`🚀 PDF Generator Service iniciado`);
          Logger.info(`Engine: Playwright + Chromium`);
          Logger.info(`Servidor: http://${config.server.host}:${config.server.port}`);
          Logger.info(`Ambiente: ${config.server.environment}`);
          Logger.info(`Health check: http://${config.server.host}:${config.server.port}/health`);
          Logger.info('Configurações:', {
            maxBrowsers: config.browser.maxConcurrentBrowsers,
            maxPagesPerBrowser: config.browser.maxPagesPerBrowser,
            rateLimit: config.rateLimit.maxRequestsPerMinute
          });
          resolve();
        })
        .on('error', reject);
    });
  }

  async stop() {
    if (this.monitoringIntervals.length) {
      this.monitoringIntervals.forEach((intervalId) => clearInterval(intervalId));
      this.monitoringIntervals = [];
    }

    if (typeof this.rateLimiter.stopCleanup === 'function') {
      this.rateLimiter.stopCleanup();
    }

    await this.browserPool.closeAll();

    if (this.serverInstance) {
      await new Promise((resolve, reject) => {
        this.serverInstance.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      this.serverInstance = null;
    }
  }

  getPort() {
    if (!this.serverInstance) {
      return null;
    }
    const address = this.serverInstance.address();
    if (typeof address === 'object' && address) {
      return address.port;
    }
    return address;
  }
}

module.exports = PDFServer;

if (require.main === module) {
  const server = new PDFServer();
  server.start().catch(err => {
    Logger.error('Falha ao iniciar servidor:', err);
    process.exit(1);
  });
}
