'use client'
import Image from 'next/image'
import plus from '@/../public/plus.svg'
import plusDark from '@/../public/plus_dark.svg'
import minus from '@/../public/minus.svg'
import minusDark from '@/../public/minus_dark.svg'
import { useEffect, useRef } from 'react'
import { debounce } from 'lodash'
interface PropsCounter {
  theme: 'dark' | 'light'
  className?: string
  count: number
  disabled?: boolean
  addProduct: () => void
  removeProduct: () => void
}

const defaultStyles =
  'flex select-none items-center justify-center rounded-[40px] px-2 text-2XL font-medium transition ease-in-out'

const Counter = ({
  theme,
  className,
  count,
  disabled = false,
  addProduct,
  removeProduct,
}: Readonly<PropsCounter>) => {
  const sizeStyles = className ?? 'h-[48px] w-[120px] gap-[10px]'
  const computedStyles =
    defaultStyles +
    ' ' +
    sizeStyles +
    ' ' +
    (theme === 'dark'
      ? 'bg-inverted text-inverted'
      : 'bg-secondary text-primary')

  const addRef = useRef(addProduct)
  const removeRef = useRef(removeProduct)
  const countRef = useRef(count)

  useEffect(() => {
    addRef.current = addProduct
  }, [addProduct])
  useEffect(() => {
    removeRef.current = removeProduct
  }, [removeProduct])
  useEffect(() => {
    countRef.current = count
  }, [count])

  const onPlus = useRef(
    debounce(() => {
      if (countRef.current + 1 > 99) return
      addRef.current()
    }, 300),
  ).current

  const onMinus = useRef(
    debounce(() => {
      removeRef.current()
    }, 300),
  ).current

  useEffect(
    () => () => {
      onPlus.cancel()
      onMinus.cancel()
    },
    [onPlus, onMinus],
  )

  return (
    <div className={computedStyles}>
      <button
        id="min-btn"
        data-testid="counter-minus-btn"
        onClick={onMinus}
        disabled={disabled}
        className="flex items-center justify-center p-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Image src={theme === 'dark' ? minus : minusDark} alt="minus" />
      </button>
      <span className={'block w-[31px] text-center'}>{count}</span>
      <button
        id="plus-btn"
        data-testid="counter-plus-btn"
        onClick={onPlus}
        disabled={disabled}
        className="flex items-center justify-center p-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Image src={theme === 'dark' ? plus : plusDark} alt="plus" />
      </button>
    </div>
  )
}

export default Counter
