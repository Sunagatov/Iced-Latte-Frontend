'use client'

import { useEffect, useRef } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

interface ConfirmationModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
  /** Optional: render extra content (e.g. a text input) between message and buttons */
  children?: React.ReactNode
}

export default function ConfirmationModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  children,
}: Readonly<ConfirmationModalProps>) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(panelRef as React.RefObject<HTMLDivElement>, onCancel)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const confirmColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white',
    default: 'bg-brand hover:bg-brand-solid-hover text-white',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-primary mx-4 w-full max-w-sm rounded-2xl p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-primary text-lg font-semibold">
          {title}
        </h2>
        <p className="text-secondary mt-2 text-sm">{message}</p>
        {children}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-secondary hover:bg-secondary rounded-lg px-4 py-2 text-sm font-medium transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${confirmColors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
