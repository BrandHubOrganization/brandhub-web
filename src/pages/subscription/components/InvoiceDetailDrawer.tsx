import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "@/pages/subscription/components/InvoiceDetail";

export function InvoiceDetailDrawer({
  orderId,
  agencyId,
  userId,
  admin,
  onClose,
  triggerRef,
}: {
  orderId: string | null;
  agencyId: string;
  userId: string;
  admin: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();

  return (
    <Sheet
      modal={false}
      open={Boolean(orderId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg lg:max-w-xl p-0 gap-0 border-l border-border bg-background flex flex-col shadow-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <SheetHeader className="border-border shrink-0 border-b p-5 pr-12 text-left bg-card/60 backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-7 rounded-lg bg-brand-orange-soft text-brand-orange flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
            <SheetTitle className="text-base font-semibold text-foreground">
              {t("subscription.invoices.detail")}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            {t("subscription.invoices.drawerDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          {orderId && (
            <InvoiceDetail
              key={`${agencyId}:${orderId}`}
              agencyId={agencyId}
              orderId={orderId}
              userId={userId}
              admin={admin}
            />
          )}
        </div>

        <div className="border-border shrink-0 border-t p-4 bg-card/60">
          <SheetClose asChild>
            <Button variant="outline" className="w-full rounded-xl text-xs font-medium">
              {t("subscription.invoices.close")}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default InvoiceDetailDrawer;
