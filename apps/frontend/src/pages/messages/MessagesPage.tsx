import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { chatApi } from '../../api/chatApi'
import { ChatConversationSummary, ChatMessage } from '../../types/models'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const CONVERSATION_PAGE_SIZE = 50
const MESSAGE_PAGE_SIZE = 80

const MessagesPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { lastEvent, refreshUnreadCount } = useChat()

  const [conversations, setConversations] = useState<ChatConversationSummary[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const contactListingId = searchParams.get('contactListingId')
  const handledContactRef = useRef<string | null>(null)

  const sortMessagesAsc = useCallback((items: ChatMessage[]) => {
    return [...items].sort((a, b) => a.id - b.id)
  }, [])

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev
      return sortMessagesAsc([...prev, message])
    })
  }, [sortMessagesAsc])

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  )

  const getCounterpartyName = useCallback((conversation: ChatConversationSummary) => {
    if (!user) return conversation.userBName
    if (conversation.userAId === user.id) return conversation.userBName
    return conversation.userAName
  }, [user])

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true)
    setConversationsError('')
    try {
      const response = await chatApi.getConversations({ page: 0, size: CONVERSATION_PAGE_SIZE })
      setConversations(response.content)
      setSelectedConversationId((current) => {
        if (current && response.content.some((item) => item.id === current)) return current
        return response.content[0]?.id ?? null
      })
    } catch (error: unknown) {
      setConversationsError(mapApiError(error, 'Khong the tai danh sach hoi thoai'))
      setConversations([])
      setSelectedConversationId(null)
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: number) => {
    setMessagesLoading(true)
    setMessagesError('')
    try {
      const response = await chatApi.getMessages(conversationId, { page: 0, size: MESSAGE_PAGE_SIZE })
      setMessages(sortMessagesAsc(response.content))
    } catch (error: unknown) {
      setMessagesError(mapApiError(error, 'Khong the tai tin nhan'))
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }, [sortMessagesAsc])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!contactListingId) {
      handledContactRef.current = null
      return
    }
    if (handledContactRef.current === contactListingId) return
    handledContactRef.current = contactListingId

    const listingId = Number(contactListingId)
    if (!Number.isInteger(listingId) || listingId <= 0) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('contactListingId')
        return next
      }, { replace: true })
      return
    }

    const bootstrapConversation = async () => {
      try {
        const conversation = await chatApi.contactListing(listingId)
        await loadConversations()
        setSelectedConversationId(conversation.id)
      } catch (error: unknown) {
        setConversationsError(mapApiError(error, 'Khong the tao hoi thoai'))
      } finally {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete('contactListingId')
          return next
        }, { replace: true })
      }
    }

    bootstrapConversation()
  }, [contactListingId, loadConversations, setSearchParams])

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }

    loadMessages(selectedConversationId)
    chatApi.markRead(selectedConversationId)
      .then(() => refreshUnreadCount())
      .catch(() => {
        // ignore
      })
  }, [loadMessages, refreshUnreadCount, selectedConversationId])

  useEffect(() => {
    if (!lastEvent) return

    if (lastEvent.type === 'CHAT_MESSAGE_CREATED' && lastEvent.message) {
      setConversations((prev) => {
        const target = prev.find((item) => item.id === lastEvent.conversationId)
        if (!target) return prev
        const next = prev.map((item) => (
          item.id === target.id
            ? {
              ...item,
              lastMessagePreview: lastEvent.message?.content,
              lastMessageAt: lastEvent.message?.createdAt,
            }
            : item
        ))
        return next.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
          return bTime - aTime
        })
      })
      if (lastEvent.conversationId === selectedConversationId) {
        upsertMessage(lastEvent.message)
      } else {
        loadConversations()
      }
    }

    if (lastEvent.type === 'CHAT_UNREAD_UPDATED') {
      loadConversations()
    }
  }, [lastEvent, loadConversations, selectedConversationId, upsertMessage])

  const handleSend = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedConversationId) return
    const content = draft.trim()
    if (!content) return

    setSending(true)
    setMessagesError('')
    try {
      const message = await chatApi.sendMessage(selectedConversationId, content)
      upsertMessage(message)
      setDraft('')
      await refreshUnreadCount()
    } catch (error: unknown) {
      setMessagesError(mapApiError(error, 'Khong the gui tin nhan'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid min-h-[720px] gap-4 xl:grid-cols-[360px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Tin nhan</h1>
          <p className="text-sm text-slate-500">Lien he nguoi ban san pham P2P</p>
        </div>

        {conversationsError ? <p className="px-4 pt-3 text-sm text-red-600">{conversationsError}</p> : null}
        {conversationsLoading ? <p className="px-4 py-6 text-sm text-slate-500">Dang tai hoi thoai...</p> : null}

        {!conversationsLoading && conversations.length === 0 ? (
          <div className="space-y-3 px-4 py-8">
            <p className="text-sm text-slate-500">Ban chua co hoi thoai nao.</p>
            <Button variant="outline" onClick={() => navigate('/products')}>Quay lai san pham</Button>
          </div>
        ) : null}

        <div className="max-h-[620px] overflow-y-auto">
          {conversations.map((conversation) => {
            const active = selectedConversationId === conversation.id
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={[
                  'w-full border-b border-slate-100 px-4 py-3 text-left transition dark:border-slate-800',
                  active ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">{getCounterpartyName(conversation)}</p>
                  {conversation.unreadCount > 0 ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{conversation.unreadCount}</span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{conversation.lastMessagePreview || 'Chua co tin nhan'}</p>
                <p className="mt-1 text-xs text-slate-400">{conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : '--'}</p>
              </button>
            )
          })}
        </div>
      </aside>

      <section className="flex min-h-[720px] flex-col rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          {selectedConversation ? (
            <>
              <p className="font-semibold text-slate-900 dark:text-white">{getCounterpartyName(selectedConversation)}</p>
              <p className="text-xs text-slate-500">Hoi thoai #{selectedConversation.id}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Chon hoi thoai de bat dau nhan tin</p>
          )}
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
          {messagesError ? <p className="text-sm text-red-600">{messagesError}</p> : null}
          {messagesLoading ? <p className="text-sm text-slate-500">Dang tai tin nhan...</p> : null}
          {!messagesLoading && messages.length === 0 ? <p className="text-sm text-slate-500">Chua co tin nhan nao.</p> : null}
          {messages.map((message) => {
            const mine = user?.id === message.senderId
            return (
              <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div className={mine
                  ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-white'
                  : 'max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'}
                >
                  {!mine ? <p className="mb-1 text-xs text-slate-500">{message.senderName}</p> : null}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={mine ? 'mt-1 text-right text-xs text-white/70' : 'mt-1 text-right text-xs text-slate-400'}>
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={selectedConversationId ? 'Nhap tin nhan...' : 'Chon hoi thoai de nhan tin'}
              disabled={!selectedConversationId || sending}
            />
            <Button type="submit" disabled={!selectedConversationId || sending || !draft.trim()}>
              {sending ? 'Dang gui...' : 'Gui'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default MessagesPage
