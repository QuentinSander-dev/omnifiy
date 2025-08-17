export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  jobId?: string
  step?: string
  [key: string]: unknown
}

function format(message: string, level: LogLevel, context?: LogContext) {
  const base = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`
  if (!context) return base
  try {
    return `${base} ${JSON.stringify(context)}`
  } catch {
    return base
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(format(message, 'debug', context))
    }
  },
  info(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.info(format(message, 'info', context))
  },
  warn(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.warn(format(message, 'warn', context))
  },
  error(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.error(format(message, 'error', context))
  },
}

