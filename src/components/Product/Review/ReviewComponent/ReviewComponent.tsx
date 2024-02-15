'use client'
import ReviewRatingFilter from '@/components/UI/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'

interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent = ({ productId }: ReviewComponentProps) => {

  // function for processing the rating filter
  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }

  return (
    <div className='flex mb-[176px]'>
      <div className='w-[800px]'>
        <h2 className='font-medium text-[36px] text-primary'>Rating and reviews</h2>
        <ReviewForm productId={productId} />
      </div>
      <div className='text-[18px] font-medium text-tertiary pt-[10px] w-[344px]'>
        <div className='text-end'>No customer review</div>
        <ReviewRatingFilter onChange={handleRatingChange} />
      </div>
    </div >

  )
}

export default ReviewComponent
