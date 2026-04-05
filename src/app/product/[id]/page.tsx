import { notFound } from 'next/navigation'
import { IProduct } from '@/features/products/types'
import { getProduct } from '@/features/products/api'
import ProductWithReviews from '@/features/products/components/ProductWithReviews/ProductWithReviews'

type ProductProps = {
  params: Promise<{
    id: string
  }>
}

async function getProductById(id: string): Promise<IProduct | null> {
  try {
    return await getProduct(id)
  } catch {
    return null
  }
}

export default async function Page({ params }: Readonly<ProductProps>) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) notFound()

  return <ProductWithReviews product={product} />
}
