import { test, expect } from '@playwright/test'

/**
 * These tests set up auth cookies to bypass middleware,
 * then mock API responses to verify the restaurant owner UI.
 */

async function setupRestaurantOwnerAuth(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'mock-access-token',
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

  // Also set localStorage
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-access-token')
    localStorage.setItem('refreshToken', 'mock-refresh-token')
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'owner-1',
        email: 'owner@example.com',
        role: 'RESTAURANT_OWNER',
        displayName: 'Test Owner',
      })
    )
  })
}

test.describe('Restaurant owner section', () => {
  test('can access /restaurant/dashboard', async ({ page }) => {
    await setupRestaurantOwnerAuth(page)

    await page.route('**/api/v1/restaurants', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'rest-1',
              name: 'Test Restaurant',
              address: '123 Main St',
              phone: '+1 555 0000',
              cuisine: 'Italian',
            },
          ],
        }),
      })
    })

    await page.route('**/api/v1/restaurants/rest-1/dishes', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/restaurant/dashboard')
    await expect(page.getByText('Test Restaurant')).toBeVisible({ timeout: 10000 })
  })

  test('sidebar shows restaurant nav items', async ({ page }) => {
    await setupRestaurantOwnerAuth(page)

    await page.route('**/api/v1/restaurants**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/restaurant/dashboard')

    await expect(page.getByRole('link', { name: /restaurant info/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /menu/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /media/i })).toBeVisible()
  })

  test('can navigate to /restaurant/info', async ({ page }) => {
    await setupRestaurantOwnerAuth(page)

    await page.route('**/api/v1/restaurants', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'rest-1',
              name: 'My Restaurant',
              address: '456 Elm St',
              phone: '+1 555 1111',
            },
          ],
        }),
      })
    })

    await page.goto('/restaurant/info')
    await expect(page.getByText(/restaurant information/i)).toBeVisible({ timeout: 10000 })
  })

  test('unauthenticated user is redirected away from /restaurant', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/restaurant/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
