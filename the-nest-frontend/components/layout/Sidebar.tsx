'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

const links = [
  { href: '/feed', label: 'Home', icon: '⌂' },
  { href: '/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/messages', label: 'Messages', icon: '✉' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      router.push('/login')
    }
  }

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link href="/feed" className="mb-6 px-3 text-xl font-bold text-amber-500">
        The Nest
      </Link>
      {links.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === href
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <span>{icon}</span>
          {label}
        </Link>
      ))}
      {user && (
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span>👤</span>
          Profile
        </Link>
      )}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span>↩</span>
          Sign out
        </button>
      </div>
    </nav>
  )
}
