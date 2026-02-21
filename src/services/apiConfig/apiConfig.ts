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
  config.url = `/api/proxy/${path}`
  return config
})

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
