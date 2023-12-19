'use client'
import { useState } from 'react'
import Image from 'next/image'
import ProfileImage from '../../public/person.svg'
import { AuthModal } from '@/components/modals/AuthModal'
import Link from 'next/link'

export default function LoginIcon() {
  const [open, setOpen] = useState(false)

  const toggleModal = () => setOpen((state) => !state)

  return (
    <>
      <Link href="/auth/login" style={{ display: 'inline-flex' }}>
        <Image
          src={ProfileImage}
          alt="Profile"
          onClick={toggleModal}
          className={'cursor-pointer'}
        />
      </Link>
      {open && <AuthModal onCloseModal={toggleModal} />}
    </>
  )
}
