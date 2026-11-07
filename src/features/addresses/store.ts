import { create } from 'zustand'
import { captureAccountScope } from '@/features/auth/accountScope'
import type { DeliveryAddress, AddressFormData } from './types'
import * as api from './api'
import { getUserMessage } from '@/shared/utils/errorMessages'
import { toastError } from '@/shared/utils/apiError'

interface AddressStore {
  addresses: DeliveryAddress[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: AddressFormData) => Promise<void>
  update: (id: string, data: AddressFormData) => Promise<void>
  remove: (id: string) => Promise<void>
  setDefault: (id: string) => Promise<void>
  reset: () => void
}

export const useAddressStore = create<AddressStore>()((set, get) => {
  let sessionVersion = 0
  let mutationVersion = 0
  let loadVersion = 0
  let defaultVersion = 0
  const addressVersions = new Map<string, number>()

  return {
    addresses: [],
    loading: false,
    error: null,

    fetch: async () => {
      const account = captureAccountScope()
      const session = sessionVersion
      const mutation = mutationVersion
      const request = ++loadVersion

      set({ loading: true, error: null })
      try {
        const addresses = await api.getAddresses()

        if (
          session === sessionVersion &&
          account.isCurrent() &&
          mutation === mutationVersion &&
          request === loadVersion
        )
          set({ addresses })
      } catch {
        if (
          session === sessionVersion &&
          account.isCurrent() &&
          mutation === mutationVersion &&
          request === loadVersion
        ) {
          set({ error: 'Failed to load addresses. Please try again.' })
        }
      } finally {
        if (
          session === sessionVersion &&
          account.isCurrent() &&
          request === loadVersion
        )
          set({ loading: false })
      }
    },

    add: async (data) => {
      const account = captureAccountScope()
      const session = sessionVersion
      const defaultAtStart = defaultVersion

      mutationVersion += 1
      try {
        const address = await api.createAddress(data)

        if (session !== sessionVersion || !account.isCurrent()) return
        mutationVersion += 1
        set((s) => ({
          // A later GET may already contain this committed creation.
          addresses: s.addresses.some((existing) => existing.id === address.id)
            ? s.addresses
            : [
              ...s.addresses,
              {
                ...address,
                isDefault:
                    defaultAtStart === defaultVersion && address.isDefault,
              },
            ],
          error: null,
        }))
      } catch (err) {
        if (session !== sessionVersion || !account.isCurrent()) return
        const msg = getUserMessage(err)

        set({ error: msg })
        toastError(err)
        throw err
      }
    },

    update: async (id, data) => {
      const account = captureAccountScope()
      const session = sessionVersion
      const request = (addressVersions.get(id) ?? 0) + 1

      addressVersions.set(id, request)

      mutationVersion += 1
      try {
        const updated = await api.updateAddress(id, data)

        if (
          session !== sessionVersion ||
          !account.isCurrent() ||
          addressVersions.get(id) !== request
        )
          return
        mutationVersion += 1
        set((s) => ({
          // Editing address fields must not reset a newer default selection.
          addresses: s.addresses.map((a) =>
            a.id === id ? { ...updated, isDefault: a.isDefault } : a,
          ),
          error: null,
        }))
      } catch (err) {
        if (
          session !== sessionVersion ||
          !account.isCurrent() ||
          addressVersions.get(id) !== request
        )
          return
        const msg = getUserMessage(err)

        set({ error: msg })
        toastError(err)
        throw err
      }
    },

    remove: async (id) => {
      const account = captureAccountScope()
      const session = sessionVersion

      addressVersions.set(id, (addressVersions.get(id) ?? 0) + 1)
      mutationVersion += 1
      try {
        const wasDefault = get().addresses.some(
          (address) => address.id === id && address.isDefault,
        )

        await api.deleteAddress(id)
        if (session !== sessionVersion || !account.isCurrent()) return
        mutationVersion += 1
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
          error: null,
        }))
        if (wasDefault) await get().fetch()
      } catch (err) {
        if (session !== sessionVersion || !account.isCurrent()) return
        const msg = getUserMessage(err)

        set({ error: msg })
        toastError(err)
        throw err
      }
    },

    setDefault: async (id) => {
      const account = captureAccountScope()
      const session = sessionVersion
      const request = ++defaultVersion

      mutationVersion += 1
      try {
        await api.setDefaultAddress(id)
        if (
          session !== sessionVersion ||
          !account.isCurrent() ||
          request !== defaultVersion
        )
          return
        mutationVersion += 1
        set((s) => ({
          addresses: s.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
          error: null,
        }))
      } catch (err) {
        if (
          session !== sessionVersion ||
          !account.isCurrent() ||
          request !== defaultVersion
        )
          return
        const msg = getUserMessage(err)

        set({ error: msg })
        toastError(err)
        throw err
      }
    },
    reset: () => {
      sessionVersion += 1
      mutationVersion += 1
      loadVersion += 1
      defaultVersion += 1
      addressVersions.clear()
      set({ addresses: [], loading: false, error: null })
    },
  }
})
