'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCombinedStore } from '@/store/store'
import { api } from '@/services/apiConfig/apiConfig'
import Link from 'next/link'
import Loader from '@/components/UI/Loader/Loader'

export default function CheckoutForm() {
  const router = useRouter()
  const { userData } = useAuthStore()
  const { tempItems, totalPrice, resetCart } = useCombinedStore()

  const [form, setForm] = useState({
    recipientName: userData?.firstName ?? '',
    recipientSurname: userData?.lastName ?? '',
    recipientPhone: userData?.phoneNumber ?? '',
    country: userData?.address?.country ?? '',
    city: userData?.address?.city ?? '',
    line: userData?.address?.line ?? '',
    postcode: userData?.address?.postcode ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/orders', {
        recipientName: form.recipientName,
        recipientSurname: form.recipientSurname,
        recipientPhone: form.recipientPhone || undefined,
        address: {
          country: form.country,
          city: form.city,
          line: form.line,
          postcode: form.postcode,
        },
      })
      resetCart()
      router.push('/orders')
    } catch {
      setError('Could not place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-primary">Checkout</h1>

      {/* Order summary */}
      <div className="mb-6 rounded-2xl bg-secondary p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">Order summary</p>
        <div className="flex flex-col gap-1">
          {tempItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-secondary truncate max-w-[300px]">
                {item.productInfo.name} <span className="opacity-60">×{item.productQuantity}</span>
              </span>
              <span className="font-medium tabular-nums text-primary">
                ${(item.productInfo.price * item.productQuantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-black/10 pt-3">
          <span className="font-semibold text-primary">Total</span>
          <span className="text-xl font-bold text-brand tabular-nums">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">Recipient</p>
        <div className="flex gap-3">
          <Field label="First name" value={form.recipientName} onChange={set('recipientName')} required />
          <Field label="Last name" value={form.recipientSurname} onChange={set('recipientSurname')} required />
        </div>
        <Field label="Phone (for delivery updates)" value={form.recipientPhone} onChange={set('recipientPhone')} type="tel" />

        <p className="text-xs font-bold uppercase tracking-widest text-secondary">Delivery address</p>
        <Field label="Address line" value={form.line} onChange={set('line')} required />
        <div className="flex gap-3">
          <Field label="City" value={form.city} onChange={set('city')} required />
          <Field label="Postcode" value={form.postcode} onChange={set('postcode')} required />
        </div>
        <Field label="Country" value={form.country} onChange={set('country')} required />

        {error && <p className="text-sm text-negative">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-[48px] bg-brand-solid py-3.5 text-base font-semibold text-inverted transition hover:bg-brand-solid-hover disabled:opacity-60"
        >
          {loading ? <Loader /> : 'Place order'}
        </button>

        <Link href="/cart" className="text-center text-sm text-secondary hover:text-primary">
          ← Back to cart
        </Link>
      </form>
    </div>
  )
}

function Field({
  label, value, onChange, required, type = 'text',
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  type?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label className="text-xs font-medium text-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-xl border border-black/10 bg-primary px-3 py-2.5 text-sm text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  )
}
