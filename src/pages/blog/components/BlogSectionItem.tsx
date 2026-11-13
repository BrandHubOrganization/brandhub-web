import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Hash,
  Lightbulb,
  Rocket,
} from "lucide-react";
import type { BlogSection } from "@/data/blogTypes";
import { Button } from "@/components/ui/button";
import { BlogRichText } from "./BlogRichText";
import { cn } from "@/lib/utils";

interface BlogSectionItemProps {
  section: BlogSection;
  index: number;
}

export function BlogSectionItem({
  section: sec,
  index: idx,
}: BlogSectionItemProps) {
  return (
    <section
      id={sec.id}
      aria-labelledby={`${sec.id}-heading`}
      className={cn(
        "scroll-mt-24 space-y-6",
        idx > 0 && "border-t border-zinc-200/80 pt-10 dark:border-zinc-800",
      )}
    >
      {/* Section Heading */}
      <div className="group flex items-start gap-3">
        <span className="tabular-nums mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-orange-200/80 bg-orange-50 text-xs font-extrabold text-brand-orange dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-1 items-baseline gap-2">
          <h2
            id={`${sec.id}-heading`}
            className="text-balance text-xl font-extrabold leading-snug tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
          >
            {sec.heading}
          </h2>
          <a
            href={`#${sec.id}`}
            aria-label={`Liên kết tới mục ${sec.heading}`}
            className="hidden shrink-0 text-zinc-300 opacity-0 transition-opacity hover:text-brand-orange group-hover:opacity-100 sm:inline-flex dark:text-zinc-600"
          >
            <Hash className="size-4" />
          </a>
        </div>
      </div>

      {/* Main Editorial Paragraphs (65-72ch measure for comfortable reading) */}
      <div className="max-w-[72ch] space-y-4 text-[15.5px] leading-[1.82] text-zinc-700 sm:text-base dark:text-zinc-300">
        {sec.paragraphs.map((p, pIdx) => (
          <p key={pIdx} className="text-pretty">
            <BlogRichText text={p} />
          </p>
        ))}
      </div>

      {/* Clean Editorial Subheadings (zero heavy nested border boxes) */}
      {sec.subheadings && sec.subheadings.length > 0 && (
        <div className="max-w-[72ch] space-y-5 pt-1">
          {sec.subheadings.map((sub, subIdx) => (
            <div key={subIdx} className="space-y-1.5">
              <h3 className="flex items-baseline gap-2 text-base font-bold leading-snug text-zinc-900 sm:text-[17px] dark:text-zinc-100">
                <span className="tabular-nums font-mono text-xs font-bold text-brand-orange">
                  {subIdx + 1}.
                </span>
                <span>{sub.title}</span>
              </h3>
              <p className="text-pretty text-[15px] leading-[1.78] text-zinc-600 sm:text-[15.5px] dark:text-zinc-300">
                <BlogRichText text={sub.body} />
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Practical Execution Checklist */}
      {sec.checklist && sec.checklist.length > 0 && (
        <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/75 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="mb-3 text-xs font-bold tracking-wide text-zinc-800 uppercase dark:text-zinc-200">
            Checklist Thực thi Chi tiết
          </p>
          <ul className="space-y-2.5">
            {sec.checklist.map((item, cIdx) => (
              <li
                key={cIdx}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <BlogRichText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Structured Comparison Table */}
      {sec.comparisonTable && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200/80 bg-zinc-50/90 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-bold text-zinc-800 sm:text-sm dark:text-zinc-200">
              {sec.comparisonTable.caption}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40">
                  {sec.comparisonTable.headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-3 font-bold text-zinc-800 dark:text-zinc-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sec.comparisonTable.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="transition-colors hover:bg-orange-50/30 dark:hover:bg-zinc-800/40"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={cn(
                          "px-4 py-3 leading-relaxed",
                          cellIdx === 0
                            ? "font-semibold text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-300",
                        )}
                      >
                        <BlogRichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editorial Callout Note */}
      {sec.callout && (
        <aside className="flex items-start gap-3.5 rounded-xl border border-zinc-200/90 bg-zinc-50/75 p-4.5 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/12 text-brand-orange">
            <Lightbulb className="size-4" />
          </div>
          <div className="space-y-1 text-sm leading-relaxed">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">
              {sec.callout.label}
            </p>
            <p className="text-pretty text-zinc-700 dark:text-zinc-300">
              <BlogRichText text={sec.callout.text} />
            </p>
          </div>
        </aside>
      )}

      {/* Clean Mid-Article Inline Conversion Card */}
      {sec.inlineCta && (
        <div className="bh-spotlight-card relative overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-orange dark:border-zinc-700 dark:bg-zinc-800 dark:text-orange-300">
                <Rocket className="size-3" />
                {sec.inlineCta.badge}
              </span>
              <h4 className="text-base font-extrabold text-zinc-900 sm:text-lg dark:text-zinc-50">
                {sec.inlineCta.title}
              </h4>
              <p className="max-w-xl text-pretty text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
                {sec.inlineCta.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <Link to={sec.inlineCta.primaryHref}>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 h-10 cursor-pointer rounded-xl px-4 text-xs font-semibold text-white shadow-sm">
                  {sec.inlineCta.primaryText}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </Link>
              {sec.inlineCta.secondaryText && sec.inlineCta.secondaryHref && (
                <Link to={sec.inlineCta.secondaryHref}>
                  <Button
                    variant="outline"
                    className="h-10 cursor-pointer rounded-xl border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-800 hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {sec.inlineCta.secondaryText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BlogSectionItem;
