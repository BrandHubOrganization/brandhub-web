# BrandHub UI and UX work

Read `CLAUDE.md`, `rule.md`, and `STRUCTURE.md` before changing this frontend. Follow the feature workflow in `../brandhub-infrastructure/docs/rule/feature-workflow.md`.

- Preserve the system's existing design. Reuse `src/globals.css`, `src/theme/colors.ts`, and shared `src/components/ui` components for colors, typography, spacing and controls.
- Treat skill design suggestions as subordinate to BrandHub's established design and the user's requirements. Improve task completion, clarity and feedback without replacing the visual identity or generating a new palette.
- Minimize modals. In Media Campaign and Media Package, show long forms, detail views and review workflows in the page's full available width with a visible return action. Reserve dialogs for short confirmations such as discarding unsaved changes. Do not expand the current work into Task screens without a new user instruction.
- Use the installed UI/UX and React skills where relevant: use `ui-ux-pro-max` for UI design / styling, and `/impeccable` to audit, review and polish interface quality. Use React guidance applicable to this Vite SPA; Next.js-specific examples do not justify framework or data-library migrations.
- Reuse existing route access checks. Explain prerequisites and provide permitted recovery actions; avoid controls that imply unsupported behavior.
- Keep Vietnamese/English translation keys parallel under `src/i18n/locales/{vi,en}/`. Verify light/dark mode, keyboard operation and responsive behavior for changed interfaces.
- User policy: do not create or commit test files under `src`; do not force-add ignored test files. Keep local verification artifacts out of commits.
- Run `npm run ci` (lint, type-check, and production build) and resolve all errors before committing or pushing.

---

# 20 Nguyên Tắc Vàng Thiết Kế UI Animation (20 Beautiful UI Animation Rules)

Áp dụng cho toàn bộ micro-interactions, chuyển cảnh, feedback trạng thái và motion trên frontend (`brandhub-web`):

1. **Ease-out for entrances:** Hiệu ứng xuất hiện luôn dùng `ease-out` (vào nhanh, phanh chậm tạo cảm giác phản hồi tức thì).
2. **Dropdowns at 150–250ms:** Menu thả xuống/dropdown giữ thời lượng trong khoảng 150ms – 250ms (không quá chậm gây sốt ruột, không quá nhanh gây giật mắt).
3. **Stagger list rows by 30ms:** Khi danh sách xuất hiện, tạo độ trễ gối đầu giữa các hàng là 30ms (`delay: index * 0.03s`).
4. **Scale to 0.97 on press:** Phản hồi khi click/press nút hoặc thẻ co lại nhẹ ở mức `scale(0.97)` (active state tactile feedback).
5. **Stretch moving knobs 12%:** Nút trượt/toggle switch khi kéo di chuyển giãn nhẹ 12% theo hướng chuyển động (squash & stretch vật lý).
6. **Stagger as details settle:** Các chi tiết phụ (metadata, icon, subtext) xuất hiện trễ nhịp nhẹ sau khi khung chính đã định hình.
7. **Arcs for object movement:** Chuyển động của đối tượng trên màn hình theo quỹ đạo đường cong (arc), không đi theo đường thẳng cứng nhắc.
8. **Pulse to confirm success:** Xác nhận thao tác thành công (copy, save, checkmark) bằng hiệu ứng nhịp đập nhẹ (`pulse`).
9. **Ease-in-out for moves:** Đối tượng di chuyển từ vị trí A sang B trên màn hình (đã nhìn thấy sẵn) dùng `ease-in-out`.
10. **Start popovers at 0.95:** Popover/Tooltip/Modal khi bắt đầu xuất hiện phóng từ `scale(0.95)` lên `1.0` (kèm opacity 0 -> 1).
11. **Enter from the trigger:** Phần tử xuất hiện bung ra từ chính vị trí nút bấm kích hoạt nó (trigger origin anchor).
12. **Exit to the trigger:** Khi đóng, phần tử thu nhỏ và biến mất quay ngược về vị trí nút kích hoạt.
13. **No bounce on everyday UI:** Tuyệt đối không dùng hiệu ứng nảy (bounce/spring quá đà) cho các UI thông thường hàng ngày (bảng, form, menu).
14. **Don't tween while held:** Khi người dùng đang giữ chuột (hold/drag), không chạy animation nội suy (tween) làm chậm độ bám tay.
15. **Make exits 20% shorter:** Hiệu ứng biến mất (exit) luôn nhanh hơn hiệu ứng xuất hiện (entrance) khoảng 20% (người dùng muốn đóng nhanh).
16. **Overlap old & new states:** Chuyển đổi trạng thái (cross-transition) gối đầu đè lên nhau, không để khoảng trống màn hình chờ.
17. **Masks for reveals & colour:** Dùng mặt nạ (`clip-path` hoặc `overflow: hidden`) để hé lộ nội dung hoặc đổi màu mượt mà.
18. **Crossfade icons + blur:** Chuyển đổi icon (ví dụ: Sun ↔ Moon, Play ↔ Pause) kết hợp mờ nhẹ (`blur`) và `crossfade`.
19. **Rubber band past bounds:** Khi cuộn hoặc kéo vượt quá giới hạn khung, tạo lực cản đàn hồi (rubber-band resistance).
20. **Reuse the same layoutId:** Tận dụng shared layout animation (`layoutId` trong Framer Motion hoặc View Transitions API) để các phần tử biến hình mượt mà thay vì giật cục.
