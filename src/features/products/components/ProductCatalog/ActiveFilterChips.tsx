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
  const className =
    tone === 'search'
      ? 'bg-brand/10 text-brand flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'
      : 'bg-secondary text-primary flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'

  return (
    <span className={className}>
      {children}
      <button
        aria-label={ariaLabel}
        className="hover:opacity-70"
        onClick={onRemove}
      >
        ✕
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
          <>🔍 {searchQuery}</>
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
