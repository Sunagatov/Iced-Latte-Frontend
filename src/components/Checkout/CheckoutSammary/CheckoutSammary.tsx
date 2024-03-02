
import Image from 'next/image'
import card_logo from '../../../../public/coffee.png'
interface CheckOutElementProps {
  itemName: string
  weight: string
  price: number
  id: number
}

export default function CheckOutElement({
  itemName,
  weight,
  price,
}: CheckOutElementProps) {
  return (
    <div className="mb-6 flex items-start">
      <div className="flex justify-center border bg-slate-100">
        <Image
          src={card_logo}
          alt={itemName}
          width={250}
          height={250}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="ml-4 w-full ">
        <p className="text-lg font-semibold">{itemName}</p>
        <p className="text-slate-950 text-opacity-50">{` ${weight}.`}</p>
        <div className="mt-10 flex justify-between">
          <p className="mr-20">1pcs</p>
          <p className="text-lg font-semibold">{`$${price.toFixed(2)}`}</p>
        </div>
      </div>
    </div>
  )
}
