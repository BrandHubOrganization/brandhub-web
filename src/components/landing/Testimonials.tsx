import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    key: "minh",
    name: "Minh Nguyễn",
    role: "Content Director",
    company: "VCorp Media",
    stars: 5,
  },
  {
    key: "sarah",
    name: "Sarah Chen",
    role: "Marketing Lead",
    company: "Global Brands",
    stars: 5,
  },
  {
    key: "tuan",
    name: "Tuấn Lê",
    role: "Agency Owner",
    company: "CreativeHub",
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
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = TESTIMONIALS[active];

  // Tự động xoay quote nổi bật; interval reset lại mốc thời gian mỗi khi
  // `active` đổi (kể cả do người dùng tự bấm avatar) — nhờ vậy chọn 1 quote
  // luôn có đủ AUTO_ROTATE_MS trước khi bị auto-advance ghi đè, thay vì bị
  // interval cũ (không phụ thuộc `active`) tự tiếp tục đếm ngầm.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [reduce, active]);

  return (
    <section id="testimonials" className="bg-zinc-50 py-24 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.testimonials.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.testimonials.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-zinc-100 bg-white p-10 shadow-sm sm:p-14 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Quote className="text-brand-orange/15 absolute top-8 left-8 size-12 sm:top-10 sm:left-10" />

          <div className="relative min-h-40">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-5 flex justify-center gap-0.5">
                  {Array.from({ length: current.stars }).map((_, s) => (
                    <Star
                      key={s}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-center text-lg leading-relaxed font-medium text-zinc-800 sm:text-xl dark:text-zinc-100">
                  &ldquo;{t(`landing.testimonials.items.${current.key}.quote`)}
                  &rdquo;
                </p>
                <div className="mt-6 flex flex-col items-center">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {current.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {current.role}
                  </p>
                  <p className="text-brand-orange mt-0.5 text-xs font-semibold">
                    {current.company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex justify-center gap-3">
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
