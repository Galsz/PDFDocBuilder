/**
 * Service responsável pela geração de PDFs
 * OTIMIZADO com cache e page pool para alta demanda
 */

const config = require("../config/app");
const Logger = require("../utils/logger");
const MemoryCache = require("./memoryCache");
const crypto = require('crypto');

class PDFGeneratorService {
  constructor(browserPool) {
    this.browserPool = browserPool;
    this.stats = {
      generated: 0,
      cached: 0,
      errors: 0,
      totalTime: 0,
      avgTime: 0
    };
  }

  async generatePDF(licencaId, orcamentoId, configData, dadosHash) {
    const startTime = Date.now();
    // Hash estável do config para compor a chave do cache
    const sortKeys = (o) => {
      if (Array.isArray(o)) return o.map(sortKeys);
      if (o && typeof o === 'object') {
        const sorted = {};
        Object.keys(o).sort().forEach(k => { sorted[k] = sortKeys(o[k]); });
        return sorted;
      }
      return o;
    };
    const configHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(sortKeys(configData)))
      .digest('hex')
      .substring(0, 16);

    // Para compatibilidade com CACHE_HASH_FIELDS padrão ('configData') usamos a string do hash
    const requestData = { licencaId, orcamentoId, configData: configHash, dadosHash };
    
    try {
      // Verifica cache primeiro
      const cacheKey = MemoryCache.generateKey(requestData);
      const cachedPDF = MemoryCache.get(cacheKey);
      
      if (cachedPDF) {
        this.stats.cached++;
        const duration = Date.now() - startTime;
        Logger.info(`PDF retornado do cache em ${duration}ms - Licença: ${licencaId}, Orçamento: ${orcamentoId}`);
        
        return {
          buffer: cachedPDF,
          fromCache: true,
          stats: {
            duration,
            cached: true,
            browserPool: this.browserPool.getStats()
          }
        };
      }

      Logger.info(`Gerando PDF - Licença: ${licencaId}, Orçamento: ${orcamentoId}`);
      
      // Obtém browser do pool
      const browser = await this.browserPool.getBrowser();
      this.browserPool.incrementPageCount(browser);
      
      let page;
      try {
        // Obtém página do pool (reutilização)
        page = await this.browserPool.getPage(browser);
        
        // Configurações específicas para esta requisição
        await page.setExtraHTTPHeaders({
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'PDF-Generator/1.0'
        });

        // Timeouts específicos
        page.setDefaultTimeout(config.browser.pageTimeout);
        page.setDefaultNavigationTimeout(config.browser.browserTimeout);
        
        // URL otimizada
  const cfg = encodeURIComponent(JSON.stringify(configData));
        const url = `http://127.0.0.1:${config.server.port}/relatorio/index.html?licencaId=${licencaId}&orcamentoId=${orcamentoId}&config=${cfg}&_t=${Date.now()}`;

        Logger.debug(`Navegando para: ${url}`);

        // Navegação otimizada
        await page.goto(url, { 
          waitUntil: "domcontentloaded", // Mais rápido que networkidle
          timeout: config.browser.browserTimeout 
        });
        
        // Media query para impressão
        await page.emulateMedia({ media: 'print' });
        
        // Aguarda carregamento específico do PDF
        await page.waitForFunction("window.readyForPDF === true || document.readyState === 'complete'", {
          timeout: config.browser.pageTimeout,
        });

        // Garante que fontes web (Font Awesome) estejam carregadas antes de imprimir
        try {
          await page.waitForFunction(
            () => document.fonts && document.fonts.status === 'loaded',
            { timeout: Math.min(5000, config.browser.pageTimeout) }
          );
        } catch (_) {
          // Se fontes não sinalizarem loaded a tempo, segue assim mesmo
        }

        // Aguarda um pouco mais para renderização completa
        await page.waitForTimeout(100);

        Logger.debug('Gerando PDF...');

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
          dadosHash,
          size: pdfBuffer.length,
          generated: new Date().toISOString()
        });

        // Atualiza estatísticas
        const duration = Date.now() - startTime;
        this.updateStats(duration);
        
        const stats = this.browserPool.getStats();
        Logger.info(`PDF gerado com sucesso em ${duration}ms - Tamanho: ${Math.round(pdfBuffer.length/1024)}KB`, { 
          browserPool: stats,
          cache: MemoryCache.getStats()
        });

        return {
          buffer: pdfBuffer,
          fromCache: false,
          stats: {
            duration,
            size: pdfBuffer.length,
            browserPool: stats,
            cache: MemoryCache.getStats()
          }
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
      const duration = Date.now() - startTime;
      Logger.error(`Erro ao gerar PDF após ${duration}ms:`, {
        error: err.message,
        licencaId,
        orcamentoId,
        stack: err.stack.split('\n').slice(0, 3).join('\n')
      });
      
      throw new Error(`Falha na geração do PDF: ${err.message}`);
    }
  }

  updateStats(duration) {
    this.stats.generated++;
    this.stats.totalTime += duration;
    this.stats.avgTime = Math.round(this.stats.totalTime / this.stats.generated);
  }

  getStats() {
    const cacheStats = MemoryCache.getStats();
    const browserStats = this.browserPool.getStats();
    
    return {
      requests: {
        total: this.stats.generated + this.stats.cached,
        generated: this.stats.generated,
        fromCache: this.stats.cached,
        errors: this.stats.errors,
        cacheHitRate: this.stats.generated + this.stats.cached > 0 
          ? `${((this.stats.cached / (this.stats.generated + this.stats.cached)) * 100).toFixed(1)}%`
          : '0%'
      },
      performance: {
        avgGenerationTime: this.stats.avgTime,
        totalGenerationTime: this.stats.totalTime
      },
      cache: cacheStats,
      browserPool: browserStats
    };
  }
}

module.exports = PDFGeneratorService;
