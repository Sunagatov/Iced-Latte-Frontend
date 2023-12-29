import { IProduct } from '@/models/Products'
export interface FavResponse {
  products: IProduct[]
}

export interface IFavPushItems {
  favouriteIds: string[]
}
