import { Client } from '@stomp/stompjs'
import {
  subscribeToSupportChatMessages,
  supportChatMessagesDestination,
} from '@/features/support-chat/realtime'

type ClientConfig = ConstructorParameters<typeof Client>[0]

const unsubscribe = jest.fn()
const deactivate = jest.fn()
const subscribe = jest.fn(() => ({ unsubscribe }))
const activate = jest.fn()
const createdClients: ClientConfig[] = []

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation((config: ClientConfig) => {
    createdClients.push(config)

    return {
      activate,
      deactivate,
      subscribe,
    }
  }),
}))

describe('support chat realtime contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createdClients.length = 0
  })

  it('builds the backend support-chat STOMP destination', () => {
    expect(supportChatMessagesDestination('conversation-1')).toBe(
      '/topic/support-chat/conversations/conversation-1/messages',
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
