import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceCampaignSummary } from "./WorkspaceCampaignSummary";
import type { Campaign } from "@/pages/campaign/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const prefix = "workspace.dashboard.workspaceCampaign";
const campaign = {
  id: "one",
  name: "Workspace launch",
  contentVersion: 3,
  status: "DRAFT",
  workItems: [],
} as unknown as Campaign;
function render(
  patch: Partial<ComponentProps<typeof WorkspaceCampaignSummary>> = {},
) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(WorkspaceCampaignSummary, {
        workspaceId: "workspace",
        campaigns: [campaign],
        loading: false,
        failed: false,
        canPlan: true,
        onRetry: vi.fn(),
        ...patch,
      }),
    ),
  );
}

describe("Workspace single Campaign summary", () => {
  it.each(["DRAFT", "APPROVED", "IN_PROGRESS", "COMPLETED"] as const)(
    "shows one %s campaign",
    (status) => {
      const html = render({ campaigns: [{ ...campaign, status }] });
      expect(html).toContain(campaign.name);
      expect(html).toContain(`campaign.status.${status}`);
      expect(html).toContain(`${prefix}.open`);
      expect(html).not.toContain("recentCampaigns");
      expect(html).not.toContain("viewAllCampaigns");
    },
  );
  it("loading does not display stale campaign", () => {
    expect(render({ loading: true })).not.toContain(campaign.name);
    expect(render({ loading: true })).toContain('role="status"');
  });
  it("failed loading is not treated as empty", () => {
    const html = render({ failed: true, campaigns: [] });
    expect(html).toContain(`${prefix}.retry`);
    expect(html).not.toContain(`${prefix}.create`);
  });
  it("Manager can open the plan workflow from empty state", () => {
    expect(render({ campaigns: [] })).toContain(`${prefix}.create`);
  });
  it("Client does not receive a create action", () => {
    expect(render({ campaigns: [], canPlan: false })).not.toContain(
      `${prefix}.create`,
    );
  });
  it("multiple records show inconsistency, not an arbitrary first campaign", () => {
    const html = render({ campaigns: [campaign, { ...campaign, id: "two" }] });
    expect(html).toContain(`${prefix}.conflict`);
    expect(html).not.toContain(campaign.name);
  });
});
