import { twMerge } from 'tailwind-merge'
import CircleCloseButton from '@/shared/components/Buttons/CircleCloseButton/CircleCloseButton'
import React, { ReactNode, useEffect, useRef } from 'react'
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
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflowY = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        id={id}
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={twMerge(
          'fixed left-0 top-20 z-20 h-full w-[266px] flex-col overflow-y-auto bg-primary p-4 shadow-primary max-[500px]:w-full',
          className,
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-4XL font-medium text-primary">Filters</h2>
          <CircleCloseButton id="close-sidebar" onClick={onClose} />
        </div>
        {children}
      </aside>
    </>
  )
}
