# Story 5.2: Unit and Integration Testing

## Story Details
- **Stage**: 5 - Integration, Testing & Performance
- **Priority**: Critical
- **Estimated Hours**: 8-10 hours
- **Dependencies**: Story 5.1 (API Routes)

## Objective
Implement comprehensive unit and integration testing for all components, utilities, and API endpoints. Achieve minimum 80% code coverage and ensure all critical paths are tested. Set up continuous integration to run tests automatically.

## Acceptance Criteria
- [ ] Unit tests for all utility functions
- [ ] Component testing with React Testing Library
- [ ] API endpoint integration tests
- [ ] E2E tests for critical user flows
- [ ] Minimum 80% code coverage
- [ ] Test data factories and fixtures
- [ ] Mocking strategies for external services
- [ ] Performance testing for heavy operations
- [ ] Accessibility testing
- [ ] Multi-language testing
- [ ] CI/CD pipeline with automated testing
- [ ] Test reporting and metrics

## Implementation Steps

### 1. Set Up Testing Infrastructure

#### Update `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "jest --testMatch='**/*.a11y.test.{ts,tsx}'",
    "test:all": "npm run test:coverage && npm run test:e2e"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.0",
    "@playwright/test": "^1.40.0",
    "jest-axe": "^8.0.0",
    "msw": "^2.0.0"
  }
}
```

#### Create `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 2. Create Test Setup and Utilities

#### Create `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset any request handlers that are declared in tests
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

// Clean up after all tests are done
afterAll(() => {
  server.close()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/en',
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

#### Create `src/test/utils.tsx`
```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { NextIntlClientProvider } from 'next-intl'

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const messages = {
    tools: {
      uppercase: {
        inputPlaceholder: 'Enter text',
        outputPlaceholder: 'Output',
      },
    },
  }

  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### 3. Unit Tests for Text Manipulation Utilities

#### Create `src/lib/text-case/__tests__/converters.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { caseConverters, detectCase } from '../converters'

describe('caseConverters', () => {
  describe('uppercase', () => {
    it('converts text to uppercase', () => {
      expect(caseConverters.uppercase('hello world')).toBe('HELLO WORLD')
      expect(caseConverters.uppercase('Hello World')).toBe('HELLO WORLD')
      expect(caseConverters.uppercase('123 abc')).toBe('123 ABC')
    })

    it('handles unicode characters', () => {
      expect(caseConverters.uppercase('café')).toBe('CAFÉ')
      expect(caseConverters.uppercase('привет')).toBe('ПРИВЕТ')
      expect(caseConverters.uppercase('😀 hello')).toBe('😀 HELLO')
    })

    it('handles empty strings', () => {
      expect(caseConverters.uppercase('')).toBe('')
    })
  })

  describe('titleCase', () => {
    it('converts text to title case', () => {
      expect(caseConverters.titleCase('hello world')).toBe('Hello World')
      expect(caseConverters.titleCase('HELLO WORLD')).toBe('Hello World')
    })

    it('handles minor words option', () => {
      expect(
        caseConverters.titleCase('the quick brown fox and the lazy dog', {
          minorWords: true,
        })
      ).toBe('The Quick Brown Fox and the Lazy Dog')
    })

    it('always capitalizes first word', () => {
      expect(
        caseConverters.titleCase('the beginning', { minorWords: true })
      ).toBe('The Beginning')
    })
  })

  describe('camelCase', () => {
    it('converts text to camelCase', () => {
      expect(caseConverters.camelCase('hello world')).toBe('helloWorld')
      expect(caseConverters.camelCase('Hello World')).toBe('helloWorld')
      expect(caseConverters.camelCase('hello-world')).toBe('helloWorld')
      expect(caseConverters.camelCase('hello_world')).toBe('helloWorld')
    })

    it('removes special characters', () => {
      expect(caseConverters.camelCase('hello@world!')).toBe('helloWorld')
      expect(caseConverters.camelCase('hello.world')).toBe('helloWorld')
    })
  })

  describe('snakeCase', () => {
    it('converts text to snake_case', () => {
      expect(caseConverters.snakeCase('hello world')).toBe('hello_world')
      expect(caseConverters.snakeCase('HelloWorld')).toBe('hello_world')
      expect(caseConverters.snakeCase('hello-world')).toBe('hello_world')
    })
  })

  describe('alternatingCase', () => {
    it('alternates case starting with uppercase', () => {
      expect(caseConverters.alternatingCase('hello world')).toBe('HeLlO wOrLd')
    })

    it('alternates case starting with lowercase', () => {
      expect(caseConverters.alternatingCase('hello world', false)).toBe(
        'hElLo WoRlD'
      )
    })

    it('ignores non-letter characters', () => {
      expect(caseConverters.alternatingCase('hello 123 world')).toBe(
        'HeLlO 123 wOrLd'
      )
    })
  })
})

describe('detectCase', () => {
  it('detects uppercase', () => {
    expect(detectCase('HELLO WORLD')).toBe('uppercase')
    expect(detectCase('ABC123')).toBe('uppercase')
  })

  it('detects lowercase', () => {
    expect(detectCase('hello world')).toBe('lowercase')
    expect(detectCase('abc123')).toBe('lowercase')
  })

  it('detects camelCase', () => {
    expect(detectCase('helloWorld')).toBe('camelCase')
    expect(detectCase('thisIsCamelCase')).toBe('camelCase')
  })

  it('detects snake_case', () => {
    expect(detectCase('hello_world')).toBe('snakeCase')
    expect(detectCase('this_is_snake_case')).toBe('snakeCase')
  })

  it('returns null for empty or mixed case', () => {
    expect(detectCase('')).toBe(null)
    expect(detectCase('Hello World')).toBe('titleCase')
  })
})
```

### 4. Component Testing

#### Create `src/components/tools/case-converters/__tests__/uppercase-tool.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { UppercaseTool } from '../uppercase-tool'
import userEvent from '@testing-library/user-event'

describe('UppercaseTool', () => {
  it('renders input and output areas', () => {
    render(<UppercaseTool />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Output')).toBeInTheDocument()
  })

  it('converts text to uppercase in real-time', async () => {
    const user = userEvent.setup()
    render(<UppercaseTool />)
    
    const input = screen.getByPlaceholderText('Enter text')
    const output = screen.getByPlaceholderText('Output')
    
    await user.type(input, 'hello world')
    
    await waitFor(() => {
      expect(output).toHaveValue('HELLO WORLD')
    })
  })

  it('handles copy button click', async () => {
    const user = userEvent.setup()
    const mockClipboard = {
      writeText: vi.fn(),
    }
    Object.assign(navigator, {
      clipboard: mockClipboard,
    })
    
    render(<UppercaseTool />)
    
    const input = screen.getByPlaceholderText('Enter text')
    await user.type(input, 'test')
    
    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('TEST')
  })

  it('clears output when input is cleared', async () => {
    const user = userEvent.setup()
    render(<UppercaseTool />)
    
    const input = screen.getByPlaceholderText('Enter text')
    const output = screen.getByPlaceholderText('Output')
    
    await user.type(input, 'hello')
    expect(output).toHaveValue('HELLO')
    
    await user.clear(input)
    expect(output).toHaveValue('')
  })
})
```

### 5. API Integration Tests

#### Create `src/app/api/v1/case/__tests__/route.test.ts`
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { POST, PUT, GET } from '../route'
import { NextRequest } from 'next/server'

describe('/api/v1/case', () => {
  describe('POST', () => {
    it('converts text successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'hello world',
          type: 'uppercase',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.converted).toBe('HELLO WORLD')
      expect(data.data.original).toBe('hello world')
      expect(data.data.type).toBe('uppercase')
    })

    it('validates required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'uppercase',
          // missing text field
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation Error')
    })

    it('handles invalid case type', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'hello',
          type: 'invalidType',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('respects text length limits', async () => {
      const longText = 'a'.repeat(100001)
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: longText,
          type: 'uppercase',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('PUT (batch)', () => {
    it('converts multiple texts', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: ['hello', 'world', 'test'],
          type: 'uppercase',
        }),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.results).toEqual(['HELLO', 'WORLD', 'TEST'])
      expect(data.meta.count).toBe(3)
    })

    it('enforces batch size limit', async () => {
      const texts = Array(101).fill('test')
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts,
          type: 'uppercase',
        }),
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET', () => {
    it('returns available case types', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/case', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.types).toBeInstanceOf(Array)
      expect(data.data.types.length).toBeGreaterThan(0)
      expect(data.data.types[0]).toHaveProperty('type')
      expect(data.data.types[0]).toHaveProperty('name')
      expect(data.data.types[0]).toHaveProperty('example')
    })
  })
})
```

### 6. E2E Tests with Playwright

#### Create `e2e/text-conversion.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test.describe('Text Case Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/uppercase')
  })

  test('converts text to uppercase', async ({ page }) => {
    // Type in input
    await page.fill('[data-testid="tool-input"]', 'hello world')
    
    // Check output
    await expect(page.locator('[data-testid="tool-output"]')).toHaveValue(
      'HELLO WORLD'
    )
  })

  test('copy button works', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-write'])
    
    // Type text
    await page.fill('[data-testid="tool-input"]', 'test text')
    
    // Click copy button
    await page.click('[data-testid="copy-button"]')
    
    // Check clipboard
    const clipboardText = await page.evaluate(() => 
      navigator.clipboard.readText()
    )
    expect(clipboardText).toBe('TEST TEXT')
    
    // Check toast notification
    await expect(page.locator('[role="status"]')).toContainText('Copied')
  })

  test('clear button clears both inputs', async ({ page }) => {
    // Type text
    await page.fill('[data-testid="tool-input"]', 'some text')
    
    // Click clear
    await page.click('[data-testid="clear-button"]')
    
    // Check both fields are empty
    await expect(page.locator('[data-testid="tool-input"]')).toHaveValue('')
    await expect(page.locator('[data-testid="tool-output"]')).toHaveValue('')
  })

  test('character counter updates', async ({ page }) => {
    await page.fill('[data-testid="tool-input"]', 'hello')
    
    await expect(page.locator('[data-testid="char-count"]')).toContainText('5')
    await expect(page.locator('[data-testid="word-count"]')).toContainText('1')
  })
})

test.describe('Multi-language Support', () => {
  test('switches language correctly', async ({ page }) => {
    await page.goto('/')
    
    // Click language switcher
    await page.click('[data-testid="language-switcher"]')
    
    // Select French
    await page.click('[data-testid="language-option-fr"]')
    
    // Check URL changed
    await expect(page).toHaveURL(/\/fr/)
    
    // Check content is in French
    await expect(page.locator('h1')).toContainText('Convertisseur')
  })

  test('preserves text when switching languages', async ({ page }) => {
    await page.goto('/tools/uppercase')
    
    // Enter text
    await page.fill('[data-testid="tool-input"]', 'hello')
    
    // Switch language
    await page.click('[data-testid="language-switcher"]')
    await page.click('[data-testid="language-option-fr"]')
    
    // Check text is preserved
    await expect(page.locator('[data-testid="tool-input"]')).toHaveValue(
      'hello'
    )
    await expect(page.locator('[data-testid="tool-output"]')).toHaveValue(
      'HELLO'
    )
  })
})
```

### 7. Accessibility Tests

#### Create `src/components/tools/__tests__/accessibility.test.tsx`
```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@/test/utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import { UppercaseTool } from '../case-converters/uppercase-tool'
import { MultiCaseTool } from '../case-converters/multi-case-tool'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('UppercaseTool has no accessibility violations', async () => {
    const { container } = render(<UppercaseTool />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('MultiCaseTool has no accessibility violations', async () => {
    const { container } = render(<MultiCaseTool />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA labels', () => {
    const { getByLabelText } = render(<UppercaseTool />)
    
    expect(getByLabelText('Input text')).toBeInTheDocument()
    expect(getByLabelText('Output text')).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const { getByTestId } = render(<UppercaseTool />)
    
    const input = getByTestId('tool-input')
    const copyButton = getByTestId('copy-button')
    
    // Tab to copy button
    input.focus()
    userEvent.tab()
    
    expect(document.activeElement).toBe(copyButton)
  })
})
```

### 8. Performance Tests

#### Create `src/lib/__tests__/performance.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { caseConverters } from '@/lib/text-case/converters'
import { analyzers } from '@/lib/analysis/text-analyzers'

describe('Performance Tests', () => {
  it('handles large text efficiently', () => {
    const largeText = 'a'.repeat(10000) + ' ' + 'b'.repeat(10000)
    
    const start = performance.now()
    caseConverters.uppercase(largeText)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100) // Should complete in under 100ms
  })

  it('text analysis performs well', () => {
    const text = 'Lorem ipsum '.repeat(1000)
    
    const start = performance.now()
    analyzers.fullAnalysis(text)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(500) // Should complete in under 500ms
  })

  it('batch operations scale linearly', () => {
    const texts10 = Array(10).fill('test text')
    const texts100 = Array(100).fill('test text')
    
    const start10 = performance.now()
    texts10.map(t => caseConverters.uppercase(t))
    const duration10 = performance.now() - start10
    
    const start100 = performance.now()
    texts100.map(t => caseConverters.uppercase(t))
    const duration100 = performance.now() - start100
    
    // Should scale roughly linearly (with some overhead)
    expect(duration100).toBeLessThan(duration10 * 15)
  })
})
```

### 9. Test Data Factories

#### Create `src/test/factories/index.ts`
```typescript
import { faker } from '@faker-js/faker'

export const textFactory = {
  sentence: (options?: { words?: number }) => 
    faker.lorem.sentence(options?.words),
  
  paragraph: (options?: { sentences?: number }) =>
    faker.lorem.paragraph(options?.sentences),
  
  email: () => faker.internet.email(),
  
  url: () => faker.internet.url(),
  
  json: () => JSON.stringify({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
  }),
  
  csv: (rows = 5) => {
    const headers = ['Name', 'Email', 'Age', 'City']
    const data = [headers.join(',')]
    
    for (let i = 0; i < rows; i++) {
      data.push([
        faker.person.fullName(),
        faker.internet.email(),
        faker.number.int({ min: 18, max: 80 }),
        faker.location.city(),
      ].join(','))
    }
    
    return data.join('\n')
  },
  
  code: (language: 'javascript' | 'html' | 'css' = 'javascript') => {
    const samples = {
      javascript: `
function ${faker.hacker.noun()}() {
  const ${faker.hacker.noun()} = "${faker.hacker.phrase()}";
  console.log(${faker.hacker.noun()});
  return ${faker.number.int()};
}`,
      html: `
<div class="${faker.hacker.noun()}">
  <h1>${faker.company.catchPhrase()}</h1>
  <p>${faker.lorem.paragraph()}</p>
</div>`,
      css: `
.${faker.hacker.noun()} {
  color: ${faker.color.hex()};
  margin: ${faker.number.int({ max: 20 })}px;
  padding: ${faker.number.int({ max: 20 })}px;
}`
    }
    
    return samples[language]
  },
}
```

### 10. CI/CD Configuration

#### Create `.github/workflows/test.yml`
```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        flags: unittests
        name: codecov-umbrella
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload Playwright report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
    
    - name: Check build
      run: npm run build
```

## Testing & Verification

1. Run all test suites
2. Verify coverage meets 80% threshold
3. Check E2E tests pass in CI
4. Validate accessibility tests
5. Review performance benchmarks
6. Test in multiple browsers

## Success Indicators
- ✅ 80%+ code coverage achieved
- ✅ All critical paths tested
- ✅ E2E tests cover main user flows
- ✅ No accessibility violations
- ✅ Performance benchmarks met
- ✅ CI/CD pipeline green

## Next Steps
Proceed to Story 5.3: Performance Optimization

## Notes
- Add visual regression testing
- Consider contract testing for APIs
- Add mutation testing
- Monitor test execution time
- Set up test result dashboards