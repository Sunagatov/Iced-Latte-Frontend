import { productsList } from '@/data/products'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest & { url: string }) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page')) || 0
  const size = Number(searchParams.get('size')) || 50

  const totalElements = productsList.totalElements

  const totalPages = Math.ceil(totalElements / size) // depend on totalElements and size of page

  const sliceListFromPosition = page * size
  const sliceListToPosition = sliceListFromPosition + size
  const isExistingPage = page <= totalPages - 1
  const productsPage = isExistingPage
    ? productsList.products!.slice(sliceListFromPosition, sliceListToPosition)
    : null

  const pageOfProductList = {
    ...productsList,
    products: productsPage,
    page,
    totalPages,
  }
  const result = await new Promise((resolve) =>
    setTimeout(() => resolve(pageOfProductList), 100),
  )

  return NextResponse.json(result)
}
