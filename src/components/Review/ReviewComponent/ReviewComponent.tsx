'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import CommentList from '../CommentsList/CommentsList'
import comments from '@/constants/coments'
import { useAuthStore } from '@/store/authStore'

interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent = ({ productId }: ReviewComponentProps) => {
  const { token } = useAuthStore()

  const hasComments = comments.length > 0

  // function for processing the rating filter
  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }

  return (
    <div className='flex items-baseline mb-[176px] ml-auto mr-auto max-w-[1157px]'>
      <div className='w-[800px]'>
        <h2 className='font-medium text-[36px] text-primary'>Rating and reviews</h2>
        {token && <ReviewForm productId={productId} />}
        {hasComments ? < CommentList comments={comments} /> : <div className='text-end'>No customer review</div>}

      </div>
      <div className='text-[18px] font-medium text-tertiary pt-[10px] pl-[76px]'>
        {hasComments && <ReviewRatingFilter onChange={handleRatingChange} />}
      </div>

    </div >

  )
}

export default ReviewComponent
