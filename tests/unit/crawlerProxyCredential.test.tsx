import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import {
  CrawlerCredentialCard,
  buildProxyCredentialPayload,
} from "@/pages/admin/components/CrawlerCredentialCard";
import { isCredentialStorageReady } from "@/pages/admin/components/CrawlerCredentialsPanel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "vi", changeLanguage: vi.fn() },
  }),
}));

describe("Crawler Proxy Key Credential Support", () => {
  it("enables proxy credential card when sessionStorage is memory without encryption key file", () => {
    expect(isCredentialStorageReady("proxy", false, "memory")).toBe(true);
    expect(isCredentialStorageReady("facebook", false, "memory")).toBe(true);
    expect(isCredentialStorageReady("threads", false, "memory")).toBe(true);
    expect(isCredentialStorageReady("tiktok", false, "memory")).toBe(false);
  });

  it("builds proxyKey payload for KiotProxy keys and endpoint payload for URLs", () => {
    expect(
      buildProxyCredentialPayload("  K0b6ba115ae634df4994ffccbfb347e35  ", 2),
    ).toEqual({
      revision: 2,
      proxyKey: "K0b6ba115ae634df4994ffccbfb347e35",
    });

    expect(
      buildProxyCredentialPayload("http://117.7.147.228:27289", 1),
    ).toEqual({
      revision: 1,
      endpoint: "http://117.7.147.228:27289",
    });
  });

  it("renders proxyKey input label and enabled fieldset for proxy card", () => {
    const queryClient = new QueryClient();
    const html = renderToString(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(CrawlerCredentialCard, {
          item: {
            kind: "proxy",
            revision: 0,
            version: null,
            configured: false,
            updatedAt: null,
            checkedAt: null,
            status: "MISSING",
            probeCode: null,
          },
          storageReady: isCredentialStorageReady("proxy", false, "memory"),
        }),
      ),
    );

    expect(html).toContain("admin.crawler.proxyKey");
    expect(html).not.toContain("admin.crawler.connectionKeyRequired");
  });
});
