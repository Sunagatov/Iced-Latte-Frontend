'use client'
import Image from 'next/image'
import { useState, FormEvent, useEffect } from 'react'
import { uploadImage, getAvatar } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import { AuthData } from '@/services/userService'
import { showError } from '@/utils/showError'
import { toast } from 'react-toastify'

const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const { token } = useAuthStore() as AuthData
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvatar = async () => {
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
    })
  }, [token])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement & { files: FileList }>,
  ) => {
    const selectedFile = e.target.files && e.target.files[0]

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

      setLoading(false)
      setFile(null)
      setPreview(null)
    } catch (error) {
      console.error('Error uploading image:', error)
    }
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
          width={100}
          height={100}
        />
      ) : (
        <Image
          src={
            typeof avatarUrl === 'string' && avatarUrl !== 'default file'
              ? avatarUrl
              : '/upload_photo.svg'
          }
          alt="user photo"
          width={45}
          height={61}
        />
      )}

      <div
        className="absolute bottom-0 right-0 flex h-[40px] w-[40px] items-center justify-center rounded-full"
        onClick={handleUpload}
      >
        {loading ? (
          <p>Loading...</p>
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
