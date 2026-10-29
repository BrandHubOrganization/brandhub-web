import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { PrivacyPolicyPage } from "@/pages/legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/legal/TermsOfServicePage";
import { Footer } from "@/components/landing/Footer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

describe("Legal Pages and Navigation Verification", () => {
  it("renders PrivacyPolicyPage with all required Google OAuth and Google Drive disclosures", () => {
    const html = renderToString(
      createElement(MemoryRouter, null, createElement(PrivacyPolicyPage)),
    );

    expect(html).toContain("Privacy Policy");
    expect(html).toContain("October 27, 2026");
    expect(html).toContain("brandhub.id.vn");
    expect(html).toContain("brandhub404@gmail.com");

    // Google OAuth disclosures
    expect(html).toContain("openid email profile");
    expect(html).toContain("Full Name");
    expect(html).toContain("Email Address");
    expect(html).toContain("Profile Picture");
    expect(html).toContain("Google Account ID");

    // Google API Limited Use & Policy
    expect(html).toContain("Google API Services User Data Policy");
    expect(html).toContain("Limited Use");

    // Google Drive disclosures
    expect(html).toContain("Google Drive");
    expect(html).toContain("drive.file");
  });

  it("renders TermsOfServicePage with all required governance and legal terms", () => {
    const html = renderToString(
      createElement(MemoryRouter, null, createElement(TermsOfServicePage)),
    );

    expect(html).toContain("Terms of Service");
    expect(html).toContain("October 27, 2026");
    expect(html).toContain("BrandHub");
    expect(html).toContain("brandhub404@gmail.com");
    expect(html).toContain("Acceptance of Terms");
    expect(html).toContain("User Content &amp; Ownership");
    expect(html).toContain("Acceptable Use &amp; Prohibited Activities");
    expect(html).toContain("Limitation of Liability");
  });

  it("renders landing Footer containing visible links to /privacy and /terms", () => {
    const html = renderToString(
      createElement(MemoryRouter, null, createElement(Footer)),
    );

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Terms of Service");
  });
});
