import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    key: "minh",
    name: "Minh Nguyễn",
    role: "Content Director, VCorp Media",
    stars: 5,
  },
  {
    key: "sarah",
    name: "Sarah Chen",
    role: "Marketing Lead, Global Brands",
    stars: 5,
  },
  { key: "tuan", name: "Tuấn Lê", role: "Agency Owner, CreativeHub", stars: 5 },
];

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className="bg-zinc-50 py-24 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.testimonials.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.testimonials.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((tm, i) => (
            <motion.div
              key={tm.key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Quote className="absolute top-6 right-6 size-8 text-zinc-100 dark:text-zinc-800" />
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: tm.stars }).map((_, s) => (
                  <Star
                    key={s}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                &ldquo;{t(`landing.testimonials.items.${tm.key}.quote`)}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="bg-brand-orange/10 text-brand-orange flex size-10 items-center justify-center rounded-full text-sm font-bold">
                  {tm.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {tm.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tm.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
