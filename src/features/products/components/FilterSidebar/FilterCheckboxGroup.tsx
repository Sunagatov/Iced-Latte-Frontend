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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
          {title}
        </h3>
        {selectedItems.length > 0 && (
          <button
            onClick={onReset}
            id={`${title}-reset-btn`}
            className="text-brand-solid text-xs hover:opacity-70"
          >
            Clear ({selectedItems.length})
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {displayedItems.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-black/4"
          >
            <input
              type="checkbox"
              id={item}
              checked={selectedItems.includes(item)}
              onChange={() => onFilterCheckboxClick(item)}
              className="checked:border-brand-solid checked:bg-brand-solid h-4 w-4 cursor-pointer appearance-none rounded border-2 border-[#D1D5DB] bg-white"
            />
            <span className="text-primary text-sm">{item}</span>
          </label>
        ))}
        {items.length > 5 && (
          <button
            id={`${title}-filter-btn`}
            onClick={toggleItemsButtonClick}
            className="text-brand-solid mt-1 flex items-center gap-1 px-2 text-xs font-medium hover:opacity-70"
          >
            {isExpanded ? 'Show less ↑' : `Show ${items.length - 5} more ↓`}
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterCheckboxGroup
