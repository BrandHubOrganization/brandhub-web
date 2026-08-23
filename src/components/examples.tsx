import * as React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Input,
  Modal,
  Badge,
  Spinner,
  Dropdown,
  DataTable,
  useToast,
} from "@/components/ui";
import {
  Search,
  Mail,
  Plus,
  Settings,
  Trash2,
  Share2,
  AlertCircle,
  Home,
} from "lucide-react";

// Mock Data for Table
interface ContentItem {
  id: string;
  title: string;
  channel: string;
  views: number;
  status: "draft" | "scheduled" | "published" | "pending_review";
  updatedAt: string;
}

const mockData: ContentItem[] = [
  {
    id: "1",
    title: "10 Mẹo Thiết Kế Với BrandHub",
    channel: "Instagram",
    views: 1250,
    status: "published",
    updatedAt: "2026-07-15",
  },
  {
    id: "2",
    title: "Xu Hướng Content Marketing 2026",
    channel: "LinkedIn",
    views: 840,
    status: "scheduled",
    updatedAt: "2026-07-16",
  },
  {
    id: "3",
    title: "Hướng Dẫn Tích Hợp AI Vào Quy Trình",
    channel: "Blog",
    views: 3100,
    status: "pending_review",
    updatedAt: "2026-07-14",
  },
  {
    id: "4",
    title: "Video Giới Thiệu Tính Năng Mới",
    channel: "TikTok",
    views: 4500,
    status: "published",
    updatedAt: "2026-07-10",
  },
  {
    id: "5",
    title: "Chiến Dịch Email Marketing Mùa Hè",
    channel: "Newsletter",
    views: 0,
    status: "draft",
    updatedAt: "2026-07-17",
  },
  {
    id: "6",
    title: "Kế Hoạch Ra Mắt Sản Phẩm Q3",
    channel: "LinkedIn",
    views: 150,
    status: "draft",
    updatedAt: "2026-07-17",
  },
];

export default function ExamplesPage() {
  const { success, error, warning, info } = useToast();

  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Input states (Controlled mode)
  const [controlledVal, setControlledVal] = React.useState("");

  // Table states
  const [tableData, setTableData] = React.useState<ContentItem[]>(mockData);
  const [isTableLoading, setIsTableLoading] = React.useState(false);

  // Simulating table loading state
  const handleReloadTable = () => {
    setIsTableLoading(true);
    setTimeout(() => {
      setIsTableLoading(false);
    }, 1500);
  };

  // Define Table columns
  const tableColumns = [
    {
      header: "Tiêu đề",
      accessorKey: "title" as const,
      sortable: true,
    },
    {
      header: "Kênh",
      accessorKey: "channel" as const,
      sortable: true,
    },
    {
      header: "Lượt xem",
      accessorKey: "views" as const,
      sortable: true,
      cell: (row: ContentItem) => (
        <span className="font-mono">{row.views.toLocaleString()}</span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status" as const,
      cell: (row: ContentItem) => {
        const getVariant = () => {
          switch (row.status) {
            case "published":
              return "published";
            case "scheduled":
              return "scheduled";
            case "pending_review":
              return "pending_review";
            case "draft":
            default:
              return "draft";
          }
        };
        return (
          <Badge variant={getVariant()} className="capitalize">
            {row.status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      header: "Cập nhật",
      accessorKey: "updatedAt" as const,
      cell: (row: ContentItem) => (
        <span className="font-mono text-xs">{row.updatedAt}</span>
      ),
    },
  ];

  return (
    <div className="bg-canvas text-ink min-h-screen space-y-12 p-6 md:p-12">
      {/* Header */}
      <div className="border-hairline flex flex-col border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thư Viện UI Component
          </h1>
          <p className="text-muted-foreground mt-1">
            Các primitive component dùng chung cho dự án BrandHub Dashboard,
            thiết kế đồng bộ theo BrandHub Design System.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="size-4" />
              Về Trang Chủ
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* SECTION 1: BUTTONS */}
        <section className="border-hairline bg-card space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-xl font-semibold">1. Button (Nút Bấm)</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Hỗ trợ các variant màu sắc, kích thước, loading spinner và
              disabled.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                VARIANTS
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary (Black)</Button>
                <Button variant="orange">Orange (Brand CTA)</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                SIZES
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="orange" size="sm">
                  Small (sm)
                </Button>
                <Button variant="orange" size="md">
                  Medium (md - Default)
                </Button>
                <Button variant="orange" size="lg">
                  Large (lg)
                </Button>
                <Button variant="primary" size="icon">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                STATES
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="orange" loading>
                  Đang tải dữ liệu
                </Button>
                <Button variant="primary" loading size="icon" />
                <Button variant="orange" disabled>
                  Disabled State
                </Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INPUTS */}
        <section className="border-hairline bg-card space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-xl font-semibold">
              2. Input (Trường Nhập Liệu)
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Hỗ trợ label, placeholder, tin nhắn lỗi, prefix/suffix icon và
              controlled/uncontrolled.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Uncontrolled Input"
                placeholder="Nhập bất cứ thứ gì..."
              />
              <Input
                label="Input có lỗi (Error)"
                placeholder="email@example.com"
                error="Định dạng email không hợp lệ."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Có Icon Prefix (Phía trước)"
                placeholder="Tìm kiếm bài viết..."
                iconPrefix={<Search className="size-4" />}
              />
              <Input
                label="Có Icon Suffix (Phía sau)"
                placeholder="Nhập địa chỉ email"
                iconSuffix={<Mail className="size-4" />}
              />
            </div>

            <div className="border-hairline mt-2 space-y-3 border-t pt-4">
              <p className="text-muted-foreground font-mono text-xs font-semibold">
                DEMO CONTROLLED MODE
              </p>
              <div className="flex items-end gap-3">
                <Input
                  label="Controlled Input"
                  placeholder="Nhập văn bản..."
                  value={controlledVal}
                  onChange={(e) => setControlledVal(e.target.value)}
                  wrapperClassName="flex-grow"
                />
                <Button
                  variant="primary"
                  onClick={() => setControlledVal("BrandHub AI")}
                >
                  Set Giá Trị
                </Button>
              </div>
              {controlledVal && (
                <p className="text-brand-orange font-mono text-xs">
                  Giá trị thực tế trong State: "{controlledVal}"
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: MODAL & TOAST */}
        <section className="border-hairline bg-card space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-xl font-semibold">
              3. Modal & Toast (Hộp Thoại & Thông Báo)
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Thử nghiệm hiển thị Modal (có focus trap, backdrop) và các Toast
              thông báo (dismiss sau 4s).
            </p>
          </div>

          <div className="space-y-6">
            {/* Modal Controls */}
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                MODAL (DIALOG)
              </p>
              <Button variant="orange" onClick={() => setIsModalOpen(true)}>
                Mở Modal Ví Dụ
              </Button>

              <Modal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  info("Đã đóng", "Modal đã được đóng qua callback onClose.");
                }}
                title="Xác nhận lưu thay đổi?"
                description="Hành động này sẽ lưu các thiết lập hiện tại vào hệ thống."
                footer={
                  <div className="flex w-full justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      variant="orange"
                      onClick={() => {
                        setIsModalOpen(false);
                        success("Thành công", "Các thay đổi đã được lưu lại!");
                      }}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                }
              >
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Đây là nội dung hiển thị trong body slot của Modal. Trình
                    duyệt đã được kích hoạt focus trap, bạn chỉ có thể di chuyển
                    focus (Tab) giữa các nút điều khiển trong modal này.
                  </p>
                  <Input label="Tên cấu hình" placeholder="Nhập tên mới..." />
                </div>
              </Modal>
            </div>

            {/* Toast Controls */}
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                TOAST NOTIFICATIONS (TỰ ẨN SAU 4s)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                  onClick={() =>
                    success(
                      "Thành công!",
                      "Dữ liệu bài viết đã được cập nhật thành công.",
                    )
                  }
                >
                  Toast Success
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() =>
                    error("Lỗi hệ thống", "Không thể kết nối đến máy chủ AI.")
                  }
                >
                  Toast Error
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                  onClick={() =>
                    warning("Cảnh báo", "Dung lượng bộ nhớ của bạn sắp đầy.")
                  }
                >
                  Toast Warning
                </Button>
                <Button
                  variant="outline"
                  className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange-soft dark:hover:bg-brand-orange/20"
                  onClick={() =>
                    info("Thông tin", "Có 3 bài đăng đang đợi phê duyệt.")
                  }
                >
                  Toast Info
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: BADGES, SPINNERS, DROPDOWNS */}
        <section className="border-hairline bg-card space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-xl font-semibold">
              4. Badge, Spinner & Dropdown (Các Primitive Khác)
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Hiển thị các trạng thái Badge, Spinner tải trang và Dropdown thao
              tác nhanh.
            </p>
          </div>

          <div className="space-y-6">
            {/* Badges */}
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                BADGES (TRẠNG THÁI BÀI VIẾT)
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="draft">Nháp (Draft)</Badge>
                <Badge variant="pending_review">Chờ Duyệt (Pending)</Badge>
                <Badge variant="scheduled">Lên Lịch (Scheduled)</Badge>
                <Badge variant="published">Đã Đăng (Published)</Badge>
                <Badge variant="failed">Lỗi (Failed)</Badge>
                <Badge variant="rejected">Bị Từ Chối (Rejected)</Badge>
              </div>
            </div>

            {/* Spinners */}
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                SPINNER LOADER (SIZE & COLOR)
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-muted-foreground text-xs">
                    Nhỏ (sm)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-muted-foreground text-xs">
                    Vừa (md)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-muted-foreground text-xs">
                    Lớn (lg)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Spinner size="sm" variant="muted" />
                  <span className="text-muted-foreground text-xs">
                    Muted color
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div>
              <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold">
                DROPDOWN ACTION (WRAPPER & ALIGN)
              </p>
              <div className="flex gap-4">
                <Dropdown
                  align="start"
                  trigger={
                    <Button variant="outline">Thao Tác (Align Start)</Button>
                  }
                  items={[
                    {
                      label: (
                        <div className="flex w-full items-center gap-2">
                          <Settings className="size-4" />
                          <span>Cấu hình</span>
                        </div>
                      ),
                      value: "config",
                      onClick: () => info("Thao tác", "Chọn cấu hình"),
                    },
                    {
                      label: (
                        <div className="flex w-full items-center gap-2">
                          <Share2 className="size-4" />
                          <span>Chia sẻ</span>
                        </div>
                      ),
                      value: "share",
                      onClick: () => info("Thao tác", "Chọn chia sẻ"),
                    },
                    {
                      label: (
                        <div className="text-destructive flex w-full items-center gap-2">
                          <Trash2 className="size-4" />
                          <span>Xóa mục</span>
                        </div>
                      ),
                      value: "delete",
                      onClick: () => error("Xóa", "Đã yêu cầu xóa mục này"),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 5: TABLE / DATATABLE */}
      <section className="border-hairline bg-card space-y-6 rounded-lg border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              5. Table & DataTable (Bảng dữ liệu phân trang & sắp xếp)
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Component DataTable cấp cao tự động xử lý sắp xếp (sorting), phân
              trang (pagination), hiển thị Skeleton khi tải và Empty state.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReloadTable}
              disabled={isTableLoading}
            >
              Simulate Tải Lại
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTableData(tableData.length > 0 ? [] : mockData)}
            >
              Toggle Empty State
            </Button>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={tableData}
          loading={isTableLoading}
          pageSize={3}
          emptyState={
            <div className="flex flex-col items-center justify-center space-y-2 p-8">
              <AlertCircle className="text-muted-foreground size-8 animate-bounce" />
              <p className="text-ink font-medium">Bảng hiện tại trống</p>
              <p className="text-muted-foreground text-xs">
                Không tìm thấy dữ liệu bài viết nào.
              </p>
              <Button
                variant="orange"
                size="sm"
                onClick={() => setTableData(mockData)}
                className="mt-2"
              >
                Khôi Phục Dữ Liệu
              </Button>
            </div>
          }
        />
      </section>
    </div>
  );
}
