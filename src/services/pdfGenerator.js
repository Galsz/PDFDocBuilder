/**
 * Service responsável pela geração de PDFs
 */

const config = require("../config/app");
const Logger = require("../utils/logger");

class PDFGeneratorService {
  constructor(browserPool) {
    this.browserPool = browserPool;
  }

  async generatePDF(licencaId, orcamentoId, configData) {
    let browser;
    let page;
    const startTime = Date.now();
    
    try {
      Logger.info(`Iniciando geração PDF - Licença: ${licencaId}, Orçamento: ${orcamentoId}`);
      
      // Obtém browser do pool
      browser = await this.browserPool.getBrowser();
      this.browserPool.incrementPageCount(browser);
      
      // Cria nova página com configurações otimizadas
      page = await browser.newPage({
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

      // Configurações de timeout
      page.setDefaultTimeout(config.browser.pageTimeout);
      page.setDefaultNavigationTimeout(config.browser.browserTimeout);
      
      // Bloqueia recursos desnecessários
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['font', 'media'].includes(resourceType)) {
          route.continue();
        } else if (['websocket', 'manifest'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      // Constrói URL
      const cfg = encodeURIComponent(JSON.stringify(configData));
      const url = `http://127.0.0.1:${config.server.port}/relatorio/index.html?licencaId=${licencaId}&orcamentoId=${orcamentoId}&config=${cfg}`;

      Logger.info(`Navegando para: ${url}`);

      await page.goto(url, { 
        waitUntil: "networkidle", 
        timeout: config.browser.browserTimeout 
      });
      
      await page.emulateMedia({ media: 'screen' });
      
      // Aguarda o sinal de que o PDF está pronto
      await page.waitForFunction("window.readyForPDF === true", {
        timeout: config.browser.pageTimeout,
      });

      Logger.info('Gerando PDF...');

      const pdfBuffer = await page.pdf(config.pdf);

      // Cleanup da página
      await page.close();
      this.browserPool.decrementPageCount(browser);

      const duration = Date.now() - startTime;
      const stats = this.browserPool.getStats();
      
      Logger.info(`PDF gerado com sucesso em ${duration}ms - Tamanho: ${pdfBuffer.length} bytes`, { stats });

      return {
        buffer: pdfBuffer,
        stats: {
          duration,
          size: pdfBuffer.length,
          browserPool: stats
        }
      };
      
    } catch (err) {
      const duration = Date.now() - startTime;
      Logger.error(`Erro ao gerar PDF após ${duration}ms:`, err);
      
      // Cleanup em caso de erro
      if (page) {
        try {
          await page.close();
          if (browser) this.browserPool.decrementPageCount(browser);
        } catch (closeErr) {
          Logger.error('Erro ao fechar página:', closeErr);
        }
      }
      
      throw err;
    }
  }
}

module.exports = PDFGeneratorService;
