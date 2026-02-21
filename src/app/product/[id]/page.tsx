import { IProduct } from '@/types/Products'
import { getProduct } from '@/services/apiService'
import ProductWithReviews from '@/components/Product/ProductWithReviews/ProductWithReviews'


type ProductProps = {
  params: Promise<{
    id: string
  }>
}

async function getProductById(id: string): Promise<IProduct> {
  return await getProduct(id)
}

export default async function Page({ params }: Readonly<ProductProps>) {
  const { id } = await params
  const product = await getProductById(id)

  return (
    <ProductWithReviews product={product} />
  )
}
