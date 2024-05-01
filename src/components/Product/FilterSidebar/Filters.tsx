import { useProductFiltersStore } from '@/store/productFiltersStore'
import Checkbox from '../../UI/Checkbox/Checkbox'
import { ICheckboxFilterOption } from '@/types/ICheckboxFilterOption'


// @NOTE: replace with brands from backend when backend will be ready
const _brandOptionsMock: ICheckboxFilterOption[] = [
  {
    label: 'Starbucks',
    value: 'Starbucks',
  },
  {
    label: 'Java Bean Coffee',
    value: 'JavaBeanCoffee',
  },
]

export default function Filters() {
  const selectedBrandOptions = useProductFiltersStore(state => state.selectedBrandOptions)
  const selectBrandOption = useProductFiltersStore(state => state.selectBrandOption)
  const removeBrandOption = useProductFiltersStore(state => state.removeBrandOption)

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