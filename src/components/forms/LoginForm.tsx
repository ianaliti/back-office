'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { setTokens, setCookies } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email is required'); return }
    if (!password) { setError('Password is required'); return }

    setLoading(true)
    try {
      const { accessToken, refreshToken, user } = await login(email.trim(), password)

      setTokens({ accessToken, refreshToken })
      setCookies(accessToken, user.role)

      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (user.role === 'RESTAURANT_OWNER') {
        router.push('/restaurant/dashboard')
      } else {
        setError('Access denied. Only restaurant owners and admins can log in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f0f4ec 0%, #e8f0e4 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #4E6939 0%, #6B8C4A 100%)' }}>
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold" style={{ color: '#2D4220' }}>Yummy</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7A62' }}>Back Office — sign in to continue</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: '#D4E0CB' }}>
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
              <div className="flex items-start gap-2 rounded-lg p-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: '#8A9E7A' }}>
            Restaurant owners &amp; admins only
          </p>
        </div>
      </div>
    </div>
  )
}
