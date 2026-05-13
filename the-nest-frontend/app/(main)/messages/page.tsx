'use client'

import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Conversation, Message } from '@/types/message'
import { formatDate } from '@/lib/utils'

function Avatar({ username, avatarUrl, displayName }: { username: string; avatarUrl: string | null; displayName: string }) {
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
      ) : (
        username[0].toUpperCase()
      )}
    </div>
  )
}

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeUsername, setActiveUsername] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const withUser = params.get('with')
    if (withUser) setActiveUsername(withUser)
  }, [])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/api/messages/')
      .then(({ data }) => setConversations(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeUsername) return
    api.get(`/api/messages/${activeUsername}`)
      .then(({ data }) => setMessages(data))
      .catch(() => {})
  }, [activeUsername])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 10s when a thread is open
  useEffect(() => {
    if (!activeUsername) return
    const id = setInterval(() => {
      api.get(`/api/messages/${activeUsername}`)
        .then(({ data }) => setMessages(data))
        .catch(() => {})
    }, 10000)
    return () => clearInterval(id)
  }, [activeUsername])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !activeUsername) return
    setSending(true)
    try {
      const { data } = await api.post(`/api/messages/${activeUsername}`, { content: input.trim() })
      setMessages((prev) => [...prev, data])
      setInput('')
      const isNew = !conversations.find((c) => c.other_user.username === activeUsername)
      if (isNew) {
        const { data: convos } = await api.get('/api/messages/')
        setConversations(convos)
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.other_user.username === activeUsername
              ? { ...c, latest_message: data.content, latest_at: data.created_at }
              : c
          )
        )
      }
    } catch {
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Conversation list */}
      <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 dark:text-gray-500">No conversations yet.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.other_user.username}
              onClick={() => setActiveUsername(c.other_user.username)}
              className={`flex w-full items-center gap-3 border-b border-gray-200 px-4 py-3 text-left transition-colors dark:border-gray-700 ${
                activeUsername === c.other_user.username
                  ? 'bg-amber-50 dark:bg-amber-950/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <Avatar
                username={c.other_user.username}
                avatarUrl={c.other_user.avatar_url}
                displayName={c.other_user.display_name}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {c.other_user.display_name}
                  </p>
                  {c.unread_count > 0 && (
                    <span className="ml-1 flex-shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {c.unread_count}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{c.latest_message}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        {!activeUsername ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="sticky top-0 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
              <p className="font-semibold text-gray-900 dark:text-white">@{activeUsername}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMine = m.sender_id === user?.id
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className={`mt-1 text-xs ${isMine ? 'text-amber-100' : 'text-gray-400 dark:text-gray-500'}`}>
                        {formatDate(m.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-gray-200 p-3 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Send a message…"
                  maxLength={1000}
                  className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
