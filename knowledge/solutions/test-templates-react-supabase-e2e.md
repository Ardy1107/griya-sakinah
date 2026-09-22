# Test Templates — Pre-Built Patterns

## 1. React Component Test (Vitest + Testing Library)
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  // Arrange (shared setup)
  const mockOnClick = vi.fn()
  const defaultProps = { title: 'Test', onClick: mockOnClick }

  beforeEach(() => { vi.clearAllMocks() })

  it('renders correctly', () => {
    // Arrange
    render(<MyComponent {...defaultProps} />)
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', () => {
    // Arrange
    render(<MyComponent {...defaultProps} />)
    // Act
    fireEvent.click(screen.getByRole('button'))
    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<MyComponent {...defaultProps} loading={true} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

## 2. Custom Hook Test
```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter(0))
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0))
    act(() => result.current.increment())
    expect(result.current.count).toBe(1)
  })
})
```

## 3. Supabase Service Test
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    }
  }))
}))

const mockUser = { id: '1', email: 'test@example.com', role: 'admin' }
const mockSession = { access_token: 'token123', user: mockUser }

describe('UserService', () => {
  it('fetches user by id', async () => {
    const result = await userService.getUser('1')
    expect(result).toEqual(mockUser)
  })

  it('handles auth error', async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: null, error: { message: 'Invalid token' } })
    await expect(userService.getUser('1')).rejects.toThrow('Invalid token')
  })
})
```

## 4. API/Service Test
```javascript
import { describe, it, expect, vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

describe('apiService', () => {
  it('fetches data successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [1, 2, 3] })
    })
    const result = await apiService.getData()
    expect(result).toEqual([1, 2, 3])
    expect(fetch).toHaveBeenCalledWith('/api/data', expect.any(Object))
  })

  it('handles network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))
    await expect(apiService.getData()).rejects.toThrow('Network error')
  })

  it('handles 404', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 })
    await expect(apiService.getData()).rejects.toThrow()
  })
})
```

## 5. E2E Test (Playwright)
```javascript
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('successful login', async ({ page }) => {
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('#email', 'wrong@example.com')
    await page.fill('#password', 'wrong')
    await page.click('button[type="submit"]')
    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('logout flow', async ({ page }) => {
    // Login first
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    // Logout
    await page.click('#logout-button')
    await expect(page).toHaveURL('/login')
  })
})
```

## 6. Zustand Store Test
```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { useMyStore } from './useMyStore'

describe('useMyStore', () => {
  beforeEach(() => {
    useMyStore.setState({ count: 0, items: [] }) // Reset
  })

  it('initializes with default state', () => {
    const state = useMyStore.getState()
    expect(state.count).toBe(0)
    expect(state.items).toEqual([])
  })

  it('increments count', () => {
    useMyStore.getState().actions.increment()
    expect(useMyStore.getState().count).toBe(1)
  })

  it('adds item', () => {
    useMyStore.getState().actions.addItem({ id: '1', name: 'Test' })
    expect(useMyStore.getState().items).toHaveLength(1)
  })
})
```

## Test Naming Convention
```
describe('[Component/Module Name]')
  it('[action] [expected result]')
  it('[when condition] [expected behavior]')
```

## AAA Pattern (Always!)
```
// Arrange — Set up test data
// Act — Execute the action
// Assert — Verify the result
```
