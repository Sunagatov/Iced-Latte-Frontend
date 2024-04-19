'use client'

import Label from './Label'

const filterAttributes = [
  { id: '1', name: 'name-1', label: 'Brand1' },
  { id: '2', name: 'name-2', label: 'Seller1' },
  { id: '3', name: 'name-3', label: 'Seller5' }
]


export default function ProductsFilterLabels() {

  const handleClickButtonDefault = () => {
    alert('Кнопка нажата')
  }

  return (
    <div className='flex gap-3 pt-1.5'>
      <button
        className='text-white bg-black text-lg px-6 rounded-full w-[136px] h-[48px]'
        onClick={handleClickButtonDefault}
      >
        By default
      </button>

      <div className='flex justify-center gap-3'>{filterAttributes.map(item => (<Label name={item.label} key={item.id} id={item.id} />))}</div>
    </div >
  )
}