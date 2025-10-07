/**
 * Centralized logging utility
 * Provides a single point of control for logging throughout the application
 * Can be extended to support different log levels, remote logging, etc.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  error?: Error | unknown
  timestamp: Date
}

class Logger {
  private isDevelopment = import.meta.env.DEV

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    this.log({
      level: 'error',
      message,
      context,
      error,
      timestamp: new Date(),
    })
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string): void {
    this.log({
      level: 'warn',
      message,
      context,
      timestamp: new Date(),
    })
  }

  /**
   * Log an info message (development only)
   */
  info(message: string, context?: string): void {
    if (this.isDevelopment) {
      this.log({
        level: 'info',
        message,
        context,
        timestamp: new Date(),
      })
    }
  }

  /**
   * Log a debug message (development only)
   */
  debug(message: string, context?: string): void {
    if (this.isDevelopment) {
      this.log({
        level: 'debug',
        message,
        context,
        timestamp: new Date(),
      })
    }
  }

  private log(entry: LogEntry): void {
    const prefix = entry.context ? `[${entry.context}]` : ''
    const fullMessage = `${prefix} ${entry.message}`

    switch (entry.level) {
      case 'error':
        if (entry.error) {
          console.error(fullMessage, entry.error)
        } else {
          console.error(fullMessage)
        }
        break
      case 'warn':
        console.warn(fullMessage)
        break
      case 'info':
        console.info(fullMessage)
        break
      case 'debug':
        console.debug(fullMessage)
        break
    }
  }
}

// Export singleton instance
export const logger = new Logger()
