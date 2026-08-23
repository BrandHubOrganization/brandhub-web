import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export function showToast({
  title,
  description,
  variant = "info",
  duration = 4000,
}: ToastOptions) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
        );
      case "error":
        return <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />;
      case "warning":
        return (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
        );
      case "info":
      default:
        return <Info className="mt-0.5 size-5 shrink-0 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-amber-500";
      case "info":
      default:
        return "border-l-blue-500";
    }
  };

  return sonnerToast.custom(
    (id) => (
      <div
        className={`bg-card text-foreground flex items-start gap-3 rounded-lg border border-l-4 p-4 shadow-lg ${getBorderColor()} pointer-events-auto w-[356px] cursor-pointer`}
        onClick={() => sonnerToast.dismiss(id)}
      >
        {getIcon()}
        <div className="flex-grow space-y-1">
          {title && (
            <p className="text-sm leading-none font-semibold">{title}</p>
          )}
          {description && (
            <p className="text-muted-foreground mt-1 text-xs leading-normal">
              {description}
            </p>
          )}
        </div>
      </div>
    ),
    { duration },
  );
}
