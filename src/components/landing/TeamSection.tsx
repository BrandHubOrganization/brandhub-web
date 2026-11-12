import { Award, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SplitHeading } from "@/components/landing/MotionPrimitives";

interface TeamMember {
  id: string;
  name: string;
  roleBadge: string;
  avatar: string;
  experience: string;
  skills: string[];
  highlight: string;
  isLead?: boolean;
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
    highlight: "Chuyên gia Neo4j GraphRAG & AI Studio · SynapForge",
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
    skills: [
      "Engineering Leadership",
      "Agile & WBS",
      "System Arch & DDD",
      ".NET 8",
      "Product Strategy",
    ],
    isLead: true,
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
  const { ref: headRef, isIntersecting: headVisible } = useIntersectionObserver(
    { threshold: 0.15, freezeOnceVisible: true },
  );
  const { ref: cardsObserverRef, isIntersecting: gridVisible } =
    useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  return (
    <section
      id="team"
      className="relative overflow-hidden bg-zinc-50/70 py-24 dark:bg-zinc-900/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={cn(
            "mx-auto mb-14 max-w-3xl text-center transition-opacity duration-500 ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            headVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <Users className="size-3.5" />
            <span>ĐỘI NGŨ KỸ SƯ PHÁT TRIỂN NỀN TẢNG</span>
          </div>
          <SplitHeading
            text="Kỹ sư xây dựng"
            highlightText="BrandHub Platform"
          />
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Đội ngũ kỹ sư phát triển sản phẩm SynapForge kết hợp kinh nghiệm
            thực chiến từ các dự án phần mềm doanh nghiệp, giải thưởng công nghệ
            quốc gia và nghiên cứu khoa học AI chuyên sâu.
          </p>
        </div>

        {/* Real SynapForge Team Group Banner */}
        <div className="bh-stage-reveal mx-auto mb-14 max-w-5xl">
          <div className="group overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative aspect-[16/8] w-full overflow-hidden sm:aspect-[21/9]">
              <img
                src="/team/synapforge-team-trunglc-center.png"
                alt="Đội ngũ kỹ sư SynapForge phát triển nền tảng BrandHub"
                width={1400}
                height={600}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-zinc-200/80 bg-white px-6 py-4 text-zinc-900 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
              <div className="text-brand-orange flex shrink-0 items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="size-3.5" />
                <span>SYNAPFORGE ENGINEERING · PRODUCT R&amp;D</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                5 kỹ sư Full-Stack, AI GraphRAG &amp; Cloud DevOps đồng kiến tạo
                hệ sinh thái quản trị thương hiệu và xuất bản đa kênh tự động
                All-in-One.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Member Portrait Grid */}
        <div
          ref={cardsObserverRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {TEAM_MEMBERS.map((member, i) => (
            <div
              key={member.id}
              style={{
                transitionDelay: gridVisible ? `${i * 100}ms` : "0ms",
              }}
              className={cn(
                "team-card group flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md motion-reduce:opacity-100 motion-reduce:transition-none",
                member.isLead
                  ? "border-brand-orange/50 bg-white shadow-sm dark:border-brand-orange/45 dark:bg-zinc-900"
                  : "border-zinc-200/90 bg-white shadow-xs hover:border-brand-orange/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-orange/40",
                gridVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
              )}
            >
              <div>
                {/* Rectangular Portrait Frame */}
                <div
                  className={cn(
                    "relative mx-auto mb-4 aspect-[4/4.5] w-full overflow-hidden rounded-xl border bg-zinc-100 p-1 dark:bg-zinc-800/80",
                    member.isLead
                      ? "border-brand-orange/60"
                      : "border-zinc-200 dark:border-zinc-700",
                  )}
                >
                  <img
                    src={member.avatar}
                    alt={`${member.name} (${member.roleBadge})`}
                    width={400}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full rounded-lg object-cover object-top transition-transform duration-500 will-change-transform group-hover:scale-105"
                  />
                </div>

                <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                  {member.isLead ? "TECH LEAD · CORE" : "CORE ENGINEER"}
                </span>
                <h3 className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {member.name}
                </h3>
                <span className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
                  {member.roleBadge}
                </span>

                {/* Highlight Badge */}
                <div className="mt-3 flex items-start gap-1.5 rounded-2xl bg-zinc-50 p-2.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <Award className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  <span className="line-clamp-2 leading-tight">
                    {member.highlight}
                  </span>
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
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
