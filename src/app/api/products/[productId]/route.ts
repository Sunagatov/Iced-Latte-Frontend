import { productsList } from '@/data/products'
import { NextApiRequest } from 'next'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextApiRequest & NextRequest,
  { params }: { params: { productId: string } },
) {
  const productId = params.productId

  const product = productsList.products!.find(
    (product) => product.id === productId,
  )

  if (!product) return NextResponse.json({ message: 'No product with that id' })

  const result = await Promise.resolve(product)

  return NextResponse.json(result)
}
