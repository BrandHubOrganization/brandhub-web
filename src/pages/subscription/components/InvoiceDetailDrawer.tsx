import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
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
        data-testid="invoice-detail-drawer"
        className="w-full gap-0 sm:max-w-none lg:w-1/3"
        onInteractOutside={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <SheetHeader className="border-border shrink-0 border-b pr-12">
          <SheetTitle>{t("subscription.invoices.detail")}</SheetTitle>
          <SheetDescription>
            {t("subscription.invoices.drawerDescription")}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
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
        <div className="border-border shrink-0 border-t p-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              {t("subscription.invoices.close")}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
