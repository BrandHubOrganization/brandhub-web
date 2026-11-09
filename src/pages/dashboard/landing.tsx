import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/landing/Navbar";
import { CinematicHero } from "@/components/landing/cinematic/CinematicHero";
import { BrandMarquee } from "@/components/landing/BrandMarquee";
import { LogoWall } from "@/components/landing/LogoWall";
import { IndustryInsights } from "@/components/landing/IndustryInsights";
import { Features } from "@/components/landing/Features";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { AgencyWorkspace } from "@/components/landing/AgencyWorkspace";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Templates } from "@/components/landing/Templates";
import { MediaPackage } from "@/components/landing/MediaPackage";
import { Testimonials } from "@/components/landing/Testimonials";
import { TeamSection } from "@/components/landing/TeamSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { BackToTop } from "@/components/landing/BackToTop";
import { SeoHead } from "@/components/seo/SeoHead";

const LANDING_FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://brandhub.id.vn/#faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "Có thể dùng thử BrandHub miễn phí không?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Có! Gói Starter miễn phí cho phép tạo 1 Không gian làm việc, tối đa 5 thành viên, kết nối các kênh mạng xã hội cơ bản và trải nghiệm đầy đủ quy trình lên lịch, soạn thảo bài viết.",
      },
    },
    {
      "@type": "Question",
      name: "BrandHub hỗ trợ liên kết những nền tảng mạng xã hội nào?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BrandHub tích hợp chính thức 4 nền tảng mạng xã hội: Facebook, Instagram, TikTok và Threads. Các bài đăng được lên lịch tự động và phân bổ qua microservice Publisher độc lập.",
      },
    },
    {
      "@type": "Question",
      name: "Tính năng AI Trend Crawler & Brand Guidelines hoạt động thế nào?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BrandHub kết hợp mô hình GraphRAG (Neo4j kết hợp ChromaDB vector search) cùng bộ cào dữ liệu xu hướng thị trường. AI tổng hợp các xu hướng đang thịnh hành, đối chiếu nghiêm ngặt với Brand Guidelines (tone of voice, từ cấm, định dạng) và tự động kiểm duyệt an toàn nội dung cộng đồng trước khi đề xuất.",
      },
    },
    {
      "@type": "Question",
      name: "Quy trình cộng tác & phê duyệt giữa Agency và Khách hàng (Client) diễn ra thế nào?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hệ thống xây dựng cơ chế phân quyền chuẩn theo 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin): Đội ngũ Agency (Owner, Manager, Creator) sáng tạo và quản trị chiến dịch; Khách hàng (Client) được cấp không gian riêng biệt để duyệt từng bài đăng và phản hồi trực tiếp trên từng phiên bản bản nháp.",
      },
    },
    {
      "@type": "Question",
      name: "Dữ liệu và Access Token mạng xã hội được bảo vệ như thế nào?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hệ thống bảo vệ theo tiêu chuẩn kiến trúc Microservices phân tán với Spring Cloud Gateway xác thực tập trung. Toàn bộ OAuth Access Token của mạng xã hội được mã hóa AES-256 trong cơ sở dữ liệu và dữ liệu từng Workspace được cô lập hoàn toàn.",
      },
    },
  ],
};

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Hero's pinned scroll spacer (end:"+=3500") finalizes its height only
  // after mount, which shifts every ScrollTrigger below it (the 4 sections
  // still using real GSAP scroll-scrub for parallax: Templates,
  // MediaPackage, TeamSection, Testimonials) out of sync with their
  // intended trigger position until one refresh runs after that settles.
  // Entrance reveals no longer use ScrollTrigger (IntersectionObserver
  // instead, see useIntersectionObserver) so they don't need this.
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(id);
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <SeoHead
        title="BrandHub — Nền tảng Quản trị Thương hiệu & Nội dung Đa kênh AI"
        description="Nền tảng quản trị Agency, lập kế hoạch Media Campaign, sáng tạo với AI GraphRAG, duyệt bài đa cấp và đăng tự động Facebook, Instagram, TikTok, Threads."
        canonicalPath="/"
        jsonLd={LANDING_FAQ_JSONLD}
      />
      <Navbar />
      <CinematicHero />
      <BrandMarquee />
      <LogoWall />
      <IndustryInsights />
      <Features />
      <AIFeatures />
      <AgencyWorkspace />
      <StatsCounter />
      <HowItWorks />
      <Templates />
      <MediaPackage />
      <Testimonials />
      <TeamSection />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
      <BackToTop />
    </div>
  );
}

export default LandingPage;
