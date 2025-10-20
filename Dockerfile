FROM node:20-slim

# Ambiente
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Onde o Playwright guardará os browsers (baked na imagem)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# Porta padrão do app (combine com seu compose)
ENV PORT=8095

# Dependências de sistema necessárias (inclui curl pro healthcheck)
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libgtk-4-1 \
    libatspi2.0-0 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    rm -rf /usr/share/doc/* /usr/share/man/* /var/cache/debconf/*

WORKDIR /app

# Instala dependências do Node primeiro (melhor cache)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Instala somente o Chromium do Playwright e suas deps de SO
# (força uso da versão instalada em node_modules)
RUN node ./node_modules/playwright/cli.js install chromium && \
    node ./node_modules/playwright/cli.js install-deps chromium

# Copia o código da aplicação
COPY . .

# Cria usuário não-root e dá acesso ao app e aos browsers
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app /ms-playwright
USER appuser

# Em runtime não baixa nada (já está bakeado)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 8095

# Healthcheck interno
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8095/health || exit 1

CMD ["npm", "start"]
