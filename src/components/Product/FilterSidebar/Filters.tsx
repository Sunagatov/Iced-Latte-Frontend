import Checkbox from '../../UI/Checkbox/Checkbox'
import { ICheckboxFilterOption } from '@/types/ICheckboxFilterOption'

interface IFilters {
  brandOptions: ICheckboxFilterOption[]
  onBrandCheckboxChange: (value: string) => void
  selectedBrandOptions: string[]
}

export default function Filters({ brandOptions, onBrandCheckboxChange, selectedBrandOptions }: Readonly<IFilters>) {

  return (
    <>
      <h3 className='text-2XL text-primary font-medium mb-4'>Brand</h3>
      <div className='flex flex-col gap-2'>
        {brandOptions.map((option) => (
          <Checkbox
            id={option.label}
            key={option.label}
            isChecked={selectedBrandOptions.includes(option.value)}
            onChange={() => onBrandCheckboxChange(option.value)} label={option.label}
          />
        ))}
      </div>
    </>
  )
}