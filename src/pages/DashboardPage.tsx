import { useNavigate } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "@/components/landing/cinematic/CinematicHero";
import { LogoWall } from "@/components/landing/LogoWall";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Templates } from "@/components/landing/Templates";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useAuthStore } from "@/store/authStore";

export function DashboardPage() {

  const navigate = useNavigate();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // ── Authenticated: role-based redirect on mount ──
  if (isAuthenticated && user) {
    const role = user.role;
    if (role === "AGENCY_OWNER") {
      navigate("/workspace", { replace: true });
      return null;
    }
    if (role === "BRAND_CLIENT") {
      navigate("/portal", { replace: true });
      return null;
    }
    if (role === "ADMIN") {
      navigate("/admin", { replace: true });
      return null;
    }

    return (
      <PageWrapper
        title="Dashboard"
        description="Tổng quan hoạt động và nội dung cần phê duyệt."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => navigate("/change-password")}
            >
              Đổi mật khẩu
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
            <Button
              variant="default"
              className="cursor-pointer bg-[#f05a28] text-xs text-white hover:bg-[#f05a28]/90"
            >
              Tạo Nội Dung Mới
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-border bg-card space-y-4 rounded-lg border p-6 md:col-span-2">
            <h2 className="text-lg font-bold">
              Chào mừng trở lại, {user.name || "User"}!
            </h2>
            <p className="text-muted-foreground text-sm">
              Hôm nay bạn có một vài công việc cần lưu ý trong chiến dịch
              Heineken Campaign và Nike Vietnam.
            </p>
            <div className="border-border text-muted-foreground bg-muted/20 flex h-48 items-center justify-center rounded border border-dashed text-xs">
              [Biểu đồ thống kê hiệu quả chiến dịch]
            </div>
          </div>

          <div className="border-border bg-card space-y-4 rounded-lg border p-6">
            <h2 className="text-lg font-bold">Nhiệm vụ cần làm</h2>
            <div className="space-y-3">
              {[
                "Phê duyệt bài viết Kem chống nắng (AM)",
                "Lên lịch đăng bài Nike Air Max (Creator)",
                "Kiểm tra báo cáo tháng 7 (Owner)",
              ].map((task, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-foreground/90">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Unauthenticated: Full Landing Page ──
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <CinematicHero />
      <LogoWall />
      <Features />
      <StatsCounter />
      <HowItWorks />
      <Templates />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

export default DashboardPage;
