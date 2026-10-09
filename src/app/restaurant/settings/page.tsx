'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Check, Clock, CreditCard } from 'lucide-react'

type TabId = 'Établissement' | 'Équipe' | 'Abonnement' | 'Notifications'

const TABS: TabId[] = ['Établissement', 'Équipe', 'Abonnement', 'Notifications']

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
    <div className={`flex items-center justify-between py-3.5 ${isLast ? '' : 'border-b border-[#F9F7F4]'}`}>
      <div className="mr-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs mt-0.5 text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#4E6939]' : 'bg-gray-300'}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span
          className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all"
          style={{ left: checked ? '18px' : '2px' }}
        />
      </button>
    </div>
  )
}

const TEAM_MEMBERS = [
  { initial: 'L', name: 'Laurent', role: 'Propriétaire · tous les droits', avatarBg: 'bg-[#2D3B1F]' },
  { initial: 'S', name: 'Sarah', role: 'Cheffe · modifie la carte et les allergènes', avatarBg: 'bg-[#4E6939]' },
  { initial: 'T', name: 'Tom', role: 'Salle · gère les réservations', avatarBg: 'bg-gray-500' },
]

function TeamMemberList() {
  return (
    <>
      <div className="space-y-3">
        {TEAM_MEMBERS.map(m => (
          <div key={m.name} className="flex items-center gap-3">
            <div className={`h-9 w-9 shrink-0 rounded-full ${m.avatarBg} flex items-center justify-center`}>
              <span className="text-sm font-bold text-white">{m.initial}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{m.name}</p>
              <p className="text-xs mt-0.5 text-gray-500">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-xl border border-[#E5E0D8] bg-white py-2 text-sm font-medium text-gray-700">
        + Inviter un membre
      </button>
    </>
  )
}

const INVOICES = [
  { date: '01/10/2026', amount: '0,00 € HT' },
  { date: '01/09/2026', amount: '0,00 € HT' },
  { date: '01/08/2026', amount: '0,00 € HT' },
]

function ShadowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] ${className}`}>
      {children}
    </div>
  )
}

function TabAbonnement() {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 space-y-5">
        <ShadowCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Yum&apos;me Pro — Essentiel</h2>
              <p className="text-sm mt-1 text-gray-500">
                49 € HT / mois · <strong>sans engagement</strong>
              </p>
            </div>
            <span className="inline-block shrink-0 rounded-full bg-[#C8E86A] px-3 py-1 text-xs font-semibold text-[#1A2E0A]">
              Essai gratuit jusqu&apos;au 10/01/2027
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            {[
              'Fiche certifiée et badge dans les résultats',
              'Déclaration des allergènes illimitée',
              'Tableau de bord et audience par profil',
              'Réservations avec besoins transmis',
              'Réponse aux avis et gestion des signalements',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-[#4E6939]" strokeWidth={2.5} />
                <span className="text-sm text-gray-900">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button className="rounded-xl border border-[#2D3B1F] bg-white px-4 py-2 text-sm font-medium text-[#2D3B1F]">
              Changer d&apos;offre
            </button>
            <button className="bg-transparent text-sm font-medium text-red-500">
              Résilier l&apos;abonnement
            </button>
          </div>
        </ShadowCard>

        <ShadowCard className="p-6">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">Factures</h2>
          {INVOICES.map((inv, idx) => (
            <div
              key={inv.date}
              className={`flex items-center justify-between py-3 ${idx < INVOICES.length - 1 ? 'border-b border-[#F9F7F4]' : ''}`}
            >
              <span className="text-sm text-gray-700">{inv.date}</span>
              <span className="text-sm text-gray-700">{inv.amount}</span>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <Check className="h-3 w-3" />
                Essai gratuit
              </span>
              <button className="bg-transparent text-xs font-medium text-[#4E6939]">PDF</button>
            </div>
          ))}
        </ShadowCard>
      </div>

      <div className="w-72 shrink-0 space-y-5">
        <ShadowCard className="p-5">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">Équipe</h2>
          <TeamMemberList />
        </ShadowCard>

        <ShadowCard className="p-5">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">Moyen de paiement</h2>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2D3B1F] flex items-center justify-center">
              <CreditCard className="h-4.5 w-4.5 text-[#C8E86A]" style={{ height: 18, width: 18 }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Carte se terminant par 4417</p>
              <p className="text-xs mt-0.5 text-gray-500">Expire en 09/2028</p>
            </div>
            <button className="bg-transparent text-sm font-medium text-[#4E6939]">Modifier</button>
          </div>
        </ShadowCard>
      </div>
    </div>
  )
}

function TabEtablissement({ userEmail, userRole }: { userEmail: string; userRole: string }) {
  return (
    <div className="max-w-xl">
      <ShadowCard className="p-6">
        <h2 className="text-sm font-semibold mb-5 text-gray-900">
          Informations de l&apos;établissement
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">
              Adresse e-mail
            </label>
            <div className="rounded-xl border border-[#E5E0D8] bg-[#F9F8F5] px-3.5 py-2.5 text-sm text-gray-700">
              {userEmail}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Rôle</label>
            <div className="rounded-xl border border-[#E5E0D8] bg-[#F9F8F5] px-3.5 py-2.5 text-sm text-gray-700">
              {userRole}
            </div>
          </div>
        </div>
        <button className="mt-5 rounded-xl bg-[#F2EDE4] px-4 py-2 text-sm font-medium text-[#4E6939]">
          Modifier le mot de passe
        </button>
      </ShadowCard>
    </div>
  )
}

function TabEquipe() {
  return (
    <div className="max-w-xl">
      <ShadowCard className="p-6">
        <h2 className="text-sm font-semibold mb-4 text-gray-900">Équipe</h2>
        <TeamMemberList />
      </ShadowCard>
    </div>
  )
}

function TabNotifications({
  notifReservations, setNotifReservations,
  notifReviews, setNotifReviews,
  notifMarketing, setNotifMarketing,
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
      <ShadowCard className="p-6">
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
      </ShadowCard>
    </div>
  )
}

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
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      <p className="text-sm mt-1 text-gray-500">Établissement, équipe, abonnement et notifications.</p>

      {/* Tab bar */}
      <div className="flex gap-0 mt-6 mb-6 border-b border-[#E5E0D8]" role="tablist">
        {TABS.map(tab => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`px-4 pb-3 text-sm transition-colors -mb-px border-b-2 ${
                isActive
                  ? 'border-[#2D3B1F] font-semibold text-gray-900'
                  : 'border-transparent font-medium text-gray-500'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

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
