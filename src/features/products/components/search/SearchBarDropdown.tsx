import type { MouseEvent, ReactNode } from 'react'
import type { IProduct } from '@/features/products/types'

type SearchBarDropdownProps = {
  activeIdx: number
  deleteRecentQuery: (event: MouseEvent, query: string) => void
  highlightMatch: (text: string, query: string) => ReactNode
  inputValue: string
  recent: string[]
  runSearch: (query: string) => void
  showRecent: boolean
  showSuggestions: boolean
  suggestions: IProduct[]
}

export default function SearchBarDropdown({
  activeIdx,
  deleteRecentQuery,
  highlightMatch,
  inputValue,
  recent,
  runSearch,
  showRecent,
  showSuggestions,
  suggestions,
}: Readonly<SearchBarDropdownProps>) {
  return (
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
          {suggestions.map((product, index) => (
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
  )
}
