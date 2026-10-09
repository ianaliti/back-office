'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Bell, Shield, User } from 'lucide-react'

function Section({ title, icon, children }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl bg-white p-6"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-5">
        <span style={{ color: '#4E6939' }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #F9F7F4' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: '#111827' }}>{label}</p>
        {description && (
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 rounded-full transition-colors shrink-0"
        style={{ background: checked ? '#4E6939' : '#D1D5DB' }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
          style={{ left: checked ? '18px' : '2px' }}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifReservations, setNotifReservations] = useState(true)
  const [notifReviews, setNotifReviews] = useState(true)
  const [notifMarketing, setNotifMarketing] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Account */}
      <Section title="Mon compte" icon={<User className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Adresse e-mail
            </label>
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: '#F9F8F5', color: '#111827', border: '1px solid #E5E0D8' }}
            >
              {user?.email ?? '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Rôle
            </label>
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: '#F9F8F5', color: '#6B7280', border: '1px solid #E5E0D8' }}
            >
              {user?.role === 'RESTAURANT_OWNER' ? 'Propriétaire de restaurant' : user?.role ?? '—'}
            </div>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell className="h-4 w-4" />}>
        <div>
          <Toggle
            label="Nouvelles réservations"
            description="Recevez un e-mail pour chaque nouvelle réservation."
            checked={notifReservations}
            onChange={setNotifReservations}
          />
          <Toggle
            label="Nouveaux avis"
            description="Soyez notifié quand un client laisse un avis."
            checked={notifReviews}
            onChange={setNotifReviews}
          />
          <Toggle
            label="Actualités Yummy"
            description="Conseils et nouveautés de la plateforme."
            checked={notifMarketing}
            onChange={setNotifMarketing}
          />
        </div>
      </Section>

      {/* Security */}
      <Section title="Sécurité" icon={<Shield className="h-4 w-4" />}>
        <div>
          <Toggle
            label="Double authentification"
            description="Renforcez la sécurité de votre compte."
            checked={twoFactor}
            onChange={setTwoFactor}
          />
        </div>
        <button
          className="mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: '#F2EDE4', color: '#4E6939' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#E8E0D4')}
          onMouseLeave={e => (e.currentTarget.style.background = '#F2EDE4')}
        >
          Modifier le mot de passe
        </button>
      </Section>
    </div>
  )
}
