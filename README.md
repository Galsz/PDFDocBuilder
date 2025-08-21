
# 📄 PDF Generator Service - Playwright Edition

## 🚀 **Solução Otimizada para EC2 com Múltiplos Usuários**

Microserviço em **Node.js + Playwright** que gera PDFs (propostas / orçamentos, contratos, listas de materiais…) a partir de páginas HTML totalmente dinâmicas.  
A renderização é feita em modo *headless* via **Playwright + Chromium**; assim o resultado final no PDF é exatamente igual ao exibido no browser.

**✅ OTIMIZADO para EC2 com múltiplos usuários simultâneos**  
**✅ Pool de browsers inteligente para reduzir consumo de memória**  
**✅ Prevenção de processos zumbi e vazamentos de memória**  
**✅ Suporte completo a CSS moderno e SVGs**

## 🎯 **Por que Playwright?**

| Característica | Playwright | Puppeteer | wkhtmltopdf |
|---------------|------------|-----------|-------------|
| **CSS Moderno** | ✅ Excelente | ✅ Excelente | ❌ Limitado |
| **SVG Support** | ✅ Completo | ✅ Completo | ⚠️ Básico |
| **Uso de Memória** | ✅ Otimizado | ❌ Alto | ✅ Baixo |
| **Processos Zumbi** | ✅ Prevenido | ⚠️ Possível | ✅ Raro |
| **Performance** | ✅ Rápido | ⚠️ Médio | ✅ Muito Rápido |
| **Estabilidade** | ✅ Excelente | ⚠️ Boa | ✅ Boa |

## 📊 **Otimizações Implementadas**

### **1. Pool de Browsers Inteligente**
- Máximo de 2 browsers simultâneos (configurável)
- Até 5 páginas por browser para reutilização
- Cleanup automático de browsers ociosos

### **2. Prevenção de Vazamentos**
- Graceful shutdown com fechamento adequado
- Limpeza periódica de recursos não utilizados
- Monitoramento contínuo de memória

### **3. Configurações Anti-Zombie**
- `--single-process` para evitar múltiplos processos
- `--no-zygote` para prevenção de processos zumbi
- Timeout e cleanup adequados

### **4. Rate Limiting Inteligente**
- Máximo 15 PDFs por minuto por IP
- Fila de requisições para controle de concorrência



## ⚙️ Stack

| Camada | Tecnologias |
|--------|-------------|
| Back-end | Node.js · Express |
| Renderização | Puppeteer (core) · Chromium |
| Front-end dos PDFs | HTML · CSS (Grid & Flex) · JavaScript |
| Contêiner | Docker · Docker Compose |



## 📁 Estrutura do repositório

```

.
├── Dockerfile                 # Imagem com Node + Chromium + dependências
├── docker-compose.yml         # Orquestração do container
├── server.js                  # Servidor Express que expõe /gerar-pdf
├── package.json               # Dependências NPM
├── public/
│   ├── index.html             # Página “molde” renderizada no browser/PDF
│   ├── style.css              # Estilos para tela e impressão
│   ├── script.js              # Carrega dados via fetch e monta o documento
│   └── assets/                # Logos e imagens usadas nos relatórios
│       ├── building.png
│       ├── logowhite\_evo.svg
│       └── …                  # outras imagens opcionais
└── README.md

```

Caso você possua variantes (ex.: `index-inline.html`) ou outros assets, inclua-os dentro de `public/` e o serviço continuará funcionando.

---

## 🚀 Subindo com Docker Compose

> Pré-requisitos: **Docker** ≥ 20 e **docker-compose** instalados (na sua máquina ou na instância EC2).

```bash
git clone https://github.com/Galsz/PDFDocBuilder.git
cd PDFDocBuilder
docker-compose up --build -d
````

O serviço ficará disponível em **[http://localhost:8092](http://localhost:8092)** (ou no IP público da EC2).

### Teste rápido

```bash
curl -X POST http://localhost:8095/gerar-pdf \
     -H "Content-Type: application/json" \
     -d '{
           "licencaId": 123,
           "orcamentoId": 456,
           "config": {
             "imprimirContrato": true,
             "imprimirMedidas": true,
             "imprimirValorUnitario": true
           }
         }' \
     --output ORCAMENTO-456.pdf
```

O arquivo `ORCAMENTO-456.pdf` será gravado no diretório corrente se tudo der certo.
(Use `docker logs <container>` para ver mensagens do serviço.)

---

## 📡 Integração e parâmetros da API

### Endpoint

```
POST /gerar-pdf         (Content-Type: application/json)
```

| Campo         | Tipo   | Obrigatório | Descrição                                |
| ------------- | ------ | ----------- | ---------------------------------------- |
| `licencaId`   | int    | ✔           | Identificador da licença (empresa)       |
| `orcamentoId` | int    | ✔           | Identificador do orçamento/proposta      |
| `config`      | objeto | ✔           | Opções de renderização (detalhes abaixo) |

#### Possíveis chaves em `config`

| Chave                   | Tipo | Padrão  | Efeito                                   |
| ----------------------- | ---- | ------- | ---------------------------------------- |
| `imprimirContrato`      | bool | `false` | Inclui página(s) de contrato             |
| `imprimirMedidas`       | bool | `true`  | Mostra colunas **L** e **H** na tabela   |
| `imprimirValorUnitario` | bool | `true`  | Mostra colunas de valores unitários      |
| `imprimirVendaItens`    | bool | `false` | Anexa bloco “Venda de materiais”         |
| `imprimirParcelas`      | bool | `true`  | Inclui tabela de parcelas/pagamentos     |
| `imprimirValorTotal`    | bool | `true`  | Exibe bloco de totais (com desconto)     |
| `imprimirVariaveis`     | bool | `true`  | Lista variáveis do projeto               |
| `imprimirTimbre`        | bool | `false` | Adiciona imagem de timbre em cada página |
| `imprimirLogoEmTodas`   | bool | `false` | Exibe logo também nas páginas seguintes  |

Essas mesmas configurações são serializadas em **query-string** quando a página `index.html` é aberta no navegador; assim você pode testar visualmente sem gerar o PDF.

---

## 🛠️ Executando em produção

1. **Abra a porta 8092/TCP** no *Security Group* da instância (caso precise acesso externo).
2. Envie requisições para:

```
http://<IP-da-EC2>:8092/gerar-pdf
```

3. Internamente (entre containers ou serviços no mesmo servidor) use `http://localhost:8092`.


