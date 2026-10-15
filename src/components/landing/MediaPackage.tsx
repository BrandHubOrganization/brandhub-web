import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  Package,
  MessagesSquare,
  Rocket,
  CopyCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

import { MediaPackageVectorArt } from "@/components/landing/MediaPackageVectorArt";

interface MediaPackagePoint {
  key: string;
  icon: LucideIcon;
  step: string;
}

const POINTS: MediaPackagePoint[] = [
  { key: "templates", icon: Package, step: "01" },
  { key: "negotiate", icon: MessagesSquare, step: "02" },
  { key: "convert", icon: Rocket, step: "03" },
  { key: "replicate", icon: CopyCheck, step: "04" },
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ key, icon: Icon, step }, i) => (
            <motion.div
              key={key}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "group relative flex flex-col items-start rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 transition-all hover:border-orange-200 hover:bg-white hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-orange-800/30",
              )}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className="bg-brand-orange/10 text-brand-orange flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                  <Icon className="size-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                    STEP {step}
                  </span>
                  <div className="w-16 h-10 text-zinc-400 opacity-80 transition-transform group-hover:scale-105 group-hover:opacity-100">
                    <MediaPackageVectorArt type={key} />
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
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
