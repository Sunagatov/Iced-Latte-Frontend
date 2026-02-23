import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import { getSessionId, generateTraceId } from '@/utils/sessionUtils'

const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
}

const instance = axios.create(baseConfig)

// Add request interceptor to set baseURL dynamically and attach auth token
instance.interceptors.request.use((config) => {
  const path = config.url!.replace(/^\//, '')

  if (typeof window === 'undefined') {
    // Server-side: use absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api/v1'
    config.url = `${baseUrl}/${path}`
  } else {
    // Client-side: use proxy
    config.url = `/api/proxy/${path}`

    // Attach JWT from Zustand store if available
    try {
      const { useAuthStore } = require('@/store/authStore')
      const token = useAuthStore.getState().token
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch { /* store not yet initialized */ }

    // Attach anonymous session ID (persistent) and trace ID (per-request)
    config.headers['X-Session-ID'] = getSessionId()
    config.headers['X-Trace-ID'] = generateTraceId()
  }

  return config
})

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
