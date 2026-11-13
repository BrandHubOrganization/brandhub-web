import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FolderKanban,
  Layers,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_EASE } from "./BlogMotion";

const STATS = [
  {
    value: "100",
    label: "Chủ đề Thực chiến",
    icon: BookOpen,
  },
  {
    value: "6",
    label: "Vai trò Hệ thống",
    icon: Layers,
  },
  {
    value: "4",
    label: "Kênh Xuất bản",
    icon: Share2,
  },
  {
    value: "GraphRAG",
    label: "AI Chuẩn Brand",
    icon: Sparkles,
  },
];

const WORKFLOW_ITEMS = [
  {
    step: "01",
    name: "Workspace Cô lập Đa Thương hiệu",
    status: "Jira + Notion",
  },
  {
    step: "02",
    name: "Gói Truyền thông & Báo giá Client",
    status: "Phê duyệt 3 cấp",
  },
  {
    step: "03",
    name: "Xuất bản Đồng bộ & Bắt Trend AI",
    status: "FB · IG · TikTok · Threads",
  },
];

export function BlogHero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs sm:p-10 lg:p-12 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Editorial Column (starts visible at opacity 1 for SSR/prerendered LCP & smooth slide settle) */}
        <motion.div
          initial={prefersReduced ? false : { y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.45, ease: BLOG_EASE }}
          className="space-y-6 lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
            <BookOpen className="size-3.5 text-brand-orange" />
            <span>Thư viện Tri thức Quản trị Agency &amp; Content AI</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-balance text-3xl leading-[1.14] font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-[42px] dark:text-zinc-50">
              Cẩm nang{" "}
              <span className="text-brand-orange">Vận hành Truyền thông</span>{" "}
              Chuẩn Hóa Dành Cho Agency &amp; Doanh Nghiệp
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base sm:leading-relaxed dark:text-zinc-300">
              Tổng hợp{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                100 chuyên đề thực chiến
              </strong>{" "}
              về quản trị dự án như Jira/Notion, kiểm soát quy trình duyệt bài
              3 cấp, ứng dụng AI Studio GraphRAG giữ chuẩn Brand Voice và tự
              động xuất bản đồng loạt lên Facebook, Instagram, TikTok, Threads.
            </p>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link to="/register">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 h-11 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                Dùng thử BrandHub Miễn phí
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                className="h-11 cursor-pointer rounded-xl border-zinc-200 bg-white/90 px-5 text-sm font-semibold text-zinc-800 shadow-2xs transition-all hover:border-brand-orange/40 hover:bg-orange-50/40 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-orange-500/50 dark:hover:bg-zinc-800"
              >
                Đăng nhập Workspace
              </Button>
            </Link>
          </div>

          {/* Key Highlights Strip */}
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {STATS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3.5 py-3 transition-colors hover:border-brand-orange/35 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div className="flex items-center gap-1.5 text-brand-orange">
                    <Icon className="size-3.5 shrink-0" />
                    <span className="tabular-nums text-base font-extrabold tracking-tight text-zinc-900 sm:text-lg dark:text-zinc-50">
                      {item.value}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Clean Editorial Blueprint Card */}
        <motion.div
          initial={prefersReduced ? false : { y: 14 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: BLOG_EASE }}
          className="lg:col-span-5"
        >
          <div className="bh-spotlight-card group rounded-2xl border border-zinc-200/90 bg-zinc-50/55 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/75">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200/80 pb-3.5 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  <FolderKanban className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Bản đồ Kiến trúc Nội dung 2026
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Lộ trình chuẩn cho Owner, Manager &amp; Creator
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <TrendingUp className="size-3 text-brand-orange" />
                100% Đã xuất bản
              </span>
            </div>

            <div className="space-y-2.5">
              {WORKFLOW_ITEMS.map((wf) => (
                <div
                  key={wf.step}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 transition-colors group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="tabular-nums font-mono text-[11px] font-bold text-brand-orange">
                      {wf.step}
                    </span>
                    <span className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {wf.name}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {wf.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 text-[11px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-3.5 shrink-0 text-brand-orange" />
                Tích hợp SePay / PayOS VietQR minh bạch
              </span>
              <a
                href="#danh-muc-100-chu-de"
                className="inline-flex items-center gap-1 font-bold text-brand-orange hover:underline"
              >
                Xem 100 chủ đề
                <ArrowRight className="size-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default BlogHero;
