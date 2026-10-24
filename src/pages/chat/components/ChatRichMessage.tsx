import { Fragment, type ReactNode } from "react";
import {
  safeChatLink,
  isChatRichDocument,
} from "@/pages/chat/utils/chatRichContent";
import type { ChatRichNode } from "@/pages/chat/types/chatRichContent";

interface MessageProps {
  document?: ChatRichNode | null;
  fallback: ReactNode;
}

function render(
  node: ChatRichNode,
  depth: number,
  budget: { remaining: number },
): ReactNode {
  if (!node || depth > 12 || --budget.remaining < 0) return null;
  const children = (node.content ?? []).map((child, index) => (
    <Fragment key={index}>{render(child, depth + 1, budget)}</Fragment>
  ));
  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return <p className="min-h-6 whitespace-pre-wrap">{children}</p>;
    case "blockquote":
      return (
        <blockquote className="border-border my-1 border-l-2 pl-3">
          {children}
        </blockquote>
      );
    case "bulletList":
      return <ul className="my-1 list-disc pl-5">{children}</ul>;
    case "orderedList":
      return <ol className="my-1 list-decimal pl-5">{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    case "codeBlock":
      return (
        <pre className="bg-muted my-1 overflow-x-auto rounded-md p-3 text-sm">
          <code>{children}</code>
        </pre>
      );
    case "hardBreak":
      return <br />;
    case "mention":
      return (
        <span className="bg-brand-orange-soft text-brand-orange rounded px-1 font-medium">
          @{String(node.attrs?.label ?? "")}
        </span>
      );
    case "text": {
      let text: ReactNode = node.text ?? "";
      for (const mark of node.marks ?? []) {
        switch (mark.type) {
          case "bold":
            text = <strong>{text}</strong>;
            break;
          case "italic":
            text = <em>{text}</em>;
            break;
          case "underline":
            text = <u>{text}</u>;
            break;
          case "strike":
            text = <s>{text}</s>;
            break;
          case "code":
            text = (
              <code className="bg-muted rounded px-1 font-mono">{text}</code>
            );
            break;
          case "link": {
            const href = String(mark.attrs?.href ?? "");
            if (safeChatLink(href))
              text = (
                <a
                  className="text-brand-orange underline"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {text}
                </a>
              );
            break;
          }
        }
      }
      return text;
    }
    default:
      return null;
  }
}

export function ChatRichMessage({ document, fallback }: MessageProps) {
  return (
    <div
      data-chat-rich-lists="true"
      className="text-sm leading-6 [overflow-wrap:anywhere]"
    >
      {isChatRichDocument(document)
        ? render(document, 0, { remaining: 500 })
        : fallback}
    </div>
  );
}
