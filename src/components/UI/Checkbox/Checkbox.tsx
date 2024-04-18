'use client'
import { PropsCheckbox } from '@/types/Checkbox'

export default function Checkbox({ label, isChecked, onCheck }: PropsCheckbox) {

  return (
    <>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="h-6 w-6 cursor-pointer hover:bg-hover-heart rounded bg-secondary border-none focus:ring-0 focus:ring-offset-0 checked:bg-inverted focus:checked:bg-inverted hover:checked:bg-inverted"
          checked={isChecked}
          onChange={onCheck}
        />
        {label && <span className="ml-[16px] text-primary text-L font-medium">{label}</span>}
      </label>
    </>

  )
};