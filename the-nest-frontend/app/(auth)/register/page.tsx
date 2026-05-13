'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const ROLES = [
  { value: 'current_student', label: 'Current Student' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'incoming_student', label: 'Incoming Student' },
  { value: 'staff', label: 'Staff' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    username: '',
    display_name: '',
    password: '',
    role: 'current_student',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: unknown) {
      const msg =
        err instanceof Error && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      setError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Create your account
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Cal State LA Email"
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="you@calstatela.edu"
          required
        />
        <Input
          label="Username"
          value={form.username}
          onChange={update('username')}
          placeholder="eaglefan"
          required
        />
        <Input
          label="Display Name"
          value={form.display_name}
          onChange={update('display_name')}
          placeholder="Your Name"
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={update('password')}
          placeholder="••••••••"
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <select
            value={form.role}
            onChange={update('role')}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {form.role === 'staff' && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            Staff accounts require admin approval before you can log in. You'll be able to sign in once your account is reviewed.
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-amber-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
