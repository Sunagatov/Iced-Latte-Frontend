import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import AppProviders from './AppProviders'
import { useAuthStore } from '@/features/auth/store'
import { bootstrapClientSession } from '@/features/session/session'

jest.mock('@/features/session/useSessionBootstrap', () => ({
  useSessionBootstrap: jest.fn(),
}))
jest.mock('@/features/session/session', () => ({
  bootstrapClientSession: jest.fn(),
}))
jest.mock('@/features/support-chat/public', () => ({
  SupportChatWidget: () => null,
}))
jest.mock('./AuthInterceptor', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => children,
}))

it('offers retry after a startup outage and restores the page after recovery', () => {
  useAuthStore.getState().setLoading()
  useAuthStore
    .getState()
    .setBootstrapError('Could not connect. Please try again.')
  render(
    <AppProviders>
      <p>Account content</p>
    </AppProviders>,
  )
  expect(screen.getByRole('alert')).toHaveTextContent('Could not connect')
  expect(screen.queryByText('Account content')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(bootstrapClientSession).toHaveBeenCalledTimes(1)
  expect(useAuthStore.getState().bootstrapError).toBeNull()
  act(() => useAuthStore.getState().setAnonymous())
  expect(screen.getByText('Account content')).toBeInTheDocument()
})
