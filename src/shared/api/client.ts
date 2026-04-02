import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import { getSessionId, generateTraceId } from '@/shared/utils/sessionUtils'
import { useAuthStore } from '@/features/auth/store'

const instance = axios.create({
  timeout: typeof window === 'undefined' ? 5000 : 15000,
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

    try {
      const token = useAuthStore.getState().token

      if (token) config.headers['Authorization'] = `Bearer ${token}`
    } catch { /* store not yet initialized */ }

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

export const api = setupCache(instance, { cacheTakeover: false })
