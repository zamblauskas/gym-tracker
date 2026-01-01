type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.PROD ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.name}]:`;

    const color = {
      DEBUG: '#7f8c8d',
      INFO: '#2ecc71',
      WARN: '#f39c12',
      ERROR: '#e74c3c'
    }[level];

    console.groupCollapsed(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
    if (context) console.dir(context);
    console.trace('Stack Trace');
    console.groupEnd();
  }

  debug(msg: string, ctx?: LogContext) {
    this.log('DEBUG', msg, ctx);
  }
  info(msg: string, ctx?: LogContext) {
    this.log('INFO', msg, ctx);
  }
  warn(msg: string, ctx?: LogContext) {
    this.log('WARN', msg, ctx);
  }
  error(msg: string, ctx?: LogContext) {
    this.log('ERROR', msg, ctx);
  }
}

export const logger = new Logger('App');
