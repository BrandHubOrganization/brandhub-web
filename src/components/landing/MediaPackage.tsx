import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  MessagesSquare,
  Rocket,
  CopyCheck,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface MediaPackagePoint {
  key: string;
  icon: LucideIcon;
  step: string;
  photo: string;
}

const POINTS: MediaPackagePoint[] = [
  {
    key: "templates",
    icon: Package,
    step: "01",
    photo:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&h=500&fit=crop",
  },
  {
    key: "negotiate",
    icon: MessagesSquare,
    step: "02",
    photo:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&fit=crop",
  },
  {
    key: "convert",
    icon: Rocket,
    step: "03",
    photo:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop",
  },
  {
    key: "replicate",
    icon: CopyCheck,
    step: "04",
    photo:
      "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=500&h=500&fit=crop",
  },
];

export function MediaPackage() {
  const { t } = useTranslation();
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

  return (
    <section
      id="media-package"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-20 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SectionEyebrow index={6} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.mediaPackage.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.mediaPackage.subtitle")}
          </p>
        </div>

        <div ref={setTimelineRef} className="relative">
          <div
            aria-hidden
            className="timeline-line bg-brand-orange/20 absolute top-0 bottom-0 left-6 w-px origin-top sm:left-1/2 sm:-translate-x-1/2"
          />

          <div className="flex flex-col gap-16">
            {POINTS.map(({ key, icon: Icon, step, photo }, i) => {
              const reversed = i % 2 === 1;
              return (
                <div
                  key={key}
                  style={{
                    transitionDelay: rowsVisible ? `${i * 180}ms` : "0ms",
                  }}
                  className={cn(
                    "timeline-row relative flex flex-col gap-6 transition-all duration-700 ease-out motion-reduce:opacity-100 motion-reduce:transition-none sm:flex-row sm:items-center",
                    rowsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0",
                    reversed && "sm:flex-row-reverse",
                  )}
                >
                  <div
                    aria-hidden
                    className="bg-brand-orange ring-brand-orange/20 absolute top-6 left-6 z-10 flex size-4 -translate-x-1/2 items-center justify-center rounded-full ring-4 sm:left-1/2"
                  />

                  <div className="pl-14 sm:w-1/2 sm:pl-0">
                    <div
                      className={cn(
                        "flex flex-col gap-4 sm:flex-row sm:items-center",
                        reversed
                          ? "sm:flex-row-reverse sm:text-right"
                          : "sm:text-left",
                      )}
                    >
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28">
                        <img
                          src={photo}
                          alt=""
                          loading="lazy"
                          className="timeline-photo absolute inset-0 h-[130%] w-full object-cover will-change-transform"
                        />
                      </div>
                      <div>
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            reversed && "sm:justify-end",
                          )}
                        >
                          <span className="bg-brand-orange/10 text-brand-orange flex size-8 items-center justify-center rounded-lg">
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
