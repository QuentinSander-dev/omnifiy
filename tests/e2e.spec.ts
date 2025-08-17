import { test, expect } from '@playwright/test'

test('runs a campaign and streams steps', async ({ page }) => {
  await page.goto('/campaign')
  await page.fill('input[placeholder="Site (https://...)"]', 'https://staging.omnifiy.dev')
  await page.fill('input[placeholder="Niche"]', 'South Florida waterfront')
  await page.click('button:has-text("Run Campaign")')

  await expect(page.getByText('started')).toBeVisible()
  // Steps may arrive quickly due to mocks; loosen timing
  await expect(page.getByText(/clusters/i)).toBeVisible({ timeout: 20000 })
  await expect(page.getByText(/published/i)).toBeVisible()
  await expect(page.getByText(/schema/i)).toBeVisible()
  await expect(page.getByText(/interlinks/i)).toBeVisible()
  await expect(page.getByText(/submittedToIndex/i)).toBeVisible()
  await expect(page.getByText(/serpProof/i)).toBeVisible()
  await expect(page.getByText(/complete/i)).toBeVisible()

  // JSON-only (no markdown fences or HTML tags)
  await expect(page.getByTestId('runlog')).not.toContainText('```')
  await expect(page.getByTestId('runlog')).not.toContainText('<div')
})

