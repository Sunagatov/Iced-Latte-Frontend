'use client'

import Image from 'next/image'
import plus from '../../../public/plus.svg'
import plusDark from '../../../public/plus_dark.svg'
import minus from '../../../public/minus.svg'
import minusDark from '../../../public/minus_dark.svg'

const defaultStyles =
  'flex h-[48px] w-[120px] select-none items-center justify-center gap-[10px] rounded-[40px] px-2 text-2XL font-medium'

type Props = {
  theme: 'dark' | 'light'
  className?: string
  count: number
  removeProduct: () => void
  addProduct: () => void
  cancel?: () => void
}

export default function Counter({
  theme,
  className,
  count,
  addProduct,
  removeProduct,
  cancel,
}: Props) {
  const computedStyles =
    defaultStyles +
    ' ' +
    (className ?? '') +
    ' ' +
    (theme === 'dark'
      ? 'bg-inverted text-inverted'
      : 'bg-secondary text-primary')

  const onPlus = () => {
    const nextValue = count + 1

    if (nextValue > 99) {
      return
    }
    addProduct()
  }

  const onMinus = () => {
    removeProduct()
    if (count === 1 && cancel) {
      cancel()
    }
  }

  return (
    <div className={computedStyles}>
      <Image
        src={theme === 'dark' ? minus : minusDark}
        alt="minus"
        className={'cursor-pointer'}
        onClick={onMinus}
      />
      <span className={'block w-[31px] text-center'}>{count}</span>
      <Image
        src={theme === 'dark' ? plus : plusDark}
        alt="plus"
        className={'cursor-pointer'}
        onClick={onPlus}
      />
    </div>
  )
}
