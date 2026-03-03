import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import { getSessionId, generateTraceId } from '@/shared/utils/sessionUtils'
import { useAuthStore } from '@/features/auth/store'

const instance = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: typeof window === 'undefined' ? 5000 : 0,
})

instance.interceptors.request.use((config) => {
  const path = config.url!.replace(/^\//, '')

  if (typeof window === 'undefined') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    config.url = `${baseUrl}/${path}`
  } else {
    config.url = `/api/proxy/${path}`

    try {
      const token = useAuthStore.getState().token
      if (token) config.headers['Authorization'] = `Bearer ${token}`
    } catch { /* store not yet initialized */ }

    config.headers['X-Session-ID'] = getSessionId()
    config.headers['X-Trace-ID'] = generateTraceId()
  }

  return config
})

export const api = setupCache(instance, { cacheTakeover: false })
