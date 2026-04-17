import { IProduct } from '@/features/products/types'

export interface FavouritesResponse {
  products: IProduct[]
}

export interface SyncFavouritesRequest {
  productIds: string[]
}

export interface FavElementProps {
  product: IProduct
}
