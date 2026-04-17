import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import { useCartStore } from '@/features/cart/store'
import { clearAuthCookies } from '@/shared/utils/cookieUtils'

/**
 * Clears all client-side session state: auth, cart, and favourites.
 * Call this on logout or on unrecoverable auth failure.
 */
export async function clearClientSession(): Promise<void> {
  await clearAuthCookies()
  useAuthStore.getState().reset()
  useFavouritesStore.getState().resetFav()
  useCartStore.getState().resetCart()
}
