import { expect, test, type Browser } from '@playwright/test';

const authenticatedContextOptions = (subject: string, name: string, learnerId?: string, accessLevel?: string) => ({
  extraHTTPHeaders: {
    'X-E2E-Subject': subject,
    'X-E2E-Name': name,
    ...(learnerId ? { 'X-E2E-Learner-Id': learnerId } : {}),
    ...(accessLevel ? { 'X-E2E-Access-Level': accessLevel } : {}),
  },
});

const csrfMutation = async (page: import('@playwright/test').Page, url: string, method = 'POST') => page.evaluate(async ({ target, verb }) => {
  const tokenCookie = document.cookie.split('; ').find((cookie) => cookie.startsWith('XSRF-TOKEN='));
  const token = tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : null;
  const response = await fetch(target, { method: verb, headers: token ? { 'X-XSRF-TOKEN': token } : {} });
  return { status: response.status, hadCsrfToken: token !== null };
}, { target: url, verb: method });

const createAccessContext = async (browser: Browser, subject: string, learnerId: string, accessLevel: string) => {
  const context = await browser.newContext(authenticatedContextOptions(subject, subject, learnerId, accessLevel));
  const page = await context.newPage();
  await page.goto('/');
  return { context, page };
};

test('isolates one parent learner from another authenticated user', async ({ browser, request }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ownerSubject = `owner-${suffix}`;
  const otherSubject = `other-${suffix}`;
  const learnerName = `Isolation learner ${suffix}`;

  const unauthenticated = await request.get('/api/learners', { maxRedirects: 0 });
  expect(unauthenticated.status()).toBe(403);

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
    return { status: response.status, body: await response.json() as Array<{ id: string; displayName: string }> };
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
    return { listStatus: listResponse.status, listBody: await listResponse.json() as unknown[], directReadStatus: directReadResponse.status };
  }, learnerId);
  expect(isolationEvidence.listStatus).toBe(200);
  expect(isolationEvidence.listBody).toEqual([]);
  expect(isolationEvidence.directReadStatus).toBe(403);
  const deniedMutation = await csrfMutation(otherPage, `/api/learners/${learnerId}/curricula/00000000-0000-0000-0000-000000000001`);
  expect(deniedMutation.hadCsrfToken).toBe(true);
  expect(deniedMutation.status).toBe(403);

  await ownerContext.close();
  await otherContext.close();
});

test('enforces viewer contributor and multiple-owner access through the browser boundary', async ({ browser }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const learnerName = `Access matrix ${suffix}`;
  const ownerContext = await browser.newContext(authenticatedContextOptions(`owner-matrix-${suffix}`, 'Matrix Owner'));
  const ownerPage = await ownerContext.newPage();
  await ownerPage.goto('/');
  await ownerPage.getByRole('button', { name: 'Add learner' }).click();
  await ownerPage.getByLabel('Learner name').fill(learnerName);
  await ownerPage.getByRole('button', { name: 'Create learner' }).click();
  const matchingLearners = await ownerPage.evaluate(async (expectedName) => {
    const learners = await (await fetch('/api/learners')).json() as Array<{ id: string; displayName: string }>;
    return learners.filter((learner) => learner.displayName === expectedName);
  }, learnerName);
  expect(matchingLearners).toHaveLength(1);
  const learnerId = matchingLearners[0].id;

  const viewer = await createAccessContext(browser, `viewer-${suffix}`, learnerId, 'VIEWER');
  expect((await viewer.page.evaluate(async (id) => (await fetch(`/api/learners/${id}`)).status, learnerId))).toBe(200);
  expect((await viewer.page.evaluate(async (id) => (await fetch(`/api/learners/${id}/curricula`)).status, learnerId))).toBe(200);
  expect((await csrfMutation(viewer.page, `/api/learners/${learnerId}/curricula/00000000-0000-0000-0000-000000000001`)).status).toBe(403);

  const contributor = await createAccessContext(browser, `contributor-${suffix}`, learnerId, 'CONTRIBUTOR');
  expect((await contributor.page.evaluate(async (id) => (await fetch(`/api/learners/${id}`)).status, learnerId))).toBe(200);
  const contributorMutation = await csrfMutation(contributor.page, `/api/learners/${learnerId}/curricula/00000000-0000-0000-0000-000000000001`);
  expect(contributorMutation.hadCsrfToken).toBe(true);
  expect(contributorMutation.status).toBe(404);

  const secondOwner = await createAccessContext(browser, `second-owner-${suffix}`, learnerId, 'OWNER');
  expect((await secondOwner.page.evaluate(async (id) => (await fetch(`/api/learners/${id}`)).status, learnerId))).toBe(200);
  await secondOwner.page.reload();
  await expect(secondOwner.page.getByText(learnerName)).toBeVisible();
  expect((await ownerPage.evaluate(async (id) => (await fetch(`/api/learners/${id}`)).status, learnerId))).toBe(200);

  await viewer.context.close();
  await contributor.context.close();
  await secondOwner.context.close();
  await ownerContext.close();
});
