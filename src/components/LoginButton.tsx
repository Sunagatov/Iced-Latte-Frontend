"use client"

import { useState } from 'react';
import Button from './ui/Button';
import {LoginModal} from '@/modals/LoginModal';

export default function LoginButton() {
  const [open, setOpen] = useState(false)

  const handleOpenModal = () => {
    setOpen(true)
  }

  const handleCloseModal = () => {
    setOpen(false)
  }

  return (
    <>
      <Button onClick={handleOpenModal}>Login</Button>
      {open && <LoginModal onCloseModal={handleCloseModal} />}
    </>
  )
}