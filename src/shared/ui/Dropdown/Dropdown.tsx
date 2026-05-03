'use client'
import React, { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { IOption, PropsDropdown } from '@/shared/types/Dropdown'
import { twMerge } from 'tailwind-merge'

const headerStyles =
  'py-2 px-4 rounded-full cursor-pointer flex gap-x-1.5 items-center text-[13px] font-medium text-black/60 transition-all duration-150 hover:text-black/80 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid focus-visible:ring-offset-2'
const listStyles =
  'border border-black/[0.08] rounded-xl py-1 absolute w-max min-w-full right-0 top-[calc(100%+4px)] bg-white shadow-lg z-[5]'
const optionBtnStyles =
  'text-[13px] font-medium leading-5 rounded-lg flex items-center justify-between w-full px-4 py-2 transition-colors duration-150 hover:bg-black/[0.03] text-black/60'

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
          isOpen ? 'bg-black/[0.04] text-black/80' : '',
          compact ? 'px-2.5' : '',
        )}
        onClick={handleClick}
        tabIndex={0}
      >
        {compact ? (
          <svg
            className={twMerge(
              'h-3.5 w-3.5 text-black/40 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <>
            <span>
              {hidePrefix
                ? selectedOption.label
                : `Sort by: ${selectedOption.label}`}
            </span>
            <svg
              className={twMerge(
                'h-3.5 w-3.5 text-black/40 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
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
                    'bg-[#F0F7F4] text-[#1B4332] font-semibold',
                )}
                onClick={handleChange(option)}
              >
                <span>{option.label}</span>
                {isSelected(selectedOption, option) && (
                  <svg className="ml-2 h-3.5 w-3.5 text-[#1B4332]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
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
