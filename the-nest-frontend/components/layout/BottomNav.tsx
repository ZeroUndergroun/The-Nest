'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Home, Mail, Search, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const links = [
    { key: 'home', href: '/feed', Icon: Home },
    { key: 'search', href: '/search', Icon: Search },
    { key: 'messages', href: '/messages', Icon: Mail },
    { key: 'notifications', href: '/notifications', Icon: Bell },
    { key: 'profile', href: user ? `/profile/${user.username}` : '/feed', Icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950 md:hidden">
      {links.map(({ key, href, Icon }) => {
        const active = pathname === href || (href !== '/feed' && pathname.startsWith(href))
        return (
          <Link
            key={key}
            href={href}
            className={`flex flex-1 items-center justify-center py-3 transition-colors ${
              active
                ? 'text-amber-500'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Icon size={24} />
          </Link>
        )
      })}
    </nav>
  )
}
