import Image from 'next/image'
import arrowup from '../../../../../public/arrowup.svg'
import { useEffect, useState } from 'react'

export default function ScrollUpBtn() {

  const [showButton, setshowButton] = useState(false)

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        setshowButton(true)
      } else {
        setshowButton(false)
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
      {showButton && (<button className="m-2 fixed bottom-2 right-2 bg-secondary bg-opacity-90 p-1 rounded-full w-14 h-14 transition-all duration-900 ease-in-out transform hover:-translate-y-1 hover:scale-110 border-gray-300 border-2" onClick={scrollToTop}><Image src={arrowup} alt="up_arrow" className={'inline-block'} /></button>)}
    </>
  )
}
