import { IProduct } from '@/types/Products'
import { getProduct } from '@/services/apiService'
import ProductWithReviews from '@/components/Product/ProductWithReviews/ProductWithReviews'


type ProductProps = {
  params: {
    id: string
  }
}

async function getProductById(id: string): Promise<IProduct> {
  return await getProduct(id)
}

export default async function Page({ params }: Readonly<ProductProps>) {
  const product = await getProductById(params.id)

  return (
    <ProductWithReviews product={product} />
  )
}
