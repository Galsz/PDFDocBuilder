FROM node:20-slim

# Otimizações de memória para Node.js com Playwright
ENV NODE_OPTIONS="--max-old-space-size=512 --gc-interval=100"
ENV NODE_ENV=production

# Playwright: Instala dependências para Chromium (mais otimizado que Puppeteer)
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
    # Remove arquivos desnecessários para economizar espaço
    rm -rf /usr/share/doc/* /usr/share/man/* /var/cache/debconf/*

WORKDIR /app

# Copia e instala dependências primeiro (melhor cache de layers)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Instala browsers do Playwright (só Chromium para economizar espaço)
RUN npx playwright install chromium && \
    npx playwright install-deps chromium

# Copia código da aplicação
COPY . .

# Cria usuário não-root para segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app
USER appuser

# Variáveis de ambiente para Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/home/appuser/.cache/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 8095

# Healthcheck para monitoramento
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8095/health || exit 1

CMD ["npm", "start"]