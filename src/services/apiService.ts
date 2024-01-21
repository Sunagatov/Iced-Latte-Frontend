import { ErrorResponse } from '@/types/ErrorResponse'
import { IProduct } from '@/types/Products'
import { handleResponse } from '@/utils/handleResponse'
import { ServerError } from './authService'

export async function getAllProducts(url: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/${url}`)

    if (res.status !== 200) {
      throw new Error(res.statusText)
    }

    return res.json()
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message)
    else throw new Error('Something went wrong')
  }
}

export async function getProduct(id: string): Promise<IProduct> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/products/${id}`,
    )

    if (res.status !== 200) {
      throw new Error(res.statusText)
    }

    return res.json() as Promise<IProduct>
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message)
    else throw new Error('Something went wrong')
  }
}

export async function getProductByIds(ids: string[]): Promise<IProduct[]> {
  try {
    const body = { productIds: ids }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/products/ids`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    return handleResponse<IProduct[], ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}
