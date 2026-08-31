'use client'

import { useEffect, useState } from 'react'
import { getUsers } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { User, UserRole } from '@/types'

function roleBadgeVariant(role: UserRole) {
  if (role === 'ADMIN') return 'default' as const
  if (role === 'RESTAURANT_OWNER') return 'warning' as const
  return 'secondary' as const
}

function roleLabel(role: UserRole) {
  if (role === 'RESTAURANT_OWNER') return 'Restaurant'
  if (role === 'ADMIN') return 'Admin'
  return 'Customer'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers(page)
  }, [page])

  async function loadUsers(p: number) {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers(p, 20)
      setUsers(data.users)
      setPages(data.pages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} users total</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#4E6939]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-left font-medium text-gray-500">Name</th>
                      <th className="pb-3 text-left font-medium text-gray-500">Email</th>
                      <th className="pb-3 text-left font-medium text-gray-500">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">{user.displayName || '—'}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-gray-600">{user.email}</p>
                        </td>
                        <td className="py-3">
                          <Badge variant={roleBadgeVariant(user.role)}>
                            {roleLabel(user.role)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">Page {page} of {pages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
