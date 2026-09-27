import { cn } from "@/lib/utils";

/**
 * Trang trí nền thuần thẩm mỹ cho 1 section landing: chấm lưới mờ + 1
 * vòng tròn glow mờ ở góc, dùng màu brand-orange theo theme hiện tại.
 * `aria-hidden` + `pointer-events-none` vì không mang thông tin, không
 * được tương tác — section cha cần thêm `relative overflow-hidden`.
 */
export function SectionDecor({
  corner = "right",
  className,
}: {
  corner?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <svg
        className={cn(
          "absolute top-0 size-[36rem] opacity-[0.35] dark:opacity-[0.18]",
          corner === "right" ? "-right-40" : "-left-40",
        )}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="50"
          fill="hsl(var(--brand-orange))"
          fillOpacity="0.12"
        />
      </svg>
      <svg className="absolute inset-0 size-full opacity-[0.4] dark:opacity-[0.15]">
        <defs>
          <pattern
            id="section-dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#section-dot-grid)"
          className="text-zinc-300 dark:text-zinc-700"
        />
      </svg>
    </div>
  );
}

export default SectionDecor;
