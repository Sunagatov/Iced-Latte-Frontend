import type { IProduct } from '@/features/products/types'

export const uniqueIds = (ids: readonly string[]): string[] =>
  Array.from(new Set(ids))

const isProduct = (value: unknown): value is IProduct => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<IProduct>

  return typeof candidate.id === 'string'
}

export const normalizeProducts = (products: unknown): IProduct[] => {
  if (!Array.isArray(products)) {
    return []
  }

  const seen = new Set<string>()
  const unique: IProduct[] = []

  for (const item of products) {
    if (!isProduct(item) || seen.has(item.id)) {
      continue
    }

    seen.add(item.id)
    unique.push(item)
  }

  return unique
}

export function mapProductsToFavourites(products: unknown): {
  favouriteIds: string[]
  favourites: IProduct[]
} {
  const unique = normalizeProducts(products)

  return {
    favouriteIds: unique.map((product) => product.id),
    favourites: unique,
  }
}
