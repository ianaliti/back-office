'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Check, Bell, Shield, User, Building2, Users, CreditCard, FileText } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = 'Établissement' | 'Équipe' | 'Abonnement' | 'Notifications'

const TABS: TabId[] = ['Établissement', 'Équipe', 'Abonnement', 'Notifications']

// ---------------------------------------------------------------------------
// Toggle — reusable notification toggle row
// ---------------------------------------------------------------------------

function Toggle({
  label,
  description,
  checked,
  onChange,
  isLast = false,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  isLast?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        paddingTop: '14px',
        paddingBottom: '14px',
        borderBottom: isLast ? 'none' : '1px solid #F9F7F4',
      }}
    >
      <div className="mr-4">
        <p className="text-sm font-medium" style={{ color: '#111827' }}>
          {label}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative rounded-full shrink-0 transition-colors"
        style={{
          height: '20px',
          width: '36px',
          background: checked ? '#4E6939' : '#D1D5DB',
        }}
        aria-pressed={checked}
        aria-label={label}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white transition-all"
          style={{
            height: '14px',
            width: '14px',
            left: checked ? '18px' : '2px',
          }}
        />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TeamMembers — shared between Abonnement right column and Équipe tab
// ---------------------------------------------------------------------------

const TEAM_MEMBERS = [
  { initial: 'L', name: 'Laurent', role: 'Propriétaire · tous les droits', avatarBg: '#2D3B1F' },
  { initial: 'S', name: 'Sarah', role: 'Cheffe · modifie la carte et les allergènes', avatarBg: '#4E6939' },
  { initial: 'T', name: 'Tom', role: 'Salle · gère les réservations', avatarBg: '#6B7280' },
]

function TeamMemberList() {
  return (
    <>
      <div className="space-y-3">
        {TEAM_MEMBERS.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: m.avatarBg,
              }}
            >
              <span className="text-sm font-bold text-white">{m.initial}</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                {m.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                {m.role}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-4 w-full rounded-xl py-2 text-sm font-medium cursor-pointer"
        style={{
          border: '1px solid #E5E0D8',
          background: 'white',
          color: '#374151',
        }}
      >
        + Inviter un membre
      </button>
    </>
  )
}

// ---------------------------------------------------------------------------
// INVOICES data
// ---------------------------------------------------------------------------

const INVOICES = [
  { date: '01/10/2026', amount: '0,00 € HT' },
  { date: '01/09/2026', amount: '0,00 € HT' },
  { date: '01/08/2026', amount: '0,00 € HT' },
]

// ---------------------------------------------------------------------------
// CARD shell
// ---------------------------------------------------------------------------

function Card({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`rounded-xl bg-white ${className}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', ...style }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TAB: Abonnement
// ---------------------------------------------------------------------------

function TabAbonnement() {
  return (
    <div className="flex gap-6 items-start">
      {/* LEFT COLUMN */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Card 1 — Subscription plan */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
                Yum&apos;me Pro — Essentiel
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                49 € HT / mois · <strong>sans engagement</strong>
              </p>
            </div>
            <span
              className="inline-block rounded-full text-xs font-semibold shrink-0"
              style={{
                background: '#C8E86A',
                color: '#1A2E0A',
                padding: '4px 12px',
              }}
            >
              Essai gratuit jusqu&apos;au 10/01/2027
            </span>
          </div>

          {/* Feature list */}
          <div className="mt-5 space-y-2.5">
            {[
              'Fiche certifiée et badge dans les résultats',
              'Déclaration des allergènes illimitée',
              'Tableau de bord et audience par profil',
              'Réservations avec besoins transmis',
              'Réponse aux avis et gestion des signalements',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check
                  className="shrink-0"
                  style={{ height: '16px', width: '16px', color: '#4E6939' }}
                  strokeWidth={2.5}
                />
                <span className="text-sm" style={{ color: '#111827' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-4">
            <button
              className="rounded-xl px-4 py-2 text-sm font-medium cursor-pointer"
              style={{
                border: '1px solid #2D3B1F',
                background: 'white',
                color: '#2D3B1F',
              }}
            >
              Changer d&apos;offre
            </button>
            <button
              className="text-sm font-medium cursor-pointer"
              style={{ border: 'none', background: 'transparent', color: '#EF4444' }}
            >
              Résilier l&apos;abonnement
            </button>
          </div>
        </Card>

        {/* Card 2 — Factures */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
            Factures
          </h2>
          {INVOICES.map((inv, idx) => (
            <div
              key={inv.date}
              className="flex items-center justify-between py-3"
              style={{
                borderBottom: idx < INVOICES.length - 1 ? '1px solid #F9F7F4' : 'none',
              }}
            >
              <span className="text-sm" style={{ color: '#374151' }}>
                {inv.date}
              </span>
              <span className="text-sm" style={{ color: '#374151' }}>
                {inv.amount}
              </span>
              <span
                className="flex items-center gap-1 rounded-full text-xs font-medium"
                style={{
                  background: '#D1FAE5',
                  color: '#065F46',
                  padding: '2px 10px',
                }}
              >
                <Check style={{ height: '12px', width: '12px' }} />
                Essai gratuit
              </span>
              <button
                className="text-xs font-medium cursor-pointer"
                style={{ background: 'transparent', border: 'none', color: '#4E6939' }}
              >
                PDF
              </button>
            </div>
          ))}
        </Card>
      </div>

      {/* RIGHT COLUMN */}
      <div className="shrink-0 space-y-5" style={{ width: '288px' }}>
        {/* Card A — Équipe */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
            Équipe
          </h2>
          <TeamMemberList />
        </Card>

        {/* Card B — Moyen de paiement */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
            Moyen de paiement
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl flex items-center justify-center shrink-0"
              style={{
                width: '40px',
                height: '40px',
                background: '#2D3B1F',
              }}
            >
              <CreditCard style={{ height: '18px', width: '18px', color: '#C8E86A' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                Carte se terminant par 4417
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Expire en 09/2028
              </p>
            </div>
            <button
              className="text-sm font-medium cursor-pointer"
              style={{ background: 'transparent', border: 'none', color: '#4E6939' }}
            >
              Modifier
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TAB: Établissement
// ---------------------------------------------------------------------------

function TabEtablissement({ userEmail, userRole }: { userEmail: string; userRole: string }) {
  return (
    <div className="max-w-xl">
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-5" style={{ color: '#111827' }}>
          Informations de l&apos;établissement
        </h2>
        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#6B7280' }}
            >
              Adresse e-mail
            </label>
            <div
              className="rounded-xl text-sm"
              style={{
                padding: '10px 14px',
                background: '#F9F8F5',
                color: '#374151',
                border: '1px solid #E5E0D8',
              }}
            >
              {userEmail}
            </div>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#6B7280' }}
            >
              Rôle
            </label>
            <div
              className="rounded-xl text-sm"
              style={{
                padding: '10px 14px',
                background: '#F9F8F5',
                color: '#374151',
                border: '1px solid #E5E0D8',
              }}
            >
              {userRole}
            </div>
          </div>
        </div>
        <button
          className="mt-5 rounded-xl px-4 py-2 text-sm font-medium cursor-pointer"
          style={{ background: '#F2EDE4', color: '#4E6939', border: 'none' }}
        >
          Modifier le mot de passe
        </button>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TAB: Équipe
// ---------------------------------------------------------------------------

function TabEquipe() {
  return (
    <div className="max-w-xl">
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
          Équipe
        </h2>
        <TeamMemberList />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TAB: Notifications
// ---------------------------------------------------------------------------

function TabNotifications({
  notifReservations,
  setNotifReservations,
  notifReviews,
  setNotifReviews,
  notifMarketing,
  setNotifMarketing,
}: {
  notifReservations: boolean
  setNotifReservations: (v: boolean) => void
  notifReviews: boolean
  setNotifReviews: (v: boolean) => void
  notifMarketing: boolean
  setNotifMarketing: (v: boolean) => void
}) {
  return (
    <div className="max-w-xl">
      <Card className="p-6">
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
          label="Actualités Yum'me"
          description="Conseils et nouveautés de la plateforme."
          checked={notifMarketing}
          onChange={setNotifMarketing}
          isLast
        />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<TabId>('Abonnement')
  const [notifReservations, setNotifReservations] = useState(true)
  const [notifReviews, setNotifReviews] = useState(true)
  const [notifMarketing, setNotifMarketing] = useState(false)

  const userEmail = user?.email ?? '—'
  const userRole =
    user?.role === 'RESTAURANT_OWNER' ? 'Propriétaire de restaurant' : user?.role ?? '—'

  return (
    <div>
      {/* Page header */}
      <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
        Paramètres
      </h1>
      <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
        Établissement, équipe, abonnement et notifications.
      </p>

      {/* Tab bar */}
      <div
        className="flex gap-0 mt-6 mb-6"
        style={{ borderBottom: '1px solid #E5E0D8' }}
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className="px-4 pb-3 text-sm cursor-pointer transition-colors"
              style={{
                marginBottom: '-1px',
                color: isActive ? '#111827' : '#6B7280',
                fontWeight: isActive ? 600 : 500,
                background: 'transparent',
                borderTopWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderBottomWidth: '2px',
                borderBottomStyle: 'solid',
                borderBottomColor: isActive ? '#2D3B1F' : 'transparent',
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {activeTab === 'Abonnement' && <TabAbonnement />}
      {activeTab === 'Établissement' && (
        <TabEtablissement userEmail={userEmail} userRole={userRole} />
      )}
      {activeTab === 'Équipe' && <TabEquipe />}
      {activeTab === 'Notifications' && (
        <TabNotifications
          notifReservations={notifReservations}
          setNotifReservations={setNotifReservations}
          notifReviews={notifReviews}
          setNotifReviews={setNotifReviews}
          notifMarketing={notifMarketing}
          setNotifMarketing={setNotifMarketing}
        />
      )}
    </div>
  )
}
