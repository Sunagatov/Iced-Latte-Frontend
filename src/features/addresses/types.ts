export interface DeliveryAddress {
  id: string
  label: string
  isDefault: boolean
  country: string
  city: string
  line: string
  postcode: string
}

export type AddressFormData = Omit<DeliveryAddress, 'id' | 'isDefault'>
