import { test, expect, TEST_USER } from '../../fixtures/test-fixtures';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check page title or heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check email field is present (always visible)
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    
    // Check for register link
    const registerLink = page.locator('a[href*="register"]');
    await expect(registerLink).toBeVisible();
  });

  test('should switch to password mode and show password field', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Look for button to switch to password mode
    const passwordModeBtn = page.locator('button:has-text("Contraseña"), button:has-text("Password")').first();
    
    if (await passwordModeBtn.isVisible()) {
      await passwordModeBtn.click();
      await page.waitForTimeout(500);
      
      // Password field should now be visible
      await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    }
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Ensure test user exists
    await AuthHelper.createUserViaAPI({
      email: TEST_USER.email,
      password: TEST_USER.password,
      fullName: TEST_USER.fullName,
      userName: TEST_USER.userName,
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Switch to password mode if needed
    const passwordModeBtn = page.locator('button:has-text("Contraseña"), button:has-text("Password")').first();
    if (await passwordModeBtn.isVisible()) {
      await passwordModeBtn.click();
      await page.waitForTimeout(500);
    }

    // Fill in credentials
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or onboarding with longer timeout for server response
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test('should require password field', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Switch to password mode if needed
    const passwordModeBtn = page.locator('button:has-text("Contraseña"), button:has-text("Password")').first();
    if (await passwordModeBtn.isVisible()) {
      await passwordModeBtn.click();
      await page.waitForTimeout(500);
    }

    // Fill only email
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);

    // Submit form without password
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Should stay on login page
    expect(page.url()).toContain('login');
  });

  test('should have link to register page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Find and click register link
    const registerLink = page.locator('a[href*="register"]');
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // Should navigate to register page
    await expect(page).toHaveURL(/\/register/);
  });
});
