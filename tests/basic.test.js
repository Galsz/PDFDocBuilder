/**
 * Testes básicos para o serviço de PDF
 */

const http = require('http');

class TestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:8095';
    this.tests = [];
  }

  async testHealthCheck() {
    console.log('🧪 Testando Health Check...');
    
    return new Promise((resolve, reject) => {
      http.get(`${this.baseUrl}/health`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('✅ Health Check OK:', response.status);
            resolve(response);
          } else {
            console.log('❌ Health Check falhou:', res.statusCode);
            reject(new Error(`Health check failed: ${res.statusCode}`));
          }
        });
      }).on('error', reject);
    });
  }

  async testPDFGeneration() {
    console.log('🧪 Testando Geração de PDF...');
    
    const postData = JSON.stringify({
      licencaId: "test-123",
      orcamentoId: "test-456",
      config: {
        imprimirLogoEmTodas: true,
        imprimirParcelas: false,
        imprimirPromissorias: true
      }
    });

    const options = {
      hostname: 'localhost',
      port: 8095,
      path: '/gerar-pdf',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ PDF gerado com sucesso');
          console.log('📊 Headers:', res.headers);
          resolve(true);
        } else {
          console.log('❌ Geração de PDF falhou:', res.statusCode);
          reject(new Error(`PDF generation failed: ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async runAll() {
    console.log('🚀 Iniciando testes...\n');
    
    try {
      await this.testHealthCheck();
      console.log('');
      await this.testPDFGeneration();
      console.log('\n✅ Todos os testes passaram!');
    } catch (err) {
      console.error('\n❌ Teste falhou:', err.message);
      process.exit(1);
    }
  }
}

// Executa testes se chamado diretamente
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAll();
}

module.exports = TestRunner;
