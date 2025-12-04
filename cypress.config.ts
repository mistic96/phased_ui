import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
  },
  // Disable component testing for now, focus on e2e
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
