import { test, expect } from '@playwright/test'

async function setupAdminAuth(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'mock-admin-token',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'userRole',
      value: 'ADMIN',
      domain: 'localhost',
      path: '/',
    },
  ])

  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-admin-token')
    localStorage.setItem('refreshToken', 'mock-refresh-token')
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
        displayName: 'Admin User',
      })
    )
  })
}

test.describe('Admin section', () => {
  test('can access /admin/dashboard with stats', async ({ page }) => {
    await setupAdminAuth(page)

    await page.route('**/api/v1/admin/stats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { users: 42, restaurants: 15, events: 8 },
        }),
      })
    })

    await page.goto('/admin/dashboard')
    await expect(page.getByText('42')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('15')).toBeVisible()
  })

  test('admin dashboard shows stat cards', async ({ page }) => {
    await setupAdminAuth(page)

    await page.route('**/api/v1/admin/stats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { users: 100, restaurants: 25, events: 10 },
        }),
      })
    })

    await page.goto('/admin/dashboard')
    await expect(page.getByText(/total users/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/restaurants/i)).toBeVisible()
    await expect(page.getByText(/events/i)).toBeVisible()
  })

  test('sidebar shows admin nav items', async ({ page }) => {
    await setupAdminAuth(page)

    await page.route('**/api/v1/admin/stats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { users: 0, restaurants: 0, events: 0 } }),
      })
    })

    await page.goto('/admin/dashboard')

    await expect(page.getByRole('link', { name: /restaurants/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /users/i })).toBeVisible()
  })

  test('non-admin is redirected away from /admin', async ({ page }) => {
    await page.context().clearCookies()
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'owner-token',
        domain: 'localhost',
        path: '/',
      },
      {
        name: 'userRole',
        value: 'RESTAURANT_OWNER',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected from /admin', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('can see restaurants list', async ({ page }) => {
    await setupAdminAuth(page)

    await page.route('**/api/v1/restaurants', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'r1',
              name: 'Pasta Palace',
              address: '1 Pasta Lane',
              phone: '+1 555 2222',
              cuisine: 'Italian',
            },
          ],
        }),
      })
    })

    await page.goto('/admin/restaurants')
    await expect(page.getByText('Pasta Palace')).toBeVisible({ timeout: 10000 })
  })

  test('can see users list', async ({ page }) => {
    await setupAdminAuth(page)

    await page.route('**/api/v1/admin/users**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            users: [
              {
                id: 'u1',
                email: 'customer@example.com',
                role: 'CUSTOMER',
                displayName: 'John Customer',
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
            pages: 1,
          },
        }),
      })
    })

    await page.goto('/admin/users')
    await expect(page.getByText('John Customer')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('CUSTOMER')).toBeVisible()
  })
})
