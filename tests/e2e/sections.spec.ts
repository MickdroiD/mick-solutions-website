import { test, expect } from '@playwright/test';

/**
 * Sections E2E Tests - Factory V2
 * Tests the various section types display correctly
 */

test.describe('Website Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Hero section', async ({ page }) => {
    // Hero section typically has a main heading and CTA
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should display Services section if exists', async ({ page }) => {
    const servicesSection = page.locator('section:has-text("Services"), section:has-text("services")');
    
    if (await servicesSection.count() > 0) {
      await expect(servicesSection.first()).toBeVisible();
    }
  });

  test('should display FAQ section if exists', async ({ page }) => {
    const faqSection = page.locator('section:has-text("FAQ"), section:has-text("Questions")');
    
    if (await faqSection.count() > 0) {
      await expect(faqSection.first()).toBeVisible();
      
      // Check for accordion or FAQ items
      const faqItems = faqSection.locator('[role="button"], button, details');
      if (await faqItems.count() > 0) {
        // Try to expand first item
        await faqItems.first().click();
      }
    }
  });

  test('should display Contact section if exists', async ({ page }) => {
    const contactSection = page.locator('section:has-text("Contact"), section#contact, [id*="contact"]');
    
    if (await contactSection.count() > 0) {
      await expect(contactSection.first()).toBeVisible();
      
      // Check for contact form
      const form = contactSection.locator('form');
      if (await form.count() > 0) {
        await expect(form.first()).toBeVisible();
      }
    }
  });

  test('should display Testimonials section if exists', async ({ page }) => {
    const testimonialsSection = page.locator('section:has-text("Témoignages"), section:has-text("Avis")');
    
    if (await testimonialsSection.count() > 0) {
      await expect(testimonialsSection.first()).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate to sections via anchor links', async ({ page }) => {
    await page.goto('/');
    
    // Find navigation links that point to sections
    const navLinks = page.locator('nav a[href^="#"], header a[href^="#"]');
    const count = await navLinks.count();
    
    if (count > 0) {
      // Click first anchor link
      await navLinks.first().click();
      
      // URL should contain hash
      await expect(page.url()).toContain('#');
    }
  });
});

test.describe('Footer', () => {
  test('should display footer', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should contain copyright text', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    const copyrightText = footer.locator(':has-text("©"), :has-text("droits")');
    
    if (await copyrightText.count() > 0) {
      await expect(copyrightText.first()).toBeVisible();
    }
  });
});

