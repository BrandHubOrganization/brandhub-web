import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  BookOpen,
  ShieldCheck,
  Building2,
  FolderOpen,
  Sparkles,
  ChevronDown,
  ArrowRight,
  LifeBuoy,
  FileText,
  Mail,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FaqItem {
  id: string;
  category: "general" | "agency" | "workspace" | "content" | "security" | "billing";
  question: string;
  answer: string;
  tags: string[];
}

export function HelpFaqPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const FAQ_DATA: FaqItem[] = [
    {
      id: "faq-1",
      category: "general",
      question: "BrandHub hoạt động như thế nào và dành cho ai?",
      answer:
        "BrandHub là hệ thống quản lý nội dung đa không gian (Multi-tenant Hub) thiết kế dành riêng cho Marketing Agencies, Creators và Doanh nghiệp. Hệ thống cho phép tách biệt môi trường giữa từng Agency, quản trị các Không gian làm việc (Workspaces), phối hợp quy trình viết bài, duyệt bài qua 3 cấp (Creator -> Manager -> Client) và tự động xuất bản lên đa nền tảng.",
      tags: ["tổng quan", "cơ bản", "agency", "creator"],
    },
    {
      id: "faq-2",
      category: "agency",
      question: "Sự khác biệt giữa Công ty (Agency) và Không gian làm việc (Workspace)?",
      answer:
        "Agency là tổ chức cấp cao nhất sở hữu các gói đăng ký và quản lý nhân sự cấp quản trị. Trong mỗi Agency, bạn có thể tạo nhiều Workspace đại diện cho từng nhãn hàng, dự án hoặc từng khách hàng đối tác khác nhau. Dữ liệu bài viết, thư viện media và quyền truy cập của khách hàng được cô lập hoàn toàn giữa các Workspace.",
      tags: ["agency", "workspace", "cấu trúc", "quyền"],
    },
    {
      id: "faq-3",
      category: "workspace",
      question: "Làm thế nào để mời Khách hàng (Client) vào Workspace?",
      answer:
        "Bạn có thể mời Khách hàng trực tiếp ngay trong bước tạo Workspace mới hoặc vào trang Workspace -> chọn tab 'Khách hàng' -> nhấn 'Thêm khách hàng'. Hệ thống sẽ gửi email mời tham gia với vai trò CLIENT để họ có thể xem lịch bài và thực hiện phê duyệt/góp ý nội dung.",
      tags: ["mời client", "khách hàng", "workspace"],
    },
    {
      id: "faq-4",
      category: "content",
      question: "Quy trình phê duyệt nội dung diễn ra qua những bước nào?",
      answer:
        "Quy trình tiêu chuẩn gồm 3 bước: 1) Người sáng tạo (Creator) soạn thảo và nộp bài duyệt; 2) Trưởng nhóm/Quản lý (Manager) kiểm tra chất lượng và chuyển tiếp; 3) Khách hàng (Client) đưa ra quyết định phê duyệt cuối cùng hoặc yêu cầu chỉnh sửa kèm lý do chi tiết.",
      tags: ["quy trình", "phê duyệt", "nội dung", "client review"],
    },
    {
      id: "faq-5",
      category: "security",
      question: "Dữ liệu và quyền truy cập của từng thương hiệu được bảo vệ ra sao?",
      answer:
        "BrandHub áp dụng cơ chế phân quyền RBAC đa tầng kết hợp xác thực 2 lớp (2FA) và JWT mã hóa. Khi khách hàng đăng nhập, họ chỉ có thể xem dữ liệu thuộc Workspace được chỉ định và không thấy bất kỳ thông tin nội bộ nào của Agency hoặc các khách hàng khác.",
      tags: ["bảo mật", "2fa", "quyền truy cập", "cô lập dữ liệu"],
    },
    {
      id: "faq-6",
      category: "billing",
      question: "Làm thế nào để nâng cấp gói tài khoản hoặc quản lý hóa đơn?",
      answer:
        "Quản trị viên (Owner) có thể truy cập mục 'Đăng ký & Gói cước' để xem các gói dịch vụ (Starter, Pro, Enterprise), kiểm tra hạn mức bài đăng, lượt xuất bản hàng tháng và tải xuống hóa đơn điện tử VAT.",
      tags: ["gói cước", "thanh toán", "hóa đơn", "nâng cấp"],
    },
    {
      id: "faq-7",
      category: "agency",
      question: "Hồ sơ thương hiệu (Client Profile) dùng để làm gì?",
      answer:
        "Hồ sơ thương hiệu lưu trữ thông tin nhận diện (Logo, Tên pháp nhân, Tagline, Bảng màu thương hiệu và Font chữ). Khi tạo bài viết mới, hệ thống tự động gắn bộ nhận diện này vào mẫu nội dung để đảm bảo tính đồng bộ nhận diện cao nhất.",
      tags: ["hồ sơ thương hiệu", "brand kit", "logo"],
    },
  ];

  const categories = [
    { id: "all", label: "Tất cả câu hỏi", icon: BookOpen },
    { id: "general", label: "Tổng quan", icon: HelpCircle },
    { id: "agency", label: "Agency & Tổ chức", icon: Building2 },
    { id: "workspace", label: "Workspace & Nhóm", icon: FolderOpen },
    { id: "content", label: "Quy trình nội dung", icon: Sparkles },
    { id: "security", label: "Bảo mật & Quyền", icon: ShieldCheck },
    { id: "billing", label: "Gói cước & Hóa đơn", icon: FileText },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <PageWrapper
      title={t("help.title", "Trung Tâm Trợ Giúp & Hướng Dẫn Hệ Thống")}
      description={t(
        "help.description",
        "Tra cứu nhanh câu hỏi thường gặp (FAQ), tài liệu kiến trúc quy trình và cẩm nang quản trị cho Quản lý & Thành viên BrandHub.",
      )}
      bannerBadge={t("help.badge", "Trợ giúp & Hỗ trợ")}
      actions={
        <Link to="/help/guide">
          <Button variant="default" size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer gap-1.5 text-xs">
            <BookOpen className="size-3.5" />
            {t("help.adminGuideButton", "Cẩm Nang Hướng Dẫn Toàn Tập")}
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Search Bar & Quick Categories */}
        <div className="border-border bg-card rounded-2xl border p-6 shadow-xs space-y-5">
          <div className="relative max-w-2xl mx-auto">
            <Search className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5" />
            <Input
              type="text"
              placeholder={t("help.searchPlaceholder", "Tìm kiếm theo từ khóa (ví dụ: mời client, tạo workspace, duyệt bài, 2fa)...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-muted/30 focus-visible:ring-brand-orange rounded-xl"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-orange text-white shadow-xs font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-foreground text-sm font-bold flex items-center gap-2">
              <HelpCircle className="size-4 text-brand-orange" />
              <span>Câu hỏi thường gặp ({filteredFaqs.length})</span>
            </h2>
            <Link
              to="/help/guide"
              className="text-brand-orange hover:underline text-xs flex items-center gap-1 font-medium"
            >
              Xem tài liệu quy trình đầy đủ <ArrowRight className="size-3" />
            </Link>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="border-border/60 rounded-xl border border-dashed p-10 text-center space-y-2">
              <p className="text-muted-foreground text-xs">
                Không tìm thấy kết quả phù hợp với từ khóa "{searchQuery}".
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs"
              >
                Xóa bộ lọc tìm kiếm
              </Button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border-border bg-card rounded-xl border transition-all duration-200 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-foreground text-sm font-semibold pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`text-muted-foreground size-4 shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-brand-orange" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/60 bg-muted/15 p-4.5 text-xs text-foreground/90 leading-relaxed space-y-3">
                      <p>{faq.answer}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {faq.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-muted text-muted-foreground text-3xs rounded-md px-2 py-0.5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support & Admin Banner */}
        <div className="border-border bg-gradient-to-r from-card via-card to-brand-orange/5 rounded-2xl border p-6 max-w-4xl mx-auto shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-foreground text-sm font-bold flex items-center gap-2 justify-center sm:justify-start">
              <LifeBuoy className="size-4 text-brand-orange" />
              Bạn cần thêm sự hỗ trợ kỹ thuật hoặc tính năng tùy chỉnh?
            </h3>
            <p className="text-muted-foreground text-xs">
              Đội ngũ kỹ sư hỗ trợ BrandHub luôn sẵn sàng phản hồi trong vòng 24 giờ.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a href="mailto:brandhub404@gmail.com">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
                <Mail className="size-3.5" /> Gửi phản hồi
              </Button>
            </a>
            <Link to="/help/guide">
              <Button variant="default" size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-1.5 text-xs cursor-pointer">
                <BookOpen className="size-3.5" /> Xem cẩm nang
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default HelpFaqPage;
