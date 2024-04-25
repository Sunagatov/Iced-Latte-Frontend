import { twMerge } from 'tailwind-merge'
import Filters from './Filters'
import CircleCloseButton from '../UI/Buttons/CircleCloseButton/CircleCloseButton'
import { useEffect, useRef } from 'react'

interface IMobileFilterSidebar {
  className?: string
  onClose: () => void
}

export default function MobileFilterSidebar({ onClose, className }: IMobileFilterSidebar) {
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])


  /*This useEffect turns off scroll only for screens less then 500px */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 500px)')

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.style.overflowY = 'hidden'
      } else {
        document.body.style.overflowY = 'auto'
      }
    }

    mediaQuery.addEventListener('change', handleMediaQueryChange)
    handleMediaQueryChange(mediaQuery as unknown as MediaQueryListEvent)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
      document.body.style.overflowY = 'auto'
    }
  }, [])

  return (
    <aside ref={sidebarRef} className={twMerge('max-[500px]:w-full w-[266px] fixed bg-primary top-14 p-4 h-full left-0 z-20 shadow-primary flex-col', className)}>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-primary text-4XL font-medium'>Filters</h2>
        <CircleCloseButton onClick={onClose}/>
      </div>
      <Filters />
    </aside>
  )
}