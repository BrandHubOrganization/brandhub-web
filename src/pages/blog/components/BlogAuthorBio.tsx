import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { BlogAuthor } from "@/data/blogAuthors";

interface BlogAuthorBioProps {
  author: BlogAuthor;
}

export function BlogAuthorBio({ author }: BlogAuthorBioProps) {
  return (
    <section
      aria-label="Thông tin tác giả"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4"
    >
      <div className="size-14 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white font-extrabold flex items-center justify-center text-lg shrink-0">
        {author.name
          .split(" ")
          .slice(-2)
          .map((w) => w[0])
          .join("")}
      </div>
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-foreground">
            Biên soạn &amp; Kiểm duyệt kỹ thuật: {author.name}
          </h3>
          <span className="text-xs font-semibold text-brand-orange">
            ({author.roleTitle})
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="size-3" />
            <span>Chuyên gia BrandHub</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {author.bio}
        </p>
        <div className="pt-1">
          <Link
            to={`/blog?q=${encodeURIComponent(author.name)}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
          >
            <span>Xem toàn bộ bài phân tích của {author.name}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BlogAuthorBio;
