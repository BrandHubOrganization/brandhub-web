import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { useHashtagCollection } from "@/pages/hashtag-groups/hooks/useHashtagCollection";

const root = vi.hoisted(() => ({ tree: undefined as ReactNode }));

vi.mock("react-dom/client", () => ({
  createRoot: () => ({
    render: (tree: ReactNode) => {
      root.tree = tree;
    },
  }),
}));
vi.mock("@/i18n", () => ({}));
vi.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/App.tsx", () => ({
  default: function HashtagRouteProbe() {
    const collection = useHashtagCollection(
      "workspace-test",
      "user-test",
      false,
    );
    return createElement("span", null, collection.query.status);
  },
}));

test("application bootstrap provides query context to the hashtag editor hook", async () => {
  vi.stubGlobal("document", { getElementById: () => ({}) });
  try {
    await import("@/main.tsx");
    expect(root.tree).toBeDefined();
    expect(() => renderToString(root.tree)).not.toThrow();
    expect(renderToString(root.tree)).toContain("pending");
  } finally {
    vi.unstubAllGlobals();
  }
});
