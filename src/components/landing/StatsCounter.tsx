import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { Server, Flame, Zap, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      "from-orange-500/20 via-[#15131D] to-[#0D0E14] border-orange-500/40",
    pillTheme: "bg-brand-orange text-white shadow-orange-500/30",
    orbTheme: "bg-orange-500/20 text-orange-400 border-orange-500/40",
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
      "from-rose-500/20 via-[#17121A] to-[#0D0E14] border-rose-500/40",
    pillTheme: "bg-rose-600 text-white shadow-rose-500/30",
    orbTheme: "bg-rose-500/20 text-rose-400 border-rose-500/40",
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
      "from-indigo-500/20 via-[#121422] to-[#0D0E14] border-indigo-500/40",
    pillTheme: "bg-indigo-600 text-white shadow-indigo-500/30",
    orbTheme: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
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
      "from-emerald-500/20 via-[#101A19] to-[#0D0E14] border-emerald-500/40",
    pillTheme: "bg-emerald-600 text-white shadow-emerald-500/30",
    orbTheme: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
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
    <section className="relative overflow-hidden bg-[#090A10] py-20 text-white">
      {/* Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onViewportEnter={() => setInView(true)}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-8 pt-8 sm:grid-cols-2 sm:pt-10 lg:grid-cols-4"
        >
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className={cn(
                  "bh-reveal-card group relative flex min-h-[190px] flex-col justify-between rounded-[28px] rounded-tr-[56px] border bg-gradient-to-br p-6 pt-9 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl",
                  s.cardSurface,
                )}
              >
                {/* Floating 3D Badge (Khối nổi) */}
                <div
                  data-bh-float
                  className={cn(
                    "absolute -top-3.5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black tracking-wider uppercase shadow-lg",
                    s.pillTheme,
                  )}
                >
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  <span>{s.floatingBadge}</span>
                </div>

                {/* Top-Right Cutout Pocket (Khối cắt) */}
                <div
                  aria-hidden="true"
                  className="absolute -top-2 -right-2 z-10 flex size-14 items-center justify-center rounded-bl-[24px] rounded-tr-[24px] border-b border-l border-white/10 bg-[#090A10] p-1.5"
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                      s.orbTheme,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>

                <div>
                  <div className="my-2 flex flex-wrap items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-white tabular-nums sm:text-4xl lg:text-[2.65rem] leading-none">
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
                      <span className="font-mono text-xs font-bold text-zinc-400 sm:text-sm">
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-bold text-zinc-100">
                    {t(s.labelKey, s.key)}
                  </p>
                </div>

                <p className="mt-3 border-t border-white/10 pt-2.5 font-mono text-[11px] text-zinc-400">
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
