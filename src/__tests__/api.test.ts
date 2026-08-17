/**
 * Unit tests for lib/api.ts — tests the exported helpers
 * using fetch mocks.
 */

import { login } from '@/lib/api'

global.fetch = jest.fn()

const mockFetch = global.fetch as jest.Mock

beforeEach(() => {
  mockFetch.mockClear()
  localStorage.clear()
})

describe('login()', () => {
  it('calls the correct endpoint with credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'acc',
          refreshToken: 'ref',
          user: {
            id: '1',
            email: 'admin@example.com',
            role: 'ADMIN',
            displayName: 'Admin',
          },
        },
      }),
    })

    const result = await login('admin@example.com', 'password123')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
      })
    )
    expect(result.data.accessToken).toBe('acc')
    expect(result.data.user.role).toBe('ADMIN')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    await expect(login('wrong@example.com', 'bad')).rejects.toThrow('Invalid credentials')
  })

  it('throws generic error when response has no message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    await expect(login('x@x.com', 'pw')).rejects.toThrow('HTTP error 500')
  })
})
