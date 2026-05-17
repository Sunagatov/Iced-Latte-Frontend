'use client'

import {
  useCartStore,
  type CartSliceStore,
} from '@/features/cart/cartStore'
import {
  type FavStoreState,
  useFavouritesStore,
} from '@/features/favorites/state/favoritesStore'

export function useFavoriteProductActions(productId: string) {
  const toggleFavourite = useFavouritesStore(
    (state: FavStoreState): FavStoreState['toggleFavourite'] =>
      state.toggleFavourite,
  )
  const favouriteIds = useFavouritesStore(
    (state: FavStoreState): string[] => state.favouriteIds,
  )
  const pendingIds = useFavouritesStore(
    (state: FavStoreState): Set<string> => state.pendingIds,
  )
  const add = useCartStore(
    (state: CartSliceStore): CartSliceStore['add'] => state.add,
  )
  const remove = useCartStore(
    (state: CartSliceStore): CartSliceStore['remove'] => state.remove,
  )
  const removeFullProduct = useCartStore(
    (state: CartSliceStore): CartSliceStore['removeFullProduct'] =>
      state.removeFullProduct,
  )
  const items = useCartStore(
    (state: CartSliceStore): CartSliceStore['itemsIds'] => state.itemsIds,
  )

  const quantity =
    items.find((item) => item.productId === productId)?.productQuantity ?? 0
  const isFavourited = favouriteIds.includes(productId)
  const isPending = pendingIds.has(productId)

  const handleToggleFavourite = (): void => {
    if (!isPending) {
      void toggleFavourite(productId)
    }
  }

  return {
    addToCart: () => add(productId),
    decreaseCartQuantity: () => remove(productId),
    handleToggleFavourite,
    isFavourited,
    isPending,
    quantity,
    removeFromCart: () => removeFullProduct(productId),
  }
}
