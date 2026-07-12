import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  cancelAvatarUpload,
  createAvatarUpload,
  CreateAvatarUploadRequestContentType,
  getAvatarUpload,
  type AvatarUploadStatus,
  type AvatarUploadTargetResponse,
} from '@/shared/api/generated/user'
import type { ErrorResponse } from '@/shared/types/ErrorResponse'

const AVATAR_UPLOAD_POLL_INTERVAL_MS = 1000
const AVATAR_UPLOAD_POLL_MAX_ATTEMPTS = 20

export type AvatarUploadStage =
  | 'requesting-upload-intent'
  | 'uploading'
  | 'processing'

export type AvatarUploadOptions = {
  onStageChange?: (stage: AvatarUploadStage) => void
  onUploadProgress?: (percent: number | null) => void
  signal?: AbortSignal
}

type AvatarUploadErrorType =
  | 'avatar-upload-expired'
  | 'avatar-upload-failed'
  | 'avatar-upload-timeout'
  | 'file-upload-failed'

export async function uploadAvatarWithPresignedFlow(
  file: File,
  turnstileToken?: string,
  options?: AvatarUploadOptions,
): Promise<void> {
  assertNotAborted(options?.signal)
  options?.onStageChange?.('requesting-upload-intent')
  options?.onUploadProgress?.(null)
  const upload = await createAvatarUpload(
    {
      contentType:
        file.type as (typeof CreateAvatarUploadRequestContentType)[keyof typeof CreateAvatarUploadRequestContentType],
      sizeBytes: file.size,
      ...(turnstileToken ? { turnstileToken } : {}),
    },
    { 'Idempotency-Key': crypto.randomUUID() },
    { signal: options?.signal },
  )

  const target = upload.upload

  if (!target?.url || !target.method) {
    throw avatarUploadError(
      'file-upload-failed',
      'Avatar upload target is unavailable.',
    )
  }

  try {
    assertNotAborted(options?.signal)
    options?.onStageChange?.('uploading')
    options?.onUploadProgress?.(0)
    await uploadFileToTarget(file, target, options)
    assertNotAborted(options?.signal)
    options?.onStageChange?.('processing')
    options?.onUploadProgress?.(null)
    await waitForAvatarUploadReady(upload.uploadId, options?.signal)
  } catch (error) {
    if (isAvatarUploadAbortError(error)) {
      await cancelAvatarUploadSilently(upload.uploadId)
    }

    throw error
  }
}

export function isAvatarUploadAbortError(error: unknown): boolean {
  return (
    (error as { name?: string } | null)?.name === 'AbortError' ||
    (error as { name?: string } | null)?.name === 'CanceledError'
  )
}

async function uploadFileToTarget(
  file: File,
  target: AvatarUploadTargetResponse,
  options?: AvatarUploadOptions,
): Promise<void> {
  if (!target?.url || !target.method) {
    throw avatarUploadError(
      'file-upload-failed',
      'Avatar upload target is unavailable.',
    )
  }

  const response =
    target.method === 'POST'
      ? await uploadFileWithPost(file, target, options)
      : await uploadFileWithPut(file, target, options)

  if (response < 200 || response >= 300) {
    throw avatarUploadError(
      'file-upload-failed',
      'Avatar upload request was rejected.',
    )
  }
}

async function uploadFileWithPost(
  file: File,
  target: NonNullable<AvatarUploadTargetResponse>,
  options?: AvatarUploadOptions,
): Promise<number> {
  const formData = new FormData()

  for (const [key, value] of Object.entries(target.fields ?? {})) {
    formData.append(key, value)
  }

  formData.append('file', file)

  return uploadWithXhr(
    'POST',
    target.url!,
    formData,
    target.headers ?? {},
    options,
  )
}

async function uploadFileWithPut(
  file: File,
  target: NonNullable<AvatarUploadTargetResponse>,
  options?: AvatarUploadOptions,
): Promise<number> {
  const headers = {
    ...(target.headers ?? {}),
    ...(!target.headers?.['Content-Type'] && file.type
      ? { 'Content-Type': file.type }
      : {}),
  }

  return uploadWithXhr('PUT', target.url!, file, headers, options)
}

async function waitForAvatarUploadReady(
  uploadId: string,
  signal?: AbortSignal,
): Promise<void> {
  for (
    let attempt = 0;
    attempt < AVATAR_UPLOAD_POLL_MAX_ATTEMPTS;
    attempt += 1
  ) {
    assertNotAborted(signal)
    const status = await getAvatarUpload(uploadId, {
      cache: false,
      signal,
    } as Parameters<typeof getAvatarUpload>[1])

    if (status.status === 'READY') {
      return
    }

    if (status.status === 'FAILED') {
      throw avatarUploadError(
        'avatar-upload-failed',
        status.failureCode
          ? `Avatar processing failed with code ${status.failureCode}.`
          : 'Avatar processing failed.',
      )
    }

    if (status.status === 'EXPIRED' || status.status === 'SUPERSEDED') {
      throw avatarUploadError(
        'avatar-upload-expired',
        `Avatar upload ended with status ${status.status}.`,
      )
    }

    if (isTerminalUnexpectedStatus(status.status)) {
      throw avatarUploadError(
        'avatar-upload-failed',
        `Avatar upload ended with unexpected status ${status.status}.`,
      )
    }

    await sleep(AVATAR_UPLOAD_POLL_INTERVAL_MS, signal)
  }

  throw avatarUploadError(
    'avatar-upload-timeout',
    'Avatar upload did not complete before the polling timeout.',
  )
}

function isTerminalUnexpectedStatus(status: AvatarUploadStatus): boolean {
  return (
    status !== 'PENDING_UPLOAD' &&
    status !== 'UPLOADED' &&
    status !== 'PROCESSING'
  )
}

function avatarUploadError(
  typeSlug: AvatarUploadErrorType,
  detail: string,
  status = 503,
): AxiosError<ErrorResponse> {
  const responseData: ErrorResponse = {
    type: `https://iced-latte.local/errors/${typeSlug}`,
    title: 'File upload failed',
    status,
    detail,
  }
  const config = { headers: {} } as InternalAxiosRequestConfig

  return new AxiosError(detail, 'ERR_BAD_RESPONSE', config, undefined, {
    status,
    statusText: status === 503 ? 'Service Unavailable' : 'Bad Request',
    headers: {},
    config,
    data: responseData,
  })
}

function uploadWithXhr(
  method: 'POST' | 'PUT',
  url: string,
  body: File | FormData,
  headers: Record<string, string>,
  options?: AvatarUploadOptions,
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (options?.signal?.aborted) {
      reject(createAbortError())

      return
    }

    const xhr = new XMLHttpRequest()
    let settled = false

    xhr.open(method, url)

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return
      }

      options?.onUploadProgress?.(
        Math.min(100, Math.round((event.loaded / event.total) * 100)),
      )
    })

    xhr.onload = () => {
      settled = true
      options?.signal?.removeEventListener('abort', handleAbort)
      resolve(xhr.status)
    }

    xhr.onerror = () => {
      settled = true
      options?.signal?.removeEventListener('abort', handleAbort)
      reject(
        avatarUploadError(
          'file-upload-failed',
          'Avatar upload request failed before the file reached storage.',
        ),
      )
    }

    xhr.onabort = () => {
      settled = true
      options?.signal?.removeEventListener('abort', handleAbort)
      reject(createAbortError())
    }

    const handleAbort = () => {
      if (settled) {
        return
      }

      xhr.abort()
    }

    options?.signal?.addEventListener('abort', handleAbort, { once: true })

    xhr.send(body)
  })
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())

      return
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)

    const handleAbort = () => {
      clearTimeout(timeoutId)
      reject(createAbortError())
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw createAbortError()
  }
}

function createAbortError(): Error {
  const error = new Error('Avatar upload aborted')

  error.name = 'AbortError'

  return error
}

async function cancelAvatarUploadSilently(uploadId: string): Promise<void> {
  try {
    await cancelAvatarUpload(uploadId)
  } catch {
    // The UI should still treat this path as a user-driven abort.
  }
}
