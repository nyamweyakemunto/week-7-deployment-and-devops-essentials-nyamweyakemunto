const winston = require('winston');
const morgan = require('morgan');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const morganMiddleware = morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
});

module.exports = { logger, morganMiddleware };