'use client'
import Button from '@/components/UI/Buttons/Button/Button'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import { BiLike, BiDislike } from 'react-icons/bi'
import { FaStar } from 'react-icons/fa'
import { useState } from 'react'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useMediaQuery } from 'usehooks-ts'

interface Comment {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  date: string;
  time: string;
  text: string;
  isCurrentUserComment: boolean;
  likes: number;
  dislikes: number;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  const [loadedComments, setLoadedComments] = useState(comments.slice(0, 3))
  const [lastLoadedIndex, setLastLoadedIndex] = useState(2)
  const [showLoadMore, setShowLoadMore] = useState(true)
  const { expandedComments, setExpandedComments } = useLocalSessionStore()
  const ismediaQuery = useMediaQuery('(min-width: 768px)', { initializeWithValue: false })

  // Function for uploading additional comments
  const loadMoreComments = () => {
    const newComments = comments.slice(lastLoadedIndex + 1, lastLoadedIndex + 4)

    setLastLoadedIndex(lastLoadedIndex + 3)
    setLoadedComments((prevComments) => [...prevComments, ...newComments])

    if (lastLoadedIndex + 3 >= comments.length - 1) {
      setShowLoadMore(false)
    }
  }

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId]
    }))
  }

  const handleDeleteComment = (commentId: string) => {
    console.log(`Deleting comment with ID ${commentId}`)
  }

  const handleLikeComment = (commentId: string) => {
    console.log(`Liking comment with ID ${commentId}`)
  }

  const handleDislikeComment = (commentId: string) => {
    console.log(`Disliking comment with ID ${commentId}`)
  }

  return (
    <>
      <ul className='flex gap-10 flex-col'>
        {loadedComments.map((comment, index) => (
          <li className={`pb-6 xl:pb-10 ${index === loadedComments.length - 1 ? 'pb-0' : 'border-b border-solid border-primary'}`} key={comment.id}>
            <div className="font-medium text-XL text-primary mb-2 xl:text-2XL">
              <span>{comment.firstName} {comment.lastName}</span>
            </div>
            <div className="font-medium text-[18px] text-primary mb-6 flex items-center">
              <div className='flex items-center gap-1'>
                {[...Array(5)].map((_, index) => (
                  <FaStar className={`w-[18px] h-[18px] ${index < comment.rating ? 'text-positive' : 'text-disabled'} xl:w-6 xl:h-6`} key={index} />
                ))}
              </div>
              <span className="font-medium text-L text-primary ml-2">{comment.rating}/5</span>
              <div className="inline-flex font-medium text-L text-tertiary">
                <div className='inline-flex relative ml-3'>
                  <span className='ml-[10px] text-L'>{comment.date}</span>
                  <div className="text-tertiary h-[5px] w-[5px] rounded-full bg-gray-400 absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <span className='ml-2'>{comment.time}</span>
              </div>
            </div>
            {comment.text.length > 300 && !expandedComments[comment.id] ? (
              <p className={`rounded-[8px] text-L px-4 py-[17px] mb-6 ${comment.isCurrentUserComment ? 'bg-brand-second' : 'bg-secondary'}`}>
                {comment.text.slice(0, 300)}
                <Button onClick={() => toggleCommentExpansion(comment.id)} className="pl-0 h-auto text-tertiary text-L font-medium inline-flex bg-transparent">...see more</Button>
              </p>
            ) : (
              <p className={`rounded-[8px] text-L px-4 py-[17px] mb-6 ${comment.isCurrentUserComment ? 'bg-brand-second' : 'bg-secondary'}`}>
                {comment.text}
              </p>
            )}
            <div className="flex justify-between items-center">
              {comment.isCurrentUserComment && (
                <Button onClick={() => handleDeleteComment(comment.id)} className="w-[126px] rounded-[47px] py-4 px-6 bg-secondary font-medium text-L text-primary mr-auto md:w-[196px]">{ismediaQuery ? 'Delete my review' : 'Delete'}</Button>
              )}
              <div className='flex gap-2 xl:ml-auto'>
                <Button onClick={() => handleLikeComment(comment.id)} className="rounded-[47px] bg-secondary w-[88px] text-tertiary font-medium flex items-center justify-center gap-2"><BiLike /><span>{comment.likes}</span></Button>
                <Button onClick={() => handleDislikeComment(comment.id)} className="rounded-[47px] bg-secondary w-[88px] text-tertiary font-medium flex items-center justify-center gap-2"><BiDislike /><span> {comment.dislikes}</span></Button>
              </div>
            </div>
          </li>
        ))}
        <ScrollUpBtn />
      </ul>

      {showLoadMore && (
        <Button onClick={loadMoreComments} className='flex items-center justify-center rounded-[47px] w-[334px] ml-auto mr-auto mb-[94px] mt-[24px] bg-secondary font-medium text-[18px] text-primary'>Show more</Button>
      )}
    </>
  )
}

export default CommentList
