import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type CartSliceStore, createCartSlice } from './cartSlice'
import { IProduct } from '@/models/Products'
import { productsList } from '@/data/products'

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

export interface FavSliceState {
  favourites: IProduct[]
}

const initialState: FavSliceState = { favourites: productsList.products! }

interface FavSliceActions {
  addFavourite: (id: IProduct) => void
  removeFavourite: (id: string) => void
}

export type FavSliceStore = FavSliceState & FavSliceActions

export const useFavouritesStore = create<FavSliceStore>((set) => ({
  ...initialState,
  addFavourite: (product) =>
    set((state) => ({
      favourites: [...state.favourites, product],
    })),

  removeFavourite: (id) =>
    set((state) => ({
      favourites: state.favourites.filter((fav) => fav.id !== id),
    })),
}))
