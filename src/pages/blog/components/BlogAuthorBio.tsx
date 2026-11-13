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
      className="bh-spotlight-card rounded-2xl border border-zinc-200/85 bg-white p-5 shadow-2xs sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            loading="lazy"
            className="size-16 shrink-0 rounded-2xl border border-orange-200/75 object-cover shadow-2xs dark:border-zinc-700"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/15 text-lg font-extrabold text-brand-orange">
            {author.name.slice(0, 1)}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              {author.name}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck className="size-3" />
              Đội ngũ Chuyên gia BrandHub
            </span>
          </div>

          <p className="text-xs font-semibold text-brand-orange">
            {author.roleTitle}
          </p>

          {author.highlight && (
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {author.highlight}
            </p>
          )}

          <p className="text-pretty text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
            {author.bio}
          </p>

          <div className="pt-1">
            <Link
              to={`/blog?q=${encodeURIComponent(author.name)}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline"
            >
              <span>Xem các bài viết của {author.name}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogAuthorBio;
