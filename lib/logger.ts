type Level = "info" | "warn" | "error" | "debug"

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  const entry = { level, msg, ...meta, timestamp: new Date().toISOString() }
  if (level === "error") console.error(`[${level.toUpperCase()}] ${msg}`, meta ?? "")
  else if (level === "warn") console.warn(`[${level.toUpperCase()}] ${msg}`, meta ?? "")
  else console.log(`[${level.toUpperCase()}] ${msg}`, meta ?? "")
  // In production this pipes to observability sink; easy to replace with pino/Sentry
  return entry
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
}
