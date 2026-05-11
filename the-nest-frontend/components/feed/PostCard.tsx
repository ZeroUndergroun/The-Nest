'use client'

import Link from 'next/link'
import type { Post } from '@/types/post'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onRepost?: (postId: string) => void
}

export default function PostCard({ post, onLike, onRepost }: PostCardProps) {
  const username = post.user?.username ?? 'unknown'
  const displayName = post.user?.display_name ?? 'Unknown User'
  const initial = username.charAt(0).toUpperCase()

  return (
    <article className="border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900">
      <div className="flex gap-3">
        <Link href={`/profile/${username}`} className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
            {post.user?.avatar_url ? (
              <img
                src={post.user.avatar_url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Link
              href={`/profile/${username}`}
              className="text-sm font-semibold text-gray-900 hover:underline dark:text-white"
            >
              {displayName}
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">@{username}</span>
            <span className="text-sm text-gray-400 dark:text-gray-600">·</span>
            <span className="text-sm text-gray-400 dark:text-gray-500">{formatDate(post.created_at)}</span>
          </div>
          <p className="break-words whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
            {post.content}
          </p>
          <div className="mt-3 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => onLike?.(post.id)}
              className="flex items-center gap-1.5 transition-colors hover:text-red-500"
            >
              <span>♡</span>
              <span>{post.like_count}</span>
            </button>
            <button
              onClick={() => onRepost?.(post.id)}
              className="flex items-center gap-1.5 transition-colors hover:text-green-500"
            >
              <span>⟳</span>
              <span>{post.repost_count}</span>
            </button>
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 transition-colors hover:text-blue-500"
            >
              <span>💬</span>
              <span>{post.reply_count}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
