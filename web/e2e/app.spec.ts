import { test, expect } from "@playwright/test";

test("loads, controls are labelled, and a context item can be added", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "ContextOS" })).toBeVisible();
  // seeded context loads from /api/workspace (exact match avoids the CLAUDE.md preview / body text)
  await expect(page.getByText("Money as integer cents", { exact: true })).toBeVisible();
  // controls are reachable by their accessible names (a11y)
  await page.getByLabel("Title").fill("Trunk-based dev");
  await page.getByLabel("Body").fill("short-lived branches; merge daily");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Trunk-based dev", { exact: true })).toBeVisible();
});

test("Context Handoff preview renders the generated CLAUDE.md", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/# CLAUDE\.md/)).toBeVisible();
});

test("health endpoint responds ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).status).toBe("ok");
});
