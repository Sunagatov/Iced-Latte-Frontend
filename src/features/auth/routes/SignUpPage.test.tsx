import { render, screen } from '@testing-library/react'
import type * as React from 'react'
import SignUpPage from '@/features/auth/routes/SignUpPage'
import { ROUTES } from '@/shared/config/routes'

jest.mock('@/features/auth/RestrictRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/features/auth/components/SocialAuthButtons', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/features/auth/components/RegistrationForm', () => ({
  __esModule: true,
  default: () => <form aria-label="registration form" />,
}))

describe('SignUpPage', () => {
  it('links the registration terms text to the terms of use route', () => {
    render(<SignUpPage />)

    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      ROUTES.termsOfUse,
    )
  })
})
