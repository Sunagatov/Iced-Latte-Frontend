import axios from 'axios'

const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_HOST_REMOTE,
  headers: {
    'Content-Type': 'application/json',
  },
}

export const api = axios.create(baseConfig)

export const setAuth = (token: string | null): void => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const clearAuth = () => {
  api.defaults.headers.common.Authorization = ''
}
