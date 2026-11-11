import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Star, Quote, BadgeCheck, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import {
  SplitHeading,
  SpinningSeal,
} from "@/components/landing/MotionPrimitives";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BG_PHOTO =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=900&fit=crop";

interface TestimonialItem {
  key: string;
  name: string;
  role: string;
  canonicalRole: string;
  company: string;
  badge: string;
  metricBadge: string;
  quote: string;
  stars: number;
  avatar: string;
  cardTheme: string;
  pillTheme: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    key: "minh",
    name: "Minh Nguyễn",
    role: "Account Director",
    canonicalRole: "Manager",
    company: "AdVenture Agency",
    badge: "Agency Workflow Tester",
    metricBadge: "RÚT NGẮN 4 NGÀY → 3 GIỜ",
    quote:
      "Quy trình đàm phán Media Package và duyệt chiến dịch 2 chiều với khách hàng rút ngắn từ 4 ngày xuống còn vài giờ. Khách hàng xem và duyệt trực quan trên từng tác vụ mà không bị thất lạc feedback qua Zalo hay file Excel rời rạc.",
    stars: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&crop=faces",
    cardTheme:
      "from-orange-50/90 via-white to-amber-50/40 border-orange-200/90 dark:from-orange-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-orange-800/40",
    pillTheme: "bg-brand-orange text-white shadow-orange-500/30",
  },
  {
    key: "phuong",
    name: "Trần Hoàng Phương",
    role: "Lead Creator",
    canonicalRole: "Creator",
    company: "Digital Buzz Studio",
    badge: "AI Trend Engine Tester",
    metricBadge: "100% CHUẨN BRAND VOICE",
    quote:
      "Hệ thống AI Trend Crawler phát hiện chủ đề thảo luận nóng rất nhạy. Khi yêu cầu sinh bài, AI tuân thủ đúng Brand Guidelines, tự động kiểm duyệt an toàn cộng đồng chuẩn xác nên team hoàn toàn an tâm bàn giao cho khách hàng.",
    stars: 5,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=360&h=360&fit=crop&crop=faces",
    cardTheme:
      "from-violet-50/90 via-white to-fuchsia-50/40 border-violet-200/90 dark:from-violet-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-violet-800/40",
    pillTheme: "bg-violet-600 text-white shadow-violet-500/30",
  },
  {
    key: "tuan",
    name: "Lê Quốc Tuấn",
    role: "Marketing Lead",
    canonicalRole: "Client",
    company: "UrbanStyle F&B Chain",
    badge: "Client Reviewer",
    metricBadge: "100% MINH BẠCH TIẾN ĐỘ",
    quote:
      "Là phía Khách hàng (Client), việc được cấp quyền vào Workspace riêng biệt để theo dõi tiến độ, duyệt bài đăng và xem báo cáo minh bạch đã xóa bỏ hoàn toàn khoảng cách nghi ngờ giữa thương hiệu và Agency đối tác.",
    stars: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&h=360&fit=crop&crop=faces",
    cardTheme:
      "from-emerald-50/90 via-white to-teal-50/40 border-emerald-200/90 dark:from-emerald-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-emerald-800/40",
    pillTheme: "bg-emerald-600 text-white shadow-emerald-500/30",
  },
];

const AUTO_ROTATE_MS = 6500;

export function Testimonials() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = TESTIMONIALS[active];
  const sectionRef = useRef<HTMLElement>(null);
  const bgPhotoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [reduce, active]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      if (!bgPhotoRef.current) return;
      gsap.to(bgPhotoRef.current, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F2] via-zinc-50 to-white py-24 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-zinc-950"
    >
      <img
        ref={bgPhotoRef}
        src={BG_PHOTO}
        alt=""
        aria-hidden
        width={1200}
        height={900}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover opacity-[0.06] will-change-transform dark:opacity-[0.04]"
      />
      <SectionDecor corner="left" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <SectionEyebrow index={7} />
          <SplitHeading
            text="Phản hồi thực chiến từ"
            highlightText="Beta Testers"
          />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            Ghi nhận thực tế từ các Agency và Thương hiệu tham gia thử nghiệm
            quy trình quản lý chiến dịch và AI của BrandHub.
          </p>
        </div>

        {/* Featured Obsidian Spotlight Stage */}
        <div className="bh-stage-reveal relative mb-10 rounded-[32px] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-[#12131C] to-zinc-900 p-7 text-white shadow-2xl sm:p-10">
          <SpinningSeal
            text="VERIFIED BETA TESTERS • 5.0 RATING • "
            centerTop="5.0"
            centerBottom="STARS"
            variant="orange"
            className="pointer-events-none absolute -top-6 -right-4 hidden size-22 sm:block"
          />

          <Quote className="text-brand-orange/20 absolute top-6 right-8 size-16 sm:right-24" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-12"
            >
              {/* Left Portrait Window */}
              <div className="flex flex-col items-center md:col-span-4">
                <div className="relative">
                  <div className="size-32 overflow-hidden rounded-2xl border-2 border-orange-500/50 p-1 shadow-xl sm:size-36">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      width={240}
                      height={240}
                      loading="lazy"
                      decoding="async"
                      className="size-full rounded-xl object-cover"
                    />
                  </div>
                  <span className="bg-brand-orange absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-md">
                    {current.canonicalRole}
                  </span>
                </div>
                <p className="mt-4 text-base font-bold text-white">
                  {current.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {current.role} ·{" "}
                  <span className="font-semibold text-orange-400">
                    {current.company}
                  </span>
                </p>
              </div>

              {/* Right Quote & Verified Telemetry */}
              <div className="md:col-span-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: current.stars }).map((_, s) => (
                      <Star
                        key={s}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                    <BadgeCheck className="size-3.5" />
                    <span>{current.badge}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-0.5 text-xs font-bold text-orange-300 ring-1 ring-orange-500/30">
                    <TrendingUp className="size-3.5" />
                    <span>{current.metricBadge}</span>
                  </span>
                </div>

                <p className="text-base leading-relaxed font-medium text-zinc-100 sm:text-xl">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3 Interactive Cutout & Floating-Badge Persona Cards */}
        <div className="grid grid-cols-1 gap-7 pt-3 md:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => {
            const isSelected = idx === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(idx)}
                className={cn(
                  "bh-reveal-card group relative flex cursor-pointer flex-col justify-between rounded-[28px] rounded-tr-[52px] border bg-gradient-to-br p-6 pt-8 text-left transition-all duration-500 hover:shadow-xl",
                  item.cardTheme,
                  isSelected && "ring-2 ring-brand-orange shadow-lg",
                )}
              >
                {/* Floating 3D Metric Pill (Khối nổi) */}
                <div
                  data-bh-float
                  className={cn(
                    "absolute -top-3.5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black tracking-wider uppercase shadow-md",
                    item.pillTheme,
                  )}
                >
                  <span>{item.metricBadge}</span>
                </div>

                {/* Top-Right Cutout Role Tag (Khối cắt) */}
                <div
                  aria-hidden="true"
                  className="absolute -top-2 -right-2 z-10 flex size-12 items-center justify-center rounded-bl-[20px] rounded-tr-[20px] border-b border-l border-zinc-200/80 bg-white font-mono text-[11px] font-black text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  0{idx + 1}
                </div>

                <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  &ldquo;{item.quote}&rdquo;
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-zinc-200/60 pt-4 dark:border-zinc-800">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    className="size-11 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {item.canonicalRole} · {item.company}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
