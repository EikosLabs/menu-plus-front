import { Page, expect } from '@playwright/test';

const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:8080/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  userName?: string;
}

/**
 * Helper class for authentication-related test operations
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to login page and perform login
   */
  async login(credentials: LoginCredentials): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // Switch to password mode (login page defaults to magic link mode)
    const passwordModeBtn = this.page.locator('[data-testid="password-mode-button"], button:has-text("Contraseña"), button:has-text("Password")').first();
    if (await passwordModeBtn.isVisible()) {
      await passwordModeBtn.click();
      // Wait for password field to appear
      await this.page.waitForSelector('input[name="password"]', { timeout: 5000 });
    }

    // Fill in the form
    await this.page.fill('input[name="email"]', credentials.email);
    await this.page.fill('input[name="password"]', credentials.password);

    // Submit the form
    await this.page.click('button[type="submit"]');

    // Wait for navigation or success indicator with increased timeout
    await Promise.race([
      this.page.waitForURL('**/dashboard**', { timeout: 20000 }),
      this.page.waitForURL('**/onboarding**', { timeout: 20000 }),
      this.page.waitForSelector('[data-testid="login-success"]', { timeout: 20000 }),
    ]);
  }

  /**
   * Navigate to register page and create a new account
   */
  async register(data: RegisterData): Promise<void> {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');

    // Fill in the form
    await this.page.fill('input[name="email"]', data.email);
    
    if (data.userName) {
      await this.page.fill('input[name="userName"]', data.userName);
    }
    
    await this.page.fill('input[name="password"]', data.password);

    // Submit the form
    await this.page.click('button[type="submit"]');

    // Wait for successful registration - should redirect to onboarding
    await this.page.waitForURL('**/onboarding**', { timeout: 15000 });
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // Try clicking a logout button if it exists
    const logoutButton = this.page.locator('[data-testid="logout-button"], a[href*="logout"], button:has-text("Cerrar sesión"), button:has-text("Logout")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForURL('**/login**', { timeout: 10000 });
    } else {
      // Fallback: clear cookies and navigate to login
      await this.page.context().clearCookies();
      await this.page.goto('/login');
    }
  }

  /**
   * Check if the user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const cookies = await this.page.context().cookies();
    return cookies.some(cookie => 
      cookie.name === 'auth_token' || 
      cookie.name === 'token' ||
      cookie.name.includes('auth')
    );
  }

  /**
   * Wait for the login page to be fully loaded
   */
  async waitForLoginPage(): Promise<void> {
    await this.page.waitForURL('**/login**');
    await this.page.waitForSelector('input[name="email"]');
    await this.page.waitForSelector('input[name="password"]');
  }

  /**
   * Wait for the register page to be fully loaded
   */
  async waitForRegisterPage(): Promise<void> {
    await this.page.waitForURL('**/register**');
    await this.page.waitForSelector('input[name="email"]');
    await this.page.waitForSelector('input[name="password"]');
  }

  /**
   * Get validation error message for a field
   */
  async getFieldError(fieldName: string): Promise<string | null> {
    const errorSelector = `[data-testid="${fieldName}-error"], [id="${fieldName}"] + .text-red-500, input[name="${fieldName}"] ~ .text-red-500`;
    const errorElement = this.page.locator(errorSelector).first();
    
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  /**
   * Check if there's a general form error displayed
   */
  async hasFormError(): Promise<boolean> {
    const errorAlert = this.page.locator('[data-testid="error-alert"], [role="alert"], .bg-red-100, .text-red-500');
    return await errorAlert.isVisible();
  }

  /**
   * Get the general form error message
   */
  async getFormError(): Promise<string | null> {
    const errorAlert = this.page.locator('[data-testid="error-alert"], [role="alert"]').first();
    
    if (await errorAlert.isVisible()) {
      return await errorAlert.textContent();
    }
    return null;
  }

  /**
   * Create a user via API (for test setup)
   */
  static async createUserViaAPI(data: RegisterData): Promise<boolean> {
    try {
      console.log(`Creating user via API at ${API_URL}/users/owner`);
      const response = await fetch(`${API_URL}/users/owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullName: data.fullName || data.email.split('@')[0],
          Email: data.email,
          UserName: data.userName || data.email.split('@')[0],
          Password: data.password,
        }),
      });

      if (!response.ok && response.status !== 409) {
        console.error(`Failed to create user: ${response.status} ${response.statusText}`);
        const text = await response.text().catch(() => 'Unable to read response');
        console.error('Response:', text);
      }

      return response.ok || response.status === 409; // 409 = already exists
    } catch (error) {
      console.error('Error creating user via API:', error);
      return false;
    }
  }

  /**
   * Generate a unique email for testing
   */
  static generateTestEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test-${timestamp}-${random}@menuplus.dev`;
  }
}
