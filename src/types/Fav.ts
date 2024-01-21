import { IProduct } from '@/types/Products'
export interface FavResponse {
  products: IProduct[]
}

export interface IFavPushItems {
  productIds: string[]
}
