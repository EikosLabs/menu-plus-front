import { test as base, Page, expect } from '@playwright/test';

// Test user credentials
export const TEST_USER = {
  email: 'test@menuplus.dev',
  password: 'TestPassword123!',
  fullName: 'Test User',
  userName: 'testuser',
};

export const ADMIN_USER = {
  email: 'admin@menuplus.dev',
  password: 'AdminPassword123!',
  fullName: 'Admin User',
  userName: 'adminuser',
};

// API URL
export const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:5000/api';

// Extended test fixture with authenticated page
export interface TestFixtures {
  authenticatedPage: Page;
  testUser: typeof TEST_USER;
  adminUser: typeof ADMIN_USER;
}

// Login helper function
async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  
  // Wait for the login form to be visible
  await page.waitForSelector('form', { state: 'visible' });
  
  // Fill in credentials using input names
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for successful login - should redirect to dashboard or show success
  await Promise.race([
    page.waitForURL('**/dashboard**', { timeout: 10000 }),
    page.waitForURL('**/onboarding**', { timeout: 10000 }),
    page.waitForSelector('[data-testid="login-success"]', { timeout: 10000 }),
  ]).catch(() => {
    // If neither redirect happens, check if we're still on login with an error
  });
}

// Export extended test with fixtures
export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    await use(TEST_USER);
  },

  adminUser: async ({}, use) => {
    await use(ADMIN_USER);
  },

  authenticatedPage: async ({ page }, use) => {
    // Login as test user
    await loginUser(page, TEST_USER.email, TEST_USER.password);
    
    // Use the authenticated page
    await use(page);
  },
});

export { expect };
