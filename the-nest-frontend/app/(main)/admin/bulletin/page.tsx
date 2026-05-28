'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Announcement {
  id: string
  tag: string
  title: string
  date: string
  description: string | null
  submitted_by: string | null
}

const TAGS = ['Announcement', 'Event', 'Deadline']

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'

export default function BulletinAdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [items, setItems] = useState<Announcement[]>([])
  const [pending, setPending] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState('Announcement')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && !user.is_admin) {
      router.replace('/feed')
      return
    }
    Promise.all([
      api.get('/api/announcements/'),
      api.get('/api/announcements/pending'),
    ])
      .then(([liveRes, pendingRes]) => {
        setItems(liveRes.data)
        setPending(pendingRes.data)
      })
      .catch(() => router.replace('/feed'))
      .finally(() => setLoading(false))
  }, [user, router])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date.trim()) {
      setError('Title and date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { data } = await api.post('/api/announcements/', {
        tag,
        title: title.trim(),
        date: date.trim(),
        description: description.trim() || null,
      })
      setItems((prev) => [data, ...prev])
      setTitle('')
      setDate('')
      setDescription('')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to create announcement.')
    } finally {
      setSaving(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const { data } = await api.post(`/api/announcements/${id}/approve`)
      setPending((prev) => prev.filter((a) => a.id !== id))
      setItems((prev) => [data, ...prev])
    } catch {}
  }

  async function handleReject(id: string) {
    if (!window.confirm('Reject and delete this submission?')) return
    try {
      await api.delete(`/api/announcements/${id}`)
      setPending((prev) => prev.filter((a) => a.id !== id))
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await api.delete(`/api/announcements/${id}`)
      setItems((prev) => prev.filter((a) => a.id !== id))
    } catch {}
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h1>
        <div className="mt-2 flex gap-2">
          <Link
            href="/admin/pending"
            className="rounded-full px-3 py-1 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Pending Approvals
          </Link>
          <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-medium text-white">
            Bulletin Board
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-lg p-6 space-y-8">

        {/* Pending petitions */}
        {!loading && pending.length > 0 && (
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              Pending Petitions
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">{pending.length}</span>
            </h2>
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">{a.tag}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">by @{a.submitted_by}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{a.date}</p>
                      {a.description && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{a.description}</p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        onClick={() => handleApprove(a.id)}
                        className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(a.id)}
                        className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create form */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">New Announcement</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    tag === t
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              maxLength={200}
              className={inputCls}
            />

            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Date (e.g. June 1, 2026)"
              maxLength={50}
              className={inputCls}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              maxLength={500}
              rows={3}
              className={inputCls + ' resize-none'}
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {saving ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Live announcements */}
        <div>
          <h2 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Live Announcements</h2>
          {loading ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No announcements yet.</p>
          ) : (
            <div className="space-y-2">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">{a.tag}</span>
                    <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.date}</p>
                    {a.description && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{a.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
