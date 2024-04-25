import { useImmer } from 'use-immer'
import Checkbox from '../UI/Checkbox/Checkbox'

export default function Filters() {
  const [brandCheckboxes, updateBrandCheckboxes] = useImmer([
    {
      label: 'Bean Brewers',
      value: 'BeanBrewers',
      isChecked: false
    },
    {
      label: 'Java Bean Coffee',
      value: 'JavaBeanCoffee',
      isChecked: false
    },
  ])
  const handleChangeBrandCheckbox = (index: number) => {
    updateBrandCheckboxes(draft => {
      draft[index].isChecked = !draft[index].isChecked
    })
  }

  return (
    <>
      <h3 className='text-2XL text-primary font-medium mb-4'>Brand</h3>
      <div className='flex flex-col gap-2'>
        {brandCheckboxes.map((checkbox, i) => (
          <Checkbox
            id={checkbox.label}
            key={i}
            isChecked={checkbox.isChecked}
            onChange={() => handleChangeBrandCheckbox(i)} label={checkbox.label}
          />
        ))}
      </div>
    </>
  )
}