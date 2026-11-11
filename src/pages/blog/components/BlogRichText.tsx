import { Fragment } from "react";
import { Link } from "react-router-dom";

const INLINE_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

export function stripInlineMarkdownLinks(text: string): string {
  return text.replace(INLINE_LINK_PATTERN, "$1");
}

interface BlogRichTextProps {
  text: string;
}

export function BlogRichText({ text }: BlogRichTextProps) {
  if (!text || !text.includes("](")) {
    return <>{text}</>;
  }

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(INLINE_LINK_PATTERN.source, "g");

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const anchor = match[1];
    const href = match[2].trim();
    const key = `${match.index}-${href}`;

    if (href.startsWith("/")) {
      nodes.push(
        <Link
          key={key}
          to={href}
          className="font-semibold text-brand-orange underline decoration-brand-orange/40 underline-offset-4 hover:decoration-brand-orange hover:text-brand-orange/90 transition-colors"
        >
          {anchor}
        </Link>,
      );
    } else {
      nodes.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-orange underline decoration-brand-orange/40 underline-offset-4 hover:decoration-brand-orange transition-colors"
        >
          {anchor}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}

export default BlogRichText;
