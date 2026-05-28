'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import api from '@/lib/api'

const TAGS = ['Announcement', 'Event', 'Deadline']

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'

export default function SubmitPetitionPage() {
  const router = useRouter()
  const [tag, setTag] = useState('Announcement')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date.trim()) {
      setError('Title and date are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/announcements/submit', {
        tag,
        title: title.trim(),
        date: date.trim(),
        description: description.trim() || null,
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submitted!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your submission is pending admin review. It'll appear on the Bulletin Board once approved.
        </p>
        <Link
          href="/feed"
          className="mt-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Back to feed
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <Link
          href="/feed"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ←
        </Link>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">Submit to Bulletin Board</h1>
      </div>

      <div className="mx-auto max-w-lg p-6">
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Have an event, announcement, or deadline the CSULA community should know about? Submit it here — an admin will review and approve it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tag picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <div className="flex gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    tag === t
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Club interest meeting — Student Union Rm 204"
              maxLength={200}
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. June 10, 2026"
              maxLength={50}
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra details — location, contact info, link, etc."
              maxLength={500}
              rows={4}
              className={inputCls + ' resize-none'}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{description.length}/500</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
