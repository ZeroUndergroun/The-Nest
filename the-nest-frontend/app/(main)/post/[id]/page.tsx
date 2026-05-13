'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { Post } from '@/types/post'
import PostCard from '@/components/feed/PostCard'
import ComposeBox from '@/components/feed/ComposeBox'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [postRes, repliesRes] = await Promise.all([
        api.get(`/api/posts/${id}`),
        api.get(`/api/posts/${id}/replies`),
      ])
      setPost(postRes.data)
      setReplies(repliesRes.data)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleLike(postId: string) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/like`)
      if (post && postId === post.id) {
        setPost((p) => p ? { ...p, like_count: data.like_count } : p)
      } else {
        setReplies((prev) =>
          prev.map((r) => (r.id === postId ? { ...r, like_count: data.like_count } : r))
        )
      }
    } catch {}
  }

  async function handleRepost(postId: string) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/repost`)
      if (post && postId === post.id) {
        setPost((p) => p ? { ...p, repost_count: data.repost_count } : p)
      } else {
        setReplies((prev) =>
          prev.map((r) => (r.id === postId ? { ...r, repost_count: data.repost_count } : r))
        )
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading…</div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
        Post not found.
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ←
        </button>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">Post</h1>
      </div>

      <PostCard
        post={post}
        onLike={handleLike}
        onRepost={handleRepost}
        onDelete={() => router.back()}
      />

      <ComposeBox
        parentPostId={post.id}
        placeholder="Post your reply"
        onPost={load}
      />

      <div className="border-t border-gray-200 dark:border-gray-700">
        {replies.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No replies yet.
          </p>
        ) : (
          replies.map((reply) => (
            <PostCard key={reply.id} post={reply} onLike={handleLike} onRepost={handleRepost} />
          ))
        )}
      </div>
    </div>
  )
}
