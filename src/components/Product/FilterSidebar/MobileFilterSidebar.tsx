import { twMerge } from 'tailwind-merge'
import CircleCloseButton from '../../UI/Buttons/CircleCloseButton/CircleCloseButton'
import { ReactNode, useEffect, useRef } from 'react'
import { useOnClickOutside, useMediaQuery } from 'usehooks-ts'

interface IMobileFilterSidebar {
  className?: string
  children: ReactNode
  onClose: () => void
}

export default function MobileFilterSidebar({ onClose, className, children }: Readonly<IMobileFilterSidebar>) {
  const sidebarRef = useRef<HTMLElement>(null)

  useOnClickOutside(sidebarRef, onClose)
  const isMobile = useMediaQuery('(max-width: 500px)')

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = 'auto'
    }

    return () => {
      document.body.style.overflowY = 'auto'
    }
  }, [isMobile])

  return (
    <aside ref={sidebarRef} className={twMerge('max-[500px]:w-full w-[266px] fixed bg-primary top-14 p-4 h-full left-0 z-20 shadow-primary flex-col', className)}>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-primary text-4XL font-medium'>Filters</h2>
        <CircleCloseButton id='close-sidebar' onClick={onClose} />
      </div>
      {children}
    </aside>
  )
}