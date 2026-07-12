'use client'

import { FormEvent } from 'react'
import Link from 'next/link'
import { RiChat3Line, RiCloseLine, RiSendPlane2Line } from 'react-icons/ri'
import TurnstileWidget from '@/shared/ui/TurnstileWidget'
import { SUPPORT_CHAT_MESSAGE_MAX_LENGTH } from '@/features/support-chat/config'
import { useSupportChat } from '@/features/support-chat/useSupportChat'
import {
  SupportChatMessageDtoDeliveryStatus,
  SupportChatMessageDtoSenderType,
  type SupportChatMessageDto,
} from '@/features/support-chat/api'

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function customerDeliveryLabel(
  deliveryStatus: SupportChatMessageDto['deliveryStatus'],
): string {
  if (deliveryStatus === SupportChatMessageDtoDeliveryStatus.FAILED) {
    return 'Could not send'
  }
  if (deliveryStatus === SupportChatMessageDtoDeliveryStatus.PENDING) {
    return 'Sending'
  }

  return 'Sent'
}

export default function SupportChatWidget() {
  const {
    canUseChat,
    draft,
    error,
    handleTurnstileVerify,
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
    verificationHref,
    verificationRequired,
    visible,
  } = useSupportChat()

  if (!visible) return null

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send()
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open && (
        <section
          aria-label="Support chat"
          className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-2xl"
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/8 px-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Support chat
            </h2>
            <button
              type="button"
              aria-label="Close support chat"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-black/5 hover:text-slate-900"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {liveReconnecting && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
                Reconnecting...
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {loadState === 'loading' && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Loading support chat...
                </p>
              )}

              {unavailableMessage && (
                <div className="py-6 text-center text-sm text-slate-600">
                  <p>{unavailableMessage}</p>
                  {verificationRequired && (
                    <Link
                      href={verificationHref}
                      className="mt-2 inline-flex text-sm font-medium text-brand hover:text-brand-solid-hover"
                    >
                      Open email verification
                    </Link>
                  )}
                </div>
              )}

              {loadState === 'ready' && messages.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Send a message and Iced Latte support will reply here.
                </p>
              )}

              {messages.length > 0 && (
                <ol className="space-y-3">
                  {messages.map((message) => {
                    const mine =
                      message.senderType ===
                      SupportChatMessageDtoSenderType.CUSTOMER

                    return (
                      <li
                        key={message.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-5 break-words ${
                            mine
                              ? 'bg-brand-solid text-inverted'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.body}</p>
                          <time
                            dateTime={message.createdAt}
                            className={`mt-1 block text-[11px] ${
                              mine ? 'text-white/70' : 'text-slate-500'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                            {mine &&
                              ` - ${customerDeliveryLabel(message.deliveryStatus)}`}
                          </time>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>

            <form
              onSubmit={submit}
              className="shrink-0 border-t border-black/8 p-3"
            >
              {error && (
                <p className="mb-2 text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}

              {showTurnstile && canUseChat && (
                <TurnstileWidget
                  action="support_chat"
                  ref={turnstileRef}
                  onVerify={handleTurnstileVerify}
                />
              )}

              <div className="flex items-end gap-2">
                <label className="sr-only" htmlFor="support-chat-message">
                  Message
                </label>
                <textarea
                  id="support-chat-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={SUPPORT_CHAT_MESSAGE_MAX_LENGTH}
                  disabled={!canUseChat || sending}
                  rows={2}
                  placeholder="Write a message..."
                  className="min-h-11 flex-1 resize-none rounded-lg border border-black/10 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={sendDisabled}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-solid text-inverted transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <RiSendPlane2Line className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Hide support chat' : 'Open support chat'}
        aria-expanded={open}
        className="ml-auto flex h-13 w-13 items-center justify-center rounded-full bg-brand-solid text-inverted shadow-lg transition hover:bg-brand-solid-hover active:scale-[0.98]"
      >
        {open ? (
          <RiCloseLine className="h-6 w-6" />
        ) : (
          <RiChat3Line className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}
