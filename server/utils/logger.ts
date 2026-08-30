/**
 * Sanitized logging utility for ResearchFlow AI
 * Prevents secret/key leakage and structures backend execution telemetry.
 */

function sanitize(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    return data
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
      .replace(/bearer\s+[a-zA-Z0-9\-_.]+/gi, 'Bearer [REDACTED_TOKEN]')
      .replace(/password[:=]\s*["']?[^"'\s]+/gi, 'password=[REDACTED]');
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (/key|secret|token|password|auth/i.test(k)) {
        clean[k] = '[REDACTED]';
      } else {
        clean[k] = sanitize(v);
      }
    }
    return clean;
  }
  return data;
}

export const logger = {
  info: (message: string, context?: any) => {
    const timestamp = new Date().toISOString();
    if (context) {
      console.log(`[${timestamp}] [INFO] ${message}`, JSON.stringify(sanitize(context)));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  },
  warn: (message: string, context?: any) => {
    const timestamp = new Date().toISOString();
    if (context) {
      console.warn(`[${timestamp}] [WARN] ${message}`, JSON.stringify(sanitize(context)));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const cleanErr = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(`[${timestamp}] [ERROR] ${message}`, JSON.stringify(sanitize(cleanErr)));
  },
  audit: (eventType: string, summary: string, metadata?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AUDIT] [${eventType}] ${summary}`, JSON.stringify(sanitize(metadata || {})));
  }
};
