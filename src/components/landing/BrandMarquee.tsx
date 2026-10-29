import { useTranslation } from "react-i18next";
import { Sparkle } from "lucide-react";

const ITEMS_COUNT = 6;

/** Dải chữ chạy ngang giữa Hero và các section tiếp theo — tham khảo nhịp
 * điệu editorial (marquee ticker) từ giaimamanhai.vercel.app, tái dùng
 * animation @keyframes logo-marquee đã có sẵn trong globals.css. */
export function BrandMarquee() {
  const { t } = useTranslation();
  const label = t("landing.marquee.label");

  return (
    <div className="bg-brand-orange overflow-hidden py-3">
      <div className="animate-logo-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {Array.from({ length: ITEMS_COUNT * 2 }).map((_, i) => (
          <span
            key={i}
            className="flex items-center gap-8 text-sm font-bold tracking-wide text-white uppercase select-none sm:text-base"
          >
            {label}
            <Sparkle className="size-4 shrink-0 fill-white" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default BrandMarquee;
