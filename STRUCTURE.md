# BrandHub Web Dashboard — Standard Frontend Architecture

Tài liệu này định nghĩa **Kiến Trúc Chuẩn (Standard Target Architecture)** cho toàn bộ mã nguồn Frontend dự án **BrandHub Web Dashboard** (React + TypeScript + Vite + Tailwind CSS + Zustand).

---

## 📐 1. Nguyên Tắc Thiết Kế Cấu Trúc (Core Principles)

Dự án áp dụng 3 quy chuẩn thiết kế mã nguồn hàng đầu trong phát triển Web hiện đại:

1. **Feature-Based Architecture (Mô-đun hóa theo tính năng)**:
   Mỗi tính năng trong `src/pages/[feature]/` là một mô-đun độc lập, chứa đầy đủ giao diện, logic state, API service và định nghĩa types riêng.
2. **Atomic Design & Shared Components System**:
   - `src/components/ui/`: Các nguyên tử giao diện cơ bản (Atoms) không chứa business logic (`Button`, `Input`, `Dialog`, `Badge`, `Table`).
   - `src/components/common/`: Các khối giao diện dùng chung (Molecules) xuất hiện trên nhiều trang (`SearchHeader`, `Pagination`, `EmptyState`).
3. **Orchestrator Pattern (Tách nhỏ Component)**:
   File `index.tsx` hoặc `detail.tsx` của từng feature đóng vai trò làm điều phối viên (Orchestrator), giữ kích thước siêu ngắn gọn (< 150 dòng code), lắp ghép các UI Sub-components từ thư mục `components/`.

---

## 📁 2. Sơ Đồ Cấu Trúc Chuẩn (Standard Directory Tree)

```text
brandhub-web/
├── public/                       # Static public assets (Favicon, Manifest)
├── src/
│   ├── assets/                   # Static images, brand logos, custom icons
│   ├── components/               # 🎨 Shared Components & Design System
│   │   ├── common/               # ⭐ Reusable Molecules (SearchHeader, Pagination, ConfirmDialog, ...)
│   │   ├── layout/               # App Skeleton (Layout, Navbar, Sidebar, PageWrapper, AuthGuard)
│   │   └── ui/                   # 🧩 UI Primitives (Button, Input, Dialog, Badge, Table, Skeleton, Sonner)
│   ├── hooks/                    # Custom React Hooks dùng chung toàn ứng dụng (useDebounce, ...)
│   ├── lib/                      # Utilities & Configs (`utils.ts` chứa helper `cn()`)
│   ├── pages/                    # 🚀 Feature Modules (Kiến trúc Feature-Based Chuẩn)
│   │   ├── admin/                # Quản trị hệ thống Admin
│   │   ├── analytics/            # Báo cáo & Thống kê Analytics
│   │   ├── auth/                 # Xác thực người dùng (Login, Register, OTP, ForgotPassword, OAuth)
│   │   ├── calendar/             # Lịch lập kế hoạch nội dung (Content Calendar)
│   │   ├── client/               # ⭐ Quản lý Thương hiệu Khách hàng (Brand Clients)
│   │   │   ├── components/       # UI Sub-components (ClientTable, Banner, AnalyticsCards, Modals)
│   │   │   ├── hooks/            # Custom Hook xử lý State & Async (useClients.ts)
│   │   │   ├── services/         # API Service riêng cho Client (clientService.ts)
│   │   │   ├── types/            # Models, Interfaces & DTOs (client.ts)
│   │   │   ├── index.tsx         # Màn hình Danh sách Client (ClientListPage)
│   │   │   └── detail.tsx        # Màn hình Chi tiết Client (ClientDetailPage)
│   │   ├── dashboard/            # Trang Tổng quan (Dashboard Overview)
│   │   ├── editor/               # Trình soạn thảo bài viết Tiptap & AI Assistant Panel
│   │   ├── hashtag-groups/       # Quản lý Nhóm Hashtags
│   │   ├── library/              # Thư viện Media & Quản lý File
│   │   ├── portal/               # Client Portal (Giao diện xem cho khách hàng)
│   │   ├── requests/             # Quản lý & Phê duyệt Yêu cầu Nội dung (Content Requests)
│   │   ├── templates/            # Thư viện Mẫu Bài viết (Content Templates)
│   │   └── workspace/            # Cấu hình & Quản lý Workspace
│   ├── routes/                   # Khai báo tuyến đường ứng dụng (`AppRoutes.tsx`)
│   ├── services/                 # Central API Client (`api.ts` Axios instance & global interceptors)
│   ├── store/                    # Zustand Global Stores (`authStore.ts`, `workspaceStore.ts`)
│   ├── theme/                    # Cấu hình màu sắc & hằng số giao diện
│   ├── types/                    # Kiểu dữ liệu dùng chung toàn ứng dụng (`user.ts`, `post.ts`)
│   ├── utils/                    # Các hàm bổ trợ helper
│   ├── App.tsx                   # Main App Router Component
│   ├── globals.css               # Global Tailwind CSS Styles & Custom Variables
│   └── main.tsx                  # App Entry Point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── STRUCTURE.md                  # 📘 Tài liệu Kiến trúc Mã nguồn (File này)
```

---

## 🧩 3. Chi Tiết Thư Mục Nội Bộ Của Một Feature Module Chuẩn (`src/pages/[feature]/`)

Mọi mô-đun tính năng mới trong `src/pages/` khi xây dựng đều phải tuân thủ đúng 5 thành phần chuẩn:

| Thành phần | Đường dẫn | Mô tả & Nhiệm vụ |
| :--- | :--- | :--- |
| **UI Components** | `components/` | Tách nhỏ các khối giao diện (Table, Banner, Cards, Form Modals, Filters). |
| **Custom Hooks** | `hooks/` | Quản lý state cục bộ, gọi API, xử lý hiệu ứng async (ví dụ: `useClients`, `useRequests`). |
| **API Services** | `services/` | Chứa các hàm gọi REST API trỏ về Backend (`getClients`, `createClient`, ...). |
| **Types & DTOs** | `types/` | Định nghĩa TypeScript Interfaces, Models và Request/Response DTOs. |
| **Main View** | `index.tsx` | Trang danh sách chính (< 150 dòng code), kết nối Hook và render Sub-components. |
| **Detail View** | `detail.tsx` | Trang chi tiết (< 100 dòng code, nếu có). |

---

## 🎨 4. Quy Định Tái Sử Dụng Giao Diện (Design System & Common Components)

### 4.1. Atom Primitives (`src/components/ui/`)
- Không viết lại thẻ HTML thô (`<button>`, `<input>`, `<dialog>`).
- Sử dụng trực tiếp: `Button`, `Input`, `Dialog`, `ConfirmDialog`, `Badge`, `Skeleton`, `Table`, `Sonner`.

### 4.2. Common Molecules (`src/components/common/`)
- **`SearchHeader`**: Thanh tìm kiếm chuẩn tích hợp tìm kiếm, đếm tổng số lượng và Action Badges.
- **`Pagination`**: Thanh phân trang chuẩn "Trang X / Y" với nút điều hướng "Trước" & "Sau".

---

## 🛠️ 5. Quy Chuẩn Đặt Tên & Viết Code (Coding Guidelines)

1. **File Naming**:
   - Components & Pages: `PascalCase` (`ClientTable.tsx`, `SearchHeader.tsx`, `CreateEditClientModal.tsx`).
   - Hooks: `camelCase` có tiền tố `use` (`useClients.ts`, `useDebounce.ts`).
   - Services & Utils: `camelCase` (`clientService.ts`, `api.ts`).
   - Types: `camelCase` (`client.ts`, `post.ts`).
2. **Clean Code & Granularity**:
   - File trang chính (`index.tsx`, `detail.tsx`) phải cực kỳ sạch đẹp, không chứa JSX quá dài.
   - 100% Type Safety, không dùng kiểu `any`.
