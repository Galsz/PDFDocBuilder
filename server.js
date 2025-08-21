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
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupGracefulShutdown();
    this.startMonitoring();
  }

  setupMiddleware() {
    // Middleware básico
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use("/relatorio", express.static(path.join(__dirname, "public")));
    
    // Rate limiting
    this.app.use("/gerar-pdf", this.rateLimiter.middleware());
    
    // Disponibiliza browserPool para controllers
    this.app.locals.browserPool = this.browserPool;
    
    Logger.info("Middleware configurado");
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => this.pdfController.healthCheck(req, res));
    
    // Geração de PDF
    this.app.post("/gerar-pdf", (req, res) => this.pdfController.generatePDF(req, res));
    
    Logger.info("Rotas configuradas");
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      Logger.info(`Recebido ${signal}, iniciando graceful shutdown...`);
      
      try {
        await this.browserPool.closeAll();
        Logger.info("Browsers fechados com sucesso");
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
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const stats = this.browserPool.getStats();
      
      Logger.info(`MEMORY - RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`, {
        browsers: stats.activeBrowsers,
        pages: stats.totalPages,
        queue: stats.queueLength
      });
    }, config.logging.memoryLogInterval);

    // Limpeza periódica
    setInterval(async () => {
      try {
        await this.browserPool.cleanupIdleBrowsers();
      } catch (err) {
        Logger.error("Erro na limpeza periódica:", err);
      }
    }, config.logging.cleanupInterval);

    // Inicia limpeza do rate limiter
    this.rateLimiter.startCleanup();
    
    Logger.info("Monitoramento iniciado");
  }

  start() {
    this.app.listen(config.server.port, config.server.host, () => {
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
    });
  }
}

// Inicia o servidor
const server = new PDFServer();
server.start();

module.exports = PDFServer;
