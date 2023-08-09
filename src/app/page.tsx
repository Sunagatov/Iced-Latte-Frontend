import Image from 'next/image'
import React from 'react'
import { AllCoffeeCards } from '../shares/all-cofe-cards'

export interface ICards {
  id: string
  name: string
  description: string
  price: {
    amount: number
    currency: string
  }
  imageLink: string
  imageSize: number
  rating?: string
  quantity: number
}
export default async function Home() {
  // const cards = await fetch('https://tailwindcss.com/docs/font-size')
  const cards: ICards[] = [
    {
      id: '3dc8d76a-d892-4875-8e97-ca4240929c4a',
      name: 'Arabica',
      description:
        'A type of coffee that has a noble and mild taste with piquant sourness and exquisite aroma.caffeine content does not exceed 1.5%.',
      price: {
        amount: 3.0,
        currency: 'USD',
      },
      imageLink:
        'data:image/jpeg;base64,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',
      imageSize: 300,
      quantity: 10,
    },
  ]
  return (
    <div>
      <div className="bg-slate-200 w-full h-96" />
      <main className="m-w-1440 min-h-screen flex-col px-24">
        <h1 className="text-7xl	py-4">All Coffee</h1>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button className="flex gap-2 items-center text-black bg-slate-100 font-medium py-2 px-4 rounded-full">
              Size
              <Image src={'/arrow.svg'} alt="" width={10} height={10} />
            </button>
            <button className="flex gap-2 items-center text-black bg-slate-100 font-medium py-2 px-4 rounded-full">
              Price
              <Image src={'/arrow.svg'} alt="" width={10} height={10} />
            </button>
            <button className="flex gap-2 items-center text-black bg-slate-100 font-medium py-2 px-4 rounded-full">
              Roast level
              <Image src={'/arrow.svg'} alt="" width={10} height={10} />
            </button>
          </div>
          <button className="flex items-center gap-2 text-black font-medium py-2 px-4 rounded-full">
            Sort by default
            <Image src={'/arrow.svg'} alt="" width={10} height={10} />
          </button>
        </div>
        <div className="py-6 flex flex-wrap justify-around gap-10">
          {cards.map((post) => (
            <AllCoffeeCards data={post} />
          ))}
        </div>
        <div className="flex items-center w-full justify-center">
          <button className="flex gap-2 items-center text-black bg-slate-100 font-medium py-2 px-4 rounded-full">
            Show more
          </button>
        </div>
      </main>
    </div>
  )
}
