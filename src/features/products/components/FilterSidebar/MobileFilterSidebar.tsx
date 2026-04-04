import { twMerge } from 'tailwind-merge'
import CircleCloseButton from '@/shared/components/Buttons/CircleCloseButton/CircleCloseButton'
import { ReactNode, useEffect, useRef } from 'react'
import React from 'react'
import { useOnClickOutside } from 'usehooks-ts'

interface IMobileFilterSidebar {
  id?: string
  className?: string
  children: ReactNode
  onClose: () => void
}

export default function MobileFilterSidebar({
  id,
  onClose,
  className,
  children,
}: Readonly<IMobileFilterSidebar>) {
  const sidebarRef = useRef<HTMLElement>(null)

  useOnClickOutside(sidebarRef as React.RefObject<HTMLElement>, onClose)
  useEffect(() => {
    document.body.style.overflowY = 'hidden'
    return () => {
      document.body.style.overflowY = ''
    }
  }, [])

  return (
    <aside
      id={id}
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
