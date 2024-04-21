'use client'
import { FaStar } from 'react-icons/fa'
import { useProductRatingStore } from '@/store/ratingStore'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useStoreData } from '@/hooks/useStoreData'
import Checkbox from '@/components/UI/Checkbox/Checkbox'

interface ReviewRatingFilterProps {
  onChange: (value: number | null) => void;
}

const ReviewRatingFilter = ({ onChange }: ReviewRatingFilterProps) => {

  const { ratings } = useProductRatingStore()

  const { setSelectedRating } = useLocalSessionStore()

  const selectedRating = useStoreData(useLocalSessionStore, (state) => state.selectedRating)

  const handleCheckboxChange = (value: number) => {
    setSelectedRating(selectedRating === value ? null : value)
    onChange(selectedRating === value ? null : value)
  }

  return (
    <div>
      <div className='flex gap-4 mb-6 flex-col'>
        <div className='font-medium text-4XL text-primary'>4,8</div>
        <div className='font-medium text-L text-tertiary'>Based on 14 reviws</div>
      </div>
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
              <Checkbox id={`checkbox-${value}`} ariaLabel={`Filter by ${value} stars`} isChecked={selectedRating === value} onChange={() => handleCheckboxChange(value)} />
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
