import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const baseConfig = {
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
}

const instance = axios.create(baseConfig)

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
