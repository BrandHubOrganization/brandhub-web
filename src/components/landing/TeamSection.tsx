import { motion, useReducedMotion } from "motion/react";
import { Award, Users } from "lucide-react";
import { SectionDecor } from "@/components/landing/SectionDecor";

interface TeamMember {
  id: string;
  name: string;
  roleBadge: string;
  avatar: string;
  experience: string;
  skills: string[];
  highlight: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ha-van-an",
    name: "Hà Văn Ân",
    roleBadge: "Full-Stack & AI Solutions",
    avatar: "/team/anhv-white-polo.png",
    highlight: "Đồng tác giả nghiên cứu AI ICTA 2026 (73.3% pass rate)",
    experience:
      "7 tháng thực tập Full-stack tại FPT Software. Lead Dev STEMGO.net (34 mini-games giáo dục, Gemini AI Tutor). Chuyên sâu tích hợp AI RAG và modern web.",
    skills: ["Next.js 16", "RAG Pipelines", "Gemini API", "FastAPI", "Node.js"],
  },
  {
    id: "nguyen-thanh-loc",
    name: "Nguyễn Thành Lộc",
    roleBadge: "Backend Architect & Data Solutions",
    avatar: "/team/Locnt-white-polo.png",
    highlight: "GPA xuất sắc 3.5/4.0 FPTU · AI Lead BrandHub",
    experience:
      "AI Team Lead nền tảng BrandHub (FastAPI, GraphRAG Neo4j & ChromaDB). Team Lead UniNest (.NET 8). Backend .NET Intern FPT Software (chuyển đổi Clean Architecture).",
    skills: [".NET 8", "Neo4j GraphRAG", "ChromaDB", "Clean Arch", "FastAPI"],
  },
  {
    id: "le-tri-trung",
    name: "Lê Trí Trung",
    roleBadge: "Founder, Tech Lead & Engineering Manager",
    avatar: "/team/trunglc-white-polo-glasses.png",
    highlight: "Quán quân Hackathon CV 2026 · Founder SynapForge",
    experience:
      "Founder & Tech Lead điều hành đội ngũ 5 kỹ sư SynapForge. Quản trị sản phẩm & phân rã WBS/Agile. Từng dẫn dắt 6 dev tại The MC Hub và solo architect sàn BienSoVip (61 bảng CSDL, lọc <8ms).",
    skills: ["Engineering Leadership", "Agile & WBS", "System Arch & DDD", ".NET 8", "Product Strategy"],
  },
  {
    id: "nguyen-chon-phuoc",
    name: "Nguyễn Chơn Phước",
    roleBadge: "Cloud DevOps & Infrastructure",
    avatar: "/team/phuocnc-white-polo.png",
    highlight: "Chung kết toàn quốc InnoCodeCamp FPT 2024",
    experience:
      "Acronic Solutions Intern (vận hành thiết bị Anti-DDoS 24/7 qua Socket.IO và IPC). Backend Danatour (Java Spring Boot & PostgreSQL Tuning). Phụ trách CI/CD và hạ tầng đám mây.",
    skills: ["Java 21", "Spring Boot 3", "Docker", "Nginx", "Linux Ops"],
  },
  {
    id: "nguyen-minh-tuan",
    name: "Nguyễn Minh Tuấn",
    roleBadge: "Enterprise .NET Developer",
    avatar: "/team/tuannm-white-polo.png",
    highlight: "Chứng chỉ quốc tế Microsoft Back-End Developer Pro",
    experience:
      "Team Leader VivuCar (kết nối API Dịch vụ công Bộ Công An, kiểm duyệt Hive AI). Fullstack .NET Intern FPT Software (tối ưu hóa Stored Procedures nghìn dòng).",
    skills: [".NET 8", "SQL Server", "Gov APIs", "Hive AI", "Entity Framework"],
  },
];

export function TeamSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="team"
      className="relative overflow-hidden bg-zinc-50/70 py-24 dark:bg-zinc-900/40"
    >
      <SectionDecor corner="right" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-4 py-1.5 text-xs font-semibold text-brand-orange">
            <Users className="size-3.5" />
            <span>ĐỘI NGŨ PHÁT TRIỂN DỰ ÁN CAPSTONE SEP490</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Kỹ sư xây dựng <span className="text-brand-orange">BrandHub Platform</span>
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Đội ngũ sinh viên Kỹ thuật phần mềm Đại học FPT Đà Nẵng (SynapForge) kết hợp kinh nghiệm thực chiến từ FPT Software, các giải thưởng công nghệ quốc gia và nghiên cứu khoa học AI.
          </p>
        </motion.div>

        {/* 5-Member Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.id}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-orange/40"
            >
              <div>
                {/* Photo & Identity */}
                <div className="relative mx-auto mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-800/80">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                    FPTU
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {member.name}
                </h3>
                <span className="mt-1.5 inline-block rounded-md border border-brand-orange/20 bg-brand-orange/10 px-2 py-0.5 text-[11px] font-bold text-brand-orange">
                  {member.roleBadge}
                </span>

                {/* Highlight Badge */}
                <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-zinc-50 p-2 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <Award className="size-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <span className="line-clamp-2 leading-tight">{member.highlight}</span>
                </div>

                {/* Experience Paragraph */}
                <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {member.experience}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
