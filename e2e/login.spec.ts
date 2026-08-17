import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies so middleware lets us through to /login
    await page.context().clearCookies()
  })

  test('shows login form on /login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /yummy back office/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    })

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('badpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('redirects ADMIN to /admin/dashboard on success', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
              role: 'ADMIN',
              displayName: 'Admin User',
            },
          },
        }),
      })
    })

    // Mock admin/stats to prevent errors on dashboard
    await page.route('**/api/v1/admin/stats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { users: 10, restaurants: 5, events: 3 } }),
      })
    })

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/admin/dashboard')
  })

  test('redirects RESTAURANT_OWNER to /restaurant/dashboard on success', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 'owner-1',
              email: 'owner@example.com',
              role: 'RESTAURANT_OWNER',
              displayName: 'Restaurant Owner',
            },
          },
        }),
      })
    })

    await page.route('**/api/v1/restaurants', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('owner@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await page.waitForURL('**/restaurant/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/restaurant/dashboard')
  })

  test('root / redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })
})
