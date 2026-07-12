'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import {
  getUserData,
  isAvatarUploadAbortError,
  removeUserAvatar,
  type AvatarUploadStage,
  uploadImage,
} from '@/features/user/api'
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
  const [removing, setRemoving] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [avatarRevision, setAvatarRevision] = useState(0)
  const [inputKey, setInputKey] = useState(0)
  const [uploadStage, setUploadStage] = useState<AvatarUploadStage | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const { errorMessage, handleError, clearError } = useErrorHandler()
  const userData = useAuthStore((s) => s.userData)
  const setUserData = useAuthStore((s) => s.setUserData)
  const isMountedRef = useRef(true)
  const prevPreviewRef = useRef<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const uploadAbortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      uploadAbortControllerRef.current?.abort()
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

  const setPreviewFromFile = (file: File) => {
    if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current)
    const objectUrl = URL.createObjectURL(file)

    prevPreviewRef.current = objectUrl
    setPreview(objectUrl)
    onPreviewChange?.(true)
  }

  const performUpload = async (file: File, refreshPreview: boolean) => {
    if (loading || removing) return

    if (avatarTurnstileEnabled && !turnstileToken) {
      setTurnstileError(
        'Please complete verification before uploading your profile photo.',
      )

      return
    }

    if (refreshPreview) {
      setInputKey((current) => current + 1)
      setPreviewFromFile(file)
    }

    try {
      const controller = new AbortController()

      uploadAbortControllerRef.current = controller
      setLoading(true)
      setPendingFile(file)
      setUploadStage('uploading')
      setUploadProgress(null)
      setUploadNotice(null)
      clearError()
      setTurnstileError('')
      await uploadImage(
        file,
        avatarTurnstileEnabled ? turnstileToken : undefined,
        {
          onStageChange: setUploadStage,
          onUploadProgress: setUploadProgress,
          signal: controller.signal,
        },
      )
      const updated = await getUserData()

      if (!isMountedRef.current) {
        return
      }

      setUserData(updated)
      clearPreview()
      setPendingFile(null)
      setAvatarRevision((current) => current + 1)
      setUploadStage(null)
      setUploadProgress(null)
      setUploadNotice(null)
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } catch (error) {
      if (!isMountedRef.current) {
        return
      }

      const isAbortError = isAvatarUploadAbortError(error)

      if (isAbortError) {
        clearError()
        setUploadNotice('Upload canceled.')
      } else {
        handleError(error)
      }
      setUploadStage(null)
      setUploadProgress(null)
      if (avatarTurnstileEnabled && !isAbortError) {
        setTurnstileToken('')
        turnstileRef.current?.reset()
      }
    } finally {
      if (!isMountedRef.current) {
        return
      }

      uploadAbortControllerRef.current = null
      setLoading(false)
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    await performUpload(file, true)
  }

  const handleRetry = async () => {
    if (!pendingFile || loading || removing) {
      return
    }

    await performUpload(pendingFile, false)
  }

  const handleCancelUpload = () => {
    uploadAbortControllerRef.current?.abort()
  }

  const handleRemove = async () => {
    if (loading || removing) {
      return
    }

    try {
      setRemoving(true)
      setUploadNotice(null)
      clearError()
      setTurnstileError('')
      const updated = await removeUserAvatar()

      if (!isMountedRef.current) {
        return
      }

      setUserData(updated)
      clearPreview()
      setPendingFile(null)
      setAvatarRevision((current) => current + 1)
      setUploadStage(null)
      setUploadProgress(null)
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } catch (error) {
      if (!isMountedRef.current) {
        return
      }

      handleError(error)
    } finally {
      if (!isMountedRef.current) {
        return
      }

      setRemoving(false)
    }
  }

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)
    setTurnstileError('')
  }

  const hasStoredAvatar = Boolean(
    userData?.avatarLink && userData.avatarLink !== DEFAULT_AVATAR_LINK,
  )
  const isBusy = loading || removing
  const src =
    preview ??
    (hasStoredAvatar ? `${AVATAR_IMAGE_ROUTE}?v=${avatarRevision}` : undefined)
  const uploadStatusMessage = loading ? stageMessage(uploadStage) : null
  const canRetry = Boolean(pendingFile && !isBusy)
  const canRemove = Boolean(hasStoredAvatar && !preview && !isBusy)

  return (
    <div>
      <label className="group relative block h-24 w-24 cursor-pointer">
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          disabled={isBusy}
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
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
        {loading && pendingFile && (
          <button
            type="button"
            onClick={handleCancelUpload}
            className="font-medium text-neutral-700 underline underline-offset-2"
          >
            Cancel upload
          </button>
        )}
        {canRetry && (
          <button
            type="button"
            onClick={() => {
              void handleRetry()
            }}
            className="font-medium text-neutral-700 underline underline-offset-2"
          >
            Retry upload
          </button>
        )}
        {canRemove && (
          <button
            type="button"
            onClick={() => {
              void handleRemove()
            }}
            className="font-medium text-neutral-700 underline underline-offset-2"
          >
            Remove photo
          </button>
        )}
      </div>
      {avatarTurnstileEnabled && (
        <div className="w-72">
          <TurnstileWidget
            action="avatar"
            ref={turnstileRef}
            onVerify={handleTurnstileVerify}
          />
        </div>
      )}
      {uploadStatusMessage && !errorMessage && !turnstileError && (
        <div className="mt-2 w-40">
          <p
            className="text-center text-xs text-neutral-500"
            role="status"
            aria-live="polite"
          >
            {uploadStatusMessage}
          </p>
          {uploadProgress !== null && (
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-label="Avatar upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadProgress}
            >
              <div
                className="h-full rounded-full bg-red transition-[width]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
      {uploadNotice && !errorMessage && !turnstileError && !uploadStatusMessage && (
        <p
          className="mt-1 text-center text-xs text-neutral-500"
          role="status"
          aria-live="polite"
        >
          {uploadNotice}
        </p>
      )}
      {(errorMessage || turnstileError) && (
        <div className="mt-1 flex flex-col items-center gap-2">
          <p className="text-center text-xs text-red-500" role="alert">
            {errorMessage || turnstileError}
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload

function stageMessage(stage: AvatarUploadStage | null): string {
  switch (stage) {
  case 'requesting-upload-intent':
    return 'Preparing secure upload...'
  case 'processing':
    return 'Processing profile photo...'
  case 'uploading':
  default:
    return 'Uploading profile photo...'
  }
}
