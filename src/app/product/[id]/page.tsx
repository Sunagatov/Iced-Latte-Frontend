import { isAxiosError } from 'axios'
import { notFound } from 'next/navigation'
import ProductWithReviews from '@/features/products/components/ProductWithReviews'
import { getProduct } from '@/features/products/public'
import type { IProduct } from '@/features/products/public'

type ProductDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

async function getProductById(id: string): Promise<IProduct> {
  try {
    return await getProduct(id)
  } catch (err) {
    if (isAxiosError(err) && [400, 404].includes(err.response?.status ?? 0)) {
      notFound()
    }

    throw err
  }
}

export default async function ProductDetailsPage({
  params,
}: Readonly<ProductDetailsPageProps>) {
  const { id } = await params
  const product = await getProductById(id)

  return <ProductWithReviews product={product} />
}
