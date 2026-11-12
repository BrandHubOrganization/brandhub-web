import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  MessagesSquare,
  Rocket,
  CopyCheck,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface MediaPackagePoint {
  key: string;
  icon: LucideIcon;
  step: string;
  photo: string;
  metric: string;
  frameShape: string;
}

const POINTS: MediaPackagePoint[] = [
  {
    key: "templates",
    icon: Package,
    step: "01",
    photo:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=720&h=720&fit=crop",
    metric: "Standard · Growth · Viral Catalog",
    frameShape: "rounded-t-[999px] rounded-b-[24px]",
  },
  {
    key: "negotiate",
    icon: MessagesSquare,
    step: "02",
    photo:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=720&h=720&fit=crop",
    metric: "2-Way Proposal & Contract Sign-Off",
    frameShape: "rounded-l-[24px] rounded-r-[999px]",
  },
  {
    key: "convert",
    icon: Rocket,
    step: "03",
    photo:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=720&h=720&fit=crop",
    metric: "1-Click Campaign & Task Backlog",
    frameShape: "rounded-l-[999px] rounded-r-[24px]",
  },
  {
    key: "replicate",
    icon: CopyCheck,
    step: "04",
    photo:
      "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=720&h=720&fit=crop",
    metric: "Instant Workspace & Guideline Clone",
    frameShape: "rounded-[28px]",
  },
];

export function MediaPackage() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const timelineRef = useRef<HTMLDivElement>(null);
  const { ref: rowsObserverRef, isIntersecting: rowsVisible } =
    useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });
  const setTimelineRef = (el: HTMLDivElement | null) => {
    timelineRef.current = el;
    rowsObserverRef(el);
  };

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      if (timelineRef.current) {
        gsap.fromTo(
          ".timeline-line",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 75%",
              end: "bottom 60%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
        timelineRef.current
          .querySelectorAll<HTMLElement>(".timeline-photo")
          .forEach((photo) => {
            gsap.to(photo, {
              yPercent: -12,
              ease: "none",
              scrollTrigger: {
                trigger: photo.closest(".timeline-row"),
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          });
      }
    },
    { scope: timelineRef },
  );

  const currentPoint = POINTS[activeStep];
  const ActiveIcon = currentPoint.icon;

  return (
    <section
      id="media-package"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SplitHeading text={t("landing.mediaPackage.title")} />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.mediaPackage.subtitle")}
          </p>
        </div>

        {/* Clean Interactive Package Stage */}
        <div className="mb-20 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <span className="text-brand-orange font-mono text-xs font-extrabold tracking-widest uppercase">
              INTERACTIVE PACKAGE STAGE · {currentPoint.step} / 04
            </span>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {t(`landing.mediaPackage.items.${currentPoint.key}.title`)}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t(`landing.mediaPackage.items.${currentPoint.key}.desc`)}
            </p>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="bg-brand-orange h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${((activeStep + 1) / POINTS.length) * 100}%` }}
              />
            </div>

            {/* Step pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {POINTS.map((pt, idx) => (
                <button
                  key={pt.key}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                    activeStep === idx
                      ? "bg-brand-orange text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                  )}
                >
                  Bước {pt.step}
                </button>
              ))}
            </div>
          </div>

          <div className="bh-stage-reveal lg:col-span-8">
            <div className="grid grid-cols-1 items-center gap-6 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs sm:grid-cols-12 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-100 sm:col-span-5 dark:border-zinc-800 dark:bg-zinc-800">
                <img
                  src={currentPoint.photo}
                  alt={t(`landing.mediaPackage.items.${currentPoint.key}.title`)}
                  width={500}
                  height={375}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </div>

              <div className="sm:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="bg-brand-orange/10 text-brand-orange inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
                    <ActiveIcon className="size-3.5" />
                    <span>{currentPoint.metric}</span>
                  </span>
                  <span className="font-mono text-lg font-bold text-zinc-400 tabular-nums dark:text-zinc-600">
                    {currentPoint.step}
                  </span>
                </div>

                <h4 className="mt-4 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {t(`landing.mediaPackage.items.${currentPoint.key}.title`)}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {t(`landing.mediaPackage.items.${currentPoint.key}.desc`)}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {POINTS.map((pt, idx) => (
                    <button
                      key={pt.key}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all",
                        activeStep === idx
                          ? "border-brand-orange/50 bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "border-zinc-200/70 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400",
                      )}
                    >
                      <CheckCircle2
                        className={cn(
                          "size-3.5 shrink-0",
                          activeStep === idx
                            ? "text-brand-orange"
                            : "text-zinc-300 dark:text-zinc-600",
                        )}
                      />
                      <span className="truncate">
                        {pt.step}. {t(`landing.mediaPackage.items.${pt.key}.title`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Timeline with Crisp Rectangular Photo Frames */}
        <div ref={setTimelineRef} className="relative mx-auto max-w-4xl">
          <div
            aria-hidden
            className="timeline-line bg-brand-orange/25 absolute top-0 bottom-0 left-6 w-0.5 origin-top sm:left-1/2 sm:-translate-x-1/2"
          />

          <div className="flex flex-col gap-12">
            {POINTS.map(({ key, icon: Icon, step, photo }, i) => {
              const reversed = i % 2 === 1;
              return (
                <div
                  key={key}
                  onMouseEnter={() => setActiveStep(i)}
                  style={{
                    transitionDelay: rowsVisible ? `${i * 150}ms` : "0ms",
                  }}
                  className={cn(
                    "timeline-row group relative flex flex-col gap-6 transition-all duration-700 ease-out motion-reduce:opacity-100 motion-reduce:transition-none sm:flex-row sm:items-center",
                    rowsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0",
                    reversed && "sm:flex-row-reverse",
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "bg-brand-orange ring-brand-orange/20 absolute top-6 left-6 z-10 flex size-4 -translate-x-1/2 items-center justify-center rounded-full ring-4 transition-transform duration-300 sm:left-1/2",
                      activeStep === i && "scale-125 ring-8",
                    )}
                  />

                  <div className="pl-14 sm:w-1/2 sm:pl-0">
                    <div
                      className={cn(
                        "mp-card flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-orange/40 group-hover:shadow-md sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900/70 dark:group-hover:bg-zinc-900",
                        reversed
                          ? "sm:flex-row-reverse sm:text-right"
                          : "sm:text-left",
                      )}
                    >
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-100 sm:size-28 dark:border-zinc-800 dark:bg-zinc-800">
                        <img
                          src={photo}
                          alt={t(`landing.mediaPackage.items.${key}.title`)}
                          width={500}
                          height={500}
                          loading="lazy"
                          decoding="async"
                          className="timeline-photo absolute inset-0 h-[130%] w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            reversed && "sm:justify-end",
                          )}
                        >
                          <span className="bg-brand-orange/10 text-brand-orange flex size-8 items-center justify-center rounded-xl">
                            <Icon className="size-4" />
                          </span>
                          <span className="text-brand-orange font-mono text-[11px] font-bold tracking-wider">
                            STEP {step}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {t(`landing.mediaPackage.items.${key}.title`)}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {t(`landing.mediaPackage.items.${key}.desc`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MediaPackage;
