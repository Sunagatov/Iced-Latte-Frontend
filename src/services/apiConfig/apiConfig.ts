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
  if (typeof window === 'undefined') {
    // Server-side: use absolute URL with environment variables
    const protocol = process.env.PROTOCOL || 'http'
    const host = process.env.HOST || 'localhost'
    const port = process.env.PORT || '3002'
    const path = config.url!.replace(/^\//, '')
    config.url = `${protocol}://${host}:${port}/api/proxy/${path}`
  } else {
    // Client-side: use relative URL
    const path = config.url!.replace(/^\//, '')
    config.url = `/api/proxy/${path}`
  }
  return config
})

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
