import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";

const STATS = [
  {
    key: "microservices",
    target: 8,
    prefix: "",
    suffix: "+",
    labelKey: "landing.stats.microservices",
    sublabel: "Gateway · Core · AI · Publisher · Infra",
  },
  {
    key: "trends",
    target: 500,
    prefix: "",
    suffix: "+/ngày",
    labelKey: "landing.stats.trends",
    sublabel: "Facebook GraphQL & Pages Crawler",
  },
  {
    key: "latency",
    target: 120,
    prefix: "< ",
    suffix: "ms",
    labelKey: "landing.stats.latency",
    sublabel: "Spring WebFlux Netty & Redis 7.2",
  },
  {
    key: "consistency",
    target: 100,
    prefix: "",
    suffix: "%",
    labelKey: "landing.stats.consistency",
    sublabel: "GraphRAG & Bản quyền Watermark",
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
    <section className="bg-gradient-to-r from-brand-orange via-orange-600 to-amber-600 py-16 shadow-inner">
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
                {s.prefix}
                <CountValue
                  target={s.target}
                  suffix={s.suffix}
                  start={inView}
                  skipAnimation={!!reduce}
                />
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {t(s.labelKey, s.key)}
              </p>
              <p className="mt-0.5 text-xs text-white/80">
                {s.sublabel}
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
