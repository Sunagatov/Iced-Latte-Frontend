import { notFound } from 'next/navigation'
import { isAxiosError } from 'axios'
import { IProduct } from '@/features/products/types'
import { getProduct } from '@/features/products/api'
import ProductWithReviews from '@/features/products/components/ProductWithReviews/ProductWithReviews'

type ProductProps = {
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

export default async function Page({ params }: Readonly<ProductProps>) {
  const { id } = await params
  const product = await getProductById(id)

  return <ProductWithReviews product={product} />
}
