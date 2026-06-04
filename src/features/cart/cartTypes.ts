import type { IProduct } from '@/features/products/public'
import type { ProductSummaryDto } from '@/shared/api/generated/cart'

type CartProductInfo = Omit<ProductSummaryDto, 'productFileUrl'> & {
  productFileUrl?: string | null
} & Partial<Omit<IProduct, keyof ProductSummaryDto>>

export interface ICart {
  id: string
  userId: string
  items: ICartItem[]
  itemsQuantity: number
  itemsTotalPrice: number
  productsQuantity: number
  createdAt: string
  closedAt: string | null
}

export interface ICartItem {
  id: string
  productInfo: CartProductInfo
  productQuantity: number
}

export interface ICartPushItems {
  items: ICartPushItem[]
}

export interface ICartPushItem {
  productId: string
  productQuantity: number
}

export interface ICartUpdatedItem {
  shoppingCartItemId: string
  productQuantityChange: number
}

export interface CartElementProps {
  product: ICartItem
  isPending?: boolean
  add: () => void
  remove: () => void
  removeAll: () => void
}
