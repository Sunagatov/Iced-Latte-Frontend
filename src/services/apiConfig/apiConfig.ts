import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_HOST_REMOTE,
  headers: {
    'Content-Type': 'application/json',
  },
}

const instance = axios.create(baseConfig)

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
