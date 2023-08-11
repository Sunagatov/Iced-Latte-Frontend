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
      imageLink: '',
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
