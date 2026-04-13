'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import type { CacheAxiosResponse } from 'axios-cache-interceptor'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import { api } from '@/shared/api/client'
import Button from '@/shared/components/Buttons/Button/Button'
import Loader from '@/shared/components/Loader/Loader'
import order from '@/../public/orders_stub.png'

interface PaymentSessionStatus {
  status: string
  customerEmail: string
}

export default function OrderSuccess() {
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(true)

  const isLoggedIn = useAuthStore(
    (state: AuthStore): boolean => state.isLoggedIn,
  )
  const resetCart = useCartStore(
    (state: CartSliceStore): CartSliceStore['resetCart'] => state.resetCart,
  )
  const urlParams: ReadonlyURLSearchParams = useSearchParams()

  useEffect(() => {
    const sessionId: string | null = urlParams.get('sessionId')

    setLoading(true)

    if (isLoggedIn) {
      api
        .get<PaymentSessionStatus>(`/payment/order?sessionId=${sessionId}`)
        .then(
          (
            res: CacheAxiosResponse<PaymentSessionStatus>,
          ): PaymentSessionStatus => res.data,
        )
        .then((data: PaymentSessionStatus) => {
          setCustomerEmail(data.customerEmail)
          resetCart()
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isLoggedIn, resetCart, urlParams])

  if (loading) {
    return (
      <div className="flex min-h-[100vh] w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <section id="success" className="p-4">
      <p className="flex items-center justify-center text-center md:text-left">
        A confirmation email will be sent to {customerEmail}.
      </p>
      <p className="flex items-center justify-center text-center md:text-left">
        If you have any questions, please email
        <a href="mailto:orders@iced-latte.com" className="ml-1">
          orders@iced-latte.com
        </a>
        .
      </p>
      <div className="mt-2 flex flex-col items-center gap-2 py-2 md:mt-4 md:gap-3 md:py-2 lg:mt-4 lg:gap-3 lg:py-2">
        <Image
          className="h-auto w-full max-w-xs md:max-w-md lg:max-w-lg"
          src={order}
          alt="Picture of order"
          width={500}
          height={500}
        />
        <Button
          id="continue-btn"
          className="h-14 w-full max-w-[211px] text-lg font-medium"
        >
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </section>
  )
}
