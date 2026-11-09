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
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import {
  SplitHeading,
  SpinningSeal,
} from "@/components/landing/MotionPrimitives";

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

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-zinc-50/70 py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left Sticky Editorial & Live Visual Showcase Column */}
          <div
            ref={headRef}
            className={cn(
              "transition-all duration-500 ease-out lg:sticky lg:top-24 lg:col-span-5 motion-reduce:opacity-100 motion-reduce:transition-none",
              headVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            <SectionEyebrow index={11} />
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
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base dark:text-zinc-400">
              {t("landing.faq.subtitle")}
            </p>

            {/* Interactive Rounded Visual Preview Stage */}
            <div className="bh-stage-reveal relative mt-7 overflow-hidden rounded-[32px] border border-zinc-200/90 bg-zinc-900 p-3 shadow-xl dark:border-zinc-800">
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[24px]">
                <img
                  key={activeMeta.key}
                  src={activeMeta.photo}
                  alt={
                    isEn ? activeMeta.photoCaptionEn : activeMeta.photoCaptionVi
                  }
                  width={800}
                  height={550}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />

                {/* Top Category Pill */}
                <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                  <ActiveIcon className="text-brand-orange size-3.5" />
                  <span>{isEn ? activeMeta.tagEn : activeMeta.tagVi}</span>
                </div>

                {/* Bottom Caption inside Photo */}
                <div className="absolute right-4 bottom-3.5 left-4">
                  <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">
                    TOPIC #{activeMeta.num}
                  </span>
                  <p className="mt-0.5 text-xs font-semibold leading-snug text-white sm:text-sm">
                    {isEn
                      ? activeMeta.photoCaptionEn
                      : activeMeta.photoCaptionVi}
                  </p>
                </div>
              </div>

              {/* Quick Resource Links Footer */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-zinc-950/80 px-4 py-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2 font-medium">
                  <BookOpen className="text-brand-orange size-4 shrink-0" />
                  <span>
                    {isEn
                      ? "Need deeper technical docs?"
                      : "Cần tài liệu hướng dẫn chi tiết?"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/help/faq"
                    className="text-brand-orange inline-flex items-center gap-1 font-bold hover:underline"
                  >
                    <span>{isEn ? "Full FAQ" : "Tất cả câu hỏi"}</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                  <span className="text-zinc-700">•</span>
                  <Link
                    to="/help/guide"
                    className="inline-flex items-center gap-1 font-semibold text-white hover:text-orange-300"
                  >
                    <span>{isEn ? "User Guide" : "Cẩm nang"}</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              <SpinningSeal
                text="BRANDHUB KNOWLEDGE • 141 FRs • "
                centerTop="FAQ"
                centerBottom="24/7"
                variant="orange"
                className="pointer-events-none absolute -top-4 -right-4 hidden size-20 sm:block"
              />
            </div>
          </div>

          {/* Right Interactive Rounded Accordion Column */}
          <div ref={listRef} className="space-y-4 lg:col-span-7">
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
