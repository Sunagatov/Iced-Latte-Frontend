'use client'

import React, { useEffect, useState } from 'react'
import { api } from '@/services/apiConfig/apiConfig'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCombinedStore } from '@/store/store'
import Image from 'next/image'
import order from '../../../public/orders_stub.png'
import Button from '@/components/UI/Buttons/Button/Button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CacheAxiosResponse } from 'axios-cache-interceptor'
import Loader from '@/components/UI/Loader/Loader'

interface PaymentSessionStatus {
  status: string
  customerEmail: string
}

export default function OrdersForm() {
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)
  const resetCart = useCombinedStore((state) => state.resetCart)
  const urlParams: ReadonlyURLSearchParams = useSearchParams()

  useEffect(() => {
    const sessionId: string | null = urlParams.get('sessionId')
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    }

    setLoading(true)
    if (token) {
      api
        .get<PaymentSessionStatus>(
          `/payment/order?sessionId=${sessionId}`,
          config,
        )
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
        .catch((err) => console.error(err))
    }
  }, [token, urlParams, resetCart])

  if (loading) {
    // Display a loading spinner while BE creates order
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
          <Link href={'/'}>Continue Shopping</Link>
        </Button>
      </div>
    </section>
  )
}
