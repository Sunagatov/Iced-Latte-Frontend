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
          className="duration-200 fixed bottom-4 right-4 flex h-[56px] w-[56px] transform items-center justify-center rounded-full border-2 border-focus bg-secondary shadow-lg transition-all ease-in-out hover:-translate-y-1 hover:shadow-xl active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          onClick={scrollToTop}
        >
          <Image src="arrowup.svg" alt="up_arrow" width={16} height={20} />
        </Button>
      )}
    </>
  )
}
