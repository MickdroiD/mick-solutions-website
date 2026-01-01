import { test, expect } from '@playwright/test';

/**
 * Admin E2E Tests - Factory V2
 * Tests the admin authentication and basic admin functionality
 */

test.describe('Admin Authentication', () => {
  test('should show login page when accessing admin', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show PIN input form
    const pinInput = page.locator('input[type="password"], input[type="text"]').first();
    await expect(pinInput).toBeVisible();
  });

  test('should reject invalid PIN', async ({ page }) => {
    await page.goto('/admin');
    
    // Enter invalid PIN
    const pinInput = page.locator('input').first();
    await pinInput.fill('000000');
    
    // Try to submit
    const submitButton = page.getByRole('button', { name: /connexion|valider|submit|login/i });
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should show error message
      await expect(page.locator('body')).toContainText(/incorrect|invalide|error/i);
    }
  });

  test('should redirect to admin V2 with valid PIN', async ({ page }) => {
    // Get PIN from environment or use test PIN
    const adminPin = process.env.ADMIN_PASSWORD || process.env.TEST_ADMIN_PIN;
    
    if (!adminPin) {
      test.skip();
      return;
    }

    await page.goto('/admin');
    
    // Enter valid PIN
    const pinInput = page.locator('input').first();
    await pinInput.fill(adminPin);
    
    // Submit
    const submitButton = page.getByRole('button', { name: /connexion|valider|submit|login/i });
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should redirect to admin/v2
      await expect(page).toHaveURL(/admin\/v2/);
    }
  });
});

test.describe('Admin V2 Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no PIN available
    const adminPin = process.env.ADMIN_PASSWORD || process.env.TEST_ADMIN_PIN;
    if (!adminPin) {
      test.skip();
      return;
    }

    // Login first
    await page.goto('/admin');
    const pinInput = page.locator('input').first();
    await pinInput.fill(adminPin);
    
    const submitButton = page.getByRole('button', { name: /connexion|valider|submit|login/i });
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForURL(/admin\/v2/);
    }
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin/v2');
    
    // Check for admin interface elements
    const sidebar = page.locator('aside, [role="navigation"]');
    await expect(sidebar.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have configuration panel', async ({ page }) => {
    await page.goto('/admin/v2');
    
    // Look for configuration or settings elements
    const configElements = page.getByText(/configuration|settings|paramètres/i);
    await expect(configElements.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin API', () => {
  test('should return 401 for unauthenticated config request', async ({ request }) => {
    const response = await request.get('/api/admin/config');
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthenticated leads request', async ({ request }) => {
    const response = await request.get('/api/admin/leads');
    expect(response.status()).toBe(401);
  });
});

