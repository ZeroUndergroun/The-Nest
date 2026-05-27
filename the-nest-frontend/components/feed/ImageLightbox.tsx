'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { Post } from '@/types/post'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface Reply {
  id: string
  content: string
  created_at: string
  user?: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface Props {
  post: Post
  onClose: () => void
  onLike?: (postId: string) => void
  onRepost?: (postId: string) => void
}

export default function ImageLightbox({ post, onClose, onLike, onRepost }: Props) {
  const { user: me } = useAuthStore()
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyInput, setReplyInput] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [localLikeCount, setLocalLikeCount] = useState(post.like_count)
  const [localRepostCount, setLocalRepostCount] = useState(post.repost_count)

  useEffect(() => {
    api.get(`/api/posts/${post.id}/replies`)
      .then(({ data }) => setReplies(data))
      .catch(() => {})
  }, [post.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyInput.trim()) return
    setSendingReply(true)
    try {
      const { data } = await api.post('/api/posts/', {
        content: replyInput.trim(),
        parent_post_id: post.id,
      })
      setReplies((prev) => [...prev, data])
      setReplyInput('')
    } catch {} finally {
      setSendingReply(false)
    }
  }

  function handleLike() {
    onLike?.(post.id)
    setLocalLikeCount((n) => n + 1)
  }

  function handleRepost() {
    onRepost?.(post.id)
    setLocalRepostCount((n) => n + 1)
  }

  const username = post.user?.username ?? 'unknown'
  const displayName = post.user?.display_name ?? 'Unknown'
  const initial = username.charAt(0).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex bg-black/90" onClick={onClose}>
      {/* Image panel */}
      <div className="flex flex-1 items-center justify-center p-4" onClick={onClose}>
        <img
          src={post.media_url!}
          alt="Post media"
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Right panel */}
      <div
        className="flex w-80 flex-col border-l border-gray-700 bg-gray-950 lg:w-96"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Post author header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <Link href={`/profile/${username}`} className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
              {post.user?.avatar_url ? (
                <img src={post.user.avatar_url} alt={displayName} className="h-full w-full object-cover" />
              ) : initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-gray-400">@{username}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Post content + actions */}
        <div className="border-b border-gray-700 p-4">
          <p className="text-sm text-gray-100">{post.content}</p>
          <p className="mt-2 text-xs text-gray-500">{formatDate(post.created_at)}</p>
          <div className="mt-3 flex gap-5 text-sm text-gray-400">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 transition-colors hover:text-red-500"
            >
              <span>♡</span><span>{localLikeCount}</span>
            </button>
            <button
              onClick={handleRepost}
              className="flex items-center gap-1.5 transition-colors hover:text-green-500"
            >
              <span>⟳</span><span>{localRepostCount}</span>
            </button>
            <span className="flex items-center gap-1.5">
              <span>💬</span><span>{replies.length}</span>
            </span>
          </div>
        </div>

        {/* Reply compose */}
        {me && (
          <form onSubmit={handleReply} className="border-b border-gray-700 p-3">
            <div className="flex gap-2">
              <input
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Reply…"
                maxLength={280}
                className="flex-1 rounded-full border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={!replyInput.trim() || sendingReply}
                className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </form>
        )}

        {/* Replies */}
        <div className="flex-1 overflow-y-auto">
          {replies.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-500">No replies yet.</p>
          ) : (
            replies.map((r) => (
              <div key={r.id} className="border-b border-gray-800 p-4">
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-xs font-bold text-black">
                    {r.user?.avatar_url ? (
                      <img src={r.user.avatar_url} alt={r.user.display_name} className="h-full w-full object-cover" />
                    ) : r.user?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{r.user?.display_name}</span>
                      <span className="text-xs text-gray-500">@{r.user?.username}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-300">{r.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
