import { test, expect } from "@playwright/test";

test.describe("Storefront smoke tests", () => {
  test("homepage loads and shows hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Blossom/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("products page loads", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main, [class*='product'], h1, h2").first()).toBeVisible();
  });

  test("collections page loads", async ({ page }) => {
    await page.goto("/collections");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("cart page loads", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.locator("header")).toBeVisible();
    // Cart might show empty state or heading
    await expect(page.locator("h1, h2, [class*='cart']").first()).toBeVisible();
  });

  test("shipping page loads", async ({ page }) => {
    await page.goto("/shipping");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("search dialog opens with keyboard shortcut", async ({ page }) => {
    await page.goto("/");
    // Use Control+k (cross-platform) since Meta+k is macOS-specific
    await page.keyboard.press("Control+k");
    await expect(page.locator("[role='dialog'], [class*='search'], [class*='Search']").first()).toBeVisible({ timeout: 3000 });
  });

  test("health check endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    const data = await response.json();
    expect(data.status).toBe("ok");
  });
});

test.describe("i18n routing", () => {
  test("Spanish locale loads", async ({ page }) => {
    await page.goto("/es");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("header")).toBeVisible();
  });

  test("Ukrainian locale loads", async ({ page }) => {
    await page.goto("/uk");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("header")).toBeVisible();
  });
});

test.describe("API endpoints", () => {
  test("search API returns results for matching query", async ({ request }) => {
    const response = await request.get("/api/search?q=rose");
    expect(response.status()).toBeLessThan(500);
    const data = await response.json();
    expect(data).toHaveProperty("results");
  });

  test("shipping calculation responds", async ({ request }) => {
    const response = await request.post("/api/shipping/calculate", {
      data: { countryCode: "ES", subtotal: 50 },
    });
    expect(response.status()).toBeLessThan(500);
  });

  test("newsletter endpoint accepts valid email", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      data: { email: "test@example.com", locale: "en" },
    });
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Product navigation", () => {
  test("can navigate from products to product detail", async ({ page }) => {
    await page.goto("/products");
    const productLink = page.locator("a[href*='/products/']").first();
    await productLink.waitFor({ state: "visible", timeout: 10000 });
    await productLink.click();
    await expect(page.locator("header")).toBeVisible();
  });
});
