import {
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";

interface Insight {
  id: string;
  statNumber: string;
  statLabel: string;
  source: string;
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionFeatures: string[];
  icon: typeof Clock;
  accentColor: string;
  image: string;
  imageAlt: string;
}

const INSIGHTS: Insight[] = [
  {
    id: "approval-bottleneck",
    statNumber: "73%",
    statLabel: "Agencies gặp nghẽn phê duyệt",
    source: "Sprout Social Index 2024",
    problemTitle: "Vòng lặp phản hồi phân mảnh kéo dài 4.2 ngày",
    problemDesc:
      "Giao tiếp rời rạc qua Zalo, Drive, Email khiến 43% bản nháp bị duyệt nhầm phiên bản, gây chậm trễ lịch phát hành chiến dịch và xung đột giữa Agency và Khách hàng.",
    solutionTitle: "Cơ chế duyệt 2 chiều & Phân quyền 2-Tier RBAC",
    solutionFeatures: [
      "Thương lượng điều khoản Media Package trực tiếp trên hệ thống",
      "Quy trình Review & Feedback minh bạch với phiên bản khóa cứng",
      "Tự động chuyển đổi đề xuất đã duyệt thành Task triển khai thực tế",
    ],
    icon: Clock,
    accentColor: "from-amber-500/20 to-orange-500/20 text-amber-500",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=360&fit=crop",
    imageAlt: "Họp đàm phán duyệt chiến dịch giữa Agency và Khách hàng",
  },
  {
    id: "brand-tone-drift",
    statNumber: "68%",
    statLabel: "Marketers đối mặt rủi ro Brand Voice",
    source: "HubSpot State of Marketing 2024",
    problemTitle: "AI tự do gây loãng nhận diện và rủi ro bản quyền",
    problemDesc:
      "Dùng AI không có khung kiểm soát dẫn đến bài đăng sai lệch giọng điệu thương hiệu, thiếu thống nhất màu sắc hình ảnh và nguy cơ bị đánh cắp tài sản truyền thông.",
    solutionTitle: "GraphRAG & Bộ lọc kiểm soát Brand Guidelines",
    solutionFeatures: [
      "Neo4j Knowledge Graph & ChromaDB neo giữ quy chuẩn thương hiệu",
      "AI Trend Crawler tự động bắt nhịp thảo luận nóng từ Facebook MXH",
      "Tự động đóng Watermark số bản quyền theo preset từng Workspace",
    ],
    icon: ShieldAlert,
    accentColor: "from-rose-500/20 to-brand-orange/20 text-rose-500",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=700&h=360&fit=crop",
    imageAlt: "Đảm bảo tuân thủ Brand Voice và bản quyền nhận diện",
  },
  {
    id: "manual-fatigue",
    statNumber: "52%",
    statLabel: "Thời gian tiêu tốn vào tác vụ thủ công",
    source: "McKinsey Digital Report",
    problemTitle: "Lãng phí hàng trăm giờ định dạng & copy-paste đa kênh",
    problemDesc:
      "Đội ngũ sáng tạo mất quá nhiều thời gian vào việc chỉnh sửa kích thước, format caption riêng cho Facebook, Instagram, TikTok và canh giờ đăng thủ công.",
    solutionTitle: "Hàng đợi phân phối tự động & Bảo mật AES Token",
    solutionFeatures: [
      "Xuất bản đồng thời 1-click lên Facebook, Instagram, TikTok, Threads",
      "Mã hóa AES-256 an toàn cho Social Access Tokens doanh nghiệp",
      "Lập lịch thông minh và tự động thử lại (Retry Outbox) khi mạng chập chờn",
    ],
    icon: Sparkles,
    accentColor: "from-blue-500/20 to-indigo-500/20 text-blue-500",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&h=360&fit=crop",
    imageAlt: "Tự động hóa xuất bản và quản lý kênh mạng xã hội",
  },
];

export function IndustryInsights() {
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: gridRef, isIntersecting: gridVisible } = useIntersectionObserver(
    { threshold: 0.1, freezeOnceVisible: true },
  );

  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950">
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-3xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <TrendingUp className="size-3.5" />
            <span>NGHIÊN CỨU & DỮ LIỆU THỰC TẾ NGÀNH MARKETING</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Giải quyết triệt để 3 nút thắt lớn nhất giữa{" "}
            <span className="text-brand-orange">Agency & Khách hàng</span>
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            BrandHub không chỉ là công cụ tạo nội dung thông thường — nền tảng
            được thiết kế dựa trên các khảo sát và nghiên cứu thực nghiệm nhằm
            giải phóng hiệu suất làm việc cho cả hai phía.
          </p>
        </div>

        {/* 3 Insight Cards */}
        <div ref={gridRef} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {INSIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  transitionDelay: gridVisible ? `${i * 150}ms` : "0ms",
                }}
                className={cn(
                  "insight-card group hover:border-brand-orange/40 dark:hover:border-brand-orange/40 flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-zinc-50/60 p-8 transition-all duration-500 ease-out hover:bg-white hover:shadow-xl motion-reduce:opacity-100 motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900",
                  gridVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0",
                )}
              >
                <div>
                  {/* Stat Header */}
                  <div className="flex items-start justify-between border-b border-zinc-200/60 pb-6 dark:border-zinc-800">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                          {item.statNumber}
                        </span>
                      </div>
                      <p className="text-brand-orange mt-1 text-xs font-bold uppercase">
                        {item.statLabel}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                        Nguồn: {item.source}
                      </p>
                    </div>
                    <div
                      className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accentColor} shadow-inner`}
                    >
                      <Icon className="size-6" />
                    </div>
                  </div>

                  {/* Photo Context Banner */}
                  <div className="relative mt-5 h-36 w-full overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-[11px] font-medium text-white/90 drop-shadow">
                      {item.imageAlt}
                    </span>
                  </div>

                  {/* Problem Description */}
                  <div className="mt-5">
                    <span className="inline-block rounded-md bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 uppercase dark:bg-rose-500/20 dark:text-rose-400">
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
                <div className="border-brand-orange/20 bg-brand-orange/5 dark:border-brand-orange/20 dark:bg-brand-orange/10 mt-8 rounded-2xl border p-5">
                  <div className="text-brand-orange flex items-center gap-1.5 text-xs font-bold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Giải pháp từ BrandHub</span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.solutionTitle}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {item.solutionFeatures.map((feat, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-2 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400"
                      >
                        <span className="text-brand-orange mt-0.5 text-xs font-bold">
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
