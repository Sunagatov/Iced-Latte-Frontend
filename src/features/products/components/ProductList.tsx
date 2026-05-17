import { IProduct } from '@/features/products/types'
import ProductCard from './ProductCard/ProductCard'
import ProductCardSkeleton from './ProductCard/ProductCardSkeleton'

const SUGGESTIONS = [
  'Organic',
  'Bestseller',
  'New arrivals',
  'Under $20',
  'Premium',
  'Gift sets',
]

interface IProductListProps {
  products: IProduct[]
  error: Error | undefined
  isLoading: boolean
  searchQuery?: string
  onResetFilters?: () => void
  onSuggestionClick?: (query: string) => void
}

const hasImage = (p: IProduct) =>
  typeof p.productFileUrl === 'string' && p.productFileUrl !== 'default file'

function filterByImage(products: IProduct[]): IProduct[] {
  const withImage = products.filter(hasImage)

  return withImage.length > 0 ? withImage : products
}

export default function ProductList({
  products,
  error,
  isLoading,
  searchQuery,
  onResetFilters,
  onSuggestionClick,
}: Readonly<IProductListProps>) {
  if (error && products.length === 0) {
    return (
      <div className="flex grow flex-col items-center justify-center gap-4 py-24 text-center">
        <svg className="h-16 w-16 text-black/10" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" />
        </svg>
        <h3 className="text-primary text-2xl font-semibold">
          Something went wrong
        </h3>
        <p className="text-secondary">Please try refreshing the page.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <ul className="grid h-max grow grid-cols-2 justify-center gap-x-[18px] gap-y-7 min-[602px]:grid-cols-3 min-[1440px]:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </ul>
    )
  }

  const visible = filterByImage(products)

  if (visible.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="flex grow flex-col items-center justify-start gap-4 pt-16 text-center"
      >
        <svg className="h-16 w-16 text-black/10" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          <path d="M8 11h6M11 8v6" strokeLinecap="round" />
        </svg>
        {searchQuery ? (
          <>
            <h3 className="text-primary text-xl font-semibold">
              No results for{' '}
              <span className="text-brand">&ldquo;{searchQuery}&rdquo;</span>
            </h3>
            <p className="text-secondary text-sm">
              Check the spelling or try a different search.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  data-testid="suggestion-pill"
                  onClick={() => onSuggestionClick?.(s)}
                  className="border-brand/30 text-brand hover:bg-brand/10 rounded-full border px-4 py-1.5 text-sm font-medium transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-primary text-xl font-semibold">
              No products found
            </h3>
            <p className="text-secondary max-w-xs text-sm">
              Try adjusting your filters.
            </p>
          </>
        )}
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="bg-brand-solid hover:bg-brand-solid-hover mt-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition"
          >
            Reset all filters
          </button>
        )}
      </div>
    )
  }

  return (
    <ul
      className={
        'grid h-max grow grid-cols-2 justify-center gap-x-[18px] gap-y-7 min-[602px]:grid-cols-3 min-[1440px]:grid-cols-4'
      }
    >
      {visible.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </ul>
  )
}
