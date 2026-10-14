import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PageFallbackProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export function PageFallback({
  fullScreen = false,
  message,
  className,
}: PageFallbackProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 transition-opacity animate-in fade-in duration-200",
        fullScreen
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-xs"
          : "min-h-[40vh] w-full py-16",
        className,
      )}
      role="status"
      aria-label="Loading page"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-10 rounded-full bg-brand-orange/10 animate-ping opacity-75" />
        <Spinner size="lg" className="text-brand-orange" />
      </div>
      {message && (
        <p className="text-xs text-muted-foreground animate-pulse font-medium tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}

export default PageFallback;
