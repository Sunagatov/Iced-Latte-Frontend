import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

const baseConfig = {
  baseURL: 'https://iced-latte.uk/backend/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
}

const instance = axios.create(baseConfig)

const axiosWithCache = setupCache(instance, {
  cacheTakeover: false, // Set the cacheTakeover option to true after cors settings on the server
})

export const api = axiosWithCache
