'use client'
import Image from 'next/image'
import plus from '@/../public/plus.svg'
import plusDark from '@/../public/plus_dark.svg'
import minus from '@/../public/minus.svg'
import minusDark from '@/../public/minus_dark.svg'
interface PropsCounter { theme: 'dark' | 'light'; className?: string; count: number; addProduct: () => void; removeProduct: () => void }
import { debounce } from 'lodash'

const defaultStyles =
  'flex select-none items-center justify-center rounded-[40px] px-2 text-2XL font-medium transition ease-in-out'

const Counter = ({
  theme,
  className,
  count,
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
      <button id="min-btn" data-testid="counter-minus-btn" onClick={onMinus} className="flex items-center justify-center p-1">
        <Image src={theme === 'dark' ? minus : minusDark} alt="minus" />
      </button>
      <span className={'block w-[31px] text-center'}>{count}</span>
      <button id="plus-btn" data-testid="counter-plus-btn" onClick={onPlus} className="flex items-center justify-center p-1">
        <Image src={theme === 'dark' ? plus : plusDark} alt="plus" />
      </button>
    </div>
  )
}

export default Counter
