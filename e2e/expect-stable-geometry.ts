import { expect, type Locator, type Page } from '@playwright/test';

export async function expectStableGeometry({ page, anchors, action, expectedFocus, tolerance = 0.75 }: {
  page: Page;
  anchors: Locator[];
  action: () => Promise<void>;
  expectedFocus?: Locator;
  tolerance?: number;
}) {
  const before = await Promise.all(anchors.map((anchor) => anchor.boundingBox()));
  const beforeScroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
  await action();
  await page.waitForTimeout(60);
  const after = await Promise.all(anchors.map((anchor) => anchor.boundingBox()));
  const afterScroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
  before.forEach((box, index) => {
    expect(box).not.toBeNull(); expect(after[index]).not.toBeNull();
    if (!box || !after[index]) return;
    for (const key of ['x','y','width','height'] as const) expect(Math.abs(box[key] - after[index]![key])).toBeLessThanOrEqual(tolerance);
  });
  expect(afterScroll).toEqual(beforeScroll);
  if (expectedFocus) await expect(expectedFocus).toBeFocused();
}
