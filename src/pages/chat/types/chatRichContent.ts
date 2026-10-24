export interface ChatRichNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: ChatRichNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}
