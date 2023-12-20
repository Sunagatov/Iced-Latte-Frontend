'use client'
import { useState } from 'react'
import Image from 'next/image'
import ProfileImage from '../../public/person.svg'
import { AuthModal } from '@/components/modals/AuthModal'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function LoginIcon() {
  const [open, setOpen] = useState(false)
  const toggleModal = () => setOpen((state) => !state)
  const { isLoggedIn } = useAuthStore()

  return (
    <>
      <Link
        href={isLoggedIn ? '/profile' : '/auth/login'}
        className="inline-flex"
      >
        <Image src={ProfileImage} alt="Profile" onClick={toggleModal} />
      </Link>
      {open && <AuthModal onCloseModal={toggleModal} />}
    </>
  )
}
