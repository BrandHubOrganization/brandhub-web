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
        return <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />;
      case "error":
        return <XCircle className="size-5 text-red-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />;
      case "info":
      default:
        return <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />;
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
        className={`flex items-start gap-3 p-4 border rounded-lg bg-card text-foreground shadow-lg border-l-4 ${getBorderColor()} w-[356px] pointer-events-auto cursor-pointer`}
        onClick={() => sonnerToast.dismiss(id)}
      >
        {getIcon()}
        <div className="space-y-1 flex-grow">
          {title && <p className="text-sm font-semibold leading-none">{title}</p>}
          {description && <p className="text-xs text-muted-foreground leading-normal mt-1">{description}</p>}
        </div>
      </div>
    ),
    { duration }
  );
}
