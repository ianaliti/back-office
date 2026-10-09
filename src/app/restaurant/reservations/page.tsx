'use client'

import { useEffect, useState } from 'react'
import { getMyRestaurant } from '@/lib/api'
import { Loader2, CalendarDays, Plus, Search } from 'lucide-react'
import type { Restaurant } from '@/types'

type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

interface Reservation {
  id: string
  guestName: string
  date: string
  partySize: number
  status: ReservationStatus
  notes?: string
}

const STATUS_STYLE: Record<ReservationStatus, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  CONFIRMED: { bg: 'rgba(200,232,106,0.25)', text: '#2D3B1F', label: 'Confirmée' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', label: 'Annulée' },
}

const TABS: { key: ReservationStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmées' },
  { key: 'CANCELLED', label: 'Annulées' },
]

export default function ReservationsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'ALL'>('ALL')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const mine = await getMyRestaurant()
        setRestaurant(mine)
        if (mine) {
          const { getAccessToken } = await import('@/lib/auth')
          const token = getAccessToken()
          const res = await fetch(`http://localhost:3000/api/v1/restaurants/${mine.id}/reservations`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          if (res.ok) {
            const data = await res.json()
            setReservations(data.data ?? [])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  const filtered = reservations.filter((r) => {
    const matchTab = activeTab === 'ALL' || r.status === activeTab
    const matchDate = !dateFilter || r.date.startsWith(dateFilter)
    return matchTab && matchDate
  })

  const tabCount = (key: ReservationStatus | 'ALL') =>
    key === 'ALL' ? reservations.length : reservations.filter((r) => r.status === key).length

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Top bar: date filter + add button */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#9CA3AF' }} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-sm outline-none"
            style={{ color: dateFilter ? '#111827' : '#9CA3AF' }}
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs"
              style={{ color: '#9CA3AF' }}
            >
              ✕
            </button>
          )}
        </div>
        <div
          className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 py-2.5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: '#9CA3AF' }} />
          <span className="text-sm" style={{ color: '#9CA3AF' }}>Rechercher une réservation…</span>
        </div>
        <button
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
          style={{ background: '#2D3B1F', color: '#C8E86A' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-xl bg-white p-1"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', width: 'fit-content' }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all"
              style={isActive ? { background: '#2D3B1F', color: '#C8E86A' } : { color: '#6B7280' }}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                style={isActive
                  ? { background: 'rgba(200,232,106,0.2)', color: '#C8E86A' }
                  : { background: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {tabCount(tab.key)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-xl bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <CalendarDays className="h-10 w-10" style={{ color: '#D1D5DB' }} />
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucune réservation trouvée.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F2EDE4' }}>
                {['Nom', 'Date & heure', 'Couverts', 'Statut', 'Notes', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium"
                    style={{ color: '#6B7280' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const s = STATUS_STYLE[r.status]
                return (
                  <tr
                    key={r.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F9F7F4' : 'none' }}
                  >
                    <td className="px-5 py-3 font-medium" style={{ color: '#111827' }}>
                      {r.guestName}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#6B7280' }}>
                      {new Date(r.date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {' · '}
                      {new Date(r.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3" style={{ color: '#6B7280' }}>
                      {r.partySize} {r.partySize > 1 ? 'pers.' : 'pers.'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 max-w-[160px]">
                      <span className="text-xs line-clamp-1" style={{ color: '#9CA3AF' }}>
                        {r.notes || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-opacity"
                            style={{ background: 'rgba(200,232,106,0.25)', color: '#2D3B1F' }}
                          >
                            Confirmer
                          </button>
                          <button
                            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-opacity"
                            style={{ background: '#FEE2E2', color: '#991B1B' }}
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
