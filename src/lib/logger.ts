/**
 * Centralized logging utility for OptiVibe
 * Provides structured logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDev: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const log = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context,
    }

    return log
  }

  private write(level: LogLevel, message: string, context?: LogContext) {
    const log = this.formatLog(level, message, context)

    // In development, use pretty printing
    if (this.isDev) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level]

      console[level === 'debug' ? 'log' : level](
        `${emoji} [${log.level}] ${log.timestamp} - ${message}`,
        context ? context : ''
      )
    } else {
      // In production, use JSON for log aggregation
      console.log(JSON.stringify(log))
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      this.write('debug', message, context)
    }
  }

  info(message: string, context?: LogContext) {
    this.write('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.write('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    }
    this.write('error', message, errorContext)
  }

  // Request logging helper
  request(method: string, path: string, context?: LogContext) {
    this.info(`${method} ${path}`, { type: 'request', ...context })
  }

  // Response logging helper
  response(method: string, path: string, status: number, duration: number, context?: LogContext) {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    this.write(level, `${method} ${path} - ${status}`, {
      type: 'response',
      status,
      duration: `${duration}ms`,
      ...context,
    })
  }
}

// Export singleton instance
export const logger = new Logger()
