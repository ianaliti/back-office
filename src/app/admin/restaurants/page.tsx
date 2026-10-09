'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getRestaurants, createRestaurantWithOwner, deleteRestaurant, getUsers } from '@/lib/api'
import { RestaurantForm, type OwnerCredentials } from '@/components/forms/RestaurantForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Pencil, Trash2, Loader2, MapPin, Phone, Globe, User, Search, CheckCircle2, X, ChevronLeft, ChevronRight, Leaf } from 'lucide-react'
import type { Restaurant, RestaurantFormData, User as UserType } from '@/types'

const PAGE_SIZE = 20

const CITIES = ['Annecy', 'Lyon']

const DIET_OPTIONS = [
  { code: 'vegan',        label: 'Vegan' },
  { code: 'vegetarian',   label: 'Vegetarian' },
  { code: 'halal',        label: 'Halal' },
  { code: 'kosher',       label: 'Kosher' },
  { code: 'gluten_free',  label: 'Gluten-free' },
  { code: 'lactose_free', label: 'Lactose-free' },
]

const DIET_COLORS: Record<string, string> = {
  vegan:        'bg-green-100 text-green-800',
  vegetarian:   'bg-lime-100 text-lime-800',
  halal:        'bg-emerald-100 text-emerald-800',
  kosher:       'bg-teal-100 text-teal-800',
  gluten_free:  'bg-amber-100 text-amber-800',
  lactose_free: 'bg-yellow-100 text-yellow-800',
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [owners, setOwners] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [city, setCity] = useState('')
  const [activeDiets, setActiveDiets] = useState<string[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newCredentials, setNewCredentials] = useState<OwnerCredentials | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async (p: number, q: string, c: string, diets: string[]) => {
    setLoading(true)
    setPageError('')
    try {
      const [list, usersData] = await Promise.all([
        getRestaurants(p, PAGE_SIZE, q, c, diets),
        getUsers(1, 100),
      ])
      setRestaurants(list.restaurants)
      setTotal(list.total)
      setTotalPages(list.pages)
      setOwners(usersData.users.filter((u) => u.role === 'RESTAURANT_OWNER'))
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, city, activeDiets) }, [page, search, city, activeDiets, load])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  function handleCityChange(c: string) {
    setCity(c)
    setPage(1)
  }

  function toggleDiet(code: string) {
    setActiveDiets((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    )
    setPage(1)
  }

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setCity('')
    setActiveDiets([])
    setPage(1)
  }

  const hasFilters = search || city || activeDiets.length > 0

  async function handleCreate(data: RestaurantFormData, ownerCreds?: OwnerCredentials) {
    if (!ownerCreds) return
    setCreating(true)
    setCreateError('')
    try {
      await createRestaurantWithOwner(ownerCreds.email, ownerCreds.password, data)
      setNewCredentials(ownerCreds)
      setCreateOpen(false)
      load(page, search, city, activeDiets)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create restaurant')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteRestaurant(deleteTarget.id)
      setDeleteTarget(null)
      load(page, search, city, activeDiets)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete restaurant')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {pageError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{pageError}</div>
      )}
      {deleteError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</div>
      )}

      {newCredentials && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold">Restaurant created! Share these login credentials with the owner:</p>
                <p className="mt-1.5 font-mono">Email: <span className="font-bold">{newCredentials.email}</span></p>
                <p className="font-mono">Password: <span className="font-bold">{newCredentials.password}</span></p>
              </div>
            </div>
            <button onClick={() => setNewCredentials(null)} className="shrink-0 rounded p-1 hover:bg-green-100" aria-label="Dismiss">
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, address…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4E6939] focus:outline-none focus:ring-1 focus:ring-[#4E6939]"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">Search</Button>
          </form>

          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 whitespace-nowrap">
              {total} restaurant{total !== 1 ? 's' : ''}
            </p>
            <Button onClick={() => { setCreateError(''); setCreateOpen(true) }}>
              <Plus className="h-4 w-4" /> Add Restaurant
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* City filter */}
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:border-[#4E6939] focus:outline-none focus:ring-1 focus:ring-[#4E6939]"
          >
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Diet filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {DIET_OPTIONS.map((d) => {
              const active = activeDiets.includes(d.code)
              return (
                <button
                  key={d.code}
                  onClick={() => toggleDiet(d.code)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border ${
                    active
                      ? 'border-[#4E6939] bg-[#4E6939] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#4E6939] hover:text-[#4E6939]'
                  }`}
                >
                  <Leaf className="h-3 w-3" />
                  {d.label}
                </button>
              )
            })}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4E6939]" />
        </div>
      ) : restaurants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-gray-500">
              {hasFilters ? 'No restaurants match these filters.' : 'No restaurants yet.'}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="mt-3 text-sm text-[#4E6939] hover:underline">
                Clear filters
              </button>
            ) : (
              <Button className="mt-4" onClick={() => { setCreateError(''); setCreateOpen(true) }}>
                <Plus className="h-4 w-4" /> Add Restaurant
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => {
            const ownerUser = owners.find((u) => u.id === r.ownerId)
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {r.cuisine && (
                      <span className="inline-block rounded-full bg-[#4E6939]/10 px-2.5 py-0.5 text-xs text-[#4E6939]">
                        {r.cuisine}
                      </span>
                    )}
                    {r.diets?.map((d) => (
                      <span
                        key={d.code}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${DIET_COLORS[d.code] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        <Leaf className="h-2.5 w-2.5" />
                        {d.label}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {r.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span>{r.address}</span>
                    </div>
                  )}
                  {r.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{r.phone}</span>
                    </div>
                  )}
                  {r.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={r.website} target="_blank" rel="noopener noreferrer"
                        className="text-[#4E6939] hover:underline truncate">{r.website}</a>
                    </div>
                  )}
                  {ownerUser && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{ownerUser.displayName || ownerUser.email}</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Link href={`/admin/restaurants/${r.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => { setDeleteError(''); setDeleteTarget(r) }}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateError('') }}
        title="Add Restaurant"
        description="Enter the owner's login credentials and the restaurant name. Address and location can be completed later by the owner."
        className="max-w-2xl"
      >
        <RestaurantForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => { setCreateOpen(false); setCreateError('') }}
          submitLabel="Create Restaurant & Account"
          loading={creating}
          error={createError}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Restaurant"
        description={`Delete "${deleteTarget?.name}" and all its data? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  )
}
