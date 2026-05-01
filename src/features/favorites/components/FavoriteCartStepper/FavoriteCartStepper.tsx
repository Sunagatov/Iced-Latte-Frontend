'use client'

import { RiAddLine, RiDeleteBinLine, RiSubtractLine } from 'react-icons/ri'

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
        <div className="bg-inverted inline-flex items-center gap-1 rounded-full px-1 py-1">
          <button
            className="text-inverted flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20"
            onClick={quantity === 1 ? onRemoveAll : onRemove}
          >
            {quantity === 1 ? (
              <RiDeleteBinLine className="h-3.5 w-3.5" />
            ) : (
              <RiSubtractLine className="h-3.5 w-3.5" />
            )}
          </button>
          <span className="text-inverted w-5 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            className="bg-brand-solid text-inverted hover:bg-brand-solid-hover flex h-7 w-7 items-center justify-center rounded-full"
            onClick={onAdd}
          >
            <RiAddLine className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          className="bg-brand-solid text-inverted hover:bg-brand-solid-hover h-9 rounded-full px-4 text-xs font-semibold transition"
          onClick={onAdd}
        >
          Add to cart
        </button>
      )}
    </div>
  )
}
