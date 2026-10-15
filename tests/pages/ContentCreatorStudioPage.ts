import { expect, type Page } from "@playwright/test";

export class ContentCreatorStudioPage {
  constructor(private readonly page: Page) {}

  async clearHashtags() {
    await this.page.getByRole("button", { name: "Clear all" }).click();
  }

  async openCollection() {
    await this.page
      .getByRole("button", { name: "Choose from collection" })
      .click();
  }

  async applyCollectionTag(tag: string) {
    await this.page
      .getByRole("button", { name: `Apply #${tag} to this Post` })
      .click();
    await expect(
      this.page.getByText(`#${tag}`, { exact: true }).last(),
    ).toBeVisible();
  }

  async addHashtagWithPurpose(tag: string, purpose: string) {
    const input = this.page.getByRole("textbox", {
      name: "Search or add a hashtag",
    });
    await input.fill(`#${tag}`);
    await input.press("Enter");
    await expect(this.page.getByRole("dialog")).toBeVisible();
    await this.page
      .getByLabel("Purpose", { exact: true })
      .selectOption(purpose);
    await this.page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(
      this.page.getByText(`#${tag}`, { exact: true }).last(),
    ).toBeVisible();
  }

  async submitForApproval() {
    await this.page
      .getByRole("button", { name: "Submit for Approval" })
      .click();
  }
}
