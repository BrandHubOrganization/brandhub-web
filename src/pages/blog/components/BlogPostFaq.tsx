import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { BlogRichText } from "./BlogRichText";
import { cn } from "@/lib/utils";

interface BlogPostFaqProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

export function BlogPostFaq({ faqs }: BlogPostFaqProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section
      id="faq-section"
      aria-labelledby="faq-section-heading"
      className="scroll-mt-24 space-y-5 border-t border-zinc-200/80 pt-10 dark:border-zinc-800"
    >
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 text-xs font-bold text-brand-orange dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
          <HelpCircle className="size-3.5" />
          <span>Giải đáp thắc mắc thực tế</span>
        </div>
        <h2
          id="faq-section-heading"
          className="text-balance text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
        >
          Câu hỏi thường gặp ({faqs.length})
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={cn(
                "overflow-hidden rounded-2xl border transition-colors",
                isOpen
                  ? "border-orange-200/90 bg-white shadow-xs dark:border-orange-500/30 dark:bg-zinc-900"
                  : "border-zinc-200/85 bg-zinc-50/50 hover:border-orange-200/70 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 p-4.5 text-left sm:p-5"
              >
                <span className="text-sm font-bold leading-snug text-zinc-900 sm:text-base dark:text-zinc-100">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-zinc-500 transition-transform duration-200 dark:text-zinc-400",
                    isOpen && "rotate-180 text-brand-orange",
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t border-zinc-100 bg-orange-50/20 px-4.5 py-4 text-sm leading-[1.75] text-zinc-700 sm:px-5 sm:py-4.5 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
                  <p className="text-pretty">
                    <BlogRichText text={faq.answer} />
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BlogPostFaq;
