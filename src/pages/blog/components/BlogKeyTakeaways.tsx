import { Sparkles, CheckCircle2 } from "lucide-react";
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
      aria-label="Tóm tắt cốt lõi"
      className="rounded-2xl border-2 border-brand-orange/30 bg-gradient-to-br from-brand-orange/10 via-card to-amber-500/5 p-5 sm:p-6 space-y-4 shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-orange uppercase tracking-wider">
          <Sparkles className="size-4" />
          <span>Tóm tắt cốt lõi &amp; Điểm nhấn quản trị (Key Takeaways)</span>
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          Chuẩn trích dẫn AI Overview
        </span>
      </div>

      <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
        <BlogRichText text={geoSummary} />
      </p>

      <div className="space-y-2 pt-2 border-t border-border/60">
        {keyTakeaways.map((point, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
            <CheckCircle2 className="size-4 text-brand-orange shrink-0 mt-0.5" />
            <span className="text-foreground/90 leading-relaxed">
              <BlogRichText text={point} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BlogKeyTakeaways;
