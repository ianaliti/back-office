import type { User, AuthTokens } from '@/types'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Clear cookies
  document.cookie = 'accessToken=; path=/; max-age=0'
  document.cookie = 'userRole=; path=/; max-age=0'
}

export function setCookies(accessToken: string, role: string): void {
  const maxAge = 60 * 60 * 24 // 24 hours
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`
  document.cookie = `userRole=${role}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

export function hasRole(role: string): boolean {
  const user = getUser()
  return user?.role === role
}
