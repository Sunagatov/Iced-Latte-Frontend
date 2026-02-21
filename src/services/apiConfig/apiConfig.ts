import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
}

const instance = axios.create(baseConfig)

// Add request interceptor to set baseURL dynamically
instance.interceptors.request.use((config) => {
  const path = config.url!.replace(/^\//, '')
  
  if (typeof window === 'undefined') {
    // Server-side: use absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api/v1'
    config.url = `${baseUrl}/${path}`
  } else {
    // Client-side: use proxy
    config.url = `/api/proxy/${path}`
  }
  
  return config
})

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
