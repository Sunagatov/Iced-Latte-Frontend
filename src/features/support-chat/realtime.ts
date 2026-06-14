import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import type { SupportChatMessageDto } from '@/features/support-chat/api'

export const SUPPORT_CHAT_WS_PATH = '/ws'

export function supportChatMessagesDestination(conversationId: string): string {
  return `/topic/support-chat/conversations/${conversationId}/messages`
}

function supportChatWebSocketUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SUPPORT_CHAT_WS_URL?.trim()

  if (configured) return configured

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'
  const url = new URL(apiUrl, window.location.origin)

  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = `${url.pathname.replace(/\/$/, '')}${SUPPORT_CHAT_WS_PATH}`

  return url.toString()
}

function parseSupportChatMessage(frame: IMessage): SupportChatMessageDto | null {
  try {
    const data = JSON.parse(frame.body) as Partial<SupportChatMessageDto>

    if (
      typeof data.id !== 'string' ||
      typeof data.conversationId !== 'string' ||
      typeof data.senderType !== 'string' ||
      typeof data.body !== 'string' ||
      typeof data.deliveryStatus !== 'string' ||
      typeof data.createdAt !== 'string'
    ) {
      return null
    }

    return data as SupportChatMessageDto
  } catch {
    return null
  }
}

export type SupportChatLiveSubscription = {
  disconnect: () => void
}

export type SupportChatLiveSubscriptionOptions = {
  conversationId: string
  onMessage: (message: SupportChatMessageDto) => void
  onConnectionStateChange?: (connected: boolean) => void
}

export function subscribeToSupportChatMessages({
  conversationId,
  onConnectionStateChange,
  onMessage,
}: SupportChatLiveSubscriptionOptions): SupportChatLiveSubscription {
  let subscription: StompSubscription | null = null
  let closedByClient = false
  const client = new Client({
    brokerURL: supportChatWebSocketUrl(),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      if (closedByClient) return

      onConnectionStateChange?.(true)
      subscription = client.subscribe(
        supportChatMessagesDestination(conversationId),
        (frame) => {
          const message = parseSupportChatMessage(frame)

          if (message?.conversationId === conversationId) {
            onMessage(message)
          }
        },
      )
    },
    onDisconnect: () => {
      if (!closedByClient) onConnectionStateChange?.(false)
    },
    onStompError: () => {
      if (!closedByClient) onConnectionStateChange?.(false)
    },
    onWebSocketClose: () => {
      if (!closedByClient) onConnectionStateChange?.(false)
    },
  })

  client.activate()

  return {
    disconnect: () => {
      closedByClient = true
      subscription?.unsubscribe()
      void client.deactivate()
    },
  }
}
