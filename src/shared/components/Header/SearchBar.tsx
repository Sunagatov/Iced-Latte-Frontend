'use client'

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { useProductFiltersStore } from '@/features/products/store'
import { getAllProducts } from '@/features/products/api'
import type { IProduct, IProductsList } from '@/features/products/types'

const RECENT_KEY = 'il_recent_searches'
const MAX_RECENT = 5
const AUTOCOMPLETE_SIZE = 6

const fetchProducts = getAllProducts as unknown as (
  url: string,
) => Promise<IProductsList>

function getRecent(): string[] {
  try {
    const rawValue = localStorage.getItem(RECENT_KEY)
    const parsed: unknown = JSON.parse(rawValue ?? '[]')

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item: unknown): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function saveRecent(query: string): void {
  const prev = getRecent().filter((q: string) => q !== query)

  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([query, ...prev].slice(0, MAX_RECENT)),
  )
}

function deleteRecent(query: string): void {
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(getRecent().filter((q: string) => q !== query)),
  )
}

function highlight(text: string, query: string): ReactNode {
  if (!query) {
    return text
  }

  const idx = text.toLowerCase().indexOf(query.toLowerCase())

  if (idx === -1) {
    return text
  }

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-bold text-brand">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface SearchBarProps {
  autoFocus?: boolean
  onBlur?: () => void
  heroMode?: boolean
}

export default function SearchBar({
  autoFocus,
  onBlur,
  heroMode,
}: Readonly<SearchBarProps> = {}) {
  const { searchQuery, updateProductFiltersStore } = useProductFiltersStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const [debouncedInput] = useDebounceValue(inputValue, 300)
  const [suggestions, setSuggestions] = useState<IProduct[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setSuggestions([])

      return
    }

    let cancelled = false

    void fetchProducts(
      `products?page=0&size=${AUTOCOMPLETE_SIZE}&sort_attribute=name&sort_direction=asc&keyword=${encodeURIComponent(debouncedInput)}`,
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
    function onClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }

    document.addEventListener('mousedown', onClickOutside)

    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const commit = useCallback(
    (query: string): void => {
      const trimmed = query.trim()

      updateProductFiltersStore({ searchQuery: trimmed })
      setInputValue(trimmed)
      setOpen(false)
      setActiveIdx(-1)

      if (trimmed) {
        saveRecent(trimmed)
        setRecent(getRecent())
      }

      document
        .getElementById('catalog')
        ?.scrollIntoView({ behavior: 'smooth' })
    },
    [updateProductFiltersStore],
  )

  const handleFocus = (): void => {
    setRecent(getRecent())
    setOpen(true)
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
    setOpen(true)
    setActiveIdx(-1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const items = inputValue.trim() ? suggestions : recent

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx((index: number) => Math.min(index + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx((index: number) => Math.max(index - 1, -1))
    } else if (event.key === 'Enter') {
      event.preventDefault()

      if (activeIdx >= 0 && inputValue.trim() && suggestions[activeIdx]) {
        commit(suggestions[activeIdx].name)
      } else if (activeIdx >= 0 && !inputValue.trim() && recent[activeIdx]) {
        commit(recent[activeIdx])
      } else {
        commit(inputValue)
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  const handleClear = (): void => {
    setInputValue('')
    updateProductFiltersStore({ searchQuery: '' })
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleDeleteRecent = (
    event: React.MouseEvent,
    query: string,
  ): void => {
    event.stopPropagation()
    deleteRecent(query)
    setRecent(getRecent())
  }

  const showRecent = open && !inputValue.trim() && recent.length > 0
  const showSuggestions =
    open && inputValue.trim().length > 0 && suggestions.length > 0
  const isDropdownOpen = showRecent || showSuggestions

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div
        className={`flex items-center gap-2 rounded-full border bg-white px-4 transition-all ${
          heroMode ? 'py-3 shadow-lg shadow-black/20' : 'py-2'
        } ${
          open
            ? 'border-brand shadow-md shadow-brand/10'
            : 'border-black/10 hover:border-black/20'
        }`}
      >
        <svg
          className="h-4 w-4 shrink-0 text-secondary"
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
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search coffees, brands…"
          className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-placeholder"
          aria-label="Search products"
          aria-autocomplete="list"
          autoFocus={autoFocus}
          onBlur={handleBlur}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 text-secondary hover:text-primary"
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
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-black/8 bg-white shadow-xl"
        >
          {showRecent && (
            <>
              <p className="px-4 pb-1 pt-3 text-xs font-medium text-secondary">
                Recent searches
              </p>
              <ul>
                {recent.map((query: string, index: number) => (
                  <li
                    className={`flex items-center gap-3 px-4 transition-colors ${
                      index === activeIdx
                        ? 'bg-secondary'
                        : 'hover:bg-secondary'
                    }`}
                    key={query}
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 py-2.5 text-left text-sm"
                      onMouseDown={() => commit(query)}
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <span className="flex-1 text-primary">{query}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${query}`}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-tertiary hover:text-primary"
                      onMouseDown={(event) => handleDeleteRecent(event, query)}
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
                    onMouseDown={() => commit(product.name)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === activeIdx
                        ? 'bg-secondary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="text-sm text-primary">
                      {highlight(product.name, inputValue)}
                    </span>
                    <span className="ml-auto text-xs text-secondary">
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