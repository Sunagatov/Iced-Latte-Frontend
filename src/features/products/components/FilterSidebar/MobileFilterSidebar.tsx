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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflowY = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-10 bg-black/40"
        onClick={onClose}
      />
      <aside
        id={id}
        ref={sidebarRef}
        role="dialog"
        aria-label="Filters"
        aria-modal="true"
        className={twMerge(
          'bg-primary shadow-primary fixed top-20 left-0 z-20 h-full w-[266px] flex-col overflow-y-auto p-4 max-[500px]:w-full',
          className,
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-4XL text-primary font-medium">Filters</h2>
          <CircleCloseButton id="close-sidebar" onClick={onClose} />
        </div>
        {children}
      </aside>
    </>
  )
}
