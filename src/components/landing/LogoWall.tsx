import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

const LOGOS = [
  "Heineken",
  "Nike",
  "Vinamilk",
  "Marriott",
  "Grab",
  "Shopee",
  "Tiki",
  "Vietcombank",
  "Momo",
  "VNG",
  "AIA",
  "FPT",
];

export function LogoWall() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-zinc-100 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-sm font-medium tracking-widest text-zinc-400 uppercase"
        >
          {t("landing.trustedBy")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          <div className="animate-logo-marquee flex w-max items-center gap-x-14">
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="shrink-0 text-lg font-bold text-zinc-300 transition-colors select-none hover:text-zinc-400 dark:text-zinc-600 dark:hover:text-zinc-500"
              >
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default LogoWall;
