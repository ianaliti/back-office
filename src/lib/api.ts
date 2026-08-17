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
export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants`)
  const data = await handleResponse<RestaurantsListResponse>(response)
  return data.data.restaurants
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
export async function getDishes(restaurantId: string): Promise<Dish[]> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes`)
  const data = await handleResponse<DishesListResponse>(response)
  return data.data
}

export async function createDish(restaurantId: string, formData: DishFormData): Promise<Dish> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes`, {
    method: 'POST',
    body: JSON.stringify(formData),
  })
  const data = await handleResponse<DishResponse>(response)
  return data.data
}

export async function updateDish(restaurantId: string, dishId: string, formData: Partial<DishFormData>): Promise<Dish> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes/${dishId}`, {
    method: 'PATCH',
    body: JSON.stringify(formData),
  })
  const data = await handleResponse<DishResponse>(response)
  return data.data
}

export async function deleteDish(restaurantId: string, dishId: string): Promise<void> {
  const response = await fetchWithAuth(`${BASE_URL}/restaurants/${restaurantId}/dishes/${dishId}`, { method: 'DELETE' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const msg = (body as { error?: { message?: string } })?.error?.message || 'Failed to delete dish'
    throw new Error(msg)
  }
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
