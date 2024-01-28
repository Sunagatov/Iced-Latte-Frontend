import { AxiosResponse } from 'axios'
import { IProduct, IProductsList } from '@/types/Products'
import { api } from './apiConfig/apiConfig'

export async function getAllProducts(url: string) {
  try {
    const response: AxiosResponse<IProductsList> = await api.get(url)

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function getProduct(id: string) {
  try {
    const response: AxiosResponse<IProduct> = await api.get(`/products/${id}`)

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function getProductByIds(ids: string[]) {
  try {
    const body = { productIds: ids }
    const response: AxiosResponse<IProduct[]> = await api.post(
      '/products/ids',
      body,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}
