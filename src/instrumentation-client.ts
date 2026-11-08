import './sentry.client.config'
import { startBrowserTelemetry } from '@/shared/observability/browserTelemetry'

export { onRouterTransitionStart } from './sentry.client.config'

void startBrowserTelemetry(
  process.env.NEXT_PUBLIC_FARO_URL,
  'iced-latte-frontend',
)
