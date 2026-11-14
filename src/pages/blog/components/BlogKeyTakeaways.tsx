import { CheckCircle2, Sparkles } from "lucide-react";
import { BlogRichText } from "./BlogRichText";

interface BlogKeyTakeawaysProps {
  geoSummary: string;
  keyTakeaways: string[];
}

export function BlogKeyTakeaways({
  geoSummary,
  keyTakeaways,
}: BlogKeyTakeawaysProps) {
  return (
    <section
      aria-label="Tóm tắt trọng tâm bài viết"
      className="rounded-xl border border-zinc-200/90 bg-zinc-50/75 p-5 shadow-2xs sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/75"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand-orange uppercase">
          <Sparkles className="size-3.5" />
          <span>Tóm tắt Trọng tâm &amp; Giải pháp Cốt lõi</span>
        </div>

        <p className="text-pretty text-sm leading-[1.75] font-medium text-zinc-800 sm:text-[15px] dark:text-zinc-200">
          <BlogRichText text={geoSummary} />
        </p>

        {keyTakeaways.length > 0 && (
          <div className="border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
            <p className="mb-3 text-xs font-bold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
              Điểm cốt lõi cần nắm ({keyTakeaways.length} ý chính)
            </p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {keyTakeaways.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700 sm:text-[13.5px] dark:text-zinc-300"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <BlogRichText text={point} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogKeyTakeaways;
