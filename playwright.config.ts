import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 1 : 0,

  // Single worker for faster local runs
  workers: 1,

  // Reporter to use
  reporter: [['list']],

  // Shorter timeout
  timeout: 60000,

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321',

    // No trace for faster runs
    trace: 'off',

    // Screenshot only on failure
    screenshot: 'only-on-failure',

    // No video for faster runs  
    video: 'off',
  },

  // Skip global setup for now - create users inline
  // globalSetup: './tests/global-setup.ts',

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Don't auto-start dev server (we'll run it manually)
  webServer: undefined,
});
