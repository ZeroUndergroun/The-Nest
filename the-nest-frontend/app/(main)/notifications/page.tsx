'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import type { Notification } from '@/types/notification'
import { formatDate } from '@/lib/utils'

function notificationText(type: Notification['type']): string {
  switch (type) {
    case 'like': return 'liked your post'
    case 'repost': return 'reposted your post'
    case 'reply': return 'replied to your post'
    case 'follow': return 'followed you'
    case 'mention': return 'mentioned you'
  }
}

function Avatar({ actor }: { actor: Notification['actor'] }) {
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
      {actor.avatar_url ? (
        <img src={actor.avatar_url} alt={actor.display_name} className="h-full w-full object-cover" />
      ) : (
        actor.username[0].toUpperCase()
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/notifications/')
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false))

    api.patch('/api/notifications/read').catch(() => {})
  }, [])

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h1>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No notifications yet.</div>
      ) : (
        <div>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 border-b border-gray-200 px-4 py-3 transition-colors dark:border-gray-700 ${
                !n.is_read
                  ? 'bg-amber-50 dark:bg-amber-950/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <Link href={`/profile/${n.actor.username}`}>
                <Avatar actor={n.actor} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  <Link href={`/profile/${n.actor.username}`} className="font-semibold hover:underline">
                    {n.actor.display_name}
                  </Link>{' '}
                  {n.post_id ? (
                    <Link href={`/post/${n.post_id}`} className="hover:underline">
                      {notificationText(n.type)}
                    </Link>
                  ) : (
                    notificationText(n.type)
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{formatDate(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
