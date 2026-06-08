import { registerOTel } from '@vercel/otel'
import type { Instrumentation } from 'next'
import {
  OBSERVABILITY_LOG_EVENTS,
  OBSERVABILITY_SERVICE_NAME,
  SERVER_OTEL_ENABLED,
} from '@/shared/config/observabilityServer'

function pathWithoutQuery(path: string): string {
  return path.split('?', 1)[0] || '/'
}

export function register() {
  if (!SERVER_OTEL_ENABLED) return

  registerOTel(OBSERVABILITY_SERVICE_NAME)
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (!OBSERVABILITY_LOG_EVENTS) return

  const message = error instanceof Error ? error.message : 'Unknown request error'

  console.error('next_request_error', {
    service: OBSERVABILITY_SERVICE_NAME,
    message,
    method: request.method,
    path: pathWithoutQuery(request.path),
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
  })
}
