import { IProduct } from '@/types/Products'
import ProductCard from '../ProductCard/ProductCard'
import Loader from '@/components/UI/Loader/Loader'

interface IProductListProps {
  products: IProduct[]
  error: Error | undefined
  isLoading: boolean
  onResetFilters?: () => void
}

export default function ProductList({
  products,
  error,
  isLoading,
  onResetFilters,
}: Readonly<IProductListProps>) {
  if (error) {
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
      <div className="flex grow flex-col items-center justify-start gap-4 pt-16 text-center">
        <span className="text-6xl">☕</span>
        <h3 className="text-2xl font-semibold text-primary">No coffees found</h3>
        <p className="max-w-xs text-secondary">Try adjusting your filters or browse all our coffees.</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-2 rounded-full bg-brand-solid px-6 py-3 text-base font-medium text-white transition hover:bg-brand-solid-hover"
          >
            Reset filters
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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  )
}
