export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

let currentAuthStatus: AuthStatus = 'loading'

export function getClientAuthStatus(): AuthStatus {
  return currentAuthStatus
}

export function setClientAuthStatus(status: AuthStatus): void {
  currentAuthStatus = status
}
