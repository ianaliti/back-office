import { login } from '@/lib/api'

global.fetch = jest.fn()
const mockFetch = global.fetch as jest.Mock

// Minimal valid JWT with payload { sub, email, role }
const fakeJwt = [
  'header',
  btoa(JSON.stringify({ sub: '1', email: 'admin@example.com', role: 'ADMIN', jti: 'x', iat: 0, exp: 9999999999 })),
  'sig',
].join('.')

beforeEach(() => {
  mockFetch.mockClear()
  localStorage.clear()
})

describe('login()', () => {
  it('calls the correct endpoint and decodes user from JWT', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', data: { accessToken: fakeJwt, refreshToken: 'ref' } }),
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
    expect(result.accessToken).toBe(fakeJwt)
    expect(result.user.role).toBe('ADMIN')
    expect(result.user.email).toBe('admin@example.com')
  })

  it('throws on non-ok response with error.message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }),
    })

    await expect(login('wrong@example.com', 'bad')).rejects.toThrow('Invalid credentials')
  })

  it('throws generic HTTP error when body has no message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    await expect(login('x@x.com', 'pw')).rejects.toThrow('HTTP error 500')
  })
})
