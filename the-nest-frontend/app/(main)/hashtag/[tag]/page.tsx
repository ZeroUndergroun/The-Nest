'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { Post } from '@/types/post'
import PostCard from '@/components/feed/PostCard'

export default function HashtagPage() {
  const { tag } = useParams<{ tag: string }>()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/hashtags/${tag}`, { params: { page: pageNum } })
      if (pageNum === 1) {
        setPosts(data)
      } else {
        setPosts((prev) => [...prev, ...data])
      }
      setHasMore(data.length === 20)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [tag])

  useEffect(() => {
    setPage(1)
    setPosts([])
    fetchPosts(1)
  }, [fetchPosts])

  async function handleLike(postId: string) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/like`)
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, like_count: data.like_count } : p)))
    } catch {}
  }

  async function handleRepost(postId: string) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/repost`)
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, repost_count: data.repost_count } : p)))
    } catch {}
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
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white">#{tag}</h1>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No posts with #{tag} yet.
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onRepost={handleRepost} />
          ))}
          {hasMore && (
            <button
              onClick={() => {
                const next = page + 1
                setPage(next)
                fetchPosts(next)
              }}
              className="w-full py-4 text-sm text-amber-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  )
}
