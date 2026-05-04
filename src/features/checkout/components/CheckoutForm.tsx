'use client'

import type { ChangeEvent } from 'react'
import Link from 'next/link'
import AddressPicker from '@/features/addresses/components/AddressPicker'
import CheckoutSummary from '@/features/checkout/components/CheckoutSummary'
import { useCheckoutForm } from '@/features/checkout/hooks/useCheckoutForm'
import Loader from '@/shared/ui/Loader'

export default function CheckoutForm() {
  const {
    error,
    form,
    handleSubmit,
    loading,
    selectedAddress,
    setSelectedAddress,
    updateField,
  } = useCheckoutForm()

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-10">
      <h1 className="text-primary mb-6 text-3xl font-bold">Checkout</h1>

      <CheckoutSummary />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-secondary text-xs font-bold tracking-widest uppercase">
          Recipient
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Field
            id="recipientName"
            label="First name"
            value={form.recipientName}
            onChange={updateField('recipientName')}
            required
          />
          <Field
            id="recipientSurname"
            label="Last name"
            value={form.recipientSurname}
            onChange={updateField('recipientSurname')}
            required
          />
        </div>
        <Field
          id="recipientPhone"
          label="Phone (for delivery updates)"
          value={form.recipientPhone}
          onChange={updateField('recipientPhone')}
          type="tel"
        />

        <p className="text-secondary text-xs font-bold tracking-widest uppercase">
          Delivery address
        </p>

        <AddressPicker
          selected={selectedAddress}
          onSelect={setSelectedAddress}
        />

        {!selectedAddress && (
          <>
            <Field
              id="addressLine"
              label="Address line"
              value={form.line}
              onChange={updateField('line')}
              required
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Field
                id="city"
                label="City"
                value={form.city}
                onChange={updateField('city')}
                required
              />
              <Field
                id="postcode"
                label="Postcode"
                value={form.postcode}
                onChange={updateField('postcode')}
                required
              />
            </div>
            <Field
              id="country"
              label="Country"
              value={form.country}
              onChange={updateField('country')}
              required
            />
          </>
        )}

        {error && <p className="text-negative text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brand-solid text-inverted hover:bg-brand-solid-hover mt-2 flex w-full items-center justify-center rounded-[48px] py-3.5 text-base font-semibold transition disabled:opacity-60"
        >
          {loading ? <Loader /> : 'Place order'}
        </button>

        <Link
          href="/cart"
          className="text-secondary hover:text-primary text-center text-sm"
        >
          ← Back to cart
        </Link>
      </form>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  type?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-secondary text-xs font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-primary text-primary focus:border-brand focus:ring-brand/20 rounded-xl border border-black/10 px-3 py-2.5 text-sm transition outline-none focus:ring-2"
      />
    </div>
  )
}
