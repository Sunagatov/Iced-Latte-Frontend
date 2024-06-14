'use client'
import Image from 'next/image'
import plus from '../../../../public/plus.svg'
import plusDark from '../../../../public/plus_dark.svg'
import minus from '../../../../public/minus.svg'
import minusDark from '../../../../public/minus_dark.svg'
import { PropsCounter } from '@/types/Counter'
import { debounce } from 'lodash'

const defaultStyles =
  'flex h-[48px] w-[120px] select-none items-center justify-center gap-[10px] rounded-[40px] px-2 text-2XL font-medium transition ease-in-out'

const Counter = ({
  theme,
  className,
  count,
  addProduct,
  removeProduct,
}: Readonly<PropsCounter>) => {
  const computedStyles =
    defaultStyles +
    ' ' +
    (className ?? '') +
    ' ' +
    (theme === 'dark'
      ? 'bg-inverted text-inverted'
      : 'bg-secondary text-primary')

  const onPlus = debounce(() => {
    const nextValue = count + 1

    if (nextValue > 99) {
      return
    }
    addProduct()
  }, 300)

  const onMinus = debounce(() => {
    removeProduct()
  }, 300)

  return (
    <div className={computedStyles}>
      <button id="min-btn" onClick={onMinus}>
        <Image src={theme === 'dark' ? minus : minusDark} alt="minus" />
      </button>
      <span className={'block w-[31px] text-center'}>{count}</span>
      <button id="plus-btn" onClick={onPlus}>
        <Image src={theme === 'dark' ? plus : plusDark} alt="plus" />
      </button>
    </div>
  )
}

export default Counter
