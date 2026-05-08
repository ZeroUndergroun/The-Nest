'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'

export default function EditProfilePage() {
  const { user } = useAuthStore()

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/90">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h1>
      </div>
      <div className="p-8 text-center">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Profile editing coming soon.
        </p>
        {user && (
          <Link href={`/profile/${user.username}`}>
            <Button variant="secondary">Back to profile</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
