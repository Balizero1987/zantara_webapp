import { test, expect } from '@playwright/test';

test('should display login page with correct title', async ({ page }) => {
  await page.goto('/login-new.html');
  await expect(page).toHaveTitle('ZANTARA - Login');
});

test('should have login form elements', async ({ page }) => {
  await page.goto('/login-new.html');
  
  // Check if name input exists
  await expect(page.locator('#name')).toBeVisible();
  
  // Check if email input exists
  await expect(page.locator('#email')).toBeVisible();
  
  // Check if PIN input exists
  await expect(page.locator('#pin')).toBeVisible();
  
  // Check if login button exists
  await expect(page.locator('#loginBtn')).toBeVisible();
});

test('should be able to fill login form', async ({ page }) => {
  await page.goto('/login-new.html');
  
  // Fill the form
  await page.locator('#name').fill('Test User');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#pin').fill('123456');
  
  // Verify values are filled
  await expect(page.locator('#name')).toHaveValue('Test User');
  await expect(page.locator('#email')).toHaveValue('test@example.com');
  await expect(page.locator('#pin')).toHaveValue('123456');
});