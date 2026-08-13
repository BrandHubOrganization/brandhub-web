import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingDemoStore } from "@/store/landingDemoStore";

const TEMPLATES = [
  {
    key: "social",
    photo:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&h=400&fit=crop",
  },
  {
    key: "blog",
    photo:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop",
  },
  {
    key: "email",
    photo:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop",
  },
];

// Cả 3 loại template đều quản lý trong trang Nội dung (Kanban) của demo,
// bấm card nào cũng đưa về đúng chỗ người dùng thật sẽ thao tác.
const TEMPLATE_PAGE_INDEX = 1;

export function Templates() {
  const { t } = useTranslation();
  const goToPage = useLandingDemoStore((s) => s.goToPage);

  return (
    <section id="templates" className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.templates.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.templates.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEMPLATES.map(({ key, photo }, i) => (
            <motion.div
              key={key}
              role="button"
              tabIndex={0}
              aria-label={t("landing.templates.demoAction", {
                template: t(`landing.templates.items.${key}.title`),
              })}
              onClick={() => goToPage(TEMPLATE_PAGE_INDEX)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToPage(TEMPLATE_PAGE_INDEX);
                }
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={cn(
                "group focus-visible:ring-brand-orange relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-900",
              )}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={photo}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/0 to-black/0" />
                <span className="text-brand-orange absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  <MousePointerClick className="size-3" />
                  {t("landing.templates.useLabel")}
                </span>
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t(`landing.templates.items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t(`landing.templates.items.${key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Templates;
