import type { IProduct } from '@/features/products/types'
import type { ProductSummaryDto } from '@/shared/api/generated/favorite'

type NullableProductSummaryFields = {
  averageRating?: number | null
  brandName?: string | null
  description?: string | null
  productFileUrl?: string | null
  reviewsCount?: number | null
  sellerName?: string | null
  weight?: number | null
} & Partial<Omit<IProduct, keyof ProductSummaryDto>>

export type FavoriteProduct = Omit<
  ProductSummaryDto,
  keyof NullableProductSummaryFields
> &
  NullableProductSummaryFields

export interface FavouritesResponse {
  products: FavoriteProduct[]
}

export interface SyncFavouritesRequest {
  productIds: string[]
}

export interface FavElementProps {
  product: FavoriteProduct
}
