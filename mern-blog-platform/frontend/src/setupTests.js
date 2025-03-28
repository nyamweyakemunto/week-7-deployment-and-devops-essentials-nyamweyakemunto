// 1. Testing Library setup
import '@testing-library/jest-dom/extend-expect';

// 2. Mock server setup (MSW - Mock Service Worker)
import { server } from './mocks/server';

// 3. Environment variables for testing
process.env.REACT_APP_API_URL = 'http://test-api.example.com';

// 4. Global mocks
jest.mock('react-i18next', () => ({
  // Mock for react-i18next
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() }
  }),
  Trans: ({ children }) => children,
}));

// 5. Global test setup
beforeAll(() => {
  // Start the mock server
  server.listen({
    onUnhandledRequest: 'error',
  });

  // Mock window.matchMedia
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };

  // Mock scrollTo
  window.scrollTo = jest.fn();
});

// 6. Cleanup after each test
afterEach(() => {
  // Reset any runtime handlers
  server.resetHandlers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clean up the DOM
  document.body.innerHTML = '';
});

// 7. Cleanup after all tests
afterAll(() => {
  // Close the mock server
  server.close();
  
  // Restore original environment
  jest.restoreAllMocks();
});

// 8. Custom matchers
expect.extend({
  toBeInRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor}-${ceiling}`,
      pass,
    };
  },
});

// 9. Global test utilities
global.testUtils = {
  async waitForApiCall() {
    await new Promise(resolve => setTimeout(resolve, 0));
  },
  mockCurrentUser(user) {
    jest.spyOn(require('./contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      currentUser: user,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    }));
  },
};