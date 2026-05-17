import { twMerge } from 'tailwind-merge'
import { ReactNode } from 'react'

interface IFilterSidebar {
  className?: string
  children: ReactNode
}

export default function FilterSidebar({
  className,
  children,
}: Readonly<IFilterSidebar>) {
  return (
    <aside
      className={twMerge(
        'w-[240px] flex-col rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      {children}
    </aside>
  )
}
