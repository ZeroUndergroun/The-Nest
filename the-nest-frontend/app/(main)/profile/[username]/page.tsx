'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import api from '@/lib/api'
import type { UserPublicProfile } from '@/types/user'
import type { Post } from '@/types/post'
import RoleBadge from '@/components/profile/RoleBadge'
import PostCard from '@/components/feed/PostCard'
import ImageLightbox from '@/components/feed/ImageLightbox'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

type Tab = 'posts' | 'replies'

interface BasicUser {
  username: string
  display_name: string
  avatar_url: string | null
  role: string
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: me } = useAuthStore()
  const [profile, setProfile] = useState<UserPublicProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [replies, setReplies] = useState<Post[]>([])
  const [tab, setTab] = useState<Tab>('posts')
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openList, setOpenList] = useState<'followers' | 'following' | null>(null)
  const [followersList, setFollowersList] = useState<BasicUser[]>([])
  const [followingList, setFollowingList] = useState<BasicUser[]>([])
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null)

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

  async function handleTabChange(newTab: Tab) {
    setTab(newTab)
    if (newTab === 'replies' && replies.length === 0) {
      try {
        const res = await api.get(`/api/users/${username}/replies`)
        setReplies(res.data)
      } catch {}
    }
  }

  async function handleFollow() {
    try {
      const { data } = await api.post(`/api/users/${username}/follow`)
      setFollowing(data.following)
      setProfile((prev) =>
        prev
          ? { ...prev, follower_count: prev.follower_count + (data.following ? 1 : -1) }
          : prev
      )
    } catch {}
  }

  async function toggleList(type: 'followers' | 'following') {
    if (openList === type) {
      setOpenList(null)
      return
    }
    setOpenList(type)
    try {
      if (type === 'followers' && followersList.length === 0) {
        const res = await api.get(`/api/users/${username}/followers`)
        setFollowersList(res.data)
      } else if (type === 'following' && followingList.length === 0) {
        const res = await api.get(`/api/users/${username}/following`)
        setFollowingList(res.data)
      }
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
  const activeList = openList === 'followers' ? followersList : followingList

  return (
    <>
    <div>
      {/* Header bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-base font-bold text-gray-900 dark:text-white">{profile.display_name}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{posts.length} posts</p>
      </div>

      {/* Banner */}
      <div className="h-32 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        {profile.banner_url && (
          <img src={profile.banner_url} alt="Profile banner" className="h-full w-full object-cover" />
        )}
      </div>

      {/* Avatar + action button row */}
      <div className="-mt-[80px] flex items-end justify-between px-4">
        <div className="flex h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-400 text-5xl font-bold text-black dark:border-gray-950">
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
        <div className="flex gap-2 pb-1">
          {isMe ? (
            <Link href="/profile/edit">
              <Button variant="secondary">Edit profile</Button>
            </Link>
          ) : (
            <>
              <Link
                href={`/messages?with=${username}`}
                className="flex items-center justify-center rounded-full border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Mail size={18} />
              </Link>
              <Button variant={following ? 'secondary' : 'primary'} onClick={handleFollow}>
                {following ? 'Following' : 'Follow'}
              </Button>
            </>
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

        {/* Follower / Following counts — clickable */}
        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <button onClick={() => toggleList('following')} className="hover:underline">
            <span className="font-semibold text-gray-900 dark:text-white">
              {profile.following_count}
            </span>{' '}
            Following
          </button>
          <button onClick={() => toggleList('followers')} className="hover:underline">
            <span className="font-semibold text-gray-900 dark:text-white">
              {profile.follower_count}
            </span>{' '}
            Followers
          </button>
        </div>

        {/* Inline followers / following list */}
        {openList && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
              <span className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {openList}
              </span>
              <button
                onClick={() => setOpenList(null)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕ Close
              </button>
            </div>
            {activeList.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400 dark:text-gray-500">
                No {openList} yet.
              </p>
            ) : (
              activeList.map((u) => (
                <Link
                  key={u.username}
                  href={`/profile/${u.username}`}
                  onClick={() => setOpenList(null)}
                  className="flex items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-bold text-black">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      u.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {u.display_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
                  </div>
                  <RoleBadge role={u.role as UserPublicProfile['role']} />
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['posts', 'replies'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div>
        {tab === 'posts' ? (
          posts.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No posts yet.
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onImageClick={setLightboxPost} />)
          )
        ) : replies.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No replies yet.
          </p>
        ) : (
          replies.map((post) => <PostCard key={post.id} post={post} onImageClick={setLightboxPost} />)
        )}
      </div>

    </div>

      {lightboxPost && (
        <ImageLightbox
          post={lightboxPost}
          onClose={() => setLightboxPost(null)}
        />
      )}
    </>
  )
}
