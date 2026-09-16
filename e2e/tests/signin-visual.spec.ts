import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

type ViewportCase = {
  name: 'desktop' | 'mobile';
  width: number;
  height: number;
};

type ArtworkDiff = {
  meanAbsoluteChannelDifference: number;
  changedPixelRatio: number;
};

const viewports: ViewportCase[] = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const approvedArtworkReference = readFileSync(
  fileURLToPath(new URL('../../frontend/src/assets/signin-left-reference.jpg', import.meta.url)),
).toString('base64');

async function compareApprovedArtwork(page: import('@playwright/test').Page): Promise<ArtworkDiff> {
  return page.evaluate(async (referenceBase64) => {
    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not decode visual reference: ${src.slice(0, 80)}`));
      image.src = src;
    });

    const [actual, reference] = await Promise.all([
      loadImage('/assets/signin-approved.webp'),
      loadImage(`data:image/jpeg;base64,${referenceBase64}`),
    ]);

    const width = 128;
    const height = 128;
    const actualCanvas = document.createElement('canvas');
    const referenceCanvas = document.createElement('canvas');
    actualCanvas.width = referenceCanvas.width = width;
    actualCanvas.height = referenceCanvas.height = height;

    const actualContext = actualCanvas.getContext('2d', { willReadFrequently: true });
    const referenceContext = referenceCanvas.getContext('2d', { willReadFrequently: true });
    if (!actualContext || !referenceContext) throw new Error('Canvas 2D context unavailable');

    actualContext.drawImage(actual, 0, 0, width, height);
    referenceContext.drawImage(reference, 0, 0, width, height);

    const actualPixels = actualContext.getImageData(0, 0, width, height).data;
    const referencePixels = referenceContext.getImageData(0, 0, width, height).data;

    let absoluteChannelDifference = 0;
    let changedPixels = 0;
    const pixelCount = width * height;

    for (let index = 0; index < actualPixels.length; index += 4) {
      const red = Math.abs(actualPixels[index] - referencePixels[index]);
      const green = Math.abs(actualPixels[index + 1] - referencePixels[index + 1]);
      const blue = Math.abs(actualPixels[index + 2] - referencePixels[index + 2]);
      absoluteChannelDifference += red + green + blue;
      if ((red + green + blue) / 3 > 40) changedPixels += 1;
    }

    return {
      meanAbsoluteChannelDifference: absoluteChannelDifference / (pixelCount * 3),
      changedPixelRatio: changedPixels / pixelCount,
    };
  }, approvedArtworkReference);
}

for (const viewport of viewports) {
  test(`frozen sign-in renders approved artwork at ${viewport.name} viewport`, async ({ page }, testInfo) => {
    const failedAssets: string[] = [];
    page.on('response', (response) => {
      const pathname = new URL(response.url()).pathname;
      if (pathname.startsWith('/assets/') && !response.ok()) {
        failedAssets.push(`${response.status()} ${pathname}`);
      }
    });

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const navigation = await page.goto('/');
    expect(navigation?.ok()).toBeTruthy();

    const heading = page.getByRole('heading', { name: 'Welcome back' });
    const artwork = page.getByRole('img', { name: 'Lumen — bright learning for brighter tomorrows' });
    const panel = page.getByTestId('signin-artwork-panel');

    await expect(heading).toBeVisible();
    await expect(artwork).toBeVisible();
    await expect(panel).toBeVisible();

    await expect.poll(async () => artwork.evaluate((node) => {
      const image = node as HTMLImageElement;
      return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
    })).toBe(true);

    const decodedSize = await artwork.evaluate((node) => {
      const image = node as HTMLImageElement;
      return { width: image.naturalWidth, height: image.naturalHeight };
    });
    expect(decodedSize.width).toBeGreaterThan(500);
    expect(decodedSize.height).toBeGreaterThan(500);

    const assetResponse = await page.request.get(new URL('/assets/signin-approved.webp', page.url()).toString());
    expect(assetResponse.status()).toBe(200);
    expect(assetResponse.headers()['content-type']).toContain('image/webp');

    const renderedArtworkStyle = await artwork.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: Number(style.opacity),
        objectFit: style.objectFit,
      };
    });
    expect(renderedArtworkStyle.display).not.toBe('none');
    expect(renderedArtworkStyle.visibility).toBe('visible');
    expect(renderedArtworkStyle.opacity).toBeGreaterThanOrEqual(0.99);
    expect(renderedArtworkStyle.objectFit).toBe('cover');

    const artworkDiff = await compareApprovedArtwork(page);
    expect(
      artworkDiff.meanAbsoluteChannelDifference,
      'Production sign-in artwork drifted too far from the committed approved reference',
    ).toBeLessThan(24);
    expect(
      artworkDiff.changedPixelRatio,
      'Too much of the production sign-in artwork differs from the committed approved reference',
    ).toBeLessThan(0.35);

    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);

    const artworkBox = await panel.boundingBox();
    const imageBox = await artwork.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(artworkBox).not.toBeNull();
    expect(imageBox).not.toBeNull();
    expect(headingBox).not.toBeNull();

    if (!artworkBox || !imageBox || !headingBox) throw new Error('Expected visual geometry was not measurable');

    expect(Math.abs(imageBox.x - artworkBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(imageBox.y - artworkBox.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(imageBox.width - artworkBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(imageBox.height - artworkBox.height)).toBeLessThanOrEqual(1);

    if (viewport.name === 'desktop') {
      expect(artworkBox.width).toBeGreaterThan(viewport.width * 0.4);
      expect(artworkBox.height).toBeGreaterThan(viewport.height * 0.75);
      expect(headingBox.x).toBeGreaterThan(artworkBox.x + artworkBox.width);
    } else {
      expect(artworkBox.width).toBeGreaterThan(viewport.width * 0.9);
      expect(artworkBox.y + artworkBox.height).toBeLessThanOrEqual(headingBox.y);
    }

    expect(failedAssets).toEqual([]);

    await testInfo.attach(`signin-${viewport.name}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
}
