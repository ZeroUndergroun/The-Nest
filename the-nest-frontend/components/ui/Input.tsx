'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <input
        ref={ref}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

export default Input
