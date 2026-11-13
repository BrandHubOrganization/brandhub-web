import {
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

interface Insight {
  id: string;
  statNumber: string;
  statLabel: string;
  source: string;
  floatingBadge: string;
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionFeatures: string[];
  icon: typeof Clock;
  cardTheme: string;
  orbTheme: string;
  pillTheme: string;
  solutionTheme: string;
  image: string;
  imageAlt: string;
  frameCutout: string;
}

const INSIGHTS: Insight[] = [
  {
    id: "approval-bottleneck",
    statNumber: "73%",
    statLabel: "Agencies gặp nghẽn phê duyệt",
    source: "Sprout Social Index 2024",
    floatingBadge: "GIẢM 85% THỜI GIAN CHỜ DUYỆT",
    problemTitle: "Vòng lặp phản hồi phân mảnh kéo dài 4.2 ngày",
    problemDesc:
      "Giao tiếp rời rạc qua Zalo, Drive, Email khiến 43% bản nháp bị duyệt nhầm phiên bản, gây chậm trễ lịch phát hành chiến dịch và xung đột giữa Agency và Client.",
    solutionTitle: "Cơ chế duyệt 3 cấp & Phân quyền chuẩn RBAC",
    solutionFeatures: [
      "Thương lượng điều khoản Media Package trực tiếp trên hệ thống",
      "Luồng phê duyệt Creator → Manager → Client khóa cứng phiên bản",
      "Tự động chuyển đổi đề xuất đã duyệt thành Task triển khai thực tế",
    ],
    icon: Clock,
    cardTheme:
      "from-amber-50/90 via-white to-orange-50/50 border-amber-200/90 dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 dark:border-amber-800/40",
    orbTheme: "bg-gradient-to-br from-amber-500 to-brand-orange text-white shadow-amber-500/30",
    pillTheme: "bg-amber-500 text-white shadow-amber-500/30",
    solutionTheme:
      "border-amber-300/60 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:border-amber-700/40 dark:from-amber-500/15",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=360&fit=crop",
    imageAlt: "Họp đàm phán duyệt chiến dịch giữa Agency và Client",
    frameCutout: "rounded-tl-[26px] rounded-tr-[8px] rounded-br-[26px] rounded-bl-[8px] bh-cutout-br",
  },
  {
    id: "brand-tone-drift",
    statNumber: "68%",
    statLabel: "Marketers đối mặt rủi ro Brand Voice",
    source: "HubSpot State of Marketing 2024",
    floatingBadge: "100% TUÂN THỦ BRAND GUIDELINES",
    problemTitle: "AI tự do gây loãng nhận diện và rủi ro vi phạm chính sách",
    problemDesc:
      "Dùng AI không có khung kiểm soát dẫn đến bài đăng sai lệch giọng điệu thương hiệu, thiếu thống nhất màu sắc hình ảnh và nguy cơ vi phạm tiêu chuẩn cộng đồng.",
    solutionTitle: "GraphRAG & Bộ lọc kiểm soát Brand Guidelines",
    solutionFeatures: [
      "Neo4j Knowledge Graph & ChromaDB neo giữ quy chuẩn thương hiệu",
      "AI Trend Crawler tự động bắt nhịp thảo luận nóng từ TikTok & Google Trends",
      "Tự động kiểm duyệt an toàn nội dung cộng đồng trước khi gửi duyệt",
    ],
    icon: ShieldAlert,
    cardTheme:
      "from-rose-50/90 via-white to-orange-50/40 border-rose-200/90 dark:from-rose-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-rose-800/40",
    orbTheme: "bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-rose-500/30",
    pillTheme: "bg-rose-600 text-white shadow-rose-600/30",
    solutionTheme:
      "border-rose-300/60 bg-gradient-to-br from-rose-500/10 to-orange-500/5 dark:border-rose-700/40 dark:from-rose-500/15",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=700&h=360&fit=crop",
    imageAlt: "Đảm bảo tuân thủ Brand Voice và an toàn nội dung thương hiệu",
    frameCutout: "rounded-t-[999px] rounded-b-[24px]",
  },
  {
    id: "manual-fatigue",
    statNumber: "52%",
    statLabel: "Thời gian tiêu tốn vào tác vụ thủ công",
    source: "McKinsey Digital Report",
    floatingBadge: "X3.8 TỐC ĐỘ PHÂN PHỐI ĐA KÊNH",
    problemTitle: "Lãng phí hàng trăm giờ định dạng & copy-paste đa kênh",
    problemDesc:
      "Đội ngũ sáng tạo mất quá nhiều thời gian vào việc chỉnh sửa kích thước, format caption riêng cho Facebook, Instagram, TikTok, Threads và canh giờ đăng thủ công.",
    solutionTitle: "Hàng đợi phân phối tự động & Bảo mật AES Token",
    solutionFeatures: [
      "Xuất bản đồng thời 1-click lên Facebook, Instagram, TikTok, Threads",
      "Mã hóa AES-256 an toàn cho Social Access Tokens doanh nghiệp",
      "Lập lịch thông minh và tự động thử lại (Outbox Retry) khi mạng chập chờn",
    ],
    icon: Sparkles,
    cardTheme:
      "from-indigo-50/90 via-white to-sky-50/50 border-indigo-200/90 dark:from-indigo-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-indigo-800/40",
    orbTheme: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/30",
    pillTheme: "bg-indigo-600 text-white shadow-indigo-600/30",
    solutionTheme:
      "border-indigo-300/60 bg-gradient-to-br from-indigo-500/10 to-sky-500/5 dark:border-indigo-700/40 dark:from-indigo-500/15",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&h=360&fit=crop",
    imageAlt: "Tự động hóa xuất bản và quản lý kênh mạng xã hội",
    frameCutout: "rounded-l-[24px] rounded-r-[999px]",
  },
];

const KINETIC_METRICS = [
  "73% GIẢM NGHẼN PHÊ DUYỆT",
  "NEO4J + CHROMADB GRAPHRAG",
  "4 NỀN TẢNG: FACEBOOK · INSTAGRAM · TIKTOK · THREADS",
  "MÃ HÓA TOKEN AES-256-GCM",
  "GIẢI PHÁP QUẢN TRỊ TRUYỀN THÔNG TOÀN DIỆN",
  "LUỒNG DUYỆT CREATOR → MANAGER → CLIENT",
];

export function IndustryInsights() {
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );

  return (
    <section
      id="insights"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      {/* Scroll-Scrubbed Horizontal Kinetic Ribbon */}
      <div
        aria-hidden="true"
        className="pointer-events-none mb-12 overflow-hidden border-y border-zinc-200/80 bg-zinc-50/70 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <div
          data-bh-horizontal-track="left"
          className="flex w-max items-center gap-8 px-4 text-[11px] font-extrabold tracking-[0.18em] text-zinc-500 uppercase will-change-transform dark:text-zinc-400"
        >
          {[...KINETIC_METRICS, ...KINETIC_METRICS].map((label, idx) => (
            <span key={idx} className="inline-flex items-center gap-3">
              <span className="bg-brand-orange size-2 rounded-full" />
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-3xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="border-brand-orange/25 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold shadow-xs">
            <TrendingUp className="size-3.5" />
            <span>NGHIÊN CỨU &amp; DỮ LIỆU THỰC TẾ NGÀNH MARKETING</span>
          </div>
          <SplitHeading
            text="Giải quyết triệt để 3 nút thắt lớn nhất giữa"
            highlightText="Agency & Khách hàng"
            className="mt-4"
          />
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            BrandHub không chỉ là công cụ tạo nội dung thông thường, nền tảng
            được thiết kế dựa trên các khảo sát và nghiên cứu thực nghiệm nhằm
            giải phóng hiệu suất làm việc cho cả hai phía.
          </p>
        </div>

        {/* 3 Clean Editorial Insight Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {INSIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="insight-card group flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:border-brand-orange/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-zinc-700 uppercase dark:bg-zinc-800 dark:text-zinc-200">
                      <Icon className="text-brand-orange size-3" />
                      <span>{item.floatingBadge}</span>
                    </span>
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      /0{i + 1}
                    </span>
                  </div>

                  {/* Stat Header */}
                  <div className="border-b border-zinc-200/70 pb-4 dark:border-zinc-800">
                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums sm:text-5xl dark:text-zinc-50">
                      {item.statNumber}
                    </span>
                    <p className="text-brand-orange mt-1 text-xs font-bold tracking-wide uppercase">
                      {item.statLabel}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Nguồn: {item.source}
                    </p>
                  </div>

                  {/* Clean Photo Frame */}
                  <div className="mt-5">
                    <div className="h-40 w-full overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        width={700}
                        height={360}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      {item.imageAlt}
                    </p>
                  </div>

                  {/* Problem Description */}
                  <div className="mt-4">
                    <span className="inline-block rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:bg-rose-500/20 dark:text-rose-400">
                      Nỗi đau thị trường
                    </span>
                    <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {item.problemTitle}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {item.problemDesc}
                    </p>
                  </div>
                </div>

                {/* BrandHub Solution Box */}
                <div className="mt-6 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                  <div className="text-brand-orange flex items-center gap-1.5 text-xs font-extrabold uppercase">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Giải pháp từ BrandHub</span>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.solutionTitle}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {item.solutionFeatures.map((feat, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-2 text-[11px] leading-snug text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="text-brand-orange mt-0.5 text-xs font-black">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default IndustryInsights;
