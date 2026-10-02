import { expect, test } from "@playwright/test";
import { SystemHealthPage } from "../../pages/SystemHealthPage";

test("ADMIN sees independent sources and loses all protected data after revocation", async ({
  page,
}) => {
  const health = new SystemHealthPage(page);
  await health.setup();
  await health.open();
  await health.expectHost();
  await health.healthTab();
  await expect(
    page.getByRole("heading", { name: "Business readiness" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("collector-1");
  await page.keyboard.press("Escape");
  await page.getByLabel("Status", { exact: true }).selectOption("UP");
  await expect(page.getByText("No matching data.")).toBeVisible();
  await page.getByLabel("Status", { exact: true }).selectOption("");
  await health.mockServers(503);
  await page.getByRole("tab", { name: "Servers", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Unable to update", {
    timeout: 12000,
  });
  await health.expectHost();
  await health.mockTargets(403);
  await expect(page.getByRole("alert")).toContainText("Access expired", {
    timeout: 12000,
  });
  await expect(page.getByText("Gateway host")).toHaveCount(0);
  await expect(page.getByText("Business readiness")).toHaveCount(0);
});

for (const width of [375, 768, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`Monitoring Vietnamese ${theme} ${width}`, async ({ page }, info) => {
      const health = new SystemHealthPage(page);
      await page.setViewportSize({ width, height: 900 });
      await health.setup("vi", theme);
      await health.open();
      await health.expectHost();
      await expect(
        page.getByRole("heading", { name: "Sức khỏe hệ thống" }),
      ).toBeVisible();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await page.screenshot({
        path: info.outputPath(`monitoring-${theme}-${width}.png`),
        fullPage: true,
      });
    });
  }
}
