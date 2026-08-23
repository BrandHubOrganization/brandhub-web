"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "./button";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-[50%] data-[state=open]:slide-in-from-left-[50%] fixed top-[50%] left-[50%] z-50 grid max-h-[90vh] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// ── Convenient Reusable Confirm Dialog ──
export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("common.confirmDialog.title");
  const resolvedDescription = description ?? t("common.confirmDialog.description");
  const resolvedConfirmText = confirmText ?? t("common.confirmDialog.confirm");
  const resolvedCancelText = cancelText ?? t("common.confirmDialog.cancel");

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="size-5 shrink-0 text-rose-500" />,
          titleColor: "text-rose-600 dark:text-rose-500",
          btnVariant: "destructive" as const,
        };
      case "warning":
        return {
          icon: <AlertTriangle className="size-5 shrink-0 text-amber-500" />,
          titleColor: "text-amber-600 dark:text-amber-500",
          btnVariant: "default" as const,
        };
      case "success":
        return {
          icon: <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />,
          titleColor: "text-emerald-600 dark:text-emerald-500",
          btnVariant: "default" as const,
        };
      default:
        return {
          icon: <Info className="size-5 shrink-0 text-blue-500" />,
          titleColor: "text-foreground",
          btnVariant: "default" as const,
        };
    }
  };

  const style = getVariantStyles();

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 text-base font-bold ${style.titleColor}`}
          >
            {style.icon}
            {resolvedTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="text-foreground/90 py-2 text-xs leading-relaxed">
          {typeof resolvedDescription === "string" ? (
            <p>{resolvedDescription}</p>
          ) : (
            resolvedDescription
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer text-xs"
          >
            {resolvedCancelText}
          </Button>
          <Button
            type="button"
            variant={style.btnVariant}
            size="sm"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`cursor-pointer text-xs font-semibold ${
              variant === "warning"
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : variant === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : ""
            }`}
          >
            {isLoading ? t("common.processing") : resolvedConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  ConfirmDialog,
};
