import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  LayoutGrid,
  FileText,
  CalendarDays,
  Upload,
  LineChart,
  Rocket,
  Plus,
  Bell,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Compass,
  Smartphone,
  Monitor,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Eye,
  Share2,
  MessageCircle,
  Users2,
  Files,
  Clock,
  AlertCircle,
  Building2,
  Star,
  MoreHorizontal,
  FolderOpen,
  Apple,
  Wifi,
  BatteryFull,
  Sparkles,
  Wand2,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Play,
  Flame,
  Lightbulb,
  List,
  CalendarRange,
  ThumbsUp,
  X as XIcon,
} from "lucide-react";
import { InstagramPost } from "./posts/InstagramPost";
import { TikTokPost } from "./posts/TikTokPost";
import { FacebookPost } from "./posts/FacebookPost";
import { LinkedInPost } from "./posts/LinkedInPost";
import { MiniPosts } from "./MiniPosts";
import { LightRays } from "@/components/landing/LightRays";
import { useLandingDemoStore } from "@/store/landingDemoStore";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Cinematic Hero — scroll-driven 4-platform → BrandHub reveal.
 *
 * Flow: IG (0-15%) → TT (15-35%) → FB (35-55%) → LI (55-75%)
 * → BrandHub reveal (75-90%) → CTA (90-100%) → release.
 *
 * CSS opacity-0 handles initial state so GSAP fromTo doesn't
 * flash hidden elements before the timeline starts.
 *
 * Posts fly to 4 corners using xPercent/yPercent so they adapt
 * to any screen size without overlapping. Mini-posts + CTA use
 * a separate onEnter trigger so they stick — scrolling back up
 * does NOT reverse them.
 */
export function CinematicHero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [device, setDevice] = useState<"macbook" | "iphone">("macbook");

  useGSAP(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "hero-pin",
        trigger: sectionRef.current,
        start: "top top",
        end: "+=3500",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // IG post → top-left corner. autoAlpha (not opacity) also sets
    // visibility:hidden at 0, so the post stops painting over the
    // BrandHub layer once it's gone — plain opacity leaves it stacked
    // in place and it can bleed through during the scrub.
    tl.to(".post-ig", {
      scale: 0.15,
      xPercent: -160,
      yPercent: -140,
      autoAlpha: 0,
      duration: 1.2,
      ease: "power2.in",
    })
      // TikTok → top-right corner
      .fromTo(
        ".post-tt",
        { scale: 1.8, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        "<0.3",
      )
      .to(".post-tt", {
        scale: 0.15,
        xPercent: 160,
        yPercent: -140,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power2.in",
      })
      // Facebook → bottom-left corner
      .fromTo(
        ".post-fb",
        { scale: 1.8, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        "<0.3",
      )
      .to(".post-fb", {
        scale: 0.15,
        xPercent: -160,
        yPercent: 140,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power2.in",
      })
      // LinkedIn → bottom-right corner
      .fromTo(
        ".post-li",
        { scale: 1.8, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        "<0.3",
      )
      .to(".post-li", {
        scale: 0.15,
        xPercent: 160,
        yPercent: 140,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power2.in",
      })
      // BrandHub dashboard fades in + scales up
      .fromTo(
        ".brandhub-bg",
        { autoAlpha: 0, scale: 0.85 },
        { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        "<0.2",
      )
      // Mini posts container becomes visible (its 4 children start
      // invisible via their own autoAlpha:0 initial state below) only
      // after the LI exit + brandhub fade-in are done — chained onto the
      // same timeline so it can never fire while a big card is still
      // mid-exit (the earlier guessed pixel offset on a separate
      // ScrollTrigger fired too early and let the corner mini-cards
      // overlap the still-visible big LI/FB cards).
      .set(".mini-posts", { autoAlpha: 1 })
      // Each corner card flies out from center to its own corner,
      // staggered 0.1s apart (IG → TT → FB → LI) with a slight
      // overshoot-then-settle bounce, instead of all 4 just fading in
      // together — reads as "bursting out" rather than a flat cross-fade.
      //
      // Target `scale` here MUST match each card's own static Tailwind
      // `scale-[N]` in MiniPosts.tsx (0.42 / 0.52 / 0.43 / 0.4) — GSAP's
      // `scale` is absolute, not additive, so animating to `scale: 1`
      // would overwrite the CSS shrink and the cards would flash back to
      // full post size for the length of this tween.
      .fromTo(
        ".mini-post-ig",
        { autoAlpha: 0, scale: 0.21, xPercent: 60, yPercent: 60, rotate: -6 },
        {
          autoAlpha: 1,
          scale: 0.42,
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
      )
      .fromTo(
        ".mini-post-tt",
        { autoAlpha: 0, scale: 0.26, xPercent: -60, yPercent: 60, rotate: 6 },
        {
          autoAlpha: 1,
          scale: 0.52,
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "<0.1",
      )
      .fromTo(
        ".mini-post-fb",
        { autoAlpha: 0, scale: 0.22, xPercent: 60, yPercent: -60, rotate: 6 },
        {
          autoAlpha: 1,
          scale: 0.43,
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "<0.1",
      )
      .fromTo(
        ".mini-post-li",
        { autoAlpha: 0, scale: 0.2, xPercent: -60, yPercent: -60, rotate: -6 },
        {
          autoAlpha: 1,
          scale: 0.4,
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "<0.1",
      )
      .to(
        ".cta-overlay",
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" },
        "<0.2",
      );

    // Forward-only lock + pin release on complete.
    //
    // The intro must play exactly once: scrolling back up inside the 3500px
    // pin range must NOT reverse it (posts flying back, MacBook fading out).
    // So once the timeline hits progress 1, clamp it there (lock).
    //
    // The 3500px pin-spacer is also what creates the dead scroll-up zone
    // (hero frozen, page doesn't move for a whole pin-length while the lock
    // keeps progress at 1). Killing the ScrollTrigger on complete collapses
    // that spacer back to the hero's own height, so scrolling back up returns
    // to normal flow — no dead gap, no reverse. delayedCall defers the kill
    // out of this onComplete's own update stack — killing a pinned
    // ScrollTrigger from inside its own callback otherwise leaves the spacer
    // in place.
    let locked = false;
    tl.eventCallback("onComplete", () => {
      locked = true;
      const st = tl.scrollTrigger;
      if (st)
        gsap.delayedCall(0.15, () => {
          st.kill();
          ScrollTrigger.refresh();
          // Killing + refresh can settle the timeline back to progress 0
          // (intro state). Force it to the end so the MacBook demo stays up.
          tl.progress(1);
        });
    });
    tl.eventCallback("onUpdate", () => {
      if (locked && tl.progress() < 1) tl.progress(1);
    });
  });

  return (
    <section
      ref={sectionRef}
      id="hero-cinematic"
      className="relative min-h-[100dvh] w-full overflow-hidden bg-zinc-950"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 38% 44% at 50% 46%, transparent 60%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 38% 44% at 50% 46%, transparent 60%, black 100%)",
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#f05a28"
          raysSpeed={1.2}
          lightSpread={1.6}
          rayLength={2.2}
          fadeDistance={1.4}
          saturation={1}
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.06}
          distortion={0.03}
        />
      </div>
      <div className="absolute inset-0">
        {/* Stage chính: dashboard MacBook + posts bay + mini-posts 4 góc.
            Full inset-0 (không còn flex-1 chia chỗ với CTA) — CTA area giờ
            absolute overlay bên dưới nên không còn ăn bớt chiều cao stage
            trên mobile (trước đây cta-overlay dù opacity-0 vẫn chiếm layout
            height đầy đủ trong flex flow, đẩy stage/post tràn lên khỏi viewport). */}
        <div className="relative inset-0 h-full">
          {/* Layer 0: BrandHub Dashboard background */}
          <BrandHubDashboardBg device={device} sectionRef={sectionRef} />

          {/* Layer 1: Post stack */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="post-ig absolute">
              <InstagramPost />
            </div>
            <div className="post-tt absolute opacity-0">
              <TikTokPost />
            </div>
            <div className="post-fb absolute opacity-0">
              <FacebookPost />
            </div>
            <div className="post-li absolute opacity-0">
              <LinkedInPost />
            </div>
          </div>

          {/* Layer 2: Mini posts 4 góc — chỉ đủ chỗ từ màn hình lớn (xl+),
              màn nhỏ hơn ẩn hẳn để nhường không gian cho demo dashboard. */}
          <div className="mini-posts pointer-events-none absolute inset-0 z-20 hidden opacity-0 xl:block">
            <MiniPosts />
          </div>
        </div>

        {/* Vùng dành riêng cho CTA — absolute overlay đáy màn hình, không
            chiếm chỗ trong layout stage kể cả lúc opacity-0. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-1.5 px-6 pb-3 sm:gap-2.5 sm:pb-5">
          <div className="cta-overlay pointer-events-none flex flex-col items-center gap-3 opacity-0">
            <button
              type="button"
              onClick={() =>
                setDevice((d) => (d === "macbook" ? "iphone" : "macbook"))
              }
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/20"
            >
              {device === "macbook" ? (
                <>
                  <Smartphone className="size-3.5" />{" "}
                  {t("landing.hero.viewOnIphone")}
                </>
              ) : (
                <>
                  <Monitor className="size-3.5" />{" "}
                  {t("landing.hero.viewOnMacbook")}
                </>
              )}
            </button>
            <CTAButtons />
            <SocialProof />
          </div>
          {/* Scroll hint */}
          <div className="scroll-hint flex flex-col items-center gap-1 text-white/25">
            <span className="text-[10px] tracking-[0.2em] uppercase">
              {t("landing.hero.scrollDown")}
            </span>
            <div className="h-8 w-px animate-pulse bg-linear-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Tổng quan", pageIndex: 0 },
  { icon: FileText, label: "Nội dung", pageIndex: 1 },
  { icon: CalendarDays, label: "Lịch", pageIndex: 2 },
  { icon: Sparkles, label: "AI Studio", pageIndex: 3 },
  { icon: LineChart, label: "Analytics", pageIndex: 4 },
  { icon: Upload, label: "Xuất bản", pageIndex: 5 },
  { icon: Building2, label: "Workspace", pageIndex: 6 },
  { icon: ThumbsUp, label: "Phê duyệt", pageIndex: 7 },
] as const;

const NOTIFICATIONS = [
  {
    icon: "approve",
    title: "3 bài đang chờ bạn duyệt",
    time: "vừa xong",
    color: "text-amber-500",
  },
  {
    icon: "publish",
    title: "Launch Heineken đã đăng lên Instagram",
    time: "12 phút trước",
    color: "text-emerald-500",
  },
  {
    icon: "ai",
    title: "AI Studio đã sinh xong 6 ảnh mới",
    time: "1 giờ trước",
    color: "text-brand-orange",
  },
  {
    icon: "credit",
    title: "Chỉ còn 1,250 AI credits",
    time: "3 giờ trước",
    color: "text-blue-500",
  },
] as const;

function NotifIcon({ kind }: { kind: string }) {
  if (kind === "approve") return <Clock className="size-3.5 text-amber-500" />;
  if (kind === "publish")
    return <Upload className="size-3.5 text-emerald-500" />;
  if (kind === "ai") return <Sparkles className="text-brand-orange size-3.5" />;
  return <AlertCircle className="size-3.5 text-blue-500" />;
}

function BrandHubDashboardBg({
  device,
  sectionRef,
}: {
  device: "macbook" | "iphone";
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const page = useLandingDemoStore((s) => s.activePage);
  const setPage = useLandingDemoStore((s) => s.setPage);
  const requestId = useLandingDemoStore((s) => s.requestId);
  const [notifOpen, setNotifOpen] = useState(false);

  // A Feature card requested a specific demo tab (goToPage bumped
  // requestId; activePage/page is already updated via the store). Scroll
  // to the END of the hero's 3500px pinned scroll range — NOT
  // scrollIntoView(), which would only reach the pin's start and force
  // the user to re-scroll through the whole IG->TT->FB->LI intro before
  // seeing the MacBook. ScrollTrigger.getById reads the actual pinned
  // end position (post-layout), matching where the timeline locks at
  // progress:1.
  useEffect(() => {
    if (requestId === 0) return;
    const trigger = ScrollTrigger.getById("hero-pin");
    if (trigger) {
      window.scrollTo({ top: trigger.end, behavior: "smooth" });
    } else {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [requestId, sectionRef]);
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setClock(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      );
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Demo lần đầu: tự xoay qua toàn bộ 7 tab để khoe từng trang, giữ lâu ở
  // Nội dung (page 1) cho view-demo chạy xong, rồi dừng. Guard 1 lần.
  useEffect(() => {
    if (localStorage.getItem("brandhub_tab_demo")) return;
    localStorage.setItem("brandhub_tab_demo", "1");
    const plan: [number, number][] = [
      [1, 900],
      [2, 4500],
      [3, 5300],
      [4, 6100],
      [5, 6900],
      [6, 7700],
      [0, 8500],
    ];
    plan.forEach(([pg, ms]) => setTimeout(() => setPage(pg), ms));
  }, [setPage]);
  const pages = [
    <OverviewPage key="overview" device={device} />,
    <ContentPage key="content" device={device} />,
    <SchedulePage key="schedule" />,
    <AIStudioPage key="ai-studio" />,
    <AnalyticsPage key="analytics" />,
    <PublishPage key="publish" />,
    <WorkspacePage key="workspace" device={device} />,
    <ApprovalPage key="approval" />,
  ];
  // Fit-scale demo (MacBook/iPhone) vào chiều cao hero khả dụng để không bao
  // giờ đè lên vùng CTA. CTA reserve bottom-44 (~176px).
  //
  // demoRef.offsetHeight KHÔNG được dùng để đo nữa: nội dung Kanban/table
  // của một số trang demo (Nội dung, Workspace...) có thể tràn ra ngoài
  // overflow-y-auto trong đúng khung hình đo (trước khi scroll container
  // clip lại), khiến offsetHeight đọc sai ở đúng lúc effect chạy và
  // "đóng băng" fitScale nhỏ hơn thật — MacBook bị co vĩnh viễn dù nội
  // dung sau đó ổn định lại. Cố định chiều cao demo bằng hằng số thay vì
  // đo động: MacBook luôn cùng kích thước bất kể đang ở trang nào.
  const wrapRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const DEMO_HEIGHT_PX = device === "iphone" ? 622 : 523;
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const availH = wrap.clientHeight - 8;
      if (availH > 0) setFitScale(Math.min(1, availH / DEMO_HEIGHT_PX));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [DEMO_HEIGHT_PX]);

  return (
    <div
      ref={wrapRef}
      className="brandhub-bg absolute inset-x-0 top-0 bottom-44 z-0 flex items-center justify-center opacity-0"
    >
      {/* Fit-scale demo device (MacBook/iPhone): height cố định theo nội dung
          (~520px), không co theo width. Trên viewport thấp, 520px + vùng CTA
          (bottom-44) vượt chiều cao hero → demo tràn đè lên nút CTA. Giải
          pháp: đo vùng khả dụng, scale demo xuống vừa khít, giữ căn giữa.
          ResizeObserver tự cân lại khi cửa sổ đổi size / đổi device. */}
      <div
        ref={demoRef}
        className="origin-center will-change-transform"
        style={{ transform: `scale(${fitScale})` }}
      >
        {device === "iphone" ? (
          <IPhoneFrame
            page={page}
            setPage={setPage}
            clock={clock}
            pages={pages}
          />
        ) : (
          <div className="w-[min(72rem,90vw)] px-4 xl:w-[min(64rem,90vw)]">
            {/* Vỏ MacBook Air M5 — chất kim loại: chassis nhôm + bezel màn đen + tai thỏ */}
            <div className="relative rounded-[1.7rem] bg-linear-to-b from-zinc-400 via-zinc-300 to-zinc-500 p-[3px] shadow-2xl shadow-zinc-900/50">
              <div className="rounded-[1.4rem] bg-linear-to-b from-zinc-200 via-zinc-400 to-zinc-500 p-[3px]">
                <div className="relative rounded-[1.2rem] bg-zinc-900 p-2 sm:p-2.5">
                  {/* Bezel đen màn → toàn bộ là desktop macOS Sonoma: wallpaper + menubar
                  + Safari window nổi + Dock. */}
                  <div className="relative overflow-hidden rounded-lg bg-black pt-9 pb-10 sm:pt-10 sm:pb-12">
                    {/* Wallpaper Sonoma — bản sao ci gradient rực rỡ: indigo → tím → magenta
                    → cam → vàng, kèm vài radial bloom mềm đúng tông default Sonoma */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg,#241454 0%,#59299e 22%,#a63aa5 42%,#f0576b 62%,#ff8e3a 82%,#ffd166 100%)",
                      }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_18%_22%,#7fd4ff_0%,transparent_55%),radial-gradient(70%_55%_at_85%_50%,#ff9e5e_0%,transparent_60%),radial-gradient(80%_70%_at_50%_100%,#fff6d8_10%,transparent_68%)] opacity-45 mix-blend-screen" />
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute inset-0 bg-linear-to-b from-white/15 via-transparent to-black/25" />
                    </div>
                    {/* Lớp tinhtinh: sóng sơn trôi nhẹ */}
                    <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_90%,#0ea5e9_0%,transparent_60%),radial-gradient(50%_60%_at_30%_70%,#f472b6_0%,transparent_60%)] opacity-30 mix-blend-overlay" />

                    {/* Tai thỏ: pill hẹp giữa, xuyên qua menubar xuống wallpaper */}
                    <div className="absolute top-0 left-1/2 z-20 h-6 w-36 -translate-x-1/2 rounded-b-xl bg-black shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                      <div className="absolute top-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#0b1d3a]" />
                      <div className="absolute top-[3px] right-5 size-0.5 rounded-full bg-emerald-500/70" />
                    </div>

                    {/* Menubar: dải glass mờ phủ lên wallpaper — macOS Sonoma */}
                    <div className="absolute inset-x-0 top-0 z-10 flex h-6 items-center justify-between bg-white/25 px-3.5 backdrop-blur-md">
                      <div className="flex items-center gap-2.5 pr-6">
                        <Apple className="size-3 text-zinc-900" />
                        <span className="text-[10.5px] font-bold text-zinc-900">
                          BrandHub
                        </span>
                        <span className="hidden text-[10.5px] font-medium text-zinc-800 sm:block">
                          Tệp
                        </span>
                        <span className="hidden text-[10.5px] font-medium text-zinc-800 sm:block">
                          Sửa
                        </span>
                        <span className="hidden text-[10.5px] font-medium text-zinc-800 md:block">
                          Hiển thị
                        </span>
                        <span className="hidden text-[10.5px] font-medium text-zinc-800 lg:block">
                          Cửa sổ
                        </span>
                        <span className="hidden text-[10.5px] font-medium text-zinc-800 lg:block">
                          Trợ giúp
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 pl-6">
                        <Search className="size-2.5 text-zinc-800" />
                        <Wifi className="size-3 text-zinc-800" />
                        <BatteryFull className="size-3.5 text-zinc-800" />
                        <span className="text-[10.5px] font-semibold text-zinc-900">
                          {clock}
                        </span>
                      </div>
                    </div>

                    {/* Cửa sổ Safari nổi trên desktop — dashboard tương tác */}
                    <div className="relative z-30 mx-3 mb-3 overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-black/15 sm:mx-4">
                      {/* Thanh tiêu đề: 3 nút traffic-light */}
                      <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="size-3 rounded-full bg-[#ff5f57]" />
                          <span className="size-3 rounded-full bg-[#febc2e]" />
                          <span className="size-3 rounded-full bg-[#28c840]" />
                        </div>
                        <div className="ml-2 hidden items-center gap-1 sm:flex">
                          <ArrowLeft className="size-3.5 text-zinc-500" />
                          <ArrowRight className="size-3 text-zinc-400" />
                          <RefreshCw className="size-3 text-zinc-400" />
                        </div>
                        {/* Thanh địa chỉ centered */}
                        <div className="mx-auto flex max-w-md flex-1 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                          <Compass className="size-3 text-zinc-400" />
                          <span className="flex-1 truncate text-center text-[11px] font-medium tracking-tight text-zinc-700">
                            brandhub.app/dashboard
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="size-3.5 text-zinc-500" />
                          <Monitor className="size-3.5 text-zinc-500" />
                          <div className="relative flex items-center gap-1.5">
                            <div className="size-5 rounded-full bg-linear-to-br from-orange-400 to-orange-600" />
                            <button
                              type="button"
                              onClick={() => setNotifOpen((o) => !o)}
                              className="relative flex cursor-pointer items-center"
                              aria-expanded={notifOpen}
                            >
                              <Bell className="size-3 text-zinc-500" />
                              <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-red-500" />
                            </button>
                            {notifOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setNotifOpen(false)}
                                />
                                <div className="absolute top-6 right-0 z-50 w-52 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
                                  <p className="px-2 py-1 text-[10px] font-semibold text-zinc-700">
                                    Thông báo
                                  </p>
                                  <div className="flex flex-col">
                                    {NOTIFICATIONS.map((n) => (
                                      <div
                                        key={n.title}
                                        className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50"
                                      >
                                        <NotifIcon kind={n.icon} />
                                        <div className="min-w-0">
                                          <p className="line-clamp-2 text-[10px] leading-tight text-zinc-700">
                                            {n.title}
                                          </p>
                                          <p className="text-[8px] text-zinc-400">
                                            {n.time}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Body: sidebar + nội dung chuyển trang */}
                      <div className="flex">
                        <div className="hidden w-44 shrink-0 border-r border-zinc-200 bg-zinc-50/40 p-3 sm:block">
                          <div className="mb-3 flex items-center gap-2 px-1">
                            <div className="bg-brand-orange flex size-5 items-center justify-center rounded-md text-[10px] font-bold text-white">
                              B
                            </div>
                            <span className="text-xs font-semibold text-zinc-900">
                              BrandHub
                            </span>
                          </div>
                          {NAV_ITEMS.map((item) => {
                            const activeNav = page === item.pageIndex;
                            return (
                              <div
                                key={item.label}
                                onClick={() => setPage(item.pageIndex)}
                                className={`mb-1 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${
                                  activeNav
                                    ? "bg-brand-orange/10 text-brand-orange font-medium"
                                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                                }`}
                              >
                                <item.icon className="size-3.5" />
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                        {/* Trang active: key thay đổi theo index → remount, GSAP chạy lại animation chuyển trang */}
                        <div className="relative h-85 flex-1 overflow-y-auto">
                          <div key={page} className="page-enter min-h-full">
                            {pages[page]}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dock — dải glass nổi cuối màn hình. Left: BrandHub (app đang chạy)
                      + bộ icon app chuẩn Apple: Finder, Launchpad, Safari, Messages, Mail,
                      Maps, Photos, Calendar, Notes, Music. Divider. Right: Downloads + Trash. */}
                    <div className="absolute inset-x-0 bottom-0.5 z-30 flex items-center justify-center">
                      <div className="flex items-end gap-1.5 rounded-2xl rounded-b-xl bg-black/25 px-2 py-1.5 ring-1 ring-white/20 backdrop-blur-md">
                        {/* BrandHub đang chạy — logo thương hiệu thay chỗ Mail/Facetime */}
                        <div className="relative flex size-5 items-center justify-center rounded-[22%] bg-linear-to-tr from-orange-500 to-orange-300 text-[9px] font-bold text-white shadow">
                          B
                          <span className="absolute -bottom-1 left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-black/70" />
                        </div>
                        {/* Finder */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#23c6ff] to-[#0a7be0] shadow">
                          <FaceGlyph />
                        </div>
                        {/* Launchpad */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#79849c] to-[#3d4657] shadow">
                          <LaunchpadGlyph />
                        </div>
                        {/* Safari */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-white shadow">
                          <SafariGlyph />
                        </div>
                        {/* Messages */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#3be86b] to-[#14a83a] shadow">
                          <MessagesGlyph />
                        </div>
                        {/* Mail */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#49b0ff] to-[#1475e8] shadow">
                          <MailGlyph />
                        </div>
                        {/* Maps */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#fdfefe] to-[#d9e2ec] shadow">
                          <MapsGlyph />
                        </div>
                        {/* Photos */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-white shadow">
                          <PhotosGlyph />
                        </div>
                        {/* Calendar */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-white shadow">
                          <CalendarGlyph />
                        </div>
                        {/* Notes */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#f7f7f7] to-[#e6e6e6] shadow">
                          <NotesGlyph />
                        </div>
                        {/* Music */}
                        <div className="flex size-5 items-center justify-center rounded-[22%] bg-linear-to-b from-[#ff5d8f] to-[#e11d60] shadow">
                          <MusicGlyph />
                        </div>
                        {/* Divider */}
                        <div className="mx-0.5 h-6 w-px bg-white/25" />
                        {/* Downloads folder */}
                        <div className="flex size-5 items-center justify-center shadow">
                          <DownloadsGlyph />
                        </div>
                        {/* Trash */}
                        <div className="flex size-5 items-center justify-center rounded-[20%] bg-[#c9cfd6] shadow ring-1 ring-white/40">
                          <TrashGlyph />
                        </div>
                      </div>
                    </div>

                    {/* Dưới chân: hõm mở nắp laptop */}
                    <div className="absolute bottom-0 left-1/2 h-1.5 w-[26%] -translate-x-1/2 rounded-full bg-zinc-300/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Khung iPhone: status bar iOS + Safari toolbar + trang active + bottom tab bar. */
function IPhoneFrame({
  page,
  setPage,
  clock,
  pages,
}: {
  page: number;
  setPage: (i: number) => void;
  clock: string;
  pages: React.ReactNode[];
}) {
  return (
    <div className="relative mx-auto w-80 px-4">
      {/* Vỏ iPhone — chassis titan + viền màn đen + notch */}
      <div className="relative rounded-[2.6rem] bg-linear-to-b from-zinc-500 via-zinc-300 to-zinc-500 p-0.75 shadow-2xl shadow-zinc-900/50">
        <div className="relative overflow-hidden rounded-[2.4rem] bg-black p-2">
          <div className="relative h-150 overflow-hidden rounded-4xl bg-white">
            {/* Status bar iOS — chữ trắng, cách notch ra 2 bên */}
            <div className="absolute inset-x-0 top-0 z-30 flex h-9 items-end justify-between px-6 pb-1.5">
              <span className="text-[11px] font-semibold text-white">
                {clock}
              </span>
              <div className="flex items-center gap-1">
                <Wifi className="size-3 text-white" />
                <BatteryFull className="size-3.5 text-white" />
              </div>
            </div>

            {/* Notch (Dynamic Island) */}
            <div className="absolute top-2 left-1/2 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

            {/* Top bar app: tên trang hiện tại */}
            <div className="absolute inset-x-0 top-9 z-10 flex h-9 items-center justify-center border-b border-zinc-100 bg-white px-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                <div className="bg-brand-orange flex size-4 items-center justify-center rounded text-[8px] font-bold text-white">
                  B
                </div>
                {NAV_ITEMS[page].label}
              </span>
            </div>

            {/* Nội dung trang — kích thước thật, scroll dọc khi cao hơn màn */}
            <div className="absolute inset-x-0 top-18 bottom-14 overflow-y-auto">
              <div key={page} className="page-enter min-h-full">
                {pages[page]}
              </div>
            </div>

            {/* Bottom tab bar iOS — 7 mục, icon + label nhỏ. flex-1 min-w-0 ép
                mỗi item co đều vừa 320px, tránh tràn khỏi khung iPhone. */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-start rounded-b-4xl border-t border-zinc-200 bg-white/95 px-0.5 pt-1.5 pb-3.5 backdrop-blur">
              {NAV_ITEMS.map((item) => {
                const active = page === item.pageIndex;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setPage(item.pageIndex)}
                    className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5"
                  >
                    <item.icon
                      className={`size-4 shrink-0 ${active ? "text-brand-orange" : "text-zinc-400"}`}
                    />
                    <span
                      className={`w-full truncate text-center text-[7px] leading-none font-medium ${
                        active ? "text-brand-orange" : "text-zinc-400"
                      }`}
                    >
                      {item.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Nút nguồn + volume */}
      <div className="absolute top-24 -right-0.75 h-16 w-0.75 rounded-r bg-zinc-400" />
      <div className="absolute top-20 -left-0.75 h-8 w-0.75 rounded-l bg-zinc-400" />
      <div className="absolute top-32 -left-0.75 h-12 w-0.75 rounded-l bg-zinc-400" />
    </div>
  );
}

function CTAButtons() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <a
        href="/register"
        className="bg-brand-orange hover:bg-brand-orange/90 pointer-events-auto inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/40"
      >
        <Rocket className="size-4" />
        {t("landing.hero.ctaStart")}
      </a>
      <a
        href="/login"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/10"
      >
        {t("landing.hero.ctaLogin")}
      </a>
    </div>
  );
}

const AVATAR_INITIALS = ["MN", "SC", "TL", "ĐA"];

/** Social proof: avatar stack + trusted-by text, dưới CTA buttons trong hero. */
function SocialProof() {
  const { t } = useTranslation();
  return (
    <div className="pointer-events-none flex items-center gap-2.5">
      <div className="flex -space-x-2">
        {AVATAR_INITIALS.map((initials) => (
          <div
            key={initials}
            className="bg-brand-orange flex size-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-black/80"
          >
            {initials}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-white/60">
        {t("landing.hero.trustedByPrefix")}{" "}
        <span className="font-semibold text-white/90">50,000+</span>{" "}
        {t("landing.hero.trustedBySuffix")}
      </p>
    </div>
  );
}

/* ── Safari window nội dung: 4 trang dashboard ────────────────────── */

const PAGE_CARD = "rounded-lg border border-zinc-200 bg-white p-3 shadow-sm";

interface TrendingItem {
  rank: number;
  keyword: string;
  channel: CalChannel;
  growth: number;
  views: string;
}
/** Trending hôm nay — mock dữ liệu hệ thống cào. */
const TRENDING_ITEMS: TrendingItem[] = [
  {
    rank: 1,
    keyword: "Cà phê trứng đang lên ngôi",
    channel: "tiktok",
    growth: 312,
    views: "1.2M",
  },
  {
    rank: 2,
    keyword: "Review iPhone 17 mới ra mắt",
    channel: "instagram",
    growth: 268,
    views: "980K",
  },
  {
    rank: 3,
    keyword: "Sneaker drop Nike Air Max",
    channel: "tiktok",
    growth: 194,
    views: "742K",
  },
  {
    rank: 4,
    keyword: "Xu hướng quà T8 cho khách hàng",
    channel: "facebook",
    growth: 121,
    views: "510K",
  },
  {
    rank: 5,
    keyword: "Case study content agency VN",
    channel: "linkedin",
    growth: 87,
    views: "316K",
  },
];

interface AdviceItem {
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
}
/** Lời khuyên AI đề xuất hôm nay. */
const ADVICE_ITEMS: AdviceItem[] = [
  {
    title: "Đăng Reel tối nay 20h",
    body: "Trend 'Cà phê trứng' đang tăng 312% — cập nhật ngay nội dung TikTok.",
    icon: Flame,
  },
  {
    title: "Giờ vàng Instagram 19h",
    body: "Audience brand bạn active mạnh nhất 19-21h. Dời bài 09:00 → 19:30.",
    icon: Clock,
  },
  {
    title: "Gợi ý: chuỗi Q&A founder",
    body: "Nội dung nói về người thật đang tăng reach 2.4x tuần này.",
    icon: Lightbulb,
  },
];

function OverviewPage({ device }: { device: "macbook" | "iphone" }) {
  const gridCols = device === "iphone" ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            Chào buổi sáng, Team!
          </p>
          <p className="text-[11px] text-zinc-500">
            Hôm nay có 12 nội dung cần publish
          </p>
        </div>
        <div className="bg-brand-orange/10 text-brand-orange flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium">
          <TrendingUp className="size-3" />
          +18% tuần này
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={PAGE_CARD}>
          <div className="mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Files className="text-brand-orange size-3" />
              Tổng bài
            </span>
            <span className="text-brand-orange text-[9px]">●</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">1,284</p>
          <div className="mt-1.5 flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[9px] text-zinc-500">
              <Upload className="text-brand-orange size-2.5" /> Đã đăng
              <b className="ml-auto font-semibold text-zinc-700">986</b>
            </span>
            <span className="flex items-center gap-1 text-[9px] text-zinc-500">
              <Clock className="text-brand-orange size-2.5" /> Chờ duyệt
              <b className="ml-auto font-semibold text-zinc-700">24</b>
            </span>
            <span className="flex items-center gap-1 text-[9px] text-zinc-500">
              <AlertCircle className="text-brand-orange size-2.5" /> Lỗi
              <b className="ml-auto font-semibold text-zinc-700">3</b>
            </span>
          </div>
        </div>
        <div className={PAGE_CARD}>
          <div className="mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Users2 className="text-brand-orange size-3" />
              Theo dõi
            </span>
            <span className="text-brand-orange text-[9px]">●</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">12.4k</p>
          <div className="bg-brand-orange/10 text-brand-orange mt-1.5 flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium">
            <TrendingUp className="size-2.5" /> +18% tuần này
          </div>
        </div>
      </div>
      {/* Trending hôm nay */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
            <Flame className="text-brand-orange size-3" />
            TRENDING HÔM NAY
          </p>
          <span className="bg-brand-orange/10 text-brand-orange flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-medium">
            <RefreshCw className="size-2.5" /> Cào 09:00
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {TRENDING_ITEMS.map((t) => {
            const cfg = CALENDAR_CHANNEL_CONFIG[t.channel];
            return (
              <div key={t.rank} className="flex items-center gap-2">
                <span className="flex size-4 shrink-0 items-center justify-center rounded text-[9px] font-bold text-zinc-500">
                  {t.rank}
                </span>
                <cfg.icon
                  className="size-3 shrink-0"
                  style={{ color: cfg.color }}
                />
                <p className="min-w-0 flex-1 truncate text-[10px] text-zinc-700">
                  {t.keyword}
                </p>
                <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600">
                  <TrendingUp className="size-2.5" />+{t.growth}%
                </span>
                <span className="text-[9px] text-zinc-400">{t.views}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3">
        <div className="col-span-1 flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-medium text-zinc-500">
              HIỆU SUẤT CONTENT
            </p>
            <div className="flex items-center gap-1 text-[9px] text-zinc-500">
              <span className="bg-brand-orange size-1.5 rounded-full" />
              30 ngày
            </div>
          </div>
          <AnimatedBars />
        </div>
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-medium text-zinc-500">
            TOP KÊNH HOẠT ĐỘNG
          </p>
          {[
            { name: "Instagram", pct: 82, color: "bg-brand-orange" },
            { name: "TikTok", pct: 71, color: "bg-orange-400" },
            { name: "Facebook", pct: 64, color: "bg-amber-500" },
            { name: "LinkedIn", pct: 48, color: "bg-orange-300" },
          ].map((k) => (
            <div key={k.name} className="mb-2">
              <p className="text-[9px] text-zinc-500">{k.name}</p>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className={`h-full rounded-full ${k.color}`}
                  style={{ width: `${k.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`grid ${gridCols} gap-3`}>
        {/* Donut phân bố kênh */}
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-medium text-zinc-500">
            PHÂN BỐ KÊNH
          </p>
          <div className="flex flex-1 items-center gap-3">
            <div
              className="size-16 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#f05a28 0 29%, #ff6b35 0 57%, #eab308 0 78%, #f0783a 0 100%)",
              }}
            />
            <div className="flex flex-1 flex-col gap-1">
              {[
                { label: "Instagram", pct: "29%", c: "bg-brand-orange" },
                { label: "TikTok", pct: "28%", c: "bg-orange-400" },
                { label: "Facebook", pct: "21%", c: "bg-amber-500" },
                { label: "LinkedIn", pct: "22%", c: "bg-orange-300" },
              ].map((k) => (
                <div key={k.label} className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${k.c}`} />
                  <p className="flex-1 text-[9px] text-zinc-500">{k.label}</p>
                  <p className="text-[9px] font-semibold text-zinc-700">
                    {k.pct}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Lời khuyên AI */}
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
            <Sparkles className="text-brand-orange size-3" />
            ĐỀ XUẤT HÔM NAY
          </p>
          <div className="mt-2 flex flex-col gap-2.5">
            {ADVICE_ITEMS.map((a) => (
              <div key={a.title} className="flex items-start gap-2">
                <span className="bg-brand-orange/10 text-brand-orange mt-0.5 flex size-5 shrink-0 items-center justify-center rounded">
                  <a.icon className="size-3" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-800">
                    {a.title}
                  </p>
                  <p className="text-[9px] leading-snug text-zinc-500">
                    {a.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cột biểu đồ SVG — gọi effect để animate chiều cao cột khi mount. */
function AnimatedBars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heights = [60, 85, 45, 90, 70, 55, 95];
  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current.querySelectorAll(".bar-fill"),
      { scaleY: 0, transformOrigin: "bottom" },
      { scaleY: 1, duration: 0.7, ease: "back.out(1.6)", stagger: 0.06 },
    );
  }, []);
  return (
    <div ref={containerRef} className="flex flex-1 flex-col">
      <div className="flex flex-1 items-end gap-2">
        {heights.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end gap-1">
            <div
              className="bar-fill from-brand-orange/70 to-brand-orange mx-auto w-full max-w-5 rounded-t-sm bg-linear-to-t"
              style={{ height: `${h}px` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-zinc-600">
        <span>T2</span>
        <span>T3</span>
        <span>T4</span>
        <span>T5</span>
        <span>T6</span>
        <span>T7</span>
        <span>CN</span>
      </div>
    </div>
  );
}

const KANBAN_COLS = [
  {
    key: "draft",
    label: "Bản nháp",
    dot: "bg-zinc-400",
    bar: "bg-zinc-300",
  },
  {
    key: "review",
    label: "Chờ duyệt",
    dot: "bg-amber-400",
    bar: "bg-amber-300",
  },
  {
    key: "published",
    label: "Đã đăng",
    dot: "bg-emerald-400",
    bar: "bg-emerald-300",
  },
] as const;
type KanbanStatus = (typeof KANBAN_COLS)[number]["key"];

interface KanbanItem {
  title: string;
  channel: CalChannel;
  time: string;
  status: KanbanStatus;
  cover?: string;
  tag?: string;
  author?: string;
  impressions?: string;
}

const KANBAN_ITEMS: KanbanItem[] = [
  {
    title: "Case study BrandHub x VCorp",
    channel: "linkedin",
    time: "Cập nhật 10:24",
    status: "draft",
    cover:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=200&q=60",
    tag: "Article",
  },
  {
    title: "Tuyển dụng 5 vị trí Marketing",
    channel: "linkedin",
    time: "Cập nhật 09:10",
    status: "draft",
    tag: "Bài viết",
    cover:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=200&q=60",
    author: "Thu Hà",
    impressions: "0",
  },
  {
    title: "Email khuyến mãi 20% KH thân thiết",
    channel: "facebook",
    time: "Cập nhật hôm qua",
    status: "draft",
    tag: "Email",
    cover:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=200&q=60",
    author: "Minh Nguyễn",
    impressions: "0",
  },
  {
    title: "Banner khuyến mãi T8 giảm 30%",
    channel: "facebook",
    time: "Chờ từ 15:00 hôm nay",
    status: "review",
    cover:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=200&q=60",
    tag: "Quảng cáo",
  },
  {
    title: "Livestream: Q&A với founder",
    channel: "facebook",
    time: "CN tuần sau 20:00",
    status: "review",
    cover:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=60",
    tag: "Live",
  },
  {
    title: "Reel: 3 mẹo tăng reach hữu cơ",
    channel: "instagram",
    time: "Chờ từ 10:00 hôm nay",
    status: "review",
    cover:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=200&q=60",
    tag: "Reel",
  },
  {
    title: "Launch Heineken mới — Hè 2026",
    channel: "instagram",
    time: "Hôm nay 09:00",
    status: "published",
    cover:
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=200&q=60",
    tag: "Campaign",
    author: "Quang",
    impressions: "45.6K",
  },
  {
    title: "Review Nike Air Max — trend hè",
    channel: "tiktok",
    time: "Hôm nay 12:00",
    status: "published",
    cover:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=60",
    tag: "Video",
    author: "Đức",
    impressions: "72.1K",
  },
  {
    title: "Weekly roundup tháng 7",
    channel: "linkedin",
    time: "Hôm nay 08:30",
    status: "published",
    tag: "Insight",
    cover:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&q=60",
    author: "Thu Hà",
    impressions: "18.2K",
  },
  {
    title: "Story khuyến mãi cuối tuần",
    channel: "instagram",
    time: "Hôm qua 18:00",
    status: "published",
    tag: "Story",
    cover:
      "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=200&q=60",
    author: "Trang",
    impressions: "9.4K",
  },
];

function ContentPage({ device }: { device: "macbook" | "iphone" }) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [items, setItems] = useState<KanbanItem[]>(KANBAN_ITEMS);
  const [dragTitle, setDragTitle] = useState<string | null>(null);
  const [open, setOpen] = useState<KanbanItem | null>(null);
  const [view, setView] = useState<"kanban" | "list" | "timeline">("kanban");
  const [demoHint, setDemoHint] = useState(false);

  // Demo lần đầu: tự xoay qua 3 view rồi dừng, guard localStorage 1 lần.
  useEffect(() => {
    if (localStorage.getItem("brandhub_view_demo")) return;
    localStorage.setItem("brandhub_view_demo", "1");
    setDemoHint(true);
    const seq = ["list", "timeline", "kanban"] as const;
    seq.forEach((v, i) => {
      setTimeout(() => setView(v), (i + 1) * 800);
    });
    setTimeout(() => setDemoHint(false), 3600);
  }, []);

  const moveTo = (status: KanbanStatus) => {
    if (!dragTitle) return;
    setItems((prev) =>
      prev.map((p) => (p.title === dragTitle ? { ...p, status } : p)),
    );
    setDragTitle(null);
  };

  const filtered = items.filter((p) =>
    p.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="relative flex min-h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            Quản lý nội dung
          </p>
          <p className="text-[11px] text-zinc-500">
            Lên lịch & xuất bản đa kênh
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setTimeout(() => setCreating(false), 2000);
          }}
          className="bg-brand-orange flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white transition-transform active:scale-95"
        >
          <Plus className="size-3" /> Tạo bài
        </button>
      </div>
      <div className="focus-within:border-brand-orange/50 focus-within:ring-brand-orange/30 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors focus-within:ring-1">
        <Search className="size-3 shrink-0 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm theo tên bài..."
          className="w-full bg-transparent text-[10px] text-zinc-700 outline-none placeholder:text-zinc-500"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm">
          {(
            [
              { key: "kanban", icon: LayoutGrid, label: "Kanban" },
              { key: "list", icon: List, label: "List" },
              { key: "timeline", icon: CalendarRange, label: "Timeline" },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[9px] font-medium transition-colors ${
                view === v.key
                  ? "bg-brand-orange text-white"
                  : "text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              <v.icon className="size-3" /> {v.label}
            </button>
          ))}
        </div>
        <span className="text-[9px] text-zinc-400">{filtered.length} bài</span>
      </div>
      {demoHint && (
        <p className="ghost-comment-in border-brand-orange/30 bg-brand-orange/10 text-brand-orange rounded-md border px-2 py-1 text-center text-[9px] font-medium">
          Demo: 3 kiểu view — bạn tự khám phá nhé
        </p>
      )}
      <div
        className={`grid flex-1 gap-3 ${view !== "kanban" ? "hidden" : ""} ${
          device === "iphone"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-3 sm:overflow-hidden"
        }`}
      >
        {KANBAN_COLS.map((col) => {
          const colItems = filtered.filter((p) => p.status === col.key);
          const isOver = dragTitle !== null;
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveTo(col.key)}
              className={`flex min-h-40 flex-col gap-1.5 rounded-lg border p-2 shadow-sm transition-colors ${
                isOver
                  ? "border-brand-orange/50 bg-brand-orange/5"
                  : "border-zinc-200 bg-zinc-50/60"
              }`}
            >
              <div className="flex items-center justify-between px-0.5 pb-1">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-700">
                  <span className={`size-1.5 rounded-full ${col.dot}`} />
                  {col.label}
                </span>
                <span className="rounded-full bg-white px-1.5 text-[9px] font-medium text-zinc-500 shadow-sm">
                  {colItems.length}
                </span>
              </div>
              {colItems.map((p) => {
                const cfg = CALENDAR_CHANNEL_CONFIG[p.channel];
                return (
                  <div
                    key={p.title}
                    draggable
                    onDragStart={() => setDragTitle(p.title)}
                    onDragEnd={() => setDragTitle(null)}
                    onClick={() => setOpen(p)}
                    className="hover:border-brand-orange/40 flex cursor-pointer flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-sm transition-colors"
                  >
                    {p.cover ? (
                      <img
                        src={p.cover}
                        alt={p.title}
                        loading="lazy"
                        className="h-10 w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="from-brand-orange/30 h-10 w-full rounded-md bg-linear-to-br via-amber-300/40 to-purple-400/30" />
                    )}
                    <div className="flex items-start gap-1.5">
                      <cfg.icon
                        className="mt-0.5 size-3 shrink-0"
                        style={{ color: cfg.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[10px] leading-tight font-medium text-zinc-800">
                          {p.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[8px] text-zinc-400">
                          {p.tag && (
                            <span
                              className={`rounded px-1 font-medium text-white ${col.bar}`}
                            >
                              {p.tag}
                            </span>
                          )}
                          <span className="truncate">{p.time}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {colItems.length === 0 && (
                <p className="py-3 text-center text-[9px] text-zinc-400">
                  Thả bài vào đây
                </p>
              )}
            </div>
          );
        })}
      </div>
      {view === "list" && (
        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {filtered.map((p) => {
            const cfg = CALENDAR_CHANNEL_CONFIG[p.channel];
            const col = KANBAN_COLS.find((c) => c.key === p.status);
            return (
              <div
                key={p.title}
                onClick={() => setOpen(p)}
                className="hover:border-brand-orange/40 flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-sm transition-colors"
              >
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="size-9 shrink-0 rounded-md object-cover"
                />
                <cfg.icon
                  className="size-3 shrink-0"
                  style={{ color: cfg.color }}
                />
                <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-zinc-800">
                  {p.title}
                </p>
                <span
                  className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-medium text-white ${col?.bar}`}
                >
                  {col?.label}
                </span>
                <span className="shrink-0 text-[9px] text-zinc-400">
                  {p.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {view === "timeline" && (
        <TimelineNotion items={filtered} onOpen={setOpen} />
      )}
      {creating && (
        <p className="ghost-comment-in border-brand-orange/30 bg-brand-orange/10 text-brand-orange rounded-md border px-2 py-1 text-center text-[9px] font-medium">
          Đang mở trình soạn bài mới...
        </p>
      )}
      {open && (
        <div className="absolute inset-0 z-20 flex flex-col overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3 shadow-xl">
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="text-brand-orange flex w-fit items-center gap-1 text-[10px] font-semibold"
          >
            <ArrowLeft className="size-3" /> Tất cả bài
          </button>
          <div className="from-brand-orange/30 relative mt-2 h-28 overflow-hidden rounded-md bg-linear-to-br via-amber-300/40 to-purple-400/30">
            {open.cover && (
              <img
                src={open.cover}
                alt={open.title}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </div>
          <div className="mt-2.5 flex items-start justify-between gap-2">
            <p className="text-xs leading-snug font-semibold text-zinc-900">
              {open.title}
            </p>
            {(() => {
              const col = KANBAN_COLS.find((c) => c.key === open.status);
              return (
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-medium text-white ${col?.bar}`}
                >
                  {col?.label}
                </span>
              );
            })()}
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {(() => {
              const cfg = CALENDAR_CHANNEL_CONFIG[open.channel];
              return (
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                  <cfg.icon className="size-3" style={{ color: cfg.color }} />
                  Kênh: {cfg.label}
                </span>
              );
            })()}
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <Clock className="text-brand-orange size-3" /> {open.time}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <Users2 className="text-brand-orange size-3" /> Tác giả:{" "}
              {open.author ?? "—"}
            </span>
          </div>
          <div className="bg-brand-orange/5 border-brand-orange/15 mt-3 flex items-center justify-around rounded-lg border px-2 py-2.5">
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900">
                {open.impressions ?? "0"}
              </p>
              <p className="text-[8px] text-zinc-500">Lượt tiếp cận</p>
            </div>
            <div className="h-6 w-px bg-zinc-200" />
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900">
                {open.status === "published" ? "2.1K" : "—"}
              </p>
              <p className="text-[8px] text-zinc-500">Tương tác</p>
            </div>
            <div className="h-6 w-px bg-zinc-200" />
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900">
                {open.status === "published" ? "4.8%" : "—"}
              </p>
              <p className="text-[8px] text-zinc-500">Engagement</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Timeline kiểu Notion — trục ngang theo ngày, task là bar nối nhiều cột. */
const TIMELINE_DAYS = [
  { dow: "T2", date: "03/08" },
  { dow: "T3", date: "04/08" },
  { dow: "T4", date: "05/08" },
  { dow: "T5", date: "06/08" },
  { dow: "T6", date: "07/08" },
  { dow: "T7", date: "08/08" },
  { dow: "CN", date: "09/08" },
];
const TIMELINE_COL = 56;
const TIMELINE_GUTTER = 88;

function TimelineNotion({
  items,
  onOpen,
}: {
  items: KanbanItem[];
  onOpen: (i: KanbanItem) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div
        style={{
          minWidth: TIMELINE_GUTTER + TIMELINE_DAYS.length * TIMELINE_COL,
        }}
      >
        {/* Header ngày */}
        <div className="flex border-b border-zinc-200">
          <div
            className="shrink-0 border-r border-zinc-200 px-2 py-1 text-[9px] font-medium text-zinc-500"
            style={{ width: TIMELINE_GUTTER }}
          >
            Tác vụ
          </div>
          {TIMELINE_DAYS.map((d, i) => (
            <div
              key={d.date}
              className={`shrink-0 px-1 py-1 text-center ${i === 0 ? "bg-brand-orange/5" : ""}`}
              style={{ width: TIMELINE_COL }}
            >
              <p className="text-[8px] font-semibold text-zinc-700">{d.dow}</p>
              <p className="text-[8px] text-zinc-400">{d.date}</p>
            </div>
          ))}
        </div>
        {/* Các lane task */}
        {items.map((p) => {
          const cfg = CALENDAR_CHANNEL_CONFIG[p.channel];
          const col = KANBAN_COLS.find((c) => c.key === p.status);
          const day =
            p.status === "published" ? 0 : p.status === "review" ? 1 : 3;
          const span = p.status === "draft" ? 2 : 1;
          return (
            <div key={p.title} className="flex border-b border-zinc-100">
              <div
                className="z-10 flex shrink-0 items-center gap-1 border-r border-zinc-200 bg-white px-2 py-1.5"
                style={{ width: TIMELINE_GUTTER }}
              >
                <cfg.icon
                  className="size-3 shrink-0"
                  style={{ color: cfg.color }}
                />
                <p className="truncate text-[9px] text-zinc-700">{p.title}</p>
              </div>
              <div
                className="relative"
                style={{
                  width: TIMELINE_DAYS.length * TIMELINE_COL,
                  height: 30,
                }}
              >
                {TIMELINE_DAYS.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-r border-zinc-100"
                    style={{ left: i * TIMELINE_COL, width: TIMELINE_COL }}
                  />
                ))}
                <div
                  onClick={() => onOpen(p)}
                  className={`absolute top-1 bottom-1 cursor-pointer rounded px-1.5 shadow-sm transition-transform hover:-translate-y-px ${col?.bar}`}
                  style={{
                    left: day * TIMELINE_COL + 3,
                    width: span * TIMELINE_COL - 6,
                  }}
                >
                  <span className="flex h-full items-center gap-1 truncate text-[8px] font-medium text-white">
                    <cfg.icon
                      className="size-2.5 shrink-0"
                      style={{ color: "rgba(255,255,255,.9)" }}
                    />
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CALENDAR_CHANNEL_CONFIG = {
  instagram: { icon: InstagramGlyph, color: "#f05a28", label: "Instagram" },
  tiktok: { icon: TikTokGlyph, color: "#ff6b35", label: "TikTok" },
  facebook: { icon: FacebookGlyph, color: "#ea4a1c", label: "Facebook" },
  linkedin: { icon: LinkedInGlyph, color: "#f0783a", label: "LinkedIn" },
} as const;
type CalChannel = keyof typeof CALENDAR_CHANNEL_CONFIG;

const CALENDAR_POSTS: Record<
  number,
  { title: string; channel: CalChannel; time: string }[]
> = {
  5: [{ title: "Chào tháng 8!", channel: "instagram", time: "09:00" }],
  9: [
    { title: "Launch Heineken mới", channel: "instagram", time: "09:00" },
    { title: "Review Nike — trend", channel: "tiktok", time: "12:00" },
    { title: "Banner khuyến mãi T8", channel: "facebook", time: "15:00" },
  ],
  12: [{ title: "Weekly roundup", channel: "linkedin", time: "08:30" }],
  15: [
    { title: "Weekly roundup", channel: "linkedin", time: "11:00" },
    { title: "Reel tips tăng reach", channel: "instagram", time: "19:00" },
  ],
  19: [
    { title: "Unboxing Serie B", channel: "tiktok", time: "19:00" },
    { title: "Livestream Q&A founder", channel: "facebook", time: "20:00" },
  ],
  22: [
    { title: "Banner khuyến mãi T8", channel: "facebook", time: "15:00" },
    { title: "Case study BrandHub", channel: "linkedin", time: "17:00" },
  ],
  26: [{ title: "Flash sale cuối tháng", channel: "instagram", time: "10:00" }],
  28: [
    { title: "Q3 preview", channel: "instagram", time: "10:00" },
    { title: "Tuyển dụng Marketing", channel: "linkedin", time: "14:00" },
  ],
};

function SchedulePage() {
  const cells = [
    null,
    null,
    5,
    6,
    7,
    8,
    9,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    null,
  ];
  const today = 22;
  const [selected, setSelected] = useState<number | null>(today);
  const selectedPosts = selected ? (CALENDAR_POSTS[selected] ?? []) : [];

  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Lịch xuất bản</p>
            <p className="text-[11px] text-zinc-500">Tháng 8, 2026</p>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <button className="rounded p-0.5 hover:text-zinc-900">
              <ChevronLeft className="size-3" />
            </button>
            <span className="text-[11px] font-medium">Tháng 8</span>
            <button className="rounded p-0.5 hover:text-zinc-900">
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[8px] text-zinc-500">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {cells.map((c, i) => {
            const posts = c ? (CALENDAR_POSTS[c] ?? []) : [];
            return (
              <button
                key={i}
                type="button"
                disabled={!c}
                onClick={() => c && setSelected(c)}
                aria-pressed={selected === c}
                className={`flex flex-col items-center gap-0.5 rounded-md p-1 text-[10px] transition-all outline-none ${
                  c === today
                    ? "bg-brand-orange font-bold text-white"
                    : selected === c
                      ? "bg-brand-orange/15 text-brand-orange ring-brand-orange/40 font-semibold ring-1"
                      : c
                        ? "hover:border-brand-orange/40 hover:text-brand-orange border border-zinc-200 bg-white text-zinc-600 shadow-sm"
                        : ""
                }`}
              >
                <span>{c}</span>
                {posts.length > 0 && (
                  <span className="flex gap-0.5">
                    {posts.slice(0, 3).map((p, pi) => (
                      <span
                        key={pi}
                        className="size-1 rounded-full"
                        style={{
                          background:
                            c === today
                              ? "white"
                              : CALENDAR_CHANNEL_CONFIG[p.channel].color,
                        }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm">
        <p className="text-[10px] font-medium text-zinc-500">
          {selected ? `NGÀY ${selected}/8` : "CHỌN NGÀY"}
        </p>
        {selectedPosts.length === 0 ? (
          <p className="py-4 text-center text-[9px] text-zinc-400">
            Chưa có bài lên lịch
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {selectedPosts.map((p, i) => {
              const cfg = CALENDAR_CHANNEL_CONFIG[p.channel];
              return (
                <div
                  key={i}
                  className="flex items-start gap-1.5 rounded-md border border-zinc-100 p-1.5"
                >
                  <cfg.icon
                    className="mt-0.5 size-3 shrink-0"
                    style={{ color: cfg.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-medium text-zinc-800">
                      {p.title}
                    </p>
                    <p className="text-[8px] text-zinc-400">{p.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Đường line chart SVG với hiệu ứng vẽ dần + area fade. */
function AnimatedLineChart() {
  const ref = useRef<SVGSVGElement>(null);
  const W = 320,
    H = 130;
  const pts = "40,105 90,80 140,92 190,58 240,66 290,30";
  useGSAP(() => {
    if (!ref.current) return;
    const line = ref.current.querySelector<SVGPathElement>(".chart-line");
    const area = ref.current.querySelector(".chart-area");
    const dots = ref.current.querySelectorAll(".chart-dot");
    const len = line?.getTotalLength() ?? 300;
    gsap.fromTo(
      line,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" },
    );
    gsap.fromTo(
      area,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, delay: 0.7 },
    );
    gsap.fromTo(
      dots,
      { scale: 0, opacity: 0, transformOrigin: "center" },
      { scale: 1, opacity: 1, duration: 0.3, stagger: 0.08, delay: 1.0 },
    );
  }, []);
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="chartAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f05a28" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f05a28" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 45, 70, 95].map((y) => (
        <line
          key={y}
          x1="40"
          y1={y}
          x2="290"
          y2={y}
          stroke="#e4e4e7"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
      ))}
      <path
        className="chart-area"
        d={`${pts} L290 ${H} L40 ${H} Z`}
        fill="url(#chartAreaFill)"
      />
      <path
        className="chart-line"
        d={pts}
        fill="none"
        stroke="#f05a28"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.split(" ").map((p, i) => (
        <circle
          key={i}
          cx={+p.split(",")[0]}
          cy={+p.split(",")[1]}
          r="3"
          fill="#f05a28"
          className="chart-dot"
        />
      ))}
    </svg>
  );
}

function AnalyticsPage() {
  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            Phân tích hiệu suất
          </p>
          <p className="text-[11px] text-zinc-500">
            Tăng trưởng kênh & nội dung
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[9px] text-zinc-600 shadow-sm">
          <BarChart3 className="size-3" /> 6 tháng gần nhất
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: Eye,
            label: "Lượt xem",
            val: "486k",
            color: "text-brand-orange",
          },
          {
            icon: Users2,
            label: "Người theo dõi",
            val: "12.4k",
            color: "text-brand-orange",
          },
          {
            icon: MessageCircle,
            label: "Tương tác",
            val: "8.1k",
            color: "text-brand-orange",
          },
          {
            icon: Share2,
            label: "Chia sẻ",
            val: "2.9k",
            color: "text-brand-orange",
          },
        ].map((s) => (
          <div key={s.label} className={PAGE_CARD}>
            <s.icon className={`mb-1 size-3 ${s.color}`} />
            <p className="text-base font-bold text-zinc-900">{s.val}</p>
            <p className="text-[9px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3">
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[10px] font-medium text-zinc-500">
            LƯỢT XEM THEO NGÀY
          </p>
          <div className="min-h-24 flex-1">
            <AnimatedLineChart />
          </div>
        </div>
        <div className="flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-medium text-zinc-500">
            PHÂN BỔ KÊNH
          </p>
          <div className="flex flex-1 flex-col justify-center gap-2.5 px-1">
            {[
              { name: "Instagram", pct: 35, color: "bg-brand-orange" },
              { name: "TikTok", pct: 30, color: "bg-orange-400" },
              { name: "Facebook", pct: 22, color: "bg-amber-500" },
              { name: "LinkedIn", pct: 13, color: "bg-orange-300" },
            ].map((k) => (
              <div key={k.name}>
                <div className="mb-1 flex justify-between text-[9px]">
                  <span className="text-zinc-500">{k.name}</span>
                  <span className="text-zinc-500">{k.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                  <PieGrowBar pct={k.pct} color={k.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PieGrowBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { width: 0 },
      { width: `${pct}%`, duration: 0.7, ease: "power2.out" },
    );
  }, []);
  return (
    <div
      ref={ref}
      className={`h-full rounded-full ${color}`}
      style={{ width: 0 }}
    />
  );
}

const AI_GEN_TABS = [
  { key: "text", label: "Viết bài" },
  { key: "image", label: "Sinh ảnh" },
  { key: "video", label: "Video" },
] as const;
type AiGenTab = (typeof AI_GEN_TABS)[number]["key"];

const AI_MOCK_IMAGE_GALLERY = [
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80",
];

const AI_MOCK_VIDEO_GALLERY = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1533167649158-6d508895b680?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80",
];

const AI_MOCK_TEXT_RESULT = `🌟 BẢO BỐI MÙA HÈ — HƯƠNG THƠM LÔI CUỐN KHÔNG THỂ CHỐI TỪ 🌟

Mùa hè gõ cửa mang theo cái nắng oi ả, nhưng đừng để nhiệt độ làm phai nhạt sự tự tin của bạn! Hãy để dòng nước hoa thế hệ mới đồng hành cùng bạn suốt cả ngày dài.

✨ Điểm nổi bật:
1. Lưu hương đến 12 tiếng nhờ công nghệ vi nang tự nhiên.
2. Hương cam Bergamot Nam Phi kết hợp hoa huệ trắng tinh khôi.
3. Thiết kế chai thủy tinh sang trọng, dễ mang theo.

👉 Inbox ngay để nhận ưu đãi GIẢM 20% + FREESHIP hôm nay!
#Perfume #SummerVibes #BrandHub`;

const AI_TEMPLATES = [
  "Nước hoa nam, tông gỗ, sang trọng, studio",
  "Kem chống nắng, nền biển, tươi mát",
  "Giày chạy bộ, đầy năng lượng, motion",
  "Banner livestream, gradient cam",
];

const AI_PROMPT_HISTORY = [
  { title: "Ảnh sản phẩm kem chống nắng — nền biển", time: "12 phút trước" },
  { title: "Video giới thiệu giày Nike Air Max", time: "1 giờ trước" },
  { title: "Caption case study BrandHub", time: "Hôm qua" },
  { title: "Story Instagram quán cà phê — tông ấm", time: "Hôm qua" },
  { title: "Tiêu đề blog SEO: 'Cách tăng reach 2026'", time: "2 ngày trước" },
  { title: "Banner livestream T8 — nền gradient cam", time: "3 ngày trước" },
  { title: "Email khuyến mãi 20% khách hàng thân thiết", time: "1 tuần trước" },
];

function AIStudioPage() {
  const [tab, setTab] = useState<AiGenTab>("image");
  const [prompt, setPrompt] = useState(
    "Ảnh sản phẩm nước hoa cầm bởi người mẫu trên bãi biển, ánh nắng hè, phong cách photorealistic",
  );
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setDone(false);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 1800);
  };

  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
            <Sparkles className="text-brand-orange size-3.5" /> AI Studio
          </p>
          <p className="text-[11px] text-zinc-500">
            Sinh nội dung tự động bằng AI
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-zinc-400">AI Credits còn lại</p>
          <p className="text-brand-orange text-[11px] font-semibold">
            1,250 / 2,000
          </p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
        {AI_GEN_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setDone(false);
            }}
            className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            {AI_TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPrompt(t)}
                className="hover:border-brand-orange/40 hover:text-brand-orange rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[8px] text-zinc-500 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="focus:border-brand-orange/50 h-20 flex-none resize-none rounded-lg border border-zinc-200 bg-white p-2 text-[10px] text-zinc-700 outline-none"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-brand-orange flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-semibold text-white transition-transform active:scale-95 disabled:opacity-70"
          >
            {generating ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Đang sinh nội dung
                AI...
              </>
            ) : (
              <>
                <Wand2 className="size-3" /> Sinh{" "}
                {tab === "image" ? "ảnh" : tab === "video" ? "video" : "bài"} AI
              </>
            )}
          </button>

          <div className={PAGE_CARD + " flex-1"}>
            <p className="mb-2 flex items-center gap-1 text-[9px] font-medium text-zinc-500">
              <ImageIcon className="size-3" /> KẾT QUẢ AI
            </p>
            {!done ? (
              <p className="py-6 text-center text-[9px] text-zinc-400">
                Chưa có kết quả — nhấn Sinh AI để bắt đầu
              </p>
            ) : tab === "text" ? (
              <div className="ghost-comment-in rounded-md border border-zinc-100 bg-zinc-50 p-2.5">
                <p className="text-[9px] leading-relaxed whitespace-pre-line text-zinc-700">
                  {AI_MOCK_TEXT_RESULT}
                </p>
              </div>
            ) : tab === "video" ? (
              <div className="ghost-comment-in grid grid-cols-2 gap-1.5">
                {AI_MOCK_VIDEO_GALLERY.map((url, i) => (
                  <div
                    key={i}
                    className={`relative aspect-video overflow-hidden rounded-md ${i === 0 ? "ring-brand-orange ring-2" : ""}`}
                  >
                    <img
                      src={url}
                      alt="AI generated video thumbnail"
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <div className="flex size-6 items-center justify-center rounded-full bg-white/90">
                        <Play className="ml-0.5 size-3 fill-zinc-900 text-zinc-900" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ghost-comment-in grid grid-cols-3 gap-1.5">
                {AI_MOCK_IMAGE_GALLERY.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="AI generated"
                    loading="lazy"
                    className={`aspect-square rounded-md object-cover ${i === 0 ? "ring-brand-orange ring-2" : ""}`}
                  />
                ))}
              </div>
            )}
            {done && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="hover:border-brand-orange/40 hover:text-brand-orange mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-200 py-1.5 text-[10px] font-medium text-zinc-600 transition-colors disabled:opacity-70"
              >
                <RefreshCw className="size-3" /> Tạo biến thể khác
              </button>
            )}
          </div>
        </div>

        <div>
          <div className={PAGE_CARD}>
            <p className="mb-2 text-[9px] font-medium text-zinc-500">
              LỊCH SỬ GẦN ĐÂY
            </p>
            <div className="flex flex-col gap-2">
              {AI_PROMPT_HISTORY.map((h, i) => (
                <div
                  key={i}
                  className="border-b border-zinc-100 pb-1.5 last:border-0"
                >
                  <p className="line-clamp-2 text-[9px] font-medium text-zinc-700">
                    {h.title}
                  </p>
                  <p className="text-[8px] text-zinc-400">{h.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PUBLISH_CHANNELS = [
  {
    key: "instagram",
    icon: InstagramGlyph,
    label: "Instagram",
    color: "#f05a28",
    scheduled: "Hôm nay 09:00",
  },
  {
    key: "tiktok",
    icon: TikTokGlyph,
    label: "TikTok",
    color: "#ff6b35",
    scheduled: "Hôm nay 12:00",
  },
  {
    key: "facebook",
    icon: FacebookGlyph,
    label: "Facebook",
    color: "#ea4a1c",
    scheduled: "Mai 15:00",
  },
  {
    key: "linkedin",
    icon: LinkedInGlyph,
    label: "LinkedIn",
    color: "#f0783a",
    scheduled: "T4 tuần sau",
  },
] as const;

const PUBLISH_QUEUE = [
  {
    title: "Launch Heineken mới — Hè 2026",
    channel: "instagram" as CalChannel,
  },
  { title: "Review Nike Air Max — trend hè", channel: "tiktok" as CalChannel },
  { title: "Case study BrandHub x VCorp", channel: "linkedin" as CalChannel },
  { title: "Banner khuyến mãi T8 giảm 30%", channel: "facebook" as CalChannel },
  {
    title: "Reel: 3 mẹo tăng reach hữu cơ",
    channel: "instagram" as CalChannel,
  },
  { title: "Livestream Q&A với founder", channel: "facebook" as CalChannel },
];

type WsStatus = "active" | "review" | "paused";

interface Workspace {
  id: number;
  name: string;
  client: string;
  color: string;
  members: number;
  docs: number;
  lastActive: string;
  status: WsStatus;
  starred: boolean;
  tags: string[];
}

const WORKSPACES: Workspace[] = [
  {
    id: 1,
    name: "VCorp Media",
    client: "Nguyễn Văn Minh",
    color: "#f05a28",
    members: 5,
    docs: 142,
    lastActive: "2 giờ trước",
    status: "active",
    starred: true,
    tags: ["Social", "Blog"],
  },
  {
    id: 2,
    name: "TechStart Vietnam",
    client: "Lê Thị Hoa",
    color: "#ff6b35",
    members: 3,
    docs: 78,
    lastActive: "5 giờ trước",
    status: "active",
    starred: false,
    tags: ["Tech", "SaaS"],
  },
  {
    id: 3,
    name: "Fashion Brand X",
    client: "Trần Minh Đức",
    color: "#ea4a1c",
    members: 4,
    docs: 95,
    lastActive: "Hôm qua",
    status: "active",
    starred: true,
    tags: ["Fashion", "E-comm"],
  },
  {
    id: 4,
    name: "Green Energy Co.",
    client: "Phạm Thu Hằng",
    color: "#f0783a",
    members: 2,
    docs: 34,
    lastActive: "3 ngày trước",
    status: "review",
    starred: false,
    tags: ["Energy", "B2B"],
  },
  {
    id: 5,
    name: "EduLearn Platform",
    client: "Hoàng Thị Mai",
    color: "#e85d20",
    members: 6,
    docs: 201,
    lastActive: "1 tuần trước",
    status: "paused",
    starred: false,
    tags: ["EdTech"],
  },
  {
    id: 6,
    name: "F&B Chain Hà Nội",
    client: "Vũ Quang Hùng",
    color: "#ff7a3d",
    members: 2,
    docs: 22,
    lastActive: "2 tuần trước",
    status: "active",
    starred: false,
    tags: ["F&B", "Local"],
  },
];

const WS_STATUS: Record<
  WsStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  active: {
    label: "Đang hoạt động",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  review: {
    label: "Đang duyệt",
    dot: "bg-brand-orange",
    bg: "bg-brand-orange/10",
    text: "text-brand-orange",
  },
  paused: {
    label: "Tạm dừng",
    dot: "bg-zinc-300",
    bg: "bg-zinc-100",
    text: "text-zinc-500",
  },
};

const WORKSPACE_MEMBERS = [
  { name: "Minh Nguyễn", role: "Content Director", online: true },
  { name: "Thu Hà", role: "Account Manager", online: true },
  { name: "Quang", role: "Creator", online: true },
  { name: "Linh", role: "Designer", online: false },
  { name: "Đức", role: "Creator", online: false },
  { name: "Trang", role: "Editor", online: false },
];

interface BoardCard {
  title: string;
  channel: CalChannel;
  assignee: string;
}

const WORKSPACE_BOARD: Record<
  "todo" | "doing" | "review" | "done",
  BoardCard[]
> = {
  todo: [
    { title: "Caption Reel trend hè", channel: "tiktok", assignee: "Quang" },
    { title: "Story quà tặng T8", channel: "instagram", assignee: "Linh" },
  ],
  doing: [
    { title: "Banner khuyến mãi T8", channel: "facebook", assignee: "Đức" },
    {
      title: "Case study khách hàng",
      channel: "linkedin",
      assignee: "Minh Nguyễn",
    },
  ],
  review: [
    { title: "Launch mùa hè 2026", channel: "instagram", assignee: "Trang" },
  ],
  done: [
    {
      title: "Email marketing tháng 7",
      channel: "linkedin",
      assignee: "Thu Hà",
    },
    { title: "Reel giới thiệu sản phẩm", channel: "tiktok", assignee: "Quang" },
  ],
};

const WORKSPACE_BOARD_COLS = [
  { key: "todo", label: "To Do", dot: "bg-zinc-400" },
  { key: "doing", label: "Đang làm", dot: "bg-blue-400" },
  { key: "review", label: "Review", dot: "bg-amber-400" },
  { key: "done", label: "Xong", dot: "bg-emerald-400" },
] as const;

/** AI-generated portrait avatar, seeded by name so it stays stable across renders. */
function avatarUrl(name: string, size = 64) {
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(name)}`;
}

interface TimelineItem {
  title: string;
  channel: CalChannel;
  assignee: string;
  startWeek: number;
  weeks: number;
  progress: number;
}

const WORKSPACE_TIMELINE: TimelineItem[] = [
  {
    title: "Launch mùa hè 2026",
    channel: "instagram",
    assignee: "Trang",
    startWeek: 0,
    weeks: 3,
    progress: 100,
  },
  {
    title: "Case study khách hàng",
    channel: "linkedin",
    assignee: "Minh Nguyễn",
    startWeek: 1,
    weeks: 4,
    progress: 60,
  },
  {
    title: "Banner khuyến mãi T8",
    channel: "facebook",
    assignee: "Đức",
    startWeek: 2,
    weeks: 2,
    progress: 80,
  },
  {
    title: "Reel trend TikTok",
    channel: "tiktok",
    assignee: "Quang",
    startWeek: 3,
    weeks: 3,
    progress: 30,
  },
  {
    title: "Email marketing tháng 7",
    channel: "linkedin",
    assignee: "Thu Hà",
    startWeek: 4,
    weeks: 2,
    progress: 100,
  },
  {
    title: "Story quà tặng T8",
    channel: "instagram",
    assignee: "Linh",
    startWeek: 5,
    weeks: 2,
    progress: 10,
  },
];
const TIMELINE_WEEKS = 8;

const WORKSPACE_ACTIVITY = [
  {
    actor: "Minh Nguyễn",
    action: "đã duyệt bài “Launch mùa hè 2026”",
    time: "2 phút trước",
  },
  {
    actor: "Thu Hà",
    action: "đã kéo “Banner khuyến mãi T8” sang Đang làm",
    time: "18 phút trước",
  },
  {
    actor: "Quang",
    action: "đã tải lên 3 ảnh sản phẩm mới",
    time: "45 phút trước",
  },
  {
    actor: "Linh",
    action: "đã bình luận trong “Story quà tặng T8”",
    time: "1 giờ trước",
  },
  {
    actor: "Đức",
    action: "đã tạo thẻ “Case study khách hàng”",
    time: "3 giờ trước",
  },
  { actor: "Trang", action: "đã xuất bản lên Instagram", time: "Hôm qua" },
] as const;

const WORKSPACE_CONTENT = [
  {
    title: "Launch mùa hè 2026",
    channel: "instagram" as CalChannel,
    status: "Đã đăng",
  },
  {
    title: "Reel trend TikTok",
    channel: "tiktok" as CalChannel,
    status: "Chờ duyệt",
  },
  {
    title: "Case study khách hàng",
    channel: "linkedin" as CalChannel,
    status: "Bản nháp",
  },
  {
    title: "Banner khuyến mãi T8",
    channel: "facebook" as CalChannel,
    status: "Đã đăng",
  },
  {
    title: "Story quà tặng",
    channel: "instagram" as CalChannel,
    status: "Chờ duyệt",
  },
  {
    title: "Email marketing",
    channel: "linkedin" as CalChannel,
    status: "Bản nháp",
  },
];

function WorkspacePage({ device }: { device: "macbook" | "iphone" }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "starred" | "active">("all");
  const [list, setList] = useState<Workspace[]>(WORKSPACES);
  const [selected, setSelected] = useState<number | null>(null);

  const toggleStar = (id: number) =>
    setList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w)),
    );

  const create = () =>
    setList((prev) => [
      {
        id: Date.now(),
        name: "Dự án mới",
        client: "Khách hàng mới",
        color: "#f05a28",
        members: 1,
        docs: 0,
        lastActive: "vừa tạo",
        status: "active",
        starred: false,
        tags: ["Mới"],
      },
      ...prev,
    ]);

  const filtered = list.filter((w) => {
    const m =
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.client.toLowerCase().includes(query.toLowerCase());
    if (!m) return false;
    if (filter === "starred") return w.starred;
    if (filter === "active") return w.status === "active";
    return true;
  });

  const filters = [
    { key: "all", label: "Tất cả", icon: FolderOpen },
    { key: "starred", label: "Đánh dấu", icon: Star },
    { key: "active", label: "Đang hoạt động", icon: Clock },
  ] as const;

  const selectedWs =
    selected != null ? list.find((w) => w.id === selected) : undefined;
  if (selectedWs) {
    return <WorkspaceDetail ws={selectedWs} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Workspace</p>
          <p className="text-[11px] text-zinc-500">
            {list.length} workspaces ·{" "}
            {list.filter((w) => w.status === "active").length} đang hoạt động
          </p>
        </div>
        <button
          type="button"
          onClick={create}
          className="bg-brand-orange flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white transition-transform active:scale-95"
        >
          <Plus className="size-3" /> Tạo
        </button>
      </div>

      <div className="focus-within:border-brand-orange/50 focus-within:ring-brand-orange/30 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors focus-within:ring-1">
        <Search className="size-3 shrink-0 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm workspace hoặc khách hàng..."
          className="w-full bg-transparent text-[10px] text-zinc-700 outline-none placeholder:text-zinc-500"
        />
      </div>

      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
              filter === f.key
                ? "border-brand-orange/40 bg-brand-orange/10 text-brand-orange"
                : "hover:border-brand-orange/40 hover:text-brand-orange border-zinc-200 bg-white text-zinc-500"
            }`}
          >
            <f.icon className="size-2.5" /> {f.label}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-2 ${
          device === "iphone" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {filtered.map((w) => {
          const s = WS_STATUS[w.status];
          return (
            <div
              key={w.id}
              onClick={() => setSelected(w.id)}
              className="hover:border-brand-orange/40 cursor-pointer overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-colors"
            >
              <div className="h-1 w-full" style={{ background: w.color }} />
              <div className="flex items-start justify-between p-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex size-7 items-center justify-center rounded-md"
                    style={{ background: w.color + "20" }}
                  >
                    <span
                      style={{ color: w.color }}
                      className="text-[11px] font-bold"
                    >
                      {w.name.charAt(0)}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] font-semibold text-zinc-900">
                      {w.name}
                    </p>
                    <p className="text-[9px] text-zinc-500">{w.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(w.id);
                    }}
                  >
                    <Star
                      className={`size-3 transition-colors ${
                        w.starred
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-300 hover:text-amber-400"
                      }`}
                    />
                  </button>
                  <MoreHorizontal className="size-3 text-zinc-400" />
                </div>
              </div>
              <div className="px-2 pb-2">
                <div className="mb-2 flex flex-wrap gap-1">
                  {w.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-[8px] font-medium text-zinc-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[9px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users2 className="size-2.5" /> {w.members}
                    </span>
                    <span className="flex items-center gap-1">
                      <Files className="size-2.5" /> {w.docs}
                    </span>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium ${s.bg} ${s.text}`}
                  >
                    <span className={`size-1 rounded-full ${s.dot}`} />{" "}
                    {s.label}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[9px] text-zinc-400">
                  <Clock className="size-2.5" /> Hoạt động {w.lastActive}
                </p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-[10px] text-zinc-400">
            Không tìm thấy workspace
          </p>
        )}
      </div>
    </div>
  );
}

function WorkspaceDetail({
  ws,
  onBack,
}: {
  ws: Workspace;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<
    "board" | "timeline" | "docs" | "members" | "activity"
  >("board");
  const members = WORKSPACE_MEMBERS.slice(
    0,
    Math.min(ws.members, WORKSPACE_MEMBERS.length),
  );
  const onlineCount = members.filter((m) => m.online).length;
  const offset = (ws.id * 2) % WORKSPACE_CONTENT.length;
  const content = [
    ...WORKSPACE_CONTENT.slice(offset),
    ...WORKSPACE_CONTENT.slice(0, offset),
  ].slice(0, 4);

  const tabs = [
    { key: "board", label: "Board", icon: LayoutGrid },
    { key: "timeline", label: "Timeline", icon: CalendarRange },
    { key: "docs", label: "Docs", icon: Files },
    { key: "members", label: "Members", icon: Users2 },
    { key: "activity", label: "Activity", icon: MessageCircle },
  ] as const;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-zinc-200 bg-white p-3">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-brand-orange flex w-fit items-center gap-1 text-[10px] font-medium text-zinc-500 transition-colors"
        >
          <ArrowLeft className="size-3" /> Tất cả workspace
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-md"
              style={{ background: ws.color + "20" }}
            >
              <span style={{ color: ws.color }} className="text-xs font-bold">
                {ws.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-zinc-900">
                {ws.name}
              </p>
              <p className="text-[9px] text-zinc-500">
                Không gian chung · {ws.members} thành viên
              </p>
            </div>
          </div>

          {/* Avatar stack — ai đang online trong shared space này */}
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {members.map((m) => (
                <div key={m.name} title={m.name} className="relative">
                  <img
                    src={avatarUrl(m.name, 48)}
                    alt={m.name}
                    loading="lazy"
                    className="size-6 rounded-full border-2 border-white object-cover"
                  />
                  {m.online && (
                    <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-white bg-emerald-400" />
                  )}
                </div>
              ))}
            </div>
            <span className="flex items-center gap-1 text-[8px] font-medium text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {onlineCount} online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[9px] font-medium transition-colors ${
                tab === t.key
                  ? "bg-brand-orange text-white"
                  : "text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              <t.icon className="size-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-3">
        {tab === "board" && (
          <div className="grid grid-cols-2 gap-2">
            {WORKSPACE_BOARD_COLS.map((col) => (
              <div
                key={col.key}
                className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/60 p-2"
              >
                <span className="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-700">
                  <span className={`size-1.5 rounded-full ${col.dot}`} />
                  {col.label}
                  <span className="ml-auto rounded-full bg-white px-1.5 text-[8px] font-medium text-zinc-500 shadow-sm">
                    {WORKSPACE_BOARD[col.key].length}
                  </span>
                </span>
                {WORKSPACE_BOARD[col.key].map((card) => {
                  const cfg = CALENDAR_CHANNEL_CONFIG[card.channel];
                  return (
                    <div
                      key={card.title}
                      className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-sm"
                    >
                      <p className="line-clamp-2 text-[9px] leading-tight font-medium text-zinc-800">
                        {card.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <cfg.icon
                          className="size-3"
                          style={{ color: cfg.color }}
                        />
                        <img
                          src={avatarUrl(card.assignee, 32)}
                          alt={card.assignee}
                          title={card.assignee}
                          loading="lazy"
                          className="size-4 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {tab === "timeline" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 pl-[35%] text-[8px] text-zinc-400">
              {Array.from({ length: TIMELINE_WEEKS }, (_, i) => (
                <span key={i} className="flex-1 text-center">
                  T{i + 1}
                </span>
              ))}
            </div>
            {WORKSPACE_TIMELINE.map((item) => {
              const cfg = CALENDAR_CHANNEL_CONFIG[item.channel];
              return (
                <div key={item.title} className="flex items-center gap-2">
                  <div className="flex w-[35%] items-center gap-1.5">
                    <cfg.icon
                      className="size-3 shrink-0"
                      style={{ color: cfg.color }}
                    />
                    <p className="min-w-0 truncate text-[9px] text-zinc-700">
                      {item.title}
                    </p>
                  </div>
                  <div className="relative h-4 flex-1">
                    <div
                      className="absolute inset-y-0 flex items-center overflow-hidden rounded-full"
                      style={{
                        left: `${(item.startWeek / TIMELINE_WEEKS) * 100}%`,
                        width: `${(item.weeks / TIMELINE_WEEKS) * 100}%`,
                        background: cfg.color + "25",
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.progress}%`,
                          background: cfg.color,
                        }}
                      />
                    </div>
                  </div>
                  <img
                    src={avatarUrl(item.assignee, 32)}
                    alt={item.assignee}
                    title={item.assignee}
                    loading="lazy"
                    className="size-4 shrink-0 rounded-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}

        {tab === "docs" && (
          <div className="flex flex-col gap-1.5">
            {content.map((c) => {
              const cfg = CALENDAR_CHANNEL_CONFIG[c.channel];
              return (
                <div
                  key={c.title}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm"
                >
                  <cfg.icon
                    className="size-3 shrink-0"
                    style={{ color: cfg.color }}
                  />
                  <p className="min-w-0 flex-1 truncate text-[10px] text-zinc-700">
                    {c.title}
                  </p>
                  <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[8px] text-zinc-500">
                    {c.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "members" && (
          <div className="flex flex-col gap-1.5">
            {members.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm"
              >
                <div className="relative">
                  <img
                    src={avatarUrl(m.name, 56)}
                    alt={m.name}
                    loading="lazy"
                    className="size-7 rounded-full object-cover"
                  />
                  {m.online && (
                    <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-white bg-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-zinc-800">
                    {m.name}
                  </p>
                  <p className="text-[8px] text-zinc-400">{m.role}</p>
                </div>
                <span
                  className={`text-[8px] font-medium ${m.online ? "text-emerald-600" : "text-zinc-400"}`}
                >
                  {m.online ? "Online" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="flex flex-col gap-3">
            {WORKSPACE_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <img
                  src={avatarUrl(a.actor, 48)}
                  alt={a.actor}
                  loading="lazy"
                  className="mt-0.5 size-6 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] leading-snug text-zinc-700">
                    <span className="font-semibold text-zinc-900">
                      {a.actor}
                    </span>{" "}
                    {a.action}
                  </p>
                  <p className="text-[8px] text-zinc-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PublishPage() {
  const [pushing, setPushing] = useState(false);
  const [pushedCount, setPushedCount] = useState(0);

  const handlePushAll = () => {
    setPushing(true);
    setPushedCount(0);
    PUBLISH_CHANNELS.forEach((_, i) => {
      setTimeout(
        () => {
          setPushedCount((c) => c + 1);
          if (i === PUBLISH_CHANNELS.length - 1) setPushing(false);
        },
        500 * (i + 1),
      );
    });
  };

  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Xuất bản</p>
          <p className="text-[11px] text-zinc-500">
            Đẩy nội dung lên các kênh đã kết nối
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {PUBLISH_CHANNELS.map((ch, i) => {
          const pushed = pushedCount > i;
          return (
            <div
              key={ch.key}
              className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm"
            >
              <ch.icon
                className="size-4 shrink-0"
                style={{ color: ch.color }}
              />
              <span className="flex-1 text-[11px] font-medium text-zinc-800">
                {ch.label}
              </span>
              <span className="shrink-0 text-[8px] text-zinc-400">
                {ch.scheduled}
              </span>
              {pushing && !pushed ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin text-zinc-400" />
              ) : pushed ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <span className="shrink-0 text-[9px] text-zinc-400">
                  Sẵn sàng
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={PAGE_CARD}>
        <p className="mb-2 text-[10px] font-medium text-zinc-500">
          HÀNG CHỜ ĐẨY ({PUBLISH_QUEUE.length})
        </p>
        <div className="flex flex-col gap-1.5">
          {PUBLISH_QUEUE.map((q, i) => {
            const cfg = CALENDAR_CHANNEL_CONFIG[q.channel];
            return (
              <div key={i} className="flex items-center gap-2">
                <cfg.icon
                  className="size-3 shrink-0"
                  style={{ color: cfg.color }}
                />
                <p className="truncate text-[10px] font-medium text-zinc-800">
                  {q.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handlePushAll}
        disabled={pushing}
        className="bg-brand-orange mt-auto flex items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-semibold text-white transition-transform active:scale-95 disabled:opacity-70"
      >
        {pushing ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Đang đẩy bài...
          </>
        ) : (
          <>
            <Upload className="size-3.5" /> Đẩy lên tất cả kênh
          </>
        )}
      </button>
    </div>
  );
}

interface ApprovalItem {
  id: number;
  title: string;
  channel: CalChannel;
  submittedBy: string;
  thumbnail: string;
}

const APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: 1,
    title: "Review sản phẩm mới — bộ sưu tập Thu 2026",
    channel: "instagram",
    submittedBy: "Content Creator",
    thumbnail:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Video giới thiệu tính năng AI Studio",
    channel: "tiktok",
    submittedBy: "Content Creator",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop",
  },
];

/** Trang demo khách hàng (Brand Client) xem trước và phê duyệt bài đã
 * qua vòng duyệt của Account Manager, khớp bước "Phê duyệt" trong quy
 * trình swimlane trên landing page. */
function ApprovalPage() {
  const [queue, setQueue] = useState(APPROVAL_QUEUE);
  const [feedback, setFeedback] = useState<number | null>(null);

  const resolve = (id: number) =>
    setTimeout(() => setQueue((prev) => prev.filter((q) => q.id !== id)), 400);

  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      <div>
        <p className="text-sm font-semibold text-zinc-900">Phê duyệt</p>
        <p className="text-[11px] text-zinc-500">
          Xem trước và phê duyệt bài trước khi xuất bản
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <CheckCircle2 className="size-8 text-emerald-500" />
          <p className="text-xs font-medium text-zinc-700">
            Đã duyệt hết bài chờ
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {queue.map((item) => {
            const cfg = CALENDAR_CHANNEL_CONFIG[item.channel];
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2.5 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="size-11 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-zinc-800">
                      {item.title}
                    </p>
                    <p className="flex items-center gap-1 text-[9px] text-zinc-400">
                      <cfg.icon
                        className="size-2.5"
                        style={{ color: cfg.color }}
                      />
                      {item.submittedBy}
                    </p>
                  </div>
                </div>

                {feedback === item.id ? (
                  <div className="ghost-comment-in flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 text-[9px] text-zinc-600">
                    <MessageCircle className="size-3 shrink-0 text-zinc-400" />
                    Đã gửi góp ý cho Account Manager
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => resolve(item.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-500 py-1.5 text-[10px] font-semibold text-white transition-transform active:scale-95"
                    >
                      <ThumbsUp className="size-3.5" /> Phê duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedback(item.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white py-1.5 text-[10px] font-semibold text-zinc-700 transition-transform active:scale-95"
                    >
                      <XIcon className="size-3.5" /> Góp ý
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Icon mạng xã hội — glyph SVG inline (lucide-react bản hiện tại đã
   bỏ các icon brand Facebook/Instagram/Linkedin). ─────────────────── */

function InstagramGlyph({
  className = "size-4",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TikTokGlyph({
  className = "size-4",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M16.5 2h-3.2v13.4a3 3 0 1 1-2.2-2.9V9.2a6.2 6.2 0 1 0 5.4 6.1V8.6a7.7 7.7 0 0 0 4.5 1.4V6.8a4.4 4.4 0 0 1-4.5-4.4V2z" />
    </svg>
  );
}

function FacebookGlyph({
  className = "size-4",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.57 14.2 3.57c-2.4 0-4 1.47-4 4.16v2.16H7.5V13H10.2v8h3.3z" />
    </svg>
  );
}

function LinkedInGlyph({
  className = "size-4",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92zM20.5 20h-3.37v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V20H9.55V8.5h3.24v1.57h.05c.45-.85 1.55-1.75 3.2-1.75 3.43 0 4.06 2.25 4.06 5.18V20z" />
    </svg>
  );
}

/* ── Icon app Apple — glyph SVG inline, squircle tile size-5 (20px) ─── */

function FaceGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <path
        d="M14 26c0-9 5.4-15 12-15s12 6 12 15v4c0 9-5.4 15-12 15s-12-6-12-15z"
        fill="#fff"
      />
      <path d="M26 11c-6.6 0-12 6-12 15v4c0 9 5.4 15 12 15z" fill="#dff2ff" />
      <circle cx="20" cy="25" r="2.1" fill="#0a7be0" />
      <circle cx="32" cy="25" r="2.1" fill="#0a7be0" />
      <path
        d="M19.5 31c2 1.9 4.3 2.9 6.5 2.9s4.5-1 6.5-2.9"
        stroke="#0a7be0"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LaunchpadGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <g fill="#d7dee8">
        {[16, 26, 36].map((y) =>
          [16, 26, 36].map((x) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
          )),
        )}
      </g>
    </svg>
  );
}

function SafariGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <circle cx="26" cy="26" r="23.5" fill="#fff" />
      <circle
        cx="26"
        cy="26"
        r="23.5"
        fill="none"
        stroke="#dfe4ea"
        strokeWidth="1.5"
      />
      <g stroke="#c4ccd6" strokeWidth="2.2" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1="26"
            y1="4"
            x2="26"
            y2={a % 90 === 0 ? 10 : 8}
            transform={`rotate(${a} 26 26)`}
          />
        ))}
      </g>
      <defs>
        <linearGradient id="safN" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5f4d" />
          <stop offset="100%" stopColor="#8a2be2" />
        </linearGradient>
      </defs>
      <polygon points="26,5 31.5,26 26,47.5 20.5,26" fill="url(#safN)" />
      <circle cx="26" cy="26" r="2.4" fill="#fff" />
    </svg>
  );
}

function MessagesGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <path
        d="M26 7c11 0 20 7.6 20 18s-9 18-20 18c-2.1 0-4.2-.3-6.1-1L9 46l3.6-7C10 35.6 6 31 6 25 6 14.6 15 7 26 7z"
        fill="#fff"
      />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <rect x="6" y="13" width="40" height="28" rx="4" fill="#f3f8ff" />
      <path
        d="M8 15l18 13.5L44 15"
        stroke="#1475e8"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapsGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <path d="M12 9h28l-4 7H15l-3 4z" fill="#dbe4ee" transform="skewY(-6)" />
      <g fill="#f6c886">
        <path d="M10 24h32l-3 6H13z" opacity="0.85" />
        <path d="M16 34h20l-2 6H18z" opacity="0.7" />
      </g>
      <line x1="18" y1="15" x2="18" y2="47" stroke="#fff" strokeWidth="2.4" />
      <line x1="34" y1="16" x2="33" y2="47" stroke="#fff" strokeWidth="2.4" />
      <circle cx="20" cy="28" r="2.4" fill="#fff" />
      <circle cx="32" cy="38" r="2.4" fill="#fff" />
      <g>
        <path
          d="M26 18c-4 0-7 3.2-7 7 0 4.6 5.6 11.2 6.4 12.1a.8.8 0 0 0 1.2 0C27.4 36.2 33 29.6 33 25c0-3.8-3-7-7-7z"
          fill="#ff3b30"
          stroke="#fff"
          strokeWidth="1.6"
        />
        <circle cx="26" cy="25" r="2.2" fill="#fff" />
      </g>
    </svg>
  );
}

function PhotosGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <g>
        <ellipse cx="26" cy="11" rx="6.5" ry="4.3" fill="#57c4ff" />
        <ellipse cx="26" cy="41" rx="6.5" ry="4.3" fill="#ff5c5c" />
        <ellipse cx="11" cy="26" rx="4.3" ry="6.5" fill="#7ed957" />
        <ellipse cx="41" cy="26" rx="4.3" ry="6.5" fill="#ffd84d" />
        <ellipse
          cx="17.7"
          cy="17.7"
          rx="5.4"
          ry="5.4"
          fill="#ff8a3d"
          transform="rotate(45 17.7 17.7)"
        />
        <ellipse
          cx="34.3"
          cy="34.3"
          rx="5.4"
          ry="5.4"
          fill="#a86bff"
          transform="rotate(45 34.3 34.3)"
        />
        <ellipse
          cx="34.3"
          cy="17.7"
          rx="5.4"
          ry="5.4"
          fill="#ff8ecf"
          transform="rotate(-45 34.3 17.7)"
        />
        <ellipse
          cx="17.7"
          cy="34.3"
          rx="5.4"
          ry="5.4"
          fill="#4eddcf"
          transform="rotate(-45 17.7 34.3)"
        />
        <circle cx="26" cy="26" r="5.5" fill="#fff" />
      </g>
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <rect x="6" y="10" width="40" height="36" rx="6" fill="#f2f4f7" />
      <path
        d="M6 28h40v12c0 4.5-2.5 6-6 6H12c-3.5 0-6-1.5-6-6z"
        fill="#e6e9ee"
      />
      <path d="M6 15h40v15H6z" fill="#ff3b30" />
      <circle cx="25" cy="34" r="7.5" fill="#fff" />
      <path
        d="M25 28.5l1 3 3 .3-2.2 2 .6 3-2.4-1.5-2.4 1.5.6-3-2.2-2 3-.3z"
        fill="#ffd84d"
      />
      <rect x="13" y="5" width="4" height="11" rx="2" fill="#c9cfd6" />
      <rect x="35" y="5" width="4" height="11" rx="2" fill="#c9cfd6" />
    </svg>
  );
}

function NotesGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <rect x="6" y="5" width="40" height="42" rx="5" fill="#fff" />
      <path d="M6 10a5 5 0 0 1 5-5h30a5 5 0 0 1 5 5v7H6z" fill="#ffcf5c" />
      <g stroke="#c9d3e0" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="28" x2="40" y2="28" />
        <line x1="12" y1="34" x2="40" y2="34" />
        <line x1="12" y1="40" x2="30" y2="40" />
      </g>
    </svg>
  );
}

function MusicGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <path
        d="M22 19v18.4a5.6 5.6 0 1 1-3-5V10l22-3v19.4a5.6 5.6 0 1 1-3-5V13L23 15v14.4z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadsGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="size-5">
      <defs>
        <linearGradient id="fold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#56c1fd" />
          <stop offset="100%" stopColor="#51a7f8" />
        </linearGradient>
      </defs>
      <path
        d="M8 24c0-3 1-4 4-4h12l6-6h26v0a4 2 0 0 1 4 2v26a6 6 0 0 1-6 6H12c-4 0-4-2-4-4z"
        fill="url(#fold)"
        stroke="#3f8ae0"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 52 52" className="size-4">
      <path
        d="M18 15h16l-1.4 28a5 5 0 0 1-5 4.4h-3.2a5 5 0 0 1-5-4.4z"
        fill="#eef2f6"
        stroke="#fff"
        strokeWidth="1.6"
      />
      <path
        d="M20 15l2-4h8l2 4"
        stroke="#eef2f6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M9 15h34"
        stroke="#eef2f6"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default CinematicHero;
