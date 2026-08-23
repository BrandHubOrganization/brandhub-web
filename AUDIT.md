# BrandHub Web Dashboard — Audit UI & Kiến Trúc & Phân Luồng Role

> Ngày audit: 2026-08-19 · Branch: `refactor/feature-based-structure`
> Phạm vi: toàn bộ `src/pages/`, `src/components/`, `src/routes/`, theme, primitives.
> Tài liệu này **chỉ liệt kê lỗi + hướng fix** — chưa sửa code. Dùng làm checklist cho đợt fix sau.

---

## Tổng quan

| Nhóm | Mức | Số lượng |
| :--- | :--- | :--- |
| **P0 — Phân luồng Role (không có rào)** | Nghiêm trọng | 1 lỗ hổng lớn + 3 điểm phụ |
| **P1 — Màu sắc & Theme** | Trung bình | ~28 chỗ |
| **P2 — Cấu trúc File / Architecture** | Trung bình | 20 component + 1 index vượt dòng |
| **P2 — Emoji làm icon** | Nhẹ | 2 chỗ |
| **P2 — Raw HTML thay primitives** | Nhẹ | ~12 chỗ |

---

## PHẦN 1 — Phân Luồng Role (ưu tiên cao nhất)

> ⚠️ **Cập nhật 2026-08-19 — FE↔BE role KHÔNG đồng bộ.** Xem 1.0.

### 1.0 FE↔BE role — desync NGHIÊM TRỌNG (nguồn sự thật = BE)

| Tầng | Enum | Giá trị | Nguồn |
| :--- | :--- | :--- | :--- |
| **BE** | `SystemRole` | `ADMIN, USER` | bảng `user_system_roles` |
| **BE** | `MemberRole` | `OWNER, CREATOR, VIEWER, CLIENT, ACCOUNT` | bảng workspace members |
| **BE** | `User.role` (String legacy) | nullable, gần chết | chỉ fallback trong `getUserProfile` |
| **FE** | `SystemRole` | `ADMIN, USER` | ✅ khớp BE |
| **FE** | `MemberRole` | `OWNER, CREATOR, VIEWER, CLIENT, ACCOUNT` | ✅ khớp BE |
| **FE** | `UserRole` | `ADMIN, AGENCY_OWNER, ACCOUNT_MANAGER, CONTENT_CREATOR, BRAND_CLIENT, GUEST` | ❌ **KHÔNG tồn tại ở BE** |

- BE `login`/`getProfile` trả `role` = `SystemRole.name()` → **chỉ "ADMIN" hoặc "USER"**. Chưa từng trả `AGENCY_OWNER`/`ACCOUNT_MANAGER`/`CONTENT_CREATOR`/`BRAND_CLIENT` (grep toàn repo Java = 0 hit).
- `UserRole` FE là **bóng ma**: 5 giá trị business tự bịa, đổi tên MemberRole (`AGENCY_OWNER`≈`OWNER`, `ACCOUNT_MANAGER`≈`ACCOUNT`, `CONTENT_CREATOR`≈`CREATOR`, `BRAND_CLIENT`≈`CLIENT`).
- Code chết: `pages/client/index.tsx:25` check `user.role === "AGENCY_OWNER"` → **luôn false**. `hooks/useContentRequests.ts:17` default `ACCOUNT_MANAGER` → sai.
- **Chốt:** bỏ `UserRole`, dùng `SystemRole` (ADMIN/USER) + `MemberRole` (workspace) — đúng BE, đúng mô hình `@RequireRole` hiện tại.

### 1.1 Hiện trạng gating (file:line)

- `src/routes/AppRoutes.tsx:48-76` — 20 route protected, wrap `<AuthGuard>` + `<Layout>`. **Không route nào mang `roles`. ZERO route-guard.**
- `src/components/layout/AuthGuard.tsx:8-10` — chỉ check `isAuthenticated`:
  ```tsx
  if (!isAuthenticated) return <Navigate to="/login" ... />;
  return <Outlet />;
  ```
- `src/components/layout/Sidebar.tsx:101-154` + `Layout.tsx:122-133` — nav gating dựa `MemberRole` + `systemRole` (SystemRole). ✅ Đúng nguồn, chỉ thiếu chặn route.

### 1.2 Lỗ hổng NGHIÊM TRỌNG — URL bypass

Ai login cũng gõ thẳng URL `/admin`, `/workspace`, `/editor`, `/analytics` → render bình thường. Nav chỉ **ẩn**, không **chặn**. BE có `@RequireRole(MemberRole…)` chặn API, nhưng FE chưa chặn route → user vẫn thấy UI (data sẽ 403).

### 1.3 Hai nguồn role đúng — nhưng FE thêm 1 bóng ma

- `SystemRole` (ADMIN/USER): quyền toàn hệ thống — `/admin`.
- `MemberRole` (OWNER/CREATOR/VIEWER/CLIENT/ACCOUNT): quyền trong workspace — content/members/clients.
- `UserRole` FE: bóng ma, xóa đi (xem 1.0).

### 1.4 Dead nav

- `Sidebar.tsx:148` trỏ `/analytics/overview` — không tồn tại → link chết.
- `Layout.tsx:27` mobile tab `/` label "Dashboard" → trỏ landing public (ngoài AuthGuard), mất layout. Sửa → `/dashboard`.

### 1.5 Bảng Role → Page (route-guard cài tới đâu)

`SystemRole.ADMIN` = full quyền (mọi page + `/admin`). Bảng dưới cho **MemberRole** (ADMIN bỏ qua):

| Page | OWNER | ACCOUNT | CREATOR | VIEWER | CLIENT |
| :--- | :---: | :---: | :---: | :---: | :---: |
| /dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| /change-password | ✅ | ✅ | ✅ | ✅ | ✅ |
| /requests | ✅ | ✅ | ✅ | — | ✅ |
| /portal | ✅ | ✅ | — | — | ✅ |
| /library | ✅ | ✅ | ✅ | ✅ | ✅ |
| /editor | — | — | ✅ | — | — |
| /templates | ✅ | ✅ | ✅ | ✅ | — |
| /hashtag-groups | ✅ | ✅ | ✅ | ✅ | — |
| /calendar | ✅ | ✅ | ✅ | ✅ | ✅(đọc) |
| /analytics | ✅ | ✅ | — | — | — |
| /clients | ✅ | ✅ | — | — | — |
| /workspace(+members/settings) | ✅ | — | — | — | — |
| /invitations | ✅ | ✅ | — | — | — |
| /admin | — | — | — | — | — |

Ghi chú:
- `OWNER` quản doanh nghiệp, không trực tiếp sản xuất → ẩn `/editor` (giữ rule Sidebar hiện tại `:111-116`).
- `CREATOR` chỉ sản xuất → không thấy clients/analytics/portal/workspace/admin.
- `CLIENT` (brand client) → portal + requests + library (+dashboard/password), khớp quyết định user.
- `VIEWER` team nội bộ xem → không tạo (no editor) nhưng xem templates/hashtag/calendar/library.

### 1.6 Hướng fix (P0)

1. **Xóa `UserRole`** trong `src/types/user.ts` + mọi check `AGENCY_OWNER`/`ACCOUNT_MANAGER`/`CONTENT_CREATOR`/`BRAND_CLIENT` (`client/index.tsx:25`, `useContentRequests.ts:17`). Đổi `User["role"]` sang `SystemRole`.
2. **Route-level guard** — 1 map nguồn sự thật `ROUTE_ACCESS: Record<path, MemberRole[] | "ADMIN">` trong file `src/routes/access.ts`. `AuthGuard` nhận `memberRoles?: MemberRole[]` (+ tự xử `systemRole` cho `/admin`), redirect `/dashboard` nếu thiếu quyền:
   ```tsx
   // src/components/layout/AuthGuard.tsx
   export function AuthGuard({ memberRoles }: { memberRoles?: MemberRole[] }) {
     const { isAuthenticated, systemRole } = useAuthStore();
     if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
     // admin: systemRole === "ADMIN"; còn lại: memberRole ∈ memberRoles (đọc từ layout/store)
     return <Outlet />;
   }
   ```
3. **Sidebar/Layout đọc chung `ROUTE_ACCESS`** — không tự hardcode filter như `:101-154` / `:122-133`.
4. **Sửa 2 bug nav** — `/analytics/overview` → `/analytics`; mobile tab `/` → `/dashboard`.
5. **`useContentRequests.ts`** bỏ default `ACCOUNT_MANAGER`, đọc `memberRole` thực.

---

## PHẦN 2 — Màu Sắc & Theme

### 2.1 `--primary` không phải brand orange (P1)

`src/globals.css:19` light `--primary: 240 5.9% 3.9%` (near-black), `:68` dark `--primary: 210 40% 98%` (near-white). Brand orange chỉ nằm ở `--brand-orange` (`:49`) và `--ring` (`:45`).

→ Hệ quả: mọi `text-primary` / `bg-primary` / `bg-primary-foreground` render near-black/near-white, **không phải màu thương hiệu**.

**Fix:** nếu `--primary` được dùng cho CTA/nhấn chính → gắn `--primary: 15 88% 55%` (brand orange) + `--primary-foreground: 0 0% 100%`. Nếu `--primary` chủ ý là màu chữ/nền → giữ nguyên nhưng **ngừng dùng `text-primary` cho CTA**, chuyển sang `bg-brand-orange text-white`.

### 2.2 Thiếu token `--sidebar*` (P1)

`src/components/layout/Sidebar.tsx:164-175` dùng `var(--sidebar, #09090b)`, `var(--sidebar-foreground, #fafafa)`, `var(--sidebar-border, #27272a)` — nhưng **`globals.css` không định nghĩa 3 token này**, chỉ có fallback hex. Theme dark sẽ không đồng bộ.

**Fix:** thêm vào `:root` + `.dark` trong `globals.css`:
```css
--sidebar: 240 6% 4%;            /* #09090b */
--sidebar-foreground: 0 0% 98%;  /* #fafafa */
--sidebar-border: 240 5% 15%;    /* #27272a */
```

### 2.3 Accent indigo/blue không phải brand (P1) — đổi sang `bg-brand-orange` / `text-brand-orange`

> Trừ các màu **semantic/channel** (Facebook=blue, info=blue, blog=indigo #6366f1 trong `theme/colors.ts`) — những chỗ đó giữ nguyên.

Cần đổi (accent không brand):

| File | Dòng | Hiện tại | Fix |
| :--- | :---: | :--- | :--- |
| `components/dashboard/KpiCardsSection.tsx` | 71-72 | `bg-blue-500/10 text-blue-500`, `border-l-blue-500` | `bg-brand-orange/10 text-brand-orange`, `border-l-brand-orange` |
| `components/dashboard/ActivityFeedSection.tsx` | 33 | `text-blue-500` (CheckCircle) | `text-brand-orange` |
| `pages/templates/components/TemplateGridView.tsx` | 40, 49 | `text-indigo-500`, `bg-indigo-50 text-indigo-600` | `text-brand-orange`, `bg-brand-orange-soft text-brand-orange` |
| `pages/client/components/ClientAnalyticsCards.tsx` | 13 | `text-blue-500` | `text-brand-orange` |
| `pages/client/components/ClientTable.tsx` | 142 | `border-blue-500/20 bg-blue-500/10 text-blue-600` | `border-brand-orange/20 bg-brand-orange/10 text-brand-orange` |
| `components/request/ContentRequestTable.tsx` | 93, 157 | `group-hover:text-indigo-600`, `bg-indigo-50 ... text-indigo-600` | `group-hover:text-brand-orange`, `bg-brand-orange-soft ... text-brand-orange` |
| `components/request/ContentRequestFilterBar.tsx` | 35, 121, 193 | `bg-blue-50 text-blue-700`, `focus:ring-indigo-500/20`, `border-indigo-600 bg-indigo-600` | `bg-brand-orange-soft text-brand-orange`, `focus:ring-brand-orange/20`, `border-brand-orange bg-brand-orange` |
| `components/request/AssigneePickerModal.tsx` | 58, 83, 97, 118 | `text-indigo-600`, `focus:ring-indigo-500/20`, `bg-indigo-50`, `bg-indigo-600` | `text-brand-orange`, `focus:ring-brand-orange/20`, `bg-brand-orange-soft`, `bg-brand-orange` |
| `components/hashtag/HashtagGroupFormModal.tsx` | 91, 125, 138 | `text-indigo-500`, `focus:ring-indigo-500/20`, `bg-indigo-600 hover:bg-indigo-700` | `text-brand-orange`, `focus:ring-brand-orange/20`, `bg-brand-orange hover:bg-brand-orange/90` |
| `components/editor/MediaDropzone.tsx` | 93, 94, 101, 108, 115, 119 | `border-indigo-500 bg-indigo-50/50`, `hover:border-indigo-400`, `text-indigo-600`, `bg-indigo-600`, `bg-indigo-50 text-indigo-600` | đổi indigo → brand-orange tương ứng |
| `components/editor/ImageLightboxModal.tsx` | 28 | `text-indigo-400` | `text-brand-orange` |
| `components/examples.tsx` | 359 | `border-blue-500/30 text-blue-600` | `border-brand-orange/30 text-brand-orange` |

Giữ nguyên (semantic/channel): `ui/toast.tsx:27,41` (info), `ui/badge.tsx:25-26` (approved), `ui/dialog.tsx:173` (info), `TemplateCard.tsx:12`, `ContentRequestTable.tsx:24,33` (ASSIGNED/FB), `ContentCalendar.tsx:17,30`, `PlatformFilter.tsx:11`, `PlatformPreviewModal.tsx:16`, `PlatformMockups.tsx:45-47` (FB), toàn bộ `landing/cinematic/**` (mock social brand).

### 2.4 Inline hex thay token brand (P1) — đổi sang `text-brand-orange` / `bg-brand-orange-soft`

`--brand-orange` (#f05a28) và `--brand-orange-soft` (#fff0eb) đã có sẵn.

| File | Dòng | Hiện tại | Fix |
| :--- | :---: | :--- | :--- |
| `pages/calendar/index.tsx` | 31 | `bg-[#f05a28] hover:bg-[#d94e20]` | `bg-brand-orange hover:bg-brand-orange/90` |
| `pages/client/components/ClientAnalyticsCards.tsx` | 34 | `text-[#f05a28]` | `text-brand-orange` |
| `pages/client/components/ClientBanner.tsx` | 19, 32, 47 | `bg-[#fff0eb] text-[#f05a28]` | `bg-brand-orange-soft text-brand-orange` |
| `pages/client/components/ClientContentRequests.tsx` | 12 | `text-[#f05a28]` | `text-brand-orange` |
| `pages/client/components/ClientSocialAccounts.tsx` | 12, 24 | `text-[#f05a28]`, `bg-[#f05a28]/10` | `text-brand-orange`, `bg-brand-orange/10` |
| `pages/client/components/ClientTable.tsx` | 89, 94 | `bg-[#fff0eb] text-[#f05a28]`, `group-hover:text-[#f05a28]` | `bg-brand-orange-soft text-brand-orange`, `group-hover:text-brand-orange` |

> Lưu ý: `text-brand-orange` là utility sinh từ token `--brand-orange` (Tailwind v4 CSS-first); nếu chưa có, khai báo trong `globals.css` qua `@theme`.

---

## PHẦN 3 — Emoji làm UI icon (P2)

Rule: không dùng emoji làm icon/button/status — dùng `lucide-react`.

| File | Dòng | Hiện tại | Fix |
| :--- | :---: | :--- | :--- |
| `components/editor/AIGeneratePanel.tsx` | 209 | `<span>Generate with AI ✨</span>` | `<Sparkles className="size-4" />` từ lucide |
| `components/library/TemplatesTab.tsx` | 208 | `placeholder="…Mùa Hè ☀️"` | bỏ emoji khỏi placeholder |

Giữ nguyên (mock content, không phải UI chrome): `landing/cinematic/CinematicHero.tsx:2259` (✨ trong nội dung giả lập).

---

## PHẦN 4 — Cấu trúc File / Architecture (P2)

### 4.1 20 component feature-specific đặt nhầm chỗ (P2)

Các sub-component của một page đang nằm ở `src/components/{feature}/` thay vì `src/pages/{feature}/components/`. Investigator xác nhận **100% chỉ dùng đúng 1 page** — không cái nào shared thật. Vi phạm Orchestrator Pattern (STRUCTURE.md §3).

| Folder hiện tại | Files | Page đích (`src/pages/…`) |
| :--- | :--- | :--- |
| `components/calendar/` | ContentCalendar, PlatformFilter, SchedulePostModal | `calendar/components/` |
| `components/dashboard/` | ActivityFeedSection, KpiCardsSection, TeamStatsSection | `dashboard/components/` |
| `components/editor/` | RichTextEditor, MediaDropzone, HashtagInputWithSuggestions, AIGeneratePanel, TemplatePickerModal, ImageLightboxModal | `editor/components/` |
| `components/hashtag/` | HashtagGroupFormModal | `hashtag-groups/components/` |
| `components/preview/` | PlatformPreviewModal, PlatformMockups | `editor/components/` |
| `components/request/` | ContentRequestFilterBar, ContentRequestTable, AssigneePickerModal | `requests/components/` |
| `components/template/` | TemplateCard, TemplatePreviewModal | `templates/components/` |

**Fix:** `git mv` từng file vào page `components/`, cập nhật import trong page `index.tsx` + component cha (giữ nguyên tên export). Sau đó xóa folder `components/{feature}/` rỗng.

> Trừ: `PlatformPreviewModal` thực tế được `SchedulePostModal` (calendar) + `editor` dùng → nếu đúng shared 2 page thì giữ ở `components/`. Đã kiểm tra: hiện chỉ editor dùng; nếu calendar dùng lại thì đổi classification.

### 4.2 Orchestrator vượt giới hạn (P2)

- `pages/client/index.tsx` = **167 dòng** (>150 rule STRUCTURE.md §3). Tách handler + phần search/pagination thành sub-component trong `client/components/` (hoặc đẩy logic xuống hook).

Các index còn lại đều <150 (workspace 42, client 167, admin 36, portal 74, analytics 69, library 67, change-password 77). Detail >100: `ClientTable.tsx` 206, `CreateEditClientModal.tsx` 183, `ServicePackageModal.tsx` 166 — nên tách nhỏ nếu đủ phức tạp.

### 4.3 Thiếu shadcn primitives (P2)

`src/components/ui/index.ts` chỉ re-export 14: button, spinner, badge, label, input, dialog, modal, toast, use-toast, sonner, skeleton, table, dropdown-menu, sheet.

**Thiếu:** `select`, `textarea`, `card`, `tabs`, `avatar`, `tooltip`, `switch`, `checkbox`, `radio-group`, `popover`, `alert-dialog`, `separator`.

→ Đây là nguyên nhân trực tiếp của raw-HTML ở PHẦN 5. **Fix:** `npx shadcn@latest add select textarea card tabs avatar tooltip switch checkbox radio-group popover alert-dialog separator` rồi thay thế dần.

---

## PHẦN 5 — Raw HTML thay primitives (P2)

Vi phạm rule "không viết lại `<button>/<input>/<select>/<textarea>` thô — dùng `ui/*`".

| File | Dòng | Vấn đề | Fix |
| :--- | :---: | :--- | :--- |
| `pages/library/index.tsx` | 21, 33, 45 | raw `<button>` làm tab bar | `ui/tabs` hoặc tạo `LibraryTab` |
| `pages/editor/index.tsx` | 57, 62 | raw `<input>` (title) | `ui/input` |
| `pages/auth/VerifyOtpPage.tsx` | 120 | raw `<input>` (OTP) | `ui/input` |
| `pages/client/components/CreateEditClientModal.tsx` | 141, 154 | raw `<select>` | `ui/select` |
| `pages/workspace/components/InviteMemberDialog.tsx` | 56 | raw `<select>` | `ui/select` |
| `pages/workspace/components/LogoUploader.tsx` | 30 | raw `<input type="file">` | `ui/input` + hidden file |
| `components/calendar/SchedulePostModal.tsx` | 72, 94, 106, 122 | raw `<input>/<select>/<textarea>` | `ui/*` |
| `components/library/MediaTab.tsx` | 91, 141 | raw `<input>` | `ui/input` |
| `components/library/MediaUploadButton.tsx` | 45 | raw `<input>` | `ui/input` |
| `components/editor/HashtagInputWithSuggestions.tsx` | 167 | raw `<input>` | `ui/input` |
| `components/editor/TemplatePickerModal.tsx` | 79 | raw `<input>` | `ui/input` |
| `components/library/HashtagGroupsTab.tsx` | 217, 230 | raw `<input>` | `ui/input` |
| `components/library/TemplatesTab.tsx` | 204, 217, 230 | raw `<input>/<textarea>` | `ui/input` / `ui/textarea` |

---

## PHẦN 6 — Checklist ưu tiên

**P0 (làm trước — bảo mật phân quyền):**
- [x] Xóa `UserRole` bóng ma + mọi check `AGENCY_OWNER`/… (1.0).
- [x] Tạo `ROUTE_ACCESS` map (MemberRole + SystemRole) + AuthGuard check role (1.6).
- [x] Gắn roles vào route — AuthGuard tự resolve `ROUTE_ACCESS` theo pathname (không cần sửa AppRoutes từng route).
- [x] Sidebar/Layout đọc chung `ROUTE_ACCESS`, không hardcode filter.
- [x] Sửa 2 bug nav: bỏ dead `/analytics/overview`; mobile tab `/` → `/dashboard`.

✅ Hoàn thành 2026-08-19 — `npx tsc --noEmit` 0 lỗi. FE giờ dùng đúng `SystemRole` (ADMIN/USER) + `MemberRole` (OWNER/CREATOR/VIEWER/CLIENT/ACCOUNT), khớp BE.

**P1 (màu & theme):**
- [x] Gắn `--primary` = brand orange (hoặc ngừng dùng text-primary cho CTA).
- [x] Thêm `--sidebar*` tokens.
- [x] Đổi ~15 chỗ indigo/blue accent → brand-orange (2.3).
- [x] Đổi ~11 chỗ inline hex → token (2.4).

✅ Hoàn thành 2026-08-19 — `--primary` = brand orange (light+dark), thêm `--sidebar*`, đổi 27 chỗ indigo/blue + 12 chỗ inline hex → brand token. Default `<Button>` giờ render cam thương hiệu.

**P2 (cleanup):**
- [x] Chuyển 25 component feature-specific vô page (4.1).
- [x] Tách `client/index.tsx` 167 dòng (4.2).
- [x] Thêm shadcn primitives (4.3).
- [x] Thay raw HTML (PHẦN 5).
- [x] Đổi 2 emoji UI → lucide (PHẦN 3).

✅ Hoàn thành 2026-08-19 — `git mv` 25 component vô `pages/{feature}/components/`, tách `client/index.tsx` → `ClientModals.tsx`, thêm 3 primitives (`select`, `textarea`, `tabs`), thay raw HTML bằng `ui/*` ở 13 file, đổi 2 emoji → lucide. `npx tsc --noEmit` 0 lỗi, `npm run build` xanh. Commit `dd24527`.

---

## PHẦN 7 — Sync Trung ↔ Phước (kiểm tra đồng bộ)

> Câu hỏi: code của **Trung** và **Phước** đã đồng bộ nhau chưa (UI, style, cỡ chữ,
> cấu trúc, triển khai)?
> **Kết luận: CHƯA đồng bộ.** Không phải ai đúng ai sai — cả 2 mắc **cùng một bộ lỗi**;
> điểm lệch thật sự nằm ở **cấu trúc file** và **style nhỏ** (quote, icon size).

### 7.1 Cấu trúc — lệch lớn nhất (P0)

- **Trung** đã refactor page vào `src/pages/{feature}/` (đúng STRUCTURE.md).
- **Phước** vẫn để 25 component feature-specific trong `src/components/{feature}/`:

  | Folder | Files | Page đích |
  | :--- | :--- | :--- |
  | `components/calendar/` | 3 | `pages/calendar/components/` |
  | `components/dashboard/` | 3 | `pages/dashboard/components/` |
  | `components/editor/` | 6 | `pages/editor/components/` |
  | `components/hashtag/` | 1 | `pages/hashtag-groups/components/` |
  | `components/library/` | 5 | `pages/library/components/` |
  | `components/preview/` | 2 | `pages/editor/components/` |
  | `components/request/` | 3 | `pages/requests/components/` |
  | `components/template/` | 2 | `pages/templates/components/` |

- ⚠️ **Chỉnh lại PHẦN 4.1:** số đúng là **25** (PHẦN 4.1 cũ ghi 20, thiếu `components/library/` 5 file).
- Fix: `git mv` 25 file vào `pages/{feature}/components/`, cập nhật import, giữ nguyên tên export.

### 7.2 Màu sắc — 3 hệ trộn lẫn (P1)

Cả 2 tác giả dùng lẫn 3 hệ màu, không chốt 1 hệ:

| Hệ | Ai dùng |
| :--- | :--- |
| Semantic token (`bg-card`, `text-muted-foreground`) | cả 2 (đúng) |
| Raw `zinc-*` / `bg-white` / `bg-zinc-900` | Phước 16 file, Trung 9 file |
| Inline hex `#f05a28` | 29 file (components 13 + pages 16) |

Fix: chốt semantic + `brand-orange` theo rule.md §1, bỏ raw zinc + inline hex.

### 7.3 Cỡ chữ (Typography) — thang bị phá (P1)

- Font Inter đồng bộ (globals.css). Page title chuẩn `text-3xl` qua `PageWrapper` (Trung) → **title đồng bộ tốt**.
- **Nhưng 284 chỗ `text-[Npx]` tùy ý ngoài thang** `text-xs..3xl`:
  `10px×116 · 9px×69 · 11px×63 · 8px×34 · 7px×1 · 12px×1` — cả 2 tác giả đều vi phạm.
- Icon size lệch: Trung `size-4`, Phước `w-4 h-4` (`RichTextEditor.tsx`).

Fix: thêm `--text-2xs`/`--text-3xs` vào `@theme`, cấm `text-[Npx]`; chuẩn icon `size-*`.

### 7.4 Phong cách thiết kế — không lock thang (P1)

- Card radius trộn `rounded-md`/`lg`/`xl`/`2xl` — chốt `rounded-xl`.
- Shadow trộn `shadow-xs`/`sm`/`md`.
- Visual language lệch giữa page: `editor` dùng `zinc-*` + `rounded-2xl` + `bg-white`
  (Trung index + Phước component), trong khi `dashboard` dùng semantic + `rounded-xl`.

### 7.5 Triển khai — cùng lỗi, chưa thống nhất (P2)

- **i18n:** CẢ 2 hardcode tiếng Việt (`"Làm mới"`, `"Tổng số bài đăng"`) thay vì `t()`. Vi phạm §2.
- **Raw HTML:** Phước `<button>` toolbar (`RichTextEditor.tsx`), Trung `<input>` title
  (`editor/index.tsx:57`). Cả 2 vi phạm §4.
- **Quote:** Phước nháy đơn `'react'`, Trung nháy kép `"react"` → prettier chưa chạy trên
  file Phước. Chốt nháy kép (prettier default).
- **Service/types:** cả 2 central trong `src/services/` + `src/types/` — **điểm đồng bộ tốt**.
  Lưu ý Phước dùng `mock*Service`, Trung dùng real (`workspaceService`) → thống nhất khi backend ready.

### 7.6 Hành động (thứ tự)

1. **P0 — migrate 25 component** vào `pages/{feature}/components/` (7.1) → khớp cấu trúc Trung.
2. **P1 — màu + type:** bỏ raw zinc/hex, chốt semantic + `brand-orange`, bỏ `text-[Npx]`.
3. **P2 — style:** chạy prettier toàn repo (fix quote), chuẩn icon `size-*`, i18n `t()`, ui primitives.

✅ **Hoàn thành toàn bộ 2026-08-20:**
- 7.1 (25 component) — đã làm ở P2 đợt trước, commit `dd24527`.
- 7.2 raw zinc → semantic token (`bg-card`/`bg-muted`/`text-foreground`/`text-muted-foreground`/`border-border`), 18 file — commit `05f0937`.
- Prettier toàn repo (quote nháy đơn → kép, tailwind class sort) — commit `ffb4ee5`.
- 7.4 radius: card/modal container chốt `rounded-xl` (nâng `rounded-lg`, hạ `rounded-2xl`); shadow base chốt `shadow-xs` (giữ `hover:shadow-md` nguyên vẹn); `h-N w-N` bằng nhau → `size-N` (148 chỗ, 27 file); thêm `--text-2xs`(11px)/`--text-3xs`(9px), thay 284 chỗ `text-[Npx]` (trừ `landing/*` — giữ aesthetic marketing riêng) — commit `f0eac6d`.
- 7.5 i18n: 7 namespace mới (`editor`/`library`/`templates`/`requests`/`hashtagGroups`/`client`/`dashboard`) trong vi.json + en.json key-parallel, 39 chỗ hardcode → `t()`, 22 component — commit `e424602`.
- `npx tsc -p tsconfig.app.json --noEmit` 0 lỗi + `npm run build` xanh sau mỗi đợt.
- Badge/button nhỏ (`rounded-md`, `px-2 py-0.5`) và radius/màu `landing/*` **cố tình giữ nguyên** — ngoài phạm vi (tỷ lệ kích thước đúng / aesthetic marketing riêng).

---

## Verification (khi fix)

- `npx tsc --noEmit` → 0 lỗi sau mỗi đợt.
- `npm run build` → xanh.
- Test thủ công: login từng MemberRole (OWNER / ACCOUNT / CREATOR / VIEWER / CLIENT) + SystemRole ADMIN, gõ trực tiếp URL `/admin`, `/editor`, `/workspace`, `/analytics` → phải redirect, không render.
- Check nav sidebar/mobile khớp bảng 1.5.
