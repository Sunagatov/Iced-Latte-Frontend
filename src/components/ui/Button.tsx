'use client'

import { ReactNode } from 'react'

type Props = {
  onClick?: () => void
  className?: string
  children: ReactNode
}

const defaultStyles =
  'h-[54px] rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted hover:bg-brand-solid-hover '

export default function Button({
  onClick,
  className,
  children,
}: Props) {
  const styles = defaultStyles + (className ?? '')

  return (
    <button className={styles} onClick={onClick}>
      {children}
    </button>
  )
}
