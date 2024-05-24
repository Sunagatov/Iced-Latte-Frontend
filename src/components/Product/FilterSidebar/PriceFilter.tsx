'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { filterProductsByPriceSchema } from '@/validation/filterProductsByPriceSchema'
import { useProductFiltersStore } from '@/store/productFiltersStore'
import { IProductPriceFilter } from '@/types/IProductPriceFilter'
import FiltersGroupTitle from '@/components/Product/FilterSidebar/FiltersGroupTitle'
import FormInput from '@/components/UI/FormInput/FormInput'

const getDecimalFromString = (input: string) => {
  const cleanedValue = input.replace(/[^\d.]/, '')

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
    resolver: yupResolver(filterProductsByPriceSchema),
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
      <form>
        <FormInput
          id="from-price-input"
          register={register}
          name="fromPriceInput"
          label="from"
          type="text"
          placeholder="Min"
          onChange={handleFromInputChange}
        />

        <FormInput
          id="to-price-input"
          register={register}
          name="toPriceInput"
          label="to"
          type="text"
          placeholder="Max"
          onChange={handleToInputChange}
        />
      </form>
    </div>
  )
}

export default PriceFilter
