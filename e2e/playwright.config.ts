import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'mvn --batch-mode test-compile spring-boot:run -Dspring-boot.run.useTestClasspath=true -Dspring-boot.run.profiles=e2e',
      cwd: '../backend',
      url: 'http://127.0.0.1:8080/actuator/health',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      cwd: '../frontend',
      url: 'http://127.0.0.1:5173',
      timeout: 60_000,
      reuseExistingServer: !process.env.CI
    }
  ]
});
