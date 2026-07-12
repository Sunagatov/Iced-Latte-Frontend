import type { Metadata } from 'next'
import { isAxiosError } from 'axios'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import ProductWithReviews from '@/features/products/components/ProductWithReviews'
import { getProduct } from '@/features/products/api'
import type { IProduct } from '@/features/products/types'

type ProductDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

const getProductById = cache(async (id: string): Promise<IProduct> => {
  try {
    return await getProduct(id)
  } catch (err) {
    if (isAxiosError(err) && [400, 404].includes(err.response?.status ?? 0)) {
      notFound()
    }

    throw err
  }
})

export async function generateMetadata({
  params,
}: Readonly<ProductDetailsPageProps>): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetailsPage({
  params,
}: Readonly<ProductDetailsPageProps>) {
  const { id } = await params
  const product = await getProductById(id)

  return <ProductWithReviews product={product} />
}
