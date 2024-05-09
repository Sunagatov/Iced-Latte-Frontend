import { AxiosResponse } from 'axios'
import {
  IGetProductBrands,
  IGetProductSellers,
  IProduct,
  IProductsList,
} from '@/types/Products'
import { api } from './apiConfig/apiConfig'

export async function getAllProducts(url: string) {
  const response: AxiosResponse<IProductsList> = await api.get(url)

  return response.data
}

export async function getProduct(id: string) {
  const response: AxiosResponse<IProduct> = await api.get(`/products/${id}`)

  return response.data
}

export async function getProductByIds(ids: string[]) {
  const body = { productIds: ids }
  const response: AxiosResponse<IProduct[]> = await api.post(
    '/products/ids',
    body,
  )

  return response.data
}

export const getProductSellers = async (): Promise<IGetProductSellers> => {
  const response: AxiosResponse<IGetProductSellers> =
    await api.get('/products/sellers')

  return response.data
}

export const getProductBrands = async (): Promise<IGetProductBrands> => {
  const response: AxiosResponse<IGetProductBrands> =
    await api.get('/products/brands')

  return response.data
}
