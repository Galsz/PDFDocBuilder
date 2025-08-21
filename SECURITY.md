# Security Guidelines - PDF Generator Service

## 🔒 Dados Sensíveis Identificados

### ✅ Arquivos Produção (Seguros)
- `server.js` - Usa variáveis de ambiente corretamente
- `src/config/app.js` - Configuração segura com fallbacks
- `src/services/pdfGenerator.js` - URLs dinâmicas baseadas em config

### ⚠️ Arquivos de Desenvolvimento/Backup (Revisar antes de deploy)
- `server-api-externa.js` - Contém API keys hardcodadas (linha 7-8)
- `server-old.js` - Arquivo de backup, pode conter dados sensíveis
- `public/js/script.js` - URL de API de desenvolvimento hardcodada (linha 719)

### 🔍 URLs Expostas
- `https://dev.wvetro.com.br` - URL de desenvolvimento no frontend
- `127.0.0.1` - IPs localhost (seguros para desenvolvimento)

## 🛡️ Recomendações de Segurança

### 1. Variáveis de Ambiente
```bash
# Sempre usar .env para dados sensíveis
PDF_API_KEY=your-real-api-key
PDF_API_USER_ID=your-real-user-id
CORS_ORIGIN=https://your-production-domain.com
```

### 2. Remover Antes do Deploy
- Deletar arquivos `server-old.js`, `server-api-externa.js`
- Atualizar URL de desenvolvimento no `public/js/script.js`
- Validar que não há logs com dados sensíveis

### 3. Docker Security
- Container roda como usuário não-root
- Limites de memória e CPU configurados
- Portas expostas apenas as necessárias

### 4. Rate Limiting
- 100 requests por 15 minutos por IP
- Configurável via variáveis de ambiente

### 5. Logs
- Não logam dados sensíveis dos usuários
- Estruturados com níveis apropriados
- Rotação automática configurada

## 🚀 Checklist Pré-Deploy

- [ ] Arquivo `.env` configurado com valores reais
- [ ] URLs de desenvolvimento substituídas por produção
- [ ] Arquivos de backup removidos
- [ ] Testes de segurança executados
- [ ] Logs revisados para vazamentos de dados
- [ ] CORS configurado para domínio de produção
- [ ] Rate limiting testado
- [ ] Monitoramento de recursos configurado
