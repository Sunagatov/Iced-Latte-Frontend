import axios from 'axios'
import { setupCache, AxiosCacheInstance } from 'axios-cache-interceptor'
import { getSessionId, generateTraceId } from '@/shared/auth/sessionTracing'
import { API_TIMEOUT_SSR_MS, API_TIMEOUT_BROWSER_MS } from '@/shared/config/constants'

const instance = axios.create({
  timeout: typeof window === 'undefined' ? API_TIMEOUT_SSR_MS : API_TIMEOUT_BROWSER_MS,
  paramsSerializer: {
    indexes: null,
  },
})

function getServerApiBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    const internalApiUrl = process.env.INTERNAL_API_URL

    if (!internalApiUrl) {
      throw new Error('INTERNAL_API_URL is required in production server-side runtime')
    }

    return internalApiUrl
  }

  const baseUrl =
    process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error('API base URL is not configured')
  }

  return baseUrl
}

instance.interceptors.request.use((config) => {
  const path = config.url!.replace(/^\//, '')
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData

  if (typeof window === 'undefined') {
    config.url = `${getServerApiBaseUrl()}/${path}`
  } else {
    config.url = `/api/proxy/${path}`
    config.headers['X-Session-ID'] = getSessionId()
    config.headers['X-Trace-ID'] = generateTraceId()
  }

  if (isFormData) {
    delete config.headers['Content-Type']
  } else if (config.data != null && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

export const api: AxiosCacheInstance = setupCache(instance, {
  cacheTakeover: false,
})
