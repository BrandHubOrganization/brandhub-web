import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Sparkles,
  ShieldCheck,
  Share2,
  GitPullRequest,
  CreditCard,
  BookOpen,
  ArrowUpRight,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

interface FaqItemMeta {
  key: "q1" | "q2" | "q3" | "q4" | "q5";
  num: string;
  tagVi: string;
  tagEn: string;
  highlightsVi: string[];
  highlightsEn: string[];
  icon: LucideIcon;
  photo: string;
  photoCaptionVi: string;
  photoCaptionEn: string;
}

const FAQS: FaqItemMeta[] = [
  {
    key: "q1",
    num: "01",
    tagVi: "Gói cước & Dùng thử",
    tagEn: "Pricing & Free Trial",
    highlightsVi: [
      "Khởi tạo miễn phí không cần thẻ tín dụng",
      "Thanh toán VietQR SePay / PayOS tức thì",
      "Nâng cấp linh hoạt theo quy mô Agency",
    ],
    highlightsEn: [
      "Start free with no credit card required",
      "Instant VietQR SePay / PayOS checkout",
      "Scale seamlessly as your Agency grows",
    ],
    icon: CreditCard,
    photo:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=620&fit=crop",
    photoCaptionVi:
      "Khởi tạo Workspace miễn phí và kích hoạt gói cước tức thì qua VietQR",
    photoCaptionEn:
      "Create a free Workspace and activate plans instantly via VietQR",
  },
  {
    key: "q2",
    num: "02",
    tagVi: "Xuất bản Đa kênh",
    tagEn: "Multi-Channel Publishing",
    highlightsVi: [
      "4 nền tảng chính thức: Facebook, Instagram, TikTok, Threads",
      "Cơ chế Outbox Retry tự động chống rớt bài",
      "Đồng bộ lịch đăng kéo thả trực quan",
    ],
    highlightsEn: [
      "4 official platforms: Facebook, Instagram, TikTok, Threads",
      "Automated Outbox Retry prevents failed posts",
      "Interactive drag-and-drop publishing calendar",
    ],
    icon: Share2,
    photo:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=620&fit=crop",
    photoCaptionVi:
      "Tự động xuất bản đồng loạt lên Facebook, Instagram, TikTok và Threads",
    photoCaptionEn:
      "Auto-publish across Facebook, Instagram, TikTok, and Threads",
  },
  {
    key: "q3",
    num: "03",
    tagVi: "AI GraphRAG & LoRA",
    tagEn: "AI GraphRAG & LoRA",
    highlightsVi: [
      "Cào xu hướng đa nền tảng theo thời gian thực",
      "GraphRAG đối chiếu chuẩn mực Brand Guidelines",
      "Huấn luyện đại sứ ảo LoRA độc quyền thương hiệu",
    ],
    highlightsEn: [
      "Real-time multi-platform trend crawling",
      "GraphRAG brand guideline compliance engine",
      "Custom LoRA virtual brand ambassador training",
    ],
    icon: Sparkles,
    photo:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=620&fit=crop",
    photoCaptionVi:
      "Hệ sinh thái 19 tính năng AI kết hợp GraphRAG và mô hình đại sứ ảo LoRA",
    photoCaptionEn:
      "19 AI capabilities powered by GraphRAG and custom LoRA virtual ambassadors",
  },
  {
    key: "q4",
    num: "04",
    tagVi: "Luồng Phê duyệt 3 Cấp",
    tagEn: "3-Tier Approval Workflow",
    highlightsVi: [
      "Chuỗi phân quyền: Owner → Manager → Creator → Client",
      "Nhật ký kiểm duyệt bất biến (Audit Trail)",
      "Khách hàng phản hồi trực tiếp trên từng bản nháp",
    ],
    highlightsEn: [
      "Canonical role chain: Owner → Manager → Creator → Client",
      "Immutable approval history & Audit Trail",
      "Direct Client feedback on every draft asset",
    ],
    icon: GitPullRequest,
    photo:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=620&fit=crop",
    photoCaptionVi:
      "Quy trình phê duyệt 3 cấp minh bạch giữa Creator, Manager và Client",
    photoCaptionEn:
      "Transparent 3-tier approval workflow across Creator, Manager, and Client",
  },
  {
    key: "q5",
    num: "05",
    tagVi: "Bảo mật & Phân quyền",
    tagEn: "Security & RBAC",
    highlightsVi: [
      "Mã hóa OAuth Access Token chuẩn AES-256-GCM",
      "Cô lập dữ liệu đa thuê bao (Multi-Tenant Isolation)",
      "Xác thực JWT RS256 & kiểm soát 6 vai trò hệ thống",
    ],
    highlightsEn: [
      "AES-256-GCM encrypted OAuth Access Tokens",
      "Strict Multi-Tenant Workspace data isolation",
      "RS256 JWT authentication & 6-role RBAC enforcement",
    ],
    icon: ShieldCheck,
    photo:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=620&fit=crop",
    photoCaptionVi:
      "Bảo vệ Access Token mạng xã hội bằng mã hóa AES-256 và kiến trúc Zero-Trust",
    photoCaptionEn:
      "Social OAuth tokens protected with AES-256 encryption and Zero-Trust RBAC",
  },
];

export function FAQ() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [openKey, setOpenKey] = useState<FaqItemMeta["key"] | null>("q1");
  const [activePreviewKey, setActivePreviewKey] =
    useState<FaqItemMeta["key"]>("q1");

  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.12, freezeOnceVisible: true },
  );
  const { ref: listRef, isIntersecting: listVisible } = useIntersectionObserver(
    { threshold: 0.08, freezeOnceVisible: true },
  );

  const activeMeta =
    FAQS.find((item) => item.key === (openKey ?? activePreviewKey)) ?? FAQS[0];
  const ActiveIcon = activeMeta.icon;
  const activeHighlights = isEn
    ? activeMeta.highlightsEn
    : activeMeta.highlightsVi;

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-zinc-50/70 py-20 sm:py-24 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-8 xl:gap-10">
          {/* Left Full-Height Editorial & Visual Showcase Column */}
          <div
            ref={headRef}
            className={cn(
              "flex flex-col justify-between h-full transition-all duration-500 ease-out lg:col-span-5 xl:col-span-6 motion-reduce:opacity-100 motion-reduce:transition-none",
              headVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            {/* Header Area */}
            <div className="shrink-0">
              <div className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase">
                <HelpCircle className="size-3.5" />
                <span>
                  {isEn ? "KNOWLEDGE BASE & SUPPORT" : "TRUNG TÂM GIẢI ĐÁP 24/7"}
                </span>
              </div>

              <SplitHeading
                text={t("landing.faq.title")}
                className="text-left"
              />
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base dark:text-zinc-400">
                {t("landing.faq.subtitle")}
              </p>
            </div>

            {/* Interactive Preview Stage - Fills Remaining Vertical Space */}
            <div className="bh-stage-reveal mt-5 flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4.5 shadow-sm sm:mt-6 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Image Showcase: stretches naturally to balance the right column */}
              <div className="group relative w-full flex-1 min-h-[220px] sm:min-h-[260px] overflow-hidden rounded-2xl bg-zinc-100 shadow-inner dark:bg-zinc-800">
                <img
                  key={activeMeta.key}
                  src={activeMeta.photo}
                  alt={
                    isEn ? activeMeta.photoCaptionEn : activeMeta.photoCaptionVi
                  }
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

                {/* Floating Badges inside Image */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                  <ActiveIcon className="text-brand-orange size-3.5" />
                  <span>{isEn ? activeMeta.tagEn : activeMeta.tagVi}</span>
                </div>
                <span className="absolute top-3 right-3 rounded-full bg-brand-orange px-2.5 py-0.5 font-mono text-[11px] font-bold text-white shadow-xs">
                  TOPIC #{activeMeta.num}
                </span>

                {/* Caption overlaid on bottom of photo */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-xs font-semibold leading-snug drop-shadow-xs sm:text-sm">
                    {isEn
                      ? activeMeta.photoCaptionEn
                      : activeMeta.photoCaptionVi}
                  </p>
                </div>
              </div>

              {/* Topic Highlights & Interactive Browser */}
              <div className="mt-3.5 shrink-0 space-y-2.5 px-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeHighlights.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50/70 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-2xs dark:border-orange-950/80 dark:bg-orange-950/30 dark:text-orange-200"
                    >
                      <span className="bg-brand-orange size-1.5 shrink-0 rounded-full" />
                      <span>{chip}</span>
                    </span>
                  ))}
                </div>

                {/* Quick Topic Switcher Bar */}
                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/90 px-3.5 py-2 dark:border-zinc-800/80 dark:bg-zinc-950/60">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {isEn ? "Select topic to preview:" : "Chọn nhanh chủ đề:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {FAQS.map((faq) => {
                      const isCurrent = activeMeta.key === faq.key;
                      return (
                        <button
                          key={faq.key}
                          type="button"
                          onClick={() => {
                            setActivePreviewKey(faq.key);
                            setOpenKey(faq.key);
                          }}
                          className={cn(
                            "group relative flex size-7 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition-all duration-200",
                            isCurrent
                              ? "bg-brand-orange text-white shadow-2xs scale-105"
                              : "border border-zinc-200/80 bg-white text-zinc-600 hover:border-orange-300 hover:bg-orange-50 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                          )}
                          title={`${faq.num}. ${isEn ? faq.tagEn : faq.tagVi}`}
                          aria-label={`Topic ${faq.num}`}
                        >
                          {faq.num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Resource Links Footer */}
              <div className="mt-3.5 shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3.5 py-2.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300">
                <div className="flex items-center gap-2 font-medium">
                  <BookOpen className="text-brand-orange size-4 shrink-0" />
                  <span>
                    {isEn
                      ? "Need deeper technical docs?"
                      : "Cần tài liệu hướng dẫn chi tiết?"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/help/faq"
                    className="text-brand-orange inline-flex items-center gap-1 font-bold hover:underline"
                  >
                    <span>{isEn ? "Full FAQ" : "Tất cả câu hỏi"}</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <Link
                    to="/help/guide"
                    className="inline-flex items-center gap-1 font-semibold text-zinc-700 hover:text-brand-orange dark:text-zinc-200 dark:hover:text-orange-300"
                  >
                    <span>{isEn ? "User Guide" : "Cẩm nang"}</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Rounded Accordion Column */}
          <div
            ref={listRef}
            className="flex flex-col justify-between space-y-3.5 lg:col-span-7 xl:col-span-6 sm:space-y-4"
          >
            {FAQS.map((item, i) => {
              const isOpen = openKey === item.key;
              const ItemIcon = item.icon;
              const highlights = isEn ? item.highlightsEn : item.highlightsVi;

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setActivePreviewKey(item.key)}
                  style={{
                    transitionDelay: listVisible ? `${i * 75}ms` : "0ms",
                  }}
                  className={cn(
                    "faq-row group overflow-hidden rounded-[26px] border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:opacity-100 motion-reduce:transition-none",
                    listVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0",
                    isOpen
                      ? "border-brand-orange/60 bg-gradient-to-br from-orange-50/70 via-white to-white shadow-xl shadow-orange-500/5 dark:border-brand-orange/50 dark:from-orange-950/20 dark:via-zinc-900 dark:to-zinc-900"
                      : "hover:border-brand-orange/35 border-zinc-200/90 bg-white shadow-xs hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => {
                      setOpenKey(isOpen ? null : item.key);
                      setActivePreviewKey(item.key);
                    }}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7 sm:py-6"
                  >
                    <div className="flex items-start gap-4 sm:items-center">
                      {/* Architectural Number Badge */}
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black tracking-tight tabular-nums transition-all duration-300",
                          isOpen
                            ? "bg-brand-orange text-white shadow-md shadow-orange-500/25"
                            : "bg-zinc-100 text-zinc-500 group-hover:bg-orange-50 group-hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-400",
                        )}
                      >
                        {item.num}
                      </div>

                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-orange-700 uppercase dark:bg-orange-950/60 dark:text-orange-300">
                            <ItemIcon className="size-3" />
                            {isEn ? item.tagEn : item.tagVi}
                          </span>
                        </div>
                        <span className="text-base font-bold text-zinc-900 sm:text-lg dark:text-zinc-100">
                          {t(`landing.faq.items.${item.key}.q`)}
                        </span>
                      </div>
                    </div>

                    {/* Rotating + / x toggle inspired by `.prize-toggle` in giaimamanhai.vercel.app */}
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen
                          ? "border-brand-orange bg-brand-orange rotate-[135deg] text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 group-hover:border-orange-300 group-hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                      )}
                      aria-hidden="true"
                    >
                      <Plus className="size-5" />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-zinc-200/60 px-6 pt-4 pb-6 sm:px-7 sm:pl-[4.75rem] dark:border-zinc-800">
                        <p className="text-sm leading-relaxed text-zinc-600 sm:text-[15px] dark:text-zinc-300">
                          {t(`landing.faq.items.${item.key}.a`)}
                        </p>

                        {/* Key Highlight Pills */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {highlights.map((chip) => (
                            <span
                              key={chip}
                              className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              <span className="bg-brand-orange size-1.5 rounded-full" />
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
