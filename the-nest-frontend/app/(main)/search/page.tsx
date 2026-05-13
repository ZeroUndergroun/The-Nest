'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import api from '@/lib/api'
import RoleBadge from '@/components/profile/RoleBadge'
import type { Role } from '@/types/user'

interface SearchUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: string
  is_following: boolean
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
        setResults(data)
        const init: Record<string, boolean> = {}
        for (const u of data) init[u.username] = u.is_following
        setFollowing(init)
      } catch {
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  async function toggleFollow(username: string) {
    try {
      await api.post(`/api/users/${username}/follow`)
      setFollowing((prev) => ({ ...prev, [username]: !prev[username] }))
    } catch {}
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Search</h1>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Cal State LA users…"
            autoFocus
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      <div>
        {loading && (
          <p className="p-4 text-sm text-gray-400 dark:text-gray-500">Searching…</p>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <p className="p-4 text-sm text-gray-400 dark:text-gray-500">No users found for "{query}"</p>
        )}

        {results.map((u) => (
          <div
            key={u.username}
            className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700"
          >
            <button
              onClick={() => router.push(`/profile/${u.username}`)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.display_name} className="h-full w-full object-cover" />
                ) : (
                  u.username[0].toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {u.display_name}
                  </p>
                  <RoleBadge role={u.role as Role} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
              </div>
            </button>

            <button
              onClick={() => toggleFollow(u.username)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                following[u.username]
                  ? 'border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-500 dark:border-gray-600 dark:text-gray-300'
                  : 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
              }`}
            >
              {following[u.username] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
