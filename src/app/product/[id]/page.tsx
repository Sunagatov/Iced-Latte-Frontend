import { IProduct } from '@/features/products/types'
import { getProduct } from '@/features/products/api'
import ProductWithReviews from '@/features/products/components/ProductWithReviews/ProductWithReviews'


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
