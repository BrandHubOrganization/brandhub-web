import { describe, expect, it } from "vitest";
import { applyHostAppearance } from "../../vendor/video-space/src/platform/host-appearance";
import { libraryMessages } from "../../vendor/video-space/src/brandhub/library-messages";
import { NAV_SECTIONS } from "../../src/components/layout/sidebar/sidebarNavConfig";
import { canAccess } from "../../src/routes/access";

describe("Video Space BrandHub integration", () => {
  it("uses host UI colors/font and updates them when the host changes theme", () => {
    const host = new Map([
      ["--primary", "15 87% 55%"],
      ["--primary-foreground", "0 0% 100%"],
      ["--card", "0 0% 100%"],
      ["--font-sans", '"Inter", sans-serif'],
    ]);
    const editor = new Map<string, string>();
    const apply = () =>
      applyHostAppearance(
        { getPropertyValue: (name) => host.get(name) ?? "" },
        {
          setProperty: (name, value) => {
            editor.set(name, value ?? "");
          },
        },
      );
    apply();
    expect(editor.get("--primary-foreground")).toBe("hsl(0 0% 100%)");
    expect(editor.get("--card")).toBe("hsl(0 0% 100%)");
    expect(editor.get("--font-sans")).toBe('"Inter", sans-serif');
    host.set("--card", "222 84% 6%");
    apply();
    expect(editor.get("--card")).toBe("hsl(222 84% 6%)");
    expect(editor.has("--timeline-color")).toBe(false);
  });

  it("keeps library labels parallel in Vietnamese and English", () => {
    expect(Object.keys(libraryMessages.vi).sort()).toEqual(
      Object.keys(libraryMessages.en).sort(),
    );
  });

  it("groups video destinations without changing workspace/role restrictions", () => {
    const items = NAV_SECTIONS.find(
      (section) => section.key === "video",
    )!.items;
    expect(items.map((item) => item.to)).toEqual([
      "/ai-studio/video",
      "/product-video",
      "/video-space",
    ]);
    for (const item of items) {
      expect(item.requiresWorkspace && item.workspaceScoped).toBe(true);
      const path = `/workspaces/d3210000-0000-4000-8000-000000000003${item.to}`;
      expect(canAccess(path, "USER", "CREATOR")).toBe(true);
      expect(canAccess(path, "USER", "CLIENT")).toBe(false);
    }
  });
});
