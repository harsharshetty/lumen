import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: 'signin-visual.spec.ts',
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
      command: 'mvn --batch-mode test-compile dependency:build-classpath -DincludeScope=test -Dmdep.outputFile=target/e2e-classpath.txt && mkdir -p ../e2e/test-results && java -Dspring.profiles.active=e2e -Dspring.datasource.url="$DATABASE_URL" -Dspring.datasource.username="$DATABASE_USERNAME" -Dspring.datasource.password="$DATABASE_PASSWORD" -Dspring.datasource.driver-class-name=org.postgresql.Driver -cp "target/test-classes:target/classes:$(cat target/e2e-classpath.txt)" com.lumen.e2e.E2eLumenApplication > ../e2e/test-results/backend.log 2>&1',
      cwd: '../backend',
      url: 'http://127.0.0.1:8080/actuator/health',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
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
