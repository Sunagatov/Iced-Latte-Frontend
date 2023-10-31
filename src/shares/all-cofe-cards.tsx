// eslint-disable-next-line import/no-cycle
import { ICards } from '../app/page'
import Image from 'next/image'
import React from 'react'

interface Props {
  data: ICards
}

export const AllCoffeeCards = ({ data }: Props) => {
  const { imageLink, imageSize, price, name }: ICards = data
  return (
    <div className="w-96">
      <div className="w-96 h-96 bg-slate-100 flex items-center justify-center   ">
        <Image src={imageLink} alt={''} width={imageSize} height={imageSize} />
      </div>

      <div className="">
        <h3 className="text-2xl py-1">{name}</h3>
        <p className="flex items-center gap-2">
          <Image src={'star.svg'} alt={''} width={10} height={10} />
          <span className="text-green-800 font-bold	">4.8</span>
          <span className="text-slate-500 flex items-center gap-2">
            <span className="text-5xl">·</span> 500 g.
          </span>
        </p>
      </div>
      <div className="flex items-end justify-between ">
        <p className="text-xl">${price.amount}</p>
        <button className="bg-black rounded-full text-white w-10 h-10 text-2xl flex items-center justify-center">
          +
        </button>
      </div>
    </div>
  )
}
