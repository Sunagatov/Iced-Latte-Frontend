'use client'
import { PropsBtn } from '@/types/Button'

const defaultStyles = 'h-[54px] rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted transition ease-in-out'

export default function Button({
  onClick,
  className,
  type = 'button',
  disabled,
  children,
  id,
}: Readonly<PropsBtn>) {
  const styles = defaultStyles + ' ' + (className ?? '')

  return (
    <button id={id} className={styles} type={type} onClick={onClick} disabled={disabled} >
      {children}
    </button>
  )
}