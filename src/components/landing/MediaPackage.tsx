import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  Package,
  MessagesSquare,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

// Không có page demo tương ứng trong CinematicHero (media package/hợp
// đồng dịch vụ là quy trình B2B chưa được build vào MacBook demo), nên
// section này chỉ giới thiệu bằng nội dung tĩnh, không click-to-demo.
interface MediaPackagePoint {
  key: string;
  icon: LucideIcon;
}

const POINTS: MediaPackagePoint[] = [
  { key: "templates", icon: Package },
  { key: "negotiate", icon: MessagesSquare },
  { key: "approve", icon: FileCheck2 },
];

export function MediaPackage() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section
      id="media-package"
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <SectionEyebrow index={6} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.mediaPackage.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.mediaPackage.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {POINTS.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "group flex flex-col items-start rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8 transition-all hover:border-orange-200 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-orange-800/30",
              )}
            >
              <div className="bg-brand-orange/10 text-brand-orange mb-5 flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Icon className="size-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {t(`landing.mediaPackage.items.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t(`landing.mediaPackage.items.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MediaPackage;
