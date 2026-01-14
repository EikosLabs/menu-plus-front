import { test, expect, TEST_USER } from '../../fixtures/test-fixtures';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    
    // Ensure test user exists
    await AuthHelper.createUserViaAPI({
      email: TEST_USER.email,
      password: TEST_USER.password,
      fullName: TEST_USER.fullName,
      userName: TEST_USER.userName,
    });
  });

  test('should logout successfully from dashboard', async ({ page }) => {
    const authHelper = new AuthHelper(page);

    // First login using the helper (handles password mode switch)
    await authHelper.login({ email: TEST_USER.email, password: TEST_USER.password });

    // Perform logout
    await authHelper.logout();

    // After logout, trying to access dashboard should redirect to login
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    // Should either be on login page or see login elements
    const isLoggedOut = currentUrl.includes('login') || 
                        await page.locator('input[name="email"]').isVisible();
    
    expect(isLoggedOut).toBeTruthy();
  });

  test('should clear authentication cookies on logout', async ({ page }) => {
    const authHelper = new AuthHelper(page);

    // Login first using the helper
    await authHelper.login({ email: TEST_USER.email, password: TEST_USER.password });

    // Logout
    await authHelper.logout();

    // Check cookies are cleared
    const cookies = await page.context().cookies();
    const hasAuthCookie = cookies.some(c => 
      c.name.includes('auth') || c.name.includes('token')
    );

    // Auth cookies should be cleared
    expect(hasAuthCookie).toBeFalsy();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies();

    // Try to access a protected route
    await page.goto('/dashboard');
    
    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should be on login page or see login form
    const currentUrl = page.url();
    const isOnLoginPage = currentUrl.includes('login') || 
                          await page.locator('input[name="password"]').isVisible();
    
    expect(isOnLoginPage).toBeTruthy();
  });
});
