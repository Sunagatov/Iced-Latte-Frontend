'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type { AxiosCacheInstance } from 'axios-cache-interceptor'
import { api } from '@/shared/api/client'
import { getSessionId } from '@/shared/utils/sessionUtils'

interface ApiCallMetric {
  url: string
  method: string
  status: number
  durationMs: number
}

type TimedAxiosConfig = InternalAxiosRequestConfig & {
  _t?: number
}

interface PerformanceTrackerProps {
  children: ReactNode
}

const apiClient = api as unknown as AxiosCacheInstance
const readSessionId = getSessionId as unknown as () => string

let reqInterceptorId: number | null = null
let resInterceptorId: number | null = null

function ignoreUnloadError(_error: unknown): void {
  return
}

export default function PerformanceTracker({
  children,
}: Readonly<PerformanceTrackerProps>) {
  const pathname = usePathname()
  const pageLoadStart = useRef<number>(Date.now())
  const apiCalls = useRef<ApiCallMetric[]>([])

  useEffect(() => {
    apiCalls.current = []
    pageLoadStart.current = Date.now()

    if (reqInterceptorId === null) {
      reqInterceptorId = apiClient.interceptors.request.use(
        (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
          ;(config as TimedAxiosConfig)._t = Date.now()

          return config
        },
      )
    }

    if (resInterceptorId === null) {
      resInterceptorId = apiClient.interceptors.response.use(
        (response: AxiosResponse): AxiosResponse => {
          const start = (response.config as TimedAxiosConfig)._t

          if (start) {
            apiCalls.current.push({
              url: response.config.url?.replace(/\/api\/proxy\//, '') ?? '',
              method: response.config.method?.toUpperCase() ?? 'GET',
              status: response.status,
              durationMs: Date.now() - start,
            })
          }

          return response
        },
        (error: AxiosError): Promise<never> => {
          const start = (error.config as TimedAxiosConfig | undefined)?._t

          if (start && error.config) {
            apiCalls.current.push({
              url: error.config.url?.replace(/\/api\/proxy\//, '') ?? '',
              method: error.config.method?.toUpperCase() ?? 'GET',
              status: error.response?.status ?? 0,
              durationMs: Date.now() - start,
            })
          }

          return Promise.reject(error)
        },
      )
    }

    const flush = (): void => {
      const pageLoadMs = Date.now() - pageLoadStart.current
      const calls = [...apiCalls.current]

      if (calls.length === 0) {
        return
      }

      const errorCount = calls.filter(
        (call: ApiCallMetric) => call.status >= 400 && call.status !== 0,
      ).length
      const validDurations = calls
        .filter((call: ApiCallMetric) => call.status !== 0)
        .map((call: ApiCallMetric) => call.durationMs)
        .sort((a: number, b: number) => a - b)
      const p95DurationMs =
        validDurations[Math.floor(validDurations.length * 0.95)] ??
        validDurations[validDurations.length - 1] ??
        0

      const payload = {
        page: pathname,
        pageLoadMs,
        errorCount,
        p95DurationMs,
        apiCalls: calls,
      }
      const sessionId = readSessionId()
      const url = '/api/proxy/telemetry/performance'
      const body = JSON.stringify({ ...payload, sessionId })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          url,
          new Blob([body], { type: 'application/json' }),
        )
      } else {
        void fetch(url, {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId,
          },
          keepalive: true,
        }).catch(ignoreUnloadError)
      }
    }

    window.addEventListener('beforeunload', flush)

    return () => {
      flush()
      window.removeEventListener('beforeunload', flush)
    }
  }, [pathname])

  return <>{children}</>
}