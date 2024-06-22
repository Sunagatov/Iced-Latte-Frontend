import { twMerge } from 'tailwind-merge'
import CircleCloseButton from '../../UI/Buttons/CircleCloseButton/CircleCloseButton'
import { ReactNode, useEffect, useRef } from 'react'
import { useMediaQuery, useOnClickOutside } from 'usehooks-ts'

interface IMobileFilterSidebar {
  className?: string
  children: ReactNode
  onClose: () => void
}

export default function MobileFilterSidebar({
  onClose,
  className,
  children,
}: Readonly<IMobileFilterSidebar>) {
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
    <aside
      ref={sidebarRef}
      className={twMerge(
        ' fixed left-0 top-20 z-20 h-full w-[266px] flex-col overflow-y-auto bg-primary p-4 shadow-primary max-[500px]:w-full',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-4XL font-medium text-primary">Filters</h2>
        <CircleCloseButton id="close-sidebar" onClick={onClose} />
      </div>
      {children}
    </aside>
  )
}
