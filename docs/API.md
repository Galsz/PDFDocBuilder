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
  },
  "dadosHash": "string (optional)"
}
```

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ORCAMENTO-{orcamentoId}.pdf"
X-PDF-Engine: playwright-chromium
X-Generation-Time: {duration}ms
X-Browser-Pool: {poolStats}
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

## 🧠 Cache

Para evitar gerar o mesmo PDF repetidas vezes, o serviço mantém um cache em memória por um período (TTL). A chave do cache é composta por:
- `licencaId`
- `orcamentoId`
- um hash do objeto `config`
- `dadosHash` (quando informado)

Assim, qualquer alteração nas configurações ou nos dados de origem invalida automaticamente o cache. Você pode fornecer o `dadosHash` baseado no conteúdo dos dados da proposta (ex.: hash SHA-256 do JSON) para garantir que mudanças sejam detectadas.

## 🔧 **Configuration**

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8095 | Porta do servidor |
| `HOST` | 0.0.0.0 | Host do servidor |
| `NODE_ENV` | development | Ambiente (development/production) |
| `MAX_CONCURRENT_BROWSERS` | 2 | Máximo de browsers simultâneos |
| `MAX_PAGES_PER_BROWSER` | 5 | Máximo de páginas por browser |
| `BROWSER_TIMEOUT` | 30000 | Timeout do browser (ms) |
| `PAGE_TIMEOUT` | 15000 | Timeout da página (ms) |
| `RATE_LIMIT_WINDOW` | 60000 | Janela de rate limit (ms) |
| `MAX_REQUESTS_PER_MINUTE` | 15 | Máximo de requests por minuto |
| `LOG_LEVEL` | info | Nível de log |
| `MEMORY_LOG_INTERVAL` | 30000 | Intervalo de log de memória (ms) |
| `CLEANUP_INTERVAL` | 300000 | Intervalo de limpeza (ms) |

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
