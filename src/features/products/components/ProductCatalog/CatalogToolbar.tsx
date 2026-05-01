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
}

export default function CatalogToolbar({
  isMobileFilterOpen,
  onSelectSortOption,
  onToggleMobileFilter,
  searchQuery,
  selectedSortOption,
}: Readonly<CatalogToolbarProps>) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 flex-col">
        <p className="text-brand text-xs font-medium">Our Collection</p>
        <h1 className="text-2XL text-primary min-[1124px]:text-3XL font-bold tracking-tight">
          {searchQuery ? `"${searchQuery}"` : 'All Coffee'}
        </h1>
      </div>
      <button
        aria-controls="mobile-filter-sidebar"
        aria-expanded={isMobileFilterOpen}
        className="text-L text-brand ml-auto block shrink-0 cursor-pointer font-medium min-[1100px]:hidden"
        id="filter-btn"
        onClick={onToggleMobileFilter}
      >
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
