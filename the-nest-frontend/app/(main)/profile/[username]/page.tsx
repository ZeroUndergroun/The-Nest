'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
        setFollowing(profileRes.data.is_following)
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

  const initial = profile.username.charAt(0).toUpperCase()
  const isMe = me?.username === username

  return (
    <div>
      {/* Header bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-base font-bold text-gray-900 dark:text-white">{profile.display_name}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{posts.length} posts</p>
      </div>

      {/* Banner */}
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-800" />

      {/* Avatar + action button row */}
      <div className="-mt-10 flex items-end justify-between px-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-400 text-2xl font-bold text-black dark:border-gray-950">
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
        <div className="pb-1">
          {isMe ? (
            <Link href="/profile/edit">
              <Button variant="secondary">Edit profile</Button>
            </Link>
          ) : (
            <Button variant={following ? 'secondary' : 'primary'} onClick={handleFollow}>
              {following ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-amber-500">{profile.display_name}</h2>
          <RoleBadge role={profile.role} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{profile.bio}</p>
        )}
        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            <span className="font-semibold text-gray-900 dark:text-white">{profile.following_count}</span>{' '}
            Following
          </span>
          <span>
            <span className="font-semibold text-gray-900 dark:text-white">{profile.follower_count}</span>{' '}
            Followers
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        {posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
