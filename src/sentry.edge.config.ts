import * as Sentry from '@sentry/nextjs'
import {
  cleanSentryDsn,
  parseTelemetrySampleRate,
  sanitizeSentryEvent,
} from '@/shared/config/sentry'

const dsn = cleanSentryDsn(process.env.SENTRY_DSN)
const sentryEnabled = process.env.SENTRY_ENABLED === 'true' && dsn != null

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || 'production',
    release: process.env.SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    attachStacktrace: true,
    tracesSampleRate: parseTelemetrySampleRate(
      process.env.SENTRY_TRACES_SAMPLE_RATE,
    ),
    beforeSend: sanitizeSentryEvent,
  })
}
