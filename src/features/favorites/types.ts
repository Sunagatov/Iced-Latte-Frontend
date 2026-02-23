import { IProduct } from '@/features/products/types'

export interface FavResponse {
  products: IProduct[]
}

export interface IFavPushItems {
  productIds: string[]
}

export interface FavElementProps {
  product: IProduct
}
