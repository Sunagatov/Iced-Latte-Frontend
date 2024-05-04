import { twMerge } from 'tailwind-merge'
import { ReactNode } from 'react'

interface IFilterSidebar {
  className?: string
  children: ReactNode
}

export default function FilterSidebar({ className, children }: Readonly<IFilterSidebar>) {
  return (
    <aside className={twMerge('w-[266px] flex-col', className)}>
      {children}
    </aside>
  )
}