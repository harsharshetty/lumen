import { expect, test } from '@playwright/test';

type ViewportCase = {
  name: 'desktop' | 'mobile';
  width: number;
  height: number;
};

const viewports: ViewportCase[] = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

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

    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);

    const artworkBox = await panel.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(artworkBox).not.toBeNull();
    expect(headingBox).not.toBeNull();

    if (!artworkBox || !headingBox) throw new Error('Expected visual geometry was not measurable');

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
