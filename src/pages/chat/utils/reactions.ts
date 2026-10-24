import { ThumbsUp, Heart, PartyPopper } from "lucide-react";

export const CHAT_REACTIONS = [
  { code: "like" as const, Icon: ThumbsUp },
  { code: "heart" as const, Icon: Heart },
  { code: "celebrate" as const, Icon: PartyPopper },
];
