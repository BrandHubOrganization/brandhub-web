import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Mail, Link2 } from "lucide-react";

const TEAM = [
  { key: "member1", photoId: "photo-1500648767791-00dcc994a43e" },
  { key: "member2", photoId: "photo-1519085360753-af0119f7cbe7" },
  { key: "member3", photoId: "photo-1472099645785-5658abf4ff4e" },
  { key: "member4", photoId: "photo-1438761681033-6461ffad8d80" },
];

export function TeamSection() {
  const { t } = useTranslation();

  return (
    <section id="team" className="bg-zinc-50 py-24 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t("landing.team.title")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
            {t("landing.team.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <img
                src={`https://images.unsplash.com/${m.photoId}?w=160&h=160&fit=crop&crop=faces`}
                alt=""
                loading="lazy"
                className="mx-auto mb-4 size-20 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
              />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {t(`landing.team.members.${m.key}.name`)}
              </h3>
              <p className="text-brand-orange mt-1 text-xs font-semibold">
                {t(`landing.team.members.${m.key}.role`)}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                <Link2 className="size-3.5 text-zinc-400" />
                <Mail className="size-3.5 text-zinc-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
