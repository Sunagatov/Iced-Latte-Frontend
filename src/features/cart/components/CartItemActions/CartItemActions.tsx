'use client'

import { MAX_CART_ITEM_QUANTITY } from '@/features/cart/state/cartStore'

interface CartItemActionsProps {
  isFavouritePending: boolean
  isFavourited: boolean
  isPending: boolean
  onAdd: () => void
  onRemove: () => void
  onRemoveAll: () => void
  onToggleFavourite: () => void
  productPrice: number
  productQuantity: number
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function HeartIcon({ isFavourited }: Readonly<{ isFavourited: boolean }>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={isFavourited ? '#1B4332' : 'none'}
      stroke={isFavourited ? '#1B4332' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function CartItemActions({
  isFavouritePending,
  isFavourited,
  isPending,
  onAdd,
  onRemove,
  onRemoveAll,
  onToggleFavourite,
  productPrice,
  productQuantity,
}: Readonly<CartItemActionsProps>) {
  const disableAdd = isPending || productQuantity >= MAX_CART_ITEM_QUANTITY

  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="bg-brand-second text-brand rounded-full px-2.5 py-0.5 text-xs font-semibold">
          ${productPrice} / unit
        </span>
        <button
          aria-label="Remove item"
          className="text-secondary hover:text-negative flex h-7 w-7 items-center justify-center rounded-full transition-all hover:bg-[#FFE5E5] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="cart-trash-btn"
          disabled={isPending}
          onClick={onRemoveAll}
        >
          <TrashIcon />
        </button>
        <button
          onClick={onToggleFavourite}
          disabled={isFavouritePending}
          className="hover:bg-secondary flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            isFavourited ? 'Remove from favourites' : 'Add to favourites'
          }
          aria-pressed={isFavourited}
          aria-busy={isFavouritePending}
        >
          <HeartIcon isFavourited={isFavourited} />
        </button>
      </div>

      <div className="bg-inverted flex items-center gap-1 rounded-full px-1 py-1">
        <button
          onClick={productQuantity === 1 ? onRemoveAll : onRemove}
          data-testid="cart-minus-btn"
          disabled={isPending}
          className="text-inverted flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/20 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={
            productQuantity === 1 ? 'Remove item' : 'Decrease quantity'
          }
        >
          {productQuantity === 1 ? <TrashIcon /> : <MinusIcon />}
        </button>
        <span
          className="text-inverted w-6 text-center text-sm font-semibold"
          data-testid="cart-item-qty"
        >
          {productQuantity}
        </span>
        <button
          onClick={disableAdd ? undefined : onAdd}
          disabled={disableAdd}
          data-testid="cart-plus-btn"
          className="bg-brand-solid text-inverted hover:bg-brand-solid-hover flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  )
}
