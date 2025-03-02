import { test, expect } from '@playwright/test';

test('Should render login form', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
});

test('Should allow entering username', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');

    const usernameField = page.locator('input[type="text"]');
    await usernameField.fill('testuser');
    await expect(usernameField).toHaveValue('testuser');
});

test('Should allow entering password', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');

    const passwordField = page.locator('input[type="password"]');
    await passwordField.fill('testpassword');
    await expect(passwordField).toHaveValue('testpassword');
});

test('Should have a clickable login button', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');

    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeEnabled();
});
