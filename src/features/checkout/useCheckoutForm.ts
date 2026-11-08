'use client'

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react'
import { useAuthStore } from '@/features/auth/public'
import { captureAccountScope } from '@/features/auth/accountScope'
import axios from 'axios'
import { useAddressStore } from '@/features/addresses/store'
import { useCartStore } from '@/features/cart/public'
import {
  buildGoogleAnalyticsItems,
  trackGoogleAnalyticsEvent,
} from '@/shared/analytics/googleAnalytics'
import {
  checkoutTurnstileEnabled,
  getCheckoutErrorMessage,
  getCheckoutUnavailableMessage,
  hostedCheckoutEnabled,
} from '@/features/payment/public'
import { createCheckout } from '@/features/payment/public'
import type { DeliveryAddress } from '@/features/addresses/public'
import type {
  CheckoutAddressMode,
  CheckoutAddressSelection,
  CheckoutFormValues,
} from '@/features/checkout/checkoutTypes'
import { redirectToHostedCheckout } from '@/features/checkout/redirect'
import type { TurnstileInstance } from '@marsidev/react-turnstile'

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

function trimFormValues(form: CheckoutFormValues): CheckoutFormValues {
  return {
    recipientName: form.recipientName.trim(),
    recipientSurname: form.recipientSurname.trim(),
    recipientPhone: form.recipientPhone.trim(),
    country: form.country.trim(),
    city: form.city.trim(),
    line: form.line.trim(),
    postcode: form.postcode.trim(),
  }
}

function hasRequiredCheckoutFields(
  form: CheckoutFormValues,
  selectedAddress: DeliveryAddress | null,
): boolean {
  const hasRecipient = Boolean(form.recipientName && form.recipientSurname)

  if (selectedAddress) {
    return hasRecipient
  }

  return Boolean(
    hasRecipient && form.country && form.city && form.line && form.postcode,
  )
}

export function useCheckoutForm() {
  const { status, userData } = useAuthStore()
  const hasSavedAddresses = useAddressStore(
    (state) => state.addresses.length > 0,
  )
  const { tempItems } = useCartStore()
  const [selectedAddress, setSelectedAddress] =
    useState<DeliveryAddress | null>(null)
  const [addressMode, setAddressMode] = useState<CheckoutAddressMode>('loading')
  const [form, setForm] = useState<CheckoutFormValues>(getInitialFormValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
  const checkoutInFlightRef = useRef(false)
  const checkoutAttemptRef = useRef<{ fingerprint: string; key: string } | null>(null)
  const formAccount = useRef(userData?.email ?? null)

  useEffect(() => {
    const account = userData?.email ?? null

    if (formAccount.current !== account) {
      formAccount.current = account
      setForm(getInitialFormValues())
      setSelectedAddress(null)
      setAddressMode('loading')
      setError('')
      setTurnstileToken('')

      return
    }
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

    if (checkoutInFlightRef.current) {
      return
    }

    setError('')

    if (!hostedCheckoutEnabled) {
      setError(getCheckoutUnavailableMessage())

      return
    }

    if (tempItems.length === 0) {
      setError('Your cart is empty. Add items before placing an order.')

      return
    }

    if (checkoutTurnstileEnabled && !turnstileToken) {
      setError('Please complete verification before placing your order.')

      return
    }

    checkoutInFlightRef.current = true
    setLoading(true)

    try {
      const trimmedForm = trimFormValues(form)

      if (!hasRequiredCheckoutFields(trimmedForm, selectedAddress)) {
        setError('Please complete all required checkout fields.')

        return
      }

      const account = captureAccountScope()
      const payload = {
        recipientName: trimmedForm.recipientName,
        recipientSurname: trimmedForm.recipientSurname,
        recipientPhone: trimmedForm.recipientPhone || undefined,
        ...(selectedAddress
          ? { deliveryAddressId: selectedAddress.id }
          : { address: resolveShippingAddress(trimmedForm, null) }),
      }
      // A lost response may follow a committed order. Retry that intent with
      // the same key, including after renewing an expired Turnstile token.
      const fingerprint = JSON.stringify({
        account: account.key,
        payload,
        items: tempItems.map((item) => ({
          id: item.productInfo.id,
          quantity: item.productQuantity,
          price: item.productInfo.price,
        })).sort((a, b) => a.id.localeCompare(b.id)),
      })

      if (checkoutAttemptRef.current?.fingerprint !== fingerprint) {
        checkoutAttemptRef.current = { fingerprint, key: crypto.randomUUID() }
      }

      trackGoogleAnalyticsEvent('begin_checkout', {
        currency: 'USD',
        value: tempItems.reduce(
          (sum, item) => sum + item.productInfo.price * item.productQuantity,
          0,
        ),
        items: buildGoogleAnalyticsItems(tempItems),
      })

      const checkout = await createCheckout(
        {
          ...payload,
          ...(checkoutTurnstileEnabled ? { turnstileToken } : {}),
        },
        checkoutAttemptRef.current.key,
      )

      // Redirect to Stripe Hosted Checkout; the backend webhook clears the cart
      // after payment confirmation.
      if (account.isCurrent()) redirectToHostedCheckout(checkout.checkoutUrl)
    } catch (error) {
      // Validation errors (including an expired checkout session) explicitly
      // reject the attempt. Network errors and server failures remain uncertain.
      if (axios.isAxiosError(error) && [400, 422].includes(error.response?.status ?? 0)) {
        checkoutAttemptRef.current = null
      }
      setError(getCheckoutErrorMessage(error))
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } finally {
      checkoutInFlightRef.current = false
      setLoading(false)
    }
  }

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)

    if (token) {
      setError('')
    }
  }

  return {
    addressMode,
    canEditManualAddress:
      addressMode === 'new' || (status !== 'loading' && !hasSavedAddresses),
    error,
    checkoutTurnstileEnabled,
    form,
    handleSubmit,
    hostedCheckoutEnabled,
    loading,
    selectedAddress,
    setAddressMode,
    setSelectedAddress,
    handleTurnstileVerify,
    turnstileRef,
    updateField,
  }
}
