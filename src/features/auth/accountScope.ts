import { accountIdentity, useAuthStore, type AuthStore } from './store'

// Same-account token refreshes keep this key; logout and account changes do not.
export function accountScopeKey(state: AuthStore): string {
  return JSON.stringify([
    state.accountVersion,
    state.status,
    accountIdentity(state.userData),
  ])
}

export function captureAccountScope() {
  const key = accountScopeKey(useAuthStore.getState())

  return {
    key,
    isCurrent: () => key === accountScopeKey(useAuthStore.getState()),
  }
}

export function useAccountScopeKey(): string {
  return useAuthStore(accountScopeKey)
}
