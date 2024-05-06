'use client'

import Link from 'next/link'
import AuthModal from '@/components/Auth/Modal/AuthModalLogin/AuthModal'
import UserBar from '../UserBar/UserBar'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useStoreData } from '@/hooks/useStoreData'
import { usePathname } from 'next/navigation'
import { pagePaths } from '@/constants/pagePaths'
import Button from '@/components/UI/Buttons/Button/Button'

export default function LoginIcon() {
  const pathname = usePathname()
  const { toggleModal, resetOpenModal } = useAuthStore()

  const isLoggedIn = useStoreData(useAuthStore, (state) => state.isLoggedIn)

  const open = useStoreData(useAuthStore, (state) => state.openModal)

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
          <Button className="mx-6 px-6 text-lg"> Log in</Button>
        </Link>
      )}
      {open && <AuthModal />}
    </>
  )
}
