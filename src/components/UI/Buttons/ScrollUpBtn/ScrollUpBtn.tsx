import Image from 'next/image'
import { useEffect, useState } from 'react'
import Button from '../Button/Button'

export default function ScrollUpBtn() {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 1400) {
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    })
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {showButton && (
        <Button
          id="scroll-btn"
          className="duration-900 fixed bottom-2 right-2 m-2 flex h-[60px] w-[60px] transform items-center justify-center rounded-full border border-focus bg-secondary bg-opacity-90 p-1 transition-all ease-in-out hover:-translate-y-1 hover:scale-110"
          onClick={scrollToTop}
        >
          <Image src="arrowup.svg" alt="up_arrow" width={16} height={20} />
        </Button>
      )}
    </>
  )
}
