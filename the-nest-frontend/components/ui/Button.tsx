'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-amber-400 text-black hover:bg-amber-500',
    secondary:
      'border border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="mr-2 animate-spin">⟳</span>}
      {children}
    </button>
  )
}
