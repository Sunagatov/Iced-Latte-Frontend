'use client'
import Image from 'next/image'
import Loader from '../Loader/Loader'
import { useState, FormEvent, useEffect } from 'react'
import { uploadImage, getAvatar } from '@/services/userService'
import { AuthData } from '@/types/services/UserServices'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-toastify'
import { showError } from '@/utils/showError'

const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const { token } = useAuthStore() as AuthData
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvatar = async () => {
      setLoading(true)
      if (token) {
        const url = await getAvatar(token)

        if (url) {
          setAvatarUrl(url)
        } else {
          toast.error('Authentication failed. Token is null or undefined.')
        }
      }
    }

    fetchAvatar().catch((error) => {
      showError(error)
    }).finally(() => setLoading(false))
  }, [token])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement & { files: FileList }>,
  ) => {
    const selectedFile = e.target.files?.[0]

    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setFile(null)
      setPreview(null)
    }
  }

  const handleUpload = async (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (!file) return toast.warning('No valid image file selected.')

    try {
      setLoading(true)

      await uploadImage(file, token)

      const newAvatarUrl = await getAvatar(token)


      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl)
      }

      setFile(null)
      setPreview(null)
    } catch (error) {
      showError(error)
      setFile(null)
      setPreview(null)
    } finally { setLoading(false) }
  }

  return (
    <label className="relative mb-12 box-border flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-[#F4F5F6]">
      <input
        className="updateUserInputImage whitespace-no-wrap clip-rect-0 clip-path-inset-1/2 m-neg1 absolute h-1 w-1 overflow-hidden border-0 p-0"
        type="file"
        accept="image/*"
        id="image"
        name="image"
        onChange={handleInputChange}
        aria-label="image"
      />
      {preview ? (
        <Image
          className="h-full w-full rounded-full object-cover"
          src={preview}
          alt={`user preview`}
          width={45}
          height={61}
        />
      ) : typeof avatarUrl === 'string' && avatarUrl !== 'default file' ? (
        <Image
          className="h-full w-full rounded-full object-cover"
          src={avatarUrl}
          alt="user photo"
          width={45}
          height={61}
        />
      ) : (
        <Image
          src="/upload_photo.svg"
          alt="default user photo"
          width={45}
          height={61}
        />
      )}
      <div
        className="absolute bottom-0 right-0 flex h-[40px] w-[40px] items-center justify-center rounded-full"
        onClick={handleUpload}
        onKeyDown={handleUpload}
      >
        {loading ? (
          <Loader />
        ) : (
          <Image
            src={preview ? '/add_photo.svg' : '/edit_pen.png'}
            alt="edit pen icon"
            width={40}
            height={40}
          />
        )}
      </div>
    </label>
  )
}

export default ImageUpload
