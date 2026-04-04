'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useProductFiltersStore } from '@/features/products/store'
import FiltersGroupTitle from '@/features/products/components/FilterSidebar/FiltersGroupTitle'

const toDecimal = (input: string) => {
  const cleaned = input.replace(/[^\d.]/g, '')
  const dot = cleaned.indexOf('.')

  if (dot === 0) return '0.' + cleaned.replace(/\D/g, '')
  if (dot !== -1) return cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./, '')

  return cleaned
}

const PriceFilter = () => {
  const { updateProductFiltersStore, toPriceFilter, fromPriceFilter } = useProductFiltersStore()

  const [fromInput, setFromInput] = useState(fromPriceFilter)
  const [toInput, setToInput] = useState(toPriceFilter)
  const [rangeError, setRangeError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when store is reset externally
  useEffect(() => { setFromInput(fromPriceFilter) }, [fromPriceFilter])
  useEffect(() => { setToInput(toPriceFilter) }, [toPriceFilter])

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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/40">from</span>
          <input
            id="from-price-input"
            type="text"
            value={fromInput}
            placeholder="Min"
            onChange={handleFromChange}
            className="h-10 w-full rounded-lg border border-black/10 bg-white pl-10 pr-3 text-sm text-primary outline-none focus:border-brand-solid focus:ring-1 focus:ring-brand-solid placeholder:text-black/25"
          />
        </div>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/40">to</span>
          <input
            id="to-price-input"
            type="text"
            value={toInput}
            placeholder="Max"
            onChange={handleToChange}
            className="h-10 w-full rounded-lg border border-black/10 bg-white pl-7 pr-3 text-sm text-primary outline-none focus:border-brand-solid focus:ring-1 focus:ring-brand-solid placeholder:text-black/25"
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
