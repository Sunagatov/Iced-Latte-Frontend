'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = {
  onClick?: () => void
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  className?: string
  children: ReactNode
  disabled?: boolean
}

const defaultStyles =
  'h-[54px] rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted'

export default function Button({
  onClick,
  className,
  type = 'button',
  disabled,
  children,
}: Readonly<Props>) {
  const styles = defaultStyles + ' ' + (className ?? '')

  return (
    <button className={styles} type={type} onClick={onClick} disabled={disabled} >
      {children}
    </button>
  )
}
