import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Rocket,
  LogIn,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlogHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-slate-950 via-[#0d1117] to-slate-950 text-white p-6 sm:p-10 shadow-2xl">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-brand-orange/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] opacity-60"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Heading & Value Proposition */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-300 backdrop-blur-md shadow-xs">
            <BookOpen className="size-3.5 text-brand-orange" />
            <span className="uppercase tracking-wider">
              CẨM NANG &amp; GIẢI PHÁP TRUYỀN THÔNG CHO AGENCY
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.15] text-balance">
            Chuẩn hóa quy trình vận hành{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Agency, Gói Truyền thông &amp; AI Studio
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed text-pretty max-w-2xl">
            Thư viện phân tích chuyên sâu hỗ trợ <strong className="text-white">Owner</strong>,{" "}
            <strong className="text-white">Manager</strong>,{" "}
            <strong className="text-white">Creator</strong> và{" "}
            <strong className="text-white">Client</strong> làm chủ quy trình quản trị công việc
            hiện đại, đóng gói báo giá Gói truyền thông, kiểm soát Brand Tone qua AI GraphRAG và tự động
            hóa đăng tải 4 nền tảng mạng xã hội.
          </p>

          {/* Quick Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/register">
              <Button className="h-11 px-5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Rocket className="size-4" />
                <span>Đăng ký dùng thử 0đ</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                className="h-11 px-4 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <LogIn className="size-4" />
                <span>Đăng nhập vào Workspace</span>
              </Button>
            </Link>
            <a
              href="#articles-section"
              className="text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1.5 ml-2 cursor-pointer transition-colors"
            >
              <span>Xem các bài viết</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>

          {/* Metric Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              6 Chuyên mục thực chiến
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
              <TrendingUp className="size-3.5 text-orange-400" />
              100 Báo cáo &amp; Cẩm nang
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
              <UserCheck className="size-3.5 text-sky-400" />
              Chuẩn hóa 6 vai trò: Guest · Owner · Manager · Creator · Client · Admin
            </span>
          </div>
        </div>

        {/* Right Column: Live Operational Preview Card */}
        <div className="lg:col-span-5 hidden sm:block">
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-4 hover:border-brand-orange/40 transition-all duration-500">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-rose-500/80" />
                <div className="size-2.5 rounded-full bg-amber-500/80" />
                <div className="size-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  BrandHub Media Cockpit
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SYNC
              </span>
            </div>

            {/* Workflow preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold text-slate-200">Luồng phê duyệt 3 cấp:</span>
                <span className="text-emerald-400 font-mono font-semibold">Đã phê duyệt</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
                  <span className="text-[10px] text-slate-400 block">Bước 1</span>
                  <span className="text-xs font-bold text-slate-200">Creator</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Soạn thảo</span>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
                  <span className="text-[10px] text-slate-400 block">Bước 2</span>
                  <span className="text-xs font-bold text-slate-200">Manager</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Kiểm tra</span>
                </div>
                <div className="rounded-lg bg-brand-orange/15 border border-brand-orange/30 p-2 text-center">
                  <span className="text-[10px] text-orange-300 block">Bước 3</span>
                  <span className="text-xs font-bold text-white">Client</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5 font-bold">Chốt duyệt</span>
                </div>
              </div>
            </div>

            {/* Supported Channels Status */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-200 block">
                Sẵn sàng xuất bản 4 nền tảng:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">Facebook</span>
                  <span className="size-2 rounded-full bg-blue-500" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">Instagram</span>
                  <span className="size-2 rounded-full bg-pink-500" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">TikTok</span>
                  <span className="size-2 rounded-full bg-cyan-400" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">Threads</span>
                  <span className="size-2 rounded-full bg-zinc-200" />
                </div>
              </div>
            </div>

            {/* AI GraphRAG Guard Feature */}
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand-orange shrink-0" />
                <div>
                  <p className="font-bold text-white text-[11px] leading-tight">AI GraphRAG Brand Guard</p>
                  <p className="text-[10px] text-slate-300">Đồ thị tri thức Neo4j + Vector Search</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                100% On-Brand
              </span>
            </div>

            {/* Performance KPI */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/10">
              <span className="inline-flex items-center gap-1">
                <Zap className="size-3 text-amber-400" />
                Độ trễ API &lt; 120ms
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" />
                Bảo mật OAuth AES-256
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogHero;
