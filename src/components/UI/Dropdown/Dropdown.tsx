'use client'
import React, { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { IOption, PropsDropdown } from '@/types/Dropdown'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'
import selectImageUrl from '../../../../public/open_select.svg'
import checkImageUrl from '../../../../public/check.svg'

const headerStyles =
  'py-4 px-6 bg-secondary rounded-[40px] cursor-pointer flex gap-x-3 items-center font-medium text-primary hover:bg-tertiary'
const listStyles =
  'border-primary border rounded-md py-1 absolute w-full right-0 top-full bg-primary z-[5]'
const listItemStyles =
  'font-medium rounded-md px-6 py-1.5 flex items-center justify-between cursor-pointer hover:bg-tertiary leading-5'

export default function Dropdown<T>({
  className,
  options,
  onChange,
  selectedOption,
}: Readonly<PropsDropdown<T>>) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, handleClose)

  function handleClose() {
    setIsOpen(false)
  }

  function handleClick() {
    setIsOpen((prev) => !prev)
  }

  function handleChange(option: IOption<T>) {
    return () => {
      onChange(option)
      setIsOpen(false)
    }
  }

  function isSelected(selectedOption: IOption<T>, option: IOption<T>) {
    return selectedOption.label === option.label
  }

  return (
    <div ref={ref} className={'relative text-L text-primary' + ' ' + (className ?? '')}>
      <div
        className={twMerge(
          headerStyles,
          !isOpen && 'bg-transparent pr-0 hover:px-6',
        )}
        onClick={handleClick}
      >
        <span>Sort by: {selectedOption.label}</span>
        <Image src={selectImageUrl} alt="open select icon" />
      </div>
      {isOpen && (
        <ul className={listStyles}>
          {options.map((option) => (
            <li
              className={twMerge(
                listItemStyles,
                isSelected(selectedOption, option) && 'bg-secondary font-bold',
              )}
              onClick={handleChange(option)}
              key={option.label}
            >
              <span>{option.label}</span>
              {isSelected(selectedOption, option) && (
                <Image src={checkImageUrl} alt="selected icon" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
