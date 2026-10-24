import type { ComponentType, SVGProps } from "react";
import type { ChatReaction } from "@/types/chatCollaboration";

export type TwemojiIconProps = SVGProps<SVGSVGElement>;
export type TwemojiIconComponent = ComponentType<TwemojiIconProps>;

/** 1. check (✅ Hoàn thành) - Twemoji 2705 */
export function TwemojiCheckIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#77B255"
        d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28z"
      />
      <path
        fill="#FFFFFF"
        d="M29.28 6.362a2.502 2.502 0 0 0-3.458.736L14.936 23.877l-5.029-4.65a2.5 2.5 0 1 0-3.394 3.671l7.209 6.666c.48.445 1.09.665 1.696.665.673 0 1.534-.282 2.099-1.139.332-.506 12.5-19.27 12.5-19.27a2.5 2.5 0 0 0-.737-3.458z"
      />
    </svg>
  );
}

/** 2. eyes (👀 Đang xem) - Twemoji 1f440 */
export function TwemojiEyesIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <ellipse fill="#292F33" cx="9.25" cy="18" rx="8.25" ry="13.5" />
      <ellipse fill="#F5F8FA" cx="9.25" cy="18" rx="6.75" ry="11.75" />
      <ellipse fill="#292F33" cx="6.75" cy="19" rx="3.75" ry="5.5" />
      <circle fill="#FFFFFF" cx="8.25" cy="16.5" r="1.5" />
      <ellipse fill="#292F33" cx="26.75" cy="18" rx="8.25" ry="13.5" />
      <ellipse fill="#F5F8FA" cx="26.75" cy="18" rx="6.75" ry="11.75" />
      <ellipse fill="#292F33" cx="24.25" cy="19" rx="3.75" ry="5.5" />
      <circle fill="#FFFFFF" cx="25.75" cy="16.5" r="1.5" />
    </svg>
  );
}

/** 3. like (👍 Đồng ý) - Twemoji 1f44d */
export function TwemojiLikeIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#EF9645"
        d="M8 15H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h4V15H8z"
      />
      <path
        fill="#FFDC5D"
        d="M19.5 3.5c-1.8 0-3 1.4-3 3.5 0 2.6-1.5 5.6-3.8 7.5-.7.6-1.7.5-1.7.5H9v17h14.5c2.2 0 4-1.5 4.4-3.6l1.8-9.5c.5-2.6-1.5-5.4-4.2-5.4H20c.8-2.3 1.8-5.1 1.8-7 0-1.8-.9-3-2.3-3z"
      />
      <path
        fill="#EF9645"
        d="M29.2 18.5H22a.9.9 0 1 1 0-1.8h7.4c.1.6 0 1.2-.2 1.8zm-.7 4.2H22a.9.9 0 1 1 0-1.8h6.8l-.3 1.8zm-.8 4.2H22a.9.9 0 1 1 0-1.8h6l-.3 1.8z"
      />
    </svg>
  );
}

/** 4. hands (🙌 Tuyệt vời) - Twemoji 1f64c */
export function TwemojiHandsIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#55ACEE"
        d="M18 2a1.2 1.2 0 0 1 1.2 1.2v3.6a1.2 1.2 0 1 1-2.4 0V3.2A1.2 1.2 0 0 1 18 2z"
      />
      <path
        fill="#EF9645"
        d="M11.2 3.8a1.2 1.2 0 0 1 1.6.5l1.6 3.1a1.2 1.2 0 1 1-2.1 1.1L10.7 5.4a1.2 1.2 0 0 1 .5-1.6zm13.6 0a1.2 1.2 0 0 1 .5 1.6l-1.6 3.1a1.2 1.2 0 1 1-2.1-1.1l1.6-3.1a1.2 1.2 0 0 1 1.6-.5z"
      />
      <path
        fill="#FFDC5D"
        d="M6.5 11a1.5 1.5 0 0 1 1.5 1.5V19h.5V9.5a1.5 1.5 0 0 1 3 0V19h.5v-8.5a1.5 1.5 0 0 1 3 0V21l1.2-2.2a1.5 1.5 0 0 1 2.6 1.5l-2.6 6.7A7 7 0 0 1 10.2 32H8a5 5 0 0 1-5-5V14.5a1.5 1.5 0 0 1 3 0V19h.5v-6.5A1.5 1.5 0 0 1 6.5 11z"
      />
      <path
        fill="#EF9645"
        d="M8 19h7v1.5H8V19zm3.5 4.5c0 2.5 1.5 4 3.5 4.5v1.5c-2.8-.6-5-2.6-5-6h1.5z"
      />
      <path
        fill="#FFDC5D"
        d="M29.5 11a1.5 1.5 0 0 0-1.5 1.5V19h-.5V9.5a1.5 1.5 0 0 0-3 0V19h-.5v-8.5a1.5 1.5 0 0 0-3 0V21l-1.2-2.2a1.5 1.5 0 0 0-2.6 1.5l2.6 6.7A7 7 0 0 0 25.8 32H28a5 5 0 0 0 5-5V14.5a1.5 1.5 0 0 0-3 0V19h-.5v-6.5A1.5 1.5 0 0 0 29.5 11z"
      />
      <path
        fill="#EF9645"
        d="M21 19h7v1.5h-7V19zm3.5 4.5c0 2.5-1.5 4-3.5 4.5v1.5c2.8-.6 5-2.6 5-6h-1.5z"
      />
    </svg>
  );
}

/** 5. fire (🔥 Quá đỉnh) - Twemoji 1f525 */
export function TwemojiFireIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#F4900C"
        d="M31.5 21.5c0 7.7-6 13.5-13.5 13.5S4.5 29.2 4.5 21.5c0-5.4 3.2-9.5 5.8-12.1.6-.6 1.6-.1 1.5.7-.2 1.8.4 3.6 1.6 4.6-.3-4.6 2.1-9.9 6.6-13.4.7-.5 1.7.1 1.5.9-.6 3.2.5 6.4 2.8 8.3.5-1.4.8-2.8.8-4.1 0-.8 1-1.2 1.5-.6 3 3.2 4.9 8.1 4.9 15.7z"
      />
      <path
        fill="#FFCC4D"
        d="M25.5 24.8C25.5 30 22.1 35 18 35s-7.5-5-7.5-10.2c0-3.5 2-6.5 4.1-8.4.5-.5 1.4 0 1.2.7-.3 1.4.3 2.8 1.2 3.5.3-2.9 1.9-5.8 4.2-7.5.6-.4 1.4.1 1.2.8-.4 2 .5 3.9 1.8 5.2.9 1.6 1.3 3.6 1.3 5.7z"
      />
    </svg>
  );
}

/** 6. heart (❤️ Yêu thích) - Twemoji 2764 */
export function TwemojiHeartIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#DD2E44"
        d="M35.885 11.833c0-5.45-4.418-9.868-9.867-9.868-3.308 0-6.227 1.633-8.018 4.129-1.791-2.496-4.71-4.129-8.017-4.129-5.45 0-9.868 4.418-9.868 9.868 0 .772.098 1.52.266 2.241C1.751 22.587 11.216 31.568 18 34.034c6.783-2.466 16.249-11.447 17.617-19.959.17-.721.268-1.469.268-2.242z"
      />
    </svg>
  );
}

/** 7. celebrate (🎉 Chúc mừng) - Twemoji 1f389 */
export function TwemojiCelebrateIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#FFAC33"
        d="M2.6 31.2 11.5 11c.5-1.1 2-1.3 2.8-.5l11.2 11.2c.8.8.6 2.3-.5 2.8L4.8 33.4c-1.5.7-2.9-.7-2.2-2.2z"
      />
      <path
        fill="#F4900C"
        d="m6.8 21.7 7.5 7.5-3.4 1.5-5.6-5.6 1.5-3.4zm3.2-7.3 11.6 11.6-3.2 1.4-9.8-9.8 1.4-3.2z"
      />
      <ellipse
        fill="#EA596E"
        transform="rotate(-45 18.6 16.4)"
        cx="18.6"
        cy="16.4"
        rx="3.2"
        ry="7.8"
      />
      <path
        fill="#55ACEE"
        d="M21 11.5c1.5-3.2 4.8-5.2 8.5-5 .8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5c-2.4-.1-4.6 1.2-5.7 3.3-.4.8-1.3 1-2 .6-.8-.4-1.1-1.2-.8-1.9z"
      />
      <path
        fill="#DD2E44"
        d="M16.5 9.2c-.3-2.5.9-5.1 3.2-6.4.7-.4 1.6-.2 2 .5.4.7.2 1.6-.5 2-1.3.8-2 2.3-1.8 3.6.1.8-.5 1.5-1.3 1.6-.8.1-1.5-.5-1.6-1.3z"
      />
      <path
        fill="#77B255"
        d="M25.2 18.5c2.5-.5 5.1.6 6.6 2.8.5.7.3 1.6-.4 2.1-.7.5-1.6.3-2.1-.4-.9-1.3-2.5-1.9-4-1.6-.8.2-1.6-.4-1.8-1.2-.1-.8.4-1.5 1.7-1.7z"
      />
      <circle fill="#AA8ED6" cx="28.5" cy="13.5" r="2" />
      <circle fill="#FFCC4D" cx="13.5" cy="4.5" r="1.8" />
      <circle fill="#77B255" cx="25.5" cy="3.5" r="1.6" />
      <circle fill="#DD2E44" cx="33" cy="16.5" r="1.6" />
    </svg>
  );
}

/** 8. rocket (🚀 Triển khai) - Twemoji 1f680 */
export function TwemojiRocketIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#F4900C"
        d="M3.2 32.8c1.2-4.8 3.5-7.8 6.8-8.8l2 2c-1 3.3-4 5.6-8.8 6.8z"
      />
      <path
        fill="#FFCC4D"
        d="M5.5 30.5c.8-2.8 2.2-4.6 4.3-5.2l1.2 1.2c-.6 2.1-2.4 3.5-5.5 4z"
      />
      <path
        fill="#DD2E44"
        d="M9.5 15.5 3.5 19l2 4.5 5.5-2.5-1.5-5.5zm11 11L17 32.5l4.5 2 3.5-6-4.5-2z"
      />
      <path
        fill="#66757F"
        d="m6.8 23.3 5.9 5.9-2.2 1.3-5-5 1.3-2.2z"
      />
      <path
        fill="#E1E8ED"
        d="M33.8 2.2c-6.8-.8-14.2 2.4-19.5 7.7-4.2 4.2-6.8 9.2-7.5 13.4l5.9 5.9c4.2-.7 9.2-3.3 13.4-7.5 5.3-5.3 8.5-12.7 7.7-19.5z"
      />
      <path
        fill="#55ACEE"
        d="M14.3 9.9c-4.2 4.2-6.8 9.2-7.5 13.4l2.9 2.9c3.8-1.2 8.5-3.8 12.6-7.9 4.5-4.5 7.5-10.6 7.8-16.1-5.5.3-11.3 3.2-15.8 7.7z"
      />
      <path
        fill="#DD2E44"
        d="M33.8 2.2c-3.1-.4-6.4.3-9.6 1.8l7.8 7.8c1.5-3.2 2.2-6.5 1.8-9.6z"
      />
      <circle fill="#3B88C3" cx="21.5" cy="14.5" r="4.5" />
      <circle fill="#F5F8FA" cx="21.5" cy="14.5" r="2.6" />
    </svg>
  );
}

/** Legacy fallback: laugh (😂) */
export function TwemojiLaughIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <circle fill="#FFCC4D" cx="18" cy="18" r="16" />
      <path
        fill="#664500"
        d="M10.5 14.5c1.2-1.8 3.8-1.8 5 0M20.5 14.5c1.2-1.8 3.8-1.8 5 0"
        stroke="#664500"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        fill="#664500"
        d="M9.5 19.5h17c0 5-3.8 9-8.5 9s-8.5-4-8.5-9z"
      />
      <path fill="#FFFFFF" d="M10.5 19.5h15l-.8 2.8H11.3l-.8-2.8z" />
      <path
        fill="#55ACEE"
        d="M6.5 18.5c-1.8 2.2-2.2 5 0 6.5 1.8 1.2 4-.8 3-3.5l-3-3zm23 0c1.8 2.2 2.2 5 0 6.5-1.8 1.2-4-.8-3-3.5l3-3z"
      />
    </svg>
  );
}

/** Legacy fallback: pray (🙏) */
export function TwemojiPrayIcon({ className, ...props }: TwemojiIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path
        fill="#FFDC5D"
        d="M17.2 4.5c-.8 0-1.5.7-1.5 1.5v13l-5.5 6.5 4.5 4.5 3.3-4V6c0-.8-.3-1.5-.8-1.5zm1.6 0c.8 0 1.5.7 1.5 1.5v13l5.5 6.5-4.5 4.5-3.3-4V6c0-.8.3-1.5.8-1.5z"
      />
      <path
        fill="#3B88C3"
        d="M7 29.5 13 24l4 5-5.5 5H7v-4.5zm22 0L23 24l-4 5 5.5 5H29v-4.5z"
      />
    </svg>
  );
}

export const REACTION_ICON_MAP: Record<ChatReaction, TwemojiIconComponent> = {
  check: TwemojiCheckIcon,
  eyes: TwemojiEyesIcon,
  like: TwemojiLikeIcon,
  hands: TwemojiHandsIcon,
  fire: TwemojiFireIcon,
  heart: TwemojiHeartIcon,
  celebrate: TwemojiCelebrateIcon,
  rocket: TwemojiRocketIcon,
  laugh: TwemojiLaughIcon,
  pray: TwemojiPrayIcon,
};
