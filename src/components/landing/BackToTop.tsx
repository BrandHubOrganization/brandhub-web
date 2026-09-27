import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Nút back-to-top nổi góc dưới phải — trang landing dài 13 section, logo
 * Navbar cũng scroll-to-top nhưng ẩn/khó nhận ra là nút đó. Chỉ hiện sau
 * khi cuộn qua 1.5 viewport để tránh chồng lên CinematicHero.
 */
export function BackToTop() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("landing.backToTop")}
      title={t("landing.backToTop")}
      className={cn(
        "bg-brand-orange hover:bg-brand-orange/90 fixed right-6 bottom-6 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full text-white shadow-lg shadow-orange-500/30 transition-all duration-300",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}

export default BackToTop;
