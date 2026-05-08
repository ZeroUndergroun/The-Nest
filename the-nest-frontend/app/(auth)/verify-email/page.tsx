'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import Button from '@/components/ui/Button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    async function verify() {
      setLoading(true)
      try {
        await api.post('/api/auth/verify-email', { token })
        setStatus('success')
      } catch (err: unknown) {
        const msg =
          err instanceof Error && 'response' in err
            ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
            : undefined
        setMessage(msg ?? 'Verification failed. The link may have expired.')
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [token])

  if (token) {
    if (loading) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your email...</p>
        </div>
      )
    }
    if (status === 'success') {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 text-4xl">✓</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Email verified!
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Your account is ready. Sign in to get started.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Sign in
          </Button>
        </div>
      )
    }
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 text-4xl">✗</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Verification failed
        </h2>
        <p className="mb-6 text-sm text-red-500">{message}</p>
        <Link href="/register" className="text-sm text-amber-500 hover:underline">
          Back to register
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 text-4xl">✉</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        Check your email
      </h2>
      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        We sent a verification link to
      </p>
      {email && <p className="mb-4 text-sm font-medium text-gray-900 dark:text-white">{email}</p>}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Click the link in the email to activate your account.
      </p>
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Already verified?{' '}
        <Link href="/login" className="text-amber-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
