import { Navbar } from "@/components/landing/Navbar";
import { CinematicHero } from "@/components/landing/cinematic/CinematicHero";
import { LogoWall } from "@/components/landing/LogoWall";
import { Features } from "@/components/landing/Features";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Templates } from "@/components/landing/Templates";
import { Testimonials } from "@/components/landing/Testimonials";
import { TeamSection } from "@/components/landing/TeamSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <Navbar />
      <CinematicHero />
      <LogoWall />
      <Features />
      <StatsCounter />
      <HowItWorks />
      <Templates />
      <Testimonials />
      <TeamSection />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;
