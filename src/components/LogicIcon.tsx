'use client'
import Image from 'next/image'
import ProfileImage from '../../public/person.svg'
import Link from 'next/link'
import { AuthModal } from '@/components/modals/AuthModal'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useStoreData } from '@/hooks/useStoreData'
import { usePathname } from 'next/navigation'

export default function LoginIcon() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const toggleModal = () => setOpen((state) => !state)
  const isLoggedIn = useStoreData(
    useAuthStore,
    (state) => state.isLoggedIn,
  ) as boolean

  useEffect(() => {
    // Close the modal window when navigating to the profile page because the open state remains true until the page is refreshed
    if (pathname === '/profile' || pathname === '/') {
      setOpen(false)
    }
  }, [pathname])

  return (
    <>
      {isLoggedIn ? (
        <Link href="/profile" className="inline-flex">
          <Image src={ProfileImage} alt="Profile icon" />
        </Link>
      ) : (
        <Link href="/auth/login" className="inline-flex">
          <Image src={ProfileImage} alt="Profile icon" onClick={toggleModal} />
        </Link>
      )}
      {open && <AuthModal onCloseModal={toggleModal} />}
    </>
  )
}
