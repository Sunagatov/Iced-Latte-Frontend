'use client'

import Label from './Label'

const filterAttributes = [
  { id: '1', name: 'Brand1', label: 'label-1' },
  { id: '2', name: 'Seller1', label: 'label-2' },
  { id: '3', name: 'Seller5', label: 'label-3' }
]


export default function ProductsFilterLabels() {

  const ClickButton = () => {
    alert('Кнопка нажата')
  }

  return (
    <div className='flex gap-3 pt-1.5'>
      <button
        className='text-white bg-black text-lg px-6 rounded-full w-[136px] h-[48px]'
        onClick={ClickButton}
      >
        By default
      </button>

      <div className='flex justify-center gap-3'>{filterAttributes.map(item => (<Label name={item.name} key={item.id} id={item.id} />))}</div>
    </div >
  )
}