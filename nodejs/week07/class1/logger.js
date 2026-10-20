// A winston logger, shared by the whole app - used by 05_logging_winston.js
//
// Like taskRouter.js: build it once in its own file, export it, and require() it
// wherever you need to log. Every file gets the SAME logger with the same settings.
//
// Levels, most to least serious:  error, warn, info, http, verbose, debug, silly
// The logger prints its own level and everything above it. 'http' (the default here)
// means error/warn/info/http show; verbose/debug/silly are hidden.
// Turn on more detail without touching the code:
//   docker compose exec -e LOG_LEVEL=debug node node week07/class1/05_logging_winston.js

const path = require('path');
const winston = require('winston');

const { combine, timestamp, json, colorize, printf } = winston.format;

const LOG_DIR = path.join(__dirname, 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'http',

  // Default format: a timestamp, then one JSON object per line. Easy for a program
  // to search ("every error for /api/tasks last Tuesday"). The file transports use this.
  format: combine(timestamp(), json()),

  // A TRANSPORT is a place logs go. One logger, many destinations.
  transports: [
    // Terminal: coloured and readable, for you while developing.
    new winston.transports.Console({
      format: combine(
        colorize(),
        printf(({ timestamp, level, message, stack, ...meta }) => {
          const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          // a stack trace reads better on its own lines than squashed into the JSON
          return `${timestamp} ${level}: ${message}${extra}${stack ? '\n' + stack : ''}`;
        })
      ),
    }),
    // Only errors, so problems don't get buried.
    new winston.transports.File({ filename: path.join(LOG_DIR, 'error.log'), level: 'error' }),
    // Everything at the logger's level and above.
    new winston.transports.File({ filename: path.join(LOG_DIR, 'combined.log') }),
  ],
});

module.exports = logger;
