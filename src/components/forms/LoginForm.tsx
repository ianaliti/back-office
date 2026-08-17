'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { setTokens, setUser, setCookies } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { UtensilsCrossed, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)
    try {
      const response = await login(email.trim(), password)
      const { accessToken, refreshToken, user } = response.data

      setTokens({ accessToken, refreshToken })
      setUser(user)
      setCookies(accessToken, user.role)

      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (user.role === 'RESTAURANT_OWNER') {
        router.push('/restaurant/dashboard')
      } else {
        setError('Access denied. Only restaurant owners and admins can log in.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#685ED7] shadow-lg shadow-[#685ED7]/30">
            <UtensilsCrossed className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Yummy Back Office</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your restaurant</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
