import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import ImageUpload from '@/features/user/components/ImageUpload'
import { getUserData, uploadImage } from '@/features/user/api'
import { useAuthStore } from '@/features/auth/public'
import type * as React from 'react'
import type { ForwardedRef } from 'react'

let mockAvatarTurnstileEnabled = false
const mockTurnstileReset = jest.fn()

jest.mock('@/features/user/api', () => ({
  getUserData: jest.fn(),
  uploadImage: jest.fn(),
}))

jest.mock('@/features/user/config', () => ({
  // noinspection JSUnusedGlobalSymbols -- the component imports this mocked getter by name.
  get avatarTurnstileEnabled() {
    return mockAvatarTurnstileEnabled
  },
}))

jest.mock('@/shared/ui/TurnstileWidget', () => {
  const React = jest.requireActual('react')
  const MockTurnstileWidget = React.forwardRef(
    (
      { onVerify }: { onVerify: (token: string) => void },
      ref: ForwardedRef<{ reset: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ reset: mockTurnstileReset }))

      return (
        <button type="button" onClick={() => onVerify('turnstile-token')}>
          Verify challenge
        </button>
      )
    },
  )

  MockTurnstileWidget.displayName = 'MockTurnstileWidget'

  return {
    __esModule: true,
    default: MockTurnstileWidget,
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    unoptimized?: boolean
  }) => {
    return <img {...props} alt={props.alt ?? ''} />
  },
}))

const mockedGetUserData = jest.mocked(getUserData)
const mockedUploadImage = jest.mocked(uploadImage)

function avatarFile() {
  return new File(['avatar'], 'avatar.png', { type: 'image/png' })
}

describe('ImageUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTurnstileReset.mockClear()
    mockAvatarTurnstileEnabled = false
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn(() => 'blob:avatar'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    })
    useAuthStore.setState({
      userData: {
        id: 'u1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      } as never,
    })
    mockedUploadImage.mockResolvedValue(undefined)
    mockedGetUserData.mockResolvedValue({
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      avatarLink: 'https://cdn.example.com/avatar.png',
    } as never)
  })

  it('uploads avatar without Turnstile token when avatar protection is disabled', async () => {
    render(<ImageUpload />)
    const file = avatarFile()

    fireEvent.change(screen.getByLabelText('Upload profile photo'), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(mockedUploadImage).toHaveBeenCalledWith(file, undefined)
    })
  })

  it('does not start another upload while one is already in progress', async () => {
    let resolveUpload: () => void

    mockedUploadImage.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpload = resolve
        }),
    )

    render(<ImageUpload />)
    const input = screen.getByLabelText('Upload profile photo')

    fireEvent.change(input, {
      target: { files: [avatarFile()] },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Upload profile photo')).toBeDisabled()
    })

    fireEvent.change(screen.getByLabelText('Upload profile photo'), {
      target: { files: [avatarFile()] },
    })

    expect(mockedUploadImage).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveUpload!()
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Upload profile photo')).not.toBeDisabled()
    })
  })

  it('renders stored avatars through the same-origin avatar image route', () => {
    useAuthStore.setState({
      userData: {
        id: 'u1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        avatarLink: 'https://storage.example.com/signed-avatar.png',
      } as never,
    })

    render(<ImageUpload />)

    expect(screen.getByAltText('Profile photo')).toHaveAttribute(
      'src',
      '/api/user/avatar?v=0',
    )
  })

  it('reports preview state while uploading and clears it after refreshing user data', async () => {
    const onPreviewChange = jest.fn()

    render(<ImageUpload onPreviewChange={onPreviewChange} />)
    const file = avatarFile()

    fireEvent.change(screen.getByLabelText('Upload profile photo'), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(mockedUploadImage).toHaveBeenCalledWith(file, undefined)
    })
    await waitFor(() => {
      expect(screen.getByAltText('Profile photo')).toHaveAttribute(
        'src',
        '/api/user/avatar?v=1',
      )
    })
    expect(onPreviewChange).toHaveBeenCalledWith(true)
    expect(onPreviewChange).toHaveBeenCalledWith(false)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:avatar')
  })

  it('shows an inline error when avatar protection is enabled and token is missing', async () => {
    mockAvatarTurnstileEnabled = true

    render(<ImageUpload />)
    const file = avatarFile()

    fireEvent.change(screen.getByLabelText('Upload profile photo'), {
      target: { files: [file] },
    })

    expect(mockedUploadImage).not.toHaveBeenCalled()
    expect(
      await screen.findByText(
        'Please complete verification before uploading your profile photo.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Verify challenge' }),
    ).toBeInTheDocument()
  })

  it('uploads avatar with Turnstile token after verification', async () => {
    mockAvatarTurnstileEnabled = true
    render(<ImageUpload />)
    const file = avatarFile()

    fireEvent.click(screen.getByRole('button', { name: 'Verify challenge' }))
    fireEvent.change(screen.getByLabelText('Upload profile photo'), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(mockedUploadImage).toHaveBeenCalledWith(file, 'turnstile-token')
    })
    expect(mockTurnstileReset).toHaveBeenCalledTimes(1)
  })
})
