import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Star, Quote, BadgeCheck, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

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
      className="relative overflow-hidden bg-zinc-50/70 py-24 dark:bg-zinc-950"
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
        className="pointer-events-none absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover opacity-[0.04] will-change-transform dark:opacity-[0.03]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <SplitHeading
            text="Phản hồi thực chiến từ"
            highlightText="Beta Testers"
          />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            Ghi nhận thực tế từ các Agency và Thương hiệu tham gia thử nghiệm
            quy trình quản lý chiến dịch và AI của BrandHub.
          </p>
        </div>

        {/* Featured Editorial Spotlight Stage */}
        <div className="bh-stage-reveal relative mb-8 rounded-2xl border border-zinc-200/90 bg-white p-7 text-zinc-900 shadow-xs sm:p-10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
          <Quote className="text-zinc-200 dark:text-zinc-800 absolute top-6 right-8 size-14" />

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
                <div className="size-32 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 p-1 sm:size-36 dark:border-zinc-700 dark:bg-zinc-800">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    width={240}
                    height={240}
                    loading="lazy"
                    decoding="async"
                    className="size-full rounded-lg object-cover"
                  />
                </div>
                <span className="mt-3 inline-flex items-center rounded-full bg-brand-orange/10 px-3 py-0.5 font-mono text-[10px] font-bold tracking-wider text-brand-orange uppercase">
                  {current.canonicalRole}
                </span>
                <p className="mt-1.5 text-base font-bold text-zinc-900 dark:text-white">
                  {current.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {current.role} ·{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30">
                    <BadgeCheck className="size-3.5" />
                    <span>{current.badge}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700">
                    <TrendingUp className="text-brand-orange size-3.5" />
                    <span>{current.metricBadge}</span>
                  </span>
                </div>

                <p className="text-base leading-relaxed font-medium text-zinc-800 sm:text-xl dark:text-zinc-100">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3 Clean Persona Selector Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => {
            const isSelected = idx === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(idx)}
                className={cn(
                  "bh-reveal-card group relative flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 text-left transition-all duration-300 hover:shadow-md dark:bg-zinc-900",
                  isSelected
                    ? "border-brand-orange shadow-sm ring-1 ring-brand-orange/30"
                    : "border-zinc-200/90 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-orange uppercase">
                    {item.metricBadge}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-400">
                    0{idx + 1}
                  </span>
                </div>

                <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  &ldquo;{item.quote}&rdquo;
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-zinc-200/70 pt-4 dark:border-zinc-800">
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
