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
import { useProductFiltersStore } from '@/features/products/store'
import type { IProduct, IProductsList } from '@/features/products/types'
import {
  deleteRecentSearch,
  getRecentSearches,
  saveRecentSearch,
} from '@/features/products/utils/productSearchHistory'
import { highlightSearchMatch } from '@/features/products/utils/highlightSearchMatch'

const AUTOCOMPLETE_SIZE = 6

type UseProductSearchOptions = {
  onBlur?: () => void
}

type UseProductSearchResult = {
  activeIdx: number
  containerRef: React.RefObject<HTMLDivElement | null>
  deleteRecentQuery: (event: React.MouseEvent, query: string) => void
  handleBlur: () => void
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleClear: () => void
  handleFocus: () => void
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  highlightMatch: (text: string, query: string) => ReactNode
  inputRef: React.RefObject<HTMLInputElement | null>
  inputValue: string
  isDropdownOpen: boolean
  recent: string[]
  runSearch: (query: string) => void
  showRecent: boolean
  showSuggestions: boolean
  suggestions: IProduct[]
}

const fetchProducts = getAllProducts as unknown as (
  url: string,
) => Promise<IProductsList>

export function useProductSearch({
  onBlur,
}: Readonly<UseProductSearchOptions> = {}): UseProductSearchResult {
  const { searchQuery, updateProductFiltersStore } = useProductFiltersStore()
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

      updateProductFiltersStore({ searchQuery: trimmedQuery })
      setInputValue(trimmedQuery)
      setIsOpen(false)
      setActiveIdx(-1)

      if (trimmedQuery) {
        saveRecentSearch(trimmedQuery)
        setRecent(getRecentSearches())
      }

      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
    },
    [updateProductFiltersStore],
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
    updateProductFiltersStore({ searchQuery: '' })
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

  return {
    activeIdx,
    containerRef,
    deleteRecentQuery,
    handleBlur,
    handleChange,
    handleClear,
    handleFocus,
    handleKeyDown,
    highlightMatch: highlightSearchMatch,
    inputRef,
    inputValue,
    isDropdownOpen: showRecent || showSuggestions,
    recent,
    runSearch,
    showRecent,
    showSuggestions,
    suggestions,
  }
}
