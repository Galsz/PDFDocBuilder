# 📄 PDF Generator Service

Este projeto é um microserviço em Node.js que gera documentos em PDF (como orçamentos e contratos) a partir de páginas HTML dinâmicas, utilizando o Puppeteer para renderização headless via Chromium.


## 📁 Estrutura do Projeto

```

.
├── server.js              # Servidor Express + Puppeteer
├── package.json           # Dependências do projeto
├── public/
│   ├── index.html         # Página HTML usada como base do contrato
│   ├── index-inline.html  # Alternativa com conteúdo embutido
│   ├── style.css          # Estilos para impressão/PDF
│   ├── script.js          # Scripts de carregamento/dinâmica
│   └── assets/            # Imagens e logos utilizados
│       ├── building.png
│       ├── logowhite\_evo.svg
│       └── logoww\.png
└── README.md

```

## Instalação

```bash
git clone https://github.com/Galsz/PDFDocBuilder.git
cd PDFDocBuilder
npm install
```


## ☁️ Deploy

1. Suba os arquivos via Git ou SFTP
2. Instale dependências:

   ```bash
   sudo yum install -y nodejs
   npm install
   ```
3. Instale libs do Chromium para o Puppeteer:

   ```bash
   sudo yum install -y gtk3 xorg-x11-fonts* libXcomposite ...
   ```
4. Execute com `pm2`:

   ```bash
   pm2 start index.js
   pm2 save
   ```

---


## Tecnologias Utilizadas

- **Node.js**
- **Express**
- **Puppeteer**
- **HTML/CSS** (para estruturação visual dos documentos)

---

## Funcionalidades

- Geração automática de PDFs a partir de URLs HTML
- Suporte a parâmetros dinâmicos via query string
- Estilização avançada para contratos e relatórios
- Espera pelo carregamento total da página e sinal de prontidão
- Retorno direto do PDF para download como resposta HTTP
