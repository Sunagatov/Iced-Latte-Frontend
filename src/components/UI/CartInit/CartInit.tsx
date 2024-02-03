'use client'
import { useAuthStore } from '@/store/authStore'
import { useCombinedStore } from '@/store/store'
import { useShallow } from 'zustand/react/shallow'

export default function CartInit() {
  const itemsIds = useCombinedStore(useShallow((state) => state.itemsIds))
  const getCartItems = useCombinedStore((state) => state.getCartItems)
  const syncBackendCart = useCombinedStore((state) => state.syncBackendCart)
  const isSync = useCombinedStore((state) => state.isSync)
  const reset = useCombinedStore((state) => state.resetCart)
  const { token } = useAuthStore()

  if (!token) {
    if (isSync) {
      reset()
    }
    if (itemsIds.length) {
      getCartItems().catch((e) => console.log(e))
    }
  } else if (!isSync && itemsIds.length) {
    syncBackendCart(token).catch((e) => console.log(e))
  }

  return <></>
}
