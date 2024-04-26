import Checkbox from '../UI/Checkbox/Checkbox'
import { ICheckboxFilterOption } from '@/types/ICheckboxFilterOption'

interface IFilters {
  brandOptions: ICheckboxFilterOption[]
  onBrandCheckboxChange: (index: number) => void
}

export default function Filters({ brandOptions, onBrandCheckboxChange }: IFilters) {

  return (
    <>
      <h3 className='text-2XL text-primary font-medium mb-4'>Brand</h3>
      <div className='flex flex-col gap-2'>
        {brandOptions.map((option, i) => (
          <Checkbox
            id={option.label}
            key={i}
            isChecked={option.isChecked}
            onChange={() => onBrandCheckboxChange(i)} label={option.label}
          />
        ))}
      </div>
    </>
  )
}