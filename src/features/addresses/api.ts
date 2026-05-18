import { DeliveryAddress, AddressFormData } from './types'
import {
  addDeliveryAddress,
  deleteDeliveryAddress,
  getDeliveryAddresses,
  setDefaultDeliveryAddress,
  updateDeliveryAddress,
} from '@/shared/api/generated/user'

export const getAddresses = () =>
  getDeliveryAddresses({ cache: false } as object) as Promise<DeliveryAddress[]>

export const createAddress = (data: AddressFormData) =>
  addDeliveryAddress(data) as Promise<DeliveryAddress>

export const updateAddress = (id: string, data: AddressFormData) =>
  updateDeliveryAddress(id, data) as Promise<DeliveryAddress>

export const deleteAddress = (id: string) =>
  deleteDeliveryAddress(id)

export const setDefaultAddress = (id: string) =>
  setDefaultDeliveryAddress(id) as Promise<DeliveryAddress>
