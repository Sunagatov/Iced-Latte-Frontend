'use client'

export interface LabelProps {
  id: string
  name: string
}

export default function Label({ name, id }: LabelProps) {
  return (
    <div className='text-white bg-black text-lg px-6  rounded-full w-[136px] h-[48px] flex items-center gap-3'>
      <span className='cursor-pointer' onClick={() => { alert(`click label ${id}`) }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.800781 0.800781L5.00078 5.00078M9.20078 9.20078L5.00078 5.00078M5.00078 5.00078L9.20078 0.800781M5.00078 5.00078L0.800781 9.20078" stroke="white" stroke-width="1.4" stroke-linecap="round" />
      </svg>
      </span>
      <span>{name}</span>
    </div>
  )
}