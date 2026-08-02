import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-zinc-900 py-24 dark:bg-black">
      <div className="bg-brand-orange/20 absolute -top-32 -left-32 size-96 rounded-full blur-[120px]" />
      <div className="absolute -right-32 -bottom-32 size-96 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold text-white sm:text-4xl"
        >
          {t("landing.cta.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-base text-zinc-400"
        >
          {t("landing.cta.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => navigate("/register")}
            className="bg-brand-orange hover:bg-brand-orange/90 inline-flex cursor-pointer items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all"
          >
            {t("landing.cta.start")}
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-8 py-3.5 text-sm font-medium text-zinc-300 backdrop-blur transition-all hover:bg-zinc-800"
          >
            {t("landing.cta.login")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
