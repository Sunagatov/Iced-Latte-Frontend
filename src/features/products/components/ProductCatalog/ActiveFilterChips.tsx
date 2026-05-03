'use client'

import type { ReactNode } from 'react'
import type { StarsType } from '@/features/products/store'

type ActiveFilterChipsProps = {
  hasPriceFilter: boolean
  priceChipLabel: string
  ratingFilter: StarsType | null
  searchQuery: string
  selectedBrandOptions: string[]
  selectedSellerOptions: string[]
  updateFilters: (slice: {
    fromPriceFilter?: string
    ratingFilter?: StarsType | null
    searchQuery?: string
    selectedBrandOptions?: string[]
    selectedSellerOptions?: string[]
    toPriceFilter?: string
  }) => void
}

function FilterChip({
  ariaLabel,
  children,
  onRemove,
  tone = 'neutral',
}: Readonly<{
  ariaLabel: string
  children: ReactNode
  onRemove: () => void
  tone?: 'neutral' | 'search'
}>) {
  const base =
    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors'
  const className =
    tone === 'search'
      ? `${base} bg-[#1B4332]/10 text-[#1B4332]`
      : `${base} bg-black/[0.04] text-black/60`

  return (
    <span className={className}>
      {children}
      <button
        aria-label={ariaLabel}
        className="ml-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition hover:bg-black/10"
        onClick={onRemove}
      >
        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

export default function ActiveFilterChips({
  hasPriceFilter,
  priceChipLabel,
  ratingFilter,
  searchQuery,
  selectedBrandOptions,
  selectedSellerOptions,
  updateFilters,
}: Readonly<ActiveFilterChipsProps>) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {searchQuery && (
        <FilterChip
          ariaLabel="Remove search filter"
          onRemove={() => updateFilters({ searchQuery: '' })}
          tone="search"
        >
          <><svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg> {searchQuery}</>
        </FilterChip>
      )}

      {selectedBrandOptions.map((brand) => (
        <FilterChip
          ariaLabel={`Remove brand ${brand}`}
          key={brand}
          onRemove={() =>
            updateFilters({
              selectedBrandOptions: selectedBrandOptions.filter(
                (item) => item !== brand,
              ),
            })
          }
        >
          {brand}
        </FilterChip>
      ))}

      {selectedSellerOptions.map((seller) => (
        <FilterChip
          ariaLabel={`Remove seller ${seller}`}
          key={seller}
          onRemove={() =>
            updateFilters({
              selectedSellerOptions: selectedSellerOptions.filter(
                (item) => item !== seller,
              ),
            })
          }
        >
          {seller}
        </FilterChip>
      ))}

      {hasPriceFilter && (
        <FilterChip
          ariaLabel="Remove price filter"
          onRemove={() =>
            updateFilters({ fromPriceFilter: '', toPriceFilter: '' })
          }
        >
          {priceChipLabel}
        </FilterChip>
      )}

      {ratingFilter && (
        <FilterChip
          ariaLabel="Remove rating filter"
          onRemove={() => updateFilters({ ratingFilter: null })}
        >
          {'⭐'.repeat(Number(ratingFilter))}+
        </FilterChip>
      )}
    </div>
  )
}
