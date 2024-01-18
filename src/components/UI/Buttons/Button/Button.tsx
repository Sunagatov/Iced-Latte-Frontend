'use client'
import { PropsBtn } from '@/types/Button'

const defaultStyles =
  'h-[54px] rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted'

export default function Button({
  onClick,
  className,
  type = 'button',
  disabled,
  children,
}: Readonly<PropsBtn>) {
  const styles = defaultStyles + ' ' + (className ?? '')

  return (
    <button className={styles} type={type} onClick={onClick} disabled={disabled} >
      {children}
    </button>
  )
}
