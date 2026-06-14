import {
  getCurrentSupportChatConversation,
  getSupportChatMessages,
  getSupportChatStatus,
  sendSupportChatMessage,
  type SupportChatConversationDto,
  type SupportChatMessageDto,
  type SupportChatMessagePageDto,
  type SupportChatStatusDto,
} from '@/shared/api/generated/supportChat'
import { SUPPORT_CHAT_HISTORY_PAGE_SIZE } from '@/features/support-chat/config'
import type { CacheRequestConfig } from 'axios-cache-interceptor'

export type {
  SupportChatConversationDto,
  SupportChatMessageDto,
  SupportChatMessagePageDto,
  SupportChatStatusDto,
} from '@/shared/api/generated/supportChat'

const noCacheRequestConfig: CacheRequestConfig = { cache: false }

export async function getSupportChatAvailability(): Promise<SupportChatStatusDto> {
  return getSupportChatStatus(noCacheRequestConfig)
}

export async function getSupportChatConversation(): Promise<SupportChatConversationDto> {
  return getCurrentSupportChatConversation(noCacheRequestConfig)
}

export async function getSupportChatHistory(
  conversationId: string,
  page = 0,
): Promise<SupportChatMessagePageDto> {
  return getSupportChatMessages(
    conversationId,
    { page, size: SUPPORT_CHAT_HISTORY_PAGE_SIZE },
    noCacheRequestConfig,
  )
}
export async function createSupportChatMessage(
  conversationId: string,
  body: string,
  turnstileToken?: string,
  clientMessageId = crypto.randomUUID(),
): Promise<SupportChatMessageDto> {
  return sendSupportChatMessage(
    conversationId,
    {
      body,
      clientMessageId,
      ...(turnstileToken ? { turnstileToken } : {}),
    },
    noCacheRequestConfig,
  )
}
