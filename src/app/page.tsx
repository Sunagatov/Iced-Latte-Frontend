import { cache } from 'react'
import Hero from '@/shared/components/Hero/Hero'
import ProductCatalog from '@/features/products/components/ProductCatalog/ProductCatalog'
import { getProductBrands, getProductSellers } from '@/features/products/api'

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

export default async function Home() {
  const productBrands = await getBrands()
  const productSellers = await getSellers()

  return (
    <>
      <Hero />
      <ProductCatalog brands={productBrands} sellers={productSellers} />
    </>
  )
}
