import { BrandHubLogo } from "./BrandHubLogo";

/**
 * Mobile-only BrandHub logo + text header.
 * Hiển thị trên màn hình < lg, ẩn trên desktop (nơi AuthBrandPanel hiển thị).
 */
export function AuthMobileHeader() {
  return (
    <div className="mb-10 flex items-center gap-2.5 select-none lg:hidden">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-md"
        style={{ background: "var(--brand-orange, #f05a28)" }}
      >
        <BrandHubLogo size={14} />
      </div>
      <span
        className="text-foreground"
        style={{
          fontWeight: 700,
          fontSize: "0.9375rem",
          letterSpacing: "-0.01em",
        }}
      >
        Brand
        <span style={{ color: "var(--brand-orange, #f05a28)" }}>Hub</span>
      </span>
    </div>
  );
}
