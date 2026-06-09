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

export type {
  SupportChatConversationDto,
  SupportChatMessageDto,
  SupportChatMessagePageDto,
  SupportChatStatusDto,
} from '@/shared/api/generated/supportChat'

export async function getSupportChatAvailability(): Promise<SupportChatStatusDto> {
  return getSupportChatStatus({ cache: false } as object)
}

export async function getSupportChatConversation(): Promise<SupportChatConversationDto> {
  return getCurrentSupportChatConversation({ cache: false } as object)
}

export async function getSupportChatHistory(
  conversationId: string,
  page = 0,
): Promise<SupportChatMessagePageDto> {
  return getSupportChatMessages(
    conversationId,
    { page, size: SUPPORT_CHAT_HISTORY_PAGE_SIZE },
    { cache: false } as object,
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
    { cache: false } as object,
  )
}
