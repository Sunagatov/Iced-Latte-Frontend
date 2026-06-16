import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ForwardedRef } from 'react'
import SupportChatWidget from '@/features/support-chat/components/SupportChatWidget'
import { useAuthStore } from '@/features/auth/public'
import {
  createSupportChatMessage,
  getSupportChatAvailability,
  getSupportChatConversation,
  getSupportChatHistory,
} from '@/features/support-chat/api'
import { subscribeToSupportChatMessages } from '@/features/support-chat/realtime'
import type { SupportChatMessageDto } from '@/features/support-chat/api'

let mockSupportChatEnabled = true
let mockSupportChatTurnstileEnabled = false
let mockAllowedEmails: string[] = []
let mockPathname = '/'

jest.mock('@/features/support-chat/config', () => ({
  SUPPORT_CHAT_HISTORY_PAGE_SIZE: 30,
  SUPPORT_CHAT_MESSAGE_MAX_LENGTH: 4000,
  get supportChatEnabled() {
    return mockSupportChatEnabled
  },
  get supportChatTurnstileEnabled() {
    return mockSupportChatTurnstileEnabled
  },
  isSupportChatAllowedEmail: (email?: string | null) =>
    mockAllowedEmails.length === 0
      ? true
      : mockAllowedEmails.includes((email ?? '').trim().toLowerCase()),
}))

jest.mock('@/features/support-chat/api', () => ({
  SupportChatMessageDtoDeliveryStatus: {
    FAILED: 'FAILED',
    PENDING: 'PENDING',
    SENT: 'SENT',
  },
  SupportChatMessageDtoSenderType: {
    CUSTOMER: 'CUSTOMER',
    OWNER: 'OWNER',
    SYSTEM: 'SYSTEM',
  },
  SupportChatStatusDtoReason: {
    EMAIL_VERIFICATION_REQUIRED: 'EMAIL_VERIFICATION_REQUIRED',
  },
  createSupportChatMessage: jest.fn(),
  getSupportChatAvailability: jest.fn(),
  getSupportChatConversation: jest.fn(),
  getSupportChatHistory: jest.fn(),
}))

jest.mock('@/features/support-chat/realtime', () => ({
  subscribeToSupportChatMessages: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

jest.mock('@/shared/ui/TurnstileWidget', () => {
  const React = jest.requireActual('react')
  const MockTurnstileWidget = React.forwardRef(
    (
      { onVerify }: { onVerify: (token: string) => void },
      ref: ForwardedRef<{ reset: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ reset: jest.fn() }))

      return (
        <button type="button" onClick={() => onVerify('turnstile-token')}>
          Verify challenge
        </button>
      )
    },
  )

  MockTurnstileWidget.displayName = 'MockTurnstileWidget'

  return {
    __esModule: true,
    default: MockTurnstileWidget,
  }
})

const mockedGetSupportChatAvailability = jest.mocked(getSupportChatAvailability)
const mockedGetSupportChatConversation = jest.mocked(getSupportChatConversation)
const mockedGetSupportChatHistory = jest.mocked(getSupportChatHistory)
const mockedCreateSupportChatMessage = jest.mocked(createSupportChatMessage)
const mockedSubscribeToSupportChatMessages = jest.mocked(
  subscribeToSupportChatMessages,
)

function authenticate() {
  useAuthStore.setState({
    status: 'authenticated',
    isLoggedIn: true,
    userData: {
      firstName: 'Olivia',
      lastName: 'Stone',
      email: 'olivia@example.com',
      address: {},
    },
  })
}

function mockReadyChat() {
  mockedGetSupportChatAvailability.mockResolvedValue({
    enabled: true,
    eligible: true,
  })
  mockedGetSupportChatConversation.mockResolvedValue({
    id: 'conversation-1',
    createdAt: '2026-06-08T10:00:00Z',
    updatedAt: '2026-06-08T10:00:00Z',
  })
  mockedGetSupportChatHistory.mockResolvedValue({
    messages: [],
    page: 0,
    size: 30,
    totalElements: 0,
    totalPages: 0,
  })
}

function deferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })

  return { promise, resolve }
}

describe('SupportChatWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetSupportChatAvailability.mockReset()
    mockedGetSupportChatConversation.mockReset()
    mockedGetSupportChatHistory.mockReset()
    mockedCreateSupportChatMessage.mockReset()
    mockedSubscribeToSupportChatMessages.mockReset()
    mockSupportChatEnabled = true
    mockSupportChatTurnstileEnabled = false
    mockAllowedEmails = []
    mockPathname = '/'
    useAuthStore.setState({
      status: 'anonymous',
      isLoggedIn: false,
      userData: null,
    })
    mockedSubscribeToSupportChatMessages.mockReturnValue({
      disconnect: jest.fn(),
    })
  })

  it('is hidden when support chat is disabled', () => {
    mockSupportChatEnabled = false
    authenticate()

    render(<SupportChatWidget />)

    expect(
      screen.queryByRole('button', { name: 'Open support chat' }),
    ).not.toBeInTheDocument()
  })

  it('is hidden for guests', () => {
    render(<SupportChatWidget />)

    expect(
      screen.queryByRole('button', { name: 'Open support chat' }),
    ).not.toBeInTheDocument()
  })

  it('is hidden for authenticated users outside the support chat allowlist', () => {
    mockAllowedEmails = ['support@example.com']
    authenticate()

    render(<SupportChatWidget />)

    expect(
      screen.queryByRole('button', { name: 'Open support chat' }),
    ).not.toBeInTheDocument()
  })

  it('shows email verification guidance for ineligible signed-in users', async () => {
    authenticate()
    mockedGetSupportChatAvailability.mockResolvedValue({
      enabled: true,
      eligible: false,
      reason: 'EMAIL_VERIFICATION_REQUIRED',
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    expect(
      await screen.findByText(
        'Please verify your email address before using support chat.',
      ),
    ).toBeInTheDocument()
    expect(mockedGetSupportChatConversation).not.toHaveBeenCalled()
    expect(
      screen.getByRole('link', { name: 'Open email verification' }),
    ).toHaveAttribute('href', '/confirm_registration')
  })

  it('is hidden on transient auth and payment callback pages', () => {
    authenticate()
    mockPathname = '/auth/github/callback'

    const { rerender } = render(<SupportChatWidget />)

    expect(
      screen.queryByRole('button', { name: 'Open support chat' }),
    ).not.toBeInTheDocument()

    mockPathname = '/checkout/success'
    rerender(<SupportChatWidget />)

    expect(
      screen.queryByRole('button', { name: 'Open support chat' }),
    ).not.toBeInTheDocument()
  })

  it('sends a customer message through REST', async () => {
    authenticate()
    mockReadyChat()
    mockedCreateSupportChatMessage.mockResolvedValue({
      id: 'message-1',
      conversationId: 'conversation-1',
      clientMessageId: 'client-1',
      senderType: 'CUSTOMER',
      body: 'Hello support',
      deliveryStatus: 'SENT',
      createdAt: '2026-06-08T10:01:00Z',
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    const input = await screen.findByLabelText('Message')

    fireEvent.change(input, { target: { value: 'Hello support' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(mockedCreateSupportChatMessage).toHaveBeenCalledWith(
        'conversation-1',
        'Hello support',
        undefined,
        expect.any(String),
      )
    })
    expect(await screen.findByText('Hello support')).toBeInTheDocument()
    expect(await screen.findByText(/Sent/)).toBeInTheDocument()
  })

  it('ignores completed sends after the chat session is reset', async () => {
    authenticate()
    mockReadyChat()
    const pendingSend = deferred<SupportChatMessageDto>()

    mockedCreateSupportChatMessage.mockReturnValue(pendingSend.promise)

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    const input = await screen.findByLabelText('Message')

    fireEvent.change(input, { target: { value: 'Hello support' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(mockedCreateSupportChatMessage).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Hide support chat' }))

    await act(async () => {
      pendingSend.resolve({
        id: 'message-1',
        conversationId: 'conversation-1',
        clientMessageId: 'client-1',
        senderType: 'CUSTOMER',
        body: 'Hello support',
        deliveryStatus: 'SENT',
        createdAt: '2026-06-08T10:01:00Z',
      })
      await pendingSend.promise
    })

    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    const reopenedInput = await screen.findByLabelText('Message')

    expect(reopenedInput).toHaveValue('Hello support')
    expect(screen.queryByText(/Sent/)).not.toBeInTheDocument()
  })

  it('shows a Turnstile challenge after the backend requires re-verification', async () => {
    authenticate()
    mockSupportChatTurnstileEnabled = true
    mockedGetSupportChatAvailability.mockResolvedValue({
      enabled: true,
      eligible: true,
    })
    mockedGetSupportChatConversation.mockResolvedValue({
      id: 'conversation-1',
      createdAt: '2026-06-08T10:00:00Z',
      updatedAt: '2026-06-08T10:00:00Z',
    })
    mockedGetSupportChatHistory.mockResolvedValue({
      messages: [
        {
          id: 'message-1',
          conversationId: 'conversation-1',
          senderType: 'CUSTOMER',
          body: 'Previous message',
          deliveryStatus: 'SENT',
          createdAt: '2026-06-08T10:01:00Z',
        },
      ],
      page: 0,
      size: 30,
      totalElements: 1,
      totalPages: 1,
    })
    mockedCreateSupportChatMessage
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          data: {
            type: 'https://iced-latte.local/problems/support-chat-turnstile-failed',
          },
        },
      })
      .mockResolvedValueOnce({
        id: 'message-2',
        conversationId: 'conversation-1',
        clientMessageId: 'client-2',
        senderType: 'CUSTOMER',
        body: 'Retry with verification',
        deliveryStatus: 'SENT',
        createdAt: '2026-06-08T10:02:00Z',
      })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    const input = await screen.findByLabelText('Message')

    expect(screen.queryByText('Verify challenge')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Retry with verification' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Verify challenge')).toBeInTheDocument()
    expect(
      await screen.findByText('Verification failed. Please retry the challenge and send again.'),
    ).toBeInTheDocument()
    const firstClientMessageId = mockedCreateSupportChatMessage.mock.calls[0]?.[3]

    fireEvent.click(screen.getByText('Verify challenge'))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(mockedCreateSupportChatMessage).toHaveBeenLastCalledWith(
        'conversation-1',
        'Retry with verification',
        'turnstile-token',
        firstClientMessageId,
      )
    })
    expect(await screen.findByText('Retry with verification')).toBeInTheDocument()
  })

  it('keeps the draft and shows a generic error when owner-side delivery fails', async () => {
    authenticate()
    mockReadyChat()
    mockedCreateSupportChatMessage.mockResolvedValue({
      id: 'message-1',
      conversationId: 'conversation-1',
      clientMessageId: 'client-1',
      senderType: 'CUSTOMER',
      body: 'Hello support',
      deliveryStatus: 'FAILED',
      createdAt: '2026-06-08T10:01:00Z',
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    const input = await screen.findByLabelText('Message')

    fireEvent.change(input, { target: { value: 'Hello support' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Could not send. Try again.')).toBeInTheDocument()
    expect(screen.getAllByText(/Could not send/)).toHaveLength(2)
    expect(input).toHaveValue('Hello support')
  })

  it('uses a fresh client message ID when retrying after owner delivery is unavailable', async () => {
    authenticate()
    mockReadyChat()
    mockedCreateSupportChatMessage
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          data: {
            type: 'https://iced-latte.local/problems/support-chat-temporarily-unavailable',
          },
        },
      })
      .mockResolvedValueOnce({
        id: 'message-2',
        conversationId: 'conversation-1',
        clientMessageId: 'client-2',
        senderType: 'CUSTOMER',
        body: 'Please help',
        deliveryStatus: 'SENT',
        createdAt: '2026-06-08T10:02:00Z',
      })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    const input = await screen.findByLabelText('Message')

    fireEvent.change(input, { target: { value: 'Please help' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(
      await screen.findByText('Support is temporarily unavailable. Try again later.'),
    ).toBeInTheDocument()
    expect(input).toHaveValue('Please help')
    const failedClientMessageId = mockedCreateSupportChatMessage.mock.calls[0]?.[3]

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(mockedCreateSupportChatMessage).toHaveBeenCalledTimes(2)
    })
    expect(mockedCreateSupportChatMessage.mock.calls[1]?.[3]).not.toBe(
      failedClientMessageId,
    )
    expect(await screen.findByText('Please help')).toBeInTheDocument()
  })

  it('renders live owner replies from the support-chat subscription', async () => {
    authenticate()
    mockReadyChat()
    let emitMessage: ((message: SupportChatMessageDto) => void) | undefined

    mockedSubscribeToSupportChatMessages.mockImplementation((options) => {
      emitMessage = options.onMessage

      return { disconnect: jest.fn() }
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    await waitFor(() => {
      expect(mockedSubscribeToSupportChatMessages).toHaveBeenCalledWith(
        expect.objectContaining({ conversationId: 'conversation-1' }),
      )
    })

    act(() => {
      emitMessage?.({
        id: 'owner-message-1',
        conversationId: 'conversation-1',
        senderType: 'OWNER',
        body: 'How can I help?',
        deliveryStatus: 'SENT',
        createdAt: '2026-06-08T10:02:00Z',
      })
    })

    expect(await screen.findByText('How can I help?')).toBeInTheDocument()
  })

  it('refreshes history when the live subscription reconnects', async () => {
    authenticate()
    mockedGetSupportChatAvailability.mockResolvedValue({
      enabled: true,
      eligible: true,
    })
    mockedGetSupportChatConversation.mockResolvedValue({
      id: 'conversation-1',
      createdAt: '2026-06-08T10:00:00Z',
      updatedAt: '2026-06-08T10:00:00Z',
    })
    mockedGetSupportChatHistory
      .mockResolvedValueOnce({
        messages: [],
        page: 0,
        size: 30,
        totalElements: 0,
        totalPages: 0,
      })
      .mockResolvedValueOnce({
        messages: [
          {
            id: 'owner-message-1',
            conversationId: 'conversation-1',
            senderType: 'OWNER',
            body: 'Recovered owner reply',
            deliveryStatus: 'SENT',
            createdAt: '2026-06-08T10:03:00Z',
          },
        ],
        page: 0,
        size: 30,
        totalElements: 1,
        totalPages: 1,
      })
    let setConnectionState: ((connected: boolean) => void) | undefined

    mockedSubscribeToSupportChatMessages.mockImplementation((options) => {
      setConnectionState = options.onConnectionStateChange

      return { disconnect: jest.fn() }
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    await waitFor(() => {
      expect(mockedSubscribeToSupportChatMessages).toHaveBeenCalledWith(
        expect.objectContaining({ conversationId: 'conversation-1' }),
      )
    })

    act(() => {
      setConnectionState?.(true)
    })

    expect(await screen.findByText('Recovered owner reply')).toBeInTheDocument()
  })

  it('loads every support chat history page before subscribing', async () => {
    authenticate()
    mockedGetSupportChatAvailability.mockResolvedValue({
      enabled: true,
      eligible: true,
    })
    mockedGetSupportChatConversation.mockResolvedValue({
      id: 'conversation-1',
      createdAt: '2026-06-08T10:00:00Z',
      updatedAt: '2026-06-08T10:00:00Z',
    })
    mockedGetSupportChatHistory
      .mockResolvedValueOnce({
        messages: [
          {
            id: 'message-1',
            conversationId: 'conversation-1',
            senderType: 'CUSTOMER',
            body: 'First page message',
            deliveryStatus: 'SENT',
            createdAt: '2026-06-08T10:01:00Z',
          },
        ],
        page: 0,
        size: 30,
        totalElements: 2,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        messages: [
          {
            id: 'message-2',
            conversationId: 'conversation-1',
            senderType: 'OWNER',
            body: 'Second page message',
            deliveryStatus: 'SENT',
            createdAt: '2026-06-08T10:02:00Z',
          },
        ],
        page: 1,
        size: 30,
        totalElements: 2,
        totalPages: 2,
      })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    expect(await screen.findByText('First page message')).toBeInTheDocument()
    expect(await screen.findByText('Second page message')).toBeInTheDocument()
    expect(mockedGetSupportChatHistory).toHaveBeenNthCalledWith(1, 'conversation-1', 0)
    expect(mockedGetSupportChatHistory).toHaveBeenNthCalledWith(2, 'conversation-1', 1)
  })

  it('clears loaded chat state when the user becomes anonymous', async () => {
    authenticate()
    mockedGetSupportChatAvailability.mockResolvedValue({
      enabled: true,
      eligible: true,
    })
    mockedGetSupportChatConversation.mockResolvedValue({
      id: 'conversation-1',
      createdAt: '2026-06-08T10:00:00Z',
      updatedAt: '2026-06-08T10:00:00Z',
    })
    mockedGetSupportChatHistory.mockResolvedValue({
      messages: [
        {
          id: 'message-1',
          conversationId: 'conversation-1',
          senderType: 'CUSTOMER',
          body: 'Previous user message',
          deliveryStatus: 'SENT',
          createdAt: '2026-06-08T10:01:00Z',
        },
      ],
      page: 0,
      size: 30,
      totalElements: 1,
      totalPages: 1,
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    expect(await screen.findByText('Previous user message')).toBeInTheDocument()

    act(() => {
      useAuthStore.getState().setAnonymous()
    })

    expect(
      screen.queryByText('Previous user message'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open support chat' }),
    ).not.toBeInTheDocument()
  })

  it('does not reuse a stale eligible conversation after reopening', async () => {
    authenticate()
    mockedGetSupportChatAvailability
      .mockResolvedValueOnce({
        enabled: true,
        eligible: true,
      })
      .mockResolvedValueOnce({
        enabled: true,
        eligible: false,
        reason: 'EMAIL_VERIFICATION_REQUIRED',
      })
    mockedGetSupportChatConversation.mockResolvedValue({
      id: 'conversation-1',
      createdAt: '2026-06-08T10:00:00Z',
      updatedAt: '2026-06-08T10:00:00Z',
    })
    mockedGetSupportChatHistory.mockResolvedValue({
      messages: [
        {
          id: 'message-1',
          conversationId: 'conversation-1',
          senderType: 'CUSTOMER',
          body: 'Loaded before close',
          deliveryStatus: 'SENT',
          createdAt: '2026-06-08T10:01:00Z',
        },
      ],
      page: 0,
      size: 30,
      totalElements: 1,
      totalPages: 1,
    })

    render(<SupportChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    expect(await screen.findByText('Loaded before close')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedSubscribeToSupportChatMessages).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Hide support chat' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))

    expect(
      await screen.findByText(
        'Please verify your email address before using support chat.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loaded before close')).not.toBeInTheDocument()
    expect(mockedGetSupportChatConversation).toHaveBeenCalledTimes(1)
    expect(mockedSubscribeToSupportChatMessages).toHaveBeenCalledTimes(1)
  })
})
