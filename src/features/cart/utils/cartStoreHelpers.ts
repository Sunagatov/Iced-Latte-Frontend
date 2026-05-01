import type { CartSliceStore } from '@/features/cart/state/cartStore'

export type StoreSet = {
  (partial: Partial<CartSliceStore>): void
  (fn: (state: CartSliceStore) => Partial<CartSliceStore>): void
}

export type StoreGet = () => CartSliceStore
