import { test, expect, type Page } from "@playwright/test";

const ok = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});

async function setupAuth(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("brandhub-lang", "vi");
    window.localStorage.setItem("brandhub_current_agency_id", "agency-1");
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "u1",
            name: "Tester Dev",
            email: "tester@brandhub.dev",
            role: "USER",
          },
          accessToken: "mock-token",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });

  const profileData = {
    id: "u1",
    fullName: "Tester Dev",
    email: "tester@brandhub.dev",
    phone: "0901 234 567",
    avatarUrl: null,
    bannerUrl: null,
    jobTitle: "Content Strategist",
    workingLanguage: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    bio: "Passionate about branding and media campaigns.",
    skills: ["Copywriting", "SEO"],
    location: "Hồ Chí Minh",
    yearsOfExperience: 5,
    portfolioUrls: ["https://portfolio.dev"],
    linkedinUrl: "https://linkedin.com/in/tester",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    website: "https://tester.dev",
    visibility: {
      email: true,
      phone: false,
      socials: true,
      skills: true,
      location: true,
      portfolio: true,
    },
  };

  await page.route("**/api/v1/users/profile**", (route) => {
    if (route.request().method() === "PUT" || route.request().method() === "PATCH") {
      return route.fulfill(ok(profileData));
    }
    return route.fulfill(ok(profileData));
  });

  await page.route("**/api/v1/users/me**", (route) => route.fulfill(ok(profileData)));
  await page.route("**/api/v1/agencies**", (route) => route.fulfill(ok([])));
  await page.route("**/api/v1/workspaces**", (route) => route.fulfill(ok([])));
}

test.describe("Profile Edit - Component Standards, Textarea & Switch", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto("/settings/profile");
  });

  test("renders profile edit form with common Textarea, CharacterCounter and Switch toggles", async ({
    page,
  }) => {
    // If not in edit mode by default, click Edit button
    const editBtn = page.getByRole("button", { name: /Chỉnh sửa hồ sơ|Sửa thông tin|Chỉnh sửa/i });
    if (await editBtn.isVisible()) {
      await editBtn.click();
    }

    // Verify common Textarea for bio is rendered with CharacterCounter
    const bioTextarea = page.locator("textarea");
    await expect(bioTextarea).toBeVisible();
    await expect(page.getByText(/\/\s*500/)).toBeVisible();

    // Verify Switch components for visibility toggles
    const switches = page.locator("button[role='switch']");
    await expect(switches.first()).toBeVisible();

    // Click a switch to toggle state
    const firstSwitch = switches.first();
    const initialState = await firstSwitch.getAttribute("aria-checked");
    await firstSwitch.click();
    const toggledState = await firstSwitch.getAttribute("aria-checked");
    expect(toggledState).not.toBe(initialState);

    // Verify Save button with variant="orange"
    const saveBtn = page.getByRole("button", { name: /Lưu thay đổi|Lưu hồ sơ|Lưu/i });
    await expect(saveBtn).toBeVisible();
  });
});
