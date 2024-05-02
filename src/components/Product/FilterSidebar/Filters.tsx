import { useProductFiltersStore } from '@/store/productFiltersStore'
import Checkbox from '@/components/UI/Checkbox/Checkbox'
import { IProductFilterOptionCheckbox } from '@/types/IProductFilterOptionCheckbox'


// @NOTE: replace with brands from backend when backend will be ready
const _brandOptionsMock: IProductFilterOptionCheckbox[] = [
  {
    label: 'Starbucks',
    value: 'Starbucks',
  },
  {
    label: 'Folgers',
    value: 'Folgers',
  },
  {
    label: 'Illy',
    value: 'Illy',
  },
  {
    label: 'Nescafe',
    value: 'Nescafe',
  },
  {
    label: 'Lavazza',
    value: 'Lavazza',
  },
]

export default function Filters() {
  const { selectedBrandOptions, selectBrandOption, removeBrandOption } = useProductFiltersStore()

  const handleBrandCheckboxChange = (value: string) => {
    if (selectedBrandOptions.includes(value)) {
      removeBrandOption(value)
    } else {
      selectBrandOption(value)
    }
  }

  return (
    <>
      <h3 className='text-2XL text-primary font-medium mb-4'>Brand</h3>
      <div className='flex flex-col gap-2'>
        {_brandOptionsMock.map((option) => (
          <Checkbox
            id={option.label}
            key={option.label}
            isChecked={selectedBrandOptions.includes(option.value)}
            onChange={() => handleBrandCheckboxChange(option.value)}
            label={option.label}
          />
        ))}
      </div>
    </>
  )
}