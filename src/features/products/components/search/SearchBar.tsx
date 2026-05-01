'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { getAllProducts } from '@/features/products/api'
import { buildAutocompleteProductsPath } from '@/features/products/catalogQuery'
import { useProductFiltersStore } from '@/features/products/store'
import type { IProduct, IProductsList } from '@/features/products/types'
import {
  deleteRecentSearch,
  getRecentSearches,
  saveRecentSearch,
} from '@/features/products/utils/productSearchHistory'
import { highlightSearchMatch } from '@/features/products/utils/highlightSearchMatch'

interface SearchBarProps {
  autoFocus?: boolean
  heroMode?: boolean
  onBlur?: () => void
}

const AUTOCOMPLETE_SIZE = 6

export default function SearchBar({
  autoFocus,
  heroMode,
  onBlur,
}: Readonly<SearchBarProps> = {}) {
  const searchQuery = useProductFiltersStore((state) => state.searchQuery)
  const setFilters = useProductFiltersStore((state) => state.setFilters)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [debouncedInput] = useDebounceValue(inputValue, 300)
  const [suggestions, setSuggestions] = useState<IProduct[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setSuggestions([])

      return
    }

    let cancelled = false

    void getAllProducts(
      buildAutocompleteProductsPath(debouncedInput, AUTOCOMPLETE_SIZE),
    )
      .then((data: IProductsList): void => {
        if (!cancelled) {
          setSuggestions(Array.isArray(data.products) ? data.products : [])
        }
      })
      .catch((): void => {
        if (!cancelled) {
          setSuggestions([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedInput])

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveIdx(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const runSearch = useCallback(
    (query: string): void => {
      const trimmedQuery = query.trim()

      setFilters({ searchQuery: trimmedQuery })
      setInputValue(trimmedQuery)
      setIsOpen(false)
      setActiveIdx(-1)

      if (trimmedQuery) {
        saveRecentSearch(trimmedQuery)
        setRecent(getRecentSearches())
      }

      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
    },
    [setFilters],
  )

  const handleFocus = (): void => {
    setRecent(getRecentSearches())
    setIsOpen(true)
  }

  const handleBlur = (): void => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        onBlur?.()
      }
    }, 150)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value)
    setIsOpen(true)
    setActiveIdx(-1)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    const items = inputValue.trim() ? suggestions : recent

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx((index) => Math.min(index + 1, items.length - 1))

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx((index) => Math.max(index - 1, -1))

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (activeIdx >= 0 && inputValue.trim() && suggestions[activeIdx]) {
        runSearch(suggestions[activeIdx].name)

        return
      }

      if (activeIdx >= 0 && !inputValue.trim() && recent[activeIdx]) {
        runSearch(recent[activeIdx])

        return
      }

      runSearch(inputValue)

      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  const handleClear = (): void => {
    setInputValue('')
    setFilters({ searchQuery: '' })
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const deleteRecentQuery = (
    event: React.MouseEvent,
    query: string,
  ): void => {
    event.stopPropagation()
    deleteRecentSearch(query)
    setRecent(getRecentSearches())
  }

  const showRecent = isOpen && !inputValue.trim() && recent.length > 0
  const showSuggestions =
    isOpen && inputValue.trim().length > 0 && suggestions.length > 0
  const isDropdownOpen = showRecent || showSuggestions

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
          placeholder="Search coffees, brands…"
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
        <div
          data-testid="search-dropdown"
          className="absolute top-[calc(100%+8px)] left-0 z-50 w-full overflow-hidden rounded-2xl border border-black/8 bg-white shadow-xl"
        >
          {showRecent && (
            <>
              <p className="text-secondary px-4 pt-3 pb-1 text-xs font-medium">
                Recent searches
              </p>
              <ul>
                {recent.map((query, index) => (
                  <li
                    className={`flex items-center gap-3 px-4 transition-colors ${
                      index === activeIdx ? 'bg-secondary' : 'hover:bg-secondary'
                    }`}
                    key={query}
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 py-2.5 text-left text-sm"
                      onMouseDown={() => runSearch(query)}
                    >
                      <svg
                        className="text-secondary h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <span className="text-primary flex-1">{query}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${query}`}
                      className="text-secondary hover:bg-tertiary hover:text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      onMouseDown={(event) => deleteRecentQuery(event, query)}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {showSuggestions && (
            <ul>
              {suggestions.map((product: IProduct, index: number) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onMouseDown={() => runSearch(product.name)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === activeIdx ? 'bg-secondary' : 'hover:bg-secondary'
                    }`}
                  >
                    <svg
                      className="text-secondary h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="text-primary text-sm">
                      {highlightMatch(product.name, inputValue)}
                    </span>
                    <span className="text-secondary ml-auto text-xs">
                      {product.brandName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
