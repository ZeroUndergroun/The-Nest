'use client'

import { useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

interface ComposeBoxProps {
  onPost?: () => void
  parentPostId?: string
  placeholder?: string
}

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm',
])

export default function ComposeBox({ onPost, parentPostId, placeholder }: ComposeBoxProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()
  const remaining = 280 - content.length
  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_TYPES.has(file.type)) {
      setMediaError('Unsupported file type. Please attach an image (JPEG, PNG, WebP, GIF) or video (MP4, MOV, WebM).')
      setMediaFile(null)
      setMediaPreview(null)
      return
    }
    setMediaError(null)
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  function removeMedia() {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    setMediaFile(null)
    setMediaPreview(null)
    setMediaError(null)
  }

  async function handleSubmit() {
    if (!content.trim() || loading) return
    setLoading(true)
    try {
      let media_url: string | undefined
      let media_type: string | undefined

      if (mediaFile) {
        const form = new FormData()
        form.append('file', mediaFile)
        const { data } = await api.post('/api/media/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        media_url = data.url
        media_type = data.media_type
      }

      const body = { content, media_url, media_type }

      if (parentPostId) {
        await api.post(`/api/posts/${parentPostId}/reply`, body)
      } else {
        await api.post('/api/posts/', body)
      }

      setContent('')
      removeMedia()
      onPost?.()
    } catch {
      // 401s handled by the api interceptor
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
            placeholder={placeholder ?? "What's happening at Cal State LA?"}
            className="w-full resize-none border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none min-h-[80px] dark:text-white dark:placeholder:text-gray-500"
            maxLength={280}
          />

          {/* Media error */}
          {mediaError && (
            <p className="mt-2 text-xs text-red-500">{mediaError}</p>
          )}

          {/* Media preview */}
          {mediaPreview && mediaFile && (
            <div className="relative mt-2 w-fit max-w-full">
              {mediaFile.type.startsWith('image/') ? (
                <img
                  src={mediaPreview}
                  alt="Attachment preview"
                  className="max-h-64 rounded-xl object-cover"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-64 w-full rounded-xl"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-1.5 text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/30"
                title="Attach image or video"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {remaining}
              </span>
            </div>
            <Button onClick={handleSubmit} loading={loading} disabled={!content.trim() || !!mediaError}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
