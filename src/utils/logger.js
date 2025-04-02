const winston = require('winston');

/**
 * Logger utility for consistent logging
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'allthatnode-mcp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    })
  ]
});

// Add verbose logging when requested
function setVerbose(enabled) {
  if (enabled) {
    logger.level = 'debug';
  } else {
    logger.level = 'info';
  }
}

module.exports = {
  logger,
  setVerbose
}; 