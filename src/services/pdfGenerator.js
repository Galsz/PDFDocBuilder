/**
 * Service responsável pela geração de PDFs
 * OTIMIZADO com cache e page pool para alta demanda
 */

const config = require("../config/app");
const Logger = require("../utils/logger");
const MemoryCache = require("./memoryCache");
const crypto = require("crypto");

class PDFGeneratorService {
  constructor(browserPool) {
    this.browserPool = browserPool;
    this.stats = {
      generated: 0,
      cached: 0,
      errors: 0,
      totalTime: 0,
      avgTime: 0,
    };
    this.reportStats = {};
  }

  async generatePDF(licencaId, orcamentoId, configData, options = {}) {
    const startTime = Date.now();
    const { forceRefresh = false, templateId, reportType } = options || {};
    const resolvedTemplateId =
      templateId || config.templates.defaultTemplateId;
    const resolvedReportType =
      reportType || config.reports.defaultReportType;
    const templateSegment = encodeURIComponent(resolvedTemplateId);
    const reportQueryParam = encodeURIComponent(resolvedReportType);
    // Hash estável do config para compor a chave do cache
    const sortKeys = (o) => {
      if (Array.isArray(o)) return o.map(sortKeys);
      if (o && typeof o === "object") {
        const sorted = {};
        Object.keys(o)
          .sort()
          .forEach((k) => {
            sorted[k] = sortKeys(o[k]);
          });
        return sorted;
      }
      return o;
    };
    const configHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(sortKeys(configData)))
      .digest("hex")
      .substring(0, 16);

    // Para compatibilidade com CACHE_HASH_FIELDS padrão ('configData') usamos a string do hash
    const requestData = {
      licencaId,
      orcamentoId,
      templateId: resolvedTemplateId,
      reportType: resolvedReportType,
      configData: configHash,
    };

    try {
      // Verifica cache primeiro
      const cacheKey = MemoryCache.generateKey(requestData);
      const cachedPDF = forceRefresh ? null : MemoryCache.get(cacheKey);

      if (cachedPDF) {
        this.stats.cached++;
        const duration = Date.now() - startTime;
        Logger.info(
          `PDF retornado do cache em ${duration}ms - Licença: ${licencaId}, Orçamento: ${orcamentoId}`,
          {
            templateId: resolvedTemplateId,
            reportType: resolvedReportType,
          }
        );
        this.trackReportEvent(resolvedReportType, {
          type: "cached",
          duration,
        });

        return {
          buffer: cachedPDF,
          fromCache: true,
          stats: {
            duration,
            cached: true,
            browserPool: this.browserPool.getStats(),
            cacheKey,
            configHash,
            templateId: resolvedTemplateId,
            reportType: resolvedReportType,
          },
        };
      }

      Logger.info(
        `Gerando PDF - Licença: ${licencaId}, Orçamento: ${orcamentoId}`,
        {
          templateId: resolvedTemplateId,
          reportType: resolvedReportType,
        }
      );

      // Obtém browser do pool
      const browser = await this.browserPool.getBrowser();
      this.browserPool.incrementPageCount(browser);

      let page;
      try {
        // Obtém página do pool (reutilização)
        page = await this.browserPool.getPage(browser);

        // Configurações específicas para esta requisição
        await page.setExtraHTTPHeaders({
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "User-Agent": "PDF-Generator/1.0",
        });

        // Timeouts específicos
        page.setDefaultTimeout(config.browser.pageTimeout);
        page.setDefaultNavigationTimeout(config.browser.browserTimeout);

        // URL otimizada
        const cfg = encodeURIComponent(JSON.stringify(configData));
        const url = `http://127.0.0.1:${config.server.port}/relatorio/themes/${templateSegment}/index.html?licencaId=${licencaId}&orcamentoId=${orcamentoId}&reportType=${reportQueryParam}&templateId=${templateSegment}&config=${cfg}&_t=${Date.now()}`;

        Logger.debug(`Navegando para: ${url}`);

        // Navegação otimizada
        await page.goto(url, {
          waitUntil: "domcontentloaded", // Mais rápido que networkidle
          timeout: config.browser.browserTimeout,
        });

        // Media query para impressão
        await page.emulateMedia({ media: "print" });

        // Espera adaptativa: primeiro janela curta, depois estende para relatórios longos
        const baseTimeout = Math.max(
          20000,
          config.browser.pageTimeout || 30000
        );
        const extraTimeout = Math.max(50000, baseTimeout);
        try {
          await page.waitForFunction(() => window.readyForPDF === true, {
            timeout: baseTimeout,
          });
        } catch (_) {
          Logger.info(
            `Aguardando fase estendida para relatório grande ( +${extraTimeout}ms )`
          );
          await page.waitForFunction(() => window.readyForPDF === true, {
            timeout: extraTimeout,
          });
        }

        // Garante que fontes web (Font Awesome) estejam carregadas antes de imprimir
        try {
          await page.waitForFunction(
            () => document.fonts && document.fonts.status === "loaded",
            { timeout: Math.min(10000, config.browser.pageTimeout) }
          );
        } catch (_) {
          // Se fontes não sinalizarem loaded a tempo, segue assim mesmo
        }

        // Aguarda um pouco mais para renderização completa
        await page.waitForTimeout(200);

        Logger.debug("Gerando PDF...");

        // Configuração otimizada de PDF
        const pdfOptions = {
          ...config.pdf,
          timeout: config.browser.pageTimeout,
          // Otimizações específicas
          omitBackground: false,
          tagged: false, // Remove acessibilidade para tamanho menor
          outline: false, // Remove outline para tamanho menor
        };

        const pdfBuffer = await page.pdf(pdfOptions);

        // Salva no cache para futuras requisições
        MemoryCache.set(cacheKey, pdfBuffer, {
          licencaId,
          orcamentoId,
          configHash,
          size: pdfBuffer.length,
          generated: new Date().toISOString(),
          templateId: resolvedTemplateId,
          reportType: resolvedReportType,
        });

        // Atualiza estatísticas
        const duration = Date.now() - startTime;
        this.updateStats(duration);
        this.trackReportEvent(resolvedReportType, {
          type: "generated",
          duration,
        });

        const stats = this.browserPool.getStats();
        Logger.info(
          `PDF gerado com sucesso em ${duration}ms - Tamanho: ${Math.round(
            pdfBuffer.length / 1024
          )}KB`,
          {
            browserPool: stats,
            cache: MemoryCache.getStats(),
            templateId: resolvedTemplateId,
            reportType: resolvedReportType,
          }
        );

        return {
          buffer: pdfBuffer,
          fromCache: false,
          stats: {
            duration,
            size: pdfBuffer.length,
            browserPool: stats,
            cache: MemoryCache.getStats(),
            cacheKey,
            configHash,
            templateId: resolvedTemplateId,
            reportType: resolvedReportType,
          },
        };
      } finally {
        // Libera página (retorna para pool ou fecha)
        if (page) {
          await this.browserPool.releasePage(page);
        }
        this.browserPool.decrementPageCount(browser);
      }
    } catch (err) {
      this.stats.errors++;
      this.trackReportEvent(resolvedReportType, { type: "error" });
      const duration = Date.now() - startTime;
      Logger.error(`Erro ao gerar PDF após ${duration}ms:`, {
        error: err.message,
        licencaId,
        orcamentoId,
        templateId: resolvedTemplateId,
        reportType: resolvedReportType,
        stack: err.stack.split("\n").slice(0, 3).join("\n"),
      });

      throw new Error(`Falha na geração do PDF: ${err.message}`);
    }
  }

  updateStats(duration) {
    this.stats.generated++;
    this.stats.totalTime += duration;
    this.stats.avgTime = Math.round(
      this.stats.totalTime / this.stats.generated
    );
  }

  getStats() {
    const cacheStats = MemoryCache.getStats();
    const browserStats = this.browserPool.getStats();

    const reports = Object.keys(this.reportStats).reduce((acc, key) => {
      const data = this.reportStats[key];
      acc[key] = {
        generated: data.generated,
        cached: data.cached,
        errors: data.errors,
        totalDuration: data.totalDuration,
        avgDuration: data.avgDuration,
        lastDuration: data.lastDuration,
        lastGeneratedAt: data.lastGeneratedAt,
        lastCacheHitAt: data.lastCacheHitAt,
        lastErrorAt: data.lastErrorAt,
      };
      return acc;
    }, {});

    return {
      requests: {
        total: this.stats.generated + this.stats.cached,
        generated: this.stats.generated,
        fromCache: this.stats.cached,
        errors: this.stats.errors,
        cacheHitRate:
          this.stats.generated + this.stats.cached > 0
            ? `${(
                (this.stats.cached /
                  (this.stats.generated + this.stats.cached)) *
                100
              ).toFixed(1)}%`
            : "0%",
      },
      performance: {
        avgGenerationTime: this.stats.avgTime,
        totalGenerationTime: this.stats.totalTime,
      },
      cache: cacheStats,
      browserPool: browserStats,
      reports,
    };
  }

  trackReportEvent(reportType, event = {}) {
    if (!reportType) return;

    if (!this.reportStats[reportType]) {
      this.reportStats[reportType] = {
        generated: 0,
        cached: 0,
        errors: 0,
        totalDuration: 0,
        avgDuration: 0,
        lastDuration: null,
        lastGeneratedAt: null,
        lastCacheHitAt: null,
        lastErrorAt: null,
      };
    }

    const record = this.reportStats[reportType];
    const nowIso = new Date().toISOString();

    if (event.type === "generated") {
      record.generated += 1;
      if (typeof event.duration === "number") {
        record.totalDuration += event.duration;
        record.lastDuration = event.duration;
        record.avgDuration = Math.round(record.totalDuration / record.generated);
      }
      record.lastGeneratedAt = nowIso;
    }

    if (event.type === "cached") {
      record.cached += 1;
      record.lastCacheHitAt = nowIso;
      if (typeof event.duration === "number") {
        record.lastDuration = event.duration;
      }
    }

    if (event.type === "error") {
      record.errors += 1;
      record.lastErrorAt = nowIso;
    }
  }
}

module.exports = PDFGeneratorService;
