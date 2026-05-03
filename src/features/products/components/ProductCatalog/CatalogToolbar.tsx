'use client'

import { sortOptions } from '@/features/products/constants'
import type { IOption } from '@/shared/types/Dropdown'
import Dropdown from '@/shared/ui/Dropdown/Dropdown'
import type { ISortParams } from '@/shared/types/ISortParams'

type CatalogToolbarProps = {
  isMobileFilterOpen: boolean
  onSelectSortOption: (selectedOption: IOption<ISortParams>) => void
  onToggleMobileFilter: () => void
  searchQuery: string
  selectedSortOption: IOption<ISortParams>
  totalProducts?: number
}

export default function CatalogToolbar({
  isMobileFilterOpen,
  onSelectSortOption,
  onToggleMobileFilter,
  searchQuery,
  selectedSortOption,
  totalProducts,
}: Readonly<CatalogToolbarProps>) {
  const count =
    totalProducts !== undefined ? `${totalProducts} products` : ''

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[13px] font-medium text-black/40">
        {searchQuery ? (
          <>Results for <span className="text-black/70">&ldquo;{searchQuery}&rdquo;</span></>
        ) : (
          count
        )}
      </span>
      <button
        aria-controls="mobile-filter-sidebar"
        aria-expanded={isMobileFilterOpen}
        className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-black/60 transition hover:bg-black/[0.03] min-[1100px]:hidden"
        id="filter-btn"
        onClick={onToggleMobileFilter}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 6h18M7 12h10M10 18h4" />
        </svg>
        Filter
      </button>
      <Dropdown<ISortParams>
        id="productDropdownMobile"
        className="shrink-0 min-[1100px]:hidden"
        options={sortOptions}
        onChange={onSelectSortOption}
        selectedOption={selectedSortOption}
        compact
      />
      <Dropdown<ISortParams>
        id="productDropdown"
        className="hidden shrink-0 min-[1100px]:ml-auto min-[1100px]:block"
        options={sortOptions}
        onChange={onSelectSortOption}
        selectedOption={selectedSortOption}
      />
    </div>
  )
}
