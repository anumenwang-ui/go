import { test, expect } from "@playwright/test";

// ─── Navigation & Page Loads ───────────────────────────────

test.describe("Navigation & Page Loads", () => {
  test("all pages load via sidebar navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });

    // Dashboard
    await expect(page.locator("h1")).toContainText(/早上好|下午好|晚上好/);

    // Tasks
    await page.getByRole("link", { name: "任务" }).first().click();
    await expect(page.locator("h1")).toContainText("任务");

    // Language Library
    await page.getByRole("link", { name: "语言库" }).first().click();
    await expect(page.locator("h1")).toContainText("语言库");

    // Reading Room
    await page.getByRole("link", { name: "阅读室" }).first().click();
    await expect(page.locator("h1")).toContainText("阅读室");

    // Members
    await page.getByRole("link", { name: "会员" }).first().click();
    await expect(page.locator("h1")).toContainText("会员");

    // Review
    await page.getByRole("link", { name: "回顾" }).first().click();
    await expect(page.locator("h1")).toContainText("回顾");

    // Back to Dashboard
    await page.getByRole("link", { name: "首页" }).first().click();
    await expect(page.locator("h1")).toContainText(/早上好|下午好|晚上好/);
  });

  test("mobile bottom nav is visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });

    const mobileNav = page.locator("nav.fixed.bottom-0");
    await expect(mobileNav).toBeVisible();

    await mobileNav.getByRole("link", { name: "任务" }).click();
    await expect(page.locator("h1")).toContainText("任务");

    await mobileNav.getByRole("link", { name: "首页" }).click();
    await expect(page.locator("h1")).toContainText(/早上好|下午好|晚上好/);
  });
});

// ─── Dashboard ────────────────────────────────────────────

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });
  });

  test("energy selector changes energy level", async ({ page }) => {
    // Default should show "正常" somewhere in the energy selector
    await expect(page.locator("header")).toBeVisible();

    // Click "低" energy
    await page.getByText("低").first().click();
    await expect(page.getByText("今天只需专注几件小事就好")).toBeVisible({ timeout: 5000 });
  });

  test("quick-add task with type and importance", async ({ page }) => {
    // Open quick-add
    await page.getByText("快速添加任务").click();
    const input = page.getByPlaceholder("快速添加一条任务...");
    await expect(input).toBeVisible();

    // Select type and importance within the quick-add panel
    const quickPanel = page.locator(".mt-3.space-y-2").first();

    await quickPanel.getByRole("button", { name: "自我照顾" }).click();
    await quickPanel.locator("button", { hasText: "高" }).click();

    // Type and submit
    await input.fill("E2E 喝水提醒");
    await input.press("Enter");

    await expect(page.getByText("任务已添加")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("E2E 喝水提醒")).toBeVisible();
  });

  test("complete a task and see it in review panel", async ({ page }) => {
    // Add a task first
    await page.getByText("快速添加任务").click();
    const input = page.getByPlaceholder("快速添加一条任务...");
    await input.fill("E2E 完成测试");
    await input.press("Enter");
    await page.waitForTimeout(500);

    // Click the circle button to mark complete (first button in focus section)
    const focusSection = page.locator("section").filter({ hasText: "今日焦点" });
    const toggleBtn = focusSection.locator("button").first();
    await toggleBtn.click();

    // Should appear in 今日回顾
    const reviewSection = page.locator("section").filter({ hasText: "今日回顾" });
    await expect(reviewSection.getByText("E2E 完成测试")).toBeVisible({ timeout: 3000 });
  });

  test("English learning section is present", async ({ page }) => {
    const englishSection = page.locator("section").filter({ hasText: "英语学习" });
    await expect(englishSection).toBeVisible();
  });
});

// ─── Tasks Page ────────────────────────────────────────────

test.describe("Tasks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });
    // Navigate via sidebar
    await page.getByRole("link", { name: "任务" }).first().click();
    await page.waitForSelector("h1", { timeout: 5000 });
  });

  test("add task via full form", async ({ page }) => {
    // Click "添加任务" button in header (use .first() to avoid strict mode with form submit btn)
    await page.locator("header").getByRole("button", { name: "添加任务" }).click();

    const textarea = page.getByPlaceholder("输入任务内容...");
    await expect(textarea).toBeVisible();

    await textarea.fill("E2E 长期目标");
    await page.getByRole("button", { name: "长期目标" }).click();
    await page.getByRole("button", { name: "中" }).click();

    // Submit the form (now there are 2 "添加任务" buttons - use the form's submit button)
    await page.getByRole("button", { name: "添加任务" }).last().click();

    await expect(page.getByText("E2E 长期目标")).toBeVisible();
  });

  test("filter tabs switch correctly", async ({ page }) => {
    // Click "已完成" filter
    await page.getByRole("button", { name: "已完成" }).click();
    await expect(page.getByRole("button", { name: "已完成" })).toHaveClass(/bg-stone-800/);

    // Back to "全部"
    await page.getByRole("button", { name: "全部" }).click();
    await expect(page.getByRole("button", { name: "全部" })).toHaveClass(/bg-stone-800/);
  });

  test("delete task via hover", async ({ page }) => {
    // Add a task first
    await page.locator("header").getByRole("button", { name: "添加任务" }).click();
    await page.getByPlaceholder("输入任务内容...").fill("E2E 待删除");
    await page.getByRole("button", { name: "添加任务" }).last().click();
    await page.waitForTimeout(500);

    // Hover over the task card
    const taskCard = page.locator(".group").filter({ hasText: "E2E 待删除" }).first();
    await taskCard.hover();

    // Click delete button
    const deleteBtn = taskCard.locator('button[title="删除任务"]');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    await expect(page.getByText("任务已删除")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("E2E 待删除")).not.toBeVisible();
  });
});

// ─── Language Library ─────────────────────────────────────

test.describe("Language Library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.getByRole("link", { name: "语言库" }).first().click();
    await page.waitForSelector("h1", { timeout: 5000 });
  });

  test("page loads with English and Speech sections", async ({ page }) => {
    await expect(page.getByText("今日英语")).toBeVisible();
    await expect(page.getByText("每日演讲练习")).toBeVisible();
    await expect(page.getByText("开始录音")).toBeVisible();
    await expect(page.getByText("英语素材库")).toBeVisible();
  });
});

// ─── Reading Room ─────────────────────────────────────────

test.describe("Reading Room", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.getByRole("link", { name: "阅读室" }).first().click();
    await page.waitForSelector("h1", { timeout: 5000 });
  });

  test("page content loads", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("阅读室");
  });

  test("add a media card", async ({ page }) => {
    await page.getByRole("button", { name: "添加内容" }).click();
    await page.getByPlaceholder("书名 / 剧名 / 课程名...").fill("E2E 测试书");
    await page.getByRole("button", { name: "添加", exact: true }).click();
    await expect(page.getByText("E2E 测试书")).toBeVisible();
  });
});

// ─── Members ──────────────────────────────────────────────

test.describe("Members", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.getByRole("link", { name: "会员" }).first().click();
    await page.waitForSelector("h1", { timeout: 5000 });
  });

  test("page content loads", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("会员");
  });

  test("add a subscription", async ({ page }) => {
    await page.getByRole("button", { name: "添加订阅" }).click();
    await page.getByPlaceholder("如：Netflix、Spotify").fill("E2E Netflix");
    await page.getByPlaceholder("0.00").fill("25");
    await page.locator('input[type="date"]').fill("2026-06-01");
    await page.getByRole("button", { name: "添加", exact: true }).click();
    await expect(page.locator("p").filter({ hasText: /^E2E Netflix$/ })).toBeVisible();
  });
});

// ─── Review ───────────────────────────────────────────────

test.describe("Review", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.getByRole("link", { name: "回顾" }).first().click();
    await page.waitForSelector("h1", { timeout: 5000 });
  });

  test("page content loads", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("回顾");
  });

  test("switch range modes", async ({ page }) => {
    await page.getByRole("button", { name: "本月" }).click();
    await expect(page.getByRole("button", { name: "本月" })).toHaveClass(/bg-stone-800/);

    await page.getByRole("button", { name: "自定义" }).click();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();

    await page.getByRole("button", { name: "本周" }).click();
    await expect(page.getByRole("button", { name: "本周" })).toHaveClass(/bg-stone-800/);
  });
});

// ─── Backup ───────────────────────────────────────────────

test.describe("Backup", () => {
  test("backup menu expands on desktop sidebar", async ({ page }) => {
    // Backup button is in desktop sidebar; skip on mobile viewports
    await page.goto("/");
    await page.waitForSelector("h1", { timeout: 10000 });

    const backupBtn = page.getByRole("button", { name: "备份" });
    if (!(await backupBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip(true, "Backup button only on desktop sidebar");
    }

    await backupBtn.click();
    await expect(page.getByText("导出备份").first()).toBeVisible();
    await expect(page.getByText("导入恢复").first()).toBeVisible();
  });
});
