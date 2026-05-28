'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, Megaphone, Pin, TrendingUp } from 'lucide-react'
import api from '@/lib/api'

const TAG_ICON: Record<string, React.ElementType> = {
  Announcement: Megaphone,
  Event: Calendar,
  Deadline: BookOpen,
}

interface Announcement {
  id: string
  tag: string
  title: string
  date: string
  description: string | null
}

interface TrendingTag {
  tag: string
  usage_count: number
}

export default function RightSidebar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [trending, setTrending] = useState<TrendingTag[]>([])

  useEffect(() => {
    api.get('/api/announcements/')
      .then(({ data }) => setAnnouncements(data))
      .catch(() => {})
    api.get('/api/hashtags/trending')
      .then(({ data }) => setTrending(data))
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-sm p-4 space-y-4">
      {/* Bulletin Board */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <Pin size={15} className="text-amber-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Bulletin Board</h2>
        </div>

        {announcements.length === 0 ? (
          <div className="px-4 py-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">No announcements yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
            {announcements.map(({ id, tag, title, date, description }) => {
              const Icon = TAG_ICON[tag] ?? Megaphone
              return (
                <div key={id} className="flex gap-3 px-4 py-3">
                  <Icon size={17} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                      {tag}
                    </span>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-gray-900 dark:text-white">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{date}</p>
                    {description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <Link
            href="/bulletin/submit"
            className="block text-center text-xs font-medium text-amber-500 hover:underline"
          >
            + Submit to Bulletin Board
          </Link>
        </div>
      </div>

      {/* Trending Hashtags */}
      {trending.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <TrendingUp size={15} className="text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Trending</h2>
          </div>

          <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
            {trending.map(({ tag, usage_count }) => (
              <Link
                key={tag}
                href={`/hashtag/${tag}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-sm font-semibold text-amber-500">#{tag}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{usage_count} posts</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-2 py-4 text-center space-y-1">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © 2026 The Nest · Cal State LA · All rights reserved
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Developed by Ryan Torrez for the CSULA community
        </p>
      </div>
    </div>
  )
}
