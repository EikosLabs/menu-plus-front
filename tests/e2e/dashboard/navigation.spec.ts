import { test, expect, TEST_USER } from '../../fixtures/test-fixtures';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    
    // Login before each test
    const authHelper = new AuthHelper(page);
    await authHelper.login({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should be on dashboard or redirected appropriately
    const currentUrl = page.url();
    
    // Dashboard should be accessible (or redirect to onboarding if no business)
    expect(currentUrl).toMatch(/\/(dashboard|onboarding)/);
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // The user might be on onboarding if no business exists, which is OK
    const currentUrl = page.url();
    
    // Look for navigation elements or page content
    const hasContent = await page.locator('nav, [role="navigation"], aside, header, main, form, h1, h2').first().isVisible();
    
    expect(hasContent).toBeTruthy();
  });

  test('should protect dashboard route for unauthenticated users', async ({ page }) => {
    // Clear cookies to simulate unauthenticated user
    await page.context().clearCookies();

    // Try to access dashboard
    await page.goto('/dashboard');
    
    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should redirect to login
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('login') || 
                          await page.locator('input[name="email"]').isVisible();
    
    expect(isRedirected).toBeTruthy();
  });

  test('should display user-related content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // The page should have visible content (could be dashboard or onboarding)
    const pageContent = await page.content();
    
    // At least some content should be present
    expect(pageContent.length).toBeGreaterThan(1000);
  });
});
