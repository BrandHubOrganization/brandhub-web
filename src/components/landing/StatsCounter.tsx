import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";

const STATS = [
  {
    key: "contents",
    target: 1_284_000,
    suffix: "+",
    labelKey: "landing.stats.contents",
  },
  {
    key: "brands",
    target: 50_000,
    suffix: "+",
    labelKey: "landing.stats.brands",
  },
  {
    key: "platforms",
    target: 12,
    suffix: "",
    labelKey: "landing.stats.platforms",
  },
  {
    key: "uptime",
    target: 99.9,
    suffix: "%",
    labelKey: "landing.stats.uptime",
    decimals: 1,
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
    <section className="bg-brand-orange py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onViewportEnter={() => setInView(true)}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.key} className="text-center">
              <p className="text-4xl font-extrabold text-white sm:text-5xl">
                <CountValue
                  target={s.target}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  start={inView}
                  skipAnimation={!!reduce}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-white/70">
                {t(s.labelKey)}
              </p>
            </div>
          ))}
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
  skipAnimation?: boolean;
}) {
  const raw = useCountUp(target, decimals, 2000, start, skipAnimation);
  const formatted = Number(raw).toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <>
      {formatted}
      {suffix}
    </>
  );
}

export default StatsCounter;
