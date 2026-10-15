import { motion, useReducedMotion } from "motion/react";
import { Clock, ShieldAlert, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
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
  },
];

export function IndustryInsights() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950">
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-4 py-1.5 text-xs font-semibold text-brand-orange">
            <TrendingUp className="size-3.5" />
            <span>NGHIÊN CỨU & DỮ LIỆU THỰC TẾ NGÀNH MARKETING</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Giải quyết triệt để 3 nút thắt lớn nhất giữa{" "}
            <span className="text-brand-orange">Agency & Khách hàng</span>
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            BrandHub không chỉ là công cụ tạo nội dung thông thường — nền tảng được thiết kế dựa trên các khảo sát và nghiên cứu thực nghiệm nhằm giải phóng hiệu suất làm việc cho cả hai phía.
          </p>
        </motion.div>

        {/* 3 Insight Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {INSIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-zinc-50/60 p-8 transition-all hover:border-brand-orange/40 hover:bg-white hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-brand-orange/40 dark:hover:bg-zinc-900"
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
                      <p className="mt-1 text-xs font-bold text-brand-orange uppercase">
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

                  {/* Problem Description */}
                  <div className="mt-6">
                    <span className="inline-block rounded-md bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 uppercase dark:bg-rose-500/20 dark:text-rose-400">
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
                <div className="mt-8 rounded-2xl border border-brand-orange/20 bg-brand-orange/5 p-5 dark:border-brand-orange/20 dark:bg-brand-orange/10">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange">
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
                        <span className="text-brand-orange mt-0.5 text-xs font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default IndustryInsights;
