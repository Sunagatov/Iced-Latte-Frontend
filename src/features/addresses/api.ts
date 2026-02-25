import { api } from '@/shared/api/client'
import { DeliveryAddress, AddressFormData } from './types'

export const getAddresses = () =>
  api.get<DeliveryAddress[]>('/users/addresses').then((r) => r.data)

export const createAddress = (data: AddressFormData) =>
  api.post<DeliveryAddress>('/users/addresses', data).then((r) => r.data)

export const updateAddress = (id: string, data: AddressFormData) =>
  api.put<DeliveryAddress>(`/users/addresses/${id}`, data).then((r) => r.data)

export const deleteAddress = (id: string) =>
  api.delete(`/users/addresses/${id}`)

export const setDefaultAddress = (id: string) =>
  api.patch<DeliveryAddress>(`/users/addresses/${id}/default`).then((r) => r.data)
