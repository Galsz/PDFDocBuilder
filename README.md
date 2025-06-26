
# 📄 PDF Generator Service

Este projeto é um microserviço em Node.js que gera documentos em PDF (como orçamentos e contratos) a partir de páginas HTML dinâmicas, utilizando o Puppeteer para renderização headless via Chromium.

## 📦 Tecnologias Utilizadas

- **Node.js**
- **Express**
- **Puppeteer**
- **Docker**
- **Docker Compose**
- **HTML/CSS** (estruturação visual dos documentos)

---

## 📁 Estrutura do Projeto

```

.
├── Dockerfile               # Imagem do serviço com Puppeteer + Chromium
├── docker-compose.yml       # Orquestração do container
├── server.js                # Servidor Express + Puppeteer
├── package.json             # Dependências do projeto
├── public/
│   ├── index.html           # Página HTML usada como base do contrato
│   ├── index-inline.html    # Alternativa com conteúdo embutido
│   ├── style.css            # Estilos para impressão/PDF
│   ├── script.js            # Scripts de carregamento dinâmico
│   └── assets/              # Imagens e logos utilizados
│       ├── building.png
│       ├── logowhite\_evo.svg
│       └── logoww\.png
└── README.md

```


## 🚀 Como Rodar com Docker Compose

> Pré-requisitos: `Docker` e `docker-compose` instalados na máquina (ou EC2).

### 1. Clone o repositório

```bash
git clone https://github.com/Galsz/PDFDocBuilder.git
cd PDFDocBuilder
````

### 2. Construa a imagem

```bash
docker-compose build
```

### 3. Inicie o container

```bash
docker-compose up -d
```

### 4. Verifique se está rodando

```bash
curl http://localhost:8095/gerar-pdf
```

---

## Configurações

O PDF é gerado a partir da seguinte rota:

```
POST /gerar-pdf
Content-Type: application/json
```

### Exemplo de payload:

```json
{
  "licencaId": 123,
  "orcamentoId": 456,
  "config": {
    "imprimirContrato": true
  }
}
```

A resposta será um PDF em `application/pdf` pronto para download.


## Integração

Se a aplicação estiver na mesma EC2, basta fazer requisições internas para:

```
http://localhost:8095/gerar-pdf
```


## 📄 Licença

Distribuição interna restrita – uso autorizado para projetos Wvetro.

