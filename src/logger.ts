import winston from 'winston';
import chalk from 'chalk';
import path from 'path';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'white',
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const colorizer = winston.format.colorize().colorize;
    const logMessage = `${chalk.gray(timestamp)} [${colorizer(level, level.toUpperCase())}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
        return `${logMessage}\n${chalk.gray(JSON.stringify(meta, null, 2))}`;
    }
    return logMessage;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  levels,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: fileFormat,
    }),
  ],
});

export default logger;