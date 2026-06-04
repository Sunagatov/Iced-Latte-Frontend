import type { IProduct } from '@/features/products/public'
import type { ProductSummaryDto } from '@/shared/api/generated/favorite'

export type FavoriteProduct = Omit<ProductSummaryDto, 'productFileUrl'> & {
  productFileUrl?: string | null
} & Partial<Omit<IProduct, keyof ProductSummaryDto>>

export interface FavouritesResponse {
  products: FavoriteProduct[]
}

export interface SyncFavouritesRequest {
  productIds: string[]
}

export interface FavElementProps {
  product: FavoriteProduct
}
