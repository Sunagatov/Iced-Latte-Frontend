'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/features/auth/public'
import {
  createSupportChatMessage,
  getSupportChatAvailability,
  getSupportChatConversation,
  getSupportChatHistory,
  SupportChatMessageDtoDeliveryStatus,
  SupportChatMessageDtoSenderType,
  SupportChatStatusDtoReason,
  type SupportChatConversationDto,
  type SupportChatMessageDto,
  type SupportChatStatusDto,
} from '@/features/support-chat/api'
import {
  SUPPORT_CHAT_MESSAGE_MAX_LENGTH,
  isSupportChatAllowedEmail,
  supportChatEnabled,
  supportChatTurnstileEnabled,
} from '@/features/support-chat/config'
import { subscribeToSupportChatMessages } from '@/features/support-chat/realtime'
import { ROUTES } from '@/shared/config/routes'
import { getUserMessage } from '@/shared/utils/errorMessages'
import type { ErrorResponse } from '@/shared/types/ErrorResponse'

type SupportChatLoadState = 'idle' | 'loading' | 'ready' | 'unavailable'

const SUPPORT_CHAT_EXCLUDED_PATH_PREFIXES = [
  ROUTES.signin,
  ROUTES.signup,
  ROUTES.confirmRegistration,
  ROUTES.resetpass,
  ROUTES.forgotpass,
  '/auth',
  '/checkout/success',
  '/checkout/cancel',
]

const SUPPORT_CHAT_TURNSTILE_RETRY_PROBLEM_SLUGS = new Set([
  'support-chat-turnstile-failed',
  'support-chat-duplicate-message',
  'support-chat-rate-limited',
])

function mergeMessages(
  current: SupportChatMessageDto[],
  incoming: SupportChatMessageDto[],
): SupportChatMessageDto[] {
  const byId = new Map<string, SupportChatMessageDto>()

  for (const message of [...current, ...incoming]) {
    byId.set(message.id, message)
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
}

function needsFirstMessageTurnstile(messages: SupportChatMessageDto[]): boolean {
  return !messages.some(
    (message) =>
      message.senderType === SupportChatMessageDtoSenderType.CUSTOMER,
  )
}

function problemSlug(error: unknown): string | undefined {
  if (!axios.isAxiosError(error) || !error.response) return undefined

  const data = (error as AxiosError<ErrorResponse>).response?.data
  const type = data?.type

  if (!type) return undefined

  try {
    const pathname = new URL(type).pathname

    return pathname.split('/').filter(Boolean).at(-1)
  } catch {
    return type.split('/').filter(Boolean).at(-1)
  }
}

function requiresTurnstileRetry(error: unknown): boolean {
  return SUPPORT_CHAT_TURNSTILE_RETRY_PROBLEM_SLUGS.has(problemSlug(error) ?? '')
}

function shouldStartNewClientMessage(error: unknown): boolean {
  return problemSlug(error) === 'support-chat-temporarily-unavailable'
}

export function useSupportChat() {
  const status = useAuthStore((state) => state.status)
  const userEmail = useAuthStore((state) => state.userData?.email)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [loadState, setLoadState] = useState<SupportChatLoadState>('idle')
  const [availability, setAvailability] = useState<SupportChatStatusDto | null>(
    null,
  )
  const [conversation, setConversation] =
    useState<SupportChatConversationDto | null>(null)
  const [messages, setMessages] = useState<SupportChatMessageDto[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [liveReconnecting, setLiveReconnecting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileRetryRequired, setTurnstileRetryRequired] = useState(false)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const clientMessageIdRef = useRef<string | null>(null)
  const reconnectingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatSessionVersionRef = useRef(0)

  const clearReconnectTimer = useCallback(() => {
    if (!reconnectingTimerRef.current) return

    clearTimeout(reconnectingTimerRef.current)
    reconnectingTimerRef.current = null
  }, [])

  const isCurrentChatSession = useCallback(
    (version: number) => chatSessionVersionRef.current === version,
    [],
  )

  const resetChatState = useCallback(
    ({ clearDraft, close }: { clearDraft: boolean; close: boolean }) => {
      chatSessionVersionRef.current += 1
      clearReconnectTimer()
      if (close) setOpen(false)
      setLoadState('idle')
      setAvailability(null)
      setConversation(null)
      setMessages([])
      if (clearDraft) setDraft('')
      setError('')
      setSending(false)
      setLiveReconnecting(false)
      setTurnstileToken('')
      setTurnstileRetryRequired(false)
      clientMessageIdRef.current = null
      turnstileRef.current?.reset()
    },
    [clearReconnectTimer],
  )

  const visible =
    supportChatEnabled &&
    status === 'authenticated' &&
    isSupportChatAllowedEmail(userEmail) &&
    !isSupportChatExcludedPath(pathname)
  const canUseChat = Boolean(
    availability?.enabled && availability.eligible && conversation,
  )
  const showTurnstile =
    supportChatTurnstileEnabled &&
    (needsFirstMessageTurnstile(messages) || turnstileRetryRequired)
  const trimmedDraft = draft.trim()
  const sendDisabled =
    sending ||
    !canUseChat ||
    trimmedDraft.length === 0 ||
    trimmedDraft.length > SUPPORT_CHAT_MESSAGE_MAX_LENGTH ||
    (showTurnstile && !turnstileToken)

  const unavailableMessage = useMemo(() => {
    if (!availability) return ''

    if (!availability.enabled) {
      return 'Support chat is temporarily unavailable. Please try again later.'
    }

    if (
      availability.reason ===
      SupportChatStatusDtoReason.EMAIL_VERIFICATION_REQUIRED
    ) {
      return 'Please verify your email address before using support chat.'
    }

    return ''
  }, [availability])

  useEffect(() => {
    if (visible) return

    resetChatState({ clearDraft: true, close: true })
  }, [resetChatState, visible])

  useEffect(() => {
    if (!visible || open) return

    resetChatState({ clearDraft: false, close: false })
  }, [open, resetChatState, visible])

  const loadAllHistory = useCallback(async (conversationId: string) => {
    const firstPage = await getSupportChatHistory(conversationId, 0)
    let nextMessages = firstPage.messages

    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const historyPage = await getSupportChatHistory(conversationId, page)

      nextMessages = [...nextMessages, ...historyPage.messages]
    }

    return nextMessages
  }, [])

  useEffect(() => {
    if (!visible || !open) {
      return
    }

    let cancelled = false

    async function load() {
      setLoadState('loading')
      setError('')
      setAvailability(null)
      setConversation(null)
      setMessages([])

      try {
        const nextAvailability = await getSupportChatAvailability()

        if (cancelled) return

        setAvailability(nextAvailability)

        if (!nextAvailability.enabled || !nextAvailability.eligible) {
          setConversation(null)
          setMessages([])
          setLoadState('unavailable')

          return
        }

        const nextConversation = await getSupportChatConversation()
        const historyMessages = await loadAllHistory(nextConversation.id)

        if (cancelled) return

        setConversation(nextConversation)
        setMessages((current) => mergeMessages(current, historyMessages))
        setLoadState('ready')
      } catch (loadError) {
        if (cancelled) return

        setAvailability(null)
        setConversation(null)
        setMessages([])
        setLoadState('unavailable')
        setError(getUserMessage(loadError))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [loadAllHistory, open, visible])

  useEffect(() => {
    if (!open || !canUseChat || !conversation) {
      return
    }

    let active = true

    const refreshHistory = async () => {
      try {
        const historyMessages = await loadAllHistory(conversation.id)

        if (!active) return

        setMessages((current) => mergeMessages(current, historyMessages))
      } catch {
        // Live reconnect recovery is best-effort; the next open/page refresh also reloads history.
      }
    }

    const subscription = subscribeToSupportChatMessages({
      conversationId: conversation.id,
      onMessage: (message) => {
        if (!active) return

        setMessages((current) => mergeMessages(current, [message]))
      },
      onConnectionStateChange: (connected) => {
        if (!active) return

        clearReconnectTimer()

        if (connected) {
          setLiveReconnecting(false)
          void refreshHistory()

          return
        }

        reconnectingTimerRef.current = setTimeout(() => {
          if (!active) return

          setLiveReconnecting(true)
        }, 1200)
      },
    })

    return () => {
      active = false
      clearReconnectTimer()
      setLiveReconnecting(false)
      subscription.disconnect()
    }
  }, [canUseChat, clearReconnectTimer, conversation, loadAllHistory, open])

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)

    if (token) setError('')
  }, [])

  const handleDraftChange = useCallback((value: string) => {
    clientMessageIdRef.current = null
    setDraft(value)
  }, [])

  const send = useCallback(async () => {
    if (!conversation || sendDisabled) return

    const chatSessionVersion = chatSessionVersionRef.current

    setSending(true)
    setError('')
    clientMessageIdRef.current ??= crypto.randomUUID()

    try {
      const message = await createSupportChatMessage(
        conversation.id,
        trimmedDraft,
        showTurnstile ? turnstileToken : undefined,
        clientMessageIdRef.current,
      )

      if (!isCurrentChatSession(chatSessionVersion)) return

      setMessages((current) => mergeMessages(current, [message]))
      if (
        message.deliveryStatus === SupportChatMessageDtoDeliveryStatus.FAILED
      ) {
        setError('Could not send. Try again.')
        setTurnstileToken('')
        clientMessageIdRef.current = null
        turnstileRef.current?.reset()

        return
      }

      setDraft('')
      setTurnstileToken('')
      setTurnstileRetryRequired(false)
      clientMessageIdRef.current = null
      turnstileRef.current?.reset()
    } catch (sendError) {
      if (!isCurrentChatSession(chatSessionVersion)) return

      setError(getUserMessage(sendError))
      if (requiresTurnstileRetry(sendError)) {
        setTurnstileRetryRequired(true)
      }
      if (shouldStartNewClientMessage(sendError)) {
        clientMessageIdRef.current = null
      }
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } finally {
      if (isCurrentChatSession(chatSessionVersion)) {
        setSending(false)
      }
    }
  }, [
    conversation,
    isCurrentChatSession,
    sendDisabled,
    showTurnstile,
    trimmedDraft,
    turnstileToken,
  ])

  return {
    canUseChat,
    draft,
    error,
    loadState,
    liveReconnecting,
    messages,
    open,
    send,
    sendDisabled,
    sending,
    setDraft: handleDraftChange,
    setOpen,
    showTurnstile,
    turnstileRef,
    unavailableMessage,
    verificationRequired:
      availability?.reason ===
      SupportChatStatusDtoReason.EMAIL_VERIFICATION_REQUIRED,
    verificationHref: ROUTES.confirmRegistration,
    visible,
    handleTurnstileVerify,
  }
}

function isSupportChatExcludedPath(pathname: string | null): boolean {
  if (!pathname) return false

  return SUPPORT_CHAT_EXCLUDED_PATH_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}
