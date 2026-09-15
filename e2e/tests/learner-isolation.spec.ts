import { expect, test } from '@playwright/test';

const authenticatedContextOptions = (subject: string, name: string) => ({
  extraHTTPHeaders: {
    'X-E2E-Subject': subject,
    'X-E2E-Name': name,
  },
});

test('isolates one parent learner from another authenticated user', async ({ browser, request }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ownerSubject = `owner-${suffix}`;
  const otherSubject = `other-${suffix}`;
  const learnerName = `Isolation learner ${suffix}`;

  const unauthenticated = await request.get('/api/learners', { maxRedirects: 0 });
  expect(unauthenticated.status()).toBe(302);
  expect(unauthenticated.headers().location).toContain('/oauth2/authorization/google');

  const ownerContext = await browser.newContext(authenticatedContextOptions(ownerSubject, 'Owner A'));
  const ownerPage = await ownerContext.newPage();
  await ownerPage.goto('/');
  await expect(ownerPage.getByRole('heading', { name: 'Add your first learner' })).toBeVisible();

  await ownerPage.getByRole('button', { name: 'Add learner' }).click();
  await ownerPage.getByLabel('Learner name').fill(learnerName);
  await ownerPage.getByRole('button', { name: 'Create learner' }).click();
  await expect(ownerPage.getByRole('heading', { name: `Choose curricula for ${learnerName}` })).toBeVisible();

  const ownerLearners = await ownerPage.evaluate(async () => {
    const response = await fetch('/api/learners');
    return {
      status: response.status,
      body: await response.json() as Array<{ id: string; displayName: string }>,
    };
  });
  expect(ownerLearners.status).toBe(200);
  expect(ownerLearners.body).toHaveLength(1);
  expect(ownerLearners.body[0].displayName).toBe(learnerName);
  const learnerId = ownerLearners.body[0].id;

  await ownerPage.reload();
  await expect(ownerPage.getByRole('heading', { name: 'Learners' })).toBeVisible();
  await expect(ownerPage.getByText(learnerName)).toBeVisible();

  const otherContext = await browser.newContext(authenticatedContextOptions(otherSubject, 'User B'));
  const otherPage = await otherContext.newPage();
  await otherPage.goto('/');
  await expect(otherPage.getByRole('heading', { name: 'Add your first learner' })).toBeVisible();
  await expect(otherPage.getByText(learnerName)).toHaveCount(0);

  const isolationEvidence = await otherPage.evaluate(async (id) => {
    const listResponse = await fetch('/api/learners');
    const directReadResponse = await fetch(`/api/learners/${id}`);
    const tokenCookie = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : null;
    const mutationResponse = await fetch(
      `/api/learners/${id}/curricula/00000000-0000-0000-0000-000000000001`,
      {
        method: 'POST',
        headers: token ? { 'X-XSRF-TOKEN': token } : {},
      },
    );
    return {
      listStatus: listResponse.status,
      listBody: await listResponse.json() as unknown[],
      directReadStatus: directReadResponse.status,
      mutationStatus: mutationResponse.status,
      hadCsrfToken: token !== null,
    };
  }, learnerId);

  expect(isolationEvidence.listStatus).toBe(200);
  expect(isolationEvidence.listBody).toEqual([]);
  expect(isolationEvidence.directReadStatus).toBe(403);
  expect(isolationEvidence.hadCsrfToken).toBe(true);
  expect(isolationEvidence.mutationStatus).toBe(403);

  await ownerContext.close();
  await otherContext.close();
});
