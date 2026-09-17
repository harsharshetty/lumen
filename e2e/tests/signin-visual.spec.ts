import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

type ArtworkDiff = { meanAbsoluteChannelDifference: number; changedPixelRatio: number };
type ViewportCase = { name: 'desktop' | 'mobile'; width: number; height: number };

const viewports: ViewportCase[] = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const approvedAssets = {
  signIn: {
    bytes: readFileSync('../frontend/src/assets/frozen/signin-hero-approved.png'),
    hash: 'e3ebb11145b172714e5549272213720020cd72baba5a25843b6b059bc19683c6', width: 1122, height: 1402,
  },
  parentHome: {
    bytes: readFileSync('../frontend/src/assets/frozen/parent-home-approved.png'),
    hash: '1678ae7f469d0530e87c500943b6b868190db6fb7dd58c2fceadcaf06a7bbe3d', width: 1672, height: 941,
  },
  avatars: {
    bytes: readFileSync('../frontend/src/assets/frozen/learner-avatars-approved.png'),
    hash: '44321821253693fa371da4f5eefab75a8444f7cfa35cd98775808c22e594583b', width: 2172, height: 724,
  },
} as const;

const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/69zcWQAAAABJRU5ErkJggg==';
const dataUrl = (bytes: Buffer) => `data:image/png;base64,${bytes.toString('base64')}`;

function expectApprovedHashes() {
  for (const asset of Object.values(approvedAssets)) {
    expect(createHash('sha256').update(asset.bytes).digest('hex'), 'A frozen PNG changed without explicit design approval').toBe(asset.hash);
  }
}

async function compareArtwork(page: import('@playwright/test').Page, actualPng: Buffer, referencePng: Buffer): Promise<ArtworkDiff> {
  return page.evaluate(async ({ actualBase64, referenceBase64 }) => {
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Could not decode rendered artwork')); image.src = src;
    });
    const [actual, reference] = await Promise.all([load(`data:image/png;base64,${actualBase64}`), load(`data:image/png;base64,${referenceBase64}`)]);
    const width = 160; const height = 160;
    const canvases = [document.createElement('canvas'), document.createElement('canvas')];
    for (const canvas of canvases) { canvas.width = width; canvas.height = height; }
    const contexts = canvases.map((canvas) => canvas.getContext('2d', { willReadFrequently: true }));
    if (!contexts[0] || !contexts[1]) throw new Error('Canvas 2D context unavailable');
    contexts[0].drawImage(actual, 0, 0, width, height); contexts[1].drawImage(reference, 0, 0, width, height);
    const actualPixels = contexts[0].getImageData(0, 0, width, height).data;
    const referencePixels = contexts[1].getImageData(0, 0, width, height).data;
    let absoluteDifference = 0; let changedPixels = 0;
    for (let index = 0; index < actualPixels.length; index += 4) {
      const difference = Math.abs(actualPixels[index] - referencePixels[index]) + Math.abs(actualPixels[index + 1] - referencePixels[index + 1]) + Math.abs(actualPixels[index + 2] - referencePixels[index + 2]);
      absoluteDifference += difference; if (difference / 3 > 24) changedPixels += 1;
    }
    return { meanAbsoluteChannelDifference: absoluteDifference / (width * height * 3), changedPixelRatio: changedPixels / (width * height) };
  }, { actualBase64: actualPng.toString('base64'), referenceBase64: referencePng.toString('base64') });
}

async function renderImage(page: import('@playwright/test').Page, src: string, width: number, height: number, objectFit: string, objectPosition: string, background: string): Promise<Buffer> {
  await page.evaluate(async ({ src, width, height, objectFit, objectPosition, background }) => {
    document.querySelector('#visual-reference-stage')?.remove();
    const stage = document.createElement('div'); stage.id = 'visual-reference-stage';
    Object.assign(stage.style, { position: 'fixed', left: '0', top: '0', width: `${width}px`, height: `${height}px`, overflow: 'hidden', background, zIndex: '2147483647' });
    const image = document.createElement('img'); image.src = src;
    Object.assign(image.style, { width: '100%', height: '100%', display: 'block', objectFit, objectPosition });
    stage.append(image); document.body.append(stage); await image.decode();
  }, { src, width, height, objectFit, objectPosition, background });
  const stage = page.locator('#visual-reference-stage');
  const screenshot = await stage.screenshot({ animations: 'disabled' });
  await stage.evaluate((node) => node.remove());
  return screenshot;
}

async function assertLoadedImage(page: import('@playwright/test').Page, image: import('@playwright/test').Locator, expectedWidth: number, expectedHeight: number) {
  await expect(image).toBeVisible();
  await expect.poll(async () => image.evaluate((node) => { const element = node as HTMLImageElement; return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0; })).toBe(true);
  const details = await image.evaluate((node) => {
    const element = node as HTMLImageElement; const style = getComputedStyle(element);
    return { src: element.currentSrc, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight, display: style.display, visibility: style.visibility, opacity: Number(style.opacity), objectFit: style.objectFit, objectPosition: style.objectPosition };
  });
  expect(details.naturalWidth).toBe(expectedWidth); expect(details.naturalHeight).toBe(expectedHeight);
  expect(details.display).not.toBe('none'); expect(details.visibility).toBe('visible'); expect(details.opacity).toBeGreaterThanOrEqual(0.99);
  const response = await page.request.get(details.src); expect(response.status()).toBe(200); expect(response.headers()['content-type']).toMatch(/^image\/png/);
  return details;
}

for (const viewport of viewports) {
  test(`frozen sign-in renders the approved PNG at ${viewport.name} viewport`, async ({ page }, testInfo) => {
    expectApprovedHashes(); const failedAssets: string[] = [];
    await page.route('**/api/**', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    page.on('response', (response) => { if (new URL(response.url()).pathname.startsWith('/assets/') && !response.ok()) failedAssets.push(`${response.status()} ${response.url()}`); });
    await page.setViewportSize({ width: viewport.width, height: viewport.height }); expect((await page.goto('/'))?.ok()).toBeTruthy();
    const heading = page.getByRole('heading', { name: 'Welcome back' }); const panel = page.getByTestId('signin-artwork-panel'); const image = page.getByTestId('signin-hero-artwork');
    await expect(heading).toBeVisible(); await expect(panel).toBeVisible();
    const details = await assertLoadedImage(page, image, approvedAssets.signIn.width, approvedAssets.signIn.height);
    expect(details.objectFit).toBe('cover'); expect(details.objectPosition).toBe('50% 50%');
    const panelBox = await panel.boundingBox(); const imageBox = await image.boundingBox(); const headingBox = await heading.boundingBox();
    if (!panelBox || !imageBox || !headingBox) throw new Error('Sign-in geometry was not measurable');
    expect(Math.abs(imageBox.width - panelBox.width)).toBeLessThanOrEqual(1); expect(Math.abs(imageBox.height - panelBox.height)).toBeLessThanOrEqual(1);
    if (viewport.name === 'desktop') {
      expect(panelBox.width).toBeGreaterThan(viewport.width * 0.4); expect(panelBox.height).toBeGreaterThan(viewport.height * 0.75); expect(headingBox.x).toBeGreaterThan(panelBox.x + panelBox.width);
    } else {
      expect(panelBox.width).toBeGreaterThan(viewport.width * 0.9); expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(headingBox.y); expect(panelBox.width / panelBox.height).toBeCloseTo(1122 / 1402, 2);
    }
    const rendered = await renderImage(page, details.src, imageBox.width, imageBox.height, details.objectFit, details.objectPosition, '#102451');
    const reference = await renderImage(page, dataUrl(approvedAssets.signIn.bytes), imageBox.width, imageBox.height, 'cover', '50% 50%', '#102451');
    const diff = await compareArtwork(page, rendered, reference);
    expect(diff.meanAbsoluteChannelDifference, 'Rendered sign-in hero differs from the approved PNG').toBeLessThanOrEqual(1);
    expect(diff.changedPixelRatio, 'Rendered sign-in hero contains substituted or blank pixels').toBeLessThanOrEqual(0.005);
    await testInfo.attach(`signin-${viewport.name}-pixel-diff`, { body: Buffer.from(JSON.stringify(diff, null, 2)), contentType: 'application/json' });
    if (viewport.name === 'desktop') {
      const blank = await renderImage(page, transparentPixel, imageBox.width, imageBox.height, 'cover', '50% 50%', '#102451'); const negativeControl = await compareArtwork(page, blank, reference);
      expect(negativeControl.meanAbsoluteChannelDifference, 'Negative control must reject a blank hero').toBeGreaterThan(10);
      expect(negativeControl.changedPixelRatio, 'Negative control must reject a blank hero').toBeGreaterThan(0.1);
      await testInfo.attach('signin-negative-control', { body: Buffer.from(JSON.stringify(negativeControl, null, 2)), contentType: 'application/json' });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    expect(failedAssets).toEqual([]); await testInfo.attach(`signin-${viewport.name}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });
}

for (const viewport of viewports) {
  test(`parent home renders approved artwork and avatars at ${viewport.name} viewport`, async ({ page }, testInfo) => {
    expectApprovedHashes();
    const learners = [{ id: 'learner-one', displayName: 'Ava' }, { id: 'learner-two', displayName: 'Noah' }, { id: 'learner-three', displayName: 'Mia' }];
    await page.route('**/api/learners', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(learners) }));
    await page.route('**/api/curricula', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
    await page.route(/\/api\/learners\/[^/]+\/curricula$/, (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
    await page.setViewportSize({ width: viewport.width, height: viewport.height }); expect((await page.goto('/'))?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: 'Good morning!' })).toBeVisible();
    const artwork = page.getByTestId('parent-home-artwork'); const details = await assertLoadedImage(page, artwork, approvedAssets.parentHome.width, approvedAssets.parentHome.height);
    expect(details.objectFit).toBe('contain'); expect(details.objectPosition).toBe('100% 100%');
    const artworkBox = await artwork.boundingBox(); if (!artworkBox) throw new Error('Parent-home artwork geometry was not measurable');
    expect(artworkBox.width).toBeGreaterThan(viewport.width * 0.75); expect(artworkBox.height).toBeGreaterThanOrEqual(180);
    const rendered = await renderImage(page, details.src, artworkBox.width, artworkBox.height, details.objectFit, details.objectPosition, '#edf5ff');
    const reference = await renderImage(page, dataUrl(approvedAssets.parentHome.bytes), artworkBox.width, artworkBox.height, 'contain', '100% 100%', '#edf5ff');
    const diff = await compareArtwork(page, rendered, reference);
    expect(diff.meanAbsoluteChannelDifference, 'Rendered parent-home artwork differs from the approved PNG').toBeLessThanOrEqual(1);
    expect(diff.changedPixelRatio, 'Rendered parent-home artwork contains substituted or blank pixels').toBeLessThanOrEqual(0.005);
    await testInfo.attach(`parent-home-${viewport.name}-pixel-diff`, { body: Buffer.from(JSON.stringify(diff, null, 2)), contentType: 'application/json' });
    const avatarFrames = page.getByTestId('learner-avatar'); await expect(avatarFrames).toHaveCount(3);
    expect(await avatarFrames.evaluateAll((frames) => frames.map((frame) => frame.getAttribute('data-avatar-index')))).toEqual(['0', '1', '2']);
    const avatarBackgrounds = await avatarFrames.evaluateAll((frames) => frames.map((frame) => ({ image: getComputedStyle(frame).backgroundImage, position: getComputedStyle(frame).backgroundPosition })));
    expect(avatarBackgrounds.map(({ position }) => position)).toEqual(['0% 50%', '50% 50%', '100% 50%']);
    const avatarSource = avatarBackgrounds[0].image.match(/^url\("(.+)"\)$/)?.[1];
    expect(avatarSource).toBeTruthy();
    const avatarSize = await page.evaluate(async (src) => {
      const image = new Image(); image.src = src!; await image.decode(); return { width: image.naturalWidth, height: image.naturalHeight };
    }, avatarSource);
    expect(avatarSize).toEqual({ width: approvedAssets.avatars.width, height: approvedAssets.avatars.height });
    expect((await page.request.get(avatarSource!)).status()).toBe(200);
    const avatarScreenshots = await Promise.all([0, 1, 2].map((index) => avatarFrames.nth(index).screenshot({ animations: 'disabled' })));
    expect((await compareArtwork(page, avatarScreenshots[0], avatarScreenshots[1])).meanAbsoluteChannelDifference).toBeGreaterThan(10);
    expect((await compareArtwork(page, avatarScreenshots[1], avatarScreenshots[2])).meanAbsoluteChannelDifference).toBeGreaterThan(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    await testInfo.attach(`parent-home-${viewport.name}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });
}
