'use client'

import type { ReactNode } from 'react'
import { highlightSearchMatch } from '@/features/products/utils/highlightSearchMatch'
import SearchBarDropdown from './SearchBarDropdown'
import { useSearchBar } from './useSearchBar'

interface SearchBarProps {
  autoFocus?: boolean
  heroMode?: boolean
  onBlur?: () => void
}

export default function SearchBar({
  autoFocus,
  heroMode,
  onBlur,
}: Readonly<SearchBarProps> = {}) {
  const {
    activeIdx,
    containerRef,
    deleteRecentQuery,
    handleBlur,
    handleChange,
    handleClear,
    handleFocus,
    handleKeyDown,
    inputRef,
    inputValue,
    isDropdownOpen,
    recent,
    runSearch,
    showRecent,
    showSuggestions,
    suggestions,
  } = useSearchBar({ onBlur })

  const highlightMatch = (text: string, query: string): ReactNode =>
    highlightSearchMatch(text, query)

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div
        className={`flex items-center gap-2 rounded-full border bg-white px-4 transition-all ${
          heroMode ? 'py-3 shadow-lg shadow-black/20' : 'py-2'
        } ${
          isDropdownOpen
            ? 'border-brand shadow-brand/10 shadow-md'
            : 'border-black/10 hover:border-black/20'
        }`}
      >
        <svg
          className="text-secondary h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands…"
          className="text-primary placeholder:text-placeholder w-full bg-transparent text-sm outline-none"
          aria-autocomplete="list"
          aria-label="Search products"
          autoFocus={autoFocus}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-secondary hover:text-primary shrink-0"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isDropdownOpen && (
        <SearchBarDropdown
          activeIdx={activeIdx}
          deleteRecentQuery={deleteRecentQuery}
          highlightMatch={highlightMatch}
          inputValue={inputValue}
          recent={recent}
          runSearch={runSearch}
          showRecent={showRecent}
          showSuggestions={showSuggestions}
          suggestions={suggestions}
        />
      )}
    </div>
  )
}
