# 📚 API Documentation - PDF Generator Service

## 🎯 **Endpoints**

### **GET /health**
Health check do serviço e informações do pool de browsers.

**Response:**
```json
{
  "status": "ok",
  "engine": "playwright-chromium",
  "platform": "linux",
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "uptime": 120.5,
  "browserPool": {
    "activeBrowsers": 1,
    "queueLength": 0,
    "totalPages": 0
  },
  "config": {
    "maxRequestsPerMinute": 15,
    "maxConcurrentBrowsers": 2,
    "maxPagesPerBrowser": 5
  }
}
```

### **POST /gerar-pdf**
Gera um PDF a partir dos parâmetros fornecidos.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "licencaId": "string (required)",
  "orcamentoId": "string (required)", 
  "templateId": "string (optional, default: \"default\")",
  "reportType": "string (optional, default: \"orcamento\")",
  "config": {
    "imprimirLogoEmTodas": boolean,
    "imprimirParcelas": boolean,
    "imprimirPromissorias": boolean,
    "imprimirValorTotal": boolean,
    "imprimirDesconto": boolean,
    "imprimirVariaveis": boolean,
    "imprimirValorUnitario": boolean,
    "imprimirMedidas": boolean,
    "imprimirVendaItens": boolean,
    "imprimirTimbre": boolean,
    "imprimirContrato": boolean
  }
}
```

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ORCAMENTO-{orcamentoId}.pdf"
X-PDF-Engine: playwright-chromium
X-Generation-Time: {duration}ms
X-Browser-Pool: {poolStats}
X-Config-Hash: {configHash}
X-Cache-Key: {cacheKey}
X-Template-Id: {templateId}
X-Report-Type: {reportType}
```

**Success Response (200):**
Binary PDF data

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Parâmetros ausentes.",
  "required": ["licencaId", "orcamentoId", "config"]
}
```

**429 Too Many Requests:**
```json
{
  "error": "Muitas requisições. Tente novamente em 1 minuto.",
  "retryAfter": 45
}
```

**500 Internal Server Error:**
```json
{
  "error": "Erro ao gerar o PDF.",
  "engine": "playwright-chromium",
  "details": "Error message (only in development)"
}
```

### **POST /relatorios/orcamento**
Endpoint ilustrativo que fixa `reportType="orcamento"` e utiliza os mesmos parâmetros de `/gerar-pdf`. Ideal para consumidores que ainda não distinguem relatórios por tipo.

**Body mínimo:**
```json
{
  "licencaId": "string",
  "orcamentoId": "string",
  "config": { "imprimirLogoEmTodas": true }
}
```

**Comportamento:**
- `reportType` forçado para `orcamento` (ignora valores enviados pelo cliente).
- `templateId` assume `default` quando não informado.
- Retorna os mesmos headers e payload do endpoint principal.

## 🧠 Cache

Para evitar gerar o mesmo PDF repetidas vezes, o serviço mantém um cache em memória por um período (TTL). A chave do cache é composta por:
- `licencaId`
- `orcamentoId`
- `templateId`
- `reportType`
- um hash estável do objeto `config`

Recomendação: inclua `dataVersion` dentro de `config` (ex.: ISO-8601 ou versão numérica). Quando `dataVersion` mudar, o hash de `config` muda e o cache é invalidado automaticamente.

## 🔧 **Configuration**

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8095 | Porta do servidor |
| `HOST` | 0.0.0.0 | Host do servidor |
| `NODE_ENV` | development | Ambiente (development/production) |
| `MAX_CONCURRENT_BROWSERS` | 4 | Máximo de browsers simultâneos |
| `MAX_PAGES_PER_BROWSER` | 10 | Máximo de páginas por browser |
| `BROWSER_TIMEOUT` | 45000 | Timeout do browser (ms) |
| `PAGE_TIMEOUT` | 20000 | Timeout da página (ms) |
| `QUEUE_TIMEOUT` | 45000 | Janela de espera da fila (ms) |
| `RATE_LIMIT_WINDOW` | 60000 | Janela de rate limit (ms) |
| `MAX_REQUESTS_PER_MINUTE` | 300 | Máximo de requests por minuto |
| `LOG_LEVEL` | info | Nível de log |
| `MEMORY_LOG_INTERVAL` | 30000 | Intervalo de log de memória (ms) |
| `CLEANUP_INTERVAL` | 300000 | Intervalo de limpeza (ms) |

## 🛠️ **Guidelines para Novos Endpoints**

- Sempre defina `reportType` explícito no handler e documente o comportamento (mesmo que seja igual ao default).
- Permita `templateId` customizado, mas mantenha fallback em `config.templates.defaultTemplateId` para compatibilidade.
- Reutilize o controller principal (`PDFController.generatePDF`) com overrides para manter validações comuns.
- Propague `templateId` e `reportType` para headers e cache (garante observabilidade e isolamento dos PDFs gerados).
- Atualize testes automatizados adicionando um cenário smoke por endpoint criado.

## 📊 **Monitoring**

### **Logs**
- Console output com timestamps
- File logging em produção (`logs/app.log`)
- Monitoramento de memória a cada 30s
- Métricas do pool de browsers

### **Health Metrics**
- Status do serviço
- Uso de memória (RSS, Heap)
- Uptime do processo
- Estatísticas do pool de browsers
- Configurações ativas

## 🚨 **Error Handling**

### **Rate Limiting**
- 15 requests por minuto por IP
- Header `retryAfter` indica quando tentar novamente
- Limpeza automática de contadores antigos

### **Browser Management**
- Pool de browsers para otimização
- Cleanup automático de browsers ociosos
- Graceful shutdown com fechamento adequado
- Prevenção de processos zumbi

### **Memory Management**
- Limite de heap Node.js configurável
- Flags otimizadas do Chromium
- Monitoramento contínuo de memória
- Limpeza periódica de recursos
