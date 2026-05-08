'use client'

import { useState } from 'react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

interface ComposeBoxProps {
  onPost?: () => void
}

export default function ComposeBox({ onPost }: ComposeBoxProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const remaining = 280 - content.length
  const initial = user?.display_name?.charAt(0).toUpperCase() ?? '?'

  async function handleSubmit() {
    if (!content.trim() || loading) return
    setLoading(true)
    try {
      await api.post('/api/posts/', { content })
      setContent('')
      onPost?.()
    } catch {
      // 401s are handled by the api interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.display_name} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening at Cal State LA?"
            className="w-full resize-none border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none min-h-[80px] dark:text-white dark:placeholder:text-gray-500"
            maxLength={280}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
              {remaining}
            </span>
            <Button onClick={handleSubmit} loading={loading} disabled={!content.trim()}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
