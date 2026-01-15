# E2E Tests

## Running Tests

### On VPS (Production Testing)
```bash
cd /home/ubuntu/menu-plus/menu-plus-front
./run-tests.sh
```

### Local Development
```bash
# Start backend
docker start menusesqr-back

# Start frontend dev server with test configuration
PUBLIC_API_URL="/api" API_BACKEND_URL="http://localhost:8080" npm run dev

# Run tests in separate terminal
npm test
```

### Running Specific Tests
```bash
# Run only login tests
npx playwright test tests/e2e/auth/login.spec.ts

# Run with debug mode
npx playwright test --debug

# Run with headed mode (show browser)
npx playwright test --headed
```

## Configuration

### Environment Variables

Tests use `.env.test` which configures:

| Variable | Value | Purpose |
|-----------|-------|---------|
| `PUBLIC_API_URL` | `/api` | API endpoint - uses Vite proxy to avoid CORS issues |
| `API_BACKEND_URL` | `http://localhost:8080` | Backend target for Vite proxy |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:4321` | Base URL for Playwright navigation |

### Why Use Proxy?

By setting `PUBLIC_API_URL=/api`, browser requests go to `http://localhost:4321/api/*`, which Vite proxies to `http://localhost:8080/api/*`. This avoids CORS issues since requests appear same-origin to the browser.

If using direct URL like `http://localhost:8080/api`, the browser would make cross-origin requests, which require the backend to have proper CORS headers for `http://localhost:4321`.

### Test Architecture

```
Browser → http://localhost:4321/api/* (PUBLIC_API_URL=/api)
           ↓
      Vite Dev Server Proxy
           ↓
     http://localhost:8080/api/* (API_BACKEND_URL)
           ↓
      Backend Container (menusesqr-back)
```

## Test Users

Global setup creates these users automatically:

| Email | Password | Full Name | Username | Created By |
|-------|----------|-----------|----------|------------|
| test@menuplus.dev | TestPassword123! | Test User | testuser | global-setup.ts |
| admin@menuplus.dev | AdminPassword123! | Admin User | adminuser | global-setup.ts |

Note: If users already exist (409 response), setup continues normally.

## Test Categories

| Category | Description | Test Files |
|----------|-------------|------------|
| **Authentication** | Login, logout, registration | `auth/login.spec.ts`, `auth/logout.spec.ts` |
| **Onboarding** | New user flow | `onboarding/flow.spec.ts` |
| **Dashboard** | Navigation, content | `dashboard/navigation.spec.ts` |
| **Business** | CRUD operations | `business/crud.spec.ts` |
| **Menu Management** | Items, sections | `menu/items.spec.ts`, `menu/sections.spec.ts` |
| **Public Pages** | Landing, menu view | `public/landing.spec.ts`, `public/menu-view.spec.ts` |

## Troubleshooting

### Tests Fail with "Connection Error" or "Error de Conexión"

**Symptoms:**
- Login form shows error alert
- Page stays on `/login` after submitting credentials

**Solutions:**

1. **Verify backend is running:**
   ```bash
   docker ps | grep menusesqr-back
   ```

2. **Check API health:**
   ```bash
   curl http://localhost:8080/api/health
   # Should return: OK or 200 status
   ```

3. **Verify proxy configuration:**
   ```bash
   # .env.local should have:
   PUBLIC_API_URL=/api
   ```

4. **Check if using proxy URL:**
   - ✅ `PUBLIC_API_URL=/api` - Correct (uses proxy, no CORS)
   - ❌ `PUBLIC_API_URL=http://localhost:8080/api` - Incorrect (CORS issues)

5. **Restart frontend dev server:**
   ```bash
   pkill -f "astro dev"
   PUBLIC_API_URL="/api" API_BACKEND_URL="http://localhost:8080" npm run dev
   ```

### Tests Timeout or Hang

**Symptoms:**
- Tests show timeout errors
- Browser waits indefinitely

**Solutions:**

1. **Check backend response time:**
   ```bash
   time curl http://localhost:8080/api/health
   ```

2. **Check browser console for errors:**
   - Run tests in debug mode: `npm run test:debug`
   - Open DevTools and check Console tab

3. **Increase timeout (if needed):**
   Edit `playwright.config.ts` and increase `timeout: 30000`

### Global Setup Fails

**Symptoms:**
- `npm test` fails immediately
- Error: "Backend is not running"

**Solutions:**

1. **Start backend:**
   ```bash
   docker start menusesqr-back
   # Wait a few seconds for startup
   ```

2. **Verify backend port mapping:**
   ```bash
   docker port menusesqr-back
   # Should show: 127.0.0.1:8080->8080/tcp
   ```

3. **Check backend logs:**
   ```bash
   docker logs menusesqr-back --tail 50
   ```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on push/PR to main or develop branches via `.github/workflows/playwright.yml`:

1. Starts PostgreSQL container
2. Starts MinIO container
3. Creates MinIO bucket
4. Clones and builds backend
5. Starts backend with Docker config
6. Runs Playwright tests against `http://localhost:5000/api`

### VPS Deployment Script

The `run-tests.sh` script:

1. Stops production frontend container
2. Starts dev server with test configuration
3. Runs E2E tests
4. Restarts production frontend
5. Minimal downtime (~10 seconds)

## Test Data Persistence

### Cookies/LocalStorage
- Each test clears cookies in `beforeEach()`
- Tests are isolated and independent

### Test Users
- Created via global-setup before all tests
- Persist between test runs (409 = already exists is OK)
- Not deleted between runs (ensures consistency)

## Development Tips

### Watch Mode
```bash
# Run tests in watch mode (rerun on changes)
npx playwright test --watch
```

### Update Snapshots
```bash
# Update visual/screenshot snapshots
npx playwright test --update-snapshots
```

### Show Report
```bash
# Open HTML report after tests
npx playwright show-report
```

## Maintenance

### Update Test Credentials

If backend password policy changes, update:
1. `tests/fixtures/test-fixtures.ts` - `TEST_USER` and `ADMIN_USER`
2. `tests/global-setup.ts` - `testUsers` array

### Add New Test User

Add to both files:
```typescript
// tests/fixtures/test-fixtures.ts
export const NEW_USER = {
  email: 'new@menuplus.dev',
  password: 'NewPassword123!',
  fullName: 'New User',
  userName: 'newuser',
};

// tests/global-setup.ts
const testUsers: TestUser[] = [
  // ... existing users
  {
    email: 'new@menuplus.dev',
    password: 'NewPassword123!',
    fullName: 'New User',
    userName: 'newuser',
  },
];
```
