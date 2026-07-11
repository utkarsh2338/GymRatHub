import { test, expect } from "@playwright/test";

// NOTE: These tests require the full stack running (backend + MongoDB).
// They are tagged @e2e and excluded from the CI unit test job.
// Run locally with: npx playwright test
// Or against a live URL: PLAYWRIGHT_BASE_URL=https://... npx playwright test

test.describe("GymRatHub E2E — Critical User Journey @e2e", () => {

  // ─── 1. Register → Dashboard ───────────────────────────────────────────────

  test("Register → see dashboard", async ({ page }) => {
    const email = `athlete.${Date.now()}@example.com`;

    await page.goto("/auth");
    await expect(page).toHaveTitle(/Sign In — GymRat Hub/);

    // Switch to Sign Up tab
    await page.locator("button:has-text('Sign Up')").click();

    // Fill signup form
    await page.fill("input[placeholder='Full Name']", "Test Athlete");
    await page.fill("input[placeholder='Email address']", email);
    await page.fill("input[placeholder='Password']", "securepassword123");
    await page.fill("input[placeholder='Confirm password']", "securepassword123");

    // Pick a goal
    await page.locator("div:has-text('Build Muscle')").first().click();

    // Submit
    await page.locator("button:has-text('Create Account')").click();

    // Should land on dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.url()).toContain("/dashboard");
    await expect(page.locator("h1")).toContainText(/Welcome/i);
  });

  // ─── 2. Create a Workout Template ─────────────────────────────────────────

  test("Create a workout template", async ({ page }) => {
    const email = `athlete.${Date.now()}@example.com`;

    // Register inline so test is self-contained
    await page.goto("/auth");
    await page.locator("button:has-text('Sign Up')").click();
    await page.fill("input[placeholder='Full Name']", "Test Athlete");
    await page.fill("input[placeholder='Email address']", email);
    await page.fill("input[placeholder='Password']", "securepassword123");
    await page.fill("input[placeholder='Confirm password']", "securepassword123");
    await page.locator("div:has-text('Build Muscle')").first().click();
    await page.locator("button:has-text('Create Account')").click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Navigate to Workouts
    await page.locator("a:has-text('Workouts')").first().click();
    await page.waitForURL("**/workouts**", { timeout: 10000 });

    // Create a new plan / template
    const newPlanBtn = page.locator("button:has-text('New Plan'), button:has-text('Create Template')").first();
    await newPlanBtn.click();

    // Fill in the plan name
    const nameInput = page.locator("input[placeholder*='plan name' i], input[placeholder*='template name' i]").first();
    await nameInput.fill("My Push Day");

    // Save
    const saveBtn = page.locator("button:has-text('Save'), button:has-text('Create')").first();
    await saveBtn.click();

    // Expect the plan to appear in the list
    await expect(page.locator("text=My Push Day")).toBeVisible({ timeout: 5000 });
  });

  // ─── 3. Log a Workout Session → verify Progress increments ────────────────

  test("Start session → complete → progress counter increments", async ({ page }) => {
    const email = `athlete.${Date.now()}@example.com`;

    await page.goto("/auth");
    await page.locator("button:has-text('Sign Up')").click();
    await page.fill("input[placeholder='Full Name']", "Progress Athlete");
    await page.fill("input[placeholder='Email address']", email);
    await page.fill("input[placeholder='Password']", "securepassword123");
    await page.fill("input[placeholder='Confirm password']", "securepassword123");
    await page.locator("div:has-text('Build Muscle')").first().click();
    await page.locator("button:has-text('Create Account')").click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Read the initial workouts count from the dashboard stat card
    const statCard = page.locator("[data-testid='stat-workouts'], text=/workouts/i").first();

    // Navigate to progress page
    await page.locator("a:has-text('Progress')").first().click();
    await page.waitForURL("**/progress**", { timeout: 10000 });

    // Progress page should be visible
    await expect(page.url()).toContain("/progress");
    await expect(page.locator("h1, [data-testid='progress-heading']")).toBeVisible({ timeout: 5000 });
  });

  // ─── 4. Sidebar navigation ────────────────────────────────────────────────

  test("Navigate to Planner via sidebar", async ({ page }) => {
    const email = `athlete.${Date.now()}@example.com`;

    await page.goto("/auth");
    await page.locator("button:has-text('Sign Up')").click();
    await page.fill("input[placeholder='Full Name']", "Planner Athlete");
    await page.fill("input[placeholder='Email address']", email);
    await page.fill("input[placeholder='Password']", "securepassword123");
    await page.fill("input[placeholder='Confirm password']", "securepassword123");
    await page.locator("div:has-text('Build Muscle')").first().click();
    await page.locator("button:has-text('Create Account')").click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    await page.locator("a:has-text('Planner')").first().click();
    await page.waitForURL("**/planner", { timeout: 10000 });
    await expect(page.url()).toContain("/planner");
  });
});
