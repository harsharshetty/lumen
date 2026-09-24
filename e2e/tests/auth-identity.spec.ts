import { expect, test, type Browser } from '@playwright/test';

const identityHeaders = (subject: string, name: string, provider: 'GOOGLE' | 'MICROSOFT', email: string) => ({
  extraHTTPHeaders: {
    'X-E2E-Subject': subject,
    'X-E2E-Name': name,
    'X-E2E-Provider': provider,
    'X-E2E-Email': email,
  },
});

const openIdentity = async (
  browser: Browser,
  subject: string,
  name: string,
  provider: 'GOOGLE' | 'MICROSOFT',
  email: string,
) => {
  const context = await browser.newContext(identityHeaders(subject, name, provider, email));
  const page = await context.newPage();
  await page.goto('/');
  return { context, page };
};

test('provisions once, reuses provider subject, and isolates the same email across providers', async ({ browser }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const subject = `identity-${suffix}`;
  const email = `shared-${suffix}@example.test`;
  const learnerName = `Identity learner ${suffix}`;

  const google = await openIdentity(browser, subject, 'Google identity', 'GOOGLE', email);
  await expect(google.page.getByRole('heading', { name: 'Add your first learner' })).toBeVisible();
  const firstMe = await google.page.evaluate(async () => {
    const response = await fetch('/api/me');
    return { status: response.status, body: await response.json() as { displayName: string } };
  });
  expect(firstMe).toEqual({ status: 200, body: { displayName: 'Google identity' } });

  await google.page.getByRole('button', { name: 'Add learner' }).click();
  await google.page.getByLabel('Learner name').fill(learnerName);
  await google.page.getByRole('button', { name: 'Create learner' }).click();
  await expect(google.page.getByRole('heading', { name: `Choose curricula for ${learnerName}` })).toBeVisible();

  const googleAgain = await openIdentity(browser, subject, 'Changed client name', 'GOOGLE', email);
  await expect(googleAgain.page.getByText(learnerName)).toBeVisible();
  const reusedMe = await googleAgain.page.evaluate(async () => (await (await fetch('/api/me')).json()) as { displayName: string });
  expect(reusedMe.displayName).toBe('Google identity');

  const microsoft = await openIdentity(browser, subject, 'Microsoft identity', 'MICROSOFT', email);
  await expect(microsoft.page.getByRole('heading', { name: 'Add your first learner' })).toBeVisible();
  await expect(microsoft.page.getByText(learnerName)).toHaveCount(0);
  const microsoftLearners = await microsoft.page.evaluate(async () => (await (await fetch('/api/learners')).json()) as unknown[]);
  expect(microsoftLearners).toEqual([]);
  const microsoftMe = await microsoft.page.evaluate(async () => (await (await fetch('/api/me')).json()) as { displayName: string });
  expect(microsoftMe.displayName).toBe('Microsoft identity');

  await google.context.close();
  await googleAgain.context.close();
  await microsoft.context.close();
});

test('rejects unauthenticated API access and does not accept client identity query parameters', async ({ browser, request }) => {
  const unauthenticated = await request.get('/api/me', { maxRedirects: 0 });
  expect(unauthenticated.status()).toBe(403);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const owner = await openIdentity(browser, `owner-${suffix}`, 'Boundary owner', 'GOOGLE', `owner-${suffix}@example.test`);
  await owner.page.getByRole('button', { name: 'Add learner' }).click();
  await owner.page.getByLabel('Learner name').fill(`Boundary learner ${suffix}`);
  await owner.page.getByRole('button', { name: 'Create learner' }).click();

  const attacker = await openIdentity(browser, `attacker-${suffix}`, 'Boundary attacker', 'GOOGLE', `attacker-${suffix}@example.test`);
  const spoofed = await attacker.page.evaluate(async (ownerSubject) => {
    const response = await fetch(`/api/learners?subject=${encodeURIComponent(ownerSubject)}&provider=GOOGLE`);
    return { status: response.status, body: await response.json() as unknown[] };
  }, `owner-${suffix}`);
  expect(spoofed.status).toBe(200);
  expect(spoofed.body).toEqual([]);

  await owner.context.close();
  await attacker.context.close();
});
