'use client'

import { useEffect, useState } from 'react'
import { useAddressStore } from '../store'
import { DeliveryAddress } from '../types'
import { RiMapPinLine, RiCheckLine, RiAddLine } from 'react-icons/ri'

interface Props {
  onSelect: (address: DeliveryAddress | null) => void
  selected: DeliveryAddress | null
}

export default function AddressPicker({ onSelect, selected }: Props) {
  const { addresses, fetch } = useAddressStore()
  const [mode, setMode] = useState<'saved' | 'new'>('saved')

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    if (addresses.length === 0) {
      setMode('new')
      onSelect(null)

      return
    }
    if (mode === 'saved' && !selected) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0]

      onSelect(def)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses])

  if (addresses.length === 0) return null

  return (
    <div className="mb-2">
      {/* Mode toggle */}
      <div className="mb-3 flex gap-2">
        <ModeBtn active={mode === 'saved'} onClick={() => {
          setMode('saved')
          const def = (addresses.find((a) => a.isDefault) ?? addresses[0]) as DeliveryAddress

          onSelect(def)
        }}>
          Saved addresses
        </ModeBtn>
        <ModeBtn active={mode === 'new'} onClick={() => { setMode('new'); onSelect(null) }}>
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
                  : 'border-black/10 bg-primary hover:border-brand/40'
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected?.id === a.id ? 'bg-brand' : 'bg-secondary'}`}>
                {selected?.id === a.id
                  ? <RiCheckLine className="h-4 w-4 text-white" />
                  : <RiMapPinLine className="h-4 w-4 text-brand" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{a.label}</span>
                  {a.isDefault && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-white">Default</span>
                  )}
                </div>
                <p className="text-xs text-secondary truncate">{a.line}, {a.city}, {a.postcode}, {a.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand text-white' : 'bg-secondary text-secondary hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}
