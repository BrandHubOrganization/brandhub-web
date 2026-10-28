import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  KeyRound,
  Database,
  UserCheck,
  RefreshCw,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe,
  FileCheck,
} from "lucide-react";

export function PrivacyPolicyPage() {
  const [lang, setLang] = useState<"en" | "vi">("en");

  useEffect(() => {
    document.title = "BrandHub - Privacy Policy";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", "Privacy Policy for BrandHub");
  }, []);

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-10">
      {/* Back button & Language Switcher */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-brand-orange"
        >
          <ArrowLeft className="size-3.5" />
          {lang === "en" ? "Back to BrandHub" : "Quay lại trang chủ"}
        </Link>

        {/* In-page language toggle */}
        <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              lang === "en"
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("vi")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              lang === "vi"
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tiếng Việt
          </button>
        </div>
      </div>

      {/* Main Document Container */}
      <article className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-10">
        {/* Header */}
        <header className="border-b border-border/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
            <ShieldCheck className="size-3.5" />
            <span>{lang === "en" ? "Privacy & Data Protection" : "Bảo mật & Quyền riêng tư"}</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {lang === "en" ? "Privacy Policy" : "Chính Sách Quyền Riêng Tư"}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {lang === "en"
              ? "This Privacy Policy explains how BrandHub collects, uses, protects, and discloses personal data and Google user data when you access or use the BrandHub platform."
              : "Chính sách quyền riêng tư này giải thích cách BrandHub thu thập, sử dụng, bảo vệ và xử lý dữ liệu cá nhân cũng như dữ liệu người dùng Google khi bạn truy cập hoặc sử dụng nền tảng BrandHub."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              {lang === "en" ? "Last updated: October 27, 2026" : "Cập nhật lần cuối: 27 Tháng 10, 2026"}
            </span>
            <span>•</span>
            <span>{lang === "en" ? "Platform: BrandHub (brandhub.id.vn)" : "Nền tảng: BrandHub (brandhub.id.vn)"}</span>
            <span>•</span>
            <span>{lang === "en" ? "Applies to: All Users & Workspaces" : "Áp dụng cho: Mọi người dùng & Workspace"}</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-foreground">
          {lang === "en" ? (
            <>
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Globe className="size-5 text-brand-orange" />
                  1. About BrandHub
                </h2>
                <p className="text-muted-foreground">
                  BrandHub (accessible at{" "}
                  <a
                    href="https://brandhub.id.vn"
                    className="font-medium text-brand-orange underline hover:text-brand-orange/80"
                  >
                    https://brandhub.id.vn
                  </a>
                  ) is a multi-tenant digital marketing campaign governance, content collaboration, and multi-channel publishing platform. Designed for Marketing Agencies, Creators, and Enterprise Brands, BrandHub provides segregated workspace environments, multi-tier content approval workflows (Creator → Manager → Client), shared media libraries, and social publishing automation.
                </p>
                <p className="text-muted-foreground">
                  BrandHub is committed to respecting your privacy, protecting your personal data, and maintaining the highest standards of data security and transparency.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Database className="size-5 text-brand-orange" />
                  2. Information We Collect
                </h2>
                <p className="text-muted-foreground">
                  We collect information necessary to operate the service, authenticate users, and provide secure collaboration. The types of data collected include:
                </p>

                <div className="space-y-3 pl-1">
                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">A. Account & Profile Information</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      When you register directly using an email and password, we collect your full name, email address, salted password hash, optional telephone number, and avatar image.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">B. Google OAuth & Identity Information</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      When you choose to sign in, create an account, or link your Google Account via Google OAuth 2.0, BrandHub requests access to basic profile scopes: <code className="rounded bg-muted px-1.5 py-0.5 text-3xs font-mono text-foreground">openid email profile</code>. From Google Identity Services, BrandHub receives:
                    </p>
                    <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Full Name:</strong> to identify you in your workspace</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Email Address:</strong> for login and account notifications</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Profile Picture:</strong> to display your user avatar</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Google Account ID:</strong> unique identifier to link your account</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">C. Google Drive Integration (Optional Workspace Storage)</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Agency Managers and Workspace Owners have the option to connect a Google Drive account to an Agency Workspace to sync and manage creative brand assets. When enabled, BrandHub uses the Google Drive API (<code className="rounded bg-muted px-1.5 py-0.5 text-3xs font-mono text-foreground">drive.file</code> or <code className="rounded bg-muted px-1.5 py-0.5 text-3xs font-mono text-foreground">drive</code> scope):
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• <strong>Scope of Access:</strong> BrandHub only accesses designated agency storage folders (e.g. <code className="rounded bg-muted px-1 py-0.5 font-mono">brandhub-[agency-name]</code>) and files created or explicitly selected within the workspace integration. BrandHub does not inspect or access your personal, unrelated Google Drive files.</li>
                      <li>• <strong>Purpose:</strong> Synchronizing and organizing creative media packages, brand guidelines, campaign photos, and video deliverables.</li>
                      <li>• <strong>Storage:</strong> Files remain safely hosted in your Google Drive. BrandHub only stores file identifiers, metadata (file names, MIME types, sizes), and encrypted OAuth refresh tokens.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">D. User-Uploaded Content & Media</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Marketing drafts, social post copy, uploaded graphics, videos, task comments, and approval notes created by users within their respective workspaces.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">E. Cookies & Local Storage</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      BrandHub utilizes browser Local Storage and essential session cookies strictly for authentication session tokens, theme preferences (<code className="rounded bg-muted px-1 py-0.5 font-mono">light/dark</code>), and UI language settings (<code className="rounded bg-muted px-1 py-0.5 font-mono">brandhub-lang</code>). We do not use third-party advertising tracking cookies.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <UserCheck className="size-5 text-brand-orange" />
                  3. How Personal Information Is Used
                </h2>
                <p className="text-muted-foreground">
                  BrandHub processes collected data solely for legitimate business operations and service delivery:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Authentication & Account Management:</strong> Verifying your identity, enabling Single Sign-On via Google OAuth, facilitating multi-factor authentication (2FA), and maintaining secure login sessions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Workspace Governance & Collaboration:</strong> Routing content drafts through three-tier approval chains (Creator → Manager → Client), tracking task revisions, and organizing client brand materials.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Service Notifications:</strong> Sending transactional verification OTPs, workspace invitations, task approval notifications, and essential security announcements.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Security & Audit Logging:</strong> Detecting unauthorized access, preventing malicious abuse, and maintaining immutable audit trails of workspace actions.</span>
                  </li>
                </ul>
              </section>

              {/* Section 4 - Google API Compliance Highlight */}
              <section className="space-y-4 rounded-xl border-2 border-brand-orange/40 bg-brand-orange/5 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-5 text-brand-orange" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    4. Google API User Data Policy & Limited Use Disclosure
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  BrandHub strictly complies with the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand-orange underline hover:text-brand-orange/80"
                  >
                    Google API Services User Data Policy
                    <ExternalLink className="size-3" />
                  </a>
                  , including the <strong>Limited Use</strong> requirements:
                </p>
                <div className="grid grid-cols-1 gap-3 pt-1 text-xs sm:grid-cols-2">
                  <div className="rounded-lg border border-border/80 bg-card p-3">
                    <p className="font-semibold text-foreground">No Transfer or Sale of Data</p>
                    <p className="mt-1 text-muted-foreground">
                      BrandHub will never sell, lease, or transfer Google user data to data brokers, ad networks, or any third party for marketing or advertising purposes.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card p-3">
                    <p className="font-semibold text-foreground">No AI/ML Model Training</p>
                    <p className="mt-1 text-muted-foreground">
                      User data obtained through Google APIs is never used to train generalized artificial intelligence or machine learning models.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card p-3">
                    <p className="font-semibold text-foreground">Limited Purpose Only</p>
                    <p className="mt-1 text-muted-foreground">
                      Data accessed via Google APIs is used solely to provide user-facing features prominently displayed in the BrandHub application (authentication and asset storage).
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card p-3">
                    <p className="font-semibold text-foreground">Strict Human Access Limits</p>
                    <p className="mt-1 text-muted-foreground">
                      Humans cannot read user Google data unless the user explicitly grants permission for support, required by law, or when data is aggregated and anonymized.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Lock className="size-5 text-brand-orange" />
                  5. Data Storage & Security
                </h2>
                <p className="text-muted-foreground">
                  We protect your information using industry-recognized administrative, technical, and physical safeguards:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Encryption in Transit:</strong> All communications between your browser and BrandHub servers are encrypted using modern Transport Layer Security (TLS 1.2 / TLS 1.3 / HTTPS).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Encryption at Rest:</strong> Database records, encrypted OAuth refresh tokens (using AES-GCM encryption), and storage backups are encrypted at rest.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Role-Based Access Control (RBAC):</strong> Multi-tenant isolation ensures data belonging to one Agency or Workspace cannot be accessed by unauthorized members of another workspace.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Two-Factor Authentication (2FA):</strong> Optional TOTP-based two-factor authentication provides an extra layer of protection against unauthorized access.</span>
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Eye className="size-5 text-brand-orange" />
                  6. Data Sharing & Third-Party Services
                </h2>
                <p className="text-muted-foreground">
                  We do not sell personal data. We share information only with trusted third-party service providers who assist us in operating our platform under strict confidentiality agreements:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Cloud Infrastructure:</strong> Amazon Web Services (AWS) for secure hosting, database services, and content delivery (CloudFront).</li>
                  <li>• <strong>Google APIs:</strong> Google Identity Services (OAuth 2.0 authentication) and Google Drive API (workspace asset storage).</li>
                  <li>• <strong>Real-Time Communication:</strong> Agora RTC for in-workspace audio/video team collaboration.</li>
                  <li>• <strong>Transactional Email Delivery:</strong> For delivering account verification OTPs and workspace invitation emails.</li>
                  <li>• <strong>Legal Compliance:</strong> When required by lawful summons, regulatory requests, or to enforce our Terms of Service.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <RefreshCw className="size-5 text-brand-orange" />
                  7. Data Retention & Deletion
                </h2>
                <p className="text-muted-foreground">
                  We retain personal data for as long as your account remains active or as needed to provide our services. You have the right to request deletion of your account and personal data at any time:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Account Deactivation:</strong> You can initiate account deactivation in Account Settings or by contacting support. Upon account deletion, personal credentials and identifiers are permanently purged or anonymized.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Google Account Unlinking:</strong> You can disconnect your linked Google Account directly in BrandHub Account Settings or revoke permissions via{" "}
                      <a
                        href="https://myaccount.google.com/permissions"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand-orange underline hover:text-brand-orange/80"
                      >
                        Google Account Permissions
                      </a>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-brand-orange" />
                    <span><strong>Google Drive Disconnection:</strong> Workspace Managers can disconnect Google Drive at any time in Workspace Storage Settings. Disconnecting immediately invalidates and purges the stored OAuth refresh token from BrandHub.</span>
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <KeyRound className="size-5 text-brand-orange" />
                  8. Your Privacy Rights
                </h2>
                <p className="text-muted-foreground">
                  Depending on your jurisdiction, you may have the following rights regarding your personal information:
                </p>
                <ul className="grid grid-cols-1 gap-2 text-muted-foreground sm:grid-cols-2">
                  <li className="rounded-lg border border-border/80 bg-card p-3">
                    <strong>Right of Access:</strong> Request a copy of the personal information BrandHub holds about you.
                  </li>
                  <li className="rounded-lg border border-border/80 bg-card p-3">
                    <strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal details.
                  </li>
                  <li className="rounded-lg border border-border/80 bg-card p-3">
                    <strong>Right to Erasure:</strong> Request the deletion of your personal data ("Right to be Forgotten").
                  </li>
                  <li className="rounded-lg border border-border/80 bg-card p-3">
                    <strong>Right to Withdraw Consent:</strong> Revoke consent for data processing (such as unlinking Google OAuth).
                  </li>
                </ul>
              </section>

              {/* Section 9 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <AlertCircle className="size-5 text-brand-orange" />
                  9. Policy Updates
                </h2>
                <p className="text-muted-foreground">
                  We may periodically revise this Privacy Policy to reflect system improvements, legal mandates, or new integrations. Any revisions will be published on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              {/* Section 10 */}
              <section className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
                  <Mail className="size-5 text-brand-orange" />
                  10. Contact Us
                </h2>
                <p className="text-xs text-muted-foreground">
                  If you have questions, inquiries, or requests concerning this Privacy Policy, your personal data, or our Google API integration, please contact our privacy team:
                </p>
                <div className="mt-2 text-xs">
                  <p><strong>Platform:</strong> BrandHub</p>
                  <p><strong>Website:</strong> <a href="https://brandhub.id.vn" className="text-brand-orange hover:underline">https://brandhub.id.vn</a></p>
                  <p><strong>Email:</strong> <a href="mailto:brandhub404@gmail.com" className="text-brand-orange hover:underline">brandhub404@gmail.com</a></p>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Vietnamese Version */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Globe className="size-5 text-brand-orange" />
                  1. Giới thiệu về BrandHub
                </h2>
                <p className="text-muted-foreground">
                  BrandHub (truy cập tại{" "}
                  <a
                    href="https://brandhub.id.vn"
                    className="font-medium text-brand-orange underline hover:text-brand-orange/80"
                  >
                    https://brandhub.id.vn
                  </a>
                  ) là nền tảng quản trị chiến dịch truyền thông đa không gian làm việc (Multi-tenant Hub), cộng tác sáng tạo nội dung và xuất bản đa kênh dành cho Marketing Agencies, Creators và Doanh nghiệp. Hệ thống cung cấp môi trường cô lập giữa các Agency, quản lý Không gian làm việc (Workspaces), quy trình phê duyệt nội dung 3 cấp (Creator → Manager → Client), thư viện tài nguyên số và tích hợp xuất bản tự động.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Database className="size-5 text-brand-orange" />
                  2. Thông Tin Chúng Tôi Thu Thập
                </h2>
                <div className="space-y-3 pl-1">
                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">A. Thông Tin Tài Khoản</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Họ và tên, địa chỉ email, mật khẩu đã được mã hóa bảo mật (hash), số điện thoại (tùy chọn) và ảnh đại diện khi đăng ký trực tiếp.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">B. Thông Tin Xác Thực Google OAuth</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Khi bạn chọn đăng nhập, tạo tài khoản hoặc liên kết tài khoản qua Google OAuth 2.0, BrandHub yêu cầu quyền truy cập các phạm vi cơ bản: <code className="rounded bg-muted px-1.5 py-0.5 text-3xs font-mono text-foreground">openid email profile</code>. BrandHub nhận được:
                    </p>
                    <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Họ và tên:</strong> để hiển thị người dùng trong workspace</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Địa chỉ email:</strong> dùng để đăng nhập và gửi thông báo</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Ảnh đại diện:</strong> hiển thị avatar tài khoản</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span><strong>Mã định danh Google:</strong> liên kết tài khoản duy nhất</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-background/60 p-4">
                    <h3 className="font-semibold text-foreground">C. Tích Hợp Google Drive (Lưu Trữ Tài Nguyên Workspace)</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Quản lý Agency có thể chủ động kết nối tài khoản Google Drive để đồng bộ và lưu trữ gói tài nguyên media (hình ảnh, video quảng cáo, tài liệu thiết kế). BrandHub chỉ truy cập thư mục tài nguyên được chỉ định (vd: <code className="rounded bg-muted px-1 py-0.5 font-mono">brandhub-[tên-agency]</code>) qua phạm vi <code className="rounded bg-muted px-1.5 py-0.5 text-3xs font-mono text-foreground">drive.file</code> hoặc <code className="rounded bg-muted px-1.5 py-0.5 text-3xs font-mono text-foreground">drive</code>. BrandHub không truy cập các tệp riêng tư cá nhân ngoài phạm vi này. Tệp gốc được lưu trữ an toàn trên Google Drive của bạn; BrandHub chỉ lưu mã tệp và token đã mã hóa AES-GCM.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-xl border-2 border-brand-orange/40 bg-brand-orange/5 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-5 text-brand-orange" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    3. Cam Kết Tuân Thủ Chính Sách Dữ Liệu Người Dùng Google API
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  BrandHub tuân thủ nghiêm ngặt Chính sách dữ liệu người dùng của dịch vụ Google API (Google API Services User Data Policy), bao gồm các yêu cầu về <strong>Sử Dụng Giới Hạn (Limited Use)</strong>:
                </p>
                <div className="grid grid-cols-1 gap-3 pt-1 text-xs sm:grid-cols-2">
                  <div className="rounded-lg border border-border/80 bg-card p-3">
                    <p className="font-semibold text-foreground">Không bán dữ liệu Google</p>
                    <p className="mt-1 text-muted-foreground">
                      Không bao giờ bán, cho thuê hoặc chuyển nhượng dữ liệu người dùng Google cho bên thứ ba, nhà môi giới dữ liệu hoặc mạng quảng cáo.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card p-3">
                    <p className="font-semibold text-foreground">Không dùng để huấn luyện AI/ML</p>
                    <p className="mt-1 text-muted-foreground">
                      Dữ liệu nhận từ Google API không được dùng để huấn luyện bất kỳ mô hình trí tuệ nhân tạo (AI) hay học máy (ML) tổng quát nào.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Lock className="size-5 text-brand-orange" />
                  4. Lưu Trữ, Bảo Mật & Hủy Quyền Truy Cập
                </h2>
                <p className="text-muted-foreground">
                  Mọi kết nối dữ liệu được mã hóa bằng giao thức TLS 1.3 (HTTPS). Dữ liệu nhạy cảm và token kết nối được mã hóa AES-GCM tại máy chủ. Bạn có quyền ngắt liên kết Google bất kỳ lúc nào tại Cài đặt bảo mật hoặc qua trang{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-orange underline hover:text-brand-orange/80"
                  >
                    Quyền truy cập tài khoản Google
                  </a>.
                </p>
              </section>

              <section className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
                  <Mail className="size-5 text-brand-orange" />
                  5. Thông Tin Liên Hệ
                </h2>
                <div className="text-xs space-y-1">
                  <p><strong>Nền tảng:</strong> BrandHub</p>
                  <p><strong>Website:</strong> <a href="https://brandhub.id.vn" className="text-brand-orange hover:underline">https://brandhub.id.vn</a></p>
                  <p><strong>Email hỗ trợ & bảo mật:</strong> <a href="mailto:brandhub404@gmail.com" className="text-brand-orange hover:underline">brandhub404@gmail.com</a></p>
                </div>
              </section>
            </>
          )}
        </div>
      </article>
    </div>
  );
}

export default PrivacyPolicyPage;
