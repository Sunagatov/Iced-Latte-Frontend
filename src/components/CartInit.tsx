'use client'

import { useAuthStore } from '@/store/authStore'
import { useCombinedStore } from '@/store/store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

export default function CartInit() {
  const itemsIds = useCombinedStore(useShallow((state) => state.itemsIds))
  const getCartItems = useCombinedStore((state) => state.getCartItems)
  const syncBackendCart = useCombinedStore((state) => state.syncBackendCart)
  const isSync = useCombinedStore((state) => state.isSync)
  const reset = useCombinedStore((state) => state.resetCart)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) {
      if (isSync) {
        reset()
      }
      if (itemsIds.length) {
        getCartItems().catch((e) => console.log(e))
      }
    } else if (!isSync) {
      syncBackendCart(token).catch((e) => console.log(e))
    }
  })

  // [itemsIds, token, isSync]) - eSlint was complaying about this line. 
  // 27:6  Warning: React Hook useEffect has missing dependencies: 'getCartItems', 'reset', and 'syncBackendCart'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps


  return <></>
}
