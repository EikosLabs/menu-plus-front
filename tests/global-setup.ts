import { FullConfig } from '@playwright/test';

const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:5000/api';

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  userName: string;
}

const testUsers: TestUser[] = [
  {
    email: 'test@menuplus.dev',
    password: 'TestPassword123!',
    fullName: 'Test User',
    userName: 'testuser',
  },
  {
    email: 'admin@menuplus.dev',
    password: 'AdminPassword123!',
    fullName: 'Admin User',
    userName: 'adminuser',
  },
];

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🔧 Global Setup: Starting...');
  console.log(`📡 API URL: ${API_URL}`);

  // Check if the backend is running
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    console.log('✅ Backend health check passed');
  } catch (error) {
    console.error('❌ Backend is not running. Please start the backend first.');
    console.error('   Run: docker start glyphium-test-menuplus-back');
    throw error;
  }

  // Create test users
  for (const user of testUsers) {
    try {
      // Try to register the user
      const registerResponse = await fetch(`${API_URL}/users/owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullName: user.fullName,
          Email: user.email,
          UserName: user.userName,
          Password: user.password,
        }),
      });

      if (registerResponse.ok) {
        console.log(`✅ Created test user: ${user.email}`);
      } else if (registerResponse.status === 409) {
        // User already exists - this is fine
        console.log(`ℹ️  Test user already exists: ${user.email}`);
      } else {
        const errorText = await registerResponse.text();
        console.warn(`⚠️  Could not create user ${user.email}: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error);
    }
  }

  console.log('✅ Global Setup: Complete');
}

export default globalSetup;
