/**
 * E2E tests for authentication flows
 * Tests user signup, login, and session management
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Sign Up', () => {
    test('should display sign up page', async ({ page }) => {
      await page.goto('/signup');

      await expect(page).toHaveTitle(/Sign Up|OptiVibe/i);
      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/signup');

      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('Password123');
      await page.getByRole('button', { name: /sign up/i }).click();

      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/signup');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('weak');
      await page.getByRole('button', { name: /sign up/i }).click();

      await expect(
        page.getByText(/password must be at least 8 characters/i)
      ).toBeVisible();
    });

    test('should create account successfully', async ({ page }) => {
      await page.goto('/signup');

      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;

      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill('SecurePass123!');
      await page.getByLabel(/name/i).fill('Test User');
      await page.getByRole('button', { name: /sign up/i }).click();

      // Should redirect to dashboard or onboarding
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    });
  });

  test.describe('Sign In', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');

      await expect(page).toHaveTitle(/Sign In|Login|OptiVibe/i);
      await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('nonexistent@example.com');
      await page.getByLabel(/password/i).fill('WrongPassword123');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      await expect(
        page.getByText(/invalid (credentials|email or password)/i)
      ).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      // Note: This test requires a seeded test account
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('test@optivibe.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('test@optivibe.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      await expect(page).toHaveURL(/\/dashboard/);

      // Reload page
      await page.reload();

      // Should still be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/(login|signin)/);
    });

    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('test@optivibe.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Click logout
      await page.getByRole('button', { name: /logout|sign out/i }).click();

      // Should redirect to home or login
      await expect(page).toHaveURL(/\/(login|signin|$)/);

      // Accessing dashboard should redirect to login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/(login|signin)/);
    });
  });
});
