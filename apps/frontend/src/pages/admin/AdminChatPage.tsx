import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { ChatConversationSummary, ChatMessage } from '../../types/models'
import { formatDateTime, mapApiError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'

const PAGE_SIZE = 15

const AdminChatPage = () => {
  const [rows, setRows] = useState<ChatConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')

  const selectedConversation = useMemo(
    () => rows.find((item) => item.id === selectedConversationId) ?? null,
    [rows, selectedConversationId],
  )

  const loadConversations = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.getChatConversations({ search: search.trim(), page, size: PAGE_SIZE })
      setRows(response.content)
      setTotalPages(response.totalPages)
      setSelectedConversationId((current) => {
        if (current && response.content.some((item) => item.id === current)) return current
        return response.content[0]?.id ?? null
      })
    } catch (err: unknown) {
      setError(mapApiError(err, 'Khong the tai danh sach chat'))
      setRows([])
      setTotalPages(0)
      setSelectedConversationId(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setMessagesLoading(true)
      setMessagesError('')
      try {
        const response = await adminApi.getChatMessages(selectedConversationId, { page: 0, size: 100 })
        setMessages([...response.content].sort((a, b) => a.id - b.id))
      } catch (err: unknown) {
        setMessagesError(mapApiError(err, 'Khong the tai tin nhan hoi thoai'))
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [selectedConversationId])

  return (
    <div className="space-y-5">
      <PageHeader title="Quan sat chat P2P" description="Admin chi doc de theo doi noi dung trao doi giua nguoi mua va nguoi ban." />

      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tim theo ten, username, email..."
        />
        <Button onClick={() => {
          if (page !== 0) {
            setPage(0)
            return
          }
          loadConversations()
        }}
        >
          Tim
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid min-h-[720px] gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          {loading ? <p className="p-4 text-sm text-slate-500">Dang tai hoi thoai...</p> : null}
          {!loading && rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Khong tim thay hoi thoai.</p> : null}
          <div className="max-h-[640px] overflow-y-auto">
            {rows.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={[
                  'w-full border-b border-slate-100 px-4 py-3 text-left transition dark:border-slate-800',
                  selectedConversationId === conversation.id ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                ].join(' ')}
              >
                <p className="font-medium text-slate-900 dark:text-white">{conversation.userAName} <span className="text-slate-500">-</span> {conversation.userBName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{conversation.lastMessagePreview || 'Chua co tin nhan'}</p>
                <p className="mt-1 text-xs text-slate-400">{conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : '--'}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 p-3 dark:border-slate-800">
            <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((value) => value - 1)}>
              Trang truoc
            </Button>
            <span className="text-xs text-slate-500">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= Math.max(totalPages, 1)}
              onClick={() => setPage((value) => value + 1)}
            >
              Trang sau
            </Button>
          </div>
        </aside>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            {selectedConversation ? (
              <>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedConversation.userAName} - {selectedConversation.userBName}</p>
                <p className="text-xs text-slate-500">Hoi thoai #{selectedConversation.id}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Chon hoi thoai de xem noi dung</p>
            )}
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
            {messagesError ? <p className="text-sm text-red-600">{messagesError}</p> : null}
            {messagesLoading ? <p className="text-sm text-slate-500">Dang tai tin nhan...</p> : null}
            {!messagesLoading && messages.length === 0 ? <p className="text-sm text-slate-500">Khong co tin nhan nao.</p> : null}
            {messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">{message.senderName}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(message.createdAt)}</p>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{message.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminChatPage
