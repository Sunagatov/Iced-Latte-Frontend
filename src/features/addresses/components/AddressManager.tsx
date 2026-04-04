'use client'

import { useEffect, useState } from 'react'
import { useAddressStore } from '../store'
import { DeliveryAddress } from '../types'
import AddressCard from './AddressCard'
import AddressForm from './AddressForm'
import { RiMapPinLine, RiAddLine } from 'react-icons/ri'
import Loader from '@/shared/components/Loader/Loader'

export default function AddressManager() {
  const { addresses, loading, error, fetch } = useAddressStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DeliveryAddress | null>(null)

  useEffect(() => { fetch() }, [fetch])

  const openAdd = () => { setEditing(null); setShowForm(true) }
  const openEdit = (a: DeliveryAddress) => { setEditing(a); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-primary px-5 py-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <RiMapPinLine className="h-5 w-5 text-brand" />
          <h2 className="font-semibold text-primary">Delivery addresses</h2>
          {addresses.length > 0 && (
            <span className="rounded-full bg-brand-second px-2 py-0.5 text-xs font-semibold text-brand">
              {addresses.length}
            </span>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-solid-hover"
        >
          <RiAddLine className="h-4 w-4" /> Add address
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader /></div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-10 text-center">
          <p className="font-medium text-negative">{error}</p>
          <button
            className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-solid-hover"
            onClick={() => fetch()}
          >
            Try again
          </button>
        </div>
      ) : addresses.length === 0 ? (
        <div
          onClick={openAdd}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-primary p-10 text-center transition hover:border-brand hover:bg-brand-second"
        >
          <RiMapPinLine className="h-10 w-10 text-disabled" />
          <p className="font-medium text-primary">No saved addresses yet</p>
          <p className="text-sm text-secondary">Add your first delivery address for faster checkout</p>
          <button className="mt-1 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-solid-hover">
            + Add address
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <AddressCard key={a.id} address={a} onEdit={openEdit} />
          ))}
          <button
            onClick={openAdd}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 p-6 text-center transition hover:border-brand hover:bg-brand-second"
          >
            <RiAddLine className="h-6 w-6 text-disabled" />
            <span className="text-sm font-medium text-secondary">Add another address</span>
          </button>
        </div>
      )}

      {showForm && <AddressForm editing={editing} onClose={closeForm} />}
    </div>
  )
}
