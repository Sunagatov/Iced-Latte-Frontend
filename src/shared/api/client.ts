import axios from 'axios'
import { setupCache, AxiosCacheInstance } from 'axios-cache-interceptor'
import { getSessionId, generateTraceId } from '@/shared/auth/sessionTracing'
import { API_TIMEOUT_SSR_MS, API_TIMEOUT_BROWSER_MS } from '@/shared/config/constants'

const instance = axios.create({
  timeout: typeof window === 'undefined' ? API_TIMEOUT_SSR_MS : API_TIMEOUT_BROWSER_MS,
})

instance.interceptors.request.use((config) => {
  const path = config.url!.replace(/^\//, '')
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData

  if (typeof window === 'undefined') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL

    config.url = `${baseUrl}/${path}`
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
