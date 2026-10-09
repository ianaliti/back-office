'use client'

import { Award, CheckCircle2, Lock, Leaf, Share2 } from 'lucide-react'

const badges = [
  {
    id: 1,
    title: 'Cuisine inclusive',
    description: 'Proposez au moins 3 options végétariennes ou vegan sur votre carte.',
    obtained: false,
    icon: '🌿',
  },
  {
    id: 2,
    title: 'Allergènes renseignés',
    description: 'Tous vos plats ont leurs allergènes renseignés.',
    obtained: false,
    icon: '✅',
  },
  {
    id: 3,
    title: 'Restaurateur actif',
    description: 'Votre carte a été mise à jour il y a moins de 30 jours.',
    obtained: true,
    icon: '⭐',
  },
  {
    id: 4,
    title: 'Top noté',
    description: 'Obtenez une note moyenne supérieure à 4.5.',
    obtained: false,
    icon: '🏆',
  },
]

export default function BadgePage() {
  const obtained = badges.filter((b) => b.obtained)

  return (
    <div className="space-y-5">
      {/* Certification card */}
      <div
        className="rounded-xl p-6"
        style={{ background: '#2D3B1F' }}
      >
        {/* Top row: logo + brand */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: 'rgba(200,232,106,0.2)' }}
          >
            <Leaf className="h-3.5 w-3.5" style={{ color: '#C8E86A' }} />
          </div>
          <span className="text-sm font-bold text-white">yum'nut</span>
          <span className="text-xs" style={{ color: '#8FA87A' }}>certification</span>
        </div>

        {/* Main content */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Cuisine Inclusive</h2>
          <p className="mt-1 text-sm font-medium" style={{ color: '#C8E86A' }}>
            Certification officielle
          </p>
          <p className="mt-3 text-sm" style={{ color: '#8FA87A' }}>
            Votre établissement répond aux critères d'inclusivité alimentaire de la plateforme yum'nut.
          </p>
        </div>

        {/* Bottom row: badge count + share */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'rgba(200,232,106,0.15)' }}
            >
              <Award className="h-5 w-5" style={{ color: '#C8E86A' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {obtained.length} badge{obtained.length !== 1 ? 's' : ''} obtenu{obtained.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs" style={{ color: '#8FA87A' }}>
                sur {badges.length} disponibles
              </p>
            </div>
          </div>

          <button
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{ background: '#C8E86A', color: '#1A2E0A' }}
          >
            <Share2 className="h-4 w-4" />
            Partager
          </button>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="rounded-xl bg-white p-5 flex items-start gap-4"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              opacity: badge.obtained ? 1 : 0.65,
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{ background: badge.obtained ? 'rgba(200,232,106,0.2)' : '#F3F4F6' }}
            >
              {badge.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                  {badge.title}
                </p>
                {badge.obtained
                  ? <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#4E6939' }} />
                  : <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: '#D1D5DB' }} />
                }
              </div>
              <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
