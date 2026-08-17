/**
 * Unit tests for lib/auth.ts
 * We mock localStorage and document.cookie since we're running in jsdom.
 */

import {
  getAccessToken,
  getRefreshToken,
  getUser,
  setTokens,
  setUser,
  clearAuth,
  isAuthenticated,
  hasRole,
} from '@/lib/auth'
import type { User } from '@/types'

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'RESTAURANT_OWNER',
  displayName: 'Test Owner',
}

beforeEach(() => {
  localStorage.clear()
  // Reset cookies
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  })
})

describe('getAccessToken()', () => {
  it('returns null when no token stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns stored token', () => {
    localStorage.setItem('accessToken', 'my-token')
    expect(getAccessToken()).toBe('my-token')
  })
})

describe('getRefreshToken()', () => {
  it('returns null when not set', () => {
    expect(getRefreshToken()).toBeNull()
  })

  it('returns stored refresh token', () => {
    localStorage.setItem('refreshToken', 'refresh-123')
    expect(getRefreshToken()).toBe('refresh-123')
  })
})

describe('getUser()', () => {
  it('returns null when not set', () => {
    expect(getUser()).toBeNull()
  })

  it('returns parsed user object', () => {
    localStorage.setItem('user', JSON.stringify(mockUser))
    const user = getUser()
    expect(user).toEqual(mockUser)
  })

  it('returns null for invalid JSON', () => {
    localStorage.setItem('user', 'not-json')
    expect(getUser()).toBeNull()
  })
})

describe('setTokens()', () => {
  it('stores access and refresh tokens', () => {
    setTokens({ accessToken: 'acc', refreshToken: 'ref' })
    expect(localStorage.getItem('accessToken')).toBe('acc')
    expect(localStorage.getItem('refreshToken')).toBe('ref')
  })
})

describe('setUser()', () => {
  it('stores user as JSON', () => {
    setUser(mockUser)
    const stored = localStorage.getItem('user')
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!)).toEqual(mockUser)
  })
})

describe('clearAuth()', () => {
  it('removes all stored auth data', () => {
    localStorage.setItem('accessToken', 'acc')
    localStorage.setItem('refreshToken', 'ref')
    localStorage.setItem('user', JSON.stringify(mockUser))
    clearAuth()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})

describe('isAuthenticated()', () => {
  it('returns false when no token', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('returns true when token exists', () => {
    localStorage.setItem('accessToken', 'token-xyz')
    expect(isAuthenticated()).toBe(true)
  })
})

describe('hasRole()', () => {
  it('returns false when no user', () => {
    expect(hasRole('ADMIN')).toBe(false)
  })

  it('returns true when user has the role', () => {
    setUser(mockUser)
    expect(hasRole('RESTAURANT_OWNER')).toBe(true)
  })

  it('returns false when user has different role', () => {
    setUser(mockUser)
    expect(hasRole('ADMIN')).toBe(false)
  })
})
