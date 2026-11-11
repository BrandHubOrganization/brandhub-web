import { Link } from "react-router-dom";
import { Sparkles, ListChecks, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlogSection } from "@/data/blogTypes";
import { BlogRichText } from "./BlogRichText";

interface BlogSectionItemProps {
  section: BlogSection;
  index: number;
}

export function BlogSectionItem({ section: sec, index: idx }: BlogSectionItemProps) {
  return (
    <section
      id={sec.id}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-2xs"
    >
      <div className="flex items-center gap-2 text-xs font-bold text-brand-orange">
        <span>PHẦN {idx + 1}</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
        {sec.heading}
      </h2>

      <div className="space-y-3.5 text-sm sm:text-base text-foreground/90 leading-relaxed">
        {sec.paragraphs.map((p, pIdx) => (
          <p key={pIdx}>
            <BlogRichText text={p} />
          </p>
        ))}
      </div>

      {/* Subheadings (H3) */}
      {sec.subheadings && sec.subheadings.length > 0 && (
        <div className="space-y-4 pt-2">
          {sec.subheadings.map((sub, sIdx) => (
            <div
              key={sIdx}
              id={`${sec.id}-sub-${sIdx + 1}`}
              className="scroll-mt-24 rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 space-y-1.5 transition-colors hover:border-brand-orange/30"
            >
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {sub.title}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                <BlogRichText text={sub.body} />
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Checklist / Bullets */}
      {sec.checklist && sec.checklist.length > 0 && (
        <div className="rounded-xl bg-muted/40 border border-border/70 p-4 sm:p-5 space-y-2.5 mt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <ListChecks className="size-4 text-brand-orange" />
            <span>Quy trình &amp; Các bước thực thi chuẩn trên hệ thống</span>
          </div>
          <ul className="space-y-2">
            {sec.checklist.map((item, cIdx) => (
              <li
                key={cIdx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed"
              >
                <span className="size-5 rounded-full bg-brand-orange/15 text-brand-orange font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {cIdx + 1}
                </span>
                <span>
                  <BlogRichText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Callout Box */}
      {sec.callout && (
        <div className="rounded-xl border-l-4 border-brand-orange bg-brand-orange/5 p-4 sm:p-5 space-y-1.5 mt-4">
          <p className="text-xs sm:text-sm font-bold text-foreground">
            {sec.callout.label}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <BlogRichText text={sec.callout.text} />
          </p>
        </div>
      )}

      {/* Comparison Table */}
      {sec.comparisonTable && (
        <div className="space-y-2 pt-3">
          <p className="text-xs font-semibold text-muted-foreground italic">
            Bảng đối chiếu: {sec.comparisonTable.caption}
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-foreground font-bold">
                  {sec.comparisonTable.headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className={`py-3 px-3.5 ${
                        hIdx === 1 ? "bg-brand-orange/10 text-brand-orange" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sec.comparisonTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/20">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-3.5 align-top leading-relaxed ${
                          cIdx === 0
                            ? "font-semibold text-foreground"
                            : cIdx === 1
                              ? "bg-brand-orange/5 font-semibold text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline Conversion CTA */}
      {sec.inlineCta && (
        <div className="mt-6 rounded-2xl border border-brand-orange/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 space-y-3 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
              <Sparkles className="size-3" />
              {sec.inlineCta.badge}
            </span>
            <span className="text-[11px] text-slate-300">
              {sec.inlineCta.featureHighlight}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {sec.inlineCta.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {sec.inlineCta.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link to={sec.inlineCta.primaryHref}>
              <Button
                size="sm"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-1.5 cursor-pointer"
              >
                <span>{sec.inlineCta.primaryText}</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            {sec.inlineCta.secondaryText && sec.inlineCta.secondaryHref && (
              <Link to={sec.inlineCta.secondaryHref}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
                >
                  {sec.inlineCta.secondaryText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default BlogSectionItem;
