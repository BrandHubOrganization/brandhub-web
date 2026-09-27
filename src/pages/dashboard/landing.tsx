import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/landing/Navbar";
import { CinematicHero } from "@/components/landing/cinematic/CinematicHero";
import { LogoWall } from "@/components/landing/LogoWall";
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
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <Navbar />
      <CinematicHero />
      <LogoWall />
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
