'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Bird, Home, LogOut, Mail, ShieldCheck, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [popupOpen, setPopupOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      api.get('/api/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => {})
    }
  }, [user, setUser])

  useEffect(() => {
    api.get('/api/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (pathname === '/notifications') setUnreadCount(0)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false)
      }
    }
    if (popupOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [popupOpen])

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      document.cookie = 'session=; path=/; max-age=0'
      setUser(null)
      router.push('/login')
    }
  }

  const navLinks = [
    { href: '/feed', label: 'Home', Icon: Home },
    { href: '/messages', label: 'Messages', Icon: Mail },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="flex h-full flex-col gap-1 p-2 xl:p-4">
      {/* Logo */}
      <Link
        href="/feed"
        className="mb-6 flex items-center justify-center gap-2 p-2 text-xl font-bold text-amber-500 xl:justify-start xl:px-3"
      >
        <Bird size={28} />
        <span className="hidden xl:inline">The Nest</span>
      </Link>

      {/* Nav links */}
      {navLinks.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center justify-center gap-3 rounded-full p-3 text-sm font-medium transition-colors xl:justify-start xl:px-4 xl:py-2.5 ${
            isActive(href)
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Icon size={22} className="flex-shrink-0" />
          <span className="hidden xl:block">{label}</span>
        </Link>
      ))}

      {/* Notifications link with unread badge */}
      <Link
        href="/notifications"
        className={`relative flex items-center justify-center gap-3 rounded-full p-3 text-sm font-medium transition-colors xl:justify-start xl:px-4 xl:py-2.5 ${
          isActive('/notifications')
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
      >
        <div className="relative flex-shrink-0">
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden xl:block">Notifications</span>
      </Link>

      {/* Admin link */}
      {user?.is_admin && (
        <Link
          href="/admin/pending"
          className={`flex items-center justify-center gap-3 rounded-full p-3 text-sm font-medium transition-colors xl:justify-start xl:px-4 xl:py-2.5 ${
            pathname.startsWith('/admin')
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <ShieldCheck size={22} className="flex-shrink-0" />
          <span className="hidden xl:block">Admin</span>
        </Link>
      )}

      {/* Profile link */}
      {user && (
        <Link
          href={`/profile/${user.username}`}
          className={`flex items-center justify-center gap-3 rounded-full p-3 text-sm font-medium transition-colors xl:justify-start xl:px-4 xl:py-2.5 ${
            pathname === `/profile/${user.username}`
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <User size={22} className="flex-shrink-0" />
          <span className="hidden xl:block">Profile</span>
        </Link>
      )}

      {/* Avatar / account switcher */}
      <div className="relative mt-auto" ref={popupRef}>
        {popupOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {user?.display_name ?? '—'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                @{user?.username ?? '—'}
              </p>
            </div>
            <div className="border-t border-gray-100 p-1 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setPopupOpen((o) => !o)}
          className="flex w-full items-center justify-center gap-3 rounded-full p-2 transition-colors hover:bg-gray-100 xl:justify-start xl:px-3 dark:hover:bg-gray-800"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="hidden min-w-0 text-left xl:block">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {user?.display_name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              @{user?.username}
            </p>
          </div>
        </button>
      </div>
    </nav>
  )
}
