# BrandHub — Quy định & Tiêu chuẩn Code

> **Mục đích:** Mọi tính năng mới đưa vào repo phải tuân thủ các quy định dưới đây.
> Không ngoại lệ nếu chưa có sự đồng ý của team lead.
>
> **Nguồn tổng hợp (đã đồng bộ):** tài liệu này = `rule.md` (chuẩn cũ) + toàn bộ
> yêu cầu kiến trúc của `STRUCTURE.md` + quy tắc hiện hành trong `CLAUDE.md`.
> `STRUCTURE.md` là nguồn sự thật cho **kiến trúc feature-based**; file này là
> nguồn sự thật cho **cách viết code** (style, i18n, theme, TS, a11y).

---

## 1. Theme — Light / Dark

- **CSS Variables:** Tất cả màu sắc khai báo trong `src/globals.css` qua HSL custom
  properties (`--background`, `--foreground`, `--brand-orange`).
- **Dark mode:** Dùng class `.dark` trên `<html>`. Mọi component phải hoạt động đúng
  ở cả 2 mode.
- **Tailwind v4 CSS-first:** KHÔNG có `tailwind.config.js`. Màu/size/font khai báo
  trong `@theme` của `globals.css`; utility sinh tự động từ token (`bg-primary`,
  `text-brand-orange`, `bg-brand-orange-soft`).
- **Cách dùng trong Tailwind:**
  ```tsx
  // Đúng — dùng class Tailwind semantic
  <div className="bg-background text-foreground">

  // Đúng — token semantic thay cho bg-white/dark:bg-zinc-900
  <div className="bg-card text-foreground">
  <div className="bg-muted text-muted-foreground">

  // Đúng — token thương hiệu
  <Button variant="orange">Đăng ký</Button>

  // Đúng — hover state dùng opacity trên token, không tự chế màu tối
  <button className="bg-brand-orange hover:bg-brand-orange/90">Lưu</button>

  // Sai — hardcode màu
  <div style={{ background: "#fafafa" }}>
  <Button className="bg-[#f05a28] text-white">Đăng ký</Button>
  <button className="bg-brand-orange hover:bg-[#d94e20]">Lưu</button>
  ```
- **Nguyên tắc màu:** ưu tiên class semantic (`bg-primary`, `text-muted-foreground`,
  `bg-card`, `bg-muted`, `text-foreground`, `border-border`) + token thương hiệu
  (`bg-brand-orange`, `text-brand-orange`, `bg-brand-orange-soft`). KHÔNG dùng raw
  hex/raw palette (`bg-[#f05a28]`, `text-zinc-500`, `bg-white`/`dark:bg-zinc-900` khi
  đã có `bg-card` tương đương).
- **Hover/active state:** dùng opacity trên token (`hover:bg-brand-orange/90`,
  `active:bg-brand-orange/80`), KHÔNG tự pha màu tối hơn bằng hex riêng
  (`hover:bg-[#d94e20]`).
- **Ngoại lệ:** Được dùng `var(--brand-orange)` trong `style` prop khi Tailwind không
  hỗ trợ (màu động, gradient). Mọi màu hex tĩnh phải khai báo tập trung trong
  `src/theme/colors.ts` và tham chiếu qua token.
- **Ngoại lệ — brand màu bên thứ 3:** SVG icon/logo của nhà cung cấp OAuth
  (Google, Microsoft, LinkedIn…) giữ nguyên hex chính hãng (`fill="#4285F4"`)
  — đây là brand color bắt buộc theo guideline của bên thứ 3, không phải màu
  UI tự chọn, không thay bằng token.
- **Token `--sidebar*`:** Sidebar dùng `--sidebar`, `--sidebar-foreground`,
  `--sidebar-border` — 3 token này phải có trong `:root` + `.dark` (mặc định
  `#09090b` / `#fafafa` / `#27272a`).
- **Kiểm tra:** Mỗi PR phải có screenshot light + dark mode.

---

## 2. i18n — Đa ngôn ngữ (Tiếng Việt / English)

- **Thư viện:** `react-i18next` + `i18next`.
- **Cấu trúc file:**
  ```
  src/i18n/
  ├── index.ts          # i18next init
  ├── locales/
  │   ├── vi.json       # Tiếng Việt (default)
  │   └── en.json       # English
  └── types.ts          # Type cho translation keys
  ```
- **Cách dùng:**
  ```tsx
  // Đúng — dùng hook useTranslation
  const { t } = useTranslation();
  <h1>{t("auth.login.title")}</h1>

  // Sai — hardcode text tiếng Việt
  <h1>Đăng nhập</h1>
  ```
- **Key naming:** Dạng `namespace.section.key` (VD: `auth.login.title`,
  `dashboard.stats.totalPosts`).
- **Key-parallel (bắt buộc):** key thêm vào `vi.json` phải thêm đồng bộ vào `en.json`.
  Hai file luôn song song — thiếu 1 bên là lỗi.
- **Không nhúng text trong code logic** — mọi string hiển thị phải qua `t()`.
- **Ngoại lệ — text là dữ liệu, không phải UI chrome:** sample/mock content (caption
  demo, tên khách hàng giả, industry mẫu trong `mockXxxService.ts`) KHÔNG cần qua
  `t()` — đó là dữ liệu giả lập một người dùng thật sẽ nhập, không phải nhãn giao
  diện. Chỉ label/button/placeholder/toast/title do hệ thống hiển thị mới bắt buộc
  i18n.

---

## 3. Responsive — Mobile-first

- **Breakpoints:** Theo Tailwind mặc định:
  | Prefix | Width | Thiết bị |
  |--------|-------|----------|
  | (none) | 0px   | Mobile base |
  | `sm:`  | 640px | Mobile ngang |
  | `md:`  | 768px | Tablet |
  | `lg:`  | 1024px | Laptop nhỏ |
  | `xl:`  | 1280px | Desktop |
  | `2xl:` | 1536px | Màn hình lớn |
- **Nguyên tắc:**
  - Mobile-first: code cho mobile trước, dùng `md:`, `lg:` để scale lên.
  - Auth pages: brand panel ẩn dưới `lg:` (dùng `hidden lg:flex`).
  - Form max-width `400px`, không co giãn vô hạn.
  - Test trên ít nhất 3 kích thước: mobile (375px), tablet (768px), desktop (1440px).
  - Tránh `overflow: hidden` trên body — gây lỗi scroll trên mobile.

---

## 4. Component — Dùng chung, không tự chế

### 4.1 Button
- **Luôn dùng `<Button>` từ `@/components/ui/button`.**
- Các variant có sẵn: `default`, `primary`, `orange`, `destructive`, `danger`,
  `outline`, `secondary`, `ghost`, `link`.
  - `orange` = brand orange (`bg-brand-orange text-white`) — dùng cho CTA chính.
  - `destructive` / `danger` = đỏ (`bg-destructive`) — xoá/huỷ.
  - `default` / `primary` = `bg-primary` (near-black light / near-white dark).
- Sizes: `default`, `sm`, `md`, `lg`, `icon`.
- Loading state qua prop `loading` (tự động hiện `<Spinner>`).
- **Sai:**
  ```tsx
  <button className="bg-orange-500 text-white px-4 py-2 rounded">Submit</button>
  <Button className="bg-[#f05a28] text-white">Đăng ký</Button>
  ```
  **Đúng:** `<Button variant="orange">Đăng ký</Button>`

### 4.2 Input
- **Luôn dùng `<Input>` từ `@/components/ui/input`.**
- Props: `label`, `error`, `iconPrefix`, `iconSuffix`.
- Validation error hiển thị qua prop `error` (tự động render `data-slot="input-error"`).

### 4.3 Spinner
- Dùng `<Spinner>` hoặc prop `loading` của `<Button>`. Không tự tạo spinner bằng CSS inline.

### 4.4 Toast / Notification
- Dùng `toast.success()`, `toast.error()` từ `sonner`.
- Error message lấy từ `ApiResponse.error.message`.

### 4.5 Style utility
- Dùng `cn()` từ `@/lib/utils` để merge class. Không dùng template string nối class thủ công.

### 4.6 Icon — LUÔN lucide-react, KHÔNG emoji
- **KHÔNG BAO GIỜ dùng emoji làm icon/button/label/status.** Luôn dùng `lucide-react`.
  ```tsx
  // Sai
  <span>👍 Thích</span>

  // Đúng
  import { ThumbsUp } from "lucide-react";
  <span><ThumbsUp className="size-4" /> Thích</span>
  ```
- Lý do: emoji render khác nhau giữa OS/browser, không kế thừa `currentColor`, không
  size/stroke đồng bộ, phá contrast dark-mode.
- **Ngoại lệ — emoji là dữ liệu, không phải icon:** text mẫu/giả lập user nhập thật
  (caption, comment, chat, demo textarea) được chứa emoji. Không strip emoji khỏi
  `feedContent.ts` hay demo content — đó là data, không phải UI chrome.
- Mapping thường dùng: Thích=`ThumbsUp`, Yêu=`Heart`, Cười=`Laugh`, Wow=`PartyPopper`,
  Check=`Check`, Dashboard=`LayoutGrid`, Calendar=`CalendarDays`, Analytics=`LineChart`,
  Upload=`Upload`, Sidebar nav=`LayoutDashboard`/`FolderOpen`/`FileEdit`/`Users`/`BarChart3`.
- Kích thước icon dùng utility `size-*` (`size-4`, `size-3.5`), không dùng `w-4 h-4`.

---

## 5. TypeScript — Nghiêm ngặt

- **Không `any`.** Dùng `unknown` và type guard nếu không biết trước kiểu.
- **Type import:** Dùng `import type { X }` cho type-only imports (bắt buộc bởi
  `verbatimModuleSyntax` — import kiểu thường sẽ gây lỗi build).
- **Props:** Mọi component phải có interface/type cho props.
- **API response:** Mọi response từ backend phải được type với `ApiResponse<T>`
  (`{ success, data, error?, meta?, requestId?, version? }`) — không dùng `any`.
- **Error handling:**
  ```tsx
  catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? "Lỗi không xác định";
    toast.error(msg);
  }
  ```

---

## 6. Kiến Trúc File & Folder (Feature-Based)

> Nguồn: `STRUCTURE.md`. Đây là chuẩn bắt buộc cho mọi feature mới.

### 6.1 Nguyên tắc 3 lớp

1. **Feature-Based Architecture:** mỗi tính năng trong `src/pages/[feature]/` là một
   mô-đun độc lập, chứa đủ UI + hooks + services + types riêng.
2. **Atomic Design:**
   - `src/components/ui/` — nguyên tử (Atoms), KHÔNG business logic (`Button`, `Input`,
     `Dialog`, `Badge`, `Table`, `Skeleton`, `Sonner`).
   - `src/components/common/` — phân tử dùng chung (Molecules) xuất hiện nhiều trang
     (`SearchHeader`, `Pagination`, `EmptyState`, `ConfirmDialog`).
   - `src/components/layout/` — khung app (`Layout`, `Navbar`, `Sidebar`, `PageWrapper`,
     `AuthGuard`).
3. **Orchestrator Pattern:** `index.tsx` / `detail.tsx` của mỗi feature là điều phối
   viên, giữ ngắn gọn, lắp ghép sub-components từ `components/`.

### 6.2 Sơ đồ cấu trúc chuẩn

```text
src/
├── components/               # Shared Components & Design System
│   ├── common/               # Reusable Molecules (SearchHeader, Pagination, ConfirmDialog)
│   ├── layout/               # Layout, Navbar, Sidebar, PageWrapper, AuthGuard
│   └── ui/                   # UI Primitives (Button, Input, Dialog, Badge, Table, Skeleton, Sonner)
├── hooks/                    # Custom hooks dùng chung toàn app (useDebounce, ...)
├── lib/                      # utils.ts (cn helper)
├── pages/                    # Feature Modules (Feature-Based)
│   ├── [feature]/
│   │   ├── components/       # UI sub-components (Table, Banner, Cards, Form Modals, Filters)
│   │   ├── hooks/            # Custom hook (useClients.ts, useRequests.ts)
│   │   ├── services/         # API service riêng (clientService.ts) — nếu tách riêng
│   │   ├── types/            # Models, Interfaces, DTOs — nếu tách riêng
│   │   ├── index.tsx         # Màn hình danh sách chính (< 150 dòng)
│   │   └── detail.tsx        # Màn hình chi tiết (< 100 dòng, nếu có)
│   └── ...
├── routes/                   # AppRoutes.tsx
├── services/                 # Central API Client (api.ts axios + per-domain services)
├── store/                    # Zustand stores (authStore.ts, workspaceStore.ts)
├── theme/                    # colors.ts (design tokens tập trung)
├── types/                    # Types dùng chung toàn app (user.ts, post.ts)
├── utils/                    # helpers
├── App.tsx                   # BrowserRouter + routes
├── globals.css               # Tailwind v4 + shadcn theme vars + keyframes
└── main.tsx                  # Entry point
```

### 6.3 5 thành phần chuẩn của một feature module

| Thành phần | Đường dẫn | Mô tả |
| :--- | :--- | :--- |
| **UI Components** | `components/` | Tách nhỏ khối giao diện (Table, Banner, Cards, Form Modals, Filters). |
| **Custom Hooks** | `hooks/` | Quản lý state cục bộ, gọi API, xử lý async (VD: `useClients`). |
| **API Services** | `services/` | Hàm gọi REST API (`getClients`, `createClient`). |
| **Types & DTOs** | `types/` | Interfaces, Models, Request/Response DTOs. |
| **Main View** | `index.tsx` | Trang danh sách chính (< 150 dòng), nối Hook + render sub-components. |
| **Detail View** | `detail.tsx` | Trang chi tiết (< 100 dòng, nếu có). |

### 6.4 Quy tắc đặt component (BẮT BUỘC)

- **Component chỉ dùng bởi 1 feature** → đặt trong `src/pages/[feature]/components/`.
- **Component dùng ≥ 2 feature** → đặt trong `src/components/common/` (Molecules) hoặc
  `src/components/ui/` (Atoms).
- **KHÔNG** đặt sub-component của 1 page vào `src/components/{feature}/` gốc — đây là
  vi phạm Orchestrator Pattern.
- **Services & Types:** ưu tiên central trong `src/services/` và `src/types/`
  (CLAUDE.md). Chỉ tách `services/` / `types/` riêng trong `src/pages/[feature]/` khi
  chúng thật sự feature-specific và không tái dùng ở nơi khác.

### 6.5 Naming

- Component & Page: `PascalCase` (`ClientTable.tsx`, `SearchHeader.tsx`).
- Hook: `camelCase` + tiền tố `use` (`useClients.ts`, `useDebounce.ts`).
- Service & Util: `camelCase` (`clientService.ts`, `api.ts`).
- Types: `camelCase` (`client.ts`, `post.ts`).
- **Page component:** `export default` (lazy load cần default). UI/shared: `export` named.

---

## 7. API & Data Fetching

- **Axios instance:** Dùng `api` từ `@/services/api` (đã cấu hình `withCredentials`,
  auto-refresh token 401). KHÔNG tạo ad-hoc `axios` instance, KHÔNG hardcode baseURL.
- **Service layer:** Mọi API call phải qua file service (`authService.ts`,
  `workspaceService.ts`), không gọi `api.post()` trực tiếp trong component.
- **Endpoint convention:** `/api/v1/{domain}/{action}` (VD: `/api/v1/auth/login`,
  `/api/v1/auth/forgot-password`).
- **Response envelope:** backend trả `ApiResponse<T>`:
  ```json
  { "success": false, "error": { "code": "...", "message": "..." } }
  ```
- **Server data:** ưu tiên TanStack Query; KHÔNG duplicate server state vào localStorage.
- **Interceptor:** 401 tự động gọi `/api/v1/auth/refresh` (cookie HttpOnly), fail thì
  redirect `/login`.

---

## 8. Testing

- **E2E:** Playwright, Page Object Model.
  - Test files: `tests/e2e/[feature]/[page].spec.ts`
  - Page Objects: `tests/pages/[PageName].ts`
  - Mock API với `page.route()` khi test UI flow, không phụ thuộc backend thật.
  - Locator ưu tiên: `getByLabel`, `getByRole`, `getByPlaceholder`, `getByText`.
  - Không thêm `data-testid` trừ khi không còn cách nào khác.
- **Unit/Integration:** Vitest + React Testing Library (khi cần).
- **Coverage target:** E2E phủ toàn bộ critical user flows (auth, tạo content, publish).

---

## 9. Git Workflow

- **Branch naming:** `feature/<tên-tính-năng>`, `fix/<mô-tả>`, `hotfix/<mô-tả>`.
- **Commit message:** Conventional Commits.
  ```
  feat(auth): thêm RegisterPage với real-time password validation
  fix(api): sửa refresh token flow sang HttpOnly cookie
  ```
- **Không commit:** `.env`, `node_modules/`, file build.
- **Claude không tự commit/push** — chỉ viết code, user tự review và commit.

---

## 10. Accessibility (A11y)

- **WCAG 2.1 AA** tối thiểu.
- Icon button phải có `aria-label`.
- Form input phải có `<label>` liên kết qua `htmlFor`.
- Focus ring visible trên mọi interactive element (dùng `focus-visible:ring-*`).
- Màu sắc: contrast ratio ≥ 4.5:1 cho text thường, ≥ 3:1 cho text lớn.
- Toast/sonner: đủ thời gian đọc (≥ 5 giây cho error).

---

## 11. Performance

- **Lazy load pages:** Dùng `React.lazy()` + `Suspense` cho các page không phải critical path.
- **Image:** Dùng `<img>` với `loading="lazy"` cho ảnh dưới fold.
- **Font:** Inter + Geist Mono loaded từ Google Fonts (hiện tại), cân nhắc self-host cho production.
- **Bundle size:** Tránh import toàn bộ thư viện lớn (dùng named import: `import { Eye } from "lucide-react"`).

---

## 12. Checklist trước khi mở PR

- [ ] Hoạt động đúng ở Light + Dark mode (có screenshot)
- [ ] Responsive: test mobile (375px), tablet (768px), desktop (1440px)
- [ ] Text hiển thị qua i18n (`t()`), không hardcode; key song song vi/en
- [ ] Dùng component có sẵn (Button, Input, Spinner, …) — không tự chế, không raw HTML
- [ ] Icon dùng lucide-react, không emoji; size dùng `size-*`
- [ ] Màu dùng semantic token + `brand-orange`, không raw hex/zinc
- [ ] Cấu trúc feature-based: component trong `pages/[feature]/components/`, orchestrator <150 dòng
- [ ] TypeScript: không `any`, không lỗi `tsc --noEmit`
- [ ] API call qua service layer, không gọi trực tiếp `api.post()` trong component
- [ ] Error handling: bắt lỗi + hiển thị toast
- [ ] Loading state cho mọi async operation
- [ ] E2E test cho flow chính (nếu có thay đổi UI)
- [ ] Focus ring visible, aria-label cho icon button
- [ ] Git: branch name đúng format, commit message conventional
- [ ] Clean code: không DRY violation, hàm ≤ 30 dòng, file ≤ 300 dòng, không magic number, không nuốt lỗi

---

## 13. Clean Code

### 13.1 Nguyên tắc chung

- **DRY (Don't Repeat Yourself):** Logic lặp ≥ 2 lần → tách ra hàm/util/component. Không copy-paste code.
- **KISS (Keep It Simple, Stupid):** Ưu tiên giải pháp đơn giản nhất. Không over-engineering. Không abstraction khi chưa cần.
- **YAGNI (You Ain't Gonna Need It):** Không code tính năng "để dành sau này". Chỉ code thứ đang cần.
- **Single Responsibility:** Mỗi hàm/component chỉ làm MỘT việc. Nếu mô tả hàm cần dùng chữ "và" → tách ra.
- **Early return:** Tránh nested `if` sâu. Return sớm khi điều kiện không thỏa mãn.

### 13.2 Hàm (Function)

- **Độ dài:** ≤ 30 dòng. Nếu dài hơn → tách thành hàm nhỏ hơn.
- **Số tham số:** ≤ 3 params. Nhiều hơn → gom vào object/interface.
- **Tên hàm:** Động từ + danh từ, mô tả chính xác việc hàm làm. VD: `getUserById`, `validatePassword`, `handleSubmit`.
- **Một mức trừu tượng:** Trong một hàm, mọi dòng code cùng mức trừu tượng. Không trộn low-level (DOM manipulation) với high-level (business logic).
- **Không side-effect ẩn:** Hàm tên `getX()` không được mutate state. Hàm tên `validateX()` không được gọi API. Tên hàm phải phản ánh đúng mọi thứ nó làm.
- **Pure function ưu tiên:** Cùng input → cùng output, không side-effect. Dùng pure function cho transform/validation/computation.

### 13.3 Biến & Hằng số

- **Tên có ý nghĩa:** Không đặt tên 1-2 ký tự (trừ `i`, `j` trong loop nhỏ hoặc `e` trong catch). Tránh `data`, `item`, `val`, `tmp`.
  ```tsx
  // Sai
  const d = users.filter(u => u.s === "active");
  // Đúng
  const activeUsers = users.filter(user => user.status === "active");
  ```
- **Boolean:** Prefix `is`, `has`, `should`, `can`. VD: `isLoading`, `hasError`, `shouldRedirect`.
- **Hằng số:** UPPER_SNAKE_CASE cho global constants. Đặt trong file constants hoặc đầu module.
  ```tsx
  const MAX_LOGIN_ATTEMPTS = 5;
  const OTP_LENGTH = 6;
  ```
- **Magic number/string:** Không số/bí ẩn trong code. Đặt tên cho mọi giá trị có ý nghĩa nghiệp vụ.

### 13.4 Cấu trúc điều kiện

- **Tránh `else` khi không cần:** Dùng early return thay vì `if-else`.
  ```tsx
  // Sai
  if (user) { return <Dashboard user={user} />; }
  else { return <Navigate to="/login" />; }

  // Đúng
  if (!user) return <Navigate to="/login" />;
  return <Dashboard user={user} />;
  ```
- **Tránh nested ternary:** Tối đa 1 ternary lồng nhau. Nhiều nhánh → dùng `if` hoặc object map.
- **Boolean expression trực tiếp:** Không so sánh với `true`/`false`.
  ```tsx
  // Sai
  if (isValid === true) { ... }
  // Đúng
  if (isValid) { ... }
  ```

### 13.5 Comment

- **Giải thích WHY, không phải WHAT.** Code nói WHAT, comment nói WHY.
  ```tsx
  // Sai — nói lại điều code đã nói
  // Set loading to true
  setLoading(true);

  // Đúng — giải thích lý do
  // Đợi 300ms trước khi gọi API để tránh rate limit của Google OAuth
  await new Promise(r => setTimeout(r, 300));
  ```
- **Không comment code cũ:** Xóa code không dùng. Git lưu lịch sử rồi.
- **TODO format:** `// TODO(author): mô tả — ngày YYYY-MM-DD`. Có người chịu trách nhiệm + ngày đến hạn.
- **Documentation comment:** Dùng JSDoc cho hàm exported/util.
  ```tsx
  /**
   * Kiểm tra mật khẩu có đủ mạnh không.
   * @returns score từ 0-5 (0=yếu, 5=rất mạnh)
   */
  export function getPasswordStrength(password: string): number { ... }
  ```

### 13.6 File & Module

- **Giới hạn dòng:** ≤ 120 ký tự / dòng.
- **Giới hạn file:** ≤ 300 dòng / file. File lớn hơn → tách module.
- **Import order:** React → thư viện bên ngoài → internal modules → types → styles.
  ```tsx
  // 1. React
  import * as React from "react";
  // 2. External
  import { useNavigate } from "react-router-dom";
  import { Eye, ArrowRight } from "lucide-react";
  // 3. Internal
  import { Button } from "@/components/ui/button";
  import { authService } from "@/services/authService";
  // 4. Types
  import type { LoginRequest } from "@/types/auth";
  ```
- **Import alias:** dùng `@/*` (→ `./src/*`), KHÔNG dùng relative `../`.
- **`verbatimModuleSyntax`:** type-only phải `import type`. (Đã nêu ở §5.)
- **Export default vs named:**
  - Component page → `export default` (lazy load cần default export)
  - Component UI/shared → `export` named
  - Utility function → `export` named

### 13.7 Xử lý lỗi (Error Handling)

- **Không nuốt lỗi:** Mọi `catch` phải làm gì đó: toast, log, hoặc re-throw. Không `catch (e) {}` rỗng.
  ```tsx
  // Sai — lỗi bị nuốt
  try { await doSomething(); } catch {}

  // Đúng — ít nhất phải log
  try { await doSomething(); } catch (err) { console.error("doSomething failed:", err); }
  ```
- **Error message cho người dùng:** Thân thiện, tiếng Việt. Không show raw error từ backend.
- **Error message cho developer:** Chi tiết, có context. Dùng `console.error`.
- **Validation error tại chỗ:** Lỗi liên quan đến field cụ thể → show ngay dưới field đó (inline error), không phải toast chung chung.

### 13.8 Cấu trúc Component

- **Thứ tự trong component function:**
  1. Hooks (`useState`, `useNavigate`, `useEffect`, …)
  2. Derived state / computed values
  3. Callback functions (handler)
  4. `useEffect` (side-effect)
  5. Conditional return (early return cho guard)
  6. JSX return
- **Tách logic khỏi UI:** Logic nghiệp vụ phức tạp → tách ra custom hook hoặc utility function. Component chỉ làm view.
  ```tsx
  // Đúng — logic trong custom hook
  const { user, loading, error, login } = useLogin();
  // Component chỉ render
  return <LoginForm onSubmit={login} loading={loading} error={error} />;
  ```
- **Component nhỏ:** Mỗi component đảm nhiệm một phần UI rõ ràng. Nếu JSX > 150 dòng → tách component con.

### 13.9 Async & Promise

- **async/await luôn:** Không dùng `.then().catch()` trừ khi pipeline xử lý stream.
- **Loading + Error + Data:** Mọi async operation phải handle đủ 3 state.
  ```tsx
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  return <DataView data={data} />;
  ```
- **Cleanup:** `useEffect` với async phải cleanup nếu component unmount.
  ```tsx
  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      const data = await api.getUsers();
      if (!cancelled) setUsers(data);
    }
    fetch();
    return () => { cancelled = true; };
  }, []);
  ```
- **Promise.all cho request song song:** Không `await` tuần tự khi các request không phụ thuộc nhau.
  ```tsx
  // Sai — chạy tuần tự
  const users = await api.getUsers();
  const posts = await api.getPosts();
  // Đúng — chạy song song
  const [users, posts] = await Promise.all([api.getUsers(), api.getPosts()]);
  ```

### 13.10 Refactoring Signals

Dấu hiệu cần refactor ngay:

- **Code smell:** Cùng logic xuất hiện ≥ 2 nơi → extract.
- **Long function:** Hàm > 30 dòng → tách.
- **Long file:** File > 300 dòng → tách module.
- **Deep nesting:** `if`/`for` lồng > 3 cấp → dùng early return hoặc tách hàm.
- **Feature envy:** Hàm dùng nhiều dữ liệu của object khác hơn dữ liệu của chính nó → move hàm sang object kia.
- **Primitive obsession:** Dùng string/number cho các giá trị có ý nghĩa domain (status, role, type) → chuyển thành enum/union type.

---

## 14. Typography & Visual Style

- **Font:** Inter (sans) + Geist Mono (mono), khai báo trong `globals.css` (`--font-sans`,
  `--font-mono`). Không tự ý import font khác.
- **Thang chữ chuẩn** (khai trong `@theme`): `text-xs`(12) → `text-sm`(14) → `text-base`(16)
  → `text-lg`(18) → `text-xl`(20) → `text-2xl`(24) → `text-3xl`(30).
  - **KHÔNG dùng `text-[Npx]` tùy ý** (8px, 9px, 10px, 11px…) — phá thang chữ. Nếu cần cỡ
    nhỏ hơn `text-xs`, khai báo token `--text-2xs` (11px) / `--text-3xs` (10px) trong
    `@theme` rồi dùng `text-2xs`.
- **Heading page:** dùng `PageWrapper` (title=`text-3xl font-bold tracking-tight`,
  description=`text-sm text-muted-foreground`) — mọi page đi qua shell này để đồng bộ.
- **Card radius:** container lớn (card/modal/panel — wrapper có `bg-card`/`border` bao
  quanh 1 khối nội dung) chốt `rounded-xl` (12px). Không trộn `rounded-md`/`rounded-lg`/
  `rounded-2xl` cho cùng loại container.
- **Badge/button nhỏ:** `rounded-md` (6px) vẫn hợp lệ cho phần tử nhỏ (badge, tag,
  button `px-2 py-0.5`, input `h-9`) — tỷ lệ radius nhỏ khớp kích thước nhỏ, KHÔNG bắt
  buộc nâng lên `rounded-xl`.
- **`components/ui/*` primitives:** radius mặc định của `Button`/`Input`/`Badge`/
  `Select`/`Textarea`/… KHÔNG tự ý đổi — đây là default cho toàn hệ thống, đổi ở đây
  ảnh hưởng mọi nơi dùng primitive đó. Muốn khác đi thì override qua `className` tại
  nơi dùng, không sửa primitive.
- **Shadow:** `shadow-xs`/`shadow-sm` cho card; `shadow-md` chỉ khi cần elevation. Không
  dùng pure-black drop-shadow trên nền sáng.
- **Spacing:** dùng thang `space-y-*` / `gap-*` / `p-*` Tailwind (4px base), không dùng
  padding lẻ tùy ý.

---

## 15. Feature Workflow

Mọi tính năng phát triển phải tuân theo quy trình **spec → plan → task → test** trước khi
viết code, và quay lại từ `spec.md` nếu có sai sót.

Xem nguồn sự thật duy nhất: `../brandhub-infrastructure/docs/rule/feature-workflow.md`
