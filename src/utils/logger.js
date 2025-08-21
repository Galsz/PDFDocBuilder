/**
 * Utilitário de logging
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/app');

class Logger {
  static logFile = path.join(__dirname, '../../logs/app.log');

  static ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  static formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` - ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  static log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output
    console.log(formattedMessage);
    
    // File output (apenas em produção)
    if (config.server.environment === 'production') {
      this.ensureLogDir();
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }

  static info(message, meta = {}) {
    this.log('info', message, meta);
  }

  static warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  static error(message, meta = {}) {
    this.log('error', message, meta);
  }

  static debug(message, meta = {}) {
    if (config.server.environment === 'development') {
      this.log('debug', message, meta);
    }
  }
}

module.exports = Logger;
