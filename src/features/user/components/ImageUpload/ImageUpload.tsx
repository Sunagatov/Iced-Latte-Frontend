'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { uploadImage, getUserData } from '@/features/user/api'
import { useErrorHandler } from '@/shared/utils/apiError'
import { useAuthStore } from '@/features/auth/store'
import Loader from '@/shared/components/Loader/Loader'
import { RiCameraLine } from 'react-icons/ri'

const ImageUpload = () => {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const { handleError } = useErrorHandler()
  const userData = useAuthStore((s) => s.userData)
  const setUserData = useAuthStore((s) => s.setUserData)
  const prevPreviewRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
    }
  }, [])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return
    setInputKey((current) => current + 1)

    if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
    const objectUrl = URL.createObjectURL(file)

    prevPreviewRef.current = objectUrl
    setPreview(objectUrl)

    try {
      setLoading(true)
      await uploadImage(file)
      const updated = await getUserData()

      setUserData(updated)
    } catch (error) {
      handleError(error)
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const src =
    preview ??
    (userData?.avatarLink && userData.avatarLink !== 'default file'
      ? userData.avatarLink
      : undefined)

  const hasAvatar =
    src && userData?.avatarLink && userData.avatarLink !== 'default file'

  return (
    <label className="group relative block h-24 w-24 cursor-pointer">
      <input
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        key={inputKey}
        aria-label="Upload profile photo"
      />
      {hasAvatar || preview ? (
        <Image
          src={src!}
          alt="Profile photo"
          fill
          className="rounded-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition group-hover:opacity-100">
        {loading ? <Loader /> : <RiCameraLine className="h-6 w-6 text-white" />}
      </div>
    </label>
  )
}

export default ImageUpload
