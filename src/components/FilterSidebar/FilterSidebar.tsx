import { twMerge } from 'tailwind-merge'
import { ReactNode } from 'react'

interface IFilterSidebar {
  readonly className?: string
  readonly children: ReactNode
}

export default function FilterSidebar({ className, children }: IFilterSidebar) {
  return (
    <aside className={twMerge('w-[266px] flex-col', className)}>
      {children}
    </aside>
  )
}