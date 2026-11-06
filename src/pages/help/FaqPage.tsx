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
  CreditCard,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export interface FaqItem {
  id: string;
  category: "general" | "agency" | "workspace" | "content" | "security" | "billing";
  question: string;
  answer: string;
  tags: string[];
}

export const FAQ_DATA_VI: FaqItem[] = [
  // =========================================================================
  // 1. GENERAL (Tổng quan - 5 câu)
  // =========================================================================
  {
    id: "faq-gen-1",
    category: "general",
    question: "Không nhận được email kích hoạt tài khoản hoặc mã xác thực?",
    answer:
      "Nguyên nhân: Email hệ thống có thể bị chuyển nhầm vào hòm thư Rác (Spam/Junk), bộ lọc máy chủ công ty chặn thư tự động, hoặc nhập chưa chính xác địa chỉ email.\n\nCách khắc phục:\n• Bước 1: Kiểm tra kỹ các mục Thư rác (Spam), Quảng cáo trong hộp thư. Tìm kiếm từ khóa 'BrandHub' hoặc thư chứa mã xác nhận.\n• Bước 2: Kiểm tra lại chính xác từng ký tự email đã nhập trên màn hình đăng nhập hoặc đăng ký.\n• Bước 3: Đợi hết đồng hồ đếm ngược 60 giây và nhấn nút 'Gửi lại mã' trên màn hình Xác thực OTP (/verify-otp) hoặc Kích hoạt tài khoản (/activate-account).\n• Bước 4: Nếu vẫn gặp sự cố, bạn có thể đăng nhập trực tiếp bằng tài khoản Google liên kết (OAuth) hoặc liên hệ Quản trị viên công ty để được hỗ trợ kích hoạt.",
    tags: ["mã xác thực", "đăng nhập", "email", "kích hoạt", "thư rác"],
  },
  {
    id: "faq-gen-2",
    category: "general",
    question: "Mất điện thoại hoặc không quét được mã xác thực hai bước (2FA) thì làm sao?",
    answer:
      "Nguyên nhân: Trường hợp phát sinh khi bạn đổi thiết bị mới, gỡ nhầm ứng dụng xác thực (như Google Authenticator), hoặc camera không nhận diện được mã QR khi thiết lập.\n\nCách khắc phục:\n• Khi thiết lập ban đầu: Màn hình hiển thị mã QR kèm chuỗi khóa bí mật (Secret Key). Bạn có thể sao chép chuỗi mã này để dán trực tiếp vào ứng dụng xác thực nếu camera không quét được.\n• Khi đăng nhập hàng ngày: Nhập mã gồm 6 chữ số từ ứng dụng xác thực trên màn hình Xác thực hai bước (/2fa-verify).\n• Khi mất hoàn toàn thiết bị xác thực: Dùng chính địa chỉ email đã đăng ký tài khoản gửi yêu cầu đến Quản trị viên công ty hoặc liên hệ bộ phận hỗ trợ qua email brandhub404@gmail.com để xác minh danh tính và đặt lại phương thức xác thực.",
    tags: ["xác thực hai bước", "bảo mật", "mã xác thực", "mất điện thoại", "hỗ trợ"],
  },
  {
    id: "faq-gen-3",
    category: "general",
    question: "Lỡ nộp bài duyệt nhầm nội dung, làm thế nào để thu hồi lại bài viết?",
    answer:
      "Quy trình xử lý thu hồi bài viết trên BrandHub:\n\n• Cách 1 - Tự thu hồi trực tiếp (Dành cho Người sáng tạo nội dung / Người thực hiện):\n  - Bước 1: Vào mục 'Công việc' (/workspaces/:id/tasks) trên thanh điều hướng và nhấp mở chi tiết công việc cần xử lý.\n  - Bước 2: Tại khu vực 'Phê duyệt kết quả' (Result approval), khi bài đang ở trạng thái 'Chờ duyệt' (trước khi Quản lý đưa ra quyết định), nhấn nút 'Thu hồi lượt gửi' (biểu tượng xoay ngược).\n  - Bước 3: Xác nhận trong hộp thoại. Công việc sẽ lập tức quay về trạng thái 'Đang thực hiện' (In Progress) và tự động mở khóa nút 'Mở trình soạn thảo' để bạn chỉnh sửa lại nội dung bài viết bình thường.\n\n• Cách 2 - Người duyệt từ chối trong màn hình 'Phê duyệt' (/task-approvals):\n  - Quản lý hoặc Khách hàng mở trang 'Phê duyệt' (/task-approvals) hoặc chi tiết công việc, nhấn nút 'Từ chối' kèm lời nhắn góp ý. Công việc cũng sẽ chuyển về lại trạng thái 'Đang thực hiện' để bạn cập nhật và bấm 'Gửi duyệt' ở lượt mới.",
    tags: ["thu hồi bài", "nộp nhầm", "chờ duyệt", "sửa bài", "chỉnh sửa", "công việc"],
  },
  {
    id: "faq-gen-4",
    category: "general",
    question: "Tại sao bài viết đang ở trạng thái Chờ duyệt lại bị khóa không cho chỉnh sửa?",
    answer:
      "Nguyên nhân: Đây là cơ chế bảo vệ tính toàn vẹn và nhất quán của BrandHub nhằm đảm bảo người duyệt đang đánh giá đúng bản nội dung cố định, tránh trường hợp nội dung bị sửa đổi ngầm trong lúc đang thẩm định.\n\nCách xử lý:\n• Khi bài đang Chờ duyệt: Người thực hiện và người duyệt có thể xem trước bài viết hoàn chỉnh, đọc lịch sử phê duyệt và để lại nhận xét trao đổi tại mục Bình luận của công việc (hỗ trợ nhắc tên đồng nghiệp @tên).\n• Nếu cần chỉnh sửa nội dung: Người thực hiện nhấn nút 'Thu hồi lượt gửi' tại phần 'Phê duyệt kết quả' (nếu bài chưa được duyệt) hoặc nhờ Quản lý/Khách hàng nhấn 'Từ chối' tại trang 'Phê duyệt' (/task-approvals).\n• Sau khi công việc quay về trạng thái 'Đang thực hiện', nút 'Mở trình soạn thảo' sẽ tự động mở khóa để bạn tiếp tục thao tác.",
    tags: ["khóa chỉnh sửa", "chờ duyệt", "phê duyệt", "quy trình", "bảo vệ nội dung"],
  },
  {
    id: "faq-gen-5",
    category: "general",
    question: "Khách hàng không muốn tạo tài khoản BrandHub thì có xem và duyệt bài được không?",
    answer:
      "Hệ thống đáp ứng linh hoạt hai nhu cầu của Khách hàng:\n\n1. Xem trước Gói truyền thông & Báo giá Proposal:\n• Khách hàng KHÔNG CẦN tạo tài khoản.\n• Quản lý vào mục 'Gói truyền thông' (/media-package hoặc /workspaces/:id/media-package), bấm nút Chia sẻ (biểu tượng Share) -> chọn 'Sao chép liên kết cho khách' (/packages/share/:token) hoặc 'Xuất PDF'.\n• Khách hàng chỉ cần mở liên kết trên trình duyệt bất kỳ để xem toàn bộ catalog dịch vụ, đề xuất proposal, số lượng deliverables và có thể phản hồi/thương lượng gói trực tiếp mà không cần đăng nhập.\n\n2. Phê duyệt bài viết chính thức:\n• Để bảo đảm tính minh bạch và lưu lại lịch sử kiểm tra (audit trail), Khách hàng được mời tham gia Không gian làm việc với vai trò Khách hàng (Client).\n• Khi có bài viết cần duyệt, Khách hàng truy cập mục 'Phê duyệt' (/task-approvals) hoặc nhấp vào liên kết thông báo nhận qua email/tin nhắn trên điện thoại hoặc máy tính để xem bản xem trước chuẩn mạng xã hội và bấm 'Duyệt' hoặc 'Từ chối' chỉ trong vài giây.",
    tags: ["khách hàng", "liên kết xem trước", "gói truyền thông", "proposal", "xuất pdf", "duyệt nhanh"],
  },

  // =========================================================================
  // 2. AGENCY (Agency & Tổ chức - 5 câu)
  // =========================================================================
  {
    id: "faq-agn-1",
    category: "agency",
    question: "Lời mời tham gia công ty bị thông báo 'Hết hạn' thì phải xử lý thế nào?",
    answer:
      "Nguyên nhân: Để đảm bảo an toàn bảo mật, các liên kết mời tham gia công ty có thời hạn hiệu lực nhất định (mặc định 30 ngày).\n\nCách khắc phục:\n• Bước 1: Quản trị viên truy cập vào mục 'Thành viên & Quyền' trên thanh điều hướng -> chọn 'Thành viên công ty' (/agency/:id/members).\n• Bước 2: Chuyển sang thẻ 'Lời mời' để xem danh sách lời mời đang ở trạng thái 'Hết hạn' hoặc 'Chờ xác nhận'.\n• Bước 3: Quản trị viên bấm 'Hủy lời mời' cũ, sau đó tại biểu mẫu mời thành viên, nhập email, chọn vai trò (Manager, Creator, Client - nếu chọn Client thì chọn Workspace chỉ định) và nhấn 'Gửi lời mời'.\n• Bước 4: Sau khi tạo lời mời, bạn có thể bấm nút 'Sao chép liên kết' (/invitations/accept?token=...) hiển thị ngay bên dưới để gửi trực tiếp cho thành viên kích hoạt tài khoản ngay. Thành viên cũng có thể kiểm tra lời mời cá nhân tại trang 'Lời mời' (/invitations).",
    tags: ["lời mời", "hết hạn", "thành viên", "gửi lại thư mời", "sao chép liên kết", "thành viên & quyền"],
  },
  {
    id: "faq-agn-2",
    category: "agency",
    question: "Khách hàng báo không nhận được email thư mời tham gia không gian làm việc?",
    answer:
      "Nguyên nhân: Do bộ lọc email của công ty khách hàng chuyển nhầm vào thư rác hoặc có nhầm lẫn khi nhập địa chỉ email đại diện thương hiệu.\n\nCách xử lý:\n• Bước 1: Quản lý hoặc Quản trị viên truy cập vào Không gian làm việc -> chọn mục 'Khách hàng' (/workspaces/:id/clients) dưới nhóm Cài đặt Workspace trên thanh điều hướng.\n• Bước 2: Kiểm tra danh sách xem email khách hàng đã được nhập đúng hay chưa.\n• Bước 3: Bấm nút 'Thêm khách hàng', chọn hồ sơ khách hàng và điền email đại diện thương hiệu để hệ thống gửi lại thư mời chính thức.\n• Bước 4: Khách hàng cũng có thể đăng nhập vào BrandHub bằng chính địa chỉ email đó, hệ thống sẽ tự động liên kết họ vào đúng không gian làm việc tương ứng.",
    tags: ["mời khách hàng", "không gian làm việc", "cài đặt", "thêm khách hàng", "khách hàng"],
  },
  {
    id: "faq-agn-3",
    category: "agency",
    question: "Làm sao để quản lý danh bạ đối tác Báo chí, Truyền hình và Booking người nổi tiếng?",
    answer:
      "BrandHub hỗ trợ quản lý đối tác truyền thông qua hai cấp độ tiện lợi:\n\n1. Cấp Công ty - Danh bạ đối tác dùng chung:\n• Truy cập mục 'Danh bạ đối tác' (/agency/:id/collaborators) trên thanh điều hướng.\n• Bấm nút 'Thêm đối tác' để lưu trữ: Tên đơn vị, phân loại (Báo chí - Newspaper, Truyền hình - TV, Bảng quảng cáo ngoài trời - Banner, Khác), người liên hệ, số điện thoại, email và ghi chú hợp tác.\n\n2. Cấp Không gian làm việc - Theo dõi đối tác trong từng Chiến dịch:\n• Mở mục 'Đối tác chiến dịch' (/workspaces/:id/campaign-partners) hoặc chọn chiến dịch cụ thể trong 'Chiến dịch' (/campaigns).\n• Thêm đối tác từ Danh bạ vào chiến dịch và cập nhật tiến độ hợp tác qua 4 bước chuẩn xác:\n  + Đã liên hệ (Contacted)\n  + Đang thương lượng (Negotiating)\n  + Đã chốt thỏa thuận (Confirmed)\n  + Đã phát sóng / lên bài (Live)",
    tags: ["danh bạ đối tác", "đối tác chiến dịch", "chiến dịch", "báo chí", "truyền hình", "tiến độ hợp tác"],
  },
  {
    id: "faq-agn-4",
    category: "agency",
    question: "Cách đổi mật khẩu, cập nhật thông tin cá nhân và ảnh đại diện?",
    answer:
      "Hướng dẫn thao tác:\n• Bước 1: Nhấp vào ảnh đại diện hoặc tên tài khoản ở góc trên bên phải thanh điều hướng -> chọn 'Cài đặt' hoặc truy cập trực tiếp 'Hồ sơ' (/settings/profile).\n• Bước 2 - Cập nhật hồ sơ: Vào mục 'Hồ sơ' (/settings/profile) để tải lên ảnh đại diện mới, cập nhật họ tên hiển thị và số điện thoại liên lạc -> Nhấn 'Lưu thay đổi'.\n• Bước 3 - Đổi mật khẩu: Chuyển sang mục 'Bảo mật' (/settings/security) -> Nhập mật khẩu hiện tại, nhập mật khẩu mới và xác nhận -> Nhấn 'Đổi mật khẩu'.\n• Lưu ý: Nếu tài khoản của bạn đăng nhập bằng Google OAuth, việc quản lý mật khẩu được bảo vệ trực tiếp thông qua tài khoản Google của bạn.",
    tags: ["đổi mật khẩu", "hồ sơ", "bảo mật", "ảnh đại diện", "cài đặt cá nhân"],
  },
  {
    id: "faq-agn-5",
    category: "agency",
    question: "Cấu hình múi giờ của Không gian làm việc nằm ở đâu và ảnh hưởng thế nào đến lịch đăng?",
    answer:
      "Tầm quan trọng: Múi giờ quyết định chính xác thời điểm các bài viết theo lịch hẹn được xuất bản tự động lên mạng xã hội và hiển thị đồng bộ trên Lịch xuất bản.\n\nCách cấu hình:\n• Bước 1: Mở Không gian làm việc cần cài đặt -> chọn mục 'Cài đặt chung' (/workspaces/:id/settings) dưới phần Cài đặt Workspace trên thanh điều hướng bên trái.\n• Bước 2: Nhấn vào nút 'Chỉnh sửa' (biểu tượng cây bút) ở góc trang.\n• Bước 3: Tại mục 'Múi giờ', chọn múi giờ chuẩn của thị trường mục tiêu (mặc định tại Việt Nam là Giờ Đông Dương GMT+7 / Asia/Ho_Chi_Minh).\n• Bước 4: Nhấn 'Lưu thay đổi'. Toàn bộ bài viết hẹn giờ và lịch xuất bản sẽ được áp dụng chuẩn xác theo giờ địa phương này.",
    tags: ["múi giờ", "giờ hệ thống", "lịch xuất bản", "cài đặt chung", "không gian làm việc"],
  },

  // =========================================================================
  // 3. WORKSPACE (Workspace & Nhóm - 5 câu)
  // =========================================================================
  {
    id: "faq-ws-1",
    category: "workspace",
    question: "Tại sao không thể đổi người phụ trách khi bài viết đã bắt đầu thực hiện?",
    answer:
      "Nguyên nhân: Để đảm bảo tính minh bạch, trách nhiệm cá nhân và đối soát tiến độ chuẩn xác, khi người phụ trách đã nhấn 'Bắt đầu làm' (công việc chuyển sang trạng thái Đang thực hiện), hệ thống sẽ khóa cố định người thực hiện, yêu cầu ban đầu và thời hạn hoàn thành. Ngay cả Quản lý hay Chủ sở hữu công ty cũng không thể thay đổi trực tiếp người phụ trách trên công việc đang chạy này.\n\nCách xử lý khi cần chuyển giao nhân sự:\n• Bước 1: Quản lý mở chi tiết công việc trong 'Công việc' (/workspaces/:id/tasks) và chọn thao tác 'Hủy công việc' kèm ghi chú lý do chuyển giao nhân sự.\n• Bước 2: Quản lý tạo hoặc phân công một đầu việc mới từ kế hoạch 'Chiến dịch' (/campaigns) cho người phụ trách mới tiếp quản từ đầu.",
    tags: ["người phụ trách", "khóa phân công", "bắt đầu làm", "phân quyền", "chuyển giao việc", "công việc"],
  },
  {
    id: "faq-ws-2",
    category: "workspace",
    question: "Cách thêm và phân chia các công việc phụ trong bài viết?",
    answer:
      "Tính năng Công việc phụ (Subtasks) giúp chia nhỏ từng công đoạn sản xuất (Ví dụ: Soạn bản thảo, Thiết kế ảnh minh họa, Quay dựng video ngắn):\n\nCách thực hiện:\n• Bước 1: Trong giao diện chi tiết công việc ('Công việc' - /workspaces/:id/tasks), kéo đến khu vực 'Công việc phụ' (Subtasks).\n• Bước 2: Nhập tiêu đề việc phụ -> Chọn người phụ trách và hạn hoàn thành tương ứng.\n• Bước 3: Bấm nút 'Thêm việc phụ' (biểu tượng dấu cộng hoặc phím Enter).\n• Mỗi đầu việc phụ có các trạng thái (Cần làm, Đang làm, Hoàn thành) và thanh tiến độ chung của bài viết sẽ tự động cập nhật theo tỷ lệ việc phụ đã xong.",
    tags: ["công việc phụ", "subtasks", "chia nhỏ công việc", "tiến độ", "danh sách việc"],
  },
  {
    id: "faq-ws-3",
    category: "workspace",
    question: "Tin nhắn trao đổi nội bộ của đội ngũ có bị Khách hàng nhìn thấy không?",
    answer:
      "BrandHub phân định ranh giới bảo mật rõ ràng giữa các kênh trao đổi:\n\n1. Mục Trao đổi (/workspaces/:id/chat):\n• Đội ngũ nội bộ có thể tạo các kênh riêng tư chỉ dành riêng cho Quản lý và nhân viên thực hiện. Khách hàng hoàn toàn KHÔNG THỂ nhìn thấy tên kênh hoặc nội dung tin nhắn trong các kênh này.\n• Các tin nhắn trực tiếp giữa hai thành viên cũng được bảo mật tuyệt đối.\n\n2. Mục Bình luận công việc & Phê duyệt:\n• Khách hàng tham gia vào không gian làm việc có thể xem và trao đổi trong phần Bình luận của từng công việc để góp ý kiến chuyên môn.\n• Các quyết định duyệt hoặc yêu cầu chỉnh sửa kèm lý do được lưu trữ riêng biệt tại mục 'Lịch sử phê duyệt' theo từng lượt gửi (Round).",
    tags: ["kênh riêng tư", "bảo mật", "chat nội bộ", "trao đổi", "lịch sử duyệt"],
  },
  {
    id: "faq-ws-4",
    category: "workspace",
    question: "Làm thế nào để theo dõi bài viết Báo chí & Truyền hình theo quy trình từng bước?",
    answer:
      "Khác với mạng xã hội tự động xuất bản qua hệ thống, bài báo chí và truyền hình yêu cầu sự phối hợp trực tiếp giữa các bên:\n\nQuy trình chuẩn tại trang 'Đối tác chiến dịch' (/workspaces/:id/campaign-partners):\n• Bước 1 - Đã liên hệ (Contacted): Người phụ trách hoặc Quản lý gửi thông cáo báo chí, liên hệ phóng viên hoặc biên tập viên đài truyền hình.\n• Bước 2 - Đang thương lượng (Negotiating): Thỏa thuận chi phí đăng bài, chuyên mục xuất bản, thời lượng và khung giờ phát sóng.\n• Bước 3 - Đã chốt thỏa thuận (Confirmed): Hai bên thống nhất bản in hoặc bản dựng hoàn chỉnh, chốt ngày giờ lên sóng chính thức.\n• Bước 4 - Đã phát sóng / lên bài (Live): Bài báo đã xuất bản trực tuyến hoặc phóng sự truyền hình đã lên sóng, cập nhật đường dẫn bài viết và lưu biên bản nghiệm thu.",
    tags: ["báo chí", "truyền hình", "đối tác chiến dịch", "tiến độ", "nghiệm thu"],
  },
  {
    id: "faq-ws-5",
    category: "workspace",
    question: "Làm sao kiểm tra dung lượng lưu trữ tệp tin trong không gian làm việc?",
    answer:
      "Dung lượng lưu trữ dùng chung cho toàn bộ hình ảnh, video chất lượng cao và tài liệu trong Thư viện:\n\nCách kiểm tra & tối ưu:\n• Bước 1: Mở menu 'Thư viện tài nguyên' / 'Thư viện Nội dung' (/library hoặc /workspaces/:id/library) trên thanh điều hướng bên trái.\n• Bước 2: Quan sát chỉ số 'Dung lượng lưu trữ' (Storage Usage) và thanh tiến độ 'Đã dùng / Hạn mức' ở góc trên.\n• Bước 3 - Quản lý tệp tin & Thùng rác: Các tài liệu nằm trong Thùng rác vẫn chiếm dung lượng cho đến khi bạn chọn xóa vĩnh viễn hoặc thùng rác tự dọn dẹp theo chính sách lưu trữ.\n• Bước 4 - Mở rộng dung lượng & Đồng bộ Google Drive: Doanh nghiệp có thể kết nối tài khoản Google Drive để ưu tiên lưu trữ đám mây hoặc liên hệ Quản trị viên nâng cấp gói cước tại 'Gói đăng ký' (/subscription/plans).",
    tags: ["dung lượng", "thư viện tài nguyên", "thư viện nội dung", "google drive", "thùng rác", "bộ nhớ"],
  },

  // =========================================================================
  // 4. CONTENT (Quy trình nội dung - 7 câu)
  // =========================================================================
  {
    id: "faq-cnt-1",
    category: "content",
    question: "Bài viết bị từ chối duyệt, làm cách nào để sửa và nộp lại?",
    answer:
      "Khi bài viết nhận yêu cầu chỉnh sửa từ Quản lý hoặc Khách hàng:\n\nCác bước xử lý:\n• Bước 1: Mở chi tiết công việc trong 'Công việc' (/workspaces/:id/tasks), trạng thái sẽ tự động chuyển về 'Đang thực hiện'. Kéo xuống mục 'Lịch sử phê duyệt' để đọc chi tiết nhận xét góp ý và lý do từ chối.\n• Bước 2: Nhấn vào nút 'Mở trình soạn thảo' để chỉnh sửa văn bản, cập nhật hình ảnh hoặc video theo yêu cầu -> Nhấn 'Lưu bài viết'.\n• Bước 3: Quay lại chi tiết công việc, tại phần 'Phê duyệt kết quả' (Result approval), bấm nút 'Gửi duyệt'. Bạn có thể nhập thêm lời nhắn tóm tắt những nội dung đã hoàn thiện.\n• Bước 4: Lượt duyệt mới (Round mới) sẽ được gửi đến Quản lý xem trước, sau đó chuyển đến Khách hàng phê duyệt lần cuối tại trang 'Phê duyệt' (/task-approvals).",
    tags: ["từ chối", "sửa bài", "gửi duyệt", "lịch sử phê duyệt", "phê duyệt", "công việc"],
  },
  {
    id: "faq-cnt-2",
    category: "content",
    question: "Khách hàng bận rộn muốn duyệt bài nhanh trên điện thoại di động như thế nào?",
    answer:
      "BrandHub được tối ưu hóa giao diện hoàn hảo cho trình duyệt trên điện thoại (cả iOS và Android):\n\nTrải nghiệm duyệt di động nhanh chóng:\n• Bước 1: Khách hàng nhấp vào đường dẫn thông báo nhận được qua email hoặc tin nhắn.\n• Bước 2: Màn hình hiển thị bản xem trước bài viết đúng chuẩn tỷ lệ và bố cục mạng xã hội (Facebook, Instagram, TikTok, LinkedIn...).\n• Bước 3: Khách hàng có hai lựa chọn thuận tiện chỉ với 1 chạm:\n  + Nút 'Duyệt' (màu xanh lá): Đồng ý và xác nhận kết quả bài viết.\n  + Nút 'Từ chối' (màu đỏ): Nhập nhanh ghi chú những điểm cần hoàn thiện để gửi lại cho người làm nội dung.\n• Toàn bộ thao tác chỉ mất chưa đầy 30 giây trực tiếp trên trình duyệt điện thoại mà không cần cài đặt thêm bất kỳ ứng dụng nào.",
    tags: ["duyệt di động", "điện thoại", "khách hàng", "duyệt nhanh", "xem trước", "phê duyệt"],
  },
  {
    id: "faq-cnt-3",
    category: "content",
    question: "Làm thế nào để Khách hàng gửi Yêu cầu bài viết phát sinh ngoài kế hoạch?",
    answer:
      "Khi có sự kiện khẩn cấp, chương trình khuyến mãi đột xuất hoặc nội dung phát sinh ngoài kế hoạch ban đầu:\n\nCách gửi yêu cầu:\n• Bước 1: Khách hàng mở không gian làm việc -> chọn mục 'Yêu cầu Nội dung' (/requests hoặc /workspaces/:id/requests) trên thanh điều hướng.\n• Bước 2: Bấm nút 'Tạo yêu cầu' ở góc trên bên phải trang.\n• Bước 3: Điền các thông tin: Tiêu đề, Nội dung yêu cầu, Thể loại bài viết, Thời hạn mong muốn và Kênh truyền thông mục tiêu -> Nhấn 'Lưu yêu cầu'.\n• Bước 4: Yêu cầu sẽ ở trạng thái 'Chờ tiếp nhận'. Đội ngũ quản lý sẽ xem xét tính khả thi và chọn 'Chấp nhận' (hệ thống sẽ tự động tạo công việc mới trong /workspaces/:id/tasks) hoặc 'Từ chối' kèm lời giải thích.",
    tags: ["yêu cầu nội dung", "tạo yêu cầu", "khách hàng", "bài viết phát sinh", "công việc"],
  },
  {
    id: "faq-cnt-4",
    category: "content",
    question: "Yêu cầu bài viết phát sinh bị từ chối tiếp nhận thì xử lý thế nào?",
    answer:
      "Nguyên nhân từ chối: Thường do thời gian yêu cầu quá gấp, vượt quá định mức chiến dịch hoặc chưa đủ tài liệu đầu vào để sản xuất.\n\nHướng xử lý:\n• Lưu ý: Trạng thái 'Đã từ chối' là trạng thái kết thúc để lưu giữ lịch sử trao đổi rõ ràng.\n• Bước 1: Khách hàng mở trang 'Yêu cầu Nội dung' (/requests) -> bấm vào yêu cầu đã bị từ chối để đọc lời nhắn giải thích từ đội ngũ quản lý.\n• Bước 2: Bấm nút 'Tạo yêu cầu' mới trên góc trang.\n• Bước 3: Cập nhật lại thời hạn hoàn thành hợp lý hơn, bổ sung thêm tài liệu hình ảnh tư liệu, hoặc thỏa thuận điều chỉnh với đầu việc khác trong hợp đồng -> Nhấn 'Lưu yêu cầu'.",
    tags: ["từ chối", "từ chối yêu cầu", "tạo yêu cầu mới", "lời nhắn quản lý", "yêu cầu nội dung"],
  },
  {
    id: "faq-cnt-5",
    category: "content",
    question: "Bài viết đã được duyệt hoàn tất nhưng chưa thấy tự động đăng lên mạng xã hội?",
    answer:
      "Nguyên nhân: Việc hoàn tất phê duyệt độc lập với tiến trình xuất bản để tránh trường hợp đăng nhầm khi chưa đến khung giờ hẹn hoặc tài khoản mạng xã hội bị gián đoạn kết nối.\n\nCách kiểm tra & xử lý:\n• Bước 1: Mở mục 'Xuất bản' (/publish hoặc /workspaces/:id/publish). Nếu bài được hẹn giờ phát hành trong tương lai, bài sẽ ở trạng thái 'Đã lên lịch' và tự động đăng khi đến đúng thời gian.\n• Bước 2: Nếu bài đã quá giờ đăng mà chuyển sang trạng thái 'Thất bại', hãy vào mục 'Tài khoản mạng xã hội' (/social-accounts hoặc /workspaces/:id/social-accounts) để kiểm tra xem tài khoản Facebook Page, TikTok hay Instagram có bị hết hạn token ủy quyền không.\n• Bước 3: Sau khi kết nối lại hoặc làm mới token tài khoản mạng xã hội thành công, bạn mở chi tiết bài viết trong Xuất bản và nhấn nút 'Thử lại' để hệ thống tiến hành đăng bài ngay lập tức.",
    tags: ["hoàn tất duyệt", "xuất bản", "lịch đăng", "thử lại", "tài khoản mạng xã hội"],
  },
  {
    id: "faq-cnt-6",
    category: "content",
    question: "Mất kết nối tài khoản mạng xã hội (kết nối Facebook, Instagram, TikTok bị hết hạn) thì làm sao?",
    answer:
      "Nguyên nhân: Theo quy định bảo mật của Meta (Facebook, Instagram) và TikTok, phiên kết nối ủy quyền OAuth sẽ tự động hết hạn định kỳ hoặc khi người quản trị trang mạng xã hội thay đổi mật khẩu tài khoản cá nhân.\n\nCách kết nối lại:\n• Bước 1: Quản trị viên truy cập vào mục 'Tài khoản mạng xã hội' (/social-accounts hoặc /workspaces/:id/social-accounts).\n• Bước 2: Tìm thẻ tài khoản đang hiển thị thông báo 'Hết hạn' hoặc 'Sắp hết hạn'.\n• Bước 3: Bấm nút 'Kết nối lại' (Reconnect) trên thẻ tài khoản tương ứng.\n• Bước 4: Đăng nhập vào tài khoản mạng xã hội có quyền quản lý Fanpage/kênh và xác nhận cấp quyền xuất bản bài viết cho BrandHub.",
    tags: ["tài khoản mạng xã hội", "kết nối hết hạn", "kết nối lại", "facebook", "tiktok", "instagram"],
  },
  {
    id: "faq-cnt-7",
    category: "content",
    question: "Làm thế nào để Hủy lịch đăng hoặc Dời giờ xuất bản của bài viết đã lên lịch?",
    answer:
      "Khi bài viết đang ở trạng thái 'Đã lên lịch':\n\nCách thao tác linh hoạt:\n• Cách 1 - Kéo thả trên 'Lịch xuất bản' (/calendar hoặc /workspaces/:id/calendar): Mở mục Lịch, bạn chỉ cần kéo và thả thẻ bài viết sang một ô ngày khác trên lưới lịch để dời ngày phát hành ngay lập tức.\n• Cách 2 - Điều chỉnh trong quá trình duyệt bài: Khi thực hiện duyệt bài tại trang 'Phê duyệt' (/task-approvals), người duyệt có thể chọn thời điểm xuất bản: 'Đăng ngay', 'Hẹn giờ phát hành' (chọn ngày và giờ cụ thể) hoặc 'Để xuất bản sau'.\n• Cách 3 - Chỉnh sửa qua danh sách Xuất bản: Mở mục 'Xuất bản' (/publish), nhấp vào bài viết đã lên lịch để cập nhật lại khung giờ phát hành mong muốn.",
    tags: ["lịch xuất bản", "calendar", "dời lịch đăng", "kéo thả", "lên lịch", "xuất bản", "phê duyệt"],
  },

  // =========================================================================
  // 5. SECURITY & AI (Bảo mật & AI Studio - 5 câu)
  // =========================================================================
  {
    id: "faq-sec-1",
    category: "security",
    question: "Lỗi thông báo 'Không đủ điểm AI' khi tạo bài viết hoặc hình ảnh giải quyết thế nào?",
    answer:
      "Nguyên nhân: Thường có hai khả năng: 1) Tài khoản của bạn đã sử dụng hết định mức điểm AI được phân bổ; 2) Tổng quỹ điểm AI của công ty trong tháng đã sử dụng hết.\n\nCách xử lý:\n• Nếu bạn là Thành viên hoặc Người sáng tạo nội dung: Vào mục 'Quản lý Điểm AI' (/agency/:id/credit) để kiểm tra số điểm đã dùng và định mức được cấp. Nếu cần thêm, vui lòng liên hệ Quản trị viên công ty để được tăng định mức cá nhân.\n• Nếu bạn là Quản trị viên: Vào mục 'Quản lý Điểm AI' (/agency/:id/credit) để điều chỉnh hạn mức thành viên hoặc nạp thêm điểm nhanh chóng qua chuyển khoản quét mã QR PayOS (chuẩn VietQR); hoặc nâng cấp gói sử dụng tại mục 'Gói cước & Thanh toán' / 'Gói đăng ký' (/subscription/plans).",
    tags: ["điểm ai", "hạn mức", "quản lý điểm ai", "ai studio", "nạp điểm", "quản trị viên", "payos"],
  },
  {
    id: "faq-sec-2",
    category: "security",
    question: "Chu kỳ làm mới điểm AI hàng tháng và cơ chế điểm mua thêm ra sao?",
    answer:
      "Cơ chế sử dụng điểm hỗ trợ AI tại BrandHub:\n\n1. Điểm AI theo gói hàng tháng: Được tự động cấp mới vào ngày đầu tiên của mỗi chu kỳ gói cước (mỗi tháng nhận đủ số điểm theo gói đã chọn). Điểm trong gói hàng tháng nếu chưa dùng hết sẽ không cộng dồn sang chu kỳ tiếp theo.\n2. Điểm AI nạp thêm (Add-on): Khi mua thêm các gói điểm nạp bổ sung qua QR PayOS, số điểm này CÓ GIÁ TRỊ VĨNH VIỄN, KHÔNG BAO GIỜ HẾT HẠN và chỉ được khấu trừ sau khi số điểm của gói hàng tháng đã dùng hết.",
    tags: ["chu kỳ làm mới", "điểm ai hàng tháng", "điểm nạp thêm", "vĩnh viễn", "không hết hạn", "ai studio"],
  },
  {
    id: "faq-sec-3",
    category: "security",
    question: "Làm sao để công cụ viết bài AI viết đúng phong cách và giọng điệu thương hiệu (Brand Voice)?",
    answer:
      "Để các nội dung do trí tuệ nhân tạo tạo ra mang đậm phong cách riêng của từng nhãn hàng:\n\nCách thiết lập trong Cơ sở tri thức thương hiệu:\n• Bước 1: Mở mục 'AI Studio' trên thanh điều hướng -> chọn 'Cơ sở tri thức' (/ai-studio/knowledge-base).\n• Bước 2: Tải lên các tài liệu quy chuẩn nhận diện thương hiệu, hướng dẫn viết bài (Brand Voice), danh sách từ khóa nên dùng và các từ ngữ cần hạn chế (định dạng PDF, Word hoặc văn bản TXT).\n• Bước 3: Quan sát mục 'Giọng điệu thương hiệu' hiển thị trạng thái đã sẵn sàng. Khi tạo nội dung mới trong Trình soạn Nội dung (/editor), hệ thống sẽ tự động đối chiếu các quy chuẩn này để tạo văn bản chuẩn xác nhất.",
    tags: ["giọng điệu thương hiệu", "cơ sở tri thức", "tri thức thương hiệu", "ai studio", "phong cách", "editor"],
  },
  {
    id: "faq-sec-4",
    category: "security",
    question: "Tính năng Người mẫu ảo / Đại sứ thương hiệu AI hoạt động thế nào?",
    answer:
      "Tính năng Đại sứ thương hiệu AI giúp doanh nghiệp duy trì một gương mặt đại diện nhất quán và chuyên nghiệp xuyên suốt các ấn phẩm hình ảnh và video truyền thông:\n\nCách khởi tạo và sử dụng:\n• Bước 1: Truy cập mục 'AI Studio' trên thanh điều hướng -> chọn 'Đại sứ thương hiệu' (/ai-studio/ambassadors).\n• Bước 2: Nhấn 'Tạo đại sứ mới', đặt tên đại sứ và tải lên ảnh chân dung mẫu rõ nét.\n• Bước 3: Tinh chỉnh thanh đo mức độ tương đồng khuôn mặt để đảm bảo giữ nguyên đường nét nhận diện.\n• Bước 4: Khi tạo hình ảnh hoặc video chiến dịch tại 'Video Studio' (/ai-studio/video), bạn chỉ cần chọn đại sứ này làm người mẫu, hệ thống sẽ tự động ghép khuôn mặt chuẩn xác vào trang phục và bối cảnh mong muốn.",
    tags: ["đại sứ thương hiệu", "người mẫu ảo", "nhận diện khuôn mặt", "ảnh ai", "video studio", "ai studio"],
  },
  {
    id: "faq-sec-5",
    category: "security",
    question: "Dữ liệu hình ảnh và nội dung bài viết của nhãn hàng có bị dùng để huấn luyện AI công cộng không?",
    answer:
      "Cam kết bảo mật tuyệt đối của BrandHub:\n\n• Toàn bộ bài viết, hình ảnh, tài liệu thương hiệu và lịch sử phê duyệt là tài sản riêng độc quyền của doanh nghiệp và khách hàng.\n• BrandHub ứng dụng các giải pháp trí tuệ nhân tạo trên nền tảng hạ tầng bảo mật tiêu chuẩn doanh nghiệp với môi trường xử lý cách ly.\n• Hệ thống cam kết tuyệt đối không dùng dữ liệu khách hàng để huấn luyện AI cho bên ngoài, bảo đảm quyền sở hữu trí tuệ và bí mật kinh doanh của bạn.",
    tags: ["bảo mật dữ liệu", "huấn luyện ai", "quyền riêng tư", "cam kết bảo mật", "an toàn thông tin"],
  },

  // =========================================================================
  // 6. BILLING (Gói cước & Hóa đơn - 5 câu)
  // =========================================================================
  {
    id: "faq-bil-1",
    category: "billing",
    question: "Cách nâng cấp gói dịch vụ tự động qua chuyển khoản ngân hàng quét mã QR?",
    answer:
      "Hệ thống thanh toán quét mã QR PayOS tự động kích hoạt gói dịch vụ trong vòng 30 giây:\n\nCác bước thực hiện:\n• Bước 1: Quản trị viên (Chủ sở hữu công ty - Owner) truy cập vào mục 'Gói đăng ký' (/subscription/plans) hoặc nhấp vào biểu tượng Nâng cấp trên thanh điều hướng.\n• Bước 2: Xem chi tiết quyền lợi của gói cước mong muốn -> Nhấn nút 'Nâng cấp' để tạo mã QR thanh toán PayOS.\n• Bước 3: Màn hình hiển thị mã VietQR chứa sẵn số tiền và nội dung chuyển khoản định danh chính xác.\n• Bước 4: Mở ứng dụng ngân hàng bất kỳ trên điện thoại, quét mã QR và xác nhận chuyển khoản. Hệ thống PayOS sẽ tự động nhận diện giao dịch và kích hoạt gói cước ngay lập tức.",
    tags: ["quét mã qr", "thanh toán tự động", "gói cước & thanh toán", "gói đăng ký", "nâng cấp gói", "payos", "vietqr"],
  },
  {
    id: "faq-bil-2",
    category: "billing",
    question: "Cách mua thêm gói điểm AI bổ sung khi đang trong kỳ sử dụng?",
    answer:
      "Khi nhu cầu tạo nội dung văn bản và hình ảnh AI tăng cao trong tháng:\n\nCách nạp thêm:\n• Bước 1: Truy cập mục 'Quản lý Điểm AI' (/agency/:id/credit) -> kéo đến phần 'Gói nạp điểm AI bổ sung'.\n• Bước 2: Chọn gói nạp phù hợp với ngân sách (Ví dụ: Gói 100 điểm, 500 điểm hoặc 1.000 điểm).\n• Bước 3: Quét mã QR PayOS thanh toán chuyển khoản nhanh chóng qua ứng dụng ngân hàng.\n• Điểm cộng đặc biệt: Toàn bộ số điểm mua thêm đều có hạn dùng vĩnh viễn và không bị mất đi khi sang chu kỳ thanh toán tiếp theo.",
    tags: ["nạp điểm ai", "mua thêm điểm", "gói điểm bổ sung", "vĩnh viễn", "quét mã qr", "payos", "quản lý điểm ai"],
  },
  {
    id: "faq-bil-3",
    category: "billing",
    question: "Dữ liệu bài viết và thư viện ảnh có bị xóa nếu gói cước hết hạn không?",
    answer:
      "Chính sách bảo toàn dữ liệu khách hàng của BrandHub:\n\n• Khi gói cước hết hạn, tài khoản của bạn sẽ tạm thời chuyển sang chế độ Chỉ xem (Read-Only). Toàn bộ bài viết, hình ảnh, tài liệu trong Thư viện và lịch sử phê duyệt vẫn ĐƯỢC GIỮ NGUYÊN VẸN trong vòng 30 ngày.\n• Trong thời gian 30 ngày này, bạn chỉ cần gia hạn gói dịch vụ tại 'Gói đăng ký' (/subscription/plans) để tiếp tục sáng tạo và xuất bản bài viết bình thường.\n• Hệ thống tuyệt đối không tự ý xóa dữ liệu của khách hàng.",
    tags: ["hết hạn gói", "bảo toàn dữ liệu", "chế độ chỉ xem", "chính sách dữ liệu", "gói cước & thanh toán"],
  },
  {
    id: "faq-bil-4",
    category: "billing",
    question: "Làm thế nào để xem lịch sử giao dịch và xuất hóa đơn điện tử VAT?",
    answer:
      "Quy trình xem lịch sử thanh toán và yêu cầu hóa đơn:\n\n• Bước 1: Truy cập mục 'Hóa đơn' (/subscription/invoices) dưới phần quản lý Công ty hoặc trên trang Gói đăng ký.\n• Bước 2: Bảng lịch sử hiển thị đầy đủ các giao dịch thanh toán gói dịch vụ và các lượt nạp thêm điểm AI kèm mã giao dịch, số tiền, ngày tạo và trạng thái.\n• Bước 3: Để yêu cầu xuất hóa đơn điện tử VAT cho doanh nghiệp, bạn gửi mã giao dịch và thông tin pháp nhân (Tên công ty, Mã số thuế, Địa chỉ) về email hỗ trợ: brandhub404@gmail.com để bộ phận tài chính xuất chứng từ theo quy định.",
    tags: ["hóa đơn vat", "lịch sử thanh toán", "hóa đơn", "chứng từ", "subscription/invoices"],
  },
  {
    id: "faq-bil-5",
    category: "billing",
    question: "Có được giảm giá khi thanh toán gói cước theo năm thay vì theo tháng không?",
    answer:
      "Chính sách ưu đãi thanh toán theo năm:\n\n• Tại trang 'Gói đăng ký' (/subscription/plans), bạn có thể chuyển lựa chọn chu kỳ thanh toán sang 'Hàng năm' thay vì 'Hàng tháng'.\n• Khi chọn thanh toán theo năm, doanh nghiệp được ưu đãi giảm giá trực tiếp lên đến 20% (tương đương 2 tháng sử dụng miễn phí).\n• Toàn bộ định mức điểm AI của cả năm cũng được kích hoạt trọn gói để doanh nghiệp chủ động phân bổ ngân sách sáng tạo nội dung.",
    tags: ["thanh toán năm", "ưu đãi", "giảm giá", "tiết kiệm", "gói đăng ký"],
  },
];

export const FAQ_DATA_EN: FaqItem[] = [
  // =========================================================================
  // 1. GENERAL (Overview - 5 items)
  // =========================================================================
  {
    id: "faq-gen-1",
    category: "general",
    question: "Did not receive account activation email or verification code?",
    answer:
      "Cause: System emails might be redirected to your Spam/Junk folder, corporate email filters may block automated emails, or the email address was entered incorrectly.\n\nTroubleshooting steps:\n• Step 1: Check your Spam, Junk, and Promotions folders carefully. Search for keywords like 'BrandHub' or messages containing verification codes.\n• Step 2: Double-check every character of your email address entered on the sign-in or registration screen.\n• Step 3: Wait for the 60-second cooldown timer to finish and click 'Resend Code' on the OTP Verification (/verify-otp) or Account Activation (/activate-account) screen.\n• Step 4: If the issue persists, sign in directly with your linked Google account (OAuth) or contact your Agency Administrator to manually activate your account.",
    tags: ["verification code", "sign in", "email", "activation", "spam"],
  },
  {
    id: "faq-gen-2",
    category: "general",
    question: "Lost your phone or unable to scan the Two-Factor Authentication (2FA) QR code?",
    answer:
      "Cause: This occurs when you switch to a new phone, accidentally uninstall your authenticator app (such as Google Authenticator), or your camera cannot scan the QR code during setup.\n\nResolution:\n• Initial Setup: The setup screen displays both a QR code and a secret setup key (Secret Key). You can copy and manually enter this key into your authenticator app if your camera fails to scan.\n• Daily Sign-in: Enter the 6-digit verification code generated by your authenticator app on the Two-Factor Authentication screen (/2fa-verify).\n• Completely Lost 2FA Device: From your registered account email, submit a support request to your Agency Administrator or contact our support team at brandhub404@gmail.com to verify your identity and reset your 2FA method.",
    tags: ["two-factor authentication", "2fa", "security", "lost phone", "support"],
  },
  {
    id: "faq-gen-3",
    category: "general",
    question: "Accidentally submitted the wrong post content, how can I withdraw it?",
    answer:
      "Post withdrawal process on BrandHub:\n\n• Method 1 - Direct Self-Withdrawal (For Content Creators / Assignees):\n  - Step 1: Navigate to 'Tasks' (/workspaces/:id/tasks) in the sidebar and open the relevant task details.\n  - Step 2: In the 'Result approval' section, while the task is in 'Pending Approval' status (before Manager decision), click the 'Withdraw submission' button (RotateCcw icon).\n  - Step 3: Confirm in the dialog. The task will immediately return to 'In Progress' status and automatically unlock the 'Open Editor' button so you can update your draft.\n\n• Method 2 - Reviewer Rejection in 'Post approvals' (/task-approvals):\n  - If a Manager or Client is reviewing, they can open 'Post approvals' (/task-approvals) or the task details and click 'Reject' with feedback notes. The task reverts to 'In Progress' status, allowing you to update and click 'Submit for approval' in a new review round.",
    tags: ["withdraw post", "submitted by mistake", "pending approval", "edit post", "resubmit", "tasks"],
  },
  {
    id: "faq-gen-4",
    category: "general",
    question: "Why is post editing locked while in Pending Approval status?",
    answer:
      "Cause: This is BrandHub's data integrity mechanism designed to ensure reviewers evaluate a fixed, consistent draft and prevent unrecorded changes while a review is actively taking place.\n\nHow to handle:\n• While Pending Approval: Both assignees and reviewers can preview the finished post, inspect previous approval history, and exchange feedback comments in the task comment section (supports mentioning colleagues with @name).\n• Modifying Content: The assignee can click 'Withdraw submission' in the 'Result approval' section (if review has not started) or ask the Manager/Client to click 'Reject' on the 'Post approvals' (/task-approvals) page.\n• Once the task returns to 'In Progress' status, the 'Open Editor' button will automatically unlock for further editing.",
    tags: ["locked editing", "pending approval", "review process", "workflow", "content protection"],
  },
  {
    id: "faq-gen-5",
    category: "general",
    question: "Can clients review and approve posts without creating a BrandHub account?",
    answer:
      "The system accommodates client collaboration with two flexible options:\n\n1. Previewing Media Packages & Proposals:\n• Clients DO NOT need an account.\n• Managers simply navigate to 'Media Package' (/media-package or /workspaces/:id/media-package) in the sidebar, click the Share button -> select 'Copy client link' (/packages/share/:token) or 'Export PDF'.\n• Clients open the link in any web browser to view the deliverables catalog, proposal terms, post counts, and can negotiate or respond to the package directly without logging in.\n\n2. Formal Post Approval:\n• To ensure full transparency and an immutable audit trail, clients should be invited to the workspace with the Client role.\n• When posts require approval, clients navigate to 'Post approvals' (/task-approvals) or click the secure link received via email/message on mobile or desktop to inspect native social previews and tap 'Approve' or 'Reject' within seconds.",
    tags: ["client", "preview link", "media package", "proposal", "export pdf", "quick approval"],
  },

  // =========================================================================
  // 2. AGENCY (Agency & Organization - 5 items)
  // =========================================================================
  {
    id: "faq-agn-1",
    category: "agency",
    question: "How to handle company invitations showing 'Expired' status?",
    answer:
      "Cause: For security purposes, company invitation links have a defined validity period (default is 30 days).\n\nTroubleshooting steps:\n• Step 1: Administrators navigate to 'Members & Roles' in the main navigation -> select 'Agency members' (/agency/:id/members).\n• Step 2: Switch to the 'Invitations' tab to view all invitations marked as 'Expired' or 'Pending'.\n• Step 3: Click 'Revoke' on the expired invite, then in the invite form enter the email, select role (Manager, Creator, Client - selecting Client requires a target Workspace), and click 'Send Invitation'.\n• Step 4: Once generated, click 'Copy Link' (/invitations/accept?token=...) displayed below to share directly with the member for immediate activation. Members can also track their invitations under 'Invitations' (/invitations).",
    tags: ["invitation", "expired", "members", "resend invite", "copy link", "members & roles"],
  },
  {
    id: "faq-agn-2",
    category: "agency",
    question: "What if a client reports not receiving the workspace invitation email?",
    answer:
      "Cause: The client's corporate email spam filters might have routed the invite to Junk/Spam, or the email address was mistyped during entry.\n\nResolution:\n• Step 1: Managers or Administrators open the Workspace -> go to 'Clients' (/workspaces/:id/clients) under Workspace Settings in the navigation.\n• Step 2: Review the client list to verify whether the email address was spelled correctly.\n• Step 3: Click 'Add Client', pick the client brand profile, and input the email to trigger an official invitation.\n• Step 4: The client can also register or sign in to BrandHub directly with that exact email address, and the system will automatically associate them with the workspace.",
    tags: ["invite client", "workspace", "settings", "add client", "email delivery", "clients"],
  },
  {
    id: "faq-agn-3",
    category: "agency",
    question: "How to manage media partners, press contacts, and influencer bookings?",
    answer:
      "BrandHub provides two centralized tiers for media partner management:\n\n1. Agency Level - Master Partner Directory:\n• Navigate to 'Partner Directory' (/agency/:id/collaborators) in the sidebar.\n• Click 'Add Partner' to store: Organization name, category (Online Press - Newspaper, Television - TV, Billboard - Banner, Other), contact person, phone number, email, and collaboration notes.\n\n2. Workspace Level - Campaign Partner Tracking:\n• Open 'Campaign Partners' (/workspaces/:id/campaign-partners) or select a campaign in 'Campaigns' (/campaigns).\n• Add partners from the Directory and track collaboration milestones across 4 standardized stages:\n  + Contacted\n  + In Negotiation\n  + Agreement Reached\n  + Published / Broadcasted",
    tags: ["partner directory", "campaign partners", "campaigns", "press", "broadcast", "collaboration progress"],
  },
  {
    id: "faq-agn-4",
    category: "agency",
    question: "How to change password, update personal information, and profile picture?",
    answer:
      "Step-by-step guide:\n• Step 1: Click your avatar or account name in the top right corner of the navigation bar -> select 'Settings' or go directly to 'Profile' (/settings/profile).\n• Step 2 - Update Profile: In the 'Profile' (/settings/profile) section, upload a new avatar photo, update your display name and contact phone number -> Click 'Save Changes'.\n• Step 3 - Change Password: Switch to the 'Security' (/settings/security) tab -> Enter your current password, your new password, and confirmation -> Click 'Update Password'.\n• Note: If your account signs in using Google Single Sign-On (OAuth), your password credentials are managed directly via your Google account.",
    tags: ["change password", "profile", "security", "avatar", "account settings"],
  },
  {
    id: "faq-agn-5",
    category: "agency",
    question: "Where is the Workspace timezone configured and how does it affect scheduling?",
    answer:
      "Importance: Timezone determines the exact time scheduled posts automatically publish to connected social networks and ensures synchronicity across the Editorial Calendar.\n\nHow to configure:\n• Step 1: Open the target Workspace -> select 'General Settings' (/workspaces/:id/settings) under Workspace Settings from the left navigation.\n• Step 2: Click the 'Edit' button (pencil icon) in the upper right.\n• Step 3: Under 'Timezone', select the standard timezone for your target market (e.g., Indochina Time GMT+7 / Asia/Ho_Chi_Minh).\n• Step 4: Click 'Save Changes'. All scheduled publishing times and calendar views will instantly adapt to this localized time.",
    tags: ["timezone", "system time", "publishing schedule", "general settings", "workspace"],
  },

  // =========================================================================
  // 3. WORKSPACE (Workspace & Team - 5 items)
  // =========================================================================
  {
    id: "faq-ws-1",
    category: "workspace",
    question: "Why can't the assignee be changed once a task is in progress?",
    answer:
      "Cause: To maintain accountability, clear ownership, and audit trail integrity, once an assignee clicks 'Start Working' (task transitions to 'In Progress'), the assignee, initial brief, and deadline are locked. Neither Managers nor Agency Owners can directly reassign a task that is actively in progress.\n\nHow to hand over work:\n• Step 1: The Manager opens task details in 'Tasks' (/workspaces/:id/tasks) and selects 'Cancel Task' with handover notes.\n• Step 2: The Manager creates or assigns a new task from the 'Campaigns' (/campaigns) plan to the new assignee to take over smoothly.",
    tags: ["assignee", "assignment locked", "in progress", "role permissions", "task handover", "tasks"],
  },
  {
    id: "faq-ws-2",
    category: "workspace",
    question: "How to add and break down subtasks within a content task?",
    answer:
      "Subtasks allow you to split production into granular stages (e.g., Draft Copy, Graphic Design, Video Editing):\n\nHow to use:\n• Step 1: In the task details panel ('Tasks' - /workspaces/:id/tasks), scroll down to the 'Subtasks' section.\n• Step 2: Enter the subtask title -> Select an assignee and assign a deadline.\n• Step 3: Click 'Add Subtask' (plus icon or press Enter).\n• Each subtask tracks individual statuses (To Do, In Progress, Completed), and the overarching task progress bar automatically recalculates based on completed subtasks.",
    tags: ["subtask", "task breakdown", "progress", "checklist", "deliverables"],
  },
  {
    id: "faq-ws-3",
    category: "workspace",
    question: "Can clients view internal team chat messages and discussions?",
    answer:
      "BrandHub maintains strict security boundaries between communication channels:\n\n1. Team Chat & Channels (/workspaces/:id/chat):\n• Internal teams can create private channels accessible only to Agency Managers and Team Members. Clients CANNOT see channel names or message histories in private channels.\n• Direct messages (1-on-1 chats) are completely private between participants.\n\n2. Task Comments & Approvals:\n• Workspace Clients can participate in task comments to provide creative feedback.\n• Approval decisions, rejection reasons, and version diffs are cataloged separately in 'Approval History' across every review cycle (Round).",
    tags: ["private channel", "security", "internal chat", "team communication", "approval history"],
  },
  {
    id: "faq-ws-4",
    category: "workspace",
    question: "How to track Press & Broadcast publications step by step?",
    answer:
      "Unlike automated social media posting, press releases and television broadcasts require offline coordination:\n\nStandard workflow in 'Campaign Partners' (/workspaces/:id/campaign-partners):\n• Step 1 - Contacted: The campaign lead submits press releases or contacts media reporters/broadcast editors.\n• Step 2 - In Negotiation: Negotiate publishing rates, editorial column placement, duration, and airtime slots.\n• Step 3 - Agreement Reached: Both parties approve final copy/cut proofs and schedule publication/airing dates.\n• Step 4 - Published / Broadcasted: Article is live online or television segment has aired; attach live URL links and archive acceptance certificates.",
    tags: ["press", "broadcast", "campaign partners", "milestones", "acceptance"],
  },
  {
    id: "faq-ws-5",
    category: "workspace",
    question: "How to check file storage usage in a workspace?",
    answer:
      "Storage is shared across all high-resolution imagery, video assets, and documents within the Media Library:\n\nHow to inspect & optimize:\n• Step 1: Open 'Content Library' (/library or /workspaces/:id/library) from the left navigation bar.\n• Step 2: Check the 'Storage Usage' indicator and 'Used / Quota' progress bar in the top corner.\n• Step 3 - Optimize Storage & Trash: Deleted files in the Trash still count toward storage quota until permanently emptied or purged by retention policy.\n• Step 4 - Expand Capacity & Google Drive Sync: Connect your company Google Drive for cloud storage integration or contact your Administrator to upgrade your plan under 'Subscription Plans' (/subscription/plans).",
    tags: ["storage quota", "content library", "google drive", "trash", "storage limit", "cloud storage"],
  },

  // =========================================================================
  // 4. CONTENT (Content Workflow - 7 items)
  // =========================================================================
  {
    id: "faq-cnt-1",
    category: "content",
    question: "Post was rejected during review, how do I edit and resubmit?",
    answer:
      "When revision requests are made by a Manager or Client:\n\nAction steps:\n• Step 1: Open the task details in 'Tasks' (/workspaces/:id/tasks); the status automatically returns to 'In Progress'. Scroll down to 'Approval History' to read feedback notes and rejection reasons.\n• Step 2: Click 'Open Editor' to revise text, swap graphics, or update video assets -> Click 'Save Post'.\n• Step 3: Return to the task details, locate 'Result approval' (Phê duyệt kết quả), and click 'Submit for approval'. You can add summary notes explaining the revisions.\n• Step 4: A new review cycle (Round) begins with Manager review followed by final Client sign-off on the 'Post approvals' (/task-approvals) page.",
    tags: ["rejected", "edit post", "submit for review", "approval history", "post approvals", "tasks"],
  },
  {
    id: "faq-cnt-2",
    category: "content",
    question: "How can busy clients review and approve posts quickly on mobile devices?",
    answer:
      "BrandHub provides a responsive mobile interface optimized for smartphones (both iOS and Android):\n\nStreamlined mobile review experience:\n• Step 1: The client taps the notification link received via email or messaging app.\n• Step 2: The screen displays high-fidelity social previews matching native platform layouts (Facebook, Instagram, TikTok, LinkedIn...).\n• Step 3: Two one-tap actions are available:\n  + 'Approve' (Green): Confirms post content for approval.\n  + 'Reject' (Red): Allows entering quick feedback notes for the content team to revise.\n• The entire workflow takes less than 30 seconds directly in the mobile browser without requiring any app installation.",
    tags: ["mobile review", "smartphone", "client approval", "quick approval", "social preview", "post approvals"],
  },
  {
    id: "faq-cnt-3",
    category: "content",
    question: "How can clients submit ad-hoc or urgent content requests outside the plan?",
    answer:
      "When unexpected events, flash sales, or unplanned promotions arise:\n\nHow to submit requests:\n• Step 1: The client opens the workspace -> navigates to 'Content Requests' (/requests or /workspaces/:id/requests) in the sidebar.\n• Step 2: Click 'Create Request' in the top right corner.\n• Step 3: Fill in Title, Description, Content Type, Desired Deadline, and Target Social Channels -> Click 'Save Request'.\n• Step 4: The request enters 'Pending' status. The agency management team reviews feasibility and selects 'Accept' (generating a new task in /workspaces/:id/tasks automatically) or 'Decline' with an explanatory message.",
    tags: ["content request", "create request", "client", "ad-hoc content", "tasks"],
  },
  {
    id: "faq-cnt-4",
    category: "content",
    question: "What should be done if an ad-hoc content request is declined?",
    answer:
      "Common reasons: Extremely tight turnaround time, exceeding campaign quotas, or insufficient creative assets/brief details.\n\nNext steps:\n• Note: 'Declined' is a finalized status to retain complete audit and communication history.\n• Step 1: Open 'Content Requests' (/requests) -> click on the declined request to read the management team's explanation.\n• Step 2: Click 'Create Request' to start a revised request.\n• Step 3: Adjust to a more feasible deadline, attach necessary assets, or arrange scope reallocation against other contract deliverables -> Click 'Save Request'.",
    tags: ["declined", "request rejected", "create new request", "manager feedback", "content requests"],
  },
  {
    id: "faq-cnt-5",
    category: "content",
    question: "Why hasn't an approved post published automatically to social channels yet?",
    answer:
      "Cause: Post approval is decoupled from immediate publishing to respect scheduled publish times and prevent accidental publishing during connection interruptions.\n\nInspection & Resolution:\n• Step 1: Open 'Publish' (/publish or /workspaces/:id/publish). If the post has a future publish time, it stays in 'Scheduled' status and publishes automatically when the time arrives.\n• Step 2: If the scheduled time has passed and status shows 'Failed', go to 'Social Accounts' (/social-accounts or /workspaces/:id/social-accounts) to verify whether your Facebook Page, TikTok, or Instagram token authorization has expired.\n• Step 3: Once reconnecting or refreshing the social account token successfully, open the post details in Publish and click 'Retry' to trigger immediate publishing.",
    tags: ["approved post", "publishing", "scheduled post", "retry publish", "social accounts"],
  },
  {
    id: "faq-cnt-6",
    category: "content",
    question: "How to reconnect expired social media accounts (Facebook, Instagram, TikTok)?",
    answer:
      "Cause: Due to platform security policies from Meta (Facebook, Instagram) and TikTok, OAuth authorization tokens expire periodically or whenever page administrators change account passwords.\n\nHow to reconnect:\n• Step 1: Workspace Administrators open 'Social Accounts' (/social-accounts or /workspaces/:id/social-accounts).\n• Step 2: Find the account card displaying 'Expired' or 'Expiring Soon' badge.\n• Step 3: Click 'Reconnect' on the respective platform card.\n• Step 4: Sign in with the administrative social account and grant required publishing permissions to BrandHub.",
    tags: ["social accounts", "expired token", "reconnect account", "facebook", "tiktok", "instagram"],
  },
  {
    id: "faq-cnt-7",
    category: "content",
    question: "How to cancel or reschedule a scheduled post?",
    answer:
      "When a post is in 'Scheduled' status:\n\nFlexible management options:\n• Method 1 - Drag and Drop on Calendar (/calendar or /workspaces/:id/calendar): Open the Calendar view, then drag and drop the post card to another calendar date slot for instant rescheduling.\n• Method 2 - Adjust During Approval: When approving posts on the 'Post approvals' (/task-approvals) page, the reviewer can select the publishing timeline: 'Publish Now', 'Schedule' (set exact date & time), or 'Publish Later'.\n• Method 3 - Edit in Publishing List: Open 'Publish' (/publish), click the scheduled post, and adjust the target publish timestamp.",
    tags: ["calendar", "reschedule", "drag and drop", "schedule post", "publishing", "post approvals"],
  },

  // =========================================================================
  // 5. SECURITY & AI (Security & AI Studio - 5 items)
  // =========================================================================
  {
    id: "faq-sec-1",
    category: "security",
    question: "How to resolve 'Insufficient AI Credits' error when generating copy or images?",
    answer:
      "Cause: Two possibilities: 1) Your individual user quota has been exhausted; 2) The agency's shared monthly credit pool is fully depleted.\n\nResolution:\n• Team Members / Content Creators: Visit 'AI Credits' (/agency/:id/credit) to check your consumed credits and assigned quota. Contact your Agency Administrator if you need an individual quota increase.\n• Administrators: Visit 'AI Credits' (/agency/:id/credit) to reallocate member limits, top up instant credits via PayOS VietQR bank transfer, or upgrade subscription tier under 'Billing & Plans' / 'Subscription Plans' (/subscription/plans).",
    tags: ["ai credits", "credit quota", "ai credit management", "top up credits", "administrator", "payos", "ai studio"],
  },
  {
    id: "faq-sec-2",
    category: "security",
    question: "How does the monthly AI credit reset cycle and add-on credit mechanism work?",
    answer:
      "AI credit allocation system on BrandHub:\n\n1. Monthly Subscription Credits: Automatically renewed on the first day of each billing cycle (refilled up to your plan limit). Unused monthly subscription credits do not roll over to subsequent billing periods.\n2. Add-on Top-up Credits: When purchasing supplemental credit packs via PayOS QR, these credits NEVER EXPIRE and have perpetual validity. They are only deducted after the monthly subscription allowance has been completely exhausted.",
    tags: ["reset cycle", "monthly ai credits", "top-up credits", "no expiration", "permanent credits", "ai studio"],
  },
  {
    id: "faq-sec-3",
    category: "security",
    question: "How to train AI copywriters to adhere to custom Brand Voice guidelines?",
    answer:
      "To ensure AI-generated copy matches unique brand persona and tone:\n\nSetting up the Brand Knowledge Base:\n• Step 1: Open 'AI Studio' from the navigation -> select 'Knowledge Base' (/ai-studio/knowledge-base).\n• Step 2: Upload brand guidelines, copywriting handbooks (Brand Voice), target keywords, and tone constraints (PDF, Word, or plain text TXT formats).\n• Step 3: Verify that 'Brand Voice' status shows ready. When generating new posts in Content Editor (/editor), the AI engine automatically grounds generation against these rules.",
    tags: ["brand voice", "knowledge base", "brand guidelines", "ai studio", "tone and style", "editor"],
  },
  {
    id: "faq-sec-4",
    category: "security",
    question: "How does the AI Brand Ambassador / Virtual Model feature work?",
    answer:
      "The AI Brand Ambassador feature enables brands to maintain a consistent, hyper-realistic persona across marketing imagery and video assets:\n\nCreation and usage guide:\n• Step 1: Navigate to 'AI Studio' in the sidebar -> select 'Brand Ambassador' (/ai-studio/ambassadors).\n• Step 2: Click 'Create Ambassador', name the model, and upload high-resolution reference portraits.\n• Step 3: Calibrate the facial similarity threshold to preserve distinctive facial contours.\n• Step 4: When generating campaign imagery or videos in 'Video Studio' (/ai-studio/video), select the ambassador as the featured model; the engine seamlessly composites the persona into target outfits and scenic settings.",
    tags: ["brand ambassador", "virtual model", "facial consistency", "ai generated images", "video studio", "ai studio"],
  },
  {
    id: "faq-sec-5",
    category: "security",
    question: "Are brand media assets and post drafts used to train public AI models?",
    answer:
      "BrandHub's Enterprise Privacy Commitment:\n\n• All creative drafts, visual media, brand guidelines, and review logs remain the exclusive intellectual property of your agency and clients.\n• BrandHub leverages enterprise-tier AI infrastructure with isolated processing environments.\n• The platform strictly guarantees customer data is never used to train public AI foundational models, safeguarding trade secrets and intellectual property.",
    tags: ["data privacy", "ai training", "customer privacy", "security commitment", "data protection"],
  },

  // =========================================================================
  // 6. BILLING (Billing & Plans - 5 items)
  // =========================================================================
  {
    id: "faq-bil-1",
    category: "billing",
    question: "How to upgrade subscription plans automatically via QR code bank transfer?",
    answer:
      "Instant PayOS QR payment automation activates your upgraded plan within 30 seconds:\n\nExecution steps:\n• Step 1: Agency Administrators (Owner) open 'Subscription Plans' (/subscription/plans) or click the Upgrade icon in navigation.\n• Step 2: Compare plan benefits and click 'Upgrade' to generate a PayOS payment QR code.\n• Step 3: The screen renders a standardized VietQR code prefilled with exact transfer amount and order code.\n• Step 4: Open your banking app, scan the QR code, and confirm the transaction. The PayOS system automatically detects payment and activates the plan instantaneously.",
    tags: ["qr payment", "automated payment", "subscription", "upgrade plan", "payos", "vietqr"],
  },
  {
    id: "faq-bil-2",
    category: "billing",
    question: "How to purchase supplemental AI credit packs during an active billing cycle?",
    answer:
      "When monthly AI copy and image generation demands exceed regular allocations:\n\nHow to top up:\n• Step 1: Open 'AI Credits' (/agency/:id/credit) -> scroll to 'Supplemental Credit Packs'.\n• Step 2: Select a credit pack matching your volume needs (e.g., 100, 500, or 1,000 credits).\n• Step 3: Scan the PayOS payment QR code to complete the instant bank transfer.\n• Exclusive Benefit: Supplemental top-up credits never expire and stay permanently in your balance across subsequent billing cycles.",
    tags: ["top up ai credits", "buy credits", "credit add-on", "lifetime validity", "qr payment", "payos", "ai credits"],
  },
  {
    id: "faq-bil-3",
    category: "billing",
    question: "Will post drafts and media files be deleted if the subscription expires?",
    answer:
      "BrandHub's Customer Data Retention Policy:\n\n• When your subscription expires, your account enters Read-Only mode. All drafts, visual assets in the Library, documentation, and approval histories REMAIN FULLY PRESERVED for a 30-day grace period.\n• Within these 30 days, simply renew your subscription under 'Subscription Plans' (/subscription/plans) to resume active creation and publishing without disruption.\n• BrandHub never automatically or prematurely deletes customer assets.",
    tags: ["subscription expiration", "data retention", "read-only mode", "data policy", "billing & plans"],
  },
  {
    id: "faq-bil-4",
    category: "billing",
    question: "How to view transaction history and request official electronic VAT invoices?",
    answer:
      "Transaction history inspection and invoice request workflow:\n\n• Step 1: Navigate to 'Invoices' (/subscription/invoices) under Agency navigation or from the Subscription Plans page.\n• Step 2: The ledger displays comprehensive records of subscription renewals and AI credit top-ups, including transaction IDs, amounts, creation dates, and statuses.\n• Step 3: To request corporate VAT electronic invoices, forward your transaction ID and business tax credentials (Company Name, Tax Code, Registered Address) to brandhub404@gmail.com for prompt issuance.",
    tags: ["vat invoice", "billing history", "tax invoice", "receipts", "subscription/invoices"],
  },
  {
    id: "faq-bil-5",
    category: "billing",
    question: "Is there a discount for annual billing instead of monthly billing?",
    answer:
      "Annual Billing Discount Policy:\n\n• On the 'Subscription Plans' (/subscription/plans) page, toggle the billing interval from 'Monthly' to 'Annual'.\n• Choosing annual billing grants an instant discount of up to 20% (equivalent to 2 months free of charge).\n• In addition, the full annual AI credit allocation is granted upfront, allowing flexible creative budget distribution throughout the year.",
    tags: ["annual billing", "discount", "savings", "promotions", "subscription plans"],
  },
];

export function HelpFaqPage() {
  const systemRole = useAuthStore((s) => s.systemRole);
  const isAdmin = systemRole === "ADMIN";
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("faq-gen-1");

  const FAQ_DATA = isEn ? FAQ_DATA_EN : FAQ_DATA_VI;

  const categories = [
    { id: "all", label: isEn ? "All Questions" : "Tất cả câu hỏi", icon: BookOpen },
    { id: "general", label: isEn ? "General" : "Tổng quan", icon: Sparkles },
    { id: "agency", label: isEn ? "Agency & Organization" : "Agency & Tổ chức", icon: Building2 },
    { id: "workspace", label: isEn ? "Workspace & Team" : "Workspace & Nhóm", icon: FolderOpen },
    { id: "content", label: isEn ? "Content Workflow" : "Quy trình nội dung", icon: FileText },
    { id: "security", label: isEn ? "Security & AI" : "Bảo mật & Quyền", icon: ShieldCheck },
    { id: "billing", label: isEn ? "Billing & Plans" : "Gói cước & Hóa đơn", icon: CreditCard },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCategory;

      const matchQuestion = faq.question.toLowerCase().includes(query);
      const matchAnswer = faq.answer.toLowerCase().includes(query);
      const matchTags = faq.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchCategory && (matchQuestion || matchAnswer || matchTags);
    });
  }, [FAQ_DATA, searchQuery, selectedCategory]);

  return (
    <PageWrapper
      title={
        isEn
          ? "Help Center & System Guide"
          : t("help.title", "Trung Tâm Trợ Giúp & Hướng Dẫn Hệ Thống")
      }
      description={
        isEn
          ? "Quickly look up frequently asked questions (FAQ), workflows, and administration guide for BrandHub Managers & Members."
          : t(
              "help.description",
              "Tra cứu nhanh câu hỏi thường gặp (FAQ), hướng dẫn quy trình sử dụng và cẩm nang cho Quản lý & Thành viên BrandHub.",
            )
      }
      bannerBadge={isEn ? "Help & Support" : t("help.badge", "Trợ giúp & Hỗ trợ")}
      headerTextClassName="flex-1 min-w-0 max-w-none"
      titleClassName="whitespace-normal xl:whitespace-nowrap xl:truncate text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight"
      descriptionClassName="whitespace-normal xl:whitespace-nowrap xl:truncate text-xs sm:text-sm text-muted-foreground"
      guideUrl="/admin/guide"
      showGuideButton={false}
      actions={
        isAdmin ? (
          <Link to="/admin/guide">
            <Button
              variant="default"
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer gap-1.5 text-xs"
            >
              <BookOpen className="size-3.5 shrink-0" />
              {isEn
                ? "Comprehensive Guide"
                : t("help.adminGuideButton", "Cẩm Nang Hướng Dẫn Toàn Tập")}
            </Button>
          </Link>
        ) : undefined
      }
    >
      <div className="space-y-6 sm:space-y-8 max-w-4xl xl:max-w-5xl mx-auto w-full min-w-0">
        {/* Search Bar & Quick Categories */}
        <div className="border-border bg-card rounded-2xl border p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 w-full min-w-0">
          <div className="relative w-full w-full min-w-0">
            <Search className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 shrink-0" />
            <Input
              type="text"
              placeholder={
                isEn
                  ? "Search by keyword (e.g., invite client, create workspace, approve post, 2FA)..."
                  : t(
                      "help.searchPlaceholder",
                      "Tìm kiếm theo từ khóa (ví dụ: mời khách hàng, tạo không gian làm việc, duyệt bài, xác thực)...",
                    )
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 text-xs sm:text-sm bg-muted/30 focus-visible:ring-brand-orange rounded-xl w-full min-w-0"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-orange text-white shadow-xs font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2 w-full">
            <h2 className="text-foreground text-sm font-bold flex items-center gap-2">
              <HelpCircle className="size-4 text-brand-orange" />
              <span>
                {isEn
                  ? `Frequently Asked Questions (${filteredFaqs.length})`
                  : `Câu hỏi thường gặp (${filteredFaqs.length})`}
              </span>
            </h2>
            {isAdmin && (
              <Link
                to="/admin/guide"
                className="text-brand-orange hover:underline text-xs flex items-center gap-1 font-medium"
              >
                {isEn ? "View full workflow documentation" : "Xem cẩm nang hướng dẫn đầy đủ"}{" "}
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="border-border/60 rounded-xl border border-dashed p-10 text-center space-y-2 w-full">
              <p className="text-muted-foreground text-xs">
                {isEn
                  ? `No matching results found for "${searchQuery}".`
                  : `Không tìm thấy kết quả phù hợp với từ khóa "${searchQuery}".`}
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
                {isEn ? "Clear search filter" : "Xóa bộ lọc tìm kiếm"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 w-full min-w-0">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border-border bg-card rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:border-brand-orange/40"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-foreground text-xs sm:text-sm font-semibold pr-3 break-words flex-1 min-w-0">
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
                        <p className="whitespace-pre-line break-words">{faq.answer}</p>
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
              })}
            </div>
          )}
        </div>

        {/* Contact Support & Admin Banner */}
        <div className="border-border bg-gradient-to-r from-card via-card to-brand-orange/5 rounded-2xl border p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 w-full min-w-0">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-foreground text-sm font-bold flex items-center gap-2 justify-center sm:justify-start">
              <LifeBuoy className="size-4 text-brand-orange" />
              {isEn
                ? "Need additional technical support or customized features?"
                : "Bạn cần thêm thông tin hỗ trợ hoặc giải đáp thắc mắc?"}
            </h3>
            <p className="text-muted-foreground text-xs">
              {isEn
                ? "BrandHub support team is always ready to respond within 24 hours."
                : "Đội ngũ hỗ trợ BrandHub luôn sẵn sàng phản hồi trong vòng 24 giờ."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto">
            <a href="mailto:brandhub404@gmail.com">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
                <Mail className="size-3.5" /> {isEn ? "Send Feedback" : "Gửi phản hồi"}
              </Button>
            </a>
            {isAdmin && (
              <Link to="/admin/guide">
                <Button variant="default" size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-1.5 text-xs cursor-pointer">
                  <BookOpen className="size-3.5" /> {isEn ? "View Guide" : "Xem cẩm nang"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default HelpFaqPage;
