import { redirect } from 'next/navigation'
import { getCookie, getRefreshCookie } from '@/shared/auth/cookies'
import { hasRecoverableSession } from '@/shared/auth/token'

export async function hasRecoverableServerSession(): Promise<boolean> {
  const [token, refreshToken] = await Promise.all([
    getCookie(),
    getRefreshCookie(),
  ])

  return hasRecoverableSession(token, refreshToken)
}

export async function requireRecoverableSession(nextPath: string): Promise<void> {
  if (!(await hasRecoverableServerSession())) {
    redirect(`/signin?next=${encodeURIComponent(nextPath)}`)
  }
}

export async function redirectIfAuthenticated(destination = '/'): Promise<void> {
  if (await hasRecoverableServerSession()) {
    redirect(destination)
  }
}
