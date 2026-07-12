import type { DeliveryAddress, AddressFormData } from './types'
import {
  addDeliveryAddress,
  deleteDeliveryAddress,
  type DeliveryAddressDto,
  getDeliveryAddresses,
  setDefaultDeliveryAddress,
  updateDeliveryAddress,
} from '@/shared/api/generated/user'

function normalizeAddress(address: DeliveryAddressDto): DeliveryAddress {
  return {
    city: address.city ?? '',
    country: address.country ?? '',
    id: address.id ?? '',
    isDefault: address.isDefault ?? false,
    label: address.label ?? '',
    line: address.line ?? '',
    postcode: address.postcode ?? '',
  }
}

export const getAddresses = () =>
  getDeliveryAddresses({ cache: false } as object).then((addresses) =>
    addresses.map(normalizeAddress),
  )

export const createAddress = (data: AddressFormData) =>
  addDeliveryAddress(data).then(normalizeAddress)

export const updateAddress = (id: string, data: AddressFormData) =>
  updateDeliveryAddress(id, data).then(normalizeAddress)

export const deleteAddress = (id: string) =>
  deleteDeliveryAddress(id)

export const setDefaultAddress = (id: string) =>
  setDefaultDeliveryAddress(id).then(normalizeAddress)
