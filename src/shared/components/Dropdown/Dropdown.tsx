'use client'
import React, { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { IOption, PropsDropdown } from '@/shared/types/Dropdown'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'

const headerStyles =
  'py-3 px-5 rounded-[40px] cursor-pointer flex gap-x-2 items-center font-medium text-primary border-2 border-transparent transition-all duration-200 hover:bg-tertiary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid focus-visible:ring-offset-2'
const listStyles =
  'border border-primary rounded-xl py-1.5 absolute w-max min-w-full right-0 top-[calc(100%+8px)] bg-primary shadow-xl z-[5]'
const optionBtnStyles =
  'font-medium leading-5 rounded-lg flex items-center justify-between w-full px-5 py-2.5 transition-colors duration-150 hover:bg-tertiary'

const Dropdown = <T,>({
  className,
  options,
  onChange = () => {},
  selectedOption,
  id,
  hidePrefix,
  compact,
}: Readonly<
  PropsDropdown<T> & { hidePrefix?: boolean; compact?: boolean }
>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref as React.RefObject<HTMLDivElement>, handleClose)

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
      data-testid="sort-dropdown"
      className={twMerge('text-L text-primary relative w-max', className)}
    >
      <button
        className={twMerge(
          headerStyles,
          isOpen ? 'border-brand-solid bg-secondary' : 'bg-secondary',
          compact ? 'px-3' : '',
        )}
        onClick={handleClick}
        tabIndex={0}
      >
        {compact ? (
          <Image
            src={'/open_select.svg'}
            alt="sort"
            width={17}
            height={10}
            className={twMerge(
              'transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        ) : (
          <>
            <span>
              {hidePrefix
                ? selectedOption.label
                : `Sort by: ${selectedOption.label}`}
            </span>
            <Image
              src={'/open_select.svg'}
              alt="open select icon"
              width={17}
              height={10}
              className={twMerge(
                'transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </>
        )}
      </button>
      {isOpen && (
        <ul className={listStyles}>
          {options.map((option) => (
            <li key={option.label}>
              <button
                data-testid="sort-option"
                className={twMerge(
                  optionBtnStyles,
                  isSelected(selectedOption, option) &&
                    'bg-secondary text-brand-solid font-bold',
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
