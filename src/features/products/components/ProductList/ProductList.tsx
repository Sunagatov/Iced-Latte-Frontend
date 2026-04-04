import { IProduct } from '@/features/products/types'
import ProductCard from '../ProductCard/ProductCard'
import Loader from '@/shared/components/Loader/Loader'

const SUGGESTIONS = ['Latte', 'Espresso', 'Mocha', 'Cold Brew', 'Cappuccino', 'Flat White']

interface IProductListProps {
  products: IProduct[]
  error: Error | undefined
  isLoading: boolean
  searchQuery?: string
  onResetFilters?: () => void
  onSuggestionClick?: (query: string) => void
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
        <span className="text-5xl">⚠️</span>
        <h3 className="text-2xl font-semibold text-primary">Something went wrong</h3>
        <p className="text-secondary">Please try refreshing the page.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={'mt-14 flex h-[54px] grow items-center justify-center'}>
        <Loader />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div data-testid="empty-state" className="flex grow flex-col items-center justify-start gap-4 pt-16 text-center">
        <span className="text-5xl">🔍</span>
        {searchQuery ? (
          <>
            <h3 className="text-xl font-semibold text-primary">
              No results for <span className="text-brand">&ldquo;{searchQuery}&rdquo;</span>
            </h3>
            <p className="text-sm text-secondary">Check the spelling or try a different search.</p>
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  data-testid="suggestion-pill"
                  onClick={() => onSuggestionClick?.(s)}
                  className="rounded-full border border-brand/30 px-4 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-primary">No products found</h3>
            <p className="max-w-xs text-sm text-secondary">Try adjusting your filters.</p>
          </>
        )}
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-2 rounded-full bg-brand-solid px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-solid-hover"
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
        'grid h-max grow grid-cols-2 justify-center gap-x-[18px] gap-y-[56px] min-[602px]:grid-cols-3 min-[1440px]:grid-cols-4'
      }
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </ul>
  )
}
