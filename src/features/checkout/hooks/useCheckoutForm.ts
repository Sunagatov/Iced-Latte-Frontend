'use client'

import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/state/cartStore'
import { createOrder } from '@/features/orders/public'
import type { DeliveryAddress } from '@/features/addresses/types'
import type {
  CheckoutAddressSelection,
  CheckoutFormValues,
} from '@/features/checkout/types/checkoutTypes'

function getInitialFormValues(): CheckoutFormValues {
  const userData = useAuthStore.getState().userData

  return {
    recipientName: userData?.firstName ?? '',
    recipientSurname: userData?.lastName ?? '',
    recipientPhone: userData?.phoneNumber ?? '',
    country: userData?.address?.country ?? '',
    city: userData?.address?.city ?? '',
    line: userData?.address?.line ?? '',
    postcode: userData?.address?.postcode ?? '',
  }
}

function resolveShippingAddress(
  form: CheckoutFormValues,
  selectedAddress: DeliveryAddress | null,
): CheckoutAddressSelection['shippingAddress'] {
  if (selectedAddress) {
    return {
      country: selectedAddress.country,
      city: selectedAddress.city,
      line: selectedAddress.line,
      postcode: selectedAddress.postcode,
    }
  }

  return {
    country: form.country,
    city: form.city,
    line: form.line,
    postcode: form.postcode,
  }
}

export function useCheckoutForm() {
  const router = useRouter()
  const { userData } = useAuthStore()
  const { resetCart, tempItems } = useCartStore()
  const [selectedAddress, setSelectedAddress] =
    useState<DeliveryAddress | null>(null)
  const [form, setForm] = useState<CheckoutFormValues>(getInitialFormValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userData) {
      return
    }

    setForm((previous) => ({
      recipientName: previous.recipientName || userData.firstName || '',
      recipientSurname: previous.recipientSurname || userData.lastName || '',
      recipientPhone: previous.recipientPhone || userData.phoneNumber || '',
      country: previous.country || userData.address?.country || '',
      city: previous.city || userData.address?.city || '',
      line: previous.line || userData.address?.line || '',
      postcode: previous.postcode || userData.address?.postcode || '',
    }))
  }, [userData])

  const updateField =
    (field: keyof CheckoutFormValues) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setForm((previous) => ({ ...previous, [field]: event.target.value }))
      }

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (tempItems.length === 0) {
      setError('Your cart is empty. Add items before placing an order.')

      return
    }

    setLoading(true)

    try {
      await createOrder({
        recipientName: form.recipientName,
        recipientSurname: form.recipientSurname,
        recipientPhone: form.recipientPhone || undefined,
        address: resolveShippingAddress(form, selectedAddress),
      })
      resetCart()
      router.push('/orders')
    } catch {
      setError('Could not place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    error,
    form,
    handleSubmit,
    loading,
    selectedAddress,
    setSelectedAddress,
    updateField,
  }
}
