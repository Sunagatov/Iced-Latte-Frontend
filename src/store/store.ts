import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type CartSliceStore, createCartSlice } from './cartSlice'

export const useCombinedStore = create<CartSliceStore>()(
  persist(
    (...a) => ({
      ...createCartSlice(...a),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        count: state.count,
        totalPrice: state.totalPrice,
      }),
    },
  ),
)
