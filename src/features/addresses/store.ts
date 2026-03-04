import { create } from 'zustand'
import { DeliveryAddress, AddressFormData } from './types'
import * as api from './api'

interface AddressStore {
  addresses: DeliveryAddress[]
  loading: boolean
  fetch: () => Promise<void>
  add: (data: AddressFormData) => Promise<void>
  update: (id: string, data: AddressFormData) => Promise<void>
  remove: (id: string) => Promise<void>
  setDefault: (id: string) => Promise<void>
}

export const useAddressStore = create<AddressStore>()(set => ({
  addresses: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const addresses = await api.getAddresses()

      set({ addresses })
    } finally {
      set({ loading: false })
    }
  },

  add: async (data) => {
    const address = await api.createAddress(data)

    set((s) => ({ addresses: [...s.addresses, address] }))
  },

  update: async (id, data) => {
    const updated = await api.updateAddress(id, data)

    set((s) => ({
      addresses: s.addresses.map((a) => (a.id === id ? updated : a)),
    }))
  },

  remove: async (id) => {
    await api.deleteAddress(id)
    set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }))
  },

  setDefault: async (id) => {
    await api.setDefaultAddress(id)
    set((s) => ({
      addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    }))
  },
}))
