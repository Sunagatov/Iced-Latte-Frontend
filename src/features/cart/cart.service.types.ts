import type {
  ICartItem,
  ICartPushItem,
} from '@/features/cart/types/cartTypes'

export type CartStatus = 'idle' | 'loading' | 'syncing' | 'ready' | 'error'

export type CartState = {
  count: number
  isSync: boolean
  itemsIds: ICartPushItem[]
  lastError: string | null
  pendingProductIds: Set<string>
  status: CartStatus
  tempItems: ICartItem[]
  totalPrice: number
}

export type CartSet = {
  (partial: Partial<CartState>): void
  (fn: (state: CartState) => Partial<CartState>): void
}

export type CartGet = () => CartState & {
  hydrate: (signal?: AbortSignal) => Promise<void>
}
