'use client'

import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Search, SquarePen } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Conversation, Message } from '@/types/message'
import { formatDate } from '@/lib/utils'

interface SearchUser {
  username: string
  display_name: string
  avatar_url: string | null
}

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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [newMsgQuery, setNewMsgQuery] = useState('')
  const [newMsgResults, setNewMsgResults] = useState<SearchUser[]>([])
  const [newMsgLoading, setNewMsgLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const withUser = params.get('with')
    if (withUser) setActiveUsername(withUser)
  }, [])

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

  useEffect(() => {
    if (!activeUsername) return
    const id = setInterval(() => {
      api.get(`/api/messages/${activeUsername}`)
        .then(({ data }) => setMessages(data))
        .catch(() => {})
    }, 10000)
    return () => clearInterval(id)
  }, [activeUsername])

  useEffect(() => {
    if (!newMsgQuery.trim()) { setNewMsgResults([]); return }
    const timer = setTimeout(async () => {
      setNewMsgLoading(true)
      try {
        const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(newMsgQuery.trim())}`)
        setNewMsgResults(data)
      } catch {}
      finally { setNewMsgLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [newMsgQuery])

  function openConversation(username: string) {
    setActiveUsername(username)
    setSearchOpen(false)
    setNewMsgQuery('')
    setNewMsgResults([])
  }

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
    <div className="flex h-screen flex-col md:flex-row">
      {/* Conversation list — hidden on mobile when thread is active */}
      <div
        className={`flex-shrink-0 overflow-y-auto border-gray-200 dark:border-gray-700 md:w-64 md:border-r ${
          activeUsername ? 'hidden md:block' : 'flex flex-1 flex-col md:flex-none'
        }`}
      >
        {/* Header with compose button */}
        <div className="sticky top-0 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h1>
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className={`rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                searchOpen ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'
              }`}
              title="New message"
            >
              <SquarePen size={18} />
            </button>
          </div>

          {searchOpen && (
            <div className="mt-3">
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newMsgQuery}
                  onChange={(e) => setNewMsgQuery(e.target.value)}
                  placeholder="Search users…"
                  autoFocus
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
              {newMsgLoading && <p className="text-xs text-gray-400 dark:text-gray-500">Searching…</p>}
              {newMsgResults.map((u) => (
                <button
                  key={u.username}
                  onClick={() => openConversation(u.username)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Avatar username={u.username} avatarUrl={u.avatar_url} displayName={u.display_name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{u.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {conversations.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">No conversations yet. Use the compose button to start one.</p>
          </div>
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

      {/* Thread — hidden on mobile when no active conversation */}
      <div
        className={`flex min-w-0 flex-col md:flex-1 ${
          activeUsername ? 'flex flex-1' : 'hidden md:flex'
        }`}
      >
        {!activeUsername ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="sticky top-0 flex items-center gap-2 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
              <button
                onClick={() => setActiveUsername(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
              >
                <ArrowLeft size={20} />
              </button>
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
                  className="min-h-[44px] min-w-[44px] rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
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
