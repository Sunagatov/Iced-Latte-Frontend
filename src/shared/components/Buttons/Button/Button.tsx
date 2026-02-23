'use client'
interface PropsBtn { onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset'; disabled?: boolean; children?: React.ReactNode; id?: string }
import { twMerge } from 'tailwind-merge'

const defaultStyles =
  'h-[54px] rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted transition-all duration-200 ease-in-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid focus-visible:ring-offset-2'

export default function Button({
  onClick,
  className,
  type = 'button',
  disabled,
  children,
  id,
}: Readonly<PropsBtn>) {
  const styles = twMerge(
    defaultStyles,
    className,
    disabled ? 'bg-gray-400 cursor-not-allowed' : '',
  )

  return (
    <button
      id={id}
      className={styles}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
