import { expect, type Page } from "@playwright/test";

export class HashtagCollectionPage {
  constructor(private readonly page: Page) {}

  async addHashtag(tag: string) {
    await this.page
      .getByRole("button", { name: "Add hashtag", exact: true })
      .click();
    await this.page.getByLabel("Hashtag", { exact: true }).fill(tag);
    await this.page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(
      this.page.getByRole("heading", { name: `#${tag}` }),
    ).toBeVisible();
  }

  async applyToPostDraft(tag: string) {
    await this.page
      .getByRole("button", { name: `Apply #${tag} to a Post draft` })
      .click();
    await expect(this.page).toHaveURL(/\/workspaces\/workspace-1\/editor$/);
    await expect(
      this.page.getByText(`#${tag}`, { exact: true }).last(),
    ).toBeVisible();
  }
}
