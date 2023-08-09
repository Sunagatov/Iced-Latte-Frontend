import { Metadata } from 'next'
import Image from 'next/image'
import React from 'react'
import Counter from '../../../../components/Counter'
import pic from '../../../img/Coffee.png'

async function getItemById(id: string) {
  const response = await fetch(`http://localhost:8083/api/v1/products/${id}`)

  return response.json()
}

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const item = await getItemById(id)

  return {
    title: item.name,
  }
}

async function ProductPage({ params: { id } }: Props) {
  const item = await getItemById(id)

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex p-4 bg-white">
        <div className="">
          <Image src={pic} width={500} height={500} alt="aaa" />
        </div>
        <div className="px-4 ml-12">
          <h2 className="font-medium text-5xl mb-5">{item.name}</h2>
          <div className="flex items-center mb-10">
            <div className="flex items-center text-base mr-7">
              <span className="text-[#57b426] mr-1">&#9733;</span>
              <span className="text-[#57b426]">4.0</span>
            </div>
            <span className="text-black text-base font-medium">
              Size: 500 g.
            </span>
          </div>
          <div className="flex items-center gap-2 mb-12">
            <Counter />
            <button className="flex w-64 px-6 py-4 justify-center items-center gap-3 rounded-full bg-indigo-600 text-white text-lg font-medium">
              Add to Cart &#8226; {item.priceDetails.price} {item.priceDetails.currency}
            </button>
          </div>
          <p className="w-[532px] mb-4 text-2xl font-medium">
            {/* Описание продукта lorem ipsum dolor sit amet, consectetur adipiscing
            elit, sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua. */}
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
