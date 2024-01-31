import axios from 'axios'

const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_HOST_REMOTE,
  headers: {
    'Content-Type': 'application/json',
  },
}

export const api = axios.create(baseConfig)

