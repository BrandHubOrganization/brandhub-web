import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [tab, setTab] = React.useState<"login" | "signup">("login");
  const [showPw, setShowPw] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetRole: UserRole;
    let targetPath: string;

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === "owner@brandhub.vn") {
      targetRole = "AGENCY_OWNER";
      targetPath = "/workspace";
    } else if (normalizedEmail === "am@brandhub.vn") {
      targetRole = "ACCOUNT_MANAGER";
      targetPath = "/";
    } else if (normalizedEmail === "client@brandhub.vn") {
      targetRole = "BRAND_CLIENT";
      targetPath = "/portal";
    } else if (normalizedEmail === "creator@brandhub.vn") {
      targetRole = "CONTENT_CREATOR";
      targetPath = "/";
    } else if (normalizedEmail === "admin@brandhub.vn") {
      targetRole = "ADMIN";
      targetPath = "/admin";
    } else {
      targetRole = "CONTENT_CREATOR";
      targetPath = "/";
    }

    setAuth(
      {
        id: `demo-${targetRole.toLowerCase()}`,
        name: email.split("@")[0].toUpperCase() || "DEMO USER",
        email: email || "demo@brandhub.vn",
        role: targetRole,
      },
      "demo-access-token",
      "demo-refresh-token"
    );

    toast.success(`Đăng nhập thành công! Vai trò: ${
      targetRole === "CONTENT_CREATOR" ? "Content Creator" :
      targetRole === "ACCOUNT_MANAGER" ? "Account Manager" :
      targetRole === "AGENCY_OWNER" ? "Agency Owner" :
      targetRole === "ADMIN" ? "Administrator" : "Brand Client"
    }`);

    navigate(targetPath);
  };

  return (
    <div className="min-h-screen flex bg-background" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Left panel — BrandHub dark branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 select-none"
        style={{ background: "#09090b" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: "var(--brand-orange, #f05a28)" }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.2" fill="white" />
              <circle cx="2.5" cy="4" r="1.5" fill="white" />
              <circle cx="13.5" cy="4" r="1.5" fill="white" />
              <circle cx="2.5" cy="12" r="1.5" fill="white" />
              <circle cx="13.5" cy="12" r="1.5" fill="white" />
              <line x1="5.8" y1="7" x2="3.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="10.2" y1="7" x2="12.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="5.8" y1="9" x2="3.5" y2="11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="10.2" y1="9" x2="12.5" y2="11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#ffffff", letterSpacing: "-0.01em" }}>
            Brand<span style={{ color: "var(--brand-orange, #f05a28)" }}>Hub</span>
          </span>
        </div>

        {/* Tagline */}
        <div>
          <p
            className="mb-2"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", color: "var(--brand-orange, #f05a28)", textTransform: "uppercase", fontWeight: 500 }}
          >
            PLAN · CREATE · SCHEDULE · PUBLISH · GROW
          </p>
          <blockquote
            className="mb-6"
            style={{ fontSize: "1.25rem", lineHeight: 1.55, fontWeight: 300, color: "rgba(255,255,255,0.85)" }}
          >
            "Chúng tôi rút ngắn thời gian tạo nội dung từ 3 ngày xuống còn 2 giờ. BrandHub đã thay đổi hoàn toàn quy trình làm việc của team."
          </blockquote>
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(240,90,40,0.2)", border: "1px solid rgba(240,90,40,0.3)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--brand-orange, #f05a28)" }}
            >
              MN
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#ffffff" }}>Minh Nguyễn</p>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)" }}>Content Director, VCorp Media</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
          {[["50K+", "Người dùng"], ["2M+", "Nội dung tạo"], ["99.9%", "Uptime"]].map(([v, l]) => (
            <div key={l}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.375rem", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.03em" }}>{v}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 select-none">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: "var(--brand-orange, #f05a28)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.2" fill="white" />
                <circle cx="2.5" cy="4" r="1.5" fill="white" />
                <circle cx="13.5" cy="4" r="1.5" fill="white" />
                <circle cx="2.5" cy="12" r="1.5" fill="white" />
                <circle cx="13.5" cy="12" r="1.5" fill="white" />
                <line x1="5.8" y1="7" x2="3.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="10.2" y1="7" x2="12.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="5.8" y1="9" x2="3.5" y2="11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="10.2" y1="9" x2="12.5" y2="11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-foreground" style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>
              Brand<span style={{ color: "var(--brand-orange, #f05a28)" }}>Hub</span>
            </span>
          </div>

          <div className="mb-8 select-none">
            <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">
              {tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {tab === "login"
                ? "Đăng nhập để tiếp tục công việc của bạn"
                : "Bắt đầu miễn phí, không cần thẻ tín dụng"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-border p-0.5 mb-6 bg-muted select-none">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md py-1.5 text-xs transition-all cursor-pointer ${
                  tab === t
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Họ và tên</label>
                <Input placeholder="Nguyễn Văn A" required />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <Input
                type="email"
                placeholder="hello@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between select-none">
                <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
                {tab === "login" && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-1 gap-2 flex items-center justify-center h-10 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: "var(--brand-orange, #f05a28)" }}
            >
              {tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              <ArrowRight className="size-4 ml-1" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 select-none">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">hoặc tiếp tục với</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="gap-2 text-xs">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" className="gap-2 text-xs">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground select-none">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <button className="underline hover:text-foreground transition-colors cursor-pointer">Điều khoản dịch vụ</button>
            {" "}và{" "}
            <button className="underline hover:text-foreground transition-colors cursor-pointer">Chính sách bảo mật</button>
          </p>

          {/* Test accounts hint */}
          <div className="mt-5 p-3 rounded-md border border-dashed border-border select-none">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 tracking-wider uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Tài khoản demo (Click để chọn nhanh)
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ["owner@brandhub.vn", "Agency Owner"],
                ["client@brandhub.vn", "Brand Client"],
                ["creator@brandhub.vn", "Creator"],
                ["am@brandhub.vn", "AM"],
                ["admin@brandhub.vn", "Admin"],
              ].map(([email, label]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => {
                    setEmail(email);
                    setPassword("password");
                  }}
                  className="text-left text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <span style={{ color: "var(--brand-orange, #f05a28)", fontFamily: "var(--font-mono)" }}>{email.split("@")[0]}</span>
                  <span className="ml-1">({label})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
