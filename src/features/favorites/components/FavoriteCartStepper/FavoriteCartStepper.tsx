'use client'

interface FavoriteCartStepperProps {
  onAdd: () => void
  onRemove: () => void
  onRemoveAll: () => void
  quantity: number
}

export default function FavoriteCartStepper({
  onAdd,
  onRemove,
  onRemoveAll,
  quantity,
}: Readonly<FavoriteCartStepperProps>) {
  return (
    <div className="flex h-9 items-center">
      {quantity > 0 ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-[#1B4332] px-1 py-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/20"
            onClick={quantity === 1 ? onRemoveAll : onRemove}
          >
            {quantity === 1 ? (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
            )}
          </button>
          <span className="w-5 text-center text-sm font-semibold text-white">
            {quantity}
          </span>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={onAdd}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      ) : (
        <button
          className="h-9 rounded-full bg-[#1B4332] px-4 text-xs font-semibold text-white transition hover:bg-[#143728]"
          onClick={onAdd}
        >
          Add to cart
        </button>
      )}
    </div>
  )
}
