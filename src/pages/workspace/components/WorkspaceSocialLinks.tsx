import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { normalizeUrl } from "@/utils/validation";

interface Props {
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
}

export function WorkspaceSocialLinks({
  facebookUrl,
  linkedinUrl,
  instagramUrl,
}: Props) {
  const links = [
    {
      name: "Facebook",
      value: facebookUrl,
      Icon: FaFacebook,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      name: "LinkedIn",
      value: linkedinUrl,
      Icon: FaLinkedin,
      color: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    },
    {
      name: "Instagram",
      value: instagramUrl,
      Icon: FaInstagram,
      color: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    },
  ].filter((link) => link.value?.trim());

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ name, value, Icon, color }) => {
        let href: string | undefined;
        try {
          const raw = value!.trim();
          const parsed = new URL(normalizeUrl(raw));
          if (
            (!/^[a-z][a-z\d+.-]*:/i.test(raw) || /^https?:/i.test(raw)) &&
            /^https?:$/.test(parsed.protocol) &&
            parsed.hostname.includes(".")
          )
            href = parsed.href;
        } catch {
          /* Keep incomplete draft links visible without navigation. */
        }
        const content = (
          <>
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{name}</span>
          </>
        );
        const className = `inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${color}`;
        return href ? (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={value!}
            className={`${className} focus-visible:ring-ring transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none`}
          >
            {content}
          </a>
        ) : (
          <span key={name} className={className}>
            {content}
          </span>
        );
      })}
    </div>
  );
}
