import { IProduct } from './Products'

export interface ICart {
  id: string,
  userId: string,
  items: ICartItem[],
  itemsQuantity: number,
  itemsTotalPrice: number,
  productsQuantity: number,
  createdAt: string,
  closedAt: string | null
}

export interface ICartItem {
  id: string,
  productInfo: IProduct,
  productQuantity: number
}

export interface ICartPushItems {
  items: ICartPushItem[]
}

export interface ICartPushItem {
  productId: string,
  productQuantity: number
}

export interface ICartUpdatedItem {
  shoppingCartItemId: string,
  productQuantityChange: number
}