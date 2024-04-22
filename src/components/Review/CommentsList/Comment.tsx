import React from 'react'
import Button from '@/components/UI/Buttons/Button/Button'
import { Review } from '@/types/ReviewType'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'

interface CommentProps {
  comment: Review
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const { expandedComments, setExpandedComments } = useLocalSessionStore()

  const toggleCommentExpansion = () => {
    setExpandedComments((prevState) => ({
      ...prevState,
      [comment.productReviewId]: !prevState[comment.productReviewId],
    }))
  }

  return (
    <p className="mb-6 rounded-[8px] bg-secondary px-4 py-[17px] text-L">
      {comment.text &&
      comment.text.length > 300 &&
      !expandedComments[comment.productReviewId] ? (
        <>
          {comment.text.slice(0, 300)}
          <Button
            id="see-more-btn"
            onClick={toggleCommentExpansion}
            className="inline-flex h-auto bg-transparent pl-0 text-L font-medium text-tertiary"
          >
            ...see more
          </Button>
        </>
      ) : (
        comment.text || 'No review'
      )}
    </p>
  )
}

export default Comment
