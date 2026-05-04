import type { DeliveryAddress } from '@/features/addresses/types'

export interface CheckoutFormValues {
  recipientName: string
  recipientSurname: string
  recipientPhone: string
  country: string
  city: string
  line: string
  postcode: string
}

export interface CheckoutAddressSelection {
  selectedAddress: DeliveryAddress | null
  shippingAddress: {
    country: string
    city: string
    line: string
    postcode: string
  }
}
