import { test, expect } from '@playwright/test';

test.describe('SignupCard - Simple Tests', () => {
  


  // Test 2: Ensure the "Username" input field is visible
  test('should render the Username input field', async ({ page }) => {
    await page.goto('http://localhost:3000/auth'); // Adjust URL as needed
    const usernameField = page.locator('label:has-text("Username")');
    await expect(usernameField).toBeVisible();
  });

  // Test 4: Ensure the "Password" input field is visible
  test('should render the Password input field', async ({ page }) => {
    await page.goto('http://localhost:3000/auth'); // Adjust URL as needed
    const passwordField = page.locator('label:has-text("Password")');
    await expect(passwordField).toBeVisible();
  });

});
