'use client'

import { useState } from 'react'
import { DeliveryAddress } from '../types'
import { useAddressStore } from '../store'
import {
  RiMapPinLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
} from 'react-icons/ri'

interface Props {
  address: DeliveryAddress
  onEdit: (address: DeliveryAddress) => void
}

export default function AddressCard({ address, onEdit }: Props) {
  const { remove, setDefault } = useAddressStore()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await remove(address.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 transition ${
        address.isDefault
          ? 'border-brand bg-brand-second'
          : 'bg-primary border-black/10'
      }`}
    >
      {address.isDefault && (
        <span className="bg-brand absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
          <RiCheckLine className="h-3 w-3" /> Default
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="bg-secondary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <RiMapPinLine className="text-brand h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-primary truncate font-semibold">{address.label}</p>
          <p className="text-secondary mt-0.5 text-sm">{address.line}</p>
          <p className="text-secondary text-sm">
            {address.city}, {address.postcode}
          </p>
          <p className="text-secondary text-sm">{address.country}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!address.isDefault && (
          <button
            onClick={() => setDefault(address.id)}
            className="text-secondary hover:border-brand hover:text-brand rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium transition"
          >
            Set as default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="text-secondary hover:border-brand hover:text-brand flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium transition"
        >
          <RiEditLine className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-negative hover:border-negative ml-auto flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium transition hover:bg-red-50 disabled:opacity-50"
        >
          <RiDeleteBinLine className="h-3.5 w-3.5" />{' '}
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
