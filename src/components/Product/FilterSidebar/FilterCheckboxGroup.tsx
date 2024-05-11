import React, { useEffect, useState } from 'react'
import Checkbox from '@/components/UI/Checkbox/Checkbox'
import Button from '@/components/UI/Buttons/Button/Button'
import Image from 'next/image'
import FiltersGroupTitle from '@/components/Product/FilterSidebar/FiltersGroupTitle'

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
  const [isItemsToggled, setIsItemsToggled] = useState(true)
  const [displayedItems, setDisplayedItems] = useState(() => items.slice(0, 5))

  useEffect(() => {
    if (isItemsToggled) {
      setDisplayedItems(items.slice(0, 5))

      return
    }

    setDisplayedItems(items)
  }, [isItemsToggled, items])

  const toggleItemsButtonClick = () => {
    setIsItemsToggled((prev) => !prev)
  }

  return (
    <div>
      <FiltersGroupTitle title={title} />
      <div className="flex flex-col items-start gap-2">
        {displayedItems.map((item) => (
          <Checkbox
            id={item}
            key={item}
            isChecked={selectedItems.includes(item)}
            onChange={() => onFilterCheckboxClick(item)}
            label={item}
          />
        ))}

        {items.length > 5 && (
          <Button
            className={
              'mt-1 h-[18px] bg-transparent p-0 text-L font-medium text-primary'
            }
            onClick={toggleItemsButtonClick}
            id={`${title}-filter-btn`}
          >
            {isItemsToggled ? (
              <div className={'flex gap-3 text-brand'}>
                Show more
                <Image
                  src={'/triangleArrowDown.svg'}
                  alt={'arrow up'}
                  width={16}
                  height={20}
                />
              </div>
            ) : (
              <div className={'flex gap-3 text-brand'}>
                Show less
                <Image
                  src={'/triangleArrowUp.svg'}
                  alt={'arrow up'}
                  width={16}
                  height={20}
                />
              </div>
            )}
          </Button>
        )}

        {selectedItems.length > 0 && (
          <Button
            onClick={onReset}
            className={
              'mt-1 h-[18px] bg-transparent p-0 text-L font-medium text-brand'
            }
            id={`${title}-reset-btn`}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}

export default FilterCheckboxGroup
