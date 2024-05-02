'use client'
import React, { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { IOption, PropsDropdown } from '@/types/Dropdown'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'

const headerStyles =
  'py-4 px-6 bg-secondary rounded-[40px] cursor-pointer flex gap-x-3 items-center font-medium text-primary hover:bg-tertiary'
const listStyles =
  'border-primary border rounded-md py-1 absolute w-full right-0 top-full bg-primary z-[5]'
const optionBtnStyles =
  'font-medium leading-5 rounded-md flex items-center justify-between w-full px-6 py-1.5 hover:bg-tertiary'

const Dropdown = <T,>({
  className,
  headerClassName,
  options,
  onChange = () => {},
  selectedOption,
  id,
}: Readonly<PropsDropdown<T>>) => {
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
    <div
      id={id}
      ref={ref}
      className={twMerge('relative w-max text-L text-primary', className)}
    >
      <button
        className={twMerge(
          headerStyles,
          headerClassName,
          !isOpen && 'bg-transparent',
        )}
        onClick={handleClick}
        tabIndex={0}
      >
        <span>Sort by: {selectedOption.label}</span>
        <Image
          src={'/open_select.svg'}
          alt="open select icon"
          width={17}
          height={10}
        />
      </button>
      {isOpen && (
        <ul className={listStyles}>
          {options.map((option) => (
            <li key={option.label}>
              <button
                className={twMerge(
                  optionBtnStyles,
                  isSelected(selectedOption, option) &&
                    'bg-secondary font-bold',
                )}
                onClick={handleChange(option)}
              >
                <span>{option.label}</span>
                {isSelected(selectedOption, option) && (
                  <Image
                    src={'/check.svg'}
                    alt="selected icon"
                    width={14}
                    height={10}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
