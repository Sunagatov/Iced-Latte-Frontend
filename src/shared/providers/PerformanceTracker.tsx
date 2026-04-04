'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { api } from '@/shared/api/client'
import { getSessionId } from '@/shared/utils/sessionUtils'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

interface ApiCallMetric {
  url: string
  method: string
  status: number
  durationMs: number
}

interface TimedAxiosConfig { _t?: number }

let reqInterceptorId: number | null = null
let resInterceptorId: number | null = null

export default function PerformanceTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageLoadStart = useRef(Date.now())
  const apiCalls = useRef<ApiCallMetric[]>([])

  useEffect(() => {
    apiCalls.current = []
    pageLoadStart.current = Date.now()

    if (reqInterceptorId === null) {
      reqInterceptorId = api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        ;(config as InternalAxiosRequestConfig & TimedAxiosConfig)._t = Date.now()

        return config
      })
    }

    if (resInterceptorId === null) {
      resInterceptorId = api.interceptors.response.use(
        (response: AxiosResponse) => {
          const start = (response.config as InternalAxiosRequestConfig & TimedAxiosConfig)._t

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
        (error: AxiosError) => {
          const start = (error.config as (InternalAxiosRequestConfig & TimedAxiosConfig) | undefined)?._t

          if (start && error.config) {
            apiCalls.current.push({
              url: error.config.url?.replace(/\/api\/proxy\//, '') ?? '',
              method: error.config.method?.toUpperCase() ?? 'GET',
              status: error.response?.status ?? 0,
              durationMs: Date.now() - start,
            })
          }

          return Promise.reject(error)
        }
      )
    }

    const flush = () => {
      const pageLoadMs = Date.now() - pageLoadStart.current
      const calls = [...apiCalls.current]

      if (calls.length === 0) return

      const errorCount = calls.filter(c => c.status >= 400 && c.status !== 0).length
      const validDurations = calls.filter(c => c.status !== 0).map(c => c.durationMs).sort((a, b) => a - b)
      const p95DurationMs = validDurations[Math.floor(validDurations.length * 0.95)] ?? validDurations[validDurations.length - 1] ?? 0

      const payload = { page: pathname, pageLoadMs, errorCount, p95DurationMs, apiCalls: calls }
      const sessionId = getSessionId()
      // Send sid in header/body, not query string, to avoid leaking it into logs
      const url = `/api/proxy/telemetry/performance`
      const body = JSON.stringify({ ...payload, sessionId })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      } else {
        fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json', 'X-Session-ID': sessionId }, keepalive: true }).catch(() => {})
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
