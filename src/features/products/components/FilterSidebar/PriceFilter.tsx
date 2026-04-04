'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useProductFiltersStore } from '@/features/products/store'
import FiltersGroupTitle from '@/features/products/components/FilterSidebar/FiltersGroupTitle'

const toDecimal = (input: string) => {
  const cleaned = input.replace(/[^\d.]/g, '')
  const dot = cleaned.indexOf('.')

  if (dot === 0) return '0.' + cleaned.replace(/\D/g, '')
  if (dot !== -1)
    return cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./, '')

  return cleaned
}

const PriceFilter = () => {
  const updateProductFiltersStore = useProductFiltersStore(
    (s) => s.updateProductFiltersStore,
  )
  const toPriceFilter: string = useProductFiltersStore((s) => s.toPriceFilter)
  const fromPriceFilter: string = useProductFiltersStore(
    (s) => s.fromPriceFilter,
  )

  const [fromInput, setFromInput] = useState(fromPriceFilter)
  const [toInput, setToInput] = useState(toPriceFilter)
  const [rangeError, setRangeError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when store is reset externally
  useEffect(() => {
    setFromInput(fromPriceFilter)
  }, [fromPriceFilter])
  useEffect(() => {
    setToInput(toPriceFilter)
  }, [toPriceFilter])

  const scheduleUpdate = (from: string, to: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const fromNum = parseFloat(from)
      const toNum = parseFloat(to)

      if (from && to && !isNaN(fromNum) && !isNaN(toNum) && fromNum > toNum) {
        setRangeError('Min price cannot be greater than max price')

        return
      }
      setRangeError('')
      updateProductFiltersStore({ fromPriceFilter: from, toPriceFilter: to })
    }, 800)
  }

  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = toDecimal(e.target.value)

    setFromInput(val)
    setRangeError('')
    scheduleUpdate(val, toInput)
  }

  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = toDecimal(e.target.value)

    setToInput(val)
    setRangeError('')
    scheduleUpdate(fromInput, val)
  }

  return (
    <div>
      <FiltersGroupTitle title="Price, $" />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-black/40">
            from
          </span>
          <input
            className="text-primary focus:border-brand-solid focus:ring-brand-solid h-10 w-full rounded-lg border border-black/10 bg-white pr-3 pl-10 text-sm outline-none placeholder:text-black/25 focus:ring-1"
            id="from-price-input"
            onChange={handleFromChange}
            placeholder="Min"
            type="text"
            value={fromInput}
          />
        </div>
        <div className="relative flex-1">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-black/40">
            to
          </span>
          <input
            className="text-primary focus:border-brand-solid focus:ring-brand-solid h-10 w-full rounded-lg border border-black/10 bg-white pr-3 pl-7 text-sm outline-none placeholder:text-black/25 focus:ring-1"
            id="to-price-input"
            onChange={handleToChange}
            placeholder="Max"
            type="text"
            value={toInput}
          />
        </div>
      </div>
      {rangeError && (
        <p className="mt-1.5 text-xs text-red-500">{rangeError}</p>
      )}
    </div>
  )
}

export default PriceFilter
