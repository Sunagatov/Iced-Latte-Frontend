import Button from '@/components/UI/Buttons/Button/Button'
import { BiLike, BiDislike } from 'react-icons/bi'
import { FaStar } from 'react-icons/fa'
import { useState } from 'react'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'

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

  // Function for uploading additional comments
  const loadMoreComments = () => {
    const newComments = comments.slice(lastLoadedIndex + 1, lastLoadedIndex + 4)

    setLastLoadedIndex(lastLoadedIndex + 3)
    setLoadedComments((prevComments) => [...prevComments, ...newComments])

    if (lastLoadedIndex + 3 >= comments.length - 1) {
      setShowLoadMore(false)
    }
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
          <li className={`pb-10 ${index === loadedComments.length - 1 ? '' : 'border-b border-solid border-primary'}`} key={comment.id}>
            <div className="font-medium text-[24px] text-primary mt-2">
              <span>{comment.firstName} {comment.lastName}</span>
            </div>
            <div className="font-medium text-[18px] text-primary mt-2 mb-6 flex items-center">
              <div className='flex items-center gap-1'>
                {[...Array(5)].map((_, index) => (
                  <FaStar className={`w-6 h-6 ${index < comment.rating ? 'text-positive' : 'text-disabled'}`} key={index} />
                ))}
              </div>
              <span className="font-medium text-[18px] text-primary ml-2">{comment.rating}/5</span>
              <div className="inline-flex font-medium text-[18px] text-tertiary">
                <div className='inline-flex relative ml-4'>
                  <span className='ml-4'>{comment.date}</span>
                  <div className="text-tertiary h-2 w-2 rounded-full bg-gray-400 absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <span className='ml-2'>{comment.time}</span>
              </div>
            </div>
            <p className={`rounded-[8px] px-4 py-[17px] mb-6 ${comment.isCurrentUserComment ? 'bg-brand-second' : 'bg-secondary'}`}>{comment.text}</p>
            <div className="flex justify-between items-center">
              {comment.isCurrentUserComment && (
                <Button onClick={() => handleDeleteComment(comment.id)} className="rounded-[47px] py-4 px-6 bg-secondary font-medium text-[18px] text-primary">Delete my review</Button>
              )}
              <div className='flex gap-2 ml-auto'>
                <Button onClick={() => handleLikeComment(comment.id)} className="rounded-[47px] bg-secondary w-[88px] text-tertiary font-medium flex items-center justify-center gap-2"><BiLike /><span>{comment.likes}</span></Button>
                <Button onClick={() => handleDislikeComment(comment.id)} className="rounded-[47px] bg-secondary w-[88px] text-tertiary font-medium flex items-center justify-center gap-2"><BiDislike /><span> {comment.dislikes}</span></Button>
              </div>
            </div>
          </li>
        ))}
        <ScrollUpBtn />
      </ul>

      {showLoadMore && (
        <Button onClick={loadMoreComments} className='flex items-center justify-center rounded-[47px] w-[278px] ml-auto mr-auto bg-secondary font-medium text-[18px] text-primary'>Show more</Button>
      )}
    </>
  )
}

export default CommentList
