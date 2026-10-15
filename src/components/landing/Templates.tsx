import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { MousePointerClick } from "lucide-react";
import { useLandingDemoStore } from "@/store/landingDemoStore";
import { SectionDecor } from "@/components/landing/SectionDecor";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";

const TEMPLATES = [
  {
    key: "social",
    badge: "Social Viral",
    stat: "+40% Độ tiếp cận",
    platforms: ["TikTok", "Instagram", "Facebook"],
    sampleTags: ["#ViralTikTok", "#BrandHub", "#OOTDVN"],
    photo:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&h=400&fit=crop",
  },
  {
    key: "blog",
    badge: "B2B & Thought Leadership",
    stat: "3.2x Tương tác",
    platforms: ["LinkedIn", "Facebook", "Web"],
    sampleTags: ["#ContentStrategy", "#MarTech", "#Growth"],
    photo:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop",
  },
  {
    key: "email",
    badge: "Media Package & Nurture",
    stat: "32% Tỷ lệ mở",
    platforms: ["Email", "CRM", "Proposal"],
    sampleTags: ["#MediaPackage", "#ClientSignoff", "#Agency"],
    photo:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop",
  },
];

// Cả 3 loại template đều quản lý trong trang Nội dung (Kanban) của demo,
// bấm card nào cũng đưa về đúng chỗ người dùng thật sẽ thao tác.
const TEMPLATE_PAGE_INDEX = 1;

export function Templates() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const goToPage = useLandingDemoStore((s) => s.goToPage);

  return (
    <section
      id="templates"
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
          <SectionEyebrow index={5} />
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.templates.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.templates.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEMPLATES.map((item, i) => (
            <SpotlightCard
              key={item.key}
              aria-label={t("landing.templates.demoAction", {
                template: t(`landing.templates.items.${item.key}.title`),
              })}
              onActivate={() => goToPage(TEMPLATE_PAGE_INDEX)}
              className="group items-stretch border-zinc-100 p-0 hover:shadow-xl dark:border-zinc-800"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.photo}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-black/60 text-white backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <span className="bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {item.stat}
                  </span>
                </div>

                <span className="text-brand-orange absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  <MousePointerClick className="size-3" />
                  {t("landing.templates.useLabel")}
                </span>
              </div>

              <div className="p-6">
                {/* Platform Tags */}
                <div className="mb-2.5 flex items-center gap-1.5">
                  {item.platforms.map((p) => (
                    <span
                      key={p}
                      className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 rounded px-1.5 py-0.5 text-[10px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t(`landing.templates.items.${item.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t(`landing.templates.items.${item.key}.desc`)}
                </p>

                {/* Hashtag Preview */}
                <div className="mt-4 flex flex-wrap gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  {item.sampleTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-brand-orange font-mono text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Templates;
