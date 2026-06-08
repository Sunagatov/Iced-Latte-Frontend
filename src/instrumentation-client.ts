import {
  reportBrowserError,
  reportUnhandledRejection,
} from '@/shared/observability/client'

try {
  window.addEventListener('error', reportBrowserError)
  window.addEventListener('unhandledrejection', reportUnhandledRejection)
} catch {
  // Observability must never block application startup.
}
