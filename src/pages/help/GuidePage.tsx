import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Building2,
  FolderOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowLeft,
  FileText,
  HelpCircle,
  KeyRound,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

export function AdminGuidePage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("architecture");

  const SECTIONS = [
    {
      id: "architecture",
      title: "1. Mô Hình Kiến Trúc Đa Cấp",
      icon: Layers,
    },
    {
      id: "agency",
      title: "2. Quản Trị Công Ty (Agency)",
      icon: Building2,
    },
    {
      id: "workspace",
      title: "3. Không Gian Làm Việc & Mời Khách Hàng",
      icon: FolderOpen,
    },
    {
      id: "approval",
      title: "4. Quy Trình Phê Duyệt 3 Vòng (Approval Chain)",
      icon: CheckCircle2,
    },
    {
      id: "roles",
      title: "5. Phân Quyền & Bảo Mật (RBAC)",
      icon: KeyRound,
    },
    {
      id: "notes",
      title: "6. Ghi Chú Dành Cho Administrator",
      icon: FileText,
    },
  ];

  return (
    <PageWrapper
      title={t("help.guideTitle", "Cẩm Nang Quản Trị & Vận Hành Hệ Thống")}
      description={t(
        "help.guideDescription",
        "Tài liệu hướng dẫn chi tiết quy trình, kiến trúc hệ thống đa không gian và nguyên tắc vận hành cho Admin & Quản lý BrandHub.",
      )}
      bannerBadge={t("help.guideBadge", "Tài liệu kỹ thuật & Cẩm nang")}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/help/faq">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <HelpCircle className="size-3.5" />
              {t("help.backToFaq", "Hỏi đáp FAQ")}
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="default" size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-1.5 text-xs cursor-pointer">
              <ArrowLeft className="size-3.5" />
              {t("help.backToDashboard", "Về Dashboard")}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation Sidebar Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 border-border bg-card rounded-xl border p-4 shadow-xs space-y-2">
            <h3 className="text-foreground text-xs font-bold uppercase tracking-wider mb-3">
              Mục lục cẩm nang
            </h3>
            <div className="space-y-1">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-brand-orange text-white font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="bg-muted/40 rounded-lg p-3 text-3xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="size-3 text-brand-orange" /> BrandHub Guide v2.4
                </p>
                <p>Cập nhật lần cuối: Tháng 10/2026 bởi Ban Quản Trị Hệ Thống.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Document Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Section 1 */}
          <div id="architecture" className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <Layers className="size-5 text-brand-orange" />
              <h2 className="text-foreground text-base font-bold">1. Mô Hình Kiến Trúc Đa Cấp</h2>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              BrandHub được xây dựng theo mô hình phân tầng phân cấp đa thực thể (Multi-tenant Hierarchy) nhằm đáp ứng nhu cầu của các Agency lớn quản lý cùng lúc hàng chục nhãn hàng:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="border-border bg-muted/20 rounded-lg border p-4 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-brand-orange">Cấp 1: Agency</span>
                <p className="text-xs font-semibold text-foreground">Công ty / Tổ chức</p>
                <p className="text-3xs text-muted-foreground">
                  Nắm quyền sở hữu pháp nhân, gói thanh toán doanh nghiệp, bảng màu nhận diện thương hiệu và quản lý đội ngũ nhân sự toàn công ty.
                </p>
              </div>
              <div className="border-border bg-muted/20 rounded-lg border p-4 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-blue-500">Cấp 2: Workspace</span>
                <p className="text-xs font-semibold text-foreground">Không gian chiến dịch</p>
                <p className="text-3xs text-muted-foreground">
                  Phân vùng dự án cụ thể. Nơi các Creators sản xuất bài viết, lưu trữ tài nguyên media và tương tác trực tiếp với khách hàng.
                </p>
              </div>
              <div className="border-border bg-muted/20 rounded-lg border p-4 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-emerald-500">Cấp 3: Client Space</span>
                <p className="text-xs font-semibold text-foreground">Cổng khách hàng</p>
                <p className="text-3xs text-muted-foreground">
                  Cổng duyệt bài trực quan, bảo mật cao. Khách hàng chỉ xem đúng bài viết thuộc phạm vi hợp đồng mà không thấy thông tin nội bộ khác.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div id="agency" className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <Building2 className="size-5 text-brand-orange" />
              <h2 className="text-foreground text-base font-bold">2. Quản Trị Công Ty (Agency)</h2>
            </div>
            <ul className="text-xs text-foreground/90 space-y-2.5 list-disc pl-5">
              <li>
                <strong>Tạo Agency:</strong> Mỗi người dùng có thể tạo một hoặc nhiều Agency riêng hoặc tham gia vào Agency của đối tác thông qua lời mời qua email.
              </li>
              <li>
                <strong>Quản lý Thành viên Agency:</strong> Chủ sở hữu (Owner) có thể phân quyền cấp Agency gồm: Owner, Manager, Member.
              </li>
              <li>
                <strong>Hồ sơ thương hiệu (Client Profile):</strong> Cho phép khai báo bảng màu sắc (HEX), logo đại diện, slogan và tagline công ty để áp dụng tự động cho các chiến dịch quảng cáo.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div id="workspace" className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <FolderOpen className="size-5 text-brand-orange" />
              <h2 className="text-foreground text-base font-bold">3. Không Gian Làm Việc & Mời Khách Hàng</h2>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              Mỗi Workspace tương đương với một phòng làm việc của chiến dịch. Để mời đối tác hoặc nhân sự khách hàng vào Workspace:
            </p>
            <div className="border-border bg-muted/15 rounded-lg border p-4 space-y-2 text-xs">
              <p className="font-semibold text-foreground">📌 Lưu ý quan trọng về luồng mời khách hàng (Client):</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Khách hàng là cộng tác viên bên ngoài (External Collaborator). Do đó hệ thống phân tách hoàn toàn giữa lời mời cấp Công ty và lời mời cấp Workspace:
              </p>
              <ul className="list-decimal pl-5 space-y-1 text-muted-foreground">
                <li>Khi tạo Workspace: Bạn có thể nhập email khách hàng ngay ở bước khởi tạo để gửi thư mời tự động.</li>
                <li>Trong Workspace đang chạy: Chọn tab <strong>"Khách hàng"</strong> → nhấn <strong>"Thêm khách hàng"</strong>.</li>
                <li>API sẽ gửi lời mời trực tiếp đến người dùng với quyền vai trò <code>CLIENT</code>.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div id="approval" className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <CheckCircle2 className="size-5 text-brand-orange" />
              <h2 className="text-foreground text-base font-bold">4. Quy Trình Phê Duyệt 3 Vòng (Approval Chain)</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/10">
                <span className="bg-brand-orange/10 text-brand-orange rounded-md px-2 py-1 font-bold text-3xs shrink-0">VÒNG 1</span>
                <div>
                  <p className="font-semibold text-foreground">Creator Soạn Thảo (Drafting)</p>
                  <p className="text-muted-foreground text-3xs mt-0.5">
                    Người sáng tạo chuẩn bị văn bản, ảnh, video, chọn tài khoản mạng xã hội và nhấn "Nộp duyệt nội dung".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/10">
                <span className="bg-blue-500/10 text-blue-500 rounded-md px-2 py-1 font-bold text-3xs shrink-0">VÒNG 2</span>
                <div>
                  <p className="font-semibold text-foreground">Manager Đánh Giá Nội Bộ</p>
                  <p className="text-muted-foreground text-3xs mt-0.5">
                    Quản lý chiến dịch kiểm tra chất lượng, tính tuân thủ nhận diện thương hiệu. Nếu cần sửa, trả về cho Creator kèm lý do. Nếu đạt, chuyển tiếp đến Khách hàng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/10">
                <span className="bg-emerald-500/10 text-emerald-500 rounded-md px-2 py-1 font-bold text-3xs shrink-0">VÒNG 3</span>
                <div>
                  <p className="font-semibold text-foreground">Khách Hàng Phê Duyệt & Xuất Bản Tự Động</p>
                  <p className="text-muted-foreground text-3xs mt-0.5">
                    Khách hàng đăng nhập cổng Portal, duyệt nhanh trên điện thoại hoặc máy tính. Khi được duyệt, hệ thống kích hoạt bộ lập lịch tự động đăng bài theo lịch hẹn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div id="roles" className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <KeyRound className="size-5 text-brand-orange" />
              <h2 className="text-foreground text-base font-bold">5. Phân Quyền & Bảo Mật (RBAC)</h2>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-3xs uppercase">
                    <th className="py-2 pr-4 font-semibold">Vai trò</th>
                    <th className="py-2 pr-4 font-semibold">Phạm vi truy cập</th>
                    <th className="py-2 font-semibold">Quyền hạn chính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-foreground">OWNER</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">Toàn bộ Agency & Workspaces</td>
                    <td className="py-2.5 text-foreground/90">Toàn quyền cấu hình thanh toán, quản lý nhân sự, xóa/đổi tên</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-foreground">MANAGER</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">Workspace được giao</td>
                    <td className="py-2.5 text-foreground/90">Duyệt bài vòng 1, lên lịch đăng bài, quản lý thành viên nhóm</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-foreground">CREATOR</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">Thư viện nội dung & Editor</td>
                    <td className="py-2.5 text-foreground/90">Viết bài, tải ảnh/video, tạo chiến dịch và nộp duyệt</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-foreground">CLIENT</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">Cổng duyệt bài được mời</td>
                    <td className="py-2.5 text-foreground/90">Chỉ xem bài viết, duyệt (Approve) hoặc yêu cầu sửa (Revision)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6 */}
          <div id="notes" className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <FileText className="size-5 text-brand-orange" />
              <h2 className="text-foreground text-base font-bold">6. Ghi Chú Dành Cho Administrator</h2>
            </div>
            <div className="space-y-2.5 text-xs text-foreground/90 leading-relaxed">
              <p>
                Hệ thống BrandHub tích hợp cơ chế bảo vệ kép cho tài khoản quản trị:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Khuyến nghị tất cả Quản trị viên kích hoạt xác thực 2 bước (2FA) tại mục Cài đặt Bảo mật.</li>
                <li>Theo dõi định kỳ bảng điều khiển <strong>Admin Panel</strong> để kiểm tra tình trạng tải máy chủ và phản hồi hệ thống.</li>
                <li>Nếu cần hỗ trợ kỹ thuật hoặc tích hợp API webhook mở rộng, vui lòng liên hệ đội ngũ phát triển qua <code>brandhub404@gmail.com</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminGuidePage;
