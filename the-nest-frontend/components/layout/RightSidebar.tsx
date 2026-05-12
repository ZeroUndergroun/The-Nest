'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, Megaphone, Pin, TrendingUp } from 'lucide-react'
import api from '@/lib/api'

const PINS = [
  {
    Icon: Megaphone,
    tag: 'Announcement',
    title: 'Spring 2026 Commencement Details Released',
    date: 'May 15, 2026',
  },
  {
    Icon: Calendar,
    tag: 'Event',
    title: 'Golden Eagle Resource Fair — Student Union',
    date: 'May 20, 2026',
  },
  {
    Icon: BookOpen,
    tag: 'Deadline',
    title: 'Fall 2026 Enrollment Opens',
    date: 'June 1, 2026',
  },
]

interface TrendingTag {
  tag: string
  usage_count: number
}

export default function RightSidebar() {
  const [trending, setTrending] = useState<TrendingTag[]>([])

  useEffect(() => {
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

        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          {PINS.map(({ Icon, tag, title, date }) => (
            <div key={title} className="flex gap-3 px-4 py-3">
              <Icon size={17} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                  {tag}
                </span>
                <p className="mt-0.5 text-sm font-medium leading-snug text-gray-900 dark:text-white">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Featured by the Cal State LA community
          </p>
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
    </div>
  )
}
