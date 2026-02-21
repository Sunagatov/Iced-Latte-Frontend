'use client'
import Image from 'next/image'
import getImgUrl from '@/utils/getImgUrl'
import { useState } from 'react'
import { uploadImage } from '@/services/userService'
import { useErrorHandler } from '@/services/apiError/apiError'
import { useAuthStore } from '@/store/authStore'
import Loader from '../Loader/Loader'
import { RiCameraLine } from 'react-icons/ri'

const ImageUpload = () => {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(Date.now())
  const { handleError } = useErrorHandler()
  const { userData } = useAuthStore()

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setInputKey(Date.now())
    setPreview(URL.createObjectURL(file))
    try {
      setLoading(true)
      await uploadImage(file)
    } catch (error) {
      handleError(error)
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const src = preview ?? getImgUrl(userData?.avatarLink, null)
  const hasAvatar = src && userData?.avatarLink && userData.avatarLink !== 'default file'

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
