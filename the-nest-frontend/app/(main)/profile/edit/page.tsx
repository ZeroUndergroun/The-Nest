'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name)
      setBio(user.bio ?? '')
    }
  }, [user])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/api/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(data)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Avatar upload failed. Please try again.')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/api/users/me/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(data)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Banner upload failed. Please try again.')
    } finally {
      setUploadingBanner(false)
      if (bannerInputRef.current) bannerInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Display name is required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const { data } = await api.patch('/api/users/me', {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
      })
      setUser(data)
      setSuccess(true)
      setTimeout(() => router.push(`/profile/${data.username}`), 800)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ←
          </Link>
        )}
        <h1 className="text-base font-bold text-gray-900 dark:text-white">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 p-6">
        {/* Banner */}
        <div className="-mx-6 -mt-6">
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="group relative block h-32 w-full overflow-hidden bg-gray-200 dark:bg-gray-800"
          >
            {user?.banner_url && (
              <img src={user.banner_url} alt="Banner" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={24} className="text-white" />
            </div>
          </button>
          <p className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
            {uploadingBanner ? 'Uploading…' : 'Click to change banner'}
          </p>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerChange}
            className="hidden"
          />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="group relative"
          >
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-2xl font-bold text-black">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="h-full w-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={20} className="text-white" />
            </div>
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {uploadingAvatar ? 'Uploading…' : 'Click to change photo'}
          </p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          placeholder="Your name"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Tell the Cal State LA community about yourself"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
          <span className="text-right text-xs text-gray-400">{bio.length}/160</span>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">Saved! Redirecting…</p>}

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
