import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setCookies,
  clearAuth,
  getUser,
  setUserFromJwt,
} from './auth'
import type {
  AuthResponse,
  RefreshResponse,
  Restaurant,
  RestaurantsListResponse,
  RestaurantResponse,
  RestaurantFormData,
  Dish,
  DishesListResponse,
  DishResponse,
  DishFormData,
  AdminStats,
  PaginatedUsers,
  User,
  UserRole,
  Review,
  RatingApiResponse,
  RestaurantAnalytics,
} from '@/types'

const BASE_URL = 'http://localhost:3000/api/v1'

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuth()
    window.location.href = '/login'
    throw new Error('No refresh token available')
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearAuth()
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }

  const data: RefreshResponse = await response.json()
  const { accessToken, refreshToken: newRefreshToken } = data.data
  setTokens({ accessToken, refreshToken: newRefreshToken })

  const user = getUser()
  if (user) setCookies(accessToken, user.role)

  return accessToken
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push(async (newToken: string) => {
          headers['Authorization'] = `Bearer ${newToken}`
          resolve(fetch(url, { ...options, headers }))
        })
      })
    }

    isRefreshing = true
    try {
      const newToken = await refreshAccessToken()
      isRefreshing = false
      refreshQueue.forEach((cb) => cb(newToken))
      refreshQueue = []
      headers['Authorization'] = `Bearer ${newToken}`
      return fetch(url, { ...options, headers })
    } catch {
      isRefreshing = false
      refreshQueue = []
      throw new Error('Authentication failed')
    }
  }

  return response
}

// Backend error shape: { error: { code: string, message: string } }
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP error ${response.status}`
    try {
      const body = await response.json()
      message = body?.error?.message || body?.message || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

// Auth — returns tokens; user is decoded from the JWT payload
export async function login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await handleResponse<AuthResponse>(response)
  const { accessToken, refreshToken } = data.data

  const user = setUserFromJwt(accessToken)
  if (!user) throw new Error('Invalid token received from server')

  return { accessToken, refreshToken, user }
}

export async function createRestaurantWithOwner(
  ownerEmail: string,
  ownerPassword: string,
  restaurantData: RestaurantFormData
): Promise<Restaurant> {
  // 1. Register the owner account (unauthenticated)
  const regResponse = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ownerEmail, password: ownerPassword, displayName: restaurantData.name }),
  })
  const regData = await handleResponse<AuthResponse>(regResponse)

  // Decode the returned JWT to extract the new user's ID
  const { decodeJwt } = await import('./auth')
  const payload = decodeJwt(regData.data.accessToken)
  if (!payload) throw new Error('Failed to decode registration token')
  const userId = payload.sub

  // 2. Elevate the new account to RESTAURANT_OWNER
  await updateUserRole(userId, 'RESTAURANT_OWNER')

  // 3. Create the restaurant linked to the new owner
  const restaurant = await createRestaurant({ ...restaurantData, ownerId: userId })
  return restaurant
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    await fetchWithAuth(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  } finally {
    clearAuth()
  }
}

// Restaurants
export async function getRestaurants(
  page = 1,
  limit = 20,
  search = '',
  city = '',
  diets: string[] = [],
): Promise<{ restaurants: Restaurant[]; total: number; pages: number; page: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search.trim()) params.set('search', search.trim())
  if (city.trim()) params.set('city', city.trim())
  if (diets.length > 0) params.set('diets', diets.join(','))
  const response = await fetchWithAuth(`${BASE_URL}/restaurants?${params}`)
  const data = await handleResponse<RestaurantsListResponse>(response)
  return data.data
}

export async function getMyRestaurant(): Promise<Restaurant> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/mine`)
  const data = await handleResponse<RestaurantResponse>(response)
  return data.data
}

export async function getRestaurant(id: string): Promise<Restaurant> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${id}`)
  const data = await handleResponse<RestaurantResponse>(response)
  return data.data
}

export async function createRestaurant(formData: RestaurantFormData): Promise<Restaurant> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants`, {
    method: 'POST',
    body: JSON.stringify(formData),
  })
  const data = await handleResponse<RestaurantResponse>(response)
  return data.data
}

export async function updateRestaurant(id: string, formData: Partial<RestaurantFormData>): Promise<Restaurant> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(formData),
  })
  const data = await handleResponse<RestaurantResponse>(response)
  return data.data
}

export async function deleteRestaurant(id: string): Promise<void> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const msg = (body as { error?: { message?: string } })?.error?.message || 'Failed to delete restaurant'
    throw new Error(msg)
  }
}

// Dishes
// Backend uses `image` / `isAvailable`; frontend uses `imageUrl` / `available`.
function mapDishFromApi(d: any): Dish {
  return {
    id: d.id,
    restaurantId: d.restaurantId,
    name: d.name,
    description: d.description ?? undefined,
    price: d.price,
    category: d.category,
    available: d.isAvailable ?? d.available ?? true,
    imageUrl: d.image ?? d.imageUrl ?? undefined,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

function mapDishToApi(formData: Partial<DishFormData>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(formData)) {
    if (v !== undefined) result[k] = v
  }
  return result
}

export async function getDishes(restaurantId: string): Promise<Dish[]> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes`)
  const data = await handleResponse<any>(response)
  const list: any[] = Array.isArray(data) ? data : (data.data ?? [])
  return list.map(mapDishFromApi)
}

export async function createDish(restaurantId: string, formData: DishFormData): Promise<Dish> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes`, {
    method: 'POST',
    body: JSON.stringify(mapDishToApi(formData)),
  })
  const data = await handleResponse<any>(response)
  return mapDishFromApi(data.data ?? data)
}

export async function updateDish(restaurantId: string, dishId: string, formData: Partial<DishFormData>): Promise<Dish> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes/${dishId}`, {
    method: 'PATCH',
    body: JSON.stringify(mapDishToApi(formData)),
  })
  const data = await handleResponse<any>(response)
  return mapDishFromApi(data.data ?? data)
}

export async function deleteDish(restaurantId: string, dishId: string): Promise<void> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes/${dishId}`, { method: 'DELETE' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const msg = (body as { error?: { message?: string } })?.error?.message || 'Failed to delete dish'
    throw new Error(msg)
  }
}

// Reviews
export async function getRestaurantReviews(restaurantId: string): Promise<Review[]> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/ratings`)
  const ratings = await handleResponse<RatingApiResponse[]>(response)
  return ratings.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.score,
    comment: r.comment ?? '',
    createdAt: r.createdAt,
  }))
}

// Analytics
export async function getRestaurantAnalytics(restaurantId: string): Promise<RestaurantAnalytics> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/analytics`)
  return handleResponse<RestaurantAnalytics>(response)
}

export async function trackProfileView(restaurantId: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/analytics/profile-view`, {
    method: 'POST',
    body: JSON.stringify({ restaurantId }),
  }).catch(() => {/* fire-and-forget, don't break the page if tracking fails */})
}

export async function trackFilterClick(
  restaurantId: string,
  filterCode: string,
  filterType: 'diet' | 'accessibility' | 'cuisine' | 'search',
  filterLabel: string
): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/analytics/filter-click`, {
    method: 'POST',
    body: JSON.stringify({ restaurantId, filterCode, filterType, filterLabel }),
  }).catch(() => {})
}

export async function trackSearch(term: string, restaurantId?: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/analytics/search`, {
    method: 'POST',
    body: JSON.stringify({ term, restaurantId }),
  }).catch(() => {})
}

// Admin
export async function getAdminStats(): Promise<AdminStats['data']> {
  const response = await fetchWithAuth(`${BASE_URL}/admin/stats`)
  const data = await handleResponse<AdminStats>(response)
  return data.data
}

export async function getUsers(page = 1, limit = 20): Promise<PaginatedUsers['data']> {
  const response = await fetchWithAuth(`${BASE_URL}/admin/users?page=${page}&limit=${limit}`)
  const data = await handleResponse<PaginatedUsers>(response)
  return data.data
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  const response = await fetchWithAuth(`${BASE_URL}/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  return handleResponse<User>(response)
}
