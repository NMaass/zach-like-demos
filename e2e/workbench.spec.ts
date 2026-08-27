import { expect, test } from '@playwright/test';
import { expectStableGeometry } from './expect-stable-geometry';

const games = [
  { route: 'rail', title: 'Coldwater Junction', surface: '.rail-board' },
  { route: 'folding', title: 'Bellweather Folding Room', surface: '.paper-stage' },
  { route: 'rigging', title: 'Orpheum Fly Loft', surface: '.rigging-plot' },
] as const;

test('launcher presents three distinct single-idea prototypes', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Workshop Trials' })).toBeVisible();
  for (const game of games) await expect(page.getByRole('heading', { name: game.title })).toBeVisible();
  await expect(page.locator('.prototype-card')).toHaveCount(3);
});

for (const game of games) {
  test(`${game.title} opens as a fixed physical workbench`, async ({ page }) => {
    await page.goto(`/#/${game.route}/1`);
    await expect(page.getByText(game.title, { exact: true }).first()).toBeVisible();
    await expect(page.locator(game.surface)).toBeVisible();
    await expect(page.locator('[data-stable-anchor="ticket"]')).toBeVisible();
    await expect(page.locator('[data-stable-anchor="spec"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollHeight === document.documentElement.clientHeight)).toBe(true);
  });
}

test('changing work orders does not move the workspace frame', async ({ page }) => {
  await page.goto('/#/rail/1');
  const anchors = ['topbar','ticket','surface','spec','controls'].map((name) => page.locator(`[data-stable-anchor="${name}"]`));
  const second = page.getByRole('button', { name: 'Open work order 2' });
  await expectStableGeometry({ page, anchors, expectedFocus: second, action: () => second.click() });
  await expect(page).toHaveURL(/#\/rail\/2$/);
});

test('folding interaction is edge-first rather than palette-first', async ({ page }) => {
  await page.goto('/#/folding/1');
  await expect(page.locator('.paper-stage')).toBeVisible();
  await expect(page.getByText('THE WHOLE VOCABULARY')).toBeVisible();
  await expect(page.getByRole('button', { name: /fold|cut|glue|rotate/i })).toHaveCount(0);
});

test('rigging exposes one live rope end and no tool palette', async ({ page }) => {
  await page.goto('/#/rigging/1');
  await expect(page.locator('.live-rope-end')).toHaveCount(1);
  await expect(page.getByText('THE ONLY OPERATION')).toBeVisible();
  await expect(page.locator('.tool-palette')).toHaveCount(0);
});

test('railboard direct edit keeps all frame anchors stationary', async ({ page }) => {
  await page.goto('/#/rail/1');
  const anchors = ['ticket','surface','spec','controls'].map((name) => page.locator(`[data-stable-anchor="${name}"]`));
  const lever = page.locator('.brass-lever-hit').first();
  await expectStableGeometry({ page, anchors, action: () => lever.click() });
});
