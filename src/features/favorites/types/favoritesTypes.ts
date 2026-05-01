import type { IProduct } from '@/features/products/public'

export interface FavouritesResponse {
  products: IProduct[]
}

export interface SyncFavouritesRequest {
  productIds: string[]
}

export interface FavElementProps {
  product: IProduct
}
