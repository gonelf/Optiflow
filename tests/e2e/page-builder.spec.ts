/**
 * E2E tests for Page Builder
 * Tests page creation, component management, and publishing
 */

import { test, expect } from '@playwright/test';

test.describe('Page Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@optiflow.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.describe('Page Creation', () => {
    test('should create a new blank page', async ({ page }) => {
      await page.goto('/dashboard');

      // Click create page button
      await page.getByRole('button', { name: /create page|new page/i }).click();

      // Fill in page details
      const timestamp = Date.now();
      await page.getByLabel(/title/i).fill(`Test Page ${timestamp}`);
      await page.getByLabel(/slug/i).fill(`test-page-${timestamp}`);

      // Create the page
      await page.getByRole('button', { name: /create/i }).click();

      // Should redirect to builder
      await expect(page).toHaveURL(/\/pages\/[a-z0-9]+/);
    });

    test('should create page from template', async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('button', { name: /create page|new page/i }).click();

      // Select template option
      await page.getByRole('tab', { name: /template/i }).click();

      // Choose a template
      await page.getByRole('button', { name: /landing page/i }).first().click();

      // Fill in page details
      const timestamp = Date.now();
      await page.getByLabel(/title/i).fill(`Template Page ${timestamp}`);
      await page.getByLabel(/slug/i).fill(`template-page-${timestamp}`);

      await page.getByRole('button', { name: /create/i }).click();

      // Should have components from template
      await expect(page.getByTestId('component-list')).not.toBeEmpty();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('button', { name: /create page|new page/i }).click();

      // Try to create without filling fields
      await page.getByRole('button', { name: /create/i }).click();

      // Should show validation errors
      await expect(page.getByText(/title is required/i)).toBeVisible();
      await expect(page.getByText(/slug is required/i)).toBeVisible();
    });
  });

  test.describe('Component Management', () => {
    test('should add a component to the page', async ({ page }) => {
      // Create a new page first
      await page.goto('/dashboard');
      await page.getByRole('button', { name: /create page|new page/i }).click();

      const timestamp = Date.now();
      await page.getByLabel(/title/i).fill(`Test Page ${timestamp}`);
      await page.getByLabel(/slug/i).fill(`test-${timestamp}`);
      await page.getByRole('button', { name: /create/i }).click();

      // Add a Hero component
      await page.getByRole('button', { name: /add component/i }).click();
      await page.getByRole('button', { name: /hero/i }).click();

      // Component should be added to canvas
      await expect(page.getByTestId('component-hero')).toBeVisible();
    });

    test('should edit component properties', async ({ page }) => {
      // Assume we have a page with a hero component
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      // Click on hero component
      await page.getByTestId('component-hero').click();

      // Edit headline
      await page.getByLabel(/headline/i).fill('New Headline');

      // Should update in canvas
      await expect(page.getByText('New Headline')).toBeVisible();
    });

    test('should reorder components', async ({ page }) => {
      // Create page with multiple components
      await page.goto('/dashboard');
      await page.getByRole('button', { name: /create page|new page/i }).click();

      const timestamp = Date.now();
      await page.getByLabel(/title/i).fill(`Test Page ${timestamp}`);
      await page.getByLabel(/slug/i).fill(`test-${timestamp}`);
      await page.getByRole('button', { name: /create/i }).click();

      // Add two components
      await page.getByRole('button', { name: /add component/i }).click();
      await page.getByRole('button', { name: /hero/i }).click();

      await page.getByRole('button', { name: /add component/i }).click();
      await page.getByRole('button', { name: /features/i }).click();

      // Get initial order
      const components = await page.getByTestId(/component-/).all();
      const firstComponent = await components[0].getAttribute('data-component-type');

      // Drag to reorder
      await components[0].dragTo(components[1]);

      // Check new order
      const reorderedComponents = await page.getByTestId(/component-/).all();
      const newFirstComponent = await reorderedComponents[0].getAttribute('data-component-type');

      expect(newFirstComponent).not.toBe(firstComponent);
    });

    test('should delete a component', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      const componentCount = await page.getByTestId(/component-/).count();

      // Click on component
      await page.getByTestId('component-hero').click();

      // Delete it
      await page.getByRole('button', { name: /delete component/i }).click();
      await page.getByRole('button', { name: /confirm/i }).click();

      // Should have one less component
      const newCount = await page.getByTestId(/component-/).count();
      expect(newCount).toBe(componentCount - 1);
    });
  });

  test.describe('Page Publishing', () => {
    test('should save page as draft', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      // Make a change
      await page.getByTestId('component-hero').click();
      await page.getByLabel(/headline/i).fill('Updated Headline');

      // Save
      await page.getByRole('button', { name: /save/i }).click();

      // Should show success message
      await expect(page.getByText(/saved/i)).toBeVisible();
    });

    test('should publish page', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      // Click publish
      await page.getByRole('button', { name: /publish/i }).click();

      // Confirm
      await page.getByRole('button', { name: /confirm/i }).click();

      // Should show published status
      await expect(page.getByText(/published/i)).toBeVisible();

      // Should have a public URL
      const publicUrl = await page.getByTestId('public-url').textContent();
      expect(publicUrl).toContain('/p/');
    });

    test('should preview page before publishing', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      // Click preview
      await page.getByRole('button', { name: /preview/i }).click();

      // Should open in new tab/window or modal
      // Check that preview shows the page content
      await expect(page.getByTestId('component-hero')).toBeVisible();
    });

    test('should unpublish page', async ({ page }) => {
      // Assume page is published
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      await expect(page.getByText(/published/i)).toBeVisible();

      // Unpublish
      await page.getByRole('button', { name: /unpublish/i }).click();
      await page.getByRole('button', { name: /confirm/i }).click();

      // Should show draft status
      await expect(page.getByText(/draft/i)).toBeVisible();
    });
  });

  test.describe('Page Settings', () => {
    test('should update SEO metadata', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();

      // Update SEO fields
      await page.getByLabel(/seo title/i).fill('My SEO Title');
      await page.getByLabel(/seo description/i).fill('This is my SEO description');

      // Save
      await page.getByRole('button', { name: /save/i }).click();

      await expect(page.getByText(/saved/i)).toBeVisible();
    });

    test('should set custom domain', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      await page.getByRole('button', { name: /settings/i }).click();

      // Set custom domain
      await page.getByLabel(/custom domain/i).fill('custom.example.com');

      await page.getByRole('button', { name: /save/i }).click();

      await expect(page.getByText(/saved|updated/i)).toBeVisible();
    });
  });

  test.describe('AI Features', () => {
    test('should generate page with AI', async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('button', { name: /create page|new page/i }).click();

      // Use AI generation tab
      await page.getByRole('tab', { name: /ai generate/i }).click();

      // Enter prompt
      await page
        .getByLabel(/describe your page/i)
        .fill('A landing page for a SaaS project management tool');

      // Generate
      await page.getByRole('button', { name: /generate/i }).click();

      // Should show loading state
      await expect(page.getByText(/generating/i)).toBeVisible();

      // Should create page with components
      await expect(page).toHaveURL(/\/pages\/[a-z0-9]+/, { timeout: 30000 });
      await expect(page.getByTestId(/component-/)).not.toBeEmpty();
    });

    test('should get AI optimization suggestions', async ({ page }) => {
      await page.goto('/dashboard/test-workspace/pages/test-page-id');

      // Click on component
      await page.getByTestId('component-hero').click();

      // Request AI suggestions
      await page.getByRole('button', { name: /ai optimize/i }).click();

      // Should show suggestions
      await expect(page.getByText(/suggestions/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /apply/i })).toBeVisible();
    });
  });
});
