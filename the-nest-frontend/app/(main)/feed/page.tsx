'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Post } from '@/types/post'
import PostCard from '@/components/feed/PostCard'
import ComposeBox from '@/components/feed/ComposeBox'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchFeed = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/posts/feed', { params: { page: pageNum } })
      if (pageNum === 1) {
        setPosts(data)
      } else {
        setPosts((prev) => [...prev, ...data])
      }
      setHasMore(data.length === 20)
    } catch {
      // 401s redirect via interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeed(1)
  }, [fetchFeed])

  async function handleLike(postId: string) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/like`)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, like_count: data.like_count } : p))
      )
    } catch {}
  }

  async function handleRepost(postId: string) {
    try {
      const { data } = await api.post(`/api/posts/${postId}/repost`)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, repost_count: data.repost_count } : p))
      )
    } catch {}
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Home</h1>
      </div>
      <ComposeBox onPost={() => fetchFeed(1)} />
      {loading && page === 1 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No posts yet. Follow some people or be the first to post!
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
                fetchFeed(next)
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
