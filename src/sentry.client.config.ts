import * as Sentry from '@sentry/nextjs'
import {
  cleanSentryDsn,
  parseTelemetrySampleRate,
  sanitizeSentryEvent,
} from '@/shared/config/sentry'

const dsn = cleanSentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN)
const sentryEnabled =
  process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true' && dsn != null

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
    sendDefaultPii: false,
    attachStacktrace: true,
    tracesSampleRate: parseTelemetrySampleRate(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    ),
    replaysSessionSampleRate: parseTelemetrySampleRate(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    ),
    replaysOnErrorSampleRate: parseTelemetrySampleRate(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    ),
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend: sanitizeSentryEvent,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
