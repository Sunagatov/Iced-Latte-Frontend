import { Client, type IMessage } from '@stomp/stompjs'
import { getSupportChatWebSocketTicket } from '@/features/support-chat/api'
import {
  subscribeToSupportChatMessages,
  supportChatMessagesDestination,
} from '@/features/support-chat/realtime'

type ClientConfig = ConstructorParameters<typeof Client>[0]

const unsubscribe = jest.fn()
const deactivate = jest.fn()
const subscribe = jest.fn(
  (_destination: string, _callback: (message: IMessage) => void) => ({
    unsubscribe,
  }),
)
const activate = jest.fn()
const createdClients: ClientConfig[] = []
const liveClients: Array<{ connectHeaders?: Record<string, string> }> = []

jest.mock('@/features/support-chat/api', () => {
  const actual = jest.requireActual('@/features/support-chat/api')

  return {
    ...actual,
    getSupportChatWebSocketTicket: jest.fn(),
  }
})

const mockedGetSupportChatWebSocketTicket = jest.mocked(
  getSupportChatWebSocketTicket,
)

function messageFrame(body: unknown): IMessage {
  return {
    ack: jest.fn(),
    binaryBody: new Uint8Array(),
    body: JSON.stringify(body),
    command: 'MESSAGE',
    headers: {},
    isBinaryBody: false,
    nack: jest.fn(),
  }
}

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation((config: ClientConfig) => {
    createdClients.push(config)

    const client = {
      activate,
      connectHeaders: undefined,
      deactivate,
      subscribe,
    }

    liveClients.push(client)

    return client
  }),
}))

describe('support chat realtime contract', () => {
  const originalSupportChatWsUrl =
    process.env.NEXT_PUBLIC_SUPPORT_CHAT_WS_URL

  beforeEach(() => {
    jest.clearAllMocks()
    createdClients.length = 0
    liveClients.length = 0
    mockedGetSupportChatWebSocketTicket.mockResolvedValue({ token: 'ws-ticket' })
    delete process.env.NEXT_PUBLIC_SUPPORT_CHAT_WS_URL
  })

  afterAll(() => {
    if (originalSupportChatWsUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPPORT_CHAT_WS_URL

      return
    }

    process.env.NEXT_PUBLIC_SUPPORT_CHAT_WS_URL = originalSupportChatWsUrl
  })

  it('builds the backend support-chat STOMP destination', () => {
    expect(supportChatMessagesDestination('conversation-1')).toBe(
      '/topic/support-chat/conversations/conversation-1/messages',
    )
  })

  it('defaults the WebSocket broker URL to the same-origin support-chat route', () => {
    subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onMessage: jest.fn(),
    })

    expect(createdClients[0]?.brokerURL).toBe('ws://localhost/api/v1/ws')
  })

  it('prefers the explicit support-chat WebSocket override when configured', () => {
    process.env.NEXT_PUBLIC_SUPPORT_CHAT_WS_URL =
      'wss://iced-latte.uk/api/v1/ws'

    subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onMessage: jest.fn(),
    })

    expect(createdClients[0]?.brokerURL).toBe(
      'wss://iced-latte.uk/api/v1/ws',
    )
  })

  it('subscribes to the conversation destination after STOMP connect', () => {
    const onMessage = jest.fn()
    const onConnectionStateChange = jest.fn()

    subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onConnectionStateChange,
      onMessage,
    })

    expect(activate).toHaveBeenCalledTimes(1)

    createdClients[0]?.onConnect?.({} as never)

    expect(onConnectionStateChange).toHaveBeenCalledWith(true)
    expect(subscribe).toHaveBeenCalledWith(
      '/topic/support-chat/conversations/conversation-1/messages',
      expect.any(Function),
    )
  })

  it('fetches a fresh websocket ticket before STOMP connect', async () => {
    subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onMessage: jest.fn(),
    })

    await createdClients[0]?.beforeConnect?.({} as never)

    expect(mockedGetSupportChatWebSocketTicket).toHaveBeenCalledTimes(1)
    expect(liveClients[0]?.connectHeaders).toEqual({
      Authorization: 'Bearer ws-ticket',
    })
  })

  it('ignores live messages for a different conversation', () => {
    const onMessage = jest.fn()

    subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onMessage,
    })

    createdClients[0]?.onConnect?.({} as never)
    const onFrame = subscribe.mock.calls[0]?.[1]

    onFrame?.(
      messageFrame({
        id: 'message-1',
        conversationId: 'conversation-2',
        senderType: 'OWNER',
        body: 'Wrong conversation',
        deliveryStatus: 'SENT',
        createdAt: '2026-06-08T10:02:00Z',
      }),
    )

    expect(onMessage).not.toHaveBeenCalled()
  })

  it('ignores live messages with unsupported contract enum values', () => {
    const onMessage = jest.fn()

    subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onMessage,
    })

    createdClients[0]?.onConnect?.({} as never)
    const onFrame = subscribe.mock.calls[0]?.[1]

    onFrame?.(
      messageFrame({
        id: 'message-1',
        conversationId: 'conversation-1',
        senderType: 'TELEGRAM',
        body: 'Invalid sender',
        deliveryStatus: 'SENT',
        createdAt: '2026-06-08T10:02:00Z',
      }),
    )
    onFrame?.(
      messageFrame({
        id: 'message-2',
        conversationId: 'conversation-1',
        senderType: 'OWNER',
        body: 'Invalid delivery',
        deliveryStatus: 'TELEGRAM_FAILED',
        createdAt: '2026-06-08T10:03:00Z',
      }),
    )

    expect(onMessage).not.toHaveBeenCalled()
  })

  it('does not emit reconnect state after intentional disconnect', () => {
    const onConnectionStateChange = jest.fn()

    const liveSubscription = subscribeToSupportChatMessages({
      conversationId: 'conversation-1',
      onConnectionStateChange,
      onMessage: jest.fn(),
    })

    createdClients[0]?.onConnect?.({} as never)
    liveSubscription.disconnect()
    createdClients[0]?.onWebSocketClose?.({} as never)

    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(deactivate).toHaveBeenCalledTimes(1)
    expect(onConnectionStateChange).toHaveBeenCalledTimes(1)
    expect(onConnectionStateChange).toHaveBeenCalledWith(true)
  })
})
