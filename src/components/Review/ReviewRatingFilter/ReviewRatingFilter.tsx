'use client'
import { FaStar } from 'react-icons/fa'
import { useProductRatingStore } from '@/store/ratingStore'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useStoreData } from '@/hooks/useStoreData'
import Image from 'next/image'

interface ReviewRatingFilterProps {
  onChange: (value: number | null) => void;
}

const ReviewRatingFilter = ({ onChange }: ReviewRatingFilterProps) => {

  const { ratings } = useProductRatingStore()

  const { setSelectedRating } = useLocalSessionStore()

  const selectedRating = useStoreData(useLocalSessionStore, (state) => state.selectedRating)

  const iconCheck = '/Ptichka.svg'

  const handleCheckboxChange = (value: number) => {
    setSelectedRating(selectedRating === value ? null : value)
    onChange(selectedRating === value ? null : value)
  }

  return (
    <div>
      <div className='mb-3 font-medium text-[36px] text-primary'>4,8/5</div>
      <div className='mb-6 font-medium text-[18px] text-tertiary'>Based on 14 reviws</div>
      <div className='flex flex-col gap-3'>
        {[5, 4, 3, 2, 1].map((value) => {
          const stars = Array.from({ length: 5 }, (_, index) => (
            <FaStar
              className='w-6 h-6'
              key={index}
              color={index < value ? '#00A30E' : 'rgba(4, 18, 27, 0.24)'}
            />
          ))

          return (

            <label key={value} className='flex items-center gap-2 cursor-pointer relative'>
              <input
                className='w-6 h-6 appearance-none bg-secondary rounded-[4px] cursor-pointer checked:bg-inverted'
                type="checkbox"
                checked={selectedRating === value}
                onChange={() => handleCheckboxChange(value)}
                aria-label={`Filter by ${value} stars`}
              />
              {selectedRating === value && (
                <span className='absolute top-1/2 left-3 transform -translate-x-1/2 -translate-y-1/2'>
                  <Image
                    src={iconCheck}
                    alt="Check icon"
                    width={16}
                    height={16}
                  />
                </span>
              )}
              {stars}
              <span className='font-medium text-[18px] text-primary'>{ratings[value]?.quantity ?? 0} reviews</span>
            </label>
          )
        })}
      </div >
    </div>
  )
}

export default ReviewRatingFilter
