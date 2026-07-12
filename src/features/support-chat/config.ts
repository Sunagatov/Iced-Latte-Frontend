import { FEATURES } from '@/shared/config/features'

export const supportChatEnabled = FEATURES.supportChat
export const supportChatTurnstileEnabled = FEATURES.supportChatTurnstile

export const SUPPORT_CHAT_MESSAGE_MAX_LENGTH = 4000
export const SUPPORT_CHAT_HISTORY_PAGE_SIZE = 30

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const supportChatAllowedEmails = (
  process.env.NEXT_PUBLIC_SUPPORT_CHAT_ALLOWED_EMAILS ?? ''
)
  .split(',')
  .map(normalizeEmail)
  .filter(Boolean)

export function isSupportChatAllowedEmail(email?: string | null): boolean {
  if (supportChatAllowedEmails.length === 0) {
    return true
  }

  if (!email) {
    return false
  }

  return supportChatAllowedEmails.includes(normalizeEmail(email))
}
