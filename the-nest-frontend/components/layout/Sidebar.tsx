'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bird, Bell, Home, LogOut, Mail, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

const links = [
  { href: '/feed', label: 'Home', Icon: Home },
  { href: '/notifications', label: 'Notifications', Icon: Bell },
  { href: '/messages', label: 'Messages', Icon: Mail },
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
      <Link href="/feed" className="mb-6 flex items-center gap-2 px-3 text-xl font-bold text-amber-500">
        <Bird size={26} />
        The Nest
      </Link>
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === href
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
      {user && (
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <User size={20} />
          Profile
        </Link>
      )}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut size={20} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
