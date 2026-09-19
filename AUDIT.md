# AUDIT.md — Kiểm tra UI, cấu trúc & phân luồng role

> **Ngày:** 2026-09-18
> **Phạm vi:** `brandhub-web-dashboard`
> **Mục đích:** Rà soát toàn bộ dashboard — UI đã đúng quy định (màu thương hiệu, cấu trúc file, shadcn primitives) chưa, và **đặc biệt phân luồng theo role** có đúng/chặt chẽ chưa.
> **Tài liệu này CHỈ liệt kê lỗi + hướng fix. Không sửa code trong đợt này.** Dùng nó làm checklist cho đợt sửa sau.

---

## Tóm tắt

| Nhóm | Trạng thái | Mức ưu tiên |
|---|---|---|
| 1. Phân luồng role | Đã có guard trung tâm, **còn 4 lỗ hổng** | **P0** |
| 2. Màu sắc / theme | Đã fix phần lớn, còn lỗi badge xanh dương | P1 |
| 3. Emoji vs lucide | Đã xử lý gần hết | P2 |
| 4. Cấu trúc file | Đã feature-based | P2 |
| 5. Primitives / raw HTML | Thiếu 9 primitive, còn raw HTML ở 11 file | P2 |

**Tóm tắt quan trọng:** So với audit trước, codebase đã refactor mạnh. Role gating **đã được cài** (không còn "zero guard" như trước) — nhưng vẫn còn lỗ hổng **ungated route** và **mobile nav không khớp**. Màu `--primary` đã là brand orange. Đọc từng phần bên dưới để có file:line chính xác.

---

## PHẦN 1 — Phân luồng Role (ưu tiên cao nhất)

### 1.1 Hiện trạng (đã có guard trung tâm)

Cơ chế gating đã được tập trung hóa, tốt hơn đáng kể so với trước:

- **Nguồn sự thật duy nhất** — [`src/routes/access.ts`](src/routes/access.ts) định nghĩa map `ROUTE_ACCESS` (route → role được phép) + `canAccess()` + `resolveAccessRule()`. `AuthGuard` và `Sidebar` **đọc chung** map này, không còn gating rời rạc.
- **AuthGuard chặn URL bypass** — [`src/components/layout/AuthGuard.tsx:62-64`](src/components/layout/AuthGuard.tsx#L62-L64) gọi `canAccess(location.pathname, systemRole, memberRole)`, nếu không đủ quyền → `Navigate` về `/dashboard`. Không còn "gõ URL thẳng vào `/admin` vẫn render".
- **Hai tầng role**:
  - `SystemRole = "ADMIN" | "USER"` — quyền toàn hệ thống (`src/types/user.ts:1`).
  - `MemberRole = "OWNER" | "MANAGER" | "CREATOR" | "CLIENT"` — quyền theo workspace (`src/types/workspace.ts:1`).
- **Admin bypass** — `canAccess()`: nếu `systemRole === "ADMIN"` → luôn cho phép (đúng).

### 1.2 Lỗ hổng còn lại

#### ① Ungated routes — ai đăng nhập cũng vào được (P0)

`resolveAccessRule()` trả `null` cho path **không có trong `ROUTE_ACCESS`**, và `canAccess()` khi `rule == null` thì **trả `true`** (default-allow). Hậu quả: route nào quên khai báo sẽ mở cho mọi người đã đăng nhập.

Các route **được khai báo trong `AppRoutes` nhưng thiếu trong `ROUTE_ACCESS`**:

| Route | Vấn đề | Nên là |
|---|---|---|
| `/subscription/checkout` | Không match key nào (chỉ có `/subscription/plans`) → mở | `["OWNER"]` |
| `/subscription/invoices` | Tương tự → mở | `["OWNER"]` |
| `/profile`, `/security`, `/notification-settings` | Mở cho mọi role (có thể chủ ý — trang cá nhân) | Xác nhận intent |
| `/components/examples` | Mở (trang dev/example) | Ẩn khỏi production |

→ **Fix:** thêm `"/subscription/checkout"` và `"/subscription/invoices"` vào `ROUTE_ACCESS` (giống `"/subscription/plans": ["OWNER"]`).

#### ② Prefix-match mong manh — `/workspace` "nuốt" `/workspaces/*` (P1)

`resolveAccessRule()` dùng `pathname.startsWith(k)` (xem [`access.ts:44`](src/routes/access.ts#L44)). Key `/workspace` là prefix của `/workspaces/*`, nên:

- `/workspaces/create` → bị gán rule `["OWNER"]` của `/workspace` (vô tình, nhưng may đúng intent).
- `/workspaces/:id/settings` → cũng thành `["OWNER"]` (chỉ OWNER sửa được, có thể nên OWNER+MANAGER).
- `/workspaces/:id/members` → có regex riêng (OK).

Nguy hiểm ở chỗ: thêm route mới kiểu `/workspaces/:id/analytics` thì sẽ **âm thầm** bị gán `OWNER` mà không ai biết.

→ **Fix:** tách `/workspace` (trang danh sách, OWNER) khỏi `/workspaces/*` (dùng key chính xác hoặc regex riêng từng route).

#### ③ Mobile bottom tab bar KHÔNG dùng `canAccess` (P1)

Sidebar (desktop) lọc bằng `canAccess()`, nhưng **bottom tab bar mobile** ở [`src/components/layout/Layout.tsx:126-141`](src/components/layout/Layout.tsx#L126-L141) dùng logic ad-hoc `filteredMobileTabs` — chỉ hardcode `currentRole === "CLIENT"` để ẩn `/workspace` + `/editor`.

Hậu quả: mobile hiển thị link mà desktop ẩn. Ví dụ `/analytics` (rule `["OWNER","MANAGER"]`) vẫn hiện trên mobile cho CREATOR/CLIENT. Gating mobile **không khớp** desktop.

→ **Fix:** cho `filteredMobileTabs` dùng `canAccess(tab.to, systemRole, memberRole)` thay vì hardcode CLIENT.

#### ④ Default-allow thay vì default-deny (P2)

`canAccess()` trả `true` khi không tìm thấy rule. Nếu sau này thêm route mới mà quên khai báo, nó sẽ mở ngầm.

→ **Fix (đề xuất):** đổi `resolveAccessRule` trả `null` → `canAccess` trả `false` khi không khai báo (default-deny), và bắt buộc mọi route protected phải có entry trong `ROUTE_ACCESS`. Cộng thêm 1 test/lint kiểm tra mọi path trong `AppRoutes` đều có rule.

### 1.3 Bảng Role → Route (hiện tại, nguồn `ROUTE_ACCESS`)

| Route | OWNER | MANAGER | CREATOR | CLIENT | ADMIN |
|---|---|---|---|---|---|
| `/dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/change-password` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/workspace` | ✓ | — | — | — | ✓ |
| `/social-accounts` | ✓ | — | — | — | ✓ |
| `/subscription/plans` | ✓ | — | — | — | ✓ |
| `/clients` | ✓ | ✓ | — | — | ✓ |
| `/analytics` | ✓ | ✓ | — | — | ✓ |
| `/reports` | ✓ | ✓ | — | — | ✓ |
| `/invitations` | ✓ | ✓ | — | — | ✓ |
| `/requests` | — | ✓ | ✓ | ✓ | ✓ |
| `/portal` | — | ✓ | — | ✓ | ✓ |
| `/calendar` | — | ✓ | ✓ | ✓ | ✓ |
| `/library` | — | ✓ | ✓ | ✓ | ✓ |
| `/editor` | — | — | ✓ | — | ✓ |
| `/templates` | — | — | ✓ | — | ✓ |
| `/hashtag-groups` | — | — | ✓ | — | ✓ |
| `/publish` | — | — | ✓ | — | ✓ |
| `/ai-studio` (và con) | — | — | ✓ | — | ✓ |
| `/admin` | — | — | — | — | **chỉ ADMIN** |
| `/workspaces/:id/members` | ✓ | ✓ | — | — | ✓ |

> Lưu ý: `ADMIN` (SystemRole) bỏ qua mọi check, nên cột ADMIN luôn ✓.

---

## PHẦN 2 — Màu sắc & Theme

### 2.1 Đã fix (trước lỗi, giờ OK)

- `--primary: 15 88% 55%` = **brand orange** [`src/globals.css:19`](src/globals.css#L19). Trước là near-black mặc định shadcn, giờ đã đúng.
- `--sidebar`, `--sidebar-foreground`, `--sidebar-border` đã **được định nghĩa** [`globals.css:49-51`](src/globals.css#L49-L51). Trước Sidebar phải fallback hex.
- `--brand-orange`, `--brand-orange-soft` đã có.

### 2.2 Còn lỗi — badge trạng thái xanh dương (P1)

Các badge/status sau dùng **blue/indigo** thay vì brand orange / màu trung tính (xanh dương chỉ hợp khi là màu nền tảng Facebook/LinkedIn, không phải màu nhấn của sản phẩm):

| File | Dòng | Mô tả |
|---|---|---|
| `src/pages/calendar/components/ContentCalendar.tsx` | [32](src/pages/calendar/components/ContentCalendar.tsx#L32) | `bg-indigo-500/15 border-indigo-500/30 text-indigo-700` — badge category |
| `src/pages/templates/components/TemplateCard.tsx` | [17-18](src/pages/templates/components/TemplateCard.tsx#L17-L18) | `bg-blue-100 text-blue-600` — badge type |
| `src/pages/requests/components/ContentRequestTable.tsx` | [30](src/pages/requests/components/ContentRequestTable.tsx#L30), [63-64](src/pages/requests/components/ContentRequestTable.tsx#L63-L64) | badge status blue |
| `src/components/ui/badge.tsx` | [28,30](src/components/ui/badge.tsx#L28-L30) | variant default/secondary mặc định shadcn = blue |
| `src/components/ui/dialog.tsx` | [180](src/components/ui/dialog.tsx#L180) | icon "info" `text-blue-500` (thấp — info=blue chấp nhận được) |
| `src/components/ui/toast.tsx` | [31,45](src/components/ui/toast.tsx#L31-L45) | icon "info" blue (thấp) |

> **Không phải lỗi** (màu xanh dương đúng vì là màu nền tảng): `social-accounts/lib/platformMeta.tsx`, `calendar/components/ContentCalendar.tsx:19` (icon FACEBOOK), `analytics/components/ChannelPerformanceChart.tsx:9` (chart theo kênh), `editor/components/mockups/*`, `editor/components/PlatformPreviewModal.tsx`, và các mock post trong `components/landing/cinematic/*`.

### 2.3 Còn lỗi — inline hex thay token (P2)

Các file dùng `#f05a28` / `#fff0eb` trực tiếp thay vì `--brand-orange` / `--brand-orange-soft`:

- `src/components/landing/cinematic/CinematicHero.tsx`
- `src/components/landing/cinematic/MiniPosts.tsx`
- `src/components/landing/cinematic/CursorGhost.tsx`

(`src/theme/colors.ts` và `src/globals.css` dùng hex là **đúng** — nơi định nghĩa token.)

→ **Fix:** đổi inline hex sang `hsl(var(--brand-orange))` / `hsl(var(--brand-orange-soft))` hoặc class `text-brand-orange` / `bg-brand-orange-soft`.

---

## PHẦN 3 — Emoji vs lucide

Gần như đã xử lý. Emoji còn lại **chỉ** trong mock content landing (`components/landing/cinematic/*`), dùng làm nội dung giả cho post mạng xã hội — chấp nhận được:

- `CinematicHero.tsx` — text mock `🌟 ✨ 👉` trong nội dung post demo.
- `GhostComments.tsx` — ký tự `♡` cho nút like comment (giả lập UI social).

Không còn emoji trong UI chrome thật (trước có `☀️` ở TemplatesTab và `✨` ở AIGeneratePanel — đã hết).

---

## PHẦN 4 — Cấu trúc file

Cấu trúc **feature-based đã hoàn tất**: mọi page ở `src/pages/{feature}/` kèm `{feature}/components/`. Xác nhận qua import trong `AppRoutes.tsx` (VD `@/pages/analytics`, `@/pages/editor/components/mockups/...`).

Lỗi "20 sub-component nằm nhầm trong `src/components/{feature}/`" đã hết. **Không còn việc cần làm ở nhóm này.**

---

## PHẦN 5 — Primitives & raw HTML

### 5.1 Thiếu primitive (P2)

`src/components/ui/index.ts` hiện export 17: button, spinner, badge, label, input, dialog, modal, toast, use-toast, sonner, skeleton, table, dropdown-menu, sheet, select, textarea, tabs.

**Còn thiếu:** `card`, `avatar`, `tooltip`, `switch`, `checkbox`, `radio-group`, `popover`, `alert-dialog`, `separator`.

→ Cài khi cần (theo nhu cầu thật, không cài tràn lan).

### 5.2 Raw HTML thay vì primitive (P2)

11 file còn dùng raw `<select>` / `<textarea>` / `<input>` / `<button>` thay vì `ui/select`, `ui/textarea`, `ui/input`:

| File | Nguyên nhân |
|---|---|
| `src/pages/auth/LoginPage.tsx` | form input |
| `src/pages/auth/RegisterPage.tsx` | form input |
| `src/pages/workspace/components/WorkspacePermissionsPanel.tsx` | select |
| `src/pages/client/components/ClientSettingsModal.tsx` | select/input |
| `src/pages/portal/components/RejectRequestModal.tsx` | textarea |
| `src/pages/requests/components/CreateRequestModal.tsx` | textarea/input |
| `src/pages/requests/components/CancelRequestDialog.tsx` | input |
| `src/pages/requests/components/ReviseRequestModal.tsx` | textarea/input |
| `src/pages/ai-studio/video.tsx` | input |
| `src/components/landing/cinematic/CinematicHero.tsx` | (landing, mock) |
| `src/pages/editor/components/mockups/FacebookMockup.tsx` | (mockup, giả lập UI FB — không sửa) |

> `ui/select.tsx` và `ui/textarea.tsx` render raw `<select>`/`<textarea>` là **đúng** (chính primitive). `FacebookMockup` giả lập giao diện Facebook nên raw là chủ ý.

→ **Fix:** thay các file trên bằng `ui/select` + `ui/textarea` + `ui/input` (các primitive này **đã có sẵn**).

---

## PHẦN 6 — Checklist ưu tiên

### P0 — Bảo mật phân quyền (làm trước)
- [ ] Thêm `/subscription/checkout` + `/subscription/invoices` vào `ROUTE_ACCESS` (`["OWNER"]`) — đang mở cho mọi người.
- [ ] Cho `filteredMobileTabs` (Layout.tsx) dùng `canAccess()` — mobile nav đang lộ link.
- [ ] Tách prefix `/workspace` khỏi `/workspaces/*` trong `access.ts`.

### P1 — Màu sắc
- [ ] Đổi badge blue/indigo → brand orange / trung tính (ContentCalendar, TemplateCard, ContentRequestTable, ui/badge.tsx).

### P2 — Code convention
- [ ] Đổi inline hex → token brand (cinematic landing).
- [ ] Raw HTML → primitive (11 file ở §5.2).
- [ ] (Tùy chọn) Cài primitive còn thiếu khi thực sự cần.
- [ ] (Tùy chọn) Đổi `canAccess` sang default-deny + thêm test kiểm tra mọi route có rule.
