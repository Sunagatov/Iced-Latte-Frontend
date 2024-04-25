import { twMerge } from 'tailwind-merge'
import Filters from './Filters'

interface IFilterSidebar {
  className?: string
}

export default function FilterSidebar({ className }: IFilterSidebar) {
  return (
    <aside className={twMerge('w-[266px] flex-col', className)}>
      <Filters />
    </aside>
  )
}