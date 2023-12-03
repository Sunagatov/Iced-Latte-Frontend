'use client'

import { ReactNode } from 'react'

type Props = {
  onClick?: () => void
  className?: string
  children: ReactNode,
  type?: "submit" | "reset" | "button"
}

const defaultStyles =
  'h-[54px] rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted hover:bg-brand-solid-hover '

export default function Button({
  onClick,
  className,
  children,
  type = "button"
}: Props) {
  const styles = defaultStyles + (className ?? '')

  return (
    <button type={type} className={styles} onClick={onClick}>
      {children}
    </button>
  )
}
