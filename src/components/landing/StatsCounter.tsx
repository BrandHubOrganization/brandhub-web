import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { Server, Flame, Zap, ShieldCheck, type LucideIcon } from "lucide-react";

interface StatItem {
  key: string;
  target: number;
  decimals?: number;
  prefix: string;
  suffix: string;
  unit?: string;
  labelKey: string;
  sublabel: string;
  floatingBadge: string;
  icon: LucideIcon;
  cardSurface: string;
  pillTheme: string;
  orbTheme: string;
}

const STATS: StatItem[] = [
  {
    key: "microservices",
    target: 99.9,
    decimals: 1,
    prefix: "",
    suffix: "%",
    labelKey: "landing.stats.microservices",
    sublabel: "Vận hành ổn định 24/7 · Cân bằng tải tự động",
    floatingBadge: "HIGH AVAILABILITY",
    icon: Server,
    cardSurface:
      "from-orange-50/90 via-white to-amber-50/40 border-orange-200/80 dark:from-orange-500/20 dark:via-[#15131D] dark:to-[#0D0E14] dark:border-orange-500/40",
    pillTheme: "bg-brand-orange text-white shadow-orange-500/30",
    orbTheme: "bg-orange-50 text-brand-orange border-orange-200/80 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40",
  },
  {
    key: "trends",
    target: 500,
    prefix: "",
    suffix: "+",
    unit: "/ ngày",
    labelKey: "landing.stats.trends",
    sublabel: "TikTok · Facebook · Google Trends Radar",
    floatingBadge: "REAL-TIME TREND STREAM",
    icon: Flame,
    cardSurface:
      "from-rose-50/90 via-white to-pink-50/40 border-rose-200/80 dark:from-rose-500/20 dark:via-[#17121A] dark:to-[#0D0E14] dark:border-rose-500/40",
    pillTheme: "bg-rose-600 text-white shadow-rose-500/30",
    orbTheme: "bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40",
  },
  {
    key: "latency",
    target: 120,
    prefix: "< ",
    suffix: "",
    unit: "ms",
    labelKey: "landing.stats.latency",
    sublabel: "Đồng bộ đa người dùng thời gian thực",
    floatingBadge: "ULTRA-LOW LATENCY",
    icon: Zap,
    cardSurface:
      "from-indigo-50/90 via-white to-blue-50/40 border-indigo-200/80 dark:from-indigo-500/20 dark:via-[#121422] dark:to-[#0D0E14] dark:border-indigo-500/40",
    pillTheme: "bg-indigo-600 text-white shadow-indigo-500/30",
    orbTheme: "bg-indigo-50 text-indigo-600 border-indigo-200/80 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/40",
  },
  {
    key: "consistency",
    target: 100,
    prefix: "",
    suffix: "%",
    labelKey: "landing.stats.consistency",
    sublabel: "Chuẩn Brand Tone & An toàn nội dung MXH",
    floatingBadge: "ZERO POLICY VIOLATION",
    icon: ShieldCheck,
    cardSurface:
      "from-emerald-50/90 via-white to-teal-50/40 border-emerald-200/80 dark:from-emerald-500/20 dark:via-[#101A19] dark:to-[#0D0E14] dark:border-emerald-500/40",
    pillTheme: "bg-emerald-600 text-white shadow-emerald-500/30",
    orbTheme: "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
  },
];

function useCountUp(
  target: number,
  decimals = 0,
  duration = 2000,
  start = false,
  skipAnimation = false,
) {
  const [value, setValue] = useState(skipAnimation && start ? target : 0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    if (skipAnimation) {
      setValue(target);
      return;
    }
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start, skipAnimation]);

  return value.toFixed(decimals);
}

export function StatsCounter() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);

  return (
    <section className="relative overflow-hidden border-y border-zinc-200/80 bg-zinc-50/70 py-16 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onViewportEnter={() => setInView(true)}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="bh-reveal-card group flex min-h-[172px] flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    {s.floatingBadge}
                  </span>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                    <Icon className="size-4" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-zinc-900 tabular-nums sm:text-4xl dark:text-white leading-none">
                      {s.prefix}
                      <CountValue
                        target={s.target}
                        suffix={s.suffix}
                        decimals={s.decimals}
                        start={inView}
                        skipAnimation={!!reduce}
                      />
                    </span>
                    {s.unit && (
                      <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400 sm:text-sm">
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    {t(s.labelKey, s.key)}
                  </p>
                </div>

                <p className="mt-3 border-t border-zinc-100 pt-2.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  {s.sublabel}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function CountValue({
  target,
  suffix,
  decimals = 0,
  start,
  skipAnimation,
}: {
  target: number;
  suffix: string;
  decimals?: number;
  start: boolean;
  skipAnimation: boolean;
}) {
  const val = useCountUp(target, decimals, 2000, start, skipAnimation);
  return (
    <>
      {val}
      {suffix}
    </>
  );
}

export default StatsCounter;
