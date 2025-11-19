// jest.setup.js
import '@testing-library/jest-dom'
import fetchMock from 'jest-fetch-mock'
fetchMock.enableMocks()

// Global mock for React 18 act warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOMTestUtils.act is deprecated/.test(args[0]) ||
      /Warning: `ReactDOMTestUtils.act` is deprecated/.test(args[0])
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '',
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // remove `fill` boolean to avoid React non-boolean attribute warnings
    const { fill, ...rest } = props || {};
    // eslint-disable-next-line jsx-a11y/alt-text
    return (
      <img
        data-nimg="fill"
        decoding="async"
        loading="lazy"
        {...rest}
      />
    );
  },
}));