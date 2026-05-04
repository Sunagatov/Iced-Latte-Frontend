'use client'

import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/cartStore'
import {
  getCheckoutUnavailableMessage,
  hostedCheckoutEnabled,
} from '@/features/payment/config'
import { createCheckout } from '@/features/payment/public'
import type { DeliveryAddress } from '@/features/addresses/types'
import type {
  CheckoutAddressSelection,
  CheckoutFormValues,
} from '@/features/checkout/checkoutTypes'

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
  const { userData } = useAuthStore()
  const { tempItems } = useCartStore()
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

    if (!hostedCheckoutEnabled) {
      setError(getCheckoutUnavailableMessage())

      return
    }

    if (tempItems.length === 0) {
      setError('Your cart is empty. Add items before placing an order.')

      return
    }

    setLoading(true)

    try {
      const idempotencyKey = crypto.randomUUID()

      const checkout = await createCheckout(
        {
          recipientName: form.recipientName,
          recipientSurname: form.recipientSurname,
          recipientPhone: form.recipientPhone || undefined,
          ...(selectedAddress
            ? { deliveryAddressId: selectedAddress.id }
            : { address: resolveShippingAddress(form, null) }),
        },
        idempotencyKey,
      )
      // Redirect to Stripe Hosted Checkout — do NOT resetCart() here.
      // Cart is cleared by the backend webhook after payment confirmation.
      window.location.href = checkout.checkoutUrl
    } catch {
      setError(getCheckoutUnavailableMessage())
    } finally {
      setLoading(false)
    }
  }

  return {
    error,
    form,
    handleSubmit,
    hostedCheckoutEnabled,
    loading,
    selectedAddress,
    setSelectedAddress,
    updateField,
  }
}
