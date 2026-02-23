'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { api } from '@/services/apiConfig/apiConfig'
import { getSessionId } from '@/utils/sessionUtils'

interface ApiCallMetric {
  url: string
  method: string
  status: number
  durationMs: number
}

export default function PerformanceTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageLoadStart = useRef(Date.now())
  const apiCalls = useRef<ApiCallMetric[]>([])

  useEffect(() => {
    pageLoadStart.current = Date.now()
    apiCalls.current = []

    // Intercept API calls to measure duration
    const reqInterceptor = api.interceptors.request.use((config) => {
      (config as any)._t = Date.now()
      return config
    })

    const resInterceptor = api.interceptors.response.use(
      (response) => {
        const start = (response.config as any)._t
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
      (error) => {
        const start = (error.config as any)?._t
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

    const flush = () => {
      const pageLoadMs = Date.now() - pageLoadStart.current
      const calls = [...apiCalls.current]
      if (calls.length === 0) return

      const errorCount = calls.filter(c => c.status >= 400).length
      const sorted = [...calls].map(c => c.durationMs).sort((a, b) => a - b)
      const p95DurationMs = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1] ?? 0

      const payload = { page: pathname, pageLoadMs, errorCount, p95DurationMs, apiCalls: calls }

      // Use sendBeacon for reliability on page unload, fetch otherwise
      const url = `/api/proxy/telemetry/performance`
      const body = JSON.stringify(payload)
      const headers = {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId(),
      }

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
      } else {
        fetch(url, { method: 'POST', body, headers, keepalive: true }).catch(() => {})
      }
    }

    window.addEventListener('beforeunload', flush)
    return () => {
      flush()
      window.removeEventListener('beforeunload', flush)
      api.interceptors.request.eject(reqInterceptor)
      api.interceptors.response.eject(resInterceptor)
    }
  }, [pathname])

  return <>{children}</>
}
