'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useAuthStore } from '@/features/auth/public'
import {
  createSupportChatMessage,
  getSupportChatAvailability,
  getSupportChatConversation,
  getSupportChatHistory,
  type SupportChatConversationDto,
  type SupportChatMessageDto,
  type SupportChatStatusDto,
} from '@/features/support-chat/api'
import {
  SUPPORT_CHAT_MESSAGE_MAX_LENGTH,
  supportChatEnabled,
  supportChatTurnstileEnabled,
} from '@/features/support-chat/config'
import { subscribeToSupportChatMessages } from '@/features/support-chat/realtime'
import { ROUTES } from '@/shared/config/routes'
import { getUserMessage } from '@/shared/utils/errorMessages'

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
  return !messages.some((message) => message.senderType === 'CUSTOMER')
}

export function useSupportChat() {
  const status = useAuthStore((state) => state.status)
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
  const turnstileRef = useRef<TurnstileInstance>(null)
  const reconnectingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearReconnectTimer = useCallback(() => {
    if (!reconnectingTimerRef.current) return

    clearTimeout(reconnectingTimerRef.current)
    reconnectingTimerRef.current = null
  }, [])

  const visible =
    supportChatEnabled &&
    status === 'authenticated' &&
    !isSupportChatExcludedPath(pathname)
  const canUseChat = Boolean(
    availability?.enabled && availability.eligible && conversation,
  )
  const showTurnstile =
    supportChatTurnstileEnabled && needsFirstMessageTurnstile(messages)
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

    if (availability.reason === 'EMAIL_VERIFICATION_REQUIRED') {
      return 'Please verify your email address before using support chat.'
    }

    return ''
  }, [availability])

  useEffect(() => {
    if (visible) return

    clearReconnectTimer()
    setOpen(false)
    setLoadState('idle')
    setAvailability(null)
    setConversation(null)
    setMessages([])
    setDraft('')
    setError('')
    setSending(false)
    setLiveReconnecting(false)
    setTurnstileToken('')
    turnstileRef.current?.reset()
  }, [clearReconnectTimer, visible])

  useEffect(() => {
    if (!visible || !open) {
      return
    }

    let cancelled = false

    async function load() {
      setLoadState('loading')
      setError('')

      try {
        const nextAvailability = await getSupportChatAvailability()

        if (cancelled) return

        setAvailability(nextAvailability)

        if (!nextAvailability.enabled || !nextAvailability.eligible) {
          setLoadState('unavailable')

          return
        }

        const nextConversation = await getSupportChatConversation()
        const history = await getSupportChatHistory(nextConversation.id)

        if (cancelled) return

        setConversation(nextConversation)
        setMessages((current) => mergeMessages(current, history.messages))
        setLoadState('ready')
      } catch (loadError) {
        if (cancelled) return

        setLoadState('unavailable')
        setError(getUserMessage(loadError))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, visible])

  useEffect(() => {
    if (!open || !canUseChat || !conversation) {
      return
    }

    const refreshHistory = async () => {
      try {
        const history = await getSupportChatHistory(conversation.id)

        setMessages((current) => mergeMessages(current, history.messages))
      } catch {
        // Live reconnect recovery is best-effort; the next open/page refresh also reloads history.
      }
    }

    const subscription = subscribeToSupportChatMessages({
      conversationId: conversation.id,
      onMessage: (message) => {
        setMessages((current) => mergeMessages(current, [message]))
      },
      onConnectionStateChange: (connected) => {
        clearReconnectTimer()

        if (connected) {
          setLiveReconnecting(false)
          void refreshHistory()

          return
        }

        reconnectingTimerRef.current = setTimeout(() => {
          setLiveReconnecting(true)
        }, 1200)
      },
    })

    return () => {
      clearReconnectTimer()
      setLiveReconnecting(false)
      subscription.disconnect()
    }
  }, [canUseChat, clearReconnectTimer, conversation, open])

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)

    if (token) setError('')
  }, [])

  const send = useCallback(async () => {
    if (!conversation || sendDisabled) return

    setSending(true)
    setError('')

    try {
      const message = await createSupportChatMessage(
        conversation.id,
        trimmedDraft,
        showTurnstile ? turnstileToken : undefined,
      )

      setMessages((current) => mergeMessages(current, [message]))
      if (message.deliveryStatus === 'FAILED') {
        setError('Could not send. Try again.')
        setTurnstileToken('')
        turnstileRef.current?.reset()

        return
      }

      setDraft('')
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } catch (sendError) {
      setError(getUserMessage(sendError))
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } finally {
      setSending(false)
    }
  }, [
    conversation,
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
    setDraft,
    setOpen,
    showTurnstile,
    turnstileRef,
    unavailableMessage,
    verificationRequired:
      availability?.reason === 'EMAIL_VERIFICATION_REQUIRED',
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
