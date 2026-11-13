import { useState } from "react";
export function DashboardIdentity({
  name,
  src,
}: {
  name: string;
  src?: string | null;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const safe = src && /^(https?:|blob:|data:image\/)/i.test(src);
  return (
    <span
      className="border-brand-orange/20 bg-brand-orange/10 text-brand-orange relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border font-semibold"
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "A"}
      {safe && failedSrc !== src && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  );
}
