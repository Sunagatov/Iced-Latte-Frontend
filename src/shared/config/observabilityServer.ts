export const OBSERVABILITY_SERVICE_NAME =
  process.env.OTEL_SERVICE_NAME?.trim() || 'iced-latte-frontend'

export const SERVER_OTEL_ENABLED =
  process.env.OBSERVABILITY_OTEL_ENABLED === 'true'

export const OBSERVABILITY_LOG_EVENTS =
  process.env.OBSERVABILITY_LOG_EVENTS === 'true'
