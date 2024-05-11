import { api } from './apiConfig/apiConfig'
import { AxiosResponse } from 'axios'

interface ProductRating {
  mark: number
  quantity: number
}

export async function apiAddProductRating(
  productId: string,
  rating: number,
): Promise<void> {
  await api.post('/api/v1/rating/product', {
    productId,
    mark: rating,
  })
}

export async function apiGetProductRating(
  productId: string,
): Promise<ProductRating[]> {
  const response: AxiosResponse<ProductRating[]> = await api.get(
    `/api/v1/products/rating/${productId}`,
  )

  return response.data
}
