import { test } from '@playwright/test';

test('capture polished reference screens', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/#/');
  await page.screenshot({ path: 'artifacts/launcher.png', fullPage: true });

  for (const route of ['rail','folding','rigging']) {
    await page.goto(`/#/${route}/1`);
    await page.screenshot({ path: `artifacts/${route}.png` });
  }

  await page.goto('/#/rail/7');
  await page.screenshot({ path: 'artifacts/rail-trailing-merge.png' });

  for (const route of ['rail','folding','rigging']) {
    await page.goto(`/#/${route}/10`);
    await page.screenshot({ path: `artifacts/${route}-final.png` });
  }
});
