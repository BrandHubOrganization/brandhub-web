import { useRef, useState, useEffect } from "react";
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
  Apple,
  Wifi,
  BatteryFull,
} from "lucide-react";
import { InstagramPost } from "./posts/InstagramPost";
import { TikTokPost } from "./posts/TikTokPost";
import { FacebookPost } from "./posts/FacebookPost";
import { LinkedInPost } from "./posts/LinkedInPost";
import { MiniPosts } from "./MiniPosts";

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
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
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

    // Lock the timeline forward-only once it reaches the end: scrub
    // naturally reverses the timeline when the user scrolls back up
    // within the pinned 3500px range, which is what let the big post
    // cards (and the mini-posts under them) rewind and reappear. This
    // clamps progress at 1 so further scroll inside the pin range can't
    // play it backwards — WITHOUT touching the ScrollTrigger's pin state.
    // (An earlier attempt called scrollTrigger.disable()/kill() here to
    // "freeze" the section — that stops the pin from tracking scroll
    // position at all, so scrolling further inside the still-3500px-tall
    // spacer left the section pinned at a stale spot and the whole hero,
    // mini-posts included, visually jumped to the wrong place in the
    // page. Leaving the ScrollTrigger alone and only clamping progress
    // keeps the pin correctly synced with real scroll position.)
    let locked = false;
    tl.eventCallback("onComplete", () => {
      locked = true;
      // Idle motion: each corner card drifts up/down gently forever, out
      // of phase with the others so the 4 corners don't bob in lockstep
      // (which would read as fake/mechanical rather than "alive").
      const idleTargets = [
        { sel: ".mini-post-ig", delay: 0 },
        { sel: ".mini-post-tt", delay: 0.4 },
        { sel: ".mini-post-fb", delay: 0.8 },
        { sel: ".mini-post-li", delay: 1.2 },
      ];
      idleTargets.forEach(({ sel, delay }) => {
        gsap.to(sel, {
          y: "+=6",
          duration: 2.2 + Math.random() * 0.6,
          delay,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
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
      className="relative h-screen w-full overflow-hidden bg-zinc-950"
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Stage chính: dashboard MacBook + posts bay + mini-posts 4 góc */}
        <div className="relative flex-1">
          {/* Layer 0: BrandHub Dashboard background */}
          <BrandHubDashboardBg />

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

          {/* Layer 2: Mini posts 4 góc */}
          <div className="mini-posts pointer-events-none absolute inset-0 z-20 opacity-0">
            <MiniPosts />
          </div>
        </div>

        {/* Vùng dành riêng cho CTA — tách khỏi dashboard nên không đè lên laptop */}
        <div className="relative z-30 flex flex-col items-center gap-2.5 px-6 pb-5">
          <div className="cta-overlay pointer-events-none opacity-0">
            <CTAButtons />
          </div>
          {/* Scroll hint */}
          <div className="scroll-hint flex flex-col items-center gap-1 text-white/25">
            <span className="text-[10px] tracking-[0.2em] uppercase">
              Cuộn xuống
            </span>
            <div className="h-8 w-px animate-pulse bg-linear-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandHubDashboardBg() {
  const [page, setPage] = useState(0);
  const [sideNav, setSideNav] = useState<number | null>(0);
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
  const pages = [
    <OverviewPage key="overview" />,
    <ContentPage key="content" />,
    <SchedulePage key="schedule" />,
    <AnalyticsPage key="analytics" />,
  ];
  const tabLabels = ["Tổng quan", "Nội dung", "Lịch", "Analytics"];

  // Tự động chuyển tab mỗi 4s như một người thật đang duyệt app.
  useEffect(() => {
    const id = setInterval(() => {
      setPage((p) => (p + 1) % pages.length);
    }, 4200);
    return () => clearInterval(id);
  }, [pages.length]);

  return (
    <div className="brandhub-bg absolute inset-0 z-0 flex items-center justify-center opacity-0">
      <div className="w-full max-w-5xl px-4">
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
                      <div className="flex items-center gap-1.5">
                        <div className="size-5 rounded-full bg-linear-to-br from-orange-400 to-orange-600" />
                        <Bell className="size-3 text-zinc-500" />
                      </div>
                    </div>
                  </div>

                  {/* Thanh tab — nhiều trang mở, tab active được đánh dấu */}
                  <div className="flex items-end gap-1 border-b border-zinc-200 bg-zinc-50/60 px-3 pt-2">
                    {tabLabels.map((label, i) => {
                      const active = i === page;
                      return (
                        <button
                          key={label}
                          onClick={() => setPage(i)}
                          className={`flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                            active
                              ? "border-zinc-200 bg-white text-zinc-900"
                              : "border-transparent text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${active ? "bg-brand-orange" : "bg-zinc-300"}`}
                          />
                          <span>{label}</span>
                          <span className="ml-0.5 text-zinc-300">×</span>
                        </button>
                      );
                    })}
                    <button className="mb-1.5 ml-0.5 flex size-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-700">
                      <Plus className="size-3" />
                    </button>
                    {/* Tab duỗi chiếm khoảng trống còn lại */}
                    <div className="mb-1.5 h-6 flex-1 rounded-t-lg border border-b-0 border-transparent" />
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
                      {[
                        { icon: LayoutGrid, label: "Tổng quan", pageIndex: 0 },
                        { icon: FileText, label: "Nội dung", pageIndex: 1 },
                        { icon: CalendarDays, label: "Lịch", pageIndex: 2 },
                        { icon: LineChart, label: "Analytics", pageIndex: 3 },
                        { icon: Upload, label: "Xuất bản", pageIndex: null },
                      ].map((item) => {
                        const activeNav = sideNav === item.pageIndex;
                        return (
                          <div
                            key={item.label}
                            onClick={() =>
                              item.pageIndex !== null &&
                              setSideNav(item.pageIndex)
                            }
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
                    <div className="relative min-h-[340px] flex-1 overflow-hidden">
                      <div key={page} className="page-enter absolute inset-0">
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
    </div>
  );
}

function CTAButtons() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <a
        href="/register"
        className="bg-brand-orange hover:bg-brand-orange/90 inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/40"
      >
        <Rocket className="size-4" />
        Bắt đầu miễn phí
      </a>
      <a
        href="/login"
        className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/10"
      >
        Đăng nhập
      </a>
    </div>
  );
}

/* ── Safari window nội dung: 4 trang dashboard ────────────────────── */

const PAGE_CARD = "rounded-lg border border-zinc-200 bg-white p-3 shadow-sm";

function OverviewPage() {
  const stats = [
    { label: "Tổng bài", val: "1,284", icon: Files, color: "text-blue-400" },
    { label: "Đã đăng", val: "986", icon: Upload, color: "text-emerald-400" },
    { label: "Chờ duyệt", val: "24", icon: Clock, color: "text-amber-400" },
    { label: "Lỗi", val: "3", icon: AlertCircle, color: "text-red-400" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            Chào buổi sáng, Team!
          </p>
          <p className="text-[11px] text-zinc-500">
            Hôm nay có 12 nội dung cần publish
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
          <TrendingUp className="size-3" />
          +18% tuần này
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={PAGE_CARD}>
            <div className="mb-1 flex items-center justify-between">
              <s.icon className={`size-3 ${s.color}`} />
              <span className={`text-[9px] ${s.color}`}>●</span>
            </div>
            <p className="text-lg font-bold text-zinc-900">{s.val}</p>
            <p className="text-[10px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-3 gap-3">
        <div className="col-span-2 flex flex-col rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
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
            { name: "Instagram", pct: 82, color: "bg-pink-500" },
            { name: "TikTok", pct: 71, color: "bg-cyan-500" },
            { name: "Facebook", pct: 64, color: "bg-blue-500" },
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

function ContentPage() {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const posts = [
    {
      ch: "Instagram",
      color: "bg-pink-500",
      title: "Launch Heineken mới",
      time: "Hôm nay 09:00",
      status: "Đã đăng",
      sc: "text-emerald-400",
    },
    {
      ch: "TikTok",
      color: "bg-cyan-500",
      title: "Review Nike — trend",
      time: "Hôm nay 12:00",
      status: "Đã đăng",
      sc: "text-emerald-400",
    },
    {
      ch: "Facebook",
      color: "bg-blue-500",
      title: "Banner khuyến mãi T7",
      time: "Mai 15:00",
      status: "Chờ duyệt",
      sc: "text-amber-400",
    },
    {
      ch: "LinkedIn",
      color: "bg-sky-500",
      title: "Case study BrandHub",
      time: "T4 tuần sau",
      status: "Bản nháp",
      sc: "text-zinc-400",
    },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-4">
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
          placeholder="Tìm kiếm nội dung..."
          className="w-full bg-transparent text-[10px] text-zinc-700 outline-none placeholder:text-zinc-500"
        />
      </div>
      <div
        className={`flex flex-1 flex-col gap-1.5 overflow-hidden ${
          creating ? "blur-[1px]" : ""
        }`}
      >
        {posts
          .filter((p) =>
            p.title.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .map((p) => (
            <div
              key={p.title}
              className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${p.color} text-[8px] font-bold text-white`}
              >
                {p.ch[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-zinc-900">
                  {p.title}
                </p>
                <p className="text-[9px] text-zinc-500">{p.time}</p>
              </div>
              <span className={`text-[9px] font-medium ${p.sc}`}>
                {p.status}
              </span>
            </div>
          ))}
      </div>
      {creating && (
        <p className="ghost-comment-in border-brand-orange/30 bg-brand-orange/10 text-brand-orange rounded-md border px-2 py-1 text-center text-[9px] font-medium">
          Đang mở trình soạn bài mới...
        </p>
      )}
    </div>
  );
}

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
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="flex h-full flex-col gap-3 p-4">
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
        {cells.map((c, i) => (
          <button
            key={i}
            type="button"
            disabled={!c}
            onClick={() => c && setSelected(c)}
            aria-pressed={selected === c}
            className={`flex items-center justify-center rounded-md text-[10px] transition-all outline-none ${
              c === today
                ? "bg-brand-orange font-bold text-white"
                : selected === c
                  ? "bg-brand-orange/15 text-brand-orange ring-brand-orange/40 font-semibold ring-1"
                  : c
                    ? "hover:border-brand-orange/40 hover:text-brand-orange border border-zinc-200 bg-white text-zinc-600 shadow-sm"
                    : ""
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-medium text-zinc-500">
          DÒNG THỜI GIAN HÔM NAY
        </p>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-600">
            09
          </span>
          <span className="text-[10px] text-zinc-700">Đăng bài Heineken</span>
          <span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] text-emerald-600">
            Xong
          </span>
        </div>
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
    <div className="flex h-full flex-col gap-3 p-4">
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
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Eye, label: "Lượt xem", val: "486k", color: "text-blue-400" },
          {
            icon: Users2,
            label: "Người theo dõi",
            val: "12.4k",
            color: "text-emerald-400",
          },
          {
            icon: MessageCircle,
            label: "Tương tác",
            val: "8.1k",
            color: "text-pink-400",
          },
          {
            icon: Share2,
            label: "Chia sẻ",
            val: "2.9k",
            color: "text-amber-400",
          },
        ].map((s) => (
          <div key={s.label} className={PAGE_CARD}>
            <s.icon className={`mb-1 size-3 ${s.color}`} />
            <p className="text-base font-bold text-zinc-900">{s.val}</p>
            <p className="text-[9px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3">
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
              { name: "Instagram", pct: 35, color: "bg-pink-500" },
              { name: "TikTok", pct: 30, color: "bg-cyan-500" },
              { name: "Facebook", pct: 22, color: "bg-blue-500" },
              { name: "LinkedIn", pct: 13, color: "bg-sky-500" },
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
