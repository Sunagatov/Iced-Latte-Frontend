'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { uploadImage, getUserData } from '@/features/user/api'
import { useErrorHandler } from '@/shared/utils/apiError'
import { useAuthStore } from '@/features/auth/public'
import Loader from '@/shared/ui/Loader'
import { RiCameraLine } from 'react-icons/ri'
import TurnstileWidget from '@/shared/ui/TurnstileWidget'
import { avatarTurnstileEnabled } from '@/features/user/config'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { DEFAULT_AVATAR_LINK } from '@/features/user/constants'

const AVATAR_IMAGE_ROUTE = '/api/user/avatar'

type ImageUploadProps = {
  onPreviewChange?: (hasPreview: boolean) => void
}

const ImageUpload = ({ onPreviewChange }: ImageUploadProps = {}) => {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [avatarRevision, setAvatarRevision] = useState(0)
  const [inputKey, setInputKey] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const { errorMessage, handleError } = useErrorHandler()
  const userData = useAuthStore((s) => s.userData)
  const setUserData = useAuthStore((s) => s.setUserData)
  const prevPreviewRef = useRef<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  useEffect(() => {
    return () => {
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
      onPreviewChange?.(false)
    }
  }, [onPreviewChange])

  const clearPreview = () => {
    if (prevPreviewRef.current) {
      URL.revokeObjectURL(prevPreviewRef.current)
      prevPreviewRef.current = null
    }
    setPreview(null)
    onPreviewChange?.(false)
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return

    const file = e.target.files?.[0]

    if (!file) return

    if (avatarTurnstileEnabled && !turnstileToken) {
      setTurnstileError(
        'Please complete verification before uploading your profile photo.',
      )

      return
    }

    setInputKey((current) => current + 1)

    if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
    const objectUrl = URL.createObjectURL(file)

    prevPreviewRef.current = objectUrl
    setPreview(objectUrl)
    onPreviewChange?.(true)

    try {
      setLoading(true)
      setTurnstileError('')
      await uploadImage(
        file,
        avatarTurnstileEnabled ? turnstileToken : undefined,
      )
      const updated = await getUserData()

      setUserData(updated)
      clearPreview()
      setAvatarRevision((current) => current + 1)
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } catch (error) {
      handleError(error)
      clearPreview()
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)
    setTurnstileError('')
  }

  const hasStoredAvatar = Boolean(
    userData?.avatarLink && userData.avatarLink !== DEFAULT_AVATAR_LINK,
  )
  const src =
    preview ??
    (hasStoredAvatar ? `${AVATAR_IMAGE_ROUTE}?v=${avatarRevision}` : undefined)

  return (
    <div>
      <label className="group relative block h-24 w-24 cursor-pointer">
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          disabled={loading}
          onChange={handleInputChange}
          key={inputKey}
          aria-label="Upload profile photo"
        />
        {src ? (
          <Image
            src={src!}
            alt="Profile photo"
            fill
            unoptimized
            className="rounded-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition group-hover:opacity-100">
          {loading ? (
            <Loader />
          ) : (
            <RiCameraLine className="h-6 w-6 text-white" />
          )}
        </div>
      </label>
      {avatarTurnstileEnabled && (
        <div className="w-72">
          <TurnstileWidget
            ref={turnstileRef}
            onVerify={handleTurnstileVerify}
          />
        </div>
      )}
      {(errorMessage || turnstileError) && (
        <p className="mt-1 text-center text-xs text-red-500" role="alert">
          {errorMessage || turnstileError}
        </p>
      )}
    </div>
  )
}

export default ImageUpload
