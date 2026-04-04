'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { DeliveryAddress, AddressFormData } from '../types'
import { useAddressStore } from '../store'
import countries from '@/features/user/constants'
import { RiCloseLine } from 'react-icons/ri'

interface Props {
  editing?: DeliveryAddress | null
  onClose: () => void
}

export default function AddressForm({ editing, onClose }: Props) {
  const { add, update } = useAddressStore()
  const overlayRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    defaultValues: editing
      ? {
          label: editing.label,
          country: editing.country,
          city: editing.city,
          line: editing.line,
          postcode: editing.postcode,
        }
      : { label: '', country: '', city: '', line: '', postcode: '' },
  })

  useEffect(() => {
    reset(
      editing
        ? {
            label: editing.label,
            country: editing.country,
            city: editing.city,
            line: editing.line,
            postcode: editing.postcode,
          }
        : { label: '', country: '', city: '', line: '', postcode: '' },
    )
  }, [editing, reset])

  const onSubmit = async (data: AddressFormData) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await add(data)
    }
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="bg-primary w-full max-w-md rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-primary font-semibold">
            {editing ? 'Edit address' : 'Add new address'}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary hover:bg-secondary rounded-lg p-1.5"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 p-5"
        >
          <Field label="Label (e.g. Home, Work)" error={errors.label?.message}>
            <input
              {...register('label', { required: 'Label is required' })}
              placeholder="Home"
              className={inputCls}
            />
          </Field>

          <Field label="Address line" error={errors.line?.message}>
            <input
              {...register('line', { required: 'Address is required' })}
              placeholder="123 Main St, Apt 4B"
              className={inputCls}
            />
          </Field>

          <div className="flex gap-3">
            <Field label="City" error={errors.city?.message} className="flex-1">
              <input
                {...register('city', { required: 'City is required' })}
                placeholder="London"
                className={inputCls}
              />
            </Field>
            <Field
              label="Postcode"
              error={errors.postcode?.message}
              className="flex-1"
            >
              <input
                {...register('postcode', { required: 'Postcode is required' })}
                placeholder="SW1A 1AA"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Country" error={errors.country?.message}>
            <select
              {...register('country', { required: 'Country is required' })}
              className={inputCls}
            >
              <option value="" disabled>
                Select country
              </option>
              {countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-secondary hover:bg-secondary flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand hover:bg-brand-solid-hover flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {isSubmitting
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Add address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-black/10 bg-secondary px-3 py-2.5 text-sm text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <label className="text-secondary text-xs font-medium">{label}</label>
      {children}
      {error && <p className="text-negative text-xs">{error}</p>}
    </div>
  )
}
