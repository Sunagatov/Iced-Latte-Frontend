'use client'
import Image from 'next/image'
import plus from '../../../../public/plus.svg'
import plusDark from '../../../../public/plus_dark.svg'
import minus from '../../../../public/minus.svg'
import minusDark from '../../../../public/minus_dark.svg'
import { PropsCounter } from '@/types/Counter'
import { debounce } from 'lodash'

const defaultStyles =
  'flex h-[48px] w-[120px] select-none items-center justify-center gap-[10px] rounded-[40px] px-2 text-2XL font-medium'

export default function Counter({
  theme,
  className,
  count,
  addProduct,
  removeProduct,
}: Readonly<PropsCounter>) {
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
      <Image
        src={theme === 'dark' ? minus : minusDark}
        alt="minus"
        className={'cursor-pointer' + (count === 1 ? ' opacity-10 pointer-events-none' : '')}
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
