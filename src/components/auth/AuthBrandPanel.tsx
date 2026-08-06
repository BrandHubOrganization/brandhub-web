import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandHubLogo } from "./BrandHubLogo";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export function AuthBrandPanel() {
  const { t } = useTranslation();
  const testimonials = t("auth.brand.testimonials", {
    returnObjects: true,
  }) as Testimonial[];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const active = testimonials[index] ?? testimonials[0];

  return (
    <div
      className="hidden w-[480px] shrink-0 flex-col justify-between rounded-3xl p-12 select-none lg:flex"
      style={{ background: "#09090b" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: "var(--brand-orange, #f05a28)" }}
        >
          <BrandHubLogo />
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          Brand
          <span style={{ color: "var(--brand-orange, #f05a28)" }}>Hub</span>
        </span>
      </div>
      <div>
        <p
          className="mb-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: "var(--brand-orange, #f05a28)",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {t("auth.brand.tagline")}
        </p>
        <div key={index} className="ghost-comment-in">
          <blockquote
            className="mb-6"
            style={{
              fontSize: "1.25rem",
              lineHeight: 1.55,
              fontWeight: 300,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {active.quote}
          </blockquote>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: "rgba(240,90,40,0.2)",
                border: "1px solid rgba(240,90,40,0.3)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--brand-orange, #f05a28)",
              }}
            >
              {active.initials}
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                {active.name}
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {active.role}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === index ? "16px" : "6px",
                background:
                  i === index
                    ? "var(--brand-orange, #f05a28)"
                    : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
      <div
        className="grid grid-cols-3 gap-4"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "1.5rem",
        }}
      >
        {(
          [
            ["50K+", t("auth.brand.statUsers")],
            ["2M+", t("auth.brand.statContent")],
            ["99.9%", t("auth.brand.statUptime")],
          ] as const
        ).map(([v, l]) => (
          <div key={l}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.375rem",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              {v}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                marginTop: "2px",
              }}
            >
              {l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
