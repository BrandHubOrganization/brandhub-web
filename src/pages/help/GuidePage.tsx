import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Activity,
  Users,
  AlertTriangle,
  Wallet,
  Radar,
  Mail,
  Sparkles,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Lock,
  Server,
  FileText,
  Info,
  Cpu,
  CreditCard,
  Clock,
  Sliders,
  Send,
  Workflow,
  Network,
  ChevronRight,
  ChevronDown,
  UserCheck,
  FileDown,
  LayoutTemplate,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminGuidePage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [activeSection, setActiveSection] = useState("welcome");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    const sectionIds = [
      "welcome",
      "monitoring",
      "user_management",
      "moderation",
      "finance_templates",
      "ai_crawler",
      "notifications_email",
    ];

    const handleScroll = () => {
      // Khi cuộn tới cuối trang: kích hoạt section cuối cùng
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50
      ) {
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      // headerOffset: khoảng 130 - 150px (tính cả thanh điều hướng sticky)
      const headerOffset = 140;
      let currentId = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            currentId = id;
          }
        }
      }

      setActiveSection(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const SECTIONS = [
    {
      id: "welcome",
      title: isEn
        ? "1. Welcome & General Principles"
        : "1. Lời Chào & Nguyên Tắc Chung",
      subtitle: isEn
        ? "Guide introduction & security standards"
        : "Giới thiệu cẩm nang & nguyên tắc an ninh",
      icon: Sparkles,
      badge: isEn ? "Overview" : "Tổng quan",
    },
    {
      id: "monitoring",
      title: isEn
        ? "2. Infrastructure Health Monitoring"
        : "2. Giám Sát Sức Khỏe Hạ Tầng",
      subtitle: isEn
        ? "Hardware & microservice telemetry"
        : "Tài nguyên phần cứng & microservices",
      icon: Activity,
      badge: isEn ? "Infrastructure" : "Hạ tầng",
    },
    {
      id: "user_management",
      title: isEn
        ? "3. System-Wide User Management"
        : "3. Quản Lý Người Dùng Toàn Cục",
      subtitle: isEn
        ? "Directory, accounts & states"
        : "Vòng đời & chuyển đổi trạng thái gộp",
      icon: Users,
      badge: isEn ? "Accounts" : "Tài khoản",
    },
    {
      id: "moderation",
      title: isEn
        ? "4. Content Moderation Queue"
        : "4. Hàng Đợi Kiểm Duyệt Nội Dung",
      subtitle: isEn
        ? "Compliance check & appellate review"
        : "Phúc thẩm vi phạm & xử lý gậy",
      icon: AlertTriangle,
      badge: isEn ? "Moderation" : "Kiểm duyệt",
    },
    {
      id: "finance_templates",
      title: isEn
        ? "5. Revenue, Invoices & Templates"
        : "5. Doanh Thu, Hóa Đơn & Mẫu Không Gian",
      subtitle: isEn
        ? "Financial analytics & PDF exports"
        : "Phân tích tài chính & xuất file PDF",
      icon: Wallet,
      badge: isEn ? "Finance" : "Tài chính",
    },
    {
      id: "ai_crawler",
      title: isEn
        ? "6. AI Pricing & Trend Crawler"
        : "6. Quản Trị AI & Lập Lịch Cào Dữ Liệu",
      subtitle: isEn
        ? "Credit pricing & crawler pipeline"
        : "Định mức credit & pipeline xu hướng",
      icon: Radar,
      badge: "AI & Crawl",
    },
    {
      id: "notifications_email",
      title: isEn
        ? "7. System Broadcast & Email Ops"
        : "7. Thông Báo Hệ Thống & Vận Hành Email",
      subtitle: isEn
        ? "Push announcements & suppressions"
        : "Phát sóng thông báo & hạ tầng mail",
      icon: Mail,
      badge: isEn ? "Broadcast" : "Thông báo",
    },
  ];

  return (
    <PageWrapper
      title={
        isEn
          ? "System Administrator Guide & Operations Manual"
          : "Cẩm Nang Quản Trị & Vận Hành Hệ Thống Dành Cho Admin"
      }
      description={
        isEn
          ? "Authoritative technical manual, operational procedures, and role architecture for BrandHub System Administrators."
          : "Tài liệu kỹ thuật chính thống, quy trình vận hành và nguyên tắc kiến trúc dành riêng cho Quản trị viên hệ thống BrandHub."
      }
      bannerBadge={
        isEn
          ? "System Administration Manual"
          : "Cẩm Nang Quản Trị Hệ Thống"
      }
      headerTextClassName="flex-1 min-w-0 max-w-none"
      titleClassName="whitespace-normal xl:whitespace-nowrap xl:truncate text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight"
      descriptionClassName="whitespace-normal xl:whitespace-nowrap xl:truncate text-xs sm:text-sm text-muted-foreground"
      showGuideButton={false}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/help/faq">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs cursor-pointer border-border hover:bg-muted"
            >
              <HelpCircle className="size-3.5 text-brand-orange" />
              {isEn ? "FAQ Center" : "Hỏi đáp FAQ"}
            </Button>
          </Link>
          <Link to="/admin">
            <Button
              variant="default"
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-1.5 text-xs cursor-pointer shadow-xs"
            >
              <ShieldCheck className="size-3.5" />
              {isEn ? "Admin Portal" : "Cổng Quản trị Admin"}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Navigation Sidebar Sticky */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 w-full">
          <div className="sticky top-20 border-border bg-card rounded-xl border p-4 shadow-xs space-y-3 max-h-[calc(100vh-6rem)] overflow-y-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-border gap-2">
              <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                <h3 className="text-foreground text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                  {isEn ? "Admin Guide Index" : "Mục lục cẩm nang"}
                </h3>
                <Badge variant="outline" className="text-3xs font-semibold py-0 px-1.5 shrink-0">
                  v3.0
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="lg:hidden flex items-center gap-1 text-xs text-brand-orange font-medium cursor-pointer py-1 px-2 rounded hover:bg-brand-orange/10 transition-colors shrink-0"
                aria-expanded={mobileTocOpen}
              >
                <span>{mobileTocOpen ? (isEn ? "Hide" : "Thu gọn") : (isEn ? "View (7)" : "Xem mục (7)")}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    mobileTocOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {!mobileTocOpen && (
              <div
                onClick={() => setMobileTocOpen(true)}
                className="lg:hidden flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs text-foreground cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <span className="text-3xs font-semibold text-brand-orange uppercase shrink-0">
                    {isEn ? "Viewing:" : "Đang xem:"}
                  </span>
                  <span className="truncate font-medium text-xs">
                    {SECTIONS.find((s) => s.id === activeSection)?.title || SECTIONS[0].title}
                  </span>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground shrink-0 ml-1" />
              </div>
            )}

            <div className={`space-y-1 ${mobileTocOpen ? "block" : "hidden lg:block"}`}>
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(sec.id);
                      setMobileTocOpen(false);
                      document
                        .getElementById(sec.id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-brand-orange text-white font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium whitespace-normal break-words leading-snug">{sec.title}</div>
                      <div
                        className={`text-3xs mt-0.5 whitespace-normal break-words leading-tight ${
                          isActive ? "text-white/80" : "text-muted-foreground/80"
                        }`}
                      >
                        {sec.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Document Content */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-8 min-w-0 w-full">
          {/* ========================================================================= */}
          {/* SECTION 1: WELCOME & GENERAL PRINCIPLES */}
          {/* ========================================================================= */}
          <section
            id="welcome"
            className="scroll-mt-24 border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-orange/10 text-brand-orange">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "1. Welcome & General Principles"
                      : "1. Lời Chào & Nguyên Tắc Chung"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "Guide introduction & security standards"
                      : "Giới thiệu cẩm nang & nguyên tắc an ninh"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-brand-orange text-brand-orange self-start sm:self-auto font-mono text-3xs">
                {isEn ? "Overview" : "Tổng quan"}
              </Badge>
            </div>

            {/* Greeting */}
            <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Sparkles className="size-4.5 text-brand-orange shrink-0" />
                {isEn
                  ? "Welcome to BrandHub System Operations"
                  : "Chào Mừng Đến Với Hệ Thống Quản Trị BrandHub"}
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn
                  ? "As a System Administrator, you hold a pivotal role in ensuring the operational stability, data security, and platform compliance across the entire BrandHub ecosystem. We extend our warmest welcome and utmost appreciation for your dedication to maintaining a resilient, transparent, and high-performance environment for all agencies, workspaces, and creative teams."
                  : "Với tư cách là Quản trị viên hệ thống (System Administrator), bạn giữ vai trò then chốt trong việc bảo đảm tính ổn định vận hành, an toàn thông tin và tính tuân thủ trên toàn bộ hệ sinh thái BrandHub. Chúng tôi trân trọng gửi lời chào nhiệt liệt và lời cảm ơn sâu sắc tới những nỗ lực tận tâm của bạn trong việc duy trì một nền tảng vận hành bền bỉ, minh bạch và hiệu năng cao cho tất cả agency, không gian làm việc và đối tác."}
              </p>
            </div>

            {/* Guide Introduction */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-brand-orange" />
                {isEn
                  ? "1.1. About This Operations Manual"
                  : "1.1. Giới Thiệu Cẩm Nang Vận Hành"}
              </h3>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn
                  ? "This technical and operational manual serves as the authoritative handbook for platform administrators. It outlines end-to-end workflows, system configurations, and operational standards across all core functional modules:"
                  : "Cẩm nang kỹ thuật và nghiệp vụ này là tài liệu chuẩn mực dành riêng cho Quản trị viên nền tảng BrandHub. Tài liệu tổng hợp toàn diện các quy trình vận hành, thiết lập cấu hình và chuẩn mực quản trị trên 6 phân hệ chức năng chính:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                <div className="border border-border bg-card hover:bg-muted/30 transition-colors rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                    <Activity className="size-4 text-blue-500 shrink-0" />
                    <span>{isEn ? "Infrastructure Health" : "Giám Sát Hạ Tầng"}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Real-time hardware telemetry (CPU, RAM, Disk, Network) and microservice live discovery."
                      : "Theo dõi tài nguyên phần cứng thời gian thực và trạng thái hoạt động của các vi dịch vụ."}
                  </p>
                </div>

                <div className="border border-border bg-card hover:bg-muted/30 transition-colors rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                    <Users className="size-4 text-emerald-500 shrink-0" />
                    <span>{isEn ? "User Management" : "Quản Lý Người Dùng"}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "System-wide directory, account lifecycles, role verifications, and batch lock/unlock actions."
                      : "Danh bạ tài khoản toàn cục, quản lý vòng đời người dùng và thao tác kích hoạt/khóa hàng loạt."}
                  </p>
                </div>

                <div className="border border-border bg-card hover:bg-muted/30 transition-colors rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                    <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                    <span>{isEn ? "Moderation Queue" : "Kiểm Duyệt Vi Phạm"}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Appellate review for flagged creative materials, strike tracking, and policy enforcement."
                      : "Phúc thẩm tài liệu sáng tạo bị vi phạm chính sách, quản lý gậy cảnh cáo và bảo vệ bản quyền."}
                  </p>
                </div>

                <div className="border border-border bg-card hover:bg-muted/30 transition-colors rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                    <Wallet className="size-4 text-purple-500 shrink-0" />
                    <span>{isEn ? "Finance & Templates" : "Doanh Thu & Hóa Đơn"}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Revenue analytics, invoice auditing, PDF exports, and marketplace workspace templates."
                      : "Thống kê doanh thu, kiểm toán hóa đơn, xuất file PDF và kiểm soát mẫu không gian mẫu."}
                  </p>
                </div>

                <div className="border border-border bg-card hover:bg-muted/30 transition-colors rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                    <Radar className="size-4 text-rose-500 shrink-0" />
                    <span>{isEn ? "AI & Trend Crawler" : "Quản Trị AI & Lập Lịch Cào"}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "AI credit pricing, model configurations, and automated social trend crawler pipelines."
                      : "Cấu hình biểu giá credit AI, điều phối model và lập lịch pipeline cào dữ liệu xu hướng."}
                  </p>
                </div>

                <div className="border border-border bg-card hover:bg-muted/30 transition-colors rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                    <Mail className="size-4 text-indigo-500 shrink-0" />
                    <span>{isEn ? "Broadcast & Email Ops" : "Thông Báo & Vận Hành Email"}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "System-wide push alerts, email template management, and mail delivery infrastructure."
                      : "Phát sóng thông báo toàn hệ thống, quản lý mẫu email và giám sát hạ tầng gửi thư."}
                  </p>
                </div>
              </div>
            </div>

            {/* General Security & Governance Principles */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand-orange" />
                {isEn
                  ? "1.2. General Governance & Security Principles"
                  : "1.2. Các Nguyên Tắc Quản Trị & An Ninh Cốt Lõi"}
              </h3>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn
                  ? "Given the extensive scope and administrative privileges granted to System Administrators, all operations must strictly comply with the following foundational principles:"
                  : "Do tính chất bao quát và thẩm quyền vận hành trên toàn bộ nền tảng, mọi Quản trị viên bắt buộc phải nghiêm túc tuân thủ 4 nguyên tắc bảo mật và đạo đức quản trị nền tảng:"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3.5">
                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <Lock className="size-4 text-brand-orange shrink-0" />
                    {isEn
                      ? "1. Mandatory Multi-Factor Authentication (2FA/TOTP)"
                      : "1. Bắt Buộc Kích Hoạt Xác Thực 2 Bước (2FA/TOTP)"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "All administrative accounts must bind and enforce time-based one-time password (TOTP) authentication (e.g., Google Authenticator, 1Password) before accessing any administrative endpoints. Single-factor access is strictly prohibited."
                      : "Mọi tài khoản Quản trị viên bắt buộc phải cấu hình và duy trì xác thực hai yếu tố dựa trên thời gian (TOTP) qua ứng dụng xác thực (Google Authenticator, 1Password) trước khi truy cập bất kỳ phân hệ quản trị nào. Nghiêm cấm sử dụng mật khẩu đơn thuần."}
                  </p>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <Clock className="size-4 text-blue-500 shrink-0" />
                    {isEn
                      ? "2. Session Hardening & Secure Sign-Out"
                      : "2. Bảo Vệ Phiên Làm Việc & Đăng Xuất An Toàn"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Administrative sessions automatically timeout after prolonged inactivity. Administrators must explicitly sign out upon concluding operational shifts. Immediate token revocation is triggered whenever anomalous geographic or network activity is detected."
                      : "Phiên làm việc quản trị được giới hạn thời gian và tự động thu hồi khi không hoạt động. Quản trị viên phải chủ động đăng xuất khi hoàn thành ca vận hành. Hệ thống lập tức vô hiệu hóa token khi ghi nhận bất thường về địa chỉ IP hoặc định vị mạng."}
                  </p>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    {isEn
                      ? "3. Audit Logging & Strict Accountability"
                      : "3. Nhật Ký Kiểm Toán & Trách Nhiệm Giải Trình"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Every administrative action—including moderation strikes, account state transitions, AI pricing modifications, and broadcasts—is permanently recorded in immutable audit logs with actor timestamp, identity, and origin IP. Anonymous modifications are impossible."
                      : "Mọi tác vụ quản trị—từ xử lý vi phạm, khóa/mở tài khoản, điều chỉnh biểu giá AI đến phát sóng thông báo—đều được ghi nhận vĩnh viễn vào nhật ký kiểm toán bất biến (Audit Log) kèm định danh, thời gian và địa chỉ IP. Mọi hành vi ẩn danh đều bị ngăn chặn."}
                  </p>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <ShieldCheck className="size-4 text-purple-500 shrink-0" />
                    {isEn
                      ? "4. Data Privacy & Ethical Governance"
                      : "4. Đạo Đức Quản Trị & Tôn Trọng Quyền Riêng Tư"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Administrators must respect tenant boundaries and confidential creative assets. Inspecting customer workspace data is restricted strictly to legitimate compliance escalation or authorized appellate reviews, adhering to GDPR and data protection laws."
                      : "Quản trị viên cam kết tôn trọng tuyệt đối tính bảo mật và tài sản sáng tạo của khách hàng. Việc thanh tra dữ liệu người dùng chỉ được thực hiện khi có yêu cầu phúc thẩm chính đáng hoặc vi phạm pháp luật, bảo đảm tuân thủ nghiêm ngặt các quy định về bảo vệ quyền riêng tư."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 2: SYSTEM HEALTH MONITORING */}
          {/* ========================================================================= */}
          <section
            id="monitoring"
            className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 scroll-mt-24 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Activity className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "2. Infrastructure Health Monitoring"
                      : "2. Giám Sát Sức Khỏe Hạ Tầng (System Health Monitoring)"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "Real-time hardware resource telemetry and microservice live discovery"
                      : "Theo dõi tài nguyên phần cứng thời gian thực và trạng thái sống của các microservices"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant="outline" className="border-blue-500 text-blue-500 text-3xs font-medium">{isEn ? "Live Telemetry" : "Giám sát thời gian thực"}</Badge>
                <Link to="/admin/system-health">
                  <Button variant="outline" size="sm" className="h-7 text-3xs gap-1 cursor-pointer">
                    <ExternalLink className="size-3" />
                    {isEn ? "Open Health Page" : "Vào trang Giám Sát"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn ? (
                  <>
                    The System Health Dashboard accessible at <code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin/system-health</code> provides centralized observability into server nodes and containerized microservices across environments (Production, Staging, Development).
                  </>
                ) : (
                  <>
                    Trang Giám Sát Sức Khỏe Hạ Tầng tại đường dẫn <code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin/system-health</code> cung cấp khả năng quan sát tập trung vào các máy chủ vật lý/ảo và các vi dịch vụ (microservices) phân tách theo môi trường (Production, Staging, Development).
                  </>
                )}
              </p>

              {/* Hardware Telemetry */}
              <div className="border border-border bg-muted/10 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Cpu className="size-4 text-blue-500" />
                  {isEn
                    ? "Real-Time Hardware Metrics Telemetry"
                    : "Chỉ Số Tài Nguyên Phần Cứng Thời Gian Thực"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                      {isEn ? "CPU Utilization" : "Tải Vi Xử Lý (%CPU)"}
                    </span>
                    <p className="text-xs font-semibold text-foreground">0% - 100%</p>
                    <p className="text-3xs text-muted-foreground">
                      {isEn
                        ? "Warning threshold at >70%; Critical alert at >85%. Monitors spike during heavy AI processing."
                        : "Ngưỡng cảnh báo >70%; Ngưỡng nguy hiểm >85%. Theo dõi đột biến tải khi xử lý AI đồng thời."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                      {isEn ? "RAM Memory Usage" : "Chiếm Dụng Bộ Nhớ (%RAM)"}
                    </span>
                    <p className="text-xs font-semibold text-foreground">Resident Set Size</p>
                    <p className="text-3xs text-muted-foreground">
                      {isEn
                        ? "Tracks heap memory usage per process. Detects memory leaks in streaming endpoints."
                        : "Theo dõi heap memory từng dịch vụ. Kịp thời phát hiện rò rỉ bộ nhớ ở các kết nối WebSocket/STOMP."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                      {isEn ? "Disk I/O Throughput" : "Băng Thông Ổ Đĩa (Disk I/O)"}
                    </span>
                    <p className="text-xs font-semibold text-foreground">Read / Write IOPS</p>
                    <p className="text-3xs text-muted-foreground">
                      {isEn
                        ? "Monitors media asset temporary caches, video rendering buffers, and database log writes."
                        : "Giám sát bộ nhớ đệm tạm thời của video/ảnh, bộ đệm render và tốc độ ghi log cơ sở dữ liệu."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Microservices Live Status Table */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Server className="size-4 text-emerald-500" />
                  {isEn
                    ? "Target Status & Microservice Heartbeat Registry"
                    : "Trạng Thái Mục Tiêu & Nhịp Tim (Heartbeat) Microservices"}
                </h4>
                <div className="overflow-x-auto text-xs border border-border rounded-lg">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-muted/40 border-b border-border text-3xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold w-44 sm:w-48 xl:w-56 shrink-0">{isEn ? "Service / Target" : "Dịch vụ / Mục tiêu"}</th>
                        <th className="py-2.5 px-3 font-semibold min-w-[180px]">{isEn ? "Role in Architecture" : "Vai trò kiến trúc"}</th>
                        <th className="py-2.5 px-3 font-semibold w-28 text-center shrink-0">{isEn ? "Live Indicator" : "Chỉ số sống"}</th>
                        <th className="py-2.5 px-3 font-semibold min-w-[220px]">{isEn ? "Admin Action on Failure" : "Hành động khi gặp sự cố"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-foreground">API Gateway</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{isEn ? "Routing, SSL termination, rate limit" : "Định tuyến, bảo vệ rate limit, proxy"}</td>
                        <td className="py-2.5 px-3 text-center"><Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">UP</Badge></td>
                        <td className="py-2.5 px-3 text-3xs text-muted-foreground">{isEn ? "Check ingress reverse proxy & certificates" : "Kiểm tra reverse proxy và chứng chỉ SSL"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-foreground">AI Service</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{isEn ? "LLM, image/video gen, prompt optimizer" : "Xử lý prompt, sinh ảnh/video, tinh chỉnh AI"}</td>
                        <td className="py-2.5 px-3 text-center"><Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">UP</Badge></td>
                        <td className="py-2.5 px-3 text-3xs text-muted-foreground">{isEn ? "Inspect Gemini API quotas & GPU nodes" : "Kiểm tra quota API Gemini và node máy chủ"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-foreground">Business Service</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{isEn ? "Core domain, RBAC, workspaces, tasks" : "Quản lý Agency, Workspace, phân quyền, tác vụ"}</td>
                        <td className="py-2.5 px-3 text-center"><Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">UP</Badge></td>
                        <td className="py-2.5 px-3 text-3xs text-muted-foreground">{isEn ? "Check PostgreSQL database connection pools" : "Kiểm tra connection pool cơ sở dữ liệu"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-foreground">Publisher Service</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{isEn ? "Cron scheduler, social token dispatch" : "Lập lịch đăng bài, đẩy bài lên mạng xã hội"}</td>
                        <td className="py-2.5 px-3 text-center"><Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">UP</Badge></td>
                        <td className="py-2.5 px-3 text-3xs text-muted-foreground">{isEn ? "Verify social OAuth refresh token health" : "Kiểm tra token OAuth mạng xã hội"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-foreground">Crawler Service</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{isEn ? "Social signals ingestion & raw feeds" : "Thu thập tín hiệu xu hướng mạng xã hội"}</td>
                        <td className="py-2.5 px-3 text-center"><Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">DEGRADED</Badge></td>
                        <td className="py-2.5 px-3 text-3xs text-muted-foreground">{isEn ? "Rotate cookies/proxies in crawler config" : "Cập nhật cookie / đổi proxy tài khoản cào"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: SYSTEM-WIDE USER MANAGEMENT */}
          {/* ========================================================================= */}
          <section
            id="user_management"
            className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 scroll-mt-24 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Users className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "3. System-Wide User Management"
                      : "3. Quản Lý Người Dùng Toàn Hệ Thống (User Management)"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "User directory, provisioning, editing, and centralized lifecycle state machine"
                      : "Tra cứu danh sách, tạo mới, chỉnh sửa hồ sơ và cơ chế chuyển đổi trạng thái tập trung"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant="outline" className="border-emerald-500 text-emerald-500 text-3xs font-medium">{isEn ? "User Management" : "Quản trị người dùng"}</Badge>
                <Link to="/admin?view=users">
                  <Button variant="outline" size="sm" className="h-7 text-3xs gap-1 cursor-pointer">
                    <ExternalLink className="size-3" />
                    {isEn ? "Open Accounts Panel" : "Vào Quản Lý Tài Khoản"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn ? (
                  <>
                    Operating at <code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin?view=users</code>, Administrators can supervise all registered accounts across all tenant organizations.
                  </>
                ) : (
                  <>
                    Tại phân hệ <code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin?view=users</code>, Quản trị viên có thẩm quyền giám sát toàn bộ tài khoản người dùng đăng ký trên toàn bộ hệ thống.
                  </>
                )}
              </p>

              {/* Roster & Capabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Sliders className="size-4 text-brand-orange" />
                    {isEn ? "Live Directory Search & Filters" : "Tìm Kiếm Thời Gian Thực & Bộ Lọc"}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>{isEn ? "Live Debounce Search:" : "Tìm kiếm tự động:"}</strong>{" "}
                      {isEn
                        ? "Filters by user email, display name, or unique UUID with 300ms debounce."
                        : "Tra cứu theo email, tên hiển thị hoặc mã định danh người dùng với độ trễ tối ưu."}
                    </li>
                    <li>
                      <strong>{isEn ? "Role Filter:" : "Lọc theo vai trò:"}</strong>{" "}
                      {isEn ? "ADMIN vs. USER accounts." : "Phân biệt tài khoản ADMIN và USER thông thường."}
                    </li>
                    <li>
                      <strong>{isEn ? "Lifecycle Status Filter:" : "Lọc theo trạng thái:"}</strong>{" "}
                      <code className="font-mono text-3xs">ACTIVE</code>,{" "}
                      <code className="font-mono text-3xs">FLAGGED</code>,{" "}
                      <code className="font-mono text-3xs">PENDING_VERIFICATION</code>,{" "}
                      <code className="font-mono text-3xs">DEACTIVATED</code>,{" "}
                      <code className="font-mono text-3xs">SUSPENDED</code>,{" "}
                      <code className="font-mono text-3xs">DELETED</code>.
                    </li>
                  </ul>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <UserCheck className="size-4 text-emerald-500" />
                    {isEn ? "Account Creation & Profile Updates" : "Tạo Mới & Cập Nhật Hồ Sơ"}
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>{isEn ? "Create User:" : "Tạo tài khoản mới:"}</strong>{" "}
                      {isEn
                        ? "Admin fills initial email, full name, temporary credentials, and role."
                        : "Khởi tạo nhanh tài khoản người dùng trực tiếp qua hộp thoại CreateUserDialog."}
                    </li>
                    <li>
                      <strong>{isEn ? "Update User:" : "Cập nhật hồ sơ:"}</strong>{" "}
                      {isEn
                        ? "Directly edit display names, phone numbers, and profile metadata."
                        : "Chỉnh sửa họ tên, số điện thoại liên hệ và thông tin hồ sơ của người dùng."}
                    </li>
                    <li>
                      <strong>{isEn ? "Audit Export:" : "Xuất báo cáo PDF:"}</strong>{" "}
                      {isEn
                        ? "One-click export of the filtered user list to PDF."
                        : "Xuất danh sách người dùng đã lọc sang định dạng PDF để lưu trữ đối soát."}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Consolidated State Transition Callout */}
              <div className="border border-brand-orange/30 bg-brand-orange/5 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-brand-orange font-semibold text-xs">
                  <Info className="size-4 shrink-0" />
                  {isEn
                    ? "Key Mechanism: Consolidated Account Lifecycle Management"
                    : "Đặc Điểm Vận Hành: Cơ Chế Quản Lý Trạng Thái Tập Trung"}
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {isEn ? (
                    <>
                      Rather than fragmenting account actions across disconnected controls, the platform maintains a <strong>consolidated lifecycle management workflow</strong>. Administrators handle all status changes, warnings, and enforcement penalties directly through the <strong>AdminStrikeDialog</strong>:
                    </>
                  ) : (
                    <>
                      Thay vì phân tán các thao tác trên nhiều màn hình riêng lẻ, hệ thống áp dụng một <strong>cơ chế quản lý trạng thái tập trung</strong>. Quản trị viên thực hiện toàn bộ các thao tác xử lý vi phạm và điều chỉnh trạng thái tài khoản thông qua hộp thoại <strong>AdminStrikeDialog</strong>:
                    </>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-card border border-border rounded p-2.5 text-3xs space-y-1">
                    <span className="font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="size-3 text-yellow-500" />
                      {isEn ? "Level 1: YELLOW Strike" : "Cấp 1: Gậy VÀNG"}
                    </span>
                    <p className="text-muted-foreground">
                      {isEn
                        ? "Warning notice for minor guideline violations. Account remains ACTIVE."
                        : "Cảnh cáo nhắc nhở vi phạm nhẹ. Tài khoản vẫn giữ trạng thái ACTIVE."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded p-2.5 text-3xs space-y-1">
                    <span className="font-semibold text-brand-orange flex items-center gap-1">
                      <AlertTriangle className="size-3 text-brand-orange" />
                      {isEn ? "Level 2: ORANGE Strike" : "Cấp 2: Gậy CAM"}
                    </span>
                    <p className="text-muted-foreground">
                      {isEn
                        ? "Marks account as FLAGGED. Restricts publishing until reviewed."
                        : "Chuyển trạng thái sang FLAGGED. Tạm hạn chế quyền xuất bản nội dung mới."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded p-2.5 text-3xs space-y-1">
                    <span className="font-semibold text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3 text-destructive" />
                      {isEn ? "Level 3: RED Strike" : "Cấp 3: Gậy ĐỎ"}
                    </span>
                    <p className="text-muted-foreground">
                      {isEn
                        ? "Immediate transition to SUSPENDED. All workspace access revoked."
                        : "Lập tức chuyển sang SUSPENDED. Thu hồi quyền truy cập toàn bộ Workspace."}
                    </p>
                  </div>
                </div>

                <div className="text-3xs text-muted-foreground pt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                  {isEn
                    ? "Pardon Action: Admins can pardon existing strikes or unflag accounts by documenting an explicit business rationale."
                    : "Hành động Ân Xá (Pardon): Admin có thể gỡ gậy phạt hoặc gỡ cờ (Unflag) đưa tài khoản trở lại ACTIVE sau khi ghi nhận lý do giải trình."}
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: CONTENT MODERATION QUEUE */}
          {/* ========================================================================= */}
          <section
            id="moderation"
            className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 scroll-mt-24 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "4. Content Moderation Queue"
                      : "4. Hàng Đợi Kiểm Duyệt Nội Dung (Content Moderation Queue)"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "Automated compliance linkage and appellate judicial review for Creator posts"
                      : "Liên kết với kiểm tra tuân thủ tự động và trách nhiệm phúc thẩm nội dung của Creator"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant="outline" className="border-amber-500 text-amber-500 text-3xs font-medium">{isEn ? "Appellate Review" : "Phúc thẩm kiểm duyệt"}</Badge>
                <Link to="/admin?view=moderation">
                  <Button variant="outline" size="sm" className="h-7 text-3xs gap-1 cursor-pointer">
                    <ExternalLink className="size-3" />
                    {isEn ? "Open Moderation Queue" : "Vào Hàng Đợi Kiểm Duyệt"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn ? (
                  <>
                    Located at <code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin?view=moderation</code>, the Moderation Queue acts as the platform's appellate court for social content.
                  </>
                ) : (
                  <>
                    Nằm tại phân hệ <code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin?view=moderation</code>, Hàng đợi kiểm duyệt đóng vai trò như một hội đồng phúc thẩm đối với toàn bộ nội dung truyền thông trên nền tảng.
                  </>
                )}
              </p>

              {/* Compliance Linkage Explanation */}
              <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Workflow className="size-4 text-brand-orange" />
                  {isEn
                    ? "Linkage with Automated Compliance Check"
                    : "Cơ Chế Liên Kết Với Kiểm Tra Tuân Thủ Tự Động"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEn ? (
                    <>
                      Administrators <strong>do not manually moderate every piece of content from scratch</strong>. Instead, when a Creator submits a post, the platform's automated Compliance Engine inspects the copy and media assets against safety filters (hate speech, regulated keywords, copyright hashes). When an automated flag occurs, the item is enqueued into the Moderation Queue for Admin review.
                    </>
                  ) : (
                    <>
                      Quản trị viên <strong>KHÔNG phải tự tay kiểm duyệt từng bài viết từ đầu</strong>. Thay vào đó, khi Creator nộp bài, tính năng <em>Check Compliance Content</em> tự động quét văn bản và tài nguyên media qua các bộ lọc an toàn (từ ngữ nhạy cảm, vi phạm chính sách quảng cáo, quét bản quyền hình ảnh). Khi phát hiện vi phạm, hệ thống tự động đưa bài viết vào hàng đợi để Admin đánh giá lại.
                    </>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs font-bold uppercase text-brand-orange">
                      COMPLIANCE
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {isEn ? "Policy & Safety Filter" : "Quét Tiêu Chuẩn & An Toàn"}
                    </p>
                    <p className="text-3xs text-muted-foreground">
                      {isEn
                        ? "Triggered by automated toxic language, prohibited advertising claims, or sensitive content flags."
                        : "Kích hoạt tự động bởi AI khi phát hiện ngôn từ tiêu cực hoặc nội dung vi phạm chính sách."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs font-bold uppercase text-blue-500">
                      COPYRIGHT
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {isEn ? "Media Copyright Collision" : "Trùng Khớp Bản Quyền Media"}
                    </p>
                    <p className="text-3xs text-muted-foreground">
                      {isEn
                        ? "Detected via perceptual hash mismatch against copyrighted stock libraries or protected trademarks."
                        : "Phát hiện khi hình ảnh hoặc video trùng khớp với nguồn dữ liệu bản quyền đã bảo hộ."}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs font-bold uppercase text-emerald-500">
                      FLAGGED_AUTHOR
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {isEn ? "Author Under Surveillance" : "Tác Giả Đang Bị Theo Dõi"}
                    </p>
                    <p className="text-3xs text-muted-foreground">
                      {isEn
                        ? "Automatically funnels all drafts from users currently carrying an active strike."
                        : "Tự động đưa toàn bộ bài viết của tác giả đang có gậy cảnh cáo vào hàng đợi kiểm duyệt."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Appellate Actions */}
              <div className="border border-border bg-card rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  {isEn
                    ? "Admin Adjudication Responsibility (Appellate Powers)"
                    : "Trách Nhiệm Phán Quyết Của Admin (Quyền Phúc Thẩm)"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-4 shrink-0" />
                      {isEn ? "APPROVE (Dismiss False Positive)" : "CHẤP THUẬN (Bác bỏ cảnh báo AI)"}
                    </div>
                    <p className="text-3xs text-muted-foreground leading-relaxed">
                      {isEn
                        ? "If the automated system flagged content erroneously, Admin clicks 'Approve'. The flag is immediately dismissed, and the post is unblocked and returned to the Creator's workspace for normal workflow."
                        : "Nếu hệ thống AI cảnh báo sai (False Positive), Admin chọn Chấp thuận. Cờ vi phạm lập tức được hủy bỏ, bài viết được mở khóa và trả về Workspace của Creator để tiếp tục xuất bản bình thường."}
                    </p>
                  </div>

                  <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {isEn ? "BLOCK (Confirm Policy Violation)" : "CHẶN NỘI DUNG (Xác nhận vi phạm)"}
                    </div>
                    <p className="text-3xs text-muted-foreground leading-relaxed">
                      {isEn
                        ? "Admin confirms the violation. Content is permanently blocked from publication. Admin can simultaneously issue a strike penalty (Yellow, Orange, Red) against the offending author."
                        : "Admin xác nhận bài viết vi phạm chính sách. Nội dung bị chặn vĩnh viễn không thể xuất bản lên mạng xã hội. Admin có thể trực tiếp áp mức phạt gậy cảnh cáo (Vàng, Cam, Đỏ) đối với tác giả."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 5: FINANCE, INVOICES & WORKSPACE TEMPLATES */}
          {/* ========================================================================= */}
          <section
            id="finance_templates"
            className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 scroll-mt-24 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Wallet className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "5. Revenue, Invoices & Workspace Templates"
                      : "5. Doanh Thu, Hóa Đơn & Mẫu Không Gian Làm Việc"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "Platform billing analytics, PDF report exports, and system-wide workspace templates"
                      : "Thống kê doanh thu, quản lý hóa đơn, xuất báo cáo PDF và thư viện mẫu không gian làm việc"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-indigo-500 text-indigo-500 self-start sm:self-auto font-mono text-3xs">Revenue · Invoices · Templates</Badge>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn ? (
                  <>
                    Administrators have direct oversight of platform-wide cash flow and workspace blueprints across dedicated management modules:
                  </>
                ) : (
                  <>
                    Quản trị viên có thẩm quyền kiểm soát toàn diện dòng tiền nền tảng và bộ khuôn mẫu không gian làm việc qua các phân hệ chuyên trách:
                  </>
                )}
              </p>

              {/* Revenue & Invoices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="size-4 text-indigo-500" />
                      {isEn ? "Platform Revenue Analytics" : "Doanh Thu Hệ Thống"}
                    </h4>
                    <Link to="/admin?view=revenue">
                      <span className="text-3xs text-brand-orange hover:underline flex items-center gap-0.5">
                        {isEn ? "View Chart" : "Xem Biểu Đồ"} <ChevronRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Aggregates revenue generated from two distinct platform income streams:"
                      : "Thống kê doanh thu tách biệt rõ ràng giữa hai nguồn thu chính của BrandHub:"}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>
                      <strong>{isEn ? "Subscription Plans:" : "Gói Thuê Bao:"}</strong>{" "}
                      {isEn
                        ? "Recurring revenue from Starter, Professional, and Enterprise tiers."
                        : "Doanh thu định kỳ từ các gói dịch vụ Starter, Professional, Enterprise."}
                    </li>
                    <li>
                      <strong>{isEn ? "AI Credit Purchases:" : "Nạp Điểm AI:"}</strong>{" "}
                      {isEn
                        ? "On-demand credit top-ups purchased by agencies to power AI generation."
                        : "Doanh thu từ các gói nạp điểm tín dụng AI phục vụ sinh ảnh, video và bài viết."}
                    </li>
                  </ul>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <FileText className="size-4 text-brand-orange" />
                      {isEn ? "Invoice Oversight & Reconciliation" : "Quản Lý Hóa Đơn Thanh Toán"}
                    </h4>
                    <Link to="/admin/invoices">
                      <span className="text-3xs text-brand-orange hover:underline flex items-center gap-0.5">
                        {isEn ? "Invoices Page" : "Trang Hóa Đơn"} <ChevronRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Direct route `/admin/invoices` routes to central transaction history, displaying:"
                      : "Tuyến đường `/admin/invoices` hiển thị toàn bộ lịch sử thanh toán trên nền tảng:"}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>
                      {isEn
                        ? "Transaction IDs, agency payer details, payment gateways (PayOS, Stripe, Momo)."
                        : "Mã hóa đơn, tên Agency thanh toán, cổng thanh toán (PayOS, Stripe, Momo)."}
                    </li>
                    <li>
                      {isEn
                        ? "Real-time payment statuses: PAID, PENDING, and FAILED."
                        : "Trạng thái giao dịch thời gian thực: PAID (Đã thanh toán), PENDING, FAILED."}
                    </li>
                  </ul>
                </div>
              </div>

              {/* PDF Reports & Workspace Templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <FileDown className="size-4 text-emerald-500" />
                      {isEn ? "Standardized PDF Report Export" : "Xuất Báo Cáo PDF Chuẩn Hóa"}
                    </h4>
                    <Link to="/admin?view=reports">
                      <span className="text-3xs text-brand-orange hover:underline flex items-center gap-0.5">
                        {isEn ? "Export Reports" : "Xuất Báo Cáo"} <ChevronRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Exports official audit-ready PDF documents for both User Management and Revenue Dashboards."
                      : "Kết xuất văn bản PDF chính thức cho cả dữ liệu Người dùng và Doanh thu nền tảng."}
                  </p>
                  <p className="text-3xs text-muted-foreground">
                    {isEn
                      ? "Supports preset ranges (Today, Week, Month, Year, Custom) standardized to the Asia/Ho_Chi_Minh legal timezone."
                      : "Hỗ trợ khoảng thời gian linh hoạt (Hôm nay, Tuần, Tháng, Năm) chuẩn hóa theo múi giờ pháp lý Asia/Ho_Chi_Minh."}
                  </p>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <LayoutTemplate className="size-4 text-blue-500" />
                      {isEn ? "Global Workspace Templates Library" : "Thư Viện Mẫu Không Gian Làm Việc"}
                    </h4>
                    <Link to="/admin/workspace-templates">
                      <span className="text-3xs text-brand-orange hover:underline flex items-center gap-0.5">
                        {isEn ? "Open Library" : "Vào Thư Viện"} <ChevronRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Route `/admin/workspace-templates` holds curated industry templates (F&B, Real Estate, Retail, Tech)."
                      : "Tuyến đường `/admin/workspace-templates` lưu trữ các mẫu dự án chuẩn hóa theo ngành nghề (F&B, Bất động sản, Thời trang, Bán lẻ)."}
                  </p>
                  <p className="text-3xs text-muted-foreground">
                    {isEn
                      ? "Allows new Agencies to instantly spin up workspaces with pre-configured approval workflows and hashtag defaults."
                      : "Giúp các Agency mới tạo lập Workspace tức thì với quy trình duyệt và hashtag định sẵn."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 6: AI PRICING & TREND CRAWLER OPERATIONS */}
          {/* ========================================================================= */}
          <section
            id="ai_crawler"
            className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 scroll-mt-24 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                  <Radar className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "6. AI Pricing & Trend Crawler Operations"
                      : "6. Quản Trị AI & Lập Lịch Cào Dữ Liệu Xu Hướng"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "AI credit rates, social crawler scheduling, and viral trend pipeline orchestration"
                      : "Điều chỉnh biểu giá credit AI, lập lịch crawler mạng xã hội và kiểm soát pipeline xu hướng"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-pink-500 text-pink-500 self-start sm:self-auto font-mono text-3xs">
                AI & CRAWLER
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn ? (
                  <>
                    BrandHub relies on an intelligent trend intelligence pipeline to surface viral content hooks for creators. Administrators supervise AI unit economics and crawler operations:
                  </>
                ) : (
                  <>
                    Hệ thống BrandHub vận hành một pipeline phân tích xu hướng thông minh để gợi ý ý tưởng lan truyền cho Creators. Quản trị viên trực tiếp quản lý biểu giá AI và hạ tầng cào dữ liệu:
                  </>
                )}
              </p>

              {/* AI Credit Pricing */}
              <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Sliders className="size-4 text-brand-orange" />
                    {isEn ? "AI Credit Pricing Matrix (/admin/credit-prices)" : "Cấu Hình Biểu Giá Credit AI (/admin/credit-prices)"}
                  </h4>
                  <Link to="/admin/credit-prices">
                    <Button variant="outline" size="sm" className="h-7 text-3xs gap-1 cursor-pointer">
                      <ExternalLink className="size-3" />
                      {isEn ? "Configure Prices" : "Chỉnh Biểu Giá"}
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEn
                    ? "Adjust token-to-credit conversion ratios per AI capability system-wide:"
                    : "Thiết lập định mức tiêu hao credit cho từng loại dịch vụ AI trên toàn hệ thống:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-card border border-border rounded p-2.5 space-y-1">
                    <span className="text-3xs text-muted-foreground font-semibold">{isEn ? "Text Generation" : "Tạo Nội Dung"}</span>
                    <p className="font-semibold text-foreground">1 - 5 Credits</p>
                    <p className="text-3xs text-muted-foreground">{isEn ? "Per copy variant" : "Mỗi biến thể bài viết"}</p>
                  </div>
                  <div className="bg-card border border-border rounded p-2.5 space-y-1">
                    <span className="text-3xs text-muted-foreground font-semibold">{isEn ? "Image Generation" : "Sinh Ảnh AI"}</span>
                    <p className="font-semibold text-foreground">5 - 15 Credits</p>
                    <p className="text-3xs text-muted-foreground">{isEn ? "Per high-res asset" : "Mỗi ảnh HD marketing"}</p>
                  </div>
                  <div className="bg-card border border-border rounded p-2.5 space-y-1">
                    <span className="text-3xs text-muted-foreground font-semibold">{isEn ? "Video Generation" : "Sinh Video AI"}</span>
                    <p className="font-semibold text-foreground">20 - 50 Credits</p>
                    <p className="text-3xs text-muted-foreground">{isEn ? "Per render sequence" : "Mỗi đoạn video render"}</p>
                  </div>
                  <div className="bg-card border border-border rounded p-2.5 space-y-1">
                    <span className="text-3xs text-muted-foreground font-semibold">{isEn ? "Brand Voice" : "Giọng Điệu Thương Hiệu"}</span>
                    <p className="font-semibold text-foreground">10 Credits</p>
                    <p className="text-3xs text-muted-foreground">{isEn ? "Per persona fine-tune" : "Mỗi lần huấn luyện"}</p>
                  </div>
                </div>
                <div className="text-3xs text-muted-foreground pt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                  {isEn
                    ? "Supports bulk pricing CSV imports via CreditPriceCsvImport tool."
                    : "Hỗ trợ nạp biểu giá hàng loạt từ file CSV tiện lợi qua công cụ nhập liệu tích hợp."}
                </div>
              </div>

              {/* Crawler Scheduling & Trend Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Radar className="size-4 text-pink-500" />
                      {isEn ? "Social Crawler Scheduling (/admin?view=crawl)" : "Lập Lịch Cào Dữ Liệu (/admin?view=crawl)"}
                    </h4>
                    <Link to="/admin?view=crawl">
                      <span className="text-3xs text-brand-orange hover:underline flex items-center gap-0.5">
                        {isEn ? "Crawl Config" : "Cấu Hình Cào"} <ChevronRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>{isEn ? "Multi-Platform Ingestion:" : "Đa nền tảng:"}</strong>{" "}
                      {isEn ? "Facebook, TikTok, YouTube, Instagram." : "Facebook, TikTok, YouTube, Instagram."}
                    </li>
                    <li>
                      <strong>{isEn ? "Cron Scheduling:" : "Lập lịch tự động:"}</strong>{" "}
                      {isEn
                        ? "Configure execution frequencies (e.g. hourly, daily) with active/inactive toggles."
                        : "Thiết lập chu kỳ quét tự động (mỗi giờ, mỗi ngày) với nút bật/tắt linh hoạt."}
                    </li>
                    <li>
                      <strong>{isEn ? "Credentials & Health:" : "Quản lý cookie:"}</strong>{" "}
                      {isEn
                        ? "Rotate account cookies and proxy pools to prevent platform throttling."
                        : "Xoay vòng cookie và proxy nhằm chống bị các mạng xã hội chặn IP."}
                    </li>
                  </ul>
                </div>

                <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Network className="size-4 text-purple-500" />
                      {isEn ? "Trend Pipeline & Knowledge Graph" : "Pipeline Xử Lý & Đồ Thị Xu Hướng"}
                    </h4>
                    <Link to="/admin?view=trendPipeline">
                      <span className="text-3xs text-brand-orange hover:underline flex items-center gap-0.5">
                        {isEn ? "Pipeline View" : "Xem Pipeline"} <ChevronRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>{isEn ? "5-Stage Pipeline:" : "Quy trình 5 giai đoạn:"}</strong>{" "}
                      {isEn
                        ? "Ingestion → Deduplication → Semantic Clustering → Viral Scoring → Knowledge Graph."
                        : "Thu thập thô → Lọc trùng → Gom cụm ngữ nghĩa → Chấm điểm lan truyền → Đồ thị tri thức."}
                    </li>
                    <li>
                      <strong>{isEn ? "Trend Graph (`/admin?view=trendGraph`):" : "Đồ thị tri thức (`/admin?view=trendGraph`):"}</strong>{" "}
                      {isEn
                        ? "Interactive 2D graph visualizing cross-industry viral correlations."
                        : "Bản đồ tương tác 2D thể hiện mối liên hệ xu hướng giữa các ngành hàng."}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 7: SYSTEM BROADCAST & EMAIL OPERATIONS */}
          {/* ========================================================================= */}
          <section
            id="notifications_email"
            className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 scroll-mt-24 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <Mail className="size-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base sm:text-lg font-bold">
                    {isEn
                      ? "7. System Broadcast & Email Infrastructure"
                      : "7. Thông Báo Hệ Thống & Vận Hành Email"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "System-wide push broadcast, user segmentation, transactional mail templates, and suppression lists"
                      : "Phát thông báo toàn hệ thống, phân nhóm người nhận, quản lý mẫu email và danh sách chặn"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant="outline" className="border-orange-500 text-orange-500 text-3xs font-medium">
                  {isEn ? "System Broadcast" : "Thông báo hệ thống"}
                </Badge>
                <Link to="/admin?view=email">
                  <Button variant="outline" size="sm" className="h-7 text-3xs gap-1 cursor-pointer">
                    <ExternalLink className="size-3" />
                    {isEn ? "Open Broadcasts" : "Phát Thông Báo"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed">
                {isEn ? (
                  <>
                    Administrators control customer communications via direct push notifications (<code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin?view=email</code>) and enterprise mail operations.
                  </>
                ) : (
                  <>
                    Quản trị viên quản lý kênh liên lạc tới khách hàng qua công cụ phát thông báo đẩy (<code className="font-mono text-brand-orange bg-muted px-1.5 py-0.5 rounded">/admin?view=email</code>) và hạ tầng thư điện tử doanh nghiệp.
                  </>
                )}
              </p>

              {/* System Broadcast Card */}
              <div className="border border-border bg-muted/15 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Send className="size-4 text-orange-500" />
                  {isEn
                    ? "System-Wide Push Broadcast"
                    : "Phát Thông Báo Toàn Hệ Thống"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                      {isEn ? "Notification Types" : "Phân Loại Thông Báo"}
                    </span>
                    <ul className="text-3xs text-muted-foreground space-y-1 pt-1">
                      <li><strong className="text-foreground">SYSTEM:</strong> {isEn ? "Policy & legal announcements" : "Chính sách, thỏa thuận dịch vụ"}</li>
                      <li><strong className="text-foreground">MAINTENANCE:</strong> {isEn ? "Scheduled maintenance outages" : "Lịch bảo trì máy chủ"}</li>
                      <li><strong className="text-foreground">UPDATE:</strong> {isEn ? "Feature launches & releases" : "Tính năng mới ra mắt"}</li>
                      <li><strong className="text-foreground">PROMOTION:</strong> {isEn ? "Credit discounts & campaigns" : "Khuyến mãi nạp credit"}</li>
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                      {isEn ? "Target Segmentation" : "Phân Nhóm Người Nhận"}
                    </span>
                    <ul className="text-3xs text-muted-foreground space-y-1 pt-1">
                      <li><strong className="text-foreground">ALL:</strong> {isEn ? "Broadcast to 100% of user accounts" : "Gửi tới 100% người dùng trên hệ thống"}</li>
                      <li><strong className="text-foreground">BY_PLAN:</strong> {isEn ? "Target Starter, Pro, or Enterprise" : "Gửi tới gói thuê bao cụ thể"}</li>
                      <li><strong className="text-foreground">BY_ROLE:</strong> {isEn ? "Target Agency Owners or Managers" : "Gửi theo vai trò (Owner, Manager...)"}</li>
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <span className="text-3xs uppercase font-bold text-muted-foreground">
                      {isEn ? "Delivery Modes" : "Phương Thức Phát Sóng"}
                    </span>
                    <ul className="text-3xs text-muted-foreground space-y-1 pt-1">
                      <li><strong className="text-foreground">{isEn ? "Immediate:" : "Gửi ngay:"}</strong> {isEn ? "Dispatches to in-app bell & toast" : "Đẩy thông báo tới chuông và pop-up"}</li>
                      <li><strong className="text-foreground">{isEn ? "Scheduled:" : "Hẹn giờ:"}</strong> {isEn ? "Timed delivery at chosen ISO instant" : "Hẹn giờ phát sóng tự động chính xác"}</li>
                      <li><strong className="text-foreground">{isEn ? "Template Picker:" : "Mẫu mail:"}</strong> {isEn ? "Pairs with system email template" : "Gắn kèm mẫu email giao dịch tương ứng"}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mail Templates, Batches & Suppressions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                <div className="border border-border bg-card rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-brand-orange" />
                      {isEn ? "Mail Templates" : "Mẫu Email"}
                    </span>
                    <Link to="/admin?view=mailTemplates">
                      <ExternalLink className="size-3 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Route `/admin?view=mailTemplates`. Manage transactional email templates (Sign-up, Reset Password, 2FA, Invites) with variable bindings."
                      : "Tuyến đường `/admin?view=mailTemplates`. Quản lý mẫu email giao dịch (Kích hoạt, Quên mật khẩu, OTP 2FA, Thư mời) với biến động."}
                  </p>
                </div>

                <div className="border border-border bg-card rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5 text-blue-500" />
                      {isEn ? "Mail Batches" : "Chiến Dịch Lô"}
                    </span>
                    <Link to="/admin?view=mailBatches">
                      <ExternalLink className="size-3 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Route `/admin?view=mailBatches`. Monitor mass email batch dispatches, delivery throughput, bounce rates, and open rates."
                      : "Tuyến đường `/admin?view=mailBatches`. Giám sát các đợt phát tán email hàng loạt, tỷ lệ mở và độ trễ chuyển giao thư."}
                  </p>
                </div>

                <div className="border border-border bg-card rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <HardDrive className="size-3.5 text-destructive" />
                      {isEn ? "Suppressions" : "Danh Sách Chặn"}
                    </span>
                    <Link to="/admin?view=mailSuppressions">
                      <ExternalLink className="size-3 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    {isEn
                      ? "Route `/admin?view=mailSuppressions`. Auto-suppresses bounced, invalid, or unsubscribed addresses to protect sender reputation."
                      : "Tuyến đường `/admin?view=mailSuppressions`. Tự động chặn các email bị trả về (bounce) hoặc hủy đăng ký nhằm bảo vệ uy tín tên miền."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminGuidePage;
