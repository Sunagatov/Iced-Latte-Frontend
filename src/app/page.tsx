import { unstable_cache } from 'next/cache'
import Hero from '@/shared/components/Hero/Hero'
import ProductCatalog from '@/features/products/components/ProductCatalog/ProductCatalog'
import { getProductBrands, getProductSellers } from '@/features/products/api'

const getBrands = unstable_cache(
  async () => {
    try {
      const response = await getProductBrands()
      return response.brands
    } catch (e) {
      console.error(e)
      return []
    }
  },
  ['product-brands'],
  { revalidate: 3600 }
)

const getSellers = unstable_cache(
  async () => {
    try {
      const response = await getProductSellers()
      return response.sellers
    } catch (e) {
      console.error(e)
      return []
    }
  },
  ['product-sellers'],
  { revalidate: 3600 }
)

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
