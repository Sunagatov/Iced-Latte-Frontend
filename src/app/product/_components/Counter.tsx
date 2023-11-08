'use client'

import { useState } from 'react'

type Props = {
  cancelAdding: () => void
  addProductToCart: () => void
}

export default function Counter({ cancelAdding, addProductToCart }: Props) {
  const [count, setCount] = useState(1)

  const onPlus = () => {
    const nextValue = count + 1

    if (nextValue > 99) {
      return
    }
    setCount((prev) => prev + 1)
    addProductToCart()
  }

  const onMinus = () => {
    if (count === 1) {
      cancelAdding()
    } else {
      setCount((prev) => prev - 1)
    }
  }

  return (
    <div
      className={
        'flex h-[48px] w-[120px] select-none items-center justify-center gap-[10px] rounded-[40px] bg-inverted px-2 text-2XL text-white'
      }
    >
      <span className={'cursor-pointer'} onClick={onMinus}>
        &ndash;
      </span>
      <span className={'block w-[31px] text-center'}>{count}</span>
      <span className={'cursor-pointer text-3xl'} onClick={onPlus}>
        +
      </span>
    </div>
  )
}
