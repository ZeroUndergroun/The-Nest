'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import type { UserPublicProfile } from '@/types/user'
import type { Post } from '@/types/post'
import RoleBadge from '@/components/profile/RoleBadge'
import PostCard from '@/components/feed/PostCard'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: me } = useAuthStore()
  const [profile, setProfile] = useState<UserPublicProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    async function load() {
      setLoading(true)
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/api/users/${username}`),
          api.get(`/api/users/${username}/posts`),
        ])
        setProfile(profileRes.data)
        setPosts(postsRes.data)
      } catch {
        // 401s redirect via interceptor
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  async function handleFollow() {
    try {
      const { data } = await api.post(`/api/users/${username}/follow`)
      setFollowing(data.following)
    } catch {}
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">Loading...</div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
        User not found.
      </div>
    )
  }

  const initial = profile.display_name.charAt(0).toUpperCase()
  const isMe = me?.username === username

  return (
    <div>
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{profile.display_name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{posts.length} posts</p>
      </div>
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-2xl font-bold text-black">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          {!isMe && (
            <Button variant={following ? 'secondary' : 'primary'} onClick={handleFollow}>
              {following ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 dark:text-white">{profile.display_name}</h2>
            <RoleBadge role={profile.role} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{profile.bio}</p>
          )}
        </div>
      </div>
      <div>
        {posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
