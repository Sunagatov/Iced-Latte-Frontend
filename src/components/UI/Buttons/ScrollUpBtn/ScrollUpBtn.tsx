import Image from 'next/image'
import arrowup from '/public/arrowup.svg'
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
      behavior: 'smooth'
    })
  }

  return (
    <>
      {showButton && (<Button className="flex items-center justify-center m-2 fixed bottom-2 right-2 bg-secondary bg-opacity-90 p-1 rounded-full w-[60px] h-[60px] transition-all duration-900 ease-in-out transform hover:-translate-y-1 hover:scale-110 border-focus border" onClick={scrollToTop}><Image src={arrowup} alt="up_arrow" /></Button>)}
    </>
  )
}
