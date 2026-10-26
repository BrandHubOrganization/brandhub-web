import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Star, Quote, BadgeCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BG_PHOTO =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=900&fit=crop";

interface TestimonialItem {
  key: string;
  name: string;
  role: string;
  company: string;
  badge: string;
  quote: string;
  stars: number;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    key: "minh",
    name: "Minh Nguyễn",
    role: "Account Director",
    company: "AdVenture Agency",
    badge: "Agency Workflow Tester",
    quote:
      "Quy trình đàm phán Media Package và duyệt chiến dịch 2 chiều với khách hàng rút ngắn từ 4 ngày xuống còn vài giờ. Khách hàng xem và duyệt trực quan trên từng tác vụ mà không bị thất lạc feedback qua Zalo hay file Excel rời rạc.",
    stars: 5,
  },
  {
    key: "phuong",
    name: "Trần Hoàng Phương",
    role: "Lead Content Creator",
    company: "Digital Buzz Studio",
    badge: "AI Trend Engine Tester",
    quote:
      "Hệ thống AI Trend Crawler phát hiện chủ đề thảo luận nóng trên Facebook rất nhạy. Khi yêu cầu sinh bài, AI tuân thủ đúng Brand Guidelines, tự động đóng Watermark số chuẩn xác nên team hoàn toàn an tâm bàn giao cho khách hàng.",
    stars: 5,
  },
  {
    key: "tuan",
    name: "Lê Quốc Tuấn",
    role: "Marketing Manager",
    company: "UrbanStyle F&B Chain",
    badge: "Client Reviewer",
    quote:
      "Là phía Khách hàng (Client), việc được cấp quyền vào Workspace riêng biệt để theo dõi tiến độ, duyệt bài đăng và xem báo cáo minh bạch đã xóa bỏ hoàn toàn khoảng cách nghi ngờ giữa thương hiệu và Agency đối tác.",
    stars: 5,
  },
];

const AUTO_ROTATE_MS = 6000;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

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
      className="relative overflow-hidden bg-zinc-50 py-24 dark:bg-zinc-900/50"
    >
      <img
        ref={bgPhotoRef}
        src={BG_PHOTO}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover opacity-[0.07] will-change-transform dark:opacity-[0.05]"
      />
      <SectionDecor corner="left" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <SectionEyebrow index={7} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Phản hồi từ các{" "}
            <span className="text-brand-orange">Beta Testers</span>
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            Ghi nhận thực tế từ các Agency và Thương hiệu tham gia thử nghiệm
            quy trình quản lý chiến dịch và AI của BrandHub.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-zinc-200/90 bg-white p-8 shadow-sm sm:p-14 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Quote className="text-brand-orange/15 absolute top-8 left-8 size-12 sm:top-10 sm:left-10" />

          <div className="relative min-h-48">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: current.stars }).map((_, s) => (
                      <Star
                        key={s}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="size-3.5" />
                    <span>{current.badge}</span>
                  </span>
                </div>

                <p className="text-center text-base leading-relaxed font-medium text-zinc-800 sm:text-lg dark:text-zinc-100">
                  &ldquo;{current.quote}&rdquo;
                </p>

                <div className="mt-6 flex flex-col items-center">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {current.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {current.role} ·{" "}
                    <span className="text-brand-orange font-semibold">
                      {current.company}
                    </span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            {TESTIMONIALS.map((tm, i) => (
              <button
                key={tm.key}
                type="button"
                onClick={() => setActive(i)}
                aria-label={tm.name}
                aria-pressed={active === i}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-xs font-bold transition-all",
                  active === i
                    ? "bg-brand-orange ring-brand-orange/30 scale-110 text-white ring-4"
                    : "bg-brand-orange/10 text-brand-orange opacity-60 hover:opacity-100",
                )}
              >
                {initials(tm.name)}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;
