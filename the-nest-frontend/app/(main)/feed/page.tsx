'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Post } from '@/types/post'
import PostCard from '@/components/feed/PostCard'
import ComposeBox from '@/components/feed/ComposeBox'

type Tab = 'latest' | 'foryou'

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>('latest')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = useCallback(async (activeTab: Tab, pageNum: number) => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'latest' ? '/api/posts/discover' : '/api/posts/feed'
      const { data } = await api.get(endpoint, { params: { page: pageNum } })
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
    setPage(1)
    setPosts([])
    fetchPosts(tab, 1)
  }, [tab, fetchPosts])

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
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <div className="flex">
          {(['latest', 'foryou'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'border-b-2 border-amber-500 text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
              }`}
            >
              {t === 'latest' ? 'Latest' : 'For You'}
            </button>
          ))}
        </div>
      </div>

      <ComposeBox onPost={() => fetchPosts(tab, 1)} />

      {loading && page === 1 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {tab === 'foryou'
            ? 'Follow some people to see their posts here.'
            : 'No posts yet. Be the first to post!'}
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
                fetchPosts(tab, next)
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
