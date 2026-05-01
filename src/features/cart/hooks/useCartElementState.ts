'use client'

import { useEffect, useRef, useState } from 'react'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'

export function useCartElementState(productId: string, productQuantity: number) {
  const [pulse, setPulse] = useState(false)
  const previousQuantity = useRef(productQuantity)
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite)
  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const pendingIds = useFavouritesStore((state) => state.pendingIds)
  const isFavourited = favouriteIds.includes(productId)
  const isFavouritePending = pendingIds.has(productId)

  useEffect(() => {
    if (previousQuantity.current !== productQuantity) {
      setPulse(true)
      const timeoutId = setTimeout(() => setPulse(false), 400)

      previousQuantity.current = productQuantity

      return () => clearTimeout(timeoutId)
    }
  }, [productQuantity])

  const toggleFavouriteStatus = () => {
    if (!isFavouritePending) {
      void toggleFavourite(productId)
    }
  }

  return {
    isFavourited,
    isFavouritePending,
    pulse,
    toggleFavouriteStatus,
  }
}
