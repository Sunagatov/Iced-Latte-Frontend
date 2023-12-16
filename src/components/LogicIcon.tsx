'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProfileImage from '../../public/person.svg'
import { AuthModal } from '@/components/modals/AuthModal'

export default function LoginIcon() {
  const [open, setOpen] = useState(false)

  const toggleModal = () => setOpen((state) => !state)

  return (
    <>
      <Image
        src={ProfileImage}
        alt="Profile"
        onClick={toggleModal}
        className={'cursor-pointer'}
      />
      {open && <AuthModal onCloseModal={toggleModal} />}
    </>
  )
}
