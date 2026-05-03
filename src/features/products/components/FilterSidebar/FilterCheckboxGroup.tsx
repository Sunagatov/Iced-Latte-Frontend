import React, { useState } from 'react'

interface IFilterCheckboxGroup {
  selectedItems: string[]
  items: string[]
  onFilterCheckboxClick: (item: string) => void
  onReset: () => void
  title: string
}

const FilterCheckboxGroup = ({
  selectedItems,
  items,
  onFilterCheckboxClick = () => {},
  onReset = () => {},
  title = '',
}: Readonly<IFilterCheckboxGroup>) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayedItems = isExpanded ? items : items.slice(0, 5)

  const toggleItemsButtonClick = () => setIsExpanded((prev) => !prev)

  return (
    <div data-testid={`filter-group-${title.toLowerCase()}`}>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-black/70">
          {title}
        </h3>
        {selectedItems.length > 0 && (
          <button
            onClick={onReset}
            id={`${title}-reset-btn`}
            className="text-[11px] text-[#1B4332] hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {displayedItems.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 transition hover:bg-black/[0.03]"
          >
            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
              selectedItems.includes(item)
                ? 'border-[#1B4332] bg-[#1B4332]'
                : 'border-black/15 bg-white'
            }`}>
              {selectedItems.includes(item) && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              id={item}
              checked={selectedItems.includes(item)}
              onChange={() => onFilterCheckboxClick(item)}
              className="sr-only"
            />
            <span className="text-[13px] text-black/70">{item}</span>
          </label>
        ))}
        {items.length > 5 && (
          <button
            id={`${title}-filter-btn`}
            onClick={toggleItemsButtonClick}
            className="mt-1 px-1.5 text-left text-[12px] font-medium text-[#1B4332] hover:underline"
          >
            {isExpanded ? 'Show less' : `+${items.length - 5} more`}
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterCheckboxGroup
