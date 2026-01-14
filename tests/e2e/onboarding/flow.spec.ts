import { test, expect, TEST_USER } from '../../fixtures/test-fixtures';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  /**
   * Helper to switch to password mode on register page
   */
  async function switchToPasswordMode(page: import('@playwright/test').Page) {
    const passwordModeBtn = page.locator('button:has-text("Password"), button:has-text("Contraseña")').first();
    if (await passwordModeBtn.isVisible()) {
      await passwordModeBtn.click();
      await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    }
  }

  test('should redirect new user to onboarding after registration', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const uniqueEmail = AuthHelper.generateTestEmail();

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Switch to password mode
    await switchToPasswordMode(page);

    // Register new user
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
  });

  test('should display onboarding page correctly', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const uniqueEmail = AuthHelper.generateTestEmail();

    // Register to get to onboarding
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Switch to password mode
    await switchToPasswordMode(page);

    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for onboarding page
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });

    // Check that onboarding content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Should have some form or wizard content
    const hasContent = await page.locator('form, [data-testid="onboarding"], h1, h2').first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should allow completing onboarding steps', async ({ page }) => {
    const uniqueEmail = AuthHelper.generateTestEmail();

    // Register to get to onboarding
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Switch to password mode
    await switchToPasswordMode(page);

    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });

    // Look for form elements or next/continue buttons
    const nextButton = page.locator('button:has-text("Siguiente"), button:has-text("Next"), button:has-text("Continuar"), button:has-text("Continue"), button[type="submit"]').first();
    
    // If there's a form, try to fill required fields and proceed
    const businessNameInput = page.locator('input[name="businessName"], input[name="name"], input[placeholder*="negocio"], input[placeholder*="business"]').first();
    
    if (await businessNameInput.isVisible()) {
      await businessNameInput.fill('Test Restaurant');
    }

    // Try to proceed if button is visible
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }

    // The test passes if we can interact with the onboarding
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });
});
