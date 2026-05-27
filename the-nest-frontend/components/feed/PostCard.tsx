'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import type { Post } from '@/types/post'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onRepost?: (postId: string) => void
  onDelete?: (postId: string) => void
  onImageClick?: (post: Post) => void
}

function renderContent(content: string) {
  return content.split(/(#\w+)/).map((part, i) => {
    if (part.startsWith('#')) {
      return (
        <Link
          key={i}
          href={`/hashtag/${part.slice(1)}`}
          className="text-amber-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      )
    }
    return part
  })
}

export default function PostCard({ post, onLike, onRepost, onDelete, onImageClick }: PostCardProps) {
  const { user: me } = useAuthStore()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  const username = post.user?.username ?? 'unknown'
  const displayName = post.user?.display_name ?? 'Unknown User'
  const initial = username.charAt(0).toUpperCase()
  const isAuthor = !!me && me.id === post.user_id

  const [deleted, setDeleted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [localContent, setLocalContent] = useState(post.content)
  const [localEditCount, setLocalEditCount] = useState(post.edit_count)

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleDelete(e: React.MouseEvent) {
    stop(e)
    setMenuOpen(false)
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await api.delete(`/api/posts/${post.id}`)
      setDeleted(true)
      onDelete?.(post.id)
    } catch {}
  }

  async function handleSaveEdit(e: React.MouseEvent) {
    stop(e)
    if (!editContent.trim()) return
    try {
      const { data } = await api.patch(`/api/posts/${post.id}`, { content: editContent.trim() })
      setLocalContent(editContent.trim())
      setLocalEditCount(data.edit_count)
      setEditing(false)
    } catch {}
  }

  function handleCancelEdit(e: React.MouseEvent) {
    stop(e)
    setEditContent(localContent)
    setEditing(false)
  }

  if (deleted) return null

  return (
    <article
      onClick={() => !editing && !menuOpen && router.push(`/post/${post.id}`)}
      className="cursor-pointer border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
    >
      {post.reposted_by && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>⟳</span>
          <span>
            {post.reposted_by === me?.username ? 'You reposted' : `@${post.reposted_by} reposted`}
          </span>
        </div>
      )}
      <div className="flex gap-3">
        <Link href={`/profile/${username}`} onClick={stop} className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
            {post.user?.avatar_url ? (
              <img src={post.user.avatar_url} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href={`/profile/${username}`}
                onClick={stop}
                className="text-sm font-semibold text-gray-900 hover:underline dark:text-white"
              >
                {displayName}
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">@{username}</span>
              <span className="text-sm text-gray-400 dark:text-gray-600">·</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">{formatDate(post.created_at)}</span>
              {localEditCount > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-600">(edited)</span>
              )}
            </div>

            {isAuthor && (
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onClick={(e) => { stop(e); setMenuOpen((o) => !o) }}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <button
                      onClick={(e) => { stop(e); setMenuOpen(false); setEditing(true) }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div onClick={stop}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={280}
                rows={3}
                autoFocus
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="break-words whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                {renderContent(localContent)}
              </p>
              {post.media_url && post.media_type && (
                <div className="mt-2">
                  {post.media_type === 'image' ? (
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="w-full cursor-zoom-in rounded-xl object-cover max-h-96"
                      onClick={(e) => { stop(e); onImageClick?.(post) }}
                    />
                  ) : (
                    <video
                      src={post.media_url}
                      controls
                      className="w-full rounded-xl max-h-96"
                      onClick={stop}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {!editing && (
            <div className="mt-3 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={(e) => { stop(e); onLike?.(post.id) }}
                className="flex items-center gap-1.5 transition-colors hover:text-red-500"
              >
                <span>♡</span>
                <span>{post.like_count}</span>
              </button>
              <button
                onClick={(e) => { stop(e); onRepost?.(post.id) }}
                className="flex items-center gap-1.5 transition-colors hover:text-green-500"
              >
                <span>⟳</span>
                <span>{post.repost_count}</span>
              </button>
              <Link
                href={`/post/${post.id}`}
                onClick={stop}
                className="flex items-center gap-1.5 transition-colors hover:text-blue-500"
              >
                <span>💬</span>
                <span>{post.reply_count}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
