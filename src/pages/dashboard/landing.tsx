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
