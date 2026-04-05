import Image from 'next/image'
import { useEffect, useState } from 'react'
import Button from '../Button/Button'

export default function ScrollUpBtn() {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowButton(window.scrollY > 1400)

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
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
          className="border-focus bg-secondary focus-visible:ring-focus fixed right-4 bottom-4 flex h-[56px] w-[56px] transform items-center justify-center rounded-full border-2 shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-90"
          onClick={scrollToTop}
        >
          <Image src="/arrowup.svg" alt="up_arrow" width={16} height={20} />
        </Button>
      )}
    </>
  )
}
