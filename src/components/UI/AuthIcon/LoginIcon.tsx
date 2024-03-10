'use client'
import Image from 'next/image'
import ProfileImage from '../../../../public/person.svg'
import Link from 'next/link'
import AuthModal from '@/components/Auth/Modal/AuthModalLogin/AuthModal'
import UserBar from '../UserBar/UserBar'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useStoreData } from '@/hooks/useStoreData'
import { usePathname } from 'next/navigation'
import { pagePaths } from '@/constants/pagePaths'

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
    // Close the modal window when navigating to a page specified in pagePaths
    if (pagePaths[pathname]) {
      resetOpenModal()
    }
  }, [pathname, resetOpenModal])

  return (
    <>
      {isLoggedIn ? (
        <Link href="/profile" className="inline-flex">
          <UserBar />
        </Link>
      ) : (
        <Link href="/auth/login" className="inline-flex" onClick={toggleModal}>
          <Image src={ProfileImage} alt="auth icon" />
        </Link>
      )}
      {open && <AuthModal />}
    </>
  )
}
