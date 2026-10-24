import {
  REACTION_ICON_MAP,
  TwemojiCelebrateIcon,
  TwemojiCheckIcon,
  TwemojiEyesIcon,
  TwemojiFireIcon,
  TwemojiHandsIcon,
  TwemojiHeartIcon,
  TwemojiLikeIcon,
  TwemojiRocketIcon,
  type TwemojiIconComponent,
  type TwemojiIconProps,
} from "@/pages/chat/utils/twemojiIcons";
import type { ChatReaction } from "@/types/chatCollaboration";

export {
  REACTION_ICON_MAP,
  TwemojiCelebrateIcon,
  TwemojiCheckIcon,
  TwemojiEyesIcon,
  TwemojiFireIcon,
  TwemojiHandsIcon,
  TwemojiHeartIcon,
  TwemojiLikeIcon,
  TwemojiRocketIcon,
  type TwemojiIconComponent,
  type TwemojiIconProps,
};

export interface ChatReactionItem {
  code: ChatReaction;
  emoji: string;
  Icon: TwemojiIconComponent;
}

export const CHAT_REACTIONS = [
  { code: "check" as const, emoji: "✅", Icon: TwemojiCheckIcon },
  { code: "eyes" as const, emoji: "👀", Icon: TwemojiEyesIcon },
  { code: "like" as const, emoji: "👍", Icon: TwemojiLikeIcon },
  { code: "hands" as const, emoji: "🙌", Icon: TwemojiHandsIcon },
  { code: "fire" as const, emoji: "🔥", Icon: TwemojiFireIcon },
  { code: "heart" as const, emoji: "❤️", Icon: TwemojiHeartIcon },
  { code: "celebrate" as const, emoji: "🎉", Icon: TwemojiCelebrateIcon },
  { code: "rocket" as const, emoji: "🚀", Icon: TwemojiRocketIcon },
] satisfies readonly ChatReactionItem[];
