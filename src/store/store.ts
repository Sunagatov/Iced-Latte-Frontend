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
        itemsIds: state.itemsIds,
        tempItems: state.tempItems,
        count: state.count,
        totalPrice: state.totalPrice,
        isSync: state.isSync
      }),
    },
  ),
)
