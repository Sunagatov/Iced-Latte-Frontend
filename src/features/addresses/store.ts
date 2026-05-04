import { create } from 'zustand'
import { DeliveryAddress, AddressFormData } from './types'
import * as api from './api'
import { handleAxiosError } from '@/shared/utils/apiError'

interface AddressStore {
  addresses: DeliveryAddress[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: AddressFormData) => Promise<void>
  update: (id: string, data: AddressFormData) => Promise<void>
  remove: (id: string) => Promise<void>
  setDefault: (id: string) => Promise<void>
}

export const useAddressStore = create<AddressStore>()(
  (set) => ({
    addresses: [],
    loading: false,
    error: null,

    fetch: async () => {
      set({ loading: true, error: null })
      try {
        const addresses = await api.getAddresses()

        set({ addresses })
      } catch {
        set({ error: 'Failed to load addresses. Please try again.' })
      } finally {
        set({ loading: false })
      }
    },

    add: async (data) => {
      try {
        const address = await api.createAddress(data)

        set((s) => ({ addresses: [...s.addresses, address], error: null }))
      } catch (err) {
        set({ error: handleAxiosError(err) })
      }
    },

    update: async (id, data) => {
      try {
        const updated = await api.updateAddress(id, data)

        set((s) => ({
          addresses: s.addresses.map((a) => (a.id === id ? updated : a)),
          error: null,
        }))
      } catch (err) {
        set({ error: handleAxiosError(err) })
      }
    },

    remove: async (id) => {
      try {
        await api.deleteAddress(id)
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
          error: null,
        }))
      } catch (err) {
        set({ error: handleAxiosError(err) })
      }
    },

    setDefault: async (id) => {
      try {
        await api.setDefaultAddress(id)
        set((s) => ({
          addresses: s.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
          error: null,
        }))
      } catch (err) {
        set({ error: handleAxiosError(err) })
      }
    },
  }),
)
