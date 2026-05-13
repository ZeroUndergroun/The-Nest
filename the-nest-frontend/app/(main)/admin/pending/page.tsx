'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/user'

export default function PendingApprovalsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [pending, setPending] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !user.is_admin) {
      router.replace('/feed')
      return
    }
    api.get('/api/admin/pending')
      .then(({ data }) => setPending(data))
      .catch(() => router.replace('/feed'))
      .finally(() => setLoading(false))
  }, [user, router])

  async function handleApprove(userId: string) {
    await api.post(`/api/admin/users/${userId}/approve`)
    setPending((prev) => prev.filter((u) => u.id !== userId))
  }

  async function handleReject(userId: string) {
    await api.delete(`/api/admin/users/${userId}`)
    setPending((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading…</div>
      ) : pending.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No pending approvals.
        </div>
      ) : (
        <div>
          {pending.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-700"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black">
                {u.username[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{u.display_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{u.username} · {u.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Registered {formatDate(u.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(u.id)}
                  className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
