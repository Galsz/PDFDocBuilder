# 📁 Estrutura do Projeto - PDF Generator Service

## 🏗️ **Nova Estrutura Modular**

```
PDFDocBuilder/
├── 📁 src/                           # Código fonte modular
│   ├── 📁 config/                    # Configurações
│   │   └── app.js                    # Configurações centralizadas
│   ├── 📁 controllers/               # Controllers (lógica de rotas)
│   │   └── pdfController.js          # Controller principal de PDF
│   ├── 📁 middleware/                # Middlewares customizados
│   │   └── rateLimiter.js            # Rate limiting
│   ├── 📁 services/                  # Lógica de negócio
│   │   ├── browserPool.js            # Pool de browsers Playwright
│   │   ├── pdfGenerator.js           # Serviço de geração de PDF
│   │   ├── memoryCache.js            # Cache em memória (TTL + LRU simples)
│   │   └── pagePool.js               # Pool de páginas Playwright
│   └── 📁 utils/                     # Utilitários
│       └── logger.js                 # Sistema de logs
├── 📁 public/                        # Arquivos estáticos (reorganizados)
│   ├── 📁 css/                       # Estilos
│   │   └── style.css                 # CSS principal
│   ├── 📁 js/                        # JavaScript
│   │   └── script.js                 # Script principal
│   ├── 📁 assets/                    # Assets categorizados
│   │   ├── 📁 images/                # Imagens e ícones
│   │   │   ├── logowhite_evo.svg
│   │   │   ├── logowv.png
│   │   │   └── building.png
│   │   └── 📁 fonts/                 # Fontes (futuro)
│   └── index.html                    # Template principal
├── 📁 tests/                         # Testes automatizados
│   └── basic.test.js                 # Testes básicos
├── 📁 docs/                          # Documentação
│   └── API.md                        # Documentação da API
├── 📁 logs/                          # Logs da aplicação
│   └── app.log                       # (auto-gerado)
├── 📄 server.js                      # Servidor principal (novo)
├── 📄 package.json                   # Dependências e scripts
├── 📄 Dockerfile                     # Container Docker
├── 📄 docker-compose.yml             # Orquestração
├── 📄 .gitignore                     # Arquivos ignorados
├── 📄 README.md                      # Documentação principal
└── 📄 monitor.sh                     # Script de monitoramento
```

## 🎯 **Benefícios da Nova Estrutura**

### **✅ Separação de Responsabilidades**
- **Controllers**: Lógica de rotas e validação
- **Services**: Lógica de negócio pura
- **Middleware**: Funcionalidades transversais
- **Config**: Configurações centralizadas
- **Utils**: Utilitários reutilizáveis

### **✅ Manutenibilidade**
- Código modular e testável
- Fácil localização de funcionalidades
- Adição simples de novos recursos
- Debugging mais eficiente

### **✅ Escalabilidade**
- Fácil adição de novos controllers
- Services independentes
- Configuração flexível
- Testes organizados

### **✅ Profissionalismo**
- Estrutura padrão da indústria
- Documentação organizada
- Logs estruturados
- Assets categorizados

## 🔄 **Migração Implementada**

### **Arquivos Movidos:**
- `style.css` → `public/css/style.css`
- `script.js` → `public/js/script.js`
- `assets/*.png,*.svg` → `public/assets/images/`

### **Código Refatorado:**
- **server.js**: De monolítico para modular
- **browserPool**: Extraído para service dedicado
- **rateLimiter**: Middleware independente
- **logger**: Sistema de logs estruturado
- **config**: Configurações centralizadas

### **Novos Recursos:**
- Sistema de logs em arquivo
- Testes automatizados básicos
- Documentação da API
- Monitoramento estruturado
- Graceful shutdown melhorado
- Cache com chave baseada em `licencaId`,`orcamentoId` e hash de `config` (use `config.dataVersion` para invalidar)

## 📊 **Comparação: Antes vs Depois**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Arquivos** | 1 server.js (300+ linhas) | 8+ arquivos modulares |
| **Manutenção** | Difícil (tudo junto) | Fácil (separado) |
| **Testes** | Inexistente | Estrutura criada |
| **Logs** | Console simples | Sistema estruturado |
| **Config** | Hardcoded | Centralized & flexible |
| **Assets** | Pasta única | Categorizados |
| **Docs** | README básico | API + estrutura |

## 🚀 **Próximos Passos Sugeridos**

1. **Implementar testes unitários** para cada service
2. **Adicionar middleware de autenticação** se necessário
3. **Aprimorar o service de cache** (deduplicação in-flight, métricas)
4. **Implementar métricas** (Prometheus/Grafana)
5. **Adicionar CI/CD pipeline**
6. **Criar docker-compose para desenvolvimento**

Esta estrutura segue as **melhores práticas** de desenvolvimento Node.js e está pronta para crescer com seu projeto! 🎉

## 🧩 Componentes Compartilhados

- `public/components/common/` hospeda blocos neutros reutilizáveis por qualquer tema ou relatório.
- Cada componente registrado via `ComponentRegistry.registerCommon` informa um contrato leve (`definition.contract`) descrevendo props esperados.
- Resolução de componentes considera a seguinte ordem de precedência:
	1. overrides específicos de relatório (`ComponentRegistry.registerReport` / `setReportOverrides`)
	2. overrides do tema (`ComponentRegistry.register` | `registerTheme`)
	3. fallback dos componentes comuns
- Componentes disponíveis atualmente:
	- `layout.header`: cabeçalho padrão com logo/licença
	- `layout.footer`: rodapé com paginação e dados da licença
	- `assinar.bloco`: bloco de assinaturas padrão
- Guidelines de composição:
	- **Nomenclatura**: use o padrão `dominio.subdominio` (ex.: `layout.header`).
	- **Coesão**: cada componente deve encapsular apenas um bloco visual e receber dados via props.
	- **Testabilidade**: mantenha `render` puro, sem efeitos colaterais, facilitando snapshot/render tests.

## 📋 Manifests de Relatórios

- Cada relatório possui um manifesto JSON versionado em `public/manifests/<reportType>/<version>.json`.
- O manifesto descreve a ordem dos blocos (`component`, `collection`, `richText`) e regras condicionais (`when`, `allOf`, `anyOf`).
- `ManifestRuntime` carrega o manifesto adequado (_fallback_ para `orcamento@v1`) e instancia componentes via `ComponentRegistry`.
- Anexos (ex.: promissória, contrato) são modelados no campo `attachments` para gerar páginas adicionais após a paginação principal.
- Para novas versões, incremente o diretório (`v2`, `v3`) mantendo compatibilidade retroativa através de `config.manifestVersion`.
