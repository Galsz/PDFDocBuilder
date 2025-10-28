/**
 * Controller para geração de PDFs
 */

const PDFGeneratorService = require("../services/pdfGenerator");
const Logger = require("../utils/logger");
const appConfig = require("../config/app");

const BOOLEAN_CONFIG_FIELDS = [
  "imprimirLogoEmTodas",
  "imprimirParcelas",
  "imprimirPromissorias",
  "imprimirValorTotal",
  "imprimirDesconto",
  "imprimirVariaveis",
  "imprimirValorUnitario",
  "imprimirMedidas",
  "imprimirVendaItens",
  "imprimirTimbre",
  "imprimirContrato",
];

function normalizeIdentifier(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

class PDFController {
  constructor(browserPool) {
    this.pdfService = new PDFGeneratorService(browserPool);
  }

  async generatePDF(req, res, overrides = {}) {
    const { licencaId, orcamentoId, config: configPayload } = req.body;
    const normalizedLicencaId = normalizeIdentifier(licencaId);
    const normalizedOrcamentoId = normalizeIdentifier(orcamentoId);
    const forceRefresh =
      overrides.forceRefresh ??
      (req.query.force === "true" || req.body?.force === true);
    const templateId =
      overrides.templateId ??
      req.body?.templateId ??
      req.query?.templateId ??
      appConfig.templates.defaultTemplateId;
    const reportType =
      overrides.reportType ??
      req.body?.reportType ??
      req.query?.reportType ??
      appConfig.reports.defaultReportType;

    // Validação de parâmetros
    if (!normalizedLicencaId || !normalizedOrcamentoId || !configPayload) {
      return res.status(400).json({
        error: "Parâmetros ausentes.",
        required: ["licencaId", "orcamentoId", "config"],
        optional: ["config.dataVersion", "templateId", "reportType"],
      });
    }

    const validationErrors = this.validatePayload({
      licencaId: normalizedLicencaId,
      orcamentoId: normalizedOrcamentoId,
      config: configPayload,
      templateId,
      reportType,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Payload inválido.",
        details: validationErrors,
      });
    }

    try {
      const result = await this.pdfService.generatePDF(
        normalizedLicencaId,
        normalizedOrcamentoId,
        configPayload,
        { forceRefresh, templateId, reportType }
      );

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ORCAMENTO-${normalizedOrcamentoId}.pdf"`,
        "X-PDF-Engine": "playwright-chromium",
        "X-Generation-Time": `${result.stats.duration}ms`,
        "X-Browser-Pool": JSON.stringify(result.stats.browserPool),
        "X-Config-Hash": result.stats.configHash,
        "X-Cache-Key": result.stats.cacheKey || "",
        "X-Template-Id": result.stats.templateId,
        "X-Report-Type": result.stats.reportType,
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
          maxRequestsPerMinute: appConfig.rateLimit.maxRequestsPerMinute,
          maxConcurrentBrowsers: appConfig.browser.maxConcurrentBrowsers,
          maxPagesPerBrowser: appConfig.browser.maxPagesPerBrowser,
        },
      });
    } catch (err) {
      Logger.error("Erro no health check:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  async generateOrcamentoReport(req, res) {
    return this.generatePDF(req, res, { reportType: "orcamento" });
  }

  validatePayload({ licencaId, orcamentoId, config, templateId, reportType }) {
    const errors = [];

    if (typeof licencaId !== "string" || licencaId.trim().length === 0) {
      errors.push({ field: "licencaId", message: "Deve ser uma string não vazia." });
    }

    if (typeof orcamentoId !== "string" || orcamentoId.trim().length === 0) {
      errors.push({ field: "orcamentoId", message: "Deve ser uma string não vazia." });
    }

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      errors.push({ field: "config", message: "Deve ser um objeto." });
    } else {
      BOOLEAN_CONFIG_FIELDS.forEach((key) => {
        if (key in config && typeof config[key] !== "boolean") {
          errors.push({
            field: `config.${key}`,
            message: "Deve ser um booleano.",
          });
        }
      });
    }

    if (templateId !== undefined && typeof templateId !== "string") {
      errors.push({ field: "templateId", message: "Deve ser uma string." });
    }

    if (reportType !== undefined && typeof reportType !== "string") {
      errors.push({ field: "reportType", message: "Deve ser uma string." });
    }

    return errors;
  }
}

module.exports = PDFController;
