import { expect, test } from '@playwright/test';

test('launcher states the one-vocabulary constraint and opens every workshop', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: /Three mechanisms/i })).toBeVisible();
  await expect(page.getByText('YOU PLACE: RAIL')).toBeVisible();
  await expect(page.getByText('YOU DO: FOLD')).toBeVisible();
  await expect(page.getByText('YOU PLACE: ROPE')).toBeVisible();

  await page.getByRole('button', { name: /Coldwater Junction/ }).click();
  await expect(page.getByRole('heading', { name: 'The Milk Spur' })).toBeVisible();
  await expect(page.getByLabel('Railway survey plan')).toBeVisible();

  await page.getByRole('button', { name: /Back to workshop trials/ }).click();
  await page.getByRole('button', { name: /Bellweather Bindery/ }).click();
  await expect(page.getByRole('heading', { name: 'A Four-Page Circular' })).toBeVisible();
  await expect(page.getByLabel('Approved finished dummy')).toBeVisible();

  await page.getByRole('button', { name: /Back to workshop trials/ }).click();
  await page.getByRole('button', { name: /The Orpheum Fly Loft/ }).click();
  await expect(page.getByRole('heading', { name: 'The House Curtain' })).toBeVisible();
  await expect(page.getByLabel('Theatre fly loft section')).toBeVisible();
});

test('non-spatial puzzle controls keep the workbench geometry fixed', async ({ page }) => {
  await page.goto('/#/bindery/1');
  const workbench = page.getByLabel('Puzzle workbench');
  const before = await workbench.boundingBox();
  await page.getByRole('button', { name: 'Fold right edge inward' }).click();
  const after = await workbench.boundingBox();
  expect(after).not.toBeNull();
  expect(before).not.toBeNull();
  expect(after?.x).toBe(before?.x);
  expect(after?.y).toBe(before?.y);
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await expect(page.getByRole('button', { name: /TEST|RUN AGAIN/ })).toBeVisible();
});

test('puzzle navigation replaces content without moving the workspace frame', async ({ page }) => {
  await page.goto('/#/rail/1');
  const workbench = page.getByLabel('Puzzle workbench');
  const before = await workbench.boundingBox();
  await page.getByRole('button', { name: 'Work order 2' }).click();
  await expect(page.getByRole('heading', { name: 'Two Consignees' })).toBeVisible();
  const after = await workbench.boundingBox();
  expect(after).not.toBeNull();
  expect(after?.x).toBe(before?.x);
  expect(after?.y).toBe(before?.y);
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
});
