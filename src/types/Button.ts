import { ButtonHTMLAttributes, ReactNode } from 'react'

export type PropsBtn = {
  onClick?: () => void
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  className?: string
  children: ReactNode
  disabled?: boolean
}
