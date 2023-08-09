import axios, { AxiosResponse } from 'axios'

export const $api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 1000,
})

export const getAllProducts = async () => {
  try {
    const response: AxiosResponse = await $api.get('/api/products')
    return response.data
  } catch (e) {
    return e
  }
}
