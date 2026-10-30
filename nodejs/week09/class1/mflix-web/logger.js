// The winston logger for the whole API - the same setup as week07/class1/logger.js.
// Built once here and require()d wherever the app needs to log.
//
// Levels, most to least serious:  error, warn, info, http, verbose, debug, silly
// LOG_LEVEL (in .env or on the command line) picks how much you see. Default 'http'.
//   docker compose exec -e LOG_LEVEL=debug node node week09/class1/mflix-web/server.js
//
// Files land in mflix-web/logs/ (git-ignored):
//   error.log     errors only
//   combined.log  everything at LOG_LEVEL and above, one JSON object per line

const path = require('path');
const winston = require('winston');

const { combine, timestamp, json, colorize, printf } = winston.format;

const LOG_DIR = path.join(__dirname, 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'http',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        printf(({ timestamp, level, message, stack, ...meta }) => {
          const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          return `${timestamp} ${level}: ${message}${extra}${stack ? '\n' + stack : ''}`;
        })
      ),
    }),
    new winston.transports.File({ filename: path.join(LOG_DIR, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(LOG_DIR, 'combined.log') }),
  ],
});

module.exports = logger;
