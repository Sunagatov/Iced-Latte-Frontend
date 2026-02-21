'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { filterProductsByPriceSchema } from '@/validation/filterProductsByPriceSchema'
import { useProductFiltersStore } from '@/store/productFiltersStore'
import { IProductPriceFilter } from '@/types/IProductPriceFilter'
import FiltersGroupTitle from '@/components/Product/FilterSidebar/FiltersGroupTitle'

const getDecimalFromString = (input: string) => {
  const cleanedValue = input.replace(/[^\d.]/g, '')

  const firstDotIndex = cleanedValue.indexOf('.')

  let resultValue = cleanedValue

  if (firstDotIndex === 0) {
    resultValue = '0.' + cleanedValue.replace(/\D/g, '')
  } else if (firstDotIndex !== -1) {
    resultValue =
      cleanedValue.slice(0, firstDotIndex + 1) +
      cleanedValue.slice(firstDotIndex + 1).replace(/\./, '')
  }

  return resultValue
}

const PriceFilter = () => {
  const { register, setValue } = useForm<IProductPriceFilter>({
    resolver: yupResolver(filterProductsByPriceSchema) as any,
    defaultValues: {
      fromPriceInput: '',
      toPriceInput: '',
    },
  })

  const { updateProductFiltersStore, toPriceFilter, fromPriceFilter } =
    useProductFiltersStore()

  useEffect(() => {
    setValue('toPriceInput', toPriceFilter)
  }, [toPriceFilter, setValue])

  useEffect(() => {
    setValue('fromPriceInput', fromPriceFilter)
  }, [fromPriceFilter, setValue])

  const [timerId, setTimerId] = useState<null | ReturnType<typeof setTimeout>>(
    null,
  )

  const handleFromInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const decimalInput = getDecimalFromString(event.target.value)

    setValue('fromPriceInput', decimalInput)

    handleSubmitWithDelay(() =>
      updateProductFiltersStore({
        fromPriceFilter: getDecimalFromString(event.target.value),
      }),
    )
  }

  const handleToInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const decimalInput = getDecimalFromString(event.target.value)

    setValue('toPriceInput', decimalInput)

    handleSubmitWithDelay(() =>
      updateProductFiltersStore({
        toPriceFilter: getDecimalFromString(event.target.value),
      }),
    )
  }

  const handleSubmitWithDelay = (callback: () => void) => {
    if (timerId) clearTimeout(timerId)

    const newTimerId = setTimeout(() => {
      callback()
    }, 1000)

    setTimerId(newTimerId)
  }

  return (
    <div>
      <FiltersGroupTitle title="Price, $" />
      <form className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/40">from</span>
          <input
            id="from-price-input"
            {...register('fromPriceInput')}
            type="text"
            placeholder="Min"
            onChange={handleFromInputChange}
            className="h-10 w-full rounded-lg border border-black/10 bg-white pl-10 pr-3 text-sm text-primary outline-none focus:border-brand-solid focus:ring-1 focus:ring-brand-solid placeholder:text-black/25"
          />
        </div>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/40">to</span>
          <input
            id="to-price-input"
            {...register('toPriceInput')}
            type="text"
            placeholder="Max"
            onChange={handleToInputChange}
            className="h-10 w-full rounded-lg border border-black/10 bg-white pl-7 pr-3 text-sm text-primary outline-none focus:border-brand-solid focus:ring-1 focus:ring-brand-solid placeholder:text-black/25"
          />
        </div>
      </form>
    </div>
  )
}

export default PriceFilter
