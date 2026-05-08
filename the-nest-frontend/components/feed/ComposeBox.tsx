'use client'

import { useState } from 'react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'

interface ComposeBoxProps {
  onPost?: () => void
}

export default function ComposeBox({ onPost }: ComposeBoxProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const remaining = 280 - content.length

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
  )
}
