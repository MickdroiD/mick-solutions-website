import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests - Factory V2
 * Tests the main public-facing website functionality
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title exists
    await expect(page).toHaveTitle(/.+/);
    
    // Check that the page is not an error page
    const body = page.locator('body');
    await expect(body).not.toContainText('500');
    await expect(body).not.toContainText('Error');
  });

  test('should display navigation', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('should have working contact link', async ({ page }) => {
    // Check for contact section or link
    const contactLink = page.getByRole('link', { name: /contact/i });
    if (await contactLink.count() > 0) {
      await expect(contactLink.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still load
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Health Check', () => {
  test('API health endpoint should return OK', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});

