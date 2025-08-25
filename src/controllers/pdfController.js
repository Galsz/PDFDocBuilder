/**
 * Controller para geração de PDFs
 */

const PDFGeneratorService = require("../services/pdfGenerator");
const Logger = require("../utils/logger");

class PDFController {
  constructor(browserPool) {
    this.pdfService = new PDFGeneratorService(browserPool);
  }

  async generatePDF(req, res) {
    const { licencaId, orcamentoId, config } = req.body;
    const forceRefresh = req.query.force === "true" || req.body?.force === true;

    // Validação de parâmetros
    if (!licencaId || !orcamentoId || !config) {
      return res.status(400).json({
        error: "Parâmetros ausentes.",
        required: ["licencaId", "orcamentoId", "config"],
        optional: ["config.dataVersion"],
      });
    }

    try {
      const result = await this.pdfService.generatePDF(
        licencaId,
        orcamentoId,
        config,
        { forceRefresh }
      );

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ORCAMENTO-${orcamentoId}.pdf"`,
        "X-PDF-Engine": "playwright-chromium",
        "X-Generation-Time": `${result.stats.duration}ms`,
        "X-Browser-Pool": JSON.stringify(result.stats.browserPool),
        "X-Config-Hash": result.stats.configHash,
        "X-Cache-Key": result.stats.cacheKey || "",
      });

      res.send(result.buffer);
    } catch (err) {
      Logger.error("Erro no controller de PDF:", err);

      res.status(500).json({
        error: "Erro ao gerar o PDF.",
        engine: "playwright-chromium",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }

  async healthCheck(req, res) {
    try {
      const stats = req.app.locals.browserPool.getStats();

      res.json({
        status: "ok",
        engine: "playwright-chromium",
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        browserPool: stats,
        config: {
          maxRequestsPerMinute:
            require("../config/app").rateLimit.maxRequestsPerMinute,
          maxConcurrentBrowsers:
            require("../config/app").browser.maxConcurrentBrowsers,
          maxPagesPerBrowser:
            require("../config/app").browser.maxPagesPerBrowser,
        },
      });
    } catch (err) {
      Logger.error("Erro no health check:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

module.exports = PDFController;
