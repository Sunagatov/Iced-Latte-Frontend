import './sentry.client.config'
import {
  reportBrowserError,
  reportUnhandledRejection,
} from '@/shared/observability/client'

export { onRouterTransitionStart } from './sentry.client.config'

try {
  window.addEventListener('error', reportBrowserError)
  window.addEventListener('unhandledrejection', reportUnhandledRejection)
} catch {
  // Observability must never block application startup.
}
