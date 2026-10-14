import { motion, useReducedMotion } from "motion/react";
import { Cpu } from "lucide-react";

import { TechPartnerLogo } from "@/components/landing/TechPartnerLogos";

interface TechPartner {
  name: string;
  category: string;
}

const TECH_PARTNERS: TechPartner[] = [
  { name: "Meta Graph API", category: "Social Publisher" },
  { name: "TikTok Developers", category: "Video Distribution" },
  { name: "Spring Cloud Gateway", category: "API Gateway" },
  { name: "PostgreSQL 17", category: "Relational DB" },
  { name: "MongoDB Atlas", category: "Document Store" },
  { name: "Redis 7.2", category: "Cache & Rate Limiting" },
  { name: "Neo4j GraphRAG", category: "Knowledge Graph" },
  { name: "ChromaDB", category: "Vector Store" },
  { name: "RabbitMQ", category: "Message Broker" },
  { name: "Docker", category: "Containerization" },
  { name: "Cloudflare", category: "Edge & Turnstile" },
  { name: "FPT University", category: "Incubation & Capstone" },
];

export function LogoWall() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-zinc-100 bg-white py-14 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-center gap-2 text-center text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500"
        >
          <Cpu className="size-3.5 text-brand-orange" />
          <span>HỆ SINH THÁI CÔNG NGHỆ & NỀN TẢNG TÍCH HỢP CHÍNH THỨC</span>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          <div
            className={
              reduce
                ? "flex w-max items-center gap-x-10"
                : "animate-logo-marquee hover:paused flex w-max items-center gap-x-10"
            }
          >
            {[...TECH_PARTNERS, ...TECH_PARTNERS].map((tech, i) => (
              <div
                key={`${tech.name}-${i}`}
                className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-2 transition-all select-none hover:border-brand-orange/40 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-brand-orange/40 dark:hover:bg-zinc-900"
              >
                <TechPartnerLogo name={tech.name} />
                <span className="text-sm font-bold text-zinc-700 transition-colors group-hover:text-brand-orange dark:text-zinc-300">
                  {tech.name}
                </span>
                <span className="rounded bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {tech.category}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default LogoWall;
