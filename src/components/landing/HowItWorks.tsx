import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView, useReducedMotion } from "motion/react";
import {
  Building2,
  UserPlus,
  Briefcase,
  PenTool,
  Sparkles,
  Send,
  ClipboardCheck,
  MessageSquareWarning,
  Eye,
  ThumbsUp,
  Rocket,
  Loader2,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

interface LaneNode {
  key: string;
  icon: LucideIcon;
  /** pageIndex tương ứng trong demo MacBook của CinematicHero — bấm node
   * này sẽ scroll lên hero và chuyển demo sang đúng trang minh họa bước. */
  pageIndex: number;
}

interface Lane {
  key: string;
  roleLabel: string;
  floatingBadge: string;
  cardTheme: string;
  pillTheme: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  accentRing: string;
  photoSeed: string;
  nodes: LaneNode[];
}

// Mỗi lane là 1 role; nodes là các việc role đó làm theo thứ tự trong
// workflow. Bàn giao giữa role (mũi tên dọc) hiện giữa 2 lane liền kề.
const LANES: Lane[] = [
  {
    key: "owner",
    roleLabel: "Owner",
    floatingBadge: "STAGE 01 · WORKSPACE & GOVERNANCE",
    cardTheme:
      "from-orange-50/90 via-white to-amber-50/40 border-orange-200/90 dark:from-orange-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-orange-800/40",
    pillTheme: "bg-brand-orange text-white shadow-orange-500/25",
    accent: "bg-brand-orange",
    accentText: "text-brand-orange dark:text-orange-400",
    accentSoft: "bg-brand-orange/10 text-brand-orange dark:text-orange-400",
    accentRing: "ring-brand-orange/30",
    photoSeed: "brandhub-agency-owner-portrait",
    nodes: [
      { key: "setupWorkspace", icon: Building2, pageIndex: 6 },
      { key: "inviteTeam", icon: UserPlus, pageIndex: 6 },
      { key: "assignClient", icon: Briefcase, pageIndex: 6 },
    ],
  },
  {
    key: "creator",
    roleLabel: "Creator",
    floatingBadge: "STAGE 02 · AI STUDIO & CONTENT PRODUCTION",
    cardTheme:
      "from-violet-50/90 via-white to-fuchsia-50/40 border-violet-200/90 dark:from-violet-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-violet-800/40",
    pillTheme: "bg-violet-600 text-white shadow-violet-500/25",
    accent: "bg-violet-600",
    accentText: "text-violet-600 dark:text-violet-400",
    accentSoft: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    accentRing: "ring-violet-500/30",
    photoSeed: "brandhub-content-creator-portrait",
    nodes: [
      { key: "draftContent", icon: PenTool, pageIndex: 1 },
      { key: "aiAssist", icon: Sparkles, pageIndex: 3 },
      { key: "submitReview", icon: Send, pageIndex: 1 },
    ],
  },
  {
    key: "manager",
    roleLabel: "Manager",
    floatingBadge: "STAGE 03 · INTERNAL QA & CLIENT HANDOFF",
    cardTheme:
      "from-indigo-50/90 via-white to-sky-50/40 border-indigo-200/90 dark:from-indigo-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-indigo-800/40",
    pillTheme: "bg-indigo-600 text-white shadow-indigo-500/25",
    accent: "bg-indigo-600",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentSoft: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    accentRing: "ring-indigo-500/30",
    photoSeed: "brandhub-account-manager-portrait",
    nodes: [
      { key: "reviewContent", icon: ClipboardCheck, pageIndex: 1 },
      { key: "requestChanges", icon: MessageSquareWarning, pageIndex: 1 },
      { key: "forwardClient", icon: Send, pageIndex: 2 },
    ],
  },
  {
    key: "client",
    roleLabel: "Client",
    floatingBadge: "STAGE 04 · FINAL SIGN-OFF & 4-CHANNEL PUBLISH",
    cardTheme:
      "from-emerald-50/90 via-white to-teal-50/40 border-emerald-200/90 dark:from-emerald-950/25 dark:via-zinc-900 dark:to-zinc-900 dark:border-emerald-800/40",
    pillTheme: "bg-emerald-600 text-white shadow-emerald-500/25",
    accent: "bg-emerald-600",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentSoft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accentRing: "ring-emerald-500/30",
    photoSeed: "brandhub-brand-client-portrait",
    nodes: [
      { key: "previewFinal", icon: Eye, pageIndex: 7 },
      { key: "approve", icon: ThumbsUp, pageIndex: 7 },
      { key: "autoPublish", icon: Rocket, pageIndex: 5 },
    ],
  },
];

const TOTAL_NODES = LANES.reduce((sum, lane) => sum + lane.nodes.length, 0);
// Mỗi node trải qua 2 pha: "processing" (spinner quay, node đang xử lý)
// rồi "done" (checkmark, báo hoàn tất) trước khi chuyển sang node kế.
const PROCESSING_MS = 700;
const DONE_MS = 350;

type Phase = "processing" | "done";

export function HowItWorks() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("processing");
  const goToPage = useLandingDemoStore((s) => s.goToPage);
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );

  // Hiệu ứng "chạy quy trình": mỗi node quay spinner (đang xử lý) rồi bật
  // checkmark (hoàn tất) trước khi node kế tiếp bắt đầu, đúng thứ tự
  // workflow owner → creator → manager → client, lặp vô hạn. Chỉ chạy khi
  // section trong viewport.
  useEffect(() => {
    if (reduce || !inView) return;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setPhase("processing");
      timeout = setTimeout(() => {
        setPhase("done");
        timeout = setTimeout(() => {
          setActiveIndex((i) => (i + 1) % TOTAL_NODES);
          tick();
        }, DONE_MS);
      }, PROCESSING_MS);
    };
    tick();
    return () => clearTimeout(timeout);
  }, [reduce, inView]);

  const laneStarts = LANES.map((_, i) => LANES.slice(0, i).reduce((sum, lane) => sum + lane.nodes.length, 0));

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-zinc-50/70 py-24 dark:bg-zinc-900/40"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-14 max-w-2xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <SplitHeading text={t("landing.howItWorks.title")} />
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {LANES.map((lane, laneIndex) => {
            const laneStartIndex = laneStarts[laneIndex];
            const laneEndIndex = laneStartIndex + lane.nodes.length - 1;

            return (
              <div key={lane.key}>
                <div className="bh-reveal-card lane-card relative flex flex-col gap-5 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:border-brand-orange/45 hover:shadow-md sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex shrink-0 items-center gap-3 sm:w-52">
                    <img
                      src={`https://images.unsplash.com/${PHOTO_IDS[lane.key]}?w=96&h=96&fit=crop&crop=faces`}
                      alt=""
                      loading="lazy"
                      className="size-12 shrink-0 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-brand-orange uppercase">
                        0{laneIndex + 1} · {lane.roleLabel}
                      </span>
                      <p className="mt-0.5 truncate text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {t(`landing.howItWorks.roles.${lane.key}.roleTag`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    {lane.nodes.map((node, nodeIndex) => {
                      const flatIndex = laneStartIndex + nodeIndex;
                      const isFirstInLane = nodeIndex === 0;
                      const isLastInLane = nodeIndex === lane.nodes.length - 1;
                      const isActive = !reduce && flatIndex === activeIndex;
                      const isProcessing = isActive && phase === "processing";
                      const isDone = isActive && phase === "done";
                      const arrowLit =
                        !reduce &&
                        !isLastInLane &&
                        flatIndex === activeIndex &&
                        phase === "done";

                      return (
                        <div key={node.key} className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            {/* Badge input/output: node đầu lane nhận việc
                                từ role trước, node cuối lane bàn giao tiếp. */}
                            {(isFirstInLane || isLastInLane) && (
                              <span
                                className={cn(
                                  "w-fit text-[9px] font-semibold tracking-wide uppercase",
                                  lane.accentText,
                                  "opacity-60",
                                )}
                              >
                                {isFirstInLane
                                  ? t("landing.howItWorks.input")
                                  : t("landing.howItWorks.output")}
                              </span>
                            )}
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label={t("landing.howItWorks.demoAction", {
                                step: t(
                                  `landing.howItWorks.roles.${lane.key}.${node.key}.title`,
                                ),
                              })}
                              onClick={() => goToPage(node.pageIndex)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  goToPage(node.pageIndex);
                                }
                              }}
                              className={cn(
                                "group focus-visible:ring-brand-orange relative flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl px-3.5 py-3 transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none sm:w-48 sm:flex-none",
                                isActive
                                  ? cn(
                                      "bg-white shadow-md ring-2 dark:bg-zinc-800",
                                      lane.accentRing,
                                    )
                                  : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-300",
                                  lane.accent,
                                  isActive
                                    ? "scale-110"
                                    : "group-hover:scale-105",
                                )}
                              >
                                {isProcessing ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : isDone ? (
                                  <Check className="size-4" />
                                ) : (
                                  <node.icon className="size-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                  {t(
                                    `landing.howItWorks.roles.${lane.key}.${node.key}.title`,
                                  )}
                                </p>
                                <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                                  {t(
                                    `landing.howItWorks.roles.${lane.key}.${node.key}.desc`,
                                  )}
                                </p>
                              </div>

                              {/* Progress bar: chạy đầy trong lúc processing,
                                  báo hiệu thời lượng xử lý còn lại. */}
                              {isActive && (
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-100 dark:bg-zinc-700">
                                  <div
                                    className={cn(
                                      "h-full",
                                      lane.accent,
                                      isProcessing
                                        ? "w-full transition-[width] duration-[700ms] ease-linear"
                                        : "w-0",
                                    )}
                                    style={
                                      isProcessing
                                        ? { transitionDelay: "10ms" }
                                        : undefined
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {!isLastInLane && (
                            <svg
                              viewBox="0 0 16 16"
                              className={cn(
                                "hidden size-4 shrink-0 transition-colors duration-300 sm:block",
                                arrowLit || (isActive && phase === "processing")
                                  ? "text-brand-orange"
                                  : "text-zinc-300 dark:text-zinc-600",
                              )}
                              fill="none"
                            >
                              <path
                                d="M2 8h10m0 0-4-4m4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={arrowLit ? "3 2" : undefined}
                              />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {laneIndex < LANES.length - 1 && (
                  <div className="flex justify-center py-2">
                    <svg
                      viewBox="0 0 16 20"
                      className={cn(
                        "size-5 transition-colors duration-300",
                        !reduce &&
                          activeIndex === laneEndIndex &&
                          phase === "done"
                          ? "text-brand-orange"
                          : "text-zinc-300 dark:text-zinc-600",
                      )}
                      fill="none"
                    >
                      <path
                        d="M8 2v14m0 0-4-4m4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Ảnh chân dung thật từ Unsplash cho từng role (business owner, creative,
// account/customer manager, client/customer), độ tuổi và phong cách khác
// nhau để dễ phân biệt trực quan giữa 4 lane.
const PHOTO_IDS: Record<string, string> = {
  owner: "photo-1560250097-0b93528c311a",
  creator: "photo-1531123897727-8f129e1688ce",
  manager: "photo-1573497019940-1c28c88b4f3e",
  client: "photo-1580489944761-15a19d654956",
};

export default HowItWorks;
