import { useTranslation } from "react-i18next";
import {
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Angry,
  PartyPopper,
  Handshake,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/**
 * Reaction picker — bật lên phía trên nút "Thích" khi ghost cursor click,
 * mô phỏng đúng hành vi Facebook (6 reactions) và LinkedIn (6 reactions
 * khác bộ). Cả 2 nền tảng đều: hover/long-press nút Like → hiện dải icon
 * ngang phía trên → 1 icon được "chọn" (scale to + label) → thu lại,
 * để lại reaction đã chọn thay cho nút Thích mặc định.
 *
 * Dùng icon lucide-react thay vì emoji ký tự — nhất quán với toàn bộ
 * icon hệ thống trong dự án (tránh khác biệt render giữa OS/font emoji).
 */
export interface Reaction {
  key: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

/** 6 reaction Facebook — thứ tự chuẩn: Thích, Yêu thích, Haha, Wow, Buồn, Phẫn nộ.
 *  Wow không có icon riêng phù hợp trong lucide, dùng ThumbsUp scale lớn hơn thay thế
 *  để tránh nhầm ý nghĩa (PartyPopper hợp Celebrate hơn Wow). */
export function useFbReactions(): Reaction[] {
  const { t } = useTranslation();
  return [
    {
      key: "like",
      icon: ThumbsUp,
      label: t("landing.heroFeed.reactions.fb.like"),
      color: "#1877f2",
    },
    {
      key: "love",
      icon: Heart,
      label: t("landing.heroFeed.reactions.fb.love"),
      color: "#f33e58",
    },
    {
      key: "haha",
      icon: Laugh,
      label: t("landing.heroFeed.reactions.fb.haha"),
      color: "#f7b125",
    },
    {
      key: "wow",
      icon: PartyPopper,
      label: t("landing.heroFeed.reactions.fb.wow"),
      color: "#f7b125",
    },
    {
      key: "sad",
      icon: Frown,
      label: t("landing.heroFeed.reactions.fb.sad"),
      color: "#f7b125",
    },
    {
      key: "angry",
      icon: Angry,
      label: t("landing.heroFeed.reactions.fb.angry"),
      color: "#e9710f",
    },
  ];
}

/** 6 reaction LinkedIn — bộ riêng, thiên hướng chuyên nghiệp. */
export function useLiReactions(): Reaction[] {
  const { t } = useTranslation();
  return [
    {
      key: "like",
      icon: ThumbsUp,
      label: t("landing.heroFeed.reactions.li.like"),
      color: "#0a66c2",
    },
    {
      key: "celebrate",
      icon: PartyPopper,
      label: t("landing.heroFeed.reactions.li.celebrate"),
      color: "#6dae4f",
    },
    {
      key: "support",
      icon: Handshake,
      label: t("landing.heroFeed.reactions.li.support"),
      color: "#7a5abf",
    },
    {
      key: "love",
      icon: Heart,
      label: t("landing.heroFeed.reactions.li.love"),
      color: "#df704d",
    },
    {
      key: "insightful",
      icon: Lightbulb,
      label: t("landing.heroFeed.reactions.li.insightful"),
      color: "#f5bb5c",
    },
    {
      key: "funny",
      icon: Laugh,
      label: t("landing.heroFeed.reactions.li.funny"),
      color: "#f5bb5c",
    },
  ];
}

export function ReactionPicker({
  reactions,
  selected,
  visible,
}: {
  reactions: Reaction[];
  /** Reaction đã "chọn" — hiện highlight lớn hơn 1 chút. */
  selected: string | null;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="reaction-pop-in absolute bottom-full left-0 z-50 mb-1.5 flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white px-1.5 py-1 shadow-lg dark:border-zinc-600 dark:bg-zinc-800">
      {reactions.map((r) => (
        <span
          key={r.key}
          className="flex items-center justify-center rounded-full p-0.5 transition-transform"
          style={{
            transform: selected === r.key ? "scale(1.35)" : "scale(1)",
            backgroundColor: `${r.color}1a`,
          }}
        >
          <r.icon
            className="size-3.5"
            style={{ color: r.color }}
            fill={r.color}
          />
        </span>
      ))}
    </div>
  );
}

export default ReactionPicker;
