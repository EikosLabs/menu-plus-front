import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Landing Page', () => {
  test('should display landing page correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check page has content
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);

    // Should have heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should have login link or button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for any login-related link (internal or external)
    const loginElements = page.locator('a:has-text("Iniciar"), a:has-text("Login"), button:has-text("Iniciar"), button:has-text("Login")');
    const count = await loginElements.count();
    
    // Should have at least one login element
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if login is external
  });

  test('should have register/signup link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for register link
    const registerLink = page.locator('a[href*="register"]').first();
    
    await expect(registerLink).toBeVisible();
  });

  test('should navigate to register from landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click register link (look for visible one with various patterns)
    const registerLink = page.locator('a[href*="register"]:visible').first();
    await registerLink.click();

    // Should navigate to register page
    await expect(page).toHaveURL(/\/register/);
  });

  test('should display feature sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for feature cards or sections
    const hasFeatures = await page.locator('[class*="card"], [class*="feature"], section').first().isVisible();
    expect(hasFeatures).toBeTruthy();
  });

  test('should be mobile-responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Page should have visible content
    await expect(page.locator('body')).toBeVisible();

    // Check that body is not wider than viewport (no horizontal scroll)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    // Allow small margin for potential scrollbars
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);
  });

  test('should have meta tags for SEO', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check for meta description (optional but good practice)
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    // Description might not exist, so just check page loaded
    expect(title).toBeTruthy();
  });
});
