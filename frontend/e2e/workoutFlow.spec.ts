import { test, expect } from "@playwright/test";

test.describe("GymRatHub E2E Workout Flow", () => {
  test("should register, redirect to dashboard, and navigate to planner", async ({ page }) => {
    // Generate a random email to prevent collisions
    const randomEmail = `athlete.${Date.now()}@example.com`;

    // 1. Visit auth page
    await page.goto("/auth");
    await expect(page).toHaveTitle(/Sign In — GymRat Hub/);

    // 2. Switch to Sign Up tab
    const signUpTab = page.locator("button:has-text('Sign Up')");
    await signUpTab.click();

    // 3. Fill in signup details
    await page.fill("input[placeholder='Full Name']", "Elite Athlete");
    await page.fill("input[placeholder='Email address']", randomEmail);
    await page.fill("input[placeholder='Password']", "securepassword123");
    await page.fill("input[placeholder='Confirm password']", "securepassword123");

    // Click Goal option
    const goalOption = page.locator("div:has-text('Build Muscle')").first();
    await goalOption.click();

    // 4. Click Create Account
    const submitBtn = page.locator("button:has-text('Create Account')");
    await submitBtn.click();

    // 5. Assert successful redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.url()).toContain("/dashboard");

    // Verify welcome message is visible
    await expect(page.locator("h1")).toContainText(/Welcome back/);

    // 6. Navigate to Planner page via sidebar
    const plannerLink = page.locator("a:has-text('Planner')");
    await plannerLink.click();
    
    await page.waitForURL("**/planner", { timeout: 10000 });
    await expect(page.url()).toContain("/planner");
  });
});
