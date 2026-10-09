'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { setTokens, setCookies } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { Leaf, AlertCircle, CheckCircle2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError("L'adresse e-mail est requise."); return }
    if (!password) { setError('Le mot de passe est requis.'); return }

    setLoading(true)
    try {
      const { accessToken, refreshToken, user } = await login(email.trim(), password)

      setTokens({ accessToken, refreshToken })
      setCookies(accessToken, user.role)
      setUser(user)

      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (user.role === 'RESTAURANT_OWNER') {
        router.push('/restaurant/dashboard')
      } else {
        setError('Accès refusé. Seuls les restaurateurs et administrateurs peuvent se connecter.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const bullets = [
    'Gérez vos plats et allergènes en temps réel',
    'Suivez vos réservations et avis clients',
    'Obtenez votre badge cuisine inclusive',
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left column */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10"
        style={{ background: '#2D3B1F' }}
      >
        {/* Top: logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: '#4E6939' }}
          >
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">yum'nut</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: '#C8E86A', color: '#1A2E0A' }}
          >
            bo
          </span>
        </div>

        {/* Middle: headline + bullets */}
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug">
            Valorisez votre<br />cuisine inclusive
          </h2>
          <ul className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: '#C8E86A' }}
                />
                <span className="text-sm" style={{ color: '#8FA87A' }}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: decorative quote */}
        <p className="text-xs" style={{ color: '#4E6939' }}>
          "Une cuisine inclusive, c'est une cuisine qui accueille tout le monde."
        </p>
      </div>

      {/* Right column */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo (shown only on small screens) */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: '#2D3B1F' }}
            >
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#2D3B1F' }}>yum'nut</span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: '#C8E86A', color: '#1A2E0A' }}
            >
              bo
            </span>
          </div>

          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
            Connexion
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            Accédez à votre espace restaurateur
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
                style={{ color: '#111827' }}
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                autoComplete="email"
                disabled={loading}
                className="block w-full rounded-lg px-3 py-2.5 text-sm outline-none transition disabled:opacity-60"
                style={{
                  border: '1px solid #E5E0D8',
                  background: '#FAFAF9',
                  color: '#111827',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4E6939')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E0D8')}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: '#111827' }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="block w-full rounded-lg px-3 py-2.5 text-sm outline-none transition disabled:opacity-60"
                style={{
                  border: '1px solid #E5E0D8',
                  background: '#FAFAF9',
                  color: '#111827',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4E6939')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E0D8')}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 rounded-lg p-3 text-sm"
                role="alert"
                style={{ background: '#FEF2F2', color: '#B91C1C' }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
              style={{ background: '#2D3B1F', color: '#C8E86A' }}
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: '#9CA3AF' }}>
            Restaurateurs &amp; administrateurs uniquement
          </p>
        </div>
      </div>
    </div>
  )
}
