'use client'

import { useState } from 'react'
import { DeliveryAddress } from '../types'
import { useAddressStore } from '../store'
import { RiMapPinLine, RiEditLine, RiDeleteBinLine, RiCheckLine } from 'react-icons/ri'

interface Props {
  address: DeliveryAddress
  onEdit: (address: DeliveryAddress) => void
}

export default function AddressCard({ address, onEdit }: Props) {
  const { remove, setDefault } = useAddressStore()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await remove(address.id) } finally { setDeleting(false) }
  }

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 transition ${
        address.isDefault ? 'border-brand bg-brand-second' : 'border-black/10 bg-primary'
      }`}
    >
      {address.isDefault && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
          <RiCheckLine className="h-3 w-3" /> Default
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <RiMapPinLine className="h-5 w-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary truncate">{address.label}</p>
          <p className="mt-0.5 text-sm text-secondary">{address.line}</p>
          <p className="text-sm text-secondary">{address.city}, {address.postcode}</p>
          <p className="text-sm text-secondary">{address.country}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!address.isDefault && (
          <button
            onClick={() => setDefault(address.id)}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-secondary transition hover:border-brand hover:text-brand"
          >
            Set as default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-secondary transition hover:border-brand hover:text-brand"
        >
          <RiEditLine className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-negative transition hover:border-negative hover:bg-red-50 disabled:opacity-50"
        >
          <RiDeleteBinLine className="h-3.5 w-3.5" /> {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
