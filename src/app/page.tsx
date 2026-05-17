export const dynamic = 'force-dynamic'

import { cache } from 'react'
import Hero from '@/features/home/components/Hero'
import {
  getProductBrands,
  getProductSellers,
  ProductCatalog,
} from '@/features/products/public'

const getBrands = cache(async () => {
  try {
    const response = await getProductBrands()

    return response.brands
  } catch {
    return []
  }
})

const getSellers = cache(async () => {
  try {
    const response = await getProductSellers()

    return response.sellers
  } catch {
    return []
  }
})

export default async function HomePage() {
  const [productBrands, productSellers] = await Promise.all([
    getBrands(),
    getSellers(),
  ])

  return (
    <>
      <Hero />
      <ProductCatalog brands={productBrands} sellers={productSellers} />
    </>
  )
}
