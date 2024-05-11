import Hero from '../components/Hero/Hero'
import ProductList from '../components/Product/ProductList/ProductList'
import { getProductBrands, getProductSellers } from '@/services/apiService'

const getBrands = async () => {
  try {
    const response = await getProductBrands()

    return response.brands
  } catch (e) {
    console.error(e)
  }
}

const getSellers = async () => {
  try {
    const response = await getProductSellers()

    return response.sellers
  } catch (e) {
    console.error(e)
  }
}

export default async function Home() {
  const productBrands = (await getBrands()) ?? []
  const productSellers = (await getSellers()) ?? []

  return (
    <>
      <Hero />
      <ProductList brands={productBrands} sellers={productSellers} />
    </>
  )
}
