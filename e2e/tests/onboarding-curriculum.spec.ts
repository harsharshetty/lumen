import { expect, test } from '@playwright/test';

const authenticatedContextOptions = (subject: string, name: string) => ({
  extraHTTPHeaders: {
    'X-E2E-Subject': subject,
    'X-E2E-Name': name,
  },
});

test('creates learner and persists explicit independent curriculum selections', async ({ browser }) => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const subject = `curriculum-owner-${suffix}`;
  const learnerName = `Curriculum learner ${suffix}`;

  const context = await browser.newContext(authenticatedContextOptions(subject, 'Curriculum Owner'));
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Add your first learner' })).toBeVisible();
  await page.getByRole('button', { name: 'Add learner' }).click();
  await page.getByLabel('Learner name').fill(learnerName);
  await page.getByRole('button', { name: 'Create learner' }).click();

  await expect(page.getByRole('heading', { name: `Choose curricula for ${learnerName}` })).toBeVisible();

  const cbseMath = page.getByRole('checkbox', { name: 'CBSE Grade 3 Mathematics, Grade 3' });
  const olympiadMath = page.getByRole('checkbox', { name: 'Olympiad Mathematics, Grade 3' });
  const cbseHindi = page.getByRole('checkbox', { name: 'CBSE Grade 3 Hindi, Grade 3' });

  await expect(cbseMath).toBeVisible();
  await expect(olympiadMath).toBeVisible();
  await expect(cbseHindi).toBeVisible();
  await expect(page.getByText('Archived Grade 3 Mathematics')).toHaveCount(0);

  await expect(cbseMath).not.toBeChecked();
  await expect(olympiadMath).not.toBeChecked();
  await expect(cbseHindi).not.toBeChecked();

  await olympiadMath.check();
  await expect(olympiadMath).toBeChecked();
  await expect(cbseMath).not.toBeChecked();
  await expect(cbseHindi).not.toBeChecked();

  await cbseHindi.check();
  await expect(cbseHindi).toBeChecked();
  await expect(cbseMath).not.toBeChecked();

  await page.getByRole('button', { name: 'Save curricula' }).click();
  await expect(page.getByRole('heading', { name: learnerName })).toBeVisible();
  await expect(page.getByText('Olympiad Mathematics')).toBeVisible();
  await expect(page.getByText('CBSE Grade 3 Hindi')).toBeVisible();
  await expect(page.getByText('CBSE Grade 3 Mathematics')).toHaveCount(0);

  await context.close();

  const returningContext = await browser.newContext(authenticatedContextOptions(subject, 'Curriculum Owner'));
  const returningPage = await returningContext.newPage();
  await returningPage.goto('/');
  await expect(returningPage.getByRole('heading', { name: 'Learners' })).toBeVisible();
  await expect(returningPage.getByText(learnerName)).toBeVisible();
  await returningPage.getByRole('button', { name: 'Open' }).click();

  await expect(returningPage.getByRole('heading', { name: learnerName })).toBeVisible();
  await expect(returningPage.getByText('Olympiad Mathematics')).toBeVisible();
  await expect(returningPage.getByText('CBSE Grade 3 Hindi')).toBeVisible();
  await expect(returningPage.getByText('CBSE Grade 3 Mathematics')).toHaveCount(0);

  await returningContext.close();
});
