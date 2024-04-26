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

  const renderContent = () => {
    if (!comment.text) {
      return 'No review'
    }
    if (
      comment.text.length > 300 &&
      !expandedComments[comment.productReviewId]
    ) {
      return (
        <span>
          {comment.text.slice(0, 300)}
          <Button
            id="see-more-btn"
            onClick={toggleCommentExpansion}
            className="inline-flex h-auto bg-transparent pl-0 text-L font-medium text-tertiary"
          >
            ...see more
          </Button>
        </span>
      )
    }

    return comment.text
  }

  return (
    <p className="mb-6 rounded-[8px] bg-secondary px-4 py-[17px] text-L">
      {renderContent()}
    </p>
  )
}

export default Comment
