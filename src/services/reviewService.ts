import { api } from './apiConfig/apiConfig'
// import { AxiosResponse } from 'axios'

export async function apiAddProductReview(
  productId: string,
  review: string,
): Promise<void> {
  await api.post(`/api/v1/products/${productId}/reviews`, {
    review,
  })

  // return response.data
}

export async function apiDeleteProductReview(
  productId: string,
  reviewId: string,
): Promise<void> {
  await api.delete(`/api/v1/products/${productId}/reviews/${reviewId}`)
}

export async function apiGetProductReviews(
  productId: string,
  page: number,
  size: number,
  sortAttribute: string,
  sortDirection: string,
) {
  await api.get(`/api/v1/products/${productId}/reviews`, {
    params: {
      page,
      size,
      sort_attribute: sortAttribute,
      sort_direction: sortDirection,
    },
  })

  // return response.data
}
