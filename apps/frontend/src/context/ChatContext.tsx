/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { chatApi } from '../api/chatApi'
import { ChatSocketEvent } from '../types/models'
import { useAuth } from './AuthContext'

interface ChatContextValue {
  unreadCount: number
  lastEvent: ChatSocketEvent | null
  refreshUnreadCount: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastEvent, setLastEvent] = useState<ChatSocketEvent | null>(null)
  const subscriptionRef = useRef<StompSubscription | null>(null)
  const clientRef = useRef<Client | null>(null)

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    try {
      const data = await chatApi.getUnreadCount()
      setUnreadCount(data.unreadCount)
    } catch {
      setUnreadCount(0)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
      clientRef.current?.deactivate()
      clientRef.current = null
      setUnreadCount(0)
      setLastEvent(null)
      return
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      debug: () => {},
    })

    client.onConnect = () => {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = client.subscribe('/user/queue/chat-events', (frame: IMessage) => {
        try {
          const event = JSON.parse(frame.body) as ChatSocketEvent
          setLastEvent(event)
          if (event.type === 'CHAT_UNREAD_UPDATED' && typeof event.unreadCount === 'number') {
            setUnreadCount(event.unreadCount)
          }
        } catch {
          // ignore malformed event
        }
      })
      refreshUnreadCount()
    }

    client.onStompError = () => {
      // no-op, polling fallback is handled by explicit refresh calls in screens
    }

    client.activate()
    clientRef.current = client

    return () => {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
      client.deactivate()
      if (clientRef.current === client) {
        clientRef.current = null
      }
    }
  }, [isAuthenticated, refreshUnreadCount, user])

  const value = useMemo<ChatContextValue>(() => ({
    unreadCount,
    lastEvent,
    refreshUnreadCount,
  }), [lastEvent, refreshUnreadCount, unreadCount])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider')
  }
  return context
}
