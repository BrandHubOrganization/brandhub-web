import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BackToTop } from "@/components/landing/BackToTop";
import { PageFallback } from "./PageFallback";

/**
 * Shared chrome for all public guest content routes (/blog, /blog/:slug,
 * /help/faq, /privacy, /terms), reusing the exact Navbar, Footer, and
 * BackToTop components from the landing experience so navigation stays unified.
 */
export function PublicHelpLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background font-sans text-foreground selection:bg-brand-orange/20 selection:text-foreground">
      <Navbar />
      <main className="w-full flex-1 pt-16">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default PublicHelpLayout;
