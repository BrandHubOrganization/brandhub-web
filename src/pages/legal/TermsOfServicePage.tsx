import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Shield,
  UserCheck,
  AlertTriangle,
  Scale,
  Ban,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Globe,
  Layers,
  HelpCircle,
} from "lucide-react";

export function TermsOfServicePage() {
  const [lang, setLang] = useState<"en" | "vi">("en");

  useEffect(() => {
    document.title = "BrandHub - Terms of Service";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", "Terms of Service for BrandHub");
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
            <Scale className="size-3.5" />
            <span>{lang === "en" ? "Terms & Agreements" : "Điều khoản & Thỏa thuận"}</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {lang === "en" ? "Terms of Service" : "Điều Khoản Dịch Vụ"}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {lang === "en"
              ? "These Terms of Service govern your access to and use of BrandHub, including all content, workflows, features, and services offered through our platform."
              : "Điều khoản dịch vụ này quy định quyền truy cập và sử dụng nền tảng BrandHub, bao gồm toàn bộ nội dung, quy trình, tính năng và dịch vụ được cung cấp trên hệ thống của chúng tôi."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              {lang === "en" ? "Last updated: October 27, 2026" : "Cập nhật lần cuối: 27 Tháng 10, 2026"}
            </span>
            <span>•</span>
            <span>{lang === "en" ? "Platform: BrandHub (brandhub.id.vn)" : "Nền tảng: BrandHub (brandhub.id.vn)"}</span>
            <span>•</span>
            <span>{lang === "en" ? "Applies to: All Users & Accounts" : "Áp dụng cho: Mọi người dùng & Tài khoản"}</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-foreground">
          {lang === "en" ? (
            <>
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <FileText className="size-5 text-brand-orange" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground">
                  By accessing, registering for, or using the BrandHub platform (available at{" "}
                  <a
                    href="https://brandhub.id.vn"
                    className="font-medium text-brand-orange underline hover:text-brand-orange/80"
                  >
                    https://brandhub.id.vn
                  </a>
                  ), you confirm that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you are entering into these Terms on behalf of an Agency, company, or legal entity, you represent that you have the authority to bind such entity to these Terms.
                </p>
                <p className="text-muted-foreground">
                  If you do not agree to all provisions of these Terms, you must not access or use BrandHub.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Globe className="size-5 text-brand-orange" />
                  2. Description of BrandHub
                </h2>
                <p className="text-muted-foreground">
                  BrandHub is a multi-tenant cloud software platform engineered for Marketing Agencies, Brand Managers, and Content Creators. The platform facilitates:
                </p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Agency organization management and isolated client workspaces.</li>
                  <li>• Structured three-stage content approval workflows (Creator drafting → Manager review → Client sign-off).</li>
                  <li>• Shared digital asset management, brand guidelines, and media storage integration.</li>
                  <li>• Campaign scheduling, content calendar management, and publishing to authorized third-party channels.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <UserCheck className="size-5 text-brand-orange" />
                  3. User Accounts & Authentication
                </h2>
                <p className="text-muted-foreground">
                  To access BrandHub workspace features, you must register an account. You can register either using an email and password or by authenticating with Google OAuth 2.0.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete registration information and keep your details updated.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Credential Security:</strong> You are responsible for safeguarding your password, session tokens, and two-factor authentication (2FA) codes. You must notify us immediately at <a href="mailto:brandhub404@gmail.com" className="text-brand-orange underline">brandhub404@gmail.com</a> if you suspect unauthorized account access.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span><strong>Google OAuth Authentication:</strong> When logging in via Google OAuth, you authenticate via Google's secure Identity Services. You are responsible for maintaining the security of your Google account.</span>
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Layers className="size-5 text-brand-orange" />
                  4. User Content & Ownership
                </h2>
                <p className="text-muted-foreground">
                  You retain all ownership rights, copyright, and intellectual property rights in and to the content, images, videos, marketing copy, and brand assets you or your team upload to BrandHub ("User Content").
                </p>
                <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-2">
                  <p className="font-semibold text-foreground">Limited Operational License</p>
                  <p className="text-xs text-muted-foreground">
                    Solely for the purpose of operating, hosting, and delivering BrandHub services to you (e.g., rendering previews, executing approval workflows, indexing media libraries, and publishing to your connected social channels upon your command), you grant BrandHub a non-exclusive, worldwide, royalty-free license to host, display, and process your User Content strictly as directed by your workspace configurations.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    BrandHub does not claim ownership over any client or agency media, nor do we sell or license your content to any third parties.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Ban className="size-5 text-brand-orange" />
                  5. Acceptable Use & Prohibited Activities
                </h2>
                <p className="text-muted-foreground">
                  You agree to use BrandHub only for lawful business purposes in compliance with all applicable local and international laws. You agree NOT to:
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Upload, share, or publish defamatory, obscene, fraudulent, infringing, or harmful content.</li>
                  <li>• Attempt to reverse engineer, decompile, or disassemble any part of the BrandHub application or infrastructure.</li>
                  <li>• Bypass, disable, or circumvent authentication controls, role-based access gates (RBAC), or rate limits.</li>
                  <li>• Introduce malware, viruses, trojans, or automated scripts that impair platform integrity or other users' access.</li>
                  <li>• Use the platform to send unsolicited spam, bulk marketing communications, or engage in deceptive practices.</li>
                  <li>• Misrepresent your affiliation or impersonate any person, brand, or entity.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Shield className="size-5 text-brand-orange" />
                  6. Intellectual Property of BrandHub
                </h2>
                <p className="text-muted-foreground">
                  All rights, title, and interest in and to BrandHub, including the software codebase, database schemas, user interface designs, visual layouts, logos, trademarks, and documentation, are the exclusive intellectual property of BrandHub. You are granted a limited, revocable, non-transferable right to access and use the platform in accordance with your subscription plan.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Globe className="size-5 text-brand-orange" />
                  7. Third-Party Services & Integrations
                </h2>
                <p className="text-muted-foreground">
                  BrandHub integrates with external third-party services, including Google Identity (OAuth 2.0), Google Drive API, AWS infrastructure, and Agora RTC:
                </p>
                <ul className="space-y-1.5 text-muted-foreground text-xs">
                  <li>• Your use of Google OAuth and Google Drive is subject to the applicable Google Terms of Service and Google Privacy Policy.</li>
                  <li>• BrandHub does not control third-party service availability or policy changes and is not responsible for outages or interruptions caused by external API providers.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <AlertTriangle className="size-5 text-brand-orange" />
                  8. Service Availability & Disclaimers
                </h2>
                <p className="text-muted-foreground">
                  BrandHub is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive to maintain high system uptime, data redundancy, and reliable performance, BrandHub does not warrant that the service will be uninterrupted, timely, secure, or completely error-free. Scheduled maintenance, infrastructure updates, or unexpected outages may occur.
                </p>
                <p className="text-muted-foreground">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BRANDHUB DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </section>

              {/* Section 9 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Scale className="size-5 text-brand-orange" />
                  9. Limitation of Liability
                </h2>
                <p className="text-muted-foreground">
                  TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, BRANDHUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS OPPORTUNITIES RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </section>

              {/* Section 10 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Ban className="size-5 text-brand-orange" />
                  10. Account Suspension & Termination
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your account and access to BrandHub if you violate these Terms, engage in fraudulent activities, or fail to satisfy payment obligations for paid plans. You may terminate your account at any time by deactivating your account in Settings or contacting us.
                </p>
              </section>

              {/* Section 11 */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <HelpCircle className="size-5 text-brand-orange" />
                  11. Changes to Terms
                </h2>
                <p className="text-muted-foreground">
                  We may modify these Terms of Service at any time. When modifications are made, we will update the "Last updated" date at the top of this document. Your continued use of BrandHub after revised Terms become effective constitutes your acceptance of the updated Terms.
                </p>
              </section>

              {/* Section 12 */}
              <section className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
                  <Mail className="size-5 text-brand-orange" />
                  12. Contact Information
                </h2>
                <p className="text-xs text-muted-foreground">
                  If you have questions, feedback, or legal inquiries regarding these Terms of Service:
                </p>
                <div className="mt-2 text-xs">
                  <p><strong>Platform:</strong> BrandHub</p>
                  <p><strong>Website:</strong> <a href="https://brandhub.id.vn" className="text-brand-orange hover:underline">https://brandhub.id.vn</a></p>
                  <p><strong>Support & Legal Inquiries:</strong> <a href="mailto:brandhub404@gmail.com" className="text-brand-orange hover:underline">brandhub404@gmail.com</a></p>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Vietnamese Version */}
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <FileText className="size-5 text-brand-orange" />
                  1. Chấp Thuận Điều Khoản
                </h2>
                <p className="text-muted-foreground">
                  Bằng việc truy cập, đăng ký hoặc sử dụng nền tảng BrandHub (tại{" "}
                  <a
                    href="https://brandhub.id.vn"
                    className="font-medium text-brand-orange underline hover:text-brand-orange/80"
                  >
                    https://brandhub.id.vn
                  </a>
                  ), bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ các Điều khoản dịch vụ này cùng Chính sách quyền riêng tư của chúng tôi. Nếu bạn đại diện cho một Agency, công ty hoặc tổ chức, bạn cam kết rằng bạn có đầy đủ thẩm quyền ràng buộc tổ chức đó với các điều khoản này.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Globe className="size-5 text-brand-orange" />
                  2. Mô Tả Dịch Vụ BrandHub
                </h2>
                <p className="text-muted-foreground">
                  BrandHub là nền tảng quản trị chiến dịch truyền thông đa không gian làm việc (Multi-tenant Hub) cho Agency và Nhãn hàng. Nền tảng hỗ trợ:
                </p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Quản trị tổ chức Agency và tạo các Workspace độc lập cho từng khách hàng/dự án.</li>
                  <li>• Quy trình phê duyệt bài viết chuẩn 3 vòng (Creator tạo nháp → Manager kiểm duyệt → Client phê duyệt).</li>
                  <li>• Thư viện lưu trữ tài nguyên số, bộ nhận diện thương hiệu và tích hợp lưu trữ Google Drive.</li>
                  <li>• Lịch biên tập xuất bản và liên kết kênh mạng xã hội.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <UserCheck className="size-5 text-brand-orange" />
                  3. Tài Khoản & Xác Thực
                </h2>
                <p className="text-muted-foreground">
                  Người dùng có thể đăng nhập bằng tài khoản email/mật khẩu hoặc đăng nhập một chạm qua Google OAuth. Bạn có trách nhiệm bảo mật thông tin đăng nhập, mã xác thực 2 lớp (2FA) và thông báo ngay cho ban quản trị nếu phát hiện dấu hiệu truy cập trái phép.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Layers className="size-5 text-brand-orange" />
                  4. Quyền Sở Hữu Nội Dung Người Dùng
                </h2>
                <p className="text-muted-foreground">
                  Bạn và khách hàng của bạn giữ toàn quyền sở hữu trí tuệ đối với các hình ảnh, video, bài viết và tài sản sáng tạo được tải lên Workspace. BrandHub chỉ đóng vai trò nền tảng công nghệ hỗ trợ lưu trữ, hiển thị và xuất bản theo đúng yêu cầu và thiết lập của bạn.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Ban className="size-5 text-brand-orange" />
                  5. Các Hành Vi Bị Nghiêm Cấm
                </h2>
                <p className="text-muted-foreground">
                  Nghiêm cấm phát tán nội dung vi phạm pháp luật, xâm phạm bản quyền, can thiệp trái phép vào hệ thống bảo mật, đảo ngược mã nguồn hoặc sử dụng nền tảng để gửi thư rác và quấy rối người khác.
                </p>
              </section>

              <section className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
                  <Mail className="size-5 text-brand-orange" />
                  6. Thông Tin Liên Hệ
                </h2>
                <div className="text-xs space-y-1">
                  <p><strong>Nền tảng:</strong> BrandHub</p>
                  <p><strong>Website:</strong> <a href="https://brandhub.id.vn" className="text-brand-orange hover:underline">https://brandhub.id.vn</a></p>
                  <p><strong>Email hỗ trợ:</strong> <a href="mailto:brandhub404@gmail.com" className="text-brand-orange hover:underline">brandhub404@gmail.com</a></p>
                </div>
              </section>
            </>
          )}
        </div>
      </article>
    </div>
  );
}

export default TermsOfServicePage;
