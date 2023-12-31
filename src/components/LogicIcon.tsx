'use client'
import Image from 'next/image'
import ProfileImage from '../../public/person.svg'
import SettingsImage from '../../public/settings-profile.svg'
import Link from 'next/link'
import { AuthModal } from '@/components/modals/AuthModal'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useStoreData } from '@/hooks/useStoreData'
import { usePathname } from 'next/navigation'

export default function LoginIcon() {
  const pathname = usePathname()
  const { toggleModal, resetOpenModal } = useAuthStore()
  const isLoggedIn = useStoreData(
    useAuthStore,
    (state) => state.isLoggedIn,
  )

  const open = useStoreData(
    useAuthStore,
    (state) => state.openModal,
  )

  useEffect(() => {
    // Close the modal window when navigating to the profile page because the open state remains true until the page is refreshed
    if (pathname === '/profile' || pathname === '/') {
      resetOpenModal()
    }
  }, [pathname, resetOpenModal])

  return (
    <>
      {isLoggedIn ? (
        <Link href="/profile" className="inline-flex">
          <Image src={SettingsImage} alt="Profile icon" />
        </Link>
      ) : (
        <Link href="/auth/login" className="inline-flex" onClick={toggleModal}>
          <Image src={ProfileImage} alt="auth icon" />
        </Link>
      )}
      {open && <AuthModal onCloseModal={toggleModal} />}
    </>
  )
}
