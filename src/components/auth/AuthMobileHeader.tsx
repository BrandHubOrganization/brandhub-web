import { BrandHubLogo } from "./BrandHubLogo";

/**
 * Mobile-only BrandHub logo + text header.
 * Hiển thị trên màn hình < lg, ẩn trên desktop (nơi AuthBrandPanel hiển thị).
 */
export function AuthMobileHeader() {
  return (
    <div className="mb-10 flex items-center gap-2.5 select-none lg:hidden">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        <BrandHubLogo size={28} />
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
        <span style={{ color: "hsl(var(--brand-orange))" }}>
          Hub
        </span>
      </span>
    </div>
  );
}
