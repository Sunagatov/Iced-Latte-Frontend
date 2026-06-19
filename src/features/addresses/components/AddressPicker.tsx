'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore, type AuthStore } from '@/features/auth/public'
import type { CheckoutAddressMode } from '@/features/checkout/checkoutTypes'
import { useAddressStore } from '../store'
import type { DeliveryAddress } from '../types'
import { RiMapPinLine, RiCheckLine, RiAddLine } from 'react-icons/ri'

interface Props {
  mode: CheckoutAddressMode
  onModeChange: (mode: CheckoutAddressMode) => void
  onSelect: (address: DeliveryAddress | null) => void
  selected: DeliveryAddress | null
}

export default function AddressPicker({
  mode,
  onModeChange,
  onSelect,
  selected,
}: Props) {
  const { addresses, fetch, loading } = useAddressStore()
  const [initialFetchComplete, setInitialFetchComplete] = useState(false)
  const authStatus = useAuthStore(
    (state: AuthStore): AuthStore['status'] => state.status,
  )
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setInitialFetchComplete(false)

      return
    }

    let cancelled = false

    setInitialFetchComplete(false)

    void fetch().finally(() => {
      if (!cancelled) {
        setInitialFetchComplete(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [authStatus, fetch])

  useEffect(() => {
    if (
      authStatus === 'loading' ||
      (authStatus === 'authenticated' && !initialFetchComplete) ||
      (loading && addresses.length === 0)
    ) {
      onModeChange('loading')

      return
    }

    if (addresses.length === 0) {
      onModeChange('new')
      onSelect(null)

      return
    }

    if (mode === 'loading') {
      onModeChange('saved')
    }

    if ((mode === 'saved' || mode === 'loading') && !selected) {
      onSelect(defaultAddress)
    }
  }, [
    addresses,
    authStatus,
    defaultAddress,
    initialFetchComplete,
    loading,
    mode,
    onModeChange,
    onSelect,
    selected,
  ])

  if (
    authStatus === 'loading' ||
    (authStatus === 'authenticated' && !initialFetchComplete) ||
    (loading && addresses.length === 0)
  ) {
    return (
      <p className="text-secondary mb-2 text-sm">Loading saved addresses...</p>
    )
  }

  if (addresses.length === 0) return null

  return (
    <div className="mb-2">
      {/* Mode toggle */}
      <div className="mb-3 flex gap-2">
        <ModeBtn
          active={mode === 'saved'}
          onClick={() => {
            onModeChange('saved')
            onSelect(defaultAddress)
          }}
        >
          Saved addresses
        </ModeBtn>
        <ModeBtn
          active={mode === 'new'}
          onClick={() => {
            onModeChange('new')
            onSelect(null)
          }}
        >
          <RiAddLine className="h-3.5 w-3.5" /> New address
        </ModeBtn>
      </div>

      {mode === 'saved' && (
        <div className="flex flex-col gap-2">
          {addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a)}
              className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${
                selected?.id === a.id
                  ? 'border-brand bg-brand-second'
                  : 'bg-primary hover:border-brand/40 border-black/10'
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected?.id === a.id ? 'bg-brand' : 'bg-secondary'}`}
              >
                {selected?.id === a.id ? (
                  <RiCheckLine className="h-4 w-4 text-white" />
                ) : (
                  <RiMapPinLine className="text-brand h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm font-semibold">
                    {a.label}
                  </span>
                  {a.isDefault && (
                    <span className="bg-brand rounded-full px-2 py-0.5 text-xs font-medium text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-secondary truncate text-xs">
                  {a.line}, {a.city}, {a.postcode}, {a.country}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-brand text-white'
          : 'bg-secondary text-secondary hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}
