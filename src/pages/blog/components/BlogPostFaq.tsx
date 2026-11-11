import { HelpCircle } from "lucide-react";
import { BlogRichText } from "./BlogRichText";

interface BlogPostFaqProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

export function BlogPostFaq({ faqs }: BlogPostFaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      id="cau-hoi-thuong-gap"
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4 shadow-2xs"
    >
      <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
        <HelpCircle className="size-4" />
        <span>Giải đáp thắc mắc thực tế (FAQ)</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
        Câu hỏi thường gặp về chủ đề này
      </h2>
      <div className="space-y-3 pt-2">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-muted/20 p-4 space-y-2"
          >
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {faq.question}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <BlogRichText text={faq.answer} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BlogPostFaq;
